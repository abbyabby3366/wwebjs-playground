# Contacts API Documentation

This document describes the CRUD API endpoints for managing internal contacts in your Svelte application.

## Base URL

All endpoints are relative to `/api/contacts`

## Endpoints

### 1. GET /api/contacts

Retrieves all contacts or a specific contact by ID.

**Query Parameters:**
- `id` (optional): Contact ID to retrieve a specific contact

**Response Examples:**

Get all contacts:
```json
{
  "contacts": [
    {
      "id": "1",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "company": "Tech Corp",
      "notes": "Developer contact",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalCount": 1
}
```

Get specific contact:
```json
{
  "contact": {
    "id": "1",
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com",
    "company": "Tech Corp",
    "notes": "Developer contact",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. POST /api/contacts

Creates a new contact.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "+1987654321",
  "email": "jane@example.com",
  "company": "Design Studio",
  "notes": "UI/UX Designer"
}
```

**Required Fields:**
- `name`: Contact's full name
- `phone`: Phone number

**Optional Fields:**
- `email`: Email address
- `company`: Company name
- `notes`: Additional notes

**Response:**
```json
{
  "success": true,
  "contact": {
    "id": "1704067200000",
    "name": "Jane Smith",
    "phone": "+1987654321",
    "email": "jane@example.com",
    "company": "Design Studio",
    "notes": "UI/UX Designer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Contact created successfully"
}
```

### 3. PUT /api/contacts?id={id}

Updates an existing contact.

**Query Parameters:**
- `id`: Contact ID to update

**Request Body:**
```json
{
  "name": "Jane Smith Updated",
  "phone": "+1987654321",
  "email": "jane.updated@example.com",
  "company": "Design Studio Pro",
  "notes": "Senior UI/UX Designer"
}
```

**Response:**
```json
{
  "success": true,
  "contact": {
    "id": "1704067200000",
    "name": "Jane Smith Updated",
    "phone": "+1987654321",
    "email": "jane.updated@example.com",
    "company": "Design Studio Pro",
    "notes": "Senior UI/UX Designer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  },
  "message": "Contact updated successfully"
}
```

### 4. DELETE /api/contacts?id={id}

Deletes a contact.

**Query Parameters:**
- `id`: Contact ID to delete

**Response:**
```json
{
  "success": true,
  "message": "Contact deleted successfully",
  "deletedContact": {
    "id": "1704067200000",
    "name": "Jane Smith",
    "phone": "+1987654321",
    "email": "jane@example.com",
    "company": "Design Studio",
    "notes": "UI/UX Designer",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400`: Bad Request (missing required fields)
- `404`: Not Found (contact not found)
- `409`: Conflict (duplicate phone number)
- `500`: Internal Server Error

## Usage Examples

### JavaScript/Fetch API

```javascript
// Get all contacts
const response = await fetch('/api/contacts');
const data = await response.json();
console.log(data.contacts);

// Create a new contact
const newContact = {
  name: 'Alice Johnson',
  phone: '+1555123456',
  email: 'alice@example.com'
};

const createResponse = await fetch('/api/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newContact)
});

const createdContact = await createResponse.json();
console.log(createdContact.contact);

// Update a contact
const updateData = { name: 'Alice Johnson Updated' };
const updateResponse = await fetch('/api/contacts?id=123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateData)
});

// Delete a contact
const deleteResponse = await fetch('/api/contacts?id=123', {
  method: 'DELETE'
});
```

### Using the Contacts Service

```javascript
import { 
  getAllContacts, 
  createContact, 
  updateContact, 
  deleteContact 
} from '$lib/services/contacts.js';

// Get all contacts
const contacts = await getAllContacts();

// Create contact
const newContact = await createContact({
  name: 'Bob Wilson',
  phone: '+1555987654'
});

// Update contact
const updatedContact = await updateContact('123', {
  name: 'Bob Wilson Updated'
});

// Delete contact
await deleteContact('123');
```

## Data Validation

The API includes built-in validation:

- **Name**: Required, must not be empty
- **Phone**: Required, must not be empty
- **Email**: Optional, must be valid email format if provided
- **Company**: Optional
- **Notes**: Optional

## Current Implementation Notes

- **Storage**: Currently uses in-memory storage (data is lost on server restart)
- **Phone Uniqueness**: Phone numbers must be unique across all contacts
- **Timestamps**: Automatically generated for `createdAt` and `updatedAt`
- **IDs**: Generated using `Date.now().toString()`

## Future Enhancements

Consider implementing these features for production use:

1. **Database Integration**: Replace in-memory storage with MongoDB, PostgreSQL, or similar
2. **Authentication**: Add user authentication and contact ownership
3. **File Uploads**: Support for contact photos or documents
4. **Bulk Operations**: Import/export contacts via CSV/JSON
5. **Contact Groups**: Organize contacts into categories or groups
6. **Search API**: Advanced search with filters and pagination
7. **Rate Limiting**: Prevent API abuse
8. **Caching**: Implement Redis or similar for better performance

## Testing the API

You can test the API endpoints using:

1. **Browser**: Navigate to `/contacts` to see the UI
2. **Postman/Insomnia**: Use the endpoints directly
3. **cURL**: Command line testing
4. **Browser DevTools**: Use the Network tab to see API calls

Example cURL commands:

```bash
# Get all contacts
curl http://localhost:5173/api/contacts

# Create a contact
curl -X POST http://localhost:5173/api/contacts \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","phone":"+1234567890"}'

# Update a contact
curl -X PUT "http://localhost:5173/api/contacts?id=1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'

# Delete a contact
curl -X DELETE "http://localhost:5173/api/contacts?id=1"
```
