import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import globalVariables from "./Global.js";
import print_toast from "./utilities/Toaster.js";
import "./assets/ui-master/vendor/bootstrap-icons/bootstrap-icons.css";

const UpdatePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const otpemail = location.state?.mail || '';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
    email: otpemail,
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.new_password || !formData.confirm_password) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setFormError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(globalVariables.api_url + '/forgot-password/reset_password', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        navigate('/login');
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.message);
      }
    } catch (error) {
      console.error('Error:', error.message);
      print_toast("error", "An error occurred while changing the password.");
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
              <i className="bi bi-shield-check text-primary" style={{ fontSize: '2.5rem' }}></i>
            </div>
            <h3 className="fw-bold text-dark mb-1">Create New Password</h3>
            <p className="text-muted small">Your new password must be different from previous used passwords.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="new_password" className="form-label fw-semibold text-dark small mb-2">New Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-lock"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 bg-light py-2"
                  id="new_password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  required
                  style={{ boxShadow: 'none' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirm_password" className="form-label fw-semibold text-dark small mb-2">Confirm Password</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="bi bi-lock-fill"></i>
                </span>
                <input
                  type="password"
                  className="form-control border-start-0 bg-light py-2"
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                  style={{ boxShadow: 'none' }}
                />
              </div>
            </div>

            <div className="d-grid gap-2 mb-2">
              <button type="submit" className="btn btn-primary py-2 fw-bold shadow-sm" disabled={loading} style={{ transition: 'all 0.3s ease' }}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save me-2"></i>}
                {loading ? 'Updating...' : 'Update Password'}
              </button>
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
        .form-control:focus { border-color: #dee2e6; background-color: #fff !important; }
      `}</style>
    </div>
  );
};

export default UpdatePassword;
