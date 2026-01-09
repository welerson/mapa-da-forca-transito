
import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus, CheckCircle2, ShieldAlert, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Agent } from '../types';

interface AgentListProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const AgentList: React.FC<AgentListProps> = ({ agents, setAgents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newAgent, setNewAgent] = useState<Agent>({
    bm: '', 
    rank: 'GCM III', 
    name: '', 
    code: '', 
    location: '', 
    cnh: 'AB', 
    status: 'ATIVO', 
    course: 'Vigente',
    shift: '07:30-19:30',
    schedule: Array(15).fill('') // Escala inicial vazia para 15 dias
  });

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.bm || !newAgent.name || !newAgent.code) {
      alert("Por favor, preencha BM, Nome e Cód. Setor.");
      return;
    }
    setAgents([newAgent, ...agents]);
    setIsModalOpen(false);
    // Reseta o formulário
    setNewAgent({ 
      bm: '', rank: 'GCM III', name: '', code: '', location: '', cnh: 'AB', status: 'ATIVO', course: 'Vigente', shift: '07:30-19:30', 
      schedule: Array(15).fill('') 
    });
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
          <h3 className="text-xl font-bold text-slate-800">Cadastro de Efetivo</h3>
          <p className="text-sm text-slate-500">Gerenciamento detalhado de credenciamento e cursos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md"
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
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total: {filteredAgents.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="p-4">BM</th>
                <th className="p-4">Nome Operacional</th>
                <th className="p-4">Setor (Cód)</th>
                <th className="p-4 text-center">CNH</th>
                <th className="p-4">Porte</th>
                <th className="p-4">Curso CVE</th>
                <th className="p-4">Status/Pendência</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredAgents.map((agent, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-slate-600 font-bold">{agent.bm}</td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800 uppercase leading-none">{agent.name}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{agent.rank}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-600 mr-2">{agent.code}</span>
                    <span className="text-xs text-slate-500 font-medium">{agent.location}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">{agent.cnh}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold 
                      ${agent.status === 'ATIVO' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {agent.course === 'Vigente' ? (
                        <CheckCircle2 size={14} className="text-green-500" />
                      ) : (
                        <ShieldAlert size={14} className="text-amber-500" />
                      )}
                      <span className="text-xs">{agent.course}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {agent.pendency ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-bold border border-red-100">
                        <ShieldAlert size={10} /> {agent.pendency}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-slate-400 hover:text-slate-800 transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden slide-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-slate-800">Novo Agente no Efetivo</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddAgent} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Matrícula (BM)</label>
                  <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" 
                    value={newAgent.bm} onChange={e => setNewAgent({...newAgent, bm: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Posto/Grad</label>
                  <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    value={newAgent.rank} onChange={e => setNewAgent({...newAgent, rank: e.target.value})}>
                    <option>GCD I</option>
                    <option>GCD II</option>
                    <option>GCM III</option>
                    <option>Inspetor</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome Funcional</label>
                <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" 
                  value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value.toUpperCase()})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cód. Setor</label>
                  <input required type="text" placeholder="Ex: G051" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" 
                    value={newAgent.code} onChange={e => setNewAgent({...newAgent, code: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CNH</label>
                  <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" 
                    value={newAgent.cnh} onChange={e => setNewAgent({...newAgent, cnh: e.target.value.toUpperCase()})} />
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Salvar Agente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;
