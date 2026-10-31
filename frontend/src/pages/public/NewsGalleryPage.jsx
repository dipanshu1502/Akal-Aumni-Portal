import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../services/api';
import { Image, Bell, Calendar, Pin, Camera } from 'lucide-react';

const NewsGalleryPage = () => {
  const [news, setNews] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);

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
                {(() => { let photos = []; try { photos = JSON.parse(alb.photos_json || '[]'); } catch { photos = []; } return (
                <div className="akal-card h-100 overflow-hidden d-flex flex-column bg-white border-akal-border-grey" role="button" tabIndex={0} style={{ cursor: 'pointer' }} aria-label={`View full report for ${alb.title}`} onClick={() => setSelectedAlbum(alb)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedAlbum(alb); } }}>
                  <div 
                    className="p-5 text-white d-flex align-items-center justify-content-center"
                    style={{ 
                      background: alb.cover_image ? `center / cover no-repeat url('${alb.cover_image}')` : 'var(--akal-navy)',
                      minHeight: '150px'
                    }}
                  >
                    {!alb.cover_image && <Image size={44} className="text-white-50" />}
                  </div>

                  <div className="p-4 d-flex flex-column flex-grow-1">
                    <span className="badge bg-akal-blue-soft text-akal-blue align-self-start small mb-2">{alb.category || 'Event'}</span>
                    <h5 className="fw-bold text-akal-navy mb-1">{alb.title}</h5>
                    <p className="text-akal-secondary small mb-3 flex-grow-1">{alb.description?.length > 150 ? `${alb.description.slice(0, 150)}…` : alb.description}</p>
                    {photos.filter((photo) => photo.path).length > 0 ? <div className="row g-2 mt-1">{photos.filter((photo) => photo.path).map((photo, index) => <div className="col-6" key={index}><img src={photo.path} alt={photo.caption || `${alb.title} photo ${index + 1}`} className="img-fluid rounded" /><div className="text-akal-muted small mt-1">{photo.caption}</div></div>)}</div> : <div className="text-akal-muted small pt-2 border-top border-akal-border-grey">{alb.photo_count || 0} Photos Recorded</div>}
                    <div className="small fw-bold text-akal-blue mt-3">Click to view full event report</div>
                  </div>
                </div>
                ); })()}
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
        {selectedAlbum && createPortal((() => {
          let reportPhotos = [];
          try { reportPhotos = JSON.parse(selectedAlbum.report_photos_json || selectedAlbum.photos_json || '[]'); } catch { reportPhotos = []; }
          const detailRows = [
            ['Email Address', selectedAlbum.report_email],
            ['Coordinator(s)', selectedAlbum.report_coordinators],
            ['Department', selectedAlbum.report_department || selectedAlbum.category],
            ['Event Type', selectedAlbum.report_event_type || selectedAlbum.category],
            ['Date of Event', selectedAlbum.report_event_date || selectedAlbum.event_date],
            ['Speaker', selectedAlbum.report_speaker_name || 'Not applicable'],
            ["Speaker's UID", selectedAlbum.report_speaker_uid],
            ['Batch', selectedAlbum.report_batch],
            ['Number of Participants', selectedAlbum.report_participants_count],
          ].filter(([, value]) => value !== null && value !== undefined && value !== '');
          return <div role="dialog" aria-modal="true" aria-label={`${selectedAlbum.title} full event report`} onClick={(event) => { if (event.target === event.currentTarget) setSelectedAlbum(null); }} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(15, 23, 42, 0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="bg-white rounded-4 shadow-lg d-flex flex-column" style={{ width: 'min(960px, 100%)', maxHeight: '90vh', overflow: 'hidden' }}>
              <div className="d-flex justify-content-between align-items-start gap-3 p-4 border-bottom" style={{ background: 'var(--akal-navy)', color: '#fff' }}><div><div className="small text-uppercase fw-bold text-warning mb-1">{selectedAlbum.category || 'Event'} · {selectedAlbum.report_event_date || selectedAlbum.event_date || ''}</div><h3 className="h4 fw-bold mb-0 text-white">{selectedAlbum.title}</h3></div><button type="button" className="btn-close btn-close-white" aria-label="Close report" onClick={() => setSelectedAlbum(null)} /></div>
              <div className="p-4 overflow-auto">
                <div className="row g-3 mb-4">{detailRows.map(([label, value]) => <div className="col-sm-6 col-lg-4" key={label}><div className="small text-muted">{label}</div><div className="fw-semibold text-dark">{value}</div></div>)}</div>
                <h4 className="h6 fw-bold text-akal-navy">Detailed Event Report</h4><p className="text-akal-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selectedAlbum.report_details || selectedAlbum.description || 'No detailed report is available for this album.'}</p>
                {selectedAlbum.report_learning_outcomes && <><h4 className="h6 fw-bold text-akal-navy mt-4">Learning Outcomes</h4><ul className="text-akal-secondary ps-4" style={{ lineHeight: 1.7 }}>{selectedAlbum.report_learning_outcomes.split(/\r?\n/).map((outcome) => outcome.trim().replace(/^[•*-]\s*/, '')).filter(Boolean).map((outcome, index) => <li key={index}>{outcome}</li>)}</ul></>}
                {reportPhotos.some((photo) => photo.path) && <><h4 className="h6 fw-bold text-akal-navy mt-4">Event Photos</h4><div className="row g-3">{reportPhotos.filter((photo) => photo.path).map((photo, index) => <div className="col-sm-6" key={index}><img src={photo.path} alt={photo.caption || `${selectedAlbum.title} photo ${index + 1}`} className="img-fluid rounded-3 w-100" style={{ maxHeight: 360, objectFit: 'contain', background: '#f8fafc' }} />{photo.caption && <div className="small text-muted mt-2">{photo.caption}</div>}</div>)}</div></>}
              </div>
              <div className="p-3 border-top text-end"><button type="button" className="btn btn-akal-primary" onClick={() => setSelectedAlbum(null)}>Close</button></div>
            </div>
          </div>;
        })(), document.body)}
      </div>
    </div>
  );
};

export default NewsGalleryPage;
