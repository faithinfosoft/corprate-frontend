import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import globalVariables from "../../Global.js";
import Multiselect from 'multiselect-react-dropdown';
import DataTable from "react-data-table-component";
import useAuth from '../../utilities/useAuth';
import Breadcum from '.././Breadcum';
import { convertDateFormat } from '../../utilities/dateconverter';

const SeniorityReport = () => {
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Staff Seniority Report', Link: '' },
  ]);
  const [errors, setErrors] = useState([]);
  const auth = useAuth();
  const userType = auth.user.user_type;
  const dataTableRef = useRef(null);

  // State variables
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStaffType, setSelectedStaffType] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedClassLevel, setSelectedClassLevel] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [schools, setSchools] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [classlevels, setClasslevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSchools();
    fetchClasslevels();

    // Scroll to DataTable component when data is fetched
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);

  // Fetch designations when staff type or class level changes
  useEffect(() => {
    if (selectedStaffType === 'non_teaching') {
      fetchDesignations('non_teaching');
      setSelectedClassLevel(''); // Reset class level
    } else if (selectedStaffType === 'teaching' && selectedClassLevel) {
      // Convert class level ID to name before passing
      const classLevelName = getClassLevelNameById(selectedClassLevel);
      if (classLevelName) {
        fetchDesignations('teaching', classLevelName);
      }
    } else if (selectedStaffType === 'teaching' && !selectedClassLevel) {
      setDesignations([]); // Clear designations if teaching but no class level selected
      setSelectedDesignation('');
    } else {
      setDesignations([]);
      setSelectedDesignation('');
    }
  }, [selectedStaffType, selectedClassLevel, classlevels]);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/schools`);
      if (response.data.status) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchClasslevels = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/class-strength/get_all_classs_levels`
      );
      if (response.data.status) {
        setClasslevels(response.data.data);
      } else {
        setClasslevels([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error.message);
    }
  };

  const getClassLevelNameById = (id) => {
    const level = classlevels.find(l => l.class_level_id == id);
    return level ? level.class_level_name : null;
  };

