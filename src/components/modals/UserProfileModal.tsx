import React, { useState } from 'react';
import { UserProfile, DEFAULT_USER_PROFILES, ALL_DEPARTMENTS } from '../../lib/rbac';
import { Department, UserRole } from '../../types/pms';
import { X, Shield, Users, Check, Building2, UserCheck, Layers, Eye, RefreshCw, Printer } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  isArabic: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  isArabic
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [selectedUser, setSelectedUser] = useState<UserProfile>(currentUser);

  // Custom profile form state
  const [customName, setCustomName] = useState(currentUser.name);
  const [customRole, setCustomRole] = useState<UserRole>(currentUser.role);
  const [customPrimaryDept, setCustomPrimaryDept] = useState<Department>(currentUser.primaryDepartment);
  const [customAssistingDepts, setCustomAssistingDepts] = useState<Department[]>(currentUser.assistingDepartments || []);

  const handleToggleAssistingDept = (dept: Department) => {
    if (dept === 'All') return;
    if (customAssistingDepts.includes(dept)) {
      setCustomAssistingDepts(customAssistingDepts.filter(d => d !== dept));
    } else {
      setCustomAssistingDepts([...customAssistingDepts, dept]);
    }
  };

  const handleApplyPreset = (profile: UserProfile) => {
    onSelectUser(profile);
    onClose();
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...selectedUser,
      name: customName,
      role: customRole,
      primaryDepartment: customPrimaryDept,
      assistingDepartments: customPrimaryDept === 'All' ? [] : customAssistingDepts
    };
    onSelectUser(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl flex flex-col printable-area">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <span>{isArabic ? 'نظام دخول بالصلاحيات والإدارات المخصصة' : 'Department & Role Access Control (RBAC)'}</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
                  RLS ENFORCED
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'اختر الشخصية الوظيفية أو خصص الإدارات المباشرة والمعاونة لتصفية المهام والأعمال تلقائياً'
                  : 'Select operational persona or customize assigned & assisting departments to filter tasks dynamically'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 transition-colors flex items-center gap-1 text-xs font-bold"
              title={isArabic ? 'طباعة بيان الصلاحيات' : 'Print User RBAC Settings'}
            >
              <Printer className="w-4 h-4" />
              <span>{isArabic ? 'طباعة' : 'Print'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 bg-slate-950/40 border-b border-slate-800 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{isArabic ? 'الشخصيات الإدارية الجاهزة (9 أدوار)' : 'Predefined Personas (9 Roles)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'custom'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isArabic ? 'تخصيص الإدارات والصلاحيات' : 'Custom Department Allocation'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 text-xs space-y-4">
          {activeTab === 'presets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEFAULT_USER_PROFILES.map(profile => {
                const isCurrent = currentUser.id === profile.id || currentUser.name === profile.name;
                return (
                  <div
                    key={profile.id}
                    onClick={() => handleApplyPreset(profile)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${profile.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-md`}>
                          {profile.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">
                            {isArabic ? profile.nameArabic : profile.name}
                          </h4>
                          <p className="text-[11px] text-cyan-400 font-medium">
                            {isArabic ? profile.roleTitleArabic : profile.roleTitle}
                          </p>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="p-1 rounded-full bg-cyan-500 text-slate-950">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 border-t border-slate-800/80 pt-2 text-[11px]">
                      <div className="flex items-center justify-between text-slate-300">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-cyan-400" />
                          {isArabic ? 'الإدارة الرئيسية:' : 'Primary Dept:'}
                        </span>
                        <span className="font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                          {profile.primaryDepartment === 'All'
                            ? isArabic ? 'جميع الإدارات (Admin)' : 'All Departments (Admin)'
                            : profile.primaryDepartment}
                        </span>
                      </div>

                      {profile.primaryDepartment !== 'All' && (
                        <div className="text-slate-300">
                          <span className="text-slate-500 block mb-1">
                            {isArabic ? 'الإدارات المعاونة / المسموح بها:' : 'Assisting Departments:'}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {profile.assistingDepartments.length > 0 ? (
                              profile.assistingDepartments.map(d => (
                                <span key={d} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                                  +{d}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-500 italic text-[10px]">{isArabic ? 'لا توجد إدارات إضافية' : 'None'}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyPreset(profile);
                      }}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      {isCurrent
                        ? isArabic ? 'الشخصية النشطة الآن' : 'Active Persona'
                        : isArabic ? 'الدخول بهذه الإدارة' : 'Switch to Persona'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleApplyCustom} className="space-y-4 bg-slate-950/80 p-5 rounded-xl border border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    {isArabic ? 'اسم المستخدم / الصفة' : 'User Name / Role'}
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">
                    {isArabic ? 'صلاحيات الوصول (Role Access Level)' : 'Role Access Level'}
                  </label>
                  <select
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value as UserRole)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:ring-1 focus:ring-cyan-500 font-semibold"
                  >
                    <option value="Admin">{isArabic ? 'مشرف عام (Admin - Full Access)' : 'Admin - Full Access'}</option>
                    <option value="Department Manager">{isArabic ? 'مدير إدارة (Department Manager)' : 'Department Manager'}</option>
                    <option value="Engineer/Inspector">{isArabic ? 'مهندس / مفتش ميداني (Engineer / Inspector)' : 'Engineer / Inspector'}</option>
                    <option value="Viewer">{isArabic ? 'مطلع فقط (Viewer)' : 'Viewer'}</option>
                  </select>
                </div>
              </div>

              {/* Primary Department */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">
                  {isArabic ? 'الإدارة الرئيسية للمستخدم (Primary Assigned Department)' : 'Primary Assigned Department'}
                </label>
                <select
                  value={customPrimaryDept}
                  onChange={e => setCustomPrimaryDept(e.target.value as Department)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs font-bold text-cyan-300 focus:ring-1 focus:ring-cyan-500"
                >
                  {ALL_DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'All' ? (isArabic ? 'جميع الإدارات (عرض شامل - Admin)' : 'All Departments (Global Executive)') : dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assisting / Secondary Departments */}
              {customPrimaryDept !== 'All' && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5">
                    {isArabic ? 'الإدارات المعاونة أو المشتركة (تتيح رؤية مهام وأنشطة هذه الإدارات أيضاً):' : 'Assisting / Collaborating Departments (Grants visibility into these tasks as well):'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                    {ALL_DEPARTMENTS.filter(d => d !== 'All' && d !== customPrimaryDept).map(dept => {
                      const isSelected = customAssistingDepts.includes(dept);
                      return (
                        <button
                          key={dept}
                          type="button"
                          onClick={() => handleToggleAssistingDept(dept)}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs transition-all border text-left ${
                            isSelected
                              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{dept}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Info banner */}
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/80 rounded-xl text-[11px] text-cyan-200 flex items-start gap-2">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  {isArabic
                    ? 'عند تفعيل التخصيص، سيتم تقييد كافة شاشات التطبيق (اللوحة التنفيذية، حزم WPS، المهام، البوابات، الفجوات، المخرجات، والشهادات) لتظهر فقط البيانات الخاصة بالإدارة الرئيسية والإدارات المعاونة المحددة.'
                    : 'Once applied, all application modules (Dashboard, WPS Packages, Tasks, Gates, Findings, Deliverables, Certificates) will strictly filter content to match your selected primary and assisting departments.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-md shadow-cyan-600/30"
                >
                  {isArabic ? 'حفظ وتطبيق الصلاحيات' : 'Save & Apply RBAC Scope'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
