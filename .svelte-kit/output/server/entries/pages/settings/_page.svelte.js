import { c as create_ssr_component, e as escape, f as add_attribute } from "../../../chunks/ssr.js";
function getStatusColor(status) {
  switch (status) {
    case "connected":
      return "bg-green-500";
    case "connecting":
      return "bg-yellow-500";
    case "disconnected":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}
function getStatusText(status) {
  switch (status) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting...";
    case "disconnected":
      return "Disconnected";
    default:
      return "Unknown";
  }
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let whatsappStatus = "disconnected";
  let settings = {
    autoReply: false,
    notifications: true,
    messageHistory: true
  };
  return `${$$result.head += `<!-- HEAD_svelte-9ojefd_START -->${$$result.title = `<title>Settings - WhatsApp Chat Portal</title>`, ""}<!-- HEAD_svelte-9ojefd_END -->`, ""} <div class="container mx-auto p-6 max-w-4xl"><div class="mb-6" data-svelte-h="svelte-93q9xy"><h1 class="text-3xl font-bold text-gray-900">Settings</h1> <p class="text-gray-600">Configure your WhatsApp connection and app preferences</p></div>  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"><h3 class="text-lg font-semibold mb-4" data-svelte-h="svelte-1tf9ord">WhatsApp Connection</h3> <div class="flex items-center justify-between mb-4"><div class="flex items-center space-x-3"><div class="${"w-3 h-3 rounded-full " + escape(getStatusColor(whatsappStatus), true)}"></div> <span class="text-sm font-medium">${escape(getStatusText(whatsappStatus))}</span></div> <div class="flex space-x-2">${`<button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" data-svelte-h="svelte-10l0qir">Connect WhatsApp</button>`}</div></div> ${``}</div>  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"><h3 class="text-lg font-semibold mb-4" data-svelte-h="svelte-15nf5ou">App Preferences</h3> <div class="space-y-6"><div class="flex items-center justify-between"><div data-svelte-h="svelte-ir207d"><h4 class="text-sm font-medium text-gray-700">Auto Reply</h4> <p class="text-xs text-gray-500">Automatically reply to incoming messages</p></div> <label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" class="sr-only peer"${add_attribute("checked", settings.autoReply, 1)}> <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label></div> <div class="flex items-center justify-between"><div data-svelte-h="svelte-ek7uf0"><h4 class="text-sm font-medium text-gray-700">Notifications</h4> <p class="text-xs text-gray-500">Show desktop notifications for new messages</p></div> <label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" class="sr-only peer"${add_attribute("checked", settings.notifications, 1)}> <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label></div> <div class="flex items-center justify-between"><div data-svelte-h="svelte-6kbr07"><h4 class="text-sm font-medium text-gray-700">Message History</h4> <p class="text-xs text-gray-500">Store message history in database</p></div> <label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" class="sr-only peer"${add_attribute("checked", settings.messageHistory, 1)}> <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div></label></div> <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1" data-svelte-h="svelte-1e8x0e4">Theme</label> <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="light" data-svelte-h="svelte-yop7ea">Light</option><option value="dark" data-svelte-h="svelte-6c4gk6">Dark</option><option value="auto" data-svelte-h="svelte-13uzty">Auto</option></select></div> <div><label class="block text-sm font-medium text-gray-700 mb-1" data-svelte-h="svelte-a2nutz">Language</label> <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"><option value="en" data-svelte-h="svelte-1bjraht">English</option><option value="es" data-svelte-h="svelte-36revo">Spanish</option><option value="fr" data-svelte-h="svelte-1mzqoq2">French</option><option value="de" data-svelte-h="svelte-hpaull">German</option></select></div></div></div> <div class="flex justify-end space-x-3 mt-6"><button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200" data-svelte-h="svelte-kpeqnw">Reset to Default</button> <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" data-svelte-h="svelte-1ppmayn">Save Settings</button></div></div>  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-svelte-h="svelte-12pzo1w"><h3 class="text-lg font-semibold mb-4">Advanced Settings</h3> <div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Database URL</label> <input value="mongodb://localhost:27017/whatsapp" readonly class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"> <p class="text-xs text-gray-500 mt-1">MongoDB connection string</p></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">API Endpoint</label> <input value="http://localhost:3000/api" readonly class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"> <p class="text-xs text-gray-500 mt-1">Backend API endpoint</p></div> <div class="flex justify-end"><button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Test Connection</button></div></div></div></div>`;
});
export {
  Page as default
};
