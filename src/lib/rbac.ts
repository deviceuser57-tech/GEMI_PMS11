import { Department, UserRole, BaseRecord, DocumentRepositoryItem, RemediationAction } from '../types/pms';

export interface UserProfile {
  id: string;
  name: string;
  nameArabic: string;
  roleTitle: string;
  roleTitleArabic: string;
  role: UserRole;
  primaryDepartment: Department; // 'Marine', 'HSE & Safety', etc. or 'All'
  assistingDepartments: Department[]; // Assisting or secondary departments
  avatarColor: string;
}

export const ALL_DEPARTMENTS: Department[] = [
  'All',
  'Marine',
  'Technical & Maintenance',
  'HSE & Safety',
  'Diving Operations',
  'Pipelay Operations',
  'Catering & Accommodation',
  'Aviation & Helideck',
  'QA/QC',
  'Project Management'
];

export const DEFAULT_USER_PROFILES: UserProfile[] = [
  {
    id: 'usr-01',
    name: 'Eng. Mahmoud Hassan',
    nameArabic: 'م. محمود حسن',
    roleTitle: 'Offshore Barge Master & Admin',
    roleTitleArabic: 'ربان البارجة والمشرف العام (Admin)',
    role: 'Admin',
    primaryDepartment: 'All',
    assistingDepartments: [],
    avatarColor: 'bg-cyan-600'
  },
  {
    id: 'usr-02',
    name: 'Capt. Tarek Al-Masry',
    nameArabic: 'القبطان طارق المصري',
    roleTitle: 'Marine Operations Lead',
    roleTitleArabic: 'رئيس قسم العمليات البحرية والاتزان',
    role: 'Department Manager',
    primaryDepartment: 'Marine',
    assistingDepartments: ['Aviation & Helideck', 'Catering & Accommodation', 'Project Management'],
    avatarColor: 'bg-blue-600'
  },
  {
    id: 'usr-03',
    name: 'Eng. Sameh Abdelaziz',
    nameArabic: 'م. سامح عبد العزيز',
    roleTitle: 'Technical & Maintenance Chief',
    roleTitleArabic: 'رئيس قسم الصيانة والفنية والكهرباء',
    role: 'Department Manager',
    primaryDepartment: 'Technical & Maintenance',
    assistingDepartments: ['Pipelay Operations', 'Marine', 'QA/QC'],
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-04',
    name: 'Dr. Ahmed Al-Azzawi',
    nameArabic: 'د. أحمد العزاوي',
    roleTitle: 'HSE & Safety Manager',
    roleTitleArabic: 'مدير السلامة والبيئة والصحة المهنية',
    role: 'Department Manager',
    primaryDepartment: 'HSE & Safety',
    assistingDepartments: ['QA/QC', 'Aviation & Helideck', 'Catering & Accommodation', 'Diving Operations'],
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'usr-05',
    name: 'Eng. Hassan Al-Najar',
    nameArabic: 'م. حسن النجار',
    roleTitle: 'Pipelay & Construction Lead',
    roleTitleArabic: 'رئيس قسم إنشاءات وتمديد الأنابيب',
    role: 'Department Manager',
    primaryDepartment: 'Pipelay Operations',
    assistingDepartments: ['Technical & Maintenance', 'QA/QC', 'Diving Operations'],
    avatarColor: 'bg-orange-600'
  },
  {
    id: 'usr-06',
    name: 'Capt. Khaled Mostafa',
    nameArabic: 'الكابتن خالد مصطفى',
    roleTitle: 'Aviation & Helideck Officer',
    roleTitleArabic: 'مسؤول مهبط الطائرات والخدمات الجوية',
    role: 'Department Manager',
    primaryDepartment: 'Aviation & Helideck',
    assistingDepartments: ['HSE & Safety', 'Marine'],
    avatarColor: 'bg-purple-600'
  },
  {
    id: 'usr-07',
    name: 'Ing. Johan Lindqvist',
    nameArabic: 'م. يوهان ليندكفيست',
    roleTitle: 'DNV Principal Class Inspector',
    roleTitleArabic: 'مفتش هيئة الإشراف والتصنيف DNV/GL',
    role: 'Engineer/Inspector',
    primaryDepartment: 'QA/QC',
    assistingDepartments: ['Marine', 'Technical & Maintenance', 'HSE & Safety', 'Pipelay Operations'],
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'usr-08',
    name: 'Eng. Ibrahim Sayed',
    nameArabic: 'م. إبراهيم سيد',
    roleTitle: 'Diving Operations Superintendent',
    roleTitleArabic: 'مشرف العمليات والغوص العميق IMCA',
    role: 'Department Manager',
    primaryDepartment: 'Diving Operations',
    assistingDepartments: ['HSE & Safety', 'Technical & Maintenance'],
    avatarColor: 'bg-teal-600'
  },
  {
    id: 'usr-09',
    name: 'M. Campione',
    nameArabic: 'م. ماريو كامبيوني',
    roleTitle: 'Accommodation & Camp Boss',
    roleTitleArabic: 'مدير الفندقة والإعاشة MLC 2006',
    role: 'Department Manager',
    primaryDepartment: 'Catering & Accommodation',
    assistingDepartments: ['HSE & Safety', 'Marine'],
    avatarColor: 'bg-rose-600'
  }
];

