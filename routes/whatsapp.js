const express = require('express');
const router = express.Router();

// WhatsApp routes
module.exports = function (whatsappClient) {

  // Get WhatsApp client status
  router.get('/status', async (req, res) => {
    try {
      const status = whatsappClient.getStatus();
      res.json({ success: true, status: status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Start WhatsApp client
  router.post('/start', async (req, res) => {
    try {
      const result = await whatsappClient.initialize();
      if (result) {
        res.json({ success: true, message: 'Starting WhatsApp client...' });
      } else {
        res.json({ success: false, message: 'Client already running or in progress' });
      }
    } catch (error) {
      console.error('Error starting client:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Reset WhatsApp client
  router.post('/reset', async (req, res) => {
    try {
      console.log('Resetting WhatsApp client...');
      await whatsappClient.reset();
      res.json({ success: true, message: 'Client reset successfully. Call /api/whatsapp/start to initialize again.' });
    } catch (error) {
      console.error('Error resetting client:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Stop WhatsApp client
  router.post('/stop', async (req, res) => {
    try {
      console.log('Stopping WhatsApp client...');
      await whatsappClient.stop();
      res.json({ success: true, message: 'Client stopped successfully' });
    } catch (error) {
      console.error('Error stopping client:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create WhatsApp group
  router.post('/create-group', async (req, res) => {
    try {
      console.log('Create group request received:', req.body);
      const { title, participants } = req.body;

      if (!title || !participants || !Array.isArray(participants)) {
        console.log('Validation failed:', { title, participants });
        return res.status(400).json({
          success: false,
          error: 'Title and participants array are required'
        });
      }

      const result = await whatsappClient.createGroup(title, participants);

      res.json({
        success: true,
        result: result,
        message: 'Group created successfully! Everyone can send messages.'
      });

    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get WhatsApp contacts
  router.get('/contacts', async (req, res) => {
    try {
      const contacts = await whatsappClient.getContacts();
      res.json({ success: true, contacts: contacts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Send WhatsApp message
  router.post('/send-message', async (req, res) => {
    try {
      console.log('Send message request received:', req.body);
      const { recipient, message, messageType } = req.body;

      if (!recipient || !message) {
        return res.status(400).json({
          success: false,
          error: 'Recipient and message are required'
        });
      }

      // Check client status before attempting to send
      const clientStatus = whatsappClient.getStatus();
      if (clientStatus.status !== 'ready') {
        return res.status(503).json({
          success: false,
          error: `WhatsApp client is not ready. Current status: ${clientStatus.status}. Please wait for the client to be ready or call /api/whatsapp/start to initialize it.`,
          clientStatus: clientStatus
        });
      }

      const result = await whatsappClient.sendMessage(recipient, message, messageType);

      res.json({
        success: true,
        result: result,
        message: 'Message sent successfully!'
      });

    } catch (error) {
      console.error('Error sending message:', error);

      // Provide more specific error messages
      if (error.message === 'WhatsApp client not ready') {
        const clientStatus = whatsappClient.getStatus();
        res.status(503).json({
          success: false,
          error: `WhatsApp client is not ready. Current status: ${clientStatus.status}. Please wait for the client to be ready or call /api/whatsapp/start to initialize it.`,
          clientStatus: clientStatus
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }
  });

  // Get WhatsApp groups
  router.get('/groups', async (req, res) => {
    try {
      const groups = await whatsappClient.getGroups();
      res.json({ success: true, groups: groups });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update group settings
  router.post('/group-settings', async (req, res) => {
    try {
      const { groupId, allowEveryoneToSendMessages } = req.body;

      if (!groupId) {
        return res.status(400).json({
          success: false,
          error: 'Group ID is required'
        });
      }

      const settings = await whatsappClient.updateGroupSettings(groupId, allowEveryoneToSendMessages);

      res.json({
        success: true,
        message: 'Group settings updated successfully',
        settings: settings
      });

    } catch (error) {
      console.error('Error updating group settings:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Send button message
  router.post('/send-button-message', async (req, res) => {
    try {
      console.log('Send button message request received:', req.body);
      const { recipient, body, buttons, title, footer, messageType } = req.body;

      if (!recipient || !body || !buttons || !Array.isArray(buttons)) {
        return res.status(400).json({
          success: false,
          error: 'Recipient, body, and buttons array are required'
        });
      }

      const result = await whatsappClient.sendButtonMessage(recipient, body, buttons, title, footer, messageType);

      res.json({
        success: true,
        result: result,
        message: 'Button message sent successfully!'
      });

    } catch (error) {
      console.error('Error sending button message:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  return router;
};
