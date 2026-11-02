import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Modal, Button } from 'react-bootstrap';
import globalVariables from '../../Global.js';
import print_toast from '../../utilities/Toaster.js';
import Breadcum from '../Breadcum.js';

const ApprovedCandidatesList = () => {
  const [loaded, setLoaded] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState('');

  // Filters
  const [publishedFilter, setPublishedFilter] = useState('all'); // 'all', 'with_published', 'without_published'
  const [examFilter, setExamFilter] = useState('all'); // 'all', 'not_applied', or application_id
  const [courseFilter, setCourseFilter] = useState('all'); // 'all' or course name
  const [subjectFilter, setSubjectFilter] = useState('all'); // 'all' or subject name

  // Dynamic filter options
  const [availableExams, setAvailableExams] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  // Modals
  const [selectedCandidateWorks, setSelectedCandidateWorks] = useState(null);
  const [showWorksModal, setShowWorksModal] = useState(false);
  const [selectedCandidateQuals, setSelectedCandidateQuals] = useState(null);
  const [showQualsModal, setShowQualsModal] = useState(false);

  const [exportLoading, setExportLoading] = useState(false);
  const dataTableRef = useRef(null);

  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Candidate Management', Link: '/CandidateManagement' },
    { Title: 'Approved Candidates', Link: '' },
  ]);

  // Fetch approved candidates
  const fetchApprovedCandidates = async () => {
    setLoaded(false);
    try {
      let response;
      try {
        response = await axios.get(
          `${globalVariables.api_url}/candidateManagement/get-approved-candidates-list`
        );
      } catch (err) {
        response = await axios.get(
          `${globalVariables.api_url}/candidateManagement/get-candidate-status-based`,
          { params: { status: 'Approved' } }
        );
      }

      if (response && response.data && response.data.status) {
        const dataList = response.data.data || [];
        setCandidates(dataList);

        // Populate available exams
        if (Array.isArray(response.data.available_exams) && response.data.available_exams.length > 0) {
          setAvailableExams(response.data.available_exams);
        } else {
          const examMap = {};
          dataList.forEach((c) => {
            if (Array.isArray(c.applied_exams)) {
              c.applied_exams.forEach((e) => {
                if (e.application_id && !examMap[e.application_id]) {
                  examMap[e.application_id] = e.application_title || `Exam #${e.application_id}`;
                }
              });
            }
          });
          setAvailableExams(
            Object.keys(examMap).map((id) => ({
              application_id: id,
              application_title: examMap[id],
            }))
          );
        }

        // Populate available courses
        if (Array.isArray(response.data.available_courses) && response.data.available_courses.length > 0) {
          setAvailableCourses(response.data.available_courses.sort());
        } else {
          const coursesSet = new Set();
          dataList.forEach((c) => {
            if (Array.isArray(c.courses)) {
              c.courses.forEach((cr) => cr && coursesSet.add(cr));
            } else if (Array.isArray(c.qualifications)) {
              c.qualifications.forEach((q) => q.course && coursesSet.add(q.course));
            }
          });
          setAvailableCourses(Array.from(coursesSet).sort());
        }

        // Populate available subjects
        if (Array.isArray(response.data.available_subjects) && response.data.available_subjects.length > 0) {
          setAvailableSubjects(response.data.available_subjects.sort());
        } else {
          const subSet = new Set();
          dataList.forEach((c) => {
            if (Array.isArray(c.subjects)) {
              c.subjects.forEach((s) => s && subSet.add(s));
            } else if (Array.isArray(c.qualifications)) {
              c.qualifications.forEach((q) => q.main_subject && subSet.add(q.main_subject));
            }
          });
          setAvailableSubjects(Array.from(subSet).sort());
        }
      } else {
        setCandidates([]);
      }
    } catch (error) {
      console.error('Error fetching approved candidates:', error.message);
      print_toast('error', 'Failed to fetch approved candidates.');
      setCandidates([]);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchApprovedCandidates();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return '-';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Filter candidates based on published works, exam, course, subject, and search term
  const filteredCandidates = useMemo(() => {
    return candidates.filter((item) => {
      // 1. Published Works filter
      const hasPub =
        Number(item.has_published_works) === 1 ||
        (Array.isArray(item.published_works) && item.published_works.length > 0);
      if (publishedFilter === 'with_published' && !hasPub) return false;
      if (publishedFilter === 'without_published' && hasPub) return false;

      // 2. Exam filter
      if (examFilter !== 'all') {
        const itemExams = Array.isArray(item.applied_exams) ? item.applied_exams : [];
        if (examFilter === 'not_applied') {
          if (itemExams.length > 0) return false;
        } else {
          const matchExam = itemExams.some(
            (e) => String(e.application_id) === String(examFilter)
          );
          if (!matchExam) return false;
        }
      }

      // 3. Course / Degree filter
      if (courseFilter !== 'all') {
        const itemCourses = Array.isArray(item.courses)
          ? item.courses
          : Array.isArray(item.qualifications)
          ? item.qualifications.map((q) => q.course)
          : [];
        const targetCourse = courseFilter.toLowerCase().trim();
        const matchCourse = itemCourses.some(
          (c) => (c || '').toLowerCase().trim() === targetCourse
        );
        if (!matchCourse) return false;
      }

      // 4. Subject filter
      if (subjectFilter !== 'all') {
        const itemSubjects = Array.isArray(item.subjects)
          ? item.subjects
          : Array.isArray(item.qualifications)
          ? item.qualifications.map((q) => q.main_subject)
          : [];
        const targetSub = subjectFilter.toLowerCase().trim();
        const matchSub = itemSubjects.some((s) =>
          (s || '').toLowerCase().includes(targetSub)
        );
        if (!matchSub) return false;
      }

      // 5. Search term filter
      if (!search.trim()) return true;
      const term = search.toLowerCase().trim();

      const nameMatch = (item.applicant_name || '').toLowerCase().includes(term);
      const genderMatch = (item.gender || '').toLowerCase().includes(term);
      const addressMatch = (item.address || '').toLowerCase().includes(term);
      const maritalMatch = (item.marital_status || '').toLowerCase().includes(term);
      const phoneMatch = (item.phone_no || '').toLowerCase().includes(term);
      const emailMatch = (item.email || '').toLowerCase().includes(term);
      const dobMatch = (formatDate(item.dob) || '').toLowerCase().includes(term);
      const examMatch = (item.exam_titles || '').toLowerCase().includes(term);

      // Search in qualifications (course, subject, university)
      let qualMatch = false;
      if (Array.isArray(item.qualifications)) {
        qualMatch = item.qualifications.some(
          (q) =>
            (q.course || '').toLowerCase().includes(term) ||
            (q.main_subject || '').toLowerCase().includes(term) ||
            (q.university_board || '').toLowerCase().includes(term)
        );
      }

      // Search in published works
      let pubMatch = false;
      if (Array.isArray(item.published_works)) {
        pubMatch = item.published_works.some(
          (pw) =>
            (pw.work_title || pw.title || '').toLowerCase().includes(term) ||
            (pw.publisher || pw.university_board || '').toLowerCase().includes(term) ||
            (pw.publication_type || pw.course || '').toLowerCase().includes(term) ||
            (pw.identifier || pw.reg_no || '').toLowerCase().includes(term)
        );
      }

      return (
        nameMatch ||
        genderMatch ||
        addressMatch ||
        maritalMatch ||
        phoneMatch ||
        emailMatch ||
        dobMatch ||
        examMatch ||
        qualMatch ||
        pubMatch
      );
    });
  }, [candidates, publishedFilter, examFilter, courseFilter, subjectFilter, search]);

  const countWithPublished = useMemo(() => {
    return candidates.filter(
      (c) =>
        Number(c.has_published_works) === 1 ||
        (Array.isArray(c.published_works) && c.published_works.length > 0)
    ).length;
  }, [candidates]);

  // Reset all filters
  const handleResetFilters = () => {
    setPublishedFilter('all');
    setExamFilter('all');
    setCourseFilter('all');
    setSubjectFilter('all');
    setSearch('');
  };

  const isAnyFilterActive =
    publishedFilter !== 'all' ||
    examFilter !== 'all' ||
    courseFilter !== 'all' ||
    subjectFilter !== 'all' ||
    search.trim() !== '';

  // Open modal with published works details
  const handleViewPublishedWorks = (candidate) => {
    setSelectedCandidateWorks(candidate);
    setShowWorksModal(true);
  };

  // Open modal with qualifications details
  const handleViewQualifications = (candidate) => {
    setSelectedCandidateQuals(candidate);
    setShowQualsModal(true);
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    setExportLoading(true);
    try {
      if (filteredCandidates.length === 0) {
        print_toast('warning', 'No approved candidates to export');
        setExportLoading(false);
        return;
      }

      const headers = [
        'Sl No.',
        'Candidate Name',
        'Gender',
        'Address',
        'Marital Status',
        'Date Of Birth',
        'Age',
        'Phone Number',
        'Email',
        'Applied Exam(s)',
        'Qualifications',
        'Published Works (Yes/No)',
        'Published Works Details',
      ];

      const rows = filteredCandidates.map((c, idx) => {
        const hasPub =
          Number(c.has_published_works) === 1 ||
          (Array.isArray(c.published_works) && c.published_works.length > 0);

        let pubDetails = 'None';
        if (hasPub && Array.isArray(c.published_works)) {
          pubDetails = c.published_works
            .map(
              (p, pIdx) =>
                `#${pIdx + 1}: [${p.publication_type || p.course || 'Work'}] Title: "${p.work_title || p.title || ''}" | Publisher: "${p.publisher || p.university_board || ''}" | Year: ${p.pub_year || p.year_passing || ''} | Identifier: ${p.identifier || p.reg_no || ''}`
            )
            .join('; ');
        }

        let qualDetails = 'None';
        if (Array.isArray(c.qualifications) && c.qualifications.length > 0) {
          qualDetails = c.qualifications
            .map(
              (q) =>
                `${q.course || 'Course'}${q.main_subject ? ` (${q.main_subject})` : ''}${q.year_passing ? ` - ${q.year_passing}` : ''}`
            )
            .join('; ');
        }

        const examsText = c.exam_titles || (Array.isArray(c.applied_exams) && c.applied_exams.length > 0
          ? c.applied_exams.map((e) => e.application_title).join(', ')
          : 'None');

        return [
          idx + 1,
          `"${(c.applicant_name || '').replace(/"/g, '""')}"`,
          `"${(c.gender || '').replace(/"/g, '""')}"`,
          `"${(c.address || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""')}"`,
          `"${(c.marital_status || '').replace(/"/g, '""')}"`,
          `"${formatDate(c.dob)}"`,
          `"${calculateAge(c.dob)}"`,
          `"${(c.phone_no || '').replace(/"/g, '""')}"`,
          `"${(c.email || '').replace(/"/g, '""')}"`,
          `"${examsText.replace(/"/g, '""')}"`,
          `"${qualDetails.replace(/"/g, '""')}"`,
          `"${hasPub ? 'Yes' : 'No'}"`,
          `"${pubDetails.replace(/"/g, '""')}"`,
        ];
      });

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
      print_toast('success', 'Excel file exported successfully');
    } catch (err) {
      console.error('Error exporting list:', err);
      print_toast('error', 'Failed to export approved candidates');
    } finally {
      setExportLoading(false);
    }
  };

  // Generate PDF / Printable Report
  const handlePrintPDF = () => {
    if (filteredCandidates.length === 0) {
      print_toast('warning', 'No candidates to print');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      print_toast('error', 'Please allow pop-ups to open the print report.');
      return;
    }

    const filterLabels = [];
    if (examFilter !== 'all') {
      const selectedExam = availableExams.find((e) => String(e.application_id) === String(examFilter));
      filterLabels.push(`Exam: ${selectedExam ? selectedExam.application_title : (examFilter === 'not_applied' ? 'Not Applied' : examFilter)}`);
    }
    if (courseFilter !== 'all') filterLabels.push(`Course: ${courseFilter}`);
    if (subjectFilter !== 'all') filterLabels.push(`Subject: ${subjectFilter}`);
    if (publishedFilter === 'with_published') filterLabels.push('With Published Works Only');
    if (publishedFilter === 'without_published') filterLabels.push('Without Published Works');
    const filterText = filterLabels.length > 0 ? filterLabels.join(' | ') : 'All Approved Candidates';

    let tableRowsHtml = '';
    filteredCandidates.forEach((c, index) => {
      const examsText = c.exam_titles || (Array.isArray(c.applied_exams) && c.applied_exams.length > 0
        ? c.applied_exams.map((e) => e.application_title).join(', ')
        : '<span style="color:#888;">None</span>');

      let qualHtml = '<span style="color:#888;">-</span>';
      if (Array.isArray(c.qualifications) && c.qualifications.length > 0) {
        qualHtml = c.qualifications
          .slice(0, 4)
          .map((q) => `<div><strong>${q.course || ''}</strong>${q.main_subject ? ` - <em>${q.main_subject}</em>` : ''}</div>`)
          .join('');
      }

      tableRowsHtml += `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td><strong>${c.applicant_name || '-'}</strong></td>
          <td style="text-align: center;">${c.gender || '-'}</td>
          <td>${(c.address || '-').replace(/[\r\n]+/g, ', ')}</td>
          <td style="text-align: center;">${c.marital_status || '-'}</td>
          <td style="text-align: center;">${formatDate(c.dob)}</td>
          <td style="text-align: center;">${calculateAge(c.dob)}</td>
          <td><span style="color: #0056b3; font-weight: 500;">${examsText}</span></td>
          <td style="font-size: 10px;">${qualHtml}</td>
        </tr>
      `;
    });

    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Approved Candidates Report</title>
        <style>
          @page { size: landscape; margin: 10mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 11px; color: #333; margin: 0; padding: 10px; }
          .header { text-align: center; border-bottom: 2px solid #0056b3; padding-bottom: 8px; margin-bottom: 10px; }
          .header h2 { margin: 0 0 4px 0; color: #800000; font-size: 18px; text-transform: uppercase; }
          .header h4 { margin: 0 0 6px 0; color: #333; font-size: 13px; text-transform: uppercase; }
          .meta { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px; font-weight: 500; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th { background-color: #007bff; color: white; border: 1px solid #0056b3; padding: 6px 6px; font-size: 11px; text-align: left; }
          td { border: 1px solid #ddd; padding: 5px 6px; vertical-align: top; font-size: 10.5px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Corporate Management of Schools</h2>
          <h4>Archeparchy of Changanacherry</h4>
          <div style="font-size: 13px; font-weight: bold; color: #0056b3;">APPROVED CANDIDATES REPORT</div>
        </div>
        <div class="meta">
          <div><strong>Filter:</strong> ${filterText}</div>
          <div><strong>Total Records:</strong> ${filteredCandidates.length} | <strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th style="width: 140px;">Candidate Name</th>
              <th style="width: 60px; text-align: center;">Gender</th>
              <th style="width: 180px;">Address</th>
              <th style="width: 75px; text-align: center;">Status</th>
              <th style="width: 80px; text-align: center;">DOB</th>
              <th style="width: 40px; text-align: center;">Age</th>
              <th style="width: 160px;">Applied Exam(s)</th>
              <th>Qualifications</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(reportHtml);
    printWindow.document.close();
  };

  const columns = [
    {
      name: 'Sl No.',
      selector: (row, index) => index + 1,
      sortable: true,
      width: '70px',
    },
    {
      name: 'Name',
      selector: (row) => row.applicant_name,
      sortable: true,
      minWidth: '180px',
      cell: (row) => (
        <Link
          to={`/CandidateProfile/${row.candidate_id || row.encrypted_candidate_id}`}
          className="fw-bold text-primary text-decoration-none"
          title={`Click to view ${row.applicant_name}'s profile`}
          onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
        >
          {row.applicant_name}
        </Link>
      ),
    },
    {
      name: 'Gender',
      selector: (row) => row.gender,
      sortable: true,
      width: '90px',
      cell: (row) => (
        <span className={`badge ${row.gender?.toLowerCase() === 'female' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} border`}>
          {row.gender || '-'}
        </span>
      ),
    },
    {
      name: 'Applied Exam',
      selector: (row) => row.exam_titles,
      sortable: true,
      minWidth: '190px',
      cell: (row) => {
        const exams = Array.isArray(row.applied_exams) ? row.applied_exams : [];
        if (exams.length > 0) {
          return (
            <div className="d-flex flex-column gap-1 py-1">
              {exams.map((ex, exIdx) => (
                <span
                  key={ex.application_id || exIdx}
                  className="badge bg-primary-subtle text-primary border border-primary-subtle text-start text-wrap py-1"
                  style={{ fontSize: '11px', lineHeight: '1.25' }}
                  title={`Status: ${ex.exam_status || 'Applied'}${ex.application_no ? ` | App No: ${ex.application_no}` : ''}`}
                >
                  <i className="bi bi-journal-check me-1"></i>
                  {ex.application_title || `Exam #${ex.application_id}`}
                </span>
              ))}
            </div>
          );
        }
        return <span className="text-muted small">Not Applied</span>;
      },
    },
    {
      name: 'Qualifications',
      minWidth: '200px',
      cell: (row) => {
        const quals = Array.isArray(row.qualifications) ? row.qualifications : [];
        if (quals.length > 0) {
          // Show up to 2 key courses and button to view all
          const preview = quals.slice(0, 2);
          return (
            <div className="py-1">
              <div className="d-flex flex-wrap gap-1 mb-1">
                {preview.map((q, qIdx) => (
                  <span
                    key={q.qual_id || qIdx}
                    className="badge bg-light text-dark border"
                    style={{ fontSize: '10.5px' }}
                    title={`${q.course}${q.main_subject ? ` (${q.main_subject})` : ''}`}
                  >
                    {q.course}
                    {q.main_subject ? ` - ${q.main_subject.substring(0, 15)}` : ''}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold"
                style={{ fontSize: '11px' }}
                onClick={() => handleViewQualifications(row)}
              >
                View all ({quals.length}) <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          );
        }
        return <span className="text-muted small">-</span>;
      },
    },
    {
      name: 'Address',
      selector: (row) => row.address,
      sortable: true,
      minWidth: '200px',
      cell: (row) => (
        <span style={{ whiteSpace: 'normal', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {row.address}
        </span>
      ),
    },
    {
      name: 'DOB / Age',
      selector: (row) => row.dob,
      sortable: true,
      width: '120px',
      cell: (row) => (
        <div>
          <div>{formatDate(row.dob)}</div>
          <small className="text-muted">{calculateAge(row.dob)} yrs</small>
        </div>
      ),
    },
    {
      name: 'Published Works',
      cell: (row) => {
        const hasPub =
          Number(row.has_published_works) === 1 ||
          (Array.isArray(row.published_works) && row.published_works.length > 0);
        const count = Array.isArray(row.published_works) ? row.published_works.length : hasPub ? 1 : 0;

        if (hasPub) {
          return (
            <button
              className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={() => handleViewPublishedWorks(row)}
              title="Click to view published works details"
            >
              <i className="bi bi-journal-bookmark-fill"></i>
              <span>{count} Work{count > 1 ? 's' : ''}</span>
              <span className="badge bg-success ms-1">View</span>
            </button>
          );
        }
        return <span className="text-muted small">None</span>;
      },
      sortable: true,
      minWidth: '150px',
    },
  ];

  return (
    <>
      <Breadcum items={breadcum} title="Approved Candidates" />

      <div className="col-md-12">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
            <div>
              <h5 className="card-title mb-0 fw-bold text-primary">
                Approved Candidates
              </h5>
              <small className="text-muted">
                Showing approved candidates with exam, qualification, and published works details
              </small>
            </div>

            {/* Action Buttons: Excel & PDF */}
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm"
                onClick={handleExportExcel}
                disabled={exportLoading}
              >
                <i className="bi bi-file-earmark-excel-fill"></i>
                <span>{exportLoading ? 'Exporting...' : 'Export Excel'}</span>
              </button>

              <button
                className="btn btn-danger btn-sm d-flex align-items-center gap-1 shadow-sm"
                onClick={handlePrintPDF}
              >
                <i className="bi bi-file-earmark-pdf-fill"></i>
                <span>Print / PDF Report</span>
              </button>
            </div>
          </div>

          <div className="card-body pt-3">
            {/* Filter Section Card */}
            <div className="bg-light p-3 rounded-3 mb-3 border">
              <div className="row g-2 align-items-end">
                {/* 1. Exam Filter */}
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-bold mb-1 text-secondary">
                    <i className="bi bi-journal-check text-primary me-1"></i> Filter by Exam:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={examFilter}
                    onChange={(e) => setExamFilter(e.target.value)}
                  >
                    <option value="all">All Exams / Candidates</option>
                    {availableExams.map((ex) => (
                      <option key={ex.application_id} value={ex.application_id}>
                        {ex.application_title}
                      </option>
                    ))}
                    <option value="not_applied">Not Applied for Any Exam</option>
                  </select>
                </div>

                {/* 2. Course / Degree Filter */}
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-bold mb-1 text-secondary">
                    <i className="bi bi-mortarboard-fill text-success me-1"></i> Filter by Qualification:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                  >
                    <option value="all">All Qualifications / Courses</option>
                    {availableCourses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Subject / Stream Filter */}
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-bold mb-1 text-secondary">
                    <i className="bi bi-book-half text-info me-1"></i> Filter by Subject:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                  >
                    <option value="all">All Subjects / Streams</option>
                    {availableSubjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Published Works Filter */}
                <div className="col-lg-3 col-md-6">
                  <label className="form-label small fw-bold mb-1 text-secondary">
                    <i className="bi bi-journal-bookmark-fill text-warning me-1"></i> Published Works:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={publishedFilter}
                    onChange={(e) => setPublishedFilter(e.target.value)}
                  >
                    <option value="all">All ({candidates.length})</option>
                    <option value="with_published">With Published Works Only ({countWithPublished})</option>
                    <option value="without_published">Without Published Works ({candidates.length - countWithPublished})</option>
                  </select>
                </div>
              </div>

              {/* Sub-row: Search Bar & Active Stats */}
              <div className="row g-2 mt-2 align-items-center">
                <div className="col-md-7 col-sm-12">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search name, phone, email, qualification, exam, address..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearch('')}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-md-5 col-sm-12 d-flex align-items-center justify-content-md-end gap-2 flex-wrap">
                  <span className="badge bg-white text-dark border px-3 py-2">
                    Showing: <strong>{filteredCandidates.length}</strong> / {candidates.length}
                  </span>

                  {isAnyFilterActive && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                      onClick={handleResetFilters}
                      title="Clear all active filters"
                    >
                      <i className="bi bi-x-circle"></i>
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Candidate Table */}
            <div className="table-responsive">
              <DataTable
                className="custom-data-table"
                columns={columns}
                data={filteredCandidates}
                pagination
                paginationPerPage={15}
                paginationRowsPerPageOptions={[10, 15, 25, 50, 100]}
                highlightOnHover
                pointerOnHover
                ref={dataTableRef}
                noDataComponent={
                  <div className="py-5 text-center text-muted">
                    <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                    {loaded ? 'No approved candidates match your filter.' : 'Loading approved candidates...'}
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Qualifications Details Modal */}
      <Modal
        show={showQualsModal}
        onHide={() => setShowQualsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            <i className="bi bi-mortarboard text-primary me-2"></i>
            Qualifications: {selectedCandidateQuals?.applicant_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCandidateQuals &&
          Array.isArray(selectedCandidateQuals.qualifications) &&
          selectedCandidateQuals.qualifications.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40px' }} className="text-center">#</th>
                    <th>Course / Degree</th>
                    <th>Main Subject / Stream</th>
                    <th>University / Board / Institution</th>
                    <th style={{ width: '90px' }} className="text-center">Year</th>
                    <th style={{ width: '80px' }} className="text-center">% Marks</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCandidateQuals.qualifications.map((q, idx) => (
                    <tr key={q.qual_id || idx}>
                      <td className="text-center fw-bold">{idx + 1}</td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {q.course || 'Qualification'}
                        </span>
                      </td>
                      <td className="fw-semibold">{q.main_subject || '-'}</td>
                      <td>{q.university_board || q.school_university || '-'}</td>
                      <td className="text-center">{q.year_passing || '-'}</td>
                      <td className="text-center fw-bold text-success">
                        {q.percentage ? `${q.percentage}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-info-circle fs-3 d-block mb-2"></i>
              No qualification details recorded for this candidate.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowQualsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Published Works Details Modal */}
      <Modal
        show={showWorksModal}
        onHide={() => setShowWorksModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            <i className="bi bi-journal-text text-primary me-2"></i>
            Published Works: {selectedCandidateWorks?.applicant_name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCandidateWorks &&
          Array.isArray(selectedCandidateWorks.published_works) &&
          selectedCandidateWorks.published_works.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered table-striped align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40px' }} className="text-center">#</th>
                    <th>Publication Type</th>
                    <th>Title of Published Work</th>
                    <th>Publisher / Journal / Organization</th>
                    <th style={{ width: '100px' }} className="text-center">Year</th>
                    <th>Identifier (ISBN / ISSN / DOI)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCandidateWorks.published_works.map((pw, idx) => (
                    <tr key={pw.qual_id || idx}>
                      <td className="text-center fw-bold">{idx + 1}</td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                          {pw.publication_type || pw.course || 'Published Work'}
                        </span>
                      </td>
                      <td className="fw-semibold">{pw.work_title || pw.title || '-'}</td>
                      <td>{pw.publisher || pw.university_board || '-'}</td>
                      <td className="text-center">{pw.pub_year || pw.year_passing || '-'}</td>
                      <td>
                        <code>{pw.identifier || pw.reg_no || '-'}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-info-circle fs-3 d-block mb-2"></i>
              No published works details available for this candidate.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowWorksModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApprovedCandidatesList;
