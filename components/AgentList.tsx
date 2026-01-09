
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, MoreVertical, Plus, CheckCircle2, ShieldAlert, X, Edit2, Check, Save, FileSpreadsheet, Loader2, FileDown, CheckSquare, Square, FolderPlus, Layers } from 'lucide-react';
import { Agent } from '../types';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';

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
  const [isImporting, setIsImporting] = useState(false);
  
  // Estados para Seleção e Setor em Massa
  const [selectedBms, setSelectedBms] = useState<Set<string>>(new Set());
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');

  const editRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editRef.current && !editRef.current.contains(event.target as Node)) {
        setEditingAgentBm(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const normalizeText = (text: any) => {
    if (text === null || text === undefined) return "";
    return text.toString().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const processImportedFile = async (rows: any[][]) => {
    // Fix: Removed unused 'entrada' property to prevent type error on reassignment
    let colIdx = { nome: -1 };
    for (let i = 0; i < Math.min(rows.length, 50); i++) {
      const row = rows[i].map(c => normalizeText(c));
      const n = row.findIndex(c => c.includes("FUNCIONARIO") || c === "NOME");
      if (n !== -1) {
        colIdx = { nome: n };
        break;
      }
    }

    if (colIdx.nome === -1) throw new Error("Não foi possível localizar a coluna de Funcionário.");

    let newAgents = [...agents];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const nome = row[colIdx.nome]?.toString().trim() || "";
      if (nome.length < 5 || nome.includes("/") || nome.includes("<")) continue;

      if (!newAgents.some(a => normalizeText(a.name) === normalizeText(nome))) {
        newAgents.push({
          bm: `IMPORT-${Math.floor(Math.random() * 9000) + 1000}`,
          name: nome.toUpperCase(),
          rank: "GCM",
          code: "IMPORTADO",
          location: "PRÓPRIO",
          cnh: "AB",
          status: "ATIVO",
          course: "Vigente",
          shift: "07:30-19:30",
          schedule: Array(31).fill('')
        });
      }
    }
    setAgents(newAgents);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      if (file.name.match(/\.(xlsx|xls|csv)$/i)) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
        await processImportedFile(rows);
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;
        let rows: any[][] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const items = textContent.items as any[];
          const linesMap: Map<number, any[]> = new Map();
          items.forEach(it => {
            const y = Math.round(it.transform[5]);
            let key = Array.from(linesMap.keys()).find(k => Math.abs(k - y) < 8);
            if (key !== undefined) linesMap.get(key)?.push(it);
            else linesMap.set(y, [it]);
          });
          const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);
          sortedY.forEach(y => {
            const lineItems = (linesMap.get(y) || []).sort((a, b) => a.transform[4] - b.transform[4]);
            rows.push(lineItems.map(it => it.str));
          });
        }
        await processImportedFile(rows);
      }
    } catch (err) { console.error(err); } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgent.bm || !newAgent.name || !newAgent.code) return;
    setAgents([newAgent, ...agents]);
    setIsModalOpen(false);
  };

  const toggleSelection = (bm: string) => {
    const newSelection = new Set(selectedBms);
    if (newSelection.has(bm)) newSelection.delete(bm);
    else newSelection.add(bm);
    setSelectedBms(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedBms.size === filteredAgents.length) setSelectedBms(new Set());
    else setSelectedBms(new Set(filteredAgents.map(a => a.bm)));
  };

  const applyNewSector = () => {
    if (!newSectorName.trim()) return;
    setAgents(prev => prev.map(agent => 
      selectedBms.has(agent.bm) ? { ...agent, code: newSectorName.toUpperCase() } : agent
    ));
    setIsSectorModalOpen(false);
    setSelectedBms(new Set());
    setNewSectorName('');
  };

  const startEditing = (agent: Agent) => {
    setEditingAgentBm(agent.bm);
    setTempPendency(agent.pendency || '');
    setTempStatus(agent.status);
  };

  const savePendency = (bm: string) => {
    setAgents(prev => prev.map(a => a.bm === bm ? { ...a, pendency: tempPendency, status: tempStatus } : a));
    setEditingAgentBm(null);
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.bm.includes(searchTerm) || 
    a.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Barra de Ação em Massa */}
      {selectedBms.size > 0 && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-top-8 border border-slate-700">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Ação em Massa</span>
            <span className="font-bold text-sm">{selectedBms.size} Agentes Selecionados</span>
          </div>
          <div className="h-10 w-px bg-slate-700"></div>
          <button 
            onClick={() => setIsSectorModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg"
          >
            <Layers size={16} /> Definir/Criar Setor
          </button>
          <button onClick={() => setSelectedBms(new Set())} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h3 className="text-xl font-bold text-slate-800 tracking-tight">Cadastro de Efetivo</h3>
          <p className="text-sm text-slate-500">Gerenciamento detalhado de credenciamento e cursos.</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv,.pdf" onChange={handleFileUpload} />
          <button disabled={isImporting} onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-all border border-slate-200">
            {isImporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />} Importar PDF/Excel
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
            <Plus size={18} /> Novo Agente
          </button>
        </div>
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
                <th className="p-4 w-12 text-center cursor-pointer" onClick={toggleSelectAll}>
                  {selectedBms.size === filteredAgents.length && filteredAgents.length > 0 ? <CheckSquare size={16} className="text-blue-600 mx-auto" /> : <Square size={16} className="text-slate-300 mx-auto" />}
                </th>
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
              {filteredAgents.map((agent) => {
                const isSelected = selectedBms.has(agent.bm);
                return (
                  <tr key={agent.bm} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors group ${isSelected ? 'bg-blue-50/40' : ''}`}>
                    <td className="p-4 text-center cursor-pointer" onClick={() => toggleSelection(agent.bm)}>
                      {isSelected ? <CheckSquare size={16} className="text-blue-600 mx-auto" /> : <Square size={16} className="text-slate-200 mx-auto group-hover:text-slate-300" />}
                    </td>
                    <td className="p-4 font-mono text-slate-600 font-bold">{agent.bm}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 uppercase leading-none tracking-tight">{agent.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase">{agent.rank}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-black text-slate-600 border border-slate-200">{agent.code}</span>
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
                      <span className={`text-[11px] font-bold ${agent.course === 'Vigente' ? 'text-emerald-700' : 'text-amber-700'}`}>{agent.course}</span>
                    </td>
                    <td className="p-4 relative min-w-[200px]">
                      {editingAgentBm === agent.bm ? (
                        <div ref={editRef} className="absolute inset-y-0 left-0 right-4 z-40 bg-white shadow-xl border border-blue-200 rounded-xl flex flex-col p-3 animate-in zoom-in-95 duration-100 -mt-1 -mb-1">
                          <input autoFocus className="w-full p-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium" value={tempPendency} onChange={(e) => setTempPendency(e.target.value)} />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditingAgentBm(null)} className="p-1.5 text-slate-400 hover:text-rose-500"><X size={14}/></button>
                            <button onClick={() => savePendency(agent.bm)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Check size={14}/></button>
                          </div>
                        </div>
                      ) : (
                        <div className="cursor-pointer flex items-center justify-between hover:bg-slate-100/50 p-2 -m-2 rounded-lg transition-colors" onClick={() => startEditing(agent)}>
                          <span className="text-[10px] font-bold uppercase text-slate-400">{agent.pendency || "Sem restrições"}</span>
                          <Edit2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 ml-2 shrink-0" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-right"><button className="text-slate-300 hover:text-slate-800 transition-colors"><MoreVertical size={16} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Setor em Massa */}
      {isSectorModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-left text-slate-900">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <FolderPlus className="text-blue-600" size={24} />
                <h4 className="font-bold text-slate-800">Definir Novo Setor</h4>
              </div>
              <button onClick={() => setIsSectorModalOpen(false)} className="text-slate-400 hover:text-rose-500 p-2"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
               <p className="text-xs text-slate-500 font-medium">Os {selectedBms.size} agentes selecionados serão agrupados sob este novo setor na escala mensal (barra amarela).</p>
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Nome do Setor / Código</label>
                 <input 
                  type="text" 
                  autoFocus 
                  placeholder="Ex: G051, RONDA, UIT..." 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-black text-blue-600 uppercase outline-none focus:ring-2 focus:ring-blue-500" 
                  value={newSectorName} 
                  onChange={e => setNewSectorName(e.target.value)} 
                />
               </div>
               <button 
                onClick={applyNewSector} 
                disabled={!newSectorName.trim()}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
               >
                 Confirmar e Agrupar
               </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-left">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden slide-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-slate-800 tracking-tight">Novo Agente no Efetivo</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddAgent} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Matrícula (BM)</label>
                <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold" value={newAgent.bm} onChange={e => setNewAgent({...newAgent, bm: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Nome Funcional</label>
                <input required type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" value={newAgent.name} onChange={e => setNewAgent({...newAgent, name: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-widest">Cód. Setor</label>
                <input required type="text" list="sectors-list-new" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-black text-blue-600" value={newAgent.code} onChange={e => setNewAgent({...newAgent, code: e.target.value.toUpperCase()})} />
                <datalist id="sectors-list-new">{existingSectors.map(s => <option key={s} value={s} />)}</datalist>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><Save size={18} /> Salvar Agente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentList;
