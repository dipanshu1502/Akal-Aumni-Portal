import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, Shield, Users, GraduationCap, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

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
    <div className="login-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="card border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="row g-0">
                {/* Left Side: University Brand Visual */}
                <div 
                  className="col-lg-5 text-white p-4 p-md-5 d-flex flex-column justify-content-between"
                  style={{ background: 'linear-gradient(135deg, #075985 0%, #087BB5 60%, #172333 100%)' }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div className="university-crest" style={{ width: '48px', height: '48px', fontSize: '22px' }}>
                        AU
                      </div>
                      <div>
                        <h5 className="mb-0 fw-bold text-white">AKAL UNIVERSITY</h5>
                        <span className="text-warning small text-uppercase fw-semibold" style={{ letterSpacing: '0.08em' }}>Alumni Portal</span>
                      </div>
                    </div>

                    <h3 className="fw-bold mb-3">Welcome Back to Your Alma Mater</h3>
                    <p className="text-light text-opacity-80 small mb-4">
                      Log in to access your digital alumni identity, discover career openings, mentor juniors, and stay connected with the global alumni family.
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="d-flex flex-column gap-2 small text-light text-opacity-90 pt-3 border-top border-white border-opacity-15">
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-warning" />
                      <span>Verified Digital Alumni ID Cards</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-warning" />
                      <span>Direct Mentorship Hub</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <CheckCircle2 size={16} className="text-warning" />
                      <span>Global Reunion & Event Passes</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Login Form & One-Click Demos */}
                <div className="col-lg-7 p-4 p-md-5 bg-white">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="fw-bold text-dark mb-1">Account Login</h4>
                      <p className="text-muted small mb-0">Enter your credentials or click any demo persona below</p>
                    </div>
                    <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1 rounded-pill small">
                      Official AU
                    </span>
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 small py-2 rounded-3 mb-3">
                      <AlertCircle size={16} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* One-Click Demo Personas Grid */}
                  <div className="p-3 bg-light rounded-3 mb-4 border">
                    <div className="d-flex align-items-center gap-1 text-warning-emphasis fw-bold small mb-2">
                      <Zap size={14} className="text-warning" />
                      <span>Instant Demo Switcher (1-Click Login):</span>
                    </div>

                    <div className="row g-2">
                      {demoAccounts.map((acc) => (
                        <div key={acc.email} className="col-sm-6">
                          <button
                            type="button"
                            onClick={() => handleDemoClick(acc.email, acc.pass, acc.role)}
                            className="btn btn-sm btn-white border w-100 text-start p-2 shadow-xs bg-white rounded-2 hover-shadow"
                          >
                            <div className="fw-bold small text-primary">{acc.label}</div>
                            <div className="text-muted" style={{ fontSize: '0.65rem' }}>{acc.email}</div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manual Login Form */}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        placeholder="alumni@akaluniversity.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between">
                        <label className="form-label small fw-bold">Password</label>
                        <span className="small text-muted">Default demo pass: Admin@12345</span>
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
                      className="btn btn-akal-primary w-100 justify-content-center py-2 fs-6 mb-3"
                    >
                      <LogIn size={18} />
                      <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                    </button>
                  </form>

                  <div className="text-center pt-3 border-top small text-muted">
                    New to Akal Alumni Portal?{' '}
                    <Link to="/register" className="fw-bold text-primary text-decoration-none">
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
