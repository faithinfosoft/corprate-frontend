// OtpVerification.jsx
import React, { useState } from 'react';
import axios from 'axios';
import globalVariables from './Global.js';
import print_toast from './utilities/Toaster.js';

const OTPChecking = ({ username, email, otp_key, onOtpVerified }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setOtp(e.target.value);
    setError('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
      
    try {
      console.log("Submitting OTP verification with:", {
        otp,
        otp_key,
        username
      });
          
      const response = await axios.post(
        `${globalVariables.api_url}/login/verify_admin_otp`,
        {
          otp,
          otp_key,
          username
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
          
      console.log("OTP verification response:", response.data);
          
      if (response.data.status) {
        print_toast("success", "OTP verified successfully");
        onOtpVerified(response.data.reset_token);
      } else {
        setError(response.data.message || 'OTP verification failed');
        print_toast("error", response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      
      // Extract error message from the response if available
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
        print_toast("error", error.response.data.message);
      } else {
        setError('An error occurred during OTP verification');
        print_toast("error", 'An error occurred during OTP verification');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log("Submitting OTP verification with:", {
        otp,
        otp_key,
        username
      });
      
      const response = await axios.post(
        `${globalVariables.api_url}/login/verify_admin_otp`, 
        {
          otp,
          otp_key,
          username
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      console.log("OTP verification response:", response.data);
      
      if (response.data.status) {
        print_toast("success", "OTP verified successfully");
        onOtpVerified(response.data.reset_token);
      } else {
        setError(response.data.message || 'OTP verification failed');
        print_toast("error", response.data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError('An error occurred during OTP verification');
      print_toast("error", 'An error occurred during OTP verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h6 className="card-title text-center pb-0 fs-4 text-dark login-text">Enter OTP</h6>
        <p className="text-center small">
          A one-time password has been sent to your email: <strong>{email}</strong>
        </p>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="col-12 mb-3">
            <label htmlFor="otp" className="form-label">One-Time Password</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-shield-lock icon-color"></i>
              </span>
              <input
                type="text"
                className="form-control"
                id="otp"
                name="otp"
                value={otp}
                onChange={handleChange}
                placeholder="Enter the 6-digit OTP"
                required
                maxLength="6"
                autoComplete="off"
              />
            </div>
          </div>
          
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary mb-3" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <div className="text-center">
          <p className="small">
            Didn't receive the OTP? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </>
  );
};

export default OTPChecking;