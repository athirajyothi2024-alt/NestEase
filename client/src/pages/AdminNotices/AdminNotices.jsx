import React, { useEffect, useState } from 'react';
import './AdminNotices.css';

const AdminNotices = () => {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

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

      setNotices(data.notices);
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

  const handleCreateNotice = async e => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
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

      fetchNotices();
    } catch (error) {
      console.error('Create notice error:', error);
      alert('Unable to connect to server');
    }
  };

  const handleDeleteNotice = async id => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this notice?'
    );

    if (!confirmDelete) {
      return;
    }

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

      alert('Notice deleted successfully!');

      fetchNotices();
    } catch (error) {
      console.error('Delete notice error:', error);
      alert('Unable to connect to server');
    }
  };

  return (
    <div className="admin-notices-page">
      <div className="admin-notices-header">
        <h1>Manage Notices</h1>
        <p>Create and manage apartment notices</p>
      </div>

      <div className="create-notice-card">
        <h2>Create Notice</h2>

        <form onSubmit={handleCreateNotice}>
          <div className="notice-form-group">
            <label>Notice Title</label>

            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter notice title"
              required
            />
          </div>

          <div className="notice-form-group">
            <label>Message</label>

            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Enter notice message"
              rows="5"
              required
            />
          </div>

          <button type="submit" className="create-notice-button">
            Create Notice
          </button>
        </form>
      </div>

      <div className="admin-notices-list">
        <h2>All Notices</h2>

        {loading && <p>Loading notices...</p>}

        {!loading && notices.length === 0 && (
          <div className="empty-admin-notices">
            <p>No notices available.</p>
          </div>
        )}

        {!loading &&
          notices.map(notice => (
            <div className="admin-notice-card" key={notice._id}>
              <div>
                <h3>{notice.title}</h3>

                <p>{notice.message}</p>

                <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
              </div>

              <button
                className="delete-notice-button"
                onClick={() => handleDeleteNotice(notice._id)}
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdminNotices;
