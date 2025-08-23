# MongoDB Integration Setup Guide

## Overview
This WhatsApp server now includes comprehensive MongoDB integration for storing and managing all WhatsApp messages (both sent and received).

## Features Implemented

### ✅ **Message Storage**
- **Automatic storage** of all incoming and outgoing messages
- **Single collection** (`messages`) with direction field for sent/received
- **Rich metadata** including message type, status, timestamps, and processing results
- **Future-ready** for media files (images, videos, audio, documents)

### ✅ **Message Processing**
- **Real-time processing** of incoming messages
- **Automatic categorization** (greetings, questions, commands, spam, urgent)
- **Auto-reply system** with configurable responses
- **Processing results** stored alongside messages

### ✅ **Search & Analytics**
- **Advanced search** with multiple filters (direction, type, sender, content)
- **Full-text search** across message content
- **Message statistics** with breakdowns by type and direction
- **Recent messages** dashboard

### ✅ **Export & Management**
- **JSON export** of search results and recent messages
- **Bulk operations** for message management
- **Database health monitoring**
- **Connection status tracking**

## Setup Instructions

### 1. **Install Dependencies**
```bash
npm install mongodb dotenv
```

### 2. **Environment Configuration**
Create a `.env` file in your project root:
```bash
cp env-template.txt .env
```

Update the `.env` file with your MongoDB connection string:
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/jio8_wa_messages

# OR MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jio8_wa_messages
```

### 3. **MongoDB Connection String Formats**

#### **Local MongoDB**
```env
MONGODB_URI=mongodb://localhost:27017/jio8_wa_messages
```

#### **MongoDB with Authentication**
```env
MONGODB_URI=mongodb://username:password@localhost:27017/jio8_wa_messages
```

#### **MongoDB Atlas (Cloud)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jio8_wa_messages
```

#### **MongoDB with SSL**
```env
MONGODB_URI=mongodb://username:password@host:port/jio8_wa_messages?ssl=true
```

### 4. **Database Structure**

#### **Collection: `messages`**
```javascript
{
  _id: ObjectId,
  messageId: String,        // WhatsApp message ID
  direction: String,        // "sent" or "received"
  from: String,            // Sender phone/ID
  to: String,              // Recipient phone/ID (for sent messages)
  type: String,            // "text", "image", "video", "audio", "document"
  body: String,            // Message content
  caption: String,         // Media caption
  timestamp: Date,         // When message was sent/received
  status: String,          // "received", "sent", "delivered", "read"
  metadata: Object,        // Additional WhatsApp data
  processingResult: Object, // Message handler processing result
  createdAt: Date,         // When stored in MongoDB
  updatedAt: Date          // Last updated timestamp
}
```

#### **Indexes Created**
- `direction` - For filtering sent/received messages
- `from` - For sender-based queries
- `to` - For recipient-based queries
- `type` - For message type filtering
- `timestamp` - For date-based queries and sorting
- `messageId` - Unique index for WhatsApp message IDs
- `createdAt` - For creation date queries
- `text` - Full-text search across body, from, and to fields

## API Endpoints

### **Database Health & Status**
- `GET /api/mongodb/health` - Check database connection status
- `GET /api/mongodb/info` - Get database information and stats
- `POST /api/mongodb/test-connection` - Test MongoDB connection

### **Message Management**
- `GET /api/mongodb/messages/search` - Search messages with filters
- `GET /api/mongodb/messages/statistics` - Get message statistics
- `GET /api/mongodb/messages/recent` - Get recent messages
- `GET /api/mongodb/messages/:messageId` - Get specific message
- `POST /api/mongodb/messages/export` - Export messages to JSON
- `DELETE /api/mongodb/messages` - Delete messages (with safety filters)

## Usage Examples

### **Search Messages**
```bash
# Search for text messages from a specific sender
GET /api/mongodb/messages/search?direction=received&type=text&from=1234567890&searchText=hello

# Search for messages in date range
GET /api/mongodb/messages/search?startDate=2024-01-01&endDate=2024-01-31&limit=100

# Full-text search
GET /api/mongodb/messages/search?searchText=urgent&limit=50
```

### **Get Statistics**
```bash
# Overall statistics
GET /api/mongodb/messages/statistics

# Statistics for specific direction
GET /api/mongodb/messages/statistics?direction=sent

# Statistics for date range
GET /api/mongodb/messages/statistics?startDate=2024-01-01&endDate=2024-01-31
```

### **Export Messages**
```bash
POST /api/mongodb/messages/export
Content-Type: application/json

{
  "filters": {
    "direction": "received",
    "type": "text",
    "startDate": "2024-01-01"
  },
  "format": "json"
}
```

## Frontend Dashboard

### **Features**
- **Real-time database status** monitoring
- **Message statistics** with visual breakdowns
- **Advanced search interface** with multiple filters
- **Search results display** with message details
- **Recent messages** viewer
- **Export functionality** for search results and recent messages

### **Sections**
1. **Database Status** - Connection health and information
2. **Message Statistics** - Counts and breakdowns
3. **Message Search** - Advanced search with filters
4. **Search Results** - Display and export search results
5. **Recent Messages** - View and export recent messages

## Error Handling

### **Connection Failures**
- **Graceful degradation** - App continues without MongoDB
- **Automatic retry** - Connection attempts on startup
- **Health monitoring** - Real-time connection status
- **User notifications** - Clear error messages in frontend

### **Storage Failures**
- **Non-blocking** - Message processing continues
- **Error logging** - Detailed error information
- **Fallback behavior** - Messages processed but not stored
- **Recovery options** - Manual retry and connection testing

## Future Enhancements

### **Media File Support**
- **Image storage** with metadata
- **Video file handling** with compression
- **Audio message processing** with transcription
- **Document management** with OCR support
- **File size optimization** and storage quotas

### **Advanced Features**
- **Message threading** and conversation tracking
- **Sentiment analysis** and content classification
- **Automated responses** based on message patterns
- **Message archiving** and retention policies
- **Real-time notifications** for important messages

## Troubleshooting

### **Common Issues**

#### **Connection Refused**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB service
sudo systemctl start mongod
```

#### **Authentication Failed**
```bash
# Verify username/password in connection string
# Check MongoDB user permissions
mongo -u username -p password --authenticationDatabase admin
```

#### **Database Not Found**
```bash
# MongoDB will create database automatically
# Check if connection string includes database name
MONGODB_URI=mongodb://localhost:27017/jio8_wa_messages
```

#### **Permission Denied**
```bash
# Ensure MongoDB user has read/write access
# Check MongoDB user roles and privileges
```

### **Debug Mode**
Enable detailed logging by setting environment variable:
```env
DEBUG=mongodb:*
```

## Performance Considerations

### **Indexing Strategy**
- **Compound indexes** for common query patterns
- **Text indexes** for search functionality
- **TTL indexes** for future message expiration
- **Background index creation** to avoid blocking operations

### **Connection Pooling**
- **Default pool size** of 10 connections
- **Connection timeout** of 5 seconds
- **Socket timeout** of 45 seconds
- **Automatic reconnection** on failures

### **Query Optimization**
- **Limit results** to prevent memory issues
- **Use projections** to select only needed fields
- **Batch operations** for bulk operations
- **Cursor-based pagination** for large result sets

## Security Considerations

### **Connection Security**
- **Use SSL/TLS** for production deployments
- **Network isolation** for database access
- **Firewall rules** to restrict database access
- **VPN access** for remote database connections

### **Data Protection**
- **Encrypt sensitive data** at rest
- **Implement access controls** and user roles
- **Regular backups** and disaster recovery
- **Audit logging** for database operations

## Support

For issues or questions about the MongoDB integration:
1. Check the server logs for detailed error messages
2. Verify your connection string format
3. Test database connectivity manually
4. Review the API endpoint documentation
5. Check the frontend dashboard for status information

## Conclusion

The MongoDB integration provides a robust foundation for message storage and management. It automatically handles all WhatsApp messages while providing powerful search, analytics, and export capabilities. The system is designed to be resilient to connection failures and provides comprehensive monitoring and management tools.
