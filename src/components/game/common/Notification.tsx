"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface NotificationProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: (id: string) => void;
}

export function Notification({ id, message, type, onClose }: NotificationProps) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-950/50 border-green-700/50',
    error: 'bg-red-950/50 border-red-700/50',
    info: 'bg-blue-950/50 border-blue-700/50'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'border rounded-sm p-3 shadow-lg flex items-start w-full max-w-sm',
        'backdrop-blur-sm',
        bgColors[type]
      )}
    >
      <div className="mr-2 flex-shrink-0 pt-0.5">
        {icons[type]}
      </div>
      <div className="flex-1 mr-2">
        <p className="text-sm text-gray-200">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-gray-400 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface NotificationContainerProps {
  notifications: {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }[];
  onClose: (id: string) => void;
}

export function NotificationContainer({ notifications, onClose }: NotificationContainerProps) {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Notification
              id={notification.id}
              message={notification.message}
              type={notification.type}
              onClose={onClose}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
