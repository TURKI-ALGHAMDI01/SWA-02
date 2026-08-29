"use client";

import type React from "react";
import { useMemo, useState } from "react";

type ViewKey = "home" | "workspace" | "team" | "intake" | "work" | "transactions" | "services" | "external" | "oversight" | "sla" | "analytics" | "access";
type RoleKey = "center" | "owner" | "branch" | "employee" | "executive" | "access" | "external";
type WorkType = "مهمة" | "طلب" | "معاملة تراسل" | "زيارة";
type WorkStatus = "مسودة" | "جديد" | "مفتوحة" | "قيد الفرز" | "محالة إلى الإدارة" | "مسندة" | "قيد التنفيذ" | "بانتظار تحديث" | "بانتظار إفادة" | "بانتظار الاعتماد" | "معلقة" | "جاهز للتحقق" | "مكتملة من الفرع" | "متأخر" | "مكتمل" | "مغلق" | "ملغى";
type IconName = "home" | "briefcase" | "users" | "inbox" | "list" | "grid" | "chart" | "clock" | "report" | "shield" | "search" | "bell" | "plus" | "arrow" | "check" | "alert" | "file" | "calendar" | "close" | "chevron" | "download" | "eye" | "edit" | "send" | "user";

type WorkItem = {
  id: string;
  title: string;
  type: WorkType;
  branch: string;
  owner: string;
  status: WorkStatus;
  priority: "منخفضة" | "متوسطة" | "عالية" | "عاجلة";
  due: string;
  description: string;
  progress: number;
  source: "مباشر" | "تراسل" | "تكامل منصة الزيارات" | "بوابة الجهات الخارجية";
  transactionNo?: string;
  transactionDate?: string;
  officialTarasulStatus?: "مفتوحة" | "مغلقة";
  updateDue?: string;
  internalNote?: string;
  attachment?: string;
  externalEntity?: string;
  citizen?: { name: string; id: string; mobile: string; purpose: string; requestedDate: string };
  createdBy?: string;
  selfManaged?: boolean;
  intakeOrigin?: "زيارة مواطن" | "جهة خارجية";
  assignmentType?: "إدارة" | "موظف";
  assignedDepartment?: string;
  assignedEmployee?: string;
  requestScope?: "مكتب وكيل الفروع" | "داخل الفرع" | "بين الفروع";
  originBranch?: string;
  expectedResult?: string;
  category?: string;
  updates: { date: string; author: string; text: string; progress: number; visibility?: "رسمي مشترك" | "ملاحظة داخلية"; done?: string; ongoing?: string; next?: string; challenges?: string; attachment?: string }[];
};

type UpdatePayload = { text: string; progress: number; visibility: "رسمي مشترك" | "ملاحظة داخلية"; attachment?: string };

type AssignmentPayload = {
  type: "department" | "employee";
  department: string;
  employee?: string;
  instructions: string;
  due: string;
};

type PlatformUser = { name: string; employee: string; role: string; scope: string; team: string; state: "نشط" | "غير نشط"; email?: string; jobTitle?: string; accessUntil?: string };

type ExternalRequest = {
  id: string;
  workId: string;
  title: string;
  entity: string;
  contact: string;
  due: string;
  priority: "متوسطة" | "عالية" | "عاجلة";
  status: "بانتظار الرد" | "يتطلب استكمال" | "تحت المراجعة" | "مكتمل";
  requirement: string;
  service?: string;
  branch?: string;
  expected?: string;
  proposedDate?: string;
  attachment?: string;
  response?: string;
  responseAttachment?: string;
  assignedCoordinator?: string;
  assignedEmployee?: string;
};

const scopeCoordinators: Record<string, string> = {
  "فرع الهيئة بالمنطقة الوسطى": "موظف الإدارة التنفيذية",
  "فرع الهيئة بالمنطقة الشرقية": "ريم الدوسري",
  "فرع الهيئة بالمنطقة الغربية": "خالد الزهراني",
  "فرع الهيئة بالمنطقة الجنوبية": "عبدالعزيز العسيري",
  "فرع الهيئة بالمنطقة الوسطى الشمالية": "سارة القحطاني",
  "فرع الهيئة بالمنطقة الشمالية الغربية": "مها الحربي",
};

const branchDepartments = ["إدارة التشغيل والصيانة", "إدارة المشاريع", "إدارة خدمات العملاء", "إدارة التخطيط والأداء", "إدارة الشكاوى"];

const scopeEmployees = [
  { name: "نورة القحطاني", department: "إدارة التشغيل والصيانة" },
  { name: "عبدالله الحربي", department: "إدارة المشاريع" },
  { name: "سلمان الزهراني", department: "إدارة خدمات العملاء" },
  { name: "ريم الغامدي", department: "إدارة التخطيط والأداء" },
  { name: "هدى العتيبي", department: "إدارة الشكاوى" },
];

const iconPaths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5M9 21v-7h6v7"/></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  inbox: <><path d="M4 4h16v13H4z"/><path d="M4 13h4l2 3h4l2-3h4M8 8h8"/></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  report: <><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  arrow: <><path d="M19 12H5M11 18l-6-6 6-6"/></>,
  check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
  alert: <><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/></>,
  file: <><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  chevron: <><path d="m9 18 6-6-6-6"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
  eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>;
}

const navItems: { key: ViewKey; label: string; icon: IconName }[] = [
  { key: "home", label: "الرئيسية", icon: "home" }, { key: "workspace", label: "مساحة عملي", icon: "briefcase" },
  { key: "team", label: "صندوق الفريق", icon: "users" }, { key: "intake", label: "الاستقبال والفرز", icon: "inbox" },
  { key: "work", label: "الطلبات", icon: "list" }, { key: "transactions", label: "معاملات تراسل", icon: "file" },
  { key: "external", label: "بوابة الجهات الخارجية", icon: "users" },
  { key: "oversight", label: "المتابعة التنفيذية", icon: "chart" }, { key: "sla", label: "الأداء ومستويات الخدمة", icon: "clock" },
  { key: "analytics", label: "التقارير والتحليلات", icon: "report" }, { key: "access", label: "المستخدمون والوصول", icon: "shield" },
];

const roleProfiles: Record<RoleKey, { name: string; role: string; scope: string; initials: string }> = {
  center: { name: "تركي الغامدي", role: "موظف مكتب وكيل الفروع", scope: "جميع الفروع", initials: "تغ" },
  owner: { name: "م. فهد المطيري", role: "المسؤول التنفيذي للفرع", scope: "فرع الهيئة بالمنطقة الغربية فقط", initials: "فم" },
  branch: { name: "خالد الزهراني", role: "موظف الإدارة التنفيذية للفرع", scope: "فرع الهيئة بالمنطقة الغربية فقط", initials: "خز" },
  employee: { name: "نورة القحطاني", role: "منفذ العمل", scope: "أعمالي فقط · فرع الهيئة بالمنطقة الغربية", initials: "نق" },
  executive: { name: "وكيل فروع الهيئة السعودية للمياه", role: "وكيل فروع الهيئة السعودية للمياه", scope: "المتابعة التنفيذية · جميع الفروع", initials: "وف" },
  access: { name: "عبدالله الشهري", role: "مسؤول إدارة المنصة", scope: "إدارة المستخدمين والصلاحيات فقط", initials: "عش" },
  external: { name: "سلمان الحربي", role: "ممثل الجهة الخارجية المفوّض", scope: "أمانة محافظة جدة · طلبات الجهة فقط", initials: "سح" },
};

const roleOrder: RoleKey[] = ["executive", "owner", "center", "branch", "employee", "access", "external"];

const branchRows = [
  { name: "فرع الهيئة بالمنطقة الوسطى", total: 30, done: 22, progress: 6, delayed: 2, rate: 73, ready: "مؤكد" },
  { name: "فرع الهيئة بالمنطقة الشرقية", total: 31, done: 25, progress: 5, delayed: 1, rate: 81, ready: "مؤكد" },
  { name: "فرع الهيئة بالمنطقة الغربية", total: 38, done: 29, progress: 6, delayed: 3, rate: 76, ready: "مؤكد" },
  { name: "فرع الهيئة بالمنطقة الجنوبية", total: 27, done: 16, progress: 8, delayed: 3, rate: 59, ready: "غير مكتمل" },
  { name: "فرع الهيئة بالمنطقة الوسطى الشمالية", total: 29, done: 18, progress: 8, delayed: 3, rate: 62, ready: "قيد المراجعة" },
  { name: "فرع الهيئة بالمنطقة الشمالية الغربية", total: 23, done: 14, progress: 4, delayed: 5, rate: 61, ready: "قيد المراجعة" },
];

