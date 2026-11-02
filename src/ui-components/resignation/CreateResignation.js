import React, { useState, useEffect } from "react";
import axios from "axios";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import { useNavigate } from 'react-router-dom';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Select from 'react-select';
import { convertDateFormat } from '../../utilities/dateconverter';
import { capitalizeWords } from '../../utilities/dateconverter';
const CreateResignation = () => {
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(""); 
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const today = new Date().toISOString().split("T")[0];
    const [isLoading, setIsLoading] = useState(false);
    const [staffMessage, setStaffMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    resignation_date: "",
    resignation_reason: "",
    service_end_date: "",
    document_file: null
  });

  // Fetch Schools
  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/schools`);
      if (response.data.status) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch schools", error);
    }
  };

  // Fetch Staff Based on Selected School
  const fetchStaff12 = async (schoolId) => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_staff_school/${schoolId}`);
      if (response.data.status) {
        setStaff(response.data.data);
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaff([]);
    }
  };

  const fetchStaff = async (schoolId) => {
    setIsLoading(true);
    setStaffMessage("");
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_staff_school/${schoolId}`);
      if (response.data.status) {
        setStaff(response.data.data);
        if (response.data.data.length === 0) {
          setStaffMessage("No staff data found for this school.");
        }
      } else {
        setStaff([]);
        setStaffMessage(response.data.message || "No staff data found for this school.");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaff([]);
      setStaffMessage("Error loading staff data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle School Change
  const handleSchoolChange = (selectedOption) => {
    const schoolId = selectedOption.value;
    setSelectedSchool(schoolId); // Update the selected school state
    fetchStaff(schoolId);
  };

  // Open Modal for Selected Staff
  const openModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      resignation_date: "",
      resignation_reason: "",
      service_end_date: "",
      document_file: null
    });
    setValidationErrors({});
    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      // Check if file is a PDF when it's the document_file
      if (name === 'document_file') {
        const file = files[0];
        if (file && !file.type.includes('pdf')) {
          setValidationErrors(prev => ({
            ...prev,
            [name]: 'Only PDF files are allowed'
          }));
          return; // Don't update state with invalid file
        }
      }
      
      setFormData(prevData => ({
        ...prevData,
        [name]: files[0]
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
    
    // Clear validation errors
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      if (name === 'service_end_date') {
        // Additional validations can be added here if needed
      }
      return newData;
    });

    // Clear validation errors
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Save Resignation Record
  const handleSaveResignationRecord = async () => {
 
    setIsSaving(true);
    // Create FormData object for file upload
    const dataToSend = new FormData();
    dataToSend.append('staff_school_id', selectedStaff.staff_school_id);
    dataToSend.append('staff_id', selectedStaff.staff_id);
    dataToSend.append('name', selectedStaff.staff_official_name);
    dataToSend.append('gender', selectedStaff.gender);
    dataToSend.append('resignation_date', formData.resignation_date);
    dataToSend.append('resignation_reason', formData.resignation_reason);
    dataToSend.append('service_id', selectedStaff.latest_service_record.service_id);
    dataToSend.append('service_end_date', 
      selectedStaff?.latest_service_record?.end_date && 
      selectedStaff?.latest_service_record?.end_date !== '0000-00-00' ?
      selectedStaff?.latest_service_record?.end_date :
      formData.service_end_date
    );
    dataToSend.append('document_file', formData.document_file);

    try {
      const response = await axios.post(`${globalVariables.api_url}/resignation/create`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" }, // Change to multipart/form-data for file upload
      });
      
      if (response.data.status) {
        print_toast("success", "Resignation record added successfully.");
        setStaff(prevStaffList => prevStaffList.filter(staff => staff.staff_id !== selectedStaff.staff_id));
        navigate("/staff-resignation-details/resignation-details")
        closeModal();
      } else {
        if (response.data.error) {
          setValidationErrors(response.data.error);
        } else {
          print_toast("error", "Failed to save resignation record.");
        }
      }
    } catch (error) {
      console.error("Error saving resignation record:", error);
      if (error.response?.data?.error) {
        setValidationErrors(error.response.data.error);
      } else {
        print_toast("error", "Error saving resignation record.");
      }
    }
    finally {
      // Reset saving state regardless of outcome
      setIsSaving(false);
    }
  };

  const schoolOptions = schools.map((school) => ({
    value: school.school_id,
    label: `${school.location} ${school.school_name} `
  }));

  const convertDate = (dateString) => {
    if (!dateString) return ""; // Return empty if no date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Return empty if invalid date
    return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };

  return (
    <>
      <div className="card border-top-0 rounded-0">
       
        <div className="card-body">
          {/* School Dropdown */}
          <div className="mb-3">
            <label className="form-label">Select School</label>
            <Select
              id="fk_school_id"
              name="fk_school_id"
              options={schoolOptions}
              value={schoolOptions.find(option => option.value === selectedSchool) || null}
              onChange={handleSchoolChange}
              isSearchable
              placeholder="Select School"
              classNamePrefix="react-select"
              styles={{
                control: (provided) => ({
                  ...provided,
                  width: "500px",
                }),
              }}
            />
          </div>

          {isLoading && (
            <div className="d-flex justify-content-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* No Staff Message */}
          {!isLoading && selectedSchool && staffMessage && (
            <div className="alert alert-info mt-3" role="alert">
              {staffMessage}
            </div>
          )}


          {/* Staff Table */}
          {staff.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Sl No.</th>
                    <th>PEN No.</th>
                    <th>Staff Type</th>
                    <th>Staff Name</th>
                    <th>Gender</th>
                    <th>Phone No.</th>
                    <th>Designation</th>
                    <th>Service Start Date</th>
                    <th>Service End Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((person, index) => (
                    <tr key={person.staff_id}>
                      <td>{index+1}</td>
                      <td>{person.pen_no}</td>
                      <td> {person.latest_service_record?.staff_type === 'teaching' ? 'Teaching' : 'Non Teaching'}</td>
                     <td><a href={`/staffdetails/${person.encrypted_staff_id}`} 
          className="nav-link reports" 
          style={{ color: 'blue', textDecoration: 'none' }} 
          target="_blank" 
          rel="noopener noreferrer"
        >{person.staff_official_name}</a></td>
                      <td>{person.gender}</td>
                      <td>{person.phone_no1}</td>
                      <td>{person.latest_service_record?.designation_name || "Not Assigned"}</td>
                      <td>{convertDateFormat(person.latest_service_record?.start_date)}</td>
                      <td>{convertDateFormat(person.latest_service_record?.end_date)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openModal(person)}
                        >
                          Set Resignation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Resignation Record */}
      <Modal show={showModal} onHide={closeModal} backdrop='static'>
        <Modal.Header closeButton>
          <Modal.Title>Add Resignation Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label className="form-label">Staff Name</label>
              <input type="text" className="form-control" value={selectedStaff?.staff_official_name} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Gender</label>
              <input type="text" className="form-control" value={selectedStaff?.gender} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Designation</label>
              <input type="text" className="form-control" value={selectedStaff?.latest_service_record?.designation_name || "Not Assigned"} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Service End Date<span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="service_end_date"
                name="service_end_date"
                value={convertDate(selectedStaff?.latest_service_record?.end_date) || formData.service_end_date || ""}
                onChange={handleCreateInputChange}
                readOnly={!!convertDate(selectedStaff?.latest_service_record?.end_date)} // Read-only if value exists
              />
              
              {/* Show validation only if service_end_date is editable */}
              {!convertDate(selectedStaff?.latest_service_record?.end_date) && validationErrors.service_end_date && (
                <div className="invalid-feedback d-block">
                  {validationErrors.service_end_date}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Date of Resignation<span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                id="resignation_date"
                name="resignation_date"
                max={today}
                value={formData.resignation_date}
                onChange={handleChange}
              />
              {validationErrors.resignation_date && (
                <div className="invalid-feedback d-block">
                  {validationErrors.resignation_date}
                </div>
              )}
            </div>

            <div className="col-12 mt-3">
              <label htmlFor="document_file" className="form-label">
                Document File <span className="text-danger">*</span>
              </label>
              <input
                type="file"
                className={`form-control ${validationErrors.document_file ? 'is-invalid' : ''}`}
                id="document_file"
                name="document_file"
                onChange={handleChange}
                required
              />
              {validationErrors.document_file && (
                <div className="invalid-feedback d-block">
                  {validationErrors.document_file}
                </div>
              )}
            </div>

            <div className="col-12 mt-3">
              <label htmlFor="resignation_reason" className="form-label">
                Reason<span className="text-danger">*</span>
              </label>
              <textarea
                className={`form-control ${validationErrors.resignation_reason ? 'is-invalid' : ''}`}
                id="resignation_reason"
                name="resignation_reason"
                value={formData.resignation_reason}
                onChange={handleChange}
                rows="3"
              ></textarea>
              {validationErrors.resignation_reason && (
                <div className="invalid-feedback d-block">
                  {validationErrors.resignation_reason}
                </div>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>

        <Button 
  variant="success" 
  onClick={handleSaveResignationRecord}
  disabled={isSaving}
>
  {isSaving ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Saving...
    </>
  ) : (
    'Save'
  )}
</Button>

     
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
  </>
  );
};

export default CreateResignation;