import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatInterface } from '../components/chat/ChatInterface';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { vi, describe, it, expect } from 'vitest';
import { Conversation } from '../lib/supabase';

// Mock the supabase client
vi.mock('../lib/supabase', () => ({
  __esModule: true,
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } })
    }
  }
}));

describe('ChatInterface', () => {
  const mockConversation: Omit<Conversation, 'last_message' | 'is_archived'> = {
    id: 'test-conversation',
    title: 'Test Conversation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'test-user'
  };

  const renderChat = () => {
    return render(
      <AuthProvider>
        <LanguageProvider>
          <ChatInterface 
            conversation={mockConversation} 
            onConversationCreated={vi.fn()} 
          />
        </LanguageProvider>
      </AuthProvider>
    );
  };

  it('sends messages with the selected language', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: 'Test response' })
    });

    renderChat();
    
    // Change language to Hindi
    const languageButton = screen.getByRole('button', { name: /language/i });
    fireEvent.click(languageButton);
    
    const hindiOption = await screen.findByText('हिंदी');
    fireEvent.click(hindiOption);
    
    // Type and send a message
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'नमस्ते' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Verify the request includes the correct language
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"language":"hi"')
        })
      );
    });
  });

  it('displays messages in the selected language', async () => {
    // Mock messages with different languages
    const mockMessages = [
      {
        id: '1',
        conversation_id: 'test-conversation',
        role: 'user',
        content: 'नमस्ते',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        conversation_id: 'test-conversation',
        role: 'assistant',
        content: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?',
        created_at: new Date().toISOString()
      }
    ];

    // Mock the messages fetch
    vi.mocked(require('../lib/supabase').supabase.from).mockImplementation(() => ({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockMessages, error: null })
    } as any));

    renderChat();
    
    // Verify Hindi messages are displayed
    const message1 = await screen.findByText('नमस्ते');
    const message2 = await screen.findByText('नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?');
    expect(message1).toBeTruthy();
    expect(message2).toBeTruthy();
  });

  it('handles language switching mid-conversation', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'Test response in English' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'हिंदी में परीक्षण प्रतिक्रिया' })
      });

    renderChat();
    
    // Send a message in English
    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Change language to Hindi
    const languageButton = screen.getByRole('button', { name: /language/i });
    fireEvent.click(languageButton);
    
    const hindiOption = await screen.findByText('हिंदी');
    fireEvent.click(hindiOption);
    
    // Send a message in Hindi
    fireEvent.change(input, { target: { value: 'नमस्ते' } });
    fireEvent.click(sendButton);
    
    // Verify both requests were made with the correct languages
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // First call should be in English
      expect(global.fetch).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"language":"en"')
        })
      );
      
      // Second call should be in Hindi
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"language":"hi"')
        })
      );
    });
  });
});
