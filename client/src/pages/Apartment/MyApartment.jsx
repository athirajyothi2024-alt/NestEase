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

        if (!token) {
          setError('Please log in to view your apartment details.');
          return;
        }

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

        setApartment(data.apartment || null);
      } catch (err) {
        console.error('Fetch apartment error:', err);
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchMyApartment();
  }, []);

  const status = apartment?.status || 'Occupied';
  const isOccupied = status.toLowerCase() === 'occupied';

  return (
    <div className="my-apartment">
      <div className="apartment-page-content">
        {/* Top navigation */}
        <div className="apartment-topbar">
          <div className="apartment-breadcrumb">
            <span>Resident Portal</span>
            <span className="breadcrumb-separator">/</span>
            <strong>My Apartment</strong>
          </div>

          <button
            type="button"
            className="apartment-dashboard-button"
            onClick={() => {
              window.location.href = '/resident';
            }}
          >
            <span aria-hidden="true">←</span>
            Dashboard
          </button>
        </div>

        {/* Page heading */}
        <div className="apartment-page-heading">
          <span className="apartment-eyebrow">YOUR ACCOUNT</span>
          <h1>My Apartment</h1>
          <p>View your apartment details and occupancy status.</p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="apartment-state-card">
            <div className="apartment-loader" />
            <h2>Loading apartment details</h2>
            <p>Please wait while we fetch your apartment information.</p>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="apartment-state-card">
            <div className="apartment-state-icon error-icon">!</div>
            <h2>Unable to load apartment</h2>
            <p>{error}</p>

            <button
              type="button"
              className="apartment-retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* No apartment assigned */}
        {!loading && !error && !apartment && (
          <div className="apartment-state-card">
            <div className="apartment-state-icon">⌂</div>
            <h2>No Apartment Assigned</h2>
            <p>
              You have not been assigned an apartment yet. Please contact your
              apartment administrator for assistance.
            </p>
          </div>
        )}

        {/* Apartment details */}
        {!loading && !error && apartment && (
          <section className="apartment-card">
            <div className="apartment-card-header">
              <div className="apartment-title-group">
                <div className="apartment-building-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="4" y="2.5" width="16" height="19" rx="2" />
                    <path d="M9 21.5v-4h6v4M8 6.5h1M15 6.5h1M8 10.5h1M15 10.5h1M8 14h1M15 14h1" />
                  </svg>
                </div>

                <div>
                  <span className="apartment-card-label">YOUR RESIDENCE</span>
                  <h2>Apartment {apartment.apartmentNumber || '—'}</h2>
                  <p>{apartment.building || 'Building not specified'}</p>
                </div>
              </div>

              <span
                className={`apartment-status-badge ${
                  isOccupied ? 'status-occupied' : 'status-available'
                }`}
              >
                <span className="status-dot" />
                {status}
              </span>
            </div>

            <div className="apartment-card-divider" />

            <div className="apartment-section-heading">
              <h3>Apartment Information</h3>
              <p>Your assigned apartment details</p>
            </div>

            <div className="apartment-details">
              <div className="detail-item">
                <span className="detail-label">Apartment Number</span>
                <strong>{apartment.apartmentNumber || '—'}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Building</span>
                <strong>{apartment.building || '—'}</strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Floor</span>
                <strong>
                  {apartment.floor !== undefined &&
                  apartment.floor !== null &&
                  apartment.floor !== ''
                    ? apartment.floor
                    : '—'}
                </strong>
              </div>

              <div className="detail-item">
                <span className="detail-label">Occupancy Status</span>
                <strong className={isOccupied ? 'detail-status-occupied' : ''}>
                  {status}
                </strong>
              </div>
            </div>

            <div className="apartment-info-note">
              <span className="apartment-info-symbol" aria-hidden="true">
                i
              </span>
              <p>
                For changes to your apartment assignment or building
                information, please contact your administrator.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MyApartment;
