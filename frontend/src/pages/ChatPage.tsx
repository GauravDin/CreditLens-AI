import React, { useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import { useApp } from '../context/AppContext';
import { MessageBubble } from '../components/chat/MessageBubble';
import { MessageInput } from '../components/chat/MessageInput';
import { SuggestedQuestions } from '../components/chat/SuggestedQuestions';
import { AgentAvatar } from '../components/common/AgentAvatar';
import { Layout } from '../components/layout/Layout';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ChatPage: React.FC<{ embedMode?: boolean }> = ({ embedMode = false }) => {
  const { state } = useApp();
  const navigate = useNavigate();
  const { 
    chatMessages: messages, 
    chatLoading: isLoading, 
    suggestions, 
    loadingSuggestions, 
    fetchSuggestions, 
    sendMessage 
  } = useChat();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Fetch contextual suggestions on load
  useEffect(() => {
    if (state.sessionId && suggestions.length === 0 && !loadingSuggestions) {
      fetchSuggestions(state.sessionId);
    }
  }, [state.sessionId]);

  const hasAnalysis = !!state.analysis;
  const companyName = state.analysis?.financials?.company_name || 'Document';

  const handleSendMessage = (text: string) => {
    if (state.sessionId) {
      sendMessage(state.sessionId, text);
    }
  };

  const ChatContent = (
    <div className="flex flex-col h-full bg-slate-900 w-full relative">
      
      {/* Chat header with company name */}
      {!embedMode && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <AgentAvatar size="sm" isAnalyzing={isLoading} />
            <div>
              <h2 className="text-sm font-bold text-slate-100">AI Credit Analyst</h2>
              <p className="text-[10px] text-slate-500">
                {hasAnalysis ? `Analyzing ${companyName}` : 'General Q&A Mode'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <ArrowLeft className="w-3 h-3 inline mr-1" />
              Go Back
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            >
              <Home className="w-3 h-3 inline mr-1" />
              Home
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4">
            <AgentAvatar size="lg" isAnalyzing={false} className="mb-4" />
            <h2 className="text-xl font-bold text-slate-100 mb-2">
              {hasAnalysis ? `Ask about ${companyName}` : 'Ask Follow-up Questions'}
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              I can answer questions about the financial documents using Cache Augmented Generation. 
              Ask follow-up questions — I keep full conversation context.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message: any, idx: number) => (
              <MessageBubble key={`${message.timestamp}-${idx}`} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <AgentAvatar size="sm" isAnalyzing={true} />
                </div>
                <div className="bg-slate-800 rounded-2xl rounded-tl-none px-5 py-4 border border-slate-700/50 max-w-[75%]">
                  <div className="flex items-center space-x-2 h-5">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          {!hasAnalysis && messages.length === 0 && (
            <div className="mb-3 flex items-center p-2.5 bg-amber-900/20 border border-amber-500/20 text-amber-200/80 rounded-lg text-xs">
              <AlertCircle className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              No analysis loaded. Upload and analyze documents first for document-specific answers.
            </div>
          )}
          
          {/* Suggestions right above the input */}
          <SuggestedQuestions 
            questions={suggestions} 
            loading={loadingSuggestions} 
            onQuestionClick={handleSendMessage} 
            disabled={isLoading} 
          />
          
          <MessageInput onSend={handleSendMessage} disabled={isLoading} />
          <div className="text-center mt-2">
            <span className="text-[9px] text-slate-600 uppercase tracking-wider">
              Cache Augmented Generation · Full context preserved across follow-ups
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedMode) {
    return ChatContent;
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-theme(spacing.16))] -mx-6 -my-8 justify-center">
        <div className="w-full max-w-5xl border-x border-slate-800 shadow-2xl bg-slate-900">
          {ChatContent}
        </div>
      </div>
    </Layout>
  );
};
