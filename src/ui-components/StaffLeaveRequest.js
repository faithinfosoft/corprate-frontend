import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import Modal from "react-bootstrap/Modal";
import "react-datepicker/dist/react-datepicker.css";
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";
import useAuth from "../utilities/useAuth";
import Breadcum from "./Breadcum";
import NoDataFound from "./NoDataFound";
import { Link } from "react-router-dom";
import { convertDateFormat } from '../utilities/dateconverter';
import { useNavigate} from 'react-router-dom';
import SecureLink from "./SecureLink";

const StaffLeaveRequest = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const auth = useAuth();
  const { username, user_id } = auth.user;
  const school_id = auth.user.school_id;
  const [loaded, setLoaded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'My Leave Requests', Link: '' },
  ]);
  const [userData, setUserData] = useState(null);

  const [formData, setFormData] = useState({
    leave_id: "",
    fk_staff_id: user_id,
    fk_school_id: school_id,
    start_date: new Date(),
    end_date: new Date(),
    no_of_days: 1,
    nature_of_leave: "",
    leave_type: "Personal Affairs",
    medical_certificate_file: null,
    reason_of_leave: "",
    leave_status: "Pending",
    created_by: username,
    approved_on: null,
    approved_by: null,
    remarks: "",
    department_office_section:'',
    pay:'',
    scale_of_pay:'',

  });

  const leaveNatures = [
    "Half Pay Leave",
    "Leave without  Allowance",
    "Maternity Leave",
    "Commuted Leave",
  ];

  const handleSendLetter = (leave) => {
    // Redirect to the desired page with the leave ID or details
    navigate(`/leave-application-letter/${leave.leave_id}`, { state: { leaveData: leave } });
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/leave/view/${user_id}`
      );

      if (response.data.status) {
        const data = response.data.data;

        if (data.length > 0) { // Ensure data is not empty
          const firstRecord = data[0]; // Get the first record
      
          const address = [
            firstRecord.present_address,
            firstRecord.present_place,
            firstRecord.present_city,
            firstRecord.present_district,
            firstRecord.present_state,
            firstRecord.present_pin_no,
          ]
            .filter((field) => field) // Remove empty values
            .join(", "); 
      
          const userInfo = {
            name_of_applicant: firstRecord.staff_name,  // Extract staff_name
            address: address,
            dob: firstRecord.dob,
            designation: firstRecord.designation,
            commencement_date: convertDateFormat(firstRecord.commencement_date),
            doj: convertDateFormat(firstRecord.doj),
            
          };
      
          setUserData(userInfo);
      
          setFormData(prevState => ({
            ...prevState,
            ...userInfo
          }));
        }
      } // <-- Missing closing bracket added here
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
}, [user_id]);


  const fetchLeaves = useCallback(async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/leave/view/${user_id}`
      );
      if (response.data.status) {
        setLeaves(response.data.data);
      } 
    } catch (error) {
      console.error("Error fetching leaves:", error);
      // print_toast("error", "Failed to fetch leaves");
    } finally {
      setLoaded(true);
    }
  }, [user_id]);

  useEffect(() => {
    fetchLeaves();
    fetchUserData();
  }, [fetchLeaves, fetchUserData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "medical_certificate_file") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: files[0],
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const handleDateChange = (date, name) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: date,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const calculateDays = useCallback(() => {
    const diffTime = Math.abs(formData.end_date - formData.start_date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setFormData((prevState) => ({
      ...prevState,
      no_of_days: diffDays,
    }));
  }, [formData.start_date, formData.end_date]);

  useEffect(() => {
    calculateDays();
  }, [formData.start_date, formData.end_date, calculateDays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode
        ? `${globalVariables.api_url}/leave/update`
        : `${globalVariables.api_url}/leave/create`;

      const dataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "start_date" || key === "end_date") {
          dataToSend.append(key, formData[key].toISOString().split("T")[0]);
        } else {
          dataToSend.append(key, formData[key]);
        }
      });

      dataToSend.append("username", username);

      const response = await axios.post(url, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchLeaves();
        setModalIsOpen(false);
        setValidationErrors({});
      } else {
        if (response.data.error) {
          setValidationErrors(response.data.error);
        }
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error saving/updating leave request:", error);
      print_toast("error", "Failed to save/update leave request");
    }
  };

  const handleOpenModal = (leave = null) => {
    setValidationErrors({});
    
    if (leave) {
      // For edit mode, combine user data with leave data
      if (userData) {
        setFormData({
          ...userData, // Personal info from userData
          ...leave,    // Leave specific data
          fk_school_id: school_id,
          start_date: new Date(leave.start_date),
          end_date: new Date(leave.end_date),
        });
      } else {
        // Fallback if userData is not available
        setFormData(prevState => ({
          ...prevState,
          ...leave,
          fk_school_id: school_id,
          start_date: new Date(leave.start_date),
          end_date: new Date(leave.end_date),
        }));
      }
      setEditMode(true);
    } else {
      // For new leave, keep personal info but reset leave fields
      if (userData) {
        setFormData({
          ...userData,
          leave_id: "",
          fk_staff_id: user_id,
          fk_school_id: school_id,
          start_date: new Date(),
          end_date: new Date(),
          no_of_days: 1,
          nature_of_leave: "",
          reason_of_leave: "",
          leave_status: "Pending",
          created_by: username,
          approved_on: null,
          approved_by: null,
          remarks: "",
          department_office_section: "",
          pay: "",
          scale_of_pay: ""
        });
      } else {
        setFormData(prevState => ({
          ...prevState,
          leave_id: "",
          fk_staff_id: user_id,
          fk_school_id: school_id,
          start_date: new Date(),
          end_date: new Date(),
          no_of_days: 1,
          nature_of_leave: "",
          reason_of_leave: "",
          leave_status: "Pending",
          created_by: username,
          approved_on: null,
          approved_by: null,
          remarks: "",
          department_office_section: "",
          pay: "",
          scale_of_pay: ""
        }));
      }
      setEditMode(false);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setValidationErrors({});
  };

  const handleDelete = async (leaveId) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/leave/delete`,
          { leave_id: leaveId }
        );
        if (response.data.status) {
          print_toast("success", response.data.message);
          setLeaves((prevLeaves) => prevLeaves.filter(leave => leave.leave_id !== leaveId));

          await fetchLeaves(); 
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting leave request:", error);
        print_toast("error", "Failed to delete leave request");
      }
    }
  };

  return (
    <>
      <Breadcum items={breadcum} title="My Leave Requests" />

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center" style={{ borderTop: "4px solid #0ea5e9" }}>
              <h5 className="card-title mb-0 text-dark fw-bold">Leave Request History</h5>
             <Link to="/create-leave-request" style={{ color: 'white', textDecoration: 'none' }} className="btn btn-danger">
                 Apply Leave Request
               </Link>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted">
                    <tr>
                      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Sl No.</th>
                      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Start Date</th>
                      <th scope="col" className="text-center fw-semibold py-3 border-bottom">End Date</th>
                      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Days</th>
                      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Nature of Leave</th>
                      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Reason</th>
                      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Status</th>
                      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
  {loaded && leaves.length === 0 ? (
    <tr>
      <td colSpan="8">
        <NoDataFound />
      </td>
    </tr>
  ) : (
    leaves.map((leave, index) => {
      // Define row color based on leave status
      let rowStyle = {};
      if (leave.leave_status === 'Approved') {
        rowStyle = { backgroundColor: '#d4edda' }; // Light green
      } else if (leave.leave_status === 'Rejected') {
        rowStyle = { backgroundColor: '#f8d7da' }; // Light red
      } else if (leave.leave_status === 'Pending') {
        rowStyle = { backgroundColor: '#fff3cd' }; // Light yellow
      }

      return (
        <tr key={leave.leave_id} style={rowStyle}>
          <td className="text-center">{index + 1}</td>
          <td className="text-center">
            {convertDateFormat(leave.start_date)}
          </td>
          <td className="text-center">
            {convertDateFormat(leave.end_date)}
          </td>
          <td className="text-center">{leave.no_of_days}</td>
          <td className="text-center">{leave.nature_of_leave}</td>
          <td className="text-center">{leave.reason_of_leave}</td>
          <td className="text-center">{leave.leave_status}</td>
          <td className="text-center align-middle">
            <div className="d-flex justify-content-center align-items-center gap-2">
              {/* Primary Action Button */}
              {leave.application_letter_status === "draft" ? (
                <button
                  className="btn btn-success btn-sm rounded px-3 shadow-sm d-flex align-items-center"
                  onClick={() => handleSendLetter(leave)}
                  title="Send Leave Application"
                >
                  <i className="bi bi-send-fill me-2"></i> Send
                </button>
              ) : (
                <SecureLink 
                  href={`${globalVariables.api_url}/secure_file/staff_leave_application_letter/${leave.application_letter_document}`} 
                  className="btn btn-primary btn-sm rounded px-3 shadow-sm d-flex align-items-center text-white"
                  title="View Leave Application"
                >
                  <i className="bi bi-file-earmark-pdf-fill me-2"></i> View
                </SecureLink>
              )}

              {/* Secondary Actions Dropdown */}
              {(leave.application_letter_status === "draft" || (calculateDuration(leave.start_date, leave.end_date) > 45 && leave.leave_status === "Approved")) && (
                <div className="dropdown">
                  <button
                    className="btn btn-outline-secondary btn-sm rounded px-2 shadow-sm d-flex align-items-center"
                    type="button"
                    id={`dropdownMenuButton${index}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    title="More actions"
                  >
                    <i className="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1" aria-labelledby={`dropdownMenuButton${index}`}>
                    {leave.application_letter_status === "draft" && (
                      <>
                        <li>
                          <button className="dropdown-item py-2" onClick={() => handleOpenModal(leave)}>
                            <i className="bi bi-pencil-square me-2 text-primary"></i> Edit
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item py-2 text-danger" onClick={() => handleDelete(leave.leave_id)}>
                            <i className="bi bi-trash-fill me-2"></i> Delete
                          </button>
                        </li>
                      </>
                    )}
                    {calculateDuration(leave.start_date, leave.end_date) > 45 && leave.leave_status === "Approved" && (
                      <>
                        {leave.application_letter_status === "draft" && <li><hr className="dropdown-divider" /></li>}
                        <li>
                          <button
                            className="dropdown-item py-2"
                            onClick={() => {
                              setSelectedLeave(leave); // Update state first
                            }}
                          >
                            <i className="bi bi-file-earmark-text me-2 text-secondary"></i> Generate Leave Letter
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </td>
        </tr>
      );
    })
  )}
