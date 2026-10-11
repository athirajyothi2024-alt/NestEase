import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Notices.css';

const Notices = () => {
  const navigate = useNavigate();

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotices = async () => {
    try {
      setError('');

      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please log in to view notices.');
        return;
      }

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

      setNotices(Array.isArray(data.notices) ? data.notices : []);
    } catch (err) {
      console.error('Notice fetch error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const formatDate = date => {
    if (!date) return 'Date unavailable';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleRetry = () => {
    setLoading(true);
    fetchNotices();
  };

  return (
    <div className="notices-page">
      <main className="notices-content">
        {/* Top navigation */}
        <div className="notices-topbar">
          <div className="notices-breadcrumb">
            <span>Resident Portal</span>
            <span className="notices-breadcrumb-separator">/</span>
            <strong>Notices</strong>
          </div>

          <button
            type="button"
            className="notices-dashboard-button"
            onClick={() => navigate('/resident')}
          >
            <span aria-hidden="true">←</span>
            Dashboard
          </button>
        </div>

        {/* Page heading */}
        <section className="notices-page-heading">
          <span className="notices-eyebrow">YOUR ACCOUNT</span>
          <h1>Notices</h1>
          <p>
            Stay updated with announcements and important community information.
          </p>
        </section>

        {/* Notices list */}
        <section className="notices-section">
          <div className="notices-section-header">
            <div>
              <h2>Community Notices</h2>
              <p>Latest announcements from your apartment management.</p>
            </div>

            {!loading && !error && (
              <span className="notices-count">
                {notices.length} {notices.length === 1 ? 'notice' : 'notices'}
              </span>
            )}
          </div>

          {loading && (
            <div className="notices-state">
              <div className="notices-loader" />
              <p>Loading notices...</p>
            </div>
          )}

          {!loading && error && (
            <div className="notices-state notices-error-state">
              <div className="notices-state-icon">!</div>
              <h3>Unable to load notices</h3>
              <p>{error}</p>

              <button
                type="button"
                className="notices-retry-button"
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && notices.length === 0 && (
            <div className="notices-state">
              <div className="notices-state-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                  <path d="M10 21h4" />
                </svg>
              </div>

              <h3>No notices yet</h3>
              <p>
                There are no notices available at the moment. Please check back
                later.
              </p>
            </div>
          )}

          {!loading && !error && notices.length > 0 && (
            <div className="notices-list">
              {notices.map(notice => (
                <article className="notice-card" key={notice._id}>
                  <div className="notice-card-icon">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
                      <path d="m3 12 9 5 9-5" />
                      <path d="m3 16 9 5 9-5" />
                    </svg>
                  </div>

                  <div className="notice-card-content">
                    <div className="notice-card-header">
                      <span className="notice-category-label">
                        COMMUNITY UPDATE
                      </span>

                      <time
                        className="notice-date"
                        dateTime={notice.createdAt || undefined}
                      >
                        {formatDate(notice.createdAt)}
                      </time>
                    </div>

                    <h3>{notice.title}</h3>

                    <p className="notice-message-text">{notice.message}</p>

                    {notice.createdBy?.name && (
                      <div className="notice-created-by">
                        <span className="notice-author-dot" />
                        Posted by {notice.createdBy.name}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Notices;
