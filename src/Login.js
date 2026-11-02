// Login.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './assets/ui-master/css/style.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import globalVariables from "./Global.js";
import logo_image from "./assets/ui-master/img/logo.png";
import './Login.css';
import "./assets/ui-master/vendor/bootstrap-icons/bootstrap-icons.css";
import print_toast from "./utilities/Toaster.js";
import Cookies from 'js-cookie';
import useAuth from './utilities/useAuth';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import OtpVerification from './OTPChecking';
import PasswordReset from './PasswordReset';

const Login = () => {
  const navigate = useNavigate();
  let location = useLocation();
  let from = location.state?.from?.pathname || "/";
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [otpData, setOtpData] = useState({
    email: '',
    username: '',
    otp_key: ''
  });
  const [resetToken, setResetToken] = useState('');
  const auth = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    userType: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Debug useEffect to track state changes
  useEffect(() => {
    console.log("showOtpVerification state:", showOtpVerification);
  }, [showOtpVerification]);

  useEffect(() => {
    console.log("showPasswordReset state:", showPasswordReset);
  }, [showPasswordReset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFormError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(globalVariables.api_url + '/login/check_login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log("Login response:", response.data);

      // Check if this is the temporary password case
      if (response.data.is_temp_password === true) {
        print_toast("info", response.data.message, { duration: 10000 });
        // print_toast("info", response.data.message);
        setOtpData({
          email: response.data.email,
          username: response.data.username,
          otp_key: response.data.otp_key
        });
        console.log("Setting OTP data:", {
          email: response.data.email,
          username: response.data.username,
          otp_key: response.data.otp_key
        });
        console.log("Showing OTP verification screen");
        setShowOtpVerification(true);
      }
      // Normal login success flow
      else if (response.data.status === true) {
        const token = response.data.token;
        Cookies.set('token', token, { sameSite: 'None', secure: true });

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Login successful, navigating to /');

        auth.signin(response.data.user, () => {
          navigate('/', { replace: true });
        });
      }
      // Login failed
      else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || '');
      }
    } catch (error) {
      print_toast("error", 'An error occurred during login. Please try again.');
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = (token) => {
    console.log("OTP verified, received token:", token);
    setResetToken(token);
    setShowOtpVerification(false);
    setShowPasswordReset(true);
  };

  const handlePasswordReset = () => {
    print_toast("success", "Password reset successfully. Please login with your new password.", { duration: 10000 });
    setShowPasswordReset(false);
    setFormData({
      username: formData.username,
      password: '',
      userType: formData.userType,
    });
  };

  console.log("Current render state:", { showOtpVerification, showPasswordReset });

  return (
    <div className="login_page">
      <div className="container">
        <h1 className="main-heading text-center">Welcome to Corporate Management of Schools</h1>
        <h2 className="sub-heading text-center">Archdiocese of Changanacherry</h2>
        <div className="row justify-content-center">
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header text-center">
                <img src={logo_image} style={{ width: '152px', height: '152px' }} alt="Logo" />
              </div>

              {showOtpVerification ? (
                <OtpVerification
                  username={otpData.username}
                  email={otpData.email}
                  otp_key={otpData.otp_key}
                  onOtpVerified={handleOtpVerified}
                />
              ) : showPasswordReset ? (
                <PasswordReset
                  username={otpData.username}
                  resetToken={resetToken}
                  onPasswordReset={handlePasswordReset}
                />
              ) : (
                <>
                  <div>
                    <h6 className="card-title text-center pb-0 fs-4 text-dark login-text">Login to Your Account</h6>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleLogin}>
                      <div className="col-12 mb-1">
                        <label htmlFor="userType" className="form-label">User Type</label>
                        <div className="input-group has-validation">
                          <span className="input-group-text" id="inputGroupPrepend">
                            <i className="bi bi-gear icon-color"></i>
                          </span>
                          <select
                            className="form-select"
                            id="userType"
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select Type</option>
                            <option value="corporate_admin">Corporate Manager</option>
                            <option value="corporate_office">Corporate Office</option>
                            <option value="school_admin">Principal/HM</option>
                            <option value="school_manager">School Manager</option>
                            <option value="school_office">School Office</option>
                            {/* <option value="certificate_verifier">Certificate Verifier</option> */}
                            <option value="staff">Teaching/Non-Teaching Staff</option>
                          </select>
                          <div className="invalid-feedback">Please select a user type.</div>
                        </div>
                      </div>

                      <div className="col-12 mb-1">
                        <label htmlFor="yourUsername" className="form-label">Email/Username</label>
                        <div className="input-group has-validation">
                          <span className="input-group-text" id="inputGroupPrepend">
                            <i className="bi bi-person icon-color"></i>
                          </span>
                          <input
                            type="text"
                            className="form-control"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                          />
                          <div className="invalid-feedback">Please enter your username.</div>
                        </div>
                      </div>

                      <div className="col-12 mb-1">
                        <label htmlFor="yourPassword" className="form-label">Password</label>
                        <div className="input-group has-validation">
                          <span className="input-group-text" id="inputGroupPrepend">
                            <i className="bi bi-unlock icon-color"></i>
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                          />
                          <button
                            type="button"
                            className="input-group-text bg-white"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ borderLeft: 'none', cursor: 'pointer' }}
                          >
                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                          </button>
                          <div className="invalid-feedback">Please enter your Password.</div>
                        </div>
                      </div>

                      <div className="d-grid gap-2">
                        <button type="submit" className="login_btn btn btn-primary mb-3" disabled={loading}>
                          {loading ? 'Logging in...' : 'Login'}
                        </button>
                      </div>

                      <div className="text-center bottom-links mb-3 mt-2">
                        <Link to="/forgot-password" title="Click here to reset your password" className="text-primary login-bottom-links text-decoration-none">
                          <i className="bi bi-question-circle-fill me-2"></i>Forgotten Password?
                        </Link>
                      </div>
                    </form>

                    {formError && <div className="alert alert-danger mb-3">{formError}</div>}
                  </div>

                  <div className="card-footer bg-white border-top-0 pb-4">
                    <div className="text-center mb-3">
                      <Link to="/retired-staff-registration" className="text-primary login-bottom-links text-decoration-none d-block py-2 border rounded-pill hover-shadow">
                        <i className="bi bi-person-badge-fill me-2"></i>Retired Staff Registration
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Login;