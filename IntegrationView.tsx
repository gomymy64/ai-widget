import React, { useState, useEffect } from 'react';
import { Copy, Check, Terminal, Globe } from 'lucide-react';
import { ConfigState } from './types';

interface IntegrationViewProps {
  config: ConfigState;
}

const IntegrationView: React.FC<IntegrationViewProps> = ({ config }) => {
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('https://your-domain.com');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const snippet = `<script src="${origin}/widget.js?id=${config.id}" defer></script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Установка</h1>
        <p className="text-zinc-400">Интегрируйте AI-агента на ваш сайт за пару секунд.</p>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden">
        <div className="border-b border-zinc-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-electric-500/10 rounded-lg text-electric-400">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-white font-medium">Веб-виджет</h3>
                <p className="text-xs text-zinc-500">Универсальный JS Embed</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.active ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-zinc-800/50 border-zinc-700'}`}>
               <span className={`w-2 h-2 rounded-full ${config.active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`}></span>
               <span className={`text-sm font-medium ${config.active ? 'text-emerald-500' : 'text-zinc-500'}`}>
                 {config.active ? 'Готов к работе' : 'Отключен'}
               </span>
            </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <p className="text-zinc-300 text-sm leading-relaxed">
            Скопируйте и вставьте следующий код внутрь тега <code className="bg-zinc-800 px-1 py-0.5 rounded text-electric-300 text-xs">&lt;head&gt;</code> на вашем сайте.
            {!config.active && (
              <span className="block mt-2 text-amber-500 text-xs">⚠️ Внимание: Агент сейчас выключен в настройках. Виджет не будет отображаться.</span>
            )}
          </p>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-electric-600 to-purple-600 rounded-xl opacity-20 blur transition duration-1000 group-hover:opacity-40"></div>
            <div className="relative rounded-xl bg-black border border-zinc-800 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-zinc-500" />
                  <span className="text-xs text-zinc-400 font-mono">index.html</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-emerald-500">Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Копировать код</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-zinc-300 whitespace-pre-wrap">
                  <span className="text-purple-400">&lt;script</span> <span className="text-electric-400">src</span>=<span className="text-emerald-400">"{origin}/widget.js?id={config.id}"</span> <span className="text-electric-400">defer</span><span className="text-purple-400">&gt;&lt;/script&gt;</span>
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-4 flex gap-3">
             <div className="shrink-0 text-blue-400 mt-0.5">
                <Globe size={16} />
             </div>
             <div>
               <h4 className="text-sm font-medium text-blue-200">Поддерживаемые платформы</h4>
               <p className="text-xs text-blue-300/60 mt-1">
                 Работает с WordPress, Tilda, Shopify, React, Next.js и любыми HTML/CSS сайтами.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationView;