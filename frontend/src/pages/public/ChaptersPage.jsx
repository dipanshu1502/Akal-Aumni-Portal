import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Globe, MapPin, Users } from 'lucide-react';

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
    <div className="chapters-page py-4 bg-white min-vh-100">
      <div className="container">
        {/* Header Card */}
        <div className="akal-card p-4 p-lg-5 mb-4 bg-white border-akal-border-grey">
          <div className="d-flex align-items-center gap-2 text-akal-blue small fw-bold text-uppercase mb-2">
            <Globe size={16} />
            <span>GLOBAL ALUMNI PRESENCE & NETWORKING</span>
          </div>
          <h1 className="display-6 fw-bold text-akal-navy mb-2">Alumni Chapters & Regional Hubs</h1>
          <p className="text-akal-secondary mb-0">
            Akal University alumni connect in regional and international chapters across Punjab, Delhi NCR, South India, Canada, the United Kingdom, and the United States.
          </p>
        </div>

        {/* Chapters Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-akal-blue" role="status">
              <span className="visually-hidden">Loading chapters...</span>
            </div>
            <p className="text-akal-muted mt-2">Loading regional chapters...</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-5 akal-card border-akal-border-grey p-5 bg-white">
            <Globe size={48} className="text-akal-muted mb-3 opacity-50" />
            <h5 className="text-akal-navy fw-bold mb-2">No Active Chapters Listed</h5>
            <p className="text-akal-secondary small mb-0">Regional chapters will be displayed here as they are officially chartered.</p>
          </div>
        ) : (
          <div className="row g-4">
            {chapters.map((ch) => (
              <div key={ch.id} className="col-lg-4 col-md-6">
                <div className="akal-card p-4 h-100 d-flex flex-column justify-content-between bg-white border-akal-border-grey">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="stat-icon-wrapper stat-icon-blue">
                        <Globe size={24} />
                      </div>
                      <span className="badge bg-success-subtle text-success fw-bold px-2 py-1 small">
                        ● Active Regional Chapter
                      </span>
                    </div>

                    <h4 className="fw-bold text-akal-navy mb-2" style={{ fontSize: '1.15rem' }}>{ch.name}</h4>
                    
                    <div className="d-flex align-items-center gap-2 small text-akal-secondary mb-3">
                      <MapPin size={15} className="text-akal-blue flex-shrink-0" />
                      <span>{ch.city}{ch.state ? `, ${ch.state}` : ''}, {ch.country}</span>
                    </div>

                    <p className="text-akal-secondary small mb-4" style={{ lineHeight: 1.6 }}>{ch.description}</p>
                  </div>

                  <div className="pt-3 border-top border-akal-border-grey mt-auto d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-1 small text-akal-secondary">
                      <Users size={14} className="text-akal-blue" />
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
