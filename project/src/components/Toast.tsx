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



  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ${isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="absolute inset-0 bg-black/20" onClick={onClose}></div>
      <div 
        className={`relative px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md bg-white/90 border border-white/30 max-w-sm mx-4 transform transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-90'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            type === 'success' ? 'bg-green-100' : 
            type === 'error' ? 'bg-red-100' : 
            type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
          }`}>
            {type === 'success' && <span className="text-xl">✅</span>}
            {type === 'error' && <span className="text-xl">❌</span>}
            {type === 'warning' && <span className="text-xl">⚠️</span>}
            {type === 'info' && <span className="text-xl">ℹ️</span>}
          </div>
          <div className="flex-1">
            <p className={`font-medium ${
              type === 'success' ? 'text-green-700' : 
              type === 'error' ? 'text-red-700' : 
              type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
            }`}>{message}</p>
          </div>
        </div>
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