<script lang="ts">
  import { onMount } from "svelte";

  let whatsappStatus = "disconnected";
  let qrCode = "";
  let showQR = false;
  let settings = {
    autoReply: false,
    notifications: true,
    messageHistory: true,
    theme: "light",
    language: "en",
  };

  onMount(async () => {
    // Try to connect to Socket.IO for WhatsApp status
    try {
      const { io } = await import("socket.io-client");
      const socket = io();

      socket.on("whatsapp_status", (data) => {
        whatsappStatus = data.status;
        if (data.qr) {
          qrCode = data.qr;
          showQR = true;
        }
      });

      socket.on("connect", () => {
        console.log("Connected to server");
      });
    } catch (error) {
      console.log("Socket.IO not available, running in demo mode");
    }
  });

  async function startWhatsApp() {
    // Emit start event to server
    try {
      const { io } = await import("socket.io-client");
      const socket = io();
      socket.emit("start_whatsapp");
    } catch (error) {
      console.log("Socket.IO not available");
    }
  }

  async function disconnectWhatsApp() {
    // Emit disconnect event to server
    try {
      const { io } = await import("socket.io-client");
      const socket = io();
      socket.emit("disconnect_whatsapp");
    } catch (error) {
      console.log("Socket.IO not available");
    }
    whatsappStatus = "disconnected";
    showQR = false;
  }

  function saveSettings() {
    // Save settings to localStorage or API
    localStorage.setItem("whatsapp-settings", JSON.stringify(settings));
    // Show success message
    alert("Settings saved successfully!");
  }

  function resetSettings() {
    settings = {
      autoReply: false,
      notifications: true,
      messageHistory: true,
      theme: "light",
      language: "en",
    };
  }

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
</script>

<svelte:head>
  <title>Settings - WhatsApp Chat Portal</title>
</svelte:head>

<div class="container mx-auto p-6 max-w-4xl">
  <div class="mb-6">
    <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
    <p class="text-gray-600">
      Configure your WhatsApp connection and app preferences
    </p>
  </div>

  <!-- WhatsApp Connection Status -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 class="text-lg font-semibold mb-4">WhatsApp Connection</h3>
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <div
          class="w-3 h-3 rounded-full {getStatusColor(whatsappStatus)}"
        ></div>
        <span class="text-sm font-medium">{getStatusText(whatsappStatus)}</span>
      </div>

      <div class="flex space-x-2">
        {#if whatsappStatus === "disconnected"}
          <button
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            on:click={startWhatsApp}
          >
            Connect WhatsApp
          </button>
        {:else}
          <button
            class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            on:click={disconnectWhatsApp}
          >
            Disconnect
          </button>
        {/if}
      </div>
    </div>

    {#if showQR && qrCode}
      <div class="text-center p-4 border border-gray-200 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Scan QR Code</h4>
        <img src={qrCode} alt="WhatsApp QR Code" class="mx-auto mb-2" />
        <p class="text-xs text-gray-600">
          Open WhatsApp on your phone and scan this code
        </p>
      </div>
    {/if}
  </div>

  <!-- App Settings -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 class="text-lg font-semibold mb-4">App Preferences</h3>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-700">Auto Reply</h4>
          <p class="text-xs text-gray-500">
            Automatically reply to incoming messages
          </p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            bind:checked={settings.autoReply}
            class="sr-only peer"
          />
          <div
            class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
          ></div>
        </label>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-700">Notifications</h4>
          <p class="text-xs text-gray-500">
            Show desktop notifications for new messages
          </p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            bind:checked={settings.notifications}
            class="sr-only peer"
          />
          <div
            class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
          ></div>
        </label>
      </div>

      <div class="flex items-center justify-between">
        <div>
          <h4 class="text-sm font-medium text-gray-700">Message History</h4>
          <p class="text-xs text-gray-500">Store message history in database</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            bind:checked={settings.messageHistory}
            class="sr-only peer"
          />
          <div
            class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
          ></div>
        </label>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Theme</label
          >
          <select
            bind:value={settings.theme}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Language</label
          >
          <select
            bind:value={settings.language}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    </div>

    <div class="flex justify-end space-x-3 mt-6">
      <button
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        on:click={resetSettings}
      >
        Reset to Default
      </button>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        on:click={saveSettings}
      >
        Save Settings
      </button>
    </div>
  </div>

  <!-- Advanced Settings -->
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h3 class="text-lg font-semibold mb-4">Advanced Settings</h3>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Database URL</label
        >
        <input
          value="mongodb://localhost:27017/whatsapp"
          readonly
          class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
        <p class="text-xs text-gray-500 mt-1">MongoDB connection string</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >API Endpoint</label
        >
        <input
          value="http://localhost:3000/api"
          readonly
          class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
        />
        <p class="text-xs text-gray-500 mt-1">Backend API endpoint</p>
      </div>

      <div class="flex justify-end">
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
        >
          Test Connection
        </button>
      </div>
    </div>
  </div>
</div>
