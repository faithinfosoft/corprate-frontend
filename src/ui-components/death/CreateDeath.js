import React, { useState, useEffect } from "react";
import axios from "axios";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import { useNavigate } from 'react-router-dom';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Select from 'react-select';
import { convertDateFormat } from '../../utilities/dateconverter';
const CreateDeath = () => {
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
    death_date: "",
    death_reason: "",
  });
  //console.log(selectedStaff);
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


  // Open Modal for Selected Staff
  const openModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({ death_date: "", death_reason: "", service_end_date: "" });
    setValidationErrors({});
    setShowModal(true);
  };

  // Close Modal
  const closeModal = () => {
    setValidationErrors({});
    setShowModal(false);
  };

  // Handle Form Change in Modal
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      if (name === 'start_date') {
        if (newData.end_date && new Date(newData.end_date) <= new Date(value)) {
          newData.end_date = '';
        }
      }
      return newData;
    });

    // Clear only create form errors
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Save Death Record
  const handleSaveDeathRecord = async () => {
    let errors = {};


    // if (!selectedStaff?.latest_service_record?.end_date && !formData.service_end_date) {
    //   errors.service_end_date = "Service End Date is required.";
    // }
    // if (!formData.death_date) {
    //   errors.death_date = "Death date is required.";
    // }


    // if (!formData.death_reason) {
    //   errors.death_reason = "Reason is required.";
    // }


    // if (Object.keys(errors).length > 0) {
    //   setValidationErrors(errors);
    //   return;
    // }
    setIsSaving(true);

    const dataToSend = {
      staff_school_id: selectedStaff.staff_school_id,
      staff_id: selectedStaff.staff_id,
      name: selectedStaff.name,
      gender: selectedStaff.gender,
      death_date: formData.death_date, // Backend validates this
      death_reason: formData.death_reason, // Backend validates this
      service_id: selectedStaff.latest_service_record.service_id,
      service_end_date: selectedStaff?.latest_service_record?.end_date && 
      selectedStaff?.latest_service_record?.end_date !== '0000-00-00' ?
      selectedStaff?.latest_service_record?.end_date :
      formData.service_end_date,
      //service_end_date: formData.service_end_date || "",
    };

    try {
      const response = await axios.post(`${globalVariables.api_url}/death/create`, dataToSend, {
        headers: { "Content-Type": "application/json" }, // Ensure JSON format
      });
      if (response.data.status) {
        print_toast("success", "Death record added successfully.");
        setStaff(prevStaffList => prevStaffList.filter(staff => staff.staff_id !== selectedStaff.staff_id));
        navigate("/staff-death-details/death-details")
        closeModal();
      } else {
        if (response.data.error) {
          setValidationErrors(response.data.error); // Handle backend validation errors if any
        } else {
          print_toast("error", "Failed to save death record.");
        }
      }
    } catch (error) {
      console.error("Error saving death record:", error);
      if (error.response?.data?.error) {
        setValidationErrors(error.response.data.error); // Capture backend validation errors
      } else {
        print_toast("error", "Error saving death record.");
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


  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value, // Handle file input correctly
    }));

    // Clear validation errors when user inputs data
    if (validationErrors?.[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const convertDate = (dateString) => {
    if (!dateString) return ""; // Return empty if no date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Return empty if invalid date
    return date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };

  const handleSchoolChange = (selectedOption) => {
    const schoolId = selectedOption.value;
    setSelectedSchool(schoolId); // Update the selected school state
    fetchStaff(schoolId);
  };

  return (
    <div className="">
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

          {/* Staff Table */}
          {/* Loading State */}
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
          {!isLoading && staff.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Sl No.</th>
                    <th>PEN No.</th>
                    <th>Staff Name</th>
                    <th>Gender</th>
                    <th>Designation</th>
                    <th>Service Start Date</th>
                    <th>Service End Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((person, index) => (
                    <tr key={person.staff_id}>
                      <td>{index + 1}</td>
                      <td>{person.pen_no}</td>
                      <td><a href={`/staffdetails/${person.encrypted_staff_id}`}
                        className="nav-link reports"
                        style={{ color: 'blue', textDecoration: 'none' }}
                        target="_blank"
                        rel="noopener noreferrer"
                      >{person.staff_official_name}</a></td>
                      <td>{person.gender}</td>
                      <td>{person.latest_service_record?.designation_name || "Not Assigned"}</td>
                      <td>{convertDateFormat(person.latest_service_record?.start_date)}</td>
                      <td>{convertDateFormat(person.latest_service_record?.end_date)}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => openModal(person)}
                        >
                          Set Obituary
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

      {/* Modal for Death Record */}
      <Modal show={showModal} onHide={closeModal} backdrop='static'>
        <Modal.Header closeButton>
          <Modal.Title>Add Obituary Record</Modal.Title>
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
    value={
      selectedStaff?.latest_service_record?.end_date && 
      selectedStaff?.latest_service_record?.end_date !== '0000-00-00' ? 
      convertDate(selectedStaff?.latest_service_record?.end_date) : 
      formData.service_end_date || ""
    }
    onChange={handleCreateInputChange}
    readOnly={
      selectedStaff?.latest_service_record?.end_date && 
      selectedStaff?.latest_service_record?.end_date !== '0000-00-00'
    }
  />
  {validationErrors.service_end_date && (
    <div className="invalid-feedback d-block">
      {validationErrors.service_end_date}
    </div>
  )}
</div>
{/* 
            <div className="mb-3">
              <label className="form-label">
                Service End Date<span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="service_end_date"
                name="service_end_date"
                value={formData.service_end_date || ""}
                onChange={handleCreateInputChange}

              />

            
              {validationErrors.service_end_date && (
                <div className="invalid-feedback d-block">
                  {validationErrors.service_end_date}
                </div>
              )}
            </div> */}

            <div className="mb-3">
              <label className="form-label">Date of Obituary<span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                id="death_date"
                name="death_date"
                max={today}
                value={formData.death_date}
                onChange={handleCreateInputChange}
              />
              {validationErrors.death_date && (
                <div className="invalid-feedback d-block">
                  {validationErrors.death_date}
                </div>
              )}
            </div>
            <div className="col-12">
              <label htmlFor="death_reason" className="form-label">
                Reason<span className="text-danger">*</span>
              </label>
              <textarea
                className={`form-control ${validationErrors.reason_of_leave ? 'is-invalid' : ''}`}
                id="death_reason"
                name="death_reason"
                value={formData.death_reason}
                onChange={handleChange}
                rows="3"

              ></textarea>
              {validationErrors.death_reason && (
                <div className="invalid-feedback d-block">
                  {validationErrors.death_reason}
                </div>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>

          <Button
            variant="success"
            onClick={handleSaveDeathRecord}
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

          {/* <Button variant="success" onClick={handleSaveDeathRecord}>
            Save
          </Button> */}
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>

        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CreateDeath;
