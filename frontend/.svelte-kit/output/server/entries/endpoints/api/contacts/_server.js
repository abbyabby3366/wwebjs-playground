import { json } from "@sveltejs/kit";
let contacts = [
  {
    id: "1",
    name: "John Doe",
    phone: "+1234567890",
    email: "john@example.com",
    company: "Tech Corp",
    notes: "Developer contact",
    label: "VIP",
    assignedTo: "Sales Team",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
async function GET({ url }) {
  try {
    const id = url.searchParams.get("id");
    if (id) {
      const contact = contacts.find((c) => c.id === id);
      if (!contact) {
        return json({ error: "Contact not found" }, { status: 404 });
      }
      return json({ contact });
    }
    return json({
      contacts,
      totalCount: contacts.length
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}
async function POST({ request }) {
  try {
    const contactData = await request.json();
    if (!contactData.name || !contactData.phone) {
      return json({
        error: "Name and phone are required"
      }, { status: 400 });
    }
    const existingContact = contacts.find((c) => c.phone === contactData.phone);
    if (existingContact) {
      return json({
        error: "Contact with this phone number already exists"
      }, { status: 409 });
    }
    const newContact = {
      id: Date.now().toString(),
      name: contactData.name,
      phone: contactData.phone,
      email: contactData.email || "",
      company: contactData.company || "",
      notes: contactData.notes || "",
      label: contactData.label || "",
      assignedTo: contactData.assignedTo || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    contacts.push(newContact);
    return json({
      success: true,
      contact: newContact,
      message: "Contact created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return json({ error: "Failed to create contact" }, { status: 500 });
  }
}
async function PUT({ request, url }) {
  try {
    const id = url.searchParams.get("id");
    if (!id) {
      return json({ error: "Contact ID is required" }, { status: 400 });
    }
    const contactData = await request.json();
    const contactIndex = contacts.findIndex((c) => c.id === id);
    if (contactIndex === -1) {
      return json({ error: "Contact not found" }, { status: 404 });
    }
    const existingContact = contacts.find((c) => c.phone === contactData.phone && c.id !== id);
    if (existingContact) {
      return json({
        error: "Contact with this phone number already exists"
      }, { status: 409 });
    }
    const updatedContact = {
      ...contacts[contactIndex],
      ...contactData,
      id,
      // Ensure ID doesn't change
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    contacts[contactIndex] = updatedContact;
    return json({
      success: true,
      contact: updatedContact,
      message: "Contact updated successfully"
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return json({ error: "Failed to update contact" }, { status: 500 });
  }
}
async function DELETE({ url }) {
  try {
    const id = url.searchParams.get("id");
    if (!id) {
      return json({ error: "Contact ID is required" }, { status: 400 });
    }
    const contactIndex = contacts.findIndex((c) => c.id === id);
    if (contactIndex === -1) {
      return json({ error: "Contact not found" }, { status: 404 });
    }
    const deletedContact = contacts.splice(contactIndex, 1)[0];
    return json({
      success: true,
      message: "Contact deleted successfully",
      deletedContact
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return json({ error: "Failed to delete contact" }, { status: 500 });
  }
}
export {
  DELETE,
  GET,
  POST,
  PUT
};
