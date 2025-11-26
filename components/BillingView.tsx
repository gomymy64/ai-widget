import React from 'react';
import { Check, Zap, CreditCard, Shield, AlertTriangle } from 'lucide-react';

interface BillingViewProps {
  isDemoMode: boolean;
}

const BillingView: React.FC<BillingViewProps> = ({ isDemoMode }) => {
  const handlePaymentAction = () => {
    if (isDemoMode) {
      alert("Пожалуйста, зарегистрируйтесь или войдите в аккаунт, чтобы управлять подпиской.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Подписка и Оплата</h1>
        <p className="text-zinc-400">Управление вашим тарифом и методами оплаты.</p>
      </div>
      
      {isDemoMode && (
         <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-200">
             <AlertTriangle size={20} />
             <p className="text-sm">Вы находитесь в демо-режиме. Для подключения тарифа необходимо создать аккаунт.</p>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Card */}
        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Zap size={120} />
          </div>
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-1">Ваш тариф</p>
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  {isDemoMode ? 'Тариф FREE' : 'Тариф PRO'}
                  <span className={`text-xs font-bold px-2 py-1 ${isDemoMode ? 'bg-zinc-600' : 'bg-electric-500'} text-white rounded uppercase tracking-wide`}>
                    Активен
                  </span>
                </h2>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {isDemoMode ? '0₽' : '4900₽'}<span className="text-lg text-zinc-500 font-normal">/мес</span>
                </p>
                <p className="text-xs text-zinc-500">
                  {isDemoMode ? 'Ограниченный доступ' : 'Следующее списание: 24 Окт'}
                </p>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-800 mb-6"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {[
                "Безлимитные диалоги",
                "Продвинутая аналитика",
                "Кастомный аватар и брендинг",
                "Приоритетная поддержка",
                "Доступ к модели GPT-4 / Gemini Pro",
                "Без водяных знаков"
              ].map((feature, i) => (
                <div key={i} className={`flex items-center gap-2 ${isDemoMode && i > 2 ? 'opacity-30' : ''}`}>
                  <div className={`bg-electric-500/10 p-1 rounded-full text-electric-400`}>
                    {isDemoMode && i > 2 ? <Check size={14} className="text-zinc-600" /> : <Check size={14} />}
                  </div>
                  <span className={`text-sm ${isDemoMode && i > 2 ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handlePaymentAction}
                className="px-6 py-2.5 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors"
              >
                {isDemoMode ? 'Подключить PRO' : 'Управление подпиской'}
              </button>
              <button 
                onClick={handlePaymentAction}
                className="px-6 py-2.5 bg-transparent border border-zinc-700 text-zinc-300 font-medium rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Сменить тариф
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method / Usage */}
        <div className="space-y-8">
          {/* Payment Method */}
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-zinc-400" /> Метод оплаты
            </h3>
            
            {isDemoMode ? (
               <div className="text-zinc-500 text-sm py-4 text-center border border-zinc-800 border-dashed rounded-lg">
                  Карты не привязаны
               </div>
            ) : (
                <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-white rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-800 italic">VISA</span>
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">•••• 4242</p>
                      <p className="text-xs text-zinc-500">Годен до 12/25</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Основной</span>
                </div>
            )}
            
            <button 
              onClick={handlePaymentAction}
              className="w-full py-2 text-sm text-zinc-400 hover:text-white border border-dashed border-zinc-700 rounded-lg hover:border-zinc-500 transition-all mt-4"
            >
              + Добавить карту
            </button>
          </div>

          {/* Usage Stats (Mini) */}
          <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
             <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Shield size={18} className="text-zinc-400" /> Лимиты
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Токены</span>
                  <span className="text-white">{isDemoMode ? '10%' : '75%'}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-electric-500 rounded-full ${isDemoMode ? 'w-[10%]' : 'w-3/4'}`}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-400">Файлы</span>
                  <span className="text-white">{isDemoMode ? '0%' : '20%'}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-purple-500 rounded-full ${isDemoMode ? 'w-0' : 'w-1/5'}`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingView;