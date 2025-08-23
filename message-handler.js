const express = require('express');
const router = express.Router();

class MessageHandler {
  constructor(whatsappClient) {
    this.whatsappClient = whatsappClient;
    this.messageProcessors = new Map();
    this.setupDefaultProcessors();
  }

  setupDefaultProcessors() {
    // Default message processors for different scenarios
    this.messageProcessors.set('text', this.handleTextMessage.bind(this));
    this.messageProcessors.set('image', this.handleImageMessage.bind(this));
    this.messageProcessors.set('video', this.handleVideoMessage.bind(this));
    this.messageProcessors.set('audio', this.handleAudioMessage.bind(this));
    this.messageProcessors.set('document', this.handleDocumentMessage.bind(this));
    this.messageProcessors.set('location', this.handleLocationMessage.bind(this));
    this.messageProcessors.set('contact', this.handleContactMessage.bind(this));
    this.messageProcessors.set('sticker', this.handleStickerMessage.bind(this));
    this.messageProcessors.set('reaction', this.handleReactionMessage.bind(this));
    this.messageProcessors.set('reply', this.handleReplyMessage.bind(this));
    this.messageProcessors.set('forward', this.handleForwardMessage.bind(this));
    this.messageProcessors.set('group', this.handleGroupMessage.bind(this));
    this.messageProcessors.set('private', this.handlePrivateMessage.bind(this));
    this.messageProcessors.set('command', this.handleCommandMessage.bind(this));
    this.messageProcessors.set('spam', this.handleSpamMessage.bind(this));
    this.messageProcessors.set('urgent', this.handleUrgentMessage.bind(this));
  }

  // Main message processing method
  async processMessage(message) {
    try {
      console.log('Processing incoming message:', {
        id: message.id._serialized,
        from: message.from,
        type: message.type,
        body: message.body,
        timestamp: message.timestamp,
        isGroup: message._data.isGroup,
        author: message.author || message.from
      });

      // Determine message category
      const category = this.categorizeMessage(message);

      // Get appropriate processor
      const processor = this.messageProcessors.get(category);

      if (processor) {
        const result = await processor(message);
        return {
          success: true,
          category: category,
          processed: true,
          result: result,
          timestamp: new Date().toISOString()
        };
      } else {
        // Default processing for unknown categories
        return await this.handleUnknownMessage(message);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Categorize incoming message based on content and context
  categorizeMessage(message) {
    const body = message.body?.toLowerCase() || '';
    const isGroup = message._data.isGroup;
    const type = message.type;
    const author = message.author || message.from;

    // Check for commands (messages starting with /)
    if (body.startsWith('/')) {
      return 'command';
    }

    // Check for urgent keywords
    if (this.isUrgentMessage(body)) {
      return 'urgent';
    }

    // Check for spam indicators
    if (this.isSpamMessage(body, author)) {
      return 'spam';
    }

    // Check if it's a reply to another message
    if (message.hasQuotedMsg) {
      return 'reply';
    }

    // Check if it's forwarded
    if (message._data.isForwarded) {
      return 'forward';
    }

    // Group vs private message
    if (isGroup) {
      return 'group';
    } else {
      return 'private';
    }
  }

  // Text message handler
  async handleTextMessage(message) {
    const body = message.body;
    const from = message.from;
    const author = message.author || from;

    console.log(`Processing text message from ${author}: ${body}`);

    // Process based on content patterns
    if (this.isGreeting(body)) {
      return await this.handleGreeting(message);
    } else if (this.isQuestion(body)) {
      return await this.handleQuestion(message);
    } else if (this.isFeedback(body)) {
      return await this.handleFeedback(message);
    } else {
      return await this.handleGeneralText(message);
    }
  }

  // Image message handler
  async handleImageMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const caption = message.caption || '';

    console.log(`Processing image message from ${author} with caption: ${caption}`);

    // Process image based on caption or context
    if (caption.toLowerCase().includes('profile')) {
      return await this.handleProfileImage(message);
    } else if (caption.toLowerCase().includes('document')) {
      return await this.handleDocumentImage(message);
    } else {
      return await this.handleGeneralImage(message);
    }
  }

  // Video message handler
  async handleVideoMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const caption = message.caption || '';

    console.log(`Processing video message from ${author} with caption: ${caption}`);

    return await this.handleGeneralVideo(message);
  }

  // Audio message handler
  async handleAudioMessage(message) {
    const from = message.from;
    const author = message.author || from;

    console.log(`Processing audio message from ${author}`);

    return await this.handleGeneralAudio(message);
  }

  // Document message handler
  async handleDocumentMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const filename = message.filename || 'Unknown file';

    console.log(`Processing document from ${author}: ${filename}`);

    return await this.handleGeneralDocument(message);
  }

