import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './RegistrationSuccess.css';
import logo_image from "./assets/ui-master/img/logo.png";

const RegistrationSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        // Trigger animation after component mounts
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Registration data can optionally be passed via state
    const { applicant_name } = location.state || {};

    return (
        <div className="success-page">
            <div className={`success-container ${showContent ? 'show' : ''}`}>
                {/* Header Section */}
                <div className="success-header">
                    <div className="checkmark-wrapper">
                        <svg className="checkmark" viewBox="0 0 52 52">
                            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                        </svg>
                    </div>
                    <h1>Registration Successful!</h1>
                    <p>Your application has been submitted successfully</p>
                </div>

                {/* Body Section */}
                <div className="success-body">
                    {/* Success Message */}
                    <div className="info-box success-message">
                        <div className="info-icon">✓</div>
                        <div className="info-content">
                            <h3>Thank you for registering{applicant_name ? `, ${applicant_name}` : ''}!</h3>
                            <p>
                                Your registration details have been securely received.
                                Our administrators will review your application shortly.
                            </p>
                        </div>
                    </div>

                    {/* Important Info */}
                    <div className="info-box important-info">
                        <div className="info-icon">i</div>
                        <div className="info-content">
                            <h3>Next Steps</h3>
                            <ul>
                                <li>Wait for administrator approval via email.</li>
                                <li>Once approved, you can log in with your credentials.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/candidate-login')}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RegistrationSuccess;

