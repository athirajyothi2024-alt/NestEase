import React, { useEffect, useState } from 'react';
import './AdminResidents.css';

const AdminResidents = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add resident form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const [addingResident, setAddingResident] = useState(false);

  const fetchResidents = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:5001/api/users/residents',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to fetch residents');
        return;
      }

      setResidents(data.residents);
    } catch (error) {
      console.error('Fetch residents error:', error);
      alert('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const handleAddResident = async e => {
    e.preventDefault();

    try {
      setAddingResident(true);

      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:5001/api/users/residents',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            password,
            phone,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to add resident');
        return;
      }

      alert('Resident added successfully!');

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');

      // Refresh residents list
      fetchResidents();
    } catch (error) {
      console.error('Add resident error:', error);
      alert('Unable to connect to server');
    } finally {
      setAddingResident(false);
    }
  };

  return (
    <div className="admin-residents-page">
      <div className="admin-residents-header">
        <h1>Manage Residents</h1>
        <p>Add and manage residents in your apartment</p>
      </div>

      {/* Add Resident Form */}
      <div className="add-resident-card">
        <h2>Add New Resident</h2>

        <form onSubmit={handleAddResident}>
          <div className="resident-form-row">
            <div className="resident-form-group">
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter resident name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="resident-form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="resident-form-row">
            <div className="resident-form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="resident-form-group">
              <label>Phone</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="add-resident-button"
            disabled={addingResident}
          >
            {addingResident ? 'Adding...' : 'Add Resident'}
          </button>
        </form>
      </div>

      {/* Residents List */}

      {loading && <p className="loading-residents">Loading residents...</p>}

      {!loading && residents.length === 0 && (
        <div className="empty-residents">
          <h3>No Residents</h3>
          <p>There are no residents registered yet.</p>
        </div>
      )}

      {!loading && residents.length > 0 && (
        <div className="residents-section">
          <h2>Registered Residents</h2>

          <div className="residents-table-wrapper">
            <table className="residents-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Apartment</th>
                </tr>
              </thead>

              <tbody>
                {residents.map(resident => (
                  <tr key={resident._id}>
                    <td className="resident-name">{resident.name}</td>

                    <td>{resident.email}</td>

                    <td>{resident.phone || 'Not provided'}</td>

                    <td>{resident.apartmentNumber || 'Not assigned'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResidents;
