import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import "react-datepicker/dist/react-datepicker.css";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import useAuth from "../../utilities/useAuth";
import NoDataFound from "../NoDataFound";
import { convertDateFormat } from '../../utilities/dateconverter';
import { useNavigate } from 'react-router-dom';

const Staffretirement = () => {
  const navigate = useNavigate();
  const [retirements, setretirements] = useState([]);
  const auth = useAuth();
  const { username, user_id } = auth.user;
  const school_id = auth.user.school_id;
  const [schools, setSchools] = useState([]);
  const [staff, setStaff] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  // Add date range search states
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [filteredretirements, setFilteredretirements] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const [formData, setFormData] = useState({
    retirement_id: '',
    fk_staff_id: '',
    fk_school_id: '',
    retirement_date: '',
    retirement_reason: '',
  });

  const fetchretirement = useCallback(async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/retirement/getretirement`
      );
      if (response.data.status) {
        setretirements(response.data.data);
        setFilteredretirements(response.data.data); // Initialize filtered data with all retirements
      }
    } catch (error) {
      console.error("Error fetching retirements:", error);
      print_toast("error", "Failed to fetch retirements");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchretirement();
  }, [fetchretirement]);

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "document_file") {
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

    // Clear validation errors when user inputs data
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Fetch staff data when school is changed
    if (name === "fk_school_id") {
      fetchStaff(value);
    }
  };

  // Handle date range search changes
  const handleSearchDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "searchStartDate") {
      setSearchStartDate(value);
    } else if (name === "searchEndDate") {
      setSearchEndDate(value);
    }
  };

  // Function to filter retirement records by date range and send to controller
  const filterretirementRecords = async () => {
    try {
      setLoaded(false); // Show loading state
  
      const filterParams = {
        startDate: searchStartDate || null,
        endDate: searchEndDate || null
      };
  
      const response = await axios.post(
        `${globalVariables.api_url}/retirement/getretirementfilterdates`,
        filterParams,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
  
      if (response.data.status) {
        setFilteredretirements(response.data.data); // Update state with response data
        setIsFiltered(true);
      } else {
        setFilteredretirements([]); // No records found
      }
    } catch (error) {
      console.error("Error filtering retirement records:", error);
      setFilteredretirements([]); // Reset to empty if there's an error
    } finally {
      setLoaded(true); // End loading state
    }
  };
  
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  // Function to filter retirement records by academic year
  const filterRetirementsByYear = async (yearId) => {
    try {
      setLoaded(false); // Show loading state
      
      const response = await axios.get(
        `${globalVariables.api_url}/retirement/getretirementbyyear/${yearId}`
      );
      
      if (response.data.status) {
        setFilteredretirements(response.data.data);
        setIsFiltered(true);
      } else {
        setFilteredretirements([]);
        //print_toast("info", "No retirement records found for selected year");
      }
    } catch (error) {
      console.error("Error filtering retirement by year:", error);
      setFilteredretirements([]);
      print_toast("error", "Failed to fetch retirement records");
    } finally {
      setLoaded(true);
    }
  };

  // Updated handleSearch function to use the academic year filter
  const handleSearch = () => {
    if (!selectedYear) {
      print_toast("error", "Please select an academic year");
      return;
    }
    
    // Call the filter function with the selected academic year
    filterRetirementsByYear(selectedYear);
  };


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

  // Handle reset button click
  const handleReset = () => {
    setSelectedYear('');
    setFilteredretirements(retirements);
    setIsFiltered(false);
  };

  const fetchStaff = async (schoolId) => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_staff_school/${schoolId}`);
      if (response.data.status) {
        setStaff(response.data.data); // Set staff data
      } else {
        setStaff([]); // Clear staff if no data
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaff([]); // Ensure empty state on error
    }
  };

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
      setErrorMessage('Failed to fetch schools');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode
        ? `${globalVariables.api_url}/retirement/update`
        : `${globalVariables.api_url}/retirement/create`;

      const dataToSend = new FormData();
      dataToSend.append('retirement_id', formData.retirement_id);
      dataToSend.append('fk_staff_id', formData.fk_staff_id);
      dataToSend.append('fk_school_id', formData.fk_school_id);
      dataToSend.append('retirement_date', formData.retirement_date);
      dataToSend.append('retirement_reason', formData.retirement_reason);
      
      // If we're in edit mode, make sure to include the academic year
      if (editMode && selectedYear) {
        dataToSend.append('fk_academic_year_id', selectedYear);
      }

      const response = await axios.post(url, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchretirement();
        setModalIsOpen(false);
        setValidationErrors({});
        
        // If we're currently filtering by academic year, refresh that filter
        if (isFiltered && selectedYear) {
          filterRetirementsByYear(selectedYear);
        }
      } else {
        if (response.data.error) {
          setValidationErrors(response.data.error);
        }
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error saving/updating retirement request:", error);
      print_toast("error", "Failed to save/update retirement request");
    }
  };

  const handleOpenModal = (retirement = null) => {
    setValidationErrors({});
    if (retirement) {
      setFormData({
        ...retirement,
      });
      setEditMode(true);
    } else {
      setFormData({
        retirement_id: '',
        fk_staff_id: '',
        fk_school_id: '',
        retirement_date: '',
        retirement_reason: '',
      });
      setEditMode(false);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setValidationErrors({});
  };

  const handleDelete = async (retirementId) => {
    if (window.confirm("Are you sure you want to delete this retirement?")) {
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/retirement/delete`,
          { retirement_id: retirementId }
        );
        if (response.data.status) {
          print_toast("success", response.data.message);
          setretirements((prevretirements) => prevretirements.filter(retirements => retirements.retirement_id !== retirementId));
          setFilteredretirements((prevFilteredretirements) => prevFilteredretirements.filter(retirement => retirement.retirement_id !== retirementId));
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting retirement:", error);
        print_toast("error", "Failed to delete retirement");
      }
    }
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

  const today = new Date().toISOString().split("T")[0];
  
  const handleCreateVacancy = (id, nature_of_vacancy) => {
    navigate(`/vacancy-settings/${id}/${nature_of_vacancy}`);
  };
  
  // Handle Academic Year Selection and Fetch Staff
  const handleAcademicYearSelect = (yearId) => {
    setSelectedYear(yearId);
  };
  
  return (
    <>
      <div className="col-12">
        <div className="card border-top-0 rounded-0">
          <div className="card-body">
            {/* Academic year search form */}
            <div className="row mb-3">
              <div className="col-md-6">
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
              <div className="col-md-4 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-primary me-2"
                  onClick={handleSearch}
                >
                  Search
                </button>
           
            
              </div>
            </div>

            {/* Loading indicator */}
            {!loaded && (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {/* Results table */}
            {loaded && (
              filteredretirements.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered datatable">
                    <thead>
                      <tr>
                        <th scope="col" className="text-center">Sl No.</th>
                        <th scope="col" className="text-center">Staff Name</th>
                        <th scope="col" className="text-center">School Name</th>
                        <th scope="col" className="text-center">Designation</th>
                        <th scope="col" className="text-center">Date Of Retirement</th>
                        <th scope="col" className="text-center">Vacancy Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredretirements.map((d, index) => (
                        <tr key={d.retirement_id || index}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{d.staff_official_name}</td>
                          <td className="text-center">{d.school_location}</td>
                          <td className="text-center">{d.latest_service_record?.designation_name}</td>
                          <td className="text-center">
                            {convertDateFormat(d.retirement_date)}
                          </td>
                          <td className="text-center">
                            <span className={`badge ${d.is_vacancy_created === 1 ? 'bg-success' : 'bg-danger'}`}>
                              {d.is_vacancy_created === 1 ? "Created" : "Not Created"}
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="dropdown">
                              <button
                                className="btn btn-dark dropdown-toggle"
                                type="button"
                                id={`dropdownMenuButton${index}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                Action
                              </button>
                              <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${index}`}>
                                <>
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleOpenModal(d)}
                                    >
                                      Edit
                                    </button>
                                  </li>
                                  {d.is_vacancy_created == 0 && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleDelete(d.retirement_id)}
                                      >
                                        Delete
                                      </button>
                                    </li>
                                  )}
                                  {/* {d.is_vacancy_created == 0 && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleCreateVacancy(d.retirement_id, 'retirement')}
                                      >
                                        Create Vacancy
                                      </button>
                                    </li>
                                  )} */}
                                </>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="alert alert-info">
                  {isFiltered ? "No retirement records found for the selected academic year." : "No retirement records found."}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      <Modal show={modalIsOpen} onHide={closeModal} backdrop='static'>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Retirement" : "Create Retirement"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            {!editMode && (
              <>
                <div className="col-md-12">
                  <label htmlFor="fk_academic_year_id" className="form-label">
                    Academic Year <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="fk_academic_year_id"
                    name="fk_academic_year_id"
                    value={formData.fk_academic_year_id || ""}
                    onChange={handleCreateInputChange}
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map((year) => (
                      <option key={year.academic_year_id} value={year.academic_year_id}>
                        {year.year_label}
                      </option>
                    ))}
                  </select>
                  {validationErrors.fk_academic_year_id && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.fk_academic_year_id}
                    </div>
                  )}
                </div>

                <div className="col-md-12">
                  <label htmlFor="fk_school_id" className="form-label">
                    School <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="fk_school_id"
                    name="fk_school_id"
                    value={formData.fk_school_id || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select School</option>
                    {schools.map((school) => (
                      <option key={school.school_id} value={school.school_id}>
                        {school.school_location}
                      </option>
                    ))}
                  </select>
                  {validationErrors.fk_school_id && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.fk_school_id}
                    </div>
                  )}
                </div>

                <div className="col-md-12">
                  <label htmlFor="fk_staff_id" className="form-label">
                    Staff <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    id="fk_staff_id"
                    name="fk_staff_id"
                    value={formData.fk_staff_id || ""}
                    onChange={handleChange}
                    disabled={!formData.fk_school_id}
                  >
                    <option value="">Select Staff</option>
                    {staff.map((staffMember) => (
                      <option key={staffMember.staff_id} value={staffMember.staff_id}>
                        {staffMember.staff_official_name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.fk_staff_id && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.fk_staff_id}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="col-12">
              <div className="col-12 mt-3">
                <label htmlFor="retirement_date" className="form-label">
                  Date of Retirement <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="retirement_date"
                  name="retirement_date"
                  value={formData.retirement_date || ""}
                  onChange={handleCreateInputChange}
                />
                {validationErrors.retirement_date && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.retirement_date}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12">
              <div className="col-12 mt-3">
                <label htmlFor="retirement_reason" className="form-label">
                  Reason for Retirement
                </label>
                <textarea
                  className="form-control"
                  id="retirement_reason"
                  name="retirement_reason"
                  rows="3"
                  value={formData.retirement_reason || ""}
                  onChange={handleCreateInputChange}
                ></textarea>
                {validationErrors.retirement_reason && (
                  <div className="invalid-feedback d-block">
                    {validationErrors.retirement_reason}
                  </div>
                )}
              </div>
            </div>

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1">
                Submit
              </button>
              <button type="button" className="btn btn-danger m-1" onClick={closeModal}>
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Staffretirement;