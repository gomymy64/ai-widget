import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Sparkles, Mail, Lock, Loader2, AlertCircle, Ghost, ArrowLeft, Info } from 'lucide-react';

interface AuthViewProps {
  onDemoLogin: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot_password';

export const AuthView: React.FC<AuthViewProps> = ({ onDemoLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setCurrentUrl(window.location.origin);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const redirectUrl = window.location.origin;

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        
        if (data.session) {
           setMessage('Регистрация успешна! Входим...');
        } else {
           setMessage('Письмо отправлено! Если ссылка в письме не открывается, замените порт 3000 на текущий порт вашего сайта.');
           setMode('signin');
        }
      } else if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl,
        });
        if (error) throw error;
        setMessage('Ссылка для сброса пароля отправлена. Если она не открывается, скопируйте её и замените порт вручную.');
        setMode('signin');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin': return 'Войдите в аккаунт';
      case 'signup': return 'Создайте аккаунт';
      case 'forgot_password': return 'Восстановление пароля';
    }
  };

  const getButtonText = () => {
    if (loading) return <Loader2 className="animate-spin" size={20} />;
    switch (mode) {
      case 'signin': return 'Войти';
      case 'signup': return 'Создать аккаунт';
      case 'forgot_password': return 'Отправить ссылку';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 text-indigo-500 shadow-lg shadow-indigo-500/10">
            <Sparkles size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Manager</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {getTitle()}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm animate-in slide-in-from-top-2">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm animate-in slide-in-from-top-2">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 uppercase mb-1.5 ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-colors shadow-inner"
                placeholder="name@company.com"
              />
            </div>
          </div>
          
          {mode !== 'forgot_password' && (
            <div>
              <div className="flex justify-between items-center mb-1.5 ml-1">
                <label className="block text-xs font-medium text-zinc-400 uppercase">Пароль</label>
                {mode === 'signin' && (
                  <button 
                    type="button"
                    onClick={() => {
                        setMode('forgot_password');
                        setError(null);
                        setMessage(null);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Забыли пароль?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-indigo-500 focus:outline-none transition-colors shadow-inner"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          >
            {getButtonText()}
          </button>
        </form>
        
        {mode !== 'forgot_password' && (
          <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-2 text-zinc-500 rounded">или</span>
              </div>
          </div>
        )}

        {mode !== 'forgot_password' && (
          <button
              onClick={onDemoLogin}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-600"
          >
              <Ghost size={18} />
              Демо режим (без регистрации)
          </button>
        )}

        <div className="mt-6 text-center">
          {mode === 'forgot_password' ? (
             <button
               onClick={() => {
                 setMode('signin');
                 setError(null);
                 setMessage(null);
               }}
               className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
             >
               <ArrowLeft size={14} /> Назад к входу
             </button>
          ) : (
            <button
              onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setError(null);
                  setMessage(null);
              }}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {mode === 'signin' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          )}
        </div>
      </div>
      
      {/* Dev Hint for Localhost */}
      {currentUrl.includes('localhost') || currentUrl.includes('bolt') || currentUrl.includes('stackblitz') ? (
         <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
             <div className="bg-amber-900/80 text-amber-200 text-xs px-4 py-2 rounded-full border border-amber-700/50 backdrop-blur-md max-w-sm text-center">
                <p className="font-bold flex items-center justify-center gap-1 mb-1"><Info size={12}/> Локальная разработка</p>
                Если ссылка из письма ведет на <b>localhost:3000</b> и не открывается, замените порт вручную на тот, что в адресной строке.
             </div>
         </div>
      ) : null}
    </div>
  );
};