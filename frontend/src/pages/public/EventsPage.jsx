import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, MapPin, Clock, Users, Video, CheckCircle2, UserPlus, X } from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [registeredEventIds, setRegisteredEventIds] = useState([]);
  const [registrationEvent, setRegistrationEvent] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({ attendee_name: '', attendee_email: '', attendee_phone: '' });
  const [registrationSaving, setRegistrationSaving] = useState(false);
  const [registrationError, setRegistrationError] = useState('');

  const now = new Date();

  // Helper: determine if an event is upcoming or past based on its start_datetime
  const isUpcoming = (ev) => {
    if (!ev.start_datetime) return false;
    return new Date(ev.start_datetime) >= now;
  };
  const isPast = (ev) => {
    if (!ev.start_datetime) return false;
    return new Date(ev.start_datetime) < now;
  };

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
    if (activeTab === 'upcoming') return isUpcoming(e);
    if (activeTab === 'past') return isPast(e);
    if (activeTab === 'reunion') return e.event_type === 'reunion';
    if (activeTab === 'webinar') return e.is_virtual || e.event_type === 'webinar';
    if (activeTab === 'meetup') return e.event_type === 'meetup' || e.event_type === 'conference';
    return true;
  });

  const handleRegistrationSubmit = async (event) => {
    event.preventDefault();
    if (!registrationEvent) return;
    setRegistrationSaving(true);
    setRegistrationError('');
    try {
      const response = await api.post(`/public/events/${registrationEvent.id}/register`, registrationForm);
      if (!response.status) throw new Error(response.message || 'Registration failed');
      setRegisteredEventIds((current) => [...new Set([...current, registrationEvent.id])]);
      setEvents((current) => current.map((item) => item.id === registrationEvent.id
        ? { ...item, registration_count: response.data.registration_count }
        : item));
      setRegistrationEvent(null);
      setRegistrationForm({ attendee_name: '', attendee_email: '', attendee_phone: '' });
    } catch (error) {
      setRegistrationError(error.message || 'Could not register for this event.');
    } finally {
      setRegistrationSaving(false);
    }
  };

  return (
    <div className="events-page py-4 bg-white min-vh-100">
      <div className="container">
        {/* Header Card */}
        <div className="akal-card p-4 p-lg-5 mb-4 bg-white border-akal-border-grey">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-4">
            <div>
              <div className="d-flex align-items-center gap-2 text-akal-blue small fw-bold text-uppercase mb-2">
                <Calendar size={16} />
                <span>UNIVERSITY ENGAGEMENT & ALUMNI MEETS</span>
              </div>
              <h1 className="display-6 fw-bold text-akal-navy mb-2">Events & Reunions</h1>
              <p className="text-akal-secondary mb-0">
                Join campus reunions, technical webinars, leadership summits, and global alumni networking meetups.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`filter-chip ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Events
              </button>
              <button
                className={`filter-chip ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                <Clock size={14} className="me-1" />
                Upcoming
              </button>
              <button
                className={`filter-chip ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past Events
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
            <div className="spinner-border text-akal-blue" role="status">
              <span className="visually-hidden">Loading events...</span>
            </div>
            <p className="text-akal-muted mt-2">Loading campus events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-5 akal-card border-akal-border-grey p-5 bg-white">
            <Calendar size={48} className="text-akal-muted mb-3 opacity-50" />
            <h5 className="text-akal-navy fw-bold mb-2">No events found</h5>
            <p className="text-akal-secondary small mb-3">
              {activeTab === 'upcoming' && 'There are no upcoming events at the moment. Check back soon!'}
              {activeTab === 'past' && 'No past events have been recorded yet.'}
              {activeTab === 'all' && 'No published events are available at the moment.'}
              {(activeTab === 'reunion' || activeTab === 'webinar' || activeTab === 'meetup') && 'No events match this category. Try another filter.'}
            </p>
            <button onClick={() => setActiveTab('all')} className="btn btn-akal-primary btn-sm">
              Show All Events
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredEvents.map((ev) => (
              <div key={ev.id} className="col-lg-4 col-md-6">
                <div className="akal-card h-100 p-4 d-flex flex-column bg-white border-akal-border-grey">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge bg-akal-blue-soft text-akal-blue text-uppercase px-2 py-1 fw-bold" style={{ fontSize: '0.72rem' }}>
                      {ev.event_type}
                    </span>
                    {ev.is_virtual ? (
                      <span className="badge bg-light text-akal-secondary border small d-flex align-items-center gap-1">
                        <Video size={12} /> Virtual Meet
                      </span>
                    ) : (
                      <span className="badge bg-light text-akal-navy border small">Campus Event</span>
                    )}
                  </div>

                  <h4 className="fw-bold text-akal-navy mb-2" style={{ fontSize: '1.15rem' }}>{ev.title}</h4>
                  <p className="text-akal-secondary small flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ev.description}
                  </p>

                  <div className="p-3 rounded-3 mb-3 small d-flex flex-column gap-2 border border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                    <div className="d-flex align-items-center gap-2 text-akal-navy">
                      <Calendar size={15} className="text-akal-blue flex-shrink-0" />
                      <strong>{new Date(ev.start_datetime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                    </div>

                    <div className="d-flex align-items-center gap-2 text-akal-secondary">
                      <MapPin size={15} className="text-akal-blue flex-shrink-0" />
                      <span className="text-truncate">{ev.venue || 'Virtual Online Platform'}</span>
                    </div>

                    {ev.max_capacity > 0 && (
                      <div className="d-flex align-items-center gap-2 text-akal-secondary">
                        <Users size={15} className="text-akal-blue flex-shrink-0" />
                        <span>Capacity: {ev.max_capacity} Attendees</span>
                      </div>
                    )}
                    <div className="d-flex align-items-center gap-2 text-akal-secondary">
                      <Users size={15} className="text-akal-blue flex-shrink-0" />
                      <span>{Number(ev.registration_count || 0)} registered attendees</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {registeredEventIds.includes(ev.id) ? (
                      <button className="btn btn-success w-100 d-flex align-items-center justify-content-center gap-2" disabled>
                        <CheckCircle2 size={16} /> Registered
                      </button>
                    ) : (
                      <button onClick={() => { setRegistrationEvent(ev); setRegistrationError(''); }} className="btn btn-akal-primary w-100 justify-content-center">
                        <UserPlus size={16} /> <span>Register for Event</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event Registration Modal */}
        {registrationEvent && (
          <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true" style={{ background: 'rgba(23, 35, 51, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <form onSubmit={handleRegistrationSubmit}>
                  <div className="p-4 text-white" style={{ backgroundColor: 'var(--akal-navy)' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="small text-uppercase text-warning fw-bold">Event Registration</div>
                        <h5 className="modal-title fw-bold text-white mb-0">{registrationEvent.title}</h5>
                      </div>
                      <button type="button" className="btn btn-sm btn-outline-light rounded-circle p-1" aria-label="Close" onClick={() => setRegistrationEvent(null)}>
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="modal-body p-4 bg-white">
                    <p className="small text-akal-secondary mb-3">Please fill in your details to confirm registration. Attendance instructions will be sent via email.</p>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Full Name *</label>
                      <input className="form-control" value={registrationForm.attendee_name} onChange={(e) => setRegistrationForm({ ...registrationForm, attendee_name: e.target.value })} required maxLength={150} placeholder="e.g. Gurpreet Singh" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Email Address *</label>
                      <input type="email" className="form-control" value={registrationForm.attendee_email} onChange={(e) => setRegistrationForm({ ...registrationForm, attendee_email: e.target.value })} required maxLength={191} placeholder="e.g. name@example.com" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input type="tel" className="form-control" value={registrationForm.attendee_phone} onChange={(e) => setRegistrationForm({ ...registrationForm, attendee_phone: e.target.value })} maxLength={30} placeholder="e.g. +91 9876543210" />
                    </div>
                    {registrationError && <div className="alert alert-danger small mt-3 mb-0">{registrationError}</div>}
                  </div>
                  <div className="modal-footer px-4 py-3 border-top border-akal-border-grey" style={{ backgroundColor: 'var(--akal-soft-white)' }}>
                    <button type="button" className="btn btn-akal-outline btn-sm" onClick={() => setRegistrationEvent(null)} disabled={registrationSaving}>Cancel</button>
                    <button type="submit" className="btn btn-akal-primary btn-sm" disabled={registrationSaving}>{registrationSaving ? 'Registering…' : 'Confirm Registration'}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
