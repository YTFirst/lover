import React, { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div 
      className={`fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
      style={{
        background: typeClasses[type],
      }}
    >
      <div className="flex items-center gap-2">
        {type === 'success' && <span className="text-lg">✅</span>}
        {type === 'error' && <span className="text-lg">❌</span>}
        {type === 'warning' && <span className="text-lg">⚠️</span>}
        {type === 'info' && <span className="text-lg">ℹ️</span>}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

// Toast manager hook
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    addToast,
    removeToast,
  };
};