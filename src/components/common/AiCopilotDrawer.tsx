import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bot, X, Send, Sparkles, ShieldAlert, KeyRound, Database, RefreshCw } from 'lucide-react';

export const AiCopilotDrawer: React.FC = () => {
  const {
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    aiChatHistory,
    sendAiMessage,
    setActiveModule,
  } = useApp();

  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory, isGenerating]);

  if (!isAiDrawerOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isGenerating) return;
    const text = promptInput;
    setPromptInput('');
    setIsGenerating(true);
    await sendAiMessage(text);
    setIsGenerating(false);
  };

  const handleQuickAction = async (promptText: string) => {
    if (isGenerating) return;
    setIsGenerating(true);
    await sendAiMessage(promptText);
    setIsGenerating(false);
  };

  return (
    <>
      {/* Drawer Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity"
        onClick={() => setIsAiDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-[450px] bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-black border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-red-600 rounded border border-red-500">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
              <span>KSPL AI Copilot</span>
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
            </h3>
            <p className="text-[10px] text-zinc-400 font-mono">Gemini 3.6 Flash Server Engine</p>
          </div>
        </div>
        <button
          onClick={() => setIsAiDrawerOpen(false)}
          className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-zinc-900 border-b border-zinc-800 flex items-center space-x-2 overflow-x-auto text-[11px] font-mono custom-scrollbar">
        <button
          onClick={() => handleQuickAction('Which software licenses are under-licensed?')}
          className="bg-black hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-red-500/50 px-2.5 py-1 rounded whitespace-nowrap flex items-center space-x-1 cursor-pointer"
        >
          <KeyRound className="w-3 h-3 text-red-500" />
          <span>Under-Licensed ELP</span>
        </button>
        <button
          onClick={() => handleQuickAction('Analyze blast radius for prod-app-node-02')}
          className="bg-black hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-red-500/50 px-2.5 py-1 rounded whitespace-nowrap flex items-center space-x-1 cursor-pointer"
        >
          <Database className="w-3 h-3 text-red-500" />
          <span>Blast Radius Analysis</span>
        </button>
        <button
          onClick={() => handleQuickAction('Show all critical CVE vulnerabilities')}
          className="bg-black hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-red-500/50 px-2.5 py-1 rounded whitespace-nowrap flex items-center space-x-1 cursor-pointer"
        >
          <ShieldAlert className="w-3 h-3 text-red-500" />
          <span>Critical CVE Risk</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar text-xs">
        {aiChatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="text-[10px] text-zinc-500 font-mono mb-1">
              {msg.sender === 'user' ? 'You' : 'KSPL Copilot'} • {msg.timestamp}
            </div>
            <div
              className={`p-3 rounded-lg max-w-[90%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-red-600 text-white font-medium border border-red-500'
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-800 font-normal whitespace-pre-wrap'
              }`}
            >
              {msg.text}
            </div>

            {/* Action Buttons from Copilot */}
            {msg.suggestedActions && msg.suggestedActions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {msg.suggestedActions.map((act, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (act.actionType === 'CHECK_LICENSES') setActiveModule('licenses');
                      else if (act.actionType === 'IMPACT_ANALYSIS') setActiveModule('cmdb');
                      else if (act.actionType === 'CRITICAL_VULNS') setActiveModule('vulnerabilities');
                      else if (act.actionType === 'NAVIGATE' && act.payload) setActiveModule(act.payload);
                      handleQuickAction(act.label);
                    }}
                    className="bg-black hover:bg-red-600 text-white border border-red-600/50 hover:border-red-500 px-2.5 py-1 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer"
                  >
                    {act.label} →
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center space-x-2 text-zinc-400 text-xs font-mono py-2">
            <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
            <span>KSPL AI Engine evaluating graph dependencies & compliance rules...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-black border-t border-zinc-800 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Ask Copilot about CIs, licenses, blast radius, EOL..."
          value={promptInput}
          onChange={(e) => setPromptInput(e.target.value)}
          disabled={isGenerating}
          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-red-500 text-white placeholder-zinc-500 text-xs rounded px-3 py-2 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!promptInput.trim() || isGenerating}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white p-2 rounded border border-red-500 cursor-pointer transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  </>
);
};
