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

      setComplaints(data.complaints);
    } catch (error) {
      console.error('Fetch complaints error:', error);
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
          title,
          description,
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

      fetchComplaints();
    } catch (error) {
      console.error('Submit complaint error:', error);
      alert('Unable to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusClass = status => {
    if (status === 'resolved') {
      return 'complaint-status-resolved';
    }

    if (status === 'in progress') {
      return 'complaint-status-progress';
    }

    return 'complaint-status-pending';
  };

  return (
    <div className="complaints-page">
      <div className="complaints-header">
        <h1>Complaints & Maintenance</h1>
        <p>Report an issue with your apartment</p>
      </div>

      {/* Submit Complaint */}

      <div className="complaint-form-card">
        <h2>Submit a Complaint</h2>

        <form onSubmit={handleSubmit}>
          <div className="complaint-form-group">
            <label>Complaint Title</label>

            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter complaint title"
              required
            />
          </div>

          <div className="complaint-form-group">
            <label>Category</label>

            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option>Plumbing</option>
              <option>Electrical</option>
              <option>Cleaning</option>
              <option>Maintenance</option>
              <option>Other</option>
            </select>
          </div>

          <div className="complaint-form-group">
            <label>Description</label>

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              rows="5"
              required
            />
          </div>

          <button
            type="submit"
            className="submit-complaint-button"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>

      {/* Complaint History */}

      <div className="complaint-history-card">
        <h2>My Complaints</h2>

        {loading && <p>Loading complaints...</p>}

        {!loading && error && <p className="complaint-error">{error}</p>}

        {!loading && !error && complaints.length === 0 && (
          <p>No complaints submitted yet.</p>
        )}

        {!loading && !error && complaints.length > 0 && (
          <div className="complaints-table-wrapper">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Apartment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map(complaint => (
                  <tr key={complaint._id}>
                    <td>
                      <strong>{complaint.title}</strong>

                      <div className="complaint-description">
                        {complaint.description}
                      </div>
                    </td>

                    <td>{complaint.apartment?.apartmentNumber || 'N/A'}</td>

                    <td>
                      <span className={getStatusClass(complaint.status)}>
                        {complaint.status}
                      </span>
                    </td>

                    <td>
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaints;
