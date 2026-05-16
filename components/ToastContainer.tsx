import React, { useEffect, useState, useRef } from 'react';
import { AppState, Notification } from '../types';
import Toast from './Toast';

interface ToastContainerProps {
  state: AppState | null;
  onToastClick: () => void;
}

interface ActiveToast extends Notification {
  visible: boolean;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ state, onToastClick }) => {
  const [activeToasts, setActiveToasts] = useState<ActiveToast[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const shownNotificationIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!state?.notifications) return;

    // On first load, mark all existing notifications as "shown" so we don't toast them
    if (isFirstLoad.current) {
      state.notifications.forEach(n => shownNotificationIds.current.add(n.id));
      isFirstLoad.current = false;
      return;
    }

    // Find new notifications that haven't been shown yet (check ID + Message to allow updates to pop up)
    const newNotifications = state.notifications.filter(
      n => !shownNotificationIds.current.has(`${n.id}-${n.message}`)
    );

    if (newNotifications.length > 0) {
      const toastsToAdd = newNotifications.map(n => {
        shownNotificationIds.current.add(`${n.id}-${n.message}`);
        return { ...n, visible: true };
      });

      setActiveToasts(prev => [...prev, ...toastsToAdd]);
    }
  }, [state?.notifications]);

  const removeToast = (id: string) => {
    setActiveToasts(prev => {
      const filtered = prev.filter(t => t.id !== id);
      // Move to next notification in queue
      if (currentIndex < filtered.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setCurrentIndex(0);
      }
      return filtered;
    });
  };

  // Show only one toast at a time, the current one in the queue
  const currentToast = activeToasts[currentIndex];

  return (
    <div 
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] p-6 w-full max-w-sm pointer-events-none flex flex-col-reverse items-center"
      style={{
        zIndex: 9999
      }}
    >
      {currentToast && (
        <Toast
          key={currentToast.id}
          id={currentToast.id}
          type={currentToast.type}
          title={currentToast.title}
          message={currentToast.message}
          onClose={removeToast}
          onClick={() => {
            onToastClick();
            removeToast(currentToast.id);
          }}
        />
      )}
    </div>
  );
};

export default ToastContainer;
