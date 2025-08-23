<script lang="ts">
  import { goto } from "$app/navigation";

  const quickActions = [
    {
      title: "Start Chat",
      description: "Begin a new conversation with a customer",
      icon: "💬",
      route: "/chat",
      color: "bg-blue-500",
    },
    {
      title: "Create Group",
      description: "Set up a new WhatsApp group",
      icon: "👥",
      route: "/groups",
      color: "bg-green-500",
    },
    {
      title: "Database",
      description: "View message history and analytics",
      icon: "📊",
      route: "/database",
      color: "bg-purple-500",
    },
    {
      title: "Settings",
      description: "Configure WhatsApp and app settings",
      icon: "⚙️",
      route: "/settings",
      color: "bg-gray-500",
    },
  ];

  function navigateTo(route) {
    goto(route);
  }
</script>

<svelte:head>
  <title>Dashboard - WhatsApp Chat Portal</title>
</svelte:head>

<div class="container mx-auto p-6 max-w-6xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">
      Welcome to WhatsApp Chat Portal
    </h1>
    <p class="text-gray-600">
      Manage your customer conversations and WhatsApp groups efficiently
    </p>
  </div>

  <!-- Quick Actions Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {#each quickActions as action}
      <div
        class="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow p-6"
        on:click={() => navigateTo(action.route)}
      >
        <div class="flex items-center space-x-3">
          <div
            class="w-12 h-12 rounded-lg {action.color} flex items-center justify-center text-2xl"
          >
            {action.icon}
          </div>
          <div>
            <h3 class="text-lg font-semibold">{action.title}</h3>
            <p class="text-sm text-gray-600">{action.description}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Status Overview -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">WhatsApp Status</h3>
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <span class="text-sm text-gray-600">Connected</span>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">Active Chats</h3>
      <span class="text-2xl font-bold text-blue-600">12</span>
      <p class="text-sm text-gray-600">Ongoing conversations</p>
    </div>

    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold mb-4">Total Groups</h3>
      <span class="text-2xl font-bold text-green-600">8</span>
      <p class="text-sm text-gray-600">WhatsApp groups</p>
    </div>
  </div>
</div>
