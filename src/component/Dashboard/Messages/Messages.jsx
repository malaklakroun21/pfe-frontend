import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { messageApi } from "../../../api/client.js";
import { useAuthSession } from "../../../authSession.js";
import { useNotificationsState } from "../Notifications/notificationsStore.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Messages.css";

function formatChatTime(date) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Now";
  }

  return parsedDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatConversationTime(dateValue) {
  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsedDate);
}

function buildParticipantName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || user?.userId || "Unknown";
}

function buildParticipantInitials(user) {
  const fullName = buildParticipantName(user);
  const parts = fullName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "??";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatParticipantStatus(participant) {
  if (!participant?.role) {
    return "Conversation";
  }

  return `${String(participant.role).toLowerCase()} on Fenneky`;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 17H5.5l1.6-2.13V10a4.9 4.9 0 1 1 9.8 0v4.87L18.5 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m21.44 11.05-8.49 8.49a6 6 0 1 1-8.49-8.48l9.19-9.2a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 1 1-2.82-2.82l8.49-8.48"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 3 10 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m21 3-7 18-4-7-7-4 18-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Messages() {
  const navigate = useNavigate();
  const { user } = useAuthSession();
  const { unreadCount } = useNotificationsState();
  const [conversationItems, setConversationItems] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [activeThread, setActiveThread] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [draft, setDraft] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const threadRef = useRef(null);

  useEffect(() => {
    let isActive = true;

    async function loadConversations() {
      setIsLoadingConversations(true);
      setErrorMessage("");

      try {
        const conversations = await messageApi.listConversations();

        if (!isActive) {
          return;
        }

        const mappedConversations = (Array.isArray(conversations) ? conversations : []).map((conversation) => ({
          id: conversation.otherParticipant?.userId || conversation.conversationId,
          initials: buildParticipantInitials(conversation.otherParticipant),
          name: buildParticipantName(conversation.otherParticipant),
          status: formatParticipantStatus(conversation.otherParticipant),
          lastSeen: formatConversationTime(conversation.lastMessageAt),
          preview: conversation.lastMessage?.content || "No messages yet.",
          unread: (conversation.unreadCount || 0) > 0,
          rawConversation: conversation,
        }));

        setConversationItems(mappedConversations);
        setActiveConversationId((currentActiveId) => {
          if (currentActiveId && mappedConversations.some((conversation) => conversation.id === currentActiveId)) {
            return currentActiveId;
          }

          return mappedConversations[0]?.id || "";
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(error.message);
      } finally {
        if (isActive) {
          setIsLoadingConversations(false);
        }
      }
    }

    loadConversations();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadActiveThread() {
      if (!activeConversationId || !user?.userId) {
        setActiveThread(null);
        return;
      }

      setIsLoadingThread(true);
      setErrorMessage("");

      try {
        const conversation = await messageApi.getConversationWithUser(activeConversationId);

        if (!isActive) {
          return;
        }

        const mappedMessages = (Array.isArray(conversation?.messages) ? conversation.messages : []).map((message) => ({
          id: message.messageId,
          sender: message.senderId === user.userId ? "me" : "them",
          body: message.content,
          time: formatChatTime(message.createdAt),
          isRead: message.isRead,
          senderId: message.senderId,
        }));

        setActiveThread({
          conversationId: conversation?.conversationId || "",
          participant: conversation?.participant || null,
          messages: mappedMessages,
        });

        const unreadIncomingMessages = (Array.isArray(conversation?.messages) ? conversation.messages : []).filter(
          (message) => message.senderId !== user.userId && !message.isRead,
        );

        if (unreadIncomingMessages.length > 0) {
          await Promise.all(
            unreadIncomingMessages.map((message) => messageApi.markMessageAsRead(message.messageId)),
          );

          if (!isActive) {
            return;
          }

          setConversationItems((current) =>
            current.map((conversationItem) =>
              conversationItem.id === activeConversationId
                ? { ...conversationItem, unread: false }
                : conversationItem,
            ),
          );
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(error.message);
      } finally {
        if (isActive) {
          setIsLoadingThread(false);
        }
      }
    }

    loadActiveThread();

    return () => {
      isActive = false;
    };
  }, [activeConversationId, user?.userId]);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredConversations = conversationItems.filter((conversation) => {
    if (!normalizedSearch) {
      return true;
    }

    return `${conversation.name} ${conversation.preview}`
      .toLowerCase()
      .includes(normalizedSearch);
  });

  const activeConversation =
    conversationItems.find((conversation) => conversation.id === activeConversationId) ??
    conversationItems[0];

  useEffect(() => {
    const threadNode = threadRef.current;

    if (!threadNode) {
      return;
    }

    threadNode.scrollTop = threadNode.scrollHeight;
  }, [activeConversationId, activeThread?.messages?.length]);

  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    setConversationItems((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unread: false }
          : conversation
      )
    );
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const nextMessage = draft.trim();

    if (!nextMessage || !activeConversation?.id) {
      return;
    }

    setErrorMessage("");

    try {
      await messageApi.sendMessage({
        recipientUserId: activeConversation.id,
        content: nextMessage,
      });

      const refreshedThread = await messageApi.getConversationWithUser(activeConversation.id);
      const refreshedConversations = await messageApi.listConversations();

      setActiveThread({
        conversationId: refreshedThread?.conversationId || "",
        participant: refreshedThread?.participant || null,
        messages: (Array.isArray(refreshedThread?.messages) ? refreshedThread.messages : []).map((message) => ({
          id: message.messageId,
          sender: message.senderId === user?.userId ? "me" : "them",
          body: message.content,
          time: formatChatTime(message.createdAt),
          isRead: message.isRead,
          senderId: message.senderId,
        })),
      });

      setConversationItems(
        (Array.isArray(refreshedConversations) ? refreshedConversations : []).map((conversation) => ({
          id: conversation.otherParticipant?.userId || conversation.conversationId,
          initials: buildParticipantInitials(conversation.otherParticipant),
          name: buildParticipantName(conversation.otherParticipant),
          status: formatParticipantStatus(conversation.otherParticipant),
          lastSeen: formatConversationTime(conversation.lastMessageAt),
          preview: conversation.lastMessage?.content || "No messages yet.",
          unread: (conversation.unreadCount || 0) > 0,
          rawConversation: conversation,
        })),
      );

      setDraft("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <ViewFrame>
      <section className="messages-page">
        <aside className="messages-page__sidebar">
          <div className="messages-page__sidebar-header">
            <h1>Messages</h1>

            <label className="messages-page__search" aria-label="Search conversations">
              <span className="messages-page__search-icon">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search conversations..."
                aria-label="Search conversations"
              />
            </label>
          </div>

          <div className="messages-page__conversation-list">
            {errorMessage ? <p>{errorMessage}</p> : null}

            {isLoadingConversations ? (
              <div className="messages-page__conversation-empty">Loading conversations...</div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversation?.id;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`messages-page__conversation-item ${isActive ? "is-active" : ""}`}
                    onClick={() => handleSelectConversation(conversation.id)}
                    aria-pressed={isActive}
                  >
                    <div className="messages-page__avatar">{conversation.initials}</div>

                    <div className="messages-page__conversation-copy">
                      <div className="messages-page__conversation-topline">
                        <strong>{conversation.name}</strong>

                        <div className="messages-page__conversation-meta">
                          <span>{conversation.lastSeen}</span>
                          {conversation.unread ? (
                            <span className="messages-page__unread-dot" aria-hidden="true" />
                          ) : null}
                        </div>
                      </div>

                      <p>{conversation.preview}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="messages-page__conversation-empty">
                No conversations match your search.
              </div>
            )}
          </div>
        </aside>

        <div className="messages-page__conversation-panel">
          <header className="messages-page__thread-header">
            <div className="messages-page__thread-profile">
              <div className="messages-page__avatar messages-page__avatar--large">
                {activeConversation?.initials || "??"}
              </div>

              <div className="messages-page__thread-copy">
                <h2>{activeConversation?.name || "No conversation selected"}</h2>
                <p>{activeConversation?.status || "Conversation"}</p>
              </div>
            </div>

            <div className="messages-page__thread-actions">
              <button type="button" className="messages-page__profile-button">
                View Profile
              </button>

              <button
                type="button"
                className="messages-page__icon-button"
                aria-label="Open notifications"
                onClick={() => navigate("/app/notifications")}
              >
                <BellIcon />
                {unreadCount > 0 ? (
                  <span className="messages-page__notification-dot" aria-hidden="true" />
                ) : null}
              </button>
            </div>
          </header>

          <div ref={threadRef} className="messages-page__thread">
            {isLoadingThread ? (
              <p>Loading messages...</p>
            ) : activeThread?.messages?.length > 0 ? (
              activeThread.messages.map((message) => (
                <article
                  key={message.id}
                  className={`messages-page__message messages-page__message--${message.sender}`}
                >
                  <div className="messages-page__bubble">{message.body}</div>
                  <span className="messages-page__timestamp">{message.time}</span>
                </article>
              ))
            ) : (
              <p>No messages yet.</p>
            )}
          </div>

          <form className="messages-page__composer" onSubmit={handleSendMessage}>
            <button
              type="button"
              className="messages-page__clip-button"
              aria-label="Attach a file"
            >
              <ClipIcon />
            </button>

            <label className="messages-page__composer-field">
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message..."
                aria-label="Type your message"
                disabled={!activeConversation?.id}
              />
            </label>

            <button
              type="submit"
              className="messages-page__send-button"
              aria-label="Send message"
              disabled={!draft.trim() || !activeConversation?.id}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </section>
    </ViewFrame>
  );
}

export default Messages;
