import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  BriefcaseBusiness,
  Calculator,
  CheckCircle2,
  ClipboardList,
  FileText,
  FileUser,
  LockKeyhole,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
  Settings2,
  LayoutTemplate,
  FileEdit,
  BookOpen,
  X,
  Download,
  Undo2,
  Redo2,
  Eye,
  ZoomIn,
  ZoomOut,
  Phone,
  Mail,
  Image,
  Wand2,
  TriangleAlert,
} from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const roleConfig = {
  JOB_SEEKER: { label: 'Nguoi tim viec', icon: FileUser },
  EMPLOYER: { label: 'Nha tuyen dung', icon: BriefcaseBusiness },
  ADMIN: { label: 'Admin', icon: ShieldCheck },
};

const DEFAULT_CV_FORM = {
  title: 'CV Cá Nhân',
  desiredPosition: 'Vị trí ứng tuyển',
  experienceLevel: 'Có kinh nghiệm',
  summary: 'Mục tiêu nghề nghiệp ngắn gọn, phù hợp với vị trí ứng tuyển.',
  skills: 'Kỹ năng A, Kỹ năng B, Kỹ năng C',
  education: 'Trường Đại học X - Chuyên ngành Y',
  experience: 'Công ty X - Vị trí Y - Mô tả ngắn gọn kinh nghiệm làm việc.',
  certifications: 'Chứng chỉ A; Chứng chỉ B',
  projects: 'Dự án X - Vai trò Y',
  languages: 'Ngoại ngữ A',
  hobbies: 'Sở thích A, Sở thích B',
  profilePhoto: '',
  template: 'classic',
  designSettings: { font: 'Times New Roman', fontSize: 2, lineHeight: 1.5, themeColor: '#000000', hiddenSections: [] },
};

const TEMPLATE_PREVIEW_CV_FORM = {
  ...DEFAULT_CV_FORM,
  title: 'CV Nguyễn Văn A',
  desiredPosition: 'Vị trí ứng tuyển',
  summary: 'Mục tiêu nghề nghiệp ngắn gọn, dễ đọc và phù hợp với vị trí ứng tuyển.',
  skills: '<strong>Kỹ năng:</strong> Kỹ năng A, Kỹ năng B, Kỹ năng C',
  education: 'Trường Đại học X - Chuyên ngành Y',
  experience: 'Công ty X - Vị trí Y - Mô tả ngắn gọn kinh nghiệm.',
  certifications: 'Chứng chỉ A; Chứng chỉ B',
};

const CV_TEMPLATES = [
  { id: 'classic', name: 'Tiêu chuẩn', description: 'Bố cục ATS sạch, dễ đọc, hợp hồ sơ ứng tuyển đại trà.', tags: ['ATS', 'Đơn giản'], colors: ['#0f172a', '#334155', '#1d4ed8', '#7f1d1d'], isNew: false, hasPhoto: false },
  { id: 'modern', name: 'Hiện đại', description: 'Header mạnh, có ảnh đại diện, hợp frontend, product, business.', tags: ['ATS', 'Hiện đại', 'Chuyên nghiệp'], colors: ['#0f766e', '#1d4ed8', '#0f172a', '#7c3aed'], isNew: true, hasPhoto: true },
  { id: 'creative', name: 'Sáng tạo', description: 'Chia mảng mềm, phù hợp designer, marketing, content.', tags: ['Ấn tượng', 'Hiện đại', 'Chuyên nghiệp'], colors: ['#db2777', '#7c3aed', '#0f766e', '#ea580c'], isNew: false, hasPhoto: false },
  { id: 'tech', name: 'Tech Stack', description: 'Phong cách kỹ thuật, nhấn mạnh năng lực backend và hệ thống.', tags: ['ATS', 'Chuyên nghiệp'], colors: ['#10b981', '#3b82f6', '#ef4444', '#111827'], isNew: false, hasPhoto: false },
  { id: 'minimal', name: 'Thanh lịch', description: 'Tối giản cao cấp, hợp hồ sơ ít kinh nghiệm nhưng cần gọn gàng.', tags: ['Đơn giản', 'Hiện đại'], colors: ['#111827', '#0f766e', '#2563eb', '#ca8a04'], isNew: false, hasPhoto: false },
  { id: 'executive', name: 'Executive', description: 'Mẫu quản trị với ảnh, hợp senior, lead, quản lý nhóm.', tags: ['Chuyên nghiệp', 'Lãnh đạo', 'Ấn tượng'], colors: ['#1d4ed8', '#0f766e', '#b45309'], isNew: false, hasPhoto: true },
  { id: 'harvard', name: 'Harvard', description: 'Truyền thống, học thuật, CV research hoặc internship chuẩn chỉnh.', tags: ['ATS', 'Harvard', 'Truyền thống'], colors: ['#111827', '#475569'], isNew: true, hasPhoto: false },
  { id: 'startup', name: 'Startup', description: 'Năng động, nhiều điểm nhấn thị giác, hợp startup và growth team.', tags: ['Năng động', 'Hiện đại'], colors: ['#f43f5e', '#8b5cf6', '#0ea5e9'], isNew: true, hasPhoto: true },
  { id: 'designer', name: 'Portfolio', description: 'Có ảnh, nhấn mạnh cá tính thương hiệu cá nhân.', tags: ['Độc đáo', 'Ấn tượng'], colors: ['#ec4899', '#f59e0b', '#14b8a6'], isNew: true, hasPhoto: true },
  { id: 'manager', name: 'Manager', description: 'Cấu trúc 2 cột, có ảnh, hợp PM, BA, manager.', tags: ['Chuyên nghiệp', 'Lãnh đạo'], colors: ['#1e3a8a', '#0f766e', '#b45309'], isNew: true, hasPhoto: true },
];

const INDUSTRY_SUGGESTIONS = [
  'Frontend',
  'Backend',
  'Fullstack',
  'Mobile',
  'DevOps',
  'QA',
  'Tester',
  'UI/UX',
  'Design',
  'Product',
  'Project Manager',
  'Business Analyst',
  'Data Analyst',
  'Data Engineer',
  'Data Scientist',
  'AI/ML',
  'Embedded',
  'Cyber Security',
  'Cloud',
  'Game',
  'Java',
  'React',
  'Node.js',
  'PHP',
  'Python',
  'Marketing',
  'Digital Marketing',
  'Content',
  'SEO',
  'Sales',
  'Ke toan',
  'Nhan su',
  'Van hanh',
  'Logistics',
  'Tai chinh',
  'Cham soc khach hang',
];

const SALARY_RULES = {
  baseSalary: 2340000,
  personalDeduction: 15500000,
  dependentDeduction: 6200000,
  insuranceRates: {
    social: 0.08,
    health: 0.015,
    unemployment: 0.01,
  },
  employerRates: {
    social: 0.175,
    health: 0.03,
    unemployment: 0.01,
  },
  regions: {
    I: { label: 'Vùng I', minimum: 5310000, hourly: 25500 },
    II: { label: 'Vùng II', minimum: 4730000, hourly: 22700 },
    III: { label: 'Vùng III', minimum: 4140000, hourly: 20000 },
    IV: { label: 'Vùng IV', minimum: 3700000, hourly: 17800 },
  },
  taxBrackets: [
    { limit: 10000000, rate: 0.05 },
    { limit: 30000000, rate: 0.10 },
    { limit: 60000000, rate: 0.20 },
    { limit: 100000000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 },
  ],
};

function formatVnd(value) {
  return `${Math.round(Number(value) || 0).toLocaleString('vi-VN')}đ`;
}

