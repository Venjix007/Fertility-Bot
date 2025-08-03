import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { ChatInterface } from './components/chat/ChatInterface';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { useAuth } from './contexts/AuthContext';
import { supabase, Conversation } from './lib/supabase';

function MainApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setSelectedConversation(null);
  };

  const handleConversationCreated = (conversation: Conversation) => {
    setConversations(prev => [conversation, ...prev]);
    setSelectedConversation(conversation);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        onNewConversation={handleNewConversation}
        onRefreshConversations={loadConversations}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-hidden">
          <ChatInterface
            conversation={selectedConversation}
            onConversationCreated={handleConversationCreated}
          />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route 
                path="/login" 
                element={
                  <AuthGuard requireAuth={false}>
                    <LoginForm />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <AuthGuard requireAuth={false}>
                    <RegisterForm />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/forgot-password" 
                element={
                  <AuthGuard requireAuth={false}>
                    <ForgotPasswordForm />
                  </AuthGuard>
                } 
              />
              <Route 
                path="/" 
                element={
                  <AuthGuard requireAuth={true}>
                    <MainApp />
                  </AuthGuard>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;