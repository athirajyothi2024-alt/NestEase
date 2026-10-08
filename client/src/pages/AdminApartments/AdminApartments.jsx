import React, { useEffect, useState } from 'react';
import './AdminApartments.css';

const AdminApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [residents, setResidents] = useState([]);

  const [apartmentNumber, setApartmentNumber] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');

  const [selectedResidents, setSelectedResidents] = useState({});

  const [loading, setLoading] = useState(true);

  // Fetch apartments
  const fetchApartments = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/apartments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to fetch apartments');
        return;
      }

      setApartments(data.apartments);
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
      const token = localStorage.getItem('token');

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

      setResidents(data.residents);
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
  const handleCreateApartment = async e => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/apartments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          apartmentNumber,
          building,
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

      fetchApartments();
    } catch (error) {
      console.error('Create apartment error:', error);
      alert('Unable to connect to server');
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
      const token = localStorage.getItem('token');

      const response = await fetch(
        `http://localhost:5001/api/apartments/${apartmentId}/assign`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            residentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to assign resident');
        return;
      }

      alert('Resident assigned successfully!');

      fetchApartments();
    } catch (error) {
      console.error('Assign resident error:', error);
      alert('Unable to connect to server');
    }
  };

  return (
    <div className="admin-apartments-page">
      {/* Header */}

      <div className="admin-apartments-header">
        <h1>Manage Apartments</h1>

        <p>Create and manage apartment details</p>
      </div>

      {/* Create Apartment */}

      <div className="create-apartment-card">
        <h2>Create Apartment</h2>

        <form onSubmit={handleCreateApartment}>
          <div className="apartment-form-group">
            <label>Apartment Number</label>

            <input
              type="text"
              value={apartmentNumber}
              onChange={e => setApartmentNumber(e.target.value)}
              placeholder="Example: A-102"
              required
            />
          </div>

          <div className="apartment-form-group">
            <label>Building</label>

            <input
              type="text"
              value={building}
              onChange={e => setBuilding(e.target.value)}
              placeholder="Example: Block A"
              required
            />
          </div>

          <div className="apartment-form-group">
            <label>Floor</label>

            <input
              type="number"
              value={floor}
              onChange={e => setFloor(e.target.value)}
              placeholder="Example: 1"
              required
            />
          </div>

          <button type="submit" className="create-apartment-button">
            Create Apartment
          </button>
        </form>
      </div>

      {/* All Apartments */}

      <div className="apartments-list">
        <h2>All Apartments</h2>

        {loading && <p className="loading-apartments">Loading apartments...</p>}

        {!loading && apartments.length === 0 && (
          <div className="empty-apartments">
            <p>No apartments available.</p>
          </div>
        )}

        {!loading && apartments.length > 0 && (
          <div className="apartments-table-wrapper">
            <table className="apartments-table">
              <thead>
                <tr>
                  <th>Apartment</th>
                  <th>Building</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th>Resident</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {apartments.map(apartment => (
                  <tr key={apartment._id}>
                    <td className="apartment-number">
                      {apartment.apartmentNumber}
                    </td>

                    <td>{apartment.building}</td>

                    <td>{apartment.floor}</td>

                    <td>
                      <span
                        className={
                          apartment.status === 'occupied'
                            ? 'status-occupied'
                            : 'status-available'
                        }
                      >
                        {apartment.status === 'occupied'
                          ? 'Occupied'
                          : 'Available'}
                      </span>
                    </td>

                    <td>
                      {apartment.resident ? (
                        <div className="assigned-resident">
                          <strong>{apartment.resident.name}</strong>
                          <br></br>
                          <small>{apartment.resident.email}</small>
                        </div>
                      ) : (
                        <select
                          className="resident-select"
                          value={selectedResidents[apartment._id] || ''}
                          onChange={e =>
                            handleResidentChange(apartment._id, e.target.value)
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
                          className="assign-resident-button"
                          onClick={() => handleAssignResident(apartment._id)}
                        >
                          Assign
                        </button>
                      )}
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

export default AdminApartments;
