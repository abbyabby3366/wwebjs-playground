<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  /**
   * @typedef {Object} Contact
   * @property {string} id
   * @property {string} name
   * @property {string} phone
   * @property {string} email
   * @property {string} company
   * @property {string} notes
   * @property {string} createdAt
   * @property {string} updatedAt
   */

  /** @type {Contact[]} */
  let contacts = [];
  let loading = false;
  let error = "";
  let showAddForm = false;
  let showEditForm = false;
  /** @type {Contact | null} */
  let editingContact = null;

  // Form data
  let formData = {
    name: "",
    phone: "",
    email: "",
    company: "",
    notes: "",
    label: "",
    assignedTo: "",
  };

  // Search functionality
  let searchTerm = "";
  /** @type {Contact[]} */
  let filteredContacts = [];

  onMount(() => {
    fetchContacts();
  });

  // Watch search term and filter contacts
  $: {
    if (searchTerm.trim() === "") {
      filteredContacts = contacts || [];
    } else {
      filteredContacts = (contacts || []).filter(
        (contact) =>
          contact &&
          contact.id &&
          ((contact.name &&
            contact.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contact.phone && contact.phone.includes(searchTerm)) ||
            (contact.email &&
              contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contact.company &&
              contact.company
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (contact.label &&
              contact.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (contact.assignedTo &&
              contact.assignedTo
                .toLowerCase()
                .includes(searchTerm.toLowerCase()))),
      );
    }
  }

  async function fetchContacts() {
    loading = true;
    error = "";
    try {
      const response = await fetch("/api/contacts");
      if (!response.ok) {
        throw new Error("Failed to fetch contacts");
      }
      const data = await response.json();
      contacts = data.contacts || [];
      // Ensure all contacts have valid IDs
      contacts = contacts.map((contact, index) => ({
        ...contact,
        id: contact.id || `temp-${Date.now()}-${index}`,
      }));
      console.log("Fetched contacts:", contacts);
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    } finally {
      loading = false;
    }
  }

  async function createContact() {
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create contact");
      }

      await fetchContacts();
      resetForm();
      showAddForm = false;
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    }
  }

  async function updateContact() {
    if (!editingContact) return;

    try {
      const response = await fetch(`/api/contacts?id=${editingContact.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update contact");
      }

      await fetchContacts();
      resetForm();
      showEditForm = false;
      editingContact = null;
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    }
  }

  /**
   * @param {string} id
   */
  async function deleteContact(id) {
    if (!confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    try {
      const response = await fetch(`/api/contacts?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete contact");
      }

      await fetchContacts();
    } catch (err) {
      error = err instanceof Error ? err.message : "An error occurred";
    }
  }

  /**
   * @param {Contact} contact
   */
  function editContact(contact) {
    editingContact = contact;
    formData = { ...contact };
    showEditForm = true;
  }

  function resetForm() {
    formData = {
      name: "",
      phone: "",
      email: "",
      company: "",
      notes: "",
      label: "",
      assignedTo: "",
    };
  }

  function openAddForm() {
    resetForm();
    showAddForm = true;
    showEditForm = false;
  }

  function closeForms() {
    showAddForm = false;
    showEditForm = false;
    editingContact = null;
    resetForm();
  }
</script>

