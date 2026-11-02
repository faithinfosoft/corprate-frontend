import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { convertDateFormat, capitalizeWords } from "../../utilities/dateconverter.js";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import useAuth from "../../utilities/useAuth.js";
import { useParams } from 'react-router-dom';
import Breadcum from '.././Breadcum';
import Select from 'react-select';

const VacancyAppointment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [staffLoading, setStaffLoading] = useState(false);
  const [vacancyDetails, setVacancyDetails] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const auth = useAuth();
  const { user_id } = auth.user;
  const userType = auth.user.user_type;
  const { vacancy_id } = useParams();
    const [errorMessage, setErrorMessage] = useState('');
     const [natureOptions, setNatureOptions] = useState([]);
  const [formData, setFormData] = useState({
    vacancy_id: vacancy_id || "",
    appointment_date: "",
    appointment_mode: "",
    staff_id: "",
    remarks: "",
    fk_school_id: "",
  });
  
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedStaffOption, setSelectedStaffOption] = useState(null); // For react-select
  
  const [selectedStaff, setSelectedStaff] = useState({
    staff_name: "",
    school_location: "",
    current_designation: "",
    staff_school_id: "",
    service_id: ""
  });
  
  const [validationErrors, setValidationErrors] = useState({});
  
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Appointment Details', Link: '/Appointment/current-vacancy' },
    { Title: 'Create Appointment', Link: '' },
  ]);

  // Fetch schools function
  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/schools`);
      if (response.data.status) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching schools:", error.message);
      print_toast("error", "Failed to fetch school data");
    }
  };

  // Fetch vacancy details
  const fetchVacancyDetails = async (vacancyId) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('vacancy_id', vacancyId);
      
      const response = await axios.post(
        `${globalVariables.api_url}/vacancy/get_vacancy_by_id`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      if (response.data.status) {
        setVacancyDetails(response.data.data);
        setFormData(prev => ({
          ...prev,
          vacancy_id: vacancyId
        }));
      } else {
        print_toast("error", "Failed to fetch vacancy details");
      }
    } catch (error) {
      console.error("Error fetching vacancy details:", error);
      print_toast("error", "An error occurred while fetching vacancy details");
    } finally {
      setLoading(false);
    }
  };

  // Fetch staff list based on school selection
  const fetchStaffList = async (school_id) => {
    try {
      setStaffLoading(true);
      
      // Reset staff selection
      setFormData(prev => ({
        ...prev,
        staff_id: ""
      }));
      setSelectedStaffOption(null);
      setSelectedStaff({
        staff_name: "",
        school_location: "",
        current_designation: "",
        staff_school_id: "",
        service_id: ""
      });
      
      const params = new URLSearchParams();
      params.append('school_id', school_id);
      params.append('userType', userType);
      
      const response = await axios.post(
        `${globalVariables.api_url}/staff-appointment/get_all_staff`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      if (response.data.status) {
        setStaffList(response.data.data);
      } else {
        setStaffList([]);
        print_toast("info", response.data.message || "No eligible staff found");
      }
    } catch (error) {
      console.error("Error fetching staff list:", error);
      print_toast("error", "Failed to fetch eligible staff");
      setStaffList([]);
    } finally {
      setStaffLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation errors
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle school selection from react-select
  const handleSchoolChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setSelectedSchool(value);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      fk_school_id: value
    }));

    // Clear validation errors
    if (validationErrors.fk_school_id) {
      setValidationErrors(prev => ({
        ...prev,
        fk_school_id: ''
      }));
    }
    
    // Fetch staff list if school is selected
    if (value) {
      fetchStaffList(value);
    } else {
      setStaffList([]);
      setFormData(prev => ({
        ...prev,
        staff_id: ""
      }));
      setSelectedStaffOption(null);
      setSelectedStaff({
        staff_name: "",
        school_location: "",
        current_designation: "",
        staff_school_id: "",
        service_id: ""
      });
    }
  };

  // Handle staff selection from react-select
  const handleStaffChange = (selectedOption) => {
    const staffId = selectedOption ? selectedOption.value : "";
    setSelectedStaffOption(selectedOption);
    
    setFormData(prev => ({
      ...prev,
      staff_id: staffId
    }));

    // Clear validation errors
    if (validationErrors.staff_id) {
      setValidationErrors(prev => ({
        ...prev,
        staff_id: ''
      }));
    }
    
    if (staffId) {
      const selectedStaffMember = staffList.find(staff => staff.staff_details.staff_id === staffId);
      if (selectedStaffMember) {
        setSelectedStaff({
          school_name: selectedStaffMember.school_name	 || "",
          designation_name: selectedStaffMember.current_designation		 || "",
          staff_name: selectedStaffMember.staff_details.staff_official_name || "",
          school_location: selectedStaffMember.staff_details.school_location || "",
          pen_no: selectedStaffMember.staff_details.pen_no || "",
           staff_type: selectedStaffMember.staff_details.staff_type || "",
          current_designation: selectedStaffMember.current_designation || "",
          staff_school_id: selectedStaffMember.staff_details.staff_school_id || "",
          fk_school_id: selectedStaffMember.staff_details.fk_school_id || "",
          service_id: selectedStaffMember.service_record.service_id || ""
        });
      }
    } else {
      setSelectedStaff({
        staff_name: "",
        school_location: "",
        current_designation: "",
        staff_school_id: "",
        service_id: ""
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const dataToSend = {
        ...formData,
        created_by: user_id,
        vacancy_date: vacancyDetails?.vacancy_start_date || null,
        staff_school_id: selectedStaff?.staff_school_id || null,
        school_id: selectedStaff?.fk_school_id || null,
        school_name: selectedStaff?.school_name || null,
        staff_name : selectedStaff?.staff_name|| null,
        designation_name : selectedStaff?.designation_name	|| null,
        service_id: selectedStaff?.service_id || null,
        vacancy_school_id: vacancyDetails?.fk_school_id || null,
        vacancy_designation_id: vacancyDetails?.fk_designation_id	 || null,
      };
      
      const response = await axios.post(
        `${globalVariables.api_url}/staff-appointment/save_appointment`,
        dataToSend
      );
      
      if (response.data.status) {
        print_toast("success", "Appointment created successfully");
        navigate("/appointment");
      } else {
        console.log("Response data:", response.data);
        
        if (response.data.error) {
          setValidationErrors(response.data.error);
          const firstErrorField = Object.keys(response.data.error)[0];
          const firstErrorMessage = response.data.error[firstErrorField];
          print_toast("error", firstErrorMessage);
        } else {
          print_toast("error", response.data.message || "Failed to create appointment");
        }
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setValidationErrors(error.response.data.error);
        const firstErrorField = Object.keys(error.response.data.error)[0];
        const firstErrorMessage = error.response.data.error[firstErrorField];
        print_toast("error", 'Validation Error');
      } else {
        print_toast("error", "An error occurred while creating the appointment");
      }
    } finally {
      setLoading(false);
    }
  };

  // useEffect hooks
  useEffect(() => {
    if (vacancy_id) {
      fetchVacancyDetails(vacancy_id);
    } else {
      print_toast("error", "Vacancy details not found");
      navigate("/appointment-details");
    }
  }, [vacancy_id, navigate]);

  useEffect(() => {
    fetchSchools();
  }, []);

  // Appointment mode options
    
        useEffect(() => {
        fetchNatureofVacancy();
       
      }, []);
    
    
        const fetchNatureofVacancy = async () => {
        try {
          const response = await axios.get(`${globalVariables.api_url}/vacancy/get_nature_vacancies`);
       if (response.data.status) {
          // Transform the object data into array format expected by the select
          const transformedData = Object.entries(response.data.data)
        .filter(([key, value]) => ['transfer', 'transfer_with_promotion', 'promotion'].includes(key))
        .map(([key, value]) => ({
          value: key,
          label: value
        }));
          setNatureOptions(transformedData);
        }
        } catch (error) {
          setErrorMessage('Failed to fetch schools');
        }
      };

  const today = new Date().toISOString().split("T")[0];

  // School options for react-select
  const schoolOptions = schools.map((school) => ({
    value: school.school_id,
    label: `${school.location} ${school.school_name}`
  }));

  // Staff options for react-select
  const staffOptions = staffList.map((staff) => ({
    value: staff.staff_details.staff_id,
    label: `${staff.staff_details.staff_official_name} - ${staff.current_designation}`
  }));

  return (
    <>
      <Breadcum items={breadcum} title="Create Appointment" />
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : vacancyDetails ? (
              <>
                {/* Vacancy Details Section */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card" style={{ backgroundColor: 'rgb(164, 210, 241)' }}>
                      <div className="card-body">
                        <h5 className="card-title text-danger">Vacancy Details</h5>
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>School: </strong> {vacancyDetails.school_location}</p>
                            <p><strong>Designation: </strong> {vacancyDetails.designation_name}</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>Vacancy Date: </strong> {convertDateFormat(vacancyDetails.vacancy_start_date)}</p>
                            <p><strong>Nature of Vacancy: </strong> {capitalizeWords(vacancyDetails.nature_of_vaccancy)}</p>
                          </div>
                        </div>
                        {vacancyDetails.vacancy_remarks && (
                          <div className="row mt-2">
                            <div className="col-12">
                              <p><strong>Remarks: </strong> {vacancyDetails.vacancy_remarks}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Form */}
                <form onSubmit={handleSubmit} className="row g-3">
                  {/* Date of Appointment */}
                  <div className="col-md-6">
                    <label htmlFor="appointment_date" className="form-label">
                      Date of Appointment <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className={`form-control ${validationErrors.appointment_date ? 'is-invalid' : ''}`}
                      id="appointment_date"
                      name="appointment_date"
                      min={vacancyDetails.vacancy_start_date}
                      value={formData.appointment_date}
                      onChange={handleInputChange}
                     
                    />
                    {validationErrors.appointment_date && (
                      <div className="invalid-feedback">
                        {validationErrors.appointment_date}
                      </div>
                    )}
                  </div>

                  {/* Appointment Mode */}
                  <div className="col-md-6">
                    <label htmlFor="appointment_mode" className="form-label">
                      Appointment Mode <span className="text-danger">*</span>
                    </label>
                    <select
                      className={`form-select ${validationErrors.appointment_mode ? 'is-invalid' : ''}`}
                      id="appointment_mode"
                      name="appointment_mode"
                      value={formData.appointment_mode}
                      onChange={handleInputChange}
                     
                    >
                      <option value="">Select </option>
                      {natureOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {validationErrors.appointment_mode && (
                      <div className="invalid-feedback">
                        {validationErrors.appointment_mode}
                      </div>
                    )}
                  </div>

                  {/* School Selection */}
                  <div className="col-md-6">
                    <label htmlFor="fk_school_id" className="form-label">
                      School <span className="text-danger">*</span>
                    </label>
                    <Select
                      id="fk_school_id"
                      name="fk_school_id"
                      options={schoolOptions}
                      value={schoolOptions.find(option => option.value === selectedSchool) || null}
                      onChange={handleSchoolChange}
                      isSearchable
                      placeholder="Select School"
                      classNamePrefix="react-select"
                      isClearable
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor: validationErrors.fk_school_id ? '#dc3545' : provided.borderColor,
                          '&:hover': {
                            borderColor: validationErrors.fk_school_id ? '#dc3545' : provided.borderColor,
                          },
                        }),
                      }}
                    />
                    {validationErrors.fk_school_id && (
                      <div className="text-danger small mt-1">
                        {validationErrors.fk_school_id}
                      </div>
                    )}
                  </div>

                  {/* Staff Selection - Now using react-select */}
                  <div className="col-md-6">
                    <label htmlFor="staff_id" className="form-label">
                      Select Staff <span className="text-danger">*</span>
                    </label>
                    <Select
                      id="staff_id"
                      name="staff_id"
                      options={staffOptions}
                      value={selectedStaffOption}
                      onChange={handleStaffChange}
                      isSearchable
                      placeholder="Select Staff"
                      classNamePrefix="react-select"
                      isClearable
                      isDisabled={!formData.fk_school_id || staffLoading}
                      isLoading={staffLoading}
                      loadingMessage={() => "Loading staff..."}
                      noOptionsMessage={() => "No staff found"}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          borderColor: validationErrors.staff_id ? '#dc3545' : provided.borderColor,
                          '&:hover': {
                            borderColor: validationErrors.staff_id ? '#dc3545' : provided.borderColor,
                          },
                        }),
                      }}
                    />
                    {validationErrors.staff_id && (
                      <div className="text-danger small mt-1">
                        {validationErrors.staff_id}
                      </div>
                    )}
                  </div>

                  {/* Staff Details (Read-only) */}
                  {formData.staff_id && (
                    <div className="col-12 mt-3">
                      <div className="card bg-light">
                        <div className="card-body bg-lighty">
                          <h6 className="card-subtitle mb-2 text-muted">Staff Details</h6>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label">Staff Type</label>
                              <input
                                type="text"
                                className="form-control"
                               value={selectedStaff.staff_type === 'teaching' ? 'Teaching' : 'Non Teaching'}
                                readOnly
                              />
                            </div>
                             <div className="col-md-6">
                              <label className="form-label">Pen No.</label>
                              <input
                                type="text"
                                className="form-control"
                                value={selectedStaff.pen_no	}
                                readOnly
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="form-label">Current Designation</label>
                              <input
                                type="text"
                                className="form-control"
                                value={selectedStaff.current_designation}
                                readOnly
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Remarks */}
                  <div className="col-12 mt-3">
                    <label htmlFor="remarks" className="form-label">
                      Remarks
                    </label>
                    <textarea
                      className="form-control"
                      id="remarks"
                      name="remarks"
                      rows="3"
                      value={formData.remarks}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  {/* Submit and Cancel Buttons */}
                  <div className="col-12 mt-4 d-flex justify-content-end">
                    <button
                      type="submit"
                      className="btn btn-success me-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        "Save Appointment"
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate("/appointment-details")}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="alert alert-danger">
                Vacancy details not found. Please go back and try again.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VacancyAppointment;