import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase, Conversation, Message } from '../../lib/supabase';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { StarterPrompts } from './StarterPrompts';
import { Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  conversation: Conversation | null;
  onConversationCreated: (conversation: Conversation) => void;
}

// Define quick reply suggestions based on message content and language
const getQuickReplies = (message: string, language: 'en' | 'hi' | 'gu' = 'en'): string[] => {
  const lowerMessage = message.toLowerCase();

  // Define all quick replies in all supported languages
  const replies: Record<string, Record<string, string[]>> = {
    'fertility': {
      en: [
        "What are common fertility tests?",
        "When should we see a specialist?",
        "What lifestyle changes can help?"
      ],
      hi: [
        "सामान्य प्रजनन परीक्षण क्या हैं?",
        "हमें विशेषज्ञ से कब मिलना चाहिए?",
        "कौन से जीवनशैली परिवर्तन मदद कर सकते हैं?"
      ],
      gu: [
        "સામાન્ય ફર્ટિલિટી ટેસ્ટ શું છે?",
        "અમે સ્પેશિયલિસ્ટ પાસે ક્યારે જવું જોઈએ?",
        "કયા જીવનશૈલીના ફેરફારો મદદ કરી શકે છે?"
      ]
    },
    'cycle': {
      en: [
        "What's the best tracking method?",
        "How to identify ovulation?",
        "What if my cycle is irregular?"
      ],
      hi: [
        "सबसे अच्छी ट्रैकिंग विधि क्या है?",
        "ओव्यूलेशन की पहचान कैसे करें?",
        "अगर मेरा चक्र अनियमित है तो क्या होगा?"
      ],
      gu: [
        "શ્રેષ્ઠ ટ્રેકિંગ પદ્ધતિ કઈ છે?",
        "ઓવ્યુલેશનની ઓળખ કેવી રીતે કરવી?",
        "જો મારું ચક્ર અનિયમિત હોય તો શું?"
      ]
    },
    'test': {
      en: [
        "Are these tests painful?",
        "How accurate are the results?",
        "What do the results mean?"
      ],
      hi: [
        "क्या ये परीक्षण दर्दनाक हैं?",
        "परिणाम कितने सटीक हैं?",
        "परिणामों का क्या मतलब है?"
      ],
      gu: [
        "શું આ ટેસ્ટમાં દુખાવો થાય છે?",
        "પરિણામો કેટલા ચોક્કસ છે?",
        "પરિણામોનો શું અર્થ થાય છે?"
      ]
    },
    'partner': {
      en: [
        "How can we reduce stress?",
        "What should we expect emotionally?",
        "How to communicate better?"
      ],
      hi: [
        "हम तनाव को कैसे कम कर सकते हैं?",
        "भावनात्मक रूप से हमें क्या उम्मीद करनी चाहिए?",
        "बेहतर संवाद कैसे करें?"
      ],
      gu: [
        "અમે તણાવ કેવી રીતે ઘટાડી શકીએ?",
        "ભાવનાત્મક રીતે અમારે શું અપેક્ષા રાખવી જોઈએ?",
        "વધુ સારી રીતે કેવી રીતે વાતચીત કરવી?"
      ]
    },
    'default': {
      en: [
        "Tell me more about fertility testing",
        "How can I track my ovulation?",
        "What lifestyle changes can help?"
      ],
      hi: [
        "प्रजनन परीक्षण के बारे में और बताएं",
        "मैं अपने ओव्यूलेशन को कैसे ट्रैक कर सकता हूं?",
        "कौन से जीवनशैली परिवर्तन मदद कर सकते हैं?"
      ],
      gu: [
        "ફર્ટિલિટી ટેસ્ટિંગ વિશે વધુ જણાવો",
        "હું મારા ઓવ્યુલેશનને કેવી રીતે ટ્રેક કરી શકું?",
        "કયા જીવનશૈલીના ફેરફારો મદદ કરી શકે છે?"
      ]
    }
  };

  // Determine which set of replies to use based on message content
  if (lowerMessage.includes('fertility assessment') || lowerMessage.includes('health indicators')) {
    return replies.fertility[language] || replies.fertility.en;
  }

  if (lowerMessage.includes('cycle') || lowerMessage.includes('tracking')) {
    return replies.cycle[language] || replies.cycle.en;
  }

  if (lowerMessage.includes('test') || lowerMessage.includes('diagnostic')) {
    return replies.test[language] || replies.test.en;
  }

  if (lowerMessage.includes('partner') || lowerMessage.includes('support')) {
    return replies.partner[language] || replies.partner.en;
  }

  // Return default replies in the selected language
  return replies.default[language] || replies.default.en;
};

