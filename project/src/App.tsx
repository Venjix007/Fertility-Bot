import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
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
    <div className="flex h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 transition-colors duration-200">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        onNewConversation={handleNewConversation}
        onRefreshConversations={loadConversations}
        loading={loading}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-hidden p-4 md:p-6">
          <div className="h-full bg-white dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700/50 overflow-hidden flex flex-col">
            <ChatInterface
              conversation={selectedConversation}
              onConversationCreated={handleConversationCreated}
            />
          </div>
        </main>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100 dark:bg-primary-900/20 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-100 dark:bg-secondary-900/20 rounded-full -ml-48 -mb-48 opacity-50 blur-3xl"></div>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
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
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;