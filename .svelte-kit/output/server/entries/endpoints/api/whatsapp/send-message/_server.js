import { json } from "@sveltejs/kit";
const WHATSAPP_SERVER_URL = `http://localhost:${process.env.PORT || 3023}`;
async function POST({ request }) {
  try {
    const messageData = await request.json();
    const { recipient, message, messageType } = messageData;
    if (!recipient || !message) {
      return json({
        success: false,
        error: "Recipient and message are required"
      }, { status: 400 });
    }
    console.log("SvelteKit: Forwarding message to WhatsApp server:", { recipient, message });
    const whatsappResponse = await fetch(`${WHATSAPP_SERVER_URL}/api/whatsapp/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipient,
        message,
        messageType: messageType || "text"
      })
    });
    const whatsappResult = await whatsappResponse.json();
    if (!whatsappResult.success) {
      console.error("WhatsApp server error:", whatsappResult.error);
      return json({
        success: false,
        error: `WhatsApp server error: ${whatsappResult.error}`
      }, { status: 500 });
    }
    console.log("SvelteKit: Message sent to WhatsApp successfully");
    const messageToStore = {
      direction: "sent",
      type: messageType || "text",
      body: message,
      from: "agent",
      // You can customize this
      to: recipient,
      timestamp: /* @__PURE__ */ new Date(),
      fromMe: true,
      status: "sent"
    };
    const mongoResponse = await fetch(`${WHATSAPP_SERVER_URL}/api/mongodb/messages/store`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(messageToStore)
    });
    if (!mongoResponse.ok) {
      console.error("Failed to store message in MongoDB:", mongoResponse.statusText);
    } else {
      console.log("SvelteKit: Message stored in MongoDB successfully");
    }
    return json({
      success: true,
      message: "Message sent and stored successfully",
      whatsappResult: whatsappResult.result,
      stored: mongoResponse.ok
    });
  } catch (error) {
    console.error("SvelteKit: Error in send-message endpoint:", error);
    return json({
      success: false,
      error: `Internal server error: ${error.message}`
    }, { status: 500 });
  }
}
export {
  POST
};
