import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login, quickDemoLogin, demoAccounts } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (res.user.role === 'superadmin' || res.user.role === 'admin') navigate('/admin/dashboard');
      else if (res.user.role === 'alumni') navigate('/alumni/dashboard');
      else if (res.user.role === 'student') navigate('/student/dashboard');
      else navigate('/');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleDemoClick = async (demoEmail, demoPass, role) => {
    setErrorMsg('');
    setLoading(true);
    const res = await quickDemoLogin(demoEmail, demoPass);
    setLoading(false);

    if (res.success) {
      if (role === 'superadmin' || role === 'admin') navigate('/admin/dashboard');
      else if (role === 'alumni') navigate('/alumni/dashboard');
      else if (role === 'student') navigate('/student/dashboard');
    }
  };

  return (
    <div className="login-page py-4 py-lg-5" style={{ backgroundColor: 'var(--akal-soft-white)', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container py-lg-2">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-9">
            <div className="card border border-akal-border-grey rounded-4 shadow-sm overflow-hidden bg-white">
              <div className="row g-0">
                {/* Left Side: University Brand Visual */}
                <div 
                  className="col-lg-5 p-4 d-flex flex-column justify-content-between"
                  style={{
                    backgroundColor: 'var(--akal-navy)',
                    background: 'linear-gradient(155deg, #172333 0%, #1f2d42 100%)',
                    color: '#FFFFFF'
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="university-crest" style={{ width: '44px', height: '44px', fontSize: '18px' }}>
                        AU
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>AKAL UNIVERSITY</h6>
                        <span className="small text-uppercase fw-bold" style={{ color: 'var(--akal-yellow)', letterSpacing: '0.08em', fontSize: '0.72rem' }}>Alumni Portal</span>
                      </div>
                    </div>

                    <h4 className="fw-bold text-white mb-2" style={{ lineHeight: 1.3 }}>Welcome Back to Your Alma Mater</h4>
                    <p className="small mb-3" style={{ color: '#CBD5E1', lineHeight: 1.5, fontSize: '0.84rem' }}>
                      Log in to access your verified digital alumni credentials, discover career opportunities, connect with mentors, and stay engaged with fellow Akalites worldwide.
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="d-flex flex-column gap-2 small pt-3 border-top border-secondary border-opacity-25 mt-3" style={{ color: '#E2E8F0', fontSize: '0.82rem' }}>
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={15} className="text-warning flex-shrink-0" />
                      <span>Verified Digital Alumni ID Cards</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={15} className="text-warning flex-shrink-0" />
                      <span>1-on-1 Student & Alumni Mentorship</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={15} className="text-warning flex-shrink-0" />
                      <span>Global Reunions & Event Passes</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Login Form & One-Click Demos */}
                <div className="col-lg-7 p-4 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h4 className="fw-bold text-akal-navy mb-0" style={{ fontFamily: 'var(--font-heading)' }}>Account Sign In</h4>
                      <p className="text-akal-secondary small mb-0" style={{ fontSize: '0.82rem' }}>Enter credentials or click any demo persona below</p>
                    </div>
                    <span className="badge bg-akal-blue-soft text-akal-blue fw-bold px-2.5 py-1 rounded-pill small">
                      Official AU
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* One-Click Demo Personas Grid */}
                  <div className="p-3 rounded-3 mb-3 border border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                    <div className="d-flex align-items-center gap-2 fw-bold small text-akal-navy mb-2">
                      <Zap size={14} style={{ color: 'var(--akal-yellow)', fill: 'var(--akal-yellow)' }} />
                      <span style={{ fontSize: '0.82rem' }}>Instant Demo Switcher (1-Click Login):</span>
                    </div>

                    <div className="row g-2">
                      {demoAccounts.map((acc) => (
                        <div key={acc.email} className="col-sm-6">
                          <button
                            type="button"
                            onClick={() => handleDemoClick(acc.email, acc.pass, acc.role)}
                            className="btn btn-sm bg-white border border-akal-border-grey w-100 p-2 rounded-2 shadow-xs d-flex flex-column align-items-start justify-content-center demo-persona-btn"
                          >
                            <div className="fw-bold text-akal-blue text-truncate w-100 text-start" style={{ fontSize: '0.82rem', lineHeight: 1.25 }}>
                              {acc.label}
                            </div>
                            <div className="text-akal-secondary text-truncate w-100 text-start mt-0.5" style={{ fontSize: '0.7rem' }}>
                              {acc.email}
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manual Login Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-2.5">
                      <label className="form-label text-akal-navy fw-semibold small mb-1">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="alumni@akaluniversity.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label text-akal-navy fw-semibold small mb-0">Password</label>
                        <span className="text-akal-muted" style={{ fontSize: '0.72rem' }}>Default: Admin@12345</span>
                      </div>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="btn btn-akal-primary w-100 justify-content-center py-2 fs-6 mb-2"
                    >
                      <LogIn size={17} />
                      <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                    </button>
                  </form>

                  <div className="text-center pt-2.5 border-top border-akal-border-grey small text-akal-secondary" style={{ fontSize: '0.82rem' }}>
                    New to Akal Alumni Portal?{' '}
                    <Link to="/register" className="fw-bold text-akal-blue text-decoration-none ms-1">
                      Join & Register Account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
