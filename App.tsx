
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
  ChevronRight
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import AgentList from './components/AgentList';
import VehicleList from './components/VehicleList';
import ScheduleGrid from './components/ScheduleGrid';
import ImportTool from './components/ImportTool';
import Reports from './components/Reports';
import Login from './components/Login';
import { UserRole, UserProfile } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const handleLogin = (email: string) => {
    setCurrentUser({
      uid: '1',
      email: email,
      name: email.split('@')[0].toUpperCase(),
      role: UserRole.MANAGER
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'schedule', label: 'Escala (Pronto)', icon: <FileSpreadsheet size={20} /> },
    { id: 'agents', label: 'Efetivo', icon: <Users size={20} /> },
    { id: 'vehicles', label: 'Viaturas (VTRs)', icon: <CarFront size={20} /> },
    { id: 'reports', label: 'Relatórios', icon: <FileText size={20} /> },
    { id: 'imports', label: 'Importações', icon: <History size={20} />, role: [UserRole.MANAGER, UserRole.OPERATOR] },
    { id: 'audit', label: 'Auditoria', icon: <ShieldCheck size={20} />, role: [UserRole.MANAGER] },
    { id: 'config', label: 'Configurações', icon: <Settings size={20} />, role: [UserRole.MANAGER] },
  ];

  const filteredMenu = menuItems.filter(item => !item.role || (currentUser && item.role.includes(currentUser.role)));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'agents': return <AgentList />;
      case 'vehicles': return <VehicleList />;
      case 'schedule': return <ScheduleGrid />;
      case 'imports': return <ImportTool />;
      case 'reports': return <Reports />;
      default: return <div className="p-8 text-slate-500">Módulo em desenvolvimento...</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Menu Toggle */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 transform md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                DCO
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">Mapa da Força</h1>
                <p className="text-[10px] uppercase tracking-wider text-slate-500">Gestão Operacional</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {filteredMenu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${activeTab === item.id 
                    ? 'bg-blue-600 text-white font-medium' 
                    : 'hover:bg-slate-800 hover:text-white'}
                `}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
                {activeTab === item.id && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                {currentUser?.name.substring(0, 2)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-white font-medium truncate">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <LogOut size={14} /> Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 capitalize">
            {activeTab.replace('_', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500 font-medium uppercase">Mapa da Força</p>
              <p className="text-xs text-slate-400">Ambiente de Operação</p>
            </div>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
              <ShieldCheck size={20} />
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default App;
