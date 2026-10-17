import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, BookOpen, Building, GraduationCap, Eye, Sparkles } from 'lucide-react';

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
    <div className="stories-page py-4">
      <div className="container">
        {/* Header */}
        <div className="bg-white rounded-4 p-4 p-lg-5 mb-4 border" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase mb-2">
            <Sparkles size={16} />
            <span>ALUMNI EXCELLENCE & IMPACT</span>
          </div>
          <h1 className="display-6 fw-bold mb-2">Alumni Success Stories</h1>
          <p className="text-muted mb-0">
            Inspiring professional journeys, research breakthroughs, and societal leadership by Akal University graduates.
          </p>
        </div>

        {/* Stories List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <div className="row g-4">
            {stories.map((story) => (
              <div key={story.id} className="col-lg-6">
                <div className="akal-card p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-warning text-dark fw-bold px-2 py-1 rounded-pill small">
                        ★ Featured Story
                      </span>
                      <span className="small text-muted d-flex align-items-center gap-1">
                        <Eye size={13} /> {story.views_count} views
                      </span>
                    </div>

                    <h4 className="fw-bold text-dark mb-3">{story.title}</h4>

                    <div className="d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-3 border">
                      <div className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center" style={{ width: '42px', height: '42px' }}>
                        AU
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{story.company}</div>
                        <div className="text-muted small">{story.designation} (Batch {story.batch_year})</div>
                      </div>
                    </div>

                    <p className="text-secondary small mb-3 lead" style={{ fontSize: '0.95rem' }}>
                      "{story.summary}"
                    </p>

                    <p className="text-muted small">
                      {story.content}
                    </p>
                  </div>

                  <div className="pt-3 border-top mt-auto text-end">
                    <span className="badge bg-light text-primary border small">Verified Alumni Journey</span>
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
