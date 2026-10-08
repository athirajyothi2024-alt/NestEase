import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ResidentDashboard.css';

const ResidentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/');
  };

  return (
    <div className="resident-dashboard">
      {/* Sidebar */}
      <aside className="resident-sidebar">
        <div className="resident-logo">NestEase</div>

        <nav className="resident-nav">
          <button className="nav-item active">Dashboard</button>

          <button className="nav-item" onClick={() => navigate('/apartment')}>
            My Apartment
          </button>

          <button className="nav-item" onClick={() => navigate('/payments')}>
            Payments
          </button>

          <button className="nav-item" onClick={() => navigate('/complaints')}>
            Complaints
          </button>

          <button className="nav-item" onClick={() => navigate('/notices')}>
            Notices
          </button>

          <button className="nav-item" onClick={() => navigate('/profile')}>
            Profile
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="resident-main">
        <div className="welcome-section">
          <h1>Welcome back! 👋</h1>

          <p>Here's what's happening with your apartment today.</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>My Apartment</h3>
            <p>A-101</p>
            <span>Block A • Floor 1</span>
          </div>

          <div className="dashboard-card">
            <h3>Payment Status</h3>
            <p>Up to Date</p>
            <span>No pending payments</span>
          </div>

          <div className="dashboard-card">
            <h3>Complaints</h3>
            <p>0 Active</p>
            <span>No open complaints</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResidentDashboard;
