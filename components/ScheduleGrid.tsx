
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, Download } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';

const ScheduleGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data representing the "PRONTO 2026" sheet
  const days = Array.from({ length: 13 }, (_, i) => i + 1);
  const sections = [
    {
      title: 'NOTURNA DOBRA 02 - G051 PA CETRAN',
      agents: [
        { bm: '86999-X', rank: 'GCD II', name: 'SILVA GONZAGA', code: 'G051', shift: '19:30-07:30', schedule: ['P', 'P', '', '', 'P', 'P', 'P', 'P', '', '', 'P', 'P', 'P'] },
        { bm: '99246-5', rank: 'GCD II', name: 'VINICIUS CHAVES', code: 'G051', shift: '07:30-19:30', schedule: ['P', 'P', 'FE', 'FE', 'P', 'P', 'P', 'P', '', '', 'P', 'P', 'P'] },
        { bm: '80104-X', rank: 'GCD I', name: 'DE OLIVEIRA', code: 'G051', shift: '19:30-07:30', schedule: ['P', 'P', '', '', 'P', 'P', 'P', 'P', '', '', 'P', 'P', 'P'] },
      ]
    },
    {
      title: 'G054 - ROTATIVO DOBRA 01',
      agents: [
        { bm: '86054-2', rank: 'GCD II', name: 'DEOLINDO', code: 'G054', shift: '07:00-19:00', schedule: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
        { bm: '87032-7', rank: 'GCD II', name: 'IRAN CARLOS', code: 'G054', shift: '06:30-18:30', schedule: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'] },
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-lg border border-slate-200 p-1">
            <button className="p-1.5 hover:bg-slate-50 rounded-md transition-colors text-slate-500"><ChevronLeft size={18} /></button>
            <div className="px-3 flex items-center text-sm font-bold text-slate-700">Janeiro 2026</div>
            <button className="p-1.5 hover:bg-slate-50 rounded-md transition-colors text-slate-500"><ChevronRight size={18} /></button>
          </div>
          <div className="h-8 w-px bg-slate-200 mx-1"></div>
          <div className="flex items-center gap-2">
            {Object.entries(STATUS_LABELS).map(([code, label]) => (
              <div key={code} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded-sm ${STATUS_COLORS[code]}`}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{code}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por BM ou Nome..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-white transition-colors text-slate-600"><Filter size={18} /></button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
            <Download size={16} /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-20 bg-slate-900 text-slate-300">
            <tr>
              <th className="p-3 border-r border-slate-800 font-bold w-24">BM</th>
              <th className="p-3 border-r border-slate-800 font-bold w-20">CARGO</th>
              <th className="p-3 border-r border-slate-800 font-bold min-w-[150px]">NOME FUNCIONAL</th>
              <th className="p-3 border-r border-slate-800 font-bold w-12">CÓD.</th>
              <th className="p-3 border-r border-slate-800 font-bold w-28 text-center">TURNO</th>
              {days.map(day => (
                <th key={day} className={`p-1 border-r border-slate-800 text-center w-8 ${day === 8 ? 'bg-cyan-700 text-white' : ''}`}>
                  <div className="text-[8px] uppercase font-medium">{['qui','sex','sáb','dom','seg','ter','qua','qui','sex','sáb','dom','seg','ter'][(day-1)%7]}</div>
                  <div className="text-[11px] font-bold">{day < 10 ? `0${day}` : day}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section, idx) => (
              <React.Fragment key={idx}>
                <tr className="bg-slate-100 font-bold text-slate-700">
                  <td colSpan={5 + days.length} className="px-4 py-2 border-b border-slate-200">
                    {section.title}
                  </td>
                </tr>
                {section.agents.map((agent, aIdx) => (
                  <tr key={aIdx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-3 border-r border-slate-100 font-mono text-slate-600">{agent.bm}</td>
                    <td className="p-3 border-r border-slate-100 font-medium text-slate-500">{agent.rank}</td>
                    <td className="p-3 border-r border-slate-100 font-bold text-slate-800 uppercase">{agent.name}</td>
                    <td className="p-3 border-r border-slate-100 text-center text-slate-500 font-bold">{agent.code}</td>
                    <td className="p-3 border-r border-slate-100 text-center text-slate-400 font-medium text-[10px]">{agent.shift}</td>
                    {agent.schedule.map((status, sIdx) => (
                      <td key={sIdx} className={`border-r border-slate-100 text-center p-0 ${sIdx === 7 ? 'bg-cyan-50' : ''}`}>
                        {status && (
                          <div className={`w-full h-8 flex items-center justify-center font-black text-[10px] ${STATUS_COLORS[status] || ''}`}>
                            {status}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <p className="text-[11px] text-slate-500 font-medium">
          Mostrando 2 setores operacionais • Escala validada em: 08/01/2026 09:15
        </p>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-600">
              <span className="font-bold text-green-600">68</span> Presentes
           </div>
           <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-600">
              <span className="font-bold text-red-600">2</span> Faltas
           </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;
