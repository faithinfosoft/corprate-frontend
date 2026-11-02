import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import globalVariables from "../../Global.js";
// Import Bootstrap CSS in your main file or index.js if not already imported

const StaffServiceHistory = () => {
  const { staffId } = useParams();
  const [staffDetails, setStaffDetails] = useState(null);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfloading, setPdfLoading] = useState(false);
  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff basic details
        const staffResponse = await axios.get(`${globalVariables.api_url}/staff/staffdetails/${staffId}`);
        if (staffResponse.data.status && staffResponse.data.data) {
          setStaffDetails(staffResponse.data.data);
        } else {
          setError(staffResponse.data.message || 'Failed to fetch staff details');
        }
        
        // Fetch service history records
        const historyResponse = await axios.get(`${globalVariables.api_url}/staff/service-details/${staffId}`);
        
        // Check if response is successful and has data
        if (historyResponse.data.status && historyResponse.data.data) {
          setServiceRecords(historyResponse.data.data);
        } else {
          setError(historyResponse.data.message || 'No service records found');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch staff data. Please try again later.');
        setLoading(false);
        console.error('Error fetching staff data:', err);
      }
    };

    fetchStaffData();
  }, [staffId]);

  // Calculate total service duration
  const calculateTotalService = () => {
    if (!serviceRecords.length) return '0 days';
    
    let totalDays = 0;
    serviceRecords.forEach(record => {
      const startDate = new Date(record.start_date);
      const endDate = record.end_date && record.end_date !== '0000-00-00' ? new Date(record.end_date) : new Date();
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
    });
    
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    
    return `${years} years, ${months} months, ${days} days`;
  };



    const handleGeneratePDF = async () => {
      setPdfLoading(true);
      try {
  
        const form_data = {
          params: {
           
            staffId: staffId,
           
            print: "print"
          },
          responseType: 'blob'
        };
  
        const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_staff_service_history', form_data);
  
        // Handle the response, for example, trigger a file download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Staff_Service_History.pdf');
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
      setPdfLoading(false);
    };


  // Format date function
  const formatDate = (dateString) => {
    if (!dateString || dateString === '0000-00-00') {
      return 'Present';
    }
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob || dob === '0000-00-00') return 'N/A';
    
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="d-flex align-items-center">
          <div className="spinner-border text-primary me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="fs-5 fw-medium text-primary">Loading staff data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
          </svg>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <h4 className="fs-4 fw-bold text-dark mb-4">Staff Service History</h4>
        <div className="d-flex justify-content-end mt-4 mb-2">



        <button onClick={handleGeneratePDF} className="btn btn-success btn-sm mt-10 float-end" disabled={pdfloading}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer-fill me-2" viewBox="0 0 16 16">
                  <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                  <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                </svg>
{pdfloading ? (
  <>
    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...
  </>
) : (
  <>
    <span  role="status" aria-hidden="true"></span>   Print Service History
  </>
)}

</button>

{/* 
              <button 
                className="btn btn-primary"
                onClick={() => window.print()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-printer-fill me-2" viewBox="0 0 16 16">
                  <path d="M5 1a2 2 0 0 0-2 2v1h10V3a2 2 0 0 0-2-2H5zm6 8H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/>
                  <path d="M0 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1v-2a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2H2a2 2 0 0 1-2-2V7zm2.5 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                </svg>
                Print Service History
              </button> */}
            </div>
        <div className="row g-4">
          {/* Staff Details Box - Left Side */}
          {staffDetails && (
            <div className="col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-primary text-white">
                  <h5 className="card-title mb-0">Staff Details</h5>
                </div>
                <div className="card-body">
                  <div className="text-center mb-4">
                   
                    {staffDetails.photo ? (
                      <img 
                        src={`${globalVariables.img_url}/uploads/staff_photos/${staffDetails.photo}`}
                        
                        className="rounded-circle border border-3 border-light shadow"
                        style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '120px', height: '120px' }}>
                        <span className="text-white fs-1">{staffDetails.staff_official_name.charAt(0)}</span>
                      </div>
                    )}
                    <h5 className="mt-3 mb-0">{staffDetails.staff_official_name}</h5>
                    <span className="badge bg-info text-dark mt-2">{staffDetails.staff_type.charAt(0).toUpperCase() + staffDetails.staff_type.slice(1)}</span>
                  </div>

                  <ul className="list-group list-group-flush">
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Gender:</span>
                      <span className="fw-medium">{staffDetails.gender || 'N/A'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Date of Birth:</span>
                      <span className="fw-medium">{formatDate(staffDetails.dob)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Age:</span>
                      <span className="fw-medium">{calculateAge(staffDetails.dob)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Date of Joining:</span>
                      <span className="fw-medium">{formatDate(staffDetails.doj)}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Phone:</span>
                      <span className="fw-medium">{staffDetails.phone_no1 || 'N/A'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Email:</span>
                      <span className="fw-medium text-truncate">{staffDetails.email || 'N/A'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Religion:</span>
                      <span className="fw-medium">{staffDetails.religion || 'N/A'}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Status:</span>
                      <span className="fw-medium">
                        <span className={`badge ${staffDetails.staff_current_status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                          {staffDetails.staff_current_status && staffDetails.staff_current_status.charAt(0).toUpperCase() + staffDetails.staff_current_status.slice(1)}
                        </span>
                      </span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between">
                      <span className="text-muted">Total Service:</span>
                      <span className="fw-medium text-primary">{calculateTotalService()}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          {/* Service Records Box - Right Side */}
          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Service Records</h5>
                <span className="badge bg-light text-dark">{serviceRecords.length} Record(s)</span>
              </div>
              
              {serviceRecords.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="text-center">#</th>
                        <th scope="col">Staff Type</th>
                        <th scope="col">Designation</th>
                        <th scope="col">School</th>
                        <th scope="col">Start Date</th>
                        <th scope="col">End Date</th>
                        <th scope="col">Service Type</th>
                        <th scope="col">Service Status</th>
                       
                      </tr>
                    </thead>
                    <tbody>
                      {serviceRecords.map((record, index) => (
                        <tr key={record.service_id}>
                          <td className="text-center">{index + 1}</td>
                          <td>{record.staff_type.charAt(0).toUpperCase() + record.staff_type.slice(1)}</td>
                          <td>{record.designation_name}</td>
                          <td>{record.school_name}</td>
                          <td>{formatDate(record.start_date)}</td>
                          <td>{formatDate(record.end_date) }  </td>
                            
                        
                          <td>{record.service_type}</td>
                          <td>
                            <span className={`badge ${record.service_status === 'Active' ? 'bg-success' : 'bg-primary'}`}>
                              {record.service_status}
                            </span>
                          </td>
                         
                       
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card-body text-center py-5">
                  <div className="text-muted mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-file-earmark-text" viewBox="0 0 16 16">
                      <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                      <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                    </svg>
                  </div>
                  <h5 className="mb-1">No Service Records Found</h5>
                  <p className="text-muted">No service history records available for this staff member.</p>
                </div>
              )}
            </div>
            
           
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffServiceHistory;