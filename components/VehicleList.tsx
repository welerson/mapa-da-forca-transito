
import React, { useState } from 'react';
import { Car, Bike, Truck, Bus, Plus, Filter, AlertTriangle, LucideIcon, X, CheckCircle2 } from 'lucide-react';

interface Vehicle {
  plate: string;
  type: string;
  model: string;
  status: 'DISPONÍVEL' | 'MANUTENÇÃO' | 'EM USO';
}

const VehicleList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { plate: 'TDK5C36', type: 'VTR', model: 'Renault Duster', status: 'DISPONÍVEL' },
    { plate: 'TDK5C94', type: 'VTR', model: 'Renault Duster', status: 'DISPONÍVEL' },
    { plate: 'TDK5D05', type: 'VTR', model: 'Renault Duster', status: 'DISPONÍVEL' },
    { plate: 'TDT3B78', type: 'MOTO', model: 'Honda Sahara 300', status: 'DISPONÍVEL' },
    { plate: 'RTQ9G57', type: 'MOTO', model: 'Honda Sahara 300', status: 'MANUTENÇÃO' },
  ]);

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    plate: '',
    type: 'VTR',
    model: '',
    status: 'DISPONÍVEL'
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de segurança para garantir que o botão "funcione" apenas com dados
    if (!newVehicle.plate.trim() || !newVehicle.model.trim()) {
      alert("Por favor, preencha a Placa e o Modelo da Viatura.");
      return;
    }
    
    setVehicles(prev => [newVehicle, ...prev]);
    setIsModalOpen(false);
    setNewVehicle({ plate: '', type: 'VTR', model: '', status: 'DISPONÍVEL' });
  };

  const categories = [
    { type: 'VTR', label: 'Viatura Auto', Icon: Car, color: 'blue' },
    { type: 'MOTO', label: 'Motocicleta', Icon: Bike, color: 'amber' },
  ];

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Logística Operacional</h3>
          <p className="text-sm text-slate-500 font-medium">Gestão de frota de viaturas e motocicletas do DCO.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2 active:scale-95 z-10"
        >
          <Plus size={20} /> Cadastrar VTR
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((cat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 bg-${cat.color}-50 text-${cat.color}-600 rounded-xl`}>
                <cat.Icon size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{cat.label}</h4>
                <p className="text-xs text-slate-400">Total na Frota</p>
              </div>
            </div>
            <span className="text-3xl font-black text-slate-800">
              {vehicles.filter(v => v.type === cat.type).length}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {vehicles.map((v, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center group transition-all
              ${v.status === 'MANUTENÇÃO' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100 hover:border-blue-400'}`}>
              <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">{v.type}</span>
              <span className="text-sm font-black text-slate-800 font-mono">{v.plate}</span>
              <span className={`text-[8px] font-bold mt-2 px-2 py-0.5 rounded-full 
                ${v.status === 'DISPONÍVEL' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {v.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden slide-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <Car size={18} className="text-blue-600" />
                Nova Viatura
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Placa</label>
                <input required type="text" placeholder="Ex: ABC1D23" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  value={newVehicle.plate} onChange={e => setNewVehicle({...newVehicle, plate: e.target.value.toUpperCase()})} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Modelo</label>
                <input required type="text" placeholder="Ex: Renault Duster" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Tipo</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newVehicle.type} onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}>
                    <option value="VTR">VTR (Auto)</option>
                    <option value="MOTO">MOTO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 tracking-widest">Status</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    value={newVehicle.status} onChange={e => setNewVehicle({...newVehicle, status: e.target.value as any})}>
                    <option value="DISPONÍVEL">DISPONÍVEL</option>
                    <option value="MANUTENÇÃO">MANUTENÇÃO</option>
                  </select>
                </div>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Gravar VTR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleList;
