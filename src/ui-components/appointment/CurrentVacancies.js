import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import "react-datepicker/dist/react-datepicker.css";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import useAuth from "../../utilities/useAuth.js";
import NoDataFound from "../NoDataFound.js";
import { convertDateFormat } from '../../utilities/dateconverter.js';
import { useNavigate } from 'react-router-dom';
import { capitalizeWords } from '../../utilities/dateconverter.js';
import Breadcum from '.././Breadcum';

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState([]);
  const auth = useAuth();
  const { username, user_id } = auth.user;
  const school_id = auth.user.school_id;
  const [schools, setSchools] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [natureOptions, setNatureOptions] = useState([]);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Apointment Details', Link: '' },
  ]);

  // Search states
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [natureOfVacancy, setNatureOfVacancy] = useState('');
  const [allotmentStatus, setAllotmentStatus] = useState('');
  const [filteredVacancies, setFilteredVacancies] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    vacancy_id: '',
    fk_school_id: '',
    vacancy_start_date: '',
    nature_of_vacancy: '',
    allotment_status: '',
    remarks: ''
  });

  // Fetch all vacancies
  const fetchVacancies = useCallback(async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/vacancy/get_all_unfilled_vacancies`
      );
      if (response.data.status) {
        setVacancies(response.data.data);
        setFilteredVacancies(response.data.data); // Initialize filtered data with all vacancies
      }
    } catch (error) {
      console.error("Error fetching vacancies:", error);
      print_toast("error", "Failed to fetch vacancies");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchVacancies();
    fetchSchools();
  }, [fetchVacancies]);

  // Fetch schools data
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

  // Handle input changes for search fields
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "searchStartDate":
        setSearchStartDate(value);
        if (startDateError) setStartDateError("");
        break;
      case "searchEndDate":
        setSearchEndDate(value);
        if (endDateError) setEndDateError("");
        break;
      case "natureOfVacancy":
        setNatureOfVacancy(value);
        break;
      case "allotmentStatus":
        setAllotmentStatus(value);
        break;
      default:
        break;
    }
  };

  // Validate search form
  const validateSearchForm = () => {
    let isValid = true;
    
    // If end date is provided, start date must also be provided
    if (searchEndDate && !searchStartDate) {
      setStartDateError("Start date is required when end date is provided");
      isValid = false;
    }
    
    // If start date is after end date
    if (searchStartDate && searchEndDate && new Date(searchStartDate) > new Date(searchEndDate)) {
      setEndDateError("End date must be after start date");
      isValid = false;
    }
    
    return isValid;
  };

  // Function to filter vacancies
  const filterVacancies = async () => {
    if (!validateSearchForm()) {
      return;
    }
    
    try {
      setLoaded(false);
      setIsSearching(true);
      
      // Only include non-empty parameters
      const filterParams = {};
      if (searchStartDate) filterParams.startDate = searchStartDate;
      if (searchEndDate) filterParams.endDate = searchEndDate;
      if (natureOfVacancy) filterParams.natureOfVacancy = natureOfVacancy;
      if (allotmentStatus) filterParams.allotmentStatus = allotmentStatus;
      
      // If no filters, return all vacancies
      if (Object.keys(filterParams).length === 0) {
        setFilteredVacancies(vacancies);
        setIsFiltered(false);
        setLoaded(true);
        setIsSearching(false);
        return;
      }
      
      const response = await axios.post(
        `${globalVariables.api_url}/vacancy/filter_vacancies`,
        filterParams,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      
      if (response.data.status) {
        setFilteredVacancies(response.data.data);
        if (response.data.data.length === 0) {
          print_toast("info", "No vacancies found matching your criteria");
        }
      } else {
        setFilteredVacancies([]);
       // print_toast("error", response.data.message || "Failed to filter vacancies");
      }
      setIsFiltered(true);
    } catch (error) {
      console.error("Error filtering vacancies:", error);
      print_toast("error", "Failed to filter vacancies");
      setFilteredVacancies([]);
    } finally {
      setLoaded(true);
      setIsSearching(false);
    }
  };
  
  // Handle search button click
  const handleSearch = () => {
    filterVacancies();
  };
  
  // Handle reset button click
  const handleReset = () => {
    setSearchStartDate('');
    setSearchEndDate('');
    setNatureOfVacancy('');
    setAllotmentStatus('');
    setFilteredVacancies(vacancies);
    setIsFiltered(false);
    setStartDateError('');
    setEndDateError('');
  };

  // Handle form input changes
  const handleFormInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear validation errors when user inputs data
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editMode
        ? `${globalVariables.api_url}/vacancy/update`
        : `${globalVariables.api_url}/vacancy/create`;

      const dataToSend = new FormData();
      for (const key in formData) {
        dataToSend.append(key, formData[key]);
      }

      const response = await axios.post(url, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchVacancies();
        setModalIsOpen(false);
        setValidationErrors({});
      } else {
        if (response.data.error) {
          setValidationErrors(response.data.error);
        }
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error saving/updating vacancy:", error);
      print_toast("error", "Failed to save/update vacancy");
    }
  };

  // Handle opening modal for create/edit
  const handleOpenModal = (vacancy = null) => {
    setValidationErrors({});
    if (vacancy) {
      setFormData({
        vacancy_id: vacancy.vacancy_id || '',
        fk_school_id: vacancy.fk_school_id || '',
        vacancy_start_date: vacancy.vacancy_start_date || '',
        nature_of_vacancy: vacancy.nature_of_vacancy || '',
        allotment_status: vacancy.allotment_status || '',
        remarks: vacancy.vacancy_remarks || ''
      });
      setEditMode(true);
    } else {
      setFormData({
        vacancy_id: '',
        fk_school_id: '',
        vacancy_start_date: '',
        nature_of_vacancy: '',
        allotment_status: '',
        remarks: ''
      });
      setEditMode(false);
    }
    setModalIsOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalIsOpen(false);
    setValidationErrors({});
  };

  // Handle delete vacancy
  const handleDelete = async (vacancyId) => {
    if (window.confirm("Are you sure you want to delete this vacancy?")) {
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/vacancy/delete_vacancy`,
          { vacancy_id: vacancyId },
          
        );
        if (response.data.status) {
          print_toast("success", response.data.message);
          setVacancies(prevVacancies => prevVacancies.filter(vacancy => vacancy.vacancy_id !== vacancyId));
          setFilteredVacancies(prevFilteredVacancies => prevFilteredVacancies.filter(vacancy => vacancy.vacancy_id !== vacancyId));
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting vacancy:", error);
        print_toast("error", "Failed to delete vacancy");
      }
    }
  };

  const today = new Date().toISOString().split("T")[0];

    
        useEffect(() => {
        fetchNatureofVacancy();
       
      }, []);
    
    
        const fetchNatureofVacancy = async () => {
        try {
          const response = await axios.get(`${globalVariables.api_url}/vacancy/get_nature_vacancies`);
       if (response.data.status) {
          // Transform the object data into array format expected by the select
          const transformedData = Object.entries(response.data.data).map(([key, value]) => ({
            value: key,
            label: value
          }));
          setNatureOptions(transformedData);
        }
        } catch (error) {
          setErrorMessage('Failed to fetch schools');
        }
      };
  // Allotment status options
  const statusOptions = [
    { value: "", label: "Select Status" },
    { value: "All", label: "All" },
    { value: "appointed", label: "Appointed" },
    { value: "not-appointed", label: "Not Appointed" },
  ];

  return (
    <>

      <div className="col-12">
        <div className="card">
          <div className="card-body">
            {/* Search form */}
            <div className="row mb-1">
              {/* Nature Of Vacancy */}
              <div className="col-md-3">
                <label htmlFor="natureOfVacancy" className="form-label">
                  Nature Of Vacancy
                </label>
                <select
                  className="form-select"
                  id="natureOfVacancy"
                  name="natureOfVacancy"
                  value={natureOfVacancy}
                  onChange={handleSearchInputChange}
                >
                   <option value=''>Select</option>
                  {natureOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

 
         
           

            {/* Search and Reset Buttons */}
           <div className="col-md-3">
    <label className="form-label">&nbsp;</label>
            
                <button 
                  type="button" 
                   className="btn btn-primary px-4 d-block"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
            </div>  

  
          
            {/* Vacancy Results Table */}
            <div className="table-responsive">
              <table className="table table-bordered datatable">
                <thead>
                  <tr>
                    <th scope="col" className="text-center">Sl No.</th>
                    <th scope="col" className="text-center">School Name</th>
                    <th scope="col" className="text-center">Vacancy Date</th>
                    <th scope="col" className="text-center">Nature of Vacancy</th>
                    <th scope="col" className="text-center">Designation</th>
                    <th scope="col" className="text-center">Remarks</th>
                    {/* <th scope="col" className="text-center">Appointment Status</th> */}
                    <th scope="col" className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!loaded ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="d-flex justify-content-center my-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredVacancies.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <NoDataFound />
                      </td>
                    </tr>
                  ) : (
                    filteredVacancies.map((vacancy, index) => (
                      <tr key={vacancy.vacancy_id || index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">{vacancy.school_location}</td>
                        <td className="text-center">
                          {convertDateFormat(vacancy.vacancy_start_date)}
                        </td>
                        <td className="text-center">
                          {capitalizeWords(vacancy.nature_of_vaccancy)}
                        </td>
                        <td className="text-center">{vacancy.designation_name}</td>
                        <td className="text-center">{vacancy.vacancy_remarks}</td>
                        {/* <td className="text-center">
                          <span className={`badge ${vacancy.vacancy_status === 1 ? 'bg-success' : 'bg-danger'}`}>
                            {vacancy.vacancy_status === 1 ? "Appointed" : "Not Appointed"}
                          </span>
                        </td> */}
                        <td className="text-center">
 <button
                            className="btn btn-success btn-sm text-nowrap"
                            onClick={() => navigate(`/vacancy-appointment/${vacancy.vacancy_id}`)}
                          >
                            Appoint Now
                          </button>
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Vacancy Modal */}
      <Modal show={modalIsOpen} onHide={closeModal} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit Vacancy" : "Create Vacancy"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            {/* Vacancy Date */}
            <div className="col-12">
              <label htmlFor="vacancy_start_date" className="form-label">
                Vacancy Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="vacancy_start_date"
                name="vacancy_start_date"
                max={today}
                value={formData.vacancy_start_date}
                onChange={handleFormInputChange}
                required
              />
              {validationErrors.vacancy_start_date && (
                <div className="invalid-feedback d-block">
                  {validationErrors.vacancy_start_date}
                </div>
              )}
            </div>

            {/* Remarks */}
            <div className="col-12">
              <label htmlFor="remarks" className="form-label">
                Remarks
              </label>
              <textarea
                className="form-control"
                id="remarks"
                name="remarks"
                rows="3"
                value={formData.remarks}
                onChange={handleFormInputChange} readOnly
              ></textarea>
              {validationErrors.remarks && (
                <div className="invalid-feedback d-block">
                  {validationErrors.remarks}
                </div>
              )}
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1">
                {editMode ? "Update" : "Submit"}
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

export default AppointmentDetails;