const initialWork: WorkItem[] = [
  { id: "REQ-2026-0212", title: "إعداد خطة تحسين إجراءات التشغيل في الفرع", type: "طلب", branch: "فرع الهيئة بالمنطقة الغربية", owner: "صندوق طلبات الفرع", status: "جديد", priority: "متوسطة", due: "26 أغسطس", description: "طلب وارد من مكتب وكيل الفروع إلى فرع الهيئة بالمنطقة الغربية لإعداد خطة مختصرة تتضمن الوضع الحالي وفرص التحسين والجدول التنفيذي.", expectedResult: "خطة تحسين معتمدة تتضمن المسؤوليات والمواعيد.", category: "تحسين الإجراءات", requestScope: "مكتب وكيل الفروع", progress: 0, source: "مباشر", createdBy: "موظف مكتب وكيل الفروع", updates: [{ date: "الآن", author: "موظف مكتب وكيل الفروع", text: "تم إرسال الطلب إلى صندوق طلبات فرع الهيئة بالمنطقة الغربية.", progress: 0, visibility: "رسمي مشترك" }] },
  { id: "REQ-2026-0211", title: "تزويد فرع الهيئة بالمنطقة الغربية ببيانات تراخيص المشاريع المشتركة", type: "طلب", branch: "فرع الهيئة بالمنطقة الشرقية", originBranch: "فرع الهيئة بالمنطقة الغربية", owner: "صندوق طلبات الفرع", status: "بانتظار تحديث", priority: "عالية", due: "30 أغسطس", description: "طلب رسمي من فرع الهيئة بالمنطقة الغربية إلى فرع الهيئة بالمنطقة الشرقية للحصول على بيانات التراخيص المرتبطة بالمشاريع المشتركة.", expectedResult: "ملف موحد ببيانات التراخيص والملاحظات القائمة.", category: "طلب بيانات", requestScope: "بين الفروع", progress: 40, source: "مباشر", createdBy: "موظف الإدارة التنفيذية لفرع الهيئة بالمنطقة الغربية", updates: [{ date: "اليوم، 11:10 ص", author: "موظف الإدارة التنفيذية لفرع الهيئة بالمنطقة الشرقية", text: "تم جمع بيانات ثلاثة مشاريع وجارٍ استكمال مشروعين.", done: "جمع بيانات ثلاثة مشاريع.", ongoing: "استكمال بيانات مشروعين.", next: "مراجعة الملف وإرساله لفرع الهيئة بالمنطقة الغربية.", challenges: "انتظار إفادة إدارة المشاريع.", progress: 40, visibility: "رسمي مشترك" }, { date: "أمس، 9:00 ص", author: "موظف الإدارة التنفيذية لفرع الهيئة بالمنطقة الغربية", text: "تم إرسال الطلب إلى صندوق طلبات فرع الهيئة بالمنطقة الشرقية.", progress: 0, visibility: "رسمي مشترك" }] },
  { id: "WI-2026-0151", title: "تجهيز ملخص اجتماع فريق التشغيل", type: "طلب", branch: "فرع الهيئة بالمنطقة الغربية", owner: "نورة القحطاني", status: "قيد التنفيذ", priority: "متوسطة", due: "29 أغسطس", description: "طلب داخلي شخصي أنشأته الموظفة لتنظيم العمل وإعداد الملخص قبل الاجتماع.", progress: 45, source: "مباشر", createdBy: "نورة القحطاني", selfManaged: true, updates: [{ date: "اليوم، 10:20 ص", author: "نورة القحطاني", text: "تم جمع أبرز القرارات وبقيت مراجعة المرفقات.", progress: 45 }] },
  { id: "WI-2026-0126", title: "مراجعة قائمة إجراءات السلامة الأسبوعية", type: "طلب", branch: "فرع الهيئة بالمنطقة الغربية", owner: "نورة القحطاني", status: "مكتمل", priority: "منخفضة", due: "18 أغسطس", description: "طلب داخلي أنشأته الموظفة لنفسها وتم إنجازه وإغلاقه.", progress: 100, source: "مباشر", createdBy: "نورة القحطاني", selfManaged: true, updates: [{ date: "18 أغسطس، 1:15 م", author: "نورة القحطاني", text: "اكتملت المراجعة وتم إغلاق الطلب الداخلي.", progress: 100 }] },
  { id: "WI-2026-0148", title: "تحديث خطة معالجة تحديات خدمات الفرع", type: "طلب", branch: "فرع الهيئة بالمنطقة الغربية", owner: "نورة القحطاني", status: "قيد التنفيذ", priority: "عالية", due: "27 أغسطس", description: "تحديث خطة المعالجة وتحديد المسؤوليات والمواعيد والإجراء القادم.", progress: 55, source: "مباشر", updates: [{ date: "اليوم، 9:35 ص", author: "خالد الزهراني", text: "تم إسناد تحديث الخطة إلى نورة القحطاني والتنسيق مع فريق التشغيل.", progress: 55 }] },
  { id: "WI-2026-0147", title: "إفادة عن حالة المشاريع ذات الأولوية", type: "طلب", branch: "فرع الهيئة بالمنطقة الشرقية", owner: "إدارة المشاريع", status: "بانتظار إفادة", priority: "متوسطة", due: "28 أغسطس", description: "طلب إفادة موحدة عن حالة المشاريع والمخاطر والإجراءات التصحيحية.", progress: 35, source: "مباشر", updates: [{ date: "أمس، 2:15 م", author: "سارة العتيبي", text: "أعيد الطلب لاستكمال نسبة الإنجاز والمخاطر.", progress: 35 }] },
  { id: "WI-2026-0146", title: "زيارة مواطن – متابعة طلب رقم VR-8831", type: "زيارة", branch: "فرع الهيئة بالمنطقة الغربية", owner: "صندوق طلبات الفرع", status: "جديد", priority: "متوسطة", due: "26 أغسطس", description: "طلب زيارة وارد آليًا من منصة زيارات المواطنين ويظهر لموظف الإدارة التنفيذية للفرع قبل إسناده داخليًا.", progress: 0, source: "تكامل منصة الزيارات", citizen: { name: "محمد أحمد العسيري", id: "10******42", mobile: "05*****817", purpose: "مناقشة طلب متعلق بخدمة مياه في الفرع", requestedDate: "الأحد 30 أغسطس 2026 · 10:30 ص" }, updates: [{ date: "اليوم، 8:10 ص", author: "تكامل منصة الزيارات", text: "تم استلام طلب الزيارة في صندوق طلبات الفرع.", progress: 0 }] },
  { id: "TRS-1447-3218", title: "طلب تحديث بيانات الشكوى", type: "معاملة تراسل", branch: "فرع الهيئة بالمنطقة الوسطى الشمالية", owner: "فريق الشكاوى", status: "مكتملة من الفرع", priority: "عالية", due: "25 أغسطس", updateDue: "25 أغسطس", description: "استكمال بيانات الشكوى وإرفاق الإفادة النهائية تمهيدًا للإغلاق.", progress: 90, source: "تراسل", transactionNo: "1447/3218", transactionDate: "18 أغسطس 2026", officialTarasulStatus: "مفتوحة", attachment: "نسخة-المعاملة-3218.pdf", internalNote: "حالة المنصة للمتابعة الداخلية ولا تغيّر حالة تراسل الرسمية.", updates: [{ date: "أمس، 11:40 ص", author: "نورة القحطاني", text: "اكتملت الإفادة وأصبحت جاهزة للمراجعة.", done: "استكمال الإفادة وإرفاق المستندات.", ongoing: "المراجعة النهائية.", next: "إغلاق المعاملة في تراسل بعد الاعتماد.", challenges: "لا يوجد.", progress: 90, visibility: "رسمي مشترك" }] },
  { id: "WI-2026-0144", title: "معالجة تأخر تحديث التقرير التشغيلي", type: "مهمة", branch: "فرع الهيئة بالمنطقة الشمالية الغربية", owner: "صندوق طلبات الفرع", status: "متأخر", priority: "عاجلة", due: "23 أغسطس", description: "معالجة سبب التأخير واعتماد تحديث التقرير التشغيلي الأسبوعي.", progress: 42, source: "مباشر", updates: [{ date: "22 أغسطس، 4:20 م", author: "منفذ العمل", text: "تأخر الاستلام بسبب نقص مدخلات مشروعين.", progress: 42 }] },
  { id: "WI-2026-0143", title: "طلب تنسيق موقع خدمي في محافظة جدة", type: "طلب", branch: "فرع الهيئة بالمنطقة الغربية", owner: "صندوق طلبات الفرع", status: "جديد", priority: "متوسطة", due: "30 أغسطس", description: "طلب رسمي مقدم من أمانة محافظة جدة واختار مقدم الطلب فرع الهيئة بالمنطقة الغربية.", progress: 0, source: "بوابة الجهات الخارجية", externalEntity: "أمانة محافظة جدة", attachment: "مخطط-الموقع.pdf", updates: [{ date: "اليوم، 10:18 ص", author: "بوابة الجهات الخارجية", text: "تم توجيه الطلب آليًا إلى موظف الإدارة التنفيذية لفرع الهيئة بالمنطقة الغربية.", progress: 0 }] },
  { id: "WI-2026-0142", title: "معالجة تعثر مشروع محطة الضخ بالدمام", type: "مهمة", branch: "فرع الهيئة بالمنطقة الشرقية", owner: "ريم الدوسري", status: "متأخر", priority: "عاجلة", due: "22 أغسطس", description: "رفع خطة تصحيحية للمشروع المتعثر وتحديد الموضوعات التي تحتاج إحاطة المسؤول التنفيذي للفرع.", progress: 48, source: "مباشر", updates: [{ date: "أمس، 3:20 م", author: "ريم الدوسري", text: "تم حصر ثلاثة أسباب للتأخر وجارٍ اعتماد الإجراء التصحيحي.", progress: 48 }] },
  { id: "WI-2026-0141", title: "شكوى تكرار انقطاع الخدمة في حي الفيصلية", type: "طلب", branch: "فرع الهيئة بالمنطقة الشرقية", owner: "هناء العمري", status: "قيد التنفيذ", priority: "عالية", due: "27 أغسطس", description: "التحقق من البلاغات السابقة وإعداد إفادة موحدة بالإجراء المتخذ والموعد المتوقع للمعالجة.", progress: 65, source: "تراسل", transactionNo: "1447/3290", attachment: "شكوى-الفيصلية.pdf", updates: [{ date: "اليوم، 11:05 ص", author: "هناء العمري", text: "تم ربط الشكوى بسجل البلاغات والتنسيق مع التشغيل الميداني.", progress: 65 }] },
  { id: "TRS-1447-3304", title: "اعتماد خطة مخاطر مشاريع الربع الثالث", type: "معاملة تراسل", branch: "فرع الهيئة بالمنطقة الوسطى الشمالية", owner: "سارة القحطاني", status: "بانتظار تحديث", priority: "عالية", due: "26 أغسطس", updateDue: "26 أغسطس", description: "مراجعة مخاطر المشاريع ذات الأولوية ورفع التوصيات النهائية للاعتماد.", progress: 100, source: "تراسل", transactionNo: "1447/3304", transactionDate: "20 أغسطس 2026", officialTarasulStatus: "مفتوحة", attachment: "خطة-مخاطر-الربع-الثالث.pdf", updates: [{ date: "اليوم، 1:15 م", author: "سارة القحطاني", text: "اكتملت مراجعة المخاطر وإرفاق مصفوفة القرارات المطلوبة.", progress: 100, visibility: "رسمي مشترك" }] },
  { id: "WI-2026-0139", title: "طلب تمديد مهلة تحديث خطة الطوارئ", type: "طلب", branch: "فرع الهيئة بالمنطقة الغربية", owner: "خالد الزهراني", status: "بانتظار إفادة", priority: "متوسطة", due: "29 أغسطس", description: "طلب الفرع تمديد مهلة التسليم ثلاثة أيام بسبب انتظار مدخلات جهتين مساندتين.", progress: 30, source: "مباشر", updates: [{ date: "أمس، 12:40 م", author: "خالد الزهراني", text: "تم رفع مبررات التمديد إلى موظف مكتب وكيل الفروع.", progress: 30 }] },
  { id: "WI-2026-0138", title: "زيارة فريق أمانة جدة لمناقشة المسارات الخدمية", type: "زيارة", branch: "فرع الهيئة بالمنطقة الغربية", owner: "صندوق طلبات الفرع", status: "قيد الفرز", priority: "عاجلة", due: "26 أغسطس", description: "طلب زيارة مقدم من أمانة محافظة جدة يحتاج مراجعة الموعد وإسناده داخليًا.", progress: 0, source: "بوابة الجهات الخارجية", externalEntity: "أمانة محافظة جدة", attachment: "خطاب-طلب-الزيارة.pdf", updates: [{ date: "اليوم، 12:05 م", author: "بوابة الجهات الخارجية", text: "وصل الطلب إلى صندوق طلبات فرع الهيئة بالمنطقة الغربية فقط.", progress: 0 }] },
  { id: "WI-2026-0137", title: "تحديث أسبوعي لمشروع تحسين شبكات الضغط", type: "مهمة", branch: "فرع الهيئة بالمنطقة الغربية", owner: "عبدالله الحربي", status: "قيد التنفيذ", priority: "متوسطة", due: "الخميس", description: "تحديث نسبة الإنجاز والتحديات والخطوة القادمة وإرفاق دليل الإنجاز للأسبوع 34.", progress: 72, source: "مباشر", updates: [{ date: "اليوم، 8:55 ص", author: "عبدالله الحربي", text: "اكتمل اختبار القطاع الأول، والتحدي الحالي تأخر تصريح الحفر للقطاع الثاني.", progress: 72 }] },
  { id: "WI-2026-0136", title: "طلب بيانات مؤشرات الالتزام التشغيلي", type: "طلب", branch: "فرع الهيئة بالمنطقة الجنوبية", owner: "عبدالعزيز العسيري", status: "بانتظار إفادة", priority: "متوسطة", due: "28 أغسطس", description: "تجميع بيانات الالتزام بالمواعيد ووقت الاستجابة وإرسال الإفادة إلى المركز.", progress: 40, source: "مباشر", updates: [{ date: "أمس، 10:10 ص", author: "عبدالعزيز العسيري", text: "اكتملت بيانات ثلاثة فرق وبقيت إفادة فريق الصيانة.", progress: 40 }] },
  { id: "WI-2026-0135", title: "معالجة شكوى تأخر توصيل خدمة في أبها", type: "معاملة تراسل", branch: "فرع الهيئة بالمنطقة الجنوبية", owner: "فريق الشكاوى", status: "متأخر", priority: "عالية", due: "23 أغسطس", description: "تحديد سبب التأخر والإجراء التصحيحي وموعد الإغلاق المتوقع مع إفادة صاحب الطلب.", progress: 58, source: "تراسل", transactionNo: "1447/3266", attachment: "معاملة-شكوى-أبها.pdf", updates: [{ date: "22 أغسطس، 2:50 م", author: "فريق الشكاوى", text: "بانتظار التحقق من المقاول قبل اعتماد موعد الإنجاز.", progress: 58 }] },
  { id: "WI-2026-0134", title: "زيارة مواطن – اعتراض على إغلاق بلاغ", type: "زيارة", branch: "فرع الهيئة بالمنطقة الغربية", owner: "صندوق طلبات الفرع", status: "جديد", priority: "عالية", due: "27 أغسطس", description: "طلب زيارة جديد لا يظهر للموظفين؛ يراجعه موظف الإدارة التنفيذية للفرع ثم يسنده داخليًا.", progress: 0, source: "تكامل منصة الزيارات", citizen: { name: "سعد عبدالله المالكي", id: "10******19", mobile: "05*****422", purpose: "مراجعة إغلاق بلاغ قبل اكتمال المعالجة الميدانية", requestedDate: "الاثنين 31 أغسطس 2026 · 11:00 ص" }, updates: [{ date: "اليوم، 1:42 م", author: "تكامل منصة الزيارات", text: "تم استلام نموذج الزيارة وربطه بصندوق طلبات فرع الهيئة بالمنطقة الغربية.", progress: 0 }] },
  { id: "WI-2026-0133", title: "تنفيذ توصيات اجتماع جودة الخدمات", type: "مهمة", branch: "فرع الهيئة بالمنطقة الغربية", owner: "نورة القحطاني", status: "جديد", priority: "متوسطة", due: "2 سبتمبر", description: "تحويل توصيات الاجتماع إلى إجراءات قابلة للقياس مع مالك وموعد لكل إجراء.", progress: 0, source: "مباشر", updates: [{ date: "اليوم، 2:05 م", author: "موظف مكتب وكيل الفروع", text: "تم إنشاء الطلب وإسناده إلى نورة القحطاني.", progress: 0 }] },
  { id: "WI-2026-0132", title: "تحديث حالة مشاريع فرع الهيئة بالمنطقة الشمالية الغربية", type: "مهمة", branch: "فرع الهيئة بالمنطقة الشمالية الغربية", owner: "مها الحربي", status: "قيد التنفيذ", priority: "متوسطة", due: "28 أغسطس", description: "تحديث نسب الإنجاز والمخاطر والاحتياجات لكل مشروع قبل الإقفال الأسبوعي.", progress: 68, source: "مباشر", updates: [{ date: "اليوم، 10:45 ص", author: "مها الحربي", text: "تم تحديث أربعة مشاريع من أصل ستة.", progress: 68 }] },
  { id: "WI-2026-0131", title: "طلب تنسيق تصريح أعمال مع أمانة الرياض", type: "طلب", branch: "فرع الهيئة بالمنطقة الوسطى الشمالية", owner: "صندوق طلبات الفرع", status: "جديد", priority: "عالية", due: "30 أغسطس", description: "طلب خارجي مرتبط بتصريح أعمال ميدانية وموجه تلقائيًا إلى موظف الإدارة التنفيذية للفرع المختص.", progress: 0, source: "بوابة الجهات الخارجية", externalEntity: "أمانة منطقة الرياض", attachment: "متطلبات-التصريح.pdf", updates: [{ date: "اليوم، 9:20 ص", author: "بوابة الجهات الخارجية", text: "تم التوجيه إلى سارة القحطاني حسب الفرع المختار.", progress: 0 }] },
  { id: "WI-2026-0130", title: "إقفال أعمال الأسبوع 33 وتوثيق الإنجازات", type: "مهمة", branch: "فرع الهيئة بالمنطقة الجنوبية", owner: "عبدالعزيز العسيري", status: "مكتمل", priority: "متوسطة", due: "20 أغسطس", description: "توثيق الإنجازات والتحديات والقرارات وإقفال لقطة التقرير الأسبوعي.", progress: 100, source: "مباشر", updates: [{ date: "20 أغسطس، 1:55 م", author: "موظف الإدارة التنفيذية للفرع", text: "تم إقفال ملخص الفرع وحفظ لقطة الأسبوع 33.", progress: 100 }] },
  { id: "WI-2026-0129", title: "طلب إفادة عن جاهزية فرق الاستجابة", type: "طلب", branch: "فرع الهيئة بالمنطقة الشمالية الغربية", owner: "فريق الاستجابة", status: "مكتمل", priority: "متوسطة", due: "21 أغسطس", description: "تحديث جاهزية المناوبات والموارد وخطط التصعيد للحالات العاجلة.", progress: 100, source: "مباشر", updates: [{ date: "21 أغسطس، 11:30 ص", author: "فريق الاستجابة", text: "تم تسليم الإفادة واعتماد الجاهزية.", progress: 100 }] },
  { id: "WI-2026-0128", title: "مراجعة محضر اللجنة التنفيذية", type: "معاملة تراسل", branch: "فرع الهيئة بالمنطقة الشرقية", owner: "ريم الدوسري", status: "مكتمل", priority: "عالية", due: "19 أغسطس", description: "مراجعة توصيات اللجنة وتوثيق ما تم تحويله إلى مهام تشغيلية.", progress: 100, source: "تراسل", transactionNo: "1447/3180", attachment: "محضر-اللجنة.pdf", updates: [{ date: "19 أغسطس، 3:10 م", author: "موظف الإدارة التنفيذية للفرع", text: "تم إقفال المتابعة الداخلية وتحويل ثلاث توصيات إلى طلبات تنفيذية.", progress: 100 }] },
  { id: "WI-2026-0127", title: "تحديث بيانات المخاطر والقرارات المطلوبة", type: "مهمة", branch: "فرع الهيئة بالمنطقة الوسطى الشمالية", owner: "سارة القحطاني", status: "قيد التنفيذ", priority: "عالية", due: "27 أغسطس", description: "إعداد ملخص تنفيذي يوضح المخاطر وأثرها والقرار المطلوب والموعد الحرج.", progress: 75, source: "مباشر", updates: [{ date: "اليوم، 11:55 ص", author: "سارة القحطاني", text: "تم اعتماد وصف المخاطر وبقي تحديد مالك القرار لموضوعين.", progress: 75 }] },
];

const initialExternalRequests: ExternalRequest[] = [
  { id: "EXT-2026-0031", workId: "WI-2026-0143", title: "طلب تنسيق موقع خدمي في محافظة جدة", entity: "أمانة محافظة جدة", contact: "سلمان الحربي", due: "30 أغسطس 2026", priority: "متوسطة", status: "تحت المراجعة", service: "تنسيق", branch: "فرع الهيئة بالمنطقة الغربية", assignedCoordinator: "خالد الزهراني", requirement: "طلب تنسيق موقع خدمي مع فرع الهيئة بالمنطقة الغربية وإرفاق المخطط المعتمد." },
  { id: "EXT-2026-0029", workId: "WI-2026-0138", title: "زيارة فريق من الأمانة للفرع", entity: "أمانة محافظة جدة", contact: "سلمان الحربي", due: "26 أغسطس 2026", priority: "عاجلة", status: "يتطلب استكمال", service: "زيارة فرع", branch: "فرع الهيئة بالمنطقة الغربية", assignedCoordinator: "خالد الزهراني", proposedDate: "31 أغسطس 2026", requirement: "طلب زيارة فريق مختص من الأمانة للفرع لاستكمال التنسيق الميداني." },
  { id: "EXT-2026-0024", workId: "WI-2026-0125", title: "طلب بيانات لمشروع مشترك", entity: "أمانة محافظة جدة", contact: "سلمان الحربي", due: "20 أغسطس 2026", priority: "متوسطة", status: "مكتمل", service: "طلب بيانات", branch: "فرع الهيئة بالمنطقة الغربية", assignedCoordinator: "خالد الزهراني", assignedEmployee: "نورة القحطاني", requirement: "طلب بيانات رسمية مرتبطة بمشروع خدمي مشترك.", response: "تم استلام البيانات وإغلاق الطلب.", responseAttachment: "بيانات-المشروع.pdf" },
  { id: "EXT-2026-0021", workId: "WI-2026-0119", title: "تأكيد محضر اجتماع التنسيق", entity: "أمانة منطقة الرياض", contact: "عبدالعزيز القحطاني", due: "18 أغسطس 2026", priority: "متوسطة", status: "تحت المراجعة", service: "تنسيق", branch: "فرع الهيئة بالمنطقة الوسطى الشمالية", assignedCoordinator: "سارة القحطاني", requirement: "مراجعة المحضر وإرسال الملاحظات أو التأكيد." },
  { id: "EXT-2026-0018", workId: "WI-2026-0112", title: "متابعة متطلبات مشروع مشترك", entity: "إمارة منطقة الرياض", contact: "ممثل الجهة", due: "28 أغسطس 2026", priority: "عالية", status: "بانتظار الرد", service: "متطلبات حكومية", branch: "فرع الهيئة بالمنطقة الوسطى الشمالية", assignedCoordinator: "سارة القحطاني", requirement: "استكمال المتطلبات التنظيمية المرتبطة بالمشروع المشترك." },
];

const initialUsers: PlatformUser[] = [
  { name: "وكيل فروع الهيئة السعودية للمياه", employee: "10000", role: "وكيل فروع الهيئة السعودية للمياه", scope: "جميع الفروع", team: "القيادة التنفيذية", state: "نشط" },
  { name: "م. فهد المطيري", employee: "10001", role: "المسؤول التنفيذي للفرع", scope: "فرع الهيئة بالمنطقة الغربية", team: "قيادة الفرع", state: "نشط" },
  { name: "م. أحمد الغامدي", employee: "10002", role: "المسؤول التنفيذي للفرع", scope: "فرع الهيئة بالمنطقة الشرقية", team: "قيادة الفرع", state: "نشط" },
  { name: "م. ناصر القحطاني", employee: "10003", role: "المسؤول التنفيذي للفرع", scope: "فرع الهيئة بالمنطقة الوسطى الشمالية", team: "قيادة الفرع", state: "نشط" },
  { name: "م. علي العسيري", employee: "10004", role: "المسؤول التنفيذي للفرع", scope: "فرع الهيئة بالمنطقة الجنوبية", team: "قيادة الفرع", state: "نشط" },
  { name: "م. سامي الحربي", employee: "10005", role: "المسؤول التنفيذي للفرع", scope: "فرع الهيئة بالمنطقة الشمالية الغربية", team: "قيادة الفرع", state: "نشط" },
  { name: "تركي الغامدي", employee: "10480", role: "موظف مكتب وكيل الفروع", scope: "جميع الفروع", team: "مكتب وكيل الفروع", state: "نشط" },
  { name: "خالد الزهراني", employee: "11834", role: "موظف الإدارة التنفيذية للفرع", scope: "فرع الهيئة بالمنطقة الغربية", team: "الإدارة التنفيذية للفرع", state: "نشط" },
  { name: "ريم الدوسري", employee: "11835", role: "موظف الإدارة التنفيذية للفرع", scope: "فرع الهيئة بالمنطقة الشرقية", team: "الإدارة التنفيذية للفرع", state: "نشط" },
  { name: "سارة القحطاني", employee: "11836", role: "موظف الإدارة التنفيذية للفرع", scope: "فرع الهيئة بالمنطقة الوسطى الشمالية", team: "الإدارة التنفيذية للفرع", state: "نشط" },
  { name: "عبدالعزيز العسيري", employee: "11837", role: "موظف الإدارة التنفيذية للفرع", scope: "فرع الهيئة بالمنطقة الجنوبية", team: "الإدارة التنفيذية للفرع", state: "نشط" },
  { name: "مها الحربي", employee: "11838", role: "موظف الإدارة التنفيذية للفرع", scope: "فرع الهيئة بالمنطقة الشمالية الغربية", team: "الإدارة التنفيذية للفرع", state: "نشط" },
  { name: "نورة القحطاني", employee: "12305", role: "منفذ العمل", scope: "فرع الهيئة بالمنطقة الغربية", team: "فريق التنفيذ", state: "نشط" },
  { name: "عبدالله الحربي", employee: "12306", role: "منفذ العمل", scope: "فرع الهيئة بالمنطقة الغربية", team: "فريق التنفيذ", state: "نشط" },
  { name: "سلمان الزهراني", employee: "12307", role: "منفذ العمل", scope: "فرع الهيئة بالمنطقة الغربية", team: "فريق التنفيذ", state: "نشط" },
  { name: "هناء العمري", employee: "12411", role: "منفذ العمل", scope: "فرع الهيئة بالمنطقة الشرقية", team: "فريق التنفيذ", state: "غير نشط" },
  { name: "عبدالله الشهري", employee: "10977", role: "مسؤول إدارة المنصة", scope: "إدارة المستخدمين والصلاحيات فقط", team: "إدارة المنصة", state: "نشط" },
];

