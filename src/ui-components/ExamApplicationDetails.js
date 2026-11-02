import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import globalVariables from "../Global.js";
import Breadcum from './Breadcum.js';
import AppliedCandidates from './AppliedCandidates';
import CertificateVerificationSchedule from './CertificateVerificationSchedule';
import MarkList from './MarkList';
import CategoryMeritList from './CategoryMeritList';
import CandidateExamRankList from './CandidateExamRankList';
import { convertDateFormat, capitalizeWords } from '../utilities/dateconverter';
import useAuth from "../utilities/useAuth";

const ExamApplicationDetails = () => {
    const { application_id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isVerifier = user?.user_type === 'certificate_verifier';

    // Determine active tab from hash or default to 'applicants'
    const [activeTab, setActiveTab] = useState(() => {
        if (isVerifier) return 'marks';
        const hash = window.location.hash.replace('#', '');
        return hash || 'applicants';
    });

    const [application, setApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExcelLoading, setIsExcelLoading] = useState(false);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [isSubjectSelected, setIsSubjectSelected] = useState(false);
    const [detailModalIsOpen, setDetailModalIsOpen] = useState(false);

    const [breadcum] = useState([
        { Title: 'Home', Link: '/' },
        { Title: 'Exam Applications', Link: '/exam-application' },
        { Title: 'Exam Details', Link: '' },
    ]);

    useEffect(() => {
        fetchApplicationDetails();

        const handleSubjectUpdate = (e) => {
            const hasCandidates = e.detail?.hasRankedCandidates !== undefined ? e.detail.hasRankedCandidates : !!e.detail?.subjectId;
            setIsSubjectSelected(!!e.detail?.subjectId && hasCandidates);
        };

        window.addEventListener('rank-subject-selected', handleSubjectUpdate);

        const handleHashChange = () => {
            if (isVerifier) {
                setActiveTab('marks');
                window.location.hash = 'marks';
                return;
            }
            const hash = window.location.hash.replace('#', '');
            if (hash) setActiveTab(hash);
            
            // Clear selection state when switching tabs
            if (hash !== 'rank') {
                setIsSubjectSelected(false);
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('rank-subject-selected', handleSubjectUpdate);
        };
    }, [application_id, isVerifier]);

    const fetchApplicationDetails = async () => {
        try {
            const response = await axios.get(
                `${globalVariables.api_url}/exam_application/get_Applications_application_id`,
                { params: { application_id } }
            );
            if (response.data?.data?.length > 0) {
                setApplication(response.data.data[0]);
            }
        } catch (error) {
            console.error('Error fetching application details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        window.location.hash = tabId;
    };

    const handleExportExcel = () => {
        setIsExcelLoading(true);
        // Dispatch custom event to trigger export in child component
        const event = new CustomEvent('trigger-rank-excel-export', { 
            detail: { 
                onComplete: () => setIsExcelLoading(false),
                onError: () => setIsExcelLoading(false)
            } 
        });
        window.dispatchEvent(event);
    };

    const handleGeneratePDF = () => {
        setIsPdfLoading(true);
        const event = new CustomEvent('trigger-rank-pdf-export', { 
            detail: { 
                onComplete: () => setIsPdfLoading(false),
                onError: () => setIsPdfLoading(false)
            } 
        });
        window.dispatchEvent(event);
    };

    if (isLoading) {
        return <div className="p-5 text-center"><div className="spinner-border text-primary" role="status"></div></div>;
    }

    return (
        <div className="exam-details-portal">
            <Breadcum items={breadcum} title={application?.application_title || 'Exam Details'} />

            {/* Official Header Banner */}
            <div className="official-banner mb-4">
                <div className="banner-content">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="banner-icon-bg me-4 mb-3 mb-md-0">
                                    <i className="fas fa-university fa-3x text-gold"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <h2 className="portal-title mb-1 text-white">{application?.application_title}</h2>
                                    <div className="d-flex align-items-center gap-3 flex-wrap">
                                        <span className={`portal-badge ${application?.application_status === 'published' ? 'state-active' : 'state-pending'}`}>
                                            <i className={`fas ${application?.application_status === 'published' ? 'fa-check-circle' : 'fa-clock'} me-2`}></i>
                                            {capitalizeWords(application?.application_status || 'Under Review')}
                                        </span>
                                        <button
                                            className="btn btn-link text-light-blue p-0 small fw-medium text-decoration-none hover-gold"
                                            onClick={() => setDetailModalIsOpen(true)}
                                        >
                                            <i className="fas fa-info-circle me-1 text-gold"></i>
                                            Exam Description
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-5">
                            <div className="top-timeline-panel mt-4 mt-lg-0">
                                <div className="row g-3 justify-content-lg-end">
                                    <div className="col-sm-6 text-lg-end">
                                        <div className="timeline-item-top border-0 pe-0">
                                            <div className="label">Opening Date</div>
                                            <div className="date-val text-white">{convertDateFormat(application?.start_date)}</div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 text-lg-end">
                                        <div className="timeline-item-top border-0 pe-0">
                                            <div className="label">Closing Date</div>
                                            <div className="date-val text-bright-red">{convertDateFormat(application?.end_date)}</div>
                                        </div>
                                    </div>
                                    {application?.exam_date && (
                                        <div className="col-sm-6 text-lg-end">
                                            <div className="timeline-item-top border-0 pe-0">
                                                <div className="label">Exam Date</div>
                                                <div className="date-val text-gold">{convertDateFormat(application?.exam_date)}</div>
                                            </div>
                                        </div>
                                    )}
                                    {application?.exam_location && (
                                        <div className="col-sm-6 text-lg-end">
                                            <div className="timeline-item-top border-0 pe-0">
                                                <div className="label">Location</div>
                                                <div className="date-val text-white small" style={{ fontSize: '0.9rem' }}>{application?.exam_location}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exam Description Modal */}
            <Modal show={detailModalIsOpen} onHide={() => setDetailModalIsOpen(false)} centered size="lg" className="portal-modal">
                <Modal.Header closeButton className="bg-dark-blue text-white">
                    <Modal.Title className="fw-bold fs-5">
                        <i className="fas fa-file-alt me-2 text-gold"></i> Exam Description & Instructions
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <h5 className="fw-bold text-dark mb-3">{application?.application_title}</h5>
                    <div className="description-text shadow-none border-0 p-0" dangerouslySetInnerHTML={{ __html: application?.description }}></div>

                    <div className="mt-4 p-3 bg-light rounded-3 border">
                        <div className="row">
                            <div className="col-6 border-end">
                                <label className="d-block text-muted small fw-bold text-uppercase mb-1">Application Opens</label>
                                <div className="fw-bold text-primary">{convertDateFormat(application?.start_date)}</div>
                            </div>
                            <div className="col-6">
                                <label className="d-block text-muted small fw-bold text-uppercase mb-1">Application Closes</label>
                                <div className="fw-bold text-danger">{convertDateFormat(application?.end_date)}</div>
                            </div>
                            {(application?.exam_date || application?.exam_location) && (
                                <div className="col-12 mt-3 pt-3 border-top">
                                    <div className="row">
                                        {application?.exam_date && (
                                            <div className="col-6 border-end">
                                                <label className="d-block text-muted small fw-bold text-uppercase mb-1">Scheduled Exam Date</label>
                                                <div className="fw-bold text-success"><i className="fas fa-calendar-check me-2"></i>{convertDateFormat(application?.exam_date)}</div>
                                            </div>
                                        )}
                                        {application?.exam_location && (
                                            <div className="col-6">
                                                <label className="d-block text-muted small fw-bold text-uppercase mb-1">Exam Venue</label>
                                                <div className="fw-bold text-dark"><i className="fas fa-map-marker-alt me-2"></i>{application?.exam_location}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <button className="btn btn-primary px-4 fw-bold" onClick={() => setDetailModalIsOpen(false)}>Close Portal</button>
                </Modal.Footer>
            </Modal>

            {/* Top Navigation Tabs */}
            <div className="navigation-tabs-container mb-4 sticky-top" style={{ top: '0', zIndex: 1000 }}>
                <div className="d-flex bg-white rounded-3 shadow-sm p-2 overflow-auto custom-scrollbar">
                    {!isVerifier && (
                        <button
                            onClick={() => handleTabClick('applicants')}
                            className={`tab-item flex-fill text-center py-2 px-3 border-0 rounded-2 position-relative ${activeTab === 'applicants' ? 'active' : ''}`}
                        >
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <i className="fas fa-user-graduate fs-5"></i>
                                <div className="text-start">
                                    <span className="d-block fw-bold small">Applicants Detail</span>
                                    <span className="d-block x-small text-muted d-none d-md-block">Manage candidates</span>
                                </div>
                            </div>
                        </button>
                    )}
                    
                    {!isVerifier && <div className="vr my-2 mx-1 text-muted opacity-25"></div>}

                    {isVerifier ? (
                        <button
                            onClick={() => handleTabClick('marks')}
                            className={`tab-item flex-fill text-center py-2 px-3 border-0 rounded-2 position-relative ${activeTab === 'marks' ? 'active' : ''}`}
                        >
                            <div className="d-flex align-items-center justify-content-center gap-2">
                                <i className="fas fa-file-signature fs-5"></i>
                                <div className="text-start">
                                    <span className="d-block fw-bold small">Valuation & Marks</span>
                                    <span className="d-block x-small text-muted d-none d-md-block">Score management</span>
                                </div>
                            </div>
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => handleTabClick('schedule')}
                                className={`tab-item flex-fill text-center py-2 px-3 border-0 rounded-2 position-relative ${activeTab === 'schedule' ? 'active' : ''}`}
                            >
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-calendar-alt fs-5"></i>
                                    <div className="text-start">
                                        <span className="d-block fw-bold small">Verification Schedule</span>
                                        <span className="d-block x-small text-muted d-none d-md-block">Time & Venue</span>
                                    </div>
                                </div>
                            </button>
                            <div className="vr my-2 mx-1 text-muted opacity-25"></div>

                            <button
                                onClick={() => handleTabClick('marks')}
                                className={`tab-item flex-fill text-center py-2 px-3 border-0 rounded-2 position-relative ${activeTab === 'marks' ? 'active' : ''}`}
                            >
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-file-signature fs-5"></i>
                                    <div className="text-start">
                                        <span className="d-block fw-bold small">Valuation & Marks</span>
                                        <span className="d-block x-small text-muted d-none d-md-block">Score management</span>
                                    </div>
                                </div>
                            </button>
                            <div className="vr my-2 mx-1 text-muted opacity-25"></div>

                            <button
                                onClick={() => handleTabClick('merit')}
                                className={`tab-item flex-fill text-center py-2 px-3 border-0 rounded-2 position-relative ${activeTab === 'merit' ? 'active' : ''}`}
                            >
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-layer-group fs-5"></i>
                                    <div className="text-start">
                                        <span className="d-block fw-bold small">Merit List</span>
                                        <span className="d-block x-small text-muted d-none d-md-block">Quota rotation & selection</span>
                                    </div>
                                </div>
                            </button>
                            <div className="vr my-2 mx-1 text-muted opacity-25"></div>

                            <button
                                onClick={() => handleTabClick('rank')}
                                className={`tab-item flex-fill text-center py-2 px-3 border-0 rounded-2 position-relative ${activeTab === 'rank' ? 'active' : ''}`}
                            >
                                <div className="d-flex align-items-center justify-content-center gap-2">
                                    <i className="fas fa-medal fs-5"></i>
                                    <div className="text-start">
                                        <span className="d-block fw-bold small">Official Rank List</span>
                                        <span className="d-block x-small text-muted d-none d-md-block">Merit selection</span>
                                    </div>
                                </div>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Portal Viewport - Full Width */}
            <div className="portal-viewport card border-0 shadow-sm min-vh-100 mb-4">
                <div className="viewport-header d-flex justify-content-between align-items-center py-3 px-4 bg-white border-bottom">
                    <h5 className="mb-0 fw-bold text-dark">
                        {activeTab === 'applicants' && <><i className="fas fa-user-graduate text-primary me-2"></i> Details of Enrolled Applicants</>}
                        {activeTab === 'schedule' && <><i className="fas fa-calendar-alt text-info me-2"></i> Certificate Verification Schedule</>}
                        {activeTab === 'marks' && <><i className="fas fa-file-signature text-warning me-2"></i> Candidate Mark List Portal</>}
                        {activeTab === 'merit' && <><i className="fas fa-layer-group text-primary me-2"></i> Merit List</>}
                        {activeTab === 'rank' && <><i className="fas fa-medal text-success me-2"></i> Official Merit Rank List</>}
                    </h5>
                    
                    {activeTab === 'rank' && !isVerifier && isSubjectSelected && (
                        <div className="header-actions d-flex gap-2">
                            <button 
                                onClick={handleGeneratePDF}
                                className="btn btn-outline-danger btn-sm fw-bold shadow-sm d-flex align-items-center gap-2 px-3"
                                disabled={isPdfLoading}
                            >
                                {isPdfLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-file-pdf fs-6"></i>
                                        Export PDF
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={handleExportExcel}
                                className="btn btn-outline-success btn-sm fw-bold shadow-sm d-flex align-items-center gap-2 px-3"
                                disabled={isExcelLoading}
                            >
                                {isExcelLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-file-excel fs-6"></i>
                                        Export to Excel
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
                <div className="viewport-content p-0">
                    {(activeTab === 'applicants' && !isVerifier) && <AppliedCandidates isEmbedded={true} />}
                    {(activeTab === 'schedule' && !isVerifier) && <CertificateVerificationSchedule isEmbedded={true} />}
                    {activeTab === 'marks' && <MarkList isEmbedded={true} />}
                    {(activeTab === 'merit' && !isVerifier) && <CategoryMeritList isEmbedded={true} />}
                    {(activeTab === 'rank' && !isVerifier) && <CandidateExamRankList isEmbedded={true} />}
                </div>
            </div>

            <style jsx>{`
                .exam-details-portal {
                    background-color: #f0f2f5;
                    padding-bottom: 3rem;
                }
                .official-banner {
                    background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
                    padding: 2.5rem;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(13, 71, 161, 0.2);
                    position: relative;
                    overflow: hidden;
                    border-bottom: 5px solid #ffd700;
                }
                .official-banner::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 300px;
                    height: 100%;
                    background: url('https://www.transparenttextures.com/patterns/cubes.png');
                    opacity: 0.1;
                }
                .banner-icon-bg {
                    background: rgba(255, 255, 255, 0.1);
                    width: 90px;
                    height: 90px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(5px);
                }
                .text-gold { color: #ffd700 !important; }
                .portal-title {
                    font-size: 1.8rem;
                    letter-spacing: -0.5px;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                .portal-badge {
                    padding: 0.5rem 1.25rem;
                    border-radius: 50px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    display: inline-flex;
                    align-items: center;
                }
                .state-active { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
                .state-pending { background: #fff8e1; color: #f57f17; border: 1px solid #ffecb3; }
                .text-light-blue { color: #bbdefb; }

                .top-timeline-panel {
                    background: rgba(255, 255, 255, 0.08);
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }
                .timeline-item-top {
                    padding-right: 1.5rem;
                    border-right: 1px solid rgba(255, 255, 255, 0.2);
                }
                .timeline-item-top .label {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    font-weight: 800;
                    color: rgba(255, 255, 255, 0.6);
                    letter-spacing: 1px;
                    margin-bottom: 2px;
                }
                .timeline-item-top .date-val {
                    font-size: 1.1rem;
                    font-weight: 800;
                    font-family: 'Inter', sans-serif;
                }
                
                /* Tab Navigation Styles */
                .navigation-tabs-container {
                    transition: top 0.3s;
                }
                
                .tab-item {
                    background: transparent;
                    color: #555;
                    transition: all 0.2s ease;
                }
                .tab-item:hover {
                    background-color: #f8f9fa;
                    color: #1a237e;
                }
                .tab-item.active {
                    background-color: #e8eaf6;
                    color: #1a237e;
                }
                .tab-item.active::after {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 20%;
                    right: 20%;
                    height: 3px;
                    background-color: #1a237e;
                    border-radius: 3px 3px 0 0;
                }
                .tab-item i {
                    transition: transform 0.2s;
                }
                .tab-item:hover i {
                    transform: scale(1.1);
                }
                
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #ccc;
                    border-radius: 4px;
                }

                .bg-dark-blue { background: #1a237e; }
                .x-small { font-size: 0.7rem; }
                .timeline-stat { border-left: 3px solid #eeeeee; padding-left: 1rem; }

                .viewport-header {
                    background: #fcfcfc !important;
                    border-top: 4px solid #1a237e;
                }
                .ls-1 { letter-spacing: 0.5px; }
                .hover-gold:hover { color: #ffd700 !important; }
                .bg-dark-blue { background: #1a237e !important; }
                .text-bright-red { color: #ff5252 !important; text-shadow: 0 0 10px rgba(255, 82, 82, 0.3); }
            `}</style>
        </div>
    );
};

export default ExamApplicationDetails;
