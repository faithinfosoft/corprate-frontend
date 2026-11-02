import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import globalVariables from "./Global.js";
import print_toast from "./utilities/Toaster.js";
import "./assets/ui-master/vendor/bootstrap-icons/bootstrap-icons.css";

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const otpKey = location.state?.key || '';
  const otpemail = location.state?.email || '';

  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member_otp: '',
    member_otp_enc: otpKey,
    otpemail: otpemail,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!formData.member_otp) {
      setFormError('OTP cannot be empty.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${globalVariables.api_url}/forgot-password/verify_otp`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      if (response.data.status) {
        print_toast("success", 'OTP verified successfully.');
        navigate('/update-password', { state: { mail: otpemail } });
      } else {
        setFormError(response.data.message || 'OTP verification failed.');
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", 'An error occurred during OTP verification. Please try again.');
      console.error('Error verifying OTP:', error);
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
              <i className="bi bi-key-fill text-primary" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <h3 className="fw-bold text-dark mb-1">Verify OTP</h3>
            <p className="text-muted small">Enter the 6-digit code sent to <span className="fw-semibold text-dark">{otpemail}</span></p>
          </div>

          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4 text-center">
              <label htmlFor="member_otp" className="form-label fw-semibold text-dark small mb-2 visually-hidden">Enter OTP</label>
              <input
                type="text"
                className="form-control bg-light py-3 text-center fw-bold text-primary border-0"
                id="member_otp"
                name="member_otp"
                value={formData.member_otp}
                onChange={handleChange}
                pattern="\d{6}"
                maxLength="6"
                inputMode="numeric"
                onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
                placeholder="• • • • • •"
                required
                style={{ fontSize: '2rem', letterSpacing: '8px', boxShadow: 'none', borderRadius: '12px' }}
              />
            </div>

            <div className="d-grid gap-2 mb-4">
              <button type="submit" className="btn btn-primary py-2 fw-bold shadow-sm" disabled={loading} style={{ transition: 'all 0.3s ease' }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-circle me-2"></i>}
                {loading ? 'Verifying OTP...' : 'Verify OTP'}
              </button>
            </div>

            <div className="text-center">
              <Link to="/forgot-password" className="text-decoration-none text-muted small hover-primary" style={{ transition: 'color 0.3s' }}>
                <i className="bi bi-arrow-left me-1"></i> Change Email
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
        .form-control:focus { outline: 2px solid var(--bs-primary); outline-offset: -2px; }
      `}</style>
    </div>
  );
};

export default OtpVerification;
