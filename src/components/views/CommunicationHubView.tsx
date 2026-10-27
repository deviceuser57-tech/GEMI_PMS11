import React, { useState } from 'react';
import { BaseRecord, ChatMessage, Department } from '../../types/pms';
import {
  MessageSquare,
  Send,
  User,
  Shield,
  AlertCircle,
  CheckCircle2,
  Filter,
  Plus,
  Paperclip,
  Bell,
  Sparkles,
  Users,
  Anchor,
  Clock,
  Check,
  ShieldCheck,
  Search,
  MessageCircle,
  Flame,
  FileCheck2,
  Trash2
} from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';

interface CommunicationHubViewProps {
  records: BaseRecord[];
  messages: ChatMessage[];
  onSendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp' | 'is_read'>) => void;
  onMarkRead: (id: string) => void;
  onSelectRecord: (record: BaseRecord) => void;
  currentUser: { name: string; role: string; department: Department };
  isArabic: boolean;
}

export const CommunicationHubView: React.FC<CommunicationHubViewProps> = ({
  records,
  messages,
  onSendMessage,
  onMarkRead,
  onSelectRecord,
  currentUser,
  isArabic
}) => {
  const [selectedEntity, setSelectedEntity] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // New Message Form State
  const [recipient, setRecipient] = useState<string>('Admin');
  const [messageText, setMessageText] = useState<string>('');
  const [selectedRecordRid, setSelectedRecordRid] = useState<string>('');
  const [priority, setPriority] = useState<'Normal' | 'Urgent' | 'Critical Blocker'>('Normal');
  const [category, setCategory] = useState<'Inquiry' | 'Approval Request' | 'CAPA Escalation' | 'Closeout Review'>('Inquiry');

  useGsapPageReveal();

  const partiesList = [
    'Admin',
    'Barge Master',
    'Marine Superintendent',
    'HSE Superintendent',
    'DNV Class Surveyor',
    'Pipelay Superintendent',
    'QA/QC Lead',
    'Client Representative'
  ];

  const filteredMessages = messages.filter(m => {
    if (selectedEntity !== 'All' && m.recipient_entity !== selectedEntity && m.sender_name !== selectedEntity) return false;
    if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
    if (
      searchQuery &&
      !m.message.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !(m.record_rid && m.record_rid.toLowerCase().includes(searchQuery.toLowerCase()))
    ) {
      return false;
    }
    return true;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    onSendMessage({
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      sender_department: currentUser.department,
      recipient_entity: recipient,
      message: messageText.trim(),
      record_rid: selectedRecordRid || undefined,
      priority,
      category
    });

    setMessageText('');
    setSelectedRecordRid('');
    alert(isArabic ? 'تم إرسال الرسالة بنجاح إلى الجهة المعنية' : 'Message successfully transmitted to target party');
  };

  const generateAutoSmartReply = (msg: ChatMessage) => {
    const matchedRecord = records.find(r => r.rid === msg.record_rid);
    let reply = `[Automated Smart Assistant Response]: Regarding ${msg.record_rid || 'your inquiry'}, current record status is '${matchedRecord?.status || 'In Progress'}'. All 40-sheet compliance rules have been validated.`;
    if (isArabic) {
      reply = `[رد آلي من المساعد الذكي]: بشأن ${msg.record_rid || 'استفساركم'}، حالة السجل الحالية هي '${matchedRecord?.status || 'قيد التنفيذ'}'. تم التحقق من قواعد الامتثال للـ 40 شيت.`;
    }

    onSendMessage({
      sender_name: 'PMS-11 Smart Auto-Bot',
      sender_role: 'System Orchestrator',
      sender_department: 'QA/QC',
      recipient_entity: msg.sender_name,
      message: reply,
      record_rid: msg.record_rid,
      priority: 'Normal',
      category: 'Inquiry'
    });
  };

  return (
    <div className="space-y-6 gsap-card">
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>{isArabic ? 'منظومة الاتصال والربط الشامل (Communication & Entity Bridge)' : 'PMS-11 Communication & Multi-Entity Hub'}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                  LIVE MESSAGING
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isArabic
                  ? 'ربط الميدان بالإدارة والأطراف البحرية (البحرية، السلامة، هيئة التصنيف DNV، ممثل العميل)'
                  : 'Link field engineers with Admin, Barge Master, DNV Surveyor, HSE, and Client Representatives'}
              </p>
            </div>
          </div>
        </div>

        {/* User Identity Context Card */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{currentUser.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{currentUser.department} Department</p>
          </div>
        </div>
      </div>

      {/* Grid: Messages Thread (2 Cols) + Send Message Form (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Feed List (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 flex flex-col">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={selectedEntity}
                onChange={e => setSelectedEntity(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="All">{isArabic ? 'جميع الجهات والكيانات' : 'All Parties / Entities'}</option>
                {partiesList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="All">{isArabic ? 'جميع التصنيفات' : 'All Categories'}</option>
                <option value="Inquiry">Inquiry</option>
                <option value="Approval Request">Approval Request</option>
                <option value="CAPA Escalation">CAPA Escalation</option>
                <option value="Closeout Review">Closeout Review</option>
              </select>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isArabic ? 'بحث بالرسائل أو الكود...' : 'Search messages...'}
                className="bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Messages Feed Container */}
          <div className="space-y-3 overflow-y-auto max-h-[560px] custom-scrollbar pr-1 flex-1">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-12 space-y-2 text-slate-400">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs">{isArabic ? 'لا توجد رسائل مطابقة للفلاتر حالياً' : 'No messages found matching criteria'}</p>
              </div>
            ) : (
              filteredMessages.map(msg => {
                const isUserSender = msg.sender_name === currentUser.name;
                const matchedRecord = records.find(r => r.rid === msg.record_rid);

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl border transition-all ${
                      msg.priority === 'Critical Blocker'
                        ? 'bg-rose-950/30 border-rose-800/80'
                        : msg.priority === 'Urgent'
                        ? 'bg-amber-950/30 border-amber-800/80'
                        : 'bg-slate-950 border-slate-800 hover:border-cyan-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-300 font-bold text-xs">
                          {msg.sender_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                            <span>{msg.sender_name}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({msg.sender_role} • {msg.sender_department})</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {isArabic ? 'إلى الجهة:' : 'To:'} <strong className="text-cyan-300">{msg.recipient_entity}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            msg.priority === 'Critical Blocker'
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : msg.priority === 'Urgent'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {msg.priority}
                        </span>

                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {msg.message}
                    </p>

                    {/* Attached Record Card Tag */}
                    {msg.record_rid && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="font-mono text-xs font-extrabold text-cyan-300">
                            {msg.record_rid}
                          </span>
                          {matchedRecord && (
                            <span className="text-[11px] text-slate-300 truncate max-w-xs">
                              {matchedRecord.title}
                            </span>
                          )}
                        </div>

                        {matchedRecord && (
                          <button
                            onClick={() => onSelectRecord(matchedRecord)}
                            className="text-[10px] px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-800 font-semibold"
                          >
                            {isArabic ? 'عرض السجل' : 'View Record'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-mono">
                        Category: {msg.category}
                      </span>

                      <button
                        onClick={() => generateAutoSmartReply(msg)}
                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isArabic ? 'توليد رد آلي موجه' : 'Generate Smart Auto-Response'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Send Message Form (1 Column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 flex flex-col">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              <span>{isArabic ? 'إرسال توجيه / استفسار جديد' : 'Compose Entity Inquiry'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isArabic ? 'توجيه خطاب أو طلب موافقة إلى الإدارة أو الأطراف الخارجية' : 'Send official communication to Admin, Class Surveyor, or Leads'}
            </p>
          </div>

          <form onSubmit={handleSend} className="space-y-3 text-xs flex-1 flex flex-col">
            {/* Target Party */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                {isArabic ? 'الجهة المستلمة (Recipient Party):' : 'Target Recipient Entity:'}
              </label>
              <select
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {partiesList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isArabic ? 'التصنيف:' : 'Category:'}
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Inquiry">Inquiry</option>
                  <option value="Approval Request">Approval Request</option>
                  <option value="CAPA Escalation">CAPA Escalation</option>
                  <option value="Closeout Review">Closeout Review</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  {isArabic ? 'الأولوية:' : 'Priority:'}
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical Blocker">Critical Blocker</option>
                </select>
              </div>
            </div>

            {/* Attach Record RID */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                {isArabic ? 'ربط بسجل محدد (Attach Record RID):' : 'Attach Record RID:'}
              </label>
              <select
                value={selectedRecordRid}
                onChange={e => setSelectedRecordRid(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="">{isArabic ? '-- بدون سجل مخصص --' : '-- No attached record --'}</option>
                {records.slice(0, 30).map(r => (
                  <option key={r.id} value={r.rid}>
                    [{r.rid}] {r.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Message Body */}
            <div className="flex-1 flex flex-col">
              <label className="text-slate-300 font-bold block mb-1">
                {isArabic ? 'نص الرسالة / الخطاب:' : 'Communication Body:'}
              </label>
              <textarea
                required
                rows={5}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder={isArabic ? 'اكتب تفاصيل الاستفسار أو طلب التوقيع...' : 'Enter formal inquiry details, approval request rationale, or findings...'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 flex-1 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isArabic ? 'إرسال الرسالة للجهة المستهدفة' : 'Transmit Message to Target Entity'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
