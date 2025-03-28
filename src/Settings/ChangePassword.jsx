import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  
import { useAuth } from '../contexts/AuthContext';
import './ChangePassword.css';  

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();  
  const { authState } = useAuth();  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    const token = authState.token;

    if (!token) {
      setError('No token found. Please log in again.');
      return;
    }

    try {
      const response = await fetch('https://localhost:7287/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  
        },
        body: JSON.stringify({
          UserName: authState.user.sub,  // Using dynamic username from authState
          OldPassword: oldPassword,
          NewPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message); 
        setError('');  
        setTimeout(() => navigate('/profile'), 2000); 
      } else {
        setError(data.message);  
      }
    } catch (err) {
      setError('Error changing password. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="change-password-container">
      <button className="backButton" onClick={() => navigate(-1)}>
        Back
      </button>
      <h2 className="title">Change Password</h2>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="oldPassword" className="form-label">Old Password</label>
          <input
            type={showOldPassword ? 'text' : 'password'}
            id="oldPassword"
            name="oldPassword"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="form-input"
          />
          <span
            className="eye-icons"
            onClick={() => setShowOldPassword(!showOldPassword)}
          >
            {showOldPassword ? '👁️' : '👁️‍🗨️'} 
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="newPassword" className="form-label">New Password</label>
          <input
            type={showNewPassword ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="form-input"
          />
          <span
            className="eye-icon"
            onClick={() => setShowNewPassword(!showNewPassword)}
          >
            {showNewPassword ? '👁️' : '👁️‍🗨️'}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="form-input"
          />
          <span
            className="eye-icon"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </span>
        </div>

        <button
          type="submit"
          className="submit-button"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
