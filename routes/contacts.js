const express = require('express');
const router = express.Router();

// Contacts routes
module.exports = function (mongodbService) {

  // Get all contacts
  router.get('/', async (req, res) => {
    try {
      const contacts = await mongodbService.getContacts();
      res.json({ success: true, contacts: contacts });
    } catch (error) {
      console.error('Error getting contacts:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get contact by ID
  router.get('/:id', async (req, res) => {
    try {
      const contact = await mongodbService.getContactById(req.params.id);
      if (contact) {
        res.json({ success: true, contact: contact });
      } else {
        res.status(404).json({ success: false, error: 'Contact not found' });
      }
    } catch (error) {
      console.error('Error getting contact:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create new contact
  router.post('/', async (req, res) => {
    try {
      const { name, phone, email, notes } = req.body;

      if (!name || !phone) {
        return res.status(400).json({
          success: false,
          error: 'Name and phone number are required'
        });
      }

      const contact = await mongodbService.createContact({
        name,
        phone,
        email: email || '',
        notes: notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.json({ success: true, contact: contact });
    } catch (error) {
      console.error('Error creating contact:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update contact
  router.put('/:id', async (req, res) => {
    try {
      const { name, phone, email, notes } = req.body;

      if (!name || !phone) {
        return res.status(400).json({
          success: false,
          error: 'Name and phone number are required'
        });
      }

      const contact = await mongodbService.updateContact(req.params.id, {
        name,
        phone,
        email: email || '',
        notes: notes || '',
        updatedAt: new Date()
      });

      if (contact) {
        res.json({ success: true, contact: contact });
      } else {
        res.status(404).json({ success: false, error: 'Contact not found' });
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete contact
  router.delete('/:id', async (req, res) => {
    try {
      const result = await mongodbService.deleteContact(req.params.id);

      if (result) {
        res.json({ success: true, message: 'Contact deleted successfully' });
      } else {
        res.status(404).json({ success: false, error: 'Contact not found' });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