const viewTitles: Record<ViewKey, { title: string; subtitle: string }> = {
  home: { title: "لوحة المتابعة التنفيذية", subtitle: "ملخص أعمال الفروع للأسبوع 34 · 23–27 أغسطس 2026" },
  workspace: { title: "مساحة عملي", subtitle: "الأعمال التي تحتاج تدخلك أو تحديثك اليوم" }, team: { title: "صندوق الفريق", subtitle: "توزيع العمل ومتابعة جاهزية فرق الإسناد" },
  intake: { title: "الاستقبال والفرز", subtitle: "الطلبات الواردة إلى صندوق الفرع بانتظار المراجعة والإسناد" }, work: { title: "الطلبات", subtitle: "الطلبات الداخلية والواردة والصادرة والمتبادلة بين الفروع" },
  transactions: { title: "معاملات تراسل", subtitle: "متابعة معاملات تراسل وحالاتها وتحديثاتها ضمن سجل موحد" },
  services: { title: "طلب جديد", subtitle: "نموذج موحد يتغير حسب نطاق الطلب والجهة المستلمة" }, oversight: { title: "المتابعة التنفيذية", subtitle: "مقارنة الفروع والاستثناءات والقرارات المطلوبة" },
  external: { title: "بوابة الجهات الخارجية", subtitle: "تبادل الإفادات والمرفقات مع الشركاء ضمن طلبات محددة وآمنة" },
  sla: { title: "الأداء ومستويات الخدمة", subtitle: "الالتزام بالمواعيد ومؤشرات الاستجابة والإنجاز" }, analytics: { title: "التقارير والتحليلات", subtitle: "التقارير الأسبوعية والشهرية والنسخ المعتمدة" },
  access: { title: "إدارة المستخدمين والوصول", subtitle: "تعيين الأدوار الجاهزة والنطاقات وفرق العمل" },
};

function StatusBadge({ status }: { status: string }) {
  const type = status.includes("مؤكد") || status.includes("مكتمل") || status.includes("جاهز") || status === "نشط" ? "success" : status.includes("متأخر") || status.includes("غير مكتمل") || status === "غير نشط" ? "danger" : status.includes("انتظار") || status.includes("مراجعة") || status.includes("الفرز") || status.includes("محالة") ? "warning" : "info";
  return <span className={`badge badge-${type}`}><span className="badge-dot" />{status}</span>;
}

const roleGuidance: Record<RoleKey, { purpose: string; sees: string; action: string; level: "أساسي" | "مساند" }> = {
  center: { purpose: "يوجّه طلبات مكتب وكيل الفروع ويتابع التنفيذ المؤسسي.", sees: "طلبات الفروع المشتركة ومعاملات تراسل والتقارير ضمن جميع الفروع.", action: "ينشئ الطلبات ويسجل معاملات تراسل ويطلب التحديث ويتابع الإغلاق.", level: "أساسي" },
  owner: { purpose: "متابعة شاملة لأداء الفرع ونتائجه وتحديثاته.", sees: "لوحة الفرع وجميع طلباته وتحديثاته وتقاريره ضمن نطاقه فقط.", action: "اطلاع ومتابعة فقط؛ دون إنشاء أو إسناد أو تحديث أو اعتماد أو إغلاق.", level: "أساسي" },
  branch: { purpose: "التشغيل اليومي لطلبات الفرع ومتابعة تنفيذها.", sees: "طلبات الفرع الداخلية والواردة والصادرة، والطلب المشترك فقط عند التعامل مع فرع آخر.", action: "ينشئ الطلبات، يرسل للفروع، يستقبل ويسند ويتابع ويطلب التحديث ويراجع النتائج.", level: "أساسي" },
  employee: { purpose: "ينفذ ما أُسند إليه ويضيف النتائج الموثقة.", sees: "الطلبات المسندة إليه وسجلاته السابقة المغلقة فقط.", action: "يبدأ التنفيذ ويضيف التحديثات والنتيجة ويرسلها للمراجعة.", level: "أساسي" },
  executive: { purpose: "المتابعة التنفيذية الشاملة لجميع فروع الهيئة.", sees: "المؤشرات والأعمال الداخلية لجميع الفروع، دون بيانات المواطنين.", action: "يتابع أداء الفروع والاستثناءات والقرارات ويستعرض التقارير.", level: "مساند" },
  access: { purpose: "يدير مستخدمي المنصة وصلاحياتهم فقط.", sees: "المستخدمين والأدوار والنطاقات، ولا يرى محتوى الطلبات أو التقارير التشغيلية.", action: "يضيف المستخدم ويحدد الدور والنطاق ويفعّل أو يوقف الصلاحية.", level: "مساند" },
  external: { purpose: "يمثل الجهة المفوّضة في تقديم الطلبات الرسمية.", sees: "طلبات جهته ورسائلها ومرفقاتها فقط.", action: "يقدم الطلب ويتابع حالته من صفحة طلباتي ويستكمل المطلوب.", level: "مساند" },
};

function RoleSummary({ role }: { role: RoleKey }) {
  const item = roleGuidance[role];
  return <section className="role-summary" aria-label="ملخص صلاحية المستخدم الحالي"><div className="role-summary-title"><span><Icon name="shield" size={19}/></span><div><small>تجربة الرول الحالي · {item.level}</small><strong>{roleProfiles[role].role}</strong></div></div><div><small>هدف الرول</small><p>{item.purpose}</p></div><div><small>ماذا يشاهد؟</small><p>{item.sees}</p></div><div><small>ماذا يفعل؟</small><p>{item.action}</p></div></section>;
}

function HomeDashboard({ role, onNavigate, onOpenWork }: { role: RoleKey; onNavigate: (view: ViewKey) => void; onOpenWork: (item: WorkItem) => void }) {
  const ownerMode = role === "owner";
  const visibleBranches = ownerMode ? branchRows.filter((branch) => branch.name === "فرع الهيئة بالمنطقة الغربية") : branchRows;
  const decisionWorks = initialWork.filter((w) => (!ownerMode || w.branch === "فرع الهيئة بالمنطقة الغربية") && w.source !== "تكامل منصة الزيارات" && w.source !== "بوابة الجهات الخارجية" && (w.priority === "عاجلة" || w.status === "جاهز للتحقق"));
  return <>
    <section className="kpi-grid" aria-label="مؤشرات الأسبوع">
      <button className="kpi-card primary" onClick={() => onNavigate("work")}><div className="kpi-icon"><Icon name="briefcase" /></div><div><span>{ownerMode ? "أعمال فرعي" : "إجمالي الأعمال"}</span><strong>{ownerMode ? 38 : 178}</strong><small>{ownerMode ? "فرع الهيئة بالمنطقة الغربية" : "+12 عن الأسبوع السابق"}</small></div></button>
      <button className="kpi-card" onClick={() => onNavigate("analytics")}><div className="kpi-icon green"><Icon name="check" /></div><div><span>مكتملة هذا الأسبوع</span><strong>{ownerMode ? 29 : 114}</strong><small className="positive">{ownerMode ? "76% من أعمال الفرع" : "64% من إجمالي الأعمال"}</small></div></button>
      <button className="kpi-card" onClick={() => onNavigate("work")}><div className="kpi-icon blue"><Icon name="clock" /></div><div><span>قيد التنفيذ</span><strong>{ownerMode ? 6 : 37}</strong><small>{ownerMode ? "أعمال تحتاج متابعة الفرع" : "21% من إجمالي الأعمال"}</small></div></button>
      <button className="kpi-card" onClick={() => onNavigate("oversight")}><div className="kpi-icon amber"><Icon name="alert" /></div><div><span>متأخرة</span><strong>{ownerMode ? 3 : 11}</strong><small className="negative">تحتاج متابعة فورية</small></div></button>
    </section>
    <section className="dashboard-grid">
      <article className="panel branch-panel"><div className="panel-header"><div><h2>{ownerMode ? "أداء الفرع" : "أداء الفروع"}</h2><p>{ownerMode ? "ملخص الإنجاز الأسبوعي لنطاقك" : "نسبة الإنجاز الأسبوعية لكل نطاق تشغيلي"}</p></div><button className="text-button" onClick={() => onNavigate("oversight")}>عرض التفاصيل <Icon name="arrow" size={16} /></button></div><div className="branch-list">{visibleBranches.map((branch) => <button className="branch-row" key={branch.name} onClick={() => onNavigate("oversight")}><div className="branch-title"><strong>{branch.name}</strong><span>{branch.done} من {branch.total} مكتملة</span></div><div className="progress-track"><span style={{ width: `${branch.rate}%` }} /></div><b>{branch.rate}%</b></button>)}</div></article>
      <article className="panel status-panel"><div className="panel-header"><div><h2>حالة الأعمال</h2><p>التوزيع الحالي لجميع الفروع</p></div></div><div className="donut-wrap"><button className="donut" onClick={() => onNavigate("work")}><span><strong>178</strong><small>سجل عمل</small></span></button><ul className="legend"><li><i className="green-dot"/><span>مكتملة</span><b>114</b></li><li><i className="blue-dot"/><span>قيد التنفيذ</span><b>37</b></li><li><i className="amber-dot"/><span>بانتظار</span><b>16</b></li><li><i className="red-dot"/><span>متأخرة</span><b>11</b></li></ul></div></article>
    </section>
    <section className="dashboard-grid lower-grid">
      <article className="panel updates-panel"><div className="panel-header"><div><h2>جاهزية التحديث الأسبوعي</h2><p>{ownerMode ? "حالة اكتمال بيانات فرعك قبل الإقفال" : "حالة تأكيد بيانات الفروع قبل إصدار لوحة الأسبوع"}</p></div><span className="week-pill"><Icon name="calendar" size={15}/> الإقفال: الخميس 2:00 م</span></div><div className="compact-table">{visibleBranches.map((branch) => <button className="compact-row" key={branch.name} onClick={() => onNavigate("analytics")}><span>{branch.name}</span><StatusBadge status={branch.ready}/></button>)}</div></article>
      <article className="panel decision-panel"><div className="panel-header"><div><h2>قرارات مطلوبة</h2><p>أعمال تحتاج تدخلًا تنفيذيًا</p></div><span className="count-pill">{decisionWorks.length}</span></div>{decisionWorks.slice(0, 4).map((w, i) => <button className="decision-item" key={w.id} onClick={() => onOpenWork(w)}><span className={`decision-icon ${i === 1 ? "blue" : ""}`}><Icon name={w.source === "تراسل" ? "file" : "alert"} size={18}/></span><div><strong>{w.title}</strong><p>{w.branch} · {w.priority}</p></div><Icon name="chevron" size={17}/></button>)}</article>
    </section>
  </>;
}

function WorkTable({ items, mode = "all", role, onOpen, externalQuery = "" }: { items: WorkItem[]; mode?: "all" | "workspace" | "intake"; role: RoleKey; onOpen: (item: WorkItem) => void; externalQuery?: string }) {
  const [filter, setFilter] = useState<"الكل" | WorkType>("الكل");
  const [query, setQuery] = useState(externalQuery);
  const base = mode === "intake" ? items.filter((r) => r.status === "جديد" || r.status === "قيد الفرز" || r.status === "بانتظار إفادة") : mode === "workspace" ? items.filter((r) => role !== "branch" || r.branch === "فرع الهيئة بالمنطقة الغربية") : items;
  const rows = base.filter((r) => (filter === "الكل" || r.type === filter) && `${r.id} ${r.title} ${r.branch}`.includes(query.trim()));
  const filterOptions: ("الكل" | WorkType)[] = role === "branch" ? ["الكل", "طلب", "معاملة تراسل", "زيارة"] : ["الكل", "طلب", "معاملة تراسل"];
  return <section className="panel table-panel"><div className="toolbar"><div className="segmented">{filterOptions.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div><div className="table-search"><Icon name="search" size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="البحث في الأعمال" placeholder="بحث برقم السجل أو العنوان"/></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>رقم السجل</th><th>العمل</th><th>النوع</th><th>النطاق</th><th>الحالة</th><th>الأولوية</th><th>الاستحقاق</th><th></th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} onClick={() => onOpen(row)} className="clickable-row"><td><button className="table-link">{row.id}</button></td><td><strong>{row.title}</strong><small className="row-meta">{row.selfManaged ? "طلب داخلي أنشأته" : row.owner}</small></td><td><span className="type-chip">{row.type === "مهمة" ? "طلب" : row.type}</span></td><td>{row.branch}</td><td><StatusBadge status={row.status}/></td><td><span className={`priority priority-${row.priority}`}>{row.priority}</span></td><td>{row.due}</td><td><button className="row-action" aria-label={`فتح ${row.id}`}><Icon name="eye" size={17}/></button></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty-state"><Icon name="search" size={30}/><strong>لا توجد نتائج مطابقة</strong><span>جرّب تغيير نوع العمل أو عبارة البحث.</span></div>}</div></section>;
}

function RequestsView({ items, role, onOpen }: { items: WorkItem[]; role: RoleKey; onOpen: (item: WorkItem) => void }) {
  const [layout, setLayout] = useState<"list" | "flow" | "calendar">("list");
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("الكل");
  const [status, setStatus] = useState("الكل");
  const [priority, setPriority] = useState("الكل");
  const requests = items.filter((item) => item.type !== "معاملة تراسل" && item.type !== "زيارة");
  const rows = requests.filter((item) => {
    const haystack = `${item.id} ${item.title} ${item.owner} ${item.branch} ${item.originBranch || ""}`;
    return haystack.includes(query.trim()) && (branch === "الكل" || item.branch === branch || item.originBranch === branch) && (status === "الكل" || item.status === status) && (priority === "الكل" || item.priority === priority);
  });
  const flowColumns = [
    { title: "جديد", statuses: ["جديد", "مسودة", "قيد الفرز"] },
    { title: "قيد التنفيذ", statuses: ["مسندة", "محالة إلى الإدارة", "قيد التنفيذ"] },
    { title: "بانتظار إجراء", statuses: ["بانتظار تحديث", "بانتظار إفادة", "بانتظار الاعتماد", "معلقة", "جاهز للتحقق"] },
    { title: "مغلق", statuses: ["مكتمل", "مغلق", "ملغى"] },
  ];
  const scopeLabel = (item: WorkItem) => item.requestScope === "بين الفروع" ? `${item.originBranch} ← ${item.branch}` : item.requestScope === "داخل الفرع" ? `داخلي · ${item.branch}` : `مكتب وكيل الفروع ← ${item.branch}`;
  return <>
    <section className="request-summary-grid">
      <article><span><Icon name="inbox"/></span><div><strong>{requests.filter((item) => item.status === "جديد").length}</strong><small>بانتظار الإسناد</small></div></article>
      <article><span><Icon name="clock"/></span><div><strong>{requests.filter((item) => ["قيد التنفيذ", "مسندة", "محالة إلى الإدارة"].includes(item.status)).length}</strong><small>قيد التنفيذ</small></div></article>
      <article><span><Icon name="send"/></span><div><strong>{requests.filter((item) => item.requestScope === "بين الفروع" && item.originBranch === "فرع الهيئة بالمنطقة الغربية").length}</strong><small>صادرة لفروع أخرى</small></div></article>
      <article><span><Icon name="alert"/></span><div><strong>{requests.filter((item) => item.status === "متأخر" || item.status === "معلقة").length}</strong><small>تحتاج متابعة</small></div></article>
    </section>
    {role === "branch" && <section className="privacy-banner"><Icon name="shield"/><div><strong>عزل كامل بين الفروع</strong><p>يرى الفرع الطلب المشترك الذي أرسله أو استلمه فقط، ولا تظهر له أعمال الفرع الآخر أو إسناداته وملاحظاته الداخلية.</p></div></section>}
    <section className="panel requests-panel">
      <div className="request-toolbar"><div className="view-switcher"><button className={layout === "list" ? "active" : ""} onClick={() => setLayout("list")}><Icon name="list" size={16}/> قائمة الطلبات</button><button className={layout === "flow" ? "active" : ""} onClick={() => setLayout("flow")}><Icon name="grid" size={16}/> لوحة تدفق الطلبات</button><button className={layout === "calendar" ? "active" : ""} onClick={() => setLayout("calendar")}><Icon name="calendar" size={16}/> تقويم الطلبات</button></div><div className="table-search"><Icon name="search" size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="بحث برقم الطلب أو العنوان"/></div></div>
      <div className="filters-row"><label>الفترة الزمنية<select><option>هذا الشهر</option><option>هذا الأسبوع</option><option>آخر 30 يومًا</option></select></label><label>الفرع<select value={branch} onChange={(event) => setBranch(event.target.value)}><option>الكل</option>{branchRows.map((item) => <option key={item.name}>{item.name}</option>)}</select></label><label>الحالة<select value={status} onChange={(event) => setStatus(event.target.value)}><option>الكل</option><option>جديد</option><option>قيد التنفيذ</option><option>بانتظار تحديث</option><option>بانتظار الاعتماد</option><option>معلقة</option><option>مغلق</option></select></label><label>الأولوية<select value={priority} onChange={(event) => setPriority(event.target.value)}><option>الكل</option><option>عاجلة</option><option>عالية</option><option>متوسطة</option><option>منخفضة</option></select></label></div>
      {layout === "list" && <div className="data-table-wrap"><table className="data-table"><thead><tr><th>رقم الطلب</th><th>العنوان</th><th>مسار الطلب</th><th>المسؤول</th><th>الحالة</th><th>الأولوية</th><th>الاستحقاق</th><th></th></tr></thead><tbody>{rows.map((item) => <tr key={item.id} className="clickable-row" onClick={() => onOpen(item)}><td><button className="table-link">{item.id}</button></td><td><strong>{item.title}</strong><small className="row-meta">{item.category || "طلب تشغيلي"}</small></td><td>{scopeLabel(item)}</td><td>{item.owner}</td><td><StatusBadge status={item.status}/></td><td><span className={`priority priority-${item.priority}`}>{item.priority}</span></td><td>{item.due}</td><td><button className="row-action"><Icon name="eye" size={17}/></button></td></tr>)}</tbody></table></div>}
      {layout === "flow" && <div className="flow-board">{flowColumns.map((column) => { const columnRows = rows.filter((item) => column.statuses.includes(item.status)); return <section key={column.title}><header><strong>{column.title}</strong><span>{columnRows.length}</span></header><div>{columnRows.map((item) => <button key={item.id} onClick={() => onOpen(item)}><small>{item.id} · {scopeLabel(item)}</small><strong>{item.title}</strong><footer><StatusBadge status={item.status}/><span>{item.due}</span></footer></button>)}</div></section>; })}</div>}
      {layout === "calendar" && <div className="request-calendar"><header>{["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"].map((day) => <strong key={day}>{day}</strong>)}</header><div>{rows.slice(0,10).map((item, index) => <button key={item.id} style={{gridColumn: String((index % 5) + 1)}} onClick={() => onOpen(item)}><small>{item.due}</small><strong>{item.title}</strong><StatusBadge status={item.status}/></button>)}</div></div>}
      {rows.length === 0 && <div className="empty-state"><Icon name="search" size={30}/><strong>لا توجد طلبات مطابقة</strong><span>غيّر الفلاتر أو عبارة البحث.</span></div>}
    </section>
  </>;
}

