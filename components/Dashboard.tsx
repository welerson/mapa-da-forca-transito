import React from 'react';
import { Users, Car, ShieldAlert, CheckCircle2, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const chartData = [
  { name: 'G050 Ronda', value: 45 },
  { name: 'G051 PA', value: 32 },
  { name: 'G054 Rotativo', value: 58 },
  { name: 'G056 UIT', value: 24 },
  { name: 'G053 Proc.', value: 15 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Efetivo Geral', value: '248', sub: 'Ativos em 2026', icon: <Users />, color: 'blue' },
    { label: 'Pronto Hoje', value: '182', sub: '73% de presença', icon: <CheckCircle2 />, color: 'emerald' },
    { label: 'Viaturas', value: '26', sub: '92% operacional', icon: <Car />, color: 'amber' },
    { label: 'Pendências', value: '12', sub: 'CNH/Cursos/Porte', icon: <ShieldAlert />, color: 'rose' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-tight">{s.label}</p>
                <h3 className="text-3xl font-extrabold text-slate-900">{s.value}</h3>
              </div>
              <div className={`p-4 bg-${s.color}-50 text-${s.color}-600 rounded-2xl`}>
                {s.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-400">
              <TrendingUp size={14} className={`text-${s.color}-500`} />
              {s.sub}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Distribuição por Unidade Operacional
          </h4>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} fontWeight={600} axisLine={false} tickLine={false} dy={10} />
                <YAxis fontSize={11} fontWeight={600} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <PieChartIcon size={20} className="text-emerald-600" />
            Categorização do Efetivo
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Operacional', value: 168 },
                    { name: 'Suporte', value: 52 },
                    { name: 'ADM', value: 28 }
                  ]}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {COLORS.slice(0, 3).map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            {['Operacional', 'Suporte', 'ADM'].map((l, i) => (
              <div key={i} className="flex items-center justify-between text-xs font-bold uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                  <span className="text-slate-600">{l}</span>
                </div>
                <span className="text-slate-400">{(i === 0 ? 68 : i === 1 ? 21 : 11)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;