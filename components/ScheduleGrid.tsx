import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Download, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';

const ScheduleGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const days = Array.from({ length: 15 }, (_, i) => i + 1);

  const mockData = [
    { bm: '86999-X', rank: 'GCD II', name: 'SILVA GONZAGA', code: 'G051', shift: '07:30-19:30', schedule: ['P', 'P', '', '', 'P', 'P', 'P', 'FE', 'FE', 'FE', 'FE', 'FE', 'FE', 'FE', 'FE'] },
    { bm: '99246-5', rank: 'GCD II', name: 'VINICIUS CHAVES', code: 'G051', shift: '19:30-07:30', schedule: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', '', '', 'P', 'P', 'P', 'P', 'P'] },
    { bm: '80104-X', rank: 'GCD I', name: 'DE OLIVEIRA', code: 'G054', shift: '07:00-19:00', schedule: ['P', 'P', 'AT', 'AT', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
    { bm: '86054-2', rank: 'GCD II', name: 'DEOLINDO', code: 'G054', shift: '06:30-18:30', schedule: ['P', 'P', 'F', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1.5 shadow-sm">
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><ChevronLeft size={18} /></button>
            <span className="px-4 font-bold text-sm text-slate-700">Janeiro 2026</span>
            <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 transition-colors"><ChevronRight size={18} /></button>
          </div>
          <div className="hidden lg:flex items-center gap-3 ml-4">
            {Object.entries(STATUS_LABELS).map(([code, label]) => (
              <div key={code} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[code]}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{code}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Pesquisar Agente..."
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md">
            <Download size={16} /> Exportar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="w-full border-collapse text-left">
          <thead className="sticky top-0 z-20 bg-slate-900 text-slate-300">
            <tr className="text-[10px] font-bold uppercase tracking-widest">
              <th className="p-4 border-r border-slate-800 w-24">BM</th>
              <th className="p-4 border-r border-slate-800 min-w-[180px]">NOME FUNCIONAL</th>
              <th className="p-4 border-r border-slate-800 w-20 text-center">SETOR</th>
              <th className="p-4 border-r border-slate-800 w-32 text-center">TURNO</th>
              {days.map(d => (
                <th key={d} className={`p-1 border-r border-slate-800 text-center w-10 ${d === 8 ? 'bg-blue-600 text-white' : ''}`}>
                  <div className="text-[8px] opacity-60">DOM</div>
                  <div className="text-xs">{d < 10 ? `0${d}` : d}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-xs">
            {mockData.map((row, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                <td className="p-4 border-r border-slate-100 font-mono text-slate-400 font-medium">{row.bm}</td>
                <td className="p-4 border-r border-slate-100">
                  <p className="font-bold text-slate-800 uppercase tracking-tight">{row.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{row.rank}</p>
                </td>
                <td className="p-4 border-r border-slate-100 text-center font-black text-slate-500">{row.code}</td>
                <td className="p-4 border-r border-slate-100 text-center text-[10px] font-medium text-slate-400">{row.shift}</td>
                {row.schedule.map((status, idx) => (
                  <td key={idx} className={`border-r border-slate-100 p-0 ${idx === 7 ? 'bg-blue-50/50' : ''}`}>
                    {status && (
                      <div className={`w-full h-10 flex items-center justify-center font-black text-[10px] ${STATUS_COLORS[status]}`}>
                        {status}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex gap-4">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> 142 Presentes</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> 04 Faltas</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> 12 Férias</span>
        </div>
        <p>Última Atualização: Hoje às 10:22</p>
      </div>
    </div>
  );
};

export default ScheduleGrid;