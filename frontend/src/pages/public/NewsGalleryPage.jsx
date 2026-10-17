import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Image, Bell, Calendar, Tag, Pin, Camera } from 'lucide-react';

const NewsGalleryPage = () => {
  const [news, setNews] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsRes, galleryRes] = await Promise.all([
          api.get('/public/news'),
          api.get('/public/gallery')
        ]);
        if (newsRes.status) setNews(newsRes.data);
        if (galleryRes.status) setAlbums(galleryRes.data);
      } catch (err) {
        console.error('Failed to load news/gallery:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="news-gallery-page py-4">
      <div className="container">
        {/* Header */}
        <div className="bg-white rounded-4 p-4 p-lg-5 mb-4 border" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="d-flex align-items-center gap-2 text-primary small fw-bold text-uppercase mb-2">
            <Bell size={16} />
            <span>CAMPUS PULSE & MEDIA</span>
          </div>
          <h1 className="display-6 fw-bold mb-2">News, Announcements & Gallery</h1>
          <p className="text-muted mb-0">
            Stay updated with official Akal University alumni announcements, convocation photo highlights, and campus developments.
          </p>
        </div>

        {/* Section 1: News & Announcements */}
        <div className="mb-5">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Bell size={20} className="text-primary" />
            <h3 className="fw-bold mb-0">Official Announcements</h3>
          </div>

          <div className="row g-4">
            {news.map((item) => (
              <div key={item.id} className="col-lg-6">
                <div className={`akal-card p-4 h-100 ${item.is_pinned ? 'border-primary border-2' : ''}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary-subtle text-primary fw-bold small text-uppercase">
                      {item.category}
                    </span>
                    {item.is_pinned && (
                      <span className="badge bg-warning text-dark d-flex align-items-center gap-1 small fw-bold">
                        <Pin size={12} /> Pinned
                      </span>
                    )}
                  </div>

                  <h5 className="fw-bold text-dark mb-2">{item.title}</h5>
                  <p className="text-muted small mb-3">{item.content}</p>

                  <div className="pt-2 border-top small text-muted d-flex align-items-center gap-1">
                    <Calendar size={13} className="text-warning" />
                    <span>Published: {new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Media Gallery */}
        <div>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Camera size={20} className="text-warning" />
            <h3 className="fw-bold mb-0">Photo Gallery Albums</h3>
          </div>

          <div className="row g-4">
            {albums.map((alb) => (
              <div key={alb.id} className="col-lg-4 col-md-6">
                <div className="akal-card h-100 overflow-hidden d-flex flex-column">
                  <div 
                    className="p-5 text-white d-flex align-items-center justify-content-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #075985 0%, #087BB5 60%, #172333 100%)',
                      minHeight: '160px'
                    }}
                  >
                    <Image size={48} className="opacity-50" />
                  </div>

                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <span className="badge bg-light text-dark border align-self-start small mb-2">{alb.category}</span>
                    <h5 className="fw-bold text-dark mb-2">{alb.title}</h5>
                    <p className="text-muted small flex-grow-1">{alb.description}</p>
                    <div className="pt-2 border-top small text-muted d-flex align-items-center gap-1 mt-auto">
                      <Calendar size={13} className="text-primary" />
                      <span>{alb.event_date ? new Date(alb.event_date).toLocaleDateString() : 'Campus Memory'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsGalleryPage;
