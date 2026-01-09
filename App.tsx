
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CarFront, 
  FileSpreadsheet, 
  ShieldCheck, 
  Settings, 
  History,
  FileText,
  Menu,
  X,
  LogOut,
  ShieldAlert
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import ScheduleGrid from './components/ScheduleGrid.tsx';
import ImportTool from './components/ImportTool.tsx';
import AgentList from './components/AgentList.tsx';
import VehicleList from './components/VehicleList.tsx';
import Reports from './components/Reports.tsx';
import Login from './components/Login.tsx';
import { UserRole, Agent } from './types.ts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Estado global de agentes para sincronizar Efetivo e Escala
  const [agents, setAgents] = useState<Agent[]>([
    { bm: '12345-X', rank: 'GCM III', name: 'ADILZA SOUZA', code: 'G051', location: 'PRÓPRIO', cnh: 'AB', status: 'ATIVO', course: 'Vigente', shift: '07:30-19:30', schedule: Array(31).fill('') },
    { bm: '54321-Y', rank: 'GCD II', name: 'AGNALDO GOMES', code: 'G051', location: 'PRÓPRIO', cnh: 'AB', status: 'ATIVO', course: 'Vigente', shift: '19:30-07:30', schedule: Array(31).fill('') },
    { bm: '86999-X', rank: 'GCD II', name: 'SILVA GONZAGA', code: 'G051', location: 'PRÓPRIO', cnh: 'AB', status: 'ATIVO', course: 'Vigente', shift: '07:30-19:30', schedule: ['P', 'P', '', '', 'P', 'P', 'P', 'FE', 'FE', 'FE', 'FE', 'FE', 'FE', 'FE', 'FE'] },
    { bm: '99246-5', rank: 'GCD II', name: 'VINICIUS CHAVES', code: 'G051', location: 'PRÓPRIO', cnh: 'AB', status: 'ATIVO', course: 'Vigente', shift: '19:30-07:30', schedule: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', '', '', 'P', 'P', 'P', 'P', 'P'] },
    { bm: '80104-X', rank: 'GCD I', name: 'DE OLIVEIRA', code: 'G054', location: 'ROTATIVO', cnh: 'B', status: 'ATIVO', course: 'Vigente', shift: '07:00-19:00', schedule: ['P', 'P', 'AT', 'AT', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { bm: '86054-2', rank: 'GCD II', name: 'DEOLINDO', code: 'G054', location: 'ROTATIVO', cnh: '-', status: 'SEM PORTE', course: 'Pendente', shift: '06:30-18:30', schedule: ['P', 'P', 'F', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard BI', Icon: LayoutDashboard },
    { id: 'schedule', label: 'Escala (Pronto)', Icon: FileSpreadsheet },
    { id: 'agents', label: 'Efetivo', Icon: Users },
    { id: 'vehicles', label: 'Logística (VTR)', Icon: CarFront },
    { id: 'imports', label: 'Sincronizar', Icon: History },
    { id: 'reports', label: 'Relatórios', Icon: FileText },
    { id: 'admin', label: 'Configurações', Icon: Settings, role: UserRole.MANAGER },
  ];

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'schedule': return <ScheduleGrid agents={agents} setAgents={setAgents} />;
      case 'agents': return <AgentList agents={agents} setAgents={setAgents} />;
      case 'vehicles': return <VehicleList />;
      case 'imports': return <ImportTool />;
      case 'reports': return <Reports agents={agents} />;
      default: return (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 fade-in">
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center">
            <ShieldAlert size={40} />
          </div>
          <p className="font-bold uppercase tracking-widest text-xs">Módulo em Desenvolvimento</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out transform shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-800/50 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
              DCO
            </div>
            <div className={`transition-opacity duration-200 ${!isSidebarOpen && 'lg:hidden opacity-0'}`}>
              <h1 className="text-white font-bold text-lg tracking-tight">Mapa da Força</h1>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Trânsito v2.0</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/40' 
                    : 'hover:bg-slate-800/50 hover:text-white'}
                `}
              >
                <div className={`${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`}>
                  <item.Icon size={20} />
                </div>
                <span className={`text-sm tracking-tight transition-opacity ${!isSidebarOpen && 'lg:hidden opacity-0'}`}>
                  {item.label}
                </span>
                {activeTab === item.id && isSidebarOpen && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-800/50 bg-slate-950/30">
            <div className={`flex items-center gap-4 mb-6 ${!isSidebarOpen && 'lg:justify-center'}`}>
              <div className="w-10 h-10 rounded-2xl bg-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                G
              </div>
              <div className={`transition-opacity ${!isSidebarOpen && 'lg:hidden opacity-0'}`}>
                <p className="text-sm font-bold text-white">Gestor DCO</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Admin Master</p>
              </div>
            </div>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="w-full flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-rose-400 transition-colors group"
            >
              <LogOut size={18} />
              <span className={`text-xs font-bold uppercase tracking-widest ${!isSidebarOpen && 'lg:hidden opacity-0'}`}>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <main className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300
        ${isSidebarOpen ? 'lg:ml-72' : 'lg:ml-20'}
      `}>
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 transition-all border border-slate-200"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-800 capitalize leading-none">
                {activeTab.replace('_', ' ')}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">DCO • SISTEMA OPERACIONAL</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold text-slate-800 uppercase">Homologação 2026</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jan, 08 - 14:45</p>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <ShieldCheck size={20} />
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default App;
