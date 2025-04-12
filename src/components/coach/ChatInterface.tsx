'use client';

import { useState, useRef, useEffect } from 'react';
import { User, MessageSquare, Target, Trophy, Clock, Flame, Loader2 } from "lucide-react";
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { ApiError } from '@/types/errors';
import { Coach } from '@/types/coach';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
  type?: 'text' | 'quick-action' | 'achievement';
}

interface ChatInterfaceProps {
  selectedCoach: Coach;
  onRequestChangeCoach: () => void;
  isLoading?: boolean;
}

const TypingIndicator = () => (
  <div className="flex space-x-2 p-3 max-w-[100px] bg-gray-800 rounded-lg">
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
  </div>
);

const QuickActionButton = ({ 
  icon: Icon, 
  label, 
  onClick 
}: { 
  icon: any; 
  label: string; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors"
  >
    <Icon size={16} />
    <span className="text-sm">{label}</span>
  </button>
);

export default function ChatInterface({ 
  selectedCoach, 
  onRequestChangeCoach,
  isLoading = false 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const oldestMessageId = useRef<string | null>(null);

  // Load message history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat_history_${selectedCoach.id}`);
    if (savedMessages) {
      const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(parsedMessages);
      if (parsedMessages.length > 0) {
        oldestMessageId.current = parsedMessages[0].id;
      }
    }
  }, [selectedCoach.id]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${selectedCoach.id}`, JSON.stringify(messages));
    }
  }, [messages, selectedCoach.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleScroll = () => {
    if (!messagesContainerRef.current || isLoadingOlder || !hasMoreMessages) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop < 100) { // Near the top
      loadOlderMessages();
    }
  };

  const loadOlderMessages = async () => {
    if (!oldestMessageId.current || isLoadingOlder) return;

    setIsLoadingOlder(true);
    try {
      // Simulate API call to fetch older messages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const olderMessages: Message[] = Array.from({ length: 10 }, (_, i) => ({
        id: (Date.now() - i - messages.length).toString(),
        text: `Older message ${i + 1}`,
        sender: i % 2 === 0 ? 'user' : 'coach',
        timestamp: new Date(Date.now() - (i + messages.length) * 1000),
      }));

      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
      } else {
        setMessages(prev => [...olderMessages, ...prev]);
        oldestMessageId.current = olderMessages[0].id;
      }
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  const generateCoachResponse = (userMessage: string): string => {
    const personality = selectedCoach.personality;
    const responses = {
      motivational: [
        "You're doing amazing! Keep pushing forward!",
        "Every step counts - you're making progress!",
        "I believe in you! Let's crush these goals together!",
        "Your dedication is inspiring! Keep going!",
        "Remember why you started - you've got this!"
      ],
      technical: [
        "Let's analyze your form and technique...",
        "Based on your current progress, I recommend...",
        "Here's the scientific approach to improve...",
        "Let's break down the mechanics of this exercise...",
        "Your technique should focus on..."
      ],
      tough: [
        "No excuses! Push harder!",
        "You think that's your limit? Think again!",
        "Pain is temporary, results are permanent!",
        "Stop making excuses and start making progress!",
        "You want results? Then work for them!"
      ],
      balanced: [
        "Let's find the right balance for your training...",
        "I see your progress, but we can do better...",
        "You're on the right track, but let's push a bit more...",
        "Good effort, but let's aim higher next time...",
        "I like your dedication, let's maintain this momentum..."
      ]
    };

    const randomResponse = responses[personality][Math.floor(Math.random() * responses[personality].length)];
    return `${randomResponse} ${userMessage.toLowerCase().includes('help') ? ' How can I assist you further?' : ''}`;
  };

  const handleQuickAction = (action: string) => {
    const quickActionMessage: Message = {
      id: Date.now().toString(),
      text: action,
      sender: 'user',
      timestamp: new Date(),
      type: 'quick-action'
    };

    setMessages(prev => [...prev, quickActionMessage]);
    handleCoachResponse(quickActionMessage);
  };

  const handleCoachResponse = async (userMessage: Message) => {
    setIsTyping(true);
    scrollToBottom();

    const typingDuration = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, typingDuration));
    
    const coachResponse: Message = {
      id: (Date.now() + 1).toString(),
      text: generateCoachResponse(userMessage.text),
      sender: 'coach',
      timestamp: new Date(),
      type: userMessage.type
    };
    
    setMessages(prev => [...prev, coachResponse]);
    setIsTyping(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    try {
      setError(null);
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      handleCoachResponse(newMessage);
    } catch (err) {
      setError(err as ApiError);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A8FF]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Coach Info Bar */}
      <div className="bg-gray-900 p-3 border-b border-gray-800">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-[#00A8FF]">
            <User size={16} className="text-[#00A8FF]" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium">{selectedCoach.name}</h3>
            <p className="text-gray-400 text-sm leading-snug">{selectedCoach.description}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4">
          <ErrorDisplay 
            error={error} 
            onRetry={() => setError(null)}
          />
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {isLoadingOlder && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-6 h-6 text-[#00A8FF] animate-spin" />
          </div>
        )}
        
        {messages.length === 0 && !isLoadingOlder && (
          <div className="text-center text-gray-400 py-8">
            <MessageSquare size={48} className="mx-auto mb-4" />
            <p>Start a conversation with {selectedCoach.name}</p>
            <p className="text-sm mt-2">Ask about workouts, nutrition, or motivation!</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-[#00A8FF] text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              {message.type === 'quick-action' && (
                <div className="flex items-center space-x-2 mb-2">
                  <Target size={16} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Quick Action</span>
                </div>
              )}
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <QuickActionButton 
            icon={Target} 
            label="Set Goals" 
            onClick={() => handleQuickAction("Help me set my fitness goals")} 
          />
          <QuickActionButton 
            icon={Trophy} 
            label="Progress" 
            onClick={() => handleQuickAction("How am I progressing?")} 
          />
          <QuickActionButton 
            icon={Clock} 
            label="Schedule" 
            onClick={() => handleQuickAction("What's my workout schedule?")} 
          />
          <QuickActionButton 
            icon={Flame} 
            label="Motivation" 
            onClick={() => handleQuickAction("I need motivation")} 
          />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
            disabled={isTyping}
          />
          <button
            type="submit"
            className="bg-[#00A8FF] text-white px-4 py-2 rounded text-sm font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputMessage.trim() || isTyping}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 