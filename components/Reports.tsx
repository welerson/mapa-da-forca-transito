
import React from 'react';
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
  FileCheck
} from 'lucide-react';

const reportCatalog = [
  { id: 1, title: 'Mapa da Força (2025/26/27)', desc: 'Visão geral por setor e projeção anual', icon: <FileText className="text-blue-500" />, filters: ['Ano', 'Setor'] },
  { id: 2, title: 'Efetivo vs. Necessidade', desc: 'Identificação de gaps por turno e unidade', icon: <TrendingUp className="text-red-500" />, filters: ['Unidade', 'Turno'] },
  { id: 3, title: 'Distribuição por Serviço', desc: 'Trânsito, UPA, ADM, GT, etc.', icon: <Activity className="text-amber-500" />, filters: ['Tipo de Serviço'] },
  { id: 4, title: 'Disponibilidade de VTRs', desc: 'Cobertura por turno e status da frota', icon: <ExternalLink className="text-indigo-500" />, filters: ['Tipo VTR', 'Turno'] },
  { id: 5, title: 'Equipamentos (EQP)', desc: 'Previsão vs. Necessidade vs. Defasagem', icon: <Shield className="text-slate-600" />, filters: ['Equipamento'] },
  { id: 6, title: 'Auditoria de Escala', desc: 'Conflitos, frequência e causas prováveis', icon: <AlertOctagon className="text-purple-500" />, filters: ['Período'] },
  { id: 7, title: 'Operações Especiais', desc: 'Impacto e recomposição (Carnaval, etc.)', icon: <Map className="text-emerald-500" />, filters: ['Evento'] },
  { id: 8, title: 'Cobertura de UPAs', desc: 'Nível de atendimento e mapa de postos', icon: <Shield className="text-blue-600" />, filters: ['Unidade de Saúde'] },
  { id: 9, title: 'Indicadores Operacionais', desc: 'Produtividade e KPIs derivados', icon: <TrendingUp className="text-rose-500" />, filters: ['KPI', 'Mês'] },
  { id: 10, title: 'Comparativo de Períodos', desc: 'Evolução mensal e entre turnos', icon: <History className="text-slate-400" />, filters: ['Início', 'Fim'] },
  { id: 11, title: 'Relatório Executivo (1 Pág)', desc: 'Resumo para Comando com alertas', icon: <FileCheck className="text-slate-900" />, filters: ['Geral'] },
  { id: 12, title: 'Diff de Snapshots', desc: 'Mudanças entre importações e auditoria', icon: <History className="text-cyan-600" />, filters: ['Snapshot A', 'Snapshot B'] },
];

const Reports: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Catálogo de Relatórios</h3>
          <p className="text-slate-500">Gere documentos oficiais e análises operacionais dinâmicas.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
             <button className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded">Meus Favoritos</button>
             <button className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-50 rounded">Todos</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reportCatalog.map(report => (
          <div key={report.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                {React.cloneElement(report.icon as React.ReactElement<any>, { size: 24 })}
              </div>
              <button className="text-slate-400 hover:text-blue-600 transition-colors">
                <FileDown size={20} />
              </button>
            </div>
            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors text-sm">{report.title}</h4>
            <p className="text-[12px] text-slate-500 mt-1 mb-4 flex-1">{report.desc}</p>
            
            <div className="flex flex-wrap gap-1 mb-6">
              {report.filters.map((f, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-wider">
                  {f}
                </span>
              ))}
            </div>

            <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-100">
              Gerar Relatório
            </button>
          </div>
        ))}
      </div>

      <div className="bg-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">Relatório Executivo Mensal</h3>
            <p className="text-blue-200 text-sm max-w-md">
              Gere automaticamente um resumo de 1 página com todos os indicadores de produtividade, 
              disponibilidade de VTRs e pendências de efetivo para o Comando.
            </p>
          </div>
          <button className="px-8 py-3 bg-white text-blue-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
            <Calendar size={18} /> Baixar Relatório de Janeiro
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-700 rounded-full translate-y-1/2 -translate-x-1/2 opacity-20"></div>
      </div>
    </div>
  );
};

export default Reports;
