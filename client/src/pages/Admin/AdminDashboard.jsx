import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const API = 'http://localhost:5001/api';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user') || '{}')
  );

  const [stats, setStats] = useState({
    apartments: 0,
    residents: 0,
    pendingPayments: 0,
    openComplaints: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/');
      return;
    }

    const fetchDashboardStats = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const responses = await Promise.all([
          fetch(`${API}/apartments`, { headers }),
          fetch(`${API}/users/residents`, { headers }),
          fetch(`${API}/payments`, { headers }),
          fetch(`${API}/complaints`, { headers }),
          fetch(`${API}/users/profile`, { headers }),
        ]);

        const data = await Promise.all(
          responses.map(async response => {
            const body = await response.json();

            if (!response.ok) {
              throw new Error(body.message || 'Unable to load dashboard');
            }

            return body;
          })
        );

        const [
          apartmentsData,
          residentsData,
          paymentsData,
          complaintsData,
          profileData,
        ] = data;

        const payments = paymentsData.payments || [];
        const complaints = complaintsData.complaints || [];

        setStats({
          apartments: (apartmentsData.apartments || []).length,
          residents: (residentsData.residents || []).length,
          pendingPayments: payments.filter(
            payment => payment.status === 'pending'
          ).length,
          openComplaints: complaints.filter(
            complaint =>
              complaint.status === 'pending' ||
              complaint.status === 'in progress'
          ).length,
        });

        if (profileData.user) {
          setUser(profileData.user);
          localStorage.setItem('user', JSON.stringify(profileData.user));
        }
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const cards = [
    {
      title: 'Total Apartments',
      value: stats.apartments,
      description: 'Registered apartments',
      icon: '⌂',
      tone: 'blue',
      route: '/admin/apartments',
    },
    {
      title: 'Total Residents',
      value: stats.residents,
      description: 'Registered residents',
      icon: '♙',
      tone: 'green',
      route: '/admin/residents',
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      description: 'Payments requiring attention',
      icon: '₹',
      tone: 'purple',
      route: '/admin/payments',
    },
    {
      title: 'Open Complaints',
      value: stats.openComplaints,
      description: 'Complaints to review',
      icon: '◷',
      tone: 'orange',
      route: '/admin/complaints',
    },
  ];

  const navigation = [
    { label: 'Dashboard', icon: '▦', route: '/admin', active: true },
    { label: 'Apartments', icon: '⌂', route: '/admin/apartments' },
    { label: 'Residents', icon: '♙', route: '/admin/residents' },
    { label: 'Payments', icon: '₹', route: '/admin/payments' },
    { label: 'Complaints', icon: '◷', route: '/admin/complaints' },
    { label: 'Notices', icon: '▤', route: '/admin/notices' },
  ];

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">NestEase</div>

        <div className="admin-sidebar-label">WORKSPACE</div>

        <nav className="admin-nav">
          {navigation.map(item => (
            <button
              key={item.route}
              className={`admin-nav-item ${item.active ? 'active' : ''}`}
              onClick={() => navigate(item.route)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
              {item.active && <span className="admin-active-dot" />}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-help-card">
            <span className="admin-help-icon">?</span>
            <div>
              <strong>Need assistance?</strong>
              <p>Manage your community</p>
            </div>
          </div>

          <button className="admin-logout-button" onClick={handleLogout}>
            ↪ &nbsp; Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            Admin Portal <span>/</span> Dashboard
          </div>

          <button
            className="admin-profile-button"
            onClick={() => navigate('/admin/residents')}
          >
            <span className="admin-avatar">
              {(user.name || 'A').charAt(0).toUpperCase()}
            </span>
            <span className="admin-profile-text">
              <strong>{user.name || 'Administrator'}</strong>
              <small>Administrator</small>
            </span>
          </button>
        </header>

        <section className="admin-welcome">
          <div>
            <p className="admin-eyebrow">COMMUNITY OVERVIEW</p>
            <h1>Welcome back, {user.name?.split(' ')[0] || 'Admin'}!</h1>
            <p>Manage your apartment community from one place.</p>
          </div>

          <button
            className="admin-primary-action"
            onClick={() => navigate('/admin/apartments')}
          >
            + Add apartment
          </button>
        </section>

        {error && (
          <div className="admin-error-message">
            <span>{error}</span>
            <button onClick={() => window.location.reload()}>Try again</button>
          </div>
        )}

        <section className="admin-summary-cards">
          {cards.map(card => (
            <button
              className="admin-summary-card"
              key={card.title}
              onClick={() => navigate(card.route)}
            >
              <div className="admin-card-heading">
                <span className={`admin-card-icon ${card.tone}`}>
                  {card.icon}
                </span>
                <span className="admin-card-arrow">↗</span>
              </div>

              <h3>{card.title}</h3>
              <p>{loading ? '...' : card.value}</p>
              <span className="admin-card-description">{card.description}</span>
            </button>
          ))}
        </section>

        <section className="admin-quick-actions">
          <div className="admin-section-heading">
            <div>
              <h2>Quick Actions</h2>
              <p>Common tasks for managing your community</p>
            </div>
          </div>

          <div className="admin-action-grid">
            <button
              className="admin-action-card"
              onClick={() => navigate('/admin/apartments')}
            >
              <span className="admin-action-icon blue">⌂</span>
              <span>
                <strong>Manage Apartments</strong>
                <small>Add apartments and assign residents</small>
              </span>
              <span className="admin-action-arrow">→</span>
            </button>

            <button
              className="admin-action-card"
              onClick={() => navigate('/admin/residents')}
            >
              <span className="admin-action-icon green">♙</span>
              <span>
                <strong>Manage Residents</strong>
                <small>View and register residents</small>
              </span>
              <span className="admin-action-arrow">→</span>
            </button>

            <button
              className="admin-action-card"
              onClick={() => navigate('/admin/payments')}
            >
              <span className="admin-action-icon purple">₹</span>
              <span>
                <strong>Manage Payments</strong>
                <small>Review payments and due amounts</small>
              </span>
              <span className="admin-action-arrow">→</span>
            </button>

            <button
              className="admin-action-card"
              onClick={() => navigate('/admin/notices')}
            >
              <span className="admin-action-icon orange">▤</span>
              <span>
                <strong>Publish a Notice</strong>
                <small>Share updates with residents</small>
              </span>
              <span className="admin-action-arrow">→</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
