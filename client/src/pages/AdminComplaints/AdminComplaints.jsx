import React, { useEffect, useState } from 'react';
import './AdminComplaints.css';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchComplaints = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/complaints', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to fetch complaints');
        return;
      }

      setComplaints(data.complaints);
    } catch (error) {
      console.error('Fetch complaints error:', error);
      alert('Unable to connect to server');
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
        alert(data.message || 'Failed to update status');
        return;
      }

      alert('Complaint status updated successfully!');

      fetchComplaints();
    } catch (error) {
      console.error('Update complaint error:', error);
      alert('Unable to connect to server');
    }
  };

  const getStatusClass = status => {
    if (status === 'resolved') {
      return 'admin-complaint-resolved';
    }

    if (status === 'in progress') {
      return 'admin-complaint-progress';
    }

    return 'admin-complaint-pending';
  };

  return (
    <div className="admin-complaints-page">
      <div className="admin-complaints-header">
        <h1>Manage Complaints</h1>
        <p>Review and manage resident complaints</p>
      </div>

      {loading && <p className="loading-complaints">Loading complaints...</p>}

      {!loading && complaints.length === 0 && (
        <div className="empty-admin-complaints">
          <h3>No Complaints</h3>
          <p>There are no complaints submitted by residents yet.</p>
        </div>
      )}

      {!loading && complaints.length > 0 && (
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
                  <td>
                    <strong>{complaint.title}</strong>

                    <div className="admin-complaint-description">
                      {complaint.description}
                    </div>
                  </td>

                  <td>
                    {complaint.resident?.name || 'Unknown'}

                    <div className="admin-resident-email">
                      {complaint.resident?.email || ''}
                    </div>
                  </td>

                  <td>{complaint.apartment?.apartmentNumber || 'N/A'}</td>

                  <td>
                    <select
                      value={complaint.status}
                      className={getStatusClass(complaint.status)}
                      onChange={e =>
                        handleStatusChange(complaint._id, e.target.value)
                      }
                    >
                      <option value="pending">Pending</option>

                      <option value="in progress">In Progress</option>

                      <option value="resolved">Resolved</option>
                    </select>
                  </td>

                  <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
