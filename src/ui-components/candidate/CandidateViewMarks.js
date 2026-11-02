import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import globalVariables from "../../Global.js";
import Breadcum from '../Breadcum';
import print_toast from "../../utilities/Toaster.js";
import './CandidateViewMarks.css';

const CandidateViewMarks = () => {
  const { canididate_application_subject_id: encrypted_id } = useParams();
  
  // Decrypt ID (Base64)
  let canididate_application_subject_id;
  try {
    canididate_application_subject_id = atob(encrypted_id);
  } catch (e) {
    canididate_application_subject_id = encrypted_id; // Fallback if not encrypted
  }

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [markData, setMarkData] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [breadcum, setBreadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "Exam Notifications", Link: "/CandidateExamNotifications" },
    { Title: "Results", Link: "" },
  ]);

  useEffect(() => {
    fetchResults();
  }, [canididate_application_subject_id]);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const catResponse = await axios.get(`${globalVariables.api_url}/markcategory/get_all_categories`);
      if (catResponse.data.status) {
        setCategoryList(catResponse.data.data);
      }

      const response = await axios.get(
        `${globalVariables.api_url}/candidatemarklist/get_candidate_marks/${canididate_application_subject_id}`
      );

      if (response.data.status) {
        setMarkData(response.data.data);
      } else {
        print_toast("error", "Results not found");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      print_toast("error", "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const candidateInfo = markData?.candidateInfo;
  const enteredMarks = markData?.enteredMarks || [];
  const overallMarks = markData?.overallMarks || [];

  const formatNum = (num) => {
    if (num === null || num === undefined) return '0';
    return parseFloat(num).toString();
  };

  const getSubMark = (catId) => {
    const mark = enteredMarks.find(m => Number(m.fk_mark_category_id) === Number(catId));
    if (!mark) return null;
    return {
      obtained: formatNum(mark.given_mark || 0),
      max: formatNum(mark.maximum_mark || 0),
      remarks: mark.remarks || ''
    };
  };

  const getOverallMark = (catId) => {
    const mark = overallMarks.find(m => Number(m.fk_mark_category_id) === Number(catId));
    if (!mark) return null;
    return {
      obtained: formatNum(mark.obtained_mark || 0),
      max: formatNum(mark.maximum_mark || 0)
    };
  };

  const renderRows = (categories, depth = 0) => {
    return categories.map((cat) => {
      const subMark = getSubMark(cat.mark_category_id);
      const overallMark = getOverallMark(cat.mark_category_id);
      const isHeader = cat.subcategories && cat.subcategories.length > 0;

      let displayObtained = '0';
      let displayMax = formatNum(cat.total_mark || 0);
      let remarks = '';

      if (subMark) {
        displayObtained = subMark.obtained;
        displayMax = subMark.max;
        remarks = subMark.remarks;
      } else if (overallMark) {
        displayObtained = overallMark.obtained;
        displayMax = overallMark.max;
      }

      const percentage = displayMax > 0 ? (parseFloat(displayObtained) / parseFloat(displayMax)) * 100 : 0;

      return (
        <React.Fragment key={cat.mark_category_id}>
          <tr className={`result-row ${depth === 0 ? 'parent-row' : ''}`}>
            <td className="py-3" style={{ paddingLeft: `${depth * 40 + 20}px` }}>
              <div className="d-flex align-items-start">
                {depth === 0 ? (
                  <span className="parent-arrow">▼</span>
                ) : (
                  <span className="subcategory-bullet">•</span>
                )}
                <span className="category-title" dangerouslySetInnerHTML={{ __html: cat.category_title }}></span>
              </div>
            </td>

            <td className="text-center py-3">
              {depth > 0 && (
                <div className="marks-badge-premium">
                  <span className="obtained-val-sub">{displayObtained}</span>
                </div>
              )}
            </td>
            <td className="py-3">
              {remarks && (
                <div className="remarks-pill">
                  {remarks}
                </div>
              )}
            </td>
          </tr>
          {cat.subcategories && renderRows(cat.subcategories, depth + 1)}
        </React.Fragment>
      );
    });
  };

  const topLevelCategories = categoryList.filter(cat => !cat.fk_parent_id || Number(cat.fk_parent_id) === 0).slice(0, 1);

  return (
    <div className="container-fluid py-4 report-container">
      <div className="container">
        <Breadcum items={breadcum} title="Assessment Report" />
        
        <div className="premium-card">
          {/* Enhanced Header (Compact) */}
          <div className="premium-header p-4 text-white">
            <div className="row align-items-center g-3">
              <div className="col-auto">
                <div className="profile-img-wrapper overflow-hidden">
                  <img 
                    src={candidateInfo?.photo_url || 'https://via.placeholder.com/90'} 
                    alt="Profile" 
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
              </div>
              <div className="col">
                <h1 className="candidate-name mb-2 text-uppercase">
                  {candidateInfo?.applicant_name || 'Candidate Name'}
                </h1>
                <div className="d-flex flex-wrap gap-3">
                  <div className="header-chip">
                    <i className="bi bi-person-vcard text-warning"></i>
                    <span>REG: {candidateInfo?.registration_number}</span>
                  </div>
                  <div className="header-chip">
                    <i className="bi bi-mortarboard text-warning"></i>
                    <span>{candidateInfo?.subject_name}</span>
                  </div>
                  <div className="header-chip">
                    <i className="bi bi-tag text-warning"></i>
                    <span>{candidateInfo?.candidate_type}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table align-middle mb-0 results-table">
                <thead>
                  <tr>
                    <th className="ps-5" style={{ width: '50%' }}>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-list-task"></i>
                        ഇനം (CATEGORY)
                      </div>
                    </th>

                    <th className="text-center">
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <i className="bi bi-pencil-square"></i>
                        OBTAINED MARKS
                      </div>
                    </th>
                    <th>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-chat-dots"></i>
                        REMARKS
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {renderRows(topLevelCategories)}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default CandidateViewMarks;


