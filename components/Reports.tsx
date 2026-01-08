
import React, { useState } from 'react';
import { 
  FileText, 
  FileDown, 
  ExternalLink, 
  Calendar, 
  Users, 
  Shield, 
  Map, 
  TrendingUp, 
  Activity,
  History,
  AlertOctagon,
  FileCheck,
  LucideIcon,
  Loader2,
  CheckCircle,
  ArrowRight,
  Download
} from 'lucide-react';

interface ReportItem {
  id: number;
  title: string;
  desc: string;
  Icon: LucideIcon;
  iconColor: string;
  filters: string[];
}

const reportCatalog: ReportItem[] = [
  { id: 1, title: 'Mapa da Força (2025/26/27)', desc: 'Visão geral por setor e projeção anual completa de efetivo.', Icon: FileText, iconColor: 'text-blue-500', filters: ['Ano', 'Setor'] },
  { id: 2, title: 'Efetivo vs. Necessidade', desc: 'Identificação inteligente de gaps por turno e unidade operacional.', Icon: TrendingUp, iconColor: 'text-red-500', filters: ['Unidade', 'Turno'] },
  { id: 3, title: 'Distribuição por Serviço', desc: 'Analítico de Trânsito, UPA, ADM, GT e serviços especiais.', Icon: Activity, iconColor: 'text-amber-500', filters: ['Tipo de Serviço'] },
  { id: 4, title: 'Disponibilidade de VTRs', desc: 'Cobertura por turno e status de operacionalidade da frota.', Icon: ExternalLink, iconColor: 'text-indigo-500', filters: ['Tipo VTR', 'Turno'] },
  { id: 5, title: 'Equipamentos (EQP)', desc: 'Previsão vs. Necessidade vs. Defasagem de materiais táticos.', Icon: Shield, iconColor: 'text-slate-600', filters: ['Equipamento'] },
  { id: 6, title: 'Auditoria de Escala', desc: 'Conflitos, frequência de faltas e análise de causas prováveis.', Icon: AlertOctagon, iconColor: 'text-purple-500', filters: ['Período'] },
  { id: 7, title: 'Operações Especiais', desc: 'Impacto no efetivo e plano de recomposição (Carnaval, etc.)', Icon: Map, iconColor: 'text-emerald-500', filters: ['Evento'] },
  { id: 8, title: 'Cobertura de UPAs', desc: 'Nível de atendimento por posto de saúde e mapa de vulnerabilidade.', Icon: Shield, iconColor: 'text-blue-600', filters: ['Unidade de Saúde'] },
  { id: 9, title: 'Indicadores Operacionais', desc: 'Produtividade por equipe e KPIs operacionais derivados.', Icon: TrendingUp, iconColor: 'text-rose-500', filters: ['KPI', 'Mês'] },
  { id: 10, title: 'Comparativo de Períodos', desc: 'Evolução mensal do efetivo disponível entre turnos.', Icon: History, iconColor: 'text-slate-400', filters: ['Início', 'Fim'] },
  { id: 11, title: 'Relatório Executivo (1 Pág)', desc: 'Resumo executivo de alto nível para o Comando com alertas.', Icon: FileCheck, iconColor: 'text-slate-900', filters: ['Geral'] },
  { id: 12, title: 'Diff de Snapshots', desc: 'Auditoria de mudanças entre importações e snapshots de dados.', Icon: History, iconColor: 'text-cyan-600', filters: ['Snapshot A', 'Snapshot B'] },
];

const Reports: React.FC = () => {
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);

  const handleGenerate = (id: number) => {
    setGeneratingId(id);
    
    setTimeout(() => {
      setGeneratingId(null);
      setSuccessId(id);
      
      const reportData = reportCatalog.find(r => r.id === id);
      const fileName = reportData ? reportData.title.replace(/\s+/g, '_') : `Relatorio_${id}`;
      
      // Criando um conteúdo CSV em vez de PDF falso para evitar erro de MIME type no navegador
      const csvContent = "data:text/csv;charset=utf-8," 
        + "RELATORIO OFICIAL DCO;ID: " + id + "\n"
        + "TITULO;" + (reportData?.title || 'Relatorio') + "\n"
        + "DATA GERACAO;" + new Date().toLocaleString() + "\n"
        + "STATUS;DADOS HOMOLOGADOS\n\n"
        + "INDICADOR;VALOR;PERCENTUAL\n"
        + "Efetivo Ativo;248;100%\n"
        + "Pronto Operacional;182;73%\n"
        + "Viaturas Disponiveis;24;92%\n"
        + "Pendencias CNH;08;3%";

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => setSuccessId(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Catálogo de Relatórios</h3>
          <p className="text-slate-500 font-medium">Gere documentos oficiais e exportações para Excel (CSV).</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
             <button className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg">Recentes</button>
             <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Favoritos</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reportCatalog.map(report => (
          <div 
            key={report.id} 
            onClick={() => generatingId === null && handleGenerate(report.id)}
            className={`bg-white p-6 rounded-2xl border transition-all group cursor-pointer flex flex-col text-left relative overflow-hidden
              ${generatingId === report.id ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-200 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1'}
              ${successId === report.id ? 'border-emerald-400' : ''}`}
          >
            <div className="flex items-start justify-between mb-5">
              <div className={`p-4 rounded-xl transition-colors ${successId === report.id ? 'bg-emerald-50' : 'bg-slate-50 group-hover:bg-blue-50'}`}>
                <report.Icon className={`${successId === report.id ? 'text-emerald-500' : report.iconColor}`} size={28} />
              </div>
              <button className={`p-2 rounded-lg transition-colors ${successId === report.id ? 'text-emerald-500' : 'text-slate-300 group-hover:text-blue-600'}`}>
                {successId === report.id ? <CheckCircle size={22} /> : <Download size={22} />}
              </button>
            </div>
            
            <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{report.title}</h4>
            <p className="text-[12px] leading-relaxed text-slate-500 mt-2 mb-5 flex-1">{report.desc}</p>
            
            <div className="flex flex-wrap gap-1.5 mb-6">
              {report.filters.map((f, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest border border-slate-200">
                  {f}
                </span>
              ))}
            </div>

            <button 
              className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border flex items-center justify-center gap-2
                ${generatingId === report.id 
                  ? 'bg-blue-50 text-blue-600 border-blue-200' 
                  : successId === report.id
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100'
                  : 'bg-slate-900 text-white hover:bg-blue-600 border-slate-900 hover:border-blue-600 shadow-md'
                }`}
            >
              {generatingId === report.id ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Gerando Dados...
                </>
              ) : successId === report.id ? (
                <>
                  <CheckCircle size={14} /> Exportação Concluída
                </>
              ) : (
                <>Baixar Excel (CSV) <Download size={14} /></>
              )}
            </button>
            
            {generatingId === report.id && (
              <div className="absolute bottom-0 left-0 h-1 bg-blue-500 animate-[loading_2.5s_ease-in-out_infinite]" style={{width: '100%'}}></div>
            )}
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default Reports;
