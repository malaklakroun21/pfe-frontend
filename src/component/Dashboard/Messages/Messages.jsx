import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationsState } from "../Notifications/notificationsStore.js";
import ViewFrame from "../Layout/ViewFrame/ViewFrame.jsx";
import "./Messages.css";

const initialConversations = [
  {
    id: "sarah-chen",
    initials: "SC",
    name: "Sarah Chen",
    status: "Active now",
    lastSeen: "5 min ago",
    preview: "Looking forward to our session!",
    unread: true,
    messages: [
      {
        id: "sarah-1",
        sender: "them",
        body: "Hi! I'm really excited about our Spanish session tomorrow.",
        time: "2:30 PM",
      },
      {
        id: "sarah-2",
        sender: "me",
        body: "Me too! I've been practicing some basic phrases.",
        time: "2:35 PM",
      },
      {
        id: "sarah-3",
        sender: "them",
        body: "That's great! We'll focus on conversation practice. Do you have any specific topics you'd like to discuss?",
        time: "2:37 PM",
      },
      {
        id: "sarah-4",
        sender: "me",
        body: "Maybe ordering food at a restaurant and asking for directions?",
        time: "2:40 PM",
      },
      {
        id: "sarah-5",
        sender: "them",
        body: "Perfect! Those are very practical. Looking forward to our session!",
        time: "2:42 PM",
      },
    ],
  },
  {
    id: "marcus-johnson",
    initials: "MJ",
    name: "Marcus Johnson",
    status: "Last seen 12 min ago",
    lastSeen: "1 hour ago",
    preview: "Can we reschedule to 11 AM?",
    unread: true,
    messages: [
      {
        id: "marcus-1",
        sender: "them",
        body: "Hey, I have a small conflict tomorrow morning.",
        time: "11:05 AM",
      },
      {
        id: "marcus-2",
        sender: "them",
        body: "Can we reschedule to 11 AM?",
        time: "11:06 AM",
      },
      {
        id: "marcus-3",
        sender: "me",
        body: "Yes, 11 AM works for me.",
        time: "11:09 AM",
      },
    ],
  },
  {
    id: "elena-rodriguez",
    initials: "ER",
    name: "Elena Rodriguez",
    status: "Offline",
    lastSeen: "2 hours ago",
    preview: "Thanks for the great session!",
    unread: false,
    messages: [
      {
        id: "elena-1",
        sender: "them",
        body: "Thanks for the great session!",
        time: "9:40 AM",
      },
      {
        id: "elena-2",
        sender: "me",
        body: "You're welcome. Happy to help.",
        time: "9:47 AM",
      },
    ],
  },
  {
    id: "alex-kim",
    initials: "AK",
    name: "Alex Kim",
    status: "Offline",
    lastSeen: "Yesterday",
    preview: "Got it, see you then!",
    unread: false,
    messages: [
      {
        id: "alex-1",
        sender: "me",
        body: "Let's keep the original slot for Thursday.",
        time: "Yesterday",
      },
      {
        id: "alex-2",
        sender: "them",
        body: "Got it, see you then!",
        time: "Yesterday",
      },
    ],
  },
];

function formatChatTime(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
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
  const { unreadCount } = useNotificationsState();
  const [conversationItems, setConversationItems] = useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState(initialConversations[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [draft, setDraft] = useState("");
  const threadRef = useRef(null);

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
  }, [activeConversationId, activeConversation?.messages.length]);

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

  const handleSubmitMessage = (event) => {
    event.preventDefault();

    const nextMessage = draft.trim();

    if (!nextMessage || !activeConversation) {
      return;
    }

    const sentAt = formatChatTime(new Date());

    setConversationItems((current) => {
      const selectedConversation = current.find(
        (conversation) => conversation.id === activeConversation.id
      );

      if (!selectedConversation) {
        return current;
      }

      const updatedConversation = {
        ...selectedConversation,
        preview: nextMessage,
        lastSeen: "Now",
        unread: false,
        messages: [
          ...selectedConversation.messages,
          {
            id: `${selectedConversation.id}-${selectedConversation.messages.length + 1}`,
            sender: "me",
            body: nextMessage,
            time: sentAt,
          },
        ],
      };

      return [
        updatedConversation,
        ...current.filter((conversation) => conversation.id !== activeConversation.id),
      ];
    });

    setDraft("");
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
            {filteredConversations.length > 0 ? (
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
                {activeConversation.initials}
              </div>

              <div className="messages-page__thread-copy">
                <h2>{activeConversation.name}</h2>
                <p>{activeConversation.status}</p>
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
            {activeConversation.messages.map((message) => (
              <article
                key={message.id}
                className={`messages-page__message messages-page__message--${message.sender}`}
              >
                <div className="messages-page__bubble">{message.body}</div>
                <span className="messages-page__timestamp">{message.time}</span>
              </article>
            ))}
          </div>

          <form className="messages-page__composer" onSubmit={handleSubmitMessage}>
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
              />
            </label>

            <button
              type="submit"
              className="messages-page__send-button"
              aria-label="Send message"
              disabled={!draft.trim()}
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
