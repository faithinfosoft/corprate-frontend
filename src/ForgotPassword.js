import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import globalVariables from "./Global.js";
import logo_image from "./assets/ui-master/img/logo.png";
import "./assets/ui-master/vendor/bootstrap-icons/bootstrap-icons.css";
import print_toast from "./utilities/Toaster.js";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('email', formData.username);

      const response = await axios.post(globalVariables.api_url + '/forgot-password/send_otp', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status === true) {
        print_toast("success", 'OTP sent to your email.');
        navigate('/verify-otp', { state: { key: response.data.key, email: response.data.email } });
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.message || '');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'An error occurred while sending OTP. Please try again.';
      print_toast("error", errorMsg);
      setFormError(errorMsg);
      console.error('Error sending OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center p-4 position-relative" style={{ backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
      {/* Background Decorative Elements */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden z-0">
        <div className="position-absolute rounded-circle bg-primary opacity-25" style={{ width: '400px', height: '400px', top: '-100px', left: '-100px', filter: 'blur(80px)' }}></div>
        <div className="position-absolute rounded-circle bg-info opacity-25" style={{ width: '300px', height: '300px', bottom: '5%', right: '-50px', filter: 'blur(60px)' }}></div>
      </div>

      <div className="card shadow-lg border-0 rounded-4 z-1" style={{ maxWidth: '450px', width: '100%', backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-3" style={{ width: '80px', height: '80px' }}>
              <i className="bi bi-shield-lock-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <h3 className="fw-bold text-dark mb-1">Forgot Password?</h3>
            <p className="text-muted small">No worries! Enter your email address and we'll send you an OTP to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="form-label fw-semibold text-dark small mb-2">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-envelope"></i>
                </span>
                <input
                  type="email"
                  className="form-control border-start-0 bg-light py-2"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your registered email"
                  required
                  style={{ boxShadow: 'none' }}
                />
              </div>
            </div>

            <div className="d-grid gap-2 mb-4">
              <button type="submit" className="btn btn-primary py-2 fw-bold shadow-sm" disabled={loading} style={{ transition: 'all 0.3s ease' }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send me-2"></i>}
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
              </button>
            </div>

            <div className="text-center">
              <Link to="/login" className="text-decoration-none text-muted small hover-primary" style={{ transition: 'color 0.3s' }}>
                <i className="bi bi-arrow-left me-1"></i> Back to Login
              </Link>
            </div>
          </form>

          {formError && (
            <div className="alert alert-danger d-flex align-items-center mt-4 mb-0 border-0 rounded-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <div className="small">{formError}</div>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <style>{`
        .hover-primary:hover { color: var(--bs-primary) !important; }
        .form-control:focus { border-color: #dee2e6; background-color: #fff !important; }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
