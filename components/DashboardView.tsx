import React from 'react';
import { Users, MessageSquare, Clock, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Пн', visitors: 240 },
  { name: 'Вт', visitors: 1398 },
  { name: 'Ср', visitors: 3800 },
  { name: 'Чт', visitors: 3908 },
  { name: 'Пт', visitors: 4800 },
  { name: 'Сб', visitors: 3800 },
  { name: 'Вс', visitors: 4300 },
];

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, colorClass }) => (
  <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-colors">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
      <Icon size={64} />
    </div>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 ${colorClass} bg-opacity-10 text-opacity-80`}>
        <Icon size={20} />
      </div>
      <span className="flex items-center text-emerald-400 text-xs font-medium bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
        <ArrowUpRight size={12} className="mr-1" /> {trend}
      </span>
    </div>
    <h3 className="text-zinc-400 text-sm font-medium">{title}</h3>
    <p className="text-3xl font-bold text-white mt-1 tracking-tight">{value}</p>
  </div>
);

const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Text */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Сводка</h1>
        <p className="text-zinc-400 text-sm">Метрики активности ваших ассистентов в реальном времени.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Активные диалоги" 
          value="1,234" 
          icon={MessageSquare} 
          trend="+12.5%" 
          colorClass="text-blue-400"
        />
        <StatCard 
          title="Собрано лидов" 
          value="45" 
          icon={Users} 
          trend="+8.2%" 
          colorClass="text-purple-400"
        />
        <StatCard 
          title="Сэкономлено часов" 
          value="12.5" 
          icon={Clock} 
          trend="+2.1%" 
          colorClass="text-amber-400"
        />
      </div>

      {/* Main Chart */}
      <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Посещаемость виджета</h3>
          <select className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-zinc-700">
            <option>Последние 7 дней</option>
            <option>Последние 30 дней</option>
            <option>Этот год</option>
          </select>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#71717a', fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#e4e4e7' }}
              />
              <Area 
                type="monotone" 
                dataKey="visitors" 
                stroke="#60a5fa" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorVisitors)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;