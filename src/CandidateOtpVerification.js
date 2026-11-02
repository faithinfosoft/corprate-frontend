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

const CandidateOtpVerification = () => {
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
                navigate('/candidate-update-password', { state: { mail: otpemail } });
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
                            <h3 className="fw-bold mb-2">Corporate Management of Schools</h3>
                            <p className="text-white-50 mb-4">Archdiocese of Changanacherry</p>
                            <div className="border-top border-white opacity-25 w-50 mx-auto my-4"></div>
                            <h4 className="fw-light mb-3">Security Verification</h4>
                            <p className="small text-white-50">Please enter the 6-digit one-time password (OTP) sent to your registered email.</p>
                        </div>
                    </div>

                    {/* Right Side: OTP Form */}
                    <div className="col-lg-6 bg-white p-5">
                        <h4 className="fw-bold text-dark mb-4">Verify OTP</h4>
                        <p className="text-muted small mb-4">A code has been sent to <strong>{otpemail}</strong></p>

                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold text-uppercase">One-Time Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted"> <i className="bi bi-shield-lock"></i> </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0 bg-light"
                                        placeholder="Enter 6-digit OTP"
                                        name="member_otp"
                                        value={formData.member_otp}
                                        onChange={handleChange}
                                        pattern="\d{6}"
                                        maxLength="6"
                                        inputMode="numeric"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="d-grid mb-4">
                                <button type="submit" className="btn btn-primary py-2 fw-bold shadow-sm" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-circle me-2"></i>}
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link to="/candidate-forgot-password" title="Go back to forgot password page" className="text-decoration-none small text-muted">
                                    <i className="bi bi-arrow-left me-1"></i> Resend code or try again
                                </Link>
                            </div>
                        </form>

                        {formError && (
                            <div className="alert alert-danger d-flex align-items-center mt-3" role="alert">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                <div>{formError}</div>
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

export default CandidateOtpVerification;
