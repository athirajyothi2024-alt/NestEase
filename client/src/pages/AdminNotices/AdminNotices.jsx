import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminNotices.css';

const AdminNotices = () => {
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all notices
  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/notices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to fetch notices');
        return;
      }

      setNotices(data.notices || []);
    } catch (error) {
      console.error('Fetch notices error:', error);
      alert('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Create a notice
  const handleCreateNotice = async e => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert('Please enter both the notice title and message.');
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to create notice');
        return;
      }

      alert('Notice created successfully!');

      setTitle('');
      setMessage('');

      await fetchNotices();
    } catch (error) {
      console.error('Create notice error:', error);
      alert('Unable to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a notice
  const handleDeleteNotice = async id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this notice?'
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5001/api/notices/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to delete notice');
        return;
      }

      setNotices(previousNotices =>
        previousNotices.filter(notice => notice._id !== id)
      );

      alert('Notice deleted successfully!');
    } catch (error) {
      console.error('Delete notice error:', error);
      alert('Unable to connect to server');
    }
  };

  return (
    <div className="admin-notices-page">
      {/* Top header */}
      <div className="admin-notices-topbar">
        <div className="admin-notices-breadcrumb">
          <span>Admin Portal</span>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">Notices</span>
        </div>

        <button
          type="button"
          className="admin-notices-dashboard-button"
          onClick={() => navigate('/admin')}
        >
          ← Dashboard
        </button>
      </div>

      {/* Page heading */}
      <span className="admin-complaints-eyebrow">COMMUNITY MANAGEMENT</span>
      <div className="admin-notices-header">
        <h1>Manage Notices</h1>
        <p>Create and manage apartment notices</p>
      </div>

      {/* Create notice form */}
      <section className="create-notice-card">
        <h2>Create Notice</h2>

        <form onSubmit={handleCreateNotice}>
          <div className="notice-form-group">
            <label htmlFor="notice-title">Notice Title</label>

            <input
              id="notice-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter notice title"
              required
            />
          </div>

          <div className="notice-form-group">
            <label htmlFor="notice-message">Message</label>

            <textarea
              id="notice-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter notice message"
              rows={5}
              required
            />
          </div>

          <button
            type="submit"
            className="create-notice-button"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Notice'}
          </button>
        </form>
      </section>

      {/* Notices list */}
      <section className="admin-notices-list">
        <div className="admin-notices-list-header">
          <div>
            <h2>All Notices</h2>
            <p>Updates shared with your apartment residents</p>
          </div>

          <span className="notice-count">
            {notices.length} {notices.length === 1 ? 'notice' : 'notices'}
          </span>
        </div>

        {loading && (
          <div className="empty-admin-notices">Loading notices...</div>
        )}

        {!loading && notices.length === 0 && (
          <div className="empty-admin-notices">
            <h3>No notices yet</h3>
            <p>Create a notice to share updates with residents.</p>
          </div>
        )}

        {!loading &&
          notices.map(notice => (
            <article className="admin-notice-card" key={notice._id}>
              <div className="admin-notice-content">
                <div className="notice-icon">▤</div>

                <div className="admin-notice-details">
                  <h3>{notice.title}</h3>

                  <p>{notice.message}</p>

                  <span className="notice-date">
                    {notice.createdAt
                      ? new Date(notice.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Date unavailable'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="delete-notice-button"
                onClick={() => handleDeleteNotice(notice._id)}
              >
                Delete
              </button>
            </article>
          ))}
      </section>
    </div>
  );
};

export default AdminNotices;
