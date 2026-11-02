import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import globalVariables from "../Global.js";
import Breadcum from './Breadcum';
import { convertDateFormat } from '../utilities/dateconverter.js';
import { capitalizeWords } from '../utilities/dateconverter';
import useAuth from "../utilities/useAuth";
import print_toast from "../utilities/Toaster.js";

// Editable & Draggable Row Component (Used in Staging / Edit mode)
const DraggableRow = ({ row, index, moveRow, onRemove }) => {
  const { user } = useAuth();
  const [{ isDragging }, ref] = useDrag({
    type: 'TABLE_ROW',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: user?.user_type !== 'certificate_verifier',
  });

  const [, drop] = useDrop({
    accept: 'TABLE_ROW',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const candidateType = (row.candidate_type || '').toLowerCase();
  const resolvedGender = capitalizeWords(
    candidateType.includes('sister')
      ? 'female'
      : candidateType.includes('priest')
      ? 'male'
      : (row.gender || '')
  );

  return (
    <tr
      ref={(node) => user?.user_type !== 'certificate_verifier' ? ref(drop(node)) : null}
      className="align-middle"
      style={{
        backgroundColor: isDragging ? "#e9ecef" : "#fff",
        opacity: isDragging ? 0.5 : 1,
        cursor: "grab",
        transition: "background-color 0.2s ease"
      }}
    >
      <td className="text-center fw-bold text-primary" style={{ width: '90px' }}>
        {user?.user_type !== 'certificate_verifier' && (
          <i className="fas fa-grip-vertical text-muted me-2" title="Drag to reorder" style={{ cursor: 'grab' }}></i>
        )}
        <span className="badge bg-light text-dark border px-2 py-1 fw-bold">#{index + 1}</span>
      </td>
      <td className="text-center fw-bold text-success fs-6" style={{ width: '100px' }}>{row.total_mark}</td>
      <td className="text-center" style={{ width: '130px' }}>
        <span className={`badge rounded-pill ${candidateType.includes('priest') ? 'bg-dark text-white' : candidateType.includes('sister') ? 'bg-info-subtle text-info border' : 'bg-primary-subtle text-primary border'} px-3 py-2 fw-medium`}>
          {capitalizeWords(row.candidate_type || 'Candidate')}
        </span>
      </td>
      <td className="fw-bold text-dark">
        {row.encrypted_candidate_id ? (
          <a href={`/CandidateProfile/${row.encrypted_candidate_id}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none text-primary hover-underline">
            {capitalizeWords(row.applicant_name)}
          </a>
        ) : (
          <span className="text-primary">{capitalizeWords(row.applicant_name)}</span>
        )}
      </td>
      <td className="text-dark small" style={{ width: '100px' }}>{resolvedGender || '-'}</td>
      <td className="text-muted small" style={{ width: '220px' }}>{row.email || '-'}</td>
      <td style={{ minWidth: '180px' }}>
        <input
          type="text"
          className="form-control form-control-sm border bg-white"
          placeholder="Add remark..."
          defaultValue={row.remarks || ''}
          onChange={(e) => { row.remarks = e.target.value; }}
        />
      </td>
      {user?.user_type !== 'certificate_verifier' && (
        <td className="text-center" style={{ width: '80px' }}>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm border-0 rounded-circle"
            title="Remove from Rank List and return to Merit List"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index, row);
            }}
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <i className="fas fa-trash-alt text-danger"></i>
          </button>
        </td>
      )}
    </tr>
  );
};

// Clean Read-Only Official Row Component (Used when rank list is generated & finalized)
const FinalizedRankRow = ({ row, index }) => {
  const rankNum = row.rank || index + 1;
  const candidateType = (row.candidate_type || '').toLowerCase();

  let rankBadge = (
    <span className="badge bg-light text-dark border px-3 py-2 fw-bold fs-6">
      #{rankNum}
    </span>
  );
  if (rankNum === 1) {
    rankBadge = (
      <span className="badge bg-warning text-dark px-3 py-2 fw-bold shadow-sm fs-6">
        <i className="fas fa-trophy text-dark me-1"></i> 1
      </span>
    );
  } else if (rankNum === 2) {
    rankBadge = (
      <span className="badge bg-secondary text-white px-3 py-2 fw-bold shadow-sm fs-6">
        <i className="fas fa-medal me-1"></i> 2
      </span>
    );
  } else if (rankNum === 3) {
    rankBadge = (
      <span className="badge text-white px-3 py-2 fw-bold shadow-sm fs-6" style={{ backgroundColor: '#cd7f32' }}>
        <i className="fas fa-medal me-1"></i> 3
      </span>
    );
  }

  let typeBadgeClass = 'bg-primary-subtle text-primary border border-primary-subtle';
  if (candidateType.includes('priest')) {
    typeBadgeClass = 'bg-dark text-white';
  } else if (candidateType.includes('sister')) {
    typeBadgeClass = 'bg-info-subtle text-info border border-info-subtle';
  }

  const resolvedGender = capitalizeWords(
    candidateType.includes('sister')
      ? 'female'
      : candidateType.includes('priest')
      ? 'male'
      : (row.gender || '')
  );

  return (
    <tr className="align-middle">
      <td className="text-center" style={{ width: '100px' }}>{rankBadge}</td>
      <td className="text-center" style={{ width: '110px' }}>
        <span className="fw-bold text-success fs-6">{row.total_mark}</span>
      </td>
      <td className="text-center" style={{ width: '130px' }}>
        <span className={`badge rounded-pill ${typeBadgeClass} px-3 py-2 fw-medium`}>
          {capitalizeWords(row.candidate_type || 'Candidate')}
        </span>
      </td>
      <td className="fw-bold text-dark">
        {row.encrypted_candidate_id ? (
          <a
            href={`/CandidateProfile/${row.encrypted_candidate_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none text-primary hover-underline fw-bold"
          >
            {capitalizeWords(row.applicant_name)}
          </a>
        ) : (
          <span className="text-primary fw-bold">{capitalizeWords(row.applicant_name)}</span>
        )}
      </td>
      <td className="text-dark small" style={{ width: '110px' }}>{resolvedGender || '-'}</td>
      <td className="text-muted small" style={{ width: '230px' }}>{row.email || '-'}</td>
      <td style={{ minWidth: '180px' }}>
        {row.remarks ? (
          <span className="badge bg-light text-dark border text-wrap text-start fw-normal px-2 py-1">
            {row.remarks}
          </span>
        ) : (
          <span className="text-muted small fst-italic">None</span>
        )}
      </td>
    </tr>
  );
};

const CandidateExamRankList = ({ isEmbedded = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { application_id } = useParams();
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Exam Applications', Link: '/exam-application' },
    { Title: 'Candidate Exam Rank List', Link: '' },
  ]);

  const [examDetails, setExamDetails] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isTransferredFromMerit, setIsTransferredFromMerit] = useState(false);
  const [isAlreadyGenerated, setIsAlreadyGenerated] = useState(false);
  const [isEditingGenerated, setIsEditingGenerated] = useState(false);
  const [generatedSubjectId, setGeneratedSubjectId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'rank', direction: 'asc' });

  // 1. Initial Data Fetching (Mount)
  useEffect(() => {
    // Reset state on application_id change
    setSelectedSubject('');
    setTableData([]);
    setShowTable(false);
    setIsAlreadyGenerated(false);
    setIsEditingGenerated(false);

    fetchExamDetails();

    const handleTransferredEvent = (e) => {
      const { subjectId, candidates: transferredList } = e.detail || {};
      if (subjectId && Array.isArray(transferredList)) {
        setSelectedSubject(subjectId);
        setTableData(transferredList);
        setShowTable(transferredList.length > 0);
        setIsTransferredFromMerit(true);
        setIsAlreadyGenerated(false);
        setIsEditingGenerated(false);
      }
    };

    window.addEventListener('rank-candidates-transferred', handleTransferredEvent);
    return () => {
      window.removeEventListener('rank-candidates-transferred', handleTransferredEvent);
    };
  }, [application_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Event Listener for Excel & PDF Export
  useEffect(() => {
    const handleExportTrigger = (e) => {
      handleExportExcel(e.detail);
    };
    const handlePdfTrigger = (e) => {
      handleGeneratePDF(e.detail);
    };

    window.addEventListener('trigger-rank-excel-export', handleExportTrigger);
    window.addEventListener('trigger-rank-pdf-export', handlePdfTrigger);
    return () => {
      window.removeEventListener('trigger-rank-excel-export', handleExportTrigger);
      window.removeEventListener('trigger-rank-pdf-export', handlePdfTrigger);
    };
  }, [selectedSubject, subjects, generatedSubjectId]);

  // 3. Inform parent header about subject selection
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('rank-subject-selected', { 
        detail: { 
          subjectId: selectedSubject,
          hasRankedCandidates: showTable && tableData.length > 0 && isAlreadyGenerated
        } 
    }));
  }, [selectedSubject, showTable, tableData.length, isAlreadyGenerated]);

  const fetchExamDetails = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/exam_application/get_Applications_application_id`, {
        params: { application_id },
      });

      if (response.data.status) {
        setExamDetails(response.data.data[0]);
      }

      const subjectResponse = await axios.get(
        `${globalVariables.api_url}/exam_application/get_subjects_application_id/${application_id}`
      );

      if (subjectResponse.data.status && Array.isArray(subjectResponse.data.data)) {
        const subjectList = subjectResponse.data.data.map((subject) => ({
          id: subject.subject_id,
          name: subject.subject_name,
          code: subject.subject_code,
        }));
        setSubjects(subjectList);

        // Check if there is a saved subject for THIS exam
        const savedSubject = sessionStorage.getItem(`current_rank_subject_id_${application_id}`) || sessionStorage.getItem('current_rank_subject_id');
        
        // CRITICAL VALIDATION: Only use savedSubject if it ACTUALLY exists in this exam's subjectList!
        const matched = subjectList.find(s => String(s.id) === String(savedSubject));
        if (matched) {
          handleSubjectChange(matched.id);
        } else {
          // If the saved subject doesn't belong to this exam, remove stale item and keep empty
          sessionStorage.removeItem('current_rank_subject_id');
          sessionStorage.removeItem(`current_rank_subject_id_${application_id}`);
          setSelectedSubject('');
          setTableData([]);
          setShowTable(false);
          setIsAlreadyGenerated(false);
          setIsEditingGenerated(false);
        }
      } else {
        setSubjects([]);
        setSelectedSubject('');
        setTableData([]);
        setShowTable(false);
        setIsAlreadyGenerated(false);
        setIsEditingGenerated(false);
      }
    } catch (error) {
      console.error('Error fetching exam details:', error);
    }
  };

  const handleSubjectChange = async (subjectId) => {
    if (!subjectId) {
      setSelectedSubject('');
      sessionStorage.removeItem(`current_rank_subject_id_${application_id}`);
      sessionStorage.removeItem('current_rank_subject_id');
      setTableData([]);
      setShowTable(false);
      setIsAlreadyGenerated(false);
      setIsEditingGenerated(false);
      return;
    }

    try {
      setSelectedSubject(subjectId);
      sessionStorage.setItem(`current_rank_subject_id_${application_id}`, subjectId);
      sessionStorage.setItem('current_rank_subject_id', subjectId);
      setIsEditingGenerated(false);

      // Check subject details including rank list generation status
      const response = await axios.get(`${globalVariables.api_url}/exam_application/get_exam_details_subjects_id`, {
        params: { subject_id: subjectId }
      });

      const responseData = response.data?.data;
      const isRankListGenerated = responseData?.is_rank_list_generate?.toLowerCase();
      const exam_application_subject_id = responseData?.exam_application_subject_id;
      const targetExamSubId = exam_application_subject_id || subjectId;

      // 1. PRIORITY: Check if candidates were freshly transferred from Merit List in session
      const savedTransferred = sessionStorage.getItem(`transferred_rank_${subjectId}`);
      if (savedTransferred) {
        try {
          const parsed = JSON.parse(savedTransferred);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTableData(parsed);
            setShowTable(true);
            setIsTransferredFromMerit(true);
            setIsAlreadyGenerated(false);
            setGeneratedSubjectId(targetExamSubId);
            return;
          }
        } catch (e) {
          console.error('Error parsing transferred candidates:', e);
        }
      }

      // 2. Otherwise check if the rank list was already generated/saved in the backend
      try {
        const rankListRes = await axios.get(`${globalVariables.api_url}/candidatemarklist/get_rank_list`, {
          params: { fk_exam_application_subject_id: targetExamSubId }
        });
        let savedRankList = rankListRes.data?.data;
        if (Array.isArray(savedRankList) && savedRankList.length > 0) {
          // Filter by saved selection if available (protects against stale un-deleted DB rows)
          const savedAllowedRaw = localStorage.getItem(`official_rank_allowed_ids_${subjectId}`);
          if (savedAllowedRaw) {
            try {
              const allowedIds = new Set(JSON.parse(savedAllowedRaw).map(String));
              if (allowedIds.size > 0) {
                const filtered = savedRankList.filter((item) => {
                  const cid = String(
                    item.fk_candidate_application_subject_id ||
                    item.fk_canididate_application_subject_id ||
                    item.canididate_application_subject_id ||
                    item.applicant_name || ''
                  );
                  return allowedIds.has(cid) || allowedIds.has(String(item.applicant_name || ''));
                });
                if (filtered.length > 0) {
                  savedRankList = filtered;
                }
              }
            } catch (e) {
              console.error('Error filtering by saved allowed ids:', e);
            }
          }

          const formatted = savedRankList.map((item, idx) => {
            const cType = (item.candidate_type || '').toLowerCase();
            let genderVal = item.gender;
            if (cType.includes('sister')) genderVal = 'Female';
            else if (cType.includes('priest')) genderVal = 'Male';
            else if (!genderVal) genderVal = 'N/A';

            return {
              ...item,
              id: idx.toString(),
              rank: idx + 1,
              applicant_name: item.applicant_name,
              total_mark: item.total_mark,
              candidate_type: item.candidate_type,
              gender: genderVal,
              remarks: item.remarks || '',
            };
          });
          setTableData(formatted);
          setShowTable(true);
          setIsTransferredFromMerit(false);
          setIsAlreadyGenerated(true);
          setGeneratedSubjectId(targetExamSubId);
          return;
        }
      } catch (err) {
        console.error("Error fetching saved rank list:", err);
      }

      // If neither saved in database nor in session, empty state
      setTableData([]);
      setShowTable(false);
      setIsTransferredFromMerit(false);
      setIsAlreadyGenerated(isRankListGenerated === "yes");
      setGeneratedSubjectId(exam_application_subject_id);
    } catch (error) {
      console.error("Error fetching subject status:", error.response?.data || error.message);
      setTableData([]);
      setShowTable(false);
      setIsTransferredFromMerit(false);
      setIsAlreadyGenerated(false);
    }
  };

  // Remove a candidate row from Rank List and notify Merit List to uncheck them
  const handleRemoveCandidate = (index, row) => {
    if (!window.confirm(`Remove ${row.applicant_name} from the Official Rank List and return to Merit List?`)) {
      return;
    }

    const updated = tableData.filter((_, i) => i !== index).map((item, idx) => ({
      ...item,
      id: idx.toString(),
      rank: idx + 1,
    }));

    setTableData(updated);

    if (updated.length > 0) {
      sessionStorage.setItem(`transferred_rank_${selectedSubject}`, JSON.stringify(updated));
    } else {
      sessionStorage.removeItem(`transferred_rank_${selectedSubject}`);
      setShowTable(false);
    }

    // Dispatch event so CategoryMeritList unchecks this candidate immediately
    const candidateKey = String(row.encrypted_candidate_id || row.reg_id || row.fk_canididate_application_subject_id || row.applicant_name);
    window.dispatchEvent(
      new CustomEvent('rank-candidate-removed', {
        detail: {
          subjectId: selectedSubject,
          candidateKey,
          applicantName: row.applicant_name,
        },
      })
    );

    print_toast('success', `${row.applicant_name} removed and returned to Merit List`);
  };

  // Revert all transferred/generated candidates for this subject
  const handleRevert = async () => {
    if (!selectedSubject) return;
    if (!window.confirm('Are you sure you want to revert all candidates for this subject? All candidates will return to their unselected state in the Merit List.')) {
      return;
    }

    try {
      await axios.post(`${globalVariables.api_url}/candidatemarklist/revert_rank_list`, {
        subject_id: selectedSubject,
        fk_exam_application_subject_id: generatedSubjectId || selectedSubject
      });
    } catch (err) {
      console.error("Error reverting rank list in backend:", err);
    }

    sessionStorage.removeItem(`transferred_rank_${selectedSubject}`);
    sessionStorage.removeItem('current_rank_subject_id');
    localStorage.removeItem(`official_rank_allowed_ids_${selectedSubject}`);

    window.dispatchEvent(
      new CustomEvent('rank-candidates-reverted', {
        detail: { subjectId: selectedSubject },
      })
    );

    setTableData([]);
    setShowTable(false);
    setIsTransferredFromMerit(false);
    setIsAlreadyGenerated(false);
    setIsEditingGenerated(false);

    print_toast('success', 'Official rank list reverted and candidates returned to Merit List');
  };

  // Move row function for drag and drop
  const moveRow = (fromIndex, toIndex) => {
    const updatedTableData = [...tableData];
    const [removed] = updatedTableData.splice(fromIndex, 1);
    updatedTableData.splice(toIndex, 0, removed);

    // Recalculate ranks
    const rankedTableData = updatedTableData.map((item, index) => ({
      ...item,
      id: index.toString(),
      rank: index + 1
    }));

    setTableData(rankedTableData);
    sessionStorage.setItem(`transferred_rank_${selectedSubject}`, JSON.stringify(rankedTableData));
    setSortConfig({ key: 'manual', direction: 'asc' });
  };

  // Column header sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key !== key && key === 'total_mark') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    setTableData((prev) => {
      const sorted = [...prev].sort((a, b) => {
        let valA, valB;
        if (key === 'rank') {
          valA = Number(a.rank) || 0;
          valB = Number(b.rank) || 0;
        } else if (key === 'total_mark') {
          valA = Number(a.total_mark) || 0;
          valB = Number(b.total_mark) || 0;
        } else if (key === 'gender') {
          valA = (a.gender || '').toLowerCase();
          valB = (b.gender || '').toLowerCase();
        } else {
          valA = (a[key] || '').toString().toLowerCase();
          valB = (b[key] || '').toString().toLowerCase();
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });

      // If in staging/edit mode, update ranks and cache
      if (!isAlreadyGenerated || isEditingGenerated) {
        const reindexed = sorted.map((item, idx) => ({
          ...item,
          id: idx.toString(),
          rank: idx + 1,
        }));
        sessionStorage.setItem(`transferred_rank_${selectedSubject}`, JSON.stringify(reindexed));
        return reindexed;
      }

      return sorted;
    });
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <i className="fas fa-sort text-secondary opacity-50 ms-1 small"></i>;
    }
    return sortConfig.direction === 'asc' ? (
      <i className="fas fa-sort-up text-warning ms-1"></i>
    ) : (
      <i className="fas fa-sort-down text-warning ms-1"></i>
    );
  };

  // Submit and Generate/Update Final Official Rank List
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!selectedSubject) {
      alert('Please select a subject first.');
      return;
    }

    if (!tableData || tableData.length === 0) {
      alert('No candidates in the rank list to save. Please transfer candidates from the Merit List first.');
      return;
    }

    // Prepare data for submission
    const preparedData = {
      subject_id: selectedSubject,
      application_id: application_id,
      candidates: tableData.map((row, index) => ({
        fk_canididate_application_subject_id: row.fk_canididate_application_subject_id || row.canididate_application_subject_id || row.fk_candidate_application_subject_id,
        fk_exam_application_subject_id: row.fk_exam_application_subject_id || generatedSubjectId || selectedSubject,
        total_mark: row.total_mark,
        rank: index + 1,
        remarks: row.remarks || ''
      }))
    };

    const confirmMsg = isAlreadyGenerated
      ? `Save updated ranks and remarks for ${tableData.length} candidates?`
      : `Are you sure you want to save ranks and generate the official rank list for ${tableData.length} candidates?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    setLoading(true);
    try {
      // Clear any previous rank list entries for this subject before saving the selected candidates
      try {
        await axios.post(`${globalVariables.api_url}/candidatemarklist/revert_rank_list`, {
          subject_id: selectedSubject,
          fk_exam_application_subject_id: generatedSubjectId || selectedSubject
        });
      } catch (revertErr) {
        console.warn('Pre-save revert warning:', revertErr);
      }

      const response = await axios.post(
        `${globalVariables.api_url}/candidatemarklist/save_rank_list`,
        preparedData,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.status) {
        const fkExamApplicationSubjectId = response.data.data?.[0]?.fk_exam_application_subject_id ||
          response.data.data?.fk_exam_application_subject_id ||
          generatedSubjectId || selectedSubject;

        // Store the exact selected candidate IDs/names so only these show in Official Rank List
        const allowedKeys = tableData.map((row) =>
          String(
            row.fk_canididate_application_subject_id ||
            row.canididate_application_subject_id ||
            row.fk_candidate_application_subject_id ||
            row.applicant_name || ''
          )
        );
        localStorage.setItem(`official_rank_allowed_ids_${selectedSubject}`, JSON.stringify(allowedKeys));

        // Clear transferred session cache for this subject
        sessionStorage.removeItem(`transferred_rank_${selectedSubject}`);

        setIsAlreadyGenerated(true);
        setIsEditingGenerated(false);
        setIsTransferredFromMerit(false);
        setGeneratedSubjectId(fkExamApplicationSubjectId);

        print_toast('success', isAlreadyGenerated ? 'Official rank list updated successfully!' : 'Official rank list generated successfully!');
      } else {
        alert(response.data.message || 'Failed to save ranks. Please try again.');
      }
    } catch (error) {
      console.error('Error saving ranks:', error);
      alert(error.response?.data?.message || 'An error occurred while saving ranks.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async (detail) => {
    const targetSubjectId = generatedSubjectId || selectedSubject;
    if (!targetSubjectId) {
      alert("Please select a subject first to export data.");
      detail?.onError && detail.onError();
      return;
    }

    setExcelLoading(true);
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/candidatemarklist/get_rank_list_export_data`,
        { 
          params: { 
            subject_id: targetSubjectId,
            fk_exam_application_subject_id: targetSubjectId,
            excel: "excel" 
          },
          responseType: 'blob' 
        }
      );

      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        try {
          const err = JSON.parse(text);
          alert(err.message || 'Failed to export Excel.');
        } catch {
          alert('Failed to export Excel.');
        }
        detail?.onError && detail.onError();
        return;
      }

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      const subject = subjects.find(s => String(s.id) === String(selectedSubject));
      const subjectName = subject ? subject.name.toUpperCase().replace(/\s+/g, '_') : targetSubjectId;
      
      link.setAttribute("download", `Rank_List_${subjectName}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      print_toast('success', 'Excel exported successfully!');
      
      detail?.onComplete && detail.onComplete();
    } catch (error) {
      console.error("Excel Export Error:", error);
      alert("Failed to export Excel. Please try again.");
      detail?.onError && detail.onError();
    } finally {
      setExcelLoading(false);
    }
  };

  const handleGeneratePDF = async (detail) => {
    const targetSubjectId = generatedSubjectId || selectedSubject;
    if (!targetSubjectId) {
      alert("Please select a subject first to generate PDF.");
      detail?.onError && detail.onError();
      return;
    }

    setPdfLoading(true);
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/candidatemarklist/search_reports_candidate_rank_list`,
        {
          params: {
            fk_exam_application_subject_id: targetSubjectId,
            subject_id: targetSubjectId,
            print: "print"
          },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const subject = subjects.find(s => String(s.id) === String(selectedSubject));
      const subjectName = subject ? subject.name.toUpperCase().replace(/\s+/g, '_') : targetSubjectId;

      link.setAttribute("download", `Rank_List_${subjectName}.pdf`);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      print_toast('success', 'PDF generated and downloaded successfully!');

      detail?.onComplete && detail.onComplete();
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please try again.");
      detail?.onError && detail.onError();
    } finally {
      setPdfLoading(false);
    }
  };

  const isFinalizedView = isAlreadyGenerated && !isEditingGenerated;

  return (
    <DndProvider backend={HTML5Backend}>
      {!isEmbedded && <Breadcum items={breadcum} title="Candidate Exam Rank List" />}

      <div className={`card ${isEmbedded ? 'border-0 shadow-none' : 'shadow-sm'} mb-4`}>
        {!isEmbedded && (
          <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
            <h5 className="card-title fw-bold text-dark mb-0">
              <i className="fas fa-trophy me-2 text-warning"></i>Candidate Exam Rank List
            </h5>
          </div>
        )}

        <div className="card-body p-4">
          {!isEmbedded && examDetails && examDetails.application_title && (
            <div className="mb-4 p-4 bg-light rounded shadow-sm border-start border-top border-4 border-primary">
              <div className="row align-items-center">
                <div className="col-md-7">
                  <h5 className="fw-bold text-primary mb-1">
                    <i className="fas fa-file-signature me-2"></i>{examDetails.application_title}
                  </h5>
                  <div className="text-muted small">
                    <i className="fas fa-info-circle me-1"></i> Exam Details & Rank Generation Process
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="d-flex justify-content-md-end gap-2 mt-2 mt-md-0">
                    <div className="bg-white border rounded px-3 py-2 text-center shadow-sm">
                      <small className="text-muted d-block fw-bold" style={{ fontSize: '0.65rem' }}>START DATE</small>
                      <span className="small fw-bold text-dark">{convertDateFormat(examDetails.start_date)}</span>
                    </div>
                    <div className="bg-white border rounded px-3 py-2 text-center shadow-sm border-danger-light">
                      <small className="text-muted d-block fw-bold" style={{ fontSize: '0.65rem' }}>END DATE</small>
                      <span className="small fw-bold text-danger">{convertDateFormat(examDetails.end_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subject Filter & Top Action Bar */}
          <div className="row mb-4 align-items-end">
            <div className="col-md-5">
              <label className="fw-bold small text-muted text-uppercase mb-2 ms-1">
                <i className="fas fa-filter me-2"></i>Filter by Exam Subject
              </label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-book text-primary"></i>
                </span>
                <select
                  className="form-select border-start-0 ps-0 fw-medium"
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                >
                  <option value="">Choose a subject to view rank list</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.code ? subject.code + '-' : ''}{subject.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Top Action Buttons (shown only in Staging or Edit mode) */}
            {showTable && tableData.length > 0 && !isFinalizedView && user?.user_type !== 'certificate_verifier' && (
              <div className="col-md-7 d-flex justify-content-md-end gap-2 mt-3 mt-md-0">
                {isEditingGenerated ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-secondary fw-bold shadow-sm px-3"
                      onClick={() => setIsEditingGenerated(false)}
                    >
                      <i className="fas fa-times me-1"></i> Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger fw-bold shadow-sm px-3"
                      onClick={handleRevert}
                    >
                      <i className="fas fa-undo me-1"></i> Revert List
                    </button>
                    <button
                      type="button"
                      className="btn btn-success fw-bold shadow-sm px-4"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      <i className="fas fa-save me-1"></i> {loading ? 'Saving...' : 'Save & Update'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-danger fw-bold shadow-sm px-3"
                      onClick={handleRevert}
                    >
                      <i className="fas fa-undo me-1"></i> Revert List
                    </button>
                    <button
                      type="button"
                      className="btn btn-success fw-bold shadow-sm px-4"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      <i className="fas fa-check-circle me-1"></i> {loading ? 'Saving...' : 'Generate Rank List'}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 1. STATE: Finalized Official Rank List View */}
          {showTable && tableData.length > 0 && isFinalizedView && (
            <div className="finalized-rank-view">
              {/* Premium Status Banner */}
              <div className="card border-0 shadow-sm mb-4 rounded-3" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)', borderLeft: '5px solid #2e7d32' }}>
                <div className="card-body p-3 p-md-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle bg-white shadow-sm p-3 d-flex align-items-center justify-content-center" style={{ width: '54px', height: '54px' }}>
                        <i className="fas fa-trophy text-warning fs-3"></i>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-success text-white px-2 py-1 small fw-bold text-uppercase">
                            <i className="fas fa-check-circle me-1"></i> Finalized & Published
                          </span>
                          <span className="text-muted small fw-bold">
                            {tableData.length} Candidates Officially Ranked
                          </span>
                        </div>
                        <h5 className="fw-bold text-dark mb-0">Official Merit Rank List</h5>
                      </div>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm fw-bold shadow-sm px-3 d-flex align-items-center gap-2"
                        onClick={() => handleGeneratePDF()}
                        disabled={pdfLoading}
                      >
                        {pdfLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-pdf"></i> View / Export PDF
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm fw-bold shadow-sm px-3 d-flex align-items-center gap-2"
                        onClick={() => handleExportExcel()}
                        disabled={excelLoading}
                      >
                        {excelLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            Exporting Excel...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-file-excel"></i> Export Excel
                          </>
                        )}
                      </button>
                      {user?.user_type !== 'certificate_verifier' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm fw-bold shadow-sm px-3 d-flex align-items-center gap-2"
                            onClick={() => setIsEditingGenerated(true)}
                          >
                            <i className="fas fa-edit"></i> Edit / Re-rank
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm fw-bold shadow-sm px-3 d-flex align-items-center gap-2"
                            onClick={handleRevert}
                          >
                            <i className="fas fa-undo"></i> Revert
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Official Read-Only Table */}
              <div className="table-responsive rounded-3 shadow-sm overflow-hidden border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-dark text-white text-center">
                    <tr>
                      <th
                        className="py-3 px-3 sortable-th"
                        style={{ width: '100px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('rank')}
                        title="Click to sort by Rank"
                      >
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <span>Rank</span>
                          {renderSortIcon('rank')}
                        </div>
                      </th>
                      <th
                        className="py-3 px-2 sortable-th"
                        style={{ width: '110px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('total_mark')}
                        title="Click to sort by Marks"
                      >
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <span>Marks</span>
                          {renderSortIcon('total_mark')}
                        </div>
                      </th>
                      <th
                        className="py-3 px-2 sortable-th"
                        style={{ width: '130px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('candidate_type')}
                        title="Click to sort by Type"
                      >
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <span>Type</span>
                          {renderSortIcon('candidate_type')}
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 text-start sortable-th"
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('applicant_name')}
                        title="Click to sort by Candidate Name"
                      >
                        <div className="d-flex align-items-center gap-1">
                          <span>Candidate Name</span>
                          {renderSortIcon('applicant_name')}
                        </div>
                      </th>
                      <th
                        className="py-3 px-2 sortable-th"
                        style={{ width: '110px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('gender')}
                        title="Click to sort by Gender"
                      >
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <span>Gender</span>
                          {renderSortIcon('gender')}
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 text-start sortable-th"
                        style={{ width: '230px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('email')}
                        title="Click to sort by Email"
                      >
                        <div className="d-flex align-items-center gap-1">
                          <span>Email</span>
                          {renderSortIcon('email')}
                        </div>
                      </th>
                      <th className="py-3 px-3 text-start">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <FinalizedRankRow
                        key={row.id || index}
                        row={row}
                        index={index}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Stats & Export Bar */}
              <div className="mt-3 p-3 bg-light rounded-3 border d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div className="text-muted small fw-medium">
                  Showing <strong>{tableData.length}</strong> official ranked candidates for this subject.
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm fw-bold shadow-sm d-flex align-items-center gap-2"
                    onClick={() => handleGeneratePDF()}
                    disabled={pdfLoading}
                  >
                    {pdfLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-file-pdf me-1"></i> PDF Report
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm fw-bold shadow-sm d-flex align-items-center gap-2"
                    onClick={() => handleExportExcel()}
                    disabled={excelLoading}
                  >
                    {excelLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-file-excel me-1"></i> Excel Report
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. STATE: Edit Mode on Already Generated List */}
          {showTable && tableData.length > 0 && isEditingGenerated && (
            <div className="editing-rank-view">
              <div className="alert alert-warning border-0 shadow-sm d-flex flex-wrap align-items-center justify-content-between mb-3 bg-light-warning p-3 rounded-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-edit fs-4 me-3 text-warning"></i>
                  <div>
                    <strong className="text-dark">Editing Official Rank List:</strong> Drag rows to adjust ranking, update remarks, or remove candidates. Click <strong>Save & Update</strong> to save changes.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm fw-bold px-3 shadow-sm mt-2 mt-md-0"
                  onClick={() => setIsEditingGenerated(false)}
                >
                  <i className="fas fa-times me-1"></i> Cancel Editing
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="table-responsive rounded-3 shadow-sm overflow-hidden border">
                  <table className="table table-hover mb-0">
                    <thead className="bg-dark text-white text-center">
                      <tr>
                        <th
                          className="py-3 px-3 sortable-th"
                          style={{ width: '90px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('rank')}
                          title="Click to sort by Rank"
                        >
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <span>Rank</span>
                            {renderSortIcon('rank')}
                          </div>
                        </th>
                        <th
                          className="py-3 px-2 sortable-th"
                          style={{ width: '100px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('total_mark')}
                          title="Click to sort by Marks"
                        >
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <span>Marks</span>
                            {renderSortIcon('total_mark')}
                          </div>
                        </th>
                        <th
                          className="py-3 px-2 sortable-th"
                          style={{ width: '130px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('candidate_type')}
                          title="Click to sort by Type"
                        >
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <span>Type</span>
                            {renderSortIcon('candidate_type')}
                          </div>
                        </th>
                        <th
                          className="py-3 text-start sortable-th"
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('applicant_name')}
                          title="Click to sort by Candidate Name"
                        >
                          <div className="d-flex align-items-center gap-1">
                            <span>Candidate Name</span>
                            {renderSortIcon('applicant_name')}
                          </div>
                        </th>
                        <th
                          className="py-3 px-2 sortable-th"
                          style={{ width: '100px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('gender')}
                          title="Click to sort by Gender"
                        >
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <span>Gender</span>
                            {renderSortIcon('gender')}
                          </div>
                        </th>
                        <th
                          className="py-3 px-2 text-start sortable-th"
                          style={{ width: '220px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('email')}
                          title="Click to sort by Email"
                        >
                          <div className="d-flex align-items-center gap-1">
                            <span>Email</span>
                            {renderSortIcon('email')}
                          </div>
                        </th>
                        <th className="py-3">Remarks</th>
                        {user?.user_type !== 'certificate_verifier' && (
                          <th className="py-3 px-3" style={{ width: '80px' }}>Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <DraggableRow
                          key={row.id || index}
                          row={row}
                          index={index}
                          moveRow={moveRow}
                          onRemove={handleRemoveCandidate}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {user?.user_type !== 'certificate_verifier' && (
                  <div className="mt-4 d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-lg shadow-sm px-4 fw-bold"
                      onClick={() => setIsEditingGenerated(false)}
                    >
                      <i className="fas fa-times me-2"></i>Cancel
                    </button>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-lg shadow-sm px-4 fw-bold"
                        onClick={handleRevert}
                      >
                        <i className="fas fa-undo me-2"></i>Revert List
                      </button>
                      <button type="submit" className="btn btn-success btn-lg shadow-sm px-5 fw-bold" disabled={loading}>
                        <i className="fas fa-save me-2"></i>{loading ? 'Saving...' : 'Save & Update'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* 3. STATE: Staging Mode (Freshly Transferred from Merit List, Pending First Generation) */}
          {showTable && tableData.length > 0 && !isAlreadyGenerated && (
            <div className="staging-rank-view">
              <div className="alert alert-success border-0 shadow-sm d-flex flex-wrap align-items-center justify-content-between mb-3 bg-light-success p-3 rounded-3">
                <div className="d-flex align-items-center">
                  <i className="fas fa-check-circle fs-4 me-3 text-success"></i>
                  <div>
                    <strong className="text-dark">Official Selection Active:</strong> Showing <strong>{tableData.length}</strong> candidates transferred from the <strong>Merit List</strong>. Review and adjust ranking before generating the official rank list.
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm fw-bold shadow-sm mt-2 mt-md-0"
                  onClick={() => { window.location.hash = 'merit'; }}
                >
                  <i className="fas fa-layer-group me-1"></i> Adjust in Merit List
                </button>
              </div>

              <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center mb-4 bg-light-warning">
                <i className="fas fa-arrows-alt-v fs-4 me-3 text-warning"></i>
                <div className="small">
                  <strong className="text-dark">Organization Note:</strong> You can drag and drop rows to manually re-rank candidates if needed. Ranks update automatically based on position. Click the remove button on any row to return that candidate to the Merit List.
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="table-responsive rounded-3 shadow-sm overflow-hidden border">
                  <table className="table table-hover mb-0">
                    <thead className="bg-dark text-white text-center">
                      <tr>
                        <th
                          className="py-3 px-3 sortable-th"
                          style={{ width: '90px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('rank')}
                          title="Click to sort by Rank"
                        >
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <span>Rank</span>
                            {renderSortIcon('rank')}
                          </div>
                        </th>
                        <th
                          className="py-3 px-2 sortable-th"
                          style={{ width: '100px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('total_mark')}
                          title="Click to sort by Marks"
                        >
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <span>Marks</span>
                            {renderSortIcon('total_mark')}
                          </div>
                        </th>
                        <th
                          className="py-3 px-2 sortable-th"
                          style={{ width: '130px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('candidate_type')}
                          title="Click to sort by Type"
                        >
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <span>Type</span>
                            {renderSortIcon('candidate_type')}
                          </div>
                        </th>
                        <th
                          className="py-3 text-start sortable-th"
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('applicant_name')}
                          title="Click to sort by Candidate Name"
                        >
                          <div className="d-flex align-items-center gap-1">
                            <span>Candidate Name</span>
                            {renderSortIcon('applicant_name')}
                          </div>
                        </th>
                        <th
                          className="py-3 px-2 sortable-th"
                          style={{ width: '100px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('gender')}
                          title="Click to sort by Gender"
                        >
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            <span>Gender</span>
                            {renderSortIcon('gender')}
                          </div>
                        </th>
                        <th
                          className="py-3 px-2 text-start sortable-th"
                          style={{ width: '220px', cursor: 'pointer', userSelect: 'none' }}
                          onClick={() => handleSort('email')}
                          title="Click to sort by Email"
                        >
                          <div className="d-flex align-items-center gap-1">
                            <span>Email</span>
                            {renderSortIcon('email')}
                          </div>
                        </th>
                        <th className="py-3">Remarks</th>
                        {user?.user_type !== 'certificate_verifier' && (
                          <th className="py-3 px-3" style={{ width: '80px' }}>Action</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, index) => (
                        <DraggableRow
                          key={row.id || index}
                          row={row}
                          index={index}
                          moveRow={moveRow}
                          onRemove={handleRemoveCandidate}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {user?.user_type !== 'certificate_verifier' && (
                  <div className="mt-4 d-flex justify-content-between align-items-center">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-lg shadow-sm px-4 fw-bold"
                      onClick={handleRevert}
                    >
                      <i className="fas fa-undo me-2"></i>Revert List
                    </button>
                    <button type="submit" className="btn btn-success btn-lg shadow-sm px-5 fw-bold" disabled={loading}>
                      <i className="fas fa-check-circle me-2"></i>{loading ? 'Saving...' : 'Generate Rank List'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* 4. STATE: Empty state when subject is selected but no candidates transferred or saved */}
          {selectedSubject && !showTable && (
            <div className="card border-0 shadow-sm bg-light-primary text-center p-5 my-4 rounded-4 border-dashed">
              <div className="mb-3">
                <i className="fas fa-user-plus text-primary fs-1"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">No Candidates Transferred from Merit List</h5>
              <p className="text-muted mx-auto mb-4" style={{ maxWidth: '540px' }}>
                Only candidates selected and transferred from the <strong>Merit List</strong> tab will show here. Please switch to the Merit List tab to select candidates according to quota rotation and transfer them to the Official Rank List.
              </p>
              <div>
                <button
                  type="button"
                  className="btn btn-primary fw-bold px-4 py-2 shadow-sm rounded-pill"
                  onClick={() => {
                    sessionStorage.setItem(`current_rank_subject_id_${application_id}`, selectedSubject);
                    sessionStorage.setItem('current_rank_subject_id', selectedSubject);
                    window.location.hash = 'merit';
                  }}
                >
                  <i className="fas fa-layer-group me-2"></i> Go to Merit List
                </button>
              </div>
            </div>
          )}

          {/* 5. STATE: Prompt when no subject is selected */}
          {!selectedSubject && (
            <div className="card border-0 shadow-sm bg-light text-center p-5 my-4 rounded-4 border-dashed">
              <div className="mb-3">
                <i className="fas fa-book-open text-primary fs-1"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Choose an Exam Subject</h5>
              <p className="text-muted mx-auto mb-0" style={{ maxWidth: '520px' }}>
                Please select an exam subject from the dropdown above to view, generate, or manage the Official Merit Rank List.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .sortable-th {
          transition: background-color 0.2s ease, color 0.2s ease;
        }
        .sortable-th:hover {
          background-color: #2b3035 !important;
          color: #ffd700 !important;
        }
        .sortable-th:hover .fa-sort {
          opacity: 1 !important;
          color: #ffd700 !important;
        }
      `}</style>
    </DndProvider>
  );
};

export default CandidateExamRankList;
