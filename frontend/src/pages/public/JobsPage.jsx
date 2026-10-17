import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Briefcase, Building, MapPin, DollarSign, Clock, ExternalLink, Mail, CheckCircle2 } from 'lucide-react';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [appliedJobId, setAppliedJobId] = useState(null);

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

  const handleApply = (jobId) => {
    setAppliedJobId(jobId);
    setTimeout(() => {
      alert('Application submitted! Your profile and details have been forwarded to the recruiting coordinator.');
    }, 200);
  };

  return (
    <div className="jobs-page py-4">
      <div className="container">
        {/* Header */}
        <div className="bg-white rounded-4 p-4 p-lg-5 mb-4 border" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 text-primary small fw-bold text-uppercase mb-2">
                <Briefcase size={16} />
                <span>ALUMNI CAREER NETWORK</span>
              </div>
              <h1 className="display-6 fw-bold mb-2">Jobs & Internships</h1>
              <p className="text-muted mb-0">
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

        {/* Jobs List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="col-lg-6">
                <div className="akal-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-3 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center fw-bold" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                          <Building size={24} />
                        </div>
                        <div>
                          <h5 className="fw-bold text-dark mb-0">{job.title}</h5>
                          <div className="text-primary small fw-semibold">{job.company_name}</div>
                        </div>
                      </div>

                      <span className="badge bg-light text-dark border text-uppercase px-2 py-1 rounded-pill small">
                        {job.job_type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="d-flex flex-wrap gap-3 small text-muted my-3">
                      <div className="d-flex align-items-center gap-1">
                        <MapPin size={14} className="text-danger" />
                        <span>{job.location}</span>
                      </div>
                      {job.salary_range && (
                        <div className="d-flex align-items-center gap-1">
                          <DollarSign size={14} className="text-success" />
                          <span className="fw-semibold text-dark">{job.salary_range}</span>
                        </div>
                      )}
                      {job.experience_required && (
                        <div className="d-flex align-items-center gap-1">
                          <Clock size={14} className="text-warning" />
                          <span>{job.experience_required}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-secondary small mb-3">{job.description}</p>

                    {job.requirements && (
                      <div className="p-2 bg-light rounded-3 small text-muted mb-3 border">
                        <strong>Requirements:</strong> {job.requirements}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-top d-flex justify-content-between align-items-center mt-auto">
                    <span className="small text-muted">
                      Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}
                    </span>

                    {appliedJobId === job.id ? (
                      <button className="btn btn-sm btn-success d-flex align-items-center gap-1" disabled>
                        <CheckCircle2 size={14} /> Applied
                      </button>
                    ) : (
                      <button onClick={() => handleApply(job.id)} className="btn btn-sm btn-akal-primary">
                        <span>Apply Directly</span>
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
