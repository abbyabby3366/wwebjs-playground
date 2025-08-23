const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

class MongoDBService {
  constructor() {
    this.client = null;
    this.db = null;
    this.messagesCollection = null;
    this.isConnected = false;
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/jio8_wa_messages';
  }

  async connect() {
    try {
      if (this.isConnected) {
        console.log('MongoDB already connected');
        return true;
      }

      console.log('Connecting to MongoDB...');
      this.client = new MongoClient(this.connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db();
      this.messagesCollection = this.db.collection('messages');

      // Create indexes for better performance
      await this.createIndexes();

      this.isConnected = true;
      console.log('MongoDB connected successfully');

      // Set up connection event handlers
      this.setupConnectionHandlers();

      return true;
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  async createIndexes() {
    try {
      // Create indexes for common query patterns
      await this.messagesCollection.createIndex({ direction: 1 });
      await this.messagesCollection.createIndex({ from: 1 });
      await this.messagesCollection.createIndex({ to: 1 });
      await this.messagesCollection.createIndex({ type: 1 });
      await this.messagesCollection.createIndex({ timestamp: -1 });
      await this.messagesCollection.createIndex({ messageId: 1 }, { unique: true });
      await this.messagesCollection.createIndex({ createdAt: -1 });


      // Text index for search functionality
      await this.messagesCollection.createIndex({
        body: 'text',
        from: 'text',
        to: 'text'
      });

      // Create contacts collection and indexes
      this.contactsCollection = this.db.collection('contacts');
      await this.contactsCollection.createIndex({ phone: 1 }, { unique: true });
      await this.contactsCollection.createIndex({ name: 1 });
      await this.contactsCollection.createIndex({ createdAt: -1 });

      console.log('MongoDB indexes created successfully');
    } catch (error) {
      console.error('Failed to create indexes:', error);
    }
  }

  setupConnectionHandlers() {
    this.client.on('connectionPoolCreated', () => {
      console.log('MongoDB connection pool created');
    });

    this.client.on('connectionPoolClosed', () => {
      console.log('MongoDB connection pool closed');
      this.isConnected = false;
    });

    this.client.on('connectionCreated', () => {
      console.log('MongoDB connection created');
    });

    this.client.on('connectionClosed', () => {
      console.log('MongoDB connection closed');
    });

    this.client.on('connectionReady', () => {
      console.log('MongoDB connection ready');
      this.isConnected = true;
    });

    this.client.on('connectionCheckOutFailed', (event) => {
      console.error('MongoDB connection checkout failed:', event);
    });

    this.client.on('connectionCheckOut', (event) => {
      console.log('MongoDB connection checked out');
    });

    this.client.on('connectionCheckIn', (event) => {
      console.log('MongoDB connection checked in');
    });
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        this.isConnected = false;
        console.log('MongoDB disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
    }
  }

  async healthCheck() {
    try {
      if (!this.isConnected) {
        return { status: 'disconnected', error: 'Not connected to MongoDB' };
      }

      // Ping the database
      await this.db.admin().ping();

      // Get collection stats
      const stats = await this.messagesCollection.stats();

      return {
        status: 'healthy',
        database: this.db.databaseName,
        collection: 'messages',
        documentCount: stats.count,
        storageSize: stats.size,
        indexSize: stats.totalIndexSize,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  getCollection() {
    if (!this.isConnected) {
      throw new Error('MongoDB not connected');
    }
    return this.messagesCollection;
  }

  isConnected() {
    return this.isConnected;
  }

  // Contact management methods
  async getContacts() {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const contacts = await this.contactsCollection.find({}).sort({ createdAt: -1 }).toArray();
      return contacts;
    } catch (error) {
      console.error('Error getting contacts:', error);
      throw error;
    }
  }

  async getContactById(id) {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const contact = await this.contactsCollection.findOne({ _id: new ObjectId(id) });
      return contact;
    } catch (error) {
      console.error('Error getting contact by ID:', error);
      throw error;
    }
  }

  async getContactByPhone(phone) {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const contact = await this.contactsCollection.findOne({ phone: phone });
      return contact;
    } catch (error) {
      console.error('Error getting contact by phone:', error);
      throw error;
    }
  }

  async createContact(contactData) {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      // Check if contact with same phone already exists
      const existingContact = await this.getContactByPhone(contactData.phone);
      if (existingContact) {
        throw new Error('Contact with this phone number already exists');
      }

      const result = await this.contactsCollection.insertOne(contactData);
      const newContact = await this.getContactById(result.insertedId);
      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  async updateContact(id, updateData) {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const result = await this.contactsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return null;
      }

      const updatedContact = await this.getContactById(id);
      return updatedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  async deleteContact(id) {
    try {
      if (!this.isConnected) {
        throw new Error('MongoDB not connected');
      }

      const result = await this.contactsCollection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }
}

module.exports = MongoDBService;
