import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Home, ArrowLeft } from 'lucide-react';
import { AgentAvatar } from '../components/common/AgentAvatar';
import { ChatPage } from './ChatPage';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-12 pb-12">
        <div className="flex flex-col items-center justify-center pt-8">
          <AgentAvatar size="lg" className="mb-8 opacity-50 grayscale" />
          
          <h1 className="text-6xl font-bold text-slate-100 mb-4 tracking-tight">404</h1>
          <h2 className="text-2xl font-semibold text-slate-300 mb-6">Page not found</h2>
          
          <p className="text-slate-400 max-w-md mb-10">
            We couldn't find the page you're looking for. The link might be broken, or the page may have been removed.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all"
            >
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </button>
          </div>
        </div>

        {/* Embedded Chat Box */}
        <div className="w-full max-w-3xl mt-12 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden h-[500px] flex flex-col">
          <div className="bg-slate-800 p-3 border-b border-slate-700">
            <h3 className="text-sm font-semibold text-slate-200 text-left">Ask AI Assistant</h3>
          </div>
          <div className="flex-1 relative">
            <ChatPage embedMode={true} />
          </div>
        </div>
      </div>
    </Layout>
  );
};
