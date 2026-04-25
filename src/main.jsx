import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Bell,
  BriefcaseBusiness,
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
} from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const roleConfig = {
  JOB_SEEKER: { label: 'Nguoi tim viec', icon: FileUser },
  EMPLOYER: { label: 'Nha tuyen dung', icon: BriefcaseBusiness },
  ADMIN: { label: 'Admin', icon: ShieldCheck },
};

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
  const [stats, setStats] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterEmployer, setFilterEmployer] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
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
    coverLetter: 'Em da tao CV tren he thong va mong muon ung tuyen vi tri nay.',
  });
  const [cvForm, setCvForm] = useState({
    title: 'CV Java Fresher',
    desiredPosition: 'Java Backend Developer',
    experienceLevel: 'Fresher',
    summary: 'Sinh vien cong nghe thong tin co nen tang Java, OOP, SQL va mong muon phat trien theo huong backend.',
    skills: 'Java, Spring Boot, MySQL, REST API, Git, HTML/CSS co ban',
    education: 'Dai hoc Cong nghe - Chuyen nganh Cong nghe phan mem',
    experience: 'Da xay dung do an quan ly viec lam voi Spring Boot va React; thuc hanh thiet ke database va REST API.',
    certifications: 'Toeic 650; Chung chi Java co ban',
    projects: 'Job Exchange Platform (React/Spring Boot)',
    languages: 'Tieng Anh (Giao tiep tot)',
    hobbies: 'Doc sach, Code',
    template: 'classic',
  });
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
  const approvedJobs = jobs.filter((job) => job.status === 'APPROVED' || job.status === 'PENDING'); // Temporarily show PENDING to show data
  const myEmployerJobs = activeRole === 'EMPLOYER' ? jobs.filter((job) => Number(job.employerId) === Number(currentUser.id)) : [];
  const myEmployerApplications = activeRole === 'EMPLOYER'
    ? applications.filter((application) => myEmployerJobs.some((job) => job.id === application.jobId))
    : [];
  const selectableJobs = activeRole === 'JOB_SEEKER' ? approvedJobs : jobs;
  const selectedJob = selectableJobs.find((job) => job.id === selectedJobId) || selectableJobs[0] || null;

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
    setNotice('');
  }

  const navItems = [
    { href: '#jobs', icon: Search, label: 'Viec lam', roles: ['JOB_SEEKER', 'EMPLOYER', 'ADMIN'] },
    { href: '#cv', icon: FileText, label: 'CV cua toi', roles: ['JOB_SEEKER'] },
    { href: '#notifications', icon: Bell, label: 'Thong bao', roles: ['JOB_SEEKER', 'EMPLOYER', 'ADMIN'] },
    { href: '#role', icon: LockKeyhole, label: 'Phien dang nhap', roles: ['JOB_SEEKER', 'EMPLOYER', 'ADMIN'] },
    { href: '#applications', icon: FileUser, label: 'Ho so ung vien', roles: ['EMPLOYER'] },
    { href: '#users', icon: Users, label: 'Nguoi dung', roles: ['ADMIN'] },
  ];

  async function loadData() {
    if (!currentUser) return;
    setLoading(true);
    try {
      const userRequest = currentUser.role === 'ADMIN' ? request('/users') : Promise.resolve([currentUser]);
      const applicationRequest = currentUser.role === 'JOB_SEEKER' ? Promise.resolve([]) : request('/applications');
      const cvRequest = currentUser.role === 'JOB_SEEKER' ? request('/cvs/me').catch(() => null) : Promise.resolve(null);
      const notificationRequest = ['JOB_SEEKER', 'EMPLOYER', 'ADMIN'].includes(currentUser.role) ? request('/notifications/me') : Promise.resolve([]);
      const [userData, jobData, applicationData, statData, cvData, notificationData] = await Promise.all([
        userRequest,
        api('/jobs'),
        applicationRequest,
        api('/dashboard/stats'),
        cvRequest,
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
      if (cvData) {
        setCvForm({
          title: cvData.title,
          desiredPosition: cvData.desiredPosition,
          experienceLevel: cvData.experienceLevel,
          summary: cvData.summary,
          skills: cvData.skills,
          education: cvData.education,
          experience: cvData.experience,
          certifications: cvData.certifications,
          projects: cvData.projects || '',
          languages: cvData.languages || '',
          hobbies: cvData.hobbies || '',
          template: cvData.template || 'classic',
        });
      }
      const nextJobs = currentUser.role === 'JOB_SEEKER'
        ? jobData.filter((job) => job.status === 'APPROVED')
        : currentUser.role === 'EMPLOYER'
          ? jobData.filter((job) => Number(job.employerId) === Number(currentUser.id))
          : jobData;
      setSelectedJobId((current) => nextJobs.some((job) => job.id === current) ? current : nextJobs[0]?.id || null);
      setJobForm((current) => ({ ...current, employerId: currentUser.role === 'EMPLOYER' ? currentUser.id : current.employerId || userData.find((user) => user.role === 'EMPLOYER')?.id || '' }));
      setApplicationForm((current) => ({ ...current, candidateId: currentUser.role === 'JOB_SEEKER' ? currentUser.id : current.candidateId || userData.find((user) => user.role === 'JOB_SEEKER')?.id || '' }));
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
          coverLetter: applicationForm.coverLetter || 'Toi mong muon duoc lam viec tai cong ty.',
        }),
      })
    );
  }

  async function saveCv(event) {
    event.preventDefault();
    await runAction('CV da duoc luu va san sang ung tuyen', () =>
      request('/cvs/me', { method: 'PUT', body: JSON.stringify(cvForm) })
    );
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
    } catch (error) {
      setNotice(`Thao tac that bai: ${error.message}`);
    }
  }

  return (
    <main className={`app-container ${currentUser.role === 'JOB_SEEKER' ? 'theme-topcv' : ''}`}>
      <header className="top-navbar">
        <div className="nav-container">
          <div className="brand">
            <BriefcaseBusiness size={28} />
            <div>
              <strong>JobExchange</strong>
              <span>{roleConfig[currentUser.role].label}</span>
            </div>
          </div>
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
            <div className="user-profile">
               <div className="avatar">{currentUser.fullName.charAt(0).toUpperCase()}</div>
               <div className="user-info">
                 <strong>{currentUser.fullName}</strong>
                 <span>{currentUser.email}</span>
               </div>
            </div>
            <button className="icon-button" onClick={loadData} disabled={loading} title="Tai lai du lieu">
              <RefreshCw size={18} />
            </button>
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
          />
        )}

        {notice && <div className="notice">{notice}</div>}

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
            cvForm={cvForm}
            setCvForm={setCvForm}
            saveCv={saveCv}
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
            setQuery={setQuery}
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
  const [email, setEmail] = useState('ha.tran@example.com');
  const [password, setPassword] = useState('123456');
  const [submitting, setSubmitting] = useState(false);
  const demoAccounts = [
    ['Nguoi tim viec', 'ha.tran@example.com'],
    ['Nha tuyen dung', 'hr@viettalent.vn'],
    ['Admin', 'admin@dvvl.example'],
  ];

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } catch (error) {
      setNotice(`Dang nhap that bai: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand login-brand">
          <BriefcaseBusiness size={30} />
          <div>
            <strong>JobExchange</strong>
            <span>Dang nhap theo vai tro</span>
          </div>
        </div>
        <form className="form" onSubmit={submit}>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" required />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mat khau" required />
          <button className="primary" disabled={submitting}><LockKeyhole size={17} /> Dang nhap</button>
        </form>
        {notice && <div className="notice">{notice}</div>}
        <div className="demo-accounts">
          {demoAccounts.map(([label, account]) => (
            <button key={account} onClick={() => { setEmail(account); setPassword('123456'); }}>
              <span>{label}</span>
              <strong>{account}</strong>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function RoleMetrics({ role, stats, approvedJobs, employerJobs, employerApplications }) {
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
        <Metric icon={<ClipboardList />} label="Cho duyet" value={employerJobs.filter((job) => job.status === 'PENDING').length} index={2} />
        <Metric icon={<Users />} label="Ho so nhan duoc" value={employerApplications.length} index={3} />
      </section>
    );
  }

  return (
    <section className="stats-grid">
      <Metric icon={<BriefcaseBusiness />} label="Tong tin" value={stats?.totalJobs ?? 0} index={0} />
      <Metric icon={<CheckCircle2 />} label="Da duyet" value={stats?.approvedJobs ?? 0} index={1} />
      <Metric icon={<ClipboardList />} label="Cho duyet" value={stats?.pendingJobs ?? 0} index={2} />
      <Metric icon={<Users />} label="Tong ho so" value={stats?.totalApplications ?? 0} index={3} />
    </section>
  );
}

function JobSeekerView({ activeTab, jobs, selectedJob, setSelectedJobId, query, setQuery, filterSalary, setFilterSalary, filterExp, setFilterExp, filterIndustry, setFilterIndustry, filterLocation, setFilterLocation, candidates, applicationForm, setApplicationForm, cv, cvForm, setCvForm, saveCv, applyJob, notifications }) {
  const [cvStep, setCvStep] = React.useState(cv ? 'fill-form' : 'select-template');
  
  React.useEffect(() => {
    if (cv) setCvStep('fill-form');
  }, [cv]);

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
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tim kiem theo ky nang, chuc vu, cong ty..." style={{ minWidth: '250px' }} />
                <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }}></div>
                <MapPin size={20} />
                <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: '#111827', width: '150px' }}>
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
                <select className="badge" value={filterIndustry} onChange={(e) => setFilterIndustry(e.target.value)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', fontWeight: 'normal', cursor: 'pointer', appearance: 'none', paddingRight: '20px', outline: 'none' }}>
                  <option value="" style={{color: 'black'}}>Nganh nghe ▼</option>
                  <option value="Frontend" style={{color: 'black'}}>Frontend</option>
                  <option value="Backend" style={{color: 'black'}}>Backend</option>
                  <option value="Design" style={{color: 'black'}}>Design</option>
                </select>
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
                    <div className="section-heading">
                      <h2>Ung tuyen ngay</h2>
                    </div>
                    {cv ? (
                      <div className="cv-summary-card">
                        <FileText size={24} color="var(--primary)" />
                        <div>
                          <strong>{cv.title}</strong>
                          <span>{cv.desiredPosition}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="empty-warning">Ban can co CV tren he thong de ung tuyen nhanh.</p>
                    )}
                    <form className="form" onSubmit={applyJob}>
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
                    <button className="primary w-full" onClick={() => { window.location.hash = '#cv'; }}>Tao CV Ngay</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
      {activeTab === 'cv' && (
      <section className="cv-workspace" id="cv">
        {cvStep === 'select-template' ? (
          <div className="panel template-selection-step" style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="section-heading" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2>Chon Mau CV De Bat Dau</h2>
              <p className="muted" style={{ marginTop: '8px' }}>TopCV cung cap nhieu mau CV chuyen nghiep. Hay chon mot mau phu hop voi phong cach cua ban.</p>
            </div>
            <div className="template-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {[
                ['classic', 'Chuyen nghiep (Classic)', 'Phong cach tieu chuan, thanh lich. Phu hop cho hau het nganh nghe va moi nha tuyen dung.', 'linear-gradient(135deg, #ffffff, #f1f5f9)'],
                ['modern', 'Hien dai (Modern)', 'Thiet ke hai cot, lam noi bat ky nang. Danh cho IT, Design, Marketing.', 'linear-gradient(135deg, #f0fdf4, #bbf7d0)'],
                ['creative', 'Sang tao (Creative)', 'Phoi mau doc dao, gradient noi bat. The hien ca tinh rieng cua ban.', 'linear-gradient(135deg, #fdf4ff, #e879f9)'],
                ['minimal', 'Toi gian (Minimal)', 'Trang va Den, sang trong tuyet doi. Tap trung 100% vao noi dung.', 'linear-gradient(135deg, #f9fafb, #d1d5db)'],
                ['tech', 'Cong nghe (Tech)', 'Giao dien Dark Mode phong cach lap trinh vien. Hieu ung code doc dao.', 'linear-gradient(135deg, #111827, #374151)'],
                ['executive', 'Quan ly (Executive)', 'Mau xanh Navy sang de. The hien uy quyen va kinh nghiem day dan.', 'linear-gradient(135deg, #eff6ff, #93c5fd)']
              ].map(([value, label, desc, bg]) => (
                <div key={value} className="template-card" onClick={() => { setCvForm({ ...cvForm, template: value }); setCvStep('fill-form'); }} style={{ background: 'var(--bg-panel)', border: `2px solid ${cvForm.template === value ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                   <div style={{ background: bg, height: '160px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <FileText size={48} color={value === 'tech' ? '#10b981' : 'rgba(0,0,0,0.1)'} />
                   </div>
                   <h3 style={{ color: 'var(--text-main)', marginBottom: '8px', fontSize: '16px' }}>{label}</h3>
                   <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5' }}>{desc}</p>
                   <button className={cvForm.template === value ? 'primary' : ''} style={{ width: '100%', marginTop: '16px', padding: '8px' }}>{cvForm.template === value ? 'Dang chon' : 'Su dung mau nay'}</button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <form className="panel form cv-form" onSubmit={saveCv}>
              <div className="section-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2>Thong Tin CV</h2>
                <button type="button" onClick={() => setCvStep('select-template')} style={{ background: 'transparent', border: '1px dashed var(--border)', padding: '6px 12px', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer' }}>Đổi mẫu CV</button>
              </div>
              <div className="inline-fields">
                <input value={cvForm.title} onChange={(event) => setCvForm({ ...cvForm, title: event.target.value })} placeholder="Ten CV (VD: CV Front-end Developer)" required />
                <input value={cvForm.desiredPosition} onChange={(event) => setCvForm({ ...cvForm, desiredPosition: event.target.value })} placeholder="Vi tri ung tuyen" required />
              </div>
              <input value={cvForm.experienceLevel} onChange={(event) => setCvForm({ ...cvForm, experienceLevel: event.target.value })} placeholder="Cap bac hien tai (VD: Nhan vien, Truong phong...)" required />
              <textarea value={cvForm.summary} onChange={(event) => setCvForm({ ...cvForm, summary: event.target.value })} rows="4" placeholder="Muc tieu nghe nghiep / Gioi thieu ngan gon ve ban than" required />
              <textarea value={cvForm.skills} onChange={(event) => setCvForm({ ...cvForm, skills: event.target.value })} rows="3" placeholder="Ky nang chuyen mon (VD: React, Node.js, Design...)" required />
              <textarea value={cvForm.education} onChange={(event) => setCvForm({ ...cvForm, education: event.target.value })} rows="3" placeholder="Trinh do hoc van / Bang cap" required />
              <textarea value={cvForm.experience} onChange={(event) => setCvForm({ ...cvForm, experience: event.target.value })} rows="4" placeholder="Kinh nghiem lam viec (Liet ke cac du an, cong ty da lam)" required />
              <textarea value={cvForm.projects} onChange={(event) => setCvForm({ ...cvForm, projects: event.target.value })} rows="3" placeholder="Du an ca nhan / Du an noi bat" />
              <div className="inline-fields">
                <input value={cvForm.languages} onChange={(event) => setCvForm({ ...cvForm, languages: event.target.value })} placeholder="Ngoai ngu (VD: Tieng Anh IELTS 7.0)" />
                <input value={cvForm.hobbies} onChange={(event) => setCvForm({ ...cvForm, hobbies: event.target.value })} placeholder="So thich (VD: Doc sach, Chay bo)" />
              </div>
              <textarea value={cvForm.certifications} onChange={(event) => setCvForm({ ...cvForm, certifications: event.target.value })} rows="2" placeholder="Chung chi / Giai thuong (Khong bat buoc)" />
              <button className="primary w-full" style={{ padding: '14px', fontSize: '16px' }}><Save size={20} /> Luu & Hoan tat CV</button>
            </form>
            <CvPreview cvForm={cvForm} candidate={candidates[0]} />
          </>
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

function CvPreview({ cvForm, candidate }) {
  return (
    <article className={`cv-preview panel ${cvForm.template || 'classic'}`}>
      <div className="cv-header">
        <div>
          <h2>{candidate?.fullName || 'Ung vien'}</h2>
          <p>{cvForm.desiredPosition}</p>
        </div>
        <span>{cvForm.experienceLevel}</span>
      </div>
      <div className="cv-contact">
        <span>{candidate?.email}</span>
        <span>{candidate?.phone}</span>
      </div>
      <section>
        <h3>Muc tieu</h3>
        <p>{cvForm.summary}</p>
      </section>
      <section>
        <h3>Ky nang</h3>
        <p>{cvForm.skills}</p>
      </section>
      <section>
        <h3>Hoc van</h3>
        <p>{cvForm.education}</p>
      </section>
      <section>
        <h3>Kinh nghiem</h3>
        <p>{cvForm.experience}</p>
      </section>
      {cvForm.projects && (
      <section>
        <h3>Du an noi bat</h3>
        <p>{cvForm.projects}</p>
      </section>
      )}
      {cvForm.languages && (
      <section>
        <h3>Ngoai ngu</h3>
        <p>{cvForm.languages}</p>
      </section>
      )}
      {cvForm.hobbies && (
      <section>
        <h3>So thich</h3>
        <p>{cvForm.hobbies}</p>
      </section>
      )}
      <section>
        <h3>Chung chi</h3>
        <p>{cvForm.certifications || 'Chua cap nhat'}</p>
      </section>
    </article>
  );
}

function EmployerView({ activeTab, jobs, selectedJob, applications, setSelectedJobId, employers, jobForm, setJobForm, submitJob, acceptApplication, rejectApplication, notifications }) {
  const employerJobs = jobs.filter((job) => Number(job.employerId) === Number(jobForm.employerId));
  const visibleSelectedJob = employerJobs.find((job) => job.id === selectedJob?.id) || employerJobs[0] || null;
  const visibleApplications = applications.filter((application) => application.jobId === visibleSelectedJob?.id);
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
      {activeTab === 'applications' && visibleSelectedJob && <ApplicationsPanel applications={visibleApplications} onAccept={acceptApplication} onReject={rejectApplication} />}
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

function AdminView({ activeTab, jobs, users, query, setQuery, filterStatus, setFilterStatus, filterEmployer, setFilterEmployer, approveJob, closeJob, deleteJob, userForm, setUserForm, createUser, notifications }) {
  const [currentJobPage, setCurrentJobPage] = React.useState(1);
  const [currentUserPage, setCurrentUserPage] = React.useState(1);
  const [viewingJob, setViewingJob] = React.useState(null);
  const [viewingUser, setViewingUser] = React.useState(null);
  
  const jobsPerPage = 8;
  const usersPerPage = 6;
  
  const startJobIndex = (currentJobPage - 1) * jobsPerPage;
  const paginatedJobs = jobs.slice(startJobIndex, startJobIndex + jobsPerPage);
  
  const startUserIndex = (currentUserPage - 1) * usersPerPage;
  const paginatedUsers = users.slice(startUserIndex, startUserIndex + usersPerPage);

  React.useEffect(() => { setCurrentJobPage(1); }, [query, filterStatus, filterEmployer, jobs.length]);
  React.useEffect(() => { setCurrentUserPage(1); }, [users.length]);

  const employersList = users.filter((u) => u.role === 'EMPLOYER');
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
            <div className="section-heading"><h2>Danh sach nguoi dung</h2><span>{users.length} tai khoan</span></div>
            <div style={{ flex: 1, overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nguoi dung</th>
                    <th>Lien he</th>
                    <th>Vai tro</th>
                    <th style={{ textAlign: 'right', width: '150px' }}>Thao tac</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => (
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
                        <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                          <button onClick={() => setViewingUser(user)}><Search size={15} /> Xem chi tiet</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <p className="empty">Chua co nguoi dung nao.</p>}
            </div>
            <Pagination total={users.length} itemsPerPage={usersPerPage} currentPage={currentUserPage} onPageChange={setCurrentUserPage} />
          </section>
        </div>
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

function ApplicationsPanel({ applications, onAccept, onReject }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApps = applications.slice(startIndex, startIndex + itemsPerPage);

  React.useEffect(() => { setCurrentPage(1); }, [applications.length]);

  return (
    <section className="panel" id="applications" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="section-heading"><h2>Ho so ung vien</h2><span>{applications.length} ho so</span></div>
      <div style={{ flex: 1, overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ung vien</th>
              <th>Thong tin lien he</th>
              <th>Thu ngong / CV</th>
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
                </td>
                <td>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{application.coverLetter}</p>
                </td>
                <td>
                  <span className={`badge ${application.status.toLowerCase()}`}>{application.status}</span>
                </td>
                <td>
                  {application.status !== 'ACCEPTED' && application.status !== 'REJECTED' && onAccept && onReject && (
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => onAccept(application.id)} style={{ color: 'var(--success)' }}><CheckCircle2 size={15} /> Chap nhan</button>
                      <button className="danger" onClick={() => onReject(application.id)}><XCircle size={15} /> Tu choi</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {applications.length === 0 && <p className="empty">Tin dang chon chua co ung vien.</p>}
      </div>
      <Pagination total={applications.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
    </section>
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
