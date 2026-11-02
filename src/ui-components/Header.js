import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo_image from "../assets/ui-master/img/logo.png";
import profile_image from "../assets/ui-master/img/profile-img.png";
import Cookies from "js-cookie";
import axios from "axios";
import useAuth from "../utilities/useAuth";
import globalVariables from "../Global.js";
import { isScheduleExpired } from "../utilities/dateconverter";

const Header = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const user_type = auth.user.user_type;
  const staff_id = auth.user.user_id;
  const staff_name = auth.user.login_user_name;
  const username = auth.user.username;

  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingServiceCount, setPendingServiceCount] = useState(0);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [pendingTransferCount, setPendingTransferCount] = useState(0);
  const [candidateUnreadCount, setCandidateUnreadCount] = useState(0);
  const [candidateExamCount, setCandidateExamCount] = useState(0);
  const [candidateScheduleCount, setCandidateScheduleCount] = useState(0);
  const [candidateScheduleExamId, setCandidateScheduleExamId] = useState(null);
  const [vacancyCount, setVacancyCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Refs to store interval IDs for cleanup
  const intervalsRef = useRef([]);

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchUnreadNotifications = useCallback(async () => {
    try {
      let endpoint = "";
      if (user_type === "school_admin") {
        endpoint = `${globalVariables.api_url}/notification/unread-count?email=${encodeURIComponent(username)}`;
      } else if (user_type === "staff") {
        endpoint = `${globalVariables.api_url}/schoolnotification/unread-count?email=${encodeURIComponent(username)}`;
      }

      if (endpoint) {
        const response = await axios.get(endpoint);
        if (response.data.status) {
          setUnreadCount(response.data.unreadCount);
        }
      } else if (user_type === "candidate") {
        let scheduleUnread = 0;
        let examUnread = 0;
        let targetExamId = null;
        let activeSchedule = null;
        let hasActiveSchedule = false;

        try {
          const schedRes = await axios.get(`${globalVariables.api_url}/certificate_verification/get_candidate_schedule?candidate_id=${staff_id}`);
          if (schedRes.data.status && Array.isArray(schedRes.data.data) && schedRes.data.data.length > 0) {
            const active = schedRes.data.data.filter(s => {
              return !isScheduleExpired(s.verification_date, s.verification_time);
            });
            if (active.length > 0) {
              hasActiveSchedule = true;
              activeSchedule = active[0];
              if (active[0].fk_application_id) {
                targetExamId = active[0].fk_application_id;
              }
            }
          }
        } catch (e) {
          console.error("Error fetching candidate schedule in header:", e);
        }

        // Do NOT show verification schedule notification if verification date is over
        if (hasActiveSchedule) {
          try {
            const response = await axios.get(`${globalVariables.api_url}/certificate_verification/get_unread_count?candidate_id=${staff_id}`);
            if (response.data.status) {
              scheduleUnread = parseInt(response.data.unreadCount) || 0;
            }
          } catch (e) {
            console.error("Error fetching candidate schedule unread count:", e);
          }
        } else {
          scheduleUnread = 0;
        }

        try {
          const examResponse = await axios.get(`${globalVariables.api_url}/exam_application/published_exam`);
          if (examResponse.data.status && Array.isArray(examResponse.data.data)) {
            const serverDateStr = (examResponse.data.current_date || new Date().toISOString()).substring(0, 10);
            const openExams = examResponse.data.data.filter(exam => {
              const startStr = String(exam.start_date || '').substring(0, 10);
              const endStr = String(exam.end_date || '').substring(0, 10);
              return (!startStr || serverDateStr >= startStr) && (!endStr || serverDateStr <= endStr);
            });
            examUnread = openExams.length;
            setCandidateExamCount(openExams.length);

            if (!targetExamId && activeSchedule && activeSchedule.application_title) {
              const matched = examResponse.data.data.find(e =>
                e.application_title?.toLowerCase().trim() === activeSchedule.application_title?.toLowerCase().trim()
              );
              if (matched && matched.application_id) {
                targetExamId = matched.application_id;
              }
            }
          }
        } catch (e) {
          console.error("Error fetching candidate exam notifications:", e);
        }

        setCandidateScheduleExamId(targetExamId);
        setCandidateScheduleCount(scheduleUnread);
        setCandidateUnreadCount(scheduleUnread + examUnread);
      }
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
      setLoaded(true);
    }
  }, [user_type, username, staff_id]);

  const fetchPendingServiceCount = useCallback(async () => {
    try {
      const endpoint = `${globalVariables.api_url}/staff/pending-count`;
      const response = await axios.get(endpoint, {
        params: {
          username: username,
          user_type: user_type
        }
      });

      if (response.data.status) {
        setPendingServiceCount(response.data.pendingCount);
      }
    } catch (error) {
      console.error('Error fetching pending service count:', error);
    }
  }, [username, user_type]);

  const fetchPendingUpcominVacancyVacancyCount = useCallback(async () => {
    try {
      const endpoint = `${globalVariables.api_url}/vacancy/upcoming_vacancy_notifications`;
      const response = await axios.get(endpoint);

      if (response.data.total_vacancy !== undefined) {
        setVacancyCount(response.data.total_vacancy);
      }
    } catch (error) {
      console.error('Error fetching pending vacancy count:', error);
    }
  }, []);

  const fetchPendingLeaveRequestCount = useCallback(async () => {
    try {
      const endpoint = `${globalVariables.api_url}/leave/pending_requests_count`;
      const response = await axios.get(endpoint, {
        params: {
          username: username,
          user_type: user_type
        }
      });

      if (response.data.status) {
        setPendingLeaveCount(response.data.pendingCount);
      }
    } catch (error) {
      console.error('Error fetching pending leave request count:', error);
    }
  }, [username, user_type]);

  const fetchPendingTransferRequestCount = useCallback(async () => {
    try {
      const endpoint = `${globalVariables.api_url}/staff_transfer/pending_transfer_requests_count`;
      const response = await axios.get(endpoint, {
        params: {
          username: username,
          user_type: user_type
        }
      });

      if (response.data.status) {
        setPendingTransferCount(response.data.pendingCount);
      }
    } catch (error) {
      console.error('Error fetching pending transfer count:', error);
    }
  }, [username, user_type]);

  // Function to refresh all notification counts
  const refreshAllNotifications = useCallback(() => {
    fetchUnreadNotifications();
    if (user_type === 'corporate_admin' || user_type === 'school_admin' || user_type === 'school_manager') {
      fetchPendingServiceCount();
      fetchPendingLeaveRequestCount();
      fetchPendingTransferRequestCount();
      fetchPendingUpcominVacancyVacancyCount();
    }
  }, [
    fetchUnreadNotifications,
    fetchPendingServiceCount,
    fetchPendingLeaveRequestCount,
    fetchPendingTransferRequestCount,
    fetchPendingUpcominVacancyVacancyCount,
    user_type
  ]);

  // Initial data fetch and polling setup
  useEffect(() => {
    // Clear any existing intervals
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];

    // Fetch data immediately
    refreshAllNotifications();

    // Set up polling for real-time updates (every 30 seconds)
    const mainInterval = setInterval(() => {
      refreshAllNotifications();
    }, 30000);

    // Set up more frequent polling for vacancy notifications (every 15 seconds)
    if (user_type === 'corporate_admin') {
      const vacancyInterval = setInterval(() => {
        fetchPendingUpcominVacancyVacancyCount();
      }, 15000);
      intervalsRef.current.push(vacancyInterval);
    }

    intervalsRef.current.push(mainInterval);

    // Cleanup on unmount or dependency change
    return () => {
      intervalsRef.current.forEach(clearInterval);
      intervalsRef.current = [];
    };
  }, [refreshAllNotifications, user_type, fetchPendingUpcominVacancyVacancyCount]);

  // Handle window focus and visibility changes for immediate updates
  useEffect(() => {
    const handleFocus = () => {
      refreshAllNotifications();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshAllNotifications();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refreshAllNotifications]);

  const userTypeMap = {
    school_manager: 'School Manager',
    corporate_admin: 'Corporate Manager',
    school_office: 'School Office',
    candidate: 'Candidate',
    corporate_office: 'Corporate Office',
    staff: 'Staff',
    school_admin: 'Principal/HM',
  };

  const UserType = userTypeMap[user_type] || '';

  const handleNotificationClick = (notificationType) => {
    if (notificationType === 'corporate' && user_type === 'school_admin') {
      navigate('/schoolviewnotification');
    } else if (notificationType === 'school' && user_type === 'staff') {
      navigate('/staffviewnotification');
    } else if (notificationType === 'service') {
      navigate('/pendingstaffservice');
    } else if (notificationType === 'vacancy') {
      navigate('/vacancy-notifications');
    } else if (notificationType === 'leave') {
      navigate('/leave-applications');
    } else if (notificationType === 'transfer') {
      navigate('/pending-transfer-applications');
    } else if (notificationType === 'corporate' && user_type === 'staff') {
      navigate('/transfernotification');
    }

    // Refresh notifications after a short delay to allow for backend processing
    setTimeout(() => {
      refreshAllNotifications();
    }, 1500);
  };

  const handleCandidateNotificationClick = async () => {
    try {
      setCandidateScheduleCount(0);
      setCandidateUnreadCount(prev => Math.max(0, prev - (candidateScheduleCount || 1)));
      setIsNotificationsOpen(false);
      await axios.post(`${globalVariables.api_url}/certificate_verification/mark_as_read`, {
        candidate_id: staff_id
      });
      setTimeout(() => {
        refreshAllNotifications();
      }, 1000);

      let targetId = candidateScheduleExamId;
      if (!targetId) {
        try {
          const schedRes = await axios.get(`${globalVariables.api_url}/certificate_verification/get_candidate_schedule?candidate_id=${staff_id}`);
          if (schedRes.data.status && Array.isArray(schedRes.data.data) && schedRes.data.data.length > 0) {
            const first = schedRes.data.data[0];
            if (first.fk_application_id) {
              targetId = first.fk_application_id;
            } else if (first.application_title) {
              const examRes = await axios.get(`${globalVariables.api_url}/exam_application/published_exam`);
              if (examRes.data.status && Array.isArray(examRes.data.data)) {
                const m = examRes.data.data.find(e => e.application_title?.toLowerCase().trim() === first.application_title?.toLowerCase().trim());
                if (m) targetId = m.application_id;
              }
            }
          }
        } catch (err) {
          console.error("Error resolving schedule exam id:", err);
        }
      }

      if (targetId) {
        navigate(`/ExamNotificationSubjects/${targetId}`);
      } else {
        navigate('/CandidateExamNotifications');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      setIsNotificationsOpen(false);
      if (candidateScheduleExamId) {
        navigate(`/ExamNotificationSubjects/${candidateScheduleExamId}`);
      } else {
        navigate('/CandidateExamNotifications');
      }
    }
  };

  const handleLogout = () => {
    // Clear intervals before logout
    intervalsRef.current.forEach(clearInterval);
    intervalsRef.current = [];

    Cookies.remove("token");
    Cookies.remove("username");
    delete axios.defaults.headers.common["Authorization"];

    auth.signout(() => {
      if (user_type === 'candidate') {
        navigate("/candidate-login");
      } else {
        navigate("/");
      }
    });
  };

  // Calculate total notifications count
  const totalNotifications = Number(unreadCount) + Number(pendingServiceCount) + Number(pendingLeaveCount) + Number(pendingTransferCount) + Number(candidateUnreadCount) +
    (user_type === 'corporate_admin' ? Number(vacancyCount) : 0);

  // Determine if notifications should be shown
  const showNotifications = loaded && (
    user_type === 'school_admin' ||
    user_type === 'staff' ||
    user_type === 'corporate_admin' ||
    user_type === 'candidate' ||
    (user_type === 'school_manager' && pendingLeaveCount > 0)
  );

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.nav-item.dropdown')) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const toggleProfile = (e) => {
    e.preventDefault();
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = (e) => {
    e.preventDefault();
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileOpen(false);
  };

  return (
    <header id="header" className="header fixed-top d-flex align-items-center">
      <div className="d-flex align-items-center justify-content-between">
        <div className="logo d-flex align-items-center">
          <span className="d-none d-lg-block fs-5">
            CORPORATE MANAGEMENT OF SCHOOLS
          </span>
        </div>
        <i className="bi bi-list toggle-sidebar-btn"></i>
      </div>
      <div className="user-box">
        <h3 className="fs-5 text-white p-0 m-0 pl-2">{staff_name}</h3>
      </div>

      <nav className="header-nav ms-auto">
        <ul className="d-flex align-items-center">
          {showNotifications && (
            <li className="nav-item dropdown">
              <a
                className={`nav-link nav-icon ${isNotificationsOpen ? 'show' : ''}`}
                href="#"
                onClick={toggleNotifications}
              >
                <i className="bi bi-bell"></i>
                {totalNotifications > 0 && (
                  <span className="badge bg-danger badge-number">
                    {totalNotifications}
                  </span>
                )}
              </a>
              <ul
                className={`dropdown-menu dropdown-menu-end dropdown-menu-arrow notifications ${isNotificationsOpen ? 'show' : ''}`}
                style={isNotificationsOpen ? { position: 'absolute', inset: '0px 0px auto auto', margin: '0px', transform: 'translate3d(-25px, 35px, 0px)' } : {}}
              >
                <li><hr className="dropdown-divider" /></li>

                {user_type === 'school_admin' && (
                  <>
                    <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                      onClick={() => handleNotificationClick('corporate')}>
                      <i className="bi bi-exclamation-circle text-warning"></i>
                      <div>
                        <span>Corporate Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                      </div>
                    </li>
                    <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                      onClick={() => handleNotificationClick('service')}>
                      <i className="bi bi-person-badge text-info"></i>
                      <div>
                        <span>Pending Staff Services {pendingServiceCount > 0 && `(${pendingServiceCount})`}</span>
                      </div>
                    </li>
                  </>
                )}

                {user_type === 'corporate_admin' && (
                  <>
                    <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                      onClick={() => handleNotificationClick('service')}>
                      <i className="bi bi-person-badge text-info"></i>
                      <div>
                        <span>Pending Staff Services {pendingServiceCount > 0 && `(${pendingServiceCount})`}</span>
                      </div>
                    </li>

                    {vacancyCount > 0 && (
                      <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                        onClick={() => handleNotificationClick('vacancy')}>
                        <i className="bi bi-exclamation-circle text-danger"></i>
                        <div>
                          <span>Pending Vacancy Notifications ({vacancyCount})</span>
                        </div>
                      </li>
                    )}
                  </>
                )}

                {(user_type === 'school_admin' || user_type === 'school_manager' || user_type === 'corporate_admin') && (
                  <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                    onClick={() => handleNotificationClick('leave')}>
                    <i className="bi bi-envelope-paper text-warning"></i>
                    <div>
                      <span>Leave Requests ({pendingLeaveCount})</span>
                    </div>
                  </li>
                )}

                {(user_type === 'school_admin' || user_type === 'school_manager' || user_type === 'corporate_admin') && (
                  <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                    onClick={() => handleNotificationClick('transfer')}>
                    <i className="bi bi-arrow-left-right text-success"></i>
                    <div>
                      <span>Transfer Requests ({pendingTransferCount})</span>
                    </div>
                  </li>
                )}

                {user_type === 'staff' && (
                  <>
                    <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                      onClick={() => handleNotificationClick('school')}>
                      <i className="bi bi-exclamation-circle text-warning"></i>
                      <div>
                        <span>School Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                      onClick={() => handleNotificationClick('corporate')}>
                      <i className="bi bi-exclamation-circle text-success"></i>
                      <div>
                        <span>Transfer Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                  </>
                )}
                {user_type === 'candidate' && (
                  <>
                    {candidateExamCount > 0 && (
                      <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          navigate('/CandidateExamNotifications');
                        }}>
                        <i className="bi bi-bell-fill text-primary fs-4"></i>
                        <div>
                          <span className="fw-bold text-primary">New Exam Notification</span>
                          <p className="text-muted small mb-0">{candidateExamCount} active exam notification(s) available</p>
                        </div>
                      </li>
                    )}
                    {candidateScheduleCount > 0 && (
                      <>
                        {candidateExamCount > 0 && <li><hr className="dropdown-divider" /></li>}
                        <li className="notification-item" style={{ width: '300px', cursor: 'pointer' }}
                          onClick={handleCandidateNotificationClick}>
                          <i className="bi bi-calendar-check text-danger fs-4"></i>
                          <div>
                            <span className="fw-bold text-danger">Verification Scheduled</span>
                            <p className="text-muted small mb-0">You have new schedule notification(s)</p>
                          </div>
                        </li>
                      </>
                    )}
                    {candidateUnreadCount === 0 && (
                      <li className="notification-item text-center text-muted py-3" style={{ width: '250px' }}>
                        <small>No new notifications</small>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </li>
          )}

          <li className="nav-item dropdown pe-3">
            <a
              className={`nav-link nav-profile d-flex align-items-center pe-0 ${isProfileOpen ? 'show' : ''}`}
              href="#"
              onClick={toggleProfile}
            >
              <img src={profile_image} alt="Profile" className="img-circle avatar" />
              <span className="d-none d-md-block dropdown-toggle ps-2">
                {auth.user.user_name || username}
              </span>
            </a>

            <ul
              className={`dropdown-menu dropdown-menu-end dropdown-menu-arrow profile ${isProfileOpen ? 'show' : ''}`}
              style={isProfileOpen ? { position: 'absolute', inset: '0px 0px auto auto', margin: '0px', transform: 'translate3d(0px, 35px, 0px)' } : {}}
            >
              <li className="dropdown-header">
                <h6>{staff_name}</h6>
                <span>{UserType}</span>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>

              {user_type !== "corporate_admin" && user_type !== "candidate" && (
                <li>
                  <Link
                    className="dropdown-item d-flex align-items-center"
                    to={
                      user_type === "school_admin"
                        ? `/schooldetails/${staff_id}`
                        : user_type === "school_manager"
                          ? `/schoolmanager/${staff_id}`
                          : `/staffdetails/${staff_id}`
                    }
                  >
                    <i className="bi bi-person"></i>
                    <span>
                      {user_type === "school_admin"
                        ? "School Profile"
                        : user_type === "school_manager"
                          ? "School Manager Profile"
                          : "Staff Profile"}
                    </span>
                  </Link>
                </li>
              )}

              <li>
                <hr className="dropdown-divider" />
              </li>

              <li>
                <Link
                  to="/change_password"
                  className="dropdown-item d-flex align-items-center"
                >
                  <i className="bi bi-check-circle-fill"></i>
                  <span>Change Password</span>
                </Link>
              </li>

              <li>
                <a
                  className="dropdown-item d-flex align-items-center"
                  href="#"
                  onClick={handleLogout}
                  style={{ color: "red" }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;