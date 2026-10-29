import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AlumniCard from '../../components/common/AlumniCard';
import { useAuth } from '../../context/AuthContext';
import { Award, BookOpen, MessageSquare, CheckCircle2, Sparkles, Send, X } from 'lucide-react';

const MentorshipPage = () => {
  const { user, isStudent, isAuthenticated } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const res = await api.get('/public/alumni?mentor=1');
        if (res.status) setMentors(res.data);
      } catch (err) {
        console.error('Failed to load mentors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in with your Student account to request 1-on-1 mentorship.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/student/mentorship-request', {
        mentor_user_id: selectedMentor.user_id,
        topic,
        message,
      });

      if (res.status) {
        setSubmitted(true);
        setTimeout(() => {
          setSelectedMentor(null);
          setSubmitted(false);
          setTopic('');
          setMessage('');
        }, 2200);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mentorship-page py-4 bg-white min-vh-100">
      <div className="container">
        {/* Header Card */}
        <div className="akal-card p-4 p-lg-5 mb-4 bg-white border-akal-border-grey">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 text-akal-blue small fw-bold text-uppercase mb-2">
                <Award size={16} />
                <span>CAREER & ACADEMIC GUIDANCE</span>
              </div>
              <h1 className="display-6 fw-bold text-akal-navy mb-2">Alumni Mentorship Hub</h1>
              <p className="text-akal-secondary mb-0">
                Connect directly with experienced Akal University alumni working in global tech companies, research institutions, finance firms, and civil services.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="p-3 rounded-3 d-inline-block text-start border border-akal-border-grey" style={{ backgroundColor: 'var(--akal-blue-soft)' }}>
                <div className="fw-bold text-akal-blue fs-5">{mentors.length}+ Active Mentors</div>
                <div className="small text-akal-secondary">Ready to guide students & recent grads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-akal-blue" role="status">
              <span className="visually-hidden">Loading mentors...</span>
            </div>
            <p className="text-akal-muted mt-2">Loading alumni mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-5 akal-card border-akal-border-grey p-5 bg-white">
            <Award size={48} className="text-akal-muted mb-3 opacity-50" />
            <h5 className="text-akal-navy fw-bold mb-2">No Mentors Currently Available</h5>
            <p className="text-akal-secondary small mb-0">Check back soon as more alumni register to offer mentorship.</p>
          </div>
        ) : (
          <div className="row g-4">
            {mentors.map((m) => (
              <div key={m.id} className="col-lg-4 col-md-6">
                <AlumniCard 
                  alumni={m} 
                  onConnect={(mentorData) => setSelectedMentor(mentorData)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentorship Request Modal */}
      {selectedMentor && (
        <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ background: 'rgba(23, 35, 51, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="p-4 text-white" style={{ backgroundColor: 'var(--akal-navy)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold text-white">Request Mentorship</h5>
                    <div className="small text-warning mt-1">
                      Mentor: {selectedMentor.first_name} {selectedMentor.last_name} ({selectedMentor.current_company || 'Alumni'})
                    </div>
                  </div>
                  <button onClick={() => setSelectedMentor(null)} className="btn btn-sm btn-outline-light rounded-circle p-1" style={{ width: 32, height: 32 }}>
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="modal-body p-4 bg-white">
                {submitted ? (
                  <div className="text-center py-4 text-success">
                    <CheckCircle2 size={48} className="mb-2" />
                    <h5 className="fw-bold text-akal-navy">Request Sent Successfully!</h5>
                    <p className="small text-akal-secondary">The mentor will receive your inquiry and connect via portal notification or email.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Mentorship Topic / Area *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Cloud Engineering roadmap, resume review, higher studies abroad"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Message / Questions for Mentor *</label>
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        placeholder="Introduce yourself, your current semester or graduation year, and what specific guidance you are seeking..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <div className="d-flex justify-content-end gap-2 pt-2 border-top border-akal-border-grey">
                      <button type="button" onClick={() => setSelectedMentor(null)} className="btn btn-akal-outline btn-sm">
                        Cancel
                      </button>
                      <button type="submit" disabled={submitting} className="btn btn-akal-yellow btn-sm d-flex align-items-center gap-1">
                        <Send size={14} />
                        <span>{submitting ? 'Submitting...' : 'Send Request'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;
