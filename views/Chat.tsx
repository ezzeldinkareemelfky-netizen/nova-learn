
import React, { useState, useRef, useEffect } from 'react';
import { Message, User } from '../types';
import { chatWithAI } from '../services/geminiService';
import { Send, Mic, Paperclip, Volume2, StopCircle, Upload, FileText, X } from 'lucide-react';

interface ChatProps {
  user: User;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: `Hello ${user.name}! I see you're a ${user.learningStyle} learner. How can I help you study today?`, sender: 'ai', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
            setIsListening(false);
        }
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    } else {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error("Mic Error:", e);
                alert("Error starting microphone. Check permissions.");
            }
        } else {
            alert("Voice input is not supported in this browser.");
        }
    }
  };

  const speakText = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel(); // Stop previous
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Select a voice if possible
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices[0];
          if (preferredVoice) utterance.voice = preferredVoice;

          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);
          
          window.speechSynthesis.speak(utterance);
      }
  };

  const stopSpeaking = () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          setAttachedFile({ name: file.name, content });
      };
      reader.readAsText(file);
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;

    const textToSend = input;
    const fileContext = attachedFile ? `\n[Context from file ${attachedFile.name}]:\n${attachedFile.content}\n` : '';
    
    const userMsg: Message = {
      id: Date.now().toString(),
      text: textToSend + (attachedFile ? ` (Attached: ${attachedFile.name})` : ''),
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachedFile(null);
    setIsLoading(true);

    const fullPrompt = fileContext + textToSend;
    const history = messages.map(m => m.text);
    
    const responseText = await chatWithAI(fullPrompt, user.learningStyle, history);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: 'ai',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
    
    // Auto-speak response
    speakText(responseText);
  };

  return (
    <div className="h-full flex flex-col bg-space-900">
      {/* Chat Header */}
      <div className="p-4 bg-space-800/80 backdrop-blur-sm border-b border-white/5 flex items-center justify-between sticky top-0 z-20 safe-area-top">
        <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">AI Tutor</h2>
            {isSpeaking && (
                <span className="flex space-x-1">
                    <span className="w-1 h-3 bg-neon-cyan animate-pulse"></span>
                    <span className="w-1 h-5 bg-neon-cyan animate-pulse delay-75"></span>
                    <span className="w-1 h-3 bg-neon-cyan animate-pulse delay-150"></span>
                </span>
            )}
        </div>
        <div className="flex items-center gap-2">
            {isSpeaking && (
                <button onClick={stopSpeaking} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                    <StopCircle size={18} className="text-red-400"/>
                </button>
            )}
            <span className="text-xs px-2 py-1 rounded-full bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                {user.learningStyle} Mode
            </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex flex-col max-w-[85%]">
                <div
                className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    msg.sender === 'user'
                    ? 'bg-neon-blue text-white rounded-br-none'
                    : 'bg-space-700/80 text-slate-100 rounded-bl-none border border-white/5'
                }`}
                >
                {msg.text}
                </div>
                {msg.sender === 'ai' && (
                    <button 
                        onClick={() => speakText(msg.text)}
                        className="self-start mt-1 text-slate-500 hover:text-neon-cyan transition-colors"
                    >
                        <Volume2 size={14} />
                    </button>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-space-700/80 p-4 rounded-2xl rounded-bl-none border border-white/5">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attached File Preview */}
      {attachedFile && (
          <div className="px-4 py-2 bg-space-800 border-t border-white/5 flex items-center justify-between animate-slideUp">
              <div className="flex items-center gap-2">
                  <FileText size={16} className="text-neon-cyan" />
                  <span className="text-xs text-slate-300 truncate max-w-[200px]">{attachedFile.name}</span>
              </div>
              <button onClick={() => setAttachedFile(null)} className="text-slate-500 hover:text-red-400">
                  <X size={16} />
              </button>
          </div>
      )}

      {/* Input Area */}
      <div className="p-4 pb-24 bg-space-800/50 backdrop-blur-md border-t border-white/5">
        <div className="flex items-center gap-2 bg-space-900/50 border border-white/10 rounded-full px-4 py-2">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".txt,.md,.json,.csv"
                onChange={handleFileUpload}
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-slate-400 hover:text-white transition-colors"
                title="Upload text file context"
            >
                <Paperclip size={20} />
            </button>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Ask anything..."}
                className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-slate-500"
                disabled={isListening}
            />
            {input.trim() || attachedFile ? (
                <button 
                    onClick={handleSend}
                    className="p-2 bg-neon-blue rounded-full text-white hover:bg-blue-600 transition-colors"
                >
                    <Send size={18} />
                </button>
            ) : (
                <button 
                    onClick={toggleListening}
                    className={`text-slate-400 hover:text-white transition-colors ${isListening ? 'text-red-500 animate-pulse' : ''}`}
                >
                    <Mic size={20} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
