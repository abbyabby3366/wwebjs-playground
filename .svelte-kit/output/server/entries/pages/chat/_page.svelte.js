import { c as create_ssr_component, o as onDestroy, d as each, f as add_attribute, e as escape } from "../../../chunks/ssr.js";
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let selectedContact = null;
  let contacts = [];
  let messageContainer;
  onDestroy(() => {
  });
  return `${$$result.head += `<!-- HEAD_svelte-1psjp5c_START -->${$$result.title = `<title>Chat - WhatsApp Chat Portal</title>`, ""}<!-- HEAD_svelte-1psjp5c_END -->`, ""} <div class="chat-container h-full flex"> <div class="chat-sidebar"><div class="p-4 border-b border-gray-200"><div class="flex items-center justify-between mb-2"><h2 class="text-lg font-semibold text-gray-900" data-svelte-h="svelte-a2b3vl">Contacts</h2> <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Start new chat" data-svelte-h="svelte-1kpkppf"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button></div> <p class="text-sm text-gray-600" data-svelte-h="svelte-1opxl64">Manage customer conversations</p></div> <div class="overflow-y-auto flex-1">${`${contacts.length === 0 ? `<div class="p-6 text-center text-gray-500"><div class="text-4xl mb-3" data-svelte-h="svelte-27es5x">💬</div> <h3 class="text-lg font-medium mb-2" data-svelte-h="svelte-14l1dx6">No conversations yet</h3> <p class="text-sm mb-4" data-svelte-h="svelte-1yemxyp">Start chatting with your customers</p> <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm" data-svelte-h="svelte-1h3tv8x">Start New Chat</button></div>` : `${each(contacts, (contact) => {
    return `<div class="${"p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors " + escape(
      selectedContact?.id === contact.id ? "bg-blue-50 border-l-4 border-l-blue-500" : "",
      true
    )}"><div class="flex items-center space-x-3"><div class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">${escape(contact.avatar)}</div> <div class="flex-1 min-w-0"><div class="flex items-center justify-between"><h3 class="text-sm font-medium text-gray-900 truncate">${escape(contact.name)}</h3> <div class="flex items-center space-x-1"><div class="${"w-2 h-2 rounded-full " + escape(
      contact.status === "online" ? "bg-green-500" : contact.status === "away" ? "bg-yellow-500" : "bg-gray-400",
      true
    )}"></div> <span class="text-xs text-gray-500">${escape(formatTime(/* @__PURE__ */ new Date()))}</span> </div></div> <p class="text-sm text-gray-600 truncate">${escape(contact.lastMessage)}</p> </div></div> </div>`;
  })}`}`}</div></div>  <div class="flex-1 flex flex-col"> ${``}  <div class="chat-messages"${add_attribute("this", messageContainer, 0)}>${`<div class="flex items-center justify-center h-full" data-svelte-h="svelte-14iv8ay"><div class="text-center text-gray-500"><div class="text-6xl mb-4">💬</div> <h3 class="text-lg font-medium mb-2">Select a contact to start chatting</h3> <p class="text-sm">Choose from the list on the left to begin a conversation</p></div></div>`}</div>  ${``}</div></div>  ${``}`;
});
export {
  Page as default
};
