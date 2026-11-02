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
    { Title: 'Staff Report', Link: '' },
  ]);
  
  const auth = useAuth();
  const userType = auth.user.user_type;
  const dataTableRef = useRef(null);
  
  // State variables
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStaffType, setSelectedStaffType] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [schools, setSchools] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');     

  useEffect(() => {
    fetchSchools();
    fetchDesignations();

    // Scroll to DataTable component when data is fetched
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);

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
  
  const fetchDesignations = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/designations/view`);
      if (response.data.status) {
        setDesignations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
    }
  };

  const handleSchoolSelect = (selectedSchool) => {
    setSelectedSchool(selectedSchool);
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
          start_date: startDate,
          end_date: endDate,
          status: selectedStatus,
        }
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_staff_seniority_list', form_data);
    setTableData(response.data.data || []);
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
      minWidth: '90px'
    },
       {
  name: "School Code",
  selector: (row) =>  row.school_code,
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
      selector: (row) =>
          row.staff_official_name,
      sortable: true,
      minWidth: '280px'
    },
    { name: "Age", selector: (row) => row.age, sortable: true, minWidth: '90px' },
    { name: "Gender", selector: (row) => capitalizeWords(row.gender), sortable: true, minWidth: '120px' }, 
    {
  name: "Date of Commencement",
  selector: (row) => convertDateFormat(row.commencement_date),
  sortable: true
},
{
  name: "First Appointment Date",
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
  sortable: true
},
{
  name: "Rank",
  selector: (row) => row.rank,
  sortable: true
}
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
          start_date: startDate,
          end_date: endDate,
          status: selectedStatus,
          excel: "excel"
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
          start_date: startDate,
          end_date: endDate,
          status: selectedStatus,
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
      <Breadcum items={breadcum} title="Staff Report" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Staff Details Report</h5>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <form className="row g-3" onSubmit={handleSearchClick}>

                    {userType !== 'zone' && userType !== 'country' && (
                      <div className="col-md-6 col-sm-12">
                        <label className="form-label">School<span className="text-danger">*</span></label>
                        <select
                          id="school"
                          className="form-select"
                          value={selectedSchool}
                          onChange={(e) => handleSchoolSelect(e.target.value)} 
                          required>
                          <option value="">Select School</option>
                          {userType !== 'parish' && <option value="All">All</option>}
                          {schools.map((school, index) => (
                            <option key={index} value={school.school_id}>
                              {school.school_name},{school.location}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

          

                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Staff Type<span className="text-danger">*</span></label>
                      <select
                        id="staff_type"
                        className="form-select"
                        value={selectedStaffType}
                        onChange={(e) => setSelectedStaffType(e.target.value)}
                        required>
                        <option value="">Select Type</option>
                        <option value="All">All</option>
                        <option value="Teaching">Teaching</option>
                        <option value="Non-Teaching">Non Teaching</option>
                      </select>
                    </div>

                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Designation<span className="text-danger">*</span></label>
                      <select
                        id="designation"
                        className="form-select"
                        value={selectedDesignation}
                        onChange={(e) => setSelectedDesignation(e.target.value)}
                        required>
                        <option value="">Select Designation</option>
                        <option value="All">All</option>
                        {designations.map((d, index) => (
                          <option key={index} value={d.designation_id}>
                            {d.designation_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="row mb-3 bg-light p-1 m-1">
                  
                      <div className="form-group col-md-6">
                        <label htmlFor="startDate" className="form-label">From<span className="text-danger">*</span></label>
                        <input 
                          type="date"
                          id="startDate"
                          name="startDate"
                          className="form-control col-md-6 col-sm-12"
                          value={startDate}
                          onChange={handleStartDateChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group col-md-6">
                        <label htmlFor="endDate" className="form-label">To<span className="text-danger">*</span></label>
                        <input 
                          type="date"
                          id="endDate"
                          name="endDate"
                          className="form-control col-md-6 col-sm-12"
                          value={endDate}
                          onChange={handleEndDateChange}
                          required
                        />
                      </div>
                    </div>
{/* 
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Status</label>
                      <select
                        id="status"
                        className="form-select"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        required>
                        <option value="">Select Status</option>
                        <option value="All">All</option>
                        <option value="Active">Active</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div> */}

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

                  <div className="exportpdf col-lg-12 m-2">
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
                  </div>
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

export default SeniorityReport;