function TransactionsView({ items, role: _role, onOpen }: { items: WorkItem[]; role: RoleKey; onOpen: (item: WorkItem) => void }) {
  const [filter, setFilter] = useState("الكل");
  const transactions = items.filter((item) => item.type === "معاملة تراسل").filter((item) => filter === "الكل" || (filter === "مفتوحة" ? item.officialTarasulStatus !== "مغلقة" : filter === "مغلق" ? item.officialTarasulStatus === "مغلقة" || item.status === "مغلق" : item.status === filter));
  return <>
    <section className="transaction-kpis"><article><small>معاملات مفتوحة</small><strong>{items.filter((item) => item.type === "معاملة تراسل" && item.officialTarasulStatus !== "مغلقة").length}</strong></article><article><small>بانتظار تحديث</small><strong>{items.filter((item) => item.type === "معاملة تراسل" && item.status === "بانتظار تحديث").length}</strong></article><article><small>معلقة</small><strong>{items.filter((item) => item.type === "معاملة تراسل" && item.status === "معلقة").length}</strong></article><article><small>مكتملة من الفرع</small><strong>{items.filter((item) => item.type === "معاملة تراسل" && item.status === "مكتملة من الفرع").length}</strong></article></section>
    <section className="panel table-panel"><div className="toolbar"><div><h2>سجل معاملات تراسل</h2><p>سجل واحد لكل رقم معاملة مع حفظ جميع التحديثات زمنيًا.</p></div><div className="segmented">{["الكل", "مفتوحة", "بانتظار تحديث", "معلقة", "مكتملة من الفرع", "مغلق"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>رقم معاملة تراسل</th><th>الموضوع</th><th>الفرع</th><th>حالة المتابعة</th><th>حالة تراسل الرسمية</th><th>التحديث المطلوب</th><th>آخر تحديث</th><th></th></tr></thead><tbody>{transactions.map((item) => <tr key={item.id} className="clickable-row" onClick={() => onOpen(item)}><td><button className="table-link">{item.transactionNo}</button></td><td><strong>{item.title}</strong><small className="row-meta">{item.owner}</small></td><td>{item.branch}</td><td><StatusBadge status={item.status}/></td><td><StatusBadge status={item.officialTarasulStatus || "مفتوحة"}/></td><td>{item.updateDue || item.due}</td><td>{item.updates[0]?.date || "لا يوجد"}</td><td><button className="row-action"><Icon name="eye" size={17}/></button></td></tr>)}</tbody></table></div><div className="permission-note"><Icon name="shield" size={18}/><div><strong>منع التكرار</strong><p>رقم معاملة تراسل فريد؛ لا تنشأ معاملة جديدة عند كل تحديث، بل يضاف التحديث إلى السجل نفسه باسم صاحبه وتاريخه ووقته.</p></div></div></section>
  </>;
}

function EmployeeWorkspace({ items, onOpen }: { items: WorkItem[]; onOpen: (item: WorkItem) => void }) {
  const [section, setSection] = useState<"current" | "today" | "upcoming" | "updates" | "approval" | "late" | "closed">("current");
  const groups = {
    current: items.filter((item) => !["مكتمل", "مغلق", "ملغى"].includes(item.status)),
    today: items.filter((item) => item.due.includes("اليوم") || item.due.includes("26 أغسطس")),
    upcoming: items.filter((item) => !["مكتمل", "مغلق", "ملغى"].includes(item.status)).slice(0, 5),
    updates: items.filter((item) => item.status === "بانتظار تحديث" || item.status === "بانتظار إفادة"),
    approval: items.filter((item) => item.status === "بانتظار الاعتماد" || item.status === "جاهز للتحقق"),
    late: items.filter((item) => item.status === "متأخر"),
    closed: items.filter((item) => item.status === "مكتمل" || item.status === "مغلق"),
  };
  const rows = groups[section];
  const labels = { current: "طلباتي الحالية", today: "طلبات اليوم", upcoming: "الطلبات القادمة", updates: "بانتظار تحديث", approval: "بانتظار الاعتماد", late: "الطلبات المتأخرة", closed: "الطلبات المغلقة" };
  return <>
    <section className="employee-work-summary employee-work-summary-wide">
      {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => <button key={key} className={section === key ? "active" : ""} onClick={() => setSection(key)}><span><Icon name={key === "closed" ? "check" : key === "late" ? "alert" : key === "approval" ? "shield" : key === "today" || key === "upcoming" ? "calendar" : "inbox"}/></span><div><strong>{groups[key].length}</strong><small>{labels[key]}</small></div></button>)}
    </section>
    <div className="employee-section-heading"><div><h2>{labels[section]}</h2><p>تظهر لك الطلبات المسندة إليك فقط، ويمكنك فتح الطلب لإضافة تحديث موثق وإرساله للمراجعة.</p></div><span>{rows.length} سجل</span></div>
    <WorkTable key={section} items={rows} mode="workspace" role="employee" onOpen={onOpen}/>
  </>;
}

function CoordinatorInbox({ items, onOpen, onAssign }: { items: WorkItem[]; onOpen: (item: WorkItem) => void; onAssign: (item: WorkItem) => void }) {
  const pending = items.filter((item) => item.branch === "فرع الهيئة بالمنطقة الغربية" && item.owner === "صندوق طلبات الفرع" && (item.status === "جديد" || item.status === "قيد الفرز"));
  const external = pending.filter((item) => item.source === "بوابة الجهات الخارجية");
  const citizenVisits = pending.filter((item) => item.source === "تكامل منصة الزيارات");
  const assigned = items.filter((item) => item.owner !== "صندوق طلبات الفرع" && item.status !== "مكتمل").length;

  const queue = (title: string, description: string, rows: WorkItem[], icon: IconName) => <section className="panel coordinator-queue">
    <div className="panel-header"><div><h2>{title}</h2><p>{description}</p></div><span className="queue-count">{rows.length}</span></div>
    <div className="coordinator-list">{rows.map((item) => <article key={item.id} className="coordinator-row">
      <button className="queue-main" onClick={() => onOpen(item)}>
        <span className="queue-icon"><Icon name={icon} size={19}/></span>
        <div><small>{item.externalEntity || (item.citizen ? "طلب مواطن عبر منصة الزيارات" : item.source)}</small><strong>{item.title}</strong><span>{item.id} · {item.branch} · الاستحقاق {item.due}</span></div>
      </button>
      <StatusBadge status={item.status}/>
      <span className={`priority priority-${item.priority}`}>{item.priority}</span>
      <div className="queue-actions"><button className="secondary-button" onClick={() => onOpen(item)}><Icon name="eye" size={15}/> عرض</button><button className="primary-button" onClick={() => onAssign(item)}><Icon name="user" size={15}/> إسناد داخلي</button></div>
    </article>)}</div>
    {rows.length === 0 && <div className="queue-empty"><Icon name="check" size={24}/><div><strong>لا توجد طلبات بانتظار التعيين</strong><span>ستظهر الطلبات الجديدة هنا تلقائيًا عند وصولها إلى نطاقك.</span></div></div>}
  </section>;

  return <>
    <section className="coordinator-summary">
      <article><span className="summary-icon external"><Icon name="users"/></span><div><strong>{external.length}</strong><small>طلبات جهات خارجية جديدة</small></div></article>
      <article><span className="summary-icon visits"><Icon name="calendar"/></span><div><strong>{citizenVisits.length}</strong><small>زيارات مواطنين جديدة</small></div></article>
      <article><span className="summary-icon assigned"><Icon name="check"/></span><div><strong>{assigned}</strong><small>أعمال جرى إسنادها ومتابعتها</small></div></article>
    </section>
    <section className="coordinator-route-note"><Icon name="shield" size={20}/><div><strong>صندوق موظف الإدارة التنفيذية للفرع</strong><p>تصل طلبات مكتب وكيل الفروع والفروع الأخرى إلى صندوق الفرع أولًا، ثم يراجعها الموظف ويسندها إلى إدارة أو موظف داخل الفرع دون كشف بقية أعمال الفرع للجهة المرسلة.</p></div></section>
    {queue("طلبات مكتب وكيل الفروع والفروع الأخرى", "طلبات رسمية واردة إلى صندوق الفرع بانتظار الإسناد الداخلي", pending.filter((item) => item.source === "مباشر"), "inbox")}
    {queue("طلبات الجهات الخارجية", "طلبات رسمية موجهة إلى فرع الهيئة بالمنطقة الغربية من بوابة الجهات الخارجية", external, "users")}
    {queue("زيارات المواطنين", "طلبات واردة آليًا من منصة الزيارات وتحتاج تكليف جهة تنفيذ داخل الفرع", citizenVisits, "calendar")}
  </>;
}

function AccessView({ users, onAdd, onToggle }: { users: PlatformUser[]; onAdd: () => void; onToggle: (employee: string) => void }) {
  const [query, setQuery] = useState("");
  const filtered = users.filter((u) => `${u.name} ${u.employee} ${u.role} ${u.scope}`.includes(query.trim()));
  return <><div className="subnav-cards"><article><Icon name="users"/><div><strong>{users.filter((u) => u.state === "نشط").length}</strong><span>مستخدمون في النموذج</span></div></article><article><Icon name="shield"/><div><strong>6</strong><span>أدوار جاهزة</span></div></article><article><Icon name="grid"/><div><strong>17</strong><span>فريق إسناد</span></div></article><article><Icon name="clock"/><div><strong>4</strong><span>تفويضات مؤقتة</span></div></article></div><section className="panel table-panel"><div className="toolbar"><div><h2>المستخدمون</h2><p>إدارة مبسطة للأدوار الجاهزة والنطاقات فقط</p></div><div className="toolbar-actions"><div className="table-search"><Icon name="search" size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="اسم أو رقم وظيفي"/></div><button className="secondary-button" onClick={onAdd}><Icon name="plus" size={17}/> إضافة مستخدم</button></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>المستخدم</th><th>الرقم الوظيفي</th><th>الدور</th><th>النطاق</th><th>الفريق</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.employee}><td><div className="user-cell"><span>{user.name.split(" ").map((n) => n[0]).join("")}</span><strong>{user.name}</strong></div></td><td>{user.employee}</td><td>{user.role}</td><td>{user.scope}</td><td>{user.team}</td><td><StatusBadge status={user.state}/></td><td><button className="inline-action" onClick={() => onToggle(user.employee)}>{user.state === "نشط" ? "إيقاف" : "تفعيل"}</button></td></tr>)}</tbody></table></div><div className="permission-note"><Icon name="shield" size={18}/><div><strong>صلاحية إدارة الوصول لا تمنح مشاهدة الأعمال</strong><p>يمكن لمسؤول الوصول إضافة المستخدم، تفعيله أو إيقافه، وتعيين دور جاهز ونطاق وفريق. أما إعداد النظام والتكاملات فمن مسؤولية تقنية المعلومات.</p></div></div></section></>;
}

function AccessMatrixView({ users, onAdd, onToggle }: { users: PlatformUser[]; onAdd: () => void; onToggle: (employee: string) => void }) {
  const [query, setQuery] = useState("");
  const filtered = users.filter((u) => `${u.name} ${u.employee} ${u.role} ${u.scope}`.includes(query.trim()));
  const templates = [
    { title: "وكيل فروع الهيئة السعودية للمياه", count: "1", scope: "جميع الفروع", sees: "المؤشرات والأعمال التنفيذية لجميع الفروع", action: "المتابعة التنفيذية والقرارات والتصعيد" },
    { title: "المسؤول التنفيذي للفرع", count: "6", scope: "فرع واحد", sees: "لوحة الفرع وأعماله وتحديثاته وتقاريره", action: "اطلاع ومتابعة فقط دون إجراءات تشغيلية" },
    { title: "موظف مكتب وكيل الفروع", count: "6", scope: "جميع الفروع", sees: "الطلبات الموجهة للفروع ومعاملات تراسل وحالة التنفيذ", action: "إنشاء الطلب وتوجيهه وتسجيل تراسل وطلب التحديث" },
    { title: "موظف الإدارة التنفيذية للفرع", count: "30", scope: "فرع واحد", sees: "صندوق الفرع والطلبات الداخلية والواردة والصادرة", action: "إنشاء الطلب والإسناد والمتابعة ومراجعة النتيجة" },
    { title: "منفذ العمل", count: "459", scope: "أعماله فقط", sees: "المسند إليه وطلباته الداخلية والمغلقة", action: "التنفيذ والتحديث والإغلاق حسب نوع السجل" },
  ];
  return <>
    <section className="access-kpis"><article><span><Icon name="users"/></span><div><small>إجمالي الموظفين</small><strong>500</strong></div></article><article><span><Icon name="shield"/></span><div><small>المسؤولون التنفيذيون للفروع</small><strong>6</strong></div></article><article><span><Icon name="briefcase"/></span><div><small>موظفو المكاتب التنفيذية</small><strong>36</strong></div></article><article><span><Icon name="user"/></span><div><small>منفذو العمل</small><strong>459</strong></div></article></section>
    <section className="panel role-template-panel"><div className="panel-header"><div><h2>الأدوار الأساسية المعتمدة</h2><p>أدوار ثابتة؛ الاختلاف بين المستخدمين يكون بالنطاق وعلاقة المستخدم بسجل العمل.</p></div><span className="count-pill">5 أدوار</span></div><div className="role-template-grid">{templates.map((template) => <article key={template.title}><header><div><strong>{template.title}</strong><span>{template.count} مستخدمًا</span></div><b>{template.scope}</b></header><div><small>المشاهدة</small><p>{template.sees}</p></div><div><small>الإجراء</small><p>{template.action}</p></div></article>)}</div><div className="permission-note"><Icon name="shield" size={18}/><div><strong>معادلة الصلاحية: الدور + النطاق + علاقة المستخدم بالسجل</strong><p>مسؤول إدارة الوصول يختار دورًا جاهزًا، ثم فرعًا أو نطاقًا، والنظام يطبق حدود المشاهدة تلقائيًا.</p></div></div></section>
    <section className="panel table-panel"><div className="toolbar"><div><h2>عينة دليل المستخدمين</h2><p>بيانات تمثيلية للهيكل المستهدف؛ إجمالي القوة 500 موظف.</p></div><div className="toolbar-actions"><div className="table-search"><Icon name="search" size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="اسم أو رقم وظيفي"/></div><button className="secondary-button" onClick={onAdd}><Icon name="plus" size={17}/> إضافة مستخدم</button></div></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>المستخدم</th><th>الرقم الوظيفي</th><th>الدور</th><th>النطاق</th><th>الفريق</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>{filtered.map((user) => <tr key={user.employee}><td><div className="user-cell"><span>{user.name.split(" ").filter((n) => !n.includes(".")).map((n) => n[0]).join("").slice(0,2)}</span><strong>{user.name}</strong></div></td><td>{user.employee}</td><td>{user.role}</td><td>{user.scope}</td><td>{user.team}</td><td><StatusBadge status={user.state}/></td><td><button className="inline-action" onClick={() => onToggle(user.employee)}>{user.state === "نشط" ? "إيقاف" : "تفعيل"}</button></td></tr>)}</tbody></table></div></section>
    <section className="panel audit-preview"><div className="panel-header"><div><h2>سجل الصلاحيات والتدقيق</h2><p>يحفظ النظام منفذ الإجراء والتاريخ والوقت والقيمة السابقة والجديدة.</p></div><span className="count-pill">غير قابل للحذف</span></div><div><article><Icon name="user" size={17}/><div><strong>تعديل نطاق مستخدم</strong><small>عبدالله الشهري · اليوم 11:42 ص · من فرع الهيئة بالمنطقة الغربية إلى جميع الفروع</small></div></article><article><Icon name="shield" size={17}/><div><strong>إيقاف صلاحية مؤقتة</strong><small>عبدالله الشهري · أمس 2:10 م · انتهى التكليف</small></div></article></div></section>
  </>;
}

const services = [
  { title: "تكليف تنفيذي", desc: "طلب من مكتب وكيل الفروع إلى فرع أو أكثر", icon: "briefcase" as IconName, kind: "task" as const },
  { title: "طلب دعم أو إفادة", desc: "طلب يرفعه موظف الإدارة التنفيذية باسم الفرع", icon: "inbox" as IconName, kind: "request" as const },
  { title: "معاملة تراسل", desc: "تسجيل العمل ببيانات المعاملة ومرفق إلزامي", icon: "file" as IconName, kind: "task" as const },
  { title: "طلب زيارة", desc: "يصل إلى صندوق طلبات الفرع ثم يُسند داخليًا", icon: "calendar" as IconName },
  { title: "متابعة شكوى", desc: "متابعة موحدة للإجراء والتحديات والنتيجة", icon: "alert" as IconName, kind: "request" as const },
  { title: "تحديث مشروع", desc: "تحديث الإنجاز والمخاطر والخطوات القادمة", icon: "chart" as IconName, kind: "task" as const },
];

function ServicesView({ onCreate, onInfo }: { onCreate: (kind: "task" | "request", tarasul?: boolean) => void; onInfo: (title: string) => void }) {
  return <section className="service-grid">{services.map((service) => <article className="service-card" key={service.title}><span><Icon name={service.icon}/></span><h2>{service.title}</h2><p>{service.desc}</p><div className="service-actions"><button onClick={() => service.kind ? onCreate(service.kind, service.title === "معاملة تراسل") : onInfo(service.title)}>{service.kind ? "بدء التسجيل" : "عرض مسار التكامل"} <Icon name="arrow" size={15}/></button><button className="icon-only" onClick={() => onInfo(service.title)} aria-label="تفاصيل"><Icon name="eye" size={16}/></button></div></article>)}</section>;
}

function OversightView({ role, onOpen }: { role: RoleKey; onOpen: (item: WorkItem) => void }) {
  const ownerMode = role === "owner";
  const visibleBranches = ownerMode ? branchRows.filter((branch) => branch.name === "فرع الهيئة بالمنطقة الغربية") : branchRows;
  const exceptions = initialWork.filter((w) => (!ownerMode || w.branch === "فرع الهيئة بالمنطقة الغربية") && w.source !== "تكامل منصة الزيارات" && w.source !== "بوابة الجهات الخارجية" && (w.priority === "عاجلة" || w.status === "جاهز للتحقق"));
  return <><section className="oversight-grid">{visibleBranches.map((b) => <article className="branch-card" key={b.name}><header><div><strong>{b.name}</strong><span>{b.total} عملًا خلال الأسبوع</span></div><b>{b.rate}%</b></header><div className="progress-track large"><span style={{width: `${b.rate}%`}}/></div><footer><span><i className="green-dot"/>{b.done} مكتمل</span><span><i className="blue-dot"/>{b.progress} جارٍ</span><span><i className="red-dot"/>{b.delayed} متأخر</span></footer></article>)}</section><section className="panel exception-panel"><div className="panel-header"><div><h2>الاستثناءات والقرارات</h2><p>{ownerMode ? "أعمال الفرع التي تحتاج متابعة وإحاطة تنفيذية" : "أعمال تجاوزت المستوى التشغيلي وتحتاج قرارًا"}</p></div><span className="count-pill">{exceptions.length}</span></div>{exceptions.map((w) => <button className="exception-row" key={w.id} onClick={() => onOpen(w)}><div><strong>{w.title}</strong><span>{w.id} · {w.branch}</span></div><StatusBadge status={w.status}/><span className={`priority priority-${w.priority}`}>{w.priority}</span><Icon name="chevron" size={17}/></button>)}</section></>;
}

