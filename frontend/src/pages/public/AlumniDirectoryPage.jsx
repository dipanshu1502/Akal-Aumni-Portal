import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AlumniCard from '../../components/common/AlumniCard';
import { Search, Users, Sparkles, Award, RotateCcw, X, GraduationCap, Building, MapPin, Mail, Globe } from 'lucide-react';

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
    <div className="alumni-directory-page py-4 bg-white min-vh-100">
      <div className="container">
        {/* Page Header Card */}
        <div className="akal-card p-4 p-lg-5 mb-4 bg-white border-akal-border-grey">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 text-akal-blue small fw-bold text-uppercase mb-2">
                <Users size={16} />
                <span>AKAL UNIVERSITY ALUMNI NETWORK</span>
              </div>
              <h1 className="display-6 fw-bold text-akal-navy mb-2">Alumni Directory</h1>
              <p className="text-akal-secondary mb-0">
                Explore and connect with verified graduates from Akal University across all departments, batches, and global organizations.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="d-inline-flex flex-column align-items-lg-end p-3 rounded-3" style={{ background: 'var(--akal-blue-soft)', border: '1px solid var(--akal-border-grey)' }}>
                <div className="fs-3 fw-bold text-akal-blue">{alumniList.length}</div>
                <div className="small text-akal-secondary fw-semibold">Alumni Profiles Listed</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-4">
            <div className="input-group input-group-lg border border-akal-border-grey rounded-3 overflow-hidden shadow-sm">
              <span className="input-group-text bg-white border-0 ps-3 text-akal-muted">
                <Search size={20} />
              </span>
              <input 
                type="text" 
                className="form-control bg-white border-0 shadow-none ps-2" 
                placeholder="Search by name, company, skills, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="btn btn-akal-primary px-4 m-1 rounded-2">
                Search Directory
              </button>
            </div>
          </form>

          {/* Filter Chips & Selectors Row */}
          <div className="d-flex flex-wrap align-items-center gap-2 mt-4 pt-2 border-top border-akal-border-grey">
            <span className="small text-akal-muted fw-bold me-1">Filters:</span>
            
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
              className="form-select form-select-sm w-auto border-akal-border-grey py-1 px-3 bg-white"
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
              className="form-select form-select-sm w-auto border-akal-border-grey py-1 px-3 bg-white"
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
                className="btn btn-sm btn-link text-danger d-flex align-items-center gap-1 text-decoration-none ms-auto"
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
            <div className="spinner-border text-akal-blue" role="status">
              <span className="visually-hidden">Loading alumni...</span>
            </div>
            <p className="text-akal-muted mt-2">Loading verified alumni profiles...</p>
          </div>
        ) : alumniList.length === 0 ? (
          <div className="text-center py-5 akal-card border-akal-border-grey p-5 bg-white">
            <Users size={48} className="text-akal-muted mb-3 opacity-50" />
            <h5 className="fw-bold text-akal-navy">No Alumni Found</h5>
            <p className="text-akal-secondary small mb-3">Try adjusting your search terms or clearing the selected filters.</p>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(23, 35, 51, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 overflow-hidden shadow-lg" style={{ borderRadius: '16px' }}>
              {/* Modal Header */}
              <div className="p-4 text-white" style={{ backgroundColor: 'var(--akal-navy)' }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white text-akal-blue fw-bold d-flex align-items-center justify-content-center shadow-sm" style={{ width: '60px', height: '60px', fontSize: '22px' }}>
                      {selectedAlumni.first_name[0]}{selectedAlumni.last_name ? selectedAlumni.last_name[0] : ''}
                    </div>
                    <div>
                      <h4 className="fw-bold text-white mb-0">{selectedAlumni.first_name} {selectedAlumni.last_name}</h4>
                      <div className="text-warning small fw-semibold">{selectedAlumni.current_designation || 'Alumni Member'} {selectedAlumni.current_company ? `at ${selectedAlumni.current_company}` : ''}</div>
                      <div className="text-white-50 small">{selectedAlumni.location_city}{selectedAlumni.location_country ? `, ${selectedAlumni.location_country}` : ''}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAlumni(null)} className="btn btn-sm btn-outline-light rounded-circle p-1" style={{ width: 32, height: 32 }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4 bg-white">
                <div className="row g-4">
                  <div className="col-md-7">
                    <h6 className="fw-bold text-akal-navy border-bottom border-akal-border-grey pb-2">Academic & Career Profile</h6>
                    <ul className="list-unstyled small d-flex flex-column gap-2 text-akal-secondary">
                      <li><strong className="text-akal-navy">Degree:</strong> {selectedAlumni.degree || 'Bachelor / Master'}</li>
                      <li><strong className="text-akal-navy">Department:</strong> {selectedAlumni.department}</li>
                      <li><strong className="text-akal-navy">Batch:</strong> Batch of {selectedAlumni.batch_year || selectedAlumni.graduation_year}</li>
                      {selectedAlumni.current_company && (
                        <li><strong className="text-akal-navy">Company:</strong> {selectedAlumni.current_company}</li>
                      )}
                    </ul>

                    {selectedAlumni.bio && (
                      <>
                        <h6 className="fw-bold text-akal-navy border-bottom border-akal-border-grey pb-2 mt-4">About</h6>
                        <p className="small text-akal-secondary">{selectedAlumni.bio}</p>
                      </>
                    )}
                  </div>

                  <div className="col-md-5 p-3 rounded-3 border border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                    <h6 className="fw-bold text-akal-blue mb-3">Skills & Mentorship</h6>
                    {selectedAlumni.skills && (
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {selectedAlumni.skills.split(',').map((s, i) => (
                          <span key={i} className="badge bg-white text-akal-navy border border-akal-border-grey small px-2 py-1">{s.trim()}</span>
                        ))}
                      </div>
                    )}

                    {selectedAlumni.is_mentor ? (
                      <div className="p-3 bg-white rounded-3 border border-akal-yellow mt-3">
                        <div className="fw-bold text-akal-navy small mb-1">⭐ Open for Mentorship</div>
                        <p className="small text-akal-secondary mb-2">{selectedAlumni.mentorship_topics || 'Career guidance & interview preparation'}</p>
                        <a href="/mentorship" className="btn btn-akal-yellow btn-sm w-100 justify-content-center">Request Mentorship Session</a>
                      </div>
                    ) : (
                      <div className="small text-akal-muted mt-2">Connect via LinkedIn or alumni email for networking.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer px-4 py-3 border-top border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                <button onClick={() => setSelectedAlumni(null)} className="btn btn-akal-outline btn-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlumniDirectoryPage;
