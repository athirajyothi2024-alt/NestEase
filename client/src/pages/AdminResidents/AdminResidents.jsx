import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminResidents.css';

const AdminResidents = () => {
  const navigate = useNavigate();

  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingResident, setAddingResident] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const token = localStorage.getItem('token');

  const fetchResidents = async () => {
    try {
      const response = await fetch(
        'http://localhost:5001/api/users/residents',
        {
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

      setResidents(data.residents || []);
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

      const response = await fetch(
        'http://localhost:5001/api/users/residents',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to add resident');
        return;
      }

      alert('Resident added successfully!');

      setName('');
      setEmail('');
      setPassword('');
      setPhone('');

      await fetchResidents();
    } catch (error) {
      console.error('Add resident error:', error);
      alert('Unable to connect to server');
    } finally {
      setAddingResident(false);
    }
  };

  return (
    <div className="admin-residents-page">
      {/* Top header */}
      <header className="residents-topbar">
        <div className="residents-breadcrumb">
          <span>Admin Portal</span>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">Residents</span>
        </div>

        <button
          type="button"
          className="residents-dashboard-button"
          onClick={() => navigate('/admin')}
        >
          ← Dashboard
        </button>
      </header>

      <main className="residents-main">
        {/* Page heading */}
        <section className="residents-page-heading">
          <div>
            <span className="residents-eyebrow">COMMUNITY MANAGEMENT</span>

            <h1>Manage Residents</h1>

            <p>Add and manage residents in your apartment community.</p>
          </div>
        </section>

        {/* Add resident form */}
        <section className="resident-form-card">
          <div className="resident-card-heading">
            <h2>Add New Resident</h2>
            <p>Create a resident account for your community.</p>
          </div>

          <form onSubmit={handleAddResident}>
            <div className="resident-form-grid">
              <div className="resident-form-group">
                <label htmlFor="resident-name">Full Name</label>

                <input
                  id="resident-name"
                  type="text"
                  placeholder="Enter resident name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="resident-form-group">
                <label htmlFor="resident-email">Email Address</label>

                <input
                  id="resident-email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="resident-form-group">
                <label htmlFor="resident-password">Password</label>

                <input
                  id="resident-password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="resident-form-group">
                <label htmlFor="resident-phone">Phone Number</label>

                <input
                  id="resident-phone"
                  type="tel"
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
              {addingResident ? 'Adding Resident...' : '+ Add Resident'}
            </button>
          </form>
        </section>

        {/* Registered residents */}
        <section className="registered-residents-section">
          <div className="registered-residents-heading">
            <div>
              <h2>Registered Residents</h2>
              <p>View resident details and apartment assignments.</p>
            </div>

            <span className="resident-count">
              {residents.length}{' '}
              {residents.length === 1 ? 'resident' : 'residents'}
            </span>
          </div>

          {loading ? (
            <div className="residents-empty-state">Loading residents...</div>
          ) : residents.length === 0 ? (
            <div className="residents-empty-state">
              <h3>No residents yet</h3>
              <p>Add a resident using the form above.</p>
            </div>
          ) : (
            <div className="residents-table-container">
              <table className="residents-table">
                <thead>
                  <tr>
                    <th>Resident</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Apartment</th>
                  </tr>
                </thead>

                <tbody>
                  {residents.map(resident => (
                    <tr key={resident._id}>
                      <td>
                        <div className="resident-name-cell">
                          <div className="resident-initial">
                            {(resident.name || 'R').charAt(0).toUpperCase()}
                          </div>

                          <strong>{resident.name}</strong>
                        </div>
                      </td>

                      <td>{resident.email}</td>

                      <td>{resident.phone || 'Not provided'}</td>

                      <td>
                        <span
                          className={`resident-apartment-badge ${
                            resident.apartmentNumber ? 'assigned' : ''
                          }`}
                        >
                          {resident.apartmentNumber || 'Not assigned'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminResidents;
