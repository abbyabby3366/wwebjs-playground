import { P as head, O as ensure_array_like, K as escape_html, B as pop, z as push } from "../../../chunks/index2.js";
function _page($$payload, $$props) {
  push();
  let groups = [];
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Groups - WhatsApp Chat Portal</title>`;
  });
  $$payload.out.push(`<div class="container mx-auto p-6 max-w-6xl"><div class="flex justify-between items-center mb-6"><div><h1 class="text-3xl font-bold text-gray-900">WhatsApp Groups</h1> <p class="text-gray-600">Create and manage your WhatsApp groups</p></div> <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create New Group</button></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`);
  {
    $$payload.out.push("<!--[!-->");
    if (groups.length === 0) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="col-span-full text-center py-10"><div class="text-4xl mb-3">👥</div> <h3 class="text-lg font-medium mb-2">No groups yet</h3> <p class="text-sm mb-4 text-gray-500">Create your first WhatsApp group to get started</p> <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Create First Group</button></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      const each_array = ensure_array_like(groups);
      $$payload.out.push(`<!--[-->`);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let group = each_array[$$index];
        $$payload.out.push(`<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-semibold">${escape_html(group.name || group.title)}</h3> <span class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span></div> <div class="flex items-center justify-between text-sm text-gray-500 mb-4"><span>${escape_html(group.participantsCount || 0)} participants</span> <span>ID: ${escape_html(group.id)}</span></div> <div class="mt-4 flex space-x-2"><button class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">Open Chat</button> <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Manage</button></div></div>`);
      }
      $$payload.out.push(`<!--]-->`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
export {
  _page as default
};
