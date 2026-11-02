import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import globalVariables from "../../Global.js";
import useAuth from '../../utilities/useAuth';
import Breadcum from '../Breadcum';
import member_image from "../../assets/ui-master/img/no_image _uploaded.jpg";
import { isScheduleExpired } from '../../utilities/dateconverter';

const CandidateDashboard = () => {
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Dashboard', Link: '' },
  ]);

  const navigate = useNavigate();
  const auth = useAuth();
  const candidate_id = auth.user.user_id;

  const [candidateData, setCandidateData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [completionStatus, setCompletionStatus] = useState({
    basic_info: false,
    qualifications: false,
    experience: false,
    cocurricular: false,
    family: false,
    subjects: false
  });
  const [schedules, setSchedules] = useState([]);

  const [activeExams, setActiveExams] = useState([]);

  const fetchCandidateBasicinfo = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidateManagement/get_candidate_parish`, {
        params: { candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setCandidateData(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setLoaded(true);
    }
  };

  const fetchCompletionStatus = async () => {
    try {
      console.log('Fetching completion status for candidate:', candidate_id);
      const response = await axios.get(`${globalVariables.api_url}/candidateManagement/get_profile_completion_status`, {
        params: { candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Completion status response:', response.data);
      if (response.data.status) {
        console.log('Setting completion status:', response.data.data);
        setCompletionStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching completion status:', error.message);
      console.error('Error details:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/certificate_verification/get_candidate_schedule`, {
        params: { candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status && Array.isArray(response.data.data)) {
        const activeSchedules = response.data.data.filter((s) => {
          return !isScheduleExpired(s.verification_date, s.verification_time);
        });
        setSchedules(activeSchedules);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error.message);
    }
  };

  const fetchActiveExams = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/exam_application/published_exam`);
      if (response.data.status && Array.isArray(response.data.data)) {
        const todayStr = (response.data.current_date || new Date().toISOString()).substring(0, 10);
        
        // Filter exams within active date range
        const openExams = response.data.data.filter(exam => {
          const startStr = String(exam.start_date || '').substring(0, 10);
          const endStr = String(exam.end_date || '').substring(0, 10);
          return (!startStr || todayStr >= startStr) && (!endStr || todayStr <= endStr);
        });

        // Check if candidate has applied to each exam and retrieve application status
        const examsWithStatus = await Promise.all(openExams.map(async (exam) => {
          try {
            const appRes = await axios.get(`${globalVariables.api_url}/candidateexamapplication/fetchapplication_data_exam`, {
              params: {
                fk_candidate_id: candidate_id,
                application_id: exam.application_id
              }
            });
            const appData = (appRes.data.status && appRes.data.data) ? appRes.data.data : null;
            const isApplied = Boolean(appData);
            const appStatus = appData?.status || null; // 'pending' | 'submitted' | 'requested' | 'approved' | 'rejected'
            return { ...exam, isApplied, appStatus, applicationData: appData };
          } catch (e) {
            return { ...exam, isApplied: false, appStatus: null, applicationData: null };
          }
        }));

        setActiveExams(examsWithStatus);
      }
    } catch (error) {
      console.error('Error fetching active exams in dashboard:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await axios.post(`${globalVariables.api_url}/certificate_verification/mark_as_read`, {
        candidate_id
      });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };


  useEffect(() => {
    fetchCandidateBasicinfo();
    fetchCompletionStatus();
    fetchSchedules();
    fetchActiveExams();
  }, [candidate_id]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parts[1];
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedHours = String(hours).padStart(2, '0');
      return `${formattedHours}:${minutes} ${ampm}`;
    }
    return timeStr;
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>

      <div className="container-fluid p-0">
        {/* Verification Schedule Notification Banner */}
        {schedules.length > 0 && (
          <div className="row mb-4 mt-2">
            <div className="col-12">
              <div 
                className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white position-relative" 
                style={{ 
                  boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}
              >
                {/* Decorative Top Accent Stripe */}
                <div style={{ height: '5px', background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #047857 100%)' }}></div>

                {/* Card Header */}
                <div className="card-header bg-white border-0 pt-3 px-4 pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div className="d-flex align-items-center">
                    <div 
                      className="text-white rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm" 
                      style={{ 
                        width: '46px', 
                        height: '46px', 
                        minWidth: '46px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                      }}
                    >
                      <i className="bi bi-patch-check-fill fs-4"></i>
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2.5 py-0.5 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                          <i className="bi bi-bell-fill me-1"></i> OFFICIAL SCHEDULE
                        </span>
                        <span className="badge rounded-pill bg-danger text-white px-2 py-0.5 fw-semibold" style={{ fontSize: '0.68rem' }}>
                          Action Required
                        </span>
                      </div>
                      <h5 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.3px' }}>
                        Certificate Verification Scheduled
                      </h5>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success text-white rounded-pill px-3 py-1.5 fw-semibold shadow-xs" style={{ fontSize: '0.78rem' }}>
                      <i className="bi bi-calendar-check me-1"></i> Scheduled
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body px-4 pb-4 pt-3">
                  {schedules.map((schedule, index) => (
                    <div key={index} className={index > 0 ? "pt-4 mt-4 border-top" : ""}>
                      {/* Exam Title Row */}
                      <div className="d-flex align-items-center gap-2 mb-3">
                        <span className="badge bg-primary text-white px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                          <i className="bi bi-mortarboard-fill me-1"></i> EXAMINATION
                        </span>
                        <h6 className="fw-bold text-dark mb-0 fs-5">
                          {schedule.application_title}
                        </h6>
                      </div>

                      {/* 3 Dedicated Detail Boxes: Venue, Date, Time */}
                      <div className="row g-3 mb-3">
                        {/* Venue */}
                        <div className="col-md-4">
                          <div className="d-flex align-items-center p-3 rounded-3 bg-light border border-light-subtle shadow-xs h-100">
                            <div 
                              className="rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-xs" 
                              style={{ width: '44px', height: '44px', minWidth: '44px', background: '#fee2e2', color: '#dc2626' }}
                            >
                              <i className="bi bi-geo-alt-fill fs-5"></i>
                            </div>
                            <div className="overflow-hidden">
                              <span className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                                Venue / Location
                              </span>
                              <span className="fw-bold text-dark fs-6 text-truncate d-block" title={schedule.venue}>
                                {schedule.venue}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="col-md-4">
                          <div className="d-flex align-items-center p-3 rounded-3 bg-light border border-light-subtle shadow-xs h-100">
                            <div 
                              className="rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-xs" 
                              style={{ width: '44px', height: '44px', minWidth: '44px', background: '#e0f2fe', color: '#0284c7' }}
                            >
                              <i className="bi bi-calendar-event-fill fs-5"></i>
                            </div>
                            <div>
                              <span className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                                Verification Date
                              </span>
                              <span className="fw-bold text-dark fs-6">
                                {formatDate(schedule.verification_date)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Time */}
                        <div className="col-md-4">
                          <div className="d-flex align-items-center p-3 rounded-3 bg-light border border-light-subtle shadow-xs h-100">
                            <div 
                              className="rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-xs" 
                              style={{ width: '44px', height: '44px', minWidth: '44px', background: '#fef3c7', color: '#d97706' }}
                            >
                              <i className="bi bi-clock-fill fs-5"></i>
                            </div>
                            <div>
                              <span className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                                Reporting Time
                              </span>
                              <span className="fw-bold text-dark fs-6">
                                {formatTime(schedule.verification_time)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer / Action */}
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2">
                        <div className="d-flex align-items-center text-muted small">
                          <i className="bi bi-info-circle-fill text-success me-2 fs-6"></i>
                          <span>Please report to the venue on the scheduled date and time with all your original certificates and credentials.</span>
                        </div>
                        <Link
                          to={schedule.fk_application_id ? `/ExamNotificationSubjects/${schedule.fk_application_id}` : `/CandidateExamNotifications`}
                          className="btn btn-success fw-bold px-4 py-2 rounded-pill shadow-sm d-inline-flex align-items-center gap-2"
                        >
                          <span>View Exam Details</span>
                          <i className="bi bi-arrow-right"></i>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Exam Notifications */}
        {activeExams.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              {activeExams.map((exam) => {
                const isDraft = exam.isApplied && (exam.appStatus === 'pending' || exam.appStatus === 'submitted');
                const isSubmitted = exam.isApplied && exam.appStatus === 'requested';
                const isApproved = exam.isApplied && exam.appStatus === 'approved';
                const isRejected = exam.isApplied && exam.appStatus === 'rejected';

                return (
                  <div 
                    key={exam.application_id} 
                    className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-3"
                    style={{ 
                      boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.1)',
                      border: '1px solid rgba(37, 99, 235, 0.2)'
                    }}
                  >
                    <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)' }}></div>
                    <div className="card-body p-3 p-md-4">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div className="d-flex align-items-start align-items-md-center">
                          <div 
                            className="text-white p-2 rounded-3 me-3 d-flex align-items-center justify-content-center shadow-sm"
                            style={{ 
                              width: '46px', 
                              height: '46px', 
                              minWidth: '46px',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                            }}
                          >
                            <i className="bi bi-bell-fill fs-5"></i>
                          </div>
                          <div>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                              <span className="badge bg-danger rounded-pill px-2.5 py-1 fw-bold" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                                <i className="bi bi-megaphone-fill me-1"></i> NEW EXAM NOTIFICATION
                              </span>
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 fw-semibold" style={{ fontSize: '0.68rem' }}>
                                Applications Open
                              </span>
                            </div>
                            <h5 className="fw-bold text-dark mb-1">{exam.application_title}</h5>
                            <div className="d-flex flex-wrap gap-3 text-secondary small">
                              <span>
                                <i className="bi bi-calendar-plus text-primary me-1"></i>
                                Starts: <strong>{formatDate(exam.start_date)}</strong>
                              </span>
                              <span>
                                <i className="bi bi-calendar-x text-danger me-1"></i>
                                Last Date: <strong className="text-danger">{formatDate(exam.end_date)}</strong>
                              </span>
                              {exam.exam_date && (
                                <span>
                                  <i className="bi bi-calendar-check text-success me-1"></i>
                                  Exam Date: <strong>{formatDate(exam.exam_date)}</strong>
                                </span>
                              )}
                              {exam.exam_location && (
                                <span>
                                  <i className="bi bi-geo-alt text-info me-1"></i>
                                  Venue: <strong>{exam.exam_location}</strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2 align-items-center ms-md-auto ps-5 ps-md-0">
                          {exam.isApplied ? (
                            <div className="d-flex flex-column align-items-end">
                              {isDraft ? (
                                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning px-3 py-2 rounded-pill fw-bold mb-1">
                                  <i className="bi bi-exclamation-circle-fill me-1 text-warning"></i> Application Incomplete
                                </span>
                              ) : (
                                <span className={`badge ${isApproved ? 'bg-success text-white' : isRejected ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-success-subtle text-success border border-success-subtle'} px-3 py-2 rounded-pill fw-bold mb-1`}>
                                  <i className={`bi ${isRejected ? 'bi-x-circle-fill' : 'bi-check-circle-fill'} me-1`}></i> 
                                  {isApproved ? 'Application Approved' : isRejected ? 'Application Rejected' : 'Application Submitted'}
                                </span>
                              )}
                              <Link to={`/ExamNotificationSubjects/${exam.application_id}`} className="small text-primary text-decoration-none fw-bold">
                                View Details <i className="bi bi-chevron-right"></i>
                              </Link>
                            </div>
                          ) : (
                            <Link 
                              to={`/ExamNotificationSubjects/${exam.application_id}`} 
                              className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                            >
                              <i className="bi bi-pencil-square"></i> Apply Now
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div 
              className="card border-0 text-white rounded-4 overflow-hidden position-relative"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.35)'
              }}
            >
              <div className="card-body p-4 p-md-5 z-2 position-relative">
                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.18)', color: '#ffffff' }}>
                  <i className="bi bi-person-badge"></i>
                  <span className="small fw-semibold">Candidate Portal</span>
                </div>
                <h2 className="fw-bold mb-2">
                  {getTimeGreeting()}, {candidateData.applicant_name || 'Candidate'}!
                </h2>
                <p className="lead mb-0 text-white-50">
                  Welcome to your Candidate Portal. Manage your profile, verification schedules, and exam applications here.
                </p>
              </div>
              <div 
                className="position-absolute top-0 end-0 h-100 w-50 d-none d-md-block"
                style={{
                  background: 'linear-gradient(270deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)',
                  transform: 'skewX(-20deg) translateX(50px)'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Warning / Instruction Message */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-warning border-0 shadow-sm rounded-4 d-flex align-items-center p-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill fs-2 me-3 text-warning"></i>
              <div>
                <h5 className="alert-heading fw-bold mb-1">Action Required Before Applying</h5>
                <p className="mb-0">
                  Please ensure that <strong>all profile sections</strong> (Basic Info, Subjects, Experience, Qualifications, Family, Co-curricular) are fully completed <strong>before applying</strong> for any exam. <br />
                  <strong>Note:</strong> Once you apply for an exam, your profile editing options will be disabled.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Candidate Details & Quick Actions */}
        <div className="row g-4">
          {/* Left: Profile Card */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body text-center p-4">
                <div className="mb-4 d-inline-block position-relative">
                  <img
                    src={
                      candidateData.photo && candidateData.photo !== "null" && candidateData.photo !== "undefined"
                        ? (candidateData.photo.startsWith('http') || candidateData.photo.startsWith('data:')
                            ? candidateData.photo
                            : `https://corporate.archeparchybookkeeping.org/uploads/candidate_photos/${candidateData.photo}`)
                        : (candidateData.photo_url && candidateData.photo_url !== "null" && candidateData.photo_url !== "undefined"
                            ? candidateData.photo_url
                            : (candidateData.gender?.toLowerCase() === 'female'
                                ? "https://cdn-icons-png.flaticon.com/512/3135/3135823.png"
                                : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"))
                    }
                    alt={candidateData.applicant_name}
                    className="rounded-circle border border-4 border-light shadow"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    onError={(e) => {
                      const photo = candidateData.photo;
                      const photoUrl = candidateData.photo_url;
                      const candidateImg = (photo && photo !== 'null' && photo !== 'undefined')
                        ? (photo.startsWith('http') ? photo.split('/').pop() : photo)
                        : (photoUrl && photoUrl !== 'null' && photoUrl !== 'undefined' ? photoUrl.split('/').pop() : null);

                      if (candidateImg) {
                        const step = parseInt(e.target.dataset.fallbackStep || '0', 10);
                        if (step === 0) {
                          e.target.dataset.fallbackStep = '1';
                          e.target.src = `/uploads/candidate_photos/${candidateImg}`;
                          return;
                        } else if (step === 1) {
                          e.target.dataset.fallbackStep = '2';
                          e.target.src = `https://corporate.archeparchybookkeeping.org/uploads/candidate_photos/${candidateImg}`;
                          return;
                        } else if (step === 2) {
                          e.target.dataset.fallbackStep = '3';
                          e.target.src = `${globalVariables.img_url}/uploads/candidate_photos/${candidateImg}`;
                          return;
                        } else if (step === 3) {
                          e.target.dataset.fallbackStep = '4';
                          e.target.src = `http://localhost/corporate_management/public/uploads/candidate_photos/${candidateImg}`;
                          return;
                        }
                      }
                      e.target.onerror = null;
                      const isFemale = candidateData.gender?.toLowerCase() === 'female';
                      e.target.src = isFemale
                        ? "https://cdn-icons-png.flaticon.com/512/3135/3135823.png"
                        : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                    }}
                  />
                </div>
                <h4 className="fw-bold mb-1">{candidateData.applicant_name}</h4>
                <p className="text-muted mb-3">{candidateData.email}</p>

                <div className="d-grid gap-2">
                  <button className="btn btn-outline-primary rounded-pill" onClick={() => navigate(`/CandidateProfile/${candidate_id}`)}>
                    <i className="bi bi-person-lines-fill me-2"></i> Complete Profile
                  </button>
                </div>
              </div>
              <ul className="list-group list-group-flush border-top-0">
                <li className="list-group-item d-flex justify-content-between align-items-center px-4 py-3 bg-transparent">
                  <span className="text-secondary"><i className="bi bi-phone me-2"></i> Phone</span>
                  <span className="fw-semibold">{candidateData.phone_no || 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-4 py-3 bg-transparent">
                  <span className="text-secondary"><i className="bi bi-calendar-event me-2"></i> DOB</span>
                  <span className="fw-semibold">{candidateData.dob ? formatDate(candidateData.dob) : 'N/A'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-4 py-3 bg-transparent">
                  <span className="text-secondary"><i className="bi bi-geo-alt me-2"></i> Parish</span>
                  <span className="fw-semibold">{candidateData.parish_name || 'N/A'}{(candidateData.location || candidateData.parish_place || candidateData.place) ? `, ${candidateData.location || candidateData.parish_place || candidateData.place}` : ''}{candidateData.forane_name ? `, ${candidateData.forane_name}` : ''}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Status or More Info */}
          <div className="col-lg-8">
            <div className="row g-4">
              {/* Stats or Info Cards */}
              <div className="col-md-6">
                <div className="card border-0 shadow-sm rounded-4 h-100 bg-info-subtle">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-white p-2 rounded-3 text-info shadow-sm me-3">
                        <i className="bi bi-journal-text fs-4"></i>
                      </div>
                      <h5 className="fw-bold mb-0">Exam Applications</h5>
                      {activeExams.length > 0 && (
                        <span className="badge bg-danger rounded-pill ms-auto px-2 py-1 shadow-sm">
                          {activeExams.length} Active
                        </span>
                      )}
                    </div>
                    <p className="mb-3 text-secondary">
                      {activeExams.length > 0 
                        ? `${activeExams.length} active exam notification(s) available. Apply before the deadline.`
                        : 'Check active exam notifications and apply.'}
                    </p>
                    <button className="btn btn-sm btn-light text-info fw-bold rounded-pill px-3 shadow-sm" onClick={() => navigate('/CandidateExamNotifications')}>
                      View Exams <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completion Status */}
            <div className="card border-0 shadow-sm rounded-4 mt-4">
              <div className="card-header bg-white border-0 py-3 px-4">
                <h5 className="fw-bold mb-0" style={{ color: '#000' }}>Profile Completion Status</h5>
              </div>
              <div className="card-body px-4 pb-4">
                <div className="d-flex align-items-center mb-3">
                  <i className={`bi bi-check-circle-fill ${completionStatus.basic_info ? 'text-success' : 'text-secondary'} me-3 fs-5`}></i>
                  <span>Basic Information</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className={`bi bi-check-circle-fill ${completionStatus.qualifications ? 'text-success' : 'text-secondary'} me-3 fs-5`}></i>
                  <span>Qualifications (Academic/Professional)</span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className={`bi bi-check-circle-fill ${completionStatus.experience ? 'text-success' : 'text-secondary'} me-3 fs-5`}></i>
                  <span>Experience Details</span>
                </div>
                <div className="d-flex align-items-center">
                  <i className={`bi bi-check-circle-fill ${completionStatus.cocurricular ? 'text-success' : 'text-secondary'} me-3 fs-5`}></i>
                  <span>Co-curricular &amp; Religious Activities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CandidateDashboard;