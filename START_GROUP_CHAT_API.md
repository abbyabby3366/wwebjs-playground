# Start Group Chat API Documentation

## Endpoint
**POST** `/api/create-bp-group`

## Description
Creates a WhatsApp group chat for business partner (BP) communication and automatically sends a confirmation message.

## Request Body Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `merchantName` | string | No | Full name of the merchant |
| `shortenedMerchantName` | string | No | Short/abbreviated merchant name |
| `merchantPhone` | string | **Yes** | Merchant's phone number |
| `BP_phone` | string | **Yes** | Business Partner's phone number |
| `BP_name` | string | No | Business Partner's name |
| `bp_id` | string | No | Business Partner ID |
| `bookingID` | string | No | Booking identifier |
| `commissionRate` | string | No | Commission rate for the booking |
| `bookingDate` | string | No | Date of the reservation |
| `bookingTime` | string | No | Time of the reservation |
| `remarks` | string | No | Additional notes or remarks |

## Group Naming Convention
Groups are automatically named using the format:
```
J8 + shortenedMerchantName + BP_phone
```

**Example:** `J8Club4041234567890`

## What Happens
1. Creates WhatsApp group with only merchant as participant
2. Sends automatic confirmation message with booking details
3. Returns group information and creation status

## Example Request
```json
{
  "merchantName": "404 Club Not Found",
  "shortenedMerchantName": "Club404",
  "merchantPhone": "447340449164",
  "BP_phone": "9876543210",
  "BP_name": "KL",
  "bp_id": "bpkn028",
  "bookingID": "230825-kn028-ggc",
  "commissionRate": "8.00%",
  "bookingDate": "2025-08-23",
  "bookingTime": "11:30 PM",
  "remarks": "Either K or V, Booking Name: KL"
}
```

## Example Response
```json
{
  "success": true,
  "result": {
    "groupId": "120363025123456789@g.us",
    "groupTitle": "J8Club4049876543210",
    "participants": ["1234567890"],
    "message": "BP group created successfully with initial message!"
  },
  "details": {
    "merchantName": "404 Club Not Found",
    "shortenedMerchantName": "Club404",
    "merchantPhone": "1234567890",
    "BP_phone": "9876543210",
    "BP_name": "KL",
    "bp_id": "bpkn028",
    "bookingID": "230825-kn028-ggc",
    "commissionRate": "8.00%",
    "bookingDate": "2025-08-23",
    "bookingTime": "11:30 PM",
    "remarks": "Either K or V, Booking Name: KL"
  }
}
```

## Error Responses

### WhatsApp Client Not Ready
```json
{
  "success": false,
  "error": "WhatsApp client is not ready. Current status: disconnected. Please wait for the client to be ready or call /api/whatsapp/start to initialize it.",
  "clientStatus": {
    "status": "disconnected",
    "qr": null
  }
}
```

### Missing Required Fields
```json
{
  "success": false,
  "error": "Merchant phone and BP phone are required"
}
```

## Prerequisites
- WhatsApp client must be ready (status: 'ready')
- Valid merchant and BP phone numbers
- Server running on port 3023

## Notes
- Only the merchant is added as a participant initially
- BP can join later using group invite link
- Automatic message is sent to confirm booking details
- Group records are logged for tracking purposes
