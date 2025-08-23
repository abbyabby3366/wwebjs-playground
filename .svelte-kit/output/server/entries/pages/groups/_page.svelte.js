import { c as create_ssr_component, d as each, e as escape } from "../../../chunks/ssr.js";
function formatDate(date) {
  return date.toLocaleDateString();
}
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let groups = [];
  return `${$$result.head += `<!-- HEAD_svelte-iyqopi_START -->${$$result.title = `<title>Groups - WhatsApp Chat Portal</title>`, ""}<!-- HEAD_svelte-iyqopi_END -->`, ""} <div class="container mx-auto p-6 max-w-6xl"><div class="flex justify-between items-center mb-6"><div data-svelte-h="svelte-1xzqozg"><h1 class="text-3xl font-bold text-gray-900">WhatsApp Groups</h1> <p class="text-gray-600">Create and manage your WhatsApp groups</p></div> <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" data-svelte-h="svelte-14mzxem">Create New Group</button></div>  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${each(groups, (group) => {
    return `<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-semibold">${escape(group.title)}</h3> <span class="${"px-2 py-1 text-xs rounded-full " + escape(
      group.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800",
      true
    )}">${escape(group.status)} </span></div> <p class="text-gray-600 text-sm mb-4">${escape(group.description)}</p> <div class="flex items-center justify-between text-sm text-gray-500"><span>${escape(group.participantCount)} participants</span> <span>Created ${escape(formatDate(group.createdAt))}</span></div> <div class="mt-4 flex space-x-2" data-svelte-h="svelte-1kudhqq"><button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">View Details</button> <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Manage</button></div> </div>`;
  })}</div>  ${``}</div>`;
});
export {
  Page as default
};
