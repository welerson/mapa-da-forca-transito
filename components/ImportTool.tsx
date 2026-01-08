import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, ClipboardPaste, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

const ImportTool: React.FC = () => {
  const [step, setStep] = useState(1);
  const [pastedData, setPastedData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 1, label: 'Origem', Icon: FileText },
    { id: 2, label: 'Análise', Icon: RefreshCw },
    { id: 3, label: 'Finalizar', Icon: ShieldCheck },
  ];

  const handleProcess = () => {
    if (!pastedData.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Pipeline de Dados</h3>
            <p className="text-slate-500 text-sm">Sincronização via Snapshots de Planilha.</p>
          </div>
          <div className="flex items-center gap-4">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all
                  ${step >= s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {step > s.id ? <CheckCircle size={18} /> : <s.Icon size={18} className={step === s.id ? 'animate-pulse' : ''} />}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${step >= s.id ? 'text-blue-600' : 'text-slate-300'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-10">
          {step === 1 && (
            <div className="space-y-8 slide-up">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Efetivo Geral', sub: 'Aba TRÂNSITO' },
                  { title: 'Escala Mensal', sub: 'Aba PRONTO 2026' },
                  { title: 'Logística VTR', sub: 'Aba VTRS' },
                ].map((t, i) => (
                  <button key={i} className="p-6 rounded-2xl border border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all text-left">
                    <h5 className="font-bold text-slate-800">{t.title}</h5>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.sub}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Colar Dados da Planilha:</label>
                <div className="relative group">
                  <textarea 
                    className="w-full h-64 p-5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-xs focus:ring-4 focus:ring-blue-500/10 outline-none transition-all resize-none custom-scrollbar"
                    placeholder="Selecione os dados no Excel (BM, Nome, Turno...) e cole aqui..."
                    value={pastedData}
                    onChange={(e) => setPastedData(e.target.value)}
                  />
                  {!pastedData && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                      <ClipboardPaste size={48} className="text-slate-900" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  disabled={!pastedData.trim() || isProcessing}
                  onClick={handleProcess}
                  className="px-10 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-3"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : 'Processar Snapshot'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 slide-up">
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-lg flex items-center justify-center">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 uppercase text-xs tracking-widest">Análise Concluída</h4>
                  <p className="text-emerald-700 text-xs">Identificamos 52 registros válidos. Nenhuma duplicidade encontrada.</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-white sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        <th className="p-4 font-bold uppercase text-slate-400 tracking-wider">BM</th>
                        <th className="p-4 font-bold uppercase text-slate-400 tracking-wider">Agente</th>
                        <th className="p-4 font-bold uppercase text-slate-400 tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white">
                      {[1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="hover:bg-white transition-colors">
                          <td className="p-4 font-mono font-bold text-slate-500">86054-2</td>
                          <td className="p-4 font-bold text-slate-800 uppercase">AGENTE EXEMPLO {i}</td>
                          <td className="p-4"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[9px] font-bold">VÁLIDO</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest">Voltar</button>
                <button onClick={() => setStep(3)} className="px-10 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg">
                  Confirmar e Gravar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-16 flex flex-col items-center text-center slide-up">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Snapshot Gravado!</h3>
              <p className="text-slate-500 max-w-sm text-sm mb-10">
                O banco de dados foi atualizado com sucesso. O BI já reflete as novas informações.
              </p>
              <div className="flex gap-4">
                <button onClick={() => {setStep(1); setPastedData('');}} className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">Nova Importação</button>
                <button onClick={() => setStep(1)} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg">Ver Painel</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-6 border border-slate-800">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-widest text-blue-400">Dica de Importação</h4>
          <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-2xl mt-1">
            Mantenha os cabeçalhos das colunas (BM, NOME, TURNO) para que o sistema identifique automaticamente a estrutura dos dados colados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportTool;