import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import { Notification } from '../../types';
import { useAppStore } from '../../stores/AppStore';

interface NotificationCenterProps {
  notifications: Notification[];
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications }) => {
  const { removeNotification, markNotificationRead } = useAppStore();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-400/20 bg-green-400/5';
      case 'error':
        return 'border-red-400/20 bg-red-400/5';
      case 'warning':
        return 'border-yellow-400/20 bg-yellow-400/5';
      case 'info':
      default:
        return 'border-blue-400/20 bg-blue-400/5';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markNotificationRead(notification.id);
    }
  };

  const handleDismiss = (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeNotification(notificationId);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification.id}
          className={`
            p-4 rounded-lg border shadow-lg backdrop-blur-sm cursor-pointer
            transition-all duration-300 animate-slide-in
            ${getNotificationColor(notification.type)}
            ${notification.isRead ? 'opacity-70' : ''}
          `}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm text-editor-text truncate">
                  {notification.title}
                </h4>
                <button
                  onClick={(e) => handleDismiss(notification.id, e)}
                  className="p-1 hover:bg-black/10 rounded text-editor-text-muted hover:text-editor-text transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              
              <p className="text-xs text-editor-text-muted mb-2">
                {notification.message}
              </p>
              
              <div className="flex items-center justify-between text-xs text-editor-text-muted">
                <span>{notification.timestamp.toLocaleTimeString()}</span>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-ai-primary rounded-full"></div>
                )}
              </div>
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.action();
                      }}
                      className="text-xs px-2 py-1 bg-editor-accent text-white rounded hover:bg-editor-accent/80 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {notifications.length > 5 && (
        <div className="p-2 text-center text-xs text-editor-text-muted bg-editor-surface/80 backdrop-blur-sm rounded border border-editor-border">
          <Bell className="w-3 h-3 inline mr-1" />
          +{notifications.length - 5} more notifications
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;