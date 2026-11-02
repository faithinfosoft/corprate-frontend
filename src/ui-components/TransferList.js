import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";
import { convertDateFormat } from '../utilities/dateconverter.js';
import { Link } from "react-router-dom";
import print_toast from "../utilities/Toaster.js";
const TransferList = () => {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [schools, setSchools] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYear, setAcademicyear] = useState([]);
  const [transferList, setTransferList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [designations, setDesignations] = useState([]);
  const [requestedTransfers, setRequestedTransfers] = useState([]);
  const [pdfloading, setPdfLoading] = useState(false);
  const [transferDate, setTransferDate] = useState('');
  const [staff, setStaff] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(""); // Selected subject
  const [staffData, setStaffData] = useState([]);
  const [modalData, setModalData] = useState({
    fromSchool: '',
    staffId: '',
    fromSchoolid:'',
    designationId: ''
  });

  const [transferredStaff, setTransferredStaff] = useState([]);

  useEffect(() => {
    fetchSchools();
    
    fetchTransferredStaff();
    fetchSubjects();
    fetchAcademicyear();
  }, []);


  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/schools`);
      if (response.data.status) {
        setSchools(response.data.data);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch schools');
    }
  };
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/vacancySetting/get_all_vacancies_subjects`);
      if (response.data.status) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch subject');
    }
  };
  const fetchAcademicyear = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/academic_years`);
      
      if (response.data.status && Array.isArray(response.data.data)) { 
        setAcademicyear(response.data.data);
      } else {
        setAcademicyear([]); // Set an empty array if data is not valid
      }
    } catch (error) {
      setErrorMessage('Failed to fetch Academic year');
    }
  }


  const fetchTransferredStaff = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/transfer/view_transfered_staff`);
      if (response.data.status) {
        setTransferredStaff(response.data.data);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch transferred staff');
    }
  };

  const handleChange = async (e) => {
    const academic_year = e.target.value;
    setSelectedYear(academic_year);
 
  };



  const fetchStaffForFromSchool = async (schoolId) => {
    try {
      const staffResponse = await axios.get(`${globalVariables.api_url}/transfer/get_transfered_Staff`, {
        params: { school_id: schoolId },
      });
      console.log(staffResponse.data);
      setStaff(staffResponse.data.data); 
    } catch (error) {
      console.error('Error fetching staff:', error);
      setErrorMessage('Could not fetch staff for the selected school.');
      setStaff([]); 
    }
  };



  const handleGeneratePDF = async (transferId) => {
    console.log("Transfer ID:", transferId);
    


    setPdfLoading(true);
    try {
        const config = {
            responseType: "blob",
        };

        // Make sure the URL is correctly formatted
        const response = await axios.get(
            `${globalVariables.api_url}/transfer/generate_pdf_transfer_details/${transferId}`,  // Use the correct path
            config
        );

        const blob = new Blob([response.data], { type: "application/pdf" });

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Transfer_Letter.pdf");
        document.body.appendChild(link);

        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF. Please check your network connection or contact support.");
    } finally {
        setPdfLoading(false);
    }
};

  
  

 
  


  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);


 


  const handleDelete = async (transferId) => {
    if (window.confirm("Are you sure you want to delete this transfer?")) {
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/transfer/delete_transfer`,
          { transferId: transferId }
        );

      
        if (response.data.status) {
          await fetchTransferredStaff(); // Refresh treasury data
          print_toast("success", response.data.message);
          window.location.reload();
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        
        console.error("Error deleting Transfer:",error.response?.data?.message || error.message);
        print_toast("error", error.response?.data?.message || "Failed to delete Transfer");
      }
    }
  };
  

 
  return (
    <div className="container py-4">
      <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title">Transfer List</h5>
        <Link to="/create-transfer" style={{ color: 'white', textDecoration: 'none' }} className="btn btn-danger">
    Create Transfer
  </Link>
      </div>

        <div className="card-body">
         
      

            {/* Transferred Staff Table */}

            
            {transferredStaff.length > 0 ? (
  <div className="card-header-4">
    <h3 className="card-title">Transferred Staff List</h3>
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>From School</th>
            <th>To School</th>
            <th>Transfer Date</th>
            <th>Staff Name</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {transferredStaff.map((staffMember) => (
            <tr key={staffMember.transfer_id}>
              <td>{staffMember.from_school}</td>
              <td>{staffMember.to_school}</td>
              <td>{convertDateFormat(staffMember.transfer_date)}</td>
              <td>{staffMember.staff_name}</td>
              <td>
                <div className="dropdown">
                  <button
                    className="btn btn-primary dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Actions
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <li>
                      <button
                        onClick={() => handleGeneratePDF(staffMember.transfer_id)}
                        className="dropdown-item"
                      >
                        Transfer Letter
                      </button>
                    </li>
                    <li>
    <button
      onClick={() => handleDelete(staffMember.transfer_id)}
      className="dropdown-item text-danger"
    >
      Delete
    </button>
  </li>
                  </ul>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
) : (
  <div className="no-data-message">
    <h6>No Transfer Records Found</h6>
  </div>
)}

          
        </div>
      </div>
    </div>
  );
};

export default TransferList;
