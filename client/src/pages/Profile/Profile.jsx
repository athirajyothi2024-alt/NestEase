import React, { useEffect, useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5001/api/users/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to load profile');
        return;
      }

      setUser(data.user);

      if (data.user.profileImage) {
        setPreview(`http://localhost:5001${data.user.profileImage}`);
      }
    } catch (error) {
      console.error('Profile error:', error);
      alert('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = e => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5 MB');
      return;
    }

    setSelectedImage(file);

    const imagePreview = URL.createObjectURL(file);
    setPreview(imagePreview);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert('Please select an image first');
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
        alert(data.message || 'Failed to upload image');
        return;
      }

      alert('Profile picture updated successfully!');

      setSelectedImage(null);

      await fetchProfile();
    } catch (error) {
      console.error('Upload profile image error:', error);
      alert('Unable to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-error">
          <h2>Unable to load profile</h2>
          <p>Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>View and manage your account information</p>
      </div>

      <div className="profile-card">
        {/* Profile Picture */}

        <div className="profile-picture-section">
          <div className="profile-picture">
            {preview ? (
              <img src={preview} alt="Profile" />
            ) : (
              <span>{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

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
            <button
              className="upload-image-button"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          )}
        </div>

        {/* Profile Details */}

        <div className="profile-details">
          <div className="profile-detail">
            <span>Name</span>
            <strong>{user.name}</strong>
          </div>

          <div className="profile-detail">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>

          <div className="profile-detail">
            <span>Phone</span>
            <strong>{user.phone || 'Not provided'}</strong>
          </div>

          <div className="profile-detail">
            <span>Role</span>
            <strong>{user.role}</strong>
          </div>

          <div className="profile-detail">
            <span>Apartment</span>
            <strong>{user.apartmentNumber || 'Not assigned'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