function SlaView() {
  const metrics = [{ label: "الاستجابة الأولية", value: 94, target: "المستهدف 90%" }, { label: "الإنجاز في الموعد", value: 86, target: "المستهدف 85%" }, { label: "جودة التحديث اليومي", value: 79, target: "المستهدف 90%" }, { label: "إغلاق الأعمال المتأخرة", value: 68, target: "المستهدف 80%" }];
  return <><section className="sla-grid">{metrics.map((m) => <article className="sla-card" key={m.label}><div className="ring" style={{"--value": `${m.value * 3.6}deg`} as React.CSSProperties}><span>{m.value}%</span></div><div><h2>{m.label}</h2><p>{m.target}</p><StatusBadge status={m.value >= Number(m.target.match(/\d+/)?.[0]) ? "محقق" : "يحتاج تحسين"}/></div></article>)}</section><section className="panel sla-table"><div className="panel-header"><div><h2>مستويات الخدمة حسب نوع العمل</h2><p>القياس آلي من وقت الإنشاء حتى الإنجاز</p></div></div><div className="compact-table">{[["المهام التنفيذية", "3 أيام عمل", "91%"], ["طلبات الفروع", "يومان عمل", "88%"], ["معاملات تراسل", "5 أيام عمل", "84%"], ["طلبات الزيارة", "يوم عمل", "96%"]].map((r) => <div className="sla-row" key={r[0]}><strong>{r[0]}</strong><span>{r[1]}</span><b>{r[2]}</b></div>)}</div></section></>;
}

function AnalyticsView({ items, onReport, onDownload }: { items: WorkItem[]; onReport: (type: "weekly" | "monthly") => void; onDownload: () => void }) {
  const completed = items.filter((item) => ["مكتمل", "مغلق"].includes(item.status)).length;
  const active = items.filter((item) => ["قيد التنفيذ", "مسندة", "محالة إلى الإدارة", "بانتظار تحديث"].includes(item.status)).length;
  return <><section className="report-grid"><article className="report-card featured"><div><span>التحديث الأسبوعي</span><h2>ملخص جميع أعمال الفروع</h2><p>يشمل طلبات المكتب، والطلبات الداخلية، والمتبادلة بين الفروع، ومعاملات تراسل.</p><button onClick={() => onReport("weekly")}>فتح التقرير <Icon name="arrow" size={16}/></button></div><Icon name="report" size={58}/></article><article className="report-card"><Icon name="calendar" size={30}/><h2>التحديث الشهري</h2><p>يتراكم آليًا من التحديثات الموثقة دون إعادة كتابة الأعمال.</p><div className="mini-progress"><span style={{width:"82%"}}/></div><small>جاهزية البيانات 82%</small><button className="card-action" onClick={() => onReport("monthly")}>معاينة التقرير</button></article><article className="report-card"><Icon name="chart" size={30}/><h2>حركة الطلبات</h2><p>{completed} مغلق · {active} قيد التنفيذ · البيانات قابلة للتصفية والتفصيل</p><button className="card-action" onClick={onDownload}>تصدير إلى Excel</button></article></section><section className="weekly-source-kpis"><article><strong>185</strong><span>مستفيدًا تمت خدمته</span></article><article><strong>89</strong><span>رخصة أُصدرت</span></article><article><strong>11</strong><span>زيارة ميدانية</span></article><article><strong>12</strong><span>عدادًا تم فحصه</span></article></section><section className="panel weekly-achievements"><div className="panel-header"><div><h2>محاور إنجازات الفروع</h2><p>مبنية على نماذج «فروع الهيئة في أسبوع» وحقول متابعة الأعمال الفعلية.</p></div></div><div>{[["متابعة المشاريع", "زيارات مشاريع المياه والصرف الصحي ونسب الإنجاز والتحديات", "chart"], ["حماية المستفيد", "الشكاوى والمقابلات والإمداد المائي وما تم بشأنها", "shield"], ["التكامل الحكومي", "الأعمال المشتركة مع الأمانات والإمارات والجهات الحكومية", "users"], ["التراخيص والامتثال", "التراخيص والجولات الرقابية والمخالفات وخطط المعالجة", "check"], ["حدث الأسبوع", "أبرز إنجاز نوعي يرشحه الفرع للملخص التنفيذي", "report"]].map(([title, text, icon]) => <article key={title}><span><Icon name={icon as IconName}/></span><div><strong>{title}</strong><p>{text}</p></div></article>)}</div></section><section className="automation-banner"><Icon name="check"/><div><strong>التحديثات تُجهز تلقائيًا</strong><p>يصنف النظام كل تحديث إلى: ما تم إنجازه، جاري العمل عليه، مخطط له، والتحديات؛ ثم يعرض المصدر دون احتساب الطلب المتبادل مرتين في المؤشرات العامة.</p></div></section></>;
}

function ExternalPortalView({ requests, onOpen, onCreate }: { requests: ExternalRequest[]; role: RoleKey; onOpen: (request: ExternalRequest) => void; onCreate: (service?: string) => void }) {
  type PortalSection = "home" | "new" | "mine" | "visits" | "messages" | "entity";
  const [section, setSection] = useState<PortalSection>("home");
  const visible = requests.filter((request) => request.entity === "أمانة محافظة جدة");
  const portalNav: { key: PortalSection; label: string; icon: IconName }[] = [
    { key: "home", label: "الرئيسية", icon: "home" }, { key: "new", label: "تقديم طلب", icon: "plus" },
    { key: "mine", label: "طلباتي", icon: "list" },
    { key: "visits", label: "الزيارات", icon: "calendar" }, { key: "messages", label: "الرسائل والمرفقات", icon: "file" },
    { key: "entity", label: "بيانات الجهة والتفويض", icon: "shield" },
  ];
  const services = [
    ["زيارة فرع", "calendar"], ["تحديث مشروع", "chart"], ["شكوى أو ملاحظة", "alert"], ["تنسيق", "users"],
    ["طلب بيانات", "file"], ["متطلبات حكومية", "shield"], ["تصاريح وموافقات", "check"],
  ] as const;
  const beginRequest = (service = "زيارة فرع") => onCreate(service);
  const requestList = (rows: ExternalRequest[]) => <div className="legacy-request-list">{rows.map((request) => <button key={request.id} onClick={() => onOpen(request)}><div><span>{request.id} · {request.service || "طلب رسمي"}</span><strong>{request.title}</strong><small>{request.branch || "الهيئة السعودية للمياه"} · آخر تحديث: اليوم</small></div><StatusBadge status={request.status}/><Icon name="chevron" size={17}/></button>)}</div>;
  return <section className="legacy-portal">
    <aside className="legacy-portal-nav"><div className="nafath-badge"><Icon name="shield"/><div><strong>دخول موثق عبر نفاذ</strong><span>أمانة محافظة جدة</span></div></div>{portalNav.map((item) => <button key={item.key} className={section === item.key ? "active" : ""} onClick={() => {setSection(item.key); if (item.key === "new") beginRequest();}}><Icon name={item.icon} size={18}/><span>{item.label}</span></button>)}</aside>
    <div className="legacy-portal-content">
      {section === "home" && <><section className="legacy-welcome"><div><span>بوابة الجهات الخارجية</span><h2>مرحبًا، أمانة محافظة جدة</h2><p>تقديم الطلبات الرسمية ومتابعتها مع الهيئة السعودية للمياه.</p></div><button onClick={() => beginRequest()}><Icon name="plus" size={17}/> تقديم طلب جديد</button></section><section className="legacy-services"><div className="legacy-section-title"><div><h3>الخدمات المتاحة</h3><p>اختر نوع الخدمة لبدء طلب رسمي جديد</p></div></div><div>{services.map(([label, icon]) => <button key={label} onClick={() => beginRequest(label)}><span><Icon name={icon as IconName}/></span><strong>{label}</strong><Icon name="arrow" size={15}/></button>)}</div></section><section className="panel legacy-recent"><div className="panel-header"><div><h2>أحدث طلباتي</h2><p>متابعة حالة الطلبات المقدمة من الجهة</p></div><button className="text-button" onClick={() => setSection("mine")}>عرض جميع الطلبات <Icon name="arrow" size={15}/></button></div>{requestList(visible.slice(0,3))}</section></>}
      {section === "new" && <div className="legacy-empty-action"><Icon name="plus" size={34}/><h2>تقديم طلب رسمي جديد</h2><p>اختر نوع الخدمة والفرع، ثم أدخل الموضوع والتفاصيل والنتيجة المطلوبة.</p><button className="primary-button" onClick={() => beginRequest()}>فتح نموذج تقديم الطلب</button></div>}
      {section === "mine" && <section className="panel"><div className="panel-header"><div><h2>طلباتي</h2><p>متابعة جميع الطلبات وحالات الاستكمال والمعالجة والإغلاق من مكان واحد</p></div><button className="primary-button" onClick={() => beginRequest()}><Icon name="plus" size={16}/> طلب جديد</button></div>{requestList(visible)}</section>}
      {section === "visits" && <section className="panel"><div className="panel-header"><div><h2>طلبات الزيارة</h2><p>زيارات الفروع المقدمة من الجهة</p></div><button className="primary-button" onClick={() => beginRequest("زيارة فرع")}><Icon name="plus" size={16}/> طلب زيارة</button></div>{requestList(visible.filter((request) => request.service === "زيارة فرع"))}</section>}
      {section === "messages" && <section className="panel legacy-messages"><div className="panel-header"><div><h2>الرسائل والمرفقات</h2><p>المراسلات الرسمية والملفات المرتبطة بطلبات الجهة</p></div></div><div><article><span><Icon name="file"/></span><div><strong>تحديث-المشروع.pdf</strong><small>EXT-2026-0024 · 20 أغسطس 2026</small></div><button>عرض</button></article><article><span><Icon name="file"/></span><div><strong>نموذج-بيانات-الزيارة.pdf</strong><small>EXT-2026-0029 · 24 أغسطس 2026</small></div><button>عرض</button></article></div></section>}
      {section === "entity" && <section className="legacy-entity"><article><div className="entity-logo">أ ج</div><div><span>الجهة</span><h2>أمانة محافظة جدة</h2><p>رقم الجهة: AMN-JED-10024 · الحالة: موثقة</p></div><StatusBadge status="نشط"/></article><article className="delegation-card"><div className="panel-header"><div><h2>بيانات ممثل الجهة والتفويض</h2><p>البيانات المستخدمة للدخول وتقديم الطلبات الرسمية</p></div></div><div className="entity-fields"><div><span>اسم المفوض</span><strong>سلمان محمد الحربي</strong></div><div><span>رقم الهوية</span><strong>10******82</strong></div><div><span>البريد الإلكتروني</span><strong>representative@jeddah.gov.sa</strong></div><div><span>صلاحية التفويض</span><strong>31 ديسمبر 2026</strong></div></div></article></section>}
    </div>
  </section>;
}

function ExternalRequestModal({ request, onClose }: { request: ExternalRequest; role?: RoleKey; onClose: () => void; onRespond?: (id: string, response: string, fileName: string) => void; onReview?: (id: string, status: "مكتمل" | "يتطلب استكمال") => void }) {
  return <ModalFrame title={request.title} eyebrow={request.id} description={`${request.service || "طلب رسمي"} · ${request.branch || "الهيئة السعودية للمياه"}`} onClose={onClose} footer={<button className="secondary-button" onClick={onClose}>إغلاق</button>}>
    <div className="legacy-detail-grid"><div><span>نوع الخدمة</span><strong>{request.service || "طلب رسمي"}</strong></div><div><span>الفرع المعني</span><strong>{request.branch || "غير محدد"}</strong></div><div><span>تاريخ التقديم</span><strong>24 أغسطس 2026</strong></div><div><span>الحالة</span><StatusBadge status={request.status}/></div></div>
    <section className="legacy-request-body"><h3>تفاصيل الطلب</h3><p>{request.requirement}</p>{request.expected && <><h3>النتيجة المطلوبة</h3><p>{request.expected}</p></>} {request.proposedDate && <><h3>التاريخ المقترح</h3><p>{request.proposedDate}</p></>}</section>
    <div className="legacy-track"><span className="done"><i/><b>تم الاستلام</b></span><span className={request.status === "مكتمل" ? "done" : "active"}><i/><b>قيد المعالجة</b></span><span className={request.status === "مكتمل" ? "done" : ""}><i/><b>مكتمل</b></span></div>
  </ModalFrame>;
}

function CreateExternalRequestModal({ onClose, onCreate, initialService = "زيارة فرع" }: { onClose: () => void; onCreate: (request: ExternalRequest) => void; initialService?: string }) {
  const [service, setService] = useState(initialService); const [branch, setBranch] = useState(""); const [title, setTitle] = useState(""); const [details, setDetails] = useState(""); const [expected, setExpected] = useState(""); const [proposedDate, setProposedDate] = useState(""); const [fileName, setFileName] = useState(""); const [error, setError] = useState("");
  function submit() { if (!branch || !title.trim() || !details.trim() || !expected.trim()) return setError("أكمل نوع الخدمة والفرع والموضوع والتفاصيل والنتيجة المطلوبة."); const sequence = String(149 + Math.floor(Math.random() * 50)).padStart(4, "0"); const id = `EXT-2026-${String(32 + Math.floor(Math.random() * 50)).padStart(4, "0")}`; onCreate({id, workId: `WI-2026-${sequence}`, title, entity: "أمانة محافظة جدة", contact: "سلمان الحربي", due: proposedDate || "يحدد لاحقًا", priority: "متوسطة", status: "تحت المراجعة", service, branch, assignedCoordinator: scopeCoordinators[branch], requirement: details, expected, proposedDate: proposedDate || undefined, attachment: fileName || undefined}); }
  return <ModalFrame title="تقديم طلب جديد" eyebrow="بوابة الجهات الخارجية" description="سيتم توجيه الطلب تلقائيًا إلى صندوق طلبات الفرع المحدد لمراجعته وإسناده داخليًا." onClose={onClose} footer={<><button className="ghost-button" onClick={onClose}>إلغاء</button><button className="primary-button" onClick={submit}>إرسال الطلب <Icon name="arrow" size={16}/></button></>}><div className="form-grid"><label>نوع الخدمة<select value={service} onChange={(e) => setService(e.target.value)}><option>زيارة فرع</option><option>تحديث مشروع</option><option>شكوى أو ملاحظة</option><option>تنسيق</option><option>طلب بيانات</option><option>متطلبات حكومية</option><option>تصاريح وموافقات</option></select></label><label>الفرع المعني<select value={branch} onChange={(e) => setBranch(e.target.value)}><option value="">اختر الفرع</option>{branchRows.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>{branch && <div className="full auto-route-preview"><Icon name="arrow" size={17}/><div><span>التوجيه التلقائي</span><strong>صندوق طلبات {branch} · موظف الإدارة التنفيذية: {scopeCoordinators[branch]}</strong></div></div>}<label className="full">موضوع الطلب<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اكتب موضوعًا واضحًا ومختصرًا"/></label><label className="full">تفاصيل الطلب<textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="وضح الطلب والمعلومات المرتبطة به..."/></label><label className="full">النتيجة المطلوبة<textarea value={expected} onChange={(e) => setExpected(e.target.value)} rows={3} placeholder="ما النتيجة التي تتوقعها من الهيئة؟"/></label><label>تاريخ مقترح<input type="date" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)}/></label><label>مرفقات رسمية<span className="upload-box compact"><Icon name="file"/><b>{fileName || "اختيار ملف"}</b><input type="file" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}/></span></label></div>{error && <div className="form-error"><Icon name="alert" size={17}/>{error}</div>}</ModalFrame>;
}

function AssignmentModal({ item, onClose, onAssign }: { item: WorkItem; onClose: () => void; onAssign: (payload: AssignmentPayload) => void }) {
  const [assignmentType, setAssignmentType] = useState<"department" | "employee">("department");
  const [department, setDepartment] = useState(item.assignedDepartment || "");
  const [employee, setEmployee] = useState(item.assignedEmployee || "");
  const [instructions, setInstructions] = useState("");
  const [due, setDue] = useState("");
  const [error, setError] = useState("");
  const filteredEmployees = department ? scopeEmployees.filter((person) => person.department === department) : scopeEmployees;

  function submit() {
    if (!department || !instructions.trim() || !due) return setError("حدد جهة التكليف والتعليمات وتاريخ الاستحقاق الداخلي.");
    if (assignmentType === "employee" && !employee) return setError("اختر الموظف المنفذ قبل إرسال التكليف.");
    if (/^\d{4}-\d{2}-\d{2}$/.test(item.due) && due > item.due) return setError("تاريخ الاستحقاق الداخلي يجب ألا يتجاوز استحقاق الطلب الأصلي.");
    onAssign({ type: assignmentType, department, employee: assignmentType === "employee" ? employee : undefined, instructions, due });
  }

  return <ModalFrame title="إسناد داخل الفرع" eyebrow={item.id} description="اختر إدارة داخل الفرع أو موظفًا محددًا، ويبقى موظف الإدارة التنفيذية مسؤولًا عن المتابعة." onClose={onClose} footer={<><button className="ghost-button" onClick={onClose}>إلغاء</button><button className="primary-button" onClick={submit}><Icon name="send" size={16}/> إرسال الإسناد</button></>}>
    <div className="assignment-context"><span><Icon name={item.source === "تكامل منصة الزيارات" ? "calendar" : "briefcase"}/></span><div><small>{item.externalEntity || (item.createdBy ? `واردة من ${item.createdBy}` : item.source)}</small><strong>{item.title}</strong><p>{item.branch} · الاستحقاق الأصلي {item.due}</p></div></div>
    <fieldset className="method-fieldset"><legend>جهة التكليف</legend><div className="method-grid"><label className={assignmentType === "department" ? "selected" : ""}><input type="radio" name="assignment-type" checked={assignmentType === "department"} onChange={() => {setAssignmentType("department");setEmployee("");setError("")}}/><span className="method-icon"><Icon name="users"/></span><div><strong>إدارة داخل الفرع</strong><small>يصل العمل إلى صندوق الإدارة المختارة</small></div><i/></label><label className={assignmentType === "employee" ? "selected" : ""}><input type="radio" name="assignment-type" checked={assignmentType === "employee"} onChange={() => {setAssignmentType("employee");setError("")}}/><span className="method-icon blue"><Icon name="user"/></span><div><strong>موظف محدد</strong><small>يصل العمل مباشرة إلى مساحة الموظف</small></div><i/></label></div></fieldset>
    <div className="form-grid">
      <label className={assignmentType === "department" ? "full" : ""}>الإدارة داخل الفرع<select value={department} onChange={(e) => {setDepartment(e.target.value);setEmployee("")}}><option value="">اختر الإدارة</option>{branchDepartments.map((name) => <option key={name}>{name}</option>)}</select></label>
      {assignmentType === "employee" && <label>الموظف المنفذ<select value={employee} onChange={(e) => setEmployee(e.target.value)} disabled={!department}><option value="">{department ? "اختر الموظف" : "اختر الإدارة أولًا"}</option>{filteredEmployees.map((person) => <option key={person.name} value={person.name}>{person.name}</option>)}</select></label>}
      <label className="full">تعليمات التكليف والنتيجة المطلوبة<textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4} placeholder="وضح الإجراء المطلوب، ومخرج العمل، وما الذي يجب تسليمه عند الإنجاز..."/></label>
      <label>تاريخ الاستحقاق الداخلي<input type="date" value={due} onChange={(e) => setDue(e.target.value)}/><small className="field-hint">يجب ألا يتجاوز استحقاق الطلب الأصلي.</small></label>
      <label>مسؤول المتابعة<input value="خالد الزهراني · موظف الإدارة التنفيذية للفرع" readOnly/></label>
    </div>
    {error && <div className="form-error"><Icon name="alert" size={17}/>{error}</div>}
  </ModalFrame>;
}

