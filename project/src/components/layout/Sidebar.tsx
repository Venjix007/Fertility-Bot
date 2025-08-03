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
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  conversations, 
  selectedConversation, 
  onSelectConversation, 
  onNewConversation,
  onRefreshConversations 
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
        fixed md:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">FertilityCare AI</span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-4">
            <button
              onClick={handleNewConversation}
              className="w-full flex items-center space-x-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Conversation</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-4">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-colors text-left ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 mt-1 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              ))}
              
              {conversations.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs mt-1">Start a new chat to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* User Profile & Settings */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-center space-x-3 p-2">
              <div className="w-8 h-8 bg-sky-100 dark:bg-sky-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {profile?.name || user?.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}