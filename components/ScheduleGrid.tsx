
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Download, X, FilterX, FileUp, Loader2, CheckCircle, Info, FileText } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Agent } from '../types';

// Importando PDF.js
import * as pdfjsLib from 'pdfjs-dist';

// Configurando o Worker do PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface ScheduleGridProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ agents, setAgents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<{ agentBm: string, dayIdx: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  
  const pickerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportFeedback(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let allRows: any[] = [];
      let entryColumnX = -1; 
      let dateOfReport = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items as any[];

        // 1. Localizar a coluna "1º ENTRADA" para definir o eixo X de interesse
        const header = items.find(item => item.str.includes("1º ENTRADA"));
        if (header) entryColumnX = header.transform[4];

        // 2. Localizar a data em qualquer lugar (formato DD/MM/AAAA)
        items.forEach(item => {
          const match = item.str.match(/\d{2}\/\d{2}\/\d{4}/);
          if (match && !dateOfReport) dateOfReport = match[0];
        });

        // 3. Agrupar itens por linha (Y)
        const rowsByY: Record<string, any[]> = {};
        items.forEach(item => {
          const y = Math.round(item.transform[5]);
          if (!rowsByY[y]) rowsByY[y] = [];
          rowsByY[y].push(item);
        });

        Object.values(rowsByY).forEach(rowItems => {
          rowItems.sort((a, b) => a.transform[4] - b.transform[4]);
          
          // Se a linha começa com uma data, é uma linha de registro
          if (rowItems[0].str.match(/\d{2}\/\d{2}\/\d{4}/)) {
            const nameItem = rowItems.find(item => item.transform[4] > 60 && item.transform[4] < 165);
            
            // Busca o que está EXATAMENTE abaixo da coluna de entrada (com folga de 50px)
            const entryItem = rowItems.find(item => 
              entryColumnX !== -1 && Math.abs(item.transform[4] - entryColumnX) < 50
            );

            if (nameItem) {
              allRows.push({
                name: nameItem.str.trim().toUpperCase(),
                entryStatus: entryItem ? entryItem.str.trim().toUpperCase() : ""
              });
            }
          }
        });
      }

      if (!dateOfReport) throw new Error("ERRO NO PDF: CERTIFIQUE-SE DE QUE É O RELATÓRIO 'PONTO DO DIA'.");
      
      const day = parseInt(dateOfReport.split('/')[0]);
      const dayIdx = day - 1;

      let tempAgents = [...agents];
      let updatedCount = 0;

      allRows.forEach(row => {
        const rawName = row.name;
        const entryText = row.entryStatus;

        // Mapeamento Rigoroso de Status
        let status = '';
        if (entryText.match(/\d{2}:\d{2}/)) status = 'P';
        else if (entryText.includes('FERIAS')) status = 'FE';
        else if (entryText.includes('FALTA')) status = 'F';
        else if (entryText.includes('LICENÇA')) status = 'D';
        else if (entryText.includes('ATESTADO')) status = 'AT';
        else status = ''; // FOLGA ou Vazio limpa o dia

        // Vínculo com agente (Fuzzy)
        let agentIdx = tempAgents.findIndex(a => {
          const sysName = a.name.toUpperCase();
          return rawName.includes(sysName) || sysName.includes(rawName);
        });

        if (agentIdx !== -1) {
          const updatedSchedule = [...tempAgents[agentIdx].schedule];
          while (updatedSchedule.length < 31) updatedSchedule.push('');
          updatedSchedule[dayIdx] = status;
          tempAgents[agentIdx] = { ...tempAgents[agentIdx], schedule: updatedSchedule };
          updatedCount++;
        }
      });

      setAgents(tempAgents);
      setImportFeedback({
        message: `Importação PDF do dia ${day} concluída com sucesso.`,
        type: 'success'
      });

    } catch (error: any) {
      setImportFeedback({ message: error.message, type: 'error' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setImportFeedback(null), 8000);
    }
  };

  const handleExport = () => {
    const headers = ['BM', 'NOME', 'SETOR', 'TURNO', ...days.map(d => `DIA ${d < 10 ? '0'+d : d}`)];
    const rows = agents.map(row => [
      row.bm, row.name, row.code, row.shift, ...row.schedule
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Escala_DCO_G051_Final.csv`);
    link.click();
  };

  const filteredAndSortedAgents = [...agents]
    .filter(m => {
      const searchMatch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.bm.includes(searchTerm);
      const statusMatch = !activeStatusFilter || m.schedule.some(s => s === activeStatusFilter);
      return searchMatch && statusMatch;
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  let lastCode = "";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-left">
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><ChevronLeft size={18} /></button>
            <span className="px-4 font-bold text-sm text-slate-700">Janeiro 2026</span>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {importFeedback && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase animate-in slide-in-from-right-4 
              ${importFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 font-black'}`}>
              <CheckCircle size={14} /> {importFeedback.message}
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-48 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <input type="file" ref={fileInputRef} accept="application/pdf" className="hidden" onChange={handleFileUpload} />
          
          <button 
            disabled={isImporting}
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />} 
            Importar Ponto (PDF)
          </button>

          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto custom-scrollbar relative border-b border-slate-100">
        <table className="w-full border-collapse text-left table-fixed">
          <thead className="sticky top-0 z-20 bg-slate-900 text-slate-300">
            <tr className="text-[10px] font-bold uppercase tracking-widest">
              <th className="p-4 border-r border-slate-800 w-24 bg-slate-900 sticky left-0 z-30 text-center">BM</th>
              <th className="p-4 border-r border-slate-800 w-[220px] bg-slate-900 sticky left-24 z-30 shadow-[4px_0_10px_rgba(0,0,0,0.2)]">NOME FUNCIONAL</th>
              <th className="p-4 border-r border-slate-800 w-20 text-center">SETOR</th>
              <th className="p-4 border-r border-slate-800 w-32 text-center">TURNO</th>
              {days.map(d => (
                <th key={d} className="p-1 border-r border-slate-800 text-center w-10 min-w-[40px]">
                  <div className="text-[8px] opacity-60">DIA</div>
                  <div className="text-xs">{d < 10 ? `0${d}` : d}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs">
            {filteredAndSortedAgents.map((row) => {
              const showHeader = row.code !== lastCode;
              lastCode = row.code;

              return (
                <React.Fragment key={row.bm}>
                  {showHeader && (
                    <tr className="bg-yellow-400 sticky z-10">
                      <td colSpan={days.length + 4} className="px-4 py-2 text-black font-black uppercase tracking-widest text-[11px] border-b border-yellow-500 sticky left-0">
                        Setor: {row.code}
                      </td>
                    </tr>
                  )}
                  <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                    <td className="p-4 border-r border-slate-100 font-mono text-slate-400 font-bold bg-white group-hover:bg-slate-50 sticky left-0 z-10 text-center">{row.bm}</td>
                    <td className="p-4 border-r border-slate-100 bg-white group-hover:bg-slate-50 sticky left-24 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.05)]">
                      <p className="font-bold text-slate-800 uppercase tracking-tight truncate">{row.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{row.rank}</p>
                    </td>
                    <td className="p-4 border-r border-slate-100 text-center font-black text-slate-500 uppercase">{row.code}</td>
                    <td className="p-4 border-r border-slate-100 text-center text-[10px] font-medium text-slate-400">{row.shift}</td>
                    {days.map((_, dayIdx) => {
                      const status = row.schedule[dayIdx];
                      return (
                        <td 
                          key={dayIdx} 
                          className="border-r border-slate-100 p-0 relative cursor-pointer hover:bg-slate-200/50 transition-colors"
                          onClick={() => setActiveCell({ agentBm: row.bm, dayIdx })}
                        >
                          <div className={`w-full h-10 flex items-center justify-center font-black text-[10px] ${status ? STATUS_COLORS[status] : 'bg-transparent text-slate-200'}`}>
                            {status || '·'}
                          </div>
                          {activeCell?.agentBm === row.bm && activeCell?.dayIdx === dayIdx && (
                            <div ref={pickerRef} className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl p-2 grid grid-cols-3 gap-1 min-w-[120px] animate-in zoom-in-95 duration-100" onClick={(e) => e.stopPropagation()}>
                              {Object.keys(STATUS_LABELS).map((code) => (
                                <button key={code} onClick={() => handleStatusChange(row.bm, dayIdx, code)} className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] transition-transform hover:scale-110 active:scale-95 ${STATUS_COLORS[code]}`} title={STATUS_LABELS[code]}>{code}</button>
                              ))}
                              <button onClick={() => handleStatusChange(row.bm, dayIdx, '')} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all" title="Limpar"><X size={12} /></button>
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

      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest gap-4">
        <div className="flex gap-6 overflow-x-auto w-full md:w-auto">
          <div className="flex items-center gap-2 shrink-0">
             <Info size={14} className="text-blue-500" />
             <span>O sistema agora foca exclusivamente na leitura precisa de PDFs, utilizando coordenadas X para a coluna "1º Entrada".</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;
