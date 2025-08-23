import { c as create_ssr_component, b as subscribe, e as escape } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_page();
  return `<div class="min-h-screen bg-gray-50"> <header class="bg-white shadow-sm border-b border-gray-200"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center" data-svelte-h="svelte-kh26ic"><h1 class="text-xl font-semibold text-gray-900">WhatsApp Chat Portal</h1></div> <nav class="flex space-x-8"><a href="/" class="${"text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium " + escape($page.url.pathname === "/" ? "text-blue-600" : "", true)}">Dashboard</a> <a href="/chat" class="${"text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium " + escape($page.url.pathname === "/chat" ? "text-blue-600" : "", true)}">Chat</a> <a href="/groups" class="${"text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium " + escape($page.url.pathname === "/groups" ? "text-blue-600" : "", true)}">Groups</a> <a href="/database" class="${"text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium " + escape(
    $page.url.pathname === "/database" ? "text-blue-600" : "",
    true
  )}">Database</a> <a href="/settings" class="${"text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium " + escape(
    $page.url.pathname === "/settings" ? "text-blue-600" : "",
    true
  )}">Settings</a></nav></div></div></header> <main class="h-[calc(100vh-4rem)]">${slots.default ? slots.default({}) : ``}</main></div>`;
});
export {
  Layout as default
};
