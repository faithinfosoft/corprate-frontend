import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";
import { convertDateFormat } from '../utilities/dateconverter.js';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  useEffect(() => {
    fetchSchools();
    fetchDesignations();
    fetchTransferredStaff();
    fetchSubjects();
    fetchAcademicyear();
  }, []);
  const handleAddTransfer = () => {
    if (!modalData.fromSchool || !modalData.toSchool) {
      alert("Please select a school.");
      return;
    }

    setTransferList((prevList) => [...prevList, modalData]);
    setShowModal(false); // Close modal after adding
  };

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
      setErrorMessage('Failed to fetch Designations');
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
  const fetchDesignations = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/transfer/designations`);
      if (response.data.status) {
        setDesignations(response.data.data);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch designations');
    }
  };

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

  const handleModalInputChange = (field, value) => {
    setModalData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'fromSchool') {
      fetchStaffForFromSchool(value);
    }
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

        alert("PDF has been successfully downloaded!");
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("An error occurred while generating the PDF. Please check your network connection or contact support.");
    } finally {
        setPdfLoading(false);
    }
};

  
  

 
  const handleSubjectChange = (e) => {
    const subjectId = e.target.value;
    setSelectedSubject(subjectId);
    if (subjectId) {
      fetchStaffData(subjectId); // Fetch staff data when subject is selected
    } else {
      setStaffData([]); // Clear staff data if no subject is selected
    }
  };

  const fetchStaffData = async (subjectId) => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/staff_transfer/get_staff_transfer_request_subject/${subjectId}`
      );
      if (response.data.status) {
        setStaffData(Array.isArray(response.data.data) ? response.data.data : [response.data.data]);
      }
    } catch (error) {
      console.error("Error fetching staff data:", error.message);
      setStaffData([]); // Clear staff data if there's an error
    }
  };

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSave = () => {
    if (transferList.length === 0) {
      alert("No records to save.");
      return;
    }

    if (window.confirm("Are you sure you want to save the transfers?")) {
      handleSaveToDB(transferList); // Call API to save data
    }
  };

  const handleSaveToDB = async (transferList) => {
    try {
      const response = await axios.post(`${globalVariables.api_url}/transfer/saveTransfer_details`, { transfers: transferList });
  
      if (response.data.status) { // Check `status`, not `success`
        alert("Transfers saved successfully!");
        setTransferList([]); // Clear the table after saving
        navigate('/transferlist');
    } else {
        alert("Failed to save transfers. Please try again.");
    }
    } catch (error) {
      console.error("Error saving transfers:", error);
      alert("An error occurred while saving transfers.");
    }
  };


  const handleDelete = (index) => {
    // Filter out the deleted transfer from the transferList
    const updatedTransferList = transferList.filter((_, i) => i !== index);
    setTransferList(updatedTransferList);  // Update the state with the filtered list
  };
  return (
    <div className="container py-4">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Transfer List</h2>
        </div>
        <div className="card-body">
          <div className="mb-4">
            {/* School Selection */}
            <div className="mb-3">
              <label className="form-label">Academic Year<span className="text-danger">*</span></label>
              <select
                className="form-select"
                value={selectedYear}
                onChange={handleChange}
              >
                <option value="">Select Academic Year</option>
                {academicYear.map(year => (
                  <option key={year.academic_year_id} value={year.academic_year_id}>
                    {year.year_label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Transfer Date<span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Designation<span className="text-danger">*</span></label>
              <select
  className="form-select"
  value={selectedSubject}
  onChange={handleSubjectChange}
>
  <option value="">Select Subject</option>
  {subjects.map((designation) => (
    <option key={designation.designation_id} value={designation.designation_id}>
      {designation.designation_name}
    </option>
  ))}
</select>
            </div>
            {/* Transfer Date */}
          {/* Render staff data in a table */}
      {staffData.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Staff Name</th>
                <th>Current school</th>
                <th>Seniority</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staffData.map((staff, index) => (
                <tr key={staff.staff_id}>
                  <td>{index + 1}</td>
                  <td>{staff.staff_official_name	}</td>
                  <td>{staff.school_name	}</td>
                  <td>{staff.total_years} Years</td>
                  <td> <button
                      onClick={() => {
                        setShowModal(true);
                        setModalData({
                          staffName: staff.staff_official_name,
                          fromSchool: staff.school_name,
                          fromSchoolid: staff.school_id,
                          staffId: staff.staff_id,
                          toSchool: "", // Reset the To School field
                        });
                      }}
                      className="btn btn-primary  btn-sm"
                    >
                      Add
                    </button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedSubject ? (
        <p>No staff data available for the selected subject.</p>
      ) : null}

            {/* Transfer List Table */}
                 {/* Transfer List Table */}
      {transferList.length > 0 && (
        <div className="table-responsive mt-3">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>From School</th>
                <th>To School</th>
                <th>Staff Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {transferList.map((transfer, index) => (
                <tr key={index}>
                  <td>{transfer.fromSchool}</td>
                  <td>{schools.find(s => s.school_id === transfer.toSchool)?.school_name || "Unknown"}</td>
                  <td>{transfer.staffName}</td>
                  
                  <td>
              <button
                onClick={() => handleDelete(index)}  
                className="btn btn-danger btn-sm"
              >
                Delete
              </button>
            </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}



            {errorMessage && (
              <div className="alert alert-danger">{errorMessage}</div>
            )}
  {/* Modal */}
  {showModal && (
        <div className="modal fade show" tabIndex="-1" style={{ display: 'block' }} aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Transfer</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {/* From School */}
                <div className="mb-3">
                  <label className="form-label">From School</label>
                  <input
                    type="text"
                    className="form-control"
                    value={modalData.fromSchool || ""}
                    readOnly
                  />
                </div>
                <div className="mb-3">
  <input
    type="hidden"
    id="fromSchoolid"
    className="form-control"
    value={modalData.fromSchoolid || ''}  // Accessing fromSchoolid
    readOnly
  />
</div>
                {/* To School Selection */}
                <div className="mb-3">
                  <label className="form-label">To School</label>
                  <select
                    className="form-select"
                    value={modalData.toSchool}
                    onChange={(e) => handleModalInputChange("toSchool", e.target.value)}
                  >
                    <option value="">Select To School</option>
                    {schools.map(school => (
                      <option key={school.school_id} value={school.school_id}>
                        {school.school_name} , {school.location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
               
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddTransfer}
                  disabled={!modalData.toSchool}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Save Button */}
      <div className="d-flex justify-content-end mt-3">
        <button
          onClick={handleSave}
          disabled={transferList.length === 0}
          className="btn btn-success"
        >
          Save
        </button>
      </div>

            {/* Transferred Staff Table */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferList;
