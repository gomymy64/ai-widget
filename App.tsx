import React, { useState, useEffect } from 'react';
import { Menu, X, Bell, LogOut, Loader2, Ghost } from 'lucide-react';
import { supabase } from './supabase';
import { AuthView } from './components/AuthView';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ConfigView from './components/ConfigView';
import IntegrationView from './components/IntegrationView';
import BillingView from './components/BillingView';
import { View, ConfigState } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  // Default Config Template
  const defaultConfig: ConfigState = {
    id: '', 
    active: true,
    name: 'Алина AI',
    welcomeMessage: 'Здравствуйте! Я помогу подобрать идеальный букет. Для какого повода ищем цветы?',
    role: 'Флорист-консультант',
    knowledgeBaseText: 'Мы семейная цветочная мастерская...',
    qna: [
      { id: '1', question: 'Сколько стоит доставка?', answer: 'Доставка по городу — 300р.' }
    ],
    links: [],
    files: []
  };

  const [agentConfig, setAgentConfig] = useState<ConfigState>(defaultConfig);

  // 1. Check Auth Session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (err) {
        console.error("Error checking session:", err);
        setSession(null);
      } finally {
        setIsLoadingSession(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // Reset demo mode if real user logs in
      if (session) setIsDemoMode(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load Agent Data when Session exists
  useEffect(() => {
    if (session?.user) {
        loadAgentData(session.user.id);
    } else if (isDemoMode) {
        // Initialize Demo Data
        setAgentConfig({ ...defaultConfig, id: 'DEMO' });
    }
  }, [session, isDemoMode]);

  const generateSafeId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const loadAgentData = async (userId: string) => {
      setIsInitialLoad(true);
      try {
          const { data, error } = await supabase
            .from('agents')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle(); 

          if (error) throw error;

          if (data) {
              setAgentConfig({
                  ...data.config,
                  id: data.id
              });
          } else {
              const safeId = generateSafeId();
              const initialConfig = { ...defaultConfig, id: 'AGENT_' + safeId.slice(0,8) };
              
              // Only try to insert if we suspect it will work, or catch silently
              try {
                const { error: insertError } = await supabase
                  .from('agents')
                  .insert([{ user_id: userId, config: initialConfig }]);
                
                if (insertError) {
                    // Check if it's the specific RLS policy error
                    if (insertError.code === '42501') {
                         console.warn("DB INSERT BLOCKED by RLS. Please run the SQL Policy.");
                         // Don't crash, just let them work in memory, but show alert on save
                    } else {
                         console.error("DB INSERT FAILED:", insertError);
                    }
                    // Fallback to local config so app works
                    setAgentConfig(initialConfig);
                } else {
                    setAgentConfig(initialConfig);
                }
              } catch (e) {
                console.error("Insert exception:", e);
                setAgentConfig(initialConfig);
              }
          }
      } catch (err) {
          console.error("Error loading agent:", err);
          setAgentConfig({ ...defaultConfig, id: 'DEMO_AGENT' });
      } finally {
          setIsInitialLoad(false);
      }
  };

  const handleSaveConfig = async () => {
    if (isDemoMode) {
        setIsSaving(true);
        // Fake save delay
        await new Promise(r => setTimeout(r, 600));
        setIsSaving(false);
        alert("Демо-режим: Изменения сохранены локально. Для постоянного сохранения войдите в аккаунт.");
        return;
    }

    if (!session?.user) return;
    setIsSaving(true);
    
    try {
        const { error } = await supabase
            .from('agents')
            .update({ config: agentConfig })
            .eq('user_id', session.user.id);

        if (error) {
            console.error("Update error:", error);
            // If update fails, maybe row doesn't exist (because insert failed earlier), try upsert
            const { error: upsertError } = await supabase
                .from('agents')
                .upsert({ user_id: session.user.id, config: agentConfig });
                
            if (upsertError) {
                 if (upsertError.code === '42501') {
                    alert("Ошибка доступа к Базе Данных (Код 42501). Вы забыли добавить SQL Policy для INSERT/UPDATE?");
                 } else {
                    throw upsertError;
                 }
            }
        }
        await new Promise(r => setTimeout(r, 500));
        
    } catch (err) {
        console.error("Error saving:", err);
        alert("Ошибка при сохранении. Проверьте соединение.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleLogout = async () => {
      if (isDemoMode) {
          setIsDemoMode(false);
          setAgentConfig(defaultConfig); // Reset
      } else {
          await supabase.auth.signOut();
          setSession(null);
      }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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
        return <BillingView isDemoMode={isDemoMode} />;
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

  // --- Render Logic ---

  if (isLoadingSession) {
      return (
          <div className="h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
              <Loader2 className="animate-spin" size={32} />
          </div>
      );
  }

  if (!session && !isDemoMode) {
      return <AuthView onDemoLogin={() => setIsDemoMode(true)} />;
  }

  if (isInitialLoad) {
      return (
        <div className="h-screen bg-zinc-950 flex flex-col gap-4 items-center justify-center text-zinc-400">
             <Loader2 className="animate-spin text-indigo-500" size={40} />
             <p>Загружаем вашего агента...</p>
        </div>
      );
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
        isDemoMode={isDemoMode}
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
            {isDemoMode && (
                <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                    <Ghost size={12} /> Демо Режим
                </span>
            )}
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
            
            {/* User Profile / Logout */}
            <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
                <div className="text-right hidden md:block">
                    <p className="text-xs text-white font-medium">
                        {isDemoMode ? 'Гость' : session?.user?.email}
                    </p>
                </div>
                <button 
                    onClick={handleLogout}
                    title="Выйти"
                    className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                    <LogOut size={14} />
                </button>
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