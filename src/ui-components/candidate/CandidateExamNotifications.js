import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import NoDataFound from '../NoDataFound';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import useAuth from '../../utilities/useAuth';
import Breadcum from '../Breadcum';
import DataTable from "react-data-table-component";
import { Link } from 'react-router-dom';
import './CandidateExamNotifications.css';

const CandidateExamNotifications = () => {
  const [search, setSearch] = useState('');
  const dataTableRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [candidateApplications, setCandidateApplications] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Exam Notifications', Link: '' },
  ]);

  const auth = useAuth();
  const candidateId = auth.user?.user_id;
  const [examData, setExamData] = useState([]);
  const [serverDate, setServerDate] = useState('');

  const fetch_count_published_exams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(globalVariables.api_url + '/exam_application/published_exam');

      if (response.data.status) {
        setExamData(response.data.data || []);
        setServerDate(response.data.current_date || '');
      } else {
        setServerDate(response.data.current_date || '');
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching exam notifications:', error.message);
      print_toast("error", "Failed to fetch exam notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateApplications = async (exams, effectiveCandId) => {
    if (!exams || exams.length === 0) return;
    const cid = effectiveCandId || candidateId || auth.user?.user_id;
    if (!cid) return;

    try {
      const results = await Promise.all(
        exams.map(async (exam) => {
          try {
            const res = await axios.get(
              `${globalVariables.api_url}/candidateexamapplication/fetchapplication_data_exam`,
              {
                params: {
                  fk_candidate_id: cid,
                  application_id: exam.application_id,
                },
              }
            );
            if (res.data.status && res.data.data) {
              return { ...res.data.data, fk_application_id: exam.application_id };
            }
          } catch (e) {
            console.error(`Error fetching status for exam ${exam.application_id}:`, e);
          }
          return null;
        })
      );

      setCandidateApplications(results.filter(Boolean));
    } catch (error) {
      console.error("Error in fetchCandidateApplications:", error);
    }
  };

  useEffect(() => {
    fetch_count_published_exams();
  }, []);

  useEffect(() => {
    if (examData.length > 0) {
      fetchCandidateApplications(examData, candidateId);
    }
  }, [examData, candidateId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper function to get row state
  const getExamState = (row) => {
    const todayStr = (serverDate || new Date().toISOString()).substring(0, 10);
    const startStr = String(row.start_date || '').substring(0, 10);
    const endStr = String(row.end_date || '').substring(0, 10);

    const isClosed = Boolean(endStr && todayStr > endStr);
    const isOpen = Boolean(todayStr >= startStr && (!endStr || todayStr <= endStr));
    const isUpcoming = Boolean(startStr && todayStr < startStr);

    const application = candidateApplications.find(
      (app) =>
        Number(app.fk_application_id) === Number(row.application_id) ||
        Number(app.application_id) === Number(row.application_id)
    );

    const isApplied = Boolean(application);
    const marksEntered = Boolean(application?.subjects?.some((sub) => sub.marks_entered));

    return {
      todayStr,
      startStr,
      endStr,
      isClosed,
      isOpen,
      isUpcoming,
      isApplied,
      marksEntered,
      application,
    };
  };

  // Filtered Exam List by search term
  const filteredExamData = useMemo(() => {
    return examData.filter((row) => {
      const titleMatch = (row.application_title || '')
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      return titleMatch;
    });
  }, [examData, search]);

  // Table Column Definitions
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: '65px',
      center: true,
      cell: (row, index) => (
        <span className="text-secondary fw-semibold">
          {index + 1}
        </span>
      ),
    },
    {
      name: "Title",
      selector: (row) => row.application_title,
      sortable: true,
      minWidth: '320px',
      cell: (row) => {
        const { isClosed } = getExamState(row);
        return (
          <div className="py-2">
            <Link
              to={`/ExamNotificationSubjects/${row.application_id}`}
              className="text-decoration-none fw-bold"
              style={{ color: '#1e40af', fontSize: '0.95rem' }}
            >
              <i className="bi bi-mortarboard me-2 text-primary"></i>
              {row.application_title}
            </Link>
            <div className="d-flex align-items-center gap-2 mt-1">
              {isClosed ? (
                <span className="text-danger fw-semibold" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-clock-history me-1"></i>(Closed)
                </span>
              ) : (
                <span className="text-success fw-semibold" style={{ fontSize: '0.75rem' }}>
                  <i className="bi bi-check2-circle me-1"></i>Active
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      name: "Application Start Date",
      selector: (row) => row.start_date,
      sortable: true,
      minWidth: '200px',
      wrap: true,
      center: true,
      cell: (row) => (
        <span className="text-dark fw-medium">
          {formatDate(row.start_date)}
        </span>
      ),
    },
    {
      name: "Application End Date",
      selector: (row) => row.end_date,
      sortable: true,
      minWidth: '200px',
      wrap: true,
      center: true,
      cell: (row) => (
        <span className="text-dark fw-medium">
          {formatDate(row.end_date)}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => {
        const { isClosed, isApplied, isOpen } = getExamState(row);
        if (isApplied) return 'Applied';
        if (isClosed) return 'Closed';
        if (isOpen) return 'Open';
        return 'Upcoming';
      },
      sortable: true,
      minWidth: '120px',
      center: true,
      cell: (row) => {
        const { isClosed, isApplied, isOpen, isUpcoming } = getExamState(row);

        if (isApplied) {
          return (
            <span className="status-pill status-pill-applied">
              <i className="bi bi-check-circle-fill"></i> Applied
            </span>
          );
        }
        if (isClosed) {
          return (
            <span className="status-pill status-pill-closed">
              <i className="bi bi-x-circle-fill"></i> Closed
            </span>
          );
        }
        if (isOpen) {
          return (
            <span className="status-pill status-pill-open">
              <span className="pulse-dot"></span> Open
            </span>
          );
        }
        if (isUpcoming) {
          return (
            <span className="status-pill status-pill-upcoming">
              <i className="bi bi-hourglass-split"></i> Upcoming
            </span>
          );
        }
        return null;
      },
    },
    {
      name: "Action",
      sortable: false,
      minWidth: '180px',
      center: true,
      cell: (row) => {
        const { isClosed, isApplied, isOpen, marksEntered } = getExamState(row);

        if (isClosed) {
          if (isApplied && marksEntered) {
            return (
              <Link
                to={`/ExamNotificationSubjects/${row.application_id}`}
                className="btn-action-results"
                title="View your published marks and rank"
              >
                <i className="bi bi-award-fill"></i> View Results
              </Link>
            );
          }
          if (isApplied) {
            return (
              <Link
                to={`/ExamNotificationSubjects/${row.application_id}`}
                className="btn-action-view"
                title="View your submitted application"
              >
                <i className="bi bi-file-text"></i> View Application
              </Link>
            );
          }
          return (
            <span className="text-danger fw-bold small">Closed</span>
          );
        }

        if (isOpen) {
          if (isApplied) {
            return (
              <Link
                to={`/ExamNotificationSubjects/${row.application_id}`}
                className="btn-action-view"
                title="View or modify your application"
              >
                <i className="bi bi-eye-fill"></i> View Details
              </Link>
            );
          }
          return (
            <Link
              to={`/ExamNotificationSubjects/${row.application_id}`}
              className="btn-action-apply"
              title="Apply for this examination"
            >
              <i className="bi bi-pencil-square"></i> Apply Now
            </Link>
          );
        }

        return (
          <span className="badge rounded-pill bg-light text-secondary border px-3 py-1">
            Upcoming
          </span>
        );
      },
    },
  ];

  // Modern custom styles for react-data-table-component
  const customTableStyles = {
    table: {
      style: {
        borderRadius: '8px',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        minHeight: '48px',
      },
    },
    headCells: {
      style: {
        color: '#475569',
        fontSize: '13px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    rows: {
      style: {
        minHeight: '64px',
        fontSize: '14px',
        color: '#334155',
        borderBottom: '1px solid #f1f5f9',
        '&:hover': {
          backgroundColor: '#f8fafc',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e2e8f0',
        color: '#64748b',
        fontSize: '13px',
      },
    },
  };

  return (
    <div className="exam-notifications-page">
      <Breadcum items={breadcum} title="Exam Notifications" />

      {/* Main Table Card */}
      <div className="card shadow-sm border-0 content-card">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="card-title mb-0 fw-bold text-dark">Exam Notifications</h5>

          {/* Search Box */}
          <div className="search-input-wrapper">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="form-control"
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="search-clear-btn"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="card-body p-0 exam-notifications-container">
          {loaded ? (
            filteredExamData.length > 0 ? (
              <DataTable
                columns={columns}
                data={filteredExamData}
                pagination
                paginationPerPage={10}
                paginationRowsPerPageOptions={[10, 20, 30]}
                highlightOnHover
                pointerOnHover
                customStyles={customTableStyles}
                ref={dataTableRef}
                responsive
              />
            ) : (
              <div className="py-5 text-center">
                <i className="bi bi-search text-muted" style={{ fontSize: '2.5rem' }}></i>
                <h6 className="mt-3 text-secondary">No notifications found</h6>
                <p className="text-muted small">
                  {search
                    ? "Try adjusting your search query."
                    : "There are currently no published examination notifications."}
                </p>
                {search && (
                  <button
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={() => setSearch('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )
          ) : (
            <div className="py-5 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mt-2 small">Loading examination notifications...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateExamNotifications;