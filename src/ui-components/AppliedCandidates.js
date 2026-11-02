import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { convertDateFormat } from '../utilities/dateconverter';
import { capitalizeWords } from '../utilities/dateconverter';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { useParams } from 'react-router-dom';
import useAuth from "../utilities/useAuth";
import SecureLink from './SecureLink';

const AppliedCandidates = ({ isEmbedded = false }) => {
  const { user } = useAuth();
  const { application_id } = useParams();
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Exam Applications', Link: '/exam-application' },
    { Title: 'Candidate Application Details', Link: '' },
  ]);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // Default tab is 'pending'
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [application, setApplication] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null); // State for individual candidate download loading
  const [hallTicketLoadingId, setHallTicketLoadingId] = useState(null); // State for hall ticket generation loading
  const [actionLoading, setActionLoading] = useState(null); // 'approve' | 'review' | 'reject' | null
  const [processingId, setProcessingId] = useState(null); // { id, action } | null
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCandidateType, setSelectedCandidateType] = useState('');

  useEffect(() => {
    if (application_id) {
      fetchCandidates();
      fetchApplications();
      fetchSubjects();
    }
  }, [application_id]);

  // Removed redundant useEffect

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/exam_application/get_subjects_application_id/${application_id}`
      );

      if (response.data.status) {
        const subjectList = response.data.data.map((subject) => ({
          id: subject.subject_id,
          name: subject.subject_name,
          code: subject.subject_code,
        }));
        setSubjects(subjectList);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/candidateexamapplication/getCandiadateExamApplications`,
        { params: { application_id }, headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.data) {
        setCandidates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching Candidates:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/exam_application/get_Applications_application_id`,
        { params: { application_id }, headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data?.data?.length > 0) {
        setApplication(response.data.data[0]);
      }
    } catch (error) {
      console.error('Error fetching Application:', error);
      print_toast("error", "Failed to fetch application");
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedCandidates(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedCandidates([]);
    } else {
      const currentPageData = filteredCandidates.filter(candidate => candidate.subject_status === activeTab);
      const allRowIds = currentPageData.map(app => app.unique_row_id);
      setSelectedCandidates(allRowIds);
    }
    setSelectAll(!selectAll);
  };

  const handleApprove = async () => {
    if (selectedCandidates.length === 0) {
      print_toast("warning", "No candidates selected");
      return;
    }

    try {
      const realIds = selectedCandidates.map(uid => {
        const row = flattenedCandidates.find(c => c.unique_row_id === uid);
        if (!row) return null;
        return row.canididate_application_subject_id || row.candidate_application_subject_id || null;
      }).filter(Boolean);

      if (realIds.length === 0) {
        print_toast("error", "Failed to resolve selected candidates to database IDs");
        return;
      }

      const response = await axios.post(
        `${globalVariables.api_url}/candidateexamapplication/approveCandidates`,
        { candidate_ids: realIds },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        print_toast("success", "Candidates approved successfully");
        fetchCandidates();
        setActiveTab("pending");
        setSelectedCandidates([]);
        setSelectAll(false);
      } else {
        print_toast("error", "Failed to approve candidates");
      }
    } catch (error) {
      console.error('Error approving candidates:', error);
      print_toast("error", "Failed to approve candidates");
    }
  };

  const handleReview = async () => {
    if (selectedCandidates.length === 0) {
      print_toast("warning", "No candidates selected");
      return;
    }

    try {
      const realIds = selectedCandidates.map(uid => {
        const row = flattenedCandidates.find(c => c.unique_row_id === uid);
        if (!row) return null;
        return row.canididate_application_subject_id || row.candidate_application_subject_id || null;
      }).filter(Boolean);

      if (realIds.length === 0) {
        print_toast("error", "Failed to resolve selected candidates to database IDs");
        return;
      }

      const response = await axios.post(
        `${globalVariables.api_url}/candidateexamapplication/reviewCandidates`,
        { candidate_ids: realIds },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        print_toast("success", "Candidates sent for review successfully");
        fetchCandidates();
        setActiveTab("pending");
        setSelectedCandidates([]);
        setSelectAll(false);
      } else {
        print_toast("error", "Failed to send candidates for review");
      }
    } catch (error) {
      console.error('Error sending candidates for review:', error);
      print_toast("error", "Failed to send candidates for review");
    }
  };

  const handleReject = async () => {
    if (selectedCandidates.length === 0) {
      print_toast("warning", "No candidates selected");
      return;
    }

    // Ask for confirmation before rejecting candidates
    const isConfirmed = window.confirm("Are you sure you want to reject the selected candidates?");

    if (!isConfirmed) {
      return; // If not confirmed, do nothing
    }

    try {
      const realIds = selectedCandidates.map(uid => {
        const row = flattenedCandidates.find(c => c.unique_row_id === uid);
        if (!row) return null;
        return row.canididate_application_subject_id || row.candidate_application_subject_id || null;
      }).filter(Boolean);

      if (realIds.length === 0) {
        print_toast("error", "Failed to resolve selected candidates to database IDs");
        return;
      }

      const response = await axios.post(
        `${globalVariables.api_url}/candidateexamapplication/rejectCandidates`,
        { candidate_ids: realIds },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        print_toast("success", "Candidates rejected successfully");
        fetchCandidates();
        setActiveTab("pending");
        setSelectedCandidates([]);
        setSelectAll(false);
      } else {
        print_toast("error", "Failed to reject candidates");
      }
    } catch (error) {
      console.error('Error rejecting candidates:', error);
      print_toast("error", "Failed to reject candidates");
    }
  };

  const handleIndividualAction = async (candidateId, action) => {
    if (!candidateId) {
      print_toast("error", `Could not find valid ID for ${action}`);
      return;
    }
    try {
      const endpoints = {
        approve: 'approveCandidates',
        reject: 'rejectCandidates',
        review: 'reviewCandidates'
      };
      const endpoint = endpoints[action];
      const response = await axios.post(
        `${globalVariables.api_url}/candidateexamapplication/${endpoint}`,
        { candidate_ids: [candidateId] },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status) {
        print_toast("success", `Candidate ${action}d successfully`);
        fetchCandidates();
      } else {
        print_toast("error", `Failed to ${action} candidate`);
      }
    } catch (error) {
      console.error(`Error ${action}ing candidate:`, error);
      print_toast("error", `Failed to ${action} candidate`);
    }
  };


  const flattenedCandidates = useMemo(() => {
    const flattened = [];
    const validSentStatuses = ['requested', 'approved', 'rejected', 'review'];

    candidates.forEach(candidate => {
      const appLevelStatus = String(candidate.appl_status || candidate.status || '').toLowerCase().trim();

      if (candidate.subjects && candidate.subjects.length > 0) {
        candidate.subjects.forEach(subject => {
          const subRawStatus = String(subject.subject_status || '').toLowerCase().trim();

          // Determine the effective status:
          // If subject has a specific reviewed status ('approved', 'rejected', 'review'), use it.
          // Otherwise, fall back to application-level status.
          let effectiveStatus = subRawStatus;
          if (!effectiveStatus || effectiveStatus === 'pending' || effectiveStatus === 'submitted') {
            effectiveStatus = appLevelStatus;
          }

          // If the application is still incomplete / draft (not yet sent by candidate), exclude it
          if (!validSentStatuses.includes(effectiveStatus)) {
            return;
          }

          let sStatus = effectiveStatus;
          // In this component, the "Requested" tab uses 'pending' as its activeTab key
          if (sStatus === 'requested') sStatus = 'pending';

          const junctionId = subject.canididate_application_subject_id ||
            subject.candidate_application_subject_id ||
            candidate.canididate_application_subject_id ||
            candidate.candidate_application_subject_id;

          const extractedCode = subject.subject_code || subject.code || (subject.registration_number ? subject.registration_number.slice(0, -3) : '');
          flattened.push({
            ...candidate,
            display_subject_name: `${(subject.registration_number) ? subject.registration_number + ' - ' : ''}${(extractedCode) ? extractedCode + '-' : ''}${subject.subject_name}`,
            registration_number: subject.registration_number,
            hall_ticket_sent: subject.hall_ticket_sent,
            subject_name: subject.subject_name,
            subject_code: extractedCode,
            single_subject_id: subject.subject_id,
            subject_status: sStatus,
            canididate_application_subject_id: junctionId,
            unique_row_id: `${candidate.candidate_exam_application_id}_${subject.subject_id}`
          });
        });
      } else {
        let effectiveStatus = appLevelStatus;

        // If the application is still incomplete / draft (not yet sent by candidate), exclude it
        if (!validSentStatuses.includes(effectiveStatus)) {
          return;
        }

        let sStatus = effectiveStatus;
        if (sStatus === 'requested') sStatus = 'pending';

        flattened.push({
          ...candidate,
          display_subject_name: '-',
          single_subject_id: null,
          subject_status: sStatus,
          canididate_application_subject_id: null,
          unique_row_id: `${candidate.candidate_exam_application_id}_none`
        });
      }
    });
    return flattened;
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return flattenedCandidates.filter(candidate => {
      const matchesSearch = candidate.applicant_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject ? (
        String(candidate.fk_exam_application_subject_id) === String(selectedSubject) ||
        String(candidate.subject_id) === String(selectedSubject) ||
        String(candidate.single_subject_id) === String(selectedSubject)
      ) : true;
      const matchesType = selectedCandidateType ? candidate.candidate_type === selectedCandidateType : true;
      return matchesSearch && matchesSubject && matchesType;
    });
  }, [flattenedCandidates, searchTerm, selectedSubject, selectedCandidateType]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUnlockProfile = async (candidateId, applicationId) => {
    const isConfirmed = window.confirm("Are you sure you want to unlock this profile so the candidate can make corrections?");
    if (!isConfirmed) return;

    try {
      const params = new URLSearchParams();
      params.append('candidate_id', candidateId);
      if (applicationId) {
        params.append('application_id', applicationId);
      }

      const response = await axios.post(
        `${globalVariables.api_url}/candidateexamapplication/unlockCandidateExamApplication`,
        params
      );

      if (response.data.status) {
        print_toast("success", "Profile unlocked successfully. The candidate can now edit their details.");
        fetchCandidates();
      } else {
        print_toast("error", response.data.message || "Failed to unlock profile");
      }
    } catch (error) {
      console.error("Error unlocking profile:", error);
      print_toast("error", "Failed to unlock profile");
    }
  };

  const handleLockProfile = async (candidateId) => {
    const isConfirmed = window.confirm("Are you sure you want to lock this profile again?");
    if (!isConfirmed) return;

    try {
      const params = new URLSearchParams();
      params.append('candidate_id', candidateId);

      const response = await axios.post(
        `${globalVariables.api_url}/candidateexamapplication/lockCandidateExamApplication`,
        params
      );

      if (response.data.status) {
        print_toast("success", "Profile locked successfully");
        fetchCandidates();
      } else {
        print_toast("error", response.data.message || "Failed to lock profile");
      }
    } catch (error) {
      console.error("Error locking profile:", error);
      print_toast("error", "Failed to lock profile");
    }
  };

  const columns = [
    {
      name: (
        <div className="d-flex align-items-center">
          <input
            type="checkbox"
            className="form-check-input mt-0 me-2"
            style={{ width: '1.2rem', height: '1.2rem' }}
            checked={selectAll}
            onChange={handleSelectAllChange}
          />
          <strong className="text-dark">All</strong>
        </div>
      ),
      cell: row => (
        (row.subject_status === "pending" || row.subject_status === "approved" || row.subject_status === "rejected" || row.subject_status === "review") && (
          <input
            type="checkbox"
            className="form-check-input"
            checked={selectedCandidates.includes(row.unique_row_id)}
            onChange={() => handleCheckboxChange(row.unique_row_id)}
          />
        )
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '80px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-hashtag me-2"></i>#</strong>,
      selector: row => row.serial_no,
      sortable: true,
      minWidth: '80px',
    },
    ...(user?.user_type !== 'certificate_verifier' ? [{
      name: <strong className="text-dark"><i className="fas fa-lock me-2"></i>Profile Lock</strong>,
      cell: row => (
        Number(row.is_profile_locked) === 1 ? (
          <button
            className="btn btn-sm btn-light text-warning ms-2 border-0 shadow-sm"
            title="Profile is Locked. Click to Unlock for candidate corrections"
            onClick={() => handleUnlockProfile(row.fk_candidate_id, row.fk_application_id || application_id)}
          >
            <i className="fas fa-lock text-warning"></i>
          </button>
        ) : (
          <button
            className="btn btn-sm btn-light text-success ms-2 border-0 shadow-sm"
            title="Profile is Unlocked (Editable). Click to Lock"
            onClick={() => handleLockProfile(row.fk_candidate_id)}
          >
            <i className="fas fa-unlock text-success"></i>
          </button>
        )
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '110px',
    }] : []),
    {
      name: <strong className="text-dark"><i className="fas fa-calendar-day me-2"></i>Applied</strong>,
      selector: row => convertDateFormat(row.applied_on),
      sortable: true,
      minWidth: '130px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-calendar-alt me-2"></i>DOB</strong>,
      selector: row => convertDateFormat(row.dob),
      sortable: true,
      minWidth: '130px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-user-tag me-2"></i>Type</strong>,
      selector: row => capitalizeWords(row.candidate_type),
      sortable: true,
      minWidth: '130px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-book me-2"></i>Subject</strong>,
      cell: row => (
        <div className="d-flex align-items-center">
          <div className="d-flex flex-column">
            {row.registration_number && (
              <span className="badge bg-info text-white mb-1" style={{ fontSize: '0.7rem', width: 'fit-content' }}>
                REG: {row.registration_number}
              </span>
            )}
            <div className="d-flex align-items-center">
              {row.subject_code ? (
                <>
                  <span className="fw-bold me-1" style={{ color: '#007bff' }}>{row.subject_code}-</span>
                  <span className="text-dark">{capitalizeWords(row.subject_name)}</span>
                </>
              ) : (
                <span className="text-dark">{capitalizeWords(row.subject_name)}</span>
              )}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      minWidth: '220px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-user me-2"></i>Name</strong>,
      selector: row => (
          <div className="d-flex flex-column w-100 py-1">
            <div className="d-flex align-items-center">
              <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }} title={capitalizeWords(row.applicant_name)}>
                <a
                  href={`/CandidateProfile/${row.encrypted_candidate_id}`}
                  className="text-decoration-none text-primary fw-bold"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {capitalizeWords(row.applicant_name)}
                </a>
              </div>
              <button
                className="btn btn-sm btn-light text-danger ms-2 border-0 shadow-sm"
                title="Download Application PDF"
                onClick={() => handleDownloadCandidatePreview(row.encrypted_candidate_id, row.candidate_exam_application_id, row.fk_candidate_id, row.applicant_name)}
                disabled={downloadingId === row.fk_candidate_id}
              >
                {downloadingId === row.fk_candidate_id ? (
                  <span className="spinner-border spinner-border-sm text-danger" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fas fa-file-pdf"></i>
                )}
              </button>
            </div>
            <div className="d-flex flex-wrap gap-1 mt-1 small" style={{ fontSize: '0.75rem' }}>
              {row.application_no && (
                <span className="badge bg-secondary text-white" title="Application Number">
                  App: {row.application_no}
                </span>
              )}
              {row.receipt_number && (
                <span className="badge bg-light text-dark border" title="Receipt Number">
                  Rec: {row.receipt_number}
                </span>
              )}
              {row.is_presently_employed === 'Yes' && (
                <span className="badge bg-warning text-dark border" title={row.employment_details || 'Presently Employed'}>
                  <i className="fas fa-briefcase me-1"></i>Employed
                </span>
              )}
              {(row.employment_document_url || row.employment_document) && (
                <SecureLink
                  href={row.employment_document_url || `${globalVariables.api_url}/secure_file/candidate_documents/${row.employment_document}`}
                  className="badge bg-success text-white text-decoration-none shadow-sm cursor-pointer"
                  title={`View Employment Proof / NOC (PDF)${row.employment_details ? ': ' + row.employment_details : ''}`}
                >
                  <i className="fas fa-file-pdf me-1"></i>NOC Doc
                </SecureLink>
              )}
            </div>
          </div>
      ),
      sortable: true,
      minWidth: '260px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-phone-alt me-2"></i>Phone</strong>,
      selector: row => row.phone_no,
      sortable: true,
      minWidth: '140px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-envelope me-2"></i>Email</strong>,
      selector: row => (
        <div className="text-truncate" style={{ maxWidth: '180px' }}>
          {row.email}
        </div>
      ),
      sortable: true,
      wrap: true,
    },
    {
      name: <strong className="text-dark"><i className="fas fa-info-circle me-2"></i>Status</strong>,
      cell: row => {
        const statusColors = {
          pending: 'bg-warning text-dark',
          approved: 'bg-success text-white',
          rejected: 'bg-danger text-white',
          review: 'bg-info text-white'
        };
        const color = statusColors[row.subject_status] || 'bg-secondary text-white';
        return (
          <span className={`badge rounded-pill ${color} px-3 py-2 fw-medium shadow-sm`}>
            {row.subject_status === 'pending' ? 'Requested' : capitalizeWords(row.subject_status)}
          </span>
        );
      },
      sortable: true,
      minWidth: '160px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-cogs me-2"></i>Actions</strong>,
      cell: row => (
        <div className="dropdown">
          <button className="btn btn-dark btn-sm dropdown-toggle shadow-sm" type="button" id={`dropdown-${row.fk_candidate_id}`} data-bs-toggle="dropdown" aria-expanded="false">
            <i className="fas fa-ellipsis-v"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby={`dropdown-${row.fk_candidate_id}`}>
            {user?.user_type !== 'certificate_verifier' && (
              <>
                {row.subject_status !== 'approved' && (
                  <li>
                    <button className="dropdown-item py-2" onClick={() => handleIndividualAction(row.canididate_application_subject_id, 'approve')}>
                      <i className="fas fa-check-circle text-success me-2"></i> Approve
                    </button>
                  </li>
                )}
                {row.subject_status !== 'rejected' && (
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={() => handleIndividualAction(row.canididate_application_subject_id, 'reject')}>
                      <i className="fas fa-times-circle me-2"></i> Reject
                    </button>
                  </li>
                )}
                {row.subject_status !== 'review' && (
                  <li>
                    <button className="dropdown-item py-2 text-primary" onClick={() => handleIndividualAction(row.canididate_application_subject_id, 'review')}>
                      <i className="fas fa-search me-2"></i> Send for Review
                    </button>
                  </li>
                )}
                <li>
                  <hr className="dropdown-divider" />
                </li>
              </>
            )}
            <li>
              <button
                className="dropdown-item py-2 text-danger"
                onClick={() => handleDownloadCandidatePreview(row.encrypted_candidate_id, row.candidate_exam_application_id, row.fk_candidate_id, row.applicant_name)}
                disabled={downloadingId === row.fk_candidate_id}
              >
                <i className="fas fa-file-pdf me-2"></i> Download Application Form
              </button>
            </li>
            {(row.employment_document_url || row.employment_document) && (
              <li>
                <SecureLink
                  className="dropdown-item py-2 text-success fw-semibold"
                  href={row.employment_document_url || `${globalVariables.api_url}/secure_file/candidate_documents/${row.employment_document}`}
                >
                  <i className="fas fa-file-pdf me-2 text-success"></i> View Employment Proof (NOC)
                </SecureLink>
              </li>
            )}
            <li>
              <a
                className="dropdown-item py-2"
                href={`/CandidateProfile/${row.encrypted_candidate_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-external-link-alt text-primary me-2"></i> View Profile
              </a>
            </li>
          </ul>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '100px',
    }
  ];

  // Set the active tab based on the candidate status
  useEffect(() => {
    const approvedCandidates = filteredCandidates.filter(candidate => candidate.subject_status === "approved");
    if (approvedCandidates.length > 0) {
      setActiveTab('approved');
    } else {
      setActiveTab('pending');
    }
  }, [candidates]);


  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const params = {
        application_id: application_id,
        print: "print",
        status: activeTab
      };
      if (selectedSubject) params.subject_id = selectedSubject;
      if (selectedCandidateType) params.candidate_type = selectedCandidateType;

      const response = await axios.get(globalVariables.api_url + '/candidateexamapplication/generate_approved_candidate_report', {
        params,
        responseType: 'blob'
      });

      // Handle the response, for example, trigger a file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const statusLabel = activeTab === 'pending' ? 'Requested' : (activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
      link.setAttribute('download', `Exam_${statusLabel}_Candidate_report.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
      print_toast("error", "Failed to generate PDF report");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {
      const params = {
        application_id,
        excel: "excel",
        status: activeTab
      };
      if (selectedSubject) params.subject_id = selectedSubject;
      if (selectedCandidateType) params.candidate_type = selectedCandidateType;

      const response = await axios.get(`${globalVariables.api_url}/candidateexamapplication/generate_approved_candidate_report`, {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const statusLabel = activeTab === 'pending' ? 'Requested' : (activeTab.charAt(0).toUpperCase() + activeTab.slice(1));
      link.setAttribute('download', `${statusLabel}_Candidates_List.xlsx`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating Excel:', error);
      print_toast("error", "Failed to generate Excel report");
    } finally {
      setExcelLoading(false);
    }
  };

  const handleDownloadCandidatePreview = async (encryptedCandidateId, candidateExamAppId, candidateId, applicantName = '') => {
    setDownloadingId(candidateId); // Start loading
    try {
      const response = await axios.get(`${globalVariables.api_url}/CandidateExamDetail/downlod_exam_application`, {
        params: {
          fk_candidate_id: encryptedCandidateId || candidateId,
          candidate_id: candidateId || encryptedCandidateId,
          fk_candidate_exam_application_id: candidateExamAppId
        },
        responseType: 'blob',
      });

      // Check if response is an error JSON disguised as blob
      if (response.data && response.data.type === 'application/json') {
        const text = await response.data.text();
        const json = JSON.parse(text);
        print_toast("error", json.message || "Failed to download PDF");
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanName = applicantName
        ? applicantName.trim().replace(/[/\\?%*:|"<>]/g, '').trim()
        : '';
      const downloadFilename = cleanName
        ? `${cleanName}_Application.pdf`
        : `Application_${candidateId || 'Candidate'}.pdf`;
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      print_toast("error", "Failed to download PDF");
    } finally {
      setDownloadingId(null); // Stop loading
    }
  };

  const handleDownloadHallTicket = async (junctionId, registrationNumber) => {
    setHallTicketLoadingId(junctionId);
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidateexamapplication/generate_hall_ticket`, {
        params: { id: junctionId, send_email: 0 },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HallTicket_${registrationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading Hall Ticket:', error);
      print_toast("error", "Failed to download Hall Ticket");
    } finally {
      setHallTicketLoadingId(null);
    }
  };

  const approvedCount = filteredCandidates.filter(candidate => candidate.subject_status === 'approved').length;
  const rejectedCount = filteredCandidates.filter(candidate => candidate.subject_status === 'rejected').length;
  const reviewCount = filteredCandidates.filter(candidate => candidate.subject_status === 'review').length;
  const requestedCount = filteredCandidates.filter(candidate => candidate.subject_status === 'pending').length;
  return (
    <>
      <style>{`
        .btn-action {
          transition: all 0.3s ease;
          font-weight: 600;
          border-radius: 8px;
          padding: 8px 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn-action:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
          filter: brightness(1.05);
        }
        .btn-action:active:not(:disabled) {
          transform: translateY(0);
        }
      `}</style>
      {!isEmbedded && <Breadcum items={breadcum} title="Candidate Applications" />}
      <div className={`card ${isEmbedded ? 'border-0 shadow-none' : ''}`}>
        {!isEmbedded && (
          <div className="card-header">
            <h5 className="card-title">Candidate Application Details</h5>
          </div>
        )}
        <div className="card-body">
          {!isEmbedded && (
            <div className="mb-4 p-3 bg-light rounded shadow-sm border-start border-4 border-primary">
              {application ? (
                <>
                  <div className="row align-items-center">
                    <div className="col-md-7">
                      <h5 className="fw-bold text-primary mb-1">
                        <i className="fas fa-file-signature me-2"></i>{application.application_title}
                      </h5>
                      <div className="text-muted small">
                        <i className="fas fa-info-circle me-1"></i> Exam Details & Description
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="d-flex justify-content-md-end gap-2 mt-2 mt-md-0">
                        <div className="bg-white border rounded px-2 py-1 text-center shadow-sm">
                          <small className="text-muted d-block fw-bold" style={{ fontSize: '0.65rem' }}>START DATE</small>
                          <span className="small fw-bold text-dark">{convertDateFormat(application.start_date)}</span>
                        </div>
                        <div className="bg-white border rounded px-2 py-1 text-center shadow-sm border-danger-light">
                          <small className="text-muted d-block fw-bold" style={{ fontSize: '0.65rem' }}>END DATE</small>
                          <span className="small fw-bold text-danger">{convertDateFormat(application.end_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="my-2" />
                  <div className="row">
                    <div className="col-md-12">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-quote-left text-primary me-2 mt-1 opacity-50"></i>
                        <div
                          className="fw-normal text-secondary"
                          style={{ fontSize: '0.95rem', lineHeight: '1.5' }}
                          dangerouslySetInnerHTML={{ __html: application.description }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="fas fa-exclamation-triangle me-2"></i>No application data available.
                </div>
              )}
            </div >
          )}

          <div className="row mb-4 align-items-end">
            <div className="col-md-4">
              <label className="fw-bold small text-muted text-uppercase mb-2 ms-1">
                <i className="fas fa-filter me-2"></i>Filter by Subject
              </label>
              <select
                className="form-select shadow-sm"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.code ? subject.code + '-' : ''}{subject.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="fw-bold small text-muted text-uppercase mb-2 ms-1">
                <i className="fas fa-users me-2"></i>Filter by Candidate Type
              </label>
              <select
                className="form-select shadow-sm"
                value={selectedCandidateType}
                onChange={(e) => setSelectedCandidateType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="parishioner">Parishioner</option>
                <option value="priest">Priest</option>
                <option value="sister">Sister</option>
              </select>
            </div>
            <div className="col-md-4">
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          <div className="card-header bg-white border-bottom-0 p-0 mb-4">
            <ul className="nav nav-pills p-1 bg-light rounded-pill border shadow-sm w-fit-content mx-auto">
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill fw-bold px-4 py-2 d-flex align-items-center transition-all ${activeTab === 'pending' ? 'bg-primary text-white shadow' : 'text-secondary'}`}
                  onClick={() => setActiveTab('pending')}
                >
                  <i className={`fas fa-clock me-2 ${activeTab === 'pending' ? 'text-white' : 'text-warning'}`}></i>
                  Requested
                  <span className={`ms-2 badge rounded-pill ${activeTab === 'pending' ? 'bg-white text-primary' : 'bg-danger text-white'}`}>{requestedCount}</span>
                </button>
              </li>
              <li className="nav-item ms-1">
                <button
                  className={`nav-link rounded-pill fw-bold px-4 py-2 d-flex align-items-center transition-all ${activeTab === 'approved' ? 'bg-success text-white shadow' : 'text-secondary'}`}
                  onClick={() => setActiveTab('approved')}
                >
                  <i className={`fas fa-check-circle me-2 ${activeTab === 'approved' ? 'text-white' : 'text-success'}`}></i>
                  Approved
                  <span className={`ms-2 badge rounded-pill ${activeTab === 'approved' ? 'bg-white text-success' : 'bg-danger text-white'}`}>{approvedCount}</span>
                </button>
              </li>
              <li className="nav-item ms-1">
                <button
                  className={`nav-link rounded-pill fw-bold px-4 py-2 d-flex align-items-center transition-all ${activeTab === 'review' ? 'bg-info text-white shadow' : 'text-secondary'}`}
                  onClick={() => setActiveTab('review')}
                >
                  <i className={`fas fa-search me-2 ${activeTab === 'review' ? 'text-white' : 'text-info'}`}></i>
                  Review
                  <span className={`ms-2 badge rounded-pill ${activeTab === 'review' ? 'bg-white text-info' : 'bg-info text-white'}`}>{reviewCount}</span>
                </button>
              </li>
              <li className="nav-item ms-1">
                <button
                  className={`nav-link rounded-pill fw-bold px-4 py-2 d-flex align-items-center transition-all ${activeTab === 'rejected' ? 'bg-danger text-white shadow' : 'text-secondary'}`}
                  onClick={() => setActiveTab('rejected')}
                >
                  <i className={`fas fa-times-circle me-2 ${activeTab === 'rejected' ? 'text-white' : 'text-danger'}`}></i>
                  Rejected
                  <span className={`ms-2 badge rounded-pill ${activeTab === 'rejected' ? 'bg-white text-danger' : 'bg-danger text-white'}`}>{rejectedCount}</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            <div className={`tab-pane fade ${activeTab === 'pending' ? 'show active' : ''}`} id="pending">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  {requestedCount > 0 && (
                    <>
                      <button onClick={handleGeneratePDF} className="btn btn-success btn-sm shadow-sm d-flex align-items-center me-2" disabled={pdfloading}>
                        {pdfloading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Exporting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-pdf me-2"></i> Export to PDF
                          </>
                        )}
                      </button>
                      <button onClick={handleGenerateExcel} className="btn btn-primary btn-sm shadow-sm d-flex align-items-center" disabled={excelLoading}>
                        {excelLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Exporting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-excel me-2"></i> Export to Excel
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <DataTable
                columns={columns}
                keyField="unique_row_id"
                className="table table-striped table-bordered shadow-sm rounded"
                data={filteredCandidates
                  .filter(candidate => candidate.subject_status === 'pending')
                  .map((item, idx) => ({ ...item, serial_no: idx + 1 }))
                }
                pagination
                responsive
              />

              {user?.user_type !== 'certificate_verifier' && (
                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-primary btn-sm d-flex align-items-center btn-action"
                    onClick={handleApprove}
                    disabled={selectedCandidates.length === 0}
                  >
                    <i className="fas fa-user-check me-2"></i> Approve Selected
                  </button>
                  <button
                    className="btn btn-info btn-sm text-white d-flex align-items-center btn-action"
                    onClick={handleReview}
                    disabled={selectedCandidates.length === 0}
                  >
                    <i className="fas fa-search me-2"></i> Review Selected
                  </button>
                  <button
                    className="btn btn-danger btn-sm d-flex align-items-center btn-action"
                    onClick={handleReject}
                    disabled={selectedCandidates.length === 0}
                  >
                    <i className="fas fa-user-times me-2"></i> Reject Selected
                  </button>
                </div>
              )}
            </div>

            <div className={`tab-pane fade ${activeTab === 'approved' ? 'show active' : ''}`} id="approved">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  {approvedCount > 0 && (
                    <>
                      <button onClick={handleGeneratePDF} className="btn btn-success btn-sm shadow-sm d-flex align-items-center me-2" disabled={pdfloading}>
                        {pdfloading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Exporting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-pdf me-2"></i> Export to PDF
                          </>
                        )}
                      </button>
                      <button onClick={handleGenerateExcel} className="btn btn-primary btn-sm shadow-sm d-flex align-items-center" disabled={excelLoading}>
                        {excelLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Exporting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-excel me-2"></i> Export to Excel
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
              <DataTable
                columns={columns}
                keyField="unique_row_id"
                className="table table-striped table-bordered shadow-sm rounded"
                data={filteredCandidates
                  .filter(candidate => candidate.subject_status === 'approved')
                  .map((item, idx) => ({ ...item, serial_no: idx + 1 }))
                }
                pagination
                responsive
              />

              {user?.user_type !== 'certificate_verifier' && (
                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-info btn-sm text-white d-flex align-items-center btn-action"
                    onClick={handleReview}
                    disabled={selectedCandidates.length === 0}
                  >
                    <i className="fas fa-search me-2"></i> Review Selected
                  </button>
                  <button
                    className="btn btn-danger btn-sm d-flex align-items-center btn-action"
                    onClick={handleReject}
                    disabled={selectedCandidates.length === 0}
                  >
                    <i className="fas fa-user-times me-2"></i> Reject Selected
                  </button>
                </div>
              )}
            </div>

            <div className={`tab-pane fade ${activeTab === 'review' ? 'show active' : ''}`} id="review">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  {reviewCount > 0 && (
                    <>
                      <button onClick={handleGeneratePDF} className="btn btn-success btn-sm shadow-sm d-flex align-items-center me-2" disabled={pdfloading}>
                        {pdfloading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Exporting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-pdf me-2"></i> Export to PDF
                          </>
                        )}
                      </button>
                      <button onClick={handleGenerateExcel} className="btn btn-primary btn-sm shadow-sm d-flex align-items-center" disabled={excelLoading}>
                        {excelLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Exporting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-excel me-2"></i> Export to Excel
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <DataTable
                columns={columns}
                keyField="unique_row_id"
                className="table table-striped table-bordered shadow-sm rounded"
                data={filteredCandidates
                  .filter(candidate => candidate.subject_status === 'review')
                  .map((item, idx) => ({ ...item, serial_no: idx + 1 }))
                }
                pagination
                responsive
              />

              {user?.user_type !== 'certificate_verifier' && (
                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-primary btn-sm d-flex align-items-center btn-action"
                    onClick={handleApprove}
                    disabled={selectedCandidates.length === 0}
                  >
                    <i className="fas fa-user-check me-2"></i> Approve Selected
                  </button>
                  <button
                    className="btn btn-danger btn-sm d-flex align-items-center btn-action"
                    onClick={handleReject}
                    disabled={selectedCandidates.length === 0}
                  >
                    <i className="fas fa-user-times me-2"></i> Reject Selected
                  </button>
                </div>
              )}
            </div>

            <div className={`tab-pane fade ${activeTab === 'rejected' ? 'show active' : ''}`} id="rejected">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  {rejectedCount > 0 && (
                    <>
                      <button onClick={handleGeneratePDF} className="btn btn-success btn-sm shadow-sm d-flex align-items-center me-2" disabled={pdfloading}>
                        {pdfloading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Exporting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-pdf me-2"></i> Export to PDF
                          </>
                        )}
                      </button>
                      <button onClick={handleGenerateExcel} className="btn btn-primary btn-sm shadow-sm d-flex align-items-center" disabled={excelLoading}>
                        {excelLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Exporting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-excel me-2"></i> Export to Excel
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <DataTable
                columns={columns}
                keyField="unique_row_id"
                className="table table-striped table-bordered shadow-sm rounded"
                data={filteredCandidates
                  .filter(candidate => candidate.subject_status === 'rejected')
                  .map((item, idx) => ({ ...item, serial_no: idx + 1 }))
                }
                pagination
                responsive
              />

              {user?.user_type !== 'certificate_verifier' && (
                <div className="mt-3 d-flex gap-2">
                  <button
                    className="btn btn-primary btn-sm d-flex align-items-center btn-action"
                    onClick={handleApprove}
                    disabled={selectedCandidates.length === 0}
                  >
                    <i className="fas fa-user-check me-2"></i> Approve Selected
                  </button>
                  <button
                    className="btn btn-info btn-sm text-white d-flex align-items-center btn-action"
                    onClick={handleReview}
                    disabled={selectedCandidates.length === 0}
                  >
                    <i className="fas fa-search me-2"></i> Review Selected
                  </button>
                </div>
              )}
            </div>
          </div>
        </div >
      </div >
    </>
  );
};

export default AppliedCandidates;
