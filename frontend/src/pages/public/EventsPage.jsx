import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, MapPin, Clock, Users, Video, CheckCircle2, Sparkles, PlusCircle } from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [registeredEventId, setRegisteredEventId] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/public/events');
        if (res.status) setEvents(res.data);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    if (activeTab === 'all') return true;
    if (activeTab === 'reunion') return e.event_type === 'reunion';
    if (activeTab === 'webinar') return e.is_virtual || e.event_type === 'webinar';
    if (activeTab === 'meetup') return e.event_type === 'meetup' || e.event_type === 'conference';
    return true;
  });

  const handleQuickRegister = (eventId) => {
    setRegisteredEventId(eventId);
    setTimeout(() => {
      alert('Event Registration Successful! Confirmation details and pass have been registered.');
    }, 200);
  };

  return (
    <div className="events-page py-4">
      <div className="container">
        {/* Header */}
        <div className="bg-white rounded-4 p-4 p-lg-5 mb-4 border" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 text-warning small fw-bold text-uppercase mb-2">
                <Calendar size={16} />
                <span>UNIVERSITY ENGAGEMENT</span>
              </div>
              <h1 className="display-6 fw-bold mb-2">Events & Reunions</h1>
              <p className="text-muted mb-0">
                Join campus reunions, technical webinars, leadership summits, and global alumni networking meetups.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex gap-2">
              <button 
                className={`filter-chip ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Events
              </button>
              <button 
                className={`filter-chip ${activeTab === 'reunion' ? 'active' : ''}`}
                onClick={() => setActiveTab('reunion')}
              >
                Reunions
              </button>
              <button 
                className={`filter-chip ${activeTab === 'webinar' ? 'active' : ''}`}
                onClick={() => setActiveTab('webinar')}
              >
                Webinars
              </button>
              <button 
                className={`filter-chip ${activeTab === 'meetup' ? 'active' : ''}`}
                onClick={() => setActiveTab('meetup')}
              >
                Meetups & Fairs
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <div className="row g-4">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="col-lg-4 col-md-6">
                <div className="akal-card h-100 p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge bg-primary text-white text-uppercase px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                      {ev.event_type}
                    </span>
                    {ev.is_virtual ? (
                      <span className="badge bg-info-subtle text-info d-flex align-items-center gap-1 small">
                        <Video size={12} /> Virtual Meet
                      </span>
                    ) : (
                      <span className="badge bg-light text-dark border small">On Campus</span>
                    )}
                  </div>

                  <h4 className="fw-bold text-dark mb-2">{ev.title}</h4>
                  <p className="text-muted small flex-grow-1">{ev.description}</p>

                  <div className="bg-light p-3 rounded-3 mb-3 small d-flex flex-column gap-2 border">
                    <div className="d-flex align-items-center gap-2 text-dark">
                      <Calendar size={15} className="text-warning flex-shrink-0" />
                      <strong>{new Date(ev.start_datetime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                    </div>

                    <div className="d-flex align-items-center gap-2 text-muted">
                      <MapPin size={15} className="text-danger flex-shrink-0" />
                      <span className="text-truncate">{ev.venue || 'Virtual Online Platform'}</span>
                    </div>

                    {ev.max_capacity > 0 && (
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Users size={15} className="text-primary flex-shrink-0" />
                        <span>Capacity: {ev.max_capacity} Attendees</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto">
                    {registeredEventId === ev.id ? (
                      <button className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2" disabled>
                        <CheckCircle2 size={16} /> Registered
                      </button>
                    ) : (
                      <button onClick={() => handleQuickRegister(ev.id)} className="btn btn-akal-primary w-100 justify-content-center">
                        <span>Register for Event</span>
                      </button>
                    )}
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

export default EventsPage;
