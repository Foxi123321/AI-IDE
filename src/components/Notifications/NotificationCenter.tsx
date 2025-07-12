import React, { useEffect } from 'react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Notification } from '../../types';

interface NotificationCenterProps {
  notifications: Notification[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications }) => {
  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach((notification) => {
      if (!notification.isRead) {
        const timer = setTimeout(() => {
          // TODO: Mark notification as read
          console.log(`Auto-dismiss notification: ${notification.id}`);
        }, 5000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [notifications]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const handleDismiss = (notificationId: string) => {
    // TODO: Remove notification
    console.log(`Dismiss notification: ${notificationId}`);
  };

  const visibleNotifications = notifications
    .filter(n => !n.isRead)
    .slice(0, 5); // Show max 5 notifications

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {visibleNotifications.map((notification) => {
        const Icon = getIcon(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`notification ${notification.type} animate-slide-in`}
          >
            <div className="flex items-start gap-3">
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {notification.title}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {notification.message}
                </div>
                
                {notification.actions && notification.actions.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {notification.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.action}
                        className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-xs opacity-70 mt-2">
              {notification.timestamp.toLocaleTimeString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationCenter;