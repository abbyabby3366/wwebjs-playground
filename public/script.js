class WhatsAppGroupCreator {
  constructor() {
    this.socket = io();
    this.setupEventListeners();
    this.setupSocketEvents();
    this.currentSearchResults = null;
    this.currentRecentMessages = null;
    this.currentSearchFilters = null;

    // Initialize MongoDB dashboard after a short delay
    setTimeout(() => {
      this.initializeMongoDBDashboard();
    }, 1000);
  }

  setupEventListeners() {
    // Start WhatsApp client button
    document.getElementById('start-btn').addEventListener('click', () => {
      this.startWhatsAppClient();
    });

    // Add participant button
    document.getElementById('add-participant').addEventListener('click', () => {
      this.addParticipantInput();
    });

    // Remove participant buttons (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-participant')) {
        this.removeParticipantInput(e.target);
      }
    });

    // Form submission
    document.getElementById('group-form').addEventListener('submit', (e) => {
      console.log('Form submitted');
      e.preventDefault();
      console.log('Preventing default and calling createGroup');
      this.createGroup();
    });

    // Load contacts button
    document.getElementById('load-contacts-btn').addEventListener('click', () => {
      this.loadContacts();
    });

    // Load groups display button
    document.getElementById('load-groups-display-btn').addEventListener('click', () => {
      this.loadGroupsDisplay();
    });

    // Load groups button
    document.getElementById('load-groups-btn').addEventListener('click', () => {
      this.loadGroups();
    });

    // Button load groups button
    document.getElementById('button-load-groups-btn').addEventListener('click', () => {
      this.loadGroups();
    });

    // Update group settings button
    document.getElementById('update-group-settings-btn').addEventListener('click', () => {
      this.updateGroupSettings();
    });

    // Group settings select change
    document.getElementById('group-settings-select').addEventListener('change', (e) => {
      this.handleGroupSettingsSelectChange(e.target.value);
    });

    // Message type change
    document.getElementById('message-type').addEventListener('change', (e) => {
      this.handleMessageTypeChange(e.target.value);
    });

    // Message form submission
    document.getElementById('message-form').addEventListener('submit', (e) => {
      console.log('Message form submitted');
      e.preventDefault();
      this.sendMessage();
    });

    // Button message form submission
    document.getElementById('button-message-form').addEventListener('submit', (e) => {
      console.log('Button message form submitted');
      e.preventDefault();
      this.sendButtonMessage();
    });

    // Add button button
    document.getElementById('add-button').addEventListener('click', () => {
      this.addButtonInput();
    });

    // Remove button buttons (delegated)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-button')) {
        this.removeButtonInput(e.target);
      }
    });

    // Button message type change
    document.getElementById('button-message-type').addEventListener('change', (e) => {
      this.handleButtonMessageTypeChange(e.target.value);
    });

    // Phone number validation
    document.addEventListener('input', (e) => {
      if (e.target.classList.contains('participant-phone')) {
        this.validatePhoneNumber(e.target);
      }
    });

    // New event listeners for incoming messages and processing
    document.getElementById('clear-messages-btn').addEventListener('click', () => {
      this.clearIncomingMessages();
    });

    document.getElementById('export-messages-btn').addEventListener('click', () => {
      this.exportIncomingMessages();
    });

    document.getElementById('test-message-btn').addEventListener('click', () => {
      this.testMessageProcessing();
    });

    document.getElementById('view-processors-btn').addEventListener('click', () => {
      this.viewAvailableProcessors();
    });

    // MongoDB Dashboard event listeners
    document.getElementById('test-db-connection-btn').addEventListener('click', () => {
      this.testDatabaseConnection();
    });

    document.getElementById('refresh-stats-btn').addEventListener('click', () => {
      this.loadMessageStatistics();
    });

    document.getElementById('message-search-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.searchMessages();
    });

    document.getElementById('export-search-results-btn').addEventListener('click', () => {
      this.exportSearchResults();
    });

    document.getElementById('clear-search-btn').addEventListener('click', () => {
      this.clearSearchResults();
    });

    document.getElementById('load-recent-messages-btn').addEventListener('click', () => {
      this.loadRecentMessages();
    });

    document.getElementById('export-recent-messages-btn').addEventListener('click', () => {
      this.exportRecentMessages();
    });
  }

  setupSocketEvents() {
    this.socket.on('whatsapp_status', (data) => {
      this.updateStatus(data);
    });

    // Handle incoming message processing results
    this.socket.on('message_processed', (data) => {
      this.displayMessageProcessingResult(data);
    });

    // Handle message acknowledgments
    this.socket.on('message_ack', (data) => {
      this.updateMessageAcknowledgment(data);
    });

    // Handle real-time incoming messages
    this.socket.on('message_processed', (data) => {
      if (data.messageId) {
        this.displayIncomingMessage(data);
      }
    });
  }

  async startWhatsAppClient() {
    try {
      const response = await fetch('/api/whatsapp/start', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        this.showMessage('Starting WhatsApp client...', 'success');
      } else {
        this.showMessage(result.message, 'error');
      }
    } catch (error) {
      this.showMessage('Failed to start WhatsApp client', 'error');
    }
  }

  updateStatus(data) {
    const statusElement = document.getElementById('client-status');
    const qrContainer = document.getElementById('qr-container');
    const qrImage = document.getElementById('qr-code');
    const createGroupBtn = document.getElementById('create-group-btn');
    const sendMessageBtn = document.getElementById('send-message-btn');

    // Update status text and class
    statusElement.textContent = data.status.replace('_', ' ').toUpperCase();
    statusElement.className = 'status-value ' + data.status;

    // Show/hide QR code
    if (data.status === 'qr_ready' && data.qr) {
      qrContainer.style.display = 'block';
      qrImage.src = data.qr;
    } else {
      qrContainer.style.display = 'none';
    }

    // Enable/disable buttons when WhatsApp client is ready
    const isReady = data.status === 'ready';
    createGroupBtn.disabled = !isReady;
    sendMessageBtn.disabled = !isReady;
  }

  addParticipantInput() {
    const container = document.querySelector('.participants-container');
    const participantDiv = document.createElement('div');
    participantDiv.className = 'participant-input';

    participantDiv.innerHTML = `
            <input type="tel" class="participant-phone" placeholder="Phone number (9-15 digits)" 
                   pattern="[0-9]{9,15}" required>
            <button type="button" class="remove-participant">Remove</button>
        `;

    container.appendChild(participantDiv);
    this.updateRemoveButtons();
  }

  removeParticipantInput(button) {
    button.closest('.participant-input').remove();
    this.updateRemoveButtons();
  }

  updateRemoveButtons() {
    const inputs = document.querySelectorAll('.participant-input');
    inputs.forEach((input, index) => {
      const removeBtn = input.querySelector('.remove-participant');
      removeBtn.style.display = inputs.length > 1 ? 'block' : 'none';
    });
  }

  validatePhoneNumber(input) {
    const phoneNumber = input.value.replace(/\D/g, '');
    const isValid = phoneNumber.length >= 9 && phoneNumber.length <= 15;

    if (isValid) {
      input.style.borderColor = '#28a745';
    } else {
      input.style.borderColor = '#dc3545';
    }

    return isValid;
  }

  async createGroup() {
    console.log('Create group function called');

    // Debug: Check if elements exist
    const titleElement = document.getElementById('group-title');
    const phoneInputs = document.querySelectorAll('.participant-phone');

    console.log('Title element:', titleElement);
    console.log('Phone inputs found:', phoneInputs.length);

    if (!titleElement) {
      console.error('Title element not found!');
      return;
    }

    const title = titleElement.value.trim();
    const participants = Array.from(phoneInputs)
      .map(input => input.value.trim())
      .filter(value => value && value.length >= 9 && value.length <= 15);

    console.log('Form data:', { title, participants });

    if (!title) {
      this.showMessage('Please enter a group title', 'error');
      return;
    }

    if (participants.length === 0) {
      this.showMessage('Please add at least one valid participant', 'error');
      return;
    }

    try {
      console.log('Sending request to /api/create-group');
      const response = await fetch('/api/whatsapp/create-group', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, participants })
      });

      console.log('Response received:', response);
      const result = await response.json();
      console.log('Response data:', result);

      if (result.success) {
        this.showMessage(`Group "${title}" created successfully!`, 'success');
        this.displayResults(result);
      } else {
        this.showMessage(result.error, 'error');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      this.showMessage('Failed to create group', 'error');
    }
  }

  displayResults(result) {
    const resultsDisplay = document.getElementById('results-display');

    let html = '<div class="success-message">Group created successfully!</div>';
    html += '<h3>Group Details:</h3>';
    html += `<p><strong>Title:</strong> ${result.result.title}</p>`;
    html += `<p><strong>Group ID:</strong> ${result.result.gid._serialized}</p>`;

    if (result.result.participants) {
      html += '<h4>Participant Results:</h4>';
      Object.entries(result.result.participants).forEach(([participantId, participantResult]) => {
        const statusClass = participantResult.statusCode === 200 ? 'success' : 'error';
        html += `<div class="contact-item ${statusClass}-message">`;
        html += `<p><strong>${participantId}:</strong> ${participantResult.message}</p>`;
        html += `<p>Status Code: ${participantResult.statusCode}</p>`;
        if (participantResult.isInviteV4Sent) {
          html += '<p>✅ V4 Invite sent automatically</p>';
        }
        html += '</div>';
      });
    }

    resultsDisplay.innerHTML = html;
  }

  async loadContacts() {
    try {
      const response = await fetch('/api/whatsapp/contacts');
      const result = await response.json();

      if (result.success) {
        this.displayContacts(result.contacts);
      } else {
        this.showMessage(result.error, 'error');
      }
    } catch (error) {
      this.showMessage('Failed to load contacts', 'error');
    }
  }

  async loadGroupsDisplay() {
    try {
      const response = await fetch('/api/whatsapp/groups');
      const result = await response.json();

      if (result.success) {
        this.displayGroupsInSection(result.groups);
      } else {
        this.showMessage(result.error, 'error');
      }
    } catch (error) {
      this.showMessage('Failed to load groups', 'error');
    }
  }

  displayContacts(contacts) {
    const contactsDisplay = document.getElementById('contacts-display');

    if (contacts.length === 0) {
      contactsDisplay.innerHTML = '<p class="placeholder">No contacts found</p>';
      return;
    }

    let html = '';
    contacts.forEach(contact => {
      html += '<div class="contact-item">';
      html += `<div class="contact-name">${contact.name}</div>`;
      html += `<div class="contact-number">${contact.number}</div>`;
      html += '</div>';
    });

    contactsDisplay.innerHTML = html;
  }

  displayGroupsInSection(groups) {
    const groupsDisplay = document.getElementById('groups-display');

    if (groups.length === 0) {
      groupsDisplay.innerHTML = '<p class="placeholder">No groups found</p>';
      return;
    }

    let html = '';
    groups.forEach(group => {
      html += '<div class="group-item">';
      html += `<div class="group-name">${group.name}</div>`;
      html += `<div class="group-participants">${group.participantsCount} participants</div>`;
      html += `<div class="group-id">${group.id}</div>`;
      html += '</div>';
    });

    groupsDisplay.innerHTML = html;

    // Also populate the group settings select
    this.populateGroupSettingsSelect(groups);
  }

  populateGroupSettingsSelect(groups) {
    const select = document.getElementById('group-settings-select');
    const updateBtn = document.getElementById('update-group-settings-btn');

    // Clear existing options
    select.innerHTML = '<option value="">Choose a group...</option>';

    // Add group options
    groups.forEach(group => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = group.name;
      select.appendChild(option);
    });

    // Enable/disable update button based on selection
    updateBtn.disabled = select.value === '';
  }

  handleGroupSettingsSelectChange(groupId) {
    const updateBtn = document.getElementById('update-group-settings-btn');
    updateBtn.disabled = !groupId;
  }

  async updateGroupSettings() {
    const groupId = document.getElementById('group-settings-select').value;
    const allowEveryone = document.getElementById('allow-everyone-messages').checked;

    if (!groupId) {
      this.showMessage('Please select a group first', 'error');
      return;
    }

    try {
      const response = await fetch('/api/whatsapp/group-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          groupId: groupId,
          allowEveryoneToSendMessages: allowEveryone
        })
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage(`Group settings updated successfully! ${allowEveryone ? 'Everyone can now send messages.' : 'Only admins can send messages.'}`, 'success');
      } else {
        this.showMessage(result.error, 'error');
      }
    } catch (error) {
      console.error('Error updating group settings:', error);
      this.showMessage('Failed to update group settings', 'error');
    }
  }

  showMessage(message, type) {
    const resultsDisplay = document.getElementById('results-display');
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message`;
    messageDiv.textContent = message;

    resultsDisplay.insertBefore(messageDiv, resultsDisplay.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 5000);
  }

  handleMessageTypeChange(messageType) {
    const phoneInput = document.getElementById('recipient-phone');
    const groupSelect = document.getElementById('recipient-group');
    const loadGroupsBtn = document.getElementById('load-groups-btn');

    if (messageType === 'group') {
      phoneInput.style.display = 'none';
      phoneInput.required = false;
      groupSelect.style.display = 'block';
      groupSelect.required = true;
      loadGroupsBtn.style.display = 'inline-block';
    } else {
      phoneInput.style.display = 'block';
      phoneInput.required = true;
      groupSelect.style.display = 'none';
      groupSelect.required = false;
      loadGroupsBtn.style.display = 'none';
    }
  }

  async loadGroups() {
    try {
      const response = await fetch('/api/whatsapp/groups');
      const result = await response.json();

      if (result.success) {
        this.displayGroups(result.groups);
      } else {
        this.showMessage(result.error, 'error');
      }
    } catch (error) {
      this.showMessage('Failed to load groups', 'error');
    }
  }

  displayGroups(groups) {
    // Populate both group select elements
    const groupSelect = document.getElementById('recipient-group');
    const buttonGroupSelect = document.getElementById('button-recipient-group');

    // Clear existing options except the first one
    groupSelect.innerHTML = '<option value="">Select a group...</option>';
    buttonGroupSelect.innerHTML = '<option value="">Select a group...</option>';

    if (groups.length === 0) {
      groupSelect.innerHTML += '<option value="" disabled>No groups found</option>';
      buttonGroupSelect.innerHTML += '<option value="" disabled>No groups found</option>';
      return;
    }

    groups.forEach(group => {
      const option = document.createElement('option');
      option.value = group.id;
      option.textContent = `${group.name} (${group.participantsCount} participants)`;
      groupSelect.appendChild(option);

      // Clone the option for the button message form
      const buttonOption = option.cloneNode(true);
      buttonGroupSelect.appendChild(buttonOption);
    });
  }

  async sendMessage() {
    const messageType = document.getElementById('message-type').value;
    const messageText = document.getElementById('message-text').value.trim();
    let recipient;

    if (messageType === 'group') {
      recipient = document.getElementById('recipient-group').value;
    } else {
      recipient = document.getElementById('recipient-phone').value.trim();
    }

    if (!recipient) {
      this.showMessage('Please select a recipient', 'error');
      return;
    }

    if (!messageText) {
      this.showMessage('Please enter a message', 'error');
      return;
    }

    try {
      console.log('Sending message:', { recipient, message: messageText, messageType });

      const response = await fetch('/api/whatsapp/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipient, message: messageText, messageType })
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage(`Message sent successfully to ${messageType === 'group' ? 'group' : 'recipient'}!`, 'success');
        this.displayMessageResult(result);
        // Clear the form
        document.getElementById('message-text').value = '';
        if (messageType === 'individual') {
          document.getElementById('recipient-phone').value = '';
        } else {
          document.getElementById('recipient-group').value = '';
        }
      } else {
        this.showMessage(result.error, 'error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.showMessage('Failed to send message', 'error');
    }
  }

  displayMessageResult(result) {
    const resultsDisplay = document.getElementById('results-display');

    let html = '<div class="success-message">Message sent successfully!</div>';
    html += '<h3>Message Details:</h3>';
    html += `<p><strong>Message ID:</strong> ${result.result.messageId}</p>`;
    html += `<p><strong>Recipient:</strong> ${result.result.recipient}</p>`;
    html += `<p><strong>Message:</strong> ${result.result.message}</p>`;
    html += `<p><strong>Type:</strong> ${result.result.type}</p>`;
    html += `<p><strong>Timestamp:</strong> ${new Date(result.result.timestamp * 1000).toLocaleString()}</p>`;

    resultsDisplay.innerHTML = html;
  }

  handleButtonMessageTypeChange(messageType) {
    const phoneInput = document.getElementById('button-recipient-phone');
    const groupSelect = document.getElementById('button-recipient-group');
    const loadGroupsBtn = document.getElementById('button-load-groups-btn');

    if (messageType === 'group') {
      phoneInput.style.display = 'none';
      phoneInput.required = false;
      groupSelect.style.display = 'block';
      groupSelect.required = true;
      loadGroupsBtn.style.display = 'inline-block';
    } else {
      phoneInput.style.display = 'block';
      phoneInput.required = true;
      groupSelect.style.display = 'none';
      groupSelect.required = false;
      loadGroupsBtn.style.display = 'none';
    }
  }

  addButtonInput() {
    const container = document.getElementById('buttons-container');
    const buttonInputs = container.querySelectorAll('.button-input');

    if (buttonInputs.length >= 3) {
      this.showMessage('Maximum 3 buttons allowed', 'error');
      return;
    }

    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'button-input';

    buttonDiv.innerHTML = `
      <input type="text" class="button-id" placeholder="Button ID (e.g., btn1)" required>
      <input type="text" class="button-body" placeholder="Button Text (e.g., Click Me)" required>
      <button type="button" class="remove-button">Remove</button>
    `;

    container.appendChild(buttonDiv);
    this.updateRemoveButtons();
  }

  removeButtonInput(button) {
    button.closest('.button-input').remove();
    this.updateRemoveButtons();
  }

  updateRemoveButtons() {
    const inputs = document.querySelectorAll('.button-input');
    inputs.forEach((input, index) => {
      const removeBtn = input.querySelector('.remove-button');
      removeBtn.style.display = inputs.length > 1 ? 'block' : 'none';
    });
  }

  async sendButtonMessage() {
    const messageType = document.getElementById('button-message-type').value;
    const body = document.getElementById('button-body').value.trim();
    const title = document.getElementById('button-title').value.trim();
    const footer = document.getElementById('button-footer').value.trim();
    let recipient;

    if (messageType === 'group') {
      recipient = document.getElementById('button-recipient-group').value;
    } else {
      recipient = document.getElementById('button-recipient-phone').value.trim();
    }

    if (!recipient) {
      this.showMessage('Please select a recipient', 'error');
      return;
    }

    if (!body) {
      this.showMessage('Please enter a message body', 'error');
      return;
    }

    // Get button data
    const buttonInputs = document.querySelectorAll('#buttons-container .button-input');
    const buttons = Array.from(buttonInputs).map(input => {
      const id = input.querySelector('.button-id').value.trim();
      const buttonBody = input.querySelector('.button-body').value.trim();
      return { id, body: buttonBody };
    }).filter(btn => btn.id && btn.body);

    if (buttons.length === 0) {
      this.showMessage('Please add at least one button', 'error');
      return;
    }

    if (buttons.length > 3) {
      this.showMessage('Maximum 3 buttons allowed', 'error');
      return;
    }

    try {
      console.log('Sending button message:', { recipient, body, buttons, title, footer, messageType });

      const response = await fetch('/api/whatsapp/send-button-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recipient, body, buttons, title, footer, messageType })
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage(`Button message sent successfully to ${messageType === 'group' ? 'group' : 'recipient'}!`, 'success');
        this.displayButtonMessageResult(result);
        // Clear the form
        document.getElementById('button-body').value = '';
        document.getElementById('button-title').value = '';
        document.getElementById('button-footer').value = '';
        if (messageType === 'individual') {
          document.getElementById('button-recipient-phone').value = '';
        } else {
          document.getElementById('button-recipient-group').value = '';
        }
        // Clear buttons
        const buttonsContainer = document.getElementById('buttons-container');
        buttonsContainer.innerHTML = `
          <div class="button-input">
            <input type="text" class="button-id" placeholder="Button ID (e.g., btn1)" required>
            <input type="text" class="button-body" placeholder="Button Text (e.g., Click Me)" required>
            <button type="button" class="remove-button" style="display: none;">Remove</button>
          </div>
        `;
        this.updateRemoveButtons();
      } else {
        this.showMessage(result.error, 'error');
      }
    } catch (error) {
      console.error('Error sending button message:', error);
      this.showMessage('Failed to send button message', 'error');
    }
  }

  displayButtonMessageResult(result) {
    const resultsDisplay = document.getElementById('results-display');

    let html = '<div class="success-message">Button message sent successfully!</div>';
    html += '<h3>Button Message Details:</h3>';
    html += `<p><strong>Message ID:</strong> ${result.result.messageId}</p>`;
    html += `<p><strong>Recipient:</strong> ${result.result.recipient}</p>`;
    html += `<p><strong>Body:</strong> ${result.result.body}</p>`;
    html += `<p><strong>Title:</strong> ${result.result.title || 'None'}</p>`;
    html += `<p><strong>Footer:</strong> ${result.result.footer || 'None'}</p>`;
    html += `<p><strong>Type:</strong> ${result.result.type}</p>`;
    html += `<p><strong>Buttons:</strong></p>`;
    html += '<ul>';
    result.result.buttons.forEach(btn => {
      html += `<li><strong>${btn.id}:</strong> ${btn.body}</li>`;
    });
    html += '</ul>';
    html += `<p><strong>Timestamp:</strong> ${new Date(result.result.timestamp * 1000).toLocaleString()}</p>`;

    resultsDisplay.innerHTML = html;
  }

  // Display incoming message in real-time
  displayIncomingMessage(data) {
    const container = document.getElementById('incoming-messages-display');
    const placeholder = container.querySelector('.placeholder');

    if (placeholder) {
      placeholder.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'incoming-message';
    messageDiv.innerHTML = `
      <div class="incoming-message-header">
        <span>From: ${data.from}</span>
        <span>${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="incoming-message-content">
        <div class="incoming-message-body">${data.type === 'text' ? data.body : `[${data.type.toUpperCase()}]`}</div>
      </div>
      <div class="incoming-message-meta">
        <span class="incoming-message-type">${data.type}</span>
        <span class="incoming-message-status">Received</span>
      </div>
    `;

    container.insertBefore(messageDiv, container.firstChild);

    // Limit to last 50 messages
    const messages = container.querySelectorAll('.incoming-message');
    if (messages.length > 50) {
      messages[messages.length - 1].remove();
    }
  }

  // Display message processing result
  displayMessageProcessingResult(data) {
    const container = document.getElementById('processing-results');
    const placeholder = container.querySelector('.placeholder');

    if (placeholder) {
      placeholder.remove();
    }

    const resultDiv = document.createElement('div');
    resultDiv.className = 'processing-result';

    if (data.success) {
      resultDiv.innerHTML = `
        <div class="processing-result-header">
          <span>Category: <span class="processing-result-category">${data.result.category || 'Unknown'}</span></span>
          <span>${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="processing-result-content">
          <div class="processing-result-body">${data.result.result?.response || 'Processed successfully'}</div>
        </div>
        <div class="processing-result-meta">
          <span class="processing-result-action">${data.result.result?.action || 'Processed'}</span>
          <span>Auto-reply: ${data.result.result?.autoReply ? 'Yes' : 'No'}</span>
        </div>
      `;
    } else {
      resultDiv.innerHTML = `
        <div class="processing-result-header">
          <span>Error</span>
          <span>${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="processing-result-content">
          <div class="processing-result-body">${data.error || 'Unknown error'}</div>
        </div>
      `;
      resultDiv.style.borderColor = '#dc3545';
    }

    container.insertBefore(resultDiv, container.firstChild);

    // Limit to last 20 results
    const results = container.querySelectorAll('.processing-result');
    if (results.length > 20) {
      results[results.length - 1].remove();
    }
  }

  // Update message acknowledgment
  updateMessageAcknowledgment(data) {
    // Find the message and update its status
    const messages = document.querySelectorAll('.incoming-message');
    messages.forEach(message => {
      const messageId = message.dataset.messageId;
      if (messageId === data.messageId) {
        const statusSpan = message.querySelector('.incoming-message-status');
        if (statusSpan) {
          statusSpan.textContent = `Ack: ${data.ack}`;
          statusSpan.style.background = data.ack === 3 ? '#28a745' : '#ffc107';
        }
      }
    });
  }

  // Clear incoming messages
  clearIncomingMessages() {
    const container = document.getElementById('incoming-messages-display');
    container.innerHTML = '<p class="placeholder">Incoming messages will appear here in real-time...</p>';
  }

  // Export incoming messages
  exportIncomingMessages() {
    const messages = document.querySelectorAll('.incoming-message');
    if (messages.length === 0) {
      this.showMessage('No messages to export', 'info');
      return;
    }

    const exportData = Array.from(messages).map(message => {
      const header = message.querySelector('.incoming-message-header');
      const content = message.querySelector('.incoming-message-body');
      const meta = message.querySelector('.incoming-message-meta');

      return {
        from: header.querySelector('span:first-child').textContent.replace('From: ', ''),
        time: header.querySelector('span:last-child').textContent,
        content: content.textContent,
        type: meta.querySelector('.incoming-message-type').textContent,
        status: meta.querySelector('.incoming-message-status').textContent
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-messages-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showMessage('Messages exported successfully', 'success');
  }

  // Test message processing
  async testMessageProcessing() {
    try {
      const testMessage = {
        id: { _serialized: 'test-' + Date.now() },
        from: '1234567890@c.us',
        type: 'text',
        body: 'Hello, this is a test message!',
        timestamp: Date.now(),
        _data: { isGroup: false }
      };

      const response = await fetch('/api/messages/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: testMessage })
      });

      const result = await response.json();
      this.displayMessageProcessingResult(result);

    } catch (error) {
      this.showMessage('Failed to test message processing: ' + error.message, 'error');
    }
  }

  // View available processors
  async viewAvailableProcessors() {
    try {
      const response = await fetch('/api/messages/processors');
      const result = await response.json();

      if (result.success) {
        const container = document.getElementById('processing-results');
        const placeholder = container.querySelector('.placeholder');

        if (placeholder) {
          placeholder.remove();
        }

        const processorsDiv = document.createElement('div');
        processorsDiv.className = 'processing-result';
        processorsDiv.innerHTML = `
          <div class="processing-result-header">
            <span>Available Processors</span>
            <span>${new Date().toLocaleTimeString()}</span>
          </div>
          <div class="processing-result-content">
            <div class="processing-result-body">
              ${result.processors.map(processor => `<span class="processing-result-category" style="margin-right: 5px;">${processor}</span>`).join('')}
            </div>
          </div>
        `;

        container.insertBefore(processorsDiv, container.firstChild);
      } else {
        this.showMessage('Failed to get processors: ' + result.error, 'error');
      }
    } catch (error) {
      this.showMessage('Failed to get processors: ' + error.message, 'error');
    }
  }

  // MongoDB Dashboard functions
  async testDatabaseConnection() {
    try {
      const response = await fetch('/api/mongodb/test-connection', { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        this.showMessage('Database connection successful!', 'success');
        this.updateDatabaseStatus('connected', 'Database connected successfully');
      } else {
        this.showMessage('Database connection failed: ' + result.error, 'error');
        this.updateDatabaseStatus('disconnected', 'Database connection failed');
      }
    } catch (error) {
      this.showMessage('Failed to test database connection: ' + error.message, 'error');
      this.updateDatabaseStatus('disconnected', 'Connection test failed');
    }
  }

  updateDatabaseStatus(status, message) {
    const dbStatus = document.getElementById('db-status');
    if (dbStatus) {
      dbStatus.className = `db-status ${status}`;
      dbStatus.innerHTML = `<p>${message}</p>`;
    }
  }

  async loadMessageStatistics() {
    try {
      const response = await fetch('/api/mongodb/messages/statistics');
      const result = await response.json();

      if (result.success) {
        this.displayMessageStatistics(result.statistics);
      } else {
        this.showMessage('Failed to load message statistics: ' + result.error, 'error');
      }
    } catch (error) {
      this.showMessage('Failed to load message statistics: ' + error.message, 'error');
    }
  }

  displayMessageStatistics(stats) {
    const statsDisplay = document.getElementById('message-stats');
    if (!statsDisplay) return;

    const statsHtml = `
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-number">${stats.totalMessages}</div>
          <div class="stat-label">Total Messages</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${stats.sentMessages}</div>
          <div class="stat-label">Sent</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${stats.receivedMessages}</div>
          <div class="stat-label">Received</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${Object.keys(stats.messageTypes).length}</div>
          <div class="stat-label">Message Types</div>
        </div>
      </div>
      <div class="message-type-breakdown">
        <h4>Message Types Breakdown:</h4>
        <ul>
          ${Object.entries(stats.messageTypes).map(([type, count]) =>
      `<li><strong>${type}:</strong> ${count}</li>`
    ).join('')}
        </ul>
      </div>
    `;

    statsDisplay.innerHTML = statsHtml;
  }

  async searchMessages() {
    try {
      const direction = document.getElementById('search-direction').value;
      const type = document.getElementById('search-type').value;
      const searchText = document.getElementById('search-text').value;
      const limit = document.getElementById('search-limit').value;

      const params = new URLSearchParams();
      if (direction) params.append('direction', direction);
      if (type) params.append('type', type);
      if (searchText) params.append('searchText', searchText);
      if (limit) params.append('limit', limit);

      const response = await fetch(`/api/mongodb/messages/search?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        this.displaySearchResults(result.messages, result.totalCount);
        this.currentSearchResults = result.messages; // Store for export
      } else {
        this.showMessage('Failed to search messages: ' + result.error, 'error');
      }
    } catch (error) {
      this.showMessage('Failed to search messages: ' + error.message, 'error');
    }
  }

  displaySearchResults(messages, totalCount) {
    const searchResultsDisplay = document.getElementById('search-results-display');
    if (!searchResultsDisplay) return;

    if (messages.length === 0) {
      searchResultsDisplay.innerHTML = '<p class="placeholder">No messages found for your search criteria.</p>';
      return;
    }

    let html = `<h4>Search Results (${messages.length} of ${totalCount} total)</h4>`;
    messages.forEach(msg => {
      html += `
        <div class="stored-message ${msg.direction}">
          <div class="stored-message-header">
            <span>${msg.direction === 'sent' ? 'To: ' + (msg.to || 'Unknown') : 'From: ' + (msg.from || 'Unknown')}</span>
            <span>${new Date(msg.timestamp).toLocaleString()}</span>
          </div>
          <div class="stored-message-content">
            <div class="stored-message-body">${msg.body || `[${msg.type.toUpperCase()}]`}</div>
          </div>
          <div class="stored-message-meta">
            <span class="stored-message-direction">${msg.direction}</span>
            <span class="stored-message-type">${msg.type}</span>
            <span class="stored-message-status">${msg.status}</span>
            <span>ID: ${msg.messageId}</span>
          </div>
        </div>
      `;
    });

    searchResultsDisplay.innerHTML = html;
  }

  clearSearchResults() {
    const searchResultsDisplay = document.getElementById('search-results-display');
    if (searchResultsDisplay) {
      searchResultsDisplay.innerHTML = '<p class="placeholder">Search results will appear here...</p>';
    }
    this.currentSearchResults = null;
  }

  async loadRecentMessages() {
    try {
      const response = await fetch('/api/mongodb/messages/recent?limit=20');
      const result = await response.json();

      if (result.success) {
        this.displayRecentMessages(result.messages);
        this.currentRecentMessages = result.messages; // Store for export
      } else {
        this.showMessage('Failed to load recent messages: ' + result.error, 'error');
      }
    } catch (error) {
      this.showMessage('Failed to load recent messages: ' + error.message, 'error');
    }
  }

  displayRecentMessages(messages) {
    const recentMessagesDisplay = document.getElementById('recent-messages-display');
    if (!recentMessagesDisplay) return;

    if (messages.length === 0) {
      recentMessagesDisplay.innerHTML = '<p class="placeholder">No recent messages found.</p>';
      return;
    }

    let html = `<h4>Recent Messages (${messages.length})</h4>`;
    messages.forEach(msg => {
      html += `
        <div class="stored-message ${msg.direction}">
          <div class="stored-message-header">
            <span>${msg.direction === 'sent' ? 'To: ' + (msg.to || 'Unknown') : 'From: ' + (msg.from || 'Unknown')}</span>
            <span>${new Date(msg.timestamp).toLocaleString()}</span>
          </div>
          <div class="stored-message-content">
            <div class="stored-message-body">${msg.body || `[${msg.type.toUpperCase()}]`}</div>
          </div>
          <div class="stored-message-meta">
            <span class="stored-message-direction">${msg.direction}</span>
            <span class="stored-message-type">${msg.type}</span>
            <span class="stored-message-status">${msg.status}</span>
            <span>ID: ${msg.messageId}</span>
          </div>
        </div>
      `;
    });

    recentMessagesDisplay.innerHTML = html;
  }

  async exportSearchResults() {
    if (!this.currentSearchResults || this.currentSearchResults.length === 0) {
      this.showMessage('No search results to export', 'info');
      return;
    }

    try {
      const response = await fetch('/api/mongodb/messages/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filters: this.currentSearchFilters || {},
          format: 'json'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `whatsapp-search-results-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showMessage('Search results exported successfully', 'success');
      } else {
        this.showMessage('Failed to export search results', 'error');
      }
    } catch (error) {
      this.showMessage('Failed to export search results: ' + error.message, 'error');
    }
  }

  async exportRecentMessages() {
    if (!this.currentRecentMessages || this.currentRecentMessages.length === 0) {
      this.showMessage('No recent messages to export', 'info');
      return;
    }

    try {
      const response = await fetch('/api/mongodb/messages/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filters: {},
          format: 'json'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `whatsapp-recent-messages-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showMessage('Recent messages exported successfully', 'success');
      } else {
        this.showMessage('Failed to export recent messages', 'error');
      }
    } catch (error) {
      this.showMessage('Failed to export recent messages: ' + error.message, 'error');
    }
  }

  // Initialize MongoDB dashboard on page load
  async initializeMongoDBDashboard() {
    try {
      // Check database health
      const healthResponse = await fetch('/api/mongodb/health');
      const health = await healthResponse.json();

      if (health.status === 'healthy') {
        this.updateDatabaseStatus('connected', 'Database connected and healthy');
        // Load initial statistics
        await this.loadMessageStatistics();
      } else {
        this.updateDatabaseStatus('disconnected', 'Database not connected');
      }
    } catch (error) {
      console.error('Failed to initialize MongoDB dashboard:', error);
      this.updateDatabaseStatus('disconnected', 'Failed to check database status');
    }
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new WhatsAppGroupCreator();
});
