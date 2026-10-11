import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      setError('');

      const token = localStorage.getItem('token');

      if (!token) {
        setError('Your session has expired. Please log in again.');
        return;
      }

      const response = await fetch('http://localhost:5001/api/users/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to load your profile.');
        return;
      }

      setUser(data.user);

      if (data.user?.profileImage) {
        setPreview(`http://localhost:5001${data.user.profileImage}`);
      } else {
        setPreview('');
      }
    } catch (error) {
      console.error('Profile error:', error);
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = event => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5 MB.');
      event.target.value = '';
      return;
    }

    setSelectedImage(file);

    const imagePreview = URL.createObjectURL(file);
    setPreview(imagePreview);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert('Please select an image first.');
      return;
    }

    try {
      setUploading(true);

      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append('profileImage', selectedImage);

      const response = await fetch(
        'http://localhost:5001/api/users/profile/image',
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to upload profile picture.');
        return;
      }

      setSelectedImage(null);
      alert('Profile picture updated successfully!');

      await fetchProfile();
    } catch (error) {
      console.error('Upload profile image error:', error);
      alert('Unable to upload your profile picture. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelPhoto = () => {
    setSelectedImage(null);

    if (user?.profileImage) {
      setPreview(`http://localhost:5001${user.profileImage}`);
    } else {
      setPreview('');
    }

    const input = document.getElementById('profile-image');

    if (input) {
      input.value = '';
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-topbar">
          <p className="profile-breadcrumb">
            Resident Portal <span>/</span> Profile
          </p>
          <button
            className="profile-dashboard-button"
            onClick={() => navigate('/resident')}
          >
            Dashboard
          </button>
        </div>

        <div className="profile-loading">
          <div className="profile-spinner" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-topbar">
          <p className="profile-breadcrumb">
            Resident Portal <span>/</span> Profile
          </p>
          <button
            className="profile-dashboard-button"
            onClick={() => navigate('/resident')}
          >
            Dashboard
          </button>
        </div>

        <div className="profile-error">
          <div className="profile-error-icon">!</div>
          <h2>Unable to load profile</h2>
          <p>{error || 'Please log in again and try once more.'}</p>

          <button
            className="profile-primary-button"
            onClick={() => {
              setLoading(true);
              fetchProfile();
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Top navigation */}
      <div className="profile-topbar">
        <p className="profile-breadcrumb">
          Resident Portal <span>/</span> Profile
        </p>

        <button
          className="profile-dashboard-button"
          onClick={() => navigate('/resident')}
        >
          <span className="profile-dashboard-icon">←</span>
          Dashboard
        </button>
      </div>

      <div className="profile-divider" />

      {/* Page heading */}
      <header className="profile-header">
        <span className="profile-eyebrow">YOUR ACCOUNT</span>
        <h1>My Profile</h1>
        <p>Manage your personal information and profile picture.</p>
      </header>

      {/* Profile content */}
      <div className="profile-content">
        <section className="profile-card">
          <div className="profile-card-heading">
            <div>
              <h2>Personal Information</h2>
              <p>Your account details and resident information</p>
            </div>

            <div className="profile-status">
              <span className="profile-status-dot" />
              Active Account
            </div>
          </div>

          <div className="profile-card-divider" />

          {/* Profile picture */}
          <div className="profile-picture-section">
            <div className="profile-picture">
              {preview ? (
                <img src={preview} alt="Profile" />
              ) : (
                <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
              )}
            </div>

            <div className="profile-picture-info">
              <h3>{user.name || 'Resident'}</h3>
              <p className="profile-role">
                {(user.role || 'resident').toLowerCase()}
              </p>

              <div className="profile-photo-actions">
                <label htmlFor="profile-image" className="choose-image-button">
                  Choose Photo
                </label>

                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />

                {selectedImage && (
                  <>
                    <button
                      type="button"
                      className="upload-image-button"
                      onClick={handleUpload}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Save Photo'}
                    </button>

                    <button
                      type="button"
                      className="cancel-photo-button"
                      onClick={handleCancelPhoto}
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              <p className="profile-photo-hint">
                JPG, PNG or other image formats · Maximum 5 MB
              </p>
            </div>
          </div>

          <div className="profile-card-divider" />

          {/* Account details */}
          <div className="profile-section-heading">
            <h3>Account Details</h3>
            <p>Information associated with your account</p>
          </div>

          <div className="profile-details">
            <div className="profile-detail">
              <span className="profile-detail-icon">A</span>
              <div className="profile-detail-content">
                <span className="profile-detail-label">Full Name</span>
                <strong>{user.name || 'Not provided'}</strong>
              </div>
            </div>

            <div className="profile-detail">
              <span className="profile-detail-icon">@</span>
              <div className="profile-detail-content">
                <span className="profile-detail-label">Email Address</span>
                <strong className="profile-value-break">
                  {user.email || 'Not provided'}
                </strong>
              </div>
            </div>

            <div className="profile-detail">
              <span className="profile-detail-icon">☎</span>
              <div className="profile-detail-content">
                <span className="profile-detail-label">Phone Number</span>
                <strong>{user.phone || 'Not provided'}</strong>
              </div>
            </div>

            <div className="profile-detail">
              <span className="profile-detail-icon">ID</span>
              <div className="profile-detail-content">
                <span className="profile-detail-label">Account Role</span>
                <strong className="profile-capitalize">
                  {user.role || 'Resident'}
                </strong>
              </div>
            </div>

            <div className="profile-detail profile-detail-full">
              <span className="profile-detail-icon">⌂</span>
              <div className="profile-detail-content">
                <span className="profile-detail-label">Apartment Number</span>
                <strong>{user.apartmentNumber || 'Not assigned'}</strong>
              </div>
            </div>
          </div>

          <div className="profile-info-note">
            <span className="profile-info-symbol">i</span>
            <p>
              To change your personal account details, contact your apartment
              administrator.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
