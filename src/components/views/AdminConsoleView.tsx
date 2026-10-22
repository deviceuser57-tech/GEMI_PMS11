import React, { useState } from 'react';
import { BaseRecord, AuditLog } from '../../types/pms';
import { Shield, Users, Database, RefreshCw, Key, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { useGsapPageReveal } from '../../lib/animations';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Supervisor' | 'Viewer';
  department: string;
  lastActive: string;
}

interface AdminConsoleViewProps {
  currentUser: UserProfile;
  onSwitchUser: (user: UserProfile) => void;
  records: BaseRecord[];
  auditLogs: AuditLog[];
  isArabic: boolean;
  onResetSystemData: () => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  currentUser,
  onSwitchUser,
  records,
  auditLogs,
  isArabic,
  onResetSystemData
}) => {
  const containerRef = useGsapPageReveal<HTMLDivElement>();

  const [users, setUsers] = useState<UserProfile[]>([
    { id: 'u1', name: 'Capt. Ahmed Al-Mansoori', email: 'ahmed.m@pms11.offshore', role: 'Admin', department: 'Project Management', lastActive: 'Just now' },
    { id: 'u2', name: 'Eng. John Smith', email: 'john.smith@pms11.offshore', role: 'Supervisor', department: 'Marine & Technical', lastActive: '5 mins ago' },
    { id: 'u3', name: 'Sarah Jenkins', email: 'sarah.j@pms11.offshore', role: 'Viewer', department: 'QA/QC & Audit', lastActive: '1 hour ago' },
  ]);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Admin' | 'Supervisor' | 'Viewer'>('Viewer');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    const created: UserProfile = {
      id: `u-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      department: 'General Operations',
      lastActive: 'New'
    };
    setUsers([...users, created]);
    setNewUserName('');
    setNewUserEmail('');
    alert(isArabic ? 'تمت إضافة المستخدم بنجاح.' : 'User successfully added.');
  };

  const isAdmin = currentUser.role === 'Admin';

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-teal-950 border border-teal-500/30 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {isArabic ? 'وحدة التحكم الإدارية والأمنية (Admin Console)' : 'Admin Console & Access Control'}
              </span>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {isArabic ? `المستخدم الحالي: ${currentUser.role}` : `Current Role: ${currentUser.role}`}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
              {isArabic ? 'إدارة المستخدمين، الصلاحيات، وحالة النظام' : 'User Roles, Permissions & System Governance'}
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm max-w-2xl leading-relaxed">
              {isArabic
                ? 'التحكم في صلاحيات الوصول (Admin, Supervisor, Viewer)، إدارة المستخدمين، ومراقبة حالة قاعدة البيانات واستعادة البيانات.'
                : 'Manage role-based access control (RBAC), user permissions, database health, and system recovery.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block">{isArabic ? 'المسجل حالياً:' : 'Logged in as:'}</span>
              <span className="text-white font-bold">{currentUser.name}</span>
            </div>
          </div>
        </div>
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Role Switcher Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-teal-400" />
          <span>{isArabic ? 'تبديل دور المستخدم الحالي (للتجربة والاختبار)' : 'Switch Active User Role'}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {users.map(u => (
            <div
              key={u.id}
              onClick={() => onSwitchUser(u)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                currentUser.id === u.id
                  ? 'bg-teal-950/50 border-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <p className="font-bold text-xs">{u.name}</p>
                <p className="text-[11px] text-slate-400">{u.email}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                  u.role === 'Admin' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                  u.role === 'Supervisor' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-cyan-950 text-cyan-300 border border-cyan-800'
                }`}>
                  {u.role}
                </span>
              </div>
              {currentUser.id === u.id && <CheckCircle2 className="w-5 h-5 text-teal-400" />}
            </div>
          ))}
        </div>
      </div>

      {/* Admin Privileges & System Reset (Admin Only) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-rose-400" />
          <span>{isArabic ? 'إدارة النظام وقاعدة البيانات (صلاحيات المدير)' : 'System Database Governance (Admin Restricted)'}</span>
        </h3>

        {!isAdmin ? (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-300 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>{isArabic ? 'تحتاج إلى صلاحية "مدير (Admin)" للقيام بعمليات إعادة الضبط وحذف السجلات الحساسة.' : 'Admin role is required to perform system reset and sensitive record deletions.'}</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="font-bold text-xs text-white">{isArabic ? 'استعادة بيانات المصنع الافتراضية (40 شيت)' : 'Reset System to Default 40-Sheet Seed Dataset'}</p>
              <p className="text-[11px] text-slate-400">{isArabic ? 'سيؤدي هذا إلى إعادة تعيين جميع السجلات وحزم العمل الـ 24 والبوابات لحالتها الأصلية.' : 'This will reset all records, 24 WPS work packages and gates to their initial seed state.'}</p>
            </div>
            <button
              onClick={onResetSystemData}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isArabic ? 'إعادة ضبط النظام بالكامل' : 'Reset System Data'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Add New User Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-teal-400" />
          <span>{isArabic ? 'إضافة مستخدم جديد وصلاحية' : 'Add New User & Assign Role'}</span>
        </h3>

        <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{isArabic ? 'اسم المستخدم' : 'Full Name'}</label>
            <input
              type="text"
              required
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              placeholder="e.g. Capt. Omar"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{isArabic ? 'البريد الإلكتروني' : 'Email'}</label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={e => setNewUserEmail(e.target.value)}
              placeholder="omar@pms11.offshore"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">{isArabic ? 'الدور والصلاحية' : 'Role'}</label>
            <select
              value={newUserRole}
              onChange={e => setNewUserRole(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs"
            >
              <option value="Admin">Admin (مدير كامل)</option>
              <option value="Supervisor">Supervisor (مشرف)</option>
              <option value="Viewer">Viewer (مشاهد)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-md"
            >
              {isArabic ? '+ إضافة المستخدم' : '+ Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
