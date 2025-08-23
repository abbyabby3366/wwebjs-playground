import { json } from "@sveltejs/kit";
const WHATSAPP_SERVER_URL = `http://localhost:${process.env.PORT || 3023}`;
async function GET() {
  try {
    const response = await fetch(`${WHATSAPP_SERVER_URL}/api/mongodb/messages/recent?limit=100`);
    if (!response.ok) {
      throw new Error(`Node.js server responded with ${response.status}`);
    }
    const data = await response.json();
    if (data.success && data.messages && data.messages.length > 0) {
      const contactMap = /* @__PURE__ */ new Map();
      data.messages.forEach((msg) => {
        const contactPhone = msg.fromMe ? msg.to : msg.from;
        if (contactPhone && !contactMap.has(contactPhone)) {
          const name = msg.pushname || contactPhone.replace(/\D/g, "");
          const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
          contactMap.set(contactPhone, {
            id: contactMap.size + 1,
            name,
            phone: contactPhone,
            avatar: initials,
            status: "offline",
            lastMessage: msg.body || "No message",
            lastMessageTime: new Date(msg.timestamp),
            messageCount: 1
          });
        } else if (contactPhone && contactMap.has(contactPhone)) {
          const existing = contactMap.get(contactPhone);
          existing.messageCount += 1;
          if (new Date(msg.timestamp) > existing.lastMessageTime) {
            existing.lastMessage = msg.body || "No message";
            existing.lastMessageTime = new Date(msg.timestamp);
          }
        }
      });
      const contacts = Array.from(contactMap.values()).sort(
        (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
      );
      return json({
        contacts
      });
    } else {
      return json({
        contacts: []
      });
    }
  } catch (error) {
    console.error("Error fetching contacts from Node.js server:", error);
    return json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
export {
  GET
};
