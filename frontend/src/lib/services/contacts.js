/**
 * Contacts Service - Provides CRUD operations for contacts
 */

const API_BASE = '/api/contacts';

/**
 * Fetch all contacts
 * @returns {Promise<Array>} Array of contacts
 */
export async function getAllContacts() {
  try {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Failed to fetch contacts');
    }
    const data = await response.json();
    return data.contacts || [];
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

/**
 * Fetch a single contact by ID
 * @param {string} id - Contact ID
 * @returns {Promise<Object>} Contact object
 */
export async function getContactById(id) {
  try {
    const response = await fetch(`${API_BASE}?id=${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch contact');
    }
    const data = await response.json();
    return data.contact;
  } catch (error) {
    console.error('Error fetching contact:', error);
    throw error;
  }
}

/**
 * Create a new contact
 * @param {Object} contactData - Contact data
 * @returns {Promise<Object>} Created contact
 */
export async function createContact(contactData) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create contact');
    }

    const data = await response.json();
    return data.contact;
  } catch (error) {
    console.error('Error creating contact:', error);
    throw error;
  }
}

/**
 * Update an existing contact
 * @param {string} id - Contact ID
 * @param {Object} contactData - Updated contact data
 * @returns {Promise<Object>} Updated contact
 */
export async function updateContact(id, contactData) {
  try {
    const response = await fetch(`${API_BASE}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update contact');
    }

    const data = await response.json();
    return data.contact;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
}

/**
 * Delete a contact
 * @param {string} id - Contact ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteContact(id) {
  try {
    const response = await fetch(`${API_BASE}?id=${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete contact');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
}

/**
 * Search contacts by term
 * @param {string} searchTerm - Search term
 * @param {Array} contacts - Array of contacts to search in
 * @returns {Array} Filtered contacts
 */
export function searchContacts(searchTerm, contacts) {
  if (!searchTerm.trim()) {
    return contacts;
  }

  const term = searchTerm.toLowerCase();
  return contacts.filter(contact =>
    contact.name.toLowerCase().includes(term) ||
    contact.phone.includes(term) ||
    contact.email.toLowerCase().includes(term) ||
    contact.company.toLowerCase().includes(term) ||
    (contact.label && contact.label.toLowerCase().includes(term)) ||
    (contact.assignedTo && contact.assignedTo.toLowerCase().includes(term))
  );
}

/**
 * Validate contact data
 * @param {Object} contactData - Contact data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateContact(contactData) {
  const errors = [];

  if (!contactData.name || contactData.name.trim() === '') {
    errors.push('Name is required');
  }

  if (!contactData.phone || contactData.phone.trim() === '') {
    errors.push('Phone number is required');
  }

  if (contactData.email && contactData.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactData.email)) {
      errors.push('Invalid email format');
    }
  }

  // Optional validation for new fields
  if (contactData.label && contactData.label.trim().length > 50) {
    errors.push('Label must be 50 characters or less');
  }

  if (contactData.assignedTo && contactData.assignedTo.trim().length > 100) {
    errors.push('Assigned To must be 100 characters or less');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
