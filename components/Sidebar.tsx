import React from 'react';
import { LayoutDashboard, Bot, PlugZap, CreditCard, Sparkles } from 'lucide-react';
import { View, NavItem } from '../types';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Обзор', icon: LayoutDashboard },
  { id: 'config', label: 'Настройка Агента', icon: Bot },
  { id: 'integration', label: 'Установка', icon: PlugZap },
  { id: 'billing', label: 'Подписка', icon: CreditCard },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, onClose }) => {
  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 text-electric-400">
            <Sparkles className="w-6 h-6 fill-electric-500/20" />
            <span className="text-xl font-bold tracking-tight text-white">AI Manager</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-zinc-900 text-white shadow-inner shadow-white/5 border border-zinc-800' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50'
                  }
                `}
              >
                <item.icon 
                  size={18} 
                  className={`
                    transition-colors duration-200
                    ${isActive ? 'text-electric-400' : 'text-zinc-500 group-hover:text-zinc-300'}
                  `} 
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-6 border-t border-zinc-800/50">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-xl p-4 border border-zinc-800 shadow-xl">
            <h4 className="text-sm font-semibold text-white mb-1">Тариф PRO активен</h4>
            <p className="text-xs text-zinc-500 mb-3">Списание: 24 Окт</p>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-electric-500 w-3/4 rounded-full"></div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 text-right">75% Лимит</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;