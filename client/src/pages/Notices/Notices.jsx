import React, { useEffect, useState } from 'react';
import './Notices.css';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          'http://localhost:5001/api/notices/resident',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to fetch notices');
          return;
        }

        setNotices(data.notices);
      } catch (error) {
        console.error('Notice fetch error:', error);
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="notices-page">
      <div className="notices-header">
        <h1>Notices</h1>
        <p>Latest announcements from your apartment management</p>
      </div>

      {loading && <p className="notice-message">Loading notices...</p>}

      {error && <p className="notice-error">{error}</p>}

      {!loading && !error && notices.length === 0 && (
        <div className="empty-notices">
          <h3>No Notices</h3>
          <p>There are no notices available at the moment.</p>
        </div>
      )}

      <div className="notices-list">
        {notices.map(notice => (
          <div className="notice-card" key={notice._id}>
            <div className="notice-card-header">
              <h2>{notice.title}</h2>

              <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
            </div>

            <p className="notice-message-text">{notice.message}</p>

            {notice.createdBy?.name && (
              <p className="notice-created-by">
                Posted by {notice.createdBy.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notices;
