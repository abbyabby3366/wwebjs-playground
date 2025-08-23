const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { MessageHandler } = require('./message-handler');

class WhatsAppClient {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: 'group-creator-bot'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions',
          '--disable-plugins',
          '--disable-images',
          '--disable-javascript',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-field-trial-config',
          '--disable-ipc-flooding-protection',
          '--disable-hang-monitor',
          '--disable-prompt-on-repost',
          '--disable-client-side-phishing-detection',
          '--disable-component-extensions-with-background-pages',
          '--disable-default-apps',
          '--disable-sync',
          '--metrics-recording-only',
          '--no-default-browser-check',
          '--mute-audio',
          '--disable-background-networking',
          '--disable-translate',
          '--hide-scrollbars',
          '--disable-logging',
          '--disable-permissions-api'
        ],
        timeout: 60000,
        protocolTimeout: 60000
      },
      authTimeoutMs: 60000,
      qrMaxRetries: 5,
      takeoverOnConflict: true,
      takeoverTimeoutMs: 10000
    });

    this.clientStatus = 'disconnected';
    this.qrCodeData = null;
    this.initializationAttempts = 0;
    this.maxInitializationAttempts = 3;
    this.io = null;
    this.messageHandler = null;
    this.messageStorageService = null; // Will be set externally

    this.setupEventHandlers();
  }

  setSocketIO(io) {
    this.io = io;
  }

  setMessageStorageService(messageStorageService) {
    this.messageStorageService = messageStorageService;
  }

  setupEventHandlers() {
    this.client.on('qr', async (qr) => {
      console.log('QR Code received');
      try {
        this.qrCodeData = await qrcode.toDataURL(qr);
        this.clientStatus = 'qr_ready';
        this.emitStatus();
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.clientStatus = 'ready';
      this.qrCodeData = null;
      this.initializationAttempts = 0;

      // Initialize message handler when client is ready
      this.messageHandler = new MessageHandler(this);
      console.log('Message handler initialized');

      this.emitStatus();
    });

    this.client.on('authenticated', () => {
      console.log('WhatsApp client authenticated');
      this.clientStatus = 'authenticated';
      this.emitStatus();
    });

    this.client.on('auth_failure', (msg) => {
      console.log('WhatsApp authentication failed:', msg);
      this.clientStatus = 'auth_failed';
      this.emitStatus({ error: msg });

      setTimeout(async () => {
        if (this.initializationAttempts < this.maxInitializationAttempts) {
          console.log(`Attempting to reinitialize client (attempt ${this.initializationAttempts + 1}/${this.maxInitializationAttempts})`);
          await this.initialize();
        }
      }, 5000);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.clientStatus = 'disconnected';
      this.emitStatus({ error: reason });

      setTimeout(async () => {
        if (this.initializationAttempts < this.maxInitializationAttempts) {
          console.log(`Attempting to reinitialize client after disconnect (attempt ${this.initializationAttempts + 1}/${this.maxInitializationAttempts})`);
          await this.initialize();
        }
      }, 5000);
    });

    this.client.on('loading_screen', (percent, message) => {
      console.log('Loading screen:', percent + '%', message);
      this.clientStatus = 'loading';
      this.emitStatus({ loading: { percent, message } });
    });

    this.client.on('change_state', (state) => {
      console.log('Client state changed:', state);
      this.emitStatus({ state: state });
    });

    // Handle incoming messages
    this.client.on('message', async (message) => {
      try {
        // Check if this is a group message
        const isGroupMessage = message.from && message.from.includes('@g.us');
        const isFromMe = message.fromMe !== undefined ? message.fromMe : false;

        console.log('Incoming message received:', {
          id: message.id._serialized,
          from: message.from,
          type: message.type,
          body: message.body,
          timestamp: message.timestamp,
          isGroup: isGroupMessage,
          author: message.author || message.from,
          // Log all available fields to find real phone number
          _data: message._data || {},
          pushName: message.pushName,
          notifyName: message._data?.notifyName,
          // Try to get more details about the sender
          sender: message.getContact ? await message.getContact() : null,
          // Log the full message object structure for debugging
          messageKeys: Object.keys(message),
          // Check if there are other phone-related fields
          hasAuthor: !!message.author,
          hasPushName: !!message.pushName,
          hasNotifyName: !!message._data?.notifyName
        });

        // Extract real phone number immediately for group messages
        let realPhoneNumber = null;
        if (isGroupMessage) {
          // PRIORITY 1: Use sender.number if available (this is the REAL phone number)
          if (message.sender && message.sender.number) {
            realPhoneNumber = message.sender.number;
            console.log('Using real phone number from sender.number:', realPhoneNumber);
          } else {
            // PRIORITY 2: Fall back to author extraction (but this might be an ID)
            console.log('Attempting to extract real phone number for group message...');
            realPhoneNumber = await this.extractRealPhoneNumber(message);
            console.log('Extracted phone number result:', realPhoneNumber);
          }
        } else {
          realPhoneNumber = message.from.replace('@c.us', '');
        }

        console.log('Final realPhoneNumber for storage:', realPhoneNumber);

        // Store message in MongoDB if storage service is available
        let storageResult = null;
        if (this.messageStorageService) {
          try {
            // Pass the extracted real phone number to the storage service
            storageResult = await this.messageStorageService.storeReceivedMessage(message, null, realPhoneNumber);
            if (storageResult.success) {
              console.log('Message stored in MongoDB:', storageResult.messageId);

              // Emit the new received message via WebSocket for real-time updates
              if (this.io) {
                // Enhanced phone number extraction for group messages
                let cleanFrom = realPhoneNumber || 'Unknown';

                const messageToEmit = {
                  id: storageResult.messageId,
                  direction: 'received',
                  type: message.type || 'text',
                  content: message.body || '',
                  from: cleanFrom, // Clean phone number or extracted real number
                  to: isGroupMessage ? message.from : 'agent', // For groups, 'to' is the group ID
                  timestamp: new Date(message.timestamp * 1000),
                  fromMe: false,
                  status: 'received',
                  isGroup: isGroupMessage,
                  groupId: isGroupMessage ? message.from : null,
                  realPhoneNumber: realPhoneNumber, // Include the extracted real phone number
                  // Additional debugging info
                  extractedPhoneNumber: realPhoneNumber,
                  originalAuthor: message.author,
                  originalFrom: message.from
                };

                this.io.emit('new_message', messageToEmit);
                console.log('New received message emitted via WebSocket:', messageToEmit);
              }
            } else {
              console.error('Failed to store message in MongoDB:', storageResult.error);
            }
          } catch (storageError) {
            console.error('Error storing message in MongoDB:', storageError);
          }
        }

        // Process message if handler is available
        if (this.messageHandler) {
          const result = await this.messageHandler.processMessage(message);

          // Send auto-reply if configured
          if (result.success && result.result.autoReply && result.result.response) {
            try {
              await this.sendMessage(message.from, result.result.response);
              console.log('Auto-reply sent:', result.result.response);
            } catch (replyError) {
              console.error('Failed to send auto-reply:', replyError);
            }
          }

          // Emit message processed event via Socket.IO
          if (this.io) {
            this.io.emit('message_processed', {
              messageId: message.id._serialized,
              from: message.from,
              type: message.type,
              body: message.body,
              result: result,
              storageResult: storageResult,
              isGroup: isGroupMessage
            });
          }
        } else {
          console.log('Message handler not available, message logged but not processed');
        }

      } catch (error) {
        console.error('Error processing incoming message:', error);
      }
    });

    // Handle message acknowledgments
    this.client.on('message_ack', (msg, ack) => {
      console.log('Message acknowledgment:', {
        messageId: msg.id._serialized,
        ack: ack
      });

      if (this.io) {
        this.io.emit('message_ack', {
          messageId: msg.id._serialized,
          ack: ack
        });
      }
    });
  }

  emitStatus(additionalData = {}) {
    if (this.io) {
      this.io.emit('whatsapp_status', {
        status: this.clientStatus,
        qr: this.qrCodeData,
        ...additionalData
      });
    }
  }

  async initialize() {
    try {
      if (this.clientStatus === 'disconnected' || this.clientStatus === 'auth_failed') {
        this.initializationAttempts++;
        console.log(`Initializing WhatsApp client (attempt ${this.initializationAttempts}/${this.maxInitializationAttempts})`);

        this.clientStatus = 'initializing';
        this.emitStatus();

        await this.client.initialize();
        console.log('Client initialization started successfully');
        return true;
      } else {
        console.log('Client already running or in progress');
        return false;
      }
    } catch (error) {
      console.error('Error initializing client:', error);
      this.clientStatus = 'error';
      this.emitStatus({ error: error.message });

      if (this.initializationAttempts < this.maxInitializationAttempts) {
        console.log(`Retrying initialization in 10 seconds... (attempt ${this.initializationAttempts}/${this.maxInitializationAttempts})`);
        setTimeout(async () => {
          await this.initialize();
        }, 10000);
      } else {
        console.error('Max initialization attempts reached. Please check your configuration and restart the server.');
      }

      return false;
    }
  }

  async reset() {
    console.log('Resetting WhatsApp client...');

    this.clientStatus = 'disconnected';
    this.qrCodeData = null;
    this.initializationAttempts = 0;

    try {
      await this.client.destroy();
      console.log('Client destroyed successfully');
    } catch (destroyError) {
      console.log('Client was already destroyed or not initialized');
    }

    this.emitStatus();
    return true;
  }

  async stop() {
    console.log('Stopping WhatsApp client...');

    try {
      await this.client.destroy();
      this.clientStatus = 'disconnected';
      this.qrCodeData = null;
      this.initializationAttempts = 0;
      this.emitStatus();
      console.log('Client stopped successfully');
      return true;
    } catch (destroyError) {
      console.log('Client was already destroyed or not initialized');
      return true;
    }
  }

  async destroy() {
    try {
      await this.client.destroy();
      console.log('WhatsApp client destroyed');
    } catch (error) {
      console.error('Error destroying client:', error);
    }
  }

  // WhatsApp functionality methods
  async createGroup(title, participants) {
    if (this.clientStatus !== 'ready') {
      throw new Error('WhatsApp client not ready');
    }

    const validParticipants = participants.filter(p =>
      p && typeof p === 'string' && p.length >= 9 && p.length <= 15
    );

    if (validParticipants.length === 0) {
      throw new Error('No valid participants provided');
    }

    const formattedParticipants = validParticipants.map(phone => {
      const cleanPhone = phone.replace(/\D/g, '');
      return cleanPhone + '@c.us';
    });

    const result = await this.client.createGroup(title, formattedParticipants, {
      autoSendInviteV4: true,
      comment: 'Group created via WhatsApp Web.js API'
    });

    // Update group settings
    try {
      const groupChat = await this.client.getChatById(result.gid._serialized);
      if (groupChat && groupChat.isGroup) {
        await groupChat.setMessagesAdminsOnly(false);
        console.log('Group settings updated: Everyone can now send messages');
      }
    } catch (settingsError) {
      console.warn('Warning: Could not update group settings:', settingsError.message);
    }

    return result;
  }

  async getContacts() {
    if (this.clientStatus !== 'ready') {
      throw new Error('WhatsApp client not ready');
    }

    const contacts = await this.client.getContacts();
    return contacts.map(contact => ({
      id: contact.id._serialized,
      name: contact.pushname || contact.number,
      number: contact.number
    }));
  }

  async sendMessage(recipient, message, messageType = 'individual') {
    if (this.clientStatus !== 'ready') {
      throw new Error('WhatsApp client not ready');
    }

    let chatId;
    if (messageType === 'group') {
      chatId = recipient;
    } else {
      const cleanPhone = recipient.replace(/\D/g, '');
      chatId = cleanPhone + '@c.us';
    }

    const result = await this.client.sendMessage(chatId, message);

    // Store sent message in MongoDB if storage service is available
    if (this.messageStorageService) {
      try {
        const messageData = {
          recipient: chatId,
          message: message,
          messageType: messageType
        };

        const storageResult = await this.messageStorageService.storeSentMessage(messageData, result);
        if (storageResult.success) {
          console.log('Sent message stored in MongoDB:', storageResult.messageId);

          // Emit the new message via WebSocket for real-time updates
          if (this.io) {
            const messageToEmit = {
              id: storageResult.messageId,
              direction: 'sent',
              type: 'text',
              content: message,
              from: 'agent',
              to: chatId.replace('@c.us', ''),
              timestamp: new Date(),
              fromMe: true,
              status: 'sent'
            };

            this.io.emit('new_message', messageToEmit);
            console.log('New message emitted via WebSocket:', messageToEmit);
          }
        } else {
          console.error('Failed to store sent message in MongoDB:', storageResult.error);
        }
      } catch (storageError) {
        console.error('Error storing sent message in MongoDB:', storageError);
      }
    }

    return {
      messageId: result.id._serialized,
      recipient: chatId,
      message: message,
      timestamp: result.timestamp,
      type: messageType
    };
  }

  async getGroups() {
    if (this.clientStatus !== 'ready') {
      throw new Error('WhatsApp client not ready');
    }

    const chats = await this.client.getChats();
    return chats.filter(chat => chat.isGroup).map(group => ({
      id: group.id._serialized,
      name: group.name,
      participantsCount: group.participants.length
    }));
  }

  async updateGroupSettings(groupId, allowEveryoneToSendMessages) {
    if (this.clientStatus !== 'ready') {
      throw new Error('WhatsApp client not ready');
    }

    const groupChat = await this.client.getChatById(groupId);
    if (!groupChat || !groupChat.isGroup) {
      throw new Error('Group not found or invalid group ID');
    }

    const currentUser = await this.client.getContactById(this.client.info.wid._serialized);
    const isAdmin = groupChat.participants.find(p =>
      p.id._serialized === currentUser.id._serialized && p.isAdmin
    );

    if (!isAdmin) {
      throw new Error('Only group admins can modify group settings');
    }

    if (allowEveryoneToSendMessages !== undefined) {
      await groupChat.setMessagesAdminsOnly(!allowEveryoneToSendMessages);
    }

    return {
      allowEveryoneToSendMessages: !groupChat.messagesAdminsOnly
    };
  }

  async sendButtonMessage(recipient, body, buttons, title, footer, messageType = 'individual') {
    if (this.clientStatus !== 'ready') {
      throw new Error('WhatsApp client not ready');
    }

    let chatId;
    if (messageType === 'group') {
      chatId = recipient;
    } else {
      const cleanPhone = recipient.replace(/\D/g, '');
      chatId = cleanPhone + '@c.us';
    }

    const buttonMessage = new Buttons(
      body,
      buttons.map(btn => ({
        id: btn.id,
        body: btn.body
      })),
      title || '',
      footer || ''
    );

    const result = await this.client.sendMessage(chatId, buttonMessage);
    return {
      messageId: result.id._serialized,
      recipient: chatId,
      body: body,
      buttons: buttons,
      title: title,
      footer: footer,
      type: messageType,
      timestamp: result.timestamp
    };
  }

  // Extract real phone number from WhatsApp message
  async extractRealPhoneNumber(message) {
    try {
      console.log('Attempting to extract real phone number from message:', {
        author: message.author,
        from: message.from,
        pushName: message.pushName,
        notifyName: message._data?.notifyName,
        hasGetContact: !!message.getContact
      });

      // Method 1: Try to get contact info if available
      if (message.getContact) {
        try {
          const contact = await message.getContact();
          console.log('Contact object retrieved:', contact);

          if (contact && contact.number) {
            console.log('Found phone number from contact:', contact.number);
            return contact.number;
          }

          if (contact && contact.id && !contact.id.includes('@lid')) {
            const cleanId = contact.id.replace('@c.us', '');
            console.log('Found phone number from contact ID:', cleanId);
            return cleanId;
          }
        } catch (contactError) {
          console.log('Failed to get contact info:', contactError.message);
        }
      }

      // Method 2: Try to get from pushName if it looks like a phone number
      if (message.pushName) {
        const pushName = message.pushName.trim();
        // Check if pushName looks like a phone number (contains only digits and maybe +)
        if (/^\+?[\d\s\-\(\)]+$/.test(pushName) && pushName.length >= 8) {
          console.log('Found phone number from pushName:', pushName);
          return pushName.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
        }
      }

      // Method 3: Try to get from notifyName if it looks like a phone number
      if (message._data?.notifyName) {
        const notifyName = message._data.notifyName.trim();
        if (/^\+?[\d\s\-\(\)]+$/.test(notifyName) && notifyName.length >= 8) {
          console.log('Found phone number from notifyName:', notifyName);
          return notifyName.replace(/[\s\-\(\)]/g, '');
        }
      }

      // Method 4: Try to extract from author field if it's not a @lid
      if (message.author && !message.author.includes('@lid')) {
        const cleanAuthor = message.author.replace('@c.us', '').replace('@g.us', '');
        if (/^\d+$/.test(cleanAuthor) && cleanAuthor.length >= 8) {
          console.log('Found phone number from author:', cleanAuthor);
          return cleanAuthor;
        }
      }

      // Method 5: Check if we can get the phone number from the client's contacts
      if (this.client && this.client.getContactById) {
        try {
          const contactId = message.author || message.from;
          const contact = await this.client.getContactById(contactId);
          if (contact && contact.number) {
            console.log('Found phone number from client contact:', contact.number);
            return contact.number;
          }
        } catch (clientContactError) {
          console.log('Failed to get client contact:', clientContactError.message);
        }
      }

      console.log('Could not extract real phone number, using fallback');
      return null;
    } catch (error) {
      console.error('Error extracting real phone number:', error);
      return null;
    }
  }

  // Getter methods for status
  getStatus() {
    return {
      status: this.clientStatus,
      qr: this.qrCodeData,
      attempts: this.initializationAttempts,
      maxAttempts: this.maxInitializationAttempts
    };
  }

  isReady() {
    return this.clientStatus === 'ready';
  }

  // Get message handler instance
  getMessageHandler() {
    return this.messageHandler;
  }
}

module.exports = WhatsAppClient;
