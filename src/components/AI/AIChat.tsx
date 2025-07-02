import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { startGeneration, generationSuccess, generationFailure } from '../../store/slices/aiSlice';
import { getAIService } from '../../services/aiService';
import AIModelSelector from './AIModelSelector';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  model?: string;
  isGenerating?: boolean;
}

interface AIChatProps {
  placeholder?: string;
  suggestions?: string[];
  onResponse?: (response: string) => void;
  context?: string;
}

const AIChat: React.FC<AIChatProps> = ({ 
  placeholder = "Posez votre question...",
  suggestions = [],
  onResponse,
  context
}) => {
  const dispatch = useAppDispatch();
  const { currentModel, isGenerating, settings } = useAppSelector(state => state.ai);
  const { user } = useAppSelector(state => state.auth);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isAdmin = user?.role === 'Admin';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: new Date(),
      model: currentModel,
      isGenerating: true
    };

    setMessages(prev => [...prev, userMessage, aiMessage]);
    setInput('');
    dispatch(startGeneration());

    try {
      const aiService = getAIService({
        groqApiKey: settings.groqApiKey,
        geminiApiKey: settings.geminiApiKey,
        defaultModel: currentModel
      });

      let prompt = input.trim();
      if (context) {
        prompt = `${context}\n\nQuestion: ${prompt}`;
      }

      const response = await aiService.generateText(prompt, currentModel);
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id 
          ? { ...msg, content: response.content, isGenerating: false }
          : msg
      ));

      dispatch(generationSuccess(response));
      onResponse?.(response.content);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessage.id 
          ? { ...msg, content: `Erreur: ${errorMessage}`, isGenerating: false }
          : msg
      ));

      dispatch(generationFailure(errorMessage));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const regenerateResponse = async (messageId: string, originalPrompt: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, isGenerating: true, content: '' }
        : msg
    ));

    dispatch(startGeneration());

    try {
      const aiService = getAIService({
        groqApiKey: settings.groqApiKey,
        geminiApiKey: settings.geminiApiKey,
        defaultModel: currentModel
      });

      const response = await aiService.generateText(originalPrompt, currentModel);
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: response.content, isGenerating: false }
          : msg
      ));

      dispatch(generationSuccess(response));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: `Erreur: ${errorMessage}`, isGenerating: false }
          : msg
      ));

      dispatch(generationFailure(errorMessage));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Assistant IA</h3>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModelSelector(!showModelSelector)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            {currentModel === 'local-mock' ? 'Mode Démo' : 
             currentModel === 'groq-llama' ? 'Groq Llama' : 'Gemini 2.0'}
          </button>
        )}
      </div>

      {/* Model Selector - Only visible to admins */}
      <AnimatePresence>
        {showModelSelector && isAdmin && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-200 overflow-hidden"
          >
            <div className="p-4">
              <AIModelSelector onModelChange={() => setShowModelSelector(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Commencez une conversation avec l'IA</p>
            
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Suggestions :</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' ? 'bg-blue-600' : 'bg-gray-100'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </div>
              
              <div className={`rounded-lg p-3 ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-50 text-gray-900'
              }`}>
                {message.isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Génération en cours...</span>
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    
                    {message.type === 'ai' && !message.isGenerating && (
                      <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                          title="Copier"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            const userMessage = messages.find(m => 
                              m.type === 'user' && 
                              messages.indexOf(m) === messages.indexOf(message) - 1
                            );
                            if (userMessage) {
                              regenerateResponse(message.id, userMessage.content);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                          title="Régénérer"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </button>
                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors">
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors">
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                        {isAdmin && message.model && (
                          <span className="text-xs text-gray-400 ml-auto">
                            {message.model}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;