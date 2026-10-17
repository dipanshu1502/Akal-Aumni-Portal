import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AlumniCard from '../../components/common/AlumniCard';
import { Search, Filter, Users, Sparkles, Award, RotateCcw, Building, MapPin, GraduationCap } from 'lucide-react';

const AlumniDirectoryPage = () => {
  const [alumniList, setAlumniList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [mentorFilter, setMentorFilter] = useState(false);
  const [distinguishedFilter, setDistinguishedFilter] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);

  const fetchAlumni = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedDept) params.append('department', selectedDept);
      if (selectedBatch) params.append('batch', selectedBatch);
      if (mentorFilter) params.append('mentor', '1');
      if (distinguishedFilter) params.append('distinguished', '1');

      const [alumniRes, statsRes] = await Promise.all([
        api.get(`/public/alumni?${params.toString()}`),
        api.get('/public/stats')
      ]);

      if (alumniRes.status) setAlumniList(alumniRes.data);
      if (statsRes.status) {
        setDepartments(statsRes.data.departments || []);
        setBatches(statsRes.data.batches || []);
      }
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, [selectedDept, selectedBatch, mentorFilter, distinguishedFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAlumni();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDept('');
    setSelectedBatch('');
    setMentorFilter(false);
    setDistinguishedFilter(false);
  };

  return (
    <div className="alumni-directory-page py-4">
      <div className="container">
        {/* Page Header */}
        <div className="bg-white rounded-4 p-4 p-lg-5 mb-4 border" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 text-primary small fw-bold text-uppercase mb-2">
                <Users size={16} />
                <span>AKAL UNIVERSITY ALUMNI NETWORK</span>
              </div>
              <h1 className="display-6 fw-bold mb-2">Alumni Directory</h1>
              <p className="text-muted mb-0">
                Explore and connect with verified graduates from Akal University across all departments, batches, and global organizations.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="d-inline-flex flex-column align-items-lg-end">
                <div className="fs-3 fw-bold text-primary">{alumniList.length}</div>
                <div className="small text-muted fw-semibold">Alumni Profiles Listed</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-4">
            <div className="input-group input-group-lg bg-light rounded-pill border p-1">
              <span className="input-group-text bg-transparent border-0 ps-3 text-muted">
                <Search size={20} />
              </span>
              <input 
                type="text" 
                className="form-control bg-transparent border-0 shadow-none" 
                placeholder="Search by name, company, skills, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-akal-primary rounded-pill px-4">
                Search
              </button>
            </div>
          </form>

          {/* Filter Chips Row */}
          <div className="d-flex flex-wrap align-items-center gap-2 mt-3 pt-2">
            <span className="small text-muted fw-bold me-1">Quick Filters:</span>
            
            <button 
              className={`filter-chip ${mentorFilter ? 'active' : ''}`}
              onClick={() => setMentorFilter(!mentorFilter)}
            >
              <Award size={14} className="me-1" />
              Mentors Only
            </button>

            <button 
              className={`filter-chip ${distinguishedFilter ? 'active' : ''}`}
              onClick={() => setDistinguishedFilter(!distinguishedFilter)}
            >
              <Sparkles size={14} className="me-1 text-warning" />
              Distinguished Alumni
            </button>

            {/* Department Dropdown */}
            <select 
              className="form-select form-select-sm w-auto rounded-pill border py-1 px-3 bg-white"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Batch Dropdown */}
            <select 
              className="form-select form-select-sm w-auto rounded-pill border py-1 px-3 bg-white"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
            >
              <option value="">All Batches</option>
              {batches.map((b) => (
                <option key={b} value={b}>Batch {b}</option>
              ))}
            </select>

            {(searchTerm || selectedDept || selectedBatch || mentorFilter || distinguishedFilter) && (
              <button 
                className="btn btn-sm btn-link text-danger d-flex align-items-center gap-1 text-decoration-none"
                onClick={handleResetFilters}
              >
                <RotateCcw size={13} />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading alumni...</span>
            </div>
            <p className="text-muted mt-2">Loading verified alumni profiles...</p>
          </div>
        ) : alumniList.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border p-5">
            <Users size={48} className="text-muted mb-3 opacity-50" />
            <h5 className="fw-bold">No Alumni Found</h5>
            <p className="text-muted small">Try adjusting your search terms or clearing the selected filters.</p>
            <button onClick={handleResetFilters} className="btn btn-akal-primary btn-sm">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {alumniList.map((alm) => (
              <div key={alm.id} className="col-lg-4 col-md-6">
                <AlumniCard 
                  alumni={alm} 
                  onConnect={(alumniItem) => setSelectedAlumni(alumniItem)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alumni Detail Modal */}
      {selectedAlumni && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 overflow-hidden shadow-lg">
              <div className="p-4 bg-primary text-white" style={{ background: 'var(--grad-hero)' }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white text-primary fw-bold d-flex align-items-center justify-content-center shadow" style={{ width: '64px', height: '64px', fontSize: '24px' }}>
                      {selectedAlumni.first_name[0]}{selectedAlumni.last_name ? selectedAlumni.last_name[0] : ''}
                    </div>
                    <div>
                      <h4 className="fw-bold text-white mb-0">{selectedAlumni.first_name} {selectedAlumni.last_name}</h4>
                      <div className="text-warning small fw-semibold">{selectedAlumni.current_designation || 'Alumni Member'} at {selectedAlumni.current_company || 'Industry'}</div>
                      <div className="text-light text-opacity-75 small">{selectedAlumni.location_city}, {selectedAlumni.location_country}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAlumni(null)} className="btn btn-sm btn-outline-light rounded-circle">✕</button>
                </div>
              </div>

              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-7">
                    <h6 className="fw-bold text-dark border-bottom pb-2">Academic & Career Profile</h6>
                    <ul className="list-unstyled small d-flex flex-column gap-2 text-muted">
                      <li><strong>Degree:</strong> {selectedAlumni.degree}</li>
                      <li><strong>Department:</strong> {selectedAlumni.department}</li>
                      <li><strong>Batch Year:</strong> {selectedAlumni.batch_year}</li>
                      <li><strong>Experience:</strong> {selectedAlumni.experience_years || 3}+ Years</li>
                    </ul>

                    {selectedAlumni.bio && (
                      <>
                        <h6 className="fw-bold text-dark border-bottom pb-2 mt-3">About</h6>
                        <p className="small text-secondary">{selectedAlumni.bio}</p>
                      </>
                    )}
                  </div>

                  <div className="col-md-5 bg-light p-3 rounded-3 border">
                    <h6 className="fw-bold text-primary mb-3">Skills & Mentorship</h6>
                    {selectedAlumni.skills && (
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {selectedAlumni.skills.split(',').map((s, i) => (
                          <span key={i} className="badge bg-white text-dark border small rounded-pill px-2 py-1">{s.trim()}</span>
                        ))}
                      </div>
                    )}

                    {selectedAlumni.is_mentor ? (
                      <div className="p-3 bg-white rounded-3 border border-warning">
                        <div className="fw-bold text-warning small mb-1">⭐ Open for Mentorship</div>
                        <p className="small text-muted mb-2">{selectedAlumni.mentorship_topics || 'Career guidance & technical prep'}</p>
                        <a href="/login" className="btn btn-akal-yellow btn-sm w-100">Login to Request Session</a>
                      </div>
                    ) : (
                      <div className="small text-muted">Connect via LinkedIn or alumni email for networking.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light px-4 py-3">
                <button onClick={() => setSelectedAlumni(null)} className="btn btn-secondary btn-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectoryPage;
