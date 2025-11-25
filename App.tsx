import React, { useState } from 'react';
import { Menu, X, Bell, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ConfigView from './components/ConfigView';
import IntegrationView from './components/IntegrationView';
import BillingView from './components/BillingView';
import { View, ConfigState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('config');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global State for Agent Configuration
  const [agentConfig, setAgentConfig] = useState<ConfigState>({
    id: 'CLIENT_883_ZK', // Unique Client ID
    active: true,
    name: 'Алина AI',
    welcomeMessage: 'Здравствуйте! Я помогу подобрать идеальный букет. Для какого повода ищем цветы?',
    role: 'Флорист-консультант',
    knowledgeBaseText: 'Мы семейная цветочная мастерская, работаем с 2015 года. Используем только свежие цветы из Голландии и Эквадора. Наш адрес: ул. Цветочная 12. Мы ценим каждого клиента и стараемся сделать праздник незабываемым.',
    qna: [
      { id: '1', question: 'Сколько стоит доставка?', answer: 'Доставка по городу — 300р. При заказе от 5000р — бесплатно.' },
      { id: '2', question: 'Как быстро соберете букет?', answer: 'Обычно сборка занимает 30-60 минут в зависимости от сложности.' }
    ],
    links: [
      { id: '1', url: 'https://flowers.example.com' }
    ],
    files: [
      { id: '101', name: 'price_list_2024.pdf', size: '2.4 MB', type: 'pdf' }
    ]
  });

  const [isSaving, setIsSaving] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleSaveConfig = () => {
    setIsSaving(true);
    // Simulate API Call
    setTimeout(() => {
      setIsSaving(false);
    }, 1500);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'config':
        return (
          <ConfigView 
            config={agentConfig} 
            setConfig={setAgentConfig} 
            onSave={handleSaveConfig}
            isSaving={isSaving}
          />
        );
      case 'integration':
        return <IntegrationView config={agentConfig} />;
      case 'billing':
        return <BillingView />;
      default:
        return <DashboardView />;
    }
  };

  const getTitle = (view: View) => {
    switch(view) {
      case 'dashboard': return 'Обзор';
      case 'config': return 'Настройка Агента';
      case 'integration': return 'Установка';
      case 'billing': return 'Подписка';
      default: return '';
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans selection:bg-electric-500/30">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => {
          setCurrentView(view);
          setIsMobileMenuOpen(false);
        }}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 -ml-2 rounded-lg hover:bg-zinc-800 text-zinc-400 lg:hidden transition-colors"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-lg font-medium tracking-tight hidden sm:block text-zinc-200">
              {getTitle(currentView)}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${agentConfig.active ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-zinc-700 bg-zinc-800/50'}`}>
              <div className={`w-2 h-2 rounded-full ${agentConfig.active ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
              <span className={`text-xs font-medium ${agentConfig.active ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {agentConfig.active ? 'Агент Активен' : 'Остановлен'}
              </span>
            </div>
            
            <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-electric-500 rounded-full animate-pulse"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border border-zinc-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-electric-500/10">
              AI
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;