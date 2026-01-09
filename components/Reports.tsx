
import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  CheckCircle, 
  Loader2, 
  Users, 
  Calendar,
  ChevronDown,
  Printer,
  FileDown,
  X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Agent } from '../types';
import { STATUS_LABELS, STATUS_COLORS } from '../constants';

interface ReportsProps {
  agents: Agent[];
}

const Reports: React.FC<ReportsProps> = ({ agents }) => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('TODOS');
  const [isGenerating, setIsGenerating] = useState(false);

  // Extrair setores únicos para o filtro
  const sectors = useMemo(() => {
    return ['TODOS', ...Array.from(new Set(agents.map(a => a.code))).sort()];
  }, [agents]);

  // Lógica de filtragem ampla
  const filteredData = useMemo(() => {
    return agents.filter(agent => {
      const statusMatch = selectedStatuses.length === 0 || 
                          agent.schedule.some(s => selectedStatuses.includes(s));
      const sectorMatch = selectedSector === 'TODOS' || agent.code === selectedSector;
      return statusMatch && sectorMatch;
    });
  }, [agents, selectedStatuses, selectedSector]);

  const toggleStatus = (code: string) => {
    setSelectedStatuses(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const generatePDF = () => {
    setIsGenerating(true);
    
    // Simulação de processamento para UX
    setTimeout(() => {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Cabeçalho do PDF
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('DCO - MAPA DA FORÇA', 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('RELATÓRIO ANALÍTICO DE EFETIVO - JANEIRO 2026', 14, 30);
      doc.text(`Gerado em: ${timestamp}`, 14, 35);
      doc.line(14, 38, 196, 38);

      // Resumo Estatístico no PDF
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('RESUMO DO FILTRO', 14, 48);
      
      let statsText = `Total de Agentes Listados: ${filteredData.length} | Setor: ${selectedSector}`;
      if (selectedStatuses.length > 0) {
        statsText += ` | Filtro Status: ${selectedStatuses.join(', ')}`;
      }
      doc.setFontSize(9);
      doc.text(statsText, 14, 54);

      // Tabela de Dados
      const tableColumn = ["BM", "NOME FUNCIONAL", "SETOR", "TURNO", "STATUS ATUAL"];
      const tableRows = filteredData.map(agent => [
        agent.bm,
        agent.name,
        agent.code,
        agent.shift,
        agent.status
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 60 },
      });

      // Rodapé
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount} - Uso restrito à Segurança Pública`, 196, 285, { align: 'right' });
      }

      doc.save(`Relatorio_DCO_${selectedSector}_${new Date().getTime()}.pdf`);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="text-left border-b border-slate-200 pb-6 flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Gerador de Relatórios Amplo</h3>
          <p className="text-slate-500 font-medium">Extração consolidada de dados operacionais em formato oficial PDF.</p>
        </div>
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
          <FileText size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel de Filtros */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 text-left">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Filter size={18} className="text-blue-600" />
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Parâmetros de Filtro</h4>
            </div>

            {/* Filtro por Setor */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cód. Setor Operacional</label>
              <div className="relative">
                <select 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                >
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Filtro por Status (Legenda) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por Status</label>
                {selectedStatuses.length > 0 && (
                  <button onClick={() => setSelectedStatuses([])} className="text-[9px] font-black text-rose-500 hover:underline uppercase tracking-widest">Limpar</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_LABELS).map(([code, label]) => (
                  <button
                    key={code}
                    onClick={() => toggleStatus(code)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-left
                      ${selectedStatuses.includes(code) 
                        ? 'border-blue-600 bg-blue-50 shadow-sm' 
                        : 'border-slate-100 bg-slate-50 hover:border-slate-300'}`}
                  >
                    <div className={`w-3 h-3 rounded-full shrink-0 ${STATUS_COLORS[code]}`}></div>
                    <span className={`text-[10px] font-bold uppercase truncate ${selectedStatuses.includes(code) ? 'text-blue-700' : 'text-slate-500'}`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6">
              <button 
                disabled={isGenerating || filteredData.length === 0}
                onClick={generatePDF}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Gerando Documento...
                  </>
                ) : (
                  <>
                    <FileDown size={18} /> Gerar Relatório PDF
                  </>
                )}
              </button>
              {filteredData.length === 0 && (
                <p className="text-center text-[10px] text-rose-500 font-bold mt-4 uppercase">Nenhum registro encontrado com estes filtros</p>
              )}
            </div>
          </div>
        </div>

        {/* Pré-visualização dos Dados */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Printer size={18} className="text-blue-400" />
                <h4 className="font-black text-xs uppercase tracking-widest">Pré-visualização do Relatório</h4>
              </div>
              <span className="bg-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                {filteredData.length} Agentes
              </span>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 z-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="p-4 w-24">BM</th>
                    <th className="p-4">Agente</th>
                    <th className="p-4 w-20 text-center">Setor</th>
                    <th className="p-4">Motivos Localizados</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredData.map((agent) => {
                    const foundStatuses = agent.schedule.filter(s => selectedStatuses.includes(s));
                    // Fix: Ensure uniqueStatuses is inferred as string[] to avoid 'unknown' index type error.
                    const uniqueStatuses: string[] = Array.from(new Set(foundStatuses));
                    
                    return (
                      <tr key={agent.bm} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-slate-400 font-bold">{agent.bm}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800 uppercase tracking-tight">{agent.name}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase">{agent.rank}</p>
                        </td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 bg-slate-100 rounded font-black text-[10px] text-slate-600">{agent.code}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {uniqueStatuses.length > 0 ? uniqueStatuses.map(s => (
                              // Fix: Use casting to string to satisfy index requirement for STATUS_COLORS and STATUS_LABELS
                              <span key={s} className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shadow-sm ${STATUS_COLORS[s as string]}`}>
                                {STATUS_LABELS[s as string]}
                              </span>
                            )) : (
                              <span className="text-slate-300 italic text-xs font-medium">Geral</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-20 text-center flex flex-col items-center gap-4 text-slate-300">
                        <Search size={48} />
                        <p className="font-black uppercase text-xs tracking-widest">Altere os filtros para ver resultados</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
               <div className="flex gap-4">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Setor Selecionado</span>
                    <span className="text-sm font-black text-slate-800">{selectedSector}</span>
                 </div>
                 <div className="w-px h-10 bg-slate-200"></div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Status Selecionados</span>
                    <span className="text-sm font-black text-slate-800">
                      {selectedStatuses.length === 0 ? 'TODOS' : selectedStatuses.length}
                    </span>
                 </div>
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                 <CheckCircle size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Documento Homologado</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-600 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-blue-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
           <FileDown size={200} />
        </div>
        <div className="shrink-0">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/30">
            <Users size={32} />
          </div>
        </div>
        <div className="text-left relative z-10">
          <h4 className="text-2xl font-black uppercase tracking-tight">Relatório Executivo de Comando</h4>
          <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-2xl mt-2">
            Este módulo exporta dados consolidados que servem como base para decisões táticas. 
            Ao gerar o PDF, os filtros aplicados serão impressos no cabeçalho do documento para fins de auditoria.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
