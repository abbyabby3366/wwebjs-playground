<script lang="ts">
  import { onMount } from "svelte";

  let groups = [];
  let loading = false;
  let showCreateModal = false;
  let newGroup = {
    title: "",
    participants: [""],
  };

  onMount(async () => {
    await loadGroups();
  });

  async function loadGroups() {
    loading = true;
    try {
      const response = await fetch("/api/whatsapp/groups");
      const data = await response.json();

      if (data.success) {
        groups = data.groups || [];
        console.log("Groups loaded:", groups);
      } else {
        console.error("Failed to load groups:", data.error);
        groups = [];
      }
    } catch (error) {
      console.error("Error loading groups:", error);
      groups = [];
    } finally {
      loading = false;
    }
  }

  function addParticipant() {
    newGroup.participants = [...newGroup.participants, ""];
  }

  function removeParticipant(index) {
    newGroup.participants = newGroup.participants.filter((_, i) => i !== index);
  }

  function updateParticipant(index, value) {
    newGroup.participants[index] = value;
    newGroup.participants = [...newGroup.participants];
  }

  async function createGroup() {
    if (!newGroup.title.trim()) return;

    const validParticipants = newGroup.participants
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (validParticipants.length === 0) {
      alert("Please add at least one participant");
      return;
    }

    try {
      const response = await fetch("/api/whatsapp/create-group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newGroup.title.trim(),
          participants: validParticipants,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Group created successfully:", result);

        // Refresh groups list
        await loadGroups();

        // Reset form
        newGroup = {
          title: "",
          participants: [""],
        };

        showCreateModal = false;

        // Show success message
        alert("Group created successfully!");
      } else {
        console.error("Failed to create group:", result.error);
        alert(`Failed to create group: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert(`Error creating group: ${error.message}`);
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString();
  }
</script>

<svelte:head>
  <title>Groups - WhatsApp Chat Portal</title>
</svelte:head>

<div class="container mx-auto p-6 max-w-6xl">
  <div class="flex justify-between items-center mb-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">WhatsApp Groups</h1>
      <p class="text-gray-600">Create and manage your WhatsApp groups</p>
    </div>
    <button
      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      on:click={() => (showCreateModal = true)}
    >
      Create New Group
    </button>
  </div>

  <!-- Groups Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#if loading}
      <div class="col-span-full text-center py-10">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"
        ></div>
        <p class="text-gray-500">Loading groups...</p>
      </div>
    {:else if groups.length === 0}
      <div class="col-span-full text-center py-10">
        <div class="text-4xl mb-3">👥</div>
        <h3 class="text-lg font-medium mb-2">No groups yet</h3>
        <p class="text-sm mb-4 text-gray-500">
          Create your first WhatsApp group to get started
        </p>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          on:click={() => (showCreateModal = true)}
        >
          Create First Group
        </button>
      </div>
    {:else}
      {#each groups as group}
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold">{group.name || group.title}</h3>
            <span
              class="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
            >
              Active
            </span>
          </div>
          <div
            class="flex items-center justify-between text-sm text-gray-500 mb-4"
          >
            <span>{group.participantsCount || 0} participants</span>
            <span>ID: {group.id}</span>
          </div>
          <div class="mt-4 flex space-x-2">
            <button
              class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
              on:click={() =>
                (window.location.href = `/chat?group=${group.id}`)}
            >
              Open Chat
            </button>
            <button
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Manage
            </button>
          </div>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Create Group Modal -->
  {#if showCreateModal}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Create New Group</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Group Title</label
            >
            <input
              bind:value={newGroup.title}
              placeholder="Enter group title"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Participants</label
            >
            {#each newGroup.participants as participant, index}
              <div class="flex space-x-2 mb-2">
                <input
                  bind:value={participant}
                  placeholder="Phone number"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  on:input={() => updateParticipant(index, participant)}
                />
                {#if newGroup.participants.length > 1}
                  <button
                    class="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                    on:click={() => removeParticipant(index)}
                  >
                    Remove
                  </button>
                {/if}
              </div>
            {/each}
            <button
              class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
              on:click={addParticipant}
            >
              + Add Participant
            </button>
          </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            on:click={() => (showCreateModal = false)}
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            on:click={createGroup}
            disabled={!newGroup.title.trim() ||
              newGroup.participants.length === 0}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
