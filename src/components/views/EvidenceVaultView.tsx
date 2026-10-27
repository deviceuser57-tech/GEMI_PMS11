import React, { useState } from 'react';
import { BaseRecord } from '../../types/pms';
import { FileCheck2, Plus, Search, FileText, CheckCircle2, Mic, MicOff, Volume2, Sparkles, Send } from 'lucide-react';

interface EvidenceVaultViewProps {
  records: BaseRecord[];
  isArabic: boolean;
  onOpenNewRecord: (entity?: any) => void;
  onSelectRecord: (record: BaseRecord) => void;
  onSaveRecord?: (record: BaseRecord) => void;
}

export const EvidenceVaultView: React.FC<EvidenceVaultViewProps> = ({
  records,
  isArabic,
  onOpenNewRecord,
  onSelectRecord,
  onSaveRecord
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [dictatedText, setDictatedText] = useState('');
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [selectedWps, setSelectedWps] = useState('WPS-01');
  const [issuerBody, setIssuerBody] = useState('Offshore Site Inspector');
  const [showDictatePanel, setShowDictatePanel] = useState(false);

  const evidenceList = records.filter(r => r.entity === 'evidence');

  const filtered = evidenceList.filter(e => {
    return (
      e.rid.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.data?.file_name && e.data.file_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.data?.issuing_body && e.data.issuing_body.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Voice Recognition Handler
  const handleVoiceDictation = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isArabic ? 'متصفحك لا يدعم خاصية الإملاء الصوتي المباشر.' : 'Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = isArabic ? 'ar-SA' : 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setDictatedText(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSaveDictatedEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictatedText.trim()) return;

    const newEvidence: BaseRecord = {
      id: `evd-${Date.now()}`,
      rid: `EVD-${Math.floor(100 + Math.random() * 900)}`,
      entity: 'evidence',
      title: evidenceTitle.trim() || (isArabic ? 'ملاحظة مفتش الميدان الصوتية' : 'Dictated Site Inspection Observation'),
      description: dictatedText,
      wps_id: selectedWps,
      department: 'HSE & Safety',
      status: 'Verified',
      owner: issuerBody,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      data: {
        file_name: `Voice_Observation_${Date.now()}.audio`,
        issuing_body: issuerBody,
        verification_seal: 'OFFSHORE_VOICE_VERIFIED',
        is_dictated: true
      }
    };

    if (onSaveRecord) {
      onSaveRecord(newEvidence);
      alert(isArabic ? 'تم إيداع الملاحظة الصوتية بنجاح كدليل معتمد في مستودع الأدلة!' : 'Voice observation successfully saved to Evidence Vault!');
      setDictatedText('');
      setEvidenceTitle('');
      setShowDictatePanel(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              CHAIN OF CUSTODY
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <span>{isArabic ? 'مستودع الأدلة والوثائق الثبوتية المعتمدة' : 'Official Evidence & Document Vault'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isArabic
              ? 'شهادات التفتيش، تقارير الفحص المخبري، وأدلة الامتثال الرسمية والإملاء الصوتي المباشر للمفتشين.'
              : 'Certified test reports, classification certificates, and dictated inspection observations proving compliance.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDictatePanel(!showDictatePanel)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
              showDictatePanel
                ? 'bg-rose-600 text-white'
                : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-600/20'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>{isArabic ? 'إملاء ملاحظات المفتش الميداني 🎙️' : 'Dictate Inspection Note 🎙️'}</span>
          </button>

          <button
            onClick={() => onOpenNewRecord('evidence')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isArabic ? 'إيداع دليل ثبوتي جديد +' : '+ Deposit Evidence'}</span>
          </button>
        </div>
      </div>

      {/* Voice Dictation Panel */}
      {showDictatePanel && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border border-teal-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Mic className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {isArabic ? 'خاصية الإملاء الصوتي المباشر لمفتشي الميدان (Voice-to-Text Dictation)' : 'Field Inspector Voice Dictation Engine'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {isArabic ? 'تتيح للمفتش إملاء ملاحظات الفحص الميداني صوتياً وتحويلها فوراً إلى دليل ثبوتي معتمد.' : 'Dictate observations directly in real-time to convert audio notes into official evidence.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleVoiceDictation}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                  : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isListening ? (isArabic ? 'جاري التسجيل والتحويل...' : 'Recording & Transcribing...') : (isArabic ? 'بدء الإملاء الصوتي 🎙️' : 'Start Dictation 🎙️')}</span>
            </button>
          </div>

          <form onSubmit={handleSaveDictatedEvidence} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isArabic ? 'عنوان الملاحظة / الدليل:' : 'Evidence Title:'}
                </label>
                <input
                  type="text"
                  value={evidenceTitle}
                  onChange={e => setEvidenceTitle(e.target.value)}
                  placeholder={isArabic ? 'مثال: فحص سلامة رافعة السطح الرئيسي...' : 'e.g. Deck crane safety inspection...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isArabic ? 'حزمة العمل المرتبطة (WPS):' : 'Linked WPS:'}
                </label>
                <select
                  value={selectedWps}
                  onChange={e => setSelectedWps(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                >
                  <option value="WPS-01">WPS-01 Hull & Marine Safety</option>
                  <option value="WPS-02">WPS-02 Crane & Lifting Operations</option>
                  <option value="WPS-15">WPS-15 Accommodation & POB</option>
                  <option value="WPS-19">WPS-19 Helideck ECAR 138 (ECAA)</option>
                  <option value="WPS-23">WPS-23 Crew Competence</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isArabic ? 'جهة / اسم المفتش:' : 'Inspector / Authority:'}
                </label>
                <input
                  type="text"
                  value={issuerBody}
                  onChange={e => setIssuerBody(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>{isArabic ? 'نص الملاحظة الصوتية المفرغة (Transcribed Text):' : 'Transcribed Observation Text:'}</span>
                {isListening && (
                  <span className="text-teal-400 font-mono text-[10px] animate-pulse flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    {isArabic ? 'جاري التقاط الصوت المباشر...' : 'Live Audio Capture Active...'}
                  </span>
                )}
              </label>
              <textarea
                rows={3}
                value={dictatedText}
                onChange={e => setDictatedText(e.target.value)}
                placeholder={isArabic ? 'اضغط على زر "بدء الإملاء الصوتي" أو اكتب الملاحظة هنا مباشرة...' : 'Click "Start Dictation" or type inspection observation notes here...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs leading-relaxed focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDictatePanel(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={!dictatedText.trim()}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isArabic ? 'إيداع الملاحظة الصوتية كدليل معتمد' : 'Save Dictated Evidence'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Search */}
      <div className="relative max-w-md">
        <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={isArabic ? 'بحث بالاسم، اسم الملف، أو جهة الإصدار...' : 'Search evidence, file name, or issuer...'}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-200"
        />
      </div>

      {/* Evidence Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ev => (
          <div
            key={ev.id}
            onClick={() => onSelectRecord(ev)}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl cursor-pointer transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                {ev.rid}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-100 text-xs sm:text-sm line-clamp-1">{ev.title}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{ev.description}</p>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                {ev.data?.is_dictated ? <Mic className="w-4 h-4 text-cyan-400" /> : <FileText className="w-4 h-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] text-slate-200 truncate font-semibold">
                  {ev.data?.file_name || `${ev.rid}_Official_Doc.pdf`}
                </p>
                <p className="text-[10px] text-slate-400">
                  {ev.data?.issuing_body || 'Accredited Authority'}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="font-mono text-cyan-400">{ev.wps_id || 'General'}</span>
              <span className="text-slate-300 font-mono">{ev.data?.verification_seal || 'CERTIFIED'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
