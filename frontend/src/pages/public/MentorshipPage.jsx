import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import AlumniCard from '../../components/common/AlumniCard';
import { useAuth } from '../../context/AuthContext';
import { Award, BookOpen, MessageSquare, CheckCircle2, Sparkles, Send } from 'lucide-react';

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
        }, 2000);
      }
    } catch (err) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mentorship-page py-4">
      <div className="container">
        {/* Header */}
        <div className="bg-white rounded-4 p-4 p-lg-5 mb-4 border" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase mb-2">
                <Award size={16} />
                <span>CAREER & ACADEMIC GUIDANCE</span>
              </div>
              <h1 className="display-6 fw-bold mb-2">Alumni Mentorship Hub</h1>
              <p className="text-muted mb-0">
                Connect directly with experienced Akal University alumni working in global tech companies, research institutions, finance firms, and civil services.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <div className="p-3 bg-light rounded-3 d-inline-block text-start border">
                <div className="fw-bold text-primary">{mentors.length}+ Active Mentors</div>
                <div className="small text-muted">Ready to guide students & recent grads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="p-4 bg-primary text-white" style={{ background: 'var(--grad-primary)' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">Request Mentorship</h5>
                  <button onClick={() => setSelectedMentor(null)} className="btn btn-sm btn-outline-light rounded-circle">✕</button>
                </div>
                <div className="small text-warning mt-1">
                  Mentor: {selectedMentor.first_name} {selectedMentor.last_name} ({selectedMentor.current_company || 'Alumni'})
                </div>
              </div>

              <div className="modal-body p-4">
                {submitted ? (
                  <div className="text-center py-4 text-success">
                    <CheckCircle2 size={48} className="mb-2" />
                    <h5 className="fw-bold">Request Sent Successfully!</h5>
                    <p className="small text-muted">The mentor will receive your inquiry and connect via portal notification or email.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRequestSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Mentorship Topic / Area</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Cloud Engineering roadmap, resume review, higher studies in Canada"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold">Message / Questions for Mentor</label>
                      <textarea 
                        className="form-control" 
                        rows="4" 
                        placeholder="Introduce yourself, your current semester or graduation year, and what specific guidance you are looking for..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>

                    <div className="d-flex justify-content-end gap-2 pt-2">
                      <button type="button" onClick={() => setSelectedMentor(null)} className="btn btn-light btn-sm">
                        Cancel
                      </button>
                      <button type="submit" disabled={submitting} className="btn btn-akal-yellow btn-sm d-flex align-items-center gap-1">
                        <Send size={14} />
                        {submitting ? 'Submitting...' : 'Send Request'}
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
