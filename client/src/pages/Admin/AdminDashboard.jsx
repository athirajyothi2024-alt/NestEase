import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    apartments: 0,
    residents: 0,
    pendingPayments: 0,
    openComplaints: 0,
  });

  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch all required data
      const [
        apartmentsResponse,
        residentsResponse,
        paymentsResponse,
        complaintsResponse,
      ] = await Promise.all([
        fetch('http://localhost:5001/api/apartments', {
          headers,
        }),

        fetch('http://localhost:5001/api/users/residents', {
          headers,
        }),

        fetch('http://localhost:5001/api/payments', {
          headers,
        }),

        fetch('http://localhost:5001/api/complaints', {
          headers,
        }),
      ]);

      const apartmentsData = await apartmentsResponse.json();
      const residentsData = await residentsResponse.json();
      const paymentsData = await paymentsResponse.json();
      const complaintsData = await complaintsResponse.json();

      if (!apartmentsResponse.ok) {
        throw new Error(apartmentsData.message || 'Failed to fetch apartments');
      }

      if (!residentsResponse.ok) {
        throw new Error(residentsData.message || 'Failed to fetch residents');
      }

      if (!paymentsResponse.ok) {
        throw new Error(paymentsData.message || 'Failed to fetch payments');
      }

      if (!complaintsResponse.ok) {
        throw new Error(complaintsData.message || 'Failed to fetch complaints');
      }

      const pendingPayments = paymentsData.payments.filter(
        payment => payment.status === 'pending'
      );

      const openComplaints = complaintsData.complaints.filter(
        complaint =>
          complaint.status === 'pending' || complaint.status === 'in progress'
      );

      setStats({
        apartments: apartmentsData.apartments.length,
        residents: residentsData.residents.length,
        pendingPayments: pendingPayments.length,
        openComplaints: openComplaints.length,
      });
    } catch (error) {
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">NestEase</div>

        <nav className="admin-nav">
          <button className="admin-nav-item active">Dashboard</button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/notices')}
          >
            Notices
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/apartments')}
          >
            Apartments
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/residents')}
          >
            Residents
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/payments')}
          >
            Payments
          </button>

          <button
            className="admin-nav-item"
            onClick={() => navigate('/admin/complaints')}
          >
            Complaints
          </button>
        </nav>

        <button
          className="admin-logout-button"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
          }}
        >
          Logout
        </button>
      </aside>

      <main className="admin-main">
        <div className="admin-welcome">
          <h1>Admin Dashboard</h1>
          <p>Manage your apartment community from one place.</p>
        </div>

        <div className="admin-summary-cards">
          <div className="admin-summary-card">
            <h3>Total Apartments</h3>

            <p>{loading ? '...' : stats.apartments}</p>

            <span>Registered apartments</span>
          </div>

          <div className="admin-summary-card">
            <h3>Total Residents</h3>

            <p>{loading ? '...' : stats.residents}</p>

            <span>Registered residents</span>
          </div>

          <div className="admin-summary-card">
            <h3>Pending Payments</h3>

            <p>{loading ? '...' : stats.pendingPayments}</p>

            <span>Payments requiring attention</span>
          </div>

          <div className="admin-summary-card">
            <h3>Open Complaints</h3>

            <p>{loading ? '...' : stats.openComplaints}</p>

            <span>Complaints to review</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
