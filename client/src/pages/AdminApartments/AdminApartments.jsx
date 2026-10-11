import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminApartments.css';

const AdminApartments = () => {
  const navigate = useNavigate();

  const [apartments, setApartments] = useState([]);
  const [residents, setResidents] = useState([]);

  const [apartmentNumber, setApartmentNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');

  const [selectedResidents, setSelectedResidents] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [assigningId, setAssigningId] = useState(null);

  // Fetch apartments
  const fetchApartments = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/apartments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to fetch apartments');
        return;
      }

      setApartments(data.apartments || []);
    } catch (error) {
      console.error('Fetch apartments error:', error);
      alert('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch residents
  const fetchResidents = async () => {
    try {
      const response = await fetch(
        'http://localhost:5001/api/users/residents',
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
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
    }
  };

  useEffect(() => {
    fetchApartments();
    fetchResidents();
  }, []);

  // Create apartment
  const handleCreateApartment = async event => {
    event.preventDefault();

    try {
      setCreating(true);

      const response = await fetch('http://localhost:5001/api/apartments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          apartmentNumber: apartmentNumber.trim(),
          building: building.trim(),
          floor: Number(floor),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to create apartment');
        return;
      }

      alert('Apartment created successfully!');

      setApartmentNumber('');
      setBuilding('');
      setFloor('');

      await fetchApartments();
    } catch (error) {
      console.error('Create apartment error:', error);
      alert('Unable to connect to server');
    } finally {
      setCreating(false);
    }
  };

  // Select resident
  const handleResidentChange = (apartmentId, residentId) => {
    setSelectedResidents(previous => ({
      ...previous,
      [apartmentId]: residentId,
    }));
  };

  // Assign resident
  const handleAssignResident = async apartmentId => {
    const residentId = selectedResidents[apartmentId];

    if (!residentId) {
      alert('Please select a resident');
      return;
    }

    try {
      setAssigningId(apartmentId);

      const response = await fetch(
        `http://localhost:5001/api/apartments/${apartmentId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ residentId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to assign resident');
        return;
      }

      alert('Resident assigned successfully!');

      setSelectedResidents(previous => {
        const updated = { ...previous };
        delete updated[apartmentId];
        return updated;
      });

      await fetchApartments();
      await fetchResidents();
    } catch (error) {
      console.error('Assign resident error:', error);
      alert('Unable to connect to server');
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <div className="admin-apartments-page">
      {/* Breadcrumb and Dashboard */}
      <div className="apartments-breadcrumb-bar">
        <div className="apartments-breadcrumb">
          <span>Admin Portal</span>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">Apartments</span>
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

      {/* Page Heading */}
      <div className="apartments-page-heading">
        <span className="apartments-eyebrow">PROPERTY MANAGEMENT</span>

        <h1>Manage Apartments</h1>

        <p>Create and manage apartment details.</p>
      </div>

      {/* Create Apartment Card */}
      <section className="create-apartment-card">
        <div className="apartment-section-heading">
          <div>
            <h2>Create Apartment</h2>
            <p>Add a new apartment to your community.</p>
          </div>
        </div>

        <form onSubmit={handleCreateApartment}>
          <div className="apartment-form-grid">
            <div className="apartment-form-group">
              <label htmlFor="apartmentNumber">Apartment Number</label>

              <input
                id="apartmentNumber"
                type="text"
                value={apartmentNumber}
                onChange={event => setApartmentNumber(event.target.value)}
                placeholder="Example: A-102"
                required
              />
            </div>

            <div className="apartment-form-group">
              <label htmlFor="building">Building</label>

              <input
                id="building"
                type="text"
                value={building}
                onChange={event => setBuilding(event.target.value)}
                placeholder="Example: Block A"
                required
              />
            </div>

            <div className="apartment-form-group">
              <label htmlFor="floor">Floor</label>

              <input
                id="floor"
                type="number"
                min="0"
                step="1"
                value={floor}
                onChange={event => setFloor(event.target.value)}
                placeholder="Example: 1"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="create-apartment-button"
            disabled={creating}
          >
            {creating ? 'Creating...' : '+ Create Apartment'}
          </button>
        </form>
      </section>

      {/* Apartment Records */}
      <section className="apartments-list">
        <div className="apartment-section-heading records-heading">
          <div>
            <h2>Apartment Records</h2>
            <p>Manage apartment availability and resident assignments.</p>
          </div>

          <span className="apartment-count">
            {apartments.length}{' '}
            {apartments.length === 1 ? 'Apartment' : 'Apartments'}
          </span>
        </div>

        {loading && (
          <div className="apartments-state-card">
            <p>Loading apartments...</p>
          </div>
        )}

        {!loading && apartments.length === 0 && (
          <div className="apartments-state-card">
            <h3>No Apartments Yet</h3>
            <p>Create your first apartment using the form above.</p>
          </div>
        )}

        {!loading && apartments.length > 0 && (
          <div className="apartments-table-wrapper">
            <table className="apartments-table">
              <thead>
                <tr>
                  <th>APARTMENT</th>
                  <th>BUILDING</th>
                  <th>FLOOR</th>
                  <th>STATUS</th>
                  <th>RESIDENT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {apartments.map(apartment => {
                  const isOccupied =
                    apartment.status === 'occupied' ||
                    Boolean(apartment.resident);

                  return (
                    <tr key={apartment._id}>
                      <td>
                        <span className="apartment-number">
                          {apartment.apartmentNumber}
                        </span>
                      </td>

                      <td>{apartment.building}</td>

                      <td>{apartment.floor}</td>

                      <td>
                        <span
                          className={
                            isOccupied ? 'status-occupied' : 'status-available'
                          }
                        >
                          <span className="status-dot"></span>
                          {isOccupied ? 'Occupied' : 'Available'}
                        </span>
                      </td>

                      <td>
                        {apartment.resident ? (
                          <div className="assigned-resident">
                            <strong>{apartment.resident.name}</strong>
                            <small>{apartment.resident.email}</small>
                          </div>
                        ) : (
                          <select
                            className="resident-select"
                            aria-label={`Select resident for ${apartment.apartmentNumber}`}
                            value={selectedResidents[apartment._id] || ''}
                            onChange={event =>
                              handleResidentChange(
                                apartment._id,
                                event.target.value
                              )
                            }
                          >
                            <option value="">Select Resident</option>

                            {residents.map(resident => (
                              <option key={resident._id} value={resident._id}>
                                {resident.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      <td>
                        {!apartment.resident && (
                          <button
                            type="button"
                            className="assign-resident-button"
                            disabled={assigningId === apartment._id}
                            onClick={() => handleAssignResident(apartment._id)}
                          >
                            {assigningId === apartment._id
                              ? 'Assigning...'
                              : 'Assign'}
                          </button>
                        )}

                        {apartment.resident && (
                          <span className="assigned-label">Assigned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminApartments;
