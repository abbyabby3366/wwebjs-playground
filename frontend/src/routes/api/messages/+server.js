import { json } from '@sveltejs/kit';

const WHATSAPP_SERVER_URL = `http://localhost:${process.env.PORT || 3023}`;

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    // Get the contact parameter from the query
    const contact = url.searchParams.get('contact');
    const limit = url.searchParams.get('limit') || '50';

    // Build the query string for the backend
    let queryString = `?limit=${limit}`;
    if (contact) {
      // The backend expects 'from' parameter for contact
      queryString += `&from=${contact}`;
    }

    // Forward the request to Node.js server
    const response = await fetch(`${WHATSAPP_SERVER_URL}/api/mongodb/messages/search${queryString}`);

    if (!response.ok) {
      throw new Error(`Node.js server responded with ${response.status}`);
    }

    const data = await response.json();

    // Transform messages to match frontend format
    if (data.success && data.messages) {
      const transformedMessages = data.messages.map(msg => {
        // Check if this is a group message
        const isGroupMessage = msg.metadata?.isGroup ||
          (msg.to && msg.to.includes('@g.us')) ||
          (msg.from && msg.from.includes('@g.us'));

        return {
          id: msg._id?.toString() || msg.id || Date.now().toString(),
          direction: msg.direction || (msg.fromMe ? 'sent' : 'received'),
          type: msg.type || 'text',
          content: msg.body || msg.content || '',
          from: msg.from || '',
          to: msg.to || '',
          timestamp: new Date(msg.timestamp || msg.createdAt),
          status: msg.status || 'delivered',
          contact: msg.fromMe ? msg.to : msg.from,
          // Include realPhoneNumber for easy access
          realPhoneNumber: msg.metadata?.realPhoneNumber || msg.from,
          // NEW: Include message type for better identification
          isGroup: isGroupMessage,
          messageType: isGroupMessage ? 'Group' : 'Individual'
        };
      });

      return json({
        messages: transformedMessages,
        totalCount: data.totalCount || transformedMessages.length,
        hasMore: data.hasMore || false
      });
    } else {
      return json({
        messages: [],
        totalCount: 0,
        hasMore: false
      });
    }

  } catch (error) {
    console.error('Error fetching messages from Node.js server:', error);
    return json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const messageData = await request.json();

    // Forward to Node.js server for storage
    const response = await fetch(`${WHATSAPP_SERVER_URL}/api/mongodb/messages/store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    });

    if (!response.ok) {
      throw new Error(`Node.js server responded with ${response.status}`);
    }

    const result = await response.json();

    return json({
      success: true,
      messageId: result.messageId || Date.now().toString()
    });

  } catch (error) {
    console.error('Error saving message through Node.js server:', error);
    return json({ error: 'Failed to save message' }, { status: 500 });
  }
}
