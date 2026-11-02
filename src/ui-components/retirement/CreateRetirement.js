import React, { useState, useEffect } from "react";
import axios from "axios";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import { useNavigate } from 'react-router-dom';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { convertDateFormat } from '../../utilities/dateconverter';

const CreateRetirement = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const today = new Date().toISOString().split("T")[0];
  const [isLoading, setIsLoading] = useState(false);
  const [staffMessage, setStaffMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [retirementDate, setRetirementDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    death_date: "",
    death_reason: "",
  });

  // Fetch Academic Years
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/retirement/get_academic_years`);
      if (response.data.status) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error.message);
      print_toast("error", "Failed to fetch academic years");
    }
  };

  // Handle Academic Year Selection and Fetch Staff
  const handleAcademicYearSelect = (yearId) => {
    setSelectedYear(yearId);
    setStaff([]);
    setSelectedStaffIds([]);
    setRetirementDate("");
    
    if (yearId) {
      fetchStaffByYear(yearId);
    }
  };

  // Fetch Staff Based on Selected Academic Year
// Fetch Staff Based on Selected Academic Year
const fetchStaffByYear = async (yearId) => {
  if (!yearId) return;

  setIsLoading(true);  // Set loading state
  setStaffMessage("");  // Clear any existing message

  try {
    // Fetch staff data from the backend for the selected academic year
    const response = await axios.get(`${globalVariables.api_url}/retirement/get_retirement_staff_academicyear/${yearId}`);

    console.log("Full Response:", response);  // Full response object
    console.log("Response Keys:", Object.keys(response));  // Inspect available keys
    console.log("Response Data:", response.data);  // The actual data part (expected to be an array)

    const staffData = response.data;  // Directly use response.data as it’s already an array

    if (Array.isArray(staffData) && staffData.length > 0) {
      setStaff(staffData);  // Update state with the fetched staff array
      console.log("Fetched staff data:", staffData);
    } else {
      setStaff([]);  // Set an empty array if no data is found
      setStaffMessage("No staff data found for the selected academic year.");
    }
  } catch (error) {
    console.error("Error fetching staff:", error);  // Log any errors during the fetch
    setStaff([]);
    setStaffMessage("Error loading staff data. Please try again.");
  } finally {
    setIsLoading(false);  // Reset loading state
  }
};

  
  // Handle Checkbox Change
  const handleCheckboxChange = (staffId) => {
    setSelectedStaffIds(prev => {
      if (prev.includes(staffId)) {
        return prev.filter(id => id !== staffId);
      } else {
        return [...prev, staffId];
      }
    });
  };

  // Handle Retirement Date Change
  const handleRetirementDateChange = (e) => {
    setRetirementDate(e.target.value);
    setValidationErrors(prev => ({ ...prev, retirementDate: '' }));
  };

  // Handle Save Retirement
const handleSaveRetirement = async () => {
  // Validation
  if (selectedStaffIds.length === 0) {
    print_toast("error", "Please select at least one staff member.");
    return;
  }
  
  if (!retirementDate) {
    setValidationErrors(prev => ({ ...prev, retirementDate: 'Retirement date is required' }));
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    // Get staff data for selected IDs
    const staffToRetire = staff.filter(person => selectedStaffIds.includes(person.staff_id));
    console.log(staffToRetire);
    // Format data for API
    const dataToSend = staffToRetire.map(person => ({
      staff_school_id: person.staff_school_id	,
      staff_id: person.staff_id,
      name: person.staff_official_name,
      retirement_date: retirementDate,
      service_id:person.latest_service_record.service_id
    }));
    
    // Send data to API
    const response = await axios.post(`${globalVariables.api_url}/retirement/create_retirement`, dataToSend, {
      headers: { "Content-Type": "application/json" }
    });
    
    if (response.data.status) {
      print_toast("success", response.data.message || "Retirement records added successfully.");
      navigate("/staff-retirement-details/retirement-details")
      // Remove retired staff from the list
      setStaff(prev => prev.filter(person => !selectedStaffIds.includes(person.staff_id)));
      
      // Reset selections
      setSelectedStaffIds([]);
      setRetirementDate("");
    } else {
      if (response.data.error) {
        if (typeof response.data.error === 'object') {
          setValidationErrors(response.data.error);
        } else {
          print_toast("error", response.data.message || "Failed to save retirement records.");
        }
      } else {
        print_toast("error", response.data.message || "Failed to save retirement records.");
      }
    }
  } catch (error) {
    console.error("Error saving retirement records:", error);
    print_toast("error", "Error saving retirement records: " + (error.response?.data?.message || error.message));
  } finally {
    setIsSubmitting(false);
  }
};



  // Helper function for date conversion
  const convertDate = (dateString) => {
    if (!dateString) return ""; 
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; 
    return date.toISOString().split("T")[0]; 
  };

  return (
    <div className="">
      <div className="card border-top-0 rounded-0">
      
        <div className="card-body">
          <div className="row mb-3">
            {/* Academic Year Dropdown */}
            <div className="col-md-6 mb-3">
              <label className="form-label">Academic Year<span className="text-danger">*</span></label>
              <select
                id="academic_year_id"
                className="form-select"
                value={selectedYear}
                onChange={(e) => handleAcademicYearSelect(e.target.value)} 
                required
              >
                <option value="">Select Year</option>
                {academicYears.map((year) => (
                  <option key={year.academic_year_id} value={year.academic_year_id}>
                    {year.year_label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Retirement Date Input (Enabled when checkboxes are selected) */}
          {staff.length > 0 && (
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Retirement Date<span className="text-danger">*</span></label>
                <input name="retirementDate"
                  type="date"
                  className={`form-control ${validationErrors.retirementDate ? 'is-invalid' : ''}`}
                  value={retirementDate}
                  onChange={handleRetirementDateChange}
                  disabled={selectedStaffIds.length === 0}
                />
                {validationErrors.retirementDate && (
                  <div className="invalid-feedback">
                    {validationErrors.retirementDate}
                  </div>
                )}
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <button 
                  className="btn btn-danger"
                  onClick={handleSaveRetirement}
                  disabled={selectedStaffIds.length === 0  || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : (
                    'Set Retirement'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="d-flex justify-content-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* No Staff Message */}
          {selectedYear && staffMessage && (
            <div className="alert alert-info mt-3" role="alert">
              {staffMessage}
            </div>
          )}

          {/* Staff Table */}
          {staff.length > 0 && (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="bg-light">
                  <tr>
                  <th>Sl No.</th>
                    <th>Select</th>
                   
                    <th>School</th>
                  
                    <th>Staff Name</th>
                    <th>Designation</th>
                    <th>DOJ</th>
                    <th>Commencement Date</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((person, index) => (
                    <tr key={person.staff_id}>
                       <td>{index + 1}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedStaffIds.includes(person.staff_id)}
                          onChange={() => handleCheckboxChange(person.staff_id)}
                        />
                      </td>
                     
                      <td>{person.school_location	 || 'N/A'}</td>
                     
                      <td>
                        <a href={`/staffdetails/${person.encrypted_staff_id}`}
                          className="nav-link reports"
                          style={{ color: 'blue', textDecoration: 'none' }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {person.staff_official_name}
                        </a>
                      </td>
                      <td>{person.latest_service_record?.designation_name	 || "Not Assigned"}</td>
                      <td>{convertDateFormat(person.start_date)}</td>
                      <td>{convertDateFormat(person.commencement_date	)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRetirement;