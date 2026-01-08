
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, ClipboardPaste } from 'lucide-react';

const ImportTool: React.FC = () => {
  const [step, setStep] = useState(1);
  const [importType, setImportType] = useState<'agents' | 'schedule' | 'vehicles'>('agents');
  const [pastedData, setPastedData] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Importação de Dados</h3>
            <p className="text-sm text-slate-500">Importe dados da planilha Mapa da Força para o sistema.</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                ${step === i ? 'bg-blue-600 text-white' : step > i ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                {step > i ? <CheckCircle size={14} /> : i}
              </div>
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'agents', label: 'Efetivo/Cadastro', desc: 'Dados da aba TRÂNSITO', icon: <FileText /> },
                  { id: 'schedule', label: 'Escala Mensal', desc: 'Dados da aba PRONTO', icon: <ClipboardPaste /> },
                  { id: 'vehicles', label: 'Logística/VTR', desc: 'Dados da aba VTRS', icon: <Upload /> },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setImportType(type.id as any)}
                    className={`p-4 rounded-xl border-2 transition-all text-left
                      ${importType === type.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                  >
                    <div className={`mb-3 ${importType === type.id ? 'text-blue-600' : 'text-slate-400'}`}>
                      {type.icon}
                    </div>
                    <div className={`text-sm font-bold ${importType === type.id ? 'text-blue-900' : 'text-slate-700'}`}>
                      {type.label}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-tight">{type.desc}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block">Dados da Planilha (Cole aqui):</label>
                <textarea 
                  className="w-full h-64 p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Selecione as colunas na planilha, copie e cole aqui..."
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <button 
                  disabled={!pastedData || isProcessing}
                  onClick={handleProcess}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : 'Processar Dados'}
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                <CheckCircle className="text-green-600" />
                <div className="text-sm">
                  <p className="font-bold text-green-800">Dados analisados com sucesso!</p>
                  <p className="text-green-700">Detectamos 48 registros prontos para importação.</p>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th className="p-3 border-b">Status</th>
                        <th className="p-3 border-b">BM</th>
                        <th className="p-3 border-b">Nome</th>
                        <th className="p-3 border-b">Código</th>
                        <th className="p-3 border-b">Pendência</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="border-b border-slate-50">
                          <td className="p-3"><CheckCircle size={14} className="text-green-500" /></td>
                          <td className="p-3 font-mono text-slate-600">86054-2</td>
                          <td className="p-3 font-bold text-slate-800">DEOLINDO</td>
                          <td className="p-3 text-slate-500">G054</td>
                          <td className="p-3">
                            {i === 3 ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[9px] font-bold">CNH VENCIDA</span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setStep(1)} className="text-sm text-slate-500 hover:text-slate-800 font-medium">Voltar</button>
                <div className="flex gap-3">
                  <button className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Descartar</button>
                  <button onClick={() => setStep(3)} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Confirmar Snapshot</button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Snapshot Gerado!</h3>
              <p className="text-slate-500 max-w-sm mb-8">
                A importação foi concluída e o sistema já refletiu as mudanças nos dashboards e relatórios.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-medium">Nova Importação</button>
                <button className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold">Ver Histórico</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertCircle size={18} className="text-blue-600" />
          Instruções de Importação
        </h4>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
            Selecione o intervalo de células na planilha (Ex: BM até Contato).
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
            Copie (Ctrl+C) e cole no campo acima (Ctrl+V).
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
            O sistema validará duplicidades e pendências operacionais automaticamente.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ImportTool;
