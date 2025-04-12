import { useState, useRef, useEffect } from 'react';
import { User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach';
  timestamp: Date;
}

interface ChatInterfaceProps {
  selectedCoach: {
    id: string;
    name: string;
    description: string;
    avatar: string;
  };
  onRequestChangeCoach: () => void;
}

export default function ChatInterface({ selectedCoach, onRequestChangeCoach }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    // Simulate coach response (to be replaced with actual AI integration)
    setTimeout(() => {
      const coachResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: `This is a simulated response from ${selectedCoach.name}. In the future, this will be replaced with actual AI responses.`,
        sender: 'coach',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coachResponse]);
    }, 1000);
  };

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

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
          />
          <button
            type="submit"
            className="bg-[#00A8FF] text-white px-4 py-2 rounded text-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 