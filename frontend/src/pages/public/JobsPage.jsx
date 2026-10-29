import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Briefcase, Building, MapPin, DollarSign, Clock, ExternalLink, CheckCircle2 } from 'lucide-react';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [appliedJobIds, setAppliedJobIds] = useState(() => new Set());
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [applyMessage, setApplyMessage] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/public/jobs');
        if (res.status) setJobs(res.data);
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(j => {
    if (selectedType === 'all') return true;
    return j.job_type === selectedType;
  });

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    setApplyMessage('');
    try {
      await api.post(`/user/jobs/${jobId}/apply`);
      setAppliedJobIds((current) => new Set([...current, Number(jobId)]));
    } catch (error) {
      if ((error.message || '').toLowerCase().includes('already applied')) {
        setAppliedJobIds((current) => new Set([...current, Number(jobId)]));
      }
      setApplyMessage(error.message || 'Please sign in as an alumni or student to apply.');
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <div className="jobs-page py-4 bg-white min-vh-100">
      <div className="container">
        {/* Header Card */}
        <div className="akal-card p-4 p-lg-5 mb-4 bg-white border-akal-border-grey">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <div className="d-flex align-items-center gap-2 text-akal-blue small fw-bold text-uppercase mb-2">
                <Briefcase size={16} />
                <span>ALUMNI CAREER NETWORK & OPPORTUNITIES</span>
              </div>
              <h1 className="display-6 fw-bold text-akal-navy mb-2">Jobs & Internships</h1>
              <p className="text-akal-secondary mb-0">
                Opportunities shared exclusively by Akal University alumni, corporate partners, and recruiters.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex gap-2 flex-wrap">
              <button 
                className={`filter-chip ${selectedType === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedType('all')}
              >
                All Roles
              </button>
              <button 
                className={`filter-chip ${selectedType === 'full_time' ? 'active' : ''}`}
                onClick={() => setSelectedType('full_time')}
              >
                Full-Time
              </button>
              <button 
                className={`filter-chip ${selectedType === 'internship' ? 'active' : ''}`}
                onClick={() => setSelectedType('internship')}
              >
                Internships
              </button>
              <button 
                className={`filter-chip ${selectedType === 'remote' ? 'active' : ''}`}
                onClick={() => setSelectedType('remote')}
              >
                Remote
              </button>
            </div>
          </div>
        </div>

        {applyMessage && (
          <div className="alert alert-warning mb-4 d-flex align-items-center gap-2" role="alert">
            <span>{applyMessage}</span>
          </div>
        )}

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-akal-blue" role="status">
              <span className="visually-hidden">Loading jobs...</span>
            </div>
            <p className="text-akal-muted mt-2">Loading career opportunities...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-5 akal-card border-akal-border-grey p-5 bg-white">
            <Briefcase size={48} className="text-akal-muted mb-3 opacity-50" />
            <h5 className="text-akal-navy fw-bold mb-2">No Opportunities Listed</h5>
            <p className="text-akal-secondary small mb-3">No jobs found matching the selected category. Check back soon or select another category.</p>
            <button onClick={() => setSelectedType('all')} className="btn btn-akal-primary btn-sm">
              Show All Roles
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="col-lg-6">
                <div className="akal-card p-4 h-100 d-flex flex-column justify-content-between bg-white border-akal-border-grey">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="stat-icon-wrapper stat-icon-blue" style={{ width: '46px', height: '46px' }}>
                          <Building size={22} />
                        </div>
                        <div>
                          <h5 className="fw-bold text-akal-navy mb-0" style={{ fontSize: '1.05rem' }}>{job.title}</h5>
                          <div className="text-akal-blue small fw-semibold">{job.company_name}</div>
                        </div>
                      </div>

                      <span className="badge bg-akal-blue-soft text-akal-blue text-uppercase px-2 py-1 small fw-bold">
                        {(job.job_type || '').replace('_', ' ')}
                      </span>
                    </div>

                    <div className="d-flex flex-wrap gap-3 small text-akal-secondary my-3">
                      <div className="d-flex align-items-center gap-1">
                        <MapPin size={14} className="text-akal-blue" />
                        <span>{job.location || 'Location not specified'}</span>
                      </div>
                      {job.salary_range && (
                        <div className="d-flex align-items-center gap-1">
                          <DollarSign size={14} className="text-success" />
                          <span className="fw-semibold text-akal-navy">{job.salary_range}</span>
                        </div>
                      )}
                      {job.experience_required && (
                        <div className="d-flex align-items-center gap-1">
                          <Clock size={14} className="text-warning" />
                          <span>{job.experience_required}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-akal-secondary small mb-3" style={{ lineHeight: 1.6 }}>{job.description}</p>

                    {job.requirements && (
                      <div className="p-3 rounded-3 small text-akal-secondary mb-3 border border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                        <strong className="text-akal-navy">Requirements:</strong> {job.requirements}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-top border-akal-border-grey d-flex justify-content-between align-items-center mt-auto">
                    <span className="small text-akal-muted">
                      Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Rolling Admission'}
                    </span>

                    {appliedJobIds.has(Number(job.id)) ? (
                      <button className="btn btn-sm btn-success d-flex align-items-center gap-1" disabled>
                        <CheckCircle2 size={14} /> Applied
                      </button>
                    ) : (
                      <button onClick={() => handleApply(job.id)} className="btn btn-sm btn-akal-primary" disabled={applyingJobId === job.id}>
                        <span>{applyingJobId === job.id ? 'Submitting...' : 'Apply Now'}</span>
                        <ExternalLink size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
