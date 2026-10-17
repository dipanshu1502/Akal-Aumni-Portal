import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Globe, MapPin, Users, Building, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ChaptersPage = () => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await api.get('/public/chapters');
        if (res.status) setChapters(res.data);
      } catch (err) {
        console.error('Failed to load chapters:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, []);

  return (
    <div className="chapters-page py-4">
      <div className="container">
        {/* Header */}
        <div className="bg-white rounded-4 p-4 p-lg-5 mb-4 border" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="d-flex align-items-center gap-2 text-primary small fw-bold text-uppercase mb-2">
            <Globe size={16} />
            <span>GLOBAL ALUMNI PRESENCE</span>
          </div>
          <h1 className="display-6 fw-bold mb-2">Alumni Chapters & Regional Hubs</h1>
          <p className="text-muted mb-0">
            Akal University alumni connect in regional and international chapters across Punjab, Delhi NCR, South India, Canada, and the United Kingdom.
          </p>
        </div>

        {/* Chapters Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <div className="row g-4">
            {chapters.map((ch) => (
              <div key={ch.id} className="col-lg-4 col-md-6">
                <div className="akal-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="stat-icon-wrapper stat-icon-blue">
                        <Globe size={28} />
                      </div>
                      <span className="badge bg-success-subtle text-success fw-bold px-2 py-1 rounded-pill small">
                        ● Active Hub
                      </span>
                    </div>

                    <h4 className="fw-bold text-dark mb-2">{ch.name}</h4>
                    
                    <div className="d-flex align-items-center gap-2 small text-muted mb-3">
                      <MapPin size={15} className="text-danger flex-shrink-0" />
                      <span>{ch.city}{ch.state ? `, ${ch.state}` : ''}, {ch.country}</span>
                    </div>

                    <p className="text-secondary small mb-4">{ch.description}</p>
                  </div>

                  <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-1 small text-muted">
                      <Users size={14} className="text-primary" />
                      <strong>{ch.member_count}+</strong> Members
                    </div>

                    <button 
                      onClick={() => alert(`You have requested to join the ${ch.name}. Regional chapter coordinators will be notified.`)}
                      className="btn btn-sm btn-akal-outline"
                    >
                      <span>Join Chapter</span>
                    </button>
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

export default ChaptersPage;