function ModalFrame({ title, eyebrow, description, onClose, children, footer }: { title: string; eyebrow?: string; description?: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.currentTarget === e.target && onClose()}><section className="modal" role="dialog" aria-modal="true"><header><div>{eyebrow && <span className="modal-eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div><button className="icon-button" onClick={onClose} aria-label="إغلاق"><Icon name="close"/></button></header><div className="modal-body">{children}</div>{footer && <footer>{footer}</footer>}</section></div>;
}

function CreateWorkModal({ onClose, kind: _kind, creatorRole, startTarasul = false, onSubmit }: { onClose: () => void; kind: "task" | "request"; creatorRole: RoleKey; startTarasul?: boolean; onSubmit: (item: WorkItem, draft: boolean) => void }) {
  const branchMode = creatorRole === "branch";
  const manualTarasul = startTarasul;
  const [scope, setScope] = useState<"داخل الفرع" | "بين الفروع">("داخل الفرع");
  const [title, setTitle] = useState("");
  const [branch, setBranch] = useState(branchMode && scope === "داخل الفرع" ? "فرع الهيئة بالمنطقة الغربية" : "");
  const [category, setCategory] = useState("طلب متابعة");
  const [priority, setPriority] = useState<WorkItem["priority"]>("متوسطة");
  const [due, setDue] = useState("");
  const [updateDue, setUpdateDue] = useState("");
  const [description, setDescription] = useState("");
  const [expectedResult, setExpectedResult] = useState("");
  const [assignmentType, setAssignmentType] = useState<"department" | "employee">("department");
  const [department, setDepartment] = useState("");
  const [employee, setEmployee] = useState("");
  const [transactionNo, setTransactionNo] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [entity, setEntity] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const filteredEmployees = department ? scopeEmployees.filter((person) => person.department === department) : scopeEmployees;

  function save(draft: boolean) {
    const targetBranch = branchMode && scope === "داخل الفرع" ? "فرع الهيئة بالمنطقة الغربية" : branch;
    if (!draft && (!title.trim() || !targetBranch || !due || !description.trim() || !expectedResult.trim())) return setError("أكمل العنوان والجهة المستلمة والمطلوب والنتيجة المتوقعة والاستحقاق.");
    if (!draft && manualTarasul && (!transactionNo.trim() || !transactionDate || !updateDue)) return setError("رقم معاملة تراسل وتاريخها وتاريخ التحديث المطلوب حقول إلزامية.");
    if (!draft && branchMode && scope === "بين الفروع" && targetBranch === "فرع الهيئة بالمنطقة الغربية") return setError("اختر فرعًا آخر مستلمًا للطلب.");
    if (!draft && branchMode && scope === "داخل الفرع" && (!department || (assignmentType === "employee" && !employee))) return setError("حدد الإدارة المنفذة والموظف عند الإسناد المباشر.");
    const sequence = String(Math.floor(150 + Math.random() * 800)).padStart(4, "0");
    const id = manualTarasul ? `TRS-${transactionNo.replace(/\s|\//g, "-") || sequence}` : `REQ-2026-${sequence}`;
    const owner = branchMode && scope === "داخل الفرع" ? (assignmentType === "employee" ? employee : department) : "صندوق طلبات الفرع";
    const requestScope: WorkItem["requestScope"] = manualTarasul ? "مكتب وكيل الفروع" : branchMode ? scope : "مكتب وكيل الفروع";
    const createMessage = draft ? "تم حفظ السجل كمسودة." : manualTarasul ? `تم تسجيل معاملة تراسل وإرسال طلب تحديث إلى ${targetBranch}.` : scope === "بين الفروع" ? `تم إرسال الطلب رسميًا من فرع الهيئة بالمنطقة الغربية إلى صندوق طلبات ${targetBranch}.` : `تم إنشاء الطلب وإرساله إلى ${owner}.`;
    onSubmit({ id, title: title || "طلب محفوظ كمسودة", type: manualTarasul ? "معاملة تراسل" : "طلب", branch: targetBranch, originBranch: branchMode ? "فرع الهيئة بالمنطقة الغربية" : undefined, owner, status: draft ? "مسودة" : manualTarasul ? "مفتوحة" : branchMode && scope === "داخل الفرع" ? (assignmentType === "employee" ? "مسندة" : "محالة إلى الإدارة") : "جديد", priority, due: due || "غير محدد", updateDue: updateDue || due || undefined, description: description || "لم يكتمل الوصف بعد.", expectedResult: expectedResult || undefined, category, requestScope, progress: 0, source: manualTarasul ? "تراسل" : "مباشر", transactionNo: transactionNo || undefined, transactionDate: transactionDate || undefined, officialTarasulStatus: manualTarasul ? "مفتوحة" : undefined, internalNote: internalNote || undefined, attachment: fileName || undefined, externalEntity: entity || undefined, createdBy: roleProfiles[creatorRole].name, assignmentType: branchMode && scope === "داخل الفرع" ? (assignmentType === "employee" ? "موظف" : "إدارة") : undefined, assignedDepartment: branchMode && scope === "داخل الفرع" ? department : undefined, assignedEmployee: branchMode && scope === "داخل الفرع" && assignmentType === "employee" ? employee : undefined, updates: [{ date: "الآن", author: roleProfiles[creatorRole].name, text: createMessage, progress: 0, visibility: "رسمي مشترك" }] }, draft);
  }

  const titleText = manualTarasul ? "تسجيل معاملة تراسل" : "تسجيل طلب جديد";
  const descriptionText = manualTarasul ? "سجّل بيانات المعاملة وحدد الفرع المطلوب منه التحديث." : branchMode ? "حدد نطاق الطلب؛ داخل الفرع أو إلى فرع آخر. لا يطلع الفرع الآخر إلا على الطلب المشترك." : "طلب رسمي من مكتب وكيل الفروع يصل إلى صندوق الفرع المستلم.";
  return <ModalFrame title={titleText} eyebrow={manualTarasul ? "معاملات تراسل" : "طلب جديد"} description={descriptionText} onClose={onClose} footer={<><button className="ghost-button" onClick={onClose}>إلغاء</button><button className="secondary-button" onClick={() => save(true)}>حفظ كمسودة</button><button className="primary-button" onClick={() => save(false)}>{manualTarasul ? "تسجيل وإرسال للفرع" : "إنشاء وإرسال الطلب"} <Icon name="arrow" size={17}/></button></>}>
    {branchMode && !manualTarasul && <fieldset className="method-fieldset"><legend>نطاق الطلب</legend><div className="method-grid"><label className={scope === "داخل الفرع" ? "selected" : ""}><input type="radio" name="scope" checked={scope === "داخل الفرع"} onChange={() => {setScope("داخل الفرع");setBranch("فرع الهيئة بالمنطقة الغربية");setError("")}}/><span className="method-icon"><Icon name="users"/></span><div><strong>داخل الفرع</strong><small>إلى إدارة أو موظف في فرعك</small></div><i/></label><label className={scope === "بين الفروع" ? "selected" : ""}><input type="radio" name="scope" checked={scope === "بين الفروع"} onChange={() => {setScope("بين الفروع");setBranch("");setError("")}}/><span className="method-icon blue"><Icon name="send"/></span><div><strong>إلى فرع آخر</strong><small>يصل إلى صندوق الفرع المستلم</small></div><i/></label></div></fieldset>}
    {manualTarasul && <div className="tarasul-box"><div className="section-label"><Icon name="file" size={18}/><strong>بيانات معاملة تراسل</strong></div><div className="form-grid"><label>رقم معاملة تراسل<input value={transactionNo} onChange={(event) => setTransactionNo(event.target.value)} placeholder="مثال: 1447/3218"/></label><label>تاريخ المعاملة<input value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} type="date"/></label><label className="full">الجهة الواردة منها المعاملة<input value={entity} onChange={(event) => setEntity(event.target.value)} placeholder="اختياري حسب البيانات المتاحة"/></label></div></div>}
    <div className="form-grid main-form">
      <label className="full">{manualTarasul ? "موضوع المعاملة" : "عنوان الطلب"}<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="اكتب عنوانًا واضحًا ومختصرًا"/></label>
      <label>التصنيف<select value={category} onChange={(event) => setCategory(event.target.value)}><option>طلب متابعة</option><option>طلب بيانات</option><option>متابعة مشروع</option><option>شكوى</option><option>زيارة ميدانية</option><option>ترخيص وامتثال</option><option>تنسيق حكومي</option></select></label>
      <label>الفرع المستلم<select value={branchMode && scope === "داخل الفرع" ? "فرع الهيئة بالمنطقة الغربية" : branch} onChange={(event) => setBranch(event.target.value)} disabled={branchMode && scope === "داخل الفرع"}><option value="">اختر الفرع</option>{branchRows.map((item) => <option key={item.name} value={item.name} disabled={branchMode && scope === "بين الفروع" && item.name === "فرع الهيئة بالمنطقة الغربية"}>{item.name}</option>)}</select></label>
      {branchMode && scope === "داخل الفرع" && <><label>نوع الإسناد<select value={assignmentType} onChange={(event) => {setAssignmentType(event.target.value as "department" | "employee");setEmployee("")}}><option value="department">إدارة</option><option value="employee">موظف</option></select></label><label>الإدارة المنفذة<select value={department} onChange={(event) => {setDepartment(event.target.value);setEmployee("")}}><option value="">اختر الإدارة</option>{branchDepartments.map((item) => <option key={item}>{item}</option>)}</select></label>{assignmentType === "employee" && <label className="full">الموظف المسؤول<select value={employee} onChange={(event) => setEmployee(event.target.value)} disabled={!department}><option value="">{department ? "اختر الموظف" : "اختر الإدارة أولًا"}</option>{filteredEmployees.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>}</>}
      <label>الأولوية<select value={priority} onChange={(event) => setPriority(event.target.value as WorkItem["priority"])}><option>متوسطة</option><option>عالية</option><option>عاجلة</option><option>منخفضة</option></select></label>
      <label>تاريخ الاستحقاق<input value={due} onChange={(event) => setDue(event.target.value)} type="date"/></label>
      {manualTarasul && <label className="full">تاريخ التحديث المطلوب من الفرع<input value={updateDue} onChange={(event) => setUpdateDue(event.target.value)} type="date"/></label>}
      <label className="full">{manualTarasul ? "المطلوب من الفرع" : "وصف المطلوب"}<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder="وضح خلفية الطلب والإجراء المطلوب..."/></label>
      <label className="full">النتيجة المتوقعة<textarea value={expectedResult} onChange={(event) => setExpectedResult(event.target.value)} rows={2} placeholder="ما النتيجة التي يجب تسليمها عند الإنجاز؟"/></label>
      {manualTarasul && <label className="full">ملاحظات داخلية<input value={internalNote} onChange={(event) => setInternalNote(event.target.value)} placeholder="لا تظهر للفرع عند اختيارها كملاحظة داخلية"/></label>}
      <label className="full upload-label">المرفقات <span className="optional-label">اختيارية</span><span className="upload-box"><Icon name="file"/><b>{fileName || "اضغط لاختيار مرفق"}</b><small>PDF، PNG، JPG، XLSX · الحد الأقصى 10MB</small><input type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}/></span></label>
    </div>
    {(branch || (branchMode && scope === "داخل الفرع")) && <div className="auto-route-preview"><Icon name="arrow" size={17}/><div><span>مسار التوجيه</span><strong>{branchMode && scope === "داخل الفرع" ? `يصل مباشرة إلى ${assignmentType === "employee" ? employee || "الموظف المحدد" : department || "الإدارة المحددة"} داخل فرع الهيئة بالمنطقة الغربية` : `يصل إلى صندوق طلبات ${branch} ثم يسنده موظف الإدارة التنفيذية داخليًا`}</strong></div></div>}
    {error && <div className="form-error"><Icon name="alert" size={17}/>{error}</div>}
  </ModalFrame>;
}

