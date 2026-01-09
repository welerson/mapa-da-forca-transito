
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Download, X, FileUp, Loader2, CheckCircle, AlertTriangle, UserPlus, CheckSquare, Square, FolderInput, Save, Filter, FilterX, CalendarRange, ListChecks, CheckCircle2, FileSpreadsheet, UserCheck } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Agent } from '../types';
import * as XLSX from 'xlsx';

import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.mjs`;

interface ScheduleGridProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ agents, setAgents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCell, setActiveCell] = useState<{ agentBm: string, dayIdx: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  
  const [selectedBms, setSelectedBms] = useState<Set<string>>(new Set());
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);

  const today = new Date();
  const isJan2026 = today.getMonth() === 0 && today.getFullYear() === 2026;
  const [currentDay, setCurrentDay] = useState(isJan2026 ? today.getDate() : 9);

  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [periodStart, setPeriodStart] = useState(1);
  const [periodEnd, setPeriodEnd] = useState(currentDay);
  const [periodStatus, setPeriodStatus] = useState('FE');

  const pickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setActiveCell(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizeText = (text: any) => {
    if (text === null || text === undefined) return "";
    return text.toString().toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleStatusChange = (agentBm: string, dayIdx: number, newStatus: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.bm === agentBm) {
        const newSchedule = [...agent.schedule];
        while (newSchedule.length < 31) newSchedule.push('');
        newSchedule[dayIdx] = newStatus;
        return { ...agent, schedule: newSchedule };
      }
      return agent;
    }));
    setActiveCell(null);
  };

  const processImportedData = (rows: any[][], dayIdx: number) => {
    let colIdx = { nome: -1, entrada: -1 };
    let startRow = 0;

    // Localiza os cabeçalhos exatos solicitados
    for (let i = 0; i < Math.min(rows.length, 100); i++) {
      const row = rows[i].map(c => normalizeText(c));
      const n = row.findIndex(c => c.includes("FUNCIONARIO") || c === "NOME");
      const e = row.findIndex(c => c.includes("1 ENTRADA") || c.includes("1O ENTRADA") || c.includes("1º ENTRADA"));
      if (n !== -1 && e !== -1) {
        colIdx = { nome: n, entrada: e };
        startRow = i + 1;
        break;
      }
    }

    if (colIdx.nome === -1 || colIdx.entrada === -1) {
      throw new Error("Colunas 'FUNCIONÁRIO' ou '1º ENTRADA' não localizadas.");
    }

    let updated = 0;
    let added = 0;
    let tempAgents = [...agents];

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const rawNome = row[colIdx.nome]?.toString().trim() || "";
      const rawEntrada = row[colIdx.entrada]?.toString().trim() || "";
      
      // Validação: Se a entrada estiver vazia ou for "FOLGA", ignora
      const normEntrada = normalizeText(rawEntrada);
      if (!rawEntrada || normEntrada === "" || normEntrada === "FOLGA" || normEntrada === "-") continue;

      // Limpeza de metadados: Ignora linhas com caracteres de código PDF
      if (rawNome.includes("/") || rawNome.includes("<") || rawNome.includes("obj")) continue;

      const normNome = normalizeText(rawNome);
      if (normNome.length < 5) continue; // Ignora nomes curtos/erros

      const agentIndex = tempAgents.findIndex(a => {
        const sysName = normalizeText(a.name);
        return sysName.includes(normNome) || normNome.includes(sysName);
      });

      if (agentIndex !== -1) {
        const newSched = [...tempAgents[agentIndex].schedule];
        while (newSched.length < 31) newSched.push('');
        newSched[dayIdx] = "P";
        tempAgents[agentIndex] = { ...tempAgents[agentIndex], schedule: newSched };
        updated++;
      } else {
        const newSched = Array(31).fill('');
        newSched[dayIdx] = "P";
        tempAgents.push({
          bm: `IMPORT-${Math.floor(Math.random() * 9000) + 1000}`,
          rank: "GCM",
          name: rawNome.toUpperCase(),
          code: "IMPORTADO",
          location: "PRÓPRIO",
          cnh: "AB",
          status: "ATIVO",
          course: "Vigente",
          shift: "07:30-19:30",
          schedule: newSched
        });
        added++;
      }
    }

    setAgents(tempAgents);
    return updated + added;
  };

  const handleExcelImport = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as any[][];
      const count = processImportedData(rows, currentDay - 1);
      setImportFeedback({ message: `Sucesso: ${count} registros processados para o dia ${currentDay}.`, type: 'success' });
    } catch (err: any) {
      setImportFeedback({ message: err.message, type: 'error' });
    }
  };

  const handlePdfImport = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      let rows: any[][] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];
        
        // Agrupa por linha (Y)
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

      const count = processImportedData(rows, currentDay - 1);
      setImportFeedback({ message: `PDF: ${count} registros processados para o dia ${currentDay}.`, type: 'success' });
    } catch (err: any) {
      setImportFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportFeedback(null);
    if (file.name.match(/\.(xlsx|xls|csv)$/i)) await handleExcelImport(file);
    else await handlePdfImport(file);
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setImportFeedback(null), 8000);
  };

  const applyPeriodStatus = () => {
    if (periodStart > periodEnd) return;
    setAgents(prev => prev.map(agent => {
      if (selectedBms.has(agent.bm)) {
        const newSchedule = [...agent.schedule];
        while (newSchedule.length < 31) newSchedule.push('');
        for (let i = periodStart - 1; i <= periodEnd - 1; i++) {
          newSchedule[i] = periodStatus;
        }
        return { ...agent, schedule: newSchedule };
      }
      return agent;
    }));
    setIsPeriodModalOpen(false);
    setSelectedBms(new Set());
  };

  const filteredAndSortedAgents = useMemo(() => {
    return [...agents]
      .filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || agent.bm.includes(searchTerm);
        const matchesStatusFilter = !activeStatusFilter || agent.schedule.includes(activeStatusFilter);
        return matchesSearch && matchesStatusFilter;
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [agents, searchTerm, activeStatusFilter]);

  const toggleSelection = (bm: string) => {
    const newSelection = new Set(selectedBms);
    if (newSelection.has(bm)) newSelection.delete(bm);
    else newSelection.add(bm);
    setSelectedBms(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedBms.size === filteredAndSortedAgents.length) setSelectedBms(new Set());
    else setSelectedBms(new Set(filteredAndSortedAgents.map(a => a.bm)));
  };

  let lastCode = "";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4 duration-500 relative text-slate-900">
      
      {isPeriodModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 text-left text-slate-900">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <CalendarRange className="text-blue-600" size={24} />
                <h4 className="font-bold text-slate-800">Lançamento em Lote</h4>
              </div>
              <button onClick={() => setIsPeriodModalOpen(false)} className="text-slate-400 hover:text-rose-500 p-2"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase">Dia Início</label>
                   <input type="number" min="1" max="31" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={periodStart} onChange={e => setPeriodStart(parseInt(e.target.value))} />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase">Dia Fim</label>
                   <input type="number" min="1" max="31" className="w-full p-3 bg-slate-50 border rounded-xl font-bold" value={periodEnd} onChange={e => setPeriodEnd(parseInt(e.target.value))} />
                 </div>
               </div>
               <div className="grid grid-cols-4 gap-2">
                 {Object.keys(STATUS_LABELS).map(code => (
                   <button key={code} onClick={() => setPeriodStatus(code)} className={`p-2 rounded-lg border text-[10px] font-bold ${periodStatus === code ? 'border-blue-600 bg-blue-50' : 'bg-slate-50'}`}>
                     <div className={`w-2 h-2 rounded-full mb-1 mx-auto ${STATUS_COLORS[code]}`}></div> {code}
                   </button>
                 ))}
               </div>
               <button onClick={applyPeriodStatus} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg">Confirmar Lote</button>
            </div>
          </div>
        </div>
      )}

      {selectedBms.size > 0 && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-top-4 border border-slate-700">
          <span className="font-bold text-sm border-r border-slate-700 pr-6">{selectedBms.size} selecionados</span>
          <button onClick={() => setIsPeriodModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl text-xs font-bold transition-all">Lançar Período</button>
          <button onClick={() => setSelectedBms(new Set())} className="text-slate-400 hover:text-white p-2"><X size={18}/></button>
        </div>
      )}

      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white rounded-xl border p-1 shadow-sm">
              <button onClick={() => setCurrentDay(Math.max(1, currentDay - 1))} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><ChevronLeft size={16} /></button>
              <div className="px-3 flex flex-col items-center">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Dia Selecionado</span>
                <span className="font-bold text-xs">Dia {currentDay < 10 ? '0' + currentDay : currentDay} Jan 2026</span>
              </div>
              <button onClick={() => setCurrentDay(Math.min(31, currentDay + 1))} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><ChevronRight size={16} /></button>
            </div>
            {importFeedback && (
              <div className={`px-4 py-2 rounded-lg text-[10px] font-bold border animate-in fade-in flex items-center gap-2 ${importFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : importFeedback.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {importFeedback.message}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Pesquisar..." className="pl-9 pr-4 py-2 bg-white border rounded-xl text-xs w-64 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <input type="file" ref={fileInputRef} accept=".xlsx, .xls, .csv, .pdf" className="hidden" onChange={handleFileUpload} />
            <button disabled={isImporting} onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-black transition-all">
              {isImporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={16} />} 
              {isImporting ? 'Processando...' : `Importar PDF/Excel`}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Filtro Rápido:</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(STATUS_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => setActiveStatusFilter(activeStatusFilter === code ? null : code)}
                className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase transition-all
                  ${activeStatusFilter === code 
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                <div className={`w-2.5 h-2.5 rounded-sm ${STATUS_COLORS[code]}`}></div>
                {code}
              </button>
            ))}
            {activeStatusFilter && (
              <button onClick={() => setActiveStatusFilter(null)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-[9px] font-black uppercase flex items-center gap-1">
                <FilterX size={12} /> Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full border-collapse text-left table-fixed min-w-[1500px]">
          <thead className="sticky top-0 z-40 bg-slate-900 text-slate-300">
            <tr className="text-[10px] font-bold uppercase tracking-widest">
              <th className="p-4 w-12 bg-slate-900 sticky left-0 z-50 text-center cursor-pointer" onClick={toggleSelectAll}>
                {selectedBms.size === filteredAndSortedAgents.length && filteredAndSortedAgents.length > 0 ? <CheckSquare size={16} className="text-blue-400 mx-auto" /> : <Square size={16} className="opacity-30 mx-auto" />}
              </th>
              <th className="p-4 w-24 bg-slate-900 sticky left-12 z-50 text-center border-r border-slate-800">BM</th>
              <th className="p-4 w-[240px] bg-slate-900 sticky left-36 z-50 text-left border-r border-slate-800">NOME FUNCIONAL</th>
              <th className="p-4 w-24 text-center border-r border-slate-800">SETOR</th>
              {days.map(d => (
                <th key={d} className={`p-1 border-r border-slate-800 text-center w-11 min-w-[44px] ${d === currentDay ? 'bg-blue-600 text-white z-20 shadow-lg' : ''}`}>
                  <div className="text-[8px] opacity-60">DIA</div> {d < 10 ? `0${d}` : d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs">
            {filteredAndSortedAgents.map((row) => {
              const showHeader = row.code !== lastCode;
              lastCode = row.code;
              const isSelected = selectedBms.has(row.bm);
              return (
                <React.Fragment key={row.bm}>
                  {showHeader && (
                    <tr className="bg-yellow-400 sticky z-10">
                      <td colSpan={days.length + 4} className="px-4 py-2 text-black font-black uppercase text-[11px] sticky left-0 shadow-sm border-b border-yellow-500">
                        Setor Operacional: {row.code}
                      </td>
                    </tr>
                  )}
                  <tr className={`border-b border-slate-100 hover:bg-slate-50 transition-colors group ${isSelected ? 'bg-blue-50/50' : ''}`}>
                    <td className={`p-4 sticky left-0 z-10 text-center cursor-pointer transition-colors ${isSelected ? 'bg-blue-100' : 'bg-white group-hover:bg-slate-50'}`} onClick={() => toggleSelection(row.bm)}>{isSelected ? <CheckSquare size={16} className="text-blue-600 mx-auto" /> : <Square size={16} className="text-slate-200 mx-auto" />}</td>
                    <td className={`p-4 font-mono font-bold sticky left-12 z-10 text-center border-r border-slate-100 transition-colors ${isSelected ? 'bg-blue-100' : 'bg-white group-hover:bg-slate-50'}`}>{row.bm}</td>
                    <td className={`p-4 sticky left-36 z-10 border-r border-slate-100 transition-colors ${isSelected ? 'bg-blue-100' : 'bg-white group-hover:bg-slate-50'}`}>
                      <div>
                        <p className="font-bold uppercase truncate max-w-[180px]">{row.name}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase">{row.rank}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center font-black text-slate-500 uppercase border-r border-slate-100">{row.code}</td>
                    {days.map((_, dayIdx) => {
                      const status = row.schedule[dayIdx];
                      const isTargetDay = (dayIdx + 1) === currentDay;
                      const isVisible = !activeStatusFilter || status === activeStatusFilter;
                      
                      return (
                        <td key={dayIdx} className={`border-r border-slate-100 p-0 cursor-pointer hover:bg-slate-200 transition-colors ${isTargetDay ? 'bg-blue-50/40' : ''}`} onClick={() => setActiveCell({ agentBm: row.bm, dayIdx })}>
                          <div className={`w-full h-10 flex items-center justify-center font-black text-[10px] transition-all ${status ? STATUS_COLORS[status] : isTargetDay ? 'text-blue-200' : 'text-slate-100'} ${!isVisible ? 'opacity-10 grayscale' : 'opacity-100'}`}>{status || '·'}</div>
                          {activeCell?.agentBm === row.bm && activeCell?.dayIdx === dayIdx && (
                            <div ref={pickerRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[100] bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 grid grid-cols-4 gap-1 min-w-[200px] text-slate-900" onClick={e => e.stopPropagation()}>
                              {Object.keys(STATUS_LABELS).map(code => <button key={code} onClick={() => handleStatusChange(row.bm, dayIdx, code)} className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] ${STATUS_COLORS[code]}`} title={STATUS_LABELS[code]}>{code}</button>)}
                              <button onClick={() => handleStatusChange(row.bm, dayIdx, '')} className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400" title="Limpar"><X size={14} /></button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleGrid;