</tbody>

                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      <Modal show={modalIsOpen} onHide={closeModal} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>{editMode ? "Edit Leave Request" : "New Leave Request"}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={handleSubmit} className="row g-3">
      {/* Validation Errors Alert */}
      {Object.keys(validationErrors).length > 0 && (
        <div className="col-12">
          <div className="alert alert-danger mb-3 py-2">
            <h6 className="alert-heading mb-1 fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>Please correct the following errors:</h6>
            <ul className="mb-0 ps-3">
              {Object.entries(validationErrors).map(([field, msg]) => (
                <li key={field} className="small">{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Personal Information Section */}
      <div className="col-md-12">
        <label className="form-label">Name of Applicant</label>
        <input
          type="text"
          name="name_of_applicant"
          value={formData.name_of_applicant || ''}
          onChange={handleChange}
          className="form-control"
          readOnly
        />
      </div>
      
      <div className="col-md-12">
        <label className="form-label">Date of Birth</label>
        <input
          type="text"
          name="dob"
          value={convertDateFormat(formData.dob )|| ''}
          onChange={handleChange}
          className="form-control"
          readOnly
        />
      </div>
      
      <div className="col-md-12">
        <label className="form-label">Post held</label>
        <input
          type="text"
          name="designation"
          value={formData.designation || ''}
          onChange={handleChange}
          className="form-control"
          readOnly
        />
      </div>
      
      <div className="col-md-12">
        <label className="form-label">Department/Office and Section</label>
        <input
          type="text"
          name="department_office_section"
          value={formData.department_office_section || ''}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      
      {/* Employment Details Section */}
      <div className="col-md-12">
        <label className="form-label">Pay</label>
        <input
          type="text"
          name="pay"
          value={formData.pay || ''}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      
      <div className="col-md-12">
        <label className="form-label">Scale of Pay</label>
        <input
          type="text"
          name="scale_of_pay"
          value={formData.scale_of_pay || ''}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      
      <div className="col-md-12">
        <label className="form-label">Date of entry in service</label>
        <input
          type="text"
          name="doj"
          value={formData.doj || ''}
          onChange={handleChange}
          className="form-control"
          readOnly
        />
      </div>
      
      <div className="col-md-12">
        <label className="form-label">Date of commencement of continuous service</label>
        <input
          type="text"
          name="commencement_date"
          value={convertDateFormat(formData.commencement_date) || ''}
          onChange={handleChange}
          className="form-control"
          readOnly
        />
      </div>
      
      <div className="col-12">
        <label className="form-label">Whether the applicant has got confirmation in any post, if so from which date in which post</label>
        <input
          type="text"
          name="confirmation"
          value={formData.confirmation || ''}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      
      <div className="col-12">
        <label className="form-label">Address during leave</label>
        <input
          type="text"
          name="address"
          value={formData.address || ''}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      
      <div className="col-12">
        <label className="form-label">House Rent Allowance, Conveyance Allowance or other compensatory allowance drawn in the present post</label>
        <input
          type="text"
          name="allowances"
          value={formData.allowances || ''}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      
      {/* Leave Details Section */}
      <div className="col-md-12">
        <label htmlFor="nature_of_leave" className="form-label">
          Nature of Leave <span className="text-danger">*</span>
        </label>
        <select
          className={`form-control ${validationErrors.nature_of_leave ? 'is-invalid' : ''}`}
          id="nature_of_leave"
          name="nature_of_leave"
          value={formData.nature_of_leave || ''}
          onChange={handleChange}
          required
        >
          <option value="">Select Nature of Leave</option>
          {leaveNatures.map((nature, index) => (
            <option key={index} value={nature}>
              {nature}
            </option>
          ))}
        </select>
        {validationErrors.nature_of_leave && (
          <div className="invalid-feedback d-block">
            {validationErrors.nature_of_leave}
          </div>
        )}
      </div>
      
 
      

      {/* Date Selection Section */}
      <div className="col-md-12">
        <label htmlFor="start_date" className="form-label">
          Start Date<span className="text-danger">*</span>
        </label>
        <DatePicker
          id="start_date"
          selected={formData.start_date}
          onChange={(date) => handleDateChange(date, "start_date")}
          className={`form-control ${validationErrors.start_date ? 'is-invalid' : ''}`}
          dateFormat="dd-MM-yyyy"
          required
        />
        {validationErrors.start_date && (
          <div className="invalid-feedback d-block">
            {validationErrors.start_date}
          </div>
        )}
      </div>
      
      <div className="col-md-12">
        <label htmlFor="end_date" className="form-label">
          End Date<span className="text-danger">*</span>
        </label>
        <DatePicker
          id="end_date"
          selected={formData.end_date}
          onChange={(date) => handleDateChange(date, "end_date")}
          className={`form-control ${validationErrors.end_date ? 'is-invalid' : ''}`}
          dateFormat="dd-MM-yyyy"
          minDate={formData.start_date}
          required
        />
        {validationErrors.end_date && (
          <div className="invalid-feedback d-block">
            {validationErrors.end_date}
          </div>
        )}
      </div>
      

      <div className="col-md-12">
        <label className="form-label">Sundays and Holidays if any proposed to be Prefixed/Suffixed on leav</label>
        <input
          type="text"
          name="sundays_holidays"
          value={formData.sundays_holidays || ''}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      
      <div className="col-12">
        <label htmlFor="reason_of_leave" className="form-label">
        Ground on which leave is applied for <span className="text-danger">*</span>
        </label>
        <textarea
          className={`form-control ${validationErrors.reason_of_leave ? 'is-invalid' : ''}`}
          id="reason_of_leave"
          name="reason_of_leave"
          value={formData.reason_of_leave || ''}
          onChange={handleChange}
          rows="3"
          required
        ></textarea>
        {validationErrors.reason_of_leave && (
          <div className="invalid-feedback d-block">
            {validationErrors.reason_of_leave}
          </div>
        )}
      </div>
      
      <div className="col-12">
        <label className="form-label">Date of return from last leave and the nature and period of that leave</label>
        <input
          type="text"
          name="last_leave"
          value={formData.last_leave || ''}
          onChange={handleChange}
          className="form-control"
        />
      </div>
      
      <div className="col-12 mt-4 text-end">
      <button type="submit" className="btn btn-success me-2">
         Update
        </button>
        <button type="button" className="btn btn-secondary " onClick={closeModal}>
          Cancel
        </button>
     
      </div>
    </form>
  </Modal.Body>
</Modal>

    </>
  );
};

export default StaffLeaveRequest;