  // Location message handler
  async handleLocationMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const location = message.location;

    console.log(`Processing location from ${author}: ${location.latitude}, ${location.longitude}`);

    return await this.handleGeneralLocation(message);
  }

  // Contact message handler
  async handleContactMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const contact = message.contact;

    console.log(`Processing contact from ${author}: ${contact.name}`);

    return await this.handleGeneralContact(message);
  }

  // Sticker message handler
  async handleStickerMessage(message) {
    const from = message.from;
    const author = message.author || from;

    console.log(`Processing sticker from ${author}`);

    return await this.handleGeneralSticker(message);
  }

  // Reaction message handler
  async handleReactionMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const reaction = message.reaction;

    console.log(`Processing reaction from ${author}: ${reaction}`);

    return await this.handleGeneralReaction(message);
  }

  // Reply message handler
  async handleReplyMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const quotedMessage = await message.getQuotedMessage();

    console.log(`Processing reply from ${author} to message: ${quotedMessage.body}`);

    return await this.handleGeneralReply(message, quotedMessage);
  }

  // Forward message handler
  async handleForwardMessage(message) {
    const from = message.from;
    const author = message.author || from;

    console.log(`Processing forwarded message from ${author}`);

    return await this.handleGeneralForward(message);
  }

  // Group message handler
  async handleGroupMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const groupName = message._data.notifyName || 'Unknown Group';

    console.log(`Processing group message from ${author} in ${groupName}`);

    // Check if it's a group command
    if (message.body.startsWith('!')) {
      return await this.handleGroupCommand(message);
    }

    return await this.handleGeneralGroupMessage(message);
  }

  // Private message handler
  async handlePrivateMessage(message) {
    const from = message.from;
    const author = message.author || from;

    console.log(`Processing private message from ${author}`);

    return await this.handleGeneralPrivateMessage(message);
  }

  // Command message handler
  async handleCommandMessage(message) {
    const body = message.body;
    const from = message.from;
    const author = message.author || from;

    console.log(`Processing command from ${author}: ${body}`);

    const command = body.split(' ')[0].substring(1).toLowerCase();
    const args = body.split(' ').slice(1);

    switch (command) {
      case 'help':
        return await this.handleHelpCommand(message, args);
      case 'status':
        return await this.handleStatusCommand(message, args);
      case 'info':
        return await this.handleInfoCommand(message, args);
      case 'ping':
        return await this.handlePingCommand(message, args);
      default:
        return await this.handleUnknownCommand(message, command, args);
    }
  }

  // Spam message handler
  async handleSpamMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const body = message.body;

    console.log(`Processing spam message from ${author}: ${body}`);

    // Log spam for monitoring
    await this.logSpamMessage(message);

    // Optionally auto-reply with warning
    if (this.shouldAutoReplyToSpam()) {
      await this.sendSpamWarning(message);
    }

    return {
      action: 'logged',
      reason: 'spam_detected',
      autoReply: this.shouldAutoReplyToSpam()
    };
  }

  // Urgent message handler
  async handleUrgentMessage(message) {
    const from = message.from;
    const author = message.author || from;
    const body = message.body;

    console.log(`Processing urgent message from ${author}: ${body}`);

    // Send immediate acknowledgment
    await this.sendUrgentAcknowledgment(message);

    // Log for priority handling
    await this.logUrgentMessage(message);

    return {
      action: 'acknowledged',
      priority: 'high',
      logged: true
    };
  }

  // Unknown message handler
  async handleUnknownMessage(message) {
    console.log(`Processing unknown message type: ${message.type}`);

    return {
      action: 'logged',
      reason: 'unknown_type',
      messageType: message.type
    };
  }

  // Helper methods for message categorization
  isUrgentMessage(body) {
    const urgentKeywords = ['urgent', 'emergency', 'help', 'sos', 'critical', 'immediate'];
    return urgentKeywords.some(keyword => body.includes(keyword));
  }

  isSpamMessage(body, author) {
    // Simple spam detection - can be enhanced
    const spamIndicators = ['buy now', 'click here', 'limited time', 'act now', 'free money'];
    const isSpam = spamIndicators.some(indicator => body.toLowerCase().includes(indicator));

    // Check for repeated messages from same author
    const recentMessages = this.getRecentMessagesFromAuthor(author);
    const isRepeated = recentMessages.length > 5; // More than 5 messages in short time

    return isSpam || isRepeated;
  }

  isGreeting(body) {
    const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => body.toLowerCase().includes(greeting));
  }

  isQuestion(body) {
    return body.includes('?') ||
      body.toLowerCase().startsWith('what') ||
      body.toLowerCase().startsWith('how') ||
      body.toLowerCase().startsWith('why') ||
      body.toLowerCase().startsWith('when') ||
      body.toLowerCase().startsWith('where') ||
      body.toLowerCase().startsWith('who');
  }

  isFeedback(body) {
    const feedbackKeywords = ['feedback', 'review', 'rating', 'opinion', 'suggestion'];
    return feedbackKeywords.some(keyword => body.toLowerCase().includes(keyword));
  }

  // Specific message handlers
  async handleGreeting(message) {
    const responses = [
      "Hello! How can I help you today?",
      "Hi there! Welcome to our service.",
      "Hey! Thanks for reaching out."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      action: 'greeting_response',
      response: randomResponse,
      autoReply: true
    };
  }

  async handleQuestion(message) {
    return {
      action: 'question_logged',
      response: "I've received your question. Someone will get back to you soon.",
      autoReply: true
    };
  }

  async handleFeedback(message) {
    return {
      action: 'feedback_logged',
      response: "Thank you for your feedback! We appreciate your input.",
      autoReply: true
    };
  }

  async handleGeneralText(message) {
    return {
      action: 'text_logged',
      response: "Message received and logged.",
      autoReply: false
    };
  }

  async handleProfileImage(message) {
    return {
      action: 'profile_image_logged',
      response: "Profile image received and saved.",
      autoReply: true
    };
  }

  async handleDocumentImage(message) {
    return {
      action: 'document_image_logged',
      response: "Document image received and processed.",
      autoReply: true
    };
  }

  async handleGeneralImage(message) {
    return {
      action: 'image_logged',
      response: "Image received and logged.",
      autoReply: false
    };
  }

  async handleGeneralVideo(message) {
    return {
      action: 'video_logged',
      response: "Video received and logged.",
      autoReply: false
    };
  }

  async handleGeneralAudio(message) {
    return {
      action: 'audio_logged',
      response: "Audio message received and logged.",
      autoReply: false
    };
  }

  async handleGeneralDocument(message) {
    return {
      action: 'document_logged',
      response: "Document received and saved.",
      autoReply: true
    };
  }

  async handleGeneralLocation(message) {
    return {
      action: 'location_logged',
      response: "Location received and logged.",
      autoReply: true
    };
  }

  async handleGeneralContact(message) {
    return {
      action: 'contact_logged',
      response: "Contact information received and saved.",
      autoReply: true
    };
  }

  async handleGeneralSticker(message) {
    return {
      action: 'sticker_logged',
      response: "Sticker received and logged.",
      autoReply: false
    };
  }

  async handleGeneralReaction(message) {
    return {
      action: 'reaction_logged',
      response: "Reaction received and logged.",
      autoReply: false
    };
  }

  async handleGeneralReply(message, quotedMessage) {
    return {
      action: 'reply_logged',
      response: "Reply received and logged.",
      quotedMessage: quotedMessage.body,
      autoReply: false
    };
  }

  async handleGeneralForward(message) {
    return {
      action: 'forward_logged',
      response: "Forwarded message received and logged.",
      autoReply: false
    };
  }

  async handleGroupCommand(message) {
    const command = message.body.substring(1).toLowerCase();

    return {
      action: 'group_command_logged',
      response: `Group command '${command}' received and processed.`,
      autoReply: true
    };
  }

  async handleGeneralGroupMessage(message) {
    return {
      action: 'group_message_logged',
      response: "Group message received and logged.",
      autoReply: false
    };
  }

  async handleGeneralPrivateMessage(message) {
    return {
      action: 'private_message_logged',
      response: "Private message received and logged.",
      autoReply: false
    };
  }

  // Command handlers
  async handleHelpCommand(message, args) {
    const helpText = `Available commands:
/help - Show this help message
/status - Check system status
/info - Get user information
/ping - Test connection`;

    return {
      action: 'help_command',
      response: helpText,
      autoReply: true
    };
  }

  async handleStatusCommand(message, args) {
    const status = this.whatsappClient.getStatus();

    return {
      action: 'status_command',
      response: `System Status: ${status.status}`,
      autoReply: true
    };
  }

  async handleInfoCommand(message, args) {
    const from = message.from;
    const author = message.author || from;

    return {
      action: 'info_command',
      response: `User: ${author}\nTime: ${new Date().toLocaleString()}`,
      autoReply: true
    };
  }

  async handlePingCommand(message, args) {
    return {
      action: 'ping_command',
      response: 'Pong! Server is running.',
      autoReply: true
    };
  }

  async handleUnknownCommand(message, command, args) {
    return {
      action: 'unknown_command',
      response: `Unknown command: ${command}. Type /help for available commands.`,
      autoReply: true
    };
  }

  // Utility methods
  async logSpamMessage(message) {
    console.log(`SPAM LOGGED: ${message.from} - ${message.body}`);
    // Here you could save to database, file, or external service
  }

  async logUrgentMessage(message) {
    console.log(`URGENT MESSAGE LOGGED: ${message.from} - ${message.body}`);
    // Here you could save to database, file, or external service
  }

  shouldAutoReplyToSpam() {
    // Configure whether to auto-reply to spam
    return true; // Can be made configurable
  }

  async sendSpamWarning(message) {
    try {
      const warning = "Please avoid sending promotional or spam messages. This is a monitored system.";
      await this.whatsappClient.sendMessage(message.from, warning);
    } catch (error) {
      console.error('Failed to send spam warning:', error);
    }
  }

  async sendUrgentAcknowledgment(message) {
    try {
      const ack = "URGENT: Your message has been received and is being processed with high priority.";
      await this.whatsappClient.sendMessage(message.from, ack);
    } catch (error) {
      console.error('Failed to send urgent acknowledgment:', error);
    }
  }

  getRecentMessagesFromAuthor(author) {
    // This would need to be implemented with actual message storage
    // For now, return empty array
    return [];
  }

  // Add custom message processor
  addMessageProcessor(category, processor) {
    this.messageProcessors.set(category, processor.bind(this));
  }

  // Remove message processor
  removeMessageProcessor(category) {
    this.messageProcessors.delete(category);
  }

  // Get all available processors
  getAvailableProcessors() {
    return Array.from(this.messageProcessors.keys());
  }
}

// Express router setup
function setupMessageHandlerRoutes(whatsappClient) {
  const messageHandler = new MessageHandler(whatsappClient);

  // Route to process incoming messages
  router.post('/process', async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: 'Message object is required'
        });
      }

      const result = await messageHandler.processMessage(message);

      res.json({
        success: true,
        result: result
      });

    } catch (error) {
      console.error('Error in message processing route:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Route to get available message processors
  router.get('/processors', (req, res) => {
    try {
      const processors = messageHandler.getAvailableProcessors();
      res.json({
        success: true,
        processors: processors
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Route to add custom message processor
  router.post('/processor', (req, res) => {
    try {
      const { category, processor } = req.body;

      if (!category || !processor) {
        return res.status(400).json({
          success: false,
          error: 'Category and processor function are required'
        });
      }

      // Note: This is a simplified version. In production, you'd want to validate the processor function
      messageHandler.addMessageProcessor(category, processor);

      res.json({
        success: true,
        message: `Custom processor added for category: ${category}`
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
}

module.exports = { MessageHandler, setupMessageHandlerRoutes };
