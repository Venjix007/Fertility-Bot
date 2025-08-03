import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start max-w-3xl">
        {/* Avatar */}
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
        </div>

        {/* Typing Animation */}
        <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}