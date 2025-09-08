<script lang="ts">
  import "../app.css";
  import { page } from "$app/stores";
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <h1 class="text-xl font-semibold text-gray-900">
            WhatsApp Chat Portal
          </h1>
        </div>
        <nav class="flex space-x-8">
          <a
            href="/"
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium {$page
              .url.pathname === '/'
              ? 'text-blue-600'
              : ''}"
          >
            Dashboard
          </a>
          <a
            href="/chat"
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium {$page
              .url.pathname === '/chat'
              ? 'text-blue-600'
              : ''}"
          >
            Chat
          </a>
          <a
            href="/groups"
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium {$page
              .url.pathname === '/groups'
              ? 'text-blue-600'
              : ''}"
          >
            Groups
          </a>
          <a
            href="/contacts"
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium {$page
              .url.pathname === '/contacts'
              ? 'text-blue-600'
              : ''}"
          >
            Contacts
          </a>
          <a
            href="/database"
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium {$page
              .url.pathname === '/database'
              ? 'text-blue-600'
              : ''}"
          >
            Database
          </a>
          <a
            href="/settings"
            class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium {$page
              .url.pathname === '/settings'
              ? 'text-blue-600'
              : ''}"
          >
            Settings
          </a>
        </nav>
      </div>
    </div>
  </header>

  <main class="h-[calc(100vh-4rem)]">
    <slot />
  </main>
</div>
