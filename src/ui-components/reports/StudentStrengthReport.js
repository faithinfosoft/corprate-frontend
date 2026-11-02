import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ZoneDropdown from './ZoneList.js';
import axios from 'axios';
import globalVariables from "../../Global.js";
import DataTable from "react-data-table-component";
import useAuth from '../../utilities/useAuth';
import Breadcum from '../Breadcum';
import { Spinner } from 'react-bootstrap';

const StudentStrengthReport = () => {
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Student Strength Report', Link: '' },
  ]);
  const [classlevels, setClasslevels] = useState([]);
  const auth = useAuth();
  const userType = auth.user.user_type;
  const userId = auth.user.user_id;
  
  const [selectedClassLevels, setSelectedClassLevels] = useState([]);
  const dataTableRef = useRef(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [gender, setGender] = useState("");
  const [classlevel, setClasslevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedZones, setSelectedZones] = useState([]);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedForane, setSelectedForane] = useState('');
  const [selectedParish, setSelectedParish] = useState('');
  const [selectedConvent, setSelectedConvent] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [EducationDept, setSelectedEducationDept] = useState("");
  const [schoolList, setSchoolList] = useState([]);
  const [secondaryOptions, setSecondaryOptions] = useState([]);
  const [deoOptions, setDeoOptions] = useState([]);
  const [aeoOptions, setAeoOptions] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [filteredSchoolList, setFilteredSchoolList] = useState([]);
  const [secondaryDropdown, setSecondaryDropdown] = useState("");
  const [ddeDropdown, setDdeDropdown] = useState(""); 
  const [deoDropdown, setDeoDropdown] = useState(""); 
  const [aeoDropdown, setAeoDropdown] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);

// Add this handler to track page changes
const handlePageChange = page => {
  setCurrentPage(page);
};

