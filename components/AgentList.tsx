
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MoreVertical, Plus, CheckCircle2, ShieldAlert, X, Edit2, Check, Save } from 'lucide-react';
import { Agent } from '../types';

interface AgentListProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const AgentList: React.FC<AgentListProps> = ({ agents, setAgents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgentBm, setEditingAgentBm] = useState<string | null>(null);
  const [tempPendency, setTempPendency] = useState('');
  const [tempStatus, setTempStatus] = useState<'ATIVO' | 'SEM PORTE'>('ATIVO');
  
  const editRef = useRef<HTMLDivElement>(null);

  // Fecha o editor ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(event.target as Node)) {
        setEditingAgentBm(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extrai setores únicos para sugestão
  const existingSectors = useMemo(() => {
    return Array.from(new Set(agents.map(a => a.code))).sort();
  }, [agents]);

  const [newAgent, setNewAgent] = useState<Agent>({
    bm: '', 
    rank: 'GCM III', 
    name: '', 
    code: '', 
    location: 'PRÓPRIO', 
    cnh: 'AB', 
    status: 'ATIVO', 
    course: 'Vigente',
    shift: '07:30-19:30',
    schedule: Array(31).fill('')
  });

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.bm || !newAgent.name || !newAgent.code) {
      alert("Por favor, preencha BM, Nome e Cód. Setor.");
      return;
    }
    setAgents([newAgent, ...agents]);
    setIsModalOpen(false);
    setNewAgent({ 
      bm: '', rank: 'GCM III', name: '', code: '', location: 'PRÓPRIO', cnh: 'AB', status: 'ATIVO', course: 'Vigente', shift: '07:30-19:30', 
      schedule: Array(31).fill('') 
    });
  };

  const startEditing = (agent: Agent) => {
    setEditingAgentBm(agent.bm);
    setTempPendency(agent.pendency || '');
    setTempStatus(agent.status);
  };

  const savePendency = (bm: string) => {
    setAgents(prev => prev.map(a => 
      a.bm === bm ? { ...a, pendency: tempPendency, status: tempStatus } : a
    ));
    setEditingAgentBm(null);
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.bm.includes(searchTerm) || 
    a.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Cadastro de Efetivo</h3>
          <p className="text-sm text-slate-500">Gerenciamento detalhado de credenciamento e cursos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
        >
          <Plus size={18} /> Novo Agente
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar por BM, nome ou setor..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">Total: {filteredAgents.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">BM</th>
                <th className="p-4">Nome Operacional</th>
                <th className="p-4">Setor (Cód)</th>
                <th className="p-4 text-center">CNH</th>
                <th className="p-4">Porte</th>
                <th className="p-4">Curso CVE</th>
                <th className="p-4">Status / Pendência</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredAgents.map((agent, idx) => (
                <tr key={agent.bm} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="p-4 font-mono text-slate-600 font-bold">{agent.bm}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 uppercase leading-none tracking-tight">{agent.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">{agent.rank}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-600 border border-slate-200">{agent.code}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{agent.location}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black border border-blue-100">{agent.cnh}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase
                      ${agent.status === 'ATIVO' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {agent.course === 'Vigente' ? (
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      ) : (
                        <ShieldAlert size={14} className="text-amber-500" />
                      )}
                      <span className={`text-[11px] font-bold ${agent.course === 'Vigente' ? 'text-emerald-700' : 'text-amber-700'}`}>{agent.course}</span>
                    </div>
                  </td>
                  
                  {/* CAMPO STATUS / PENDÊNCIA EDITÁVEL */}
                  <td className="p-4 relative min-w-[200px]">
                    {editingAgentBm === agent.bm ? (
                      <div ref={editRef} className="absolute inset-y-0 left-0 right-4 z-40 bg-white shadow-xl border border-blue-200 rounded-xl flex flex-col p-3 animate-in zoom-in-95 duration-100 -mt-1 -mb-1">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[9px] font-black text-slate-400 uppercase">Editar Informação</label>
                          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                             <button 
                               type="button"
                               onClick={() => setTempStatus('ATIVO')}
                               className={`px-2 py-1 text-[8px] font-black rounded-md transition-all ${tempStatus === 'ATIVO' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                             >ATIVO</button>
                             <button 
                               type="button"
                               onClick={() => setTempStatus('SEM PORTE')}
                               className={`px-2 py-1 text-[8px] font-black rounded-md transition-all ${tempStatus === 'SEM PORTE' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}
                             >PENDENTE</button>
                          </div>
                        </div>
                        <input 
                          autoFocus
                          className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium"
                          placeholder="Descreva a pendência..."
                          value={tempPendency}
                          onChange={(e) => setTempPendency(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && savePendency(agent.bm)}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => setEditingAgentBm(null)} className="p-1.5 text-slate-400 hover:text-rose-500"><X size={14}/></button>
                          <button onClick={() => savePendency(agent.bm)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Check size={14}/></button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer group/cell flex items-center justify-between hover:bg-slate-100/50 p-2 -m-2 rounded-lg transition-colors"
                        onClick={() => startEditing(agent)}
                      >
                        <div className="flex-1">
                          {agent.pendency ? (
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-black border border-red-100 uppercase tracking-tight">
                              <ShieldAlert size={10} /> {agent.pendency}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-bold uppercase text-[10px]">Sem restrições</span>
                          )}
                        </div>
                        <Edit2 size={12} className="text-slate-300 opacity-0 group-hover/cell:opacity-100 transition-opacity ml-2 shrink-0" />
                      </div>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <button className="text-slate-300 hover:text-slate-800 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden slide-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-slate-800 tracking-tight">Novo Agente no Efetivo</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAgent} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Matrícula (BM)</label>
                  <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold" 
                    value={newAgent.bm} onChange={e => setNewAgent({...newAgent, bm: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Posto / Grad</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                    value={newAgent.rank} onChange={e => setNewAgent({...newAgent, rank: e.target.value})}>
                    <option>GCD I</option>
                    <option>GCD II</option>
                    <option>GCM III</option>
                    <option>Inspetor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Nome Funcional</label>
                <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" 
                  value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Cód. Setor</label>
                  <input 
                    required 
                    type="text" 
                    list="sectors-list-new"
                    placeholder="Ex: G051" 
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-blue-600" 
                    value={newAgent.code} 
                    onChange={e => setNewAgent({...newAgent, code: e.target.value.toUpperCase()})} 
                  />
                  <datalist id="sectors-list-new">
                    {existingSectors.map(s => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">CNH</label>
                  <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" 
                    value={newAgent.cnh} onChange={e => setNewAgent({...newAgent, cnh: e.target.value.toUpperCase()})} />
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  <Save size={18} /> Salvar Agente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;
