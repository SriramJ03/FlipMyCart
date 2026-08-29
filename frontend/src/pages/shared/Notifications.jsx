import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime } from '../../utils/format';
import Loader from '../../components/Loader';

export default function Notifications() {
  const { notifications, markRead, markAllRead } = useNotifications();

  if (notifications === undefined) return <Loader />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-panel-header">
        <h1>Notifications</h1>
        <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all as read</button>
      </div>
      {notifications.length === 0 ? (
        <p className="empty-state">No notifications yet.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n._id} className={n.isRead ? 'notification-item' : 'notification-item unread'} onClick={() => !n.isRead && markRead(n._id)}>
              <div className="notification-item-header">
                <strong>{n.title}</strong>
                <span>{formatDateTime(n.createdAt)}</span>
              </div>
              <p>{n.message}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