const fetchDesignations = async (staffType, classLevelName = null) => {
  try {
    const response = await axios.get(
      `${globalVariables.api_url}/designations/get_designation_category`,
      {
        params: {
          class_level_name: classLevelName || ""
        }
      }
    );

    if (response.data.status) {
      const designationData = response.data.data;
      
      // Convert string array to object array
      let filteredDesignations = [];
      if (Array.isArray(designationData)) {
        if (typeof designationData[0] === 'string') {
          // Convert strings to objects for the dropdown
          filteredDesignations = designationData.map((name, index) => ({
            designation_id: name,
            designation_name: name
          }));
        } else {
          filteredDesignations = designationData;
        }
      }

      setDesignations(filteredDesignations);
    } else {
      setDesignations([]);
    }
  } catch (error) {
    console.error('Error fetching designations:', error);
    setDesignations([]);
  }
};

  const handleSchoolSelect = (selectedSchool) => {
    setSelectedSchool(selectedSchool);
  };

  const handleStaffTypeChange = (e) => {
    const staffType = e.target.value;
    setSelectedStaffType(staffType);
    setSelectedDesignation('');
    setSelectedClassLevel('');
    setDesignations([]);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    fetchData();
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const form_data = {
        params: {
          school_id: selectedSchool,
          gender: selectedGender,
          staff_type: selectedStaffType,
          designation_id: selectedDesignation,
          class_level_id: selectedClassLevel,
          start_date: startDate,
          end_date: endDate,
          status: selectedStatus,
          report_type: selectedReportType,
        }
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_staff_seniority_list', form_data);
      setTableData(response.data.data || []);
      setErrors(response.data.errors || []);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,
      minWidth: '80px'
    },
    {
      name: "School Code",
      selector: (row) => row.school_code,
      sortable: true,
      minWidth: '100px',
    },
    {
      name: "School",
      selector: (row) => `${row.school_name} ,${row.location}`,
      sortable: true,
      minWidth: '280px',
    },
    {
      name: "Staff Name",
      selector: (row) => row.staff_official_name,
      sortable: true,
      minWidth: '250px'
    },
    {
      name: "Age",
      selector: (row) => row.age,
      sortable: true,
      minWidth: '70px'
    },
    {
      name: "Gender",
      selector: (row) => capitalizeWords(row.gender),
      sortable: true,
      minWidth: '80px'
    },
    {
      name: "Date of Commencement",
      selector: (row) => convertDateFormat(row.minimum_designation_startdate),
      sortable: true
    },
    {
      name: "DOJ",
      selector: (row) => convertDateFormat(row.doj),
      sortable: true
    },
    {
      name: "DOB",
      selector: (row) => convertDateFormat(row.dob),
      sortable: true
    },
    {
      name: "Total Service (Years)",
      selector: (row) => row.total_years,
      sortable: true,
      minWidth: '220px'
    },
    {
      name: "Rank",
      selector: (row) => row.rank,
      sortable: true
    },
    {
      name: "Case",
      selector: (row) => row.case_applied,
      sortable: true
    },
  ];

  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {
      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_staff_seniority_list', {
        params: {
          school_id: selectedSchool,
          gender: selectedGender,
          staff_type: selectedStaffType,
          designation_id: selectedDesignation,
          class_level_id: selectedClassLevel,
          start_date: startDate,
          end_date: endDate,
          status: selectedStatus,
          report_type: selectedReportType,
          excel: "excel"
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Staff_Seniority_List.xlsx');
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
      const form_data = {
        params: {
          school_id: selectedSchool,
          gender: selectedGender,
          staff_type: selectedStaffType,
          designation_id: selectedDesignation,
          class_level_id: selectedClassLevel,
          start_date: startDate,
          end_date: endDate,
          status: selectedStatus,
          report_type: selectedReportType,
          print: "print"
        },
        responseType: 'blob'
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_staff_seniority_list', form_data);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Staff_Seniority_List.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };

  return (
    <>
        <Breadcum items={breadcum} title="Staff Seniority Report" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Staff Seniority Report</h5>
            </div>

            <div className="card-body">
                  <div className="row">
                <div className="col-md-12">
              <form onSubmit={handleSearchClick}>
                <div className="row">
                  {userType !== 'zone' && userType !== 'country' && (
                    <div className="col-lg-4 col-md-6 col-12 mb-3">
                      <label className="form-label">School*</label>
                      <select
                        className="form-select"
                        value={selectedSchool}
                        onChange={(e) => handleSchoolSelect(e.target.value)}
                        required
                      >
                        <option value="">Select School</option>
                        {userType !== 'parish' && <option value="all">All</option>}
                        {schools.map((school, index) => (
                          <option key={index} value={school.school_id}>
                            {school.school_name},{school.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <label className="form-label">Staff Type*</label>
                    <select
                      className="form-select"
                      value={selectedStaffType}
                      onChange={handleStaffTypeChange}
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="teaching">Teaching</option>
                      <option value="non_teaching">Non Teaching</option>
                    </select>
                  </div>

                  {selectedStaffType === 'teaching' && (
                    <div className="col-lg-4 col-md-6 col-12 mb-3">
                      <label className="form-label">Class Level*</label>
                      <select
                        className="form-select"
                        value={selectedClassLevel}
                        onChange={(e) => setSelectedClassLevel(e.target.value)}
                        required
                      >
                        <option value="">Select Class Level</option>
                        {classlevels.map((level) => (
                          <option key={level.class_level_id} value={level.class_level_id}>
                            {level.class_level_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {((selectedStaffType === 'non_teaching') ||
                    (selectedStaffType === 'teaching' && selectedClassLevel)) && (
                    <div className="col-lg-4 col-md-6 col-12 mb-3">
                      <label className="form-label">Category*</label>
                      <select
                        className="form-select"
                        value={selectedDesignation}
                        onChange={(e) => setSelectedDesignation(e.target.value)}
                        required
                      >
                        <option value="">Select Category</option>
                      
                        {designations.map((d, index) => (
                          <option key={index} value={d.designation_id}>
                            {d.designation_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <label className="form-label">Date*</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={handleEndDateChange}
                      required
                    />
                  </div>

                  <div className="col-lg-4 col-md-6 col-12 mb-3">
                    <label className="form-label">Report Type*</label>
                    <select
                      className="form-select"
                      value={selectedReportType}
                      onChange={(e) => setSelectedReportType(e.target.value)}
                      required
                    >
                      <option value="">Select Report Type</option>
                      <option value="corporate">Report for Corporate</option>
                      <option value="government">Report for Government</option>
                    </select>
                  </div>

                  <div className="col-12 mb-3">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Searching
                        </>
                      ) : (
                        <>
                          <i className="fa fa-search me-2"></i>
                          Search
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {tableData.length > 0 && (
                <div className="mt-3">
                  <button
                    className="btn btn-success me-2"
                    onClick={handleGenerateExcel}
                    disabled={excelloading}
                  >
                    {excelloading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-file-excel me-2"></i>
                        Export to Excel
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={handleGeneratePDF}
                    disabled={pdfloading}
                  >
                    {pdfloading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Exporting...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-file-pdf me-2"></i>
                        Export to PDF
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {showTable && (
            <div className="card mt-4" ref={dataTableRef}>
              <div className="card-body">
                <DataTable
                  columns={columns}
                  data={tableData}
                  pagination
                  highlightOnHover
                  striped
                  responsive
                />
              </div>
            </div>
          )}

          {showTable && errors.length > 0 && (
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="text-danger">Errors:</h5>
                <ul className="text-danger">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {showTable && (
            <div className="card mt-4">
              <div className="card-body">
                <h5>Case Notes:</h5>
                <ul>
                  <li>Case A: Seniority is calculated from the active designation start date to the end date.</li>
                  <li>Case B: If multiple staff share the same rank in Case A, seniority is recalculated from the date of joining (DOJ) to the end date.</li>
                  <li>Case C: If multiple staff still share the same rank after Case B, seniority is recalculated from the date of birth (DOB) to the end date.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
          </div>
      </div>
    </>
  );
};

export default SeniorityReport;