<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  let socket;
  let currentMessage = "";
  let selectedContact = null;
  let messages = [];
  let contacts = [];
  let messageContainer;
  let showNewChatModal = false;
  let newChatPhone = "";
  let newChatName = "";
  let loading = false;
  let showCreateGroupModal = false;
  let newGroup = {
    title: "",
    participants: [""],
  };
  let showContactManagerModal = false;

  // Contact management
  let contactsList = [];
  let showAddContactModal = false;
  let newContact = {
    name: "",
    phone: "",
    email: "",
    notes: "",
  };
  let editingContact = null;

  onMount(async () => {
    console.log("onMount started");

    // Load contacts list first for name resolution
    await loadContactsList();

    // Load real contacts from MongoDB first
    console.log("About to load contacts...");
    await loadContacts();
    console.log("Contacts loaded, count:", contacts.length);

    // Verify that groups were loaded
    const groupCount = contacts.filter((c) => c.type === "group").length;
    console.log(`Groups loaded: ${groupCount}`);

    try {
      const { io } = await import("socket.io-client");
      socket = io();

      socket.on("connect", () => {
        console.log("Connected to server");
      });

      socket.on("whatsapp_status", (data) => {
        console.log("WhatsApp status:", data);
      });

      // Listen for new messages in real-time
      socket.on("new_message", (newMessage) => {
        console.log("New message received via WebSocket:", newMessage);
        console.log("Current selected contact:", selectedContact);
        console.log("Message isGroup flag:", newMessage.isGroup);
        console.log("Message groupId:", newMessage.groupId);

        // Check if this message already exists to prevent duplicates
        // We check by content, timestamp, and direction to be more robust
        const messageExists = messages.some((msg) => {
          const sameContent = msg.content === newMessage.content;
          const sameDirection = msg.direction === newMessage.direction;
          const sameContact =
            selectedContact &&
            ((msg.direction === "sent" && msg.to === selectedContact.phone) ||
              (msg.direction === "received" &&
                msg.from === selectedContact.phone));

          // Check if it's the same message within a reasonable time window (5 seconds)
          const timeDiff = Math.abs(
            msg.timestamp.getTime() - new Date(newMessage.timestamp).getTime(),
          );
          const sameTime = timeDiff < 5000; // 5 seconds tolerance

          return sameContent && sameDirection && sameContact && sameTime;
        });

        if (messageExists) {
          console.log(
            "Message already exists, skipping duplicate:",
            newMessage,
          );
          return;
        }

        // Add the new message to the current chat if it's from the selected contact
        if (selectedContact) {
          const contactPhone = selectedContact.phone;
          const messageContact = newMessage.fromMe
            ? newMessage.to
            : newMessage.from;

          console.log("Processing new message for selected contact:", {
            selectedContact: {
              phone: contactPhone,
              type: selectedContact.type,
              name: selectedContact.name,
            },
            newMessage: {
              isGroup: newMessage.isGroup,
              from: newMessage.from,
              to: newMessage.to,
              groupId: newMessage.groupId,
              content: newMessage.content,
            },
          });

          // Check if this message belongs to the current chat/group
          let shouldAddMessage = false;

          if (selectedContact.type === "group") {
            // For groups, check if message is from/to this group
            const groupId = contactPhone.includes("@g.us")
              ? contactPhone
              : contactPhone.replace("group_", "");

            // Check if this is a group message and belongs to the selected group
            shouldAddMessage =
              newMessage.isGroup &&
              (newMessage.to === groupId || newMessage.groupId === groupId);

            console.log("Group message check:", {
              selectedGroup: groupId,
              messageTo: newMessage.to,
              messageGroupId: newMessage.groupId,
              isGroupMessage: newMessage.isGroup,
              shouldAdd: shouldAddMessage,
            });
          } else {
            // For individual chats, check if message is from/to this contact
            // Make sure it's NOT a group message
            shouldAddMessage =
              !newMessage.isGroup && messageContact === contactPhone;

            console.log("Individual message check:", {
              selectedContact: contactPhone,
              messageContact: messageContact,
              isGroupMessage: newMessage.isGroup,
              shouldAdd: shouldAddMessage,
            });
          }

          if (shouldAddMessage) {
            // Transform the message for display
            const transformedMessage = {
              id: newMessage.id,
              direction: newMessage.direction,
              type: newMessage.type,
              content: newMessage.content,
              from: newMessage.fromMe ? "You" : getContactName(newMessage.from),
              fromPhone: newMessage.realPhoneNumber || newMessage.from, // Use realPhoneNumber as primary, fallback to from
              to: newMessage.to,
              timestamp: new Date(newMessage.timestamp),
              status: newMessage.status,
              contact: newMessage.fromMe ? newMessage.to : newMessage.from,
              isGroup: selectedContact.type === "group",
              realPhoneNumber: newMessage.realPhoneNumber, // Primary phone number field
              groupParticipantPhone: newMessage.realPhoneNumber, // Use realPhoneNumber as primary
            };

            messages = [...messages, transformedMessage];
            scrollToBottom();
            console.log("Message added to current chat:", transformedMessage);
            console.log("Message type validation:", {
              selectedContactType: selectedContact.type,
              messageIsGroup: newMessage.isGroup,
              transformedMessageIsGroup: transformedMessage.isGroup,
            });
          } else {
            console.log("Message NOT added to current chat:", {
              reason: "Message doesn't belong to current contact/group",
              selectedContact: selectedContact?.name,
              selectedContactType: selectedContact?.type,
              messageIsGroup: newMessage.isGroup,
              messageContent: newMessage.content,
            });
          }
        }

        // Update contacts list with new message info
        updateContactWithNewMessage(newMessage);
      });

      socket.on("message_received", (data) => {
        console.log("Message received:", data);
      });

      socket.on("disconnect", () => {
        console.log("Disconnected from server");
      });
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }

    console.log("Checking if contacts exist for auto-selection...");
    if (contacts.length > 0) {
      console.log("Auto-selecting first contact:", contacts[0]);
      selectContact(contacts[0]);
    } else {
      console.log("No contacts available for auto-selection");
    }
    console.log("onMount completed");
  });

  async function startNewChat() {
    if (!newChatPhone.trim()) return;

    const newContact = {
      id: Date.now(),
      name: newChatName.trim() || newChatPhone,
      phone: newChatPhone.trim(),
      avatar: (newChatName.trim() || newChatPhone)
        .substring(0, 2)
        .toUpperCase(),
      status: "offline",
      lastMessage: "Start a new conversation",
      messageCount: 0,
    };

    contacts = [newContact, ...contacts];
    selectContact(newContact);

    // Reset form
    newChatPhone = "";
    newChatName = "";
    showNewChatModal = false;
  }

  async function loadContacts() {
    loading = true;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1} to load contacts...`);
        const response = await fetch("/api/mongodb/messages/recent?limit=100");
        const data = await response.json();
        console.log("Raw response from /api/mongodb/messages/recent:", data);

        if (data.success && data.messages && data.messages.length > 0) {
          console.log("Found messages, processing contacts...");
          console.log("First message example:", data.messages[0]);
          const contactMap = new Map();

          data.messages.forEach((msg, index) => {
            console.log(`Processing message ${index}:`, msg);

            // Check if this is a group message
            const isGroupMessage =
              msg.metadata?.isGroup ||
              (msg.to && msg.to.includes("@g.us")) ||
              (msg.from && msg.from.includes("@g.us"));

            if (isGroupMessage) {
              // Skip group messages when building individual contacts
              console.log(
                `Message ${index} - Skipping group message:`,
                msg.to || msg.from,
              );
              return;
            }

            // Use metadata.realPhoneNumber as primary, fallback to from field
            const fromPhone =
              msg.metadata?.realPhoneNumber ||
              (msg.from ? msg.from.replace("@c.us", "") : null);
            const toPhone = msg.to ? msg.to.replace("@c.us", "") : null;
            const isFromMe =
              msg.fromMe !== undefined ? msg.fromMe : msg.from === null;
            const contactPhone = isFromMe ? toPhone : fromPhone;
            console.log(
              `Message ${index} - fromPhone: ${fromPhone}, toPhone: ${toPhone}, isFromMe: ${isFromMe}, contactPhone: ${contactPhone}`,
            );

            if (contactPhone && !contactMap.has(contactPhone)) {
              const name = msg.pushname || contactPhone.replace(/\D/g, "");
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const newContact = {
                id: contactMap.size + 1,
                name: name,
                phone: contactPhone,
                avatar: initials,
                status: "offline",
                lastMessage: msg.body || "No message",
                lastMessageTime: new Date(msg.timestamp),
                messageCount: 1,
                type: "contact",
              };
              console.log(`Creating new contact:`, newContact);
              contactMap.set(contactPhone, newContact);
            } else if (contactPhone && contactMap.has(contactPhone)) {
              const existing = contactMap.get(contactPhone);
              existing.messageCount += 1;
              if (new Date(msg.timestamp) > existing.lastMessageTime) {
                existing.lastMessage = msg.body || "No message";
                existing.lastMessageTime = new Date(msg.timestamp);
              }
              console.log(`Updated existing contact:`, existing);
            } else {
              console.log(`Message ${index} - No valid contact phone found`);
            }
          });

          // Load groups with retry logic
          let groupsLoaded = false;
          let groupRetryCount = 0;
          const maxGroupRetries = 3;

          while (!groupsLoaded && groupRetryCount < maxGroupRetries) {
            try {
              console.log(`Attempt ${groupRetryCount + 1} to load groups...`);
              const groupsResponse = await fetch("/api/whatsapp/groups");

              if (!groupsResponse.ok) {
                throw new Error(
                  `HTTP ${groupsResponse.status}: ${groupsResponse.statusText}`,
                );
              }

              const groupsData = await groupsResponse.json();
              console.log("Groups response:", groupsData);

              if (groupsData.success && groupsData.groups) {
                const groupContacts = groupsData.groups.map((group, index) => {
                  // Get participant names if available
                  let participantNames = [];
                  if (group.participants && Array.isArray(group.participants)) {
                    participantNames = group.participants.map((participant) => {
                      const phone = participant.id
                        ? participant.id.replace("@c.us", "")
                        : participant.replace("@c.us", "");
                      return getContactName(phone);
                    });
                  }

                  return {
                    id: `group_${index + 1000}`,
                    name: group.name || group.title || `Group ${index + 1}`,
                    phone: group.id,
                    avatar: "👥",
                    status: "online",
                    lastMessage:
                      participantNames.length > 0
                        ? `${participantNames.length} participants`
                        : "Group chat",
                    lastMessageTime: null, // Will be set to actual time if messages exist
                    messageCount: 0, // Will be updated below with actual group message count
                    type: "group",
                    participantsCount: group.participantsCount || 0,
                    participants: group.participants || [],
                    participantNames: participantNames,
                  };
                });

                // Add groups to contacts
                // Update group message counts from actual messages
                groupContacts.forEach((group) => {
                  const groupId = group.phone;
                  const groupMessages = data.messages.filter((msg) => {
                    const msgFrom = msg.from
                      ? msg.from.replace("@g.us", "")
                      : "";
                    const msgTo = msg.to ? msg.to.replace("@g.us", "") : "";
                    const cleanGroupId = groupId.replace("@g.us", "");
                    return msgFrom === cleanGroupId || msgTo === cleanGroupId;
                  });

                  group.messageCount = groupMessages.length;
                  if (groupMessages.length > 0) {
                    const lastGroupMessage = groupMessages.sort(
                      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
                    )[0];
                    group.lastMessage =
                      lastGroupMessage.body || "Group message";
                    group.lastMessageTime = new Date(
                      lastGroupMessage.timestamp,
                    );
                  }

                  contactMap.set(group.phone, group);
                });

                console.log(
                  "Groups loaded and added to contacts with message counts:",
                  groupContacts,
                );
                groupsLoaded = true;
                break; // Successfully loaded groups, exit retry loop
              } else {
                throw new Error(
                  `Groups API returned: ${JSON.stringify(groupsData)}`,
                );
              }
            } catch (groupsError) {
              groupRetryCount++;
              console.error(
                `Error loading groups (attempt ${groupRetryCount}):`,
                groupsError,
              );

              if (groupRetryCount < maxGroupRetries) {
                console.log(
                  `Retrying group load in ${groupRetryCount * 1000}ms...`,
                );
                await new Promise((resolve) =>
                  setTimeout(resolve, groupRetryCount * 1000),
                );
              } else {
                console.error("Failed to load groups after all retries");
              }
            }
          }

          contacts = Array.from(contactMap.values()).sort((a, b) => {
            // Handle cases where lastMessageTime might be null
            if (!a.lastMessageTime && !b.lastMessageTime) return 0;
            if (!a.lastMessageTime) return 1; // Put contacts without time at the end
            if (!b.lastMessageTime) return -1; // Put contacts without time at the end
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
          });
          console.log(
            "Final contacts array with timestamps:",
            contacts.map((c) => ({
              name: c.name,
              phone: c.phone,
              type: c.type,
              lastMessageTime: c.lastMessageTime,
              lastMessage: c.lastMessage,
            })),
          );
          break; // Successfully loaded contacts, exit retry loop
        } else {
          throw new Error(
            `No messages found. Response: ${JSON.stringify(data)}`,
          );
        }
      } catch (error) {
        retryCount++;
        console.error(`Error loading contacts (attempt ${retryCount}):`, error);

        if (retryCount < maxRetries) {
          console.log(`Retrying contact load in ${retryCount * 1000}ms...`);
          await new Promise((resolve) =>
            setTimeout(resolve, retryCount * 1000),
          );
        } else {
          console.error("Failed to load contacts after all retries");
          contacts = [];
        }
      }
    }

    loading = false;
  }

  async function loadMessages(contactPhone) {
    try {
      console.log("Loading messages for contact:", contactPhone);

      // Check if this is a group
      const isGroup =
        contactPhone.startsWith("group_") || contactPhone.includes("@g.us");

      if (isGroup) {
        // For groups, load messages from the group ID
        const groupId = contactPhone.includes("@g.us")
          ? contactPhone
          : contactPhone.replace("group_", "");

        try {
          const response = await fetch(
            `/api/mongodb/messages/search?searchText=${encodeURIComponent(groupId)}&limit=100`,
          );
          const data = await response.json();
          console.log("Group messages response:", data);

          if (data.success && data.messages) {
            console.log(`Total group messages found: ${data.messages.length}`);

            // Filter messages for this specific group
            const groupMessages = data.messages.filter((msg) => {
              // Ensure this is actually a group message
              const isGroupMessage =
                msg.metadata?.isGroup ||
                (msg.to && msg.to.includes("@g.us")) ||
                (msg.from && msg.from.includes("@g.us"));

              if (!isGroupMessage) {
                console.log("Skipping non-group message in group chat:", msg);
                return false;
              }

              const msgFrom = msg.from ? msg.from.replace("@g.us", "") : "";
              const msgTo = msg.to ? msg.to.replace("@g.us", "") : "";
              const cleanGroupId = groupId.replace("@g.us", "");
              return msgFrom === cleanGroupId || msgTo === cleanGroupId;
            });

            console.log(
              `Group messages after filtering: ${groupMessages.length}`,
            );

            const transformedMessages = groupMessages.map((msg) => {
              const isFromMe =
                msg.fromMe !== undefined ? msg.fromMe : msg.from === null;

              // For group messages, get the sender's phone number
              let senderPhone = "";
              let senderName = "";

              if (isFromMe) {
                // Message sent by us
                senderPhone = "You";
                senderName = "You";
              } else {
                // Message received from someone else in the group
                // Try multiple sources for the real phone number
                if (msg.metadata && msg.metadata.groupParticipantPhone) {
                  // NEW PRIMARY SOURCE: groupParticipantPhone field
                  senderPhone = msg.metadata.groupParticipantPhone;
                  senderName = getContactName(senderPhone);
                  console.log(`Using groupParticipantPhone: ${senderPhone}`);
                } else if (msg.metadata && msg.metadata.realPhoneNumber) {
                  // Secondary source: realPhoneNumber from metadata
                  senderPhone = msg.metadata.realPhoneNumber;
                  senderName = getContactName(senderPhone);
                  console.log(`Using realPhoneNumber: ${senderPhone}`);
                } else if (msg.metadata && msg.metadata.senderNumber) {
                  // Tertiary source: senderNumber from metadata
                  senderPhone = msg.metadata.senderNumber;
                  senderName = getContactName(senderPhone);
                  console.log(`Using senderNumber: ${senderPhone}`);
                } else if (msg.from && !msg.from.includes("@g.us")) {
                  // Quaternary source: from field (if it's not a group ID)
                  senderPhone = msg.from.replace("@c.us", "");
                  senderName = getContactName(senderPhone);
                  console.log(`Using from field: ${senderPhone}`);
                } else if (msg.metadata && msg.metadata.author) {
                  // Quinary source: author from metadata
                  const cleanAuthor = msg.metadata.author
                    .replace("@lid", "")
                    .replace("@c.us", "")
                    .replace("@g.us", "");
                  if (/^\d{8,}$/.test(cleanAuthor)) {
                    senderPhone = cleanAuthor;
                    senderName = getContactName(senderPhone);
                    console.log(`Using author field: ${senderPhone}`);
                  } else {
                    senderPhone = "Unknown";
                    senderName = "Unknown";
                    console.log(
                      `Author field not a valid phone number: ${cleanAuthor}`,
                    );
                  }
                } else {
                  // Fallback: use the from field as is
                  senderPhone = msg.from || "Unknown";
                  senderName = "Unknown";
                  console.log(`Using fallback from field: ${senderPhone}`);
                }
              }

              console.log(
                `Message ${msg._id} - senderPhone: ${senderPhone}, senderName: ${senderName}, metadata:`,
                msg.metadata,
              );

              return {
                id: msg._id?.toString() || msg.id || Date.now().toString(),
                direction: msg.direction || (isFromMe ? "sent" : "received"),
                type: msg.type || "text",
                content: msg.body || msg.content || "",
                from: senderName,
                fromPhone: senderPhone,
                to: groupId.replace("@g.us", ""),
                timestamp: new Date(msg.timestamp || msg.createdAt),
                status: msg.status || "delivered",
                contact: groupId,
                isGroup: true,
                groupId: groupId,
                realPhoneNumber: senderPhone, // Include real phone number
              };
            });

            messages = transformedMessages.reverse();
            console.log("Group messages loaded:", messages);
          } else {
            messages = [];
            console.log("No group messages found for:", groupId);
          }
        } catch (groupError) {
          console.error("Error loading group messages:", groupError);
          messages = [];
        }
        return;
      }

      const fullPhoneNumber = contactPhone.includes("@c.us")
        ? contactPhone
        : `${contactPhone}@c.us`;
      const response = await fetch(
        `/api/mongodb/messages/search?searchText=${encodeURIComponent(contactPhone)}&limit=100`,
      );
      const data = await response.json();
      console.log("Messages response:", data);

      if (data.success && data.messages) {
        console.log(`Total messages found: ${data.messages.length}`);

        const contactMessages = data.messages.filter((msg) => {
          // Skip group messages when loading individual contact messages
          const isGroupMessage =
            msg.metadata?.isGroup ||
            (msg.to && msg.to.includes("@g.us")) ||
            (msg.from && msg.from.includes("@g.us"));

          if (isGroupMessage) {
            console.log(
              "Skipping group message in individual contact chat:",
              msg,
            );
            return false;
          }

          const msgFrom = msg.from ? msg.from.replace("@c.us", "") : "";
          const msgTo = msg.to ? msg.to.replace("@c.us", "") : "";
          const cleanContactPhone = contactPhone.replace("@c.us", "");
          return msgFrom === cleanContactPhone || msgTo === cleanContactPhone;
        });

        console.log(
          `Messages after filtering (individual only): ${contactMessages.length}`,
        );

        const transformedMessages = contactMessages.map((msg) => {
          const isFromMe =
            msg.fromMe !== undefined ? msg.fromMe : msg.from === null;

          // Additional validation: ensure this is NOT a group message
          const isGroupMessage =
            msg.metadata?.isGroup ||
            (msg.to && msg.to.includes("@g.us")) ||
            (msg.from && msg.from.includes("@g.us"));

          if (isGroupMessage) {
            console.log(
              "WARNING: Group message found in individual contact transformation:",
              msg,
            );
          }

          return {
            id: msg._id?.toString() || msg.id || Date.now().toString(),
            direction: msg.direction || (isFromMe ? "sent" : "received"),
            type: msg.type || "text",
            content: msg.body || msg.content || "",
            from: msg.from ? msg.from.replace("@c.us", "") : "",
            to: msg.to ? msg.to.replace("@c.us", "") : "",
            timestamp: new Date(msg.timestamp || msg.createdAt),
            status: msg.status || "delivered",
            contact: isFromMe
              ? msg.to
                ? msg.to.replace("@c.us", "")
                : ""
              : msg.from
                ? msg.from.replace("@c.us", "")
                : "",
            // Add flag to identify individual messages
            isGroup: false,
            realPhoneNumber:
              msg.metadata?.realPhoneNumber || msg.from?.replace("@c.us", ""),
          };
        });
        messages = transformedMessages.reverse();
        console.log("Filtered and transformed messages:", messages);
      } else {
        messages = [];
        console.log("No messages found for contact:", contactPhone);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      messages = [];
    }
  }

  onDestroy(() => {
    if (socket) {
      socket.disconnect();
    }
  });

  async function selectContact(contact) {
    console.log("Selecting contact:", contact);
    selectedContact = contact;
    await loadMessages(contact.phone);
    scrollToBottom();
  }

  async function sendMessage() {
    if (!currentMessage.trim() || !selectedContact) return;
    const messageText = currentMessage;
    currentMessage = "";

    console.log("Sending message:", messageText, "to:", selectedContact.phone);
    console.log("Current messages count before sending:", messages.length);

    const tempMessage = {
      id: Date.now().toString(),
      direction: "sent",
      type: "text",
      content: messageText,
      from: "You",
      fromPhone: "agent",
      to:
        selectedContact.type === "group"
          ? selectedContact.name
          : selectedContact.phone,
      timestamp: new Date(),
      status: "sending",
      contact: selectedContact.phone,
      isGroup: selectedContact.type === "group",
    };

    // Add the message to the messages array immediately
    messages = [...messages, tempMessage];
    console.log("Messages count after adding temp message:", messages.length);
    scrollToBottom();

    try {
      // Check if this is a group message
      const isGroup = selectedContact.type === "group";
      const messageType = isGroup ? "group" : "individual";

      // Send message through WhatsApp backend
      const response = await fetch("/api/whatsapp/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: selectedContact.phone,
          message: messageText,
          messageType: messageType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Message sent successfully:", result);

        // Update message status to sent
        messages = messages.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: "sent" } : msg,
        );

        // Update the contact's last message without refreshing the entire contact list
        if (selectedContact) {
          selectedContact.lastMessage = messageText;
          selectedContact.lastMessageTime = new Date();

          // Update the contact in the contacts array
          contacts = contacts.map((contact) =>
            contact.phone === selectedContact.phone
              ? {
                  ...contact,
                  lastMessage: messageText,
                  lastMessageTime: new Date(),
                }
              : contact,
          );
        }

        console.log(
          "Message sent and UI updated successfully. Final messages count:",
          messages.length,
        );
      } else {
        console.error("Failed to send message to WhatsApp:", result.error);
        // Update message status to failed
        messages = messages.map((msg) =>
          msg.id === tempMessage.id
            ? { ...msg, status: "failed", error: result.error }
            : msg,
        );

        // Show error to user
        alert(`Failed to send message: ${result.error}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Update message status to failed
      messages = messages.map((msg) =>
        msg.id === tempMessage.id
          ? { ...msg, status: "failed", error: error.message }
          : msg,
      );

      // Show error to user
      alert(`Error sending message: ${error.message}`);
    }
  }

  function addMessage(message) {
    messages = [...messages, message];
    scrollToBottom();
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }, 100);
  }

  function formatTime(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function handleKeyPress(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  // Group creation functions
  function addGroupParticipant() {
    newGroup.participants = [...newGroup.participants, ""];
  }

  function removeGroupParticipant(index) {
    newGroup.participants = newGroup.participants.filter((_, i) => i !== index);
  }

  function updateGroupParticipant(index, value) {
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

        // Reset form
        newGroup = {
          title: "",
          participants: [""],
        };

        showCreateGroupModal = false;

        // Show success message
        alert("Group created successfully! You can now chat with the group.");
      } else {
        console.error("Failed to create group:", result.error);
        alert(`Failed to create group: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      alert(`Error creating group: ${error.message}`);
    }
  }

  // Contact management functions
  async function loadContactsList() {
    try {
      const response = await fetch("/api/contacts");
      const data = await response.json();

      if (data.success) {
        contactsList = data.contacts || [];
        console.log("Contacts list loaded:", contactsList);
      } else {
        console.error("Failed to load contacts:", data.error);
        contactsList = [];
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
      contactsList = [];
    }
  }

  function openAddContactModal() {
    newContact = { name: "", phone: "", email: "", notes: "" };
    editingContact = null;
    showAddContactModal = true;
  }

  function openEditContactModal(contact) {
    newContact = { ...contact };
    editingContact = contact;
    showAddContactModal = true;
  }

  async function saveContact() {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      alert("Name and phone number are required");
      return;
    }

    try {
      const url = editingContact
        ? `/api/contacts/${editingContact._id}`
        : "/api/contacts";
      const method = editingContact ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      });

      const result = await response.json();

      if (result.success) {
        console.log("Contact saved successfully:", result);

        // Refresh contacts list
        await loadContactsList();

        // Reset form
        newContact = { name: "", phone: "", email: "", notes: "" };
        editingContact = null;
        showAddContactModal = false;

        // Show success message
        alert(
          editingContact
            ? "Contact updated successfully!"
            : "Contact added successfully!",
        );
      } else {
        console.error("Failed to save contact:", result.error);
        alert(`Failed to save contact: ${result.error}`);
      }
    } catch (error) {
      console.error("Error saving contact:", error);
      alert(`Error saving contact: ${error.message}`);
    }
  }

  async function deleteContact(contactId) {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        console.log("Contact deleted successfully");

        // Refresh contacts list
        await loadContactsList();

        // Show success message
        alert("Contact deleted successfully!");
      } else {
        console.error("Failed to delete contact:", result.error);
        alert(`Failed to delete contact: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      alert(`Error deleting contact: ${error.message}`);
    }
  }

  function getContactName(phoneNumber) {
    if (!phoneNumber) return "Unknown";

    // Remove @c.us suffix if present
    const cleanPhone = phoneNumber.replace("@c.us", "");

    // Find contact in our contacts list
    const contact = contactsList.find((c) => c.phone === cleanPhone);
    if (contact) return contact.name;

    // If no contact found, return formatted phone number
    return cleanPhone;
  }

  function updateContactWithNewMessage(newMessage) {
    // Check if this is a group message
    if (newMessage.isGroup) {
      // For group messages, update the group contact, not individual contacts
      const groupId = newMessage.groupId || newMessage.to;

      contacts = contacts.map((contact) => {
        if (contact.type === "group" && contact.phone === groupId) {
          const updatedContact = {
            ...contact,
            lastMessage: newMessage.content,
            lastMessageTime: new Date(newMessage.timestamp),
            messageCount: contact.messageCount + 1,
          };
          console.log("Updated group contact:", {
            groupId: groupId,
            oldTime: contact.lastMessageTime,
            newTime: updatedContact.lastMessageTime,
            message: newMessage.content,
          });
          return updatedContact;
        }
        return contact;
      });

      console.log("Updated group contact with new message:", groupId);
      return; // Don't process group messages as individual contacts
    }

    // For individual messages, find the contact this message belongs to
    const messageContact = newMessage.fromMe
      ? newMessage.to
      : newMessage.realPhoneNumber || newMessage.from;

    // Update the contact in the contacts array
    contacts = contacts.map((contact) => {
      if (contact.phone === messageContact) {
        const updatedContact = {
          ...contact,
          lastMessage: newMessage.content,
          lastMessageTime: new Date(newMessage.timestamp),
          messageCount: contact.messageCount + 1,
        };
        console.log("Updated individual contact:", {
          phone: messageContact,
          oldTime: contact.lastMessageTime,
          newTime: updatedContact.lastMessageTime,
          message: newMessage.content,
        });
        return updatedContact;
      }
      return contact;
    });

    // If this is a new contact, add them to the list
    const existingContact = contacts.find((c) => c.phone === messageContact);
    if (!existingContact) {
      const newContact = {
        id: Date.now(),
        name: messageContact.replace(/\D/g, ""),
        phone: messageContact,
        avatar: messageContact.substring(0, 2).toUpperCase(),
        status: "offline",
        lastMessage: newMessage.content,
        lastMessageTime: new Date(newMessage.timestamp),
        messageCount: 1,
        type: "contact", // Explicitly mark as individual contact
      };

      contacts = [newContact, ...contacts];
      console.log("New individual contact added:", newContact);
    }

    // Sort contacts by last message time
    contacts = contacts.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
    );
  }

  // Manual refresh function for groups
  async function refreshGroups() {
    console.log("Manually refreshing groups...");
    loading = true;

    try {
      const groupsResponse = await fetch("/api/whatsapp/groups");
      if (!groupsResponse.ok) {
        throw new Error(
          `HTTP ${groupsResponse.status}: ${groupsResponse.statusText}`,
        );
      }

      const groupsData = await groupsResponse.json();
      console.log("Groups refresh response:", groupsData);

      if (groupsData.success && groupsData.groups) {
        const groupContacts = groupsData.groups.map((group, index) => {
          // Get participant names if available
          let participantNames = [];
          if (group.participants && Array.isArray(group.participants)) {
            participantNames = group.participants.map((participant) => {
              const phone = participant.id
                ? participant.id.replace("@c.us", "")
                : participant.replace("@c.us", "");
              return getContactName(phone);
            });
          }

          return {
            id: `group_${index + 1000}`,
            name: group.name || group.title || `Group ${index + 1}`,
            phone: group.id,
            avatar: "👥",
            status: "online",
            lastMessage:
              participantNames.length > 0
                ? `${participantNames.slice(0, 3).join(", ")}${participantNames.length > 3 ? "..." : ""}`
                : "Group chat",
            lastMessageTime: new Date(),
            messageCount: 0,
            type: "group",
            participantsCount: group.participantsCount || 0,
            participants: group.participants || [],
            participantNames: participantNames,
          };
        });

        // Remove existing groups and add new ones
        contacts = contacts.filter((c) => c.type !== "group");
        groupContacts.forEach((group) => {
          contacts.push(group);
        });

        // Sort contacts
        contacts = contacts.sort(
          (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime),
        );

        console.log("Groups refreshed successfully:", groupContacts.length);
        console.log("Total contacts after refresh:", contacts.length);
      } else {
        throw new Error(`Groups API returned: ${JSON.stringify(groupsData)}`);
      }
    } catch (error) {
      console.error("Error refreshing groups:", error);
      alert("Failed to refresh groups. Please try again.");
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Chat - WhatsApp Chat Portal</title>
</svelte:head>

<div class="chat-container h-full flex">
  <!-- Sidebar -->
  <div class="chat-sidebar">
    <!-- Sidebar Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-lg font-semibold text-gray-900">Contacts</h2>
        <div class="flex space-x-2">
          <button
            on:click={() => (showContactManagerModal = true)}
            class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Manage contacts"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </button>
          <button
            on:click={() => (showCreateGroupModal = true)}
            class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Create new group"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </button>
          <button
            on:click={() => (showNewChatModal = true)}
            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Start new chat"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              ></path>
            </svg>
          </button>
        </div>
      </div>
      <p class="text-sm text-gray-600 mb-2">
        Manage customer conversations and groups
      </p>
      <div class="flex space-x-2">
        <button
          on:click={startNewChat}
          class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          New Chat
        </button>
        <button
          on:click={refreshGroups}
          class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
          disabled={loading}
        >
          {loading ? "Loading..." : "🔄 Refresh Groups"}
        </button>
      </div>
    </div>

    <div class="overflow-y-auto flex-1">
      {#if loading}
        <div class="p-4 text-center text-gray-500">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"
          ></div>
          Loading contacts...
        </div>
      {:else if contacts.length === 0}
        <div class="p-6 text-center text-gray-500">
          <div class="text-4xl mb-3">💬</div>
          <h3 class="text-lg font-medium mb-2">No conversations yet</h3>
          <p class="text-sm mb-4">Start chatting with your customers</p>
          <button
            on:click={() => (showNewChatModal = true)}
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            Start New Chat
          </button>
        </div>
      {:else}
        {#each contacts as contact}
          <div
            class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors {selectedContact?.id ===
            contact.id
              ? 'bg-blue-50 border-l-4 border-l-blue-500'
              : ''}"
            on:click={() => selectContact(contact)}
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 {contact.type === 'group'
                  ? 'bg-green-300'
                  : 'bg-gray-300'} rounded-full flex items-center justify-center text-sm font-medium {contact.type ===
                'group'
                  ? 'text-green-700'
                  : 'text-gray-700'}"
              >
                {contact.avatar}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900 truncate">
                    {contact.name}
                    {#if contact.type === "group"}
                      <span class="ml-2 text-xs text-green-600">👥</span>
                    {/if}
                  </h3>
                  <div class="flex items-center space-x-1">
                    <div
                      class="w-2 h-2 rounded-full {contact.status === 'online'
                        ? 'bg-green-500'
                        : contact.status === 'away'
                          ? 'bg-yellow-500'
                          : 'bg-gray-400'}"
                    ></div>
                    {#if contact.lastMessageTime && contact.messageCount > 0 && contact.lastMessage !== "Start a new conversation"}
                      <span class="text-xs text-gray-500"
                        >{formatTime(contact.lastMessageTime)}</span
                      >
                    {/if}
                  </div>
                </div>
                <p class="text-sm text-gray-600 truncate">
                  {#if contact.type === "group"}
                    {#if contact.participantNames && contact.participantNames.length > 0}
                      {contact.participantNames.slice(0, 2).join(", ")}
                      {#if contact.participantNames.length > 2}
                        +{contact.participantNames.length - 2} more
                      {/if}
                    {:else}
                      {contact.participantsCount || 0} participants
                    {/if}
                  {:else}
                    {contact.lastMessage}
                  {/if}
                </p>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Chat Area -->
  <div class="flex-1 flex flex-col">
    <!-- Chat Header -->
    {#if selectedContact}
      <div class="chat-header">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700"
          >
            {selectedContact.avatar}
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              {selectedContact.name}
            </h3>
            <p class="text-sm text-gray-600">{selectedContact.phone}</p>
          </div>
          <div class="ml-auto flex items-center space-x-2">
            <div
              class="w-2 h-2 rounded-full {selectedContact.status === 'online'
                ? 'bg-green-500'
                : selectedContact.status === 'away'
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'}"
            ></div>
            <span class="text-sm text-gray-500 capitalize"
              >{selectedContact.status}</span
            >
          </div>
        </div>
      </div>
    {/if}

    <!-- Messages -->
    <div class="chat-messages" bind:this={messageContainer}>
      {#if selectedContact}
        {#each messages as message}
          <div
            class="flex {message.direction === 'sent'
              ? 'justify-end'
              : 'justify-start'} mb-4"
          >
            <div
              class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg {message.direction ===
              'sent'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-800'}"
            >
              {#if message.isGroup && message.direction === "received"}
                <div class="text-xs opacity-75 mb-1 font-medium">
                  {message.from}
                  {#if message.fromPhone && message.fromPhone !== message.from && message.fromPhone !== "Unknown"}
                    <span class="text-xs opacity-60 ml-1"
                      >({message.fromPhone})</span
                    >
                  {/if}
                  {#if message.realPhoneNumber && message.realPhoneNumber !== message.fromPhone}
                    <span class="text-xs opacity-60 ml-1"
                      >📱 {message.realPhoneNumber}</span
                    >
                  {/if}
                </div>
              {/if}
              <div class="text-sm whitespace-pre-wrap">{message.content}</div>
              <div class="text-xs opacity-75 mt-1 text-right">
                {formatTime(message.timestamp)}
                {#if message.direction === "sent"}
                  <span class="ml-2">
                    {#if message.status === "sending"}
                      <span class="text-yellow-300">⏳</span>
                    {:else if message.status === "sent"}
                      <span class="text-blue-300">✓</span>
                    {:else if message.status === "failed"}
                      <span
                        class="text-red-300"
                        title={message.error || "Failed"}>❌</span
                      >
                    {:else}
                      <span class="text-gray-300">✓</span>
                    {/if}
                  </span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {:else}
        <div class="flex items-center justify-center h-full">
          <div class="text-center text-gray-500">
            <div class="text-6xl mb-4">💬</div>
            <h3 class="text-lg font-medium mb-2">
              Select a contact to start chatting
            </h3>
            <p class="text-sm">
              Choose from the list on the left to begin a conversation
            </p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Chat Input -->
    {#if selectedContact}
      <div class="chat-input">
        <div class="flex space-x-3">
          <input
            bind:value={currentMessage}
            placeholder="Type your message..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            on:keypress={handleKeyPress}
          />
          <button
            on:click={sendMessage}
            disabled={!currentMessage.trim()}
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- New Chat Modal -->
{#if showNewChatModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4">Start New Chat</h3>
      <div class="space-y-4">
        <div>
          <label
            for="newChatName"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Contact Name (Optional)
          </label>
          <input
            id="newChatName"
            bind:value={newChatName}
            placeholder="Enter contact name"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            for="newChatPhone"
            class="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number *
          </label>
          <input
            id="newChatPhone"
            bind:value={newChatPhone}
            placeholder="+1234567890"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          on:click={() => (showNewChatModal = false)}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          on:click={startNewChat}
          disabled={!newChatPhone.trim()}
        >
          Start Chat
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Create Group Modal -->
{#if showCreateGroupModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4">Create New Group</h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Group Title *
          </label>
          <input
            bind:value={newGroup.title}
            placeholder="Enter group title"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Participants *
          </label>
          {#each newGroup.participants as participant, index}
            <div class="flex space-x-2 mb-2">
              <input
                bind:value={participant}
                placeholder="Phone number (e.g., 60122273341)"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                on:input={() => updateGroupParticipant(index, participant)}
              />
              {#if newGroup.participants.length > 1}
                <button
                  class="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                  on:click={() => removeGroupParticipant(index)}
                >
                  Remove
                </button>
              {/if}
            </div>
            {#if participant.trim()}
              <div class="ml-2 text-xs text-gray-500 mb-2">
                {#if getContactName(participant) !== participant}
                  👤 {getContactName(participant)}
                {:else}
                  📱 {participant}
                {/if}
              </div>
            {/if}
          {/each}
          <button
            class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            on:click={addGroupParticipant}
          >
            + Add Participant
          </button>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          on:click={() => (showCreateGroupModal = false)}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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

<!-- Contact Manager Modal -->
{#if showContactManagerModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div
      class="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
    >
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-semibold">Contact Manager</h3>
        <div class="flex space-x-2">
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            on:click={openAddContactModal}
          >
            + Add Contact
          </button>
          <button
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            on:click={() => (showContactManagerModal = false)}
          >
            Close
          </button>
        </div>
      </div>

      <!-- Contacts Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Name</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Phone</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Email</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Notes</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >Actions</th
              >
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each contactsList as contact}
              <tr>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >{contact.name}</td
                >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >{contact.phone}</td
                >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >{contact.email || "-"}</td
                >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >{contact.notes || "-"}</td
                >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button
                      class="text-indigo-600 hover:text-indigo-900"
                      on:click={() => openEditContactModal(contact)}
                    >
                      Edit
                    </button>
                    <button
                      class="text-red-600 hover:text-red-900"
                      on:click={() => deleteContact(contact._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if contactsList.length === 0}
        <div class="text-center py-8 text-gray-500">
          <div class="text-4xl mb-3">👥</div>
          <h3 class="text-lg font-medium mb-2">No contacts yet</h3>
          <p class="text-sm mb-4">Add your first contact to get started</p>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            on:click={openAddContactModal}
          >
            Add First Contact
          </button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<!-- Add/Edit Contact Modal -->
{#if showAddContactModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
      <h3 class="text-lg font-semibold mb-4">
        {editingContact ? "Edit Contact" : "Add New Contact"}
      </h3>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            bind:value={newContact.name}
            placeholder="Enter contact name"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Phone Number *
          </label>
          <input
            bind:value={newContact.phone}
            placeholder="e.g., 60122273341"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            bind:value={newContact.email}
            placeholder="Enter email address"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            bind:value={newContact.notes}
            placeholder="Add any notes about this contact"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>
      </div>

      <div class="flex justify-end space-x-3 mt-6">
        <button
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          on:click={() => (showAddContactModal = false)}
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          on:click={saveContact}
          disabled={!newContact.name.trim() || !newContact.phone.trim()}
        >
          {editingContact ? "Update Contact" : "Add Contact"}
        </button>
      </div>
    </div>
  </div>
{/if}
