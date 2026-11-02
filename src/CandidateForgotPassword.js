import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import globalVariables from "./Global.js";
import logo_image from "./assets/ui-master/img/logo.png";
import './Login.css';
import "./assets/ui-master/vendor/bootstrap-icons/bootstrap-icons.css";
import print_toast from "./utilities/Toaster.js";

const CandidateForgotPassword = () => {
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
            // Using URLSearchParams ensuring it is sent as application/x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('email', formData.username);

            const response = await axios.post(globalVariables.api_url + '/forgot-password/send_otp', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            if (response.data.status === true) {
                print_toast("success", 'OTP sent to your email.');
                navigate('/candidate-verify-otp', { state: { key: response.data.key, email: response.data.email, type: 'candidate' } });
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
        <div className="candidate-login-page min-vh-100 d-flex align-items-center justify-content-center p-4">
            <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ maxWidth: '900px', width: '100%' }}>
                <div className="row g-0">
                    {/* Left Side: Gradient Info Panel (Same as CandidateLogin) */}
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
                            <h4 className="fw-light mb-3">Candidate Portal</h4>
                            <p className="small text-white-50">Reset your password to regain access to your candidate portal.</p>
                        </div>
                    </div>

                    {/* Right Side: Forgot Password Form */}
                    <div className="col-lg-6 bg-white p-5">
                        <h4 className="fw-bold text-dark mb-2">Forgot Password</h4>
                        <p className="text-muted small mb-4">Enter your registered email address to receive a 6-digit OTP code.</p>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="form-label text-muted small fw-bold text-uppercase">Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0 text-muted"> <i className="bi bi-envelope"></i> </span>
                                    <input
                                        type="email"
                                        className="form-control border-start-0 bg-light"
                                        placeholder="Enter your registered email"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="d-grid mb-4">
                                <button type="submit" className="btn btn-primary py-2 fw-bold shadow-sm" disabled={loading}>
                                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send me-2"></i>}
                                    {loading ? 'Sending OTP...' : 'Send OTP'}
                                </button>
                            </div>

                            <div className="text-center">
                                <Link to="/candidate-login" className="text-decoration-none small text-primary fw-bold">
                                    <i className="bi bi-arrow-left me-1"></i> Back to Candidate Login
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
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
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

export default CandidateForgotPassword;
