import { P as head, S as maybe_selected, R as attr, K as escape_html, O as ensure_array_like, E as attr_class, F as stringify, B as pop, z as push } from "../../../chunks/index2.js";
function _page($$payload, $$props) {
  push();
  let messages = [];
  let searchQuery = "";
  let searchDirection = "";
  let searchType = "";
  let searchLimit = 50;
  let loading = false;
  function formatDate(date) {
    return date.toLocaleString();
  }
  function getStatusColor(status) {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
  function getDirectionIcon(direction) {
    return direction === "sent" ? "📤" : "📥";
  }
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Database - WhatsApp Chat Portal</title>`;
  });
  $$payload.out.push(`<div class="container mx-auto p-6 max-w-6xl"><div class="mb-6"><h1 class="text-3xl font-bold text-gray-900">Message Database</h1> <p class="text-gray-600">Search and analyze your message history</p></div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6"><h3 class="text-lg font-semibold mb-4">Search Messages</h3> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">Direction</label> <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">`);
  $$payload.select_value = searchDirection;
  $$payload.out.push(`<option value=""${maybe_selected($$payload, "")}>All</option><option value="sent"${maybe_selected($$payload, "sent")}>Sent</option><option value="received"${maybe_selected($$payload, "received")}>Received</option>`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">Type</label> <select class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">`);
  $$payload.select_value = searchType;
  $$payload.out.push(`<option value=""${maybe_selected($$payload, "")}>All</option><option value="text"${maybe_selected($$payload, "text")}>Text</option><option value="image"${maybe_selected($$payload, "image")}>Image</option><option value="video"${maybe_selected($$payload, "video")}>Video</option><option value="audio"${maybe_selected($$payload, "audio")}>Audio</option><option value="document"${maybe_selected($$payload, "document")}>Document</option>`);
  $$payload.select_value = void 0;
  $$payload.out.push(`</select></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">Search Text</label> <input${attr("value", searchQuery)} placeholder="Search in content..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div> <div><label class="block text-sm font-medium text-gray-700 mb-1">Limit</label> <input type="number"${attr("value", searchLimit)} min="1" max="1000" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/></div></div> <div class="flex justify-between items-center mt-4"><button${attr("disabled", loading, true)} class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">${escape_html("Search Messages")}</button> <div class="flex space-x-2"><button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Clear Filters</button> <button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"${attr("disabled", messages.length === 0, true)}>Export Results</button></div></div></div> <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"><div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div class="text-center"><div class="text-2xl font-bold text-blue-600">${escape_html(messages.length)}</div> <div class="text-sm text-gray-600">Total Messages</div></div></div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div class="text-center"><div class="text-2xl font-bold text-green-600">${escape_html(messages.filter((m) => m.direction === "received").length)}</div> <div class="text-sm text-gray-600">Received</div></div></div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div class="text-center"><div class="text-2xl font-bold text-purple-600">${escape_html(messages.filter((m) => m.direction === "sent").length)}</div> <div class="text-sm text-gray-600">Sent</div></div></div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div class="text-center"><div class="text-2xl font-bold text-orange-600">${escape_html(new Set(messages.map((m) => m.from)).size)}</div> <div class="text-sm text-gray-600">Unique Contacts</div></div></div></div> <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"><div class="flex justify-between items-center mb-4"><h3 class="text-lg font-semibold">Search Results</h3> <span class="text-sm text-gray-600">${escape_html(messages.length)} messages found</span></div> `);
  if (messages.length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-8 text-gray-500">No messages found. Try adjusting your search criteria.</div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    const each_array = ensure_array_like(messages);
    $$payload.out.push(`<div class="overflow-x-auto"><table class="w-full"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Direction</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message Type</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender Phone</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th></tr></thead><tbody class="bg-white divide-y divide-gray-200"><!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let message = each_array[$$index];
      $$payload.out.push(`<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap"><span class="flex items-center space-x-2"><span>${escape_html(getDirectionIcon(message.direction))}</span> <span class="capitalize">${escape_html(message.direction)}</span></span></td><td class="px-6 py-4 whitespace-nowrap"><span class="capitalize">${escape_html(message.type)}</span></td><td class="px-6 py-4 whitespace-nowrap"><span${attr_class(`px-2 py-1 text-xs rounded-full ${stringify(message.isGroup ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800")}`)}>${escape_html(message.messageType)}</span></td><td class="px-6 py-4 max-w-xs truncate">${escape_html(message.content)}</td><td class="px-6 py-4 whitespace-nowrap">${escape_html(message.from)}</td><td class="px-6 py-4 whitespace-nowrap"><span class="text-sm text-gray-900 font-mono">${escape_html(message.realPhoneNumber || "N/A")}</span></td><td class="px-6 py-4 whitespace-nowrap">${escape_html(message.to)}</td><td class="px-6 py-4 whitespace-nowrap">${escape_html(formatDate(message.timestamp))}</td><td class="px-6 py-4 whitespace-nowrap"><span${attr_class(`px-2 py-1 text-xs rounded-full ${stringify(getStatusColor(message.status))}`)}>${escape_html(message.status)}</span></td></tr>`);
    }
    $$payload.out.push(`<!--]--></tbody></table></div>`);
  }
  $$payload.out.push(`<!--]--></div></div>`);
  pop();
}
export {
  _page as default
};
