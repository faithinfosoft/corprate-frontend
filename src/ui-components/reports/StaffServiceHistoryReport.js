import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import globalVariables from "../../Global.js";
import ZoneDropdown from './ZoneList.js';
import DataTable from "react-data-table-component";
import useAuth from '../../utilities/useAuth';
import Breadcum from '.././Breadcum';
import { convertDateFormat } from '../../utilities/dateconverter';

const StaffServiceHistoryReport = () => {

    const [breadcum] = useState([
        { Title: 'Home', Link: '/' },
        { Title: 'Service History Report', Link: '' },
      ]);
      const [academicYears, setAcademicYears] = useState([]);
       const [selectedZone, setselectedZone] = useState(null);
  const auth = useAuth();
  const userType = auth.user.user_type;
  const userId = auth.user.user_id;
  const dataTableRef = useRef(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedservice, setselectedservice] = useState('');
  const [selectedStaffType, setSelectedStaffType] = useState('');
  
  // Add state for staff list and selected staff
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
 
    const [selectedDesignation, setSelectedDesignation] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [schoolList, setSchoolList] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(['forane']);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);     
const [designationStatus, setDesignationStatus] = useState("");
useEffect(() => {



    // Scroll to DataTable component when data is fetched
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);


    useEffect(() => {
    
      if (selectedZone !== undefined) {
        fetchSchools(selectedZone);
      }
    }, [selectedZone, userType]);

  // Add useEffect to fetch staff when school is selected
  useEffect(() => {
    if (selectedSchool && selectedSchool !== 'All') {
      fetchStaffFromSchool(selectedSchool);
    } else {
      setStaffList([]);
      setSelectedStaff('');
    }
  }, [selectedSchool]);

  const handleZoneSelect = (selectedZone) => {
    setselectedZone(selectedZone);
  };
  

  const fetchSchools = async (selectedZone) => {
    try {
      const response = await axios.get(globalVariables.api_url + '/school/get_schools_zone', {
        params: {
          userType: userType,
          selectedZone: selectedZone,
          school_id:userId,
        }
      });
      setSchoolList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parishes:', error);
    }
  };  

  // Add function to fetch staff from selected school
  const fetchStaffFromSchool = async (schoolId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/Reports/get_staff_by_school`, {
        params: {
          school_id: schoolId
        }
      });
      
      if (response.data.status) {
        setStaffList(response.data.data || []);
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      setStaffList([]);
    }
    setLoading(false);
  };


  const handleSchoolSelect = (selectedSchool) => {
    setSelectedSchool(selectedSchool);
    // Reset staff selection when school changes
    setSelectedStaff('');
  };

  // Add handler for staff selection
  const handleStaffSelect = (staffId) => {
    setSelectedStaff(staffId);
  };


  const handleServiceSelect = (selectedservice) => {
    setselectedservice(selectedservice);
  };

  const handleStaffTypeSelect = (selectedStaffType) => {
    setSelectedStaffType(selectedStaffType);
  };

  const capitalizeWords = (str) => {
    if (!str || typeof str !== 'string') return ''; // Handle undefined/null/non-string values safely
    return str.replace(/\b\w/g, char => char.toUpperCase());
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
          zone_id: selectedZone,
          school_id: selectedSchool,
          staff_id: selectedStaff,
          service_type: selectedservice,
          staff_type: selectedStaffType
        }
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_staff_service_history', form_data);
      setTableData(response.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  const isFilterSelected = (filterValue) => selectedFilters.includes(filterValue);

  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,
      minWidth: '100px'
    },
    { name: "Zone", selector: (row) => row.zone_name, sortable: true, minWidth: '180px' },
    { name: "School Code", selector: (row) => row.school_code, sortable: true, minWidth: '130px' },
    { name: "School Name", selector: (row) => row.school_location, sortable: true, minWidth: '320px' },
    { name: "Staff Type", selector: (row) => capitalizeWords(row.staff_type), sortable: true, minWidth: '150px' },
    { 
      name: "Staff Name", 
      selector: (row) => (
        <a 
          href={`/staffdetails/${row.encrypted_staff_id}`} 
          className="nav-link reports" 
          style={{ color: 'blue', textDecoration: 'none' }} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {row.staff_official_name}
        </a>
      ),
      sortable: true, 
      minWidth: '200px' 
    },
  { name: "Staff Type", selector: (row) => row.staff_type, sortable: true, minWidth: '130px' },
      { name: "Position Type", selector: (row) => row.position_type, sortable: true, minWidth: '150px' },
  
      { name: "DOB", selector: (row) => convertDateFormat(row.dob), sortable: true, minWidth: '150px' },
      { name: "Age", selector: (row) => row.age, sortable: true, minWidth: '120px' },
      { name: "Gender", selector: (row) => capitalizeWords(row.gender), sortable: true, minWidth: '120px' },
      { name: "Contact No.", selector: (row) => row.phone_no1, sortable: true, minWidth: '180px' },
      { name: "Whatsapp No.", selector: (row) => row.whatsapp_no, sortable: true, minWidth: '180px' },
      { name: "Email", selector: (row) => row.email, sortable: true, minWidth: '250px' },
      // { name: "Religion", selector: row => capitalizeWords(row.religion), sortable: true, minWidth: '200px' },
      // { name: "Denomination", selector: row => capitalizeWords(row.caste), sortable: true, minWidth: '280px' },
      // { name: "Subcaste", selector: row => capitalizeWords(row.subcaste), sortable: true, minWidth: '160px' },
      // { name: "Status of Life", selector: row => capitalizeWords(row.marital_status), sortable: true, minWidth: '200px' },
   
      { 
        name: "", 
        selector: (row) => (
          <a 
          href={`/staff-service-history/${row.encrypted_staff_id}`}
          className="btn btn-primary btn-sm d-flex align-items-center"
          target="_blank"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clock-history me-2" viewBox="0 0 16 16">
            <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"/>
            <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"/>
            <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"/>
          </svg>
          Service History
        </a>
        ),
        sortable: true, 
        minWidth: '200px' 
      },
//       {
//         name: "Actions",
//         cell: (row) => (
//           <div className="dropdown">
//             <button 
//               className="btn btn-dark dropdown-toggle btn-sm" 
//               type="button" 
//               id="dropdownMenuButton1" 
//               data-bs-toggle="dropdown" 
//               aria-expanded="false"
//             >
//               Action
//             </button>
//             <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
//             <li>
//   <a 
//     href={`/staff-service-history/${row.id}`} 
//     className="dropdown-item"
//   >
//     Service History
//   </a>
// </li>
        
//             </ul>
//           </div>
//         ),
//         ignoreRowClick: true,
//         allowOverflow: true,
//         button: true,
//       }
  ];


  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {
      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_service_records', {
        params: {
          zone_id: selectedZone,
          school_id: selectedSchool,
          staff_id: selectedStaff,
          service_type: selectedservice,
          staff_type: selectedStaffType,
          excel: "excel"
        },
        responseType: 'blob'
      });

      // Create a new Blob object using the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create a URL for the Blob object
      const url = window.URL.createObjectURL(blob);

      // Create a link element and trigger a download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staff_service_history_report.xlsx'); // Updated filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the URL
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
          zone_id: selectedZone,
          school_id: selectedSchool,
          staff_id: selectedStaff,
          service_type: selectedservice,
          staff_type: selectedStaffType,
          print: "print"
        },
        responseType: 'blob'
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_service_records', form_data);

      // Handle the response, for example, trigger a file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staff_service_details_report.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };


  return (
    <>
      <Breadcum items={breadcum} title="Service History Report" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">

            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Staff Service History Report</h5>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <form className="row g-3" onSubmit={handleSearchClick}>

                 
                  {userType === 'corporate_admin'  &&
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Zone<span className="text-danger">*</span></label>
                      <ZoneDropdown
                        className="form-control"
                        value={selectedZone}
                        onSelect={handleZoneSelect}
                        showAllOption={true}
                      />
                    </div>
                  }
                                 
                  <div className="col-md-6 col-sm-12">
                    <label className="form-label">School</label>
                    <select
                      id="school"
                      className="form-select"
                      value={selectedSchool}
                      onChange={(e) => handleSchoolSelect(e.target.value)} 
                      required={userType === 'parish'}>
                      <option value="">Select School</option>
                      {userType === 'corporate_admin' && <option value="All">All</option>}
                      {schoolList.map((school, index) => (
                        <option key={index} value={school.school_id}>
                          {school.school_name},{school.location}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* New Staff Dropdown */}
                  <div className="col-md-6 col-sm-12">
                    <label className="form-label">Staff</label>
                    <select
                      id="staff"
                      className="form-select"
                      value={selectedStaff}
                      onChange={(e) => handleStaffSelect(e.target.value)}
                      // disabled={!selectedSchool || selectedSchool === 'All' || loading}
                      >
                      <option value="">Select Staff</option>
                      <option value="All">All</option>
                      {staffList.map((staff, index) => (
                        <option key={index} value={staff.staff_id}>
                          {staff.staff_official_name}
                        </option>
                      ))}
                    </select>
                  </div>

           

                  <div className="col-md-6 col-sm-12">
                    <label className="form-label">Service Type</label>
                    <select
                      id="service_type"
                      className="form-select"
                      value={selectedservice}
                      onChange={(e) => handleServiceSelect(e.target.value)}>
                      <option value="">Select Type</option>
                      <option value="All">All</option>
                      <option value="Permanent">Permanent</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>

                  <div className="col-md-6 col-sm-12">
                    <label className="form-label">Staff Type</label>
                    <select
                      id="staff_type"
                      className="form-select"
                      value={selectedStaffType}
                      onChange={(e) => handleStaffTypeSelect(e.target.value)}>
                      <option value="">Select Type</option>
                      <option value="All">All</option>
                      <option value="teaching">Teaching</option>
                      <option value="non_teaching">Non-Teaching</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <button
                      type="submit"
                      className="btn btn-primary btn-search"
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

                  {/* <div className="exportpdf col-lg-12 m-2">
                    {tableData.length > 0 && (
                      <>
                        <button onClick={handleGenerateExcel} className="btn btn-danger btn-sm mt-10 float-end ms-3" disabled={excelloading}>
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
                  </div> */}
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
                      paginationComponentOptions={{
                        rowsPerPageText: "Rows per page:",
                        rangeSeparatorText: "of",
                        selectAllRowsItem: true,
                        selectAllRowsItemText: "All",
                      }}
                      selectableRows
                      selectableRowsComponent={({ selectedCount, onSelectedCountChange }) => (
                        <div className="selectable-rows-component">
                          <div className="selectable-rows-component-actions">
                            {/* You can add actions related to selectable rows here */}
                          </div>
                        </div>
                      )}
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

export default StaffServiceHistoryReport;