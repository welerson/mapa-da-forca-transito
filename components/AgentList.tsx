
import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Plus, CheckCircle2, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';

const AgentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const agents = [
    { bm: '315416-3', rank: 'GCM III', name: 'HERMENEGILDO', code: 'G050', location: 'RONDA MT', cnh: 'AB', status: 'ATIVO', course: 'Vigente' },
    { bm: '315432-5', rank: 'GCM III', name: 'TAPIAS', code: 'G050', location: 'RONDA MT', cnh: 'AB', status: 'ATIVO', course: 'Vigente' },
    { bm: '86027-5', rank: 'GCD II', name: 'FERNANDO ALVES', code: 'G053', location: 'PROC. AUTO INFRAÇÃO', cnh: 'AB', status: 'ATIVO', course: 'Pendente', pendency: 'CNH VENCIDA' },
    { bm: '86228-6', rank: 'GCD II', name: 'FABIO ALEXANDRE', code: 'G050', location: 'RONDA MT', cnh: 'AB', status: 'ATIVO', course: 'Vigente' },
    { bm: '86054-2', rank: 'GCD II', name: 'DEOLINDO', code: 'G054', location: 'ROTATIVO', cnh: '-', status: 'SEM PORTE', course: 'Pendente' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h3 className="text-xl font-bold text-slate-800">Cadastro de Efetivo</h3>
          <p className="text-sm text-slate-500">Gerenciamento detalhado de credenciamento e cursos.</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md">
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
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 transition-colors">
              <Filter size={16} /> Filtros Avançados
            </button>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total: {agents.length}</p>
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
              {agents.map((agent, idx) => (
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
                  <td className="p-4">
                    <button className="text-slate-400 hover:text-slate-800 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 disabled:opacity-30" disabled><ChevronLeft size={16} /></button>
            <span className="text-xs text-slate-500 px-4">Página 1 de 1</span>
            <button className="p-2 text-slate-400 disabled:opacity-30" disabled><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentList;