// Add this handler to track rows per page changes
const handlePerRowsChange = (newRowsPerPage, page) => {
  setRowsPerPage(newRowsPerPage);
};
  useEffect(() => {
    // Scroll to DataTable component when data is fetched
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);

  // Fetch academic years on component mount
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  // Reset dropdowns when EducationDept changes
  useEffect(() => {
    setDdeDropdown("");
    setDeoDropdown("");
    setAeoDropdown("");
    setDeoOptions([]);
    setAeoOptions([]);
    setSecondaryDropdown("");
  }, [EducationDept]);

  // Fetch schools when zone changes
  useEffect(() => {

    if (selectedZone !== undefined) {
      fetchSchools(selectedZone);
    }
  }, [selectedZone, userType]);

  const handleSchoolSelect = (selectedSchool) => {
    setSelectedSchool(selectedSchool);
  };

  const handleZoneSelect = (zoneId) => {
    setSelectedZone(zoneId);
    setSelectedDistrict('');
    setSelectedSchool('');
    
    // Fetch schools based on the selected zone
    //fetchSchools(zoneId);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setSelectedSchool('');
    
    // Filter schools based on the selected district
    if (district === 'All' || district === '') {
      // If "All" is selected, show all schools for the current zone
      setFilteredSchoolList(schoolList);
    } else {
      // Filter schools in the current zone by the selected district
      const filteredSchools = schoolList.filter(school => school.district === district);
      setFilteredSchoolList(filteredSchools);
    }
  };

  const capitalizeWords = (str) => {
    return str.toUpperCase();
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!selectedZone && userType !== 'school_admin') {
        setTableData([]);
        setShowTable(false);
        return;
      }

      if (userType === 'school_admin' && selectedSchool=='') {
        setErrorMessage('Please select School.');
        setLoading(false);
        
        return;
      }

      
      const form_data = {
        params: {
          zoneid: selectedZone,
          district: selectedDistrict,
          academic_year_id: selectedYear,
          school: selectedSchool,
          EducationDept: EducationDept,
        }
      };

      if (EducationDept === "rdd") {
        form_data.params.rdd_id = secondaryDropdown; // Assuming `selectedRdd` holds the selected RDD value
      } else if (EducationDept === "deo") {
        form_data.params.deo_id = deoDropdown; // Assuming `deoDropdown` holds the selected DEO value
      } else if (EducationDept === "aeo") {
        form_data.params.aeo_id = aeoDropdown; // Assuming `aeoDropdown` holds the selected AEO value
      } else if (EducationDept === "dde") {
        form_data.params.dde_id = secondaryDropdown; // Assuming `ddeDropdown` holds the selected DDE value
      }
      
      const response = await axios.get(globalVariables.api_url + '/Reports/search_student_strength', form_data);
      setTableData(response.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
     // setErrorMessage('Failed to fetch data. Please try again.');
    }
    setLoading(false);
    setErrorMessage('');
  };

  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      minWidth: '80px'
    },
    { name: "Zone", selector: (row) => row.zone_name, sortable: true, minWidth: '160px' },
    { name: "District", selector: (row) => row.district, sortable: true, minWidth: '180px' },
    { name: "School Code", selector: (row) => row.school_code, sortable: true, minWidth: '160px' },
  
    {
      name: "School Name",
      selector: (row) => (
        <a 
          href={`/schooldetails/${row.encrypted_school_id}`} 
          className="nav-link reports" 
          style={{ color: 'blue', textDecoration: 'none' }} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {row.location} {row.school_name}
        </a>
      ),
      sortable: true,
      minWidth: '340px'
    },

    {
      name: "Edu. Department",
      selector: (row) => capitalizeWords(row.dept_type),
      sortable: true,
      minWidth: '180px',
    },
    {
      name: "Edu. Office",
      selector: (row) => row.dept_name,
      sortable: true,
      minWidth: '170px',
    },
    // {
    //   name: "Class Levels",
    //   selector: (row) => row.class_level_name,
    //   sortable: true,
    //   minWidth: '150px',
    // },
    {
      name: "Total Students",
      selector: (row) => row.total_students,
      sortable: true,
      minWidth: '150px',
    },
    {
      name: "Total Boys",
      selector: (row) => row.total_boys,
      sortable: true,
      minWidth: '150px',
    },
    {
      name: "Total Girls",
      selector: (row) => row.total_girls,
      sortable: true,
      minWidth: '150px',
    },
    {
      name: "Total CS",
      selector: (row) => row.total_cs,
      sortable: true,
      minWidth: '150px',
    },
    {
      name: "Total NCS",
      selector: (row) => row.total_ncs,
      sortable: true,
      minWidth: '150px',
    },
  ];


 

  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {
      const form_data = {
        params: {
          zoneid: selectedZone,
          district: selectedDistrict,
          academic_year_id: selectedYear,
          school: selectedSchool,
          EducationDept: EducationDept,
          excel: "excel"
        }
      };
  
      // Add the department-specific ID based on the selected EducationDept
      if (EducationDept === "rdd") {
        form_data.params.rdd_id = secondaryDropdown;
      } else if (EducationDept === "deo") {
        form_data.params.deo_id = deoDropdown;
      } else if (EducationDept === "aeo") {
        form_data.params.aeo_id = aeoDropdown;
      } else if (EducationDept === "dde") {
        form_data.params.dde_id = secondaryDropdown;
      }
  
      // Send the request with updated form_data
      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_student_strength', {
        ...form_data,
        responseType: 'blob'
      });
  
      // Create a new Blob object using the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create a URL for the Blob object
      const url = window.URL.createObjectURL(blob);

      // Create a link element and trigger a download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'School_Student_Strength_List.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel:', error);
      setErrorMessage('Failed to generate Excel report. Please try again.');
    }
    setExcelLoading(false);
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const form_data = {
        params: {
          zoneid: selectedZone,
          district: selectedDistrict,
          academic_year_id: selectedYear,
          school: selectedSchool,
          EducationDept: EducationDept,
          print: "print"
        },
        responseType: 'blob'
      };

      if (EducationDept === "rdd") {
        form_data.params.rdd_id = secondaryDropdown;
      } else if (EducationDept === "deo") {
        form_data.params.deo_id = deoDropdown;
      } else if (EducationDept === "aeo") {
        form_data.params.aeo_id = aeoDropdown;
      } else if (EducationDept === "dde") {
        form_data.params.dde_id = secondaryDropdown;
      }

      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_student_strength', form_data);

      // Handle the response, for example, trigger a file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'School_Student_Strength_List.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrorMessage('Failed to generate PDF report. Please try again.');
    }
    setPdfLoading(false);
  };

  const handleChangeedu = (e) => {
    setSecondaryDropdown(e.target.value); // Update state when dropdown changes
  };

  const handleDepartmentChange = async (e) => {
    const selectedDept = e.target.value; // Get selected value
    setSelectedEducationDept(selectedDept); // Update state

    if (!selectedDistrict && selectedDept !== "" && selectedDept !== "All") {
        alert("Please select the district first.");
        setSelectedEducationDept("");
        return; // Stop execution if district is not selected
    }

    // Reset the dropdowns when department changes
    setSecondaryOptions([]);
    setDeoOptions([]);

    try {
        let response1 = null;
        let response2 = null;

        if (selectedDept === "rdd" || selectedDept === "dde") {
            response1 = await axios.get(`${globalVariables.api_url}/education-department/get_department_district`, {
                params: { dept_type: selectedDept, district: selectedDistrict }
            });
        } else if (selectedDept === "deo") {
            response1 = await axios.get(`${globalVariables.api_url}/education-department/get_department_district`, {
                params: { dept_type: "dde", district: selectedDistrict }
            });

            response2 = await axios.get(`${globalVariables.api_url}/education-department/get_department_district`, {
                params: { dept_type: "deo", district: selectedDistrict }
            });
        } else if (selectedDept === "aeo") {
            response1 = await axios.get(`${globalVariables.api_url}/education-department/get_department_district`, {
                params: { dept_type: "dde", district: selectedDistrict }
            });
        }

        const data1 = response1?.data?.data || [];
        const data2 = response2?.data?.data || [];

        setSecondaryOptions(data1);
        setDeoOptions(data2);
    } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage('Failed to fetch department data. Please try again.');
    }
  };

  const handleChangedeo = async (e) => {
    const { name, value } = e.target;

    if (name === "ddeDropdown") {
      setDdeDropdown(value);
      setDeoDropdown(""); // Reset DEO when DDE changes
      setAeoDropdown(""); // Reset AEO when DDE changes
      setDeoOptions([]);
      setAeoOptions([]);

      if (!value) return;

      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_dde`,
          { params: { dept_type: "deo", dde_id: value } }
        );
        setDeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching DEO options:", error);
        setDeoOptions([]);
        setErrorMessage('Failed to fetch DEO options. Please try again.');
      }
    }

    if (name === "deoDropdown") {
      setDeoDropdown(value);
      setAeoDropdown(""); // Reset AEO when DEO changes
      setAeoOptions([]);
    }
  };

  const handleChangeaeo = async (e) => {
    const { name, value } = e.target;

    if (name === "deoDropdown") {
      setDeoDropdown(value);
      setAeoDropdown(""); // Reset AEO when DEO changes
      setAeoOptions([]);

      if (!value) return;

      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_aeo_options`,
          { params: { deo_id: value } }
        );
        setAeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching AEO options:", error);
        setAeoOptions([]);
        setErrorMessage('Failed to fetch AEO options. Please try again.');
      }
    }

    if (name === "aeoDropdown") {
      setAeoDropdown(value);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/Reports/get_academic_years`);
      if (response.data.status) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error.message);
      setErrorMessage('Failed to fetch academic years. Please try again.');
    }
  };

  const handleAcademicYearSelect = (selectedYear) => {
    setSelectedYear(selectedYear);
  };


  const fetchSchools = async (selectedZone) => {
    try {
      const response = await axios.get(globalVariables.api_url + '/school/get_schools_zone', {
        params: {
          userType: userType,
          school_id:userId,
          selectedZone: selectedZone,
        }
      });
      
      const schools = response.data.data || [];
      setSchoolList(schools);
      setFilteredSchoolList(schools); // Set filtered list to all schools initially
      
      // Extract unique districts from fetched schools
      if (schools.length > 0) {
        const uniqueDistricts = [...new Set(schools.map(school => school.district))];
        setDistricts(uniqueDistricts);
      } else {
        setDistricts([]);
      }
      
    } catch (error) {
      console.error('Error fetching schools:', error);
      setSchoolList([]);
      setFilteredSchoolList([]);
      setDistricts([]);
      setErrorMessage('Failed to fetch schools. Please try again.');
    }
  };

  return (
    <>
      <Breadcum items={breadcum} title="Student Strength Report" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Student Strength Report</h5>
            </div>

            <div className="card-body">
              {/* {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                  <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                </div>
              )} */}

              <div className="row">
                <div className="col-md-12">
                  <form className="row g-3" onSubmit={handleSearchClick}>
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Academic Year<span className="text-danger">*</span></label>
                      <select
                        id="academic_year_id"
                        className="form-select"
                        value={selectedYear}
                        onChange={(e) => handleAcademicYearSelect(e.target.value)} required>
                        <option value="">Select Year</option>
                        {academicYears.map((year, index) => (
                          <option key={index} value={year.academic_year_id}>
                            {year.year_label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {userType === 'corporate_admin'  &&
                    <>
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Zone<span className="text-danger">*</span></label>
                      <ZoneDropdown
                        className="form-control"
                        value={selectedZone}
                        onSelect={handleZoneSelect}
                        showAllOption={true}
                      />
                    </div>

                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">District</label>
                      <select
                        id="district"
                        className="form-select"
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictSelect(e.target.value)}>
                        <option value="">Select District</option>
                        <option value="All">All</option>
                        {districts.map((d, index) => (
                          <option key={index} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    </>
}
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">School</label>
                      <select
                        id="school"
                        className="form-select"
                        value={selectedSchool}
                        onChange={(e) => handleSchoolSelect(e.target.value)}>
                        <option value="">Select School</option>
                        {userType === 'corporate_admin'  &&  <option value="All">All</option>}
                        {filteredSchoolList.map((school, index) => (
                          <option key={index} value={school.school_id}>
                            {school.location} {school.school_name}
                          </option>
                        ))}
                      </select>
                      {errorMessage && <div className="invalid-feedback d-block">{errorMessage}</div>}
                    </div>
                    {userType === 'corporate_admin'  &&
                    <div className="col-md-6 col-sm-12">
                      <label htmlFor="edu_dept" className="form-label">
                        Education Department:
                      </label>
                      <select
                        id="dept_type"
                        className="form-select"
                        name="dept_type"
                        value={EducationDept}
                        onChange={handleDepartmentChange}
                      >
                        <option value="">Select Department</option>
                        <option value="All">All</option>
                        <option value="rdd">RDD</option>
                        <option value="dde">DDE</option>
                        <option value="deo">DEO</option>
                        <option value="aeo">AEO</option>
                      </select>
                    </div>
}
                    {/* Secondary Dropdown - Visible only for RDD or DDE */}
                    {["rdd", "dde"].includes(EducationDept) && (
                      <div className="col-md-6 col-sm-12">
                        <label htmlFor="secondary-dropdown" className="form-label">
                          {EducationDept.toUpperCase()} Details 
                        </label>
                        <select
                          id="secondary-dropdown"
                          className="form-select"
                          name="secondaryDropdown"
                          value={secondaryDropdown}
                          onChange={handleChangeedu}
                        >
                          <option value="">Select Option</option>
                          <option value="All">All</option>
                          {secondaryOptions.map((option) => (
                            <option key={option.dept_id} value={option.dept_id}>
                              {option.office_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {EducationDept === "deo" && (
                      <>
                        {/* DDE Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="dde-dropdown" className="form-label">
                            DDE Details
                          </label>
                          <select
                            id="dde-dropdown"
                            className="form-select"
                            name="ddeDropdown"
                            value={ddeDropdown}
                            onChange={handleChangedeo}
                          >
                            <option value="">Select DDE Option</option>
                            <option value="All">All</option>
                            {secondaryOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* DEO Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="deo-dropdown" className="form-label">
                            DEO Details 
                          </label>
                          <select
                            id="deo-dropdown"
                            className="form-select"
                            name="deoDropdown"
                            value={deoDropdown}
                            onChange={handleChangedeo}
                          >
                            <option value="">Select DEO Option</option>
                            <option value="All">All</option>
                            {deoOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  
                    {EducationDept === "aeo" && (
                      <>
                        {/* DDE Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="dde-dropdown" className="form-label">
                            DDE Details <span className="text-danger">*</span>
                          </label>
                          <select
                            id="dde-dropdown"
                            className="form-select"
                            name="ddeDropdown"
                            value={ddeDropdown}
                            onChange={handleChangedeo}
                          >
                            <option value="">Select DDE Option</option>
                            <option value="All">All</option>
                            {secondaryOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* DEO Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="deo-dropdown" className="form-label">
                            DEO Details <span className="text-danger">*</span>
                          </label>
                          <select
                            id="deo-dropdown"
                            className="form-select"
                            name="deoDropdown"
                            value={deoDropdown}
                            onChange={handleChangeaeo}
                          >
                            <option value="">Select DEO Option</option>
                            <option value="All">All</option>
                            {deoOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* AEO Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="aeo-dropdown" className="form-label">
                            AEO Details <span className="text-danger">*</span>
                          </label>
                          <select
                            id="aeo-dropdown"
                            className="form-select"
                            name="aeoDropdown"
                            value={aeoDropdown}
                            onChange={handleChangeaeo}
                          >
                            <option value="">Select AEO Option</option>
                            <option value="All">All</option>
                            {aeoOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div className="col-md-12 mt-3">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || isDisabled}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching
                          </>
                        ) : (
                          <>
                            <span className="bi bi-search" role="status" aria-hidden="true"></span> Search
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {tableData.length > 0 && (
                    <div className="d-flex justify-content-end mt-3">
                      <button 
                        onClick={handleGenerateExcel} 
                        className="btn btn-danger btn-sm mx-2" 
                        disabled={excelloading}
                      >
                        {excelloading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...
                          </>
                        ) : (
                          <>
                            <span className="bi bi-file-excel" role="status" aria-hidden="true"></span> Export to Excel
                          </>
                        )}
                      </button>

                      <button 
                        onClick={handleGeneratePDF} 
                        className="btn btn-success btn-sm" 
                        disabled={pdfloading}
                      >
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
                    </div>
                  )}
                </div>
              </div>

       

              <div className="row" ref={dataTableRef}>
                <div className="col-md-12">
                  {showTable && (


<DataTable
className="custom-data-table"
columns={columns}
data={tableData}
pagination
highlightOnHover
pointerOnHover
ref={dataTableRef}
noDataComponent="No data available"
onChangePage={handlePageChange}
onChangeRowsPerPage={handlePerRowsChange}
paginationDefaultPage={currentPage}
paginationPerPage={rowsPerPage}
/>

             
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default StudentStrengthReport;