function WorkDetail({ item, role, onClose, onUpdate, onStatus, onStart, onAssign, onAction }: { item: WorkItem; role: RoleKey; onClose: () => void; onUpdate: (id: string, payload: UpdatePayload) => void; onStatus: (id: string, status: WorkStatus) => void; onStart: (item: WorkItem) => void; onAssign: (item: WorkItem) => void; onAction: (id: string, action: string, reason: string) => void }) {
  const [updateText, setUpdateText] = useState("");
  const [visibility, setVisibility] = useState<UpdatePayload["visibility"]>("رسمي مشترك");
  const [attachment, setAttachment] = useState("");
  const [progress, setProgress] = useState(item.progress);
  const [error, setError] = useState("");
  const [action, setAction] = useState("");
  const [reason, setReason] = useState("");
  const [actionDate, setActionDate] = useState("");
  const [actionCompleted, setActionCompleted] = useState("");
  const [actionImpact, setActionImpact] = useState("");
  const isSensitiveIntake = item.source === "بوابة الجهات الخارجية" || item.source === "تكامل منصة الزيارات";
  const isBranchPendingTask = role === "branch" && item.branch === "فرع الهيئة بالمنطقة الغربية" && item.type !== "زيارة" && item.owner === "صندوق طلبات الفرع" && (item.status === "جديد" || item.status === "مفتوحة" || item.status === "قيد الفرز") && !isSensitiveIntake;
  const isEmployeeAwaitingStart = role === "employee" && item.status === "مسندة";
  const isWaitingForInternalAssignment = role === "branch" && (item.status === "محالة إلى الإدارة" || item.status === "مسندة");
  const canOperate = (role === "employee" && !isEmployeeAwaitingStart) || (role === "branch" && item.branch === "فرع الهيئة بالمنطقة الغربية" && !isSensitiveIntake && !isBranchPendingTask && !isWaitingForInternalAssignment);
  const isSendingBranchView = (role === "branch" || role === "owner") && item.requestScope === "بين الفروع" && item.originBranch === "فرع الهيئة بالمنطقة الغربية" && item.branch !== "فرع الهيئة بالمنطقة الغربية";
  const visibleUpdates = isSendingBranchView ? item.updates.filter((update) => update.visibility !== "ملاحظة داخلية") : item.updates;

  return <div className="drawer-backdrop" onMouseDown={(e) => e.currentTarget === e.target && onClose()}>
    <aside className="detail-drawer" role="dialog" aria-modal="true">
      <header><div><span className="record-id">{item.id}</span><h2>{item.title}</h2><div className="drawer-badges"><span className="type-chip">{item.type}</span><StatusBadge status={item.status}/><span className={`priority priority-${item.priority}`}>{item.priority}</span></div></div><button className="icon-button" onClick={onClose}><Icon name="close"/></button></header>
      <div className="drawer-body">
        <section className="detail-section"><h3>ملخص سجل العمل</h3><p className="work-description">{item.description}</p>{item.expectedResult && <div className="expected-result"><span>النتيجة المتوقعة</span><strong>{item.expectedResult}</strong></div>}<div className="detail-grid"><div><span>النطاق</span><strong>{item.requestScope || item.branch}</strong></div><div><span>الفرع المستلم</span><strong>{item.branch}</strong></div>{item.originBranch && <div><span>الفرع المرسل</span><strong>{item.originBranch}</strong></div>}<div><span>المسند إليه</span><strong>{item.owner}</strong></div><div><span>الاستحقاق</span><strong>{item.due}</strong></div><div><span>مصدر التسجيل</span><strong>{item.source}</strong></div></div>{item.source === "تراسل" && <div className="integration-card blue"><Icon name="file"/><div><strong>معاملة تراسل رقم {item.transactionNo}</strong><span>حالة المتابعة: {item.status} · الحالة الرسمية في تراسل: {item.officialTarasulStatus || "مفتوحة"}</span><small>التحديث المطلوب: {item.updateDue || item.due}</small></div>{item.attachment && <button onClick={() => alert("تمت معاينة المرفق في النموذج التفاعلي.")}>معاينة</button>}</div>}</section>
        {item.assignmentType && <section className="detail-section assignment-route"><div className="section-heading"><div><span className="integration-dot"/><div><h3>مسار الإسناد داخل الفرع</h3><p>توزيع داخلي تحت متابعة موظف الإدارة التنفيذية للفرع</p></div></div><StatusBadge status={item.status}/></div><div className="detail-grid"><div><span>نوع الإسناد</span><strong>{item.assignmentType}</strong></div><div><span>الإدارة</span><strong>{item.assignedDepartment}</strong></div>{item.assignedEmployee && <div><span>الموظف المنفذ</span><strong>{item.assignedEmployee}</strong></div>}<div><span>مسؤول المتابعة</span><strong>{roleProfiles.branch.name}</strong></div></div></section>}
        {role === "branch" && item.citizen && <section className="detail-section"><div className="section-heading"><div><span className="integration-dot"/><div><h3>نموذج زيارة المواطن</h3><p>بيانات مقروءة فقط · متاحة لموظف الإدارة التنفيذية للفرع</p></div></div><span className="sync-pill">متزامن</span></div><div className="citizen-grid"><div><span>اسم المواطن</span><strong>{item.citizen.name}</strong></div><div><span>رقم الهوية</span><strong>{item.citizen.id}</strong></div><div><span>رقم الجوال</span><strong>{item.citizen.mobile}</strong></div><div><span>الموعد المطلوب</span><strong>{item.citizen.requestedDate}</strong></div><div className="full"><span>غرض الزيارة</span><strong>{item.citizen.purpose}</strong></div></div></section>}
        <section className="detail-section"><div className="section-heading"><div><h3>نسبة الإنجاز</h3><p>تدخل مباشرة في التقرير الأسبوعي والشهري</p></div><b>{item.progress}%</b></div><div className="progress-track large"><span style={{width: `${item.progress}%`}}/></div></section>
        <section className="detail-section"><h3>سجل التحديثات</h3><div className="timeline">{visibleUpdates.map((u, i) => <div className="timeline-item" key={`${u.date}-${i}`}><i/><div><header><strong>{u.author}</strong><span>{u.date} · {u.progress}% · {u.visibility || "رسمي مشترك"}</span></header><p>{u.text}</p></div></div>)}</div></section>
        {canOperate && !["مكتمل", "مغلق", "ملغى"].includes(item.status) && <section className="detail-section update-box"><div className="section-heading"><div><h3>إضافة تحديث موثق</h3><p>اكتب التحديث كاملًا في حقل واحد، وسيُحفظ باسم صاحبه وتاريخه.</p></div><span className="required-pill">حقل إلزامي</span></div><div className="update-form-grid"><label className="full">التحديث<textarea value={updateText} onChange={(event) => setUpdateText(event.target.value)} rows={5} placeholder="اكتب كامل التحديث بوضوح..."/></label></div><div className={`update-options ${role === "employee" ? "single" : ""}`}>{role !== "employee" && <label>نوع التحديث<select value={visibility} onChange={(event) => setVisibility(event.target.value as UpdatePayload["visibility"])}><option>رسمي مشترك</option><option>ملاحظة داخلية</option></select></label>}<label>مرفق داعم<input type="file" onChange={(event) => setAttachment(event.target.files?.[0]?.name || "")}/></label></div><label>نسبة الإنجاز <b>{progress}%</b><input type="range" min="0" max="100" step="5" value={progress} onChange={(e) => setProgress(Number(e.target.value))}/></label>{error && <small className="error-text">{error}</small>}<button className="primary-button" onClick={() => { if (!updateText.trim()) return setError("اكتب التحديث قبل الحفظ."); onUpdate(item.id, {text: updateText.trim(), progress, visibility: role === "employee" ? "رسمي مشترك" : visibility, attachment: attachment || undefined}); setUpdateText("");setAttachment("");setError(""); }}>حفظ التحديث <Icon name="send" size={16}/></button></section>}
        {(role === "center" || role === "branch") && <section className="detail-section action-composer"><h3>المزيد من الإجراءات</h3><div><select value={action} onChange={(event) => {setAction(event.target.value);setActionDate("");setActionCompleted("");setActionImpact("");setError("")}}><option value="">اختر الإجراء</option>{role === "center" && <><option>طلب تحديث</option><option>إغلاق</option><option>إعادة فتح</option><option>إلغاء</option></>}{role === "branch" && <><option>إعادة الإسناد</option><option>إشراك إدارة أخرى</option><option>نقل مسؤولية الطلب</option><option>طلب تحديث</option><option>تعليق الطلب</option><option>استئناف الطلب</option><option>طلب تمديد</option><option>إرسال للمراجعة</option></>}</select><textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder={action === "طلب تحديث" ? "اكتب التحديث المطلوب بوضوح..." : action === "تعليق الطلب" ? "اكتب سبب التعليق والعائق..." : action === "طلب تمديد" ? "اكتب سبب التمديد..." : action === "إعادة فتح" ? "اكتب سبب إعادة الفتح والمطلوب معالجته..." : "اكتب السبب أو المطلوب بوضوح..."}/>{["طلب تمديد", "تعليق الطلب", "إعادة فتح"].includes(action) && <label>التاريخ المقترح<input type="date" value={actionDate} onChange={(event) => setActionDate(event.target.value)}/></label>}{action === "طلب تمديد" && <><label>ما تم إنجازه<textarea value={actionCompleted} onChange={(event) => setActionCompleted(event.target.value)} rows={2}/></label><label>أثر عدم الموافقة<textarea value={actionImpact} onChange={(event) => setActionImpact(event.target.value)} rows={2}/></label></>}<button className="secondary-button" onClick={() => {if (!action || !reason.trim()) return setError("اختر الإجراء واكتب السبب أو المطلوب.");if (["طلب تمديد", "تعليق الطلب", "إعادة فتح"].includes(action) && !actionDate) return setError("حدد التاريخ المقترح لهذا الإجراء.");if (action === "طلب تمديد" && (!actionCompleted.trim() || !actionImpact.trim())) return setError("أكمل ما تم إنجازه وأثر عدم الموافقة على التمديد.");const details = action === "طلب تمديد" ? `${reason} · التاريخ الجديد المقترح: ${actionDate} · ما تم إنجازه: ${actionCompleted} · أثر عدم الموافقة: ${actionImpact}` : actionDate ? `${reason} · التاريخ المقترح: ${actionDate}` : reason;onAction(item.id, action, details);setAction("");setReason("");setActionDate("");setActionCompleted("");setActionImpact("");}}>تنفيذ الإجراء</button></div></section>}
      </div>
      <footer>
        {(role === "executive" || role === "owner") ? <button className="secondary-button" onClick={onClose}><Icon name="eye" size={17}/> إغلاق العرض فقط</button>
        : isBranchPendingTask ? <><button className="secondary-button" onClick={() => onStart(item)}><Icon name="arrow" size={17}/> بدء التنفيذ</button><button className="primary-button" onClick={() => onAssign(item)}><Icon name="user" size={17}/> تكليف داخل الفرع</button></>
        : isWaitingForInternalAssignment ? <button className="primary-button" onClick={() => onAssign(item)}><Icon name="edit" size={17}/> تغيير التكليف</button>
        : isEmployeeAwaitingStart ? <button className="primary-button" onClick={() => onStart(item)}><Icon name="arrow" size={17}/> بدء التنفيذ</button>
        : canOperate && item.status !== "مكتمل" ? <>{role === "branch" && <button className="secondary-button" onClick={() => onAssign(item)}><Icon name="user" size={17}/> تكليف داخل الفرع</button>}<button className="primary-button" onClick={() => onStatus(item.id, "جاهز للتحقق")}>إرسال للتحقق</button></>
        : <button className="secondary-button" onClick={onClose}>إغلاق</button>}
      </footer>
    </aside>
  </div>;
}

function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (user: PlatformUser) => void }) {
  const [employee, setEmployee] = useState(""); const [role, setRole] = useState("منفذ العمل"); const [scope, setScope] = useState("فرع الهيئة بالمنطقة الغربية"); const [team, setTeam] = useState("فريق التنفيذ"); const [temporary, setTemporary] = useState(false); const [accessUntil, setAccessUntil] = useState(""); const [error, setError] = useState("");
  const directoryUser = employee.trim() ? {name: "محمد عبدالله الغامدي", email: `u${employee.trim()}@swa.gov.sa`, title: "أخصائي خدمات فروع", organization: "فرع الهيئة بالمنطقة الغربية"} : null;
  return <ModalFrame title="إضافة مستخدم" eyebrow="إدارة المنصة" description="أدخل الرقم الوظيفي؛ يسترجع النظام بيانات الموظف تلقائيًا، ثم حدد الدور ونطاق الوصول." onClose={onClose} footer={<><button className="ghost-button" onClick={onClose}>إلغاء</button><button className="primary-button" onClick={() => {if (!employee.trim() || !directoryUser) return setError("أدخل الرقم الوظيفي لاسترجاع بيانات الموظف."); if (temporary && !accessUntil) return setError("حدد تاريخ انتهاء الصلاحية المؤقتة."); onAdd({name: directoryUser.name, employee, role, scope, team, state: "نشط", email: directoryUser.email, jobTitle: directoryUser.title, accessUntil: temporary ? accessUntil : undefined})}}><Icon name="plus" size={17}/> حفظ وتفعيل الصلاحية</button></>}><div className="form-grid"><label className="full">الرقم الوظيفي<input value={employee} onChange={(event) => setEmployee(event.target.value.replace(/\D/g, ""))} placeholder="مثال: 12590" inputMode="numeric"/></label>{directoryUser && <div className="full directory-result"><span><Icon name="check" size={18}/></span><div><small>تم الاسترجاع من الدليل المؤسسي</small><strong>{directoryUser.name}</strong><p>{directoryUser.title} · {directoryUser.organization}</p><p>{directoryUser.email}</p></div></div>}<label>الدور<select value={role} onChange={(event) => setRole(event.target.value)}><option>وكيل فروع الهيئة السعودية للمياه</option><option>المسؤول التنفيذي للفرع</option><option>موظف مكتب وكيل الفروع</option><option>موظف الإدارة التنفيذية للفرع</option><option>منفذ العمل</option><option>مسؤول إدارة المنصة</option></select></label><label>نطاق الوصول<select value={scope} onChange={(event) => setScope(event.target.value)}>{branchRows.map((item) => <option key={item.name}>{item.name}</option>)}<option>جميع الفروع</option><option>إدارة المستخدمين والصلاحيات فقط</option></select></label><label>الإدارة أو الفريق<select value={team} onChange={(event) => setTeam(event.target.value)}><option>مكتب وكيل الفروع</option><option>الإدارة التنفيذية للفرع</option><option>قيادة الفرع</option><option>فريق التنفيذ</option><option>إدارة المنصة</option></select></label><label className="temporary-access"><input type="checkbox" checked={temporary} onChange={(event) => setTemporary(event.target.checked)}/><span>صلاحية مؤقتة</span></label>{temporary && <label>تاريخ انتهاء الصلاحية<input type="date" value={accessUntil} onChange={(event) => setAccessUntil(event.target.value)}/></label>}<div className="full permission-preview"><Icon name="shield" size={18}/><div><strong>ملخص الصلاحية قبل الحفظ</strong><p>{role} · {scope} · {temporary ? `تنتهي في ${accessUntil || "تاريخ غير محدد"}` : "صلاحية مستمرة"}</p></div></div></div>{error && <div className="form-error"><Icon name="alert" size={17}/>{error}</div>}</ModalFrame>;
}

function ReportModal({ type, items, onClose, onDownload, onEmail }: { type: "weekly" | "monthly"; items: WorkItem[]; onClose: () => void; onDownload: () => void; onEmail: () => void }) {
  const weekly = type === "weekly";
  const completed = items.filter((item) => ["مكتمل", "مغلق"].includes(item.status));
  const active = items.filter((item) => ["قيد التنفيذ", "مسندة", "محالة إلى الإدارة", "بانتظار تحديث"].includes(item.status));
  const planned = items.filter((item) => ["جديد", "مسودة", "قيد الفرز"].includes(item.status));
  const challenged = items.filter((item) => item.status === "معلقة" || item.updates.some((update) => update.challenges && update.challenges !== "لا يوجد"));
  const section = (title: string, rows: WorkItem[]) => <section className="report-work-section"><header><strong>{title}</strong><span>{rows.length}</span></header>{rows.slice(0,4).map((item) => <div key={item.id}><b>{item.title}</b><small>{item.id} · {item.originBranch ? `${item.originBranch} ← ${item.branch}` : item.branch} · {item.updates[0]?.text}</small></div>)}</section>;
  return <ModalFrame title={weekly ? "التحديث التنفيذي الأسبوعي" : "التحديث الشهري المجمع"} eyebrow={weekly ? "مسودة آلية قابلة للمراجعة" : "تجميع الشهر"} description="تم إنشاؤه تلقائيًا من الطلبات ومعاملات تراسل والتحديثات الموثقة." onClose={onClose} footer={<><button className="secondary-button" onClick={onEmail}><Icon name="send" size={17}/> إرسال بالبريد المؤسسي</button><button className="primary-button" onClick={onDownload}><Icon name="download" size={17}/> تصدير إلى Excel</button></>}><div className="report-summary"><article><span>إجمالي السجلات</span><strong>{items.length}</strong></article><article><span>مغلقة خلال الفترة</span><strong>{completed.length}</strong></article><article><span>تحتاج متابعة</span><strong>{active.length + challenged.length}</strong></article></div><div className="report-source-breakdown"><span>طلبات مكتب وكيل الفروع <b>{items.filter((item) => item.requestScope === "مكتب وكيل الفروع" && item.type !== "معاملة تراسل").length}</b></span><span>طلبات داخلية <b>{items.filter((item) => item.requestScope === "داخل الفرع").length}</b></span><span>طلبات بين الفروع <b>{items.filter((item) => item.requestScope === "بين الفروع").length}</b></span><span>معاملات تراسل <b>{items.filter((item) => item.type === "معاملة تراسل").length}</b></span></div><div className="report-work-grid">{section("ما تم إنجازه", completed)}{section("جاري العمل عليه", active)}{section("مخطط له", planned)}{section("التحديات", challenged)}</div><div className="report-note"><Icon name="shield" size={18}/><span>يحفظ النظام منشئ التقرير وتاريخ إنشائه، وتبقى اللقطة المعتمدة ثابتة لأغراض التدقيق.</span></div></ModalFrame>;
}

function InfoModal({ title, onClose }: { title: string; onClose: () => void }) {
  const visit = title === "طلب زيارة";
  return <ModalFrame title={title} eyebrow="تفاصيل الخدمة" onClose={onClose} footer={<button className="primary-button" onClick={onClose}>فهمت</button>}><div className="info-flow">{(visit ? [["1", "استلام آلي", "يصل الطلب ونموذج المواطن من منصة الزيارات."], ["2", "ظهور لدى الفرع", "يرى موظف الإدارة التنفيذية للفرع الزيارة في صندوق الاستقبال فقط."], ["3", "إسناد داخلي", "يسند الموظف الطلب إلى المنفذ دون إظهار بيانات المواطن غير اللازمة له."]] : [["1", "إنشاء السجل", "تسجيل البيانات الأساسية والجهة والأولوية."], ["2", "التوجيه", "يصل إلى الفريق داخل نطاقه المصرح به."], ["3", "التحديث والإغلاق", "تغذي التحديثات التقارير الأسبوعية والشهرية."]]).map((s) => <div key={s[0]}><span>{s[0]}</span><div><strong>{s[1]}</strong><p>{s[2]}</p></div></div>)}</div></ModalFrame>;
}

