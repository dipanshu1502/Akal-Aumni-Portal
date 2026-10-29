import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Image, Bell, Calendar, Pin, Camera } from 'lucide-react';

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
    <div className="news-gallery-page py-4 bg-white min-vh-100">
      <div className="container">
        {/* Header Card */}
        <div className="akal-card p-4 p-lg-5 mb-4 bg-white border-akal-border-grey">
          <div className="d-flex align-items-center gap-2 text-akal-blue small fw-bold text-uppercase mb-2">
            <Bell size={16} />
            <span>CAMPUS PULSE & OFFICIAL MEDIA</span>
          </div>
          <h1 className="display-6 fw-bold text-akal-navy mb-2">News, Announcements & Gallery</h1>
          <p className="text-akal-secondary mb-0">
            Stay updated with official Akal University alumni announcements, convocation photo highlights, and campus developments.
          </p>
        </div>

        {/* Section 1: News & Announcements */}
        <div className="mb-5">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Bell size={20} className="text-akal-blue" />
            <h3 className="fw-bold text-akal-navy mb-0">Official Announcements</h3>
          </div>

          <div className="row g-4">
            {news.map((item) => (
              <div key={item.id} className="col-lg-6">
                <div className={`akal-card p-4 h-100 bg-white ${item.is_pinned ? 'border-akal-blue border-2' : 'border-akal-border-grey'}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-akal-blue-soft text-akal-blue fw-bold small text-uppercase">
                      {item.category}
                    </span>
                    {item.is_pinned && (
                      <span className="badge-akal-distinguished">
                        <Pin size={12} /> Pinned Announcement
                      </span>
                    )}
                  </div>

                  <h5 className="fw-bold text-akal-navy mb-2" style={{ fontSize: '1.1rem' }}>{item.title}</h5>
                  <p className="text-akal-secondary small mb-3" style={{ lineHeight: 1.6 }}>{item.content}</p>

                  <div className="pt-2 border-top border-akal-border-grey small text-akal-muted d-flex align-items-center gap-1">
                    <Calendar size={13} className="text-akal-blue" />
                    <span>Published: {new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            ))}
            {!loading && news.length === 0 && (
              <div className="col-12">
                <div className="akal-card p-4 text-center text-akal-muted bg-white border-akal-border-grey">
                  No announcements published at this time.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Media Gallery */}
        <div>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Camera size={20} className="text-akal-blue" />
            <h3 className="fw-bold text-akal-navy mb-0">Photo Gallery Albums</h3>
          </div>

          <div className="row g-4">
            {albums.map((alb) => (
              <div key={alb.id} className="col-lg-4 col-md-6">
                <div className="akal-card h-100 overflow-hidden d-flex flex-column bg-white border-akal-border-grey">
                  <div 
                    className="p-5 text-white d-flex align-items-center justify-content-center"
                    style={{ 
                      background: 'var(--akal-navy)',
                      minHeight: '150px'
                    }}
                  >
                    <Image size={44} className="text-white-50" />
                  </div>

                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <span className="badge bg-akal-blue-soft text-akal-blue align-self-start small mb-2">{alb.category || 'Event'}</span>
                    <h5 className="fw-bold text-akal-navy mb-1">{alb.title}</h5>
                    <p className="text-akal-secondary small mb-3 flex-grow-1">{alb.description}</p>
                    <div className="text-akal-muted small pt-2 border-top border-akal-border-grey">
                      {alb.photo_count || 0} Photos Recorded
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {!loading && albums.length === 0 && (
              <div className="col-12">
                <div className="akal-card p-4 text-center text-akal-muted bg-white border-akal-border-grey">
                  Campus media albums will appear here.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsGalleryPage;
