import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-5 h-5',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.default} text-emerald-600 dark:text-emerald-400 animate-spin`} />
      {message && <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
