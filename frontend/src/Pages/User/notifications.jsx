import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import Loader from '../../components/loader';
import api from '../../api/axios';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      alert('Failed to mark notifications as read.');
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.read) {
        await api.put(`/notifications/${notif._id}/read`);
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n));
      }
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking_request':
        return { icon: 'calendar_month', cls: 'bg-primary/10 text-primary' };
      case 'booking_accepted':
        return { icon: 'check_circle', cls: 'bg-emerald-50 text-emerald-500' };
      case 'booking_rejected':
        return { icon: 'cancel', cls: 'bg-red-50 text-red-500' };
      case 'booking_completed':
        return { icon: 'done_all', cls: 'bg-green-50 text-green-600' };
      default:
        return { icon: 'notifications', cls: 'bg-slate-100 text-slate-500' };
    }
  };

  const hasUnread = notifications.some(n => !n.read);

  return (
    <SidebarLayout>
      <div className="flex flex-col h-full bg-[#f9fafb] p-6 lg:p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <span className="bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20">
              User Alerts
            </span>
            <h1 className="text-2xl font-black text-on-background mt-3">Notifications</h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Stay updated on your booking requests, approvals, and culinary experiences.
            </p>
          </div>

          {hasUnread && (
            <button
              onClick={handleMarkAllRead}
              className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 border border-outline-variant hover:border-primary bg-white hover:bg-primary/5 rounded-xl text-xs font-bold text-on-surface-variant hover:text-primary transition-all shadow-sm active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center text-error py-12">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-outline-variant p-12 text-center max-w-lg mx-auto shadow-sm mt-12 space-y-5">
            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <span className="material-symbols-outlined text-3xl">notifications_off</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-background">No Notifications Yet</h3>
              <p className="text-sm text-on-surface-variant mt-1.5 leading-relaxed">
                When you make booking requests or receive approvals from cooks, you'll see alerts and status changes right here.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-outline-variant overflow-hidden shadow-sm max-w-4xl">
            {notifications.map((n, i) => {
              const item = getIcon(n.type);
              return (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`flex gap-4 p-5 cursor-pointer transition-all duration-150 border-b border-outline-variant last:border-0 hover:bg-slate-50/50 ${!n.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${item.cls}`}>
                    <span className="material-symbols-outlined text-xl">{item.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className={`text-sm font-bold text-on-background ${!n.read ? 'font-black' : ''}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{' '}
                        {new Date(n.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
