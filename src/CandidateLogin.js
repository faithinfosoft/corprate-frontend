import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import globalVariables from "./Global.js";
import logo_image from "./assets/ui-master/img/logo.png";
import './Login.css';
import "./assets/ui-master/vendor/bootstrap-icons/bootstrap-icons.css";
import print_toast from "./utilities/Toaster.js";
import Cookies from 'js-cookie';
import useAuth from './utilities/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import OtpVerification from './OTPChecking';
import PasswordReset from './PasswordReset';

const CandidateLogin = () => {
    const navigate = useNavigate();
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = useAuth();

    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [otpData, setOtpData] = useState({
        email: '',
        username: '',
        otp_key: ''
    });
    const [resetToken, setResetToken] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        userType: 'candidate', // Hardcoded as requested
    });

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

            if (response.data.is_temp_password === true) {
                print_toast("info", response.data.message, { duration: 10000 });
                setOtpData({
                    email: response.data.email,
                    username: response.data.username,
                    otp_key: response.data.otp_key
                });
                setShowOtpVerification(true);
            }
            else if (response.data.status === true) {
                const token = response.data.token;
                Cookies.set('token', token, { sameSite: 'None', secure: true });
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                auth.signin(response.data.user, () => {
                    navigate('/', { replace: true });
                });
            } else {
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
            userType: 'candidate',
        });
    };

    return (
        <div className="candidate-login-container">
            <div className="login-card shadow-lg">
                <div className="row g-0 h-100">
                    {/* Left Side: Info Panel */}
                    <div className="col-lg-6 info-panel">
                        <div className="info-content">
                            <div className="logo-container">
                                <img src={logo_image} alt="Logo" />
                            </div>
                            <h2 className="brand-name">Corporate Management of Schools</h2>
                            <p className="brand-subtitle">Archdiocese of Changanacherry</p>
                            <div className="divider"></div>
                            <h3 className="portal-name">Candidate Portal</h3>
                            <p className="portal-desc">
                                Secure access to exam applications, results, and career opportunities.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form Panel */}
                    <div className="col-lg-6 form-panel">
                        {showOtpVerification ? (
                            <div className="p-4 p-md-5">
                                <OtpVerification
                                    username={otpData.username}
                                    email={otpData.email}
                                    otp_key={otpData.otp_key}
                                    onOtpVerified={handleOtpVerified}
                                />
                            </div>
                        ) : showPasswordReset ? (
                            <div className="p-4 p-md-5">
                                <PasswordReset
                                    username={otpData.username}
                                    resetToken={resetToken}
                                    onPasswordReset={handlePasswordReset}
                                />
                            </div>
                        ) : (
                            <div className="p-4 p-md-5">
                                <h3 className="form-title">Candidate Login</h3>
                                <form onSubmit={handleLogin} className="mt-4">
                                    <div className="mb-4">
                                        <label className="input-label">USERNAME / EMAIL</label>
                                        <div className="input-group-custom">
                                            <span className="input-icon">
                                                <i className="bi bi-person"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control-custom"
                                                placeholder="Enter your username"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="input-label">PASSWORD</label>
                                        <div className="input-group-custom">
                                            <span className="input-icon">
                                                <i className="bi bi-lock"></i>
                                            </span>
                                            <input
                                                type="password"
                                                className="form-control-custom"
                                                placeholder="Enter your password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="d-grid mt-4">
                                        <button type="submit" className="btn btn-login" disabled={loading}>
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                            ) : (
                                                <i className="bi bi-box-arrow-in-right me-2"></i>
                                            )}
                                            {loading ? 'Signing In...' : 'Sign In'}
                                        </button>
                                    </div>

                                    <div className="text-end mt-2">
                                        <Link to="/candidate-forgot-password" size="sm" className="forgot-password">
                                            Forgot Password?
                                        </Link>
                                    </div>
                                </form>

                                {formError && (
                                    <div className="alert alert-danger mt-3 py-2 px-3 small border-0 shadow-sm" role="alert">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {formError}
                                    </div>
                                )}

                                <div className="registration-footer mt-5 pt-3 border-top text-center">
                                    <p className="no-account-text">Don't have an account?</p>
                                    <Link to="/candidate-registration" className="btn btn-register">
                                        Register Now
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
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
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                .candidate-login-container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f8fafc;
                    padding: 20px;
                    font-family: 'Inter', sans-serif;
                }

                .login-card {
                    max-width: 1000px;
                    width: 100%;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    min-height: 600px;
                }

                .info-panel {
                    background: #0d6efd;
                    background: linear-gradient(145deg, #0d6efd 0%, #0052cc 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    text-align: center;
                }

                .logo-container {
                    background: white;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 30px;
                    padding: 10px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }

                .logo-container img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .brand-name {
                    font-weight: 700;
                    font-size: 2rem;
                    margin-bottom: 5px;
                    line-height: 1.2;
                }

                .brand-subtitle {
                    color: rgba(255, 255, 255, 0.8);
                    font-weight: 400;
                    margin-bottom: 25px;
                }

                .divider {
                    width: 150px;
                    height: 1px;
                    background: rgba(255, 255, 255, 0.3);
                    margin: 25px auto;
                }

                .portal-name {
                    font-weight: 300;
                    font-size: 1.5rem;
                    margin-bottom: 15px;
                }

                .portal-desc {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.95rem;
                    max-width: 300px;
                    margin: 0 auto;
                }

                .form-panel {
                    background: white;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .form-title {
                    color: #1a202c;
                    font-weight: 700;
                    font-size: 1.75rem;
                }

                .input-label {
                    display: block;
                    font-size: 0.75rem;
                    font-weight: 700;
                    color: #718096;
                    margin-bottom: 8px;
                    letter-spacing: 0.5px;
                }

                .input-group-custom {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .input-icon {
                    position: absolute;
                    left: 15px;
                    color: #a0aec0;
                }

                .form-control-custom {
                    width: 100%;
                    padding: 12px 15px 12px 45px;
                    background-color: #f7fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: #2d3748;
                    transition: all 0.2s;
                }

                .form-control-custom:focus {
                    outline: none;
                    border-color: #0d6efd;
                    background-color: white;
                    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
                }

                .btn-login {
                    background-color: #0d6efd;
                    color: white;
                    border-radius: 8px;
                    padding: 12px;
                    font-weight: 600;
                    transition: all 0.2s;
                    border: none;
                }

                .btn-login:hover {
                    background-color: #0056b3;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
                    color: white;
                }

                .forgot-password {
                    color: #718096;
                    text-decoration: none;
                    font-size: 0.85rem;
                    transition: color 0.2s;
                }

                .forgot-password:hover {
                    color: #0d6efd;
                }

                .no-account-text {
                    color: #718096;
                    font-size: 0.85rem;
                    margin-bottom: 15px;
                }

                .btn-register {
                    background-color: #0d6efd;
                    color: white;
                    border-radius: 25px;
                    padding: 8px 30px;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-block;
                    transition: all 0.2s;
                }

                .btn-register:hover {
                    background-color: #0056b3;
                    transform: scale(1.05);
                    color: white;
                }

                @media (max-width: 991.98px) {
                    .info-panel {
                        padding: 30px 20px;
                    }
                    .brand-name {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default CandidateLogin;
