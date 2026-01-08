
import React from 'react';
import { 
  Users, 
  Car, 
  ShieldAlert, 
  CheckCircle2, 
  TrendingUp, 
  CalendarDays, 
  PieChart as LucidePieChart 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const data = [
  { name: 'G050 - Ronda MT', value: 17 },
  { name: 'G051 - PA', value: 48 },
  { name: 'G054 - Rotativo', value: 78 },
  { name: 'G052 - ADM', value: 10 },
  { name: 'G055 - Transp', value: 8 },
  { name: 'G056 - UIT', value: 11 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Efetivo Total', value: '218', sub: '+12 em relação a 2025', Icon: Users, color: 'blue' },
    { label: 'Em Serviço Hoje', value: '159', sub: '73% do efetivo total', Icon: CheckCircle2, color: 'emerald' },
    { label: 'VTRs Disponíveis', value: '21', sub: '9 VTR, 9 Moto, 2 Van, 1 Pick', Icon: Car, color: 'amber' },
    { label: 'Alertas de Escala', value: '4', sub: 'Pendências de CNH/Curso', Icon: ShieldAlert, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow text-left">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
              </div>
              <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
                <stat.Icon size={24} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[11px]">
              <TrendingUp size={12} className={`text-${stat.color}-600`} />
              <span className="text-slate-400 font-medium">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Force Distribution Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Distribuição por Unidade Operacional
            </h4>
            <select className="text-xs bg-slate-100 border-none rounded p-1 text-slate-600 font-medium focus:ring-0">
              <option>Visualização por BM</option>
              <option>Visualização por Cargo</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <LucidePieChart size={18} className="text-blue-600" />
            Divisão por Categoria
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Operacional', value: 159 },
                    { name: 'Suporte', value: 43 },
                    { name: 'ADM/Fixos', value: 16 }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {COLORS.slice(0, 3).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { name: 'Equipe Operacional', count: 159, color: COLORS[0] },
              { name: 'Suporte Operacional', count: 43, color: COLORS[1] },
              { name: 'Próprio Fixo', count: 16, color: COLORS[2] },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications/Alerts */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-left">
        <h4 className="font-bold text-slate-800 mb-4">Alertas do Sistema</h4>
        <div className="space-y-3">
          {[
            { msg: 'CNH Vencida: G053 - FERNANDO ALVES (GCM II)', type: 'error' },
            { msg: 'Curso CVE pendente de atualização: G051 - DE OLIVEIRA', type: 'warning' },
            { msg: 'Equipamento EQP 2026: Necessário reavaliar cotas para setor G054', type: 'info' },
          ].map((alert, i) => (
            <div key={i} className={`p-3 rounded-lg border flex items-center gap-3 text-sm
              ${alert.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 
                alert.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                'bg-blue-50 border-blue-100 text-blue-700'}`}>
              <ShieldAlert size={16} />
              {alert.msg}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
