import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Conversation, Message } from '../../lib/supabase';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { StarterPrompts } from './StarterPrompts';
import { Loader2, ChevronRight } from 'lucide-react';

interface ChatInterfaceProps {
  conversation: Conversation | null;
  onConversationCreated: (conversation: Conversation) => void;
}

// Define quick reply suggestions based on message content
const getQuickReplies = (message: string): string[] => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('fertility assessment') || lowerMessage.includes('health indicators')) {
    return [
      "What are common fertility tests?",
      "When should we see a specialist?",
      "What lifestyle changes can help?"
    ];
  }
  
  if (lowerMessage.includes('cycle') || lowerMessage.includes('tracking')) {
    return [
      "What's the best tracking method?",
      "How to identify ovulation?",
      "What if my cycle is irregular?"
    ];
  }
  
  if (lowerMessage.includes('test') || lowerMessage.includes('diagnostic')) {
    return [
      "Are these tests painful?",
      "How accurate are the results?",
      "What do the results mean?"
    ];
  }
  
  if (lowerMessage.includes('partner') || lowerMessage.includes('support')) {
    return [
      "How can we reduce stress?",
      "What should we expect emotionally?",
      "How to communicate better?"
    ];
  }
  
  // Default quick replies
  return [
    "Tell me more about fertility testing",
    "How can I track my ovulation?",
    "What lifestyle changes can help?"
  ];
};

export function ChatInterface({ conversation, onConversationCreated }: ChatInterfaceProps) {
  const sendingRef = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [conversation]);

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

  const handleQuickReply = (reply: string) => {
    // Clear quick replies when one is selected
    setSuggestedReplies([]);
    // Send the quick reply as a new message
    void handleSendMessage(reply);
  };

  const handleSendMessage = async (content: string) => {
    if (sendingRef.current) return; // prevent duplicate simultaneous sends
    sendingRef.current = true;
    if (!content.trim() || !user) return;

    // Clear any existing quick replies when a new message is sent
    setSuggestedReplies([]);
    
    const newMessage: Omit<Message, 'id' | 'created_at'> = {
      conversation_id: conversation?.id || '',
      content,
      role: 'user',
    };

    try {
      setIsTyping(true);
      setError('');

      // If no conversation exists, create one
      let currentConversation = conversation;
      if (!currentConversation) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert([{ user_id: user.id, title: content.substring(0, 50) }])
          .select()
          .single();

        if (convError) throw convError;
        currentConversation = newConversation;
        onConversationCreated(newConversation);
        newMessage.conversation_id = newConversation.id;
      }

      // Save user message to local state immediately for instant feedback
      const userMessage: Message = {
        ...newMessage,
        id: `temp-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Save to database in the background
      const { error: messageError } = await supabase
        .from('messages')
        .insert([newMessage]);

      if (messageError) {
        console.error('Error saving message:', messageError);
        // Remove the optimistic update if there's an error
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        throw messageError;
      }

      if (!currentConversation) {
        throw new Error('No active conversation');
      }

      // Get AI response
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-with-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          conversationId: currentConversation.id,
          message: content,
          conversationHistory: messages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .map(m => ({ role: m.role, content: m.content }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const { response: aiResponse } = await response.json();

      // Create AI message for local state
      const tempAiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        conversation_id: currentConversation.id,
        content: aiResponse,
        role: 'assistant',
        created_at: new Date().toISOString(),
      };
      
      // Update UI immediately with the AI response
      setMessages(prev => [...prev, tempAiMessage]);
      
      // Save AI response to database in the background
      const aiMessage: Omit<Message, 'id' | 'created_at'> = {
        conversation_id: currentConversation.id,
        content: aiResponse,
        role: 'assistant',
      };

      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert([aiMessage]);

      if (aiMessageError) {
        console.error('Error saving AI message:', aiMessageError);
        // Remove the optimistic update if there's an error
        setMessages(prev => prev.filter(m => m.id !== tempAiMessage.id));
        throw aiMessageError;
      }
      
      // Generate quick replies based on the AI's response
      setSuggestedReplies(getQuickReplies(aiResponse));
      
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
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
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome to FertilityCare AI</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              I'm here to provide information and support on your fertility journey. How can I help you today?
            </p>
            <StarterPrompts onPromptClick={handleSendMessage} />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            {suggestedReplies.length > 0 && !isTyping && (
              <div className="flex flex-wrap gap-2 mt-2 mb-4 px-4">
                {suggestedReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    {reply}
                    <ChevronRight className="ml-1 w-4 h-4" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 pb-2">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <ChatInput onSendMessage={(message) => handleSendMessage(message)} disabled={isTyping} placeholder="Ask me about fertility, ovulation, lifestyle factors..." />
      </div>
    </div>
  );
}