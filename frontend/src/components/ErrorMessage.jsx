import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
        <AlertCircle className="w-5 h-5" />
        <p className="font-medium">Error</p>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary mt-4">
          Try Again
        </button>
      )}
    </div>
  );
}
