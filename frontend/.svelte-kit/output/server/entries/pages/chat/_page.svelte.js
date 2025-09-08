import { Q as current_component, P as head, R as attr, K as escape_html, O as ensure_array_like, E as attr_class, F as stringify, B as pop, z as push } from "../../../chunks/index2.js";
function onDestroy(fn) {
  var context = (
    /** @type {Component} */
    current_component
  );
  (context.d ??= []).push(fn);
}
function _page($$payload, $$props) {
  push();
  let selectedContact = null;
  let contacts = [];
  let loading = false;
  onDestroy(() => {
  });
  function formatTime(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Chat - WhatsApp Chat Portal</title>`;
  });
  $$payload.out.push(`<div class="chat-container h-full flex bg-gray-50"><div class="w-80 border-r border-gray-200 flex flex-col flex-shrink-0 bg-white shadow-sm"><div class="p-4 border-b border-gray-200"><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold text-gray-900">Contacts</h2> <div class="flex space-x-2"><button class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Manage contacts"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></button> <button class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Create new group"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></button> <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Start new chat"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button></div></div> <p class="text-sm text-gray-600 mb-2">Manage customer conversations and groups</p> <div class="flex space-x-2"><button class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">New Chat</button> <button class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"${attr("disabled", loading, true)}>${escape_html("🔄 Refresh Groups")}</button> <button class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors">👤 Refresh Contact Names</button></div></div> <div class="overflow-y-auto flex-1">`);
  {
    $$payload.out.push("<!--[!-->");
    if (contacts.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="p-6 text-center text-gray-500"><div class="text-4xl mb-3">💬</div> <h3 class="text-lg font-medium mb-2">No conversations yet</h3> <p class="text-sm mb-4">Start chatting with your customers</p> <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Start New Chat</button></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      const each_array = ensure_array_like(contacts);
      $$payload.out.push(`<!--[-->`);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let contact = each_array[$$index];
        $$payload.out.push(`<div${attr_class(`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${stringify(selectedContact?.id === contact.id ? "bg-blue-50 border-l-4 border-l-blue-500" : "")}`)}><div class="flex items-center space-x-3"><div${attr_class(`w-10 h-10 ${stringify(contact.type === "group" ? "bg-green-300" : "bg-gray-300")} rounded-full flex items-center justify-center text-sm font-medium ${stringify(contact.type === "group" ? "text-green-700" : "text-gray-700")}`)}>${escape_html(contact.avatar)}</div> <div class="flex-1 min-w-0"><div class="flex items-center justify-between"><h3 class="text-sm font-medium text-gray-900 truncate">${escape_html(contact.name)} `);
        if (contact.type === "group") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<span class="ml-2 text-xs text-green-600">👥</span>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></h3> <div class="flex items-center space-x-1"><div${attr_class(`w-2 h-2 rounded-full ${stringify(contact.status === "online" ? "bg-green-500" : contact.status === "away" ? "bg-yellow-500" : "bg-gray-400")}`)}></div> `);
        if (contact.lastMessageTime && contact.messageCount > 0 && contact.lastMessage !== "Start a new conversation") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<span class="text-xs text-gray-500">${escape_html(formatTime(contact.lastMessageTime))}</span>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></div></div> <p class="text-sm text-gray-600 truncate">`);
        if (contact.type === "group") {
          $$payload.out.push("<!--[-->");
          if (contact.participantNames && contact.participantNames.length > 0) {
            $$payload.out.push("<!--[-->");
            $$payload.out.push(`${escape_html(contact.participantNames.slice(0, 2).join(", "))} `);
            if (contact.participantNames.length > 2) {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`+${escape_html(contact.participantNames.length - 2)} more`);
            } else {
              $$payload.out.push("<!--[!-->");
            }
            $$payload.out.push(`<!--]-->`);
          } else {
            $$payload.out.push("<!--[!-->");
            $$payload.out.push(`${escape_html(contact.participantsCount || 0)} participants`);
          }
          $$payload.out.push(`<!--]-->`);
        } else {
          $$payload.out.push("<!--[!-->");
          $$payload.out.push(`${escape_html(contact.lastMessage)}`);
        }
        $$payload.out.push(`<!--]--></p></div></div></div>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></div> <div class="flex-1 flex flex-col border-r border-gray-200 min-w-0 bg-white shadow-sm">`);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div class="chat-messages">`);
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="flex items-center justify-center h-full"><div class="text-center text-gray-500"><div class="text-6xl mb-4">💬</div> <h3 class="text-lg font-medium mb-2">Select a contact to start chatting</h3> <p class="text-sm">Choose from the list on the left to begin a conversation</p></div></div>`);
  }
  $$payload.out.push(`<!--]--></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> <div${attr_class(`w-80 bg-gray-50 flex-shrink-0 ${stringify("hidden")} lg:block shadow-sm`)}>`);
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="flex items-center justify-center h-full"><div class="text-center text-gray-500"><div class="text-4xl mb-3">ℹ️</div> <h3 class="text-lg font-medium mb-2">Contact Information</h3> <p class="text-sm">Select a contact to view details</p></div></div>`);
  }
  $$payload.out.push(`<!--]--></div></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
export {
  _page as default
};
