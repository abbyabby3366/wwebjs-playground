import { c as create_ssr_component, d as each, e as escape } from "../../chunks/ssr.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "../../chunks/state.svelte.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const quickActions = [
    {
      title: "Start Chat",
      description: "Begin a new conversation with a customer",
      icon: "💬",
      route: "/chat",
      color: "bg-blue-500"
    },
    {
      title: "Create Group",
      description: "Set up a new WhatsApp group",
      icon: "👥",
      route: "/groups",
      color: "bg-green-500"
    },
    {
      title: "Database",
      description: "View message history and analytics",
      icon: "📊",
      route: "/database",
      color: "bg-purple-500"
    },
    {
      title: "Settings",
      description: "Configure WhatsApp and app settings",
      icon: "⚙️",
      route: "/settings",
      color: "bg-gray-500"
    }
  ];
  return `${$$result.head += `<!-- HEAD_svelte-1jb6704_START -->${$$result.title = `<title>Dashboard - WhatsApp Chat Portal</title>`, ""}<!-- HEAD_svelte-1jb6704_END -->`, ""} <div class="container mx-auto p-6 max-w-6xl"><div class="mb-8" data-svelte-h="svelte-1n06q5y"><h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to WhatsApp Chat Portal</h1> <p class="text-gray-600">Manage your customer conversations and WhatsApp groups efficiently</p></div>  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">${each(quickActions, (action) => {
    return `<div class="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow p-6"><div class="flex items-center space-x-3"><div class="${"w-12 h-12 rounded-lg " + escape(action.color, true) + " flex items-center justify-center text-2xl"}">${escape(action.icon)}</div> <div><h3 class="text-lg font-semibold">${escape(action.title)}</h3> <p class="text-sm text-gray-600">${escape(action.description)}</p> </div></div> </div>`;
  })}</div>  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6" data-svelte-h="svelte-lwmcjt"><div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><h3 class="text-lg font-semibold mb-4">WhatsApp Status</h3> <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-green-500 rounded-full"></div> <span class="text-sm text-gray-600">Connected</span></div></div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><h3 class="text-lg font-semibold mb-4">Active Chats</h3> <span class="text-2xl font-bold text-blue-600">12</span> <p class="text-sm text-gray-600">Ongoing conversations</p></div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><h3 class="text-lg font-semibold mb-4">Total Groups</h3> <span class="text-2xl font-bold text-green-600">8</span> <p class="text-sm text-gray-600">WhatsApp groups</p></div></div></div>`;
});
export {
  Page as default
};
