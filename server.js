const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Import WhatsApp client and routes
const WhatsAppClient = require('./whatsapp-client');
const whatsappRoutes = require('./routes/whatsapp');
const { setupMessageHandlerRoutes } = require('./message-handler');
const contactsRoutes = require('./routes/contacts');

// Import MongoDB services
const MongoDBService = require('./mongodb-service');
const MessageStorageService = require('./message-storage-service');
const setupMongoDBRoutes = require('./routes/mongodb');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize MongoDB service
const mongodbService = new MongoDBService();
const messageStorageService = new MessageStorageService(mongodbService);

// Initialize WhatsApp client
const whatsappClient = new WhatsAppClient();
whatsappClient.setSocketIO(io);
whatsappClient.setMessageStorageService(messageStorageService);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send current WhatsApp status
  const status = whatsappClient.getStatus();
  socket.emit('whatsapp_status', {
    status: status.status,
    qr: status.qr
  });

  // Handle message processing requests
  socket.on('process_message', async (data) => {
    try {
      if (whatsappClient.getMessageHandler()) {
        const result = await whatsappClient.getMessageHandler().processMessage(data.message);
        socket.emit('message_processed', result);
      } else {
        socket.emit('message_processed', {
          success: false,
          error: 'Message handler not available'
        });
      }
    } catch (error) {
      socket.emit('message_processed', {
        success: false,
        error: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API Routes
app.get('/api/health', async (req, res) => {
  try {
    const mongoHealth = await mongodbService.healthCheck();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      mongodb: mongoHealth
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Create BP Group Chat Endpoint
app.post('/api/create-bp-group', async (req, res) => {
  try {
    console.log('Create BP group request received:', req.body);

    // Extract all required fields
    const {
      merchantName,
      merchantPhone,
      BP_phone,
      BP_name,
      bp_id,
      bookingID,
      commissionRate,
      bookingDate,
      bookingTime,
      remarks,
      shortenedMerchantName
    } = req.body;

    // Validate required fields
    if (!merchantPhone || !BP_phone) {
      return res.status(400).json({
        success: false,
        error: 'Merchant phone and BP phone are required'
      });
    }

    // Check if WhatsApp client is ready
    const clientStatus = whatsappClient.getStatus();
    if (clientStatus.status !== 'ready') {
      return res.status(503).json({
        success: false,
        error: `WhatsApp client is not ready. Current status: ${clientStatus.status}. Please wait for the client to be ready or call /api/whatsapp/start to initialize it.`,
        clientStatus: clientStatus
      });
    }

    // Create group title with J8 + shortenedMerchantName + bp phone format
    const groupTitle = `J8 ${shortenedMerchantName || 'Merchant'} ${BP_phone}`;

    // Participants: only merchant (you)
    const participants = [merchantPhone];

    // Create the group
    const groupResult = await whatsappClient.createGroup(groupTitle, participants);

    // Add a 5-second delay after opening the group
    console.log('Group created successfully. Waiting 5 seconds before sending message...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log('5-second delay completed. Now sending message...');

    // Send initial message with booking details
    const initialMessage = `Hi, ${BP_name || 'Business Partner'} (ID: ${bp_id || 'N/A'})

Thank you for choosing Jio8 😎

To confirm the details of your reservation, please review the information below:

• Booking ID: ${bookingID || 'N/A'}
• Merchant: ${shortenedMerchantName || merchantName || 'N/A'} (${remarks || 'N/A'})
• Commission Rate: ${commissionRate || 'N/A'}
• Reservation Date: ${bookingDate || 'N/A'}
• Reservation Time: ${bookingTime || 'N/A'}
• Number of Guests: ${remarks ? remarks.split(', ').find(r => r.includes('Guests'))?.split(': ')[1] || 'N/A' : 'N/A'}
• Remarks: ${remarks || 'N/A'}

If the information above is correct, please reply "Yes" to proceed.

Jio8 Customer Support`;

    // Send the initial message to the group
    await whatsappClient.sendMessage(groupResult.gid._serialized, initialMessage, 'group');

    // Store group creation record in MongoDB if available
    if (mongodbService) {
      try {
        const groupRecord = {
          groupId: groupResult.gid._serialized,
          groupTitle: groupTitle,
          merchantName,
          shortenedMerchantName,
          merchantPhone,
          BP_phone,
          BP_name,
          bp_id,
          bookingID,
          commissionRate,
          bookingDate,
          bookingTime,
          remarks,
          createdAt: new Date(),
          status: 'active'
        };

        // You can add this to a groups collection if you want to track them
        // await mongodbService.db.collection('bp_groups').insertOne(groupRecord);
        console.log('BP group record created:', groupRecord);
      } catch (mongoError) {
        console.warn('Could not store group record in MongoDB:', mongoError.message);
      }
    }

    res.json({
      success: true,
      result: {
        groupId: groupResult.gid._serialized,
        groupTitle: groupTitle,
        participants: participants,
        message: 'BP group created successfully with initial message!'
      },
      details: {
        merchantName,
        shortenedMerchantName,
        merchantPhone,
        BP_phone,
        BP_name,
        bp_id,
        bookingID,
        commissionRate,
        bookingDate,
        bookingTime,
        remarks
      }
    });

  } catch (error) {
    console.error('Error creating BP group:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mount WhatsApp routes
app.use('/api/whatsapp', whatsappRoutes(whatsappClient));

// Mount message handler routes
app.use('/api/messages', setupMessageHandlerRoutes(whatsappClient));

// Mount MongoDB routes
app.use('/api/mongodb', setupMongoDBRoutes(messageStorageService, mongodbService));

// Mount Contacts routes
app.use('/api/contacts', contactsRoutes(mongodbService));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3023;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);

  // Connect to MongoDB
  try {
    console.log('Connecting to MongoDB...');
    const mongoConnected = await mongodbService.connect();
    if (mongoConnected) {
      console.log('MongoDB connected successfully');
    } else {
      console.error('Failed to connect to MongoDB');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }

  // Auto-start WhatsApp client
  try {
    console.log('Auto-starting WhatsApp client...');
    await whatsappClient.initialize();
    console.log('WhatsApp client initialization started');
  } catch (error) {
    console.error('Failed to auto-start WhatsApp client:', error.message);
    console.log('You can manually start it by calling /api/whatsapp/start endpoint');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  try {
    await whatsappClient.destroy();
    console.log('WhatsApp client destroyed');

    await mongodbService.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  try {
    await whatsappClient.destroy();
    console.log('WhatsApp client destroyed');

    await mongodbService.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});
