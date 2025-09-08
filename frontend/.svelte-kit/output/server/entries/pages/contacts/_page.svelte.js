import { P as head, R as attr, K as escape_html, O as ensure_array_like, B as pop, z as push } from "../../../chunks/index2.js";
function _page($$payload, $$props) {
  push();
  let contacts = [];
  let searchTerm = "";
  let filteredContacts = [];
  {
    if (searchTerm.trim() === "") {
      filteredContacts = contacts || [];
    } else {
      filteredContacts = (contacts || []).filter((contact) => contact && contact.id && (contact.name && contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || contact.phone && contact.phone.includes(searchTerm) || contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase()) || contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()) || contact.label && contact.label.toLowerCase().includes(searchTerm.toLowerCase()) || contact.assignedTo && contact.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())));
    }
  }
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Contacts - WhatsApp Chat Portal</title>`;
  });
  $$payload.out.push(`<div class="container mx-auto px-4 py-8"><div class="mb-8"><h1 class="text-3xl font-bold text-gray-900 mb-2">Contacts</h1> <p class="text-gray-600">Manage your internal contact list</p></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div class="flex flex-col sm:flex-row gap-4 mb-6"><div class="flex-1"><input type="text" placeholder="Search contacts..."${attr("value", searchTerm)} class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div> <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">Add Contact</button></div> `);
  {
    $$payload.out.push("<!--[!-->");
    if (filteredContacts.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="text-center py-8"><p class="text-gray-500 text-lg">${escape_html("No contacts yet. Add your first contact!")}</p></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      const each_array = ensure_array_like(filteredContacts);
      $$payload.out.push(`<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"><!--[-->`);
      for (let index = 0, $$length = each_array.length; index < $$length; index++) {
        let contact = each_array[index];
        $$payload.out.push(`<div class="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"><div class="flex justify-between items-start mb-4"><div><h3 class="text-lg font-semibold text-gray-900">${escape_html(contact.name)}</h3> <p class="text-blue-600 font-medium">${escape_html(contact.phone)}</p></div> <div class="flex gap-2"><button class="text-blue-600 hover:text-blue-800 p-1" title="Edit contact">✏️</button> <button class="text-red-600 hover:text-red-800 p-1" title="Delete contact">🗑️</button></div></div> `);
        if (contact.email) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<p class="text-gray-600 mb-2"><span class="font-medium">Email:</span> ${escape_html(contact.email)}</p>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--> `);
        if (contact.company) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<p class="text-gray-600 mb-2"><span class="font-medium">Company:</span> ${escape_html(contact.company)}</p>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--> `);
        if (contact.notes) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<p class="text-gray-600 mb-2"><span class="font-medium">Notes:</span> ${escape_html(contact.notes)}</p>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--> `);
        if (contact.label) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<p class="text-gray-600 mb-2"><span class="font-medium">Label:</span> <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">${escape_html(contact.label)}</span></p>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--> `);
        if (contact.assignedTo) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<p class="text-gray-600 mb-2"><span class="font-medium">Assigned To:</span> ${escape_html(contact.assignedTo)}</p>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--> <div class="text-xs text-gray-400 mt-4">Created: ${escape_html(new Date(contact.createdAt).toLocaleDateString())}</div></div>`);
      }
      $$payload.out.push(`<!--]--></div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
export {
  _page as default
};
