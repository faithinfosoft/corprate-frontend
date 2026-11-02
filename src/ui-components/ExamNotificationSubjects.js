import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import globalVariables from "../Global.js";
import Breadcum from './Breadcum';
import { useParams, Link, Navigate, useLocation } from 'react-router-dom';
import useAuth from '../utilities/useAuth'; // Import the default export
import print_toast from "../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';
import { isScheduleExpired } from '../utilities/dateconverter';

const ExamNotificationSubjects = () => {
  const [loaded, setLoaded] = useState(false);
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Exam Notifications', Link: '/CandidateExamNotifications' },

  ]);
  const auth = useAuth();
  const user_name = auth.user.username;
  const candidate_id = auth.user.user_id;
  const navigate = useNavigate();
  const { application_id } = useParams();

  const location = useLocation();

  const decodeHtml = (html) => {
    if (!html) return "";
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value.replace(/<[^>]*>?/gm, '');
  };
  const [applicationdata, setApplicationdata] = useState({});
  const [examData, setExamSubjects] = useState([]); // State for exam data
  const [qualifications, setQualifications] = useState([]);
  const [candidatesubjects, setCandidatesubjects] = useState([]); // Initialize as an empty array
  const [formError, setFormError] = useState({});
  const [applicationexam, setApplicationExam] = useState({});
  const [readMoreModal, setReadMoreModal] = useState(false);
  const [descriptionToShow, setDescriptionToShow] = useState('');
  const [datasettingss, setDataSettings] = useState([]);
  const [examSchedule, setExamSchedule] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
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

  const [notificationformData, setNotofocationFormData] = useState({
    application_id: application_id,
    candidate_id: candidate_id,
  });





  const updatenotificationstatus = async (e) => {

    try {

      const response = await axios.post(globalVariables.api_url + '/candidateManagement/Update-read-notification-status', notificationformData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.status) {

      } else {
        let error = response.data.error;
        print_toast("error", response.data.message);
        setFormError(error || {});
      }
    } catch (error) {
      console.error('Error updating data:', error.message);
    } finally {

    }
  };

  useEffect(() => {
    updatenotificationstatus();
  }, []);

  const fetchSchedule = async () => {
    try {
      const candId = auth.user?.candidate_id || auth.user?.user_id || auth.user?.staff_id;
      if (!candId) return;

      const response = await axios.get(`${globalVariables.api_url}/certificate_verification/get_candidate_schedule`, {
        params: { candidate_id: candId },
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.status && Array.isArray(response.data.data)) {
        // Date/time is over -> do NOT show expired schedules
        const activeSchedules = response.data.data.filter((s) => {
          return !isScheduleExpired(s.verification_date, s.verification_time);
        });

        // Find schedule for this specific exam
        const matched = activeSchedules.find((s) => {
          if (s.fk_application_id && String(s.fk_application_id) === String(application_id)) return true;
          if (applicationdata?.application_title && s.application_title) {
            return s.application_title.toLowerCase().trim() === applicationdata.application_title.toLowerCase().trim();
          }
          return false;
        }) || (activeSchedules.length > 0 ? activeSchedules[0] : null);

        setExamSchedule(matched || null);

        if (matched) {
          axios.post(`${globalVariables.api_url}/certificate_verification/mark_as_read`, {
            candidate_id: candId,
          }).catch(() => {});
        }
      }
    } catch (error) {
      console.error('Error fetching verification schedule:', error.message);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [application_id, applicationdata?.application_title]);





  const fetch_count_published_exams = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/exam_application/all_exam_subjects`, {
        params: { application_id },
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.status) {
        setExamSubjects(response.data.data); // Store fetched data in state
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetch_count_published_exams();
  }, []);

  const fetchappicationdata = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/exam_application/application_by_id`, {
        params: { application_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        const appData = response.data.data;
        setApplicationdata(appData);
        const todayStr = new Date().toISOString().substring(0, 10);
        const endStr = String(appData?.end_date || '').substring(0, 10);
        if (endStr && todayStr > endStr) {
          setReadMoreModal(false);
        }
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchappicationdata();
  }, [application_id]);

  const [formData, setFormData] = useState({
    fk_candidate_id: candidate_id,
    exam_application_subject_ids: [], // Initialize as an array
    save_flag: false,
    fk_application_id: application_id,
  });





  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox' && name === 'exam_application_subject_ids') {
      const valStr = String(value);
      setFormData((prevFormData) => {
        const currentSubjects = prevFormData.exam_application_subject_ids || [];
        let updatedSubjects;
        if (checked) {
          updatedSubjects = currentSubjects.some((id) => String(id) === valStr)
            ? currentSubjects
            : [...currentSubjects, valStr];
        } else {
          updatedSubjects = currentSubjects.filter((subjectId) => String(subjectId) !== valStr);
        }
        return {
          ...prevFormData,
          exam_application_subject_ids: updatedSubjects,
        };
      });
    }

    // Clear errors for both form and editFormData
    setFormError((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };


  const todayStr = new Date().toISOString().substring(0, 10);
  const endStr = String(applicationdata?.end_date || '').substring(0, 10);
  const isClosed = Boolean(endStr && todayStr > endStr);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (isClosed) {
      print_toast('error', 'The application period for this exam is closed. New applications are not accepted.');
      return;
    }

    if (!formData.exam_application_subject_ids || formData.exam_application_subject_ids.length === 0) {
      print_toast('warning', 'Please select at least one subject to proceed.');
      return;
    }

    try {
      // Set save_flag to true
      setFormData((prevFormData) => ({
        ...prevFormData,
        save_flag: true,
      }));

      // Send POST request
      const response = await axios.post(
        `${globalVariables.api_url}/candidateexamapplication/save`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // Handle response
      if (response.data.status) {
        print_toast('success', response.data.message);
        navigate(`/CandidatePreviewExam/${application_id}`);
      } else {
        const error = response.data.error || {};
        print_toast('error', response.data.message);
        setFormError(error);
      }
    } catch (error) {
      console.error('Error saving application:', error.message);
      print_toast('error', 'An unexpected error occurred while saving.');
    } finally {
      // Reset save_flag to false
      setFormData((prevFormData) => ({
        ...prevFormData,
        save_flag: false,
      }));
    }
  };




  const fetchqualifications = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidatequalificationdetails/qualification_details`, {
        params: { fk_candidate_id: candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setQualifications(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchqualifications();
  }, []);

  const fetchCandidateSubjects = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidatesubject/view_subject`, {
        params: { fk_candidate_id: candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setCandidatesubjects(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchCandidateSubjects();
  }, []);

  // Check if subjects in candidatesubjects match with examData
  const isSubjectDisabled = (subject_id) => {
    return !candidatesubjects.some(candidate => String(candidate.fk_subject_id) === String(subject_id));
  };






  const fetchapplication_data_exam = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/candidateexamapplication/fetchapplication_data_exam`,
        {
          params: {
            fk_candidate_id: candidate_id,
            application_id: application_id
          },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Check if the request was successful
      if (response.data.status && response.data.data) {
        const examApp = response.data.data;
        setApplicationExam(examApp); // Update application state
        setReadMoreModal(false);

        // Pre-select already applied subjects if any
        if (examApp.subjects && Array.isArray(examApp.subjects) && examApp.subjects.length > 0) {
          const preSelected = examApp.subjects.map(s => String(s.fk_exam_application_subject_id || s.exam_application_subject_id || s.subject_id));
          setFormData((prev) => ({
            ...prev,
            exam_application_subject_ids: preSelected,
          }));
        }
      } else {
        // No existing application — show guidelines modal first
        setReadMoreModal(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);

      // Optional: Show an error notification or update the UI
      // Example: setError('Failed to load application data.');
    } finally {
      setLoaded(true); // Ensure the loading state is updated
    }
  };

  useEffect(() => {
    fetchapplication_data_exam();
  }, []);





  const fetchDataSettings = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/datasettings/view');
      if (response.data.status) {
        setDataSettings(response.data.data);
      } else {
        //alert(response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchDataSettings();
  }, []);


  const [agreeChecked, setAgreeChecked] = useState(false);

  const handleCheckboxChange = (event) => {
    setAgreeChecked(event.target.checked);
  };

  const handleContinue = () => {
    if (agreeChecked) {
      setReadMoreModal(false);
    }
  };

  const closeReadMoreModal = () => {
    setReadMoreModal(false);
    setDescriptionToShow('');
  };



  return (
    <>
      <Breadcum items={breadcum} title="Exam Notifications" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow-sm">
              <div className="card-header bg-primary text-white">
                <h3 className="card-title mb-0">{decodeHtml(applicationdata.application_title)}</h3>
              </div>
              <div className="card-body">


              {(!isClosed && (!applicationexam || (applicationexam.status !== 'requested' && applicationexam.status !== 'approved' && applicationexam.status !== 'rejected'))) && (
                <>
                  <span style={{ color: "red" }}>
                    Please note : You must add the first subject to your profile before applying for the exam
                  </span>
                  (
                  <span>
                    <Link to={`/CandidateProfile/${candidate_id}`}>
                      <span style={{ color: "blue" }}>Click</span>
                    </Link>
                    <span> to add subject details</span>
                  </span>
                  )

                  <p className="card-text text-muted mt-3">
                    {applicationdata?.description?.replace(/<[^>]*>/g, '') || "No description available"}
                  </p>
                </>
              )}

              {isClosed && (!applicationexam || (applicationexam.status !== 'submitted' && applicationexam.status !== 'pending' && applicationexam.status !== 'requested' && applicationexam.status !== 'approved' && applicationexam.status !== 'rejected')) ? (
                <div className="alert alert-danger mt-4 p-5 text-center shadow-sm border-0" style={{ borderRadius: '15px' }}>
                  <div className="mb-3">
                    <i className="bi bi-calendar-x-fill text-danger" style={{ fontSize: '3.5rem' }}></i>
                  </div>
                  <h4 className="fw-bold text-danger mb-2">Application Period Closed</h4>
                  <p className="text-muted fs-6 mb-0">
                    The deadline for <strong>{decodeHtml(applicationdata.application_title)}</strong> has ended. New applications cannot be submitted for this finished exam.
                  </p>
                </div>
              ) : applicationexam && (applicationexam.status === 'submitted' || applicationexam.status === 'pending' || applicationexam.status === 'requested' || applicationexam.status === 'approved' || applicationexam.status === 'rejected') ? (
                /* Application in progress or completed — show read-only status and View button */
                <div className={`alert ${applicationexam.status === 'requested' || applicationexam.status === 'approved' ? 'alert-success' : 'alert-info'} mt-4 p-5 text-center shadow-sm border-0`} style={{ borderRadius: '15px' }}>
                  <div className="mb-3">
                    {applicationexam.status === 'requested' || applicationexam.status === 'approved' ? (
                      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3.5rem' }}></i>
                    ) : applicationexam.status === 'pending' || applicationexam.status === 'submitted' ? (
                      <i className="bi bi-exclamation-circle-fill text-info" style={{ fontSize: '3.5rem' }}></i>
                    ) : (
                      <i className="bi bi-info-circle-fill text-primary" style={{ fontSize: '3.5rem' }}></i>
                    )}
                  </div>

                  {applicationexam.status !== 'pending' && applicationexam.status !== 'submitted' && applicationexam.status !== 'requested' && (
                    <h4 className="fw-bold mb-3">Application Status: <span className="text-uppercase text-primary">{applicationexam.status}</span></h4>
                  )}

                  <h5 className="mt-2 mb-4 px-lg-5" style={{
                    fontWeight: '600',
                    lineHeight: '1.6',
                    letterSpacing: '0.5px',
                    color: '#444'
                  }}>
                    {applicationexam.status === 'pending' || applicationexam.status === 'submitted'
                      ? "YOUR APPLICATION IS NOT COMPLETED. PLEASE VIEW DETAILS AND FILL THE DATA, SUBMIT AND CHECK PRINT PREVIEW, AND THEN FINALLY SUBMIT THIS FORM."
                      : applicationexam.status === 'requested'
                        ? "YOUR APPLICATION HAS BEEN SUCCESSFULLY SENT."
                        : applicationexam.status === 'approved'
                          ? "Congratulations! Your application has been approved. You can view your marks below if they are published."
                          : applicationexam.status === 'rejected'
                            ? "You have already applied for this exam."
                            : "You have already applied for this exam."}
                  </h5>

                  {(applicationexam.status === 'pending' || applicationexam.status === 'submitted') && (
                    <div className="mt-4 d-flex justify-content-center gap-3">
                      <Link
                        to={`/CandidatePreviewExam/${application_id}`}
                        className="btn btn-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
                      >
                        <i className="bi bi-pencil-square me-2"></i> Review &amp; Submit Application Form
                      </Link>
                    </div>
                  )}

                  <div className="mt-4">
                    {/* Certificate Verification Schedule Details */}
                    {examSchedule && (
                      <div className="mt-4 mb-4 text-start px-lg-5">
                        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                          <h6 className="fw-bold text-primary mb-0">
                            <i className="bi bi-calendar-check me-2"></i>CERTIFICATE VERIFICATION SCHEDULE
                          </h6>
                          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 fw-bold" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-check-circle-fill me-1"></i> Scheduled
                          </span>
                        </div>

                        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-2">
                          <div className="card-body p-4">
                            <div className="row g-3 align-items-center">
                              {/* Venue */}
                              <div className="col-md-4">
                                <div className="d-flex align-items-center p-3 rounded-3 bg-light border border-light-subtle h-100">
                                  <div className="bg-danger text-white rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '44px', height: '44px', minWidth: '44px' }}>
                                    <i className="bi bi-geo-alt-fill fs-5"></i>
                                  </div>
                                  <div className="overflow-hidden">
                                    <span className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>Venue / Location</span>
                                    <span className="fw-bold text-dark text-truncate d-block" title={examSchedule.venue}>{examSchedule.venue}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Date */}
                              <div className="col-md-4">
                                <div className="d-flex align-items-center p-3 rounded-3 bg-light border border-light-subtle h-100">
                                  <div className="bg-primary text-white rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '44px', height: '44px', minWidth: '44px' }}>
                                    <i className="bi bi-calendar-event fs-5"></i>
                                  </div>
                                  <div>
                                    <span className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>Verification Date</span>
                                    <span className="fw-bold text-dark">{formatDate(examSchedule.verification_date)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Time */}
                              <div className="col-md-4">
                                <div className="d-flex align-items-center p-3 rounded-3 bg-light border border-light-subtle h-100">
                                  <div className="bg-warning text-dark rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm" style={{ width: '44px', height: '44px', minWidth: '44px' }}>
                                    <i className="bi bi-clock-fill fs-5"></i>
                                  </div>
                                  <div>
                                    <span className="text-muted d-block text-uppercase fw-semibold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>Reporting Time</span>
                                    <span className="fw-bold text-dark">{formatTime(examSchedule.verification_time)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-top d-flex align-items-center text-muted small">
                              <i className="bi bi-info-circle-fill text-primary me-2 fs-6"></i>
                              <span>Please report to the venue on the scheduled date and time with all your original certificates and documents.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {(applicationexam.status === 'approved' || applicationexam.status === 'requested') && applicationexam.subjects && applicationexam.subjects.length > 0 && (
                      <div className="mt-4 text-start px-lg-5">
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">EXAM RESULTS & SUBJECTS</h6>
                        <div className="list-group shadow-sm">
                          {applicationexam.subjects.map((sub, idx) => (
                            <div key={idx} className="list-group-item d-flex justify-content-between align-items-center py-3">
                              <div>
                                <span className="fw-bold text-dark">{sub.subject_code ? `${sub.subject_code} - ` : ''}{sub.subject_name}</span>
                                <div className="small text-muted mt-1">Reg No: {sub.registration_number || 'N/A'}</div>
                              </div>
                              
                              {sub.marks_entered ? (
                                <button 
                                  className="btn btn-sm btn-success rounded-pill px-4 shadow-sm"
                                  onClick={() => navigate(`/candidate-view-marks/${btoa(sub.canididate_application_subject_id)}`)}
                                >
                                  <i className="bi bi-eye-fill me-1"></i> VIEW RESULTS
                                </button>
                              ) : (
                                <span className="badge bg-light text-muted border px-3 py-2 rounded-pill">
                                  <i className="bi bi-clock-history me-1"></i> Results Pending
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* No application yet OR pending/in-progress — show the form */
                <>
                  {applicationexam && applicationexam.status && (
                    <div className="alert alert-warning mt-3 py-2 text-center">
                      <strong>Application Status: {applicationexam.status.toUpperCase()}</strong>
                      &nbsp;— Your application is incomplete. Please complete and submit below.
                    </div>
                  )}

                  <h4 className="mt-4 mb-3 text-secondary">Select Subjects</h4>

                  {qualifications.length === 0 && candidatesubjects.length === 0 && (
                    <div className="alert alert-warning" role="alert">
                      Please enter qualifications and subject details.
                    </div>
                  )}

                  {/* Form Start */}
                  <form role="form" onSubmit={handleFormSubmit} className="row g-3">
                    <div className="form-group">
                      {examData.map((exam, index) => (
                        <div key={index} className="form-check mb-2 d-flex align-items-center">
                          <span className="me-2">
                            {isSubjectDisabled(exam.subject_id) ? (
                              <span className="text-danger fw-bold">✖</span>
                            ) : (
                              <input
                                className="form-check-input border-primary"
                                type="checkbox"
                                id={`subject-${index}`}
                                value={exam.exam_application_subject_id}
                                name="exam_application_subject_ids"
                                checked={formData.exam_application_subject_ids && formData.exam_application_subject_ids.some(id => String(id) === String(exam.exam_application_subject_id))}
                                onChange={handleChange}
                                style={{ cursor: 'pointer', border: '1px solid #0d6efd' }}
                              />
                            )}
                          </span>
                            <label className="form-check-label ms-2 d-flex justify-content-between align-items-center w-100" htmlFor={`subject-${index}`} style={{ cursor: 'pointer' }}>
                              <span>
                                {exam.subject_code ? `${exam.subject_code} - ` : ''}{exam.subject_name}
                              </span>
                              
                              {applicationexam?.subjects?.find(s => s.subject_id === exam.subject_id) && (
                                <button 
                                  className="btn btn-sm btn-outline-success rounded-pill px-3 shadow-sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const appliedSub = applicationexam.subjects.find(s => s.subject_id === exam.subject_id);
                                    navigate(`/candidate-mark-list/${btoa(appliedSub.canididate_application_subject_id)}`);
                                  }}
                                >
                                  <i className="bi bi-journal-check me-1"></i> VIEW MARKS
                                </button>
                              )}
                            </label>
                        </div>
                      ))}
                    </div>

                    {/* Next Button */}
                    <div className="mt-4 text-center">
                      <button
                        type="submit"
                        className="btn btn-success btn-lg px-5 shadow-sm"
                        disabled={formData.save_flag || isClosed || !formData.exam_application_subject_ids || formData.exam_application_subject_ids.length === 0}
                      >
                        {formData.save_flag ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          'Next'
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
              {/* Form End */}
            </div>
          </div>
        </div>


        <Modal show={readMoreModal && !isClosed} onHide={closeReadMoreModal} backdrop="static" size="xl">

          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title className="fs-5 text-white fw-bold">Exam Guidelines</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-0">
            <div className="exam-guidelines-content">
              {datasettingss && datasettingss.length > 0 ? (
                datasettingss.map((datasetting, index) => (
                  <div key={index}>
                    <div dangerouslySetInnerHTML={{ __html: datasetting.data_setting_description }} />
                  </div>
                ))
              ) : applicationdata?.description ? (
                <div dangerouslySetInnerHTML={{ __html: applicationdata.description }} />
              ) : (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-info-circle me-2"></i>No guidelines available.
                </div>
              )}
            </div>
          </Modal.Body>

          <Modal.Footer className="d-flex justify-content-between align-items-center flex-wrap gap-2 bg-light">
            <div className="d-flex align-items-center">
              <input
                type="checkbox"
                className="form-check-input border-primary m-0"
                id="agreeCheckbox"
                checked={agreeChecked}
                onChange={handleCheckboxChange}
                style={{ width: '22px', height: '22px', border: '2px solid #0d6efd', cursor: 'pointer' }}
              />
              <label htmlFor="agreeCheckbox" className="ms-2 mb-0" style={{ cursor: 'pointer', userSelect: 'none' }}>
                <span style={{ color: "#1e293b", fontWeight: "600", fontSize: '14px' }}>
                  I have read and agree to all the guidelines
                </span>
              </label>
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-secondary px-3" onClick={closeReadMoreModal}>
                Close
              </button>
              <button className="btn btn-success px-4" onClick={handleContinue} disabled={!agreeChecked}>
                Continue
              </button>
            </div>
          </Modal.Footer>
        </Modal>


        {/* Modal */}
        {/* <Modal show={readMoreModal} backdrop="static" size="xl">
        <Modal.Header>
          <Modal.Title>Exam Guidelines</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div dangerouslySetInnerHTML={{ __html: applicationdata?.description }} />
          <div className="mt-3">
            <input type="checkbox" id="agreeCheckbox" onChange={handleCheckboxChange} />
            <label htmlFor="agreeCheckbox" className="ms-2">
              I Agree
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-success" onClick={handleContinue} disabled={!agreeChecked}>
            Continue
          </button>
        </Modal.Footer>
      </Modal> */}
      </div>
    </>
  );
};

export default ExamNotificationSubjects;
