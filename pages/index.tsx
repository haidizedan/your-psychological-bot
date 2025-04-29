import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Message {
  text: string;
  isUser: boolean;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Add welcome message when component mounts
    setMessages([{
      text: "Hello! I'm your psychological companion. I'm here to listen, understand, and help you navigate your thoughts and feelings. You can chat with me directly or start a guided session for more structured support. How can I help you today?",
      isUser: false
    }]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          userLocation: "your location", // You might want to get this from the user
          sessionMode: false
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.reply, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, there was an error processing your message. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startGuidedSession = async () => {
    setIsLoading(true);
    setMessages(prev => [...prev, { 
      text: "Starting guided session... Please share what's on your mind.", 
      isUser: false 
    }]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Starting a new guided session",
          userLocation: "your location", // You might want to get this from the user
          sessionMode: true
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, { text: data.reply, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "Sorry, there was an error starting the guided session. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative bg-gradient-to-br from-[#fdf6e3] via-[#f5e6d3] to-[#f0e4d7] overflow-hidden">
      {/* Magical particles background */}
      {isClient && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex">
        {/* Healing girl image container */}
        <div className="w-1/3 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
            className="absolute bottom-0 left-0 w-full"
          >
            <Image
              src="/healer-girl.png"
              width={800}
              height={1200}
              alt="Healing Girl"
              className="object-contain transform -scale-x-100 hover:scale-105 transition-transform duration-500"
              priority
            />
          </motion.div>
        </div>

        {/* Chat container */}
        <div className="w-2/3 pl-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-6xl md:text-7xl font-bold text-yellow-400 mb-8 z-20 font-serif tracking-wide text-shadow-lg"
            style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
          >
            Your Psychological Bot
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="flex flex-col w-full bg-black/40 backdrop-blur-lg rounded-3xl shadow-2xl p-6 space-y-4 mb-6 overflow-y-auto max-h-[60vh] z-20 border border-yellow-400/20"
          >
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: msg.isUser ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className={`p-4 rounded-xl ${
                  msg.isUser 
                    ? "bg-yellow-400/20 text-yellow-100 self-end" 
                    : "bg-yellow-400/10 text-yellow-100 self-start"
                } max-w-[80%] shadow-lg border border-yellow-400/20 backdrop-blur-sm`}
              >
                {msg.text}
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 rounded-xl bg-yellow-400/10 text-yellow-100 self-start max-w-[80%]"
              >
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="flex w-full gap-2 z-20"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts..."
              rows={3}
              className="flex-grow bg-black/40 backdrop-blur-md border-2 border-yellow-400/30 rounded-xl p-4 text-yellow-100 placeholder-yellow-400/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-lg resize-none"
            />
            <div className="flex flex-col gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                className="bg-yellow-400 hover:bg-yellow-500 transition-all text-black font-semibold p-4 rounded-xl shadow-lg border border-yellow-500/30"
              >
                Analyze
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGuidedSession}
                className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black font-semibold p-4 rounded-xl shadow-[0_0_15px_rgba(255,215,0,0.5)] border-2 border-yellow-300/50 hover:shadow-[0_0_25px_rgba(255,215,0,0.8)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                  </svg>
                  Start Guided Session
                </span>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-transparent rounded-xl animate-pulse"></div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Vintage decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400/20 via-yellow-400/40 to-yellow-400/20" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400/20 via-yellow-400/40 to-yellow-400/20" />
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-yellow-400/20 via-yellow-400/40 to-yellow-400/20" />
        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-yellow-400/20 via-yellow-400/40 to-yellow-400/20" />
      </div>
    </div>
  );
}
