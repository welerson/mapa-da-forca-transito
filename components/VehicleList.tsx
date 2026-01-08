
import React from 'react';
import { Car, Bike, Truck, Bus, Plus, Filter, AlertTriangle } from 'lucide-react';

const VehicleList: React.FC = () => {
  const categories = [
    { type: 'VTR', label: 'Renault Duster', icon: <Car />, color: 'blue', plates: ['TDK5C36', 'TDK5C94', 'TDK5D05', 'TDK5D08', 'TDK5D10', 'TDK5D12', 'TDK5D13', 'TDK5D14', 'TDK5D17'] },
    { type: 'MOTO', label: 'Honda Sahara 300', icon: <Bike />, color: 'amber', plates: ['TDT3B78', 'TDT3B79', 'TDT3B82', 'TDT3B85', 'TDT3B91', 'TDT3B95', 'TDT3B97', 'TDT3B98', 'RTQ9G57'] },
    { type: 'VAN', label: 'Renault Master', icon: <Bus />, color: 'indigo', plates: ['TDK0A15', 'TDK7F15'] },
    { type: 'CAMINHONETE', label: 'GM/Chevrolet S10', icon: <Truck />, color: 'emerald', plates: ['TDO2D44'] },
  ];

  const totalCount = categories.reduce((acc, cat) => acc + cat.plates.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Logística Operacional</h3>
          <p className="text-sm text-slate-500">Gestão de frota de viaturas e motocicletas.</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-600">
            <Filter size={18} />
          </button>
          <button className="px-6 py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md flex items-center gap-2">
            <Plus size={18} /> Cadastrar VTR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${cat.color}-50 text-${cat.color}-600 rounded-lg`}>
                {React.cloneElement(cat.icon as React.ReactElement<any>, { size: 24 })}
              </div>
              <span className="text-2xl font-black text-slate-800">{cat.plates.length}</span>
            </div>
            <h4 className="font-bold text-slate-700 text-sm mb-1">{cat.label}</h4>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{cat.type}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-sm">Listagem de Placas</h4>
          <span className="text-xs font-bold text-slate-400">TOTAL GERAL: {totalCount}</span>
        </div>
        <div className="p-6">
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.flatMap(cat => cat.plates.map(plate => (
                 <div key={plate} className="group relative">
                   <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center hover:border-blue-400 hover:bg-white transition-all cursor-pointer">
                      <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase">{cat.type}</span>
                      <span className="text-sm font-black text-slate-700 font-mono tracking-tighter">{plate}</span>
                   </div>
                   {plate === 'RTQ9G57' && (
                     <div className="absolute -top-1 -right-1">
                        <AlertTriangle size={14} className="text-amber-500 fill-amber-100" />
                     </div>
                   )}
                 </div>
              )))}
           </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
        <AlertTriangle className="text-blue-600 mt-1" size={18} />
        <div className="text-sm text-blue-900">
          <p className="font-bold">Manutenção Preventiva</p>
          <p className="text-blue-700 text-xs">A VTR RTQ9G57 (MOTO) está agendada para revisão técnica em 48h. Certifique-se de realizar a baixa no sistema de alocação.</p>
        </div>
      </div>
    </div>
  );
};

export default VehicleList;
