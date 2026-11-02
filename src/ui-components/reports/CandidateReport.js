import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import globalVariables from "../../Global.js";
import Multiselect from 'multiselect-react-dropdown';
import DataTable from "react-data-table-component";
import useAuth from '../../utilities/useAuth';
import Breadcum from '.././Breadcum';
import { convertDateFormat } from '../../utilities/dateconverter';

const RetiredStaffList = () => {

    const [breadcum] = useState([
        { Title: 'Home', Link: '/' },
        { Title: 'Retired Staff List', Link: '' },
      ]);
      const [academicYears, setAcademicYears] = useState([]);
  const auth = useAuth();
  const userType = auth.user.user_type;
  const zoneDetailsId = auth.user.zone_details_id;
  const zone_details_name = auth.user.zone_details_name;
  const dataTableRef = useRef(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [isDisabled, setIsDisabled] = useState(false);
  const [schools, setSchools] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(['forane']);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

useEffect(() => {
fetchSchools();
fetchAcademicYears();

    // Scroll to DataTable component when data is fetched
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };
  
  const handleEndDateChange = (date) => {
    setEndDate(date);
  };
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
  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/transfer_notification/get_all_years`);
      if (response.data.status) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error.message);
    }
  };
  const handleSchoolSelect = (selectedSchool) => {
    setSelectedSchool(selectedSchool);
  };

  const handleAcademicYearSelect = (selectedYear) => {
    setSelectedYear(selectedYear);
  };

  const capitalizeWords = (str) => {
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
          school_id: selectedSchool,
          academic_year_id:  selectedYear,
        }
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_retired_staffs', form_data);
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
      sortable: true
    },
    { name: "School", selector: (row) => row.forane_name, sortable: true, minWidth: '280px' },
    
    {
      name: "Staff Name",
      selector: (row) => (
        <Link to={`/viewmemberdetails/${row.member_id}`} className="nav-link reports">
        {`${row.official_name} (${row.baptism_name})`}
      </Link>
      ),
      sortable: true,
      minWidth: '280px'
    },
    { name: "Age", selector: (row) => row.age, sortable: true, minWidth: '100px' },
    { name: "Gender", selector: (row) => capitalizeWords(row.gender), sortable: true, minWidth: '120px' }, 
  ];


  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {



      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_retired_staffs', {
        params: {
          
            school_id: selectedSchool,
            academic_year_id:  selectedYear,
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
      link.setAttribute('download', 'deathmemberreport.xlsx'); // Use .xlsx extension if the file is in .xlsx format
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
         
            school_id: selectedSchool,
            academic_year_id:  selectedYear,
          print: "print"
        },
        responseType: 'blob'
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_retired_staffs', form_data);

      // Handle the response, for example, trigger a file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'deathmemberreport.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };


  return (
    <>
      <Breadcum items={breadcum} title="Retired Staff Report" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">

            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Retired Staff Report</h5>

            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <form className="row g-3" onSubmit={handleSearchClick}>

                 

                    {userType !== 'zone' && userType !== 'country' && (
                      <div className="col-md-6 col-sm-12">
                        <label className="form-label">School</label>
                        <select
                          id="school"
                          className="form-select"
                          value={selectedSchool}
                          onChange={(e) => handleSchoolSelect(e.target.value)} required>
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
                        <label className="form-label">Academic Year</label>
                        <select
                          id="academic_year_id"
                          className="form-select"
                          value={selectedYear}
                          onChange={(e) => handleAcademicYearSelect(e.target.value)}  required>
                          <option value="">Select Year</option>
                          {academicYears.map((year, index) => (
                            <option key={index} value={year.academic_year_id}>
                              {year.year_label}
                            </option>
                          ))}
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

export default RetiredStaffList;







