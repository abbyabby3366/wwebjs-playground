import { O as ensure_array_like, P as head, E as attr_class, K as escape_html, F as stringify, B as pop, z as push } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "clsx";
import "../../chunks/state.svelte.js";
function _page($$payload, $$props) {
  push();
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
  const each_array = ensure_array_like(quickActions);
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Dashboard - WhatsApp Chat Portal</title>`;
  });
  $$payload.out.push(`<div class="container mx-auto p-6 max-w-6xl"><div class="mb-8"><h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome to WhatsApp Chat Portal</h1> <p class="text-gray-600">Manage your customer conversations and WhatsApp groups efficiently</p></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let action = each_array[$$index];
    $$payload.out.push(`<div class="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow p-6"><div class="flex items-center space-x-3"><div${attr_class(`w-12 h-12 rounded-lg ${stringify(action.color)} flex items-center justify-center text-2xl`)}>${escape_html(action.icon)}</div> <div><h3 class="text-lg font-semibold">${escape_html(action.title)}</h3> <p class="text-sm text-gray-600">${escape_html(action.description)}</p></div></div></div>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><h3 class="text-lg font-semibold mb-4">WhatsApp Status</h3> <div class="flex items-center space-x-2"><div class="w-3 h-3 bg-green-500 rounded-full"></div> <span class="text-sm text-gray-600">Connected</span></div></div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><h3 class="text-lg font-semibold mb-4">Active Chats</h3> <span class="text-2xl font-bold text-blue-600">12</span> <p class="text-sm text-gray-600">Ongoing conversations</p></div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><h3 class="text-lg font-semibold mb-4">Total Groups</h3> <span class="text-2xl font-bold text-green-600">8</span> <p class="text-sm text-gray-600">WhatsApp groups</p></div></div></div>`);
  pop();
}
export {
  _page as default
};