export function ChatInterface({ conversation, onConversationCreated }: ChatInterfaceProps): JSX.Element {
  const sendingRef = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { language } = useLanguage();

  if (!user) {
    return <div>Please sign in to use the chat</div>;
  }

  // More robust scroll to bottom function
  const scrollToBottom = useCallback(() => {
    const scrollToBottomImmediate = () => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTop = container.scrollHeight;
      }
    };

    // Immediate scroll
    scrollToBottomImmediate();

    // Also scroll after a small delay to ensure DOM updates
    setTimeout(scrollToBottomImmediate, 50);
    setTimeout(scrollToBottomImmediate, 200);
  }, []);

  // Scroll to bottom when messages change or typing status changes
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isTyping, scrollToBottom]);

  // Also scroll when messages content changes (not just length)
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversation]);

  // Generate suggested replies when messages or language changes
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && lastMessage.content) {
        const replies = getQuickReplies(lastMessage.content, language);
        setSuggestedReplies(replies);
      } else {
        setSuggestedReplies([]);
      }
    } else {
      setSuggestedReplies([]);
    }
  }, [messages, language]);

  const loadMessages = async () => {
    if (!conversation) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = async (reply: string) => {
    if (loading || isTyping || sendingRef.current) return;

    // Clear any existing suggested replies
    setSuggestedReplies([]);

    // Process the message through the normal send flow
    await handleSendMessage(reply);
  };

  const handleSendMessage = async (content: string) => {
    // Prevent multiple sends at once
    if (sendingRef.current || !content.trim() || !user) return;
    sendingRef.current = true;
    
    // Clear any existing errors and suggestions
    setError('');
    setSuggestedReplies([]);
    
    try {

      let currentConversation = conversation;

      // If no conversation exists, create one first
      if (!currentConversation) {
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError || !newConversation) {
          console.error('Error creating conversation:', createError);
          throw new Error('Failed to start a new conversation.');
        }
        currentConversation = newConversation;
        onConversationCreated(newConversation);
      }

      if (!currentConversation) {
        throw new Error('Conversation could not be established.');
      }

      // Add user message to the UI immediately
      const userMessage: Message = {
        id: `temp-user-${Date.now()}`,
        conversation_id: currentConversation.id,
        content,
        role: 'user',
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      // Save user message to DB (don't wait for it)
      supabase.from('messages').insert({ conversation_id: currentConversation.id, content, role: 'user' }).then(({ error }) => {
        if (error) console.error('Error saving user message:', error);
      });

      if (!currentConversation) {
        throw new Error('Conversation could not be established.');
      }
      const finalConversation = currentConversation;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          conversationId: finalConversation.id,
          message: content,
          language: language, // Include the selected language
          conversationHistory: messages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const { response: aiResponse } = await response.json();

      // Stop typing indicator
      setIsTyping(false);

      const tempAiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        conversation_id: finalConversation.id,
        content: aiResponse,
        role: 'assistant',
        created_at: new Date().toISOString(),
      };

      // Add AI message and trigger scroll
      setMessages(prev => {
        const newMessages = [...prev, tempAiMessage];
        // Trigger scroll after state update
        setTimeout(() => scrollToBottom(), 0);
        return newMessages;
      });

      try {
        // Save the AI message to the database
        const aiMessage: Omit<Message, 'id' | 'created_at'> = {
          conversation_id: finalConversation.id,
          content: aiResponse,
          role: 'assistant'
        };

        const { data: savedAiMessage, error: aiMessageError } = await supabase
          .from('messages')
          .insert([aiMessage])
          .select()
          .single();

        if (aiMessageError || !savedAiMessage) {
          console.error('Error saving AI message:', aiMessageError);
          throw aiMessageError || new Error('Failed to save AI message');
        }

        // Replace the temporary AI message with the saved one
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempAiMessage.id
              ? { ...savedAiMessage, created_at: savedAiMessage.created_at }
              : msg
          )
        );
      } catch (err) {
        console.error('Error saving AI message:', err);
      }
    } catch (err) {
      console.error('Error in message handling:', err);
      setError('An error occurred while processing your message.');
      setIsTyping(false);
    } finally {
      sendingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {messages.length === 0 && !loading && !conversation ? (
          <div className="h-full flex items-center justify-center px-4 py-8">
            <div className="max-w-2xl w-full text-center px-4 py-8">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/30 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="text-2xl">💬</div>
              </div>
              <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-3">Welcome to FertilityCare AI</h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                I'm here to help answer your fertility questions. How can I assist you today?
              </p>
              <div className="mt-6">
                <StarterPrompts onSelect={handleQuickReply} />
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full px-4 py-6 space-y-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.role === 'user' || !!(user && 'sender_id' in message && message.sender_id === user.id)}
              />
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-50 dark:from-neutral-700/50 dark:to-neutral-800/50 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <div className="text-neutral-600 dark:text-neutral-300">🤖</div>
                </div>
                <div className="flex-1">
                  <TypingIndicator />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start space-x-2">
                <div className="text-red-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{error}</span>
              </div>
            )}

            {/* Scroll anchor - this ensures we always scroll to the bottom */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Replies */}
      {suggestedReplies.length > 0 && !isTyping && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 animate-fade-in">
          {suggestedReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              className="px-4 py-2 text-sm bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-200 hover:bg-pink-100 dark:hover:bg-pink-800/30 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
              disabled={loading || isTyping || sendingRef.current}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-neutral-100 dark:border-neutral-700/50 p-4 bg-white/50 dark:bg-neutral-800/30 backdrop-blur-sm">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={loading || isTyping || sendingRef.current}
        />
      </div>
    </div>
  );
}