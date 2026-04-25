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
  const approvedJobs = jobs.filter((job) => job.status === 'APPROVED');
  const myEmployerJobs = activeRole === 'EMPLOYER' ? jobs.filter((job) => Number(job.employerId) === Number(currentUser.id)) : [];
  const myEmployerApplications = activeRole === 'EMPLOYER'
    ? applications.filter((application) => myEmployerJobs.some((job) => job.id === application.jobId))
    : [];
  const selectableJobs = activeRole === 'JOB_SEEKER' ? approvedJobs : jobs;
  const selectedJob = selectableJobs.find((job) => job.id === selectedJobId) || selectableJobs[0] || null;

  const visibleJobs = useMemo(() => {
    const source = activeRole === 'JOB_SEEKER' ? approvedJobs : jobs;
    return source.filter((job) => {
      const haystack = `${job.title} ${job.companyName} ${job.location} ${job.status}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [activeRole, approvedJobs, jobs, query]);

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
    { href: '#notifications', icon: Bell, label: 'Thong bao', roles: ['JOB_SEEKER'] },
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
      const notificationRequest = currentUser.role === 'JOB_SEEKER' ? request('/notifications/me') : Promise.resolve([]);
      const [userData, jobData, applicationData, statData, cvData, notificationData] = await Promise.all([
        userRequest,
        api('/jobs'),
        applicationRequest,
        api('/dashboard/stats'),
        cvRequest,
        notificationRequest,
      ]);
      setUsers(userData);
      setJobs(jobData);
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
    await runAction('Ho so ung tuyen da duoc gui den nha tuyen dung', () =>
      request('/applications', {
        method: 'POST',
        body: JSON.stringify({
          jobId: selectedJob.id,
          candidateId: Number(currentUser.id),
          coverLetter: applicationForm.coverLetter,
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
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <BriefcaseBusiness size={30} />
          <div>
            <strong>JobExchange</strong>
            <span>{roleConfig[currentUser.role].label}</span>
          </div>
        </div>
        <nav>
          {navItems
            .filter((item) => item.roles.includes(currentUser.role))
            .map((item) => {
              const Icon = item.icon;
              const tabId = item.href.replace('#', '');
              return <a href={item.href} key={item.href} className={activeTab === tabId ? 'active' : ''}><Icon size={18} /> {item.label}</a>;
            })}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>San giao dich viec lam truc tuyen</p>
            <h1>{roleConfig[activeRole].label}</h1>
            <span className="session-text">{currentUser.fullName} · {currentUser.email}</span>
          </div>
          <div className="top-actions">
            <button className="icon-button" onClick={loadData} disabled={loading} title="Tai lai du lieu">
              <RefreshCw size={18} />
            </button>
            <button className="icon-button" onClick={logout} title="Dang xuat">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {activeTab === 'role' && (
          <section className="role-switcher locked" id="role">
            <button className="active">
              <LockKeyhole size={18} /> Dang nhap voi quyen {roleConfig[currentUser.role].label}
            </button>
          </section>
        )}

        {activeTab === 'jobs' && (
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
          />
        )}

        {activeRole === 'ADMIN' && (
          <AdminView
            activeTab={activeTab}
            jobs={visibleJobs}
            users={users}
            query={query}
            setQuery={setQuery}
            approveJob={approveJob}
            closeJob={closeJob}
            deleteJob={deleteJob}
            userForm={userForm}
            setUserForm={setUserForm}
            createUser={createUser}
          />
        )}
      </section>
    </main>
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

function JobSeekerView({ activeTab, jobs, selectedJob, setSelectedJobId, query, setQuery, candidates, applicationForm, setApplicationForm, cv, cvForm, setCvForm, saveCv, applyJob, notifications }) {
  return (
    <>
      {activeTab === 'jobs' && (
        <section className="candidate-board" id="jobs">
        <JobList jobs={jobs} selectedJob={selectedJob} setSelectedJobId={setSelectedJobId} query={query} setQuery={setQuery} title="Viec lam phu hop" />
        <div className="panel">
          <div className="section-heading">
            <h2>Chi tiet viec lam</h2>
            {selectedJob && <span className={`badge ${selectedJob.status.toLowerCase()}`}>{selectedJob.status}</span>}
          </div>
          {selectedJob ? (
            <>
              <h3>{selectedJob.title}</h3>
              <p className="lead">{selectedJob.companyName} · {selectedJob.location} · {selectedJob.salaryRange}</p>
              <p>{selectedJob.description}</p>
              <p><strong>Yeu cau:</strong> {selectedJob.requirements}</p>
            </>
          ) : <p className="empty">Chua co viec lam da duyet.</p>}
        </div>
        <div className="panel apply-panel">
          <div className="section-heading">
            <h2>Ung tuyen nhanh</h2>
          </div>
          {cv ? (
            <div className="cv-summary">
              <FileText size={22} />
              <div>
                <strong>{cv.title}</strong>
                <span>{cv.desiredPosition} · {cv.experienceLevel}</span>
              </div>
            </div>
          ) : (
            <p className="empty">Tao CV truoc khi ung tuyen.</p>
          )}
          {selectedJob && (
            <form className="form" onSubmit={applyJob}>
              <select value={applicationForm.candidateId} onChange={(event) => setApplicationForm({ ...applicationForm, candidateId: event.target.value })}>
                {candidates.map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.fullName} - {candidate.headline}</option>)}
              </select>
              <textarea value={applicationForm.coverLetter} onChange={(event) => setApplicationForm({ ...applicationForm, coverLetter: event.target.value })} rows="5" />
              <button className="primary" disabled={!cv}><Send size={17} /> Ung tuyen bang CV</button>
            </form>
          )}
        </div>
      </section>
      )}
      {activeTab === 'cv' && (
      <section className="cv-workspace" id="cv">
        <form className="panel form cv-form" onSubmit={saveCv}>
          <div className="section-heading"><h2>Tao CV</h2></div>
          <div className="template-picker">
            {[
              ['classic', 'Chuyen nghiep'],
              ['modern', 'Hien dai'],
              ['compact', 'Gon gang'],
            ].map(([value, label]) => (
              <button type="button" className={cvForm.template === value ? 'active' : ''} key={value} onClick={() => setCvForm({ ...cvForm, template: value })}>
                {label}
              </button>
            ))}
          </div>
          <div className="inline-fields">
            <input value={cvForm.title} onChange={(event) => setCvForm({ ...cvForm, title: event.target.value })} placeholder="Ten CV" required />
            <input value={cvForm.desiredPosition} onChange={(event) => setCvForm({ ...cvForm, desiredPosition: event.target.value })} placeholder="Vi tri mong muon" required />
          </div>
          <input value={cvForm.experienceLevel} onChange={(event) => setCvForm({ ...cvForm, experienceLevel: event.target.value })} placeholder="Cap bac/kinh nghiem" required />
          <textarea value={cvForm.summary} onChange={(event) => setCvForm({ ...cvForm, summary: event.target.value })} rows="4" placeholder="Muc tieu nghe nghiep / gioi thieu ban than" required />
          <textarea value={cvForm.skills} onChange={(event) => setCvForm({ ...cvForm, skills: event.target.value })} rows="3" placeholder="Ky nang" required />
          <textarea value={cvForm.education} onChange={(event) => setCvForm({ ...cvForm, education: event.target.value })} rows="3" placeholder="Hoc van" required />
          <textarea value={cvForm.experience} onChange={(event) => setCvForm({ ...cvForm, experience: event.target.value })} rows="4" placeholder="Kinh nghiem / du an" required />
          <textarea value={cvForm.certifications} onChange={(event) => setCvForm({ ...cvForm, certifications: event.target.value })} rows="2" placeholder="Chung chi / giai thuong" />
          <button className="primary"><Save size={17} /> Luu CV</button>
        </form>
        <CvPreview cvForm={cvForm} candidate={candidates[0]} />
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
      <section>
        <h3>Chung chi</h3>
        <p>{cvForm.certifications || 'Chua cap nhat'}</p>
      </section>
    </article>
  );
}

function EmployerView({ activeTab, jobs, selectedJob, applications, setSelectedJobId, employers, jobForm, setJobForm, submitJob, acceptApplication, rejectApplication }) {
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
    </>
  );
}

function AdminView({ activeTab, jobs, users, query, setQuery, approveJob, closeJob, deleteJob, userForm, setUserForm, createUser }) {
  return (
    <>
      {activeTab === 'jobs' && (
        <div className="panel" id="jobs">
          <div className="section-heading"><h2>Quan ly danh sach viec lam</h2></div>
          <label className="searchbox">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tim theo vi tri, cong ty, trang thai" />
          </label>
          <div className="admin-table">
            {jobs.map((job, index) => (
              <div className="admin-row" key={job.id} style={{ animation: 'slideUp 0.4s ease-out backwards', animationDelay: `${index * 0.05}s` }}>
                <div>
                  <strong>{job.title}</strong>
                  <small>{job.companyName} · {job.location} · {job.salaryRange}</small>
                </div>
                <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>
                <div className="row-actions">
                  {job.status === 'PENDING' && <button onClick={() => approveJob(job.id)}><CheckCircle2 size={15} /> Duyet</button>}
                  {job.status !== 'CLOSED' && <button onClick={() => closeJob(job.id)}>Dong</button>}
                  <button className="danger" onClick={() => deleteJob(job.id)} title="Xoa tin"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
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
          <section className="panel">
            <div className="section-heading"><h2>Danh sach nguoi dung</h2><span>{users.length} tai khoan</span></div>
            <div className="user-grid">
              {users.map((user, index) => (
                <article className="application-card" key={user.id} style={{ animation: 'slideUp 0.4s ease-out backwards', animationDelay: `${index * 0.05}s` }}>
                  <strong>{user.fullName}</strong>
                  <span>{roleConfig[user.role]?.label || user.role}</span>
                  <small>{user.email} · {user.phone}</small>
                  <p>{user.organizationName || user.headline || 'Chua cap nhat thong tin bo sung'}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function JobList({ jobs, selectedJob, setSelectedJobId, query, setQuery, title }) {
  return (
    <div className="panel">
      <div className="section-heading"><h2>{title}</h2><span>{jobs.length} tin</span></div>
      <label className="searchbox">
        <Search size={17} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tim theo vi tri, cong ty, dia diem" />
      </label>
      <div className="job-list">
        {jobs.map((job, index) => (
          <button className={`job-row ${selectedJob?.id === job.id ? 'active' : ''}`} key={job.id} onClick={() => setSelectedJobId(job.id)} style={{ animation: 'slideInRight 0.4s ease-out backwards', animationDelay: `${index * 0.05}s` }}>
            <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>
            <strong>{job.title}</strong>
            <small>{job.companyName}</small>
            <span className="muted"><MapPin size={14} /> {job.location} · {job.salaryRange}</span>
          </button>
        ))}
        {jobs.length === 0 && <p className="empty">Khong co du lieu phu hop.</p>}
      </div>
    </div>
  );
}

function ApplicationsPanel({ applications, onAccept, onReject }) {
  return (
    <section className="panel" id="applications">
      <div className="section-heading"><h2>Ho so ung vien</h2><span>{applications.length} ho so</span></div>
      <div className="application-grid">
        {applications.map((application, index) => (
          <article className="application-card" key={application.id} style={{ animation: 'slideUp 0.4s ease-out backwards', animationDelay: `${index * 0.05}s` }}>
            <strong>{application.candidateName}</strong>
            <span>{application.candidateHeadline}</span>
            <span className={`badge ${application.status.toLowerCase()}`}>{application.status}</span>
            <small>{application.candidateEmail} · {application.candidatePhone}</small>
            <p>{application.coverLetter}</p>
            {application.status !== 'ACCEPTED' && application.status !== 'REJECTED' && onAccept && onReject && (
              <div className="row-actions">
                <button onClick={() => onAccept(application.id)}><CheckCircle2 size={15} /> Chap nhan</button>
                <button className="danger" onClick={() => onReject(application.id)}><XCircle size={15} /> Tu choi</button>
              </div>
            )}
          </article>
        ))}
        {applications.length === 0 && <p className="empty">Tin dang chon chua co ung vien.</p>}
      </div>
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