function formatDateTime(value) {
  if (!value) return 'Chua co du lieu';
  return new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

function parseMoney(value) {
  return Number(String(value).replace(/[^\d]/g, '')) || 0;
}

function formatMoneyInput(value) {
  const number = parseMoney(value);
  return number ? number.toLocaleString('vi-VN') : '';
}

function calculatePit(taxableIncome) {
  let remaining = Math.max(0, taxableIncome);
  let previousLimit = 0;
  let tax = 0;
  for (const bracket of SALARY_RULES.taxBrackets) {
    const amount = Math.min(remaining, bracket.limit - previousLimit);
    if (amount <= 0) break;
    tax += amount * bracket.rate;
    remaining -= amount;
    previousLimit = bracket.limit;
  }
  return tax;
}

function calculateSalaryFromGross(gross, dependents, region, insuranceMode, customInsuranceSalary) {
  const regionMinimum = SALARY_RULES.regions[region]?.minimum || SALARY_RULES.regions.I.minimum;
  const socialHealthCap = SALARY_RULES.baseSalary * 20;
  const unemploymentCap = regionMinimum * 20;
  const declaredInsuranceSalary = insuranceMode === 'custom' ? customInsuranceSalary : gross;
  
  const socialHealthSalary = Math.min(Math.max(regionMinimum, declaredInsuranceSalary), socialHealthCap);
  const unemploymentSalary = Math.min(Math.max(regionMinimum, declaredInsuranceSalary), unemploymentCap);
  
  const social = socialHealthSalary * SALARY_RULES.insuranceRates.social;
  const health = socialHealthSalary * SALARY_RULES.insuranceRates.health;
  const unemployment = unemploymentSalary * SALARY_RULES.insuranceRates.unemployment;
  const totalInsurance = social + health + unemployment;
  
  const employerSocial = socialHealthSalary * SALARY_RULES.employerRates.social;
  const employerHealth = socialHealthSalary * SALARY_RULES.employerRates.health;
  const employerUnemployment = unemploymentSalary * SALARY_RULES.employerRates.unemployment;
  const totalEmployerInsurance = employerSocial + employerHealth + employerUnemployment;
  
  const totalCompanyCost = gross + totalEmployerInsurance;

  const totalDeduction = SALARY_RULES.personalDeduction + dependents * SALARY_RULES.dependentDeduction;
  const taxableIncome = Math.max(0, gross - totalInsurance - totalDeduction);
  const pit = calculatePit(taxableIncome);
  const net = gross - totalInsurance - pit;

  return { gross, net, social, health, unemployment, totalInsurance, employerSocial, employerHealth, employerUnemployment, totalEmployerInsurance, totalCompanyCost, totalDeduction, taxableIncome, pit };
}

function calculateSalaryFromNet(targetNet, dependents, region, insuranceMode, customInsuranceSalary) {
  let low = 0;
  let high = Math.max(targetNet * 2, 50000000);
  while (calculateSalaryFromGross(high, dependents, region, insuranceMode, customInsuranceSalary).net < targetNet) {
    high *= 2;
  }
  for (let index = 0; index < 60; index += 1) {
    const mid = (low + high) / 2;
    if (calculateSalaryFromGross(mid, dependents, region, insuranceMode, customInsuranceSalary).net < targetNet) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return calculateSalaryFromGross(high, dependents, region, insuranceMode, customInsuranceSalary);
}

function buildCvForm(raw = {}) {
  return {
    ...DEFAULT_CV_FORM,
    ...raw,
    designSettings: {
      ...DEFAULT_CV_FORM.designSettings,
      ...(raw.designSettings || {}),
      hiddenSections: raw.designSettings?.hiddenSections || DEFAULT_CV_FORM.designSettings.hiddenSections,
    },
  };
}

function createAvatarDataUri(name = 'Ung Vien') {
  const initials = String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'UV';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#0f766e"/>
          <stop offset="1" stop-color="#1d4ed8"/>
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="48" fill="url(#g)"/>
      <circle cx="160" cy="122" r="56" fill="rgba(255,255,255,0.16)"/>
      <path d="M72 270c18-50 58-78 88-78s70 28 88 78" fill="rgba(255,255,255,0.18)"/>
      <text x="160" y="185" text-anchor="middle" font-size="92" font-family="Inter, Arial, sans-serif" font-weight="700" fill="#ffffff">${initials}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getCvPhoto(candidate, cvForm) {
  return cvForm.profilePhoto || candidate?.profilePhoto || createAvatarDataUri(candidate?.fullName || 'Ung Vien');
}

function getTemplatePreviewData(template, cvForm = DEFAULT_CV_FORM) {
  const previewForm = buildCvForm({
    ...TEMPLATE_PREVIEW_CV_FORM,
    template: template.id,
    profilePhoto: template.hasPhoto ? (cvForm.profilePhoto || createAvatarDataUri('Nguyen Van A')) : '',
    designSettings: {
      ...(TEMPLATE_PREVIEW_CV_FORM.designSettings || {}),
      themeColor: template.colors[0],
    },
  });

  return {
    cvForm: previewForm,
    candidate: {
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0900 000 000',
      location: 'Địa điểm X',
      profilePhoto: getCvPhoto({ fullName: 'Nguyễn Văn A' }, previewForm),
    },
    designSettings: previewForm.designSettings,
  };
}

function parseStoredCv(item) {
  if (!item) return null;
  if (!item.cvData) return item;
  try {
    return { ...JSON.parse(item.cvData), id: item.id };
  } catch (error) {
    return item;
  }
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!response.ok) {
    throw new Error(await response.text() || 'Request failed');
  }
  return response.status === 204 ? null : response.json();
}

function App() {
  const [activeTab, setActiveTab] = useState(() => window.location.hash.replace('#', '') || 'jobs');
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('jobExchangeUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cv, setCv] = useState(null);
  const [cvs, setCvs] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployer, setFilterEmployer] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: 'Thuc tap sinh React',
    companyName: 'Cong ty Co phan VietTalent',
    location: 'Ha Noi',
    salaryRange: '6 - 9 trieu VND',
    description: 'Phat trien giao dien san viec lam, lam viec voi REST API va toi uu trai nghiem ung vien.',
    requirements: 'Biet HTML, CSS, JavaScript va React co ban.',
    employerId: '',
  });
  const [applicationForm, setApplicationForm] = useState({
    candidateId: '',
    cvId: '',
    coverLetter: 'Em da tao CV tren he thong va mong muon ung tuyen vi tri nay.',
  });
  const [cvForm, setCvForm] = useState(buildCvForm());
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '123456',
    role: 'JOB_SEEKER',
    organizationName: '',
    headline: '',
  });

  const activeRole = currentUser?.role || 'JOB_SEEKER';
  const candidates = activeRole === 'JOB_SEEKER' ? [currentUser] : users.filter((user) => user.role === 'JOB_SEEKER');
  const employers = activeRole === 'EMPLOYER' ? [currentUser] : users.filter((user) => user.role === 'EMPLOYER');
  const approvedJobs = jobs.filter((job) => job.status === 'APPROVED');
  const myEmployerJobs = activeRole === 'EMPLOYER' ? jobs.filter((job) => Number(job.employerId) === Number(currentUser.id)) : [];
  const myEmployerApplications = activeRole === 'EMPLOYER'
    ? applications.filter((application) => myEmployerJobs.some((job) => job.id === application.jobId))
    : [];

  const [filterSalary, setFilterSalary] = useState('');
  const [filterExp, setFilterExp] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  const visibleJobs = useMemo(() => {
    const source = activeRole === 'JOB_SEEKER' ? approvedJobs : jobs;
    return source.filter((job) => {
      const haystack = `${job.title} ${job.companyName} ${job.location} ${job.status} ${job.requirements} ${job.salaryRange}`.toLowerCase();
      const matchQuery = haystack.includes(query.toLowerCase());
      const matchSalary = !filterSalary || job.salaryRange.includes(filterSalary);
      const matchExp = !filterExp || haystack.includes(filterExp.toLowerCase());
      const matchInd = !filterIndustry || haystack.includes(filterIndustry.toLowerCase());
      const matchLocation = !filterLocation || job.location.toLowerCase().includes(filterLocation.toLowerCase());
      const matchStatus = !filterStatus || job.status === filterStatus;
      const matchEmployer = !filterEmployer || String(job.employerId) === String(filterEmployer);
      return matchQuery && matchSalary && matchExp && matchInd && matchLocation && matchStatus && matchEmployer;
    });
  }, [activeRole, approvedJobs, jobs, query, filterStatus, filterEmployer, filterSalary, filterExp, filterIndustry, filterLocation]);
  const selectableJobs = activeRole === 'JOB_SEEKER' ? visibleJobs : jobs;
  const selectedJob = selectableJobs.find((job) => job.id === selectedJobId) || selectableJobs[0] || null;

  function request(path, options = {}) {
    return api(path, {
      ...options,
      headers: {
        ...(currentUser ? { 'X-User-Id': String(currentUser.id) } : {}),
        ...(options.headers || {}),
      },
    });
  }

  async function login(email, password) {
    const user = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('jobExchangeUser', JSON.stringify(user));
    setCurrentUser(user);
    setNotice('');
    setJobForm((current) => ({ ...current, employerId: user.role === 'EMPLOYER' ? user.id : current.employerId }));
    setApplicationForm((current) => ({ ...current, candidateId: user.role === 'JOB_SEEKER' ? user.id : current.candidateId }));
  }

  function logout() {
    localStorage.removeItem('jobExchangeUser');
    setCurrentUser(null);
    setUsers([]);
    setApplications([]);
    setNotifications([]);
    setCv(null);
    setCvs([]);
    setNotice('');
  }

  const navItems = [
    { href: '#jobs', icon: Search, label: 'Viec lam', roles: ['JOB_SEEKER', 'EMPLOYER', 'ADMIN'] },
    { href: '#cv', icon: FileText, label: 'CV cua toi', roles: ['JOB_SEEKER'] },
    { href: '#tools', icon: Calculator, label: 'Cong cu', roles: ['JOB_SEEKER', 'EMPLOYER'] },
    { href: '#applications', icon: FileUser, label: 'Ho so ung vien', roles: ['EMPLOYER', 'ADMIN'] },
    { href: '#notifications', icon: Bell, label: 'Thong bao', roles: ['JOB_SEEKER', 'EMPLOYER', 'ADMIN'] },
    { href: '#users', icon: Users, label: 'Nguoi dung', roles: ['ADMIN'] },
  ];

  async function loadData() {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userRequest = currentUser.role === 'ADMIN' ? request('/users') : Promise.resolve([currentUser]);
      const applicationRequest = currentUser.role === 'JOB_SEEKER' ? Promise.resolve([]) : request('/applications');
      const cvRequest = currentUser.role === 'JOB_SEEKER' ? request('/cvs/me').catch(() => null) : Promise.resolve(null);
      const cvListRequest = currentUser.role === 'JOB_SEEKER' ? request('/cvs/me/list').catch(() => []) : Promise.resolve([]);
      const notificationRequest = ['JOB_SEEKER', 'EMPLOYER', 'ADMIN'].includes(currentUser.role) ? request('/notifications/me') : Promise.resolve([]);
      const [userData, jobData, applicationData, statData, cvData, cvListData, notificationData] = await Promise.all([
        userRequest,
        api('/jobs'),
        applicationRequest,
        api('/dashboard/stats'),
        cvRequest,
        cvListRequest,
        notificationRequest,
      ]);
      setUsers(userData);
      
      let finalJobData = jobData;
      if (!jobData || jobData.length === 0) {
        finalJobData = [
          { id: 101, title: 'Senior Frontend Developer (React/Vue)', companyName: 'FPT Software', location: 'Ha Noi', salaryRange: '1000$ - 2000$', description: 'Xay dung giao dien nguoi dung cho cac du an lon. Lam viec voi cac chuyen gia hang dau.', requirements: '- 3 nam kinh nghiem ReactJS\n- Hieu biet UI/UX', status: 'APPROVED', employerId: 1 },
          { id: 102, title: 'Backend Engineer (Java/Spring Boot)', companyName: 'Viettel Group', location: 'Ho Chi Minh', salaryRange: 'Thoa thuan', description: 'Phat trien he thong microservices chiu tai cao.', requirements: '- 2 nam kinh nghiem Java\n- Co ban ve Kafka, Redis', status: 'APPROVED', employerId: 1 },
          { id: 103, title: 'UX/UI Designer', companyName: 'Shopee Vietnam', location: 'Da Nang', salaryRange: '15.000.000 VNĐ', description: 'Thiet ke app thuong mai dien tu.', requirements: '- Su dung thanh thao Figma', status: 'PENDING', employerId: 1 }
        ];
      }
      setJobs(finalJobData);

      setApplications(applicationData);
      setNotifications(notificationData);
      setStats(statData);
      setCv(cvData);
      setCvs(cvListData || []);
      if (cvData) {
        if (cvData.cvData) {
           try {
              const parsed = JSON.parse(cvData.cvData);
              setCvForm(buildCvForm({ ...parsed, id: cvData.id }));
           } catch(e) {
              setCvForm(buildCvForm(cvData));
           }
        } else {
           setCvForm(buildCvForm(cvData));
        }
      }
      const nextJobs = currentUser.role === 'JOB_SEEKER'
        ? finalJobData.filter((job) => job.status === 'APPROVED')
        : currentUser.role === 'EMPLOYER'
          ? finalJobData.filter((job) => Number(job.employerId) === Number(currentUser.id))
          : finalJobData;
      setSelectedJobId((current) => nextJobs.some((job) => job.id === current) ? current : nextJobs[0]?.id || null);
      setJobForm((current) => ({ ...current, employerId: currentUser.role === 'EMPLOYER' ? currentUser.id : current.employerId || userData.find((user) => user.role === 'EMPLOYER')?.id || '' }));
      setApplicationForm((current) => ({
        ...current,
        candidateId: currentUser.role === 'JOB_SEEKER' ? currentUser.id : current.candidateId || userData.find((user) => user.role === 'JOB_SEEKER')?.id || '',
        cvId: current.cvId || cvData?.id || cvListData?.[0]?.id || '',
      }));
    } catch (error) {
      setNotice(`Loi tai du lieu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const nextJobs = activeRole === 'JOB_SEEKER' ? visibleJobs : jobs;
    setSelectedJobId((current) => nextJobs.some((job) => job.id === current) ? current : nextJobs[0]?.id || null);
  }, [currentUser, activeRole, jobs, visibleJobs]);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveTab(window.location.hash.replace('#', '') || 'jobs');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  async function submitJob(event) {
    event.preventDefault();
    await runAction('Da gui tin tuyen dung cho admin duyet', () =>
      request('/jobs', { method: 'POST', body: JSON.stringify({ ...jobForm, employerId: Number(currentUser.id) }) })
    );
  }

  async function applyJob(event) {
    event.preventDefault();
    if (!cv) {
      setNotice('Ban can tao CV truoc khi ung tuyen.');
      return;
    }
    if (!applicationForm.cvId) {
      setNotice('Ban can chon CV phu hop truoc khi nop ho so.');
      return;
    }
    
    // Fallback for demo mock jobs
    if (selectedJob && selectedJob.id >= 101 && selectedJob.id <= 105) {
      if (selectedJob.status !== 'APPROVED') {
        setNotice('Thao tac that bai: Chi the ung tuyen cong viec da duyet.');
        return;
      }
      setNotice('Ho so ung tuyen da duoc gui den nha tuyen dung (Che do Demo)');
      return;
    }

    await runAction('Ho so ung tuyen da duoc gui den nha tuyen dung', () =>
      request('/applications', {
        method: 'POST',
        body: JSON.stringify({
          jobId: selectedJob.id,
          candidateId: Number(currentUser.id),
          cvId: Number(applicationForm.cvId),
          coverLetter: applicationForm.coverLetter || 'Toi mong muon duoc lam viec tai cong ty.',
        }),
      })
    );
  }

  async function saveCv(event) {
    if (event) event.preventDefault();
    const payload = { ...cvForm, cvData: JSON.stringify(cvForm) };
    await runAction('CV da duoc luu va san sang ung tuyen', () =>
      cvForm.id
        ? request(`/cvs/me/${cvForm.id}`, { method: 'PUT', body: JSON.stringify(payload) })
        : request('/cvs/me', { method: 'POST', body: JSON.stringify(payload) })
    );
  }

  async function deleteCv(cvId) {
    try {
      await request(`/cvs/me/${cvId}`, { method: 'DELETE' });
      const remainingCvs = cvs.filter((item) => Number(item.id) !== Number(cvId));
      const nextCurrentCv = remainingCvs[0] || null;

      setCvs(remainingCvs);
      setCv((current) => (Number(current?.id) === Number(cvId) ? nextCurrentCv : current));
      setApplicationForm((current) => ({
        ...current,
        cvId: Number(current.cvId) === Number(cvId) ? String(nextCurrentCv?.id || '') : current.cvId,
      }));
      if (Number(cvForm.id) === Number(cvId)) {
        setCvForm(nextCurrentCv ? buildCvForm(parseStoredCv(nextCurrentCv)) : buildCvForm());
      }
      setNotice('Da xoa CV');
      return true;
    } catch (error) {
      setNotice(`Thao tac that bai: ${error.message}`);
      return false;
    }
  }

  async function approveJob(jobId) {
    await runAction('Admin da duyet tin tuyen dung', () => request(`/jobs/${jobId}/approve`, { method: 'POST' }));
  }

  async function closeJob(jobId) {
    await runAction('Admin da dong tin tuyen dung', () => request(`/jobs/${jobId}/close`, { method: 'POST' }));
  }

  async function deleteJob(jobId) {
    await runAction('Admin da xoa tin tuyen dung', () => request(`/jobs/${jobId}`, { method: 'DELETE' }));
  }

  async function createUser(event) {
    event.preventDefault();
    await runAction('Admin da tao tai khoan nguoi dung', () => request('/users', { method: 'POST', body: JSON.stringify(userForm) }));
    setUserForm({ fullName: '', email: '', phone: '', password: '123456', role: 'JOB_SEEKER', organizationName: '', headline: '' });
  }

  async function acceptApplication(applicationId) {
    await runAction('Da chap nhan ho so va gui thong bao cho ung vien', () =>
      request(`/applications/${applicationId}/accept`, { method: 'POST' })
    );
  }

  async function rejectApplication(applicationId) {
    await runAction('Da tu choi ho so va gui thong bao cho ung vien', () =>
      request(`/applications/${applicationId}/reject`, { method: 'POST' })
    );
  }

  if (!currentUser) {
    return <LoginScreen onLogin={login} notice={notice} setNotice={setNotice} />;
  }

  async function runAction(successMessage, action) {
    try {
      await action();
      setNotice(successMessage);
      await loadData();
      return true;
    } catch (error) {
      setNotice(`Thao tac that bai: ${error.message}`);
      return false;
    }
  }

  function openNotificationTarget(notification) {
    setNotificationOpen(false);
    if (notification?.jobId) {
      const targetJob = jobs.find((job) => Number(job.id) === Number(notification.jobId));
      setSelectedJobId(notification.jobId);
      if (activeRole === 'ADMIN') {
        setQuery(targetJob?.title || '');
        setFilterStatus('');
        setFilterEmployer('');
      }
      window.location.hash = '#jobs';
      return;
    }
    window.location.hash = '#notifications';
  }

  return (
    <main className={`app-container ${currentUser.role === 'JOB_SEEKER' ? 'theme-topcv' : ''}`}>
      <header className="top-navbar">
        <div className="nav-container">
          <button type="button" className="brand brand-home" onClick={() => { window.location.hash = '#jobs'; }}>
            <BriefcaseBusiness size={28} />
            <div>
              <strong>JobExchange</strong>
              <span>{roleConfig[currentUser.role].label}</span>
            </div>
          </button>
          <nav className="main-nav">
            {navItems
              .filter((item) => item.roles.includes(currentUser.role))
              .map((item) => {
                const Icon = item.icon;
                const tabId = item.href.replace('#', '');
                return <a href={item.href} key={item.href} className={activeTab === tabId ? 'active' : ''}><Icon size={18} /> <span>{item.label}</span></a>;
              })}
          </nav>
          <div className="top-actions">
            <div className="notification-menu">
              <button
                type="button"
                className="notification-trigger"
                onClick={() => setNotificationOpen((open) => !open)}
                title="Thong bao"
              >
                <Bell size={17} />
                {notifications.length > 0 && <span className="notification-badge">{notifications.length > 9 ? '9+' : notifications.length}</span>}
              </button>
              {notificationOpen && (
                <div className="notification-dropdown">
                  <div className="notification-dropdown-head">
                    <strong>Thong bao</strong>
                    <button type="button" onClick={() => { setNotificationOpen(false); window.location.hash = '#notifications'; }}>Xem tat ca</button>
                  </div>
                  <div className="notification-dropdown-list">
                    {notifications.slice(0, 5).map((notification) => (
                      <button
                        type="button"
                        className="notification-dropdown-item"
                        key={notification.id}
                        onClick={() => openNotificationTarget(notification)}
                      >
                        <Bell size={14} />
                        <span>
                          <strong>{notification.title}</strong>
                          <small>{notification.message}</small>
                        </span>
                      </button>
                    ))}
                    {notifications.length === 0 && <p className="notification-empty">Chua co thong bao moi.</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="user-profile">
               <div className="avatar">{currentUser.fullName.charAt(0).toUpperCase()}</div>
               <div className="user-info">
                 <strong>{currentUser.fullName}</strong>
                 <span>{currentUser.email}</span>
               </div>
            </div>

            <button className="icon-button danger-btn" onClick={logout} title="Dang xuat">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <section className="workspace">
        <div className="workspace-container">

        {activeTab === 'role' && (
          <section className="role-switcher locked" id="role">
            <button className="active">
              <LockKeyhole size={18} /> Dang nhap voi quyen {roleConfig[currentUser.role].label}
            </button>
          </section>
        )}

        {activeTab === 'jobs' && activeRole !== 'JOB_SEEKER' && (
          <RoleMetrics
            role={activeRole}
            stats={stats}
            approvedJobs={approvedJobs}
            employerJobs={myEmployerJobs}
            employerApplications={myEmployerApplications}
            users={users}
            applications={applications}
            notifications={notifications}
          />
        )}

        {notice && <div className="notice">{notice}</div>}

        {activeTab === 'tools' && <ToolsView />}

        {activeRole === 'JOB_SEEKER' && (
          <JobSeekerView
            activeTab={activeTab}
            jobs={visibleJobs}
            selectedJob={selectedJob}
            setSelectedJobId={setSelectedJobId}
            query={query}
            setQuery={setQuery}
            filterSalary={filterSalary}
            setFilterSalary={setFilterSalary}
            filterExp={filterExp}
            setFilterExp={setFilterExp}
            filterIndustry={filterIndustry}
            setFilterIndustry={setFilterIndustry}
            filterLocation={filterLocation}
            setFilterLocation={setFilterLocation}
            candidates={candidates}
            applicationForm={applicationForm}
            setApplicationForm={setApplicationForm}
            cv={cv}
            cvs={cvs}
            cvForm={cvForm}
            setCvForm={setCvForm}
            saveCv={saveCv}
            deleteCv={deleteCv}
            applyJob={applyJob}
            notifications={notifications}
          />
        )}

        {activeRole === 'EMPLOYER' && (
          <EmployerView
            activeTab={activeTab}
            jobs={jobs}
            selectedJob={selectedJob}
            applications={applications}
            setSelectedJobId={setSelectedJobId}
            employers={employers}
            jobForm={jobForm}
            setJobForm={setJobForm}
            submitJob={submitJob}
            acceptApplication={acceptApplication}
            rejectApplication={rejectApplication}
            notifications={notifications}
          />
        )}

        {activeRole === 'ADMIN' && (
          <AdminView
            activeTab={activeTab}
            jobs={visibleJobs}
            allJobs={jobs}
            users={users}
            query={query}
            setQuery={setQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterEmployer={filterEmployer}
            setFilterEmployer={setFilterEmployer}
            approveJob={approveJob}
            closeJob={closeJob}
            deleteJob={deleteJob}
            userForm={userForm}
            setUserForm={setUserForm}
            createUser={createUser}
            notifications={notifications}
            applications={applications}
          />
        )}
        </div>
      </section>
    </main>
  );
}

function Pagination({ total, itemsPerPage, currentPage, onPageChange }) {
  const totalPages = Math.ceil(total / itemsPerPage);
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Truoc</button>
      <span>Trang {currentPage} / {totalPages}</span>
      <button disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Sau</button>
    </div>
  );
}

function LoginScreen({ onLogin, notice, setNotice }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('ha.tran@example.com');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const demoAccounts = [
    ['👤 Ứng viên', 'ha.tran@example.com'],
    ['🏢 Tuyển dụng', 'hr@viettalent.vn'],
    ['⚙️ Admin', 'admin@dvvl.example'],
  ];

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        if (password.length < 6) {
          setNotice('Mat khau phai co it nhat 6 ky tu.');
          return;
        }
        if (password !== confirmPassword) {
          setNotice('Mat khau xac nhan khong khop.');
          return;
        }
        // Mock registration logic
        setTimeout(() => {
           setNotice('Đăng ký thành công! Vui lòng đăng nhập.');
           setIsLogin(true);
           setConfirmPassword('');
           setPassword('');
           setSubmitting(false);
        }, 1000);
        return;
      }
    } catch (error) {
      setNotice(`${isLogin ? 'Đăng nhập' : 'Đăng ký'} thất bại: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        {/* Left Side - Banner */}
        <div className="auth-banner">
          <div className="auth-banner-content">
            <BriefcaseBusiness size={64} color="white" />
            <h2>Chào mừng đến với JobExchange</h2>
            <p>Nền tảng kết nối nhân tài và nhà tuyển dụng hàng đầu. Khám phá hàng ngàn cơ hội việc làm mới mỗi ngày.</p>
          </div>
          <div className="auth-banner-overlay"></div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <span className="auth-kicker">{isLogin ? 'Chao mung tro lai' : 'Tao tai khoan moi'}</span>
            <h3>{isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}</h3>
            <p>{isLogin ? 'Chào mừng bạn quay trở lại!' : 'Tạo tài khoản mới để bắt đầu hành trình.'}</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {!isLogin && (
              <div className="form-group">
                <label>Họ và tên</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nhap ho va ten" required />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ha.tran@example.com" required />
            </div>
            <div className="form-group">
              <label>Mật khẩu</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhap mat khau" required />
            </div>
            {!isLogin && (
              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhap lai mat khau" required />
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={submitting}>
              {submitting ? 'Đang xử lý...' : (isLogin ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>

          {notice && <div className="auth-notice">{notice}</div>}

          <div className="auth-switch">
            {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setNotice('');
                setConfirmPassword('');
              }}
            >
              {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </div>

          {isLogin && (
            <div className="auth-demo-section">
              <div className="auth-divider"><span>Hoặc đăng nhập nhanh</span></div>
              <div className="auth-demo-grid">
                {demoAccounts.map(([label, account]) => (
                  <button key={account} className="auth-demo-btn" type="button" onClick={() => { setEmail(account); setPassword('123456'); }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function RoleMetrics({ role, stats, approvedJobs, employerJobs, employerApplications, users = [], applications = [], notifications = [] }) {
  if (role === 'JOB_SEEKER') {
    return (
      <section className="stats-grid role-stats">
        <Metric icon={<BriefcaseBusiness />} label="Viec dang tuyen" value={approvedJobs.length} index={0} />
        <Metric icon={<Search />} label="Co the ung tuyen" value={approvedJobs.length} index={1} />
      </section>
    );
  }

  if (role === 'EMPLOYER') {
    return (
      <section className="stats-grid">
        <Metric icon={<BriefcaseBusiness />} label="Tin cua toi" value={employerJobs.length} index={0} />
        <Metric icon={<CheckCircle2 />} label="Da duyet" value={employerJobs.filter((job) => job.status === 'APPROVED').length} index={1} />
        <Metric icon={<Users />} label="Ho so nhan duoc" value={employerApplications.length} index={2} />
        <Metric icon={<Bell />} label="Thong bao" value={notifications.length} index={3} />
      </section>
    );
  }

  return (
    <section className="stats-grid">
      <Metric icon={<BriefcaseBusiness />} label="Tong tin" value={stats?.totalJobs ?? 0} index={0} />
      <Metric icon={<Users />} label="Nguoi dung" value={users.length} index={1} />
      <Metric icon={<ClipboardList />} label="Ung tuyen" value={applications.length || stats?.totalApplications || 0} index={2} />
      <Metric icon={<LayoutTemplate />} label="Mau CV" value={CV_TEMPLATES.length} index={3} />
      <Metric icon={<CheckCircle2 />} label="Cho duyet" value={stats?.pendingJobs ?? 0} index={4} />
      <Metric icon={<Bell />} label="Thong bao" value={notifications.length} index={5} />
    </section>
  );
}

function ToolsView() {
  const [salaryInput, setSalaryInput] = React.useState('30.000.000');
  const [dependents, setDependents] = React.useState(0);
  const [region, setRegion] = React.useState('I');
  const [insuranceMode, setInsuranceMode] = React.useState('official');
  const [customInsuranceSalary, setCustomInsuranceSalary] = React.useState('');
  const [direction, setDirection] = React.useState('grossToNet');
  const [openFaq, setOpenFaq] = React.useState('gross');

  const salaryValue = parseMoney(salaryInput);
  const customInsuranceValue = parseMoney(customInsuranceSalary);
  const result = direction === 'grossToNet'
    ? calculateSalaryFromGross(salaryValue, Number(dependents) || 0, region, insuranceMode, customInsuranceValue)
    : calculateSalaryFromNet(salaryValue, Number(dependents) || 0, region, insuranceMode, customInsuranceValue);
  const selectedRegion = SALARY_RULES.regions[region] || SALARY_RULES.regions.I;

  const handleDirectionChange = (newDir) => {
    if (newDir === direction) return;
    if (newDir === 'netToGross') {
      setSalaryInput(Math.round(result.net).toString());
    } else {
      setSalaryInput(Math.round(result.gross).toString());
    }
    setDirection(newDir);
  };

  const faqItems = [
    { id: 'gross', title: 'Lương Gross là gì?', body: 'Lương Gross là tổng thu nhập trước khi trừ bảo hiểm bắt buộc và thuế thu nhập cá nhân.' },
    { id: 'net', title: 'Lương Net là gì?', body: 'Lương Net là số tiền người lao động thực nhận sau khi đã trừ các khoản bảo hiểm và thuế TNCN.' },
    { id: 'formulaGross', title: 'Công thức tính lương Gross là gì?', body: 'Gross là mức lương thỏa thuận trước khấu trừ. Khi tính từ Net, hệ thống dò ngược mức Gross sao cho Net sau thuế gần nhất với số tiền thực nhận mong muốn.' },
    { id: 'formulaNet', title: 'Công thức tính lương Net là gì?', body: 'Net = Gross - bảo hiểm bắt buộc người lao động đóng - thuế TNCN.' },
    { id: 'deal', title: 'Nên deal lương Gross hay Net?', body: 'Gross minh bạch hơn vì thể hiện đầy đủ chi phí lương, bảo hiểm và nghĩa vụ thuế. Net dễ hiểu theo thực nhận nhưng cần làm rõ ai chịu phần thuế/bảo hiểm.' },
  ];

  return (
    <section className="tools-page" id="tools">
      <div className="salary-tool panel">
        <div className="tools-heading">
          <div>
            <h1>Công cụ tính lương Gross sang Net và ngược lại</h1>
            <p>Tính nhanh lương thực nhận, bảo hiểm bắt buộc và thuế TNCN theo quy định mới nhất.</p>
          </div>
          <Calculator size={34} />
        </div>

        <div className="salary-rule-switch">
          <span>Áp dụng quy định:</span>
          <label className="salary-pill active"><span></span>Chuẩn mới nhất (từ 07/2024)</label>
        </div>

        <div className="salary-note-list">
          <p>Áp dụng mức lương cơ sở mới nhất: <strong>{formatVnd(SALARY_RULES.baseSalary)}</strong>/tháng.</p>
          <p>Áp dụng mức giảm trừ gia cảnh: <strong>{formatVnd(SALARY_RULES.personalDeduction)}</strong>/tháng cho bản thân và <strong>{formatVnd(SALARY_RULES.dependentDeduction)}</strong>/tháng cho mỗi người phụ thuộc.</p>
          <p className="salary-warning">Biểu thuế TNCN 7 bậc: 5%, 10%, 15%, 20%, 25%, 30%, 35%.</p>
        </div>

        <div className="salary-rule-cards">
          <div><span>Lương cơ sở</span><strong>{formatVnd(SALARY_RULES.baseSalary)}</strong></div>
          <div><span>Giảm trừ bản thân chuẩn 2026</span><strong>{formatVnd(SALARY_RULES.personalDeduction)}</strong></div>
          <div><span>Giảm trừ mỗi người phụ thuộc chuẩn 2026</span><strong>{formatVnd(SALARY_RULES.dependentDeduction)}</strong></div>
        </div>

        <div className="salary-form-grid">
          <label className="salary-field">
            <span>{direction === 'grossToNet' ? 'Thu nhập Gross' : 'Thu nhập Net mong muốn'}</span>
            <div>
              <strong>₫</strong>
                <input value={salaryInput} onChange={(event) => setSalaryInput(formatMoneyInput(event.target.value))} placeholder="VD: 30.000.000" inputMode="numeric" />
              <small>VNĐ</small>
            </div>
          </label>
          <label className="salary-field">
            <span>Số người phụ thuộc</span>
            <div>
              <Users size={17} />
              <input type="number" min="0" value={dependents} onChange={(event) => setDependents(event.target.value)} />
              <small>Người</small>
            </div>
          </label>
        </div>

        <div className="salary-options">
          <div>
            <strong>Mức lương đóng bảo hiểm</strong>
            <button type="button" className={`salary-choice ${insuranceMode === 'official' ? 'active' : ''}`} onClick={() => setInsuranceMode('official')}>
              Trên lương chính thức
            </button>
            <button type="button" className={`salary-choice ${insuranceMode === 'custom' ? 'active' : ''}`} onClick={() => setInsuranceMode('custom')}>
              Khác
            </button>
          </div>
          {insuranceMode === 'custom' && (
            <label className="salary-field compact">
              <div>
                <strong>₫</strong>
                <input value={customInsuranceSalary} onChange={(event) => setCustomInsuranceSalary(formatMoneyInput(event.target.value))} placeholder="Mức đóng BH" inputMode="numeric" />
                <small>VNĐ</small>
              </div>
            </label>
          )}
        </div>

        <div className="salary-region">
          <div className="salary-region-title">
            <strong>Vùng</strong>
            <small>Chỉ dùng để xác định mức lương tối thiểu và trần BHTN, không đổi số người phụ thuộc.</small>
          </div>
          {Object.entries(SALARY_RULES.regions).map(([key, value]) => (
            <button type="button" className={`salary-region-choice ${region === key ? 'active' : ''}`} key={key} onClick={() => setRegion(key)}>
              <strong>{key}</strong>
              <span>{formatVnd(value.minimum)}/tháng</span>
              <small>{formatVnd(value.hourly)}/giờ</small>
            </button>
          ))}
        </div>

        <div className="salary-applied-rule">
          Đang áp dụng {selectedRegion.label}: lương tối thiểu {formatVnd(selectedRegion.minimum)}/tháng, trần BHTN {formatVnd(selectedRegion.minimum * 20)}. Mức đóng bảo hiểm tối thiểu bằng mức lương tối thiểu vùng.
        </div>

        <div className="salary-actions">
          <button type="button" className={direction === 'grossToNet' ? 'primary' : 'secondary-action'} onClick={() => handleDirectionChange('grossToNet')}>GROSS → NET</button>
          <button type="button" className={direction === 'netToGross' ? 'primary' : 'secondary-action'} onClick={() => handleDirectionChange('netToGross')}>NET → GROSS</button>
        </div>

        <div className="salary-result">
          <div className="salary-result-main">
            <span>{direction === 'grossToNet' ? 'Lương Net thực nhận' : 'Lương Gross cần thỏa thuận'}</span>
            <strong>{formatVnd(direction === 'grossToNet' ? result.net : result.gross)}</strong>
          </div>
          
          <div className="salary-result-breakdown">
            <h4>Chi tiết người lao động trả (Trừ vào Gross)</h4>
            <div className="salary-result-grid">
              <div><span>Gross</span><strong>{formatVnd(result.gross)}</strong></div>
              <div><span>BHXH (8%)</span><strong>{formatVnd(result.social)}</strong></div>
              <div><span>BHYT (1.5%)</span><strong>{formatVnd(result.health)}</strong></div>
              <div><span>BHTN (1%)</span><strong>{formatVnd(result.unemployment)}</strong></div>
              <div><span>Thu nhập tính thuế</span><strong>{formatVnd(result.taxableIncome)}</strong></div>
              <div><span>Thuế TNCN</span><strong>{formatVnd(result.pit)}</strong></div>
            </div>
            
            <h4 style={{ marginTop: '24px', color: 'var(--primary)', marginBottom: '12px' }}>Chi tiết công ty trả thêm (Không trừ vào Gross)</h4>
            <div className="salary-result-grid">
              <div><span>BHXH (17.5%)</span><strong>{formatVnd(result.employerSocial)}</strong></div>
              <div><span>BHYT (3%)</span><strong>{formatVnd(result.employerHealth)}</strong></div>
              <div><span>BHTN (1%)</span><strong>{formatVnd(result.employerUnemployment)}</strong></div>
              <div style={{ gridColumn: '1 / -1', background: '#e0f2fe', color: '#0369a1', fontWeight: 600, display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '6px', alignItems: 'center', marginTop: '4px' }}>
                 <span>Tổng chi phí công ty thực trả</span>
                 <strong style={{ fontSize: '18px' }}>{formatVnd(result.totalCompanyCost)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="salary-updates panel">
        <span className="salary-update-badge">Thông báo mới nhất</span>
        <h2>Cập nhật quy định đang áp dụng</h2>
        <p><strong>1. Lương cơ sở:</strong> áp dụng {formatVnd(SALARY_RULES.baseSalary)}/tháng để tính trần BHXH, BHYT.</p>
        <p><strong>2. Lương tối thiểu vùng 2026:</strong> Vùng I {formatVnd(SALARY_RULES.regions.I.minimum)}, Vùng II {formatVnd(SALARY_RULES.regions.II.minimum)}, Vùng III {formatVnd(SALARY_RULES.regions.III.minimum)}, Vùng IV {formatVnd(SALARY_RULES.regions.IV.minimum)} theo Nghị định 293/2025/NĐ-CP.</p>
        <p><strong>3. Giảm trừ gia cảnh chuẩn 2026:</strong> bản thân {formatVnd(SALARY_RULES.personalDeduction)}/tháng, mỗi người phụ thuộc {formatVnd(SALARY_RULES.dependentDeduction)}/tháng.</p>
      </div>

      <div className="salary-faq panel">
        <h2>Các câu hỏi thường gặp (FAQs)</h2>
        {faqItems.map((item) => (
          <div className="faq-item" key={item.id}>
            <button type="button" onClick={() => setOpenFaq(openFaq === item.id ? '' : item.id)}>
              <span>{item.title}</span>
              <strong>{openFaq === item.id ? '-' : '+'}</strong>
            </button>
            {openFaq === item.id && <p>{item.body}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function JobSeekerView({ activeTab, jobs, selectedJob, setSelectedJobId, query, setQuery, filterSalary, setFilterSalary, filterExp, setFilterExp, filterIndustry, setFilterIndustry, filterLocation, setFilterLocation, candidates, applicationForm, setApplicationForm, cv, cvs, cvForm, setCvForm, saveCv, deleteCv, applyJob, notifications }) {
  const [cvStep, setCvStep] = React.useState('list-cvs');
  const [cvReturnJobId, setCvReturnJobId] = React.useState(null);
  const candidate = candidates[0] ?? null;
  const returnJob = cvReturnJobId ? jobs.find((job) => job.id === cvReturnJobId) || selectedJob || null : null;
  const selectedApplyCv = cvs.find((item) => String(item.id) === String(applicationForm.cvId)) || cv || null;
  const industrySuggestions = React.useMemo(() => {
    const dynamicTerms = jobs.flatMap((job) => {
      const text = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`;
      return Array.from(text.matchAll(/\b[A-Za-z][A-Za-z0-9/+. -]{2,24}\b/g)).map((match) => match[0].trim());
    });
    return Array.from(new Set([...INDUSTRY_SUGGESTIONS, ...dynamicTerms]))
      .filter((item) => item.length >= 3)
      .sort((a, b) => a.localeCompare(b, 'vi'));
  }, [jobs]);

  function openCvFlow(step = cv ? 'fill-form' : 'select-template') {
    if (selectedJob?.id) {
      setCvReturnJobId(selectedJob.id);
    }
    setCvStep(step);
    window.location.hash = '#cv';
  }

  function editCv(targetCv) {
    if (targetCv?.cvData) {
      try {
        setCvForm(buildCvForm({ ...JSON.parse(targetCv.cvData), id: targetCv.id }));
      } catch (error) {
        setCvForm(buildCvForm(targetCv));
      }
    } else if (targetCv) {
      setCvForm(buildCvForm(targetCv));
    }
    openCvFlow('fill-form');
  }

  async function handleSaveCvAndReturn() {
    const saved = await saveCv();
    if (saved && cvReturnJobId) {
      setCvReturnJobId(null);
      setSelectedJobId(cvReturnJobId);
      window.location.hash = '#jobs';
    }
  }

  return (
    <>
      {activeTab === 'jobs' && (
        <div className="topcv-page">
          <section className="search-banner">
            <div className="banner-content">
              <h1>Tim viec lam nhanh 24h, viec lam moi nhat toan quoc.</h1>
              <p>Tiep can 30,000+ nha tuyen dung uy tin hang dau</p>
              <div className="search-bar-large">
                <Search size={20} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tim kiem theo ky nang, chuc vu, cong ty..." style={{ minWidth: 0, width: '100%' }} />
                <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>
                <MapPin size={20} />
                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: '#111827', width: '100%', maxWidth: '150px' }}>
                  <option value="">Tat ca dia diem</option>
                  <option value="Ha Noi">Ha Noi</option>
                  <option value="Ho Chi Minh">Ho Chi Minh</option>
                  <option value="Da Nang">Da Nang</option>
                </select>
                <button className="primary">Tim kiem</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                <select className="badge" value={filterSalary} onChange={(e) => setFilterSalary(e.target.value)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 'normal', cursor: 'pointer', appearance: 'none', paddingRight: '20px', outline: 'none' }}>
                  <option value="" style={{color: 'black'}}>Muc luong ▼</option>
                  <option value="1000$" style={{color: 'black'}}>1000$</option>
                  <option value="2000$" style={{color: 'black'}}>2000$</option>
                </select>
                <select className="badge" value={filterExp} onChange={(e) => setFilterExp(e.target.value)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 'normal', cursor: 'pointer', appearance: 'none', paddingRight: '20px', outline: 'none' }}>
                  <option value="" style={{color: 'black'}}>Kinh nghiem ▼</option>
                  <option value="React" style={{color: 'black'}}>React</option>
                  <option value="Java" style={{color: 'black'}}>Java</option>
                </select>
                <input
                  className="badge"
                  list="industry-suggestions"
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  placeholder="Nganh nghe"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 'normal', cursor: 'text', paddingRight: '20px', outline: 'none' }}
                />
                <datalist id="industry-suggestions">
                  {industrySuggestions.map((industry) => (
                    <option value={industry} key={industry} />
                  ))}
                </datalist>
              </div>
            </div>
          </section>

          <section className="topcv-layout" id="jobs">
            <div className="left-column">
              <JobList jobs={jobs} selectedJob={selectedJob} setSelectedJobId={setSelectedJobId} query={query} setQuery={setQuery} title="Viec lam tot nhat" hideSearch={true} />
            </div>

            <div className="right-column">
              {selectedJob ? (
                <div className="sticky-sidebar">
                  <div className="panel job-detail-card">
                    <div className="section-heading">
                      <h2>{selectedJob.title}</h2>
                    </div>
                    <p className="company-name">{selectedJob.companyName}</p>
                    <div className="job-highlights">
                      <span className="highlight-salary"><BriefcaseBusiness size={16}/> {selectedJob.salaryRange}</span>
                      <span className="highlight-location"><MapPin size={16}/> {selectedJob.location}</span>
                    </div>
                    <div className="job-description-content">
                      <h4>Mo ta cong viec:</h4>
                      <p>{selectedJob.description}</p>
                      <h4>Yeu cau ung vien:</h4>
                      <p>{selectedJob.requirements}</p>
                    </div>
                  </div>

                  <div className="panel apply-panel">
                    <div className="section-heading apply-panel-header">
                      <h2>Ung tuyen ngay</h2>
                      {cv && (
                        <button type="button" className="secondary-action" onClick={() => editCv(selectedApplyCv)}>
                          Cap nhat CV
                        </button>
                      )}
                    </div>
                    {cv ? (
                      <div className="cv-apply-picker">
                        <label>Chon CV phu hop voi viec nay</label>
                        <div className="cv-apply-select">
                          <FileText size={18} />
                          <select value={applicationForm.cvId} onChange={(event) => setApplicationForm({ ...applicationForm, cvId: event.target.value })}>
                            {cvs.map((item) => (
                              <option value={item.id} key={item.id}>{item.title} - {item.desiredPosition}</option>
                            ))}
                          </select>
                        </div>
                        <div className="cv-summary-card">
                          <FileText size={24} color="var(--primary)" />
                          <div>
                            <strong>{selectedApplyCv?.title || cv.title}</strong>
                            <span>{selectedApplyCv?.desiredPosition || cv.desiredPosition}</span>
                          </div>
                          <button type="button" className="link-action" onClick={() => editCv(selectedApplyCv)}>Xem / sửa</button>
                        </div>
                      </div>
                    ) : (
                      <div className="cv-empty-state">
                        <p className="empty-warning">Ban can tao CV truoc khi nop ho so cho tin nay.</p>
                        <button type="button" className="primary w-full" onClick={() => openCvFlow('select-template')}>
                          <FileText size={18} /> Tao CV de ung tuyen
                        </button>
                      </div>
                    )}
                    <form className="form" onSubmit={applyJob}>
                      <p className="apply-helper">
                        {cv ? 'Thu ngo ngan gon giup nha tuyen dung nam nhanh diem manh cua ban.' : 'Hoan thanh CV xong, he thong se giu nguyen tin dang xem de ban nop ho so ngay.'}
                      </p>
                      <textarea value={applicationForm.coverLetter} onChange={(event) => setApplicationForm({ ...applicationForm, coverLetter: event.target.value })} rows="3" placeholder="Viet thu ngong (Cover letter) ngan gon..." />
                      <button className="primary w-full" disabled={!cv}><Send size={18} /> Nop Ho So Ung Tuyen</button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="sticky-sidebar">
                  <div className="panel create-cv-cta">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                      <FileText size={64} color="var(--primary)" style={{ opacity: 0.8 }} />
                    </div>
                    <h3>Tao CV de nha tuyen dung chu dong san don ban</h3>
                    <p>Ho so cua ban se duoc hien thi den hang ngan nha tuyen dung uy tin.</p>
                    <button className="primary w-full" onClick={() => openCvFlow('select-template')}>Tao CV Ngay</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
      {activeTab === 'cv' && (
      <section className="cv-workspace" id="cv">
        {returnJob && (
          <div className="cv-return-banner">
            <strong>Dang tao CV cho:</strong> {returnJob.title} tai {returnJob.companyName}
          </div>
        )}
        {cvStep === 'list-cvs' && (
          <CvListScreen
            cv={cv}
            cvs={cvs}
            cvForm={cvForm}
            setCvForm={setCvForm}
            setCvStep={setCvStep}
            candidate={candidate}
            dummyCv={cvForm}
            deleteCv={deleteCv}
          />
        )}
        {cvStep === 'select-template' && (
          <CvTemplateSelector cvForm={cvForm} setCvForm={setCvForm} setCvStep={setCvStep} />
        )}
        {cvStep === 'fill-form' && (
          <CvBuilder
            cvForm={cvForm}
            setCvForm={setCvForm}
            setCvStep={setCvStep}
            candidate={candidate}
            saveCv={saveCv}
            saveCvAndReturn={returnJob ? handleSaveCvAndReturn : null}
            returnToJobLabel={returnJob ? `${returnJob.title} - ${returnJob.companyName}` : ''}
          />
        )}
      </section>
      )}
      {activeTab === 'notifications' && (
      <section className="panel" id="notifications">
        <div className="section-heading"><h2>Thong bao ung tuyen</h2><span>{notifications.length} thong bao</span></div>
        <div className="notification-list">
          {notifications.map((notification, index) => (
            <article className="notification-item" key={notification.id} style={{ animation: 'slideInRight 0.4s ease-out backwards', animationDelay: `${index * 0.05}s`, cursor: notification.jobId ? 'pointer' : 'default' }} onClick={() => { if (notification.jobId) { setSelectedJobId(notification.jobId); window.location.hash = '#jobs'; } }}>
              <Bell size={18} />
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>
            </article>
          ))}
          {notifications.length === 0 && <p className="empty">Chua co thong bao tu nha tuyen dung.</p>}
        </div>
      </section>
      )}
    </>
  );
}

function CvScaledPreview({ cvForm, candidate, designSettings, scale = 0.35, className = '' }) {
  return (
    <div className={`cv-scaled-preview ${className}`} style={{ '--preview-scale': scale }}>
      <div className="cv-scaled-preview-inner">
        <CvPreview cvForm={cvForm} candidate={candidate} designSettings={designSettings} />
      </div>
    </div>
  );
}

function CvBuilder({ cvForm, setCvForm, setCvStep, candidate, saveCv, saveCvAndReturn, returnToJobLabel }) {
  const [activeTab, setActiveTab] = useState('design');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [tipVisible, setTipVisible] = useState(true);
  const [feedback, setFeedback] = useState('');
  const paperRef = useRef(null);
  const designSettings = cvForm.designSettings || { font: 'Times New Roman', fontSize: 2, lineHeight: 1.5, themeColor: '#000000' };

  const applyCvForm = (nextForm) => {
     setHistory((items) => [...items.slice(-14), cvForm]);
     setFuture([]);
     setCvForm(nextForm);
  };

  const updateDesign = (key, val) => {
     applyCvForm({ ...cvForm, designSettings: { ...designSettings, [key]: val } });
  };

  function undoChange() {
    setHistory((items) => {
      if (!items.length) return items;
      const previous = items[items.length - 1];
      setFuture((nextItems) => [cvForm, ...nextItems].slice(0, 15));
      setCvForm(previous);
      return items.slice(0, -1);
    });
  }

  function redoChange() {
    setFuture((items) => {
      if (!items.length) return items;
      const next = items[0];
      setHistory((prevItems) => [...prevItems.slice(-14), cvForm]);
      setCvForm(next);
      return items.slice(1);
    });
  }

  function improveCvContent() {
    const role = cvForm.desiredPosition || 'vị trí ứng tuyển';
    applyCvForm({
      ...cvForm,
      summary: `Ứng viên định hướng ${role}, có tư duy chủ động, khả năng phối hợp tốt với đội nhóm và luôn tập trung tạo ra kết quả đo lường được. Mong muốn phát triển trong môi trường chuyên nghiệp, nơi có thể đóng góp vào mục tiêu tuyển dụng và kinh doanh của doanh nghiệp.`,
      skills: `<strong>Kỹ năng chuyên môn:</strong> Phân tích yêu cầu, lập kế hoạch công việc, tối ưu quy trình<br/><strong>Kỹ năng mềm:</strong> Giao tiếp, làm việc nhóm, quản lý thời gian, giải quyết vấn đề<br/><strong>Công cụ:</strong> Google Workspace, Microsoft Office, công cụ quản lý công việc`,
    });
  }

  async function handleDownloadPdf() {
    if (!paperRef.current) return;
    const filename = `${(cvForm.title || 'cv-jobexchange').toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'cv-jobexchange'}.pdf`;
    setIsExporting(true);
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      await html2pdf()
        .set({
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
          },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(paperRef.current)
        .save();
    } finally {
      setIsExporting(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      await saveCv();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveAndReturn() {
    if (!saveCvAndReturn) return;
    setIsSaving(true);
    try {
      await saveCvAndReturn();
    } finally {
      setIsSaving(false);
    }
  }
  
  return (
    <div className="cv-builder-layout">
      {/* Sidebar */}
      <div className="cv-builder-sidebar">
         <button className={`builder-tab ${activeTab === 'design' ? 'active' : ''}`} onClick={() => setActiveTab('design')}>
            <Settings2 size={18}/> Thiết kế & Font
         </button>
         <button className={`builder-tab ${activeTab === 'sections' ? 'active' : ''}`} onClick={() => setActiveTab('sections')}>
            <Plus size={18}/> Thêm mục
         </button>
         <button className={`builder-tab ${activeTab === 'layout' ? 'active' : ''}`} onClick={() => setActiveTab('layout')}><LayoutTemplate size={18}/> Bố cục</button>
         <button className="builder-tab" onClick={() => setCvStep('select-template')}><RefreshCw size={18}/> Đổi mẫu CV</button>
         <button className="builder-tab" onClick={improveCvContent}><Wand2 size={18}/> Gợi ý viết CV</button>
         <button className="builder-tab" onClick={() => setCvStep('list-cvs')}><BookOpen size={18}/> Thư viện CV</button>
      </div>

      {/* Properties Panel */}
      {activeTab === 'design' && (
        <div className="cv-builder-properties">
           <div className="props-header">
              <h3>Thiết kế & Font</h3>
              <button onClick={() => setActiveTab(null)} className="btn-icon"><X size={16}/></button>
           </div>
           <div className="props-body">
              <label>FONT CHỮ</label>
              <select className="cv-select" value={designSettings.font} onChange={(e) => updateDesign('font', e.target.value)}>
                 <option value="Times New Roman">Times New Roman</option>
                 <option value="Arial">Arial</option>
                 <option value="Roboto">Roboto</option>
                 <option value="Inter">Inter</option>
              </select>
              
              <label>CỠ CHỮ</label>
              <div className="range-container">
                 <input type="range" min="1" max="3" value={designSettings.fontSize} onChange={(e) => updateDesign('fontSize', Number(e.target.value))} />
                 <div className="range-labels"><span>Nhỏ</span><span>Trung bình</span><span>Siêu lớn</span></div>
              </div>

              <label>KHOẢNG CÁCH DÒNG</label>
              <div className="range-container">
                 <input type="range" min="1.0" max="2.0" step="0.1" value={designSettings.lineHeight} onChange={(e) => updateDesign('lineHeight', Number(e.target.value))} />
                 <div className="range-labels"><span>1.0</span><span>2.0</span></div>
              </div>

              <label>MÀU CHỦ ĐỀ</label>
              <div className="color-picker-container" style={{ border: '1px solid #d1d5db', borderRadius: '4px', overflow: 'hidden' }}>
                 <input type="color" value={designSettings.themeColor} onChange={(e) => updateDesign('themeColor', e.target.value)} style={{ width: '100%', height: '50px', border: 'none', padding: '0', cursor: 'pointer', background: 'white' }} />
                 <div className="color-hex" style={{ padding: '8px', textAlign: 'center', fontFamily: 'monospace', background: '#f9fafb', borderTop: '1px solid #d1d5db' }}>{designSettings.themeColor.toUpperCase()}</div>
              </div>

              <div className="inline-help">Anh dai dien duoc tai ngay tren man hinh chon template, dung chung cho admin va nha tuyen dung khi xem ho so.</div>
           </div>
        </div>
      )}

      {activeTab === 'layout' && (
        <div className="cv-builder-properties">
           <div className="props-header">
              <h3>Bố cục CV</h3>
              <button onClick={() => setActiveTab(null)} className="btn-icon"><X size={16}/></button>
           </div>
           <div className="props-body">
              <button type="button" className="layout-option" onClick={() => updateDesign('lineHeight', 1.2)}>
                <LayoutTemplate size={18} />
                <span><strong>Gọn trong 1 trang</strong><small>Giảm khoảng cách dòng để CV dễ scan.</small></span>
              </button>
              <button type="button" className="layout-option" onClick={() => updateDesign('lineHeight', 1.7)}>
                <LayoutTemplate size={18} />
                <span><strong>Thoáng dễ đọc</strong><small>Tăng khoảng trắng cho CV senior.</small></span>
              </button>
              <button type="button" className="layout-option" onClick={() => applyCvForm(buildCvForm({ ...cvForm, designSettings: DEFAULT_CV_FORM.designSettings }))}>
                <RefreshCw size={18} />
                <span><strong>Reset thiết kế</strong><small>Đưa font, màu và mục ẩn về mặc định.</small></span>
              </button>
           </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="cv-builder-properties">
           <div className="props-header">
              <h3>Thêm / Ẩn mục</h3>
              <button onClick={() => setActiveTab(null)} className="btn-icon"><X size={16}/></button>
           </div>
           <div className="props-body">
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Bật hoặc tắt các mục hiển thị trong CV của bạn.</p>
              {[
                { id: 'summary', label: 'Mục tiêu nghề nghiệp' },
                { id: 'experience', label: 'Kinh nghiệm làm việc' },
                { id: 'education', label: 'Học vấn' },
                { id: 'certifications', label: 'Chứng chỉ' },
                { id: 'skills', label: 'Kỹ năng' }
              ].map(sec => {
                const isVisible = !(designSettings.hiddenSections || []).includes(sec.id);
                return (
                  <div key={sec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#334155' }}>{sec.label}</span>
                    <label className="cv-toggle">
                      <input type="checkbox" checked={isVisible} onChange={(e) => {
                        const hidden = designSettings.hiddenSections || [];
                        if (e.target.checked) {
                          updateDesign('hiddenSections', hidden.filter(id => id !== sec.id));
                        } else {
                          updateDesign('hiddenSections', [...hidden, sec.id]);
                        }
                      }} />
                      <span className="cv-toggle-slider"></span>
                    </label>
                  </div>
                );
              })}
           </div>
        </div>
       )}

      {/* Main Preview Area */}
      <div className="cv-builder-preview-area">
         <div className="cv-builder-topbar">
            <div className="cv-builder-context">
              <div className="cv-doc-name-container">
                 <FileText size={18} color="#00b14f" />
                 <input className="cv-doc-name" value={cvForm.title} onChange={e => applyCvForm({...cvForm, title: e.target.value})} />
              </div>
              <p>{returnToJobLabel ? <>Luu CV xong co the quay lai nop ho so cho <strong>{returnToJobLabel}</strong>.</> : 'Hoan thien noi dung CV va luu lai de san sang ung tuyen.'}</p>
            </div>
            <div className="cv-topbar-actions">
               <button type="button" className="btn-icon" onClick={undoChange} disabled={!history.length} title="Hoan tac"><Undo2 size={16}/></button>
               <button type="button" className="btn-icon" onClick={redoChange} disabled={!future.length} title="Lam lai"><Redo2 size={16}/></button>
               <button type="button" className="btn-secondary" onClick={handleDownloadPdf} disabled={isExporting}><Eye size={16}/> {isExporting ? 'Dang tao PDF...' : 'Tai file PDF'}</button>
               {saveCvAndReturn && (
                 <button type="button" className="btn-secondary btn-accent" onClick={handleSaveAndReturn} disabled={isSaving}>
                   <Send size={16}/> {isSaving ? 'Dang luu...' : 'Luu va quay lai ung tuyen'}
                 </button>
               )}
               <button type="button" className="btn-primary" onClick={handleSave} disabled={isSaving}>
                 <Save size={16}/> {isSaving ? 'Dang luu...' : 'Luu CV'}
               </button>
            </div>
         </div>
         <div className="cv-paper-container">
            {tipVisible && <div className="cv-tip-bar">
               <span>Gợi ý: Bôi đen văn bản để chỉnh sửa trực tiếp nội dung trên CV!</span>
               <button className="btn-icon-small" onClick={() => setTipVisible(false)}><X size={14}/></button>
            </div>}
            <div className="cv-paper" ref={paperRef} style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', marginBottom: `${(zoom - 100) * 8}px` }}>
               {/* Extremely detailed minimalist CV */}
               <CvPreview cvForm={cvForm} candidate={candidate} isEditable={true} setCvForm={applyCvForm} designSettings={designSettings} />
            </div>
            
            <div className="cv-feedback-section">
               <h4>Bạn có hài lòng với trải nghiệm tạo CV trên Job Exchange không?</h4>
               <div className="feedback-emojis">
                  {['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'].map((item) => (
                  <button key={item} type="button" className={`emoji-btn ${feedback === item ? 'active' : ''}`} onClick={() => setFeedback(item)}>
                     <span className="emoji">{item === 'Rất tệ' ? '😞' : item === 'Tệ' ? '🙁' : item === 'Bình thường' ? '😐' : item === 'Tốt' ? '🙂' : '😍'}</span><span>{item}</span>
                  </button>
                  ))}
               </div>
            </div>
         </div>
         
         <div className="cv-zoom-controls">
            <button className="btn-icon" onClick={() => setZoom((value) => Math.max(80, value - 10))}><ZoomOut size={16}/></button>
            <span>{zoom}%</span>
            <button className="btn-icon" onClick={() => setZoom((value) => Math.min(130, value + 10))}><ZoomIn size={16}/></button>
         </div>
      </div>
    </div>
  );
}

function CvPreview({ cvForm, candidate, isEditable, setCvForm, designSettings }) {
  const handleEdit = (field, value) => {
    if (isEditable && setCvForm) {
      setCvForm({ ...cvForm, [field]: value });
    }
  };

  const getFontSize = () => {
    if (!designSettings) return '13px';
    if (designSettings.fontSize === 1) return '11px';
    if (designSettings.fontSize === 3) return '15px';
    return '13px';
  };

  const cvStyle = designSettings ? {
    fontFamily: designSettings.font,
    fontSize: getFontSize(),
    lineHeight: designSettings.lineHeight,
    color: designSettings.themeColor,
  } : {};

  const cssVars = designSettings ? {
    '--theme-color': designSettings.themeColor
  } : {};

  const defaultExp = `<div class="h-job">
  <div class="h-job-header"><strong>Công ty X</strong><span>Thời gian làm việc</span></div>
  <div class="h-job-role"><strong>Vị trí Y</strong></div>
  <ul class="h-list">
    <li>Mô tả ngắn gọn công việc chính.</li>
    <li>Kết quả hoặc thành tựu tiêu biểu.</li>
    <li>Kỹ năng sử dụng trong công việc.</li>
  </ul>
</div>`;

  const defaultEdu = `<div class="h-job-header"><strong>Trường Đại học X</strong><span>Thời gian học</span></div>
<div class="h-text">Chuyên ngành Y</div>`;

  const defaultCerts = `<div class="h-cert"><span>Chứng chỉ A</span><strong>Năm</strong></div>
<div class="h-cert"><span>Chứng chỉ B</span><strong>Năm</strong></div>`;

  const defaultSkills = `<strong>Kỹ năng:</strong> Kỹ năng A, Kỹ năng B, Kỹ năng C`;

  const defaultSummary = 'Mục tiêu nghề nghiệp ngắn gọn, dễ đọc và phù hợp với vị trí ứng tuyển.';

  const isHtml = (str) => /<[a-z][\s\S]*>/i.test(str);
  
  const isSectionVisible = (sec) => {
    return !(designSettings?.hiddenSections || []).includes(sec);
  };
  const photoTemplates = ['modern', 'executive', 'startup', 'designer', 'manager'];
  const showPhoto = photoTemplates.includes(cvForm.template || 'classic');
  const photoSrc = getCvPhoto(candidate, cvForm);

  return (
    <div className={`cv-document ${cvForm.template || 'classic'}`} style={{...cvStyle, ...cssVars}}>
       <div className={`h-header ${showPhoto ? 'with-photo' : ''}`}>
          {showPhoto && (
            <div className="h-photo-shell">
              <img src={photoSrc} alt={candidate?.fullName || 'Ung vien'} />
            </div>
          )}
          <div className="h-header-main">
            <h1 contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('fullName', e.target.innerText)}>
               {candidate?.fullName || 'Nguyễn Văn A'}
            </h1>
            <h2 contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('desiredPosition', e.target.innerText)}>
               {cvForm.desiredPosition || 'Vị trí ứng tuyển'}
            </h2>
            <div className="h-contact">
               <span><Phone size={12}/> <span contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('phone', e.target.innerText)}>{candidate?.phone || '0900 000 000'}</span></span>
               <span><Mail size={12}/> <span contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('email', e.target.innerText)}>{candidate?.email || 'nguyenvana@example.com'}</span></span>
               <span><MapPin size={12}/> <span contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('location', e.target.innerText)}>{candidate?.location || 'Địa điểm X'}</span></span>
            </div>
          </div>
       </div>

       <div className="h-body">
         {isSectionVisible('summary') && (
           <div className="h-section">
              <h3>OBJECTIVE</h3>
              <div className="h-divider"></div>
              <p className="h-text" contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('summary', e.target.innerHTML)} dangerouslySetInnerHTML={{ __html: cvForm.summary || defaultSummary }} />
           </div>
         )}

         {isSectionVisible('experience') && (
           <div className="h-section">
              <h3>WORK EXPERIENCE</h3>
              <div className="h-divider"></div>
              <div contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('experience', e.target.innerHTML)} dangerouslySetInnerHTML={{ __html: isHtml(cvForm.experience) ? cvForm.experience : defaultExp }} />
           </div>
         )}

         {isSectionVisible('education') && (
           <div className="h-section">
              <h3>EDUCATION</h3>
              <div className="h-divider"></div>
              <div contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('education', e.target.innerHTML)} dangerouslySetInnerHTML={{ __html: isHtml(cvForm.education) ? cvForm.education : defaultEdu }} />
           </div>
         )}

         {isSectionVisible('certifications') && (
           <div className="h-section">
              <h3>CERTIFICATES</h3>
              <div className="h-divider"></div>
              <div contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('certifications', e.target.innerHTML)} dangerouslySetInnerHTML={{ __html: isHtml(cvForm.certifications) ? cvForm.certifications : defaultCerts }} />
           </div>
         )}

         {isSectionVisible('skills') && (
           <div className="h-section">
              <h3>SKILLS</h3>
              <div className="h-divider"></div>
              <p className="h-text" contentEditable={isEditable} suppressContentEditableWarning onBlur={e => handleEdit('skills', e.target.innerHTML)} dangerouslySetInnerHTML={{ __html: isHtml(cvForm.skills) ? cvForm.skills : defaultSkills }} />
           </div>
         )}
       </div>
    </div>
  );
}

function CvListScreen({ cv, cvs = [], cvForm, setCvForm, setCvStep, candidate, dummyCv, deleteCv }) {
  const displayCvs = cvs.length ? cvs : (cv ? [cv] : []);
  const [cvToDelete, setCvToDelete] = React.useState(null);

  function parseCv(item) {
    if (!item) return buildCvForm(dummyCv);
    if (item.cvData) {
      try {
        return buildCvForm({ ...JSON.parse(item.cvData), id: item.id });
      } catch (error) {
        return buildCvForm(item);
      }
    }
    return buildCvForm(item);
  }

  function editCv(item) {
    setCvForm(parseCv(item));
    setCvStep('fill-form');
  }

  function createNewCv() {
    setCvForm(buildCvForm({ ...DEFAULT_CV_FORM, id: undefined, title: `CV ${displayCvs.length + 1}` }));
    setCvStep('select-template');
  }

  async function removeCv(event, item) {
    event.stopPropagation();
    if (!item?.id || !deleteCv) return;
    setCvToDelete(item);
  }

  async function confirmDeleteCv() {
    if (!cvToDelete?.id || !deleteCv) return;
    const targetId = cvToDelete.id;
    setCvToDelete(null);
    await deleteCv(targetId);
  }

  function closeDeleteModal() {
    setCvToDelete(null);
  }

  const deletingCvName = cvToDelete?.title || parseCv(cvToDelete || {}).desiredPosition || 'CV chua dat ten';

  return (
    <>
    <div className="cv-list-page">
      <div className="cv-list-header">
        <h2>CV đã tạo trên JobExchange</h2>
        <button className="primary" onClick={createNewCv}><Plus size={16} /> Tạo CV</button>
      </div>
      <div className="cv-list-grid">
        {displayCvs.length ? (
          displayCvs.map((item) => {
            const itemForm = parseCv(item);
            const previewData = {
              cvForm: itemForm,
              candidate: {
                ...candidate,
                profilePhoto: getCvPhoto(candidate, itemForm),
              },
              designSettings: itemForm.designSettings,
            };
            return (
              <div className="cv-list-card" key={item.id || item.title} onClick={() => editCv(item)}>
                <div className="cv-list-thumbnail-container">
                  <CvScaledPreview {...previewData} />
                  <div className="cv-list-overlay">
                    <button type="button" className="primary" onClick={(event) => { event.stopPropagation(); editCv(item); }}>Sửa CV</button>
                  </div>
                </div>
                <div className="cv-list-info">
                  <div>
                    <h4>{item.title || (itemForm.desiredPosition ? `CV ${itemForm.desiredPosition}` : 'CV Chưa đặt tên')}</h4>
                    <p>{itemForm.desiredPosition}</p>
                    <p>Cập nhật {new Date(item.updatedAt || new Date()).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <button type="button" className="cv-delete-btn" onClick={(event) => removeCv(event, item)} title="Xoa CV">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="cv-list-empty">
            <FileText size={48} color="#cbd5e1" />
            <p>Bạn chưa tạo CV nào.</p>
            <button className="primary" onClick={createNewCv}>Tạo CV đầu tiên</button>
          </div>
        )}
      </div>
    </div>
    {cvToDelete && (
      <div className="modal-overlay" onClick={closeDeleteModal}>
        <div className="modal-content confirm-delete-modal" onClick={(event) => event.stopPropagation()}>
          <button type="button" className="confirm-delete-close" onClick={closeDeleteModal} aria-label="Dong popup">
            <X size={18} />
          </button>
          <div className="confirm-delete-icon">
            <TriangleAlert size={26} />
          </div>
          <div className="confirm-delete-copy">
            <h3>Xoa CV nay?</h3>
            <p>
              CV <strong>{deletingCvName}</strong> se bi xoa khoi thu vien cua ban.
              Hanh dong nay khong the hoan tac.
            </p>
          </div>
          <div className="confirm-delete-actions">
            <button type="button" className="secondary-action" onClick={closeDeleteModal}>Huy</button>
            <button type="button" className="confirm-delete-button" onClick={confirmDeleteCv}>
              <Trash2 size={16} /> Xoa CV
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function CvTemplateSelector({ cvForm, setCvForm, setCvStep }) {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [viewingTemplate, setViewingTemplate] = useState(null);
  
  const filters = ['Tất cả', 'Đơn giản', 'Chuyên nghiệp', 'Hiện đại', 'Ấn tượng', 'Harvard', 'ATS'];

  const filteredTemplates = activeFilter === 'Tất cả'
    ? CV_TEMPLATES
    : CV_TEMPLATES.filter((template) => template.tags.includes(activeFilter) || template.name.includes(activeFilter));

  function applyTemplate(tpl) {
    const initialColor = tpl.colors[0];
    setCvForm(buildCvForm({
      ...cvForm,
      template: tpl.id,
      profilePhoto: tpl.hasPhoto ? (cvForm.profilePhoto || createAvatarDataUri('Nguyen Van A')) : cvForm.profilePhoto,
      designSettings: { ...(cvForm.designSettings || {}), themeColor: initialColor },
    }));
    setViewingTemplate(null);
    setCvStep('fill-form');
  }

  function handleTemplatePhotoUpload(event, tpl) {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCvForm(buildCvForm({
          ...cvForm,
          template: tpl.id,
          profilePhoto: reader.result,
          designSettings: { ...(cvForm.designSettings || {}), themeColor: tpl.colors[0] },
        }));
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  return (
    <div className="cv-template-page">
      <div className="cv-filter-bar">
        {filters.map((filter) => (
          <button 
            key={filter} 
            className={`cv-filter-btn ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === 'Tất cả' && <CheckCircle2 size={16} />}
            {filter !== 'Tất cả' && <FileText size={16} />}
            {filter}
          </button>
        ))}
        <select className="cv-filter-dropdown">
          <option>🇻🇳 Tiếng Việt</option>
          <option>🇬🇧 Tiếng Anh</option>
        </select>
      </div>

      <div className="cv-template-grid">
        {filteredTemplates.map((tpl) => (
          <div key={tpl.id} className={`cv-template-card ${cvForm.template === tpl.id ? 'active-card' : ''}`}>
            <div className="cv-template-image-container">
              {tpl.isNew && <span className="cv-badge-new">✱ Mới</span>}
              <CvScaledPreview {...getTemplatePreviewData(tpl, cvForm)} />
              <div className="cv-template-overlay">
                <div className="cv-template-overlay-actions">
                  <button className="cv-detail-btn" onClick={() => setViewingTemplate(tpl)}>Xem chi tiết</button>
                  {tpl.hasPhoto && (
                    <label className="cv-detail-btn cv-upload-inline" onClick={(event) => event.stopPropagation()}>
                      <Image size={16} /> Tải ảnh lên mẫu
                      <input type="file" accept="image/*" onChange={(event) => handleTemplatePhotoUpload(event, tpl)} hidden />
                    </label>
                  )}
                  <button className="cv-use-btn" onClick={() => applyTemplate(tpl)}>Dùng mẫu</button>
                </div>
              </div>
            </div>
            <div className="cv-template-info">
              <div className="cv-color-dots">
                {tpl.colors.map((color, idx) => (
                  <div key={idx} className={`cv-color-dot ${idx === 0 ? 'active' : ''}`} style={{ backgroundColor: color }}></div>
                ))}
              </div>
              <h3>{tpl.name}</h3>
              <div className="cv-template-tags">
                {tpl.tags.map(tag => (
                  <span key={tag} className="cv-tag">{tag}</span>
                ))}
              </div>
              <p className="cv-template-description">{tpl.description}</p>
            </div>
          </div>
        ))}
      </div>
      {filteredTemplates.length === 0 && <p className="empty">Khong co mau CV phu hop bo loc da chon.</p>}

      {viewingTemplate && (
        <div className="modal-overlay" onClick={() => setViewingTemplate(null)}>
          <div className="modal-content template-detail-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewingTemplate.name}</h2>
              <button onClick={() => setViewingTemplate(null)} className="danger" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}><XCircle size={20} color="var(--danger)" /></button>
            </div>
            <div className="template-detail-layout">
              <div className="template-detail-preview">
                <CvScaledPreview {...getTemplatePreviewData(viewingTemplate, cvForm)} scale={0.62} className="cv-scaled-preview-detail" />
              </div>
              <div className="template-detail-sidebar">
                <p className="template-detail-copy">{viewingTemplate.description}</p>
                <div className="template-detail-meta">
                  <div>
                    <strong>Phong cach</strong>
                    <p>{viewingTemplate.tags.join(', ')}</p>
                  </div>
                  <div>
                    <strong>Co anh dai dien</strong>
                    <p>{viewingTemplate.hasPhoto ? 'Co, hop CV can avatar hoac chan dung.' : 'Khong, uu tien ATS va bo cuc sach.'}</p>
                  </div>
                </div>
                <div className="cv-color-dots">
                  {viewingTemplate.colors.map((color, idx) => (
                    <div key={idx} className={`cv-color-dot ${idx === 0 ? 'active' : ''}`} style={{ backgroundColor: color }}></div>
                  ))}
                </div>
                {viewingTemplate.hasPhoto && (
                  <div className="template-photo-box">
                    <img src={getCvPhoto(null, cvForm)} alt="Anh dai dien trong template" />
                    <label className="btn-secondary">
                      <Image size={16} /> Tai anh len ngay
                      <input type="file" accept="image/*" onChange={(event) => handleTemplatePhotoUpload(event, viewingTemplate)} hidden />
                    </label>
                    {cvForm.profilePhoto && (
                      <button type="button" className="photo-remove-btn" onClick={() => setCvForm({ ...cvForm, profilePhoto: '' })}>Xoa anh</button>
                    )}
                  </div>
                )}
                <button className="primary w-full" onClick={() => applyTemplate(viewingTemplate)}>Dung mau nay</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateCatalogPanel({ role = 'ADMIN' }) {
  const [selectedTemplate, setSelectedTemplate] = React.useState(CV_TEMPLATES[0]);
  const photoTemplateCount = CV_TEMPLATES.filter((template) => template.hasPhoto).length;
  const atsTemplateCount = CV_TEMPLATES.filter((template) => template.tags.includes('ATS')).length;
  const newTemplateCount = CV_TEMPLATES.filter((template) => template.isNew).length;

  return (
    <section className="panel template-admin-panel" id="templates">
      <div className="section-heading">
        <h2>Quan ly mau CV</h2>
        <span>{CV_TEMPLATES.length} mau dang hoat dong</span>
      </div>
      <div className="template-admin-summary">
        <div><strong>{CV_TEMPLATES.length}</strong><span>Tong mau</span></div>
        <div><strong>{photoTemplateCount}</strong><span>Co anh dai dien</span></div>
        <div><strong>{atsTemplateCount}</strong><span>Chuan ATS</span></div>
        <div><strong>{newTemplateCount}</strong><span>Mau moi</span></div>
      </div>
      <div className="template-admin-layout">
        <div className="template-admin-list">
          {CV_TEMPLATES.map((template) => (
            <button
              type="button"
              className={`template-admin-row ${selectedTemplate?.id === template.id ? 'active' : ''}`}
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
            >
              <span className="template-admin-swatch" style={{ backgroundColor: template.colors[0] }}></span>
              <span>
                <strong>{template.name}</strong>
                <small>{template.tags.join(', ')}</small>
              </span>
              {template.isNew && <em>Moi</em>}
            </button>
          ))}
        </div>
        <div className="template-admin-detail">
          <div className="template-admin-preview">
            <CvScaledPreview {...getTemplatePreviewData(selectedTemplate)} scale={0.5} className="cv-scaled-preview-detail" />
          </div>
          <div className="template-admin-meta">
            <h3>{selectedTemplate.name}</h3>
            <p>{selectedTemplate.description}</p>
            <div className="cv-template-tags">
              {selectedTemplate.tags.map((tag) => <span className="cv-tag" key={tag}>{tag}</span>)}
            </div>
            <div className="template-detail-meta">
              <div>
                <strong>Quyen xem</strong>
                <p>{role === 'ADMIN' ? 'Admin va nha tuyen dung' : 'Nha tuyen dung'}</p>
              </div>
              <div>
                <strong>Trang thai</strong>
                <p>Dang hien thi</p>
              </div>
              <div>
                <strong>Anh dai dien</strong>
                <p>{selectedTemplate.hasPhoto ? 'Co ho tro' : 'Khong bat buoc'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function EmployerView({ activeTab, jobs, selectedJob, applications, setSelectedJobId, employers, jobForm, setJobForm, submitJob, acceptApplication, rejectApplication, notifications }) {
  const employerJobs = jobs.filter((job) => Number(job.employerId) === Number(jobForm.employerId));
  const visibleSelectedJob = employerJobs.find((job) => job.id === selectedJob?.id) || employerJobs[0] || null;
  const employerApplications = applications.filter((application) => employerJobs.some((job) => Number(job.id) === Number(application.jobId)));
  return (
    <>
      {activeTab === 'jobs' && (
      <section className="grid-2">
        <form className="panel form" id="post" onSubmit={submitJob}>
          <div className="section-heading"><h2>Dang tin tuyen dung</h2></div>
          <select value={jobForm.employerId} onChange={(event) => setJobForm({ ...jobForm, employerId: event.target.value })}>
            {employers.map((employer) => <option value={employer.id} key={employer.id}>{employer.organizationName}</option>)}
          </select>
          <input value={jobForm.title} onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })} placeholder="Ten vi tri" />
          <input value={jobForm.companyName} onChange={(event) => setJobForm({ ...jobForm, companyName: event.target.value })} placeholder="Ten cong ty" />
          <div className="inline-fields">
            <input value={jobForm.location} onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })} placeholder="Dia diem" />
            <input value={jobForm.salaryRange} onChange={(event) => setJobForm({ ...jobForm, salaryRange: event.target.value })} placeholder="Muc luong" />
          </div>
          <textarea value={jobForm.description} onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })} rows="4" />
          <textarea value={jobForm.requirements} onChange={(event) => setJobForm({ ...jobForm, requirements: event.target.value })} rows="3" />
          <button className="primary"><Plus size={17} /> Gui tin cho admin</button>
        </form>
        <div className="panel">
          <div className="section-heading"><h2>Tin cua nha tuyen dung</h2></div>
          <div className="job-list compact">
            {employerJobs.map((job, index) => (
              <button className={`job-row ${visibleSelectedJob?.id === job.id ? 'active' : ''}`} key={job.id} onClick={() => setSelectedJobId(job.id)} style={{ animation: 'slideInRight 0.4s ease-out backwards', animationDelay: `${index * 0.05}s` }}>
                <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>
                <strong>{job.title}</strong>
                <small>{job.location} · {job.salaryRange}</small>
              </button>
            ))}
            {employerJobs.length === 0 && <p className="empty">Ban chua co tin tuyen dung nao.</p>}
          </div>
        </div>
      </section>
      )}
      {activeTab === 'applications' && <ApplicationsPanel applications={employerApplications} onAccept={acceptApplication} onReject={rejectApplication} title="Ho so ung vien cua nha tuyen dung" emptyMessage="Chua co ung vien nao nop ho so vao cac tin cua ban." />}

      {activeTab === 'notifications' && (
      <section className="panel" id="notifications">
        <div className="section-heading"><h2>Thong bao he thong</h2><span>{notifications.length} thong bao</span></div>
        <div className="notification-list">
          {notifications.map((notification, index) => (
            <article className="notification-item" key={notification.id} style={{ animation: 'slideInRight 0.4s ease-out backwards', animationDelay: `${index * 0.05}s`, cursor: notification.jobId ? 'pointer' : 'default' }} onClick={() => { if (notification.jobId) { setSelectedJobId(notification.jobId); window.location.hash = '#applications'; } }}>
              <Bell size={18} />
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>
            </article>
          ))}
          {notifications.length === 0 && <p className="empty">Chua co thong bao nao.</p>}
        </div>
      </section>
      )}
    </>
  );
}

function AdminView({ activeTab, jobs, allJobs = jobs, users, query, setQuery, filterStatus, setFilterStatus, filterEmployer, setFilterEmployer, approveJob, closeJob, deleteJob, userForm, setUserForm, createUser, notifications, applications }) {
  const [currentJobPage, setCurrentJobPage] = React.useState(1);
  const [currentUserPage, setCurrentUserPage] = React.useState(1);
  const [viewingJob, setViewingJob] = React.useState(null);
  const [viewingUser, setViewingUser] = React.useState(null);
  const [userQuery, setUserQuery] = React.useState('');
  const [userRoleFilter, setUserRoleFilter] = React.useState('');
  
  const jobsPerPage = 8;
  const usersPerPage = 6;
  
  const startJobIndex = (currentJobPage - 1) * jobsPerPage;
  const paginatedJobs = jobs.slice(startJobIndex, startJobIndex + jobsPerPage);

  const filteredUsers = React.useMemo(() => {
    const normalizedQuery = userQuery.trim().toLowerCase();
    return users.filter((user) => {
      const haystack = `${user.fullName || ''} ${user.email || ''} ${user.phone || ''} ${user.organizationName || ''} ${user.headline || ''}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesRole = !userRoleFilter || user.role === userRoleFilter;
      return matchesQuery && matchesRole;
    });
  }, [users, userQuery, userRoleFilter]);
  
  const startUserIndex = (currentUserPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startUserIndex, startUserIndex + usersPerPage);

  React.useEffect(() => { setCurrentJobPage(1); }, [query, filterStatus, filterEmployer, jobs.length]);
  React.useEffect(() => { setCurrentUserPage(1); }, [users.length, userQuery, userRoleFilter]);

  const employersList = users.filter((u) => u.role === 'EMPLOYER');
  function getUserActivity(user) {
    if (user.role === 'EMPLOYER') {
      const userJobs = allJobs.filter((job) => Number(job.employerId) === Number(user.id));
      const userJobIds = new Set(userJobs.map((job) => Number(job.id)));
      const receivedApplications = applications.filter((application) => userJobIds.has(Number(application.jobId)));
      return { primary: `${userJobs.length} tin`, secondary: `${receivedApplications.length} ung tuyen` };
    }
    if (user.role === 'JOB_SEEKER') {
      const sentApplications = applications.filter((application) => Number(application.candidateId) === Number(user.id) || application.candidateEmail === user.email);
      return { primary: `${sentApplications.length} ung tuyen`, secondary: user.headline || 'Ung vien' };
    }
    return { primary: `${notifications?.length || 0} thong bao`, secondary: 'Quan tri he thong' };
  }

  return (
    <>
      {activeTab === 'jobs' && (
        <div className="panel" id="jobs">
          <div className="section-heading"><h2>Quan ly danh sach viec lam</h2></div>
          <div className="filters">
            <label className="searchbox" style={{ flex: 1 }}>
              <Search size={17} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tim theo vi tri, cong ty, trang thai" />
            </label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">Tat ca trang thai</option>
              <option value="PENDING">Cho duyet (PENDING)</option>
              <option value="APPROVED">Da duyet (APPROVED)</option>
              <option value="CLOSED">Da dong (CLOSED)</option>
            </select>
            <select value={filterEmployer} onChange={(e) => setFilterEmployer(e.target.value)}>
              <option value="">Tat ca nha tuyen dung</option>
              {employersList.map(emp => <option value={emp.id} key={emp.id}>{emp.organizationName || emp.fullName}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minHeight: '400px', overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Viec lam</th>
                  <th style={{ width: '150px' }}>Trang thai</th>
                  <th style={{ textAlign: 'right', width: '200px' }}>Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJobs.map((job, index) => (
                  <tr key={job.id} style={{ animation: 'slideUp 0.4s ease-out backwards', animationDelay: `${index * 0.05}s` }}>
                    <td>
                      <strong style={{ display: 'block', marginBottom: '4px', fontSize: '15px' }}>{job.title}</strong>
                      <small style={{ color: 'var(--text-muted)' }}>{job.companyName} · {job.location} · {job.salaryRange}</small>
                    </td>
                    <td>
                      <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>
                    </td>
                    <td>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        <button onClick={() => setViewingJob(job)}><Search size={15} /> Xem</button>
                        {job.status === 'PENDING' && <button onClick={() => approveJob(job.id)}><CheckCircle2 size={15} /> Duyet</button>}
                        {job.status !== 'CLOSED' && <button onClick={() => closeJob(job.id)}>Dong</button>}
                        <button className="danger" onClick={() => deleteJob(job.id)} title="Xoa tin"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.length === 0 && <p className="empty">Khong co viec lam nao phu hop bo loc.</p>}
          </div>
          <Pagination total={jobs.length} itemsPerPage={jobsPerPage} currentPage={currentJobPage} onPageChange={setCurrentJobPage} />
        </div>
      )}
      {activeTab === 'users' && (
        <div className="grid-2">
          <form className="panel form" id="users" onSubmit={createUser}>
            <div className="section-heading"><h2>Tao nguoi dung</h2></div>
            <input value={userForm.fullName} onChange={(event) => setUserForm({ ...userForm, fullName: event.target.value })} placeholder="Ho ten" required />
            <div className="inline-fields">
              <input type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} placeholder="Email" required />
              <input value={userForm.phone} onChange={(event) => setUserForm({ ...userForm, phone: event.target.value })} placeholder="So dien thoai" required />
            </div>
            <input type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} placeholder="Mat khau" />
            <select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}>
              <option value="JOB_SEEKER">Nguoi tim viec</option>
              <option value="EMPLOYER">Nha tuyen dung</option>
              <option value="ADMIN">Admin</option>
            </select>
            <input value={userForm.organizationName} onChange={(event) => setUserForm({ ...userForm, organizationName: event.target.value })} placeholder="To chuc/cong ty" />
            <input value={userForm.headline} onChange={(event) => setUserForm({ ...userForm, headline: event.target.value })} placeholder="Mo ta ngan" />
            <button className="primary"><Plus size={17} /> Tao tai khoan</button>
          </form>
          <section className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-heading"><h2>Danh sach nguoi dung</h2><span>{filteredUsers.length} / {users.length} tai khoan</span></div>
            <div className="filters">
              <label className="searchbox" style={{ flex: 1 }}>
                <Search size={17} />
                <input value={userQuery} onChange={(event) => setUserQuery(event.target.value)} placeholder="Tim ten, email, cong ty" />
              </label>
              <select value={userRoleFilter} onChange={(event) => setUserRoleFilter(event.target.value)}>
                <option value="">Tat ca vai tro</option>
                <option value="JOB_SEEKER">Nguoi tim viec</option>
                <option value="EMPLOYER">Nha tuyen dung</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div style={{ flex: 1, overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nguoi dung</th>
                    <th>Lien he</th>
                    <th>Vai tro</th>
                    <th>Hoat dong</th>
                    <th style={{ textAlign: 'right', width: '150px' }}>Thao tac</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => {
                    const activity = getUserActivity(user);
                    return (
                      <tr key={user.id} style={{ animation: 'slideUp 0.4s ease-out backwards', animationDelay: `${index * 0.05}s` }}>
                        <td>
                          <strong style={{ display: 'block', marginBottom: '4px', fontSize: '15px' }}>{user.fullName}</strong>
                          {user.organizationName && <small style={{ color: 'var(--text-muted)' }}>{user.organizationName}</small>}
                          {!user.organizationName && user.headline && <small style={{ color: 'var(--text-muted)' }}>{user.headline}</small>}
                        </td>
                        <td>
                          <span style={{ display: 'block', fontSize: '14px' }}>{user.email}</span>
                          <small style={{ color: 'var(--text-muted)' }}>{user.phone}</small>
                        </td>
                        <td>
                          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '6px 12px' }}>{roleConfig[user.role]?.label || user.role}</span>
                        </td>
                        <td>
                          <strong style={{ display: 'block', fontSize: '14px' }}>{activity.primary}</strong>
                          <small style={{ color: 'var(--text-muted)' }}>{activity.secondary}</small>
                        </td>
                        <td>
                          <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                            <button onClick={() => setViewingUser(user)}><Search size={15} /> Xem chi tiet</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {users.length === 0 && <p className="empty">Chua co nguoi dung nao.</p>}
              {users.length > 0 && filteredUsers.length === 0 && <p className="empty">Khong co nguoi dung phu hop bo loc.</p>}
            </div>
            <Pagination total={filteredUsers.length} itemsPerPage={usersPerPage} currentPage={currentUserPage} onPageChange={setCurrentUserPage} />
          </section>
        </div>
      )}
      {activeTab === 'applications' && (
        <ApplicationsPanel applications={applications || []} readonly title="Tat ca ho so ung tuyen" emptyMessage="Chua co ho so ung tuyen nao trong he thong." />
      )}

      {activeTab === 'notifications' && (
      <section className="panel" id="notifications">
        <div className="section-heading"><h2>Thong bao he thong</h2><span>{notifications?.length || 0} thong bao</span></div>
        <div className="notification-list">
          {(notifications || []).map((notification, index) => (
            <article className="notification-item" key={notification.id} style={{ animation: 'slideInRight 0.4s ease-out backwards', animationDelay: `${index * 0.05}s`, cursor: notification.jobId ? 'pointer' : 'default' }} onClick={() => { if (notification.jobId) { const jobTarget = jobs.find(j => j.id === notification.jobId); if(jobTarget) { setQuery(jobTarget.title); setFilterStatus(''); setFilterEmployer(''); window.location.hash = '#jobs'; } } }}>
              <Bell size={18} />
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>
            </article>
          ))}
          {(!notifications || notifications.length === 0) && <p className="empty">Chua co thong bao nao.</p>}
        </div>
      </section>
      )}

      {viewingJob && (
        <div className="modal-overlay" onClick={() => setViewingJob(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiet viec lam</h2>
              <button onClick={() => setViewingJob(null)} className="danger" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}><XCircle size={20} color="var(--danger)" /></button>
            </div>
            <div className="modal-body">
              <h3>{viewingJob.title}</h3>
              <p className="lead" style={{ marginTop: '4px', marginBottom: '16px' }}>{viewingJob.companyName} · {viewingJob.location} · {viewingJob.salaryRange}</p>
              <div>
                <h4>Mo ta cong viec</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{viewingJob.description}</p>
                <h4>Yeu cau ung vien</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{viewingJob.requirements}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingUser && (
        <div className="modal-overlay" onClick={() => setViewingUser(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiet nguoi dung</h2>
              <button onClick={() => setViewingUser(null)} className="danger" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}><XCircle size={20} color="var(--danger)" /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'var(--primary)', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold' }}>
                  {viewingUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px' }}>{viewingUser.fullName}</h3>
                  <span className="badge" style={{ marginTop: '4px', display: 'inline-block', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>{roleConfig[viewingUser.role]?.label || viewingUser.role}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email</small>
                  <strong>{viewingUser.email}</strong>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>So dien thoai</small>
                  <strong>{viewingUser.phone}</strong>
                </div>
                {viewingUser.organizationName && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>To chuc / Cong ty</small>
                    <strong>{viewingUser.organizationName}</strong>
                  </div>
                )}
                {viewingUser.headline && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Mo ta ngan</small>
                    <strong>{viewingUser.headline}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function JobList({ jobs, selectedJob, setSelectedJobId, query, setQuery, title, hideSearch }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = jobs.slice(startIndex, startIndex + itemsPerPage);

  React.useEffect(() => { setCurrentPage(1); }, [query, jobs.length]);

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="section-heading"><h2>{title}</h2><span>{jobs.length} tin</span></div>
      {!hideSearch && (
        <label className="searchbox">
          <Search size={17} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tim theo vi tri, cong ty, dia diem" />
        </label>
      )}
      <div className="job-list" style={{ flex: 1 }}>
        {paginatedJobs.map((job, index) => (
          <button className={`job-row ${selectedJob?.id === job.id ? 'active' : ''}`} key={job.id} onClick={() => setSelectedJobId(job.id)} style={{ animation: 'slideInRight 0.4s ease-out backwards', animationDelay: `${index * 0.05}s` }}>
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName)}&background=random&color=fff&size=64`} alt={job.companyName} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} />
            <div>
              <strong style={{ display: 'block', fontSize: '16px', marginBottom: '4px', textAlign: 'left' }}>{job.title}</strong>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textAlign: 'left' }}>{job.companyName}</small>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span className="badge" style={{ background: 'rgba(0, 177, 79, 0.1)', color: 'var(--primary)' }}>{job.salaryRange}</span>
                <span className="muted"><MapPin size={13} /> {job.location}</span>
              </div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>
              <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '500' }}>Ung tuyen</span>
            </div>
          </button>
        ))}
        {jobs.length === 0 && <p className="empty">Khong co du lieu phu hop.</p>}
      </div>
      <Pagination total={jobs.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}

function ApplicationsPanel({ applications, onAccept, onReject, readonly = false, title = 'Ho so ung vien', emptyMessage = 'Tin dang chon chua co ung vien.' }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [viewingApplication, setViewingApplication] = React.useState(null);
  const [applicationQuery, setApplicationQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const itemsPerPage = 6;
  const filteredApplications = React.useMemo(() => {
    const normalizedQuery = applicationQuery.trim().toLowerCase();
    return applications.filter((application) => {
      const haystack = [
        application.candidateName,
        application.candidateEmail,
        application.candidatePhone,
        application.candidateHeadline,
        application.jobTitle,
        application.coverLetter,
        application.status,
      ].join(' ').toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesStatus = !statusFilter || application.status === statusFilter;
      return matchesQuery && matchesStatus;
    }).sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
  }, [applications, applicationQuery, statusFilter]);
  const pipelineCounts = {
    total: applications.length,
    pending: applications.filter((application) => application.status === 'PENDING').length,
    accepted: applications.filter((application) => application.status === 'ACCEPTED').length,
    rejected: applications.filter((application) => application.status === 'REJECTED').length,
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApps = filteredApplications.slice(startIndex, startIndex + itemsPerPage);

  function exportApplications() {
    downloadCsv('jobexchange-applications.csv', [
      ['Ung vien', 'Email', 'So dien thoai', 'Vi tri', 'Trang thai', 'Ngay nop', 'Thu ngo'],
      ...filteredApplications.map((application) => [
        application.candidateName,
        application.candidateEmail,
        application.candidatePhone,
        application.jobTitle,
        application.status,
        formatDateTime(application.submittedAt),
        application.coverLetter,
      ]),
    ]);
  }

  React.useEffect(() => { setCurrentPage(1); }, [applications.length, applicationQuery, statusFilter]);

  return (
    <section className="panel" id="applications" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="section-heading"><h2>{title}</h2><span>{filteredApplications.length} / {applications.length} ho so</span></div>
      <div className="application-toolbar">
        <label className="searchbox">
          <Search size={17} />
          <input value={applicationQuery} onChange={(event) => setApplicationQuery(event.target.value)} placeholder="Tim ung vien, email, vi tri..." />
        </label>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="">Tat ca trang thai</option>
          <option value="PENDING">Dang cho</option>
          <option value="ACCEPTED">Da chap nhan</option>
          <option value="REJECTED">Da tu choi</option>
        </select>
        <button type="button" className="secondary-action" onClick={exportApplications} disabled={filteredApplications.length === 0}>
          <Download size={16} /> Xuat CSV
        </button>
      </div>
      <div className="application-pipeline">
        <button type="button" className={!statusFilter ? 'active' : ''} onClick={() => setStatusFilter('')}>Tat ca <strong>{pipelineCounts.total}</strong></button>
        <button type="button" className={statusFilter === 'PENDING' ? 'active' : ''} onClick={() => setStatusFilter('PENDING')}>Dang cho <strong>{pipelineCounts.pending}</strong></button>
        <button type="button" className={statusFilter === 'ACCEPTED' ? 'active' : ''} onClick={() => setStatusFilter('ACCEPTED')}>Chap nhan <strong>{pipelineCounts.accepted}</strong></button>
        <button type="button" className={statusFilter === 'REJECTED' ? 'active' : ''} onClick={() => setStatusFilter('REJECTED')}>Tu choi <strong>{pipelineCounts.rejected}</strong></button>
      </div>
      <div style={{ flex: 1, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ung vien</th>
              <th>Thong tin lien he</th>
              <th>Thu ngong / CV</th>
              <th style={{ width: '145px' }}>Ngay nop</th>
              <th style={{ width: '150px' }}>Trang thai</th>
              <th style={{ textAlign: 'right', width: '200px' }}>Thao tac</th>
            </tr>
          </thead>
          <tbody>
            {paginatedApps.map((application, index) => (
              <tr key={application.id} style={{ animation: 'slideUp 0.4s ease-out backwards', animationDelay: `${index * 0.05}s` }}>
                <td>
                  <strong style={{ display: 'block', fontSize: '15px', marginBottom: '4px' }}>{application.candidateName}</strong>
                  <small style={{ color: 'var(--text-muted)' }}>{application.candidateHeadline}</small>
                </td>
                <td>
                  <span style={{ display: 'block', fontSize: '14px' }}>{application.candidateEmail}</span>
                  <small style={{ color: 'var(--text-muted)' }}>{application.candidatePhone}</small>
                  <div className="contact-actions">
                    {application.candidateEmail && <a href={`mailto:${application.candidateEmail}`}><Mail size={13} /> Email</a>}
                    {application.candidatePhone && <a href={`tel:${application.candidatePhone}`}><Phone size={13} /> Goi</a>}
                  </div>
                </td>
                <td>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{application.coverLetter}</p>
                  <button type="button" className="link-action" onClick={() => setViewingApplication(application)}>
                    <Eye size={14} /> Xem CV ung vien
                  </button>
                </td>
                <td>
                  <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)' }}>{formatDateTime(application.submittedAt)}</span>
                </td>
                <td>
                  <span className={`badge ${application.status.toLowerCase()}`}>{application.status}</span>
                </td>
                <td>
                  {application.status !== 'ACCEPTED' && application.status !== 'REJECTED' && onAccept && onReject && !readonly && (
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => onAccept(application.id)} style={{ color: 'var(--success)' }}><CheckCircle2 size={15} /> Chap nhan</button>
                      <button className="danger" onClick={() => onReject(application.id)}><XCircle size={15} /> Tu choi</button>
                    </div>
                  )}
                  {readonly && <span className="muted">Chi xem</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && <p className="empty">{emptyMessage}</p>}
        {applications.length > 0 && filteredApplications.length === 0 && <p className="empty">Khong co ho so phu hop bo loc.</p>}
      </div>
      <Pagination total={filteredApplications.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
      {viewingApplication && (
        <ApplicationCvModal application={viewingApplication} onClose={() => setViewingApplication(null)} />
      )}
    </section>
  );
}

function ApplicationCvModal({ application, onClose }) {
  let parsedCv = null;
  if (application.cvData) {
    try {
      parsedCv = JSON.parse(application.cvData);
    } catch (error) {
      parsedCv = null;
    }
  }
  const cvForm = buildCvForm({
    ...(parsedCv || {}),
    title: parsedCv?.title || application.cvTitle || `CV ${application.candidateName}`,
    desiredPosition: parsedCv?.desiredPosition || application.desiredPosition || application.jobTitle,
    template: parsedCv?.template || application.cvTemplate || 'classic',
  });
  const candidate = {
    fullName: application.candidateName,
    email: application.candidateEmail,
    phone: application.candidatePhone,
    headline: application.candidateHeadline,
    profilePhoto: cvForm.profilePhoto,
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content application-cv-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{cvForm.title}</h2>
            <p className="lead">{application.candidateName} ung tuyen {application.jobTitle} · {formatDateTime(application.submittedAt)}</p>
          </div>
          <button onClick={onClose} className="danger" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}><XCircle size={20} color="var(--danger)" /></button>
        </div>
        <div className="application-cv-layout">
          <div className="application-cv-preview">
            <CvScaledPreview cvForm={cvForm} candidate={candidate} designSettings={cvForm.designSettings} scale={0.62} className="cv-scaled-preview-detail" />
          </div>
          <div className="application-cv-side">
            <h3>Thu ngo</h3>
            <p>{application.coverLetter}</p>
            <h3>Lien he</h3>
            <p>{application.candidateEmail}<br />{application.candidatePhone}</p>
            <div className="contact-actions">
              {application.candidateEmail && <a href={`mailto:${application.candidateEmail}`}><Mail size={13} /> Gui email</a>}
              {application.candidatePhone && <a href={`tel:${application.candidatePhone}`}><Phone size={13} /> Goi dien</a>}
            </div>
            <span className={`badge ${String(application.status).toLowerCase()}`}>{application.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, index = 0 }) {
  return (
    <article className="metric" style={{ animationDelay: `${index * 0.1}s` }}>
      <div>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
