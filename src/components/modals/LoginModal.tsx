import React from 'react';
import { UserProfile, DEFAULT_USER_PROFILES } from '../../lib/rbac';
import { ShieldCheck, UserCheck, Lock, Building2, KeyRound, ChevronRight, Check } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogin: (user: UserProfile) => void;
  isArabic: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  isArabic
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a192f]/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0f2942] border border-[#1a3a5c] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Top Branding Banner */}
        <div className="bg-gradient-to-r from-[#0f2942] via-[#1a3a5c] to-[#0f2942] p-6 border-b border-[#1a3a5c] relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ff6600] flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800 tracking-wider">
                  SCEDC & ECAA SECURE AUTH
                </span>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  {isArabic ? 'بوابة دخول وتأكيد صلاحيات الأقسام' : 'Department Role-Based Access Login'}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isArabic
                    ? 'اختر حساب الإدارة لتطبيق الفلتر التلقائي وإظهار المهام والأعمال التابعة لهذه الإدارة فقط'
                    : 'Select department persona to automatically filter all operational tasks & records'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-[#1a3a5c] hover:bg-[#234b75] text-slate-300 text-xs font-bold transition-all"
            >
              {isArabic ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>

        {/* User Profiles Grid */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{isArabic ? 'الشخصيات الوظيفية المتاحة بالنظام:' : 'Available Operational Personas:'}</span>
            <span className="text-orange-400 font-mono text-[11px]">{DEFAULT_USER_PROFILES.length} Active Accounts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {DEFAULT_USER_PROFILES.map((profile) => {
              const isActive = currentUser.id === profile.id;
              return (
                <button
                  key={profile.id}
                  onClick={() => {
                    onLogin(profile);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-3 group ${
                    isActive
                      ? 'bg-[#1a3a5c] border-[#ff6600] shadow-lg shadow-orange-500/20 ring-1 ring-[#ff6600]'
                      : 'bg-[#0a192f]/60 border-[#1a3a5c] hover:bg-[#1a3a5c]/80 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 w-full">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${profile.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                        {profile.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white group-hover:text-orange-300 transition-colors">
                          {isArabic ? profile.nameArabic : profile.name}
                        </h4>
                        <p className="text-[11px] text-slate-300 font-medium">
                          {isArabic ? profile.roleTitleArabic : profile.roleTitle}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <span className="p-1 rounded-full bg-[#ff6600] text-white">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#1a3a5c]/80 flex items-center justify-between text-[11px] w-full">
                    <span className="font-bold text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-800/60">
                      {profile.primaryDepartment === 'All'
                        ? (isArabic ? 'جميع الإدارات (Super Admin)' : 'All Depts')
                        : (isArabic ? `إدارة: ${profile.primaryDepartment}` : profile.primaryDepartment)}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1 group-hover:text-white transition-colors">
                      <span>{isArabic ? 'دخول الان' : 'Login'}</span>
                      <ChevronRight className="w-3 h-3 text-orange-400" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-[#0a192f] border-t border-[#1a3a5c] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>{isArabic ? 'النظام يطبق صلاحيات RLS على مستوى السجلات تلقائياً' : 'Row Level Security (RLS) Enforced'}</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">SCEDC Version 2026.10</span>
        </div>
      </div>
    </div>
  );
};
