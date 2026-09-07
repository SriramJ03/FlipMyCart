import { useEffect, useState, useCallback } from 'react';
import { getMyConversationsApi, getConversationMessagesApi, sendMessageApi } from '../../api/chat';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/format';
import Loader from '../../components/Loader';
import ErrorMessage, { extractErrorMessage } from '../../components/ErrorMessage';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [thread, setThread] = useState({ conversation: null, messages: [] });
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConversations = useCallback(() => {
    getMyConversationsApi().then((res) => {
      setConversations(res.data);
      if (res.data.length && !activeId) setActiveId(res.data[0]._id);
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(loadConversations, [loadConversations]);

  useEffect(() => {
    if (!activeId) return;
    getConversationMessagesApi(activeId).then((res) => setThread(res.data)).catch((err) => setError(extractErrorMessage(err)));
  }, [activeId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setError('');
    try {
      await sendMessageApi(activeId, draft);
      setDraft('');
      const res = await getConversationMessagesApi(activeId);
      setThread(res.data);
      loadConversations();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <h1>Messages</h1>
      <ErrorMessage message={error} />
      {conversations.length === 0 ? (
        <p className="empty-state">No conversations yet.</p>
      ) : (
        <div className="messages-layout">
          <ul className="conversation-list">
            {conversations.map((c) => (
              <li key={c._id} className={c._id === activeId ? 'active' : ''} onClick={() => setActiveId(c._id)}>
                <strong>{c.productName || 'Conversation'}</strong>
                <p>{c.lastMessage}</p>
                <span>{formatDateTime(c.lastMessageAt)}</span>
              </li>
            ))}
          </ul>
          <div className="message-thread">
            {thread.messages.length === 0 ? (
              <p className="empty-state">No messages in this conversation yet.</p>
            ) : (
              <div className="message-scroll">
                {thread.messages.map((m) => (
                  <div key={m._id} className={m.senderId === user.userId ? 'message-bubble mine' : 'message-bubble'}>
                    <p>{m.message}</p>
                    <span>{formatDateTime(m.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
            <form className="message-compose" onSubmit={handleSend}>
              <input placeholder="Type a message..." value={draft} onChange={(e) => setDraft(e.target.value)} />
              <button type="submit" className="btn btn-primary btn-sm">Send</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
