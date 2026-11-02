import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import { convertDateFormat, capitalizeWords } from '../utilities/dateconverter';
import globalVariables from '../Global.js';
import print_toast from '../utilities/Toaster.js';
import Breadcum from './Breadcum.js';
import { useParams } from 'react-router-dom';
import useAuth from '../utilities/useAuth';
import SecureLink from './SecureLink';

const ApprovedCandidates = ({ isEmbedded = false, initialAppId = null }) => {
  const { user } = useAuth();
  const routeParams = useParams();
  const effectiveAppId = initialAppId || routeParams.application_id || '';

  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters: Only Common Search & Candidate Type as requested
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidateType, setSelectedCandidateType] = useState('');

  const [downloadingId, setDownloadingId] = useState(null);
  const [excelLoading, setExcelLoading] = useState(false);

  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Teacher Selection', Link: '/exam-application' },
    { Title: 'Approved Candidates', Link: '' },
  ]);

  useEffect(() => {
    fetchApprovedCandidates();
  }, [effectiveAppId]);

  const fetchApprovedCandidates = async () => {
    setIsLoading(true);
    try {
      let combinedCandidates = [];

      if (effectiveAppId) {
        // Fetch candidates for the specific application from URL (e.g. /approved-candidates/1)
        const response = await axios.get(
          `${globalVariables.api_url}/candidateexamapplication/getCandiadateExamApplications`,
          {
            params: { application_id: effectiveAppId },
            headers: { 'Content-Type': 'application/json' },
          }
        );
        combinedCandidates = response.data?.data || [];
      } else {
        // Fetch applications first to query across all exams
        const appsRes = await axios.get(`${globalVariables.api_url}/exam_application/getApplications`);
        const appsList = appsRes.data?.status && Array.isArray(appsRes.data.data) ? appsRes.data.data : [];

        // Parallel fetch for each application
        if (appsList.length > 0) {
          const promises = appsList.map((app) =>
            axios
              .get(`${globalVariables.api_url}/candidateexamapplication/getCandiadateExamApplications`, {
                params: { application_id: app.application_id },
                headers: { 'Content-Type': 'application/json' },
              })
              .then((res) => res.data?.data || [])
              .catch(() => [])
          );
          const results = await Promise.all(promises);
          combinedCandidates = results.flat();
        } else {
          const directRes = await axios.get(
            `${globalVariables.api_url}/candidateexamapplication/getCandiadateExamApplications`,
            { headers: { 'Content-Type': 'application/json' } }
          );
          combinedCandidates = directRes.data?.data || [];
        }
      }

      setCandidates(combinedCandidates);
    } catch (error) {
      console.error('Error fetching approved candidates:', error);
      print_toast('error', 'Failed to load approved candidates');
    } finally {
      setIsLoading(false);
    }
  };

  // Flatten candidates and keep ONLY approved candidates
  const approvedList = useMemo(() => {
    const flattened = [];
    const validSentStatuses = ['requested', 'approved', 'rejected', 'review'];

    candidates.forEach((candidate) => {
      const appLevelStatus = String(candidate.appl_status || candidate.status || '').toLowerCase().trim();

      if (candidate.subjects && candidate.subjects.length > 0) {
        candidate.subjects.forEach((subject) => {
          const subRawStatus = String(subject.subject_status || '').toLowerCase().trim();

          let effectiveStatus = subRawStatus;
          if (!effectiveStatus || effectiveStatus === 'pending' || effectiveStatus === 'submitted') {
            effectiveStatus = appLevelStatus;
          }

          if (!validSentStatuses.includes(effectiveStatus)) {
            return;
          }

          let sStatus = effectiveStatus;
          if (sStatus === 'requested') sStatus = 'pending';

          // FILTER ONLY APPROVED CANDIDATES
          if (sStatus !== 'approved') {
            return;
          }

          const junctionId =
            subject.canididate_application_subject_id ||
            subject.candidate_application_subject_id ||
            candidate.canididate_application_subject_id ||
            candidate.candidate_application_subject_id;

          flattened.push({
            ...candidate,
            subject_name: subject.subject_name || '-',
            single_subject_id: subject.subject_id,
            subject_status: sStatus,
            canididate_application_subject_id: junctionId,
            unique_row_id: `${candidate.candidate_exam_application_id}_${subject.subject_id}`,
          });
        });
      } else {
        let effectiveStatus = appLevelStatus;
        if (!validSentStatuses.includes(effectiveStatus)) {
          return;
        }

        let sStatus = effectiveStatus;
        if (sStatus === 'requested') sStatus = 'pending';

        if (sStatus === 'approved') {
          flattened.push({
            ...candidate,
            subject_name: '-',
            single_subject_id: null,
            subject_status: sStatus,
            canididate_application_subject_id: null,
            unique_row_id: `${candidate.candidate_exam_application_id}_none`,
          });
        }
      }
    });

    return flattened;
  }, [candidates]);

  // Apply Common Search & Candidate Type filter
  const filteredCandidates = useMemo(() => {
    return approvedList.filter((candidate) => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        (candidate.applicant_name && candidate.applicant_name.toLowerCase().includes(term)) ||
        (candidate.subject_name && candidate.subject_name.toLowerCase().includes(term)) ||
        (candidate.email && candidate.email.toLowerCase().includes(term)) ||
        (candidate.phone_no && candidate.phone_no.toLowerCase().includes(term));

      const matchesType = selectedCandidateType
        ? candidate.candidate_type === selectedCandidateType
        : true;

      return matchesSearch && matchesType;
    });
  }, [approvedList, searchTerm, selectedCandidateType]);

  const handleDownloadCandidatePreview = async (encryptedCandidateId, candidateExamAppId, candidateId, applicantName = '') => {
    setDownloadingId(candidateId);
    try {
      const response = await axios.get(`${globalVariables.api_url}/CandidateExamDetail/downlod_exam_application`, {
        params: {
          fk_candidate_id: encryptedCandidateId || candidateId,
          candidate_id: candidateId || encryptedCandidateId,
          fk_candidate_exam_application_id: candidateExamAppId,
        },
        responseType: 'blob',
      });

      if (response.data && response.data.type === 'application/json') {
        const text = await response.data.text();
        const json = JSON.parse(text);
        print_toast('error', json.message || 'Failed to download PDF');
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanName = applicantName ? applicantName.trim().replace(/[/\\?%*:|"<>]/g, '').trim() : '';
      const downloadFilename = cleanName ? `${cleanName}_Application.pdf` : `Application_${candidateId || 'Candidate'}.pdf`;
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      print_toast('error', 'Failed to download PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleExportExcel = () => {
    setExcelLoading(true);
    try {
      if (filteredCandidates.length === 0) {
        print_toast('warning', 'No approved candidates to export');
        setExcelLoading(false);
        return;
      }

      const headers = [
        'S.No',
        'Candidate Name',
        'Subject',
        'Candidate Type',
        'Phone',
        'Email',
        'Applied Date',
        'Status'
      ];

      const rows = filteredCandidates.map((c, idx) => [
        idx + 1,
        `"${(c.applicant_name || '').replace(/"/g, '""')}"`,
        `"${(c.subject_name || '').replace(/"/g, '""')}"`,
        `"${(c.candidate_type || '').replace(/"/g, '""')}"`,
        `"${(c.phone_no || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${convertDateFormat(c.applied_on)}"`,
        '"Approved"'
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Approved_Candidates_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      print_toast('success', 'Export completed successfully');
    } catch (err) {
      console.error('Error exporting list:', err);
      print_toast('error', 'Failed to export approved candidates');
    } finally {
      setExcelLoading(false);
    }
  };

  // Basic Details Columns: #, Candidate Name, Subject, Candidate Type, Phone, Email, Applied Date, Status, Actions
  const columns = [
    {
      name: <strong className="text-dark"><i className="fas fa-hashtag me-2"></i>#</strong>,
      selector: (row, idx) => idx + 1,
      sortable: true,
      width: '70px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-user me-2"></i>Candidate Name</strong>,
      selector: (row) => (
        <div className="d-flex flex-column w-100 py-1">
          <div className="d-flex align-items-center">
            <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }} title={capitalizeWords(row.applicant_name)}>
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
              onClick={() =>
                handleDownloadCandidatePreview(
                  row.encrypted_candidate_id,
                  row.candidate_exam_application_id,
                  row.fk_candidate_id,
                  row.applicant_name
                )
              }
              disabled={downloadingId === row.fk_candidate_id}
            >
              {downloadingId === row.fk_candidate_id ? (
                <span className="spinner-border spinner-border-sm text-danger" role="status" aria-hidden="true"></span>
              ) : (
                <i className="fas fa-file-pdf"></i>
              )}
            </button>
          </div>
          {(row.employment_document_url || row.employment_document) && (
            <div className="mt-1">
              <SecureLink
                href={
                  row.employment_document_url ||
                  `${globalVariables.api_url}/secure_file/candidate_documents/${row.employment_document}`
                }
                className="badge bg-success text-white text-decoration-none shadow-sm cursor-pointer"
                title={`View Employment Proof / NOC (PDF)${row.employment_details ? ': ' + row.employment_details : ''}`}
              >
                <i className="fas fa-file-pdf me-1"></i>NOC Doc
              </SecureLink>
            </div>
          )}
        </div>
      ),
      sortable: true,
      minWidth: '240px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-book me-2"></i>Subject</strong>,
      selector: (row) => capitalizeWords(row.subject_name || '-'),
      sortable: true,
      minWidth: '180px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-user-tag me-2"></i>Candidate Type</strong>,
      selector: (row) => capitalizeWords(row.candidate_type || '-'),
      sortable: true,
      minWidth: '140px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-phone-alt me-2"></i>Phone</strong>,
      selector: (row) => row.phone_no || '-',
      sortable: true,
      minWidth: '140px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-envelope me-2"></i>Email</strong>,
      selector: (row) => (
        <div className="text-truncate" style={{ maxWidth: '190px' }} title={row.email}>
          {row.email || '-'}
        </div>
      ),
      sortable: true,
      minWidth: '180px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-calendar-day me-2"></i>Applied Date</strong>,
      selector: (row) => convertDateFormat(row.applied_on),
      sortable: true,
      minWidth: '130px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-check-circle me-2"></i>Status</strong>,
      cell: () => (
        <span className="badge rounded-pill bg-success text-white px-3 py-2 fw-medium shadow-sm">
          <i className="fas fa-check-circle me-1"></i> Approved
        </span>
      ),
      sortable: true,
      minWidth: '120px',
    },
    {
      name: <strong className="text-dark"><i className="fas fa-cogs me-2"></i>Actions</strong>,
      cell: (row) => (
        <div className="d-flex align-items-center gap-1">
          <a
            className="btn btn-outline-primary btn-sm rounded-pill px-3 shadow-sm"
            href={`/CandidateProfile/${row.encrypted_candidate_id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="View Profile"
          >
            <i className="fas fa-eye me-1"></i> Profile
          </a>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: '110px',
    },
  ];

  return (
    <>
      {!isEmbedded && <Breadcum items={breadcum} title="Approved Candidates" />}

      <div className={`card ${isEmbedded ? 'border-0 shadow-none' : 'shadow-sm border-0'}`}>
        <div className="card-header bg-white border-bottom py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h5 className="card-title fw-bold text-dark mb-0">
              <i className="fas fa-user-check me-2 text-success"></i>Approved Candidates
            </h5>
            <small className="text-muted">Basic details of approved candidates</small>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="badge bg-success-subtle text-success border border-success-subtle fs-6 px-3 py-2 rounded-pill">
              Total Approved: <strong className="ms-1">{approvedList.length}</strong>
            </span>

            <button
              onClick={handleExportExcel}
              className="btn btn-outline-success btn-sm shadow-sm d-flex align-items-center gap-2 px-3 fw-bold rounded-pill"
              disabled={excelLoading || filteredCandidates.length === 0}
            >
              {excelLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status"></span>
                  Exporting...
                </>
              ) : (
                <>
                  <i className="fas fa-file-excel"></i> Export Excel
                </>
              )}
            </button>

            <button
              onClick={fetchApprovedCandidates}
              className="btn btn-light btn-sm shadow-sm rounded-pill px-3"
              title="Refresh List"
              disabled={isLoading}
            >
              <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin' : ''}`}></i>
            </button>
          </div>
        </div>

        <div className="card-body p-4">
          {/* Filters: ONLY Common Search & Candidate Type */}
          <div className="row mb-4 align-items-end g-3">
            <div className="col-md-4 col-sm-6">
              <label className="fw-bold small text-muted text-uppercase mb-2 ms-1">
                <i className="fas fa-users me-1"></i>Candidate Type
              </label>
              <select
                className="form-select shadow-sm"
                value={selectedCandidateType}
                onChange={(e) => setSelectedCandidateType(e.target.value)}
              >
                <option value="">All Candidate Types</option>
                <option value="parishioner">Parishioner</option>
                <option value="priest">Priest</option>
                <option value="sister">Sister</option>
              </select>
            </div>

            <div className="col-md-8 col-sm-6">
              <label className="fw-bold small text-muted text-uppercase mb-2 ms-1">
                <i className="fas fa-search me-1"></i>Common Search
              </label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Search by candidate name, phone, email, subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Data Table */}
          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status"></div>
              <p className="mt-2 text-muted fw-semibold">Loading approved candidates...</p>
            </div>
          ) : (
            <div className="table-responsive shadow-sm rounded">
              <DataTable
                columns={columns}
                keyField="unique_row_id"
                data={filteredCandidates}
                pagination
                responsive
                highlightOnHover
                noDataComponent={
                  <div className="p-5 text-center text-muted">
                    <i className="fas fa-user-check fa-3x text-muted opacity-50 mb-3"></i>
                    <h6 className="fw-bold">No Approved Candidates Found</h6>
                    <p className="small mb-0">
                      {searchTerm || selectedCandidateType
                        ? 'No approved candidates match your filter criteria.'
                        : 'There are currently no approved candidates recorded.'}
                    </p>
                  </div>
                }
                customStyles={{
                  headCells: {
                    style: {
                      backgroundColor: '#f8f9fa',
                      fontWeight: 'bold',
                      color: '#333',
                      fontSize: '0.88rem',
                    },
                  },
                  rows: {
                    style: {
                      minHeight: '55px',
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApprovedCandidates;
