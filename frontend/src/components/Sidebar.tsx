import { useAppStore } from '../store/appStore';
import { Plus, MessageSquare, Trash2, Settings as SettingsIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const {
    conversations,
    currentConversationId,
    isSidebarCollapsed,
    createConversation,
    deleteConversation,
    setCurrentConversation,
    setSidebarCollapsed,
    setSettingsOpen,
  } = useAppStore();

  if (isSidebarCollapsed) {
    return (
      <div className="sidebar collapsed">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <ChevronRight size={20} />
        </button>
        <button
          className="icon-button"
          onClick={createConversation}
          aria-label="New conversation"
          title="New conversation"
        >
          <Plus size={20} />
        </button>
        <button
          className="icon-button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
          title="Settings"
        >
          <SettingsIcon size={20} />
        </button>
      </div>
    );
  }

  return (
    <aside className="sidebar" role="navigation" aria-label="Conversations">
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M20 10H4v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8ZM9 13v-1h6v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z" clipRule="evenodd"/>
            <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 1 1 0 4H4a2 2 0 0 1-2-2Z"/>
          </svg>
        </h1>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(true)}
          aria-label="Collapse sidebar"
          title="Collapse sidebar"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <button
        className="new-chat-button"
        onClick={createConversation}
        aria-label="Start new conversation"
      >
        <Plus size={20} />
        <span>New Conversation</span>
      </button>

      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div className="conversations-empty">
            <p>No conversations yet</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${
                conv.id === currentConversationId ? 'active' : ''
              }`}
              onClick={() => setCurrentConversation(conv.id)}
              role="button"
              tabIndex={0}
              aria-label={`Conversation: ${conv.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setCurrentConversation(conv.id);
                }
              }}
            >
              <MessageSquare size={18} className="conversation-icon" />
              <span className="conversation-title">{conv.title}</span>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this conversation?')) {
                    deleteConversation(conv.id);
                  }
                }}
                aria-label="Delete conversation"
                title="Delete conversation"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        <button
          className="settings-button"
          onClick={() => setSettingsOpen(true)}
          aria-label="Open settings"
        >
          <SettingsIcon size={20} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
