
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Download, X, FilterX, FileUp, Loader2, CheckCircle, Info } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { Agent } from '../types';

// Importando PDF.js via CDN
import * as pdfjsLib from 'pdfjs-dist';

// Configurando o Worker do PDF.js para versão compatível com a do index.html
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs`;

interface ScheduleGridProps {
  agents: Agent[];
  setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ agents, setAgents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string | null>(null);
  const [activeCell, setActiveCell] = useState<{ agentBm: string, dayIdx: number } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
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
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      // Percorre todas as páginas para extrair o texto
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      // 1. Localizar a data do relatório (ex: 09/01/2026)
      const dateMatch = fullText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!dateMatch) throw new Error("Data não encontrada no documento.");
      
      const day = parseInt(dateMatch[1]);
      const dayIdx = day - 1;

      // 2. Dividir o texto em linhas para processar cada agente
      const lines = fullText.split(/\d{2}\/\d{2}\/\d{4}/).filter(l => l.trim().length > 10);
      
      let updatedCount = 0;

      const newAgents = [...agents].map(agent => {
        // Normalização do nome para busca fuzzy
        const normalizedAgentName = agent.name.toUpperCase().trim();
        const firstName = normalizedAgentName.split(' ')[0];

        // Tenta encontrar a linha correspondente a este agente
        const matchingLine = lines.find(line => {
          const lineUpper = line.toUpperCase();
          return lineUpper.includes(normalizedAgentName) || (lineUpper.includes(firstName) && lineUpper.length > 20);
        });

        if (matchingLine) {
          let status = '';
          const lineUpper = matchingLine.toUpperCase();

          // Lógica de Mapeamento baseada nas regras de negócio fornecidas
          if (lineUpper.match(/\d{2}:\d{2}/)) {
            status = 'P'; // Se houver horário de entrada (ex: 07:06e ou 12:00), marcaremos presença
          } else if (lineUpper.includes('FERIAS')) {
            status = 'FE';
          } else if (lineUpper.includes('FALTA')) {
            status = 'F';
          } else if (lineUpper.includes('LICENÇA')) {
            status = 'D'; // Licença -> Dispensa
          } else if (lineUpper.includes('ATESTADO')) {
            status = 'AT';
          } else if (lineUpper.includes('FOLGA')) {
            status = ''; // Limpa o status pois é folga oficial
          }

          // Só atualiza se houver mudança para evitar re-renders desnecessários
          if (status !== agent.schedule[dayIdx]) {
            const newSchedule = [...agent.schedule];
            while (newSchedule.length < 31) newSchedule.push('');
            newSchedule[dayIdx] = status;
            updatedCount++;
            return { ...agent, schedule: newSchedule };
          }
        }
        return agent;
      });

      setAgents(newAgents);
      setImportFeedback({
        message: `Importação Concluída: ${updatedCount} agentes atualizados para o dia ${day}.`,
        type: 'success'
      });

    } catch (error) {
      console.error(error);
      setImportFeedback({
        message: "Erro: Formato de PDF incompatível. Use o relatório 'Ponto do dia'.",
        type: 'error'
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Limpa feedback após 6 segundos
      setTimeout(() => setImportFeedback(null), 6000);
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
    link.setAttribute("download", `Escala_DCO_Janeiro_2026.csv`);
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
          
          <div className="hidden lg:flex items-center gap-2 ml-4">
            {Object.entries(STATUS_LABELS).map(([code, label]) => (
              <button 
                key={code} 
                onClick={() => setActiveStatusFilter(activeStatusFilter === code ? null : code)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl shadow-sm transition-all active:scale-95
                  ${activeStatusFilter === code 
                    ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' 
                    : 'bg-white border-slate-100 hover:border-slate-300'}`}
              >
                <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[code]}`}></div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${activeStatusFilter === code ? 'text-blue-700' : 'text-slate-500'}`}>
                  {code}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {importFeedback && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-bold uppercase animate-in slide-in-from-right-4 
              ${importFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
              {importFeedback.type === 'success' ? <CheckCircle size={14} /> : <FilterX size={14} />} 
              {importFeedback.message}
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
              <th className="p-4 border-r border-slate-800 w-24 bg-slate-900 sticky left-0 z-30">BM</th>
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
                    <td className="p-4 border-r border-slate-100 font-mono text-slate-400 font-medium bg-white group-hover:bg-slate-50 sticky left-0 z-10">{row.bm}</td>
                    <td className="p-4 border-r border-slate-100 bg-white group-hover:bg-slate-50 sticky left-24 z-10 shadow-[4px_0_10px_rgba(0,0,0,0.05)]">
                      <p className="font-bold text-slate-800 uppercase tracking-tight truncate">{row.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{row.rank}</p>
                    </td>
                    <td className="p-4 border-r border-slate-100 text-center font-black text-slate-500">{row.code}</td>
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
                            <div 
                              ref={pickerRef}
                              className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[100] bg-white border border-slate-200 shadow-2xl rounded-xl p-2 grid grid-cols-3 gap-1 min-w-[120px] animate-in zoom-in-95 duration-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {Object.keys(STATUS_LABELS).map((code) => (
                                <button
                                  key={code}
                                  onClick={() => handleStatusChange(row.bm, dayIdx, code)}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] transition-transform hover:scale-110 active:scale-95 ${STATUS_COLORS[code]}`}
                                  title={STATUS_LABELS[code]}
                                >
                                  {code}
                                </button>
                              ))}
                              <button
                                onClick={() => handleStatusChange(row.bm, dayIdx, '')}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-slate-200 transition-all"
                                title="Limpar"
                              >
                                <X size={12} />
                              </button>
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
             <span>A importação via PDF preenche automaticamente o dia identificado no relatório.</span>
          </div>
          <div className="w-px h-4 bg-slate-200 hidden md:block"></div>
          <span className="flex items-center gap-2 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Presenças: {agents.reduce((acc, curr) => acc + curr.schedule.filter(s => s === 'P').length, 0)}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
             <button onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })} className="p-1.5 hover:bg-slate-50 text-slate-400"><ChevronLeft size={16} /></button>
             <div className="w-20 h-1 bg-slate-100 rounded-full mx-2 overflow-hidden"><div className="h-full bg-blue-500 w-1/3"></div></div>
             <button onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })} className="p-1.5 hover:bg-slate-50 text-slate-400"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;