export default function Home() {
  const [view, setView] = useState<ViewKey>("home"); const [sidebarOpen, setSidebarOpen] = useState(false); const [createOpen, setCreateOpen] = useState(false); const [createKind, setCreateKind] = useState<"task" | "request">("task"); const [startTarasul, setStartTarasul] = useState(false); const [role, setRole] = useState<RoleKey>("center"); const [roleMenu, setRoleMenu] = useState(false); const [works, setWorks] = useState<WorkItem[]>(initialWork); const [selected, setSelected] = useState<WorkItem | null>(null); const [assigningWork, setAssigningWork] = useState<WorkItem | null>(null); const [externalRequests, setExternalRequests] = useState<ExternalRequest[]>(initialExternalRequests); const [selectedExternal, setSelectedExternal] = useState<ExternalRequest | null>(null); const [createExternalOpen, setCreateExternalOpen] = useState(false); const [createExternalService, setCreateExternalService] = useState("زيارة فرع"); const [platformUsers, setPlatformUsers] = useState<PlatformUser[]>(initialUsers); const [addUserOpen, setAddUserOpen] = useState(false); const [notificationsOpen, setNotificationsOpen] = useState(false); const [reportOpen, setReportOpen] = useState<"weekly" | "monthly" | null>(null); const [infoOpen, setInfoOpen] = useState<string | null>(null); const [toast, setToast] = useState(""); const [globalSearch, setGlobalSearch] = useState("");
  const header = useMemo(() => view === "intake" && role === "branch" ? {title: "صندوق طلبات الفرع", subtitle: "طلبات مكتب وكيل الفروع والفروع الأخرى بانتظار المراجعة والإسناد الداخلي"} : viewTitles[view], [view, role]);
  const profile = roleProfiles[role];
  const creationViews: ViewKey[] = ["workspace", "team", "intake", "work", "transactions"];
  const canCreate = creationViews.includes(view) && (role === "center" || role === "branch") && !(view === "transactions" && role === "branch");
  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(""), 3200); }
  function openCreate(kind: "task" | "request", tarasul = false) { setCreateKind(kind); setStartTarasul(tarasul); setCreateOpen(true); }
  function createWork(item: WorkItem, draft: boolean) {
    const normalizedTransactionNo = item.transactionNo?.replace(/\s/g, "").toLowerCase();
    const duplicate = item.type === "معاملة تراسل" && normalizedTransactionNo && works.some((work) => work.type === "معاملة تراسل" && work.transactionNo?.replace(/\s/g, "").toLowerCase() === normalizedTransactionNo);
    if (duplicate) return notify(`معاملة تراسل رقم ${item.transactionNo} مسجلة مسبقًا؛ افتح سجلها وأضف التحديث بدل إنشاء سجل جديد.`);
    setWorks((current) => [item, ...current]);
    setCreateOpen(false);
    setView(startTarasul ? "transactions" : draft ? "workspace" : "work");
    notify(draft ? "تم حفظ السجل كمسودة." : startTarasul ? "تم تسجيل معاملة تراسل وإرسالها للفرع." : "تم إنشاء الطلب وإرساله بنجاح.");
  }
  function openSelected(item: WorkItem) { if (role === "access" || role === "external") return notify("هذا الدور لا يملك صلاحية مشاهدة محتوى الأعمال الداخلية."); setSelected(works.find((w) => w.id === item.id) || item); }
  function openAssignment(item: WorkItem) { setSelected(null); setAssigningWork(works.find((work) => work.id === item.id) || item); }
  function updateWork(id: string, payload: UpdatePayload) { const nextStatus: WorkStatus = payload.progress === 100 ? "جاهز للتحقق" : "قيد التنفيذ"; const update = {date: "الآن", author: profile.name, ...payload}; setWorks((current) => current.map((w) => w.id === id ? {...w, progress: payload.progress, status: nextStatus, updates: [update, ...w.updates]} : w)); setSelected((current) => current?.id === id ? {...current, progress: payload.progress, status: nextStatus, updates: [update, ...current.updates]} : current); notify("تم حفظ التحديث وإدخاله تلقائيًا في التحديث الأسبوعي والشهري."); }
  function changeStatus(id: string, status: WorkStatus) { setWorks((current) => current.map((w) => w.id === id ? {...w, status, progress: status === "مكتمل" ? 100 : w.progress, updates: [{date: "الآن", author: profile.name, text: `تم تغيير الحالة إلى ${status}.`, progress: status === "مكتمل" ? 100 : w.progress}, ...w.updates]} : w)); setSelected(null); notify(`تم تغيير حالة العمل إلى «${status}».`); }
  function actionWork(id: string, action: string, reason: string) { const statusMap: Record<string, WorkStatus | undefined> = {"طلب تحديث": "بانتظار تحديث", "تعليق الطلب": "معلقة", "استئناف الطلب": "قيد التنفيذ", "إرسال للمراجعة": "بانتظار الاعتماد", "إغلاق": "مغلق", "إعادة فتح": "قيد التنفيذ", "إلغاء": "ملغى"}; const nextStatus = statusMap[action]; setWorks((current) => current.map((work) => work.id === id ? {...work, status: nextStatus || work.status, progress: action === "إغلاق" ? 100 : work.progress, updates: [{date: "الآن", author: profile.name, text: `${action}: ${reason}`, progress: action === "إغلاق" ? 100 : work.progress, visibility: "رسمي مشترك"}, ...work.updates]} : work)); setSelected(null); notify(workTypeLabel(id, action)); }
  function workTypeLabel(id: string, action: string) { const work = works.find((item) => item.id === id); return work?.type === "معاملة تراسل" && action === "إغلاق" ? "تم إغلاق سجل المتابعة وحفظ الإجراء في سجل التدقيق." : `تم تنفيذ «${action}» وحفظ السبب في سجل التدقيق.`; }
  function startWork(item: WorkItem) {
    const actorText = role === "branch" ? "استلم موظف الإدارة التنفيذية للفرع الطلب وبدأ متابعته." : "استلم الموظف الطلب وبدأ تنفيذه.";
    setWorks((current) => current.map((work) => work.id === item.id ? {...work, owner: profile.name, status: "قيد التنفيذ", updates: [{date: "الآن", author: profile.name, text: actorText, progress: work.progress}, ...work.updates]} : work));
    setSelected(null);
    notify(role === "branch" ? "تم استلام الطلب وبدء متابعته بواسطة موظف الإدارة التنفيذية للفرع." : "تم بدء تنفيذ الطلب.");
  }
  function assignWork(item: WorkItem, payload: AssignmentPayload) {
    const isIntake = item.source === "تكامل منصة الزيارات" || item.source === "بوابة الجهات الخارجية";
    const intakeOrigin = item.source === "تكامل منصة الزيارات" ? "زيارة مواطن" : item.source === "بوابة الجهات الخارجية" ? "جهة خارجية" : item.intakeOrigin;
    const target = payload.type === "department" ? payload.department : payload.employee || "";
    const assignmentLabel = payload.type === "department" ? `إدارة ${payload.department.replace(/^إدارة\s+/, "")}` : payload.employee || "الموظف المحدد";
    setWorks((current) => current.map((work) => work.id === item.id ? {
      ...work,
      title: work.title,
      type: isIntake ? "طلب" : work.type,
      owner: target,
      status: payload.type === "department" ? "محالة إلى الإدارة" : "مسندة",
      due: payload.due,
      description: isIntake ? `تعليمات الإسناد الداخلي: ${payload.instructions}` : `${work.description}\n\nتعليمات الإسناد الداخلي: ${payload.instructions}`,
      source: isIntake ? "مباشر" : work.source,
      intakeOrigin,
      assignmentType: payload.type === "department" ? "إدارة" : "موظف",
      assignedDepartment: payload.department,
      assignedEmployee: payload.type === "employee" ? payload.employee : undefined,
      citizen: isIntake ? undefined : work.citizen,
      externalEntity: isIntake ? undefined : work.externalEntity,
      attachment: isIntake ? undefined : work.attachment,
      updates: [{date: "الآن", author: profile.name, text: `تم إسناد الطلب إلى ${assignmentLabel} داخل الفرع.`, progress: work.progress, visibility: "ملاحظة داخلية"}, ...work.updates],
    } : work));
    if (item.source === "بوابة الجهات الخارجية") setExternalRequests((current) => current.map((request) => request.workId === item.id ? {...request, assignedEmployee: target, status: "تحت المراجعة"} : request));
    setAssigningWork(null);
    notify(`تم إسناد الطلب إلى ${assignmentLabel} وتسجيل الإجراء.`);
  }
  function downloadReport() { const visible = role === "branch" || role === "owner" ? works.filter((item) => item.branch === "فرع الهيئة بالمنطقة الغربية" || item.originBranch === "فرع الهيئة بالمنطقة الغربية") : role === "employee" ? works.filter((item) => item.owner === roleProfiles.employee.name) : works; const rows = visible.map((item) => `<tr><td>${item.id}</td><td>${item.title}</td><td>${item.originBranch || "مكتب وكيل الفروع"}</td><td>${item.branch}</td><td>${item.owner}</td><td>${item.status}</td><td>${item.priority}</td><td>${item.progress}%</td><td>${item.due}</td><td>${item.updates[0]?.date || ""}</td><td>${item.updates[0]?.text || ""}</td></tr>`).join(""); const html = `<html dir="rtl"><meta charset="utf-8"><table><thead><tr><th>رقم الطلب</th><th>العنوان</th><th>الجهة المرسلة</th><th>الفرع المستلم</th><th>المسؤول</th><th>الحالة</th><th>الأولوية</th><th>نسبة الإنجاز</th><th>الاستحقاق</th><th>آخر تحديث</th><th>الملاحظات</th></tr></thead><tbody>${rows}</tbody></table></html>`; const blob = new Blob([html], {type: "application/vnd.ms-excel;charset=utf-8"}); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "SWA_Requests_Report.xls"; link.click(); URL.revokeObjectURL(url); notify("تم تصدير التقرير إلى Excel وتسجيل وقت الإنشاء."); }
  function emailReport() { notify("تم تجهيز التقرير وإرساله عبر البريد المؤسسي، مع تسجيل منشئ التقرير ووقت الإرسال."); }
  function navigate(target: ViewKey) { setView(target); setSidebarOpen(false); setNotificationsOpen(false); }
  function runGlobalSearch(e: React.FormEvent) { e.preventDefault(); if (!globalSearch.trim()) return; if (role === "access" || role === "external") return notify("البحث محصور داخل المساحة المصرح بها لهذا الدور."); setView("work"); notify(`تم تطبيق البحث عن «${globalSearch}» ضمن نطاقك.`); }
  const allowedViews: Record<RoleKey, ViewKey[]> = {
    center: ["home", "workspace", "team", "intake", "work", "transactions", "oversight", "sla", "analytics"],
    owner: ["home", "work", "transactions", "oversight", "sla", "analytics"],
    branch: ["workspace", "team", "intake", "work", "transactions", "analytics"],
    employee: ["workspace"],
    executive: ["home", "work", "transactions", "oversight", "sla", "analytics"],
    access: ["access"],
    external: ["external"],
  };
  const visibleNav = navItems.filter((item) => allowedViews[role].includes(item.key));
  const scopedWorks = role === "branch" ? works.filter((w) => w.branch === "فرع الهيئة بالمنطقة الغربية" || w.originBranch === "فرع الهيئة بالمنطقة الغربية") : role === "owner" ? works.filter((w) => (w.branch === "فرع الهيئة بالمنطقة الغربية" || w.originBranch === "فرع الهيئة بالمنطقة الغربية") && w.source !== "بوابة الجهات الخارجية" && w.source !== "تكامل منصة الزيارات") : role === "employee" ? works.filter((w) => w.owner === roleProfiles.employee.name) : role === "center" || role === "executive" ? works.filter((w) => w.source !== "بوابة الجهات الخارجية" && w.source !== "تكامل منصة الزيارات") : [];
  return <main className={`app-shell ${role === "external" ? "external-role" : ""}`} dir="rtl">{role !== "external" && <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}><div className="brand"><img src="https://www.swa.gov.sa/assets/images/logos/swa-logo-dark.svg" alt="الهيئة السعودية للمياه"/><div><strong>منصة الأعمال</strong><span>الهيئة السعودية للمياه</span></div></div><nav aria-label="التنقل الرئيسي">{role !== "access" && <span className="nav-label">إدارة الأعمال</span>}{visibleNav.filter((i) => ["home","workspace","team","intake","work","transactions"].includes(i.key)).map((item) => <button key={item.key} className={view === item.key ? "active" : ""} onClick={() => navigate(item.key)}><Icon name={item.icon}/><span>{item.label}</span>{item.key === "intake" && <b>{scopedWorks.filter((w) => w.status === "جديد" || w.status === "بانتظار إفادة").length}</b>}</button>)}{role !== "access" && visibleNav.some((i) => ["oversight","sla","analytics"].includes(i.key)) && <span className="nav-label second">المتابعة والتحليل</span>}{visibleNav.filter((i) => ["oversight","sla","analytics","access"].includes(i.key)).map((item) => <button key={item.key} className={view === item.key ? "active" : ""} onClick={() => navigate(item.key)}><Icon name={item.icon}/><span>{item.label}</span></button>)}</nav><div className="sidebar-footer"><div className="help-card"><span><Icon name="shield"/></span><div><strong>بيئة داخلية آمنة</strong><small>جميع الإجراءات مسجلة ومدققة</small></div></div><small>نسخة المتطلبات المعتمدة 2.0 · بيانات تجريبية</small></div></aside>}<section className="app-content"><header className="topbar">{role !== "external" && <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="فتح القائمة"><span/><span/><span/></button>}<form className="global-search" onSubmit={runGlobalSearch}><Icon name="search" size={19}/><input value={globalSearch} onChange={(e) => setGlobalSearch(e.target.value)} placeholder={role === "external" ? "بحث في طلباتي..." : "بحث في الطلبات ومعاملات تراسل..."} aria-label="البحث الشامل"/><button type="submit">بحث</button></form><div className="top-actions"><div className="notification-wrap"><button className="icon-button notification" onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="الإشعارات"><Icon name="bell"/><span/></button>{notificationsOpen && <div className="notifications-panel"><header><strong>الإشعارات</strong><button onClick={() => setNotificationsOpen(false)}>إغلاق</button></header><button onClick={() => {if (role === "external") navigate("external"); else openSelected(scopedWorks[0] || works[0]);setNotificationsOpen(false)}}><i className="blue-dot"/><div><strong>{role === "external" ? "يوجد تحديث على أحد طلبات الجهة" : "يوجد عمل يحتاج متابعة"}</strong><span>ضمن نطاقك المصرح به · الآن</span></div></button><button onClick={() => navigate(role === "employee" ? "workspace" : role === "external" ? "external" : "analytics")}><i className="amber-dot"/><div><strong>{role === "external" ? "طلب زيارة يتطلب استكمالًا" : "حان موعد التحديث اليومي"}</strong><span>{role === "external" ? "تابع الحالة من صفحة طلباتي" : "تنعكس المدخلات على تقرير الأسبوع"}</span></div></button></div>}</div><div className="divider"/><div className="profile-wrap"><button className="profile" onClick={() => setRoleMenu(!roleMenu)}><span className="avatar">{profile.initials}</span><div><strong>{profile.name}</strong><small>{profile.role}</small></div><Icon name="chevron" size={15}/></button>{roleMenu && <div className="role-menu"><strong>عرض المنصة بحسب الدور</strong>{roleOrder.map((key) => <button key={key} className={role === key ? "active" : ""} onClick={() => {setRole(key);setRoleMenu(false);navigate(key === "access" ? "access" : key === "external" ? "external" : (key === "executive" || key === "owner") ? "home" : "workspace"); notify(`تم الانتقال إلى تجربة ${roleProfiles[key].role}.`)}}><span>{roleProfiles[key].initials}</span><div><b>{roleProfiles[key].role}</b><small>{roleProfiles[key].scope}</small></div>{role === key && <Icon name="check" size={16}/>}</button>)}</div>}</div></div></header><div className="page"><div className="government-strip"><span>{role === "external" ? "بوابة خارجية آمنة" : "منصة داخلية"}</span><p>{profile.scope}</p><div><i className="live-dot"/> آخر تحديث: الآن</div></div><header className="page-header"><div><div className="breadcrumb"><span>الرئيسية</span><Icon name="chevron" size={13}/><b>{header.title}</b></div><h1>{header.title}</h1><p>{header.subtitle}</p></div><div className="page-actions">{view === "home" && <button className="secondary-button" onClick={downloadReport}><Icon name="download" size={17}/> تصدير لوحة الأسبوع</button>}{view === "access" && role === "access" && <button className="secondary-button" onClick={() => setAddUserOpen(true)}><Icon name="plus" size={17}/> إضافة مستخدم</button>}{canCreate && <button className="primary-button" onClick={() => openCreate("request", view === "transactions")}><Icon name="plus" size={18}/> {view === "transactions" ? "تسجيل معاملة تراسل" : "طلب جديد"}</button>}</div></header>{view !== "external" && <RoleSummary role={role}/>} {view === "home" ? <HomeDashboard role={role} onNavigate={navigate} onOpenWork={openSelected}/> : view === "workspace" ? (role === "employee" ? <EmployeeWorkspace items={scopedWorks} onOpen={openSelected}/> : <WorkTable items={scopedWorks} mode="workspace" role={role} onOpen={openSelected}/>) : view === "team" ? <><div className="subnav-cards">{(role === "branch" ? branchRows.filter((branch) => branch.name === "فرع الهيئة بالمنطقة الغربية") : branchRows).map((b) => <article key={b.name}><Icon name="users"/><div><strong>{b.progress + b.delayed}</strong><span>{b.name}</span></div></article>)}</div><WorkTable items={scopedWorks} role={role} onOpen={openSelected}/></> : view === "intake" ? (role === "branch" ? <CoordinatorInbox items={scopedWorks} onOpen={openSelected} onAssign={setAssigningWork}/> : <WorkTable items={scopedWorks} mode="intake" role={role} onOpen={openSelected}/>) : view === "work" ? <RequestsView items={scopedWorks} role={role} onOpen={openSelected}/> : view === "transactions" ? <TransactionsView items={scopedWorks} role={role} onOpen={openSelected}/> : view === "services" ? <ServicesView onCreate={(kind, tarasul) => role === "center" ? openCreate("task", tarasul) : role === "branch" ? openCreate("request", tarasul) : notify("هذا الدور للعرض أو التنفيذ فقط.")} onInfo={setInfoOpen}/> : view === "external" ? <ExternalPortalView requests={externalRequests} role={role} onOpen={setSelectedExternal} onCreate={(service) => {setCreateExternalService(service || "زيارة فرع");setCreateExternalOpen(true)}}/> : view === "oversight" ? <OversightView role={role} onOpen={openSelected}/> : view === "sla" ? <SlaView/> : view === "analytics" ? <AnalyticsView items={scopedWorks} onReport={setReportOpen} onDownload={downloadReport}/> : <AccessMatrixView users={platformUsers} onAdd={() => setAddUserOpen(true)} onToggle={(employee) => {setPlatformUsers((current) => current.map((u) => u.employee === employee ? {...u, state: u.state === "نشط" ? "غير نشط" : "نشط"} : u));notify("تم تحديث حالة المستخدم وتسجيل الإجراء.")}}/>}</div></section>{createOpen && <CreateWorkModal kind={createKind} creatorRole={role} startTarasul={startTarasul} onClose={() => setCreateOpen(false)} onSubmit={createWork}/>}{selectedExternal && <ExternalRequestModal request={selectedExternal} role={role} onClose={() => setSelectedExternal(null)} onRespond={() => undefined} onReview={() => undefined}/>} {createExternalOpen && <CreateExternalRequestModal initialService={createExternalService} onClose={() => setCreateExternalOpen(false)} onCreate={(request) => {setExternalRequests((current) => [request, ...current]);setWorks((current) => [{id: request.workId, title: request.title, type: "طلب", branch: request.branch || "غير محدد", owner: "صندوق طلبات الفرع", status: "جديد", priority: request.priority, due: request.due, description: `${request.requirement}${request.expected ? `\n\nالنتيجة المطلوبة: ${request.expected}` : ""}`, progress: 0, source: "بوابة الجهات الخارجية", externalEntity: request.entity, attachment: request.attachment, updates: [{date: "الآن", author: "بوابة الجهات الخارجية", text: `تم توجيه الطلب إلى ${request.assignedCoordinator || "موظف الإدارة التنفيذية للفرع المختص"}.`, progress: 0}]}, ...current]);setCreateExternalOpen(false);notify(`تم استلام الطلب بنجاح. رقم الطلب: ${request.id}`);}}/>}{assigningWork && <AssignmentModal item={assigningWork} onClose={() => setAssigningWork(null)} onAssign={(payload) => assignWork(assigningWork, payload)}/>} {selected && <WorkDetail item={selected} role={role} onClose={() => setSelected(null)} onUpdate={updateWork} onStatus={changeStatus} onStart={startWork} onAssign={openAssignment} onAction={actionWork}/>} {addUserOpen && <AddUserModal onClose={() => setAddUserOpen(false)} onAdd={(user) => {setPlatformUsers((current) => [user, ...current]);setAddUserOpen(false);notify("تمت إضافة المستخدم وتفعيل وصوله.")}}/>}{reportOpen && <ReportModal type={reportOpen} items={scopedWorks} onClose={() => setReportOpen(null)} onDownload={downloadReport} onEmail={emailReport}/>} {infoOpen && <InfoModal title={infoOpen} onClose={() => setInfoOpen(null)}/>} {toast && <div className="toast"><Icon name="check" size={18}/>{toast}</div>} {role !== "external" && sidebarOpen && <button className="mobile-overlay" onClick={() => setSidebarOpen(false)} aria-label="إغلاق القائمة"/>}</main>;
}
