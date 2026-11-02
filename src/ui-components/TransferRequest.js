import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DataTable from "react-data-table-component";
import useAuth from '../utilities/useAuth';
import Breadcum from './Breadcum';
import globalVariables from "../Global.js";

const TransferRequest = () => {
  const auth = useAuth();
  const username = auth.user.username;
  const userType = auth.user.user_type;
  const dataTableRef = useRef(null);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Transfer Requests', Link: '' },
  ]);
  // State variables
  const [academicYears, setAcademicYears] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
    const [transferpdfLoading, setTransferPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  

  // Fetch academic years on component mount
  useEffect(() => {
    fetchAcademicYears();
    if (userType === 'corporate_admin') {
      fetchSchools();
    }
  }, []);

  // Scroll to table when data is loaded
  useEffect(() => {
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/academic_years`);
      if (response.data.status) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      setErrorMessage('Failed to fetch academic years');
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/schools`);
      if (response.data.status) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      setErrorMessage('Failed to fetch schools');
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    fetchData();
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(globalVariables.api_url + '/staff_transfer/search_transfers', {
        params: {
          academic_year_id: selectedYear,
          school_id: selectedSchool,
          user_type: userType,
          username: username,
        },
      });
  
      if (response.data && response.data) {
        setTableData(response.data); // Ensure response.data.data exists
      } else {
        setTableData([]); // Handle case where data is missing
      }
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  const handleSearch1 = async (event) => {
    event.preventDefault();
    if (!selectedYear) {
      setErrorMessage('Please select an academic year');
      return;
    }
    setErrorMessage('');
    setLoading(true);

    try {
 const form_data = {
        params: {
          academic_year_id: selectedYear,
          school_id: selectedSchool,
          user_type: userType,
          username: username
        }
      };

      const response = await axios.get(globalVariables.api_url + '/staff_transfer/search_transfers', form_data);

      /*const response = await axios.post(`${globalVariables.api_url}/staff_transfer/search_transfers`, {
        params: {
          academic_year_id: selectedYear,
          school_id: selectedSchool,
          user_type: userType,
          username: username
        }
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });*/

      setTableData(response.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching transfer data:', error);
     
    }  setLoading(false);
  };

  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/generate_excel`, {
        params: {
          academic_year_id: selectedYear,
          school_id: selectedSchool,
          user_type: userType,
          username: username
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transfer_requests.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel:', error);
      setErrorMessage('Failed to generate Excel file');
    } finally {
      setExcelLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/generate_pdf`, {
        params: {
          academic_year_id: selectedYear,
          school_id: selectedSchool,
          user_type: userType,
          username: username
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transfer_requests.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrorMessage('Failed to generate PDF file');
    } finally {
      setPdfLoading(false);
    }
  };

  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,
    minWidth: '80px'
    },
    {
      name: "Academic Year",
      selector: row => row.year_label,
      sortable: true,
      minWidth: '150px'
    },
    ...(userType === 'corporate_admin' ? [{
      name: "Current School",
      selector: row => `${row.current_school_name}, ${row.current_school_location}`,
      sortable: true,
      minWidth: '250px'
    }] : []),
    {
      name: "Staff Name",
      selector: row => row.staff_official_name,
      sortable: true,
      minWidth: '200px',
      cell: row => (

        <a href={`${globalVariables.img_url}/uploads/staff_transfer_application_letter/${row.request_letter}`} target="_blank" rel="noopener noreferrer" className='text-dark'>
         {row.staff_official_name}
      </a> 

   
      ),
    },
    // {
//   name: "PEN Number",
//   selector: row => row.pen_no,
//   sortable: true,
//   minWidth: '150px'
// },
    {
      name: "Preferred Schools",
      cell: row => (
        <ul className="list-unstyled mb-0">
          {row.preferred_schools.map((school, index) => (
            <li key={index}>• {school.school_name}, {school.location}</li>
          ))}
        </ul>
      ),
      width: '300px'
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      width: '120px'
    }
  ];
  const handleGenerateTransferRequestForm12 = async (staff_id) => {
    setTransferPdfLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/transfer_request_form`, {
        params: {
          staff_id: staff_id,
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transfer_requests.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrorMessage('Failed to generate PDF file');
    } finally {
      setTransferPdfLoading(false);
    }
  };
  const handleGenerateTransferRequestForm = async (staff_id) => {
    setTransferPdfLoading(true);
    try {
      // Fetch the PDF file
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/transfer_request_form`, {
        params: {
          staff_id: staff_id,
        },
        responseType: 'blob',
      });
  
      // Create a Blob for the PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
  
      // Generate a URL for the Blob
      const url = window.URL.createObjectURL(blob);
  
      // Open the PDF in a new tab
      window.open(url, '_blank');
  
      // Trigger the download of the PDF
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transfer_requests.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Revoke the Blob URL to release memory
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrorMessage('Failed to generate PDF file');
    } finally {
      setTransferPdfLoading(false);
    }
  };
  
  return (
    <>
        <Breadcum items={breadcum} title="Transfer Requests" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Transfer Request Report</h5>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <form className="row g-3" onSubmit={handleSearch}>
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">
                        <span className="text-danger">*</span>Academic Year
                      </label>
                      <select
                        className="form-select"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        required
                      > 
                      <option value="">Select Academic Year</option>
                        <option value="all">All</option>
                        {academicYears.map((year) => (
                          <option key={year.academic_year_id} value={year.academic_year_id}>
                            {year.year_label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {userType === 'corporate_admin' && (
                      <div className="col-md-6 col-sm-12">
                        <label className="form-label">School</label>
                        <select
                          className="form-select"
                          value={selectedSchool}
                          onChange={(e) => setSelectedSchool(e.target.value)}
                        >
                          <option value="">All Schools</option>
                          {schools.map((school) => (
                            <option key={school.school_id} value={school.school_id}>
                              {school.school_name}, {school.location}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="form-group">
                      <button
                        type="submit"
                        className="btn btn-primary btn-search"
                        disabled={loading}
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

                    {errorMessage && (
                      <div className="col-12">
                        <div className="alert alert-danger" role="alert" style={{backgroundColor: '#f8d7da', borderColor: '#f5c6cb', color: '#721c24'}}>
                          {errorMessage}
                        </div>
                      </div>
                    )}
                  </form>

                  <div className="exportpdf col-lg-12 m-2">
                    {tableData.length > 0 && (
                      <>
                        <button 
                          onClick={handleGenerateExcel} 
                          className="btn btn-danger btn-sm mt-10 float-end ms-3" 
                          disabled={excelLoading}
                        >
                          {excelLoading ? (
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
                          className="btn btn-success btn-sm mt-10 float-end" 
                          disabled={pdfLoading}
                        >
                          {pdfLoading ? (
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

export default TransferRequest;