import { useState, useEffect, useRef } from 'react';
import { PenTool, CheckCircle, UserCheck, FileText } from 'lucide-react';

export default function ConsentForm(props) {
  const { patients, onAddFile } = props;

  const today = new Date();
  const defaultDateStr = today.toISOString().split('T')[0];
  const defaultYear = today.getFullYear();

  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [consentDate, setConsentDate] = useState(defaultDateStr);
  const [consentYear, setConsentYear] = useState(defaultYear);
  const [signatureType, setSignatureType] = useState('draw');
  const [typedName, setTypedName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [signedList, setSignedList] = useState([]);

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      const firstPat = patients[0];
      setSelectedPatientId(firstPat.id);
      setPatientName(firstPat.name);
    }
  }, [patients, selectedPatientId]);

  const handlePatientSelect = (patientId) => {
    setSelectedPatientId(patientId);
    if (patientId === 'manual') {
      setPatientName('');
    } else {
      const found = patients.find(p => p.id === patientId);
      if (found) setPatientName(found.name);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('psy_signed_consents');
    if (stored) {
      try { setSignedList(JSON.parse(stored)); } catch (e) {}
    }
  }, []);

  const saveSignedConsents = (updated) => {
    setSignedList(updated);
    localStorage.setItem('psy_signed_consents', JSON.stringify(updated));
  };

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if ('touches' in e) e.preventDefault();
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const getConsentText = () => `CARTA DE CONSENTIMIENTO INFORMADO PARA EVALUACIÓN Y TRATAMIENTO PSICOTERAPÉUTICO\n\nYo, ${patientName || '[Nombre del Paciente]'}, expreso de forma consciente, libre y voluntaria mi pleno consentimiento para iniciar un proceso de acompañamiento psicológico con el terapeuta correspondiente.\n\nDECLARO:\n1. Haber sido informado(a) sobre la metodología psicoterapéutica empleada, la frecuencia de las sesiones y la confidencialidad inherente al secreto profesional.\n2. Reconocer que la terapia requiere de mi compromiso activo y que soy corresponsable del éxito y avance en el tratamiento clínico formulado.\n3. Comprender mi derecho constitucional a suspender o interrumpir el tratamiento clínico en el momento que lo considere necesario sin represalia alguna.\n\nAUTORIZACIÓN:\nDoy mi consentimiento para la recopilación de datos de anamnesis necesarios para mi expediente integral, bajo la Ley de Protección de Datos Personales en vigor.\n\nFecha de Aceptación: ${consentDate} • Año del Expediente: ${consentYear}`;

  const handleSaveConsent = (e) => {
    e.preventDefault();

    if (!patientName.trim()) { alert('Por favor introduce o selecciona un paciente.'); return; }
    if (!acceptTerms) { alert('Debes marcar la casilla para confirmar la firma.'); return; }

    let sigImage = null;
    if (signatureType === 'draw') {
      if (!canvasRef.current || !hasDrawn) { alert('Por favor dibuja tu firma en el recuadro.'); return; }
      sigImage = canvasRef.current.toDataURL('image/png');
    } else {
      if (!typedName.trim()) { alert('Por favor escribe tu nombre como firma digital.'); return; }
    }

    const finalConsentText = getConsentText();
    const newConsent = {
      id: 'consent_' + Math.random().toString(36).substring(2, 9),
      patientId: selectedPatientId === 'manual' ? 'manual' : selectedPatientId,
      patientName,
      date: consentDate,
      year: Number(consentYear),
      templateText: finalConsentText,
      signatureImage: sigImage,
      isTextSigned: signatureType === 'type',
      typedSignature: typedName,
      signedAt: new Date().toLocaleString()
    };

    saveSignedConsents([newConsent, ...signedList]);

    if (selectedPatientId && selectedPatientId !== 'manual') {
      const newFile = {
        id: 'file_' + Math.random().toString(36).substring(2, 9),
        name: `Consentimiento_Firmado_${consentDate.replace(/-/g, '_')}.pdf`,
        size: '1.2 MB',
        category: 'consent_form',
        uploadDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        year: Number(consentYear),
        content: `--- DOCUMENTO OFICIAL DE CONSENTIMIENTO CLÍNICO ---\n\n${finalConsentText}\n\n[Firma registrada el ${newConsent.signedAt}]`
      };
      onAddFile(selectedPatientId, newFile);
    }

    setStatusMsg(`🎉 ¡Carta de consentimiento firmada con éxito por ${patientName}!`);
    setTimeout(() => setStatusMsg(''), 7000);
    setTypedName('');
    setAcceptTerms(false);
    clearCanvas();
  };

  return (
    <div id="consent_system_container" className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-6">
        {statusMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-start gap-2.5 shadow-sm">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <p>{statusMsg}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500">✍️ Redactar y Firmar Documento de Consentimiento</h2>
            <p className="text-xs text-slate-400 mt-0.5">Permite a tus pacientes autorizar el tratamiento psicoterapéutico de forma digital con firma manuscrita.</p>
          </div>

          <form onSubmit={handleSaveConsent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Vincular a Paciente</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handlePatientSelect(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="manual">✍️ Escribir nombre manual...</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>👤 {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Nombre del Paciente</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofía Alarcón"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  disabled={selectedPatientId !== 'manual'}
                  className="w-full mt-1.5 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Fecha</label>
                  <input
                    type="date"
                    required
                    value={consentDate}
                    onChange={(e) => setConsentDate(e.target.value)}
                    className="w-full mt-1.5 px-2.5 py-2 text-xs border border-slate-200 text-slate-700 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Año</label>
                  <input
                    type="number"
                    required
                    value={consentYear}
                    onChange={(e) => setConsentYear(Number(e.target.value))}
                    className="w-full mt-1.5 px-2.5 py-2 text-xs border border-slate-200 text-slate-700 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-2">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-slate-400" /> Previsualización Oficial del Documento
              </span>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-inner font-sans text-xs text-slate-600 space-y-2 leading-relaxed whitespace-pre-wrap max-h-[170px] overflow-y-auto">
                {getConsentText()}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <PenTool className="h-3.5 w-3.5 text-emerald-600" /> Método de Firma del Paciente
                </label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold text-slate-600">
                  <button type="button" onClick={() => setSignatureType('draw')} className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${signatureType === 'draw' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'hover:text-slate-800'}`}>
                    ✏️ Firma Manuscrita
                  </button>
                  <button type="button" onClick={() => setSignatureType('type')} className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${signatureType === 'type' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'hover:text-slate-800'}`}>
                    ⌨️ Escribir Nombre
                  </button>
                </div>
              </div>

              {signatureType === 'draw' ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-slate-400">Usa tu mouse, trackpad o pantalla táctil para dibujar la firma:</p>
                  <div className="border-2 border-dashed border-emerald-250 bg-emerald-50/10 rounded-2xl p-2 relative flex flex-col items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={130}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full bg-white rounded-xl border border-slate-200 cursor-crosshair shadow-sm touch-none"
                    />
                    <div className="w-full flex justify-between items-center text-[10px] text-slate-400 mt-1.5 px-1">
                      <span>Línea del firmante ----------------------------</span>
                      <button type="button" onClick={clearCanvas} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg font-bold hover:bg-red-100 transition-colors cursor-pointer">
                        🗑️ Limpiar Firma rastro
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/10 border border-emerald-100 rounded-2xl space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Escribe tu nombre para validar firma</label>
                    <input
                      type="text"
                      placeholder="Ej: Sofia Alarcón Díaz"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-1 border-t border-slate-100">
              <label className="flex items-start gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-0.5 cursor-pointer"
                />
                <span className="leading-tight">
                  Confirmo que el paciente ha leído atentamente y acepta en su totalidad los términos del consentimiento clínico aquí expuestos.
                </span>
              </label>

              <div className="flex justify-end gap-2.5">
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5">
                  <UserCheck className="h-4 w-4" /> Guardar y Asociar Consentimiento
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
