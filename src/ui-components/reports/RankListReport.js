import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import globalVariables from "../../Global.js";
import Multiselect from 'multiselect-react-dropdown';
import DataTable from "react-data-table-component";
import useAuth from '../../utilities/useAuth';
import Breadcum from '../Breadcum';
import { convertDateFormat } from '../../utilities/dateconverter';
import ZoneDropdown from './ZoneList.js';

const RankListReport = () => {
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Rank List Report', Link: '' },
  ]);

  const [academicYears, setAcademicYears] = useState([]);
  const auth = useAuth();
  const userType = auth.user.user_type;
  const dataTableRef = useRef(null);

  const [isDisabled, setIsDisabled] = useState(false);
  const [examlist, setExamList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [subjectlist, setSubjectlist] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/exam_application/getApplications`);
      if (response.data.status) {
        setExamList(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching Applications:', error);
    }
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const form_data = {
        params: {
         exam_title:selectedExamId,
         subject:selectedSubject
        
        }
      };

      const response = await axios.get(`${globalVariables.api_url}/Reports/search_rank_list`, form_data);
      setTableData(response.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/Reports/search_reports_vacancies`, {
        params: {
         
          excel: "excel"
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vacancyreport.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel:', error);
    }
    setExcelLoading(false);
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/Reports/search_reports_ranklist`, {
        params: {
            exam_title:selectedExamId,
            subject:selectedSubject,
          print: "print"
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'RankListreport.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };

const columns = [
    { name: "Sl No.", selector: (row, index) => index + 1, sortable: true, minWidth: '80px' },
    { name: "Candidate Type", selector: (row) => row.candidate_type, sortable: true, minWidth: '150px' },
    {
      name: "Candidate Name",
      selector: (row) => (
        <Link to={`/viewmemberdetails/${row.member_id}`} className="nav-link reports">
          {row.applicant_name}
        </Link>
      ),
      sortable: true,
      minWidth: '200px',
    },
    { name: "Email", selector: (row) => row.email, sortable: true, minWidth: '200px' },
    { name: "Marks", selector: (row) => row.total_mark, sortable: true, minWidth: '100px' },
    { name: "Rank", selector: (row) => row.rank, sortable: true, minWidth: '200px' },
    
  ];
  const handleExamSelect = async (examId) => {
    setSelectedExamId(examId); // Update selected exam ID
    setSelectedSubject(""); // Reset selected subject when exam changes
  
    if (examId) {
      try {
        const response = await axios.get(`${globalVariables.api_url}/exam_application/get_subjects_application_id/${examId}`);
        
        // Check if response contains valid data
        if (response.data && Array.isArray(response.data.data)) {
          setSubjectlist(response.data.data); // Update subject list
        } else {
          console.error("Invalid response format or no data:", response.data);
          setSubjectlist([]); // Clear subject list
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjectlist([]); // Clear subject list on error
      }
    } else {
      setSubjectlist([]); // Clear subject list if no exam selected
    }
  };
  return (
    <>
      <Breadcum items={breadcum} title="Rank List Report" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Rank List Report</h5>
            </div>
            <div className="card-body">
              <form className="row g-3" onSubmit={handleSearchClick}>
                {/* Exam Dropdown */}
                <div className="col-md-6 col-sm-12">
                  <label className="form-label">Exam Title</label>
                  <select
                    id="exam_id"
                    className="form-select"
                    value={selectedExamId}
                    onChange={(e) => handleExamSelect(e.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    {examlist.map((d, index) => (
                      <option key={index} value={d.application_id}>
                        {d.application_title}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Subject Dropdown */}
                {subjectlist.length > 0 && (
                <div className="col-md-6 col-sm-12">
                  <label className="form-label">Subject</label>
                  <select
                    id="subject_id"
                    className="form-select"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    {subjectlist.map((subject, index) => (
                      <option key={index} value={subject.subject_id}>
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
                <div className="form-group">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
              </form>
              <div className="exportpdf col-lg-12 m-2">
                    {tableData.length > 0 && (

                      <>
                   

                        <button onClick={handleGeneratePDF} className="btn btn-success btn-sm mt-10 float-end" disabled={pdfloading}>

                          {pdfloading ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...
                            </>
                          ) : (
                            <>
                              <span className="bi bi-file-pdf" role="status" aria-hidden="true"></span> Export to PDF
                            </>
                          )}

                        </button>


                      </>
                    )}
                  </div>
              <div ref={dataTableRef}>
                {showTable && (
                  <DataTable
                    columns={columns}
                    data={tableData}
                    pagination
                    className="custom-data-table"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RankListReport;
