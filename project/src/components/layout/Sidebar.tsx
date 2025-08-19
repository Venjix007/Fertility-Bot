import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Conversation } from '../../lib/supabase';
import { 
  Plus, 
  MessageSquare, 
  Settings, 
  LogOut, 
  User, 
  X,
  Menu,
  Heart
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation | null) => void;
  onNewConversation: () => void;
  onRefreshConversations: () => void;
  loading: boolean;
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  onNewConversation,
  onRefreshConversations,
  loading
}: SidebarProps) {
  const { user, profile, signOut } = useAuth();

  const handleNewConversation = () => {
    onNewConversation();
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    onSelectConversation(conversation);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 w-80 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg border-r border-neutral-100 dark:border-neutral-700/50 transform transition-all duration-300 ease-in-out shadow-lg
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-700/50 bg-white/80 dark:bg-neutral-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/50 rounded-xl flex items-center justify-center shadow-sm">
                <Heart className="w-5 h-5 text-primary-600 dark:text-primary-300" />
              </div>
              <div>
                <h2 className="font-bold text-neutral-800 dark:text-white text-lg">FertilityCare AI</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Your fertility companion</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={handleNewConversation}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Conversation</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-neutral-100 dark:bg-neutral-700/50 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => {
                  const isActive = selectedConversation?.id === conversation.id;
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleSelectConversation(conversation)}
                      className={`w-full flex items-start space-x-3 p-3 rounded-xl transition-all duration-200 text-left group ${
                        isActive 
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 shadow-sm'
                          : 'hover:bg-neutral-50/80 dark:hover:bg-neutral-700/50 border border-transparent hover:border-neutral-100 dark:hover:border-neutral-700/50'
                      }`}
                    >
                      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive 
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'bg-neutral-100 dark:bg-neutral-700/50 text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500'
                      }`}>
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          isActive 
                            ? 'text-primary-700 dark:text-primary-200' 
                            : 'text-neutral-800 dark:text-neutral-200'
                        }`}>
                          {conversation.title || 'New Conversation'}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isActive 
                            ? 'text-primary-500/80 dark:text-primary-400/80' 
                            : 'text-neutral-500 dark:text-neutral-400'
                        }`}>
                          {new Date(conversation.created_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </button>
                  );
                })}
                
                {conversations.length === 0 && (
                  <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                    <div className="w-14 h-14 mx-auto mb-4 bg-neutral-100 dark:bg-neutral-700/50 rounded-2xl flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 opacity-70" />
                    </div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">No conversations yet</p>
                    <p className="text-xs mt-1 text-neutral-500 dark:text-neutral-400">Start a new chat to begin your journey</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Language Selector */}
          <div className="border-t border-neutral-100 dark:border-neutral-700/50 p-4">
            <div className="mb-3">
              <label htmlFor="language-select" className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1.5">
                Language
              </label>
              <div className="relative">
                <select
                  id="language-select"
                  onChange={(e) => {
                    const lang = e.target.value as 'en' | 'hi' | 'gu';
                    // Update language in context
                    document.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी (Hindi)</option>
                  <option value="gu">ગુજરાતી (Gujarati)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* User Profile & Settings */}
          <div className="border-t border-neutral-100 dark:border-neutral-700/50 p-4 space-y-3 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 p-2.5 rounded-xl bg-white dark:bg-neutral-800/80 shadow-sm border border-neutral-100 dark:border-neutral-700/30">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 dark:text-white truncate">
                  {profile?.name || user?.email?.split('@')[0]}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-red-100 dark:border-red-900/30"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
            
            <div className="pt-2 text-center">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                FertilityCare AI v1.0.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}