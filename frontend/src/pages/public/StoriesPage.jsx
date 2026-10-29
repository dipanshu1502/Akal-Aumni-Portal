import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Eye, Sparkles } from 'lucide-react';

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await api.get('/public/stories');
        if (res.status) setStories(res.data);
      } catch (err) {
        console.error('Failed to load stories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  return (
    <div className="stories-page py-4 bg-white min-vh-100">
      <div className="container">
        {/* Header Card */}
        <div className="akal-card p-4 p-lg-5 mb-4 bg-white border-akal-border-grey">
          <div className="d-flex align-items-center gap-2 text-akal-blue small fw-bold text-uppercase mb-2">
            <Sparkles size={16} />
            <span>ALUMNI EXCELLENCE & IMPACT</span>
          </div>
          <h1 className="display-6 fw-bold text-akal-navy mb-2">Alumni Success Stories</h1>
          <p className="text-akal-secondary mb-0">
            Inspiring professional journeys, research breakthroughs, and societal leadership by Akal University graduates.
          </p>
        </div>

        {/* Stories List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-akal-blue" role="status">
              <span className="visually-hidden">Loading stories...</span>
            </div>
            <p className="text-akal-muted mt-2">Loading alumni journeys...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-5 akal-card border-akal-border-grey p-5 bg-white">
            <Sparkles size={48} className="text-akal-muted mb-3 opacity-50" />
            <h5 className="text-akal-navy fw-bold mb-2">No Stories Published Yet</h5>
            <p className="text-akal-secondary small mb-0">Alumni success stories will be featured here as they are published.</p>
          </div>
        ) : (
          <div className="row g-4">
            {stories.map((story) => (
              <div key={story.id} className="col-lg-6">
                <div className="akal-card p-4 h-100 d-flex flex-column justify-content-between bg-white border-akal-border-grey">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge-akal-distinguished">
                        ★ Featured Alumni Story
                      </span>
                      <span className="small text-akal-muted d-flex align-items-center gap-1">
                        <Eye size={13} /> {story.views_count} views
                      </span>
                    </div>

                    <h4 className="fw-bold text-akal-navy mb-3" style={{ fontSize: '1.2rem' }}>{story.title}</h4>

                    <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3 border border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                      <div className="rounded-circle bg-akal-blue text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                        AU
                      </div>
                      <div>
                        <div className="fw-bold text-akal-navy">{story.company}</div>
                        <div className="text-akal-muted small">{story.designation} (Batch {story.batch_year})</div>
                      </div>
                    </div>

                    <p className="text-akal-secondary small mb-3 fst-italic lead" style={{ fontSize: '0.98rem' }}>
                      "{story.summary}"
                    </p>

                    <p className="text-akal-secondary small" style={{ lineHeight: 1.6 }}>
                      {story.content}
                    </p>
                  </div>

                  <div className="pt-3 border-top border-akal-border-grey mt-auto text-end">
                    <span className="badge bg-akal-blue-soft text-akal-blue small">Verified Alumni Journey</span>
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

export default StoriesPage;
