<script lang="ts">
  import { onMount } from "svelte";

  let messages = [];
  let searchQuery = "";
  let searchDirection = "";
  let searchType = "";
  let searchLimit = 50;
  let loading = false;

  onMount(() => {
    searchMessages();
  });

  async function searchMessages() {
    loading = true;
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchDirection) params.append("direction", searchDirection);
      if (searchType) params.append("type", searchType);
      if (searchQuery) params.append("search", searchQuery);
      if (searchLimit) params.append("limit", searchLimit.toString());

      const response = await fetch(
        `/api/mongodb/messages/search?${params.toString()}`,
      );
      const data = await response.json();

      if (data.success && data.messages) {
        // Transform messages to match frontend format
        messages = data.messages.map((msg) => {
          // Check if this is a group message
          const isGroupMessage =
            msg.metadata?.isGroup ||
            (msg.to && msg.to.includes("@g.us")) ||
            (msg.from && msg.from.includes("@g.us"));

          return {
            id: msg._id?.toString() || msg.id || Date.now().toString(),
            direction: msg.direction || (msg.fromMe ? "sent" : "received"),
            type: msg.type || "text",
            content: msg.body || msg.content || "",
            from: msg.from || "",
            to: msg.to || "",
            timestamp: new Date(msg.timestamp || msg.createdAt),
            status: msg.status || "delivered",
            contact: msg.fromMe ? msg.to : msg.from,
            // Include realPhoneNumber for easy access
            realPhoneNumber: msg.metadata?.realPhoneNumber || msg.from,
            // NEW: Include message type for better identification
            isGroup: isGroupMessage,
            messageType: isGroupMessage ? "Group" : "Individual",
          };
        });
      } else {
        messages = [];
        console.error("Failed to load messages:", data.error);
      }
    } catch (error) {
      console.error("Error searching messages:", error);
      messages = [];
    } finally {
      loading = false;
    }
  }

  function exportResults() {
    if (messages.length === 0) {
      alert("No messages to export. Please search for messages first.");
      return;
    }

    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "messages-export.json";
    link.click();
  }

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
</script>

<svelte:head>
  <title>Database - WhatsApp Chat Portal</title>
</svelte:head>

<div class="container mx-auto p-6 max-w-6xl">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Message Database</h1>
    <p class="text-gray-600">Search and analyze your message history</p>
  </div>

  <!-- Search Filters -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 class="text-lg font-semibold mb-4">Search Messages</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Direction</label
        >
        <select
          bind:value={searchDirection}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All</option>
          <option value="sent">Sent</option>
          <option value="received">Received</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <select
          bind:value={searchType}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All</option>
          <option value="text">Text</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="document">Document</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Search Text</label
        >
        <input
          bind:value={searchQuery}
          placeholder="Search in content..."
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Limit</label
        >
        <input
          type="number"
          bind:value={searchLimit}
          min="1"
          max="1000"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div class="flex justify-between items-center mt-4">
      <button
        on:click={searchMessages}
        disabled={loading}
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Searching..." : "Search Messages"}
      </button>

      <div class="flex space-x-2">
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          on:click={() => {
            searchDirection = "";
            searchType = "";
            searchQuery = "";
            searchLimit = 50;
            searchMessages();
          }}
        >
          Clear Filters
        </button>
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          on:click={exportResults}
          disabled={messages.length === 0}
        >
          Export Results
        </button>
      </div>
    </div>
  </div>

  <!-- Statistics -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-center">
        <div class="text-2xl font-bold text-blue-600">{messages.length}</div>
        <div class="text-sm text-gray-600">Total Messages</div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600">
          {messages.filter((m) => m.direction === "received").length}
        </div>
        <div class="text-sm text-gray-600">Received</div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-center">
        <div class="text-2xl font-bold text-purple-600">
          {messages.filter((m) => m.direction === "sent").length}
        </div>
        <div class="text-sm text-gray-600">Sent</div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="text-center">
        <div class="text-2xl font-bold text-orange-600">
          {new Set(messages.map((m) => m.from)).size}
        </div>
        <div class="text-sm text-gray-600">Unique Contacts</div>
      </div>
    </div>
  </div>

  <!-- Messages List -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold">Search Results</h3>
      <span class="text-sm text-gray-600">{messages.length} messages found</span
      >
    </div>
    {#if messages.length === 0}
      <div class="text-center py-8 text-gray-500">
        No messages found. Try adjusting your search criteria.
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Direction</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Type</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Message Type</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Content</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >From</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Sender Phone</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >To</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Timestamp</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Status</th
              >
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each messages as message}
              <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="flex items-center space-x-2">
                    <span>{getDirectionIcon(message.direction)}</span>
                    <span class="capitalize">{message.direction}</span>
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="capitalize">{message.type}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs rounded-full {message.isGroup
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'}"
                  >
                    {message.messageType}
                  </span>
                </td>
                <td class="px-6 py-4 max-w-xs truncate">{message.content}</td>
                <td class="px-6 py-4 whitespace-nowrap">{message.from}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900 font-mono">
                    {message.realPhoneNumber || "N/A"}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">{message.to}</td>
                <td class="px-6 py-4 whitespace-nowrap"
                  >{formatDate(message.timestamp)}</td
                >
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 text-xs rounded-full {getStatusColor(
                      message.status,
                    )}"
                  >
                    {message.status}
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
