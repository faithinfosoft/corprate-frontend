// UpdatePassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import globalVariables from './Global.js';
import print_toast from './utilities/Toaster.js';

const PasswordReset = ({ username, resetToken, onPasswordReset }) => {
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.new_password !== formData.confirm_password) {
      setError('Passwords do not match');
      print_toast("error", 'Passwords do not match');
      return;
    }
    
    if (formData.new_password.length < 6) {
      setError('Password must be at least 6 characters long');
      print_toast("error", 'Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Submitting password reset with:", {
        reset_token: resetToken,
        new_password: formData.new_password,
      });
      
      const response = await axios.post(
        `${globalVariables.api_url}/login/reset_admin_password`, 
        {
          reset_token: resetToken,
          new_password: formData.new_password,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      console.log("Password reset response:", response.data);
      
      if (response.data.status) {
        print_toast("success", "Password reset successfully");
        onPasswordReset();
      } else {
        setError(response.data.message || 'Password reset failed');
        print_toast("error", response.data.message || 'Password reset failed');
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError('An error occurred during password reset');
      print_toast("error", 'An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h6 className="card-title text-center pb-0 fs-4 text-dark login-text">Reset Password</h6>
        <p className="text-center small">
          Create a new password for your account: <strong>{username}</strong>
        </p>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="col-12 mb-3">
            <label htmlFor="new_password" className="form-label">New Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock icon-color"></i>
              </span>
              <input
                type="password"
                className="form-control"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                placeholder="Enter new password"
                required
                minLength="6"
              />
            </div>
          </div>
          
          <div className="col-12 mb-3">
            <label htmlFor="confirm_password" className="form-label">Confirm Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-lock-fill icon-color"></i>
              </span>
              <input
                type="password"
                className="form-control"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
                minLength="6"
              />
            </div>
          </div>
          
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary mb-3" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
        
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    </>
  );
};

export default PasswordReset;