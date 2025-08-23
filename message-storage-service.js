const { ObjectId } = require('mongodb');

class MessageStorageService {
  constructor(mongodbService) {
    this.mongodbService = mongodbService;
  }

  // Store a received message
  async storeReceivedMessage(message, processingResult = null, extractedPhoneNumber = null) {
    try {
      // Check if this is a group message
      const isGroupMessage = message.from && message.from.includes('@g.us');
      const author = message.author || message.from;

      // For group messages, use the extracted phone number if provided, otherwise fall back to existing logic
      let realPhoneNumber = null;
      let groupParticipantPhone = null; // New field specifically for group participants

      if (isGroupMessage) {
        console.log('Processing group message with extractedPhoneNumber:', extractedPhoneNumber);

        // PRIORITY 1: Use the extracted phone number passed from WhatsApp client
        if (extractedPhoneNumber) {
          realPhoneNumber = extractedPhoneNumber;
          groupParticipantPhone = extractedPhoneNumber;
          console.log('Group message: Using extracted phone number from WhatsApp client:', realPhoneNumber);
        }
        // PRIORITY 2: Use sender.number if available (this is the REAL phone number)
        else if (message.sender && message.sender.number) {
          realPhoneNumber = message.sender.number;
          groupParticipantPhone = message.sender.number; // Store in new field
          console.log('Group message: Using real phone number from sender.number:', realPhoneNumber);
        }
        // PRIORITY 3: Fallback: try to extract from author (but this might be an ID)
        else {
          const cleanAuthor = author.replace('@lid', '').replace('@c.us', '').replace('@g.us', '');
          if (/^\d{8,}$/.test(cleanAuthor)) {
            realPhoneNumber = cleanAuthor;
            groupParticipantPhone = cleanAuthor;
            console.log('Group message: Using phone number from author (fallback):', realPhoneNumber);
          }
        }
      } else {
        // For individual messages, use the from field
        realPhoneNumber = message.from.replace('@c.us', '');
      }

      const messageDoc = {
        messageId: message.id._serialized,
        direction: 'received',
        from: isGroupMessage ? (realPhoneNumber || author) : message.from.replace('@c.us', ''),
        to: isGroupMessage ? message.from : null, // For groups, 'to' is the group ID
        type: message.type,
        body: message.body || null,
        caption: message.caption || null,
        timestamp: new Date(message.timestamp * 1000),
        status: 'received',
        fromMe: false,
        metadata: {
          isGroup: isGroupMessage,
          author: author,
          realPhoneNumber: realPhoneNumber,
          groupId: isGroupMessage ? message.from : null,
          // NEW FIELD: Store group participant phone number separately
          groupParticipantPhone: groupParticipantPhone,
          hasQuotedMsg: message.hasQuotedMsg || false,
          isForwarded: message._data?.isForwarded || false,
          notifyName: message._data?.notifyName || null,
          pushName: message.pushName || null,
          // Store additional contact information
          senderNumber: message.sender?.number || realPhoneNumber,
          senderName: message.sender?.pushname || message._data?.notifyName || null,
        },
        processingResult: processingResult || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const collection = this.mongodbService.getCollection();
      const result = await collection.insertOne(messageDoc);

      console.log(`Received message stored with ID: ${result.insertedId}`);
      console.log('Message stored with phone number info:', {
        messageId: messageDoc.messageId,
        from: messageDoc.from,
        realPhoneNumber: messageDoc.metadata.realPhoneNumber,
        senderNumber: messageDoc.metadata.senderNumber,
        groupParticipantPhone: messageDoc.metadata.groupParticipantPhone, // New field
        author: messageDoc.metadata.author,
        isGroup: messageDoc.metadata.isGroup
      });

      return {
        success: true,
        messageId: result.insertedId,
        whatsappMessageId: messageDoc.messageId
      };
    } catch (error) {
      console.error('Failed to store received message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Store a sent message
  async storeSentMessage(messageData, whatsappResult) {
    try {
      // Check if this is a group message
      const isGroupMessage = messageData.recipient && messageData.recipient.includes('@g.us');

      const messageDoc = {
        messageId: whatsappResult.messageId || whatsappResult.id?._serialized || new ObjectId().toString(),
        direction: 'sent',
        from: null, // For sent messages, 'from' is the current user
        to: messageData.recipient,
        type: 'text', // Default to text for now
        body: messageData.message,
        caption: null,
        timestamp: new Date(),
        status: 'sent',
        fromMe: true,
        metadata: {
          messageType: messageData.messageType || 'individual',
          isGroup: isGroupMessage,
          groupId: isGroupMessage ? messageData.recipient : null,
          originalRequest: messageData,
          whatsappResult: whatsappResult
        },
        processingResult: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const collection = this.mongodbService.getCollection();
      const result = await collection.insertOne(messageDoc);

      console.log(`Sent message stored with ID: ${result.insertedId}`);
      return {
        success: true,
        messageId: result.insertedId,
        whatsappMessageId: messageDoc.messageId
      };
    } catch (error) {
      console.error('Failed to store sent message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update message status (for future delivery tracking)
  async updateMessageStatus(messageId, status, additionalData = {}) {
    try {
      const collection = this.mongodbService.getCollection();
      const updateData = {
        status: status,
        updatedAt: new Date(),
        ...additionalData
      };

      const result = await collection.updateOne(
        { messageId: messageId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return { success: false, error: 'Message not found' };
      }

      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      console.error('Failed to update message status:', error);
      return { success: false, error: error.message };
    }
  }

  // Search messages with filters
  async searchMessages(filters = {}, options = {}) {
    try {
      const collection = this.mongodbService.getCollection();

      // Build query from filters
      const query = {};

      if (filters.direction) query.direction = filters.direction;
      if (filters.from) query.from = { $regex: filters.from, $options: 'i' };
      if (filters.to) query.to = { $regex: filters.to, $options: 'i' };
      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;

      // Date range filter
      if (filters.startDate || filters.endDate) {
        query.timestamp = {};
        if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
        if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
      }

      // Text search
      if (filters.searchText) {
        query.$text = { $search: filters.searchText };
      }

      // Build options
      const findOptions = {
        sort: { timestamp: -1 },
        limit: options.limit || 100,
        skip: options.skip || 0
      };

      if (options.sort) {
        findOptions.sort = options.sort;
      }

      const messages = await collection.find(query, findOptions).toArray();
      const totalCount = await collection.countDocuments(query);

      return {
        success: true,
        messages: messages,
        totalCount: totalCount,
        limit: findOptions.limit,
        skip: findOptions.skip
      };
    } catch (error) {
      console.error('Failed to search messages:', error);
      return { success: false, error: error.message };
    }
  }

  // Get message statistics
  async getMessageStatistics(filters = {}) {
    try {
      const collection = this.mongodbService.getCollection();

      // Build match stage for aggregation
      const matchStage = {};
      if (filters.direction) matchStage.direction = filters.direction;
      if (filters.startDate || filters.endDate) {
        matchStage.timestamp = {};
        if (filters.startDate) matchStage.timestamp.$gte = new Date(filters.startDate);
        if (filters.endDate) matchStage.timestamp.$lte = new Date(filters.endDate);
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalMessages: { $sum: 1 },
            sentMessages: {
              $sum: { $cond: [{ $eq: ['$direction', 'sent'] }, 1, 0] }
            },
            receivedMessages: {
              $sum: { $cond: [{ $eq: ['$direction', 'received'] }, 1, 0] }
            },
            byType: {
              $push: '$type'
            },
            byStatus: {
              $push: '$status'
            }
          }
        },
        {
          $project: {
            _id: 0,
            totalMessages: 1,
            sentMessages: 1,
            receivedMessages: 1,
            messageTypes: {
              $reduce: {
                input: '$byType',
                initialValue: {},
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $literal: {
                        $concat: ['$$this', ': ', { $toString: { $size: { $filter: { input: '$byType', cond: { $eq: ['$$this', '$$this'] } } } } }]
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      ];

      const results = await collection.aggregate(pipeline).toArray();

      if (results.length === 0) {
        return {
          success: true,
          statistics: {
            totalMessages: 0,
            sentMessages: 0,
            receivedMessages: 0,
            messageTypes: {}
          }
        };
      }

      // Process message types count
      const messageTypes = {};
      if (results[0].byType) {
        results[0].byType.forEach(type => {
          messageTypes[type] = (messageTypes[type] || 0) + 1;
        });
      }

      return {
        success: true,
        statistics: {
          totalMessages: results[0].totalMessages || 0,
          sentMessages: results[0].sentMessages || 0,
          receivedMessages: results[0].receivedMessages || 0,
          messageTypes: messageTypes
        }
      };
    } catch (error) {
      console.error('Failed to get message statistics:', error);
      return { success: false, error: error.message };
    }
  }

  // Get recent messages for dashboard
  async getRecentMessages(limit = 20) {
    try {
      const collection = this.mongodbService.getCollection();

      const messages = await collection.find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray();

      return {
        success: true,
        messages: messages
      };
    } catch (error) {
      console.error('Failed to get recent messages:', error);
      return { success: false, error: error.message };
    }
  }

  // Export messages to JSON
  async exportMessages(filters = {}, format = 'json') {
    try {
      const searchResult = await this.searchMessages(filters, { limit: 10000 }); // Large limit for export

      if (!searchResult.success) {
        return searchResult;
      }

      const exportData = {
        exportInfo: {
          timestamp: new Date().toISOString(),
          totalMessages: searchResult.totalCount,
          filters: filters,
          format: format
        },
        messages: searchResult.messages
      };

      return {
        success: true,
        data: exportData,
        format: format
      };
    } catch (error) {
      console.error('Failed to export messages:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete messages (for admin purposes)
  async deleteMessages(filters = {}) {
    try {
      const collection = this.mongodbService.getCollection();

      const result = await collection.deleteMany(filters);

      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Failed to delete messages:', error);
      return { success: false, error: error.message };
    }
  }

  // Get message by ID
  async getMessageById(messageId) {
    try {
      const collection = this.mongodbService.getCollection();

      const message = await collection.findOne({ messageId: messageId });

      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      return {
        success: true,
        message: message
      };
    } catch (error) {
      console.error('Failed to get message by ID:', error);
      return { success: false, error: error.message };
    }
  }

  // Store a generic message (used by SvelteKit API)
  async storeMessage(messageData) {
    try {
      const messageDoc = {
        messageId: messageData.messageId || new ObjectId().toString(),
        direction: messageData.direction || 'sent',
        from: messageData.from || null,
        to: messageData.to || null,
        type: messageData.type || 'text',
        body: messageData.body || messageData.content || '',
        caption: messageData.caption || null,
        timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
        status: messageData.status || 'sent',
        fromMe: messageData.fromMe || false,
        metadata: messageData.metadata || {},
        processingResult: messageData.processingResult || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const collection = this.mongodbService.getCollection();
      const result = await collection.insertOne(messageDoc);

      console.log(`Message stored with ID: ${result.insertedId}`);
      return {
        success: true,
        messageId: result.insertedId,
        whatsappMessageId: messageDoc.messageId
      };
    } catch (error) {
      console.error('Failed to store message:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = MessageStorageService;