const CURRENT_USER_STORAGE_KEY = 'pms11_active_user_v1';

export const getStoredUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) return parsed;
    }
  } catch (e) {
    console.error('Failed to load user profile', e);
  }
  return DEFAULT_USER_PROFILES[0]; // Admin default
};

export const saveUserProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save user profile', e);
  }
};

/**
 * Determines whether a record is accessible based on the active UserProfile
 * AND an optional header department filter override.
 */
export const isRecordAccessible = (
  record: BaseRecord,
  userProfile: UserProfile,
  activeDeptFilter: Department = 'All'
): boolean => {
  // If user is Admin or has 'All' primary department
  const isUserGlobal = userProfile.role === 'Admin' || userProfile.primaryDepartment === 'All';

  // Check header explicit filter first if set to a specific department and user is global
  if (activeDeptFilter !== 'All') {
    const matchesFilter =
      record.department === activeDeptFilter ||
      record.department === 'All' ||
      (record.assisting_departments && record.assisting_departments.includes(activeDeptFilter));

    if (isUserGlobal) {
      return Boolean(matchesFilter);
    }
  }

  if (isUserGlobal) {
    return true;
  }

  // Record is directly assigned to user's primary department
  if (record.department === userProfile.primaryDepartment || record.department === 'All') {
    return true;
  }

  // Record's primary department is in user's assisting departments
  if (userProfile.assistingDepartments && userProfile.assistingDepartments.includes(record.department)) {
    return true;
  }

  // Record's assisting departments includes user's primary department
  if (record.assisting_departments && record.assisting_departments.includes(userProfile.primaryDepartment)) {
    return true;
  }

  // Overlap between record's assisting departments and user's assisting departments
  if (record.assisting_departments && userProfile.assistingDepartments) {
    const hasOverlap = record.assisting_departments.some(d => userProfile.assistingDepartments.includes(d));
    if (hasOverlap) return true;
  }

  return false;
};

/**
 * Filters a list of BaseRecords according to user profile and active department selection.
 */
export const filterRecordsForUser = (
  records: BaseRecord[],
  userProfile: UserProfile,
  activeDeptFilter: Department = 'All'
): BaseRecord[] => {
  return records.filter(r => isRecordAccessible(r, userProfile, activeDeptFilter));
};

/**
 * Checks accessibility for DocumentRepositoryItem
 */
export const isDocumentAccessible = (
  doc: DocumentRepositoryItem,
  userProfile: UserProfile,
  activeDeptFilter: Department = 'All'
): boolean => {
  if (userProfile.role === 'Admin' || userProfile.primaryDepartment === 'All') {
    if (activeDeptFilter === 'All') return true;
    return doc.department === activeDeptFilter || doc.department === 'All' || Boolean(doc.assisting_departments?.includes(activeDeptFilter));
  }

  if (doc.department === userProfile.primaryDepartment || doc.department === 'All') return true;
  if (userProfile.assistingDepartments.includes(doc.department)) return true;
  if (doc.assisting_departments?.includes(userProfile.primaryDepartment)) return true;
  if (doc.assisting_departments && userProfile.assistingDepartments.some(d => doc.assisting_departments?.includes(d))) return true;

  return false;
};

/**
 * Checks accessibility for RemediationAction
 */
export const isRemediationAccessible = (
  action: RemediationAction,
  userProfile: UserProfile,
  activeDeptFilter: Department = 'All'
): boolean => {
  if (userProfile.role === 'Admin' || userProfile.primaryDepartment === 'All') {
    if (activeDeptFilter === 'All') return true;
    return action.assigned_department === activeDeptFilter || action.assigned_department === 'All' || Boolean(action.assisting_departments?.includes(activeDeptFilter));
  }

  if (action.assigned_department === userProfile.primaryDepartment || action.assigned_department === 'All') return true;
  if (userProfile.assistingDepartments.includes(action.assigned_department)) return true;
  if (action.assisting_departments?.includes(userProfile.primaryDepartment)) return true;

  return false;
};
