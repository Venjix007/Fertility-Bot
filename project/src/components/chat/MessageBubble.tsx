
import { Message } from '../../lib/supabase';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  const timestamp = new Date(message.created_at).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`group w-full flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start max-w-3xl w-full`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isOwnMessage ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${
            isOwnMessage
              ? 'bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-800/30 text-primary-600 dark:text-primary-400'
              : 'bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-700/50 dark:to-neutral-800/50 text-neutral-600 dark:text-neutral-300'
          }`}>
            {isOwnMessage ? (
              <User className="w-4.5 h-4.5" strokeWidth={2} />
            ) : (
              <Bot className="w-4.5 h-4.5" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl max-w-[90%] md:max-w-[80%] ${
            isOwnMessage
              ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-700/50 rounded-tl-sm shadow-sm backdrop-blur-sm'
          }`}>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 px-1.5">
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  );
}