import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminComplaints.css';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchComplaints = async () => {
    try {
      setError('');

      const response = await fetch('http://localhost:5001/api/complaints', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch complaints');
      }

      setComplaints(data.complaints || []);
    } catch (error) {
      console.error('Fetch complaints error:', error);
      setError(error.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId, status) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/complaints/${complaintId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update complaint status');
      }

      await fetchComplaints();
    } catch (error) {
      console.error('Update complaint error:', error);
      alert(error.message || 'Unable to connect to server');
    }
  };

  const getStatusClass = status => {
    switch (status) {
      case 'resolved':
        return 'admin-complaint-resolved';
      case 'in progress':
        return 'admin-complaint-progress';
      default:
        return 'admin-complaint-pending';
    }
  };

  const pendingCount = complaints.filter(
    complaint => complaint.status === 'pending'
  ).length;

  const progressCount = complaints.filter(
    complaint => complaint.status === 'in progress'
  ).length;

  const resolvedCount = complaints.filter(
    complaint => complaint.status === 'resolved'
  ).length;

  return (
    <div className="admin-complaints-page">
      <div className="apartments-breadcrumb-bar">
        <div className="apartments-breadcrumb">
          <span>Admin Portal</span>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">Complaints</span>
        </div>

        <button
          type="button"
          className="apartments-dashboard-button"
          onClick={() => navigate('/admin')}
        >
          <span className="dashboard-arrow">←</span>
          Dashboard
        </button>
      </div>
      <header className="admin-complaints-header">
        <div className="admin-complaints-title">
          <div>
            <span className="admin-complaints-eyebrow">
              COMMUNITY MANAGEMENT
            </span>

            <h1>Manage Complaints</h1>

            <p>Review and manage resident complaints</p>
          </div>
        </div>
      </header>

      <section className="complaints-summary-grid">
        <div className="complaints-summary-card">
          <span className="summary-label">Total Complaints</span>
          <strong>{complaints.length}</strong>
          <span className="summary-description">All submitted complaints</span>
        </div>

        <div className="complaints-summary-card pending-summary">
          <span className="summary-label">Pending</span>
          <strong>{pendingCount}</strong>
          <span className="summary-description">Awaiting review</span>
        </div>

        <div className="complaints-summary-card progress-summary">
          <span className="summary-label">In Progress</span>
          <strong>{progressCount}</strong>
          <span className="summary-description">Currently being handled</span>
        </div>

        <div className="complaints-summary-card resolved-summary">
          <span className="summary-label">Resolved</span>
          <strong>{resolvedCount}</strong>
          <span className="summary-description">Successfully completed</span>
        </div>
      </section>

      <section className="admin-complaints-content">
        <div className="complaints-section-heading">
          <div>
            <h2>Complaint Records</h2>
            <p>View resident concerns and update their status.</p>
          </div>

          <span className="complaints-record-count">
            {complaints.length} {complaints.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {loading && (
          <div className="complaints-message">Loading complaints...</div>
        )}

        {!loading && error && (
          <div className="complaints-message complaints-error">
            <p>{error}</p>
            <button type="button" onClick={fetchComplaints}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && complaints.length === 0 && (
          <div className="complaints-empty-state">
            <div className="complaints-empty-icon">✓</div>
            <h3>No Complaints Yet</h3>
            <p>There are no complaints submitted by residents.</p>
          </div>
        )}

        {!loading && !error && complaints.length > 0 && (
          <div className="admin-complaints-table-wrapper">
            <table className="admin-complaints-table">
              <thead>
                <tr>
                  <th>Complaint</th>
                  <th>Resident</th>
                  <th>Apartment</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map(complaint => (
                  <tr key={complaint._id}>
                    <td className="complaint-details-cell">
                      <strong>{complaint.title}</strong>

                      <p className="admin-complaint-description">
                        {complaint.description}
                      </p>
                    </td>

                    <td>
                      <div className="complaint-resident-name">
                        {complaint.resident?.name || 'Unknown'}
                      </div>

                      <div className="admin-resident-email">
                        {complaint.resident?.email || ''}
                      </div>
                    </td>

                    <td>
                      <span className="complaint-apartment">
                        {complaint.apartment?.apartmentNumber || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <select
                        aria-label={`Update status for ${complaint.title}`}
                        value={complaint.status}
                        className={`complaint-status-select ${getStatusClass(
                          complaint.status
                        )}`}
                        onChange={event =>
                          handleStatusChange(complaint._id, event.target.value)
                        }
                      >
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>

                    <td className="complaint-date">
                      {new Date(complaint.createdAt).toLocaleDateString(
                        'en-GB',
                        {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminComplaints;