<svelte:head>
  <title>Contacts - WhatsApp Chat Portal</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Contacts</h1>
    <p class="text-gray-600">Manage your internal contact list</p>
  </div>

  <!-- Error Display -->
  {#if error}
    <div
      class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
      transition:fade
    >
      {error}
      <button class="float-right font-bold" on:click={() => (error = "")}
        >×</button
      >
    </div>
  {/if}

  <!-- Search and Add Button -->
  <div class="flex flex-col sm:flex-row gap-4 mb-6">
    <div class="flex-1">
      <input
        type="text"
        placeholder="Search contacts..."
        bind:value={searchTerm}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
    <button
      on:click={openAddForm}
      class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
    >
      Add Contact
    </button>
  </div>

  <!-- Loading State -->
  {#if loading}
    <div class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
      <p class="mt-2 text-gray-600">Loading contacts...</p>
    </div>
  {:else if filteredContacts.length === 0}
    <div class="text-center py-8">
      <p class="text-gray-500 text-lg">
        {searchTerm
          ? "No contacts found matching your search."
          : "No contacts yet. Add your first contact!"}
      </p>
    </div>
  {:else}
    <!-- Contacts List -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each filteredContacts as contact, index (contact.id || `contact-${index}`)}
        <div
          class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          transition:fly={{ y: 20, duration: 300, easing: quintOut }}
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {contact.name}
              </h3>
              <p class="text-blue-600 font-medium">{contact.phone}</p>
            </div>
            <div class="flex gap-2">
              <button
                on:click={() => editContact(contact)}
                class="text-blue-600 hover:text-blue-800 p-1"
                title="Edit contact"
              >
                ✏️
              </button>
              <button
                on:click={() => deleteContact(contact.id)}
                class="text-red-600 hover:text-red-800 p-1"
                title="Delete contact"
              >
                🗑️
              </button>
            </div>
          </div>

          {#if contact.email}
            <p class="text-gray-600 mb-2">
              <span class="font-medium">Email:</span>
              {contact.email}
            </p>
          {/if}

          {#if contact.company}
            <p class="text-gray-600 mb-2">
              <span class="font-medium">Company:</span>
              {contact.company}
            </p>
          {/if}

          {#if contact.notes}
            <p class="text-gray-600 mb-2">
              <span class="font-medium">Notes:</span>
              {contact.notes}
            </p>
          {/if}

          {#if contact.label}
            <p class="text-gray-600 mb-2">
              <span class="font-medium">Label:</span>
              <span
                class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {contact.label}
              </span>
            </p>
          {/if}

          {#if contact.assignedTo}
            <p class="text-gray-600 mb-2">
              <span class="font-medium">Assigned To:</span>
              {contact.assignedTo}
            </p>
          {/if}

          <div class="text-xs text-gray-400 mt-4">
            Created: {new Date(contact.createdAt).toLocaleDateString()}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Add/Edit Contact Modal -->
  {#if showAddForm || showEditForm}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      transition:fade
    >
      <div
        class="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
        transition:fly={{ y: 20, duration: 300 }}
      >
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-900">
            {showAddForm ? "Add New Contact" : "Edit Contact"}
          </h2>
          <button
            on:click={closeForms}
            class="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form
          on:submit|preventDefault={showAddForm ? createContact : updateContact}
          class="space-y-4"
        >
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 mb-1">Name *</label
            >
            <input
              id="name"
              type="text"
              bind:value={formData.name}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              for="phone"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Phone *</label
            >
            <input
              id="phone"
              type="tel"
              bind:value={formData.phone}
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-1">Email</label
            >
            <input
              id="email"
              type="email"
              bind:value={formData.email}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              for="company"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Company</label
            >
            <input
              id="company"
              type="text"
              bind:value={formData.company}
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              for="notes"
              class="block text-sm font-medium text-gray-700 mb-1">Notes</label
            >
            <textarea
              id="notes"
              bind:value={formData.notes}
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            ></textarea>
          </div>

          <div>
            <label
              for="label"
              class="block text-sm font-medium text-gray-700 mb-1">Label</label
            >
            <input
              id="label"
              type="text"
              bind:value={formData.label}
              placeholder="e.g., VIP, Customer, Lead"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              for="assignedTo"
              class="block text-sm font-medium text-gray-700 mb-1"
              >Assigned To</label
            >
            <input
              id="assignedTo"
              type="text"
              bind:value={formData.assignedTo}
              placeholder="e.g., John Doe, Sales Team"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="submit"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors"
            >
              {showAddForm ? "Create Contact" : "Update Contact"}
            </button>
            <button
              type="button"
              on:click={closeForms}
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
