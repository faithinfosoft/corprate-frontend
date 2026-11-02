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
const StaffDeath = () => {
  const navigate = useNavigate();
  const [deaths, setdeaths] = useState([]);
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
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Death Details', Link: '' },
  ]);

  // Add date range search states
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [filteredDeaths, setFilteredDeaths] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const [formData, setFormData] = useState({
    death_id: '',
    fk_staff_id: '',
    fk_school_id: '',
    death_date: '',
    death_reason: '',
  });

  const fetchDeath = useCallback(async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/death/getdeath`
      );
      if (response.data.status) {
        setdeaths(response.data.data);
        setFilteredDeaths(response.data.data); // Initialize filtered data with all deaths
      }
    } catch (error) {
      console.error("Error fetching deaths:", error);
      print_toast("error", "Failed to fetch deaths");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchDeath();
  }, [fetchDeath]);

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

  // Function to filter death records by date range and send to controller
  const filterDeathRecords = async () => {
    try {
      setLoaded(false); // Show loading state
  
      const filterParams = {
        startDate: searchStartDate || null,
        endDate: searchEndDate || null
      };
  
      const response = await axios.post(
        `${globalVariables.api_url}/death/getdeathfilterdates`,
        filterParams,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
  
      if (response.data.status) {
        setFilteredDeaths(response.data.data); // Update state with response data
        setIsFiltered(true);
      } else {
        setFilteredDeaths([]); // No records found
      }
    } catch (error) {
      console.error("Error filtering death records:", error);
      setFilteredDeaths([]); // Reset to empty if there's an error
    } finally {
      setLoaded(true); // End loading state
    }
  };
  
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");


  const handleSearch = () => {
    let isValid = true;
  
    if (!searchStartDate) {
      setStartDateError("Start date is required");
      isValid = false;
    } else {
      setStartDateError("");
    }
  
    if (!searchEndDate) {
      setEndDateError("End date is required");
      isValid = false;
    } else {
      setEndDateError("");
    }
  
    if (!isValid) return; // Stop execution if validation fails
  
    // Proceed with filtering if both dates are provided
    filterDeathRecords();
  };
  
  // Handle search button click
  const handleSearch12 = () => {
    if (!searchStartDate && !searchEndDate) {
      // If both dates are empty, show all records
      setFilteredDeaths(deaths);
      setIsFiltered(false);
      print_toast("info", "Showing all records");
      return;
    }
    
    // Call the filter function to get data from the backend
    filterDeathRecords();
  };

  // Handle reset button click
  const handleReset = () => {
    setSearchStartDate('');
    setSearchEndDate('');
    setFilteredDeaths(deaths);
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
        ? `${globalVariables.api_url}/death/update`
        : `${globalVariables.api_url}/death/create`;

      const dataToSend = new FormData();
      dataToSend.append('death_id', formData.death_id);
      dataToSend.append('fk_staff_id', formData.fk_staff_id);
      dataToSend.append('fk_school_id', formData.fk_school_id);
      dataToSend.append('death_date', formData.death_date);
      dataToSend.append('death_reason', formData.death_reason);

      const response = await axios.post(url, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchDeath();
        setModalIsOpen(false);
        setValidationErrors({});
      } else {
        if (response.data.error) {
          setValidationErrors(response.data.error);
        }
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error saving/updating death request:", error);
      print_toast("error", "Failed to save/update death request");
    }
  };

  const handleOpenModal = (death = null) => {
    setValidationErrors({});
    if (death) {
      setFormData({
        ...death,
      });
      setEditMode(true);
    } else {
      setFormData({
        death_id: '',
        fk_staff_id: '',
        fk_school_id: '',
        death_date: '',
        death_reason: '',
      });
      setEditMode(false);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setValidationErrors({});
  };

  const handleDelete = async (deathId) => {
    if (window.confirm("Are you sure you want to delete this death?")) {
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/death/delete`,
          { death_id: deathId }
        );
        if (response.data.status) {
          print_toast("success", response.data.message);
          setdeaths((prevdeaths) => prevdeaths.filter(deaths => deaths.death_id !== deathId));
          setFilteredDeaths((prevFilteredDeaths) => prevFilteredDeaths.filter(death => death.death_id !== deathId));
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting death:", error);
        print_toast("error", "Failed to delete death");
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

  return (
    <>
      <div className="col-12">
        <div className="card border-top-0 rounded-0">
         
          <div className="card-body">
            {/* Date range search form */}
            <div className="row mb-3">
              <div className="col-md-4">
              <div className="form-group d-flex align-items-center">
                  <label htmlFor="searchStartDate" className="form-label" style={{whiteSpace: "nowrap" }}>Start Date<span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    id="searchStartDate"
                    name="searchStartDate"
                    value={searchStartDate}
                    onChange={handleSearchDateChange}
                    max={today}
                  />
                   {startDateError && <p style={{ color: "red", fontSize: "16px" }}>{startDateError}</p>}
                </div>
              </div>
              <div className="col-md-4">
              <div className="form-group d-flex align-items-center">
                  <label htmlFor="searchEndDate" className="form-label" style={{ whiteSpace: "nowrap" }}>End Date<span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    id="searchEndDate"
                    name="searchEndDate"
                    value={searchEndDate}
                    onChange={handleSearchDateChange}
                    max={today}
                    min={searchStartDate}
                  />
                    {endDateError && <p style={{ color: "red", fontSize: "16px" }}>{endDateError}</p>}
                </div>
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

            {/* Search results status */}
           
       
              {filteredDeaths.length > 0 ? (

            <div className="table-responsive">
              <table className="table table-bordered datatable">
                <thead>
                  <tr>
                    <th scope="col" className="text-center">Sl No.</th>
                    <th scope="col" className="text-center">Staff Name</th>
                    <th scope="col" className="text-center">School Name</th>
                    <th scope="col" className="text-center">Designation</th>
                    <th scope="col" className="text-center">Date Of Obituary</th>
                    <th scope="col" className="text-center">Reason</th>
                    <th scope="col" className="text-center">Vacancy Status</th>
                    <th scope="col" className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loaded && filteredDeaths.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <NoDataFound />
                      </td>
                    </tr>
                  ) : (
                    filteredDeaths.map((d, index) => (
                      <tr key={d.death_id || index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">{d.staff_official_name}</td>
                        <td className="text-center">{d.school_location}</td>
                        <td className="text-center">{d.latest_service_record?.designation_name}</td>
                        <td className="text-center">
                          {convertDateFormat(d.death_date)}
                        </td>
                        <td className="text-center">{d.death_reason}</td>
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
      onClick={() => handleDelete(d.death_id)}
    >
      Delete
    </button>
  </li>
)}
                              </>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            ) : (
              <div className="alert alert-info">
                No death records found.
              </div>
            )}
          </div>
        </div>
      </div>


      <Modal show={modalIsOpen} onHide={closeModal} backdrop='static'>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit death" : "Create death"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">

            <div className="col-12">
              <div className="col-12 mt-3">
                <label htmlFor="death_date" className="form-label">
                  Date of Obituary <span className="text-danger">*</span>
                </label>
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

export default StaffDeath;