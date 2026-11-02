import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import globalVariables from "./Global.js";
import print_toast from "./utilities/Toaster.js";
import logo_image from "./assets/ui-master/img/logo.png";
import './Login.css';
import "./assets/ui-master/vendor/bootstrap-icons/bootstrap-icons.css";

const CandidateUpdatePassword = () => {
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
                print_toast("success", "Password updated successfully. Please login.");
                navigate('/candidate-login');
            } else {
                setFormError(response.data.message);
                print_toast("error", response.data.message);
            }
        } catch (error) {
            console.error('Error:', error.message);
            print_toast("error", "An error occurred while changing the password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="candidate-login-page min-vh-100 d-flex align-items-center justify-content-center p-4">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '900px', width: '100%' }}>
                <div className="row g-0">
                    {/* Left Side: Info Panel */}
                    <div className="col-lg-6 bg-primary text-white p-5 d-flex flex-column justify-content-center align-items-center text-center position-relative">
                        <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25"
                            style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, transparent 70%)' }}></div>
                        <div className="position-relative z-1">
                            <div className="mb-4 bg-white rounded-circle p-2 mx-auto d-inline-block shadow-sm">
                                <img src={logo_image} style={{ width: '100px', height: '100px' }} alt="Logo" />
                            </div>
                            <h3 className="fw-bold mb-2">Create New Password</h3>
                            <p className="text-white-50 mb-4">You're almost there! Choose a strong password to protect your account.</p>
                            <div className="border-top border-white opacity-25 w-50 mx-auto my-4"></div>
                            <h4 className="fw-light mb-3">Password Security</h4>
                            <p className="small text-white-50">Please ensure your password is secure and not easily guessable.</p>
                        </div>
                    </div>

                    {/* Right Side: Reset Form */}
                    <div className="col-lg-6 bg-white p-5">
                        <h4 className="fw-bold text-dark mb-4">Set New Password</h4>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold text-uppercase">New Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted"> <i className="bi bi-lock"></i> </span>
                                    <input
                                        type="password"
                                        className="form-control border-start-0 bg-light"
                                        placeholder="Enter new password"
                                        name="new_password"
                                        value={formData.new_password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold text-uppercase">Confirm Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted"> <i className="bi bi-lock-fill"></i> </span>
                                    <input
                                        type="password"
                                        className="form-control border-start-0 bg-light"
                                        placeholder="Re-type new password"
                                        name="confirm_password"
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="d-grid mb-4">
                                <button type="submit" className="btn btn-primary py-2 fw-bold shadow-sm" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-shield-lock-fill me-2"></i>}
                                    {loading ? 'Updating...' : 'Set Password'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link to="/candidate-login" title="Go back to login page" className="text-decoration-none small text-muted">
                                    <i className="bi bi-arrow-left me-1"></i> Return to login
                                </Link>
                            </div>
                        </form>

                        {formError && (
                            <div className="alert alert-danger mt-3" role="alert">
                                <div><i className="bi bi-exclamation-triangle-fill me-2"></i>{formError}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                theme="colored"
            />

            <style>{`
                .candidate-login-page {
                    background-color: #f0f2f5;
                    background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),
                        url('https://www.transparenttextures.com/patterns/cubes.png');
                }
                .form-control:focus { box-shadow: none; border-color: var(--bs-primary); background-color: #fff; }
                .input-group-text { border-color: #ced4da; }
                .form-control.bg-light:focus { background-color: #fff; }
            `}</style>
        </div>
    );
};

export default CandidateUpdatePassword;
