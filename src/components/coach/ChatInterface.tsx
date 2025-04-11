import { useState, useRef, useEffect } from 'react';

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
    <div className="flex flex-col h-full bg-gray-900">
      {/* Coach Info Bar */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
          <div>
            <h3 className="font-medium">{selectedCoach.name}</h3>
            <p className="text-sm text-gray-400">{selectedCoach.description}</p>
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
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              <p>{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A8FF]"
          />
          <button
            type="submit"
            className="bg-[#00A8FF] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 