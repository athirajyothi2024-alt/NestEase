import React, { useEffect, useState } from 'react';
import './Complaints.css';

const Complaints = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Plumbing');

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComplaints = async () => {
    try {
      setError('');

      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:5001/api/complaints/my-complaints',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch complaints');
        return;
      }

      setComplaints(Array.isArray(data.complaints) ? data.complaints : []);
    } catch (err) {
      console.error('Fetch complaints error:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Please enter a complaint title and description.');
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to submit complaint');
        return;
      }

      alert('Complaint submitted successfully!');

      setTitle('');
      setDescription('');
      setCategory('Plumbing');

      await fetchComplaints();
    } catch (err) {
      console.error('Submit complaint error:', err);
      alert('Unable to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = status => {
    const normalizedStatus = (status || 'pending').toLowerCase().trim();

    if (normalizedStatus === 'resolved') {
      return 'complaint-status-resolved';
    }

    if (
      normalizedStatus === 'in progress' ||
      normalizedStatus === 'in-progress'
    ) {
      return 'complaint-status-progress';
    }

    return 'complaint-status-pending';
  };

  const formatStatus = status => {
    if (!status) return 'Pending';

    return status
      .split(/[- ]/)
      .filter(Boolean)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = date => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return '—';

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="complaints-page">
      <div className="complaints-content">
        {/* Header navigation */}
        <div className="complaints-topbar">
          <div className="complaints-breadcrumb">
            <span>Resident Portal</span>
            <span className="complaints-breadcrumb-separator">/</span>
            <strong>Complaints</strong>
          </div>

          <button
            type="button"
            className="complaints-dashboard-button"
            onClick={() => {
              window.location.href = '/resident';
            }}
          >
            <span aria-hidden="true">←</span>
            Dashboard
          </button>
        </div>

        {/* Page heading */}
        <div className="complaints-page-heading">
          <span className="complaints-eyebrow">YOUR ACCOUNT</span>
          <h1>Complaints</h1>
          <p>Report apartment issues and track your maintenance requests.</p>
        </div>

        {/* Submit complaint */}
        <section className="complaint-form-card">
          <div className="complaint-section-heading">
            <div>
              <h2>Submit a Complaint</h2>
              <p>Tell us about an issue that needs attention.</p>
            </div>
            <div className="complaint-heading-icon" aria-hidden="true">
              +
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="complaint-form-grid">
              <div className="complaint-form-group">
                <label htmlFor="complaint-title">
                  Complaint Title <span>*</span>
                </label>

                <input
                  id="complaint-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Water leakage in bathroom"
                  maxLength={120}
                  required
                />
              </div>

              <div className="complaint-form-group">
                <label htmlFor="complaint-category">Category</label>

                <select
                  id="complaint-category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="complaint-form-group">
              <label htmlFor="complaint-description">
                Description <span>*</span>
              </label>

              <textarea
                id="complaint-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue and where it occurred..."
                rows={5}
                maxLength={2000}
                required
              />

              <span className="complaint-character-count">
                {description.length}/2000 characters
              </span>
            </div>

            <div className="complaint-form-actions">
              <button
                type="submit"
                className="submit-complaint-button"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Complaint'}
                {!submitting && <span aria-hidden="true"> →</span>}
              </button>
            </div>
          </form>
        </section>

        {/* Complaint history */}
        <section className="complaint-history-card">
          <div className="complaint-section-heading history-heading">
            <div>
              <h2>My Complaints</h2>
              <p>Review your submitted requests and their current status.</p>
            </div>

            {!loading && !error && (
              <span className="complaint-count">
                {complaints.length}{' '}
                {complaints.length === 1 ? 'complaint' : 'complaints'}
              </span>
            )}
          </div>

          {loading && (
            <div className="complaint-empty-state">
              <div className="complaint-loader" />
              <p>Loading your complaints...</p>
            </div>
          )}

          {!loading && error && (
            <div className="complaint-message complaint-error">
              <strong>Unable to load complaints</strong>
              <p>{error}</p>
              <button
                type="button"
                className="complaint-retry-button"
                onClick={fetchComplaints}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && complaints.length === 0 && (
            <div className="complaint-empty-state">
              <div className="complaint-empty-icon" aria-hidden="true">
                ✓
              </div>
              <h3>No complaints yet</h3>
              <p>
                You haven’t submitted any complaints. Use the form above
                whenever you need assistance.
              </p>
            </div>
          )}

          {!loading && !error && complaints.length > 0 && (
            <div className="complaints-table-wrapper">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>Complaint Details</th>
                    <th>Apartment</th>
                    <th>Status</th>
                    <th>Date Submitted</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map(complaint => (
                    <tr key={complaint._id}>
                      <td>
                        <div className="complaint-title-cell">
                          {complaint.title}
                        </div>
                        <div className="complaint-description">
                          {complaint.description}
                        </div>
                      </td>

                      <td>{complaint.apartment?.apartmentNumber || 'N/A'}</td>

                      <td>
                        <span
                          className={`complaint-status-badge ${getStatusClass(
                            complaint.status
                          )}`}
                        >
                          <span className="complaint-status-dot" />
                          {formatStatus(complaint.status)}
                        </span>
                      </td>

                      <td className="complaint-date-cell">
                        {formatDate(complaint.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Complaints;
