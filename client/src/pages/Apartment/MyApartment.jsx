import React, { useEffect, useState } from 'react';
import './MyApartment.css';

const MyApartment = () => {
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyApartment = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await fetch(
          'http://localhost:5001/api/apartments/my-apartment',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to fetch apartment details');
          return;
        }

        setApartment(data.apartment);
      } catch (error) {
        console.error('Fetch apartment error:', error);
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchMyApartment();
  }, []);

  if (loading) {
    return (
      <div className="my-apartment">
        <p>Loading apartment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-apartment">
        <div className="apartment-error">
          <h2>Unable to load apartment</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="my-apartment">
        <div className="apartment-error">
          <h2>No Apartment Assigned</h2>
          <p>You have not been assigned an apartment yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-apartment">
      <div className="apartment-header">
        <h1>My Apartment</h1>
        <p>View your apartment details</p>
      </div>

      <div className="apartment-card">
        <div className="apartment-card-header">
          <div>
            <h2>Apartment {apartment.apartmentNumber}</h2>

            <p>{apartment.building}</p>
          </div>

          <span className="occupied-badge">{apartment.status}</span>
        </div>

        <div className="apartment-details">
          <div className="detail-item">
            <span>Apartment Number</span>

            <strong>{apartment.apartmentNumber}</strong>
          </div>

          <div className="detail-item">
            <span>Building</span>

            <strong>{apartment.building}</strong>
          </div>

          <div className="detail-item">
            <span>Floor</span>

            <strong>{apartment.floor}</strong>
          </div>

          <div className="detail-item">
            <span>Status</span>

            <strong>{apartment.status}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyApartment;
