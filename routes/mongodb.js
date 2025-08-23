const express = require('express');
const router = express.Router();

function setupMongoDBRoutes(messageStorageService, mongodbService) {

  // Get MongoDB health status
  router.get('/health', async (req, res) => {
    try {
      const health = await mongodbService.healthCheck();
      res.json(health);
    } catch (error) {
      res.status(500).json({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Search messages with filters
  router.get('/messages/search', async (req, res) => {
    try {
      const filters = {
        direction: req.query.direction,
        from: req.query.from,
        to: req.query.to,
        type: req.query.type,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        searchText: req.query.searchText
      };

      const options = {
        limit: parseInt(req.query.limit) || 100,
        skip: parseInt(req.query.skip) || 0,
        sort: req.query.sort ? JSON.parse(req.query.sort) : { timestamp: -1 }
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) delete filters[key];
      });

      const result = await messageStorageService.searchMessages(filters, options);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error searching messages:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get message statistics
  router.get('/messages/statistics', async (req, res) => {
    try {
      const filters = {
        direction: req.query.direction,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      // Remove undefined filters
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) delete filters[key];
      });

      const result = await messageStorageService.getMessageStatistics(filters);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error getting message statistics:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get recent messages
  router.get('/messages/recent', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const result = await messageStorageService.getRecentMessages(limit);

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error getting recent messages:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get message by ID
  router.get('/messages/:messageId', async (req, res) => {
    try {
      const { messageId } = req.params;
      const result = await messageStorageService.getMessageById(messageId);

      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error getting message by ID:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Export messages
  router.post('/messages/export', async (req, res) => {
    try {
      const { filters = {}, format = 'json' } = req.body;

      const result = await messageStorageService.exportMessages(filters, format);

      if (result.success) {
        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="whatsapp-messages-${new Date().toISOString().split('T')[0]}.json"`);

        res.json(result.data);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error exporting messages:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Delete messages (admin only)
  router.delete('/messages', async (req, res) => {
    try {
      const { filters = {} } = req.body;

      // Add safety check - prevent accidental deletion of all messages
      if (Object.keys(filters).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Filters are required to prevent accidental deletion of all messages'
        });
      }

      const result = await messageStorageService.deleteMessages(filters);

      if (result.success) {
        res.json({
          success: true,
          message: `Successfully deleted ${result.deletedCount} messages`,
          deletedCount: result.deletedCount
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get database information
  router.get('/info', async (req, res) => {
    try {
      const health = await mongodbService.healthCheck();

      if (health.status === 'healthy') {
        res.json({
          success: true,
          database: health.database,
          collection: health.collection,
          documentCount: health.documentCount,
          storageSize: health.storageSize,
          indexSize: health.indexSize,
          timestamp: health.timestamp,
          connectionStatus: 'connected'
        });
      } else {
        res.status(503).json({
          success: false,
          error: health.error,
          connectionStatus: 'disconnected'
        });
      }
    } catch (error) {
      console.error('Error getting database info:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        connectionStatus: 'error'
      });
    }
  });

  // Test MongoDB connection
  router.post('/test-connection', async (req, res) => {
    try {
      const connected = await mongodbService.connect();

      if (connected) {
        res.json({
          success: true,
          message: 'MongoDB connection successful',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to connect to MongoDB',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error testing MongoDB connection:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Store message in MongoDB
  router.post('/messages/store', async (req, res) => {
    try {
      const messageData = req.body;

      if (!messageData.body && !messageData.content) {
        return res.status(400).json({
          success: false,
          error: 'Message body or content is required'
        });
      }

      // Add timestamp if not provided
      if (!messageData.timestamp) {
        messageData.timestamp = new Date();
      }

      const result = await messageStorageService.storeMessage(messageData);

      if (result.success) {
        res.json({
          success: true,
          message: 'Message stored successfully',
          messageId: result.messageId,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error storing message:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  return router;
}

module.exports = setupMongoDBRoutes;
