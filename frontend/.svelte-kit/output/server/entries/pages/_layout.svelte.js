import { D as getContext, E as attr_class, F as stringify, G as store_get, I as slot, J as unsubscribe_stores, B as pop, z as push } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "clsx";
import "../../chunks/state.svelte.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _layout($$payload, $$props) {
  push();
  var $$store_subs;
  $$payload.out.push(`<div class="min-h-screen bg-gray-50"><header class="bg-white shadow-sm border-b border-gray-200"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center"><h1 class="text-xl font-semibold text-gray-900">WhatsApp Chat Portal</h1></div> <nav class="flex space-x-8"><a href="/"${attr_class(`text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/" ? "text-blue-600" : "")}`)}>Dashboard</a> <a href="/chat"${attr_class(`text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/chat" ? "text-blue-600" : "")}`)}>Chat</a> <a href="/groups"${attr_class(`text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/groups" ? "text-blue-600" : "")}`)}>Groups</a> <a href="/contacts"${attr_class(`text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/contacts" ? "text-blue-600" : "")}`)}>Contacts</a> <a href="/database"${attr_class(`text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/database" ? "text-blue-600" : "")}`)}>Database</a> <a href="/settings"${attr_class(`text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/settings" ? "text-blue-600" : "")}`)}>Settings</a></nav></div></div></header> <main class="h-[calc(100vh-4rem)]"><!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----></main></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _layout as default
};
