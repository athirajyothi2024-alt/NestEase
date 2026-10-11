import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentDashboard.css';

const API = 'http://localhost:5001/api';

const ResidentDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );
  const [apartment, setApartment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const results = await Promise.allSettled([
          fetch(`${API}/users/profile`, { headers }),
          fetch(`${API}/apartments/my-apartment`, { headers }),
          fetch(`${API}/payments/my-payments`, { headers }),
          fetch(`${API}/complaints/my-complaints`, { headers }),
          fetch(`${API}/notices/resident`, { headers }),
        ]);

        const [
          profile,
          apartmentResult,
          paymentResult,
          complaintResult,
          noticeResult,
        ] = await Promise.all(
          results.map(async result => {
            if (result.status !== 'fulfilled' || !result.value.ok) {
              return null;
            }
            return result.value.json();
          })
        );

        if (profile?.user) {
          setUser(profile.user);
          localStorage.setItem('user', JSON.stringify(profile.user));
        }

        if (apartmentResult?.apartment) {
          setApartment(apartmentResult.apartment);
        }

        setPayments(paymentResult?.payments || []);
        setComplaints(complaintResult?.complaints || []);
        setNotices(noticeResult?.notices || []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const pendingPayments = payments.filter(
    payment => payment.status === 'pending'
  );

  const activeComplaints = complaints.filter(
    complaint =>
      complaint.status === 'pending' || complaint.status === 'in progress'
  );

  const pendingAmount = pendingPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const formatCurrency = amount =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = date =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="resident-dashboard">
      <aside className="resident-sidebar">
        <div className="resident-logo">NestEase</div>

        <nav className="resident-nav">
          <button
            className="nav-item active"
            onClick={() => navigate('/resident')}
          >
            <span>▦</span> Dashboard
          </button>
          <button className="nav-item" onClick={() => navigate('/apartment')}>
            <span>⌂</span> My Apartment
          </button>
          <button className="nav-item" onClick={() => navigate('/payments')}>
            <span>₹</span> Payments
          </button>
          <button className="nav-item" onClick={() => navigate('/complaints')}>
            <span>◷</span> Complaints
          </button>
          <button className="nav-item" onClick={() => navigate('/notices')}>
            <span>▤</span> Notices
          </button>
          <button className="nav-item" onClick={() => navigate('/profile')}>
            <span>○</span> Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-help">
            <span className="help-icon">?</span>
            <div>
              <strong>Need help?</strong>
              <p>Submit a complaint</p>
            </div>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            ↪ &nbsp; Logout
          </button>
        </div>
      </aside>

      <main className="resident-main">
        <header className="dashboard-topbar">
          <div className="breadcrumb">
            Resident Portal <span>/</span> Dashboard
          </div>

          <div className="topbar-user">
            <button
              className="notification-button"
              onClick={() => navigate('/notices')}
              aria-label="View notices"
              title="View notices"
            >
              ♧{notices.length > 0 && <span className="notification-dot" />}
            </button>

            <button
              className="topbar-profile"
              onClick={() => navigate('/profile')}
              aria-label="Open profile"
            >
              {user.profileImage ? (
                <img
                  src={`http://localhost:5001${user.profileImage}`}
                  alt="Profile"
                />
              ) : (
                <span>{(user.name || 'R').charAt(0).toUpperCase()}</span>
              )}
              <div>
                <strong>{user.name || 'Resident'}</strong>
                <small>Resident</small>
              </div>
              <span className="profile-chevron">⌄</span>
            </button>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <p className="eyebrow">YOUR HOME, MADE EASIER</p>
            <h1>Welcome back, {user.name?.split(' ')[0] || 'Resident'}! 👋</h1>
            <p>Here's what's happening with your apartment today.</p>
          </div>
          <button
            className="primary-action"
            onClick={() => navigate('/complaints')}
          >
            + Raise a complaint
          </button>
        </section>

        <section className="dashboard-cards">
          <button
            className="dashboard-card apartment-card"
            onClick={() => navigate('/apartment')}
          >
            <div className="card-heading">
              <span className="card-icon blue-icon">⌂</span>
              <span className="card-arrow">↗</span>
            </div>
            <h3>My Apartment</h3>
            <p>
              {loading
                ? 'Loading...'
                : apartment?.apartmentNumber ||
                  user.apartmentNumber ||
                  'Not assigned'}
            </p>
            <span className="card-description">
              {apartment
                ? `${apartment.building || ''}${apartment.building ? ' • ' : ''}Floor ${apartment.floor ?? '—'}`
                : 'View your apartment details'}
            </span>
          </button>

          <button
            className="dashboard-card payment-card"
            onClick={() => navigate('/payments')}
          >
            <div className="card-heading">
              <span className="card-icon green-icon">₹</span>
              <span className="card-arrow">↗</span>
            </div>
            <h3>Pending Payments</h3>
            <p>{loading ? 'Loading...' : formatCurrency(pendingAmount)}</p>
            <span className="card-description">
              {pendingPayments.length === 0
                ? 'No pending payments'
                : `${pendingPayments.length} payment${pendingPayments.length === 1 ? '' : 's'} due`}
            </span>
          </button>

          <button
            className="dashboard-card complaint-card"
            onClick={() => navigate('/complaints')}
          >
            <div className="card-heading">
              <span className="card-icon orange-icon">◷</span>
              <span className="card-arrow">↗</span>
            </div>
            <h3>Active Complaints</h3>
            <p>{loading ? 'Loading...' : activeComplaints.length}</p>
            <span className="card-description">
              {activeComplaints.length === 0
                ? 'All caught up!'
                : 'Awaiting resolution'}
            </span>
          </button>
        </section>

        <section className="dashboard-lower-grid">
          <div className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent Notices</h2>
                <p>Updates from your apartment management</p>
              </div>
              <button onClick={() => navigate('/notices')}>View all →</button>
            </div>

            {loading ? (
              <p className="panel-message">Loading notices...</p>
            ) : notices.length === 0 ? (
              <p className="panel-message">No notices available right now.</p>
            ) : (
              <div className="recent-list">
                {notices.slice(0, 3).map(notice => (
                  <div className="recent-item" key={notice._id}>
                    <span className="recent-item-icon notice-icon">▤</span>
                    <div className="recent-item-content">
                      <strong>{notice.title}</strong>
                      <p>{notice.message}</p>
                      {notice.createdAt && (
                        <small>{formatDate(notice.createdAt)}</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent Complaints</h2>
                <p>Track your submitted complaints</p>
              </div>
              <button onClick={() => navigate('/complaints')}>
                View all →
              </button>
            </div>

            {loading ? (
              <p className="panel-message">Loading complaints...</p>
            ) : complaints.length === 0 ? (
              <div className="empty-state">
                <span>✓</span>
                <strong>You're all caught up!</strong>
                <p>You haven't submitted any complaints yet.</p>
              </div>
            ) : (
              <div className="recent-list">
                {complaints.slice(0, 3).map(complaint => (
                  <div className="recent-item" key={complaint._id}>
                    <span className="recent-item-icon complaint-icon">◷</span>
                    <div className="recent-item-content">
                      <strong>{complaint.title}</strong>
                      <p>{complaint.description}</p>
                      <small>
                        {complaint.status}
                        {complaint.createdAt
                          ? ` • ${formatDate(complaint.createdAt)}`
                          : ''}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResidentDashboard;
