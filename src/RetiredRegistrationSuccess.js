
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RegistrationSuccess.css';

const RetiredRegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showContent, setShowContent] = useState(false);
  
  // Get registration data passed from previous page
  const registrationData = location.state || {};

  useEffect(() => {
    // Trigger animation after component mounts
    setTimeout(() => setShowContent(true), 100);
  }, []);

  return (
    <div className="success-page">
      <div className={`success-container ${showContent ? 'show' : ''}`}>
        {/* Header Section */}
        <div className="success-header">
          <div className="checkmark-wrapper">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h1>Registration Successful!</h1>
          <p>Your retired staff registration has been submitted successfully</p>
        </div>

        {/* Body Section */}
        <div className="success-body">
          {/* Success Message */}
          <div className="info-box success-message">
            <div className="info-icon">✓</div>
            <div className="info-content">
              <h3>Thank you for registering!</h3>
              <p>
                Your application has been received and is now being processed. 
              
              </p>
            </div>
          </div>

     

        </div>

        {/* Registration ID */}
        <div className="registration-id">
          
        </div>
      </div>
    </div>
  );
};

export default RetiredRegistrationSuccess;