import React, { useState, useEffect } from 'react';

import axios from 'axios';
import DataTable from 'react-data-table-component';
import { convertDateFormat } from '../utilities/dateconverter';

import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from "../utilities/useAuth";
const MarkList = ({ isEmbedded = false }) => {
  const { user } = useAuth();

  const { application_id } = useParams();
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Exam Applications', Link: '/exam-application' },
    { Title: 'Exam Portal', Link: `/exam-application-details/${application_id}#marks` },
    { Title: 'Mark List', Link: '' },
  ]);
  //const navigate = useNavigate();


  const [candidates, setCandidates] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]); // Track selected candidates
  const [searchTerm, setSearchTerm] = useState('');
  const [selectAll, setSelectAll] = useState(false); // Track Select All state
  const [isLoading, setIsLoading] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedCandidateType, setSelectedCandidateType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hallTicketLoadingId, setHallTicketLoadingId] = useState(null);

  useEffect(() => {
    if (application_id) {
      fetchCandidates();
      fetchApplications();
      fetchSubjects();
    }
  }, [application_id]);

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
        `${globalVariables.api_url}/candidateexamapplication/getCandiadateExamApplicationsApproved`,
        {
          params: { application_id },
          headers: { 'Content-Type': 'application/json' },
        }
      );


      if (response.data.data) {
        // Assume response.data.data is an array of candidate objects
        setCandidates(response.data.data);


      }
    } catch (error) {
      console.error('Error fetching Applications:', error);
      print_toast("error", "Failed to fetch applications");
    }
  };

  const handleCheckboxChange = (candidateId) => {
    setSelectedCandidates(prevSelected => {
      if (prevSelected.includes(candidateId)) {
        return prevSelected.filter(id => id !== candidateId);
      } else {
        return [...prevSelected, candidateId];
      }
    });
  };
  const [application, setApplication] = useState(null);
  const capitalizeWords = (str) => {
    if (!str) {
      return ""; // Return an empty string if the input is null, undefined, or falsy
    }
    return str.toUpperCase(); // Convert the entire string to uppercase
  };
  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/exam_application/get_Applications_application_id`,
        {
          params: { application_id },
          headers: { 'Content-Type': 'application/json' },
        }
      );
      //  setApplications(response.data.data[0]);
      if (response.data?.data?.length > 0) {
        // Set the first application in the array
        setApplication(response.data.data[0]);
      } else {
        console.error('No application data found.');
      }
    } catch (error) {
      console.error('Error fetching Applications:', error);
      print_toast("error", "Failed to fetch applications");
    }
  };
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedCandidates([]); // Deselect all
    } else {
      const allCandidateIds = candidates.map(app => app.fk_candidate_id);
      setSelectedCandidates(allCandidateIds); // Select all
    }
    setSelectAll(!selectAll);
  };
  // Approve selected candidates
  const handleApprove = async () => {
    if (selectedCandidates.length === 0) {
      print_toast("warning", "No candidates selected");
      return;
    }

    try {


      const response = await axios.post(
        `${globalVariables.api_url}/candidateexamapplication/approveCandidates`,
        { candidate_ids: selectedCandidates },

        { headers: { 'Content-Type': 'application/json' } }
      );




      if (response.data.status) {
        print_toast("success", "Candidates approved successfully");
        fetchCandidates(); // Refresh the applications after approval
      } else {
        print_toast("error", "Failed to approve candidates");
      }
    } catch (error) {
      console.error('Error approving candidates:', error);
      print_toast("error", "Failed to approve candidates");
    }
  };
  
  const handleDownloadHallTicket = async (junctionId, registrationNumber) => {
    setHallTicketLoadingId(junctionId);
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidateexamapplication/generate_hall_ticket`, {
        params: { id: junctionId, send_email: 1 },
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
      
      print_toast("success", "Hall Ticket generated and sent successfully!");
    } catch (error) {
      console.error('Error generating Hall Ticket:', error);
      print_toast("error", "Failed to generate Hall Ticket");
    } finally {
      setHallTicketLoadingId(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newRowsPerPage, page) => {
    setRowsPerPage(newRowsPerPage);
  };

  const filteredCandidates = candidates.filter(candidate => {
    const matchesSearch = 
      candidate.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (candidate.registration_number && candidate.registration_number.toLowerCase().includes(searchTerm.toLowerCase()));
    // Use fk_exam_application_subject_id if available, otherwise try matching subject_name if subject ID filter is selected
    // Assuming backend returns fk_exam_application_subject_id based on other components
    const matchesSubject = selectedSubject ? (
      String(candidate.fk_exam_application_subject_id) === String(selectedSubject) ||
      String(candidate.subject_id) === String(selectedSubject)
    ) : true;

    const matchesType = selectedCandidateType ? (
      candidate.candidate_type?.toLowerCase() === selectedCandidateType.toLowerCase()
    ) : true;

    return matchesSearch && matchesSubject && matchesType;
  });

  const columns = [
    {
      name: <strong className="text-dark"><i className="fas fa-hashtag me-2"></i>#</strong>,
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      minWidth: '80px',
      sortable: true,
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
              {(() => {
                const displayCode = row.subject_code || (row.registration_number ? row.registration_number.slice(0, -3) : '');
                return displayCode ? (
                  <>
                    <span className="fw-bold me-1" style={{ color: '#007bff' }}>{displayCode}-</span>
                    <span className="text-dark">{capitalizeWords(row.subject_name)}</span>
                  </>
                ) : (
                  <span className="text-dark">{capitalizeWords(row.subject_name)}</span>
                );
              })()}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      minWidth: '220px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-user-tag me-2"></i>Type</strong>,
      selector: row => capitalizeWords(row.candidate_type),
      sortable: true,
      minWidth: '180px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-user me-2"></i>Candidate Name</strong>,
      selector: row => capitalizeWords(row.applicant_name),
      sortable: true,
      minWidth: '220px',
      cell: row => (
        <div className="d-flex align-items-center w-100">
          <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '180px' }} title={capitalizeWords(row.applicant_name)}>
            <a href={`/CandidateProfile/${row.encrypted_candidate_id}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary">
              {capitalizeWords(row.applicant_name)}
            </a>
          </div>
          {row.registration_number && (
            <button
              className="btn btn-sm btn-light text-success ms-2 border-0 shadow-sm"
              title="Generate & Send Hall Ticket"
              onClick={() => handleDownloadHallTicket(row.canididate_application_subject_id, row.registration_number)}
              disabled={hallTicketLoadingId === row.canididate_application_subject_id}
            >
              {hallTicketLoadingId === row.canididate_application_subject_id ? (
                <span className="spinner-border spinner-border-sm text-success" role="status" aria-hidden="true"></span>
              ) : (
                <i className="fas fa-id-card"></i>
              )}
            </button>
          )}
        </div>
      )
    },
    {
      name: <strong className="text-dark"><i className="fas fa-calendar-alt me-2"></i>Applied</strong>,
      selector: row => convertDateFormat(row.applied_on),
      sortable: true,
      minWidth: '160px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-poll me-2"></i>Marks</strong>,
      selector: row => row.total_mark,
      cell: row => (
        <div className="d-flex align-items-center">
          {row.total_mark !== null && row.total_mark !== undefined ? (
            <span className="badge bg-success shadow-sm" style={{ fontSize: '0.9rem', padding: '0.5rem 0.8rem' }}>
              {parseFloat(row.total_mark).toFixed(3).replace(/\.?0+$/, '')}
            </span>
          ) : (
            <span className="text-muted small italic">Not Entered</span>
          )}
        </div>
      ),
      sortable: true,
      minWidth: '140px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-cogs me-2"></i>Actions</strong>,
      cell: row => (
        <div className="dropdown">
          <button className="btn btn-dark btn-sm dropdown-toggle shadow-sm" type="button" id={`dropdown-${row.canididate_application_subject_id}`} data-bs-toggle="dropdown" aria-expanded="false">
            Action
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby={`dropdown-${row.canididate_application_subject_id}`}>
            <Link
              to={`/candidate-mark-list/${row.canididate_application_subject_id}`}
              state={{
                candidateInfo: {
                  applicant_name: row.applicant_name,
                  subject_name: row.subject_name,
                  subject_code: row.subject_code,
                  candidate_type: row.candidate_type,
                  application_title: application?.application_title,
                  application_id: application?.application_id
                }
              }}
              className="dropdown-item py-2"
            >
              <i className="fas fa-marker me-2 text-warning"></i> Enter Marks
            </Link>
            <li>
              <button 
                className="dropdown-item py-2" 
                onClick={() => handleDownloadHallTicket(row.canididate_application_subject_id, row.registration_number)}
                disabled={hallTicketLoadingId === row.canididate_application_subject_id}
              >
                <i className="fas fa-id-card me-2 text-success"></i> Generate Hall Ticket
              </button>
            </li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <>
      {!isEmbedded && <Breadcum items={breadcum} title="Candidate Applications" />}
      <div className={`card ${isEmbedded ? 'border-0 shadow-none' : 'shadow-sm'}`}>
        {!isEmbedded && (
          <div className="card-header bg-white border-bottom py-3">
            <h5 className="card-title fw-bold text-dark mb-0">
              <i className="fas fa-clipboard-list me-2 text-primary"></i>Candidate Mark Entry List
            </h5>
          </div>
        )}
        <div className="card-body p-4">
          {!isEmbedded && (
            <div className="mb-4 p-4 bg-light rounded shadow-sm border-start border-4 border-primary">
              {application ? (
                <>
                  <div className="row align-items-center">
                    <div className="col-md-7">
                      <h5 className="fw-bold text-primary mb-1">
                        <i className="fas fa-file-invoice me-2"></i>{application.application_title}
                      </h5>
                      <div className="text-muted small">
                        <i className="fas fa-info-circle me-1"></i> Exam Assessment & Mark Entry Overview
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="d-flex justify-content-md-end gap-2 mt-2 mt-md-0">
                        <div className="bg-white border rounded px-3 py-2 text-center shadow-sm">
                          <small className="text-muted d-block fw-bold" style={{ fontSize: '0.65rem' }}>START DATE</small>
                          <span className="small fw-bold text-dark">{convertDateFormat(application.start_date)}</span>
                        </div>
                        <div className="bg-white border rounded px-3 py-2 text-center shadow-sm border-danger-light">
                          <small className="text-muted d-block fw-bold" style={{ fontSize: '0.65rem' }}>END DATE</small>
                          <span className="small fw-bold text-danger">{convertDateFormat(application.end_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="my-3 opacity-25" />
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
            </div>
          )}

          <div className="row mb-4 align-items-end">
            <div className="col-md-4">
              <label className="fw-bold small text-muted text-uppercase mb-2 ms-1">
                <i className="fas fa-filter me-2"></i>Filter by Subject
              </label>
              <select
                className="form-select shadow-sm"
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => {
                  setSelectedCandidateType(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="parishioner">Parishioner</option>
                <option value="priest">Priest</option>
                <option value="sister">Sister</option>
                <option value="brother">Brother</option>
                <option value="seminary_student">Seminary Student</option>
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
                  placeholder="Search candidate..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            className="table table-striped table-hover rounded"
            data={filteredCandidates}
            pagination
            paginationDefaultPage={currentPage}
            paginationPerPage={rowsPerPage}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            responsive
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                  color: '#333'
                },
              },
              rows: {
                style: {
                  minHeight: '60px',
                },
              },
            }}
          />
        </div>
      </div>
    </>
  );
};

export default MarkList;
