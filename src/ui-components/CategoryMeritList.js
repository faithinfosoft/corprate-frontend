import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import globalVariables from "../Global.js";
import Breadcum from './Breadcum';
import { convertDateFormat, capitalizeWords } from '../utilities/dateconverter.js';
import NoDataFound from './NoDataFound';
import print_toast from "../utilities/Toaster.js";

const resolveGenderHelper = (candidate) => {
  const type = (candidate?.candidate_type || '').toLowerCase().trim();
  const g = (candidate?.gender || '').toLowerCase().trim();
  if (type.includes('sister')) return 'female';
  if (type.includes('priest')) return 'male';
  return g || '';
};

// Draggable Merit Row Component with visual grip handle and DnD support
const DraggableMeritRow = ({
  row,
  index,
  realIndex,
  moveRow,
  handleToggleSelect,
  handleRemarkChange,
}) => {
  const [{ isDragging }, ref] = useDrag({
    type: 'MERIT_TABLE_ROW',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'MERIT_TABLE_ROW',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveRow(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <tr
      ref={(node) => ref(drop(node))}
      className={`align-middle ${row.selected ? 'table-primary-subtle' : ''}`}
      style={{
        backgroundColor: isDragging ? '#e9ecef' : row.selected ? '#f0f7ff' : '#fff',
        opacity: isDragging ? 0.45 : 1,
        cursor: 'grab',
        transition: 'background-color 0.15s ease',
      }}
    >
      {/* Checkbox */}
      <td className="text-center px-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="form-check-input"
          checked={!!row.selected}
          onChange={() => handleToggleSelect(realIndex)}
          style={{ cursor: 'pointer' }}
        />
      </td>

      {/* Merit Rank with Grip Handle */}
      <td className="text-center fw-bold text-primary fs-6" style={{ whiteSpace: 'nowrap' }}>
        <i
          className="fas fa-grip-vertical text-muted me-2"
          title="Drag to reorder rank"
          style={{ cursor: 'grab' }}
        ></i>
        <span className="badge bg-light text-primary border px-2 py-1 fw-bold">
          #{row.category_rank || index + 1}
        </span>
      </td>

      {/* Marks */}
      <td className="text-center fw-bold text-success fs-6">
        {row.total_mark}
      </td>

      {/* Candidate Type */}
      <td className="text-center">
        <span
          className={`badge rounded-pill px-3 py-2 fw-semibold ${
            (row.candidate_type || '').toLowerCase() === 'priest'
              ? 'bg-purple-subtle text-purple border'
              : (row.candidate_type || '').toLowerCase() === 'sister'
              ? 'bg-pink-subtle text-pink border'
              : 'bg-secondary-subtle text-secondary border'
          }`}
        >
          {capitalizeWords(row.candidate_type || 'Candidate')}
        </span>
      </td>

      {/* Candidate Name */}
      <td className="fw-bold text-dark text-start">
        <a
          href={`/CandidateProfile/${row.encrypted_candidate_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none text-primary hover-underline d-inline-flex align-items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{capitalizeWords(row.applicant_name)}</span>
          <i className="fas fa-external-link-alt text-muted small" style={{ fontSize: '0.7rem' }}></i>
        </a>
        {row.dob && (
          <div className="text-muted small fw-normal">
            DOB: {convertDateFormat(row.dob)}
          </div>
        )}
      </td>

      {/* Gender */}
      <td className="text-center text-muted small">
        {capitalizeWords(resolveGenderHelper(row))}
      </td>

      {/* Email */}
      <td className="text-muted small text-start">
        {row.email}
      </td>

      {/* Editable Remarks */}
      <td onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          className="form-control form-control-sm border bg-white"
          value={row.remarks || ''}
          placeholder="Add remark..."
          onChange={(e) => handleRemarkChange(realIndex, e.target.value)}
        />
      </td>
    </tr>
  );
};

const CategoryMeritList = ({ isEmbedded = false }) => {
  const { application_id } = useParams();

  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Exam Applications', Link: '/exam-application' },
    { Title: 'Merit List', Link: '' },
  ]);

  const [examDetails, setExamDetails] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterQuota, setFilterQuota] = useState('');
  const [topNCount, setTopNCount] = useState(15);
  const [noRecords, setNoRecords] = useState(false);
  const [rawCandidatePool, setRawCandidatePool] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'category_rank', direction: 'asc' });

  // Stats
  const [quotaStats, setQuotaStats] = useState({
    priest: 0,
    sister: 0,
    male: 0,
    female: 0,
    topMark: 0,
    total: 0
  });

  // 1. Initial Load: Exam Details & Subjects
  useEffect(() => {
    setSelectedSubject('');
    setCandidates([]);
    setNoRecords(false);
    fetchExamDetails();
  }, [application_id]); // eslint-disable-line react-hooks/exhaustive-deps

  // When selectedSubject changes, load candidates
  useEffect(() => {
    if (selectedSubject) {
      sessionStorage.setItem(`current_rank_subject_id_${application_id}`, selectedSubject);
      sessionStorage.setItem('current_rank_subject_id', selectedSubject);
      fetchSubjectData(selectedSubject);
    } else {
      setCandidates([]);
      setNoRecords(false);
    }
  }, [selectedSubject]); // eslint-disable-line react-hooks/exhaustive-deps

  // Synchronize candidate selection state when candidates are removed or reverted from Official Rank List
  useEffect(() => {
    const handleCandidateRemoved = (e) => {
      const { subjectId, candidateKey, applicantName } = e.detail || {};
      if (selectedSubject && subjectId && String(subjectId) !== String(selectedSubject)) return;
      setCandidates((prev) =>
        prev.map((c) => {
          const key = String(c.encrypted_candidate_id || c.reg_id || c.fk_canididate_application_subject_id || c.applicant_name);
          const nameMatch = applicantName && c.applicant_name === applicantName;
          if (key === String(candidateKey) || nameMatch) {
            return { ...c, selected: false };
          }
          return c;
        })
      );
    };

    const handleRevertAll = (e) => {
      const { subjectId } = e.detail || {};
      if (selectedSubject && subjectId && String(subjectId) !== String(selectedSubject)) return;
      setCandidates((prev) => prev.map((c) => ({ ...c, selected: false })));
    };

    window.addEventListener('rank-candidate-removed', handleCandidateRemoved);
    window.addEventListener('rank-candidates-reverted', handleRevertAll);
    return () => {
      window.removeEventListener('rank-candidate-removed', handleCandidateRemoved);
      window.removeEventListener('rank-candidates-reverted', handleRevertAll);
    };
  }, [selectedSubject]);

  const fetchExamDetails = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/exam_application/get_Applications_application_id`,
        { params: { application_id } }
      );

      if (response.data?.status && response.data.data?.length > 0) {
        setExamDetails(response.data.data[0]);
      }

      const subjectResponse = await axios.get(
        `${globalVariables.api_url}/exam_application/get_subjects_application_id/${application_id}`
      );

      if (subjectResponse.data?.status && Array.isArray(subjectResponse.data.data)) {
        const subjectList = subjectResponse.data.data.map((subject) => ({
          id: subject.subject_id,
          name: subject.subject_name,
          code: subject.subject_code,
        }));
        setSubjects(subjectList);

        const savedSub = sessionStorage.getItem(`current_rank_subject_id_${application_id}`) || sessionStorage.getItem('current_rank_subject_id');
        const matched = subjectList.find(s => String(s.id) === String(savedSub));

        if (matched) {
          setSelectedSubject(matched.id);
        } else if (subjectList.length > 0) {
          setSelectedSubject(subjectList[0].id);
        } else {
          setSelectedSubject('');
        }
      } else {
        setSubjects([]);
        setSelectedSubject('');
      }
    } catch (error) {
      console.error('Error fetching exam/subject details:', error);
    }
  };

  const resolveGender = (candidate) => {
    const type = (candidate?.candidate_type || '').toLowerCase().trim();
    const g = (candidate?.gender || '').toLowerCase().trim();
    if (type.includes('sister')) return 'female';
    if (type.includes('priest')) return 'male';
    return g || '';
  };

  /**
   * Category-wise Quota Rotation Algorithm:
   * 4-slot repeating cycle:
   * Slot 1: Priest -> Sister -> Top Mark
   * Slot 2: Sister -> Top Mark
   * Slot 3: Male -> Top Mark
   * Slot 4: Female -> Top Mark
   * Cycle repeats until all candidates are placed.
   */
  /**
   * Quota Rotation Cycle Algorithm:
   * 1. Priest with top mark
   * 2. Sister with top mark
   * 3. Male with top mark
   * 4. Female with top mark
   * "then the cycle"
   *
   * Fallback rules:
   * - If Priest is not there: Sister will come ("if priest is not theer siter will come") -> Sister, Male, Female
   * - If Sister is not there: Top Mark parishioner ("and sister is not there top mark parishioner then male,female") -> Top Mark, Male, Female
   * - If neither Priest nor Sister is there: Top Mark parishioner, then Male, Female ("if priest and sister is not teher show top mark then male,female")
   *
   * Repeats cyclically until all candidates in the subject pool are placed.
   */
  const applyCategoryQuotaRanking = (rawList) => {
    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    const isPriest = (c) => (c?.candidate_type || '').toLowerCase().trim().includes('priest');
    const isSister = (c) => (c?.candidate_type || '').toLowerCase().trim().includes('sister');
    const isMale = (c) => (resolveGender(c) || '').toLowerCase().trim() === 'male';
    const isFemale = (c) => (resolveGender(c) || '').toLowerCase().trim() === 'female';
    const isParishioner = (c) => !isPriest(c) && !isSister(c);

    // Clone and parse numerical marks for stable comparison, defaulting priest/sister gender
    const pool = rawList.map((c) => ({
      ...c,
      gender: resolveGender(c),
      numericMark: parseFloat(c.total_mark) || 0,
    }));

    // Primary sort: highest mark first. Secondary tie-breaker: name
    pool.sort((a, b) => {
      if (b.numericMark !== a.numericMark) {
        return b.numericMark - a.numericMark;
      }
      return (a.applicant_name || '').localeCompare(b.applicant_name || '');
    });

    const ranked = [];
    const stats = {
      priest: 0,
      sister: 0,
      male: 0,
      female: 0,
      topMark: 0,
      total: pool.length
    };

    const pickCandidate = (idx, label, key) => {
      if (idx === -1 || idx >= pool.length) idx = 0;
      const [candidate] = pool.splice(idx, 1);
      stats[key] = (stats[key] || 0) + 1;
      ranked.push({
        ...candidate,
        category_rank: ranked.length + 1,
        quota_applied: label,
        quota_key: key,
        remarks: candidate.remarks || '',
        selected: ranked.length < 15,
      });
    };

    while (pool.length > 0) {
      // Slot 1: Clergy / Religious slot
      const priestIdx = pool.findIndex(isPriest);
      if (priestIdx !== -1) {
        pickCandidate(priestIdx, 'Priest Quota', 'priest');

        // Slot 2: Sister slot (when Priest was present in slot 1)
        if (pool.length > 0) {
          const sisterIdx = pool.findIndex(isSister);
          if (sisterIdx !== -1) {
            pickCandidate(sisterIdx, 'Sister Quota', 'sister');
          } else {
            // Sister not there -> Top Mark parishioner
            let topIdx = pool.findIndex(isParishioner);
            if (topIdx === -1) topIdx = 0;
            pickCandidate(topIdx, 'Top Mark', 'topMark');
          }
        }
      } else {
        // Priest is NOT there:
        // "if priest is not theer siter will come"
        const sisterIdx = pool.findIndex(isSister);
        if (sisterIdx !== -1) {
          // Sister comes in place of priest
          pickCandidate(sisterIdx, 'Sister Quota', 'sister');
        } else {
          // "and sister is not there top mark parishioner then male,female"
          // "if priest and sister is not teher show top mark then male,female"
          let topIdx = pool.findIndex(isParishioner);
          if (topIdx === -1) topIdx = 0;
          pickCandidate(topIdx, 'Top Mark', 'topMark');
        }
      }

      // Slot 3: Male slot
      if (pool.length > 0) {
        const maleIdx = pool.findIndex(isMale);
        if (maleIdx !== -1) {
          pickCandidate(maleIdx, 'Male Quota', 'male');
        } else {
          pickCandidate(0, 'Top Mark', 'topMark');
        }
      }

      // Slot 4: Female slot
      if (pool.length > 0) {
        const femaleIdx = pool.findIndex(isFemale);
        if (femaleIdx !== -1) {
          pickCandidate(femaleIdx, 'Female Quota', 'female');
        } else {
          pickCandidate(0, 'Top Mark', 'topMark');
        }
      }
    }

    setQuotaStats(stats);
    return ranked;
  };

  const fetchSubjectData = async (subjectId) => {
    if (!subjectId) return;

    setLoading(true);
    setNoRecords(false);

    try {
      const response = await axios.get(
        `${globalVariables.api_url}/candidatemarklist/get_candiadate_exam_marks_subject`,
        { params: { subject_id: subjectId } }
      );

      const responseData = response.data;
      const candidateData = responseData?.data || [];

      if (responseData?.status && Array.isArray(candidateData) && candidateData.length > 0) {
        setRawCandidatePool(candidateData);
        let processed = applyCategoryQuotaRanking(candidateData);
        setSortConfig({ key: 'category_rank', direction: 'asc' });
        const savedTransferred = sessionStorage.getItem(`transferred_rank_${subjectId}`);
        if (savedTransferred) {
          try {
            const parsed = JSON.parse(savedTransferred);
            if (Array.isArray(parsed)) {
              const transferredKeys = new Set(
                parsed.map((c) => String(c.encrypted_candidate_id || c.reg_id || c.fk_canididate_application_subject_id || c.applicant_name))
              );
              processed = processed.map((c) => {
                const key = String(c.encrypted_candidate_id || c.reg_id || c.fk_canididate_application_subject_id || c.applicant_name);
                return {
                  ...c,
                  selected: transferredKeys.has(key),
                };
              });
            }
          } catch (e) {
            console.error('Error reading transferred rank cache:', e);
          }
        }
        setCandidates(processed);
        setNoRecords(false);
      } else {
        setRawCandidatePool([]);
        setCandidates([]);
        setNoRecords(true);
      }
    } catch (error) {
      console.error('Failed to fetch candidate marks for subject:', error);
      setRawCandidatePool([]);
      setCandidates([]);
      setNoRecords(true);
      print_toast('error', 'Failed to load candidates for selected subject');
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const handleToggleSelect = (index) => {
    setCandidates((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selected: !updated[index].selected };
      return updated;
    });
  };

  const handleSelectAll = (select) => {
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: select })));
  };

  const handleSelectTopN = (n) => {
    const count = parseInt(n, 10);
    if (isNaN(count) || count < 0) return;
    setCandidates((prev) =>
      prev.map((c, idx) => ({ ...c, selected: idx < count }))
    );
  };

  const handleRemarkChange = (index, value) => {
    setCandidates((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], remarks: value };
      return updated;
    });
  };

  // Reset to original category quota rotation order
  const handleResetQuotaOrder = () => {
    if (!rawCandidatePool || rawCandidatePool.length === 0) return;
    const processed = applyCategoryQuotaRanking(rawCandidatePool);
    setCandidates(processed);
    setSortConfig({ key: 'category_rank', direction: 'asc' });
    print_toast('success', 'Reset candidate order to default category quota rotation');
  };

  // Drag and Drop move row handler
  const moveRow = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const sourceItem = filteredCandidates[fromIndex];
    const targetItem = filteredCandidates[toIndex];
    if (!sourceItem || !targetItem) return;

    setCandidates((prev) => {
      const updated = [...prev];
      const actualFrom = updated.indexOf(sourceItem);
      const actualTo = updated.indexOf(targetItem);

      if (actualFrom === -1 || actualTo === -1) return prev;

      const [moved] = updated.splice(actualFrom, 1);
      updated.splice(actualTo, 0, moved);

      // Live update of category_rank to reflect new drag order
      return updated.map((item, idx) => ({
        ...item,
        category_rank: idx + 1,
      }));
    });

    setSortConfig({ key: 'manual', direction: 'asc' });
  };

  // Column header sorting handler
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key !== key && key === 'total_mark') {
      // Numerical marks default to highest first
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    setCandidates((prev) => {
      const sorted = [...prev].sort((a, b) => {
        let valA, valB;
        if (key === 'category_rank') {
          valA = Number(a.category_rank) || 0;
          valB = Number(b.category_rank) || 0;
        } else if (key === 'total_mark') {
          valA = Number(a.total_mark) || 0;
          valB = Number(b.total_mark) || 0;
        } else if (key === 'gender') {
          valA = resolveGender(a).toLowerCase();
          valB = resolveGender(b).toLowerCase();
        } else {
          valA = (a[key] || '').toString().toLowerCase();
          valB = (b[key] || '').toString().toLowerCase();
        }

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
      });

      // Update ranks based on sorted order
      return sorted.map((item, idx) => ({
        ...item,
        category_rank: idx + 1,
      }));
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

  // Filtered list based on search and quota filters
  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(c.category_rank).includes(searchTerm) ||
      String(c.total_mark).includes(searchTerm);

    const matchesQuota = filterQuota === '' || c.quota_key === filterQuota;

    return matchesSearch && matchesQuota;
  });

  const selectedCandidates = candidates.filter((c) => c.selected);
  const selectedCount = selectedCandidates.length;

  /**
   * Transfer Selected Candidates to Official Rank List:
   * 1. Re-index ranks 1..N
   * 2. Save in sessionStorage under `transferred_rank_${selectedSubject}`
   * 3. Save `current_rank_subject_id`
   * 4. Dispatch event `rank-candidates-transferred`
   * 5. Switch hash to `#rank` (Official Rank List)
   */
  const handleTransferToOfficialRank = () => {
    if (selectedCount === 0) {
      print_toast('warning', 'Please select at least one candidate to transfer.');
      return;
    }

    // Re-index ranks strictly 1 to selectedCount according to merit rotation sequence
    const payload = selectedCandidates.map((c, idx) => ({
      ...c,
      id: idx.toString(),
      rank: idx + 1,
      gender: resolveGender(c),
      remarks: c.remarks || '',
    }));

    // Save in sessionStorage so CandidateExamRankList can pick it up immediately
    sessionStorage.setItem(`transferred_rank_${selectedSubject}`, JSON.stringify(payload));
    sessionStorage.setItem('current_rank_subject_id', selectedSubject);

    // Notify listeners
    window.dispatchEvent(
      new CustomEvent('rank-candidates-transferred', {
        detail: { subjectId: selectedSubject, candidates: payload },
      })
    );

    print_toast(
      'success',
      `Transferred ${selectedCount} candidates to Official Rank List!`
    );

    // Switch to Official Rank List tab
    window.location.hash = 'rank';
  };

  // Export to CSV / printable summary
  const handleExportCSV = () => {
    if (candidates.length === 0) {
      print_toast('warning', 'No candidates to export');
      return;
    }

    const headers = ['Merit Rank', 'Marks', 'Applicant Name', 'Candidate Type', 'Gender', 'Email', 'Remarks', 'Selected For Rank List'];
    const rows = candidates.map((c) => [
      c.category_rank,
      c.total_mark,
      `"${c.applicant_name?.replace(/"/g, '""') || ''}"`,
      c.candidate_type || '',
      capitalizeWords(resolveGender(c)),
      c.email || '',
      `"${(c.remarks || '').replace(/"/g, '""')}"`,
      c.selected ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const subName = subjects.find(s => String(s.id) === String(selectedSubject))?.name || selectedSubject;
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Category_Merit_List_${subName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="category-merit-list-container">
      {!isEmbedded && <Breadcum items={breadcum} title="Merit List" />}

      <div className={`card ${isEmbedded ? 'border-0 shadow-none' : 'shadow-sm'} mb-4`}>
        <div className="card-body p-4">
          
          {/* Subject Filter Bar */}
          <div className="row g-3 mb-4 align-items-end">
            <div className="col-lg-5 col-md-6">
              <label className="fw-bold small text-muted text-uppercase mb-2 ms-1">
                <i className="fas fa-book-reader me-2 text-primary"></i>Select Exam Subject
              </label>
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-book text-primary"></i>
                </span>
                <select
                  className="form-select border-start-0 ps-0 fw-bold"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Choose a subject to compute merit quota</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code ? `${subject.code} - ` : ''}
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {candidates.length > 0 && (
              <>
                <div className="col-lg-5 col-md-6">
                  <label className="fw-bold small text-muted text-uppercase mb-2 ms-1">
                    <i className="fas fa-search me-2 text-muted"></i>Search Candidate
                  </label>
                  <div className="input-group shadow-sm">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Search by name, email, rank, marks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        className="btn btn-outline-secondary border-start-0"
                        type="button"
                        onClick={() => setSearchTerm('')}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>

                <div className="col-lg-2 col-md-12 text-md-end">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="btn btn-outline-success fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 w-100 py-2"
                    disabled={candidates.length === 0}
                  >
                    <i className="fas fa-file-csv fs-6"></i>
                    <span>Export CSV</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-muted fw-medium">Calculating category-wise merit rotation...</p>
            </div>
          )}

          {/* No Records Indicator */}
          {!loading && noRecords && (
            <div className="py-5">
              <NoDataFound message="No candidate marks found for the selected subject." />
            </div>
          )}

          {/* Prompt when subject not yet selected */}
          {!loading && !selectedSubject && (
            <div className="text-center py-5 bg-light rounded-3 border">
              <i className="fas fa-arrow-up fa-2x text-muted mb-3 d-block"></i>
              <h6 className="fw-bold text-dark">Please select a subject above</h6>
              <p className="text-muted small mb-0">The category-wise merit list will be calculated automatically.</p>
            </div>
          )}

          {/* Main Candidate Table & Selection Bar */}
          {!loading && candidates.length > 0 && (
            <>
              {/* Category Breakdown Badges */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <span className="small fw-bold text-muted text-uppercase me-2">Rotation Distribution:</span>
                  <span className="badge bg-purple-subtle text-purple border px-3 py-1 fw-bold">
                    Priests: {quotaStats.priest}
                  </span>
                  <span className="badge bg-pink-subtle text-pink border px-3 py-1 fw-bold">
                    Sisters: {quotaStats.sister}
                  </span>
                  <span className="badge bg-primary-subtle text-primary border px-3 py-1 fw-bold">
                    Males: {quotaStats.male}
                  </span>
                  <span className="badge bg-info-subtle text-info border px-3 py-1 fw-bold">
                    Females: {quotaStats.female}
                  </span>
                </div>

                <div className="fw-bold text-dark small">
                  Total Candidates: <span className="text-primary">{candidates.length}</span>
                </div>
              </div>

              {/* Selection Control Panel & Transfer Action */}
              <div className="card border-primary border-opacity-25 bg-primary-subtle bg-opacity-10 shadow-sm mb-4">
                <div className="card-body p-3">
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    
                    {/* Quick Selection Buttons */}
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <span className="fw-bold text-dark small me-1">
                        <i className="fas fa-check-double text-primary me-1"></i> Quick Select:
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm fw-bold px-3 py-1"
                        onClick={() => handleSelectTopN(5)}
                      >
                        Top 5
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm fw-bold px-3 py-1"
                        onClick={() => handleSelectTopN(10)}
                      >
                        Top 10
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm fw-bold px-3 py-1"
                        onClick={() => handleSelectTopN(15)}
                      >
                        Top 15
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm fw-bold px-3 py-1"
                        onClick={() => handleSelectTopN(20)}
                      >
                        Top 20
                      </button>

                      {/* Custom Top N input */}
                      <div className="input-group input-group-sm" style={{ width: '150px' }}>
                        <span className="input-group-text bg-white text-muted">Top</span>
                        <input
                          type="number"
                          className="form-control text-center fw-bold"
                          min="1"
                          max={candidates.length}
                          value={topNCount}
                          onChange={(e) => setTopNCount(e.target.value)}
                        />
                        <button
                          className="btn btn-outline-primary fw-bold"
                          type="button"
                          onClick={() => handleSelectTopN(topNCount)}
                        >
                          Set
                        </button>
                      </div>

                      <div className="vr mx-1 text-muted opacity-25"></div>

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm px-2 py-1"
                        onClick={() => handleSelectAll(true)}
                      >
                        All ({candidates.length})
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm px-2 py-1"
                        onClick={() => handleSelectAll(false)}
                      >
                        Clear
                      </button>

                      <div className="vr mx-1 text-muted opacity-25"></div>

                      <button
                        type="button"
                        className="btn btn-outline-info btn-sm px-2 py-1 fw-medium"
                        onClick={handleResetQuotaOrder}
                        title="Restore initial rotation quota ordering"
                      >
                        <i className="fas fa-undo-alt me-1"></i> Reset Quota Order
                      </button>
                    </div>

                    {/* Transfer Button */}
                    <div className="d-flex align-items-center gap-3 ms-auto">
                      <div className="text-end">
                        <div className="fw-bold text-dark">
                          <span className="text-primary fs-5">{selectedCount}</span> / {candidates.length} Selected
                        </div>
                        <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                          Ready to transfer to Official Rank List
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={handleTransferToOfficialRank}
                        className="btn btn-success fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2 transfer-btn"
                        disabled={selectedCount === 0}
                      >
                        <i className="fas fa-share-square fs-6"></i>
                        <span>Transfer to Official Rank List</span>
                        <span className="badge bg-white text-success rounded-pill px-2">{selectedCount}</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Sorting & Drag-and-drop Guidance Bar */}
              <div className="d-flex align-items-center justify-content-between mb-2 px-1 flex-wrap gap-2">
                <div className="small text-muted d-flex align-items-center gap-1">
                  <i className="fas fa-grip-vertical text-secondary me-1"></i>
                  <span><strong>Tip:</strong> Drag rows to reorder ranks manually, or click any column header to sort.</span>
                </div>
                {sortConfig.key && (
                  <div className="small text-muted">
                    Ordering:{' '}
                    <span className="badge bg-light text-dark border fw-semibold">
                      {sortConfig.key === 'manual' ? (
                        <>
                          <i className="fas fa-hand-rock text-primary me-1"></i>Manual (Drag & Drop)
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sort-amount-down text-primary me-1"></i>
                          {capitalizeWords(sortConfig.key.replace('_', ' '))} ({sortConfig.direction.toUpperCase()})
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Table of Candidates */}
              <div className="table-responsive rounded-3 shadow-sm overflow-hidden border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-dark text-white text-center">
                    <tr>
                      <th style={{ width: '45px' }} className="py-3 px-3">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={candidates.length > 0 && candidates.every((c) => c.selected)}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          title="Select / Deselect All"
                        />
                      </th>
                      <th
                        className="py-3 px-2 sortable-th"
                        style={{ width: '105px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('category_rank')}
                        title="Click to sort by Rank"
                      >
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <span>Rank</span>
                          {renderSortIcon('category_rank')}
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 sortable-th"
                        style={{ width: '95px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('total_mark')}
                        title="Click to sort by Marks"
                      >
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <span>Marks</span>
                          {renderSortIcon('total_mark')}
                        </div>
                      </th>
                      <th
                        className="py-3 px-3 sortable-th"
                        style={{ width: '150px', cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('candidate_type')}
                        title="Click to sort by Candidate Type"
                      >
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          <span>Candidate Type</span>
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
                        className="py-3 px-3 text-start sortable-th"
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => handleSort('email')}
                        title="Click to sort by Email"
                      >
                        <div className="d-flex align-items-center gap-1">
                          <span>Email</span>
                          {renderSortIcon('email')}
                        </div>
                      </th>
                      <th className="py-3 px-3 text-start" style={{ minWidth: '220px' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((row, index) => {
                      const realIndex = candidates.findIndex((c) => c === row);
                      return (
                        <DraggableMeritRow
                          key={row.encrypted_candidate_id || row.id || index}
                          row={row}
                          index={index}
                          realIndex={realIndex}
                          moveRow={moveRow}
                          handleToggleSelect={handleToggleSelect}
                          handleRemarkChange={handleRemarkChange}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Transfer Bar */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mt-4 p-3 bg-light rounded-3 border">
                <div className="text-muted small">
                  Showing <strong>{filteredCandidates.length}</strong> of <strong>{candidates.length}</strong> candidates.
                  <span className="ms-2 fw-bold text-dark">
                    ({selectedCount} selected for Official Rank List)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTransferToOfficialRank}
                  className="btn btn-success fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2 transfer-btn"
                  disabled={selectedCount === 0}
                >
                  <i className="fas fa-share-square"></i>
                  <span>Transfer {selectedCount} Selected to Official Rank List</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      <style jsx>{`
        .quota-info-banner {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          border-left: 5px solid #ffd700;
        }
        .text-gold {
          color: #ffd700 !important;
        }
        .text-pink-light {
          color: #f48fb1 !important;
        }
        .bg-purple-subtle {
          background-color: #f3e8ff !important;
        }
        .text-purple {
          color: #6b21a8 !important;
        }
        .border-purple-subtle {
          border-color: #d8b4fe !important;
        }
        .bg-pink-subtle {
          background-color: #fce7f3 !important;
        }
        .text-pink {
          color: #be185d !important;
        }
        .border-pink-subtle {
          border-color: #fbcfe8 !important;
        }
        .transfer-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3) !important;
        }
        .hover-underline:hover {
          text-decoration: underline !important;
        }
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
    </div>
    </DndProvider>
  );
};

export default CategoryMeritList;
