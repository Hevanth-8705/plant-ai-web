import React from 'react';
import { 
  Bell, 
  Droplets, 
  FlaskConical, 
  Apple, 
  HeartPulse, 
  CheckCheck, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext.tsx';
import { Button } from '../components/common/Button.tsx';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    requestBrowserPermission, 
    browserPermission 
  } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'water':
        return <Droplets className="w-5 h-5 text-sky-600" />;
      case 'fertilize':
        return <FlaskConical className="w-5 h-5 text-purple-600" />;
      case 'harvest':
        return <Apple className="w-5 h-5 text-amber-600" />;
      case 'health':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-emerald-700" /> Notifications &amp; Care Alerts
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time garden reminders generated from your saved plant schedules
          </p>
        </div>

        <div className="flex items-center gap-2">
          {browserPermission !== 'granted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={requestBrowserPermission}
            >
              Enable Browser Alerts
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            icon={<CheckCheck className="w-4 h-4" />}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-10 h-10 text-stone-300 mx-auto" />
            <h4 className="font-bold text-stone-800 text-sm">No notifications right now</h4>
            <p className="text-xs text-stone-400">All watering, feeding, and harvests are up to date.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.read) markAsRead(notif.id);
                if (notif.actionUrl) onNavigate(notif.actionUrl.replace('/', ''));
              }}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                notif.read ? 'bg-white hover:bg-stone-50/70' : 'bg-emerald-50/40 hover:bg-emerald-50/70'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-stone-100 shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-stone-900 text-sm">{notif.title}</h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400 shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
