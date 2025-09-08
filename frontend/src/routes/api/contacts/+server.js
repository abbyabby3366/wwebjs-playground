import { json } from '@sveltejs/kit';

// In-memory storage for contacts (you can replace this with a database later)
let contacts = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1234567890',
    email: 'john@example.com',
    company: 'Tech Corp',
    notes: 'Developer contact',
    label: 'VIP',
    assignedTo: 'Sales Team',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  try {
    const id = url.searchParams.get('id');

    if (id) {
      // Get specific contact by ID
      const contact = contacts.find(c => c.id === id);
      if (!contact) {
        return json({ error: 'Contact not found' }, { status: 404 });
      }
      return json({ contact });
    }

    // Get all contacts
    return json({
      contacts,
      totalCount: contacts.length
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return json({ error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const contactData = await request.json();

    // Validate required fields
    if (!contactData.name || !contactData.phone) {
      return json({
        error: 'Name and phone are required'
      }, { status: 400 });
    }

    // Check if phone number already exists
    const existingContact = contacts.find(c => c.phone === contactData.phone);
    if (existingContact) {
      return json({
        error: 'Contact with this phone number already exists'
      }, { status: 409 });
    }

    // Create new contact
    const newContact = {
      id: Date.now().toString(),
      name: contactData.name,
      phone: contactData.phone,
      email: contactData.email || '',
      company: contactData.company || '',
      notes: contactData.notes || '',
      label: contactData.label || '',
      assignedTo: contactData.assignedTo || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    contacts.push(newContact);

    return json({
      success: true,
      contact: newContact,
      message: 'Contact created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating contact:', error);
    return json({ error: 'Failed to create contact' }, { status: 500 });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request, url }) {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const contactData = await request.json();

    // Find the contact to update
    const contactIndex = contacts.findIndex(c => c.id === id);
    if (contactIndex === -1) {
      return json({ error: 'Contact not found' }, { status: 404 });
    }

    // Check if phone number already exists for another contact
    const existingContact = contacts.find(c => c.phone === contactData.phone && c.id !== id);
    if (existingContact) {
      return json({
        error: 'Contact with this phone number already exists'
      }, { status: 409 });
    }

    // Update the contact
    const updatedContact = {
      ...contacts[contactIndex],
      ...contactData,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    contacts[contactIndex] = updatedContact;

    return json({
      success: true,
      contact: updatedContact,
      message: 'Contact updated successfully'
    });

  } catch (error) {
    console.error('Error updating contact:', error);
    return json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ url }) {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return json({ error: 'Contact ID is required' }, { status: 400 });
    }

    // Find the contact to delete
    const contactIndex = contacts.findIndex(c => c.id === id);
    if (contactIndex === -1) {
      return json({ error: 'Contact not found' }, { status: 404 });
    }

    // Remove the contact
    const deletedContact = contacts.splice(contactIndex, 1)[0];

    return json({
      success: true,
      message: 'Contact deleted successfully',
      deletedContact
    });

  } catch (error) {
    console.error('Error deleting contact:', error);
    return json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
