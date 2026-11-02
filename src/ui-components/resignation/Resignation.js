

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import useAuth from "../../utilities/useAuth";
import Breadcum from "../Breadcum";
import NoDataFound from "../NoDataFound";
import { convertDateFormat } from '../../utilities/dateconverter';
import pdf from "../../assets/ui-master/img/pdf.jpg";
import { useNavigate } from 'react-router-dom';

const Resignation = () => {
  const navigate = useNavigate();
  const [resignations, setResignations] = useState([]);
  const auth = useAuth();
  const { user_id } = auth.user;
  const [schools, setSchools] = useState([]);
  const [staff, setStaff] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Resignation', Link: '' },
  ]);

  const [formData, setFormData] = useState({
    resignation_id: '',
    fk_staff_id: '',
    fk_school_id: '',
    resignation_date: '',
    document_file: null,
    resignation_reason: '',
  });

  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [filteredResignations, setFilteredResignations] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const handleCreateVacancy = (id) => {
    navigate(`/vacancy-settings/${id}`); // Redirects to VacancySettings with the ID
  };

  const fetchResignations = useCallback(async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/resignation/getResignations`
      );
      if (response.data.status) {
        setResignations(response.data.data);
        setFilteredResignations(response.data.data);
      } 
    } catch (error) {
      console.error("Error fetching resignations:", error);
      // print_toast("error", "Failed to fetch resignations");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchResignations();
  }, [fetchResignations]);

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
        ? `${globalVariables.api_url}/resignation/update`
        : `${globalVariables.api_url}/resignation/create`;
  
      const dataToSend = new FormData();
      dataToSend.append('resignation_id', formData.resignation_id);
      dataToSend.append('fk_staff_id', formData.fk_staff_id);
      dataToSend.append('fk_school_id', formData.fk_school_id);
      dataToSend.append('resignation_date', formData.resignation_date);
      dataToSend.append('document_file', formData.document_file);
      dataToSend.append('resignation_reason', formData.resignation_reason);
  
      const response = await axios.post(url, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchResignations();
        setModalIsOpen(false);
        setValidationErrors({});
      } else {
        if (response.data.error) {
          setValidationErrors(response.data.error);
        }
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error saving/updating resignation request:", error);
      print_toast("error", "Failed to save/update resignation request");
    }
  };

  const handleOpenModal = (resignation = null) => {
    setValidationErrors({});
    if (resignation) {
      setFormData({
        ...resignation,
      });
      setEditMode(true);
    } else {
      setFormData({
        resignation_id: '',
        fk_staff_id: '',
        fk_school_id: '',
        resignation_date: '',
        document_file: null,
        resignation_reason: '',
      });
      setEditMode(false);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setValidationErrors({});
  };

  const handleDelete = async (resignationId) => {
    if (window.confirm("Are you sure you want to delete this resignation record?")) {
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/resignation/delete`,
          { resignationId: resignationId }
        );
        if (response.data.status) {
          print_toast("success", response.data.message);
     
        
          setResignations((prevResignations) => prevResignations.filter(resignation => resignation.resignation_id !== resignationId));
          setFilteredResignations((prevFilteredResignations) => prevFilteredResignations.filter(resignation => resignation.resignation_id !== resignationId));
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting resignation record:", error);
        print_toast("error", "Failed to delete resignation record");
      }
    }
  };

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));

    // Clear validation errors when user inputs data
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleDownload = async (resignation_id) => {
    try {
      const formData = new FormData();
      formData.append("doc_id", resignation_id);
      formData.append("file_module", "resignation_letter");

      const response = await axios.post(
        `${globalVariables.api_url}/fileaccess/check-file-access`,
        formData, 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      // Handle the response as needed
    } catch (error) {
      console.error("Error checking file access:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleSearchDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "searchStartDate") {
      setSearchStartDate(value);
      setStartDateError("");
    } else if (name === "searchEndDate") {
      setSearchEndDate(value);
      setEndDateError("");
    }
  };

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
    filterResignationRecords();
  };

  // Function to filter resignation records by date range
  const filterResignationRecords = async () => {
    try {
      setLoaded(false); // Show loading state
  
      const filterParams = {
        startDate: searchStartDate || null,
        endDate: searchEndDate || null
      };
  
      const response = await axios.post(
        `${globalVariables.api_url}/resignation/getresignationfilterdates`,
        filterParams,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
  
      if (response.data.status) {
        setFilteredResignations(response.data.data); // Update state with response data
        setIsFiltered(true);
      } else {
        setFilteredResignations([]); // No records found
      }
    } catch (error) {
      console.error("Error filtering resignation records:", error);
      setFilteredResignations([]); // Reset to empty if there's an error
    } finally {
      setLoaded(true); // End loading state
    }
  };

  // Determine which resignation data to display
 // const displayResignations = isFiltered ? filteredResignations : resignations;

  return (
    <>
   

      <div className="row">
        <div className="col-12">
          <div className="card border-top-0 rounded-0">
        
            <div className="card-body">

            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="searchStartDate" className="form-label">Start Date<span className="text-danger">*</span></label>
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
                <div className="form-group">
                  <label htmlFor="searchEndDate" className="form-label">End Date<span className="text-danger">*</span></label>
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


            {filteredResignations.length > 0 ? (

              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Staff Name</th>
                      <th scope="col" className="text-center">School Name</th>
                      <th scope="col" className="text-center">Designation</th>
                      <th scope="col" className="text-center">  Date Of Resignation</th>
                    
                      <th scope="col" className="text-center">Reason</th>
                      <th scope="col" className="text-center">Vacancy Status</th>
                       <th scope="col" className="text-center">Document</th> 
                      <th scope="col" className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && filteredResignations.length === 0 ? (
                      <tr>
                        <td colSpan="9">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      filteredResignations.map((resignation, index) => (
                        <tr key={resignation.resignation_id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{resignation.staff_official_name}</td>
                          <td className="text-center">{resignation.school_location}</td>
                          <td className="text-center">{resignation.latest_service_record.designation_name	}</td>
                          <td className="text-center">
                            {convertDateFormat(resignation.resignation_date	)}
                          </td>
                         
                        
                         
                          <td className="text-center">{resignation.resignation_reason	}</td>
                          <td className="text-center">
    <span className={`badge ${resignation.is_vacancy_created === 1 ? 'bg-success' : 'bg-danger'}`}>
        {resignation.is_vacancy_created === 1 ? "Created" : "Not Created"}
    </span>
</td>
<td className="text-center">
  {resignation.document_file ? (
    <button
      onClick={() => handleDownload(resignation.resignation_id)}
      className="btn btn-link text-dark d-flex flex-column align-items-center"
    >
      <img 
        src={pdf} 
        alt="PDF" 
        width="40" 
        height="40" 
        className="mb-1"
      />
      <span>Download</span>
    </button>
  ) : (
    <span className="text-muted">No File Available</span>
  )}
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
                                      onClick={() => handleOpenModal(resignation)}
                                    >
                                      Edit
                                    </button>
                                  </li>
                                  {resignation.is_vacancy_created == 0 && ( 
  <li>
    <button
      className="dropdown-item"
      onClick={() => handleDelete(resignation.resignation_id)}
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
                  No Resignations records found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      <Modal show={modalIsOpen} onHide={closeModal} backdrop='static'>
  <Modal.Header closeButton>
    <Modal.Title>{editMode ? "Edit Resignation" : "Create Resignation"}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={handleSubmit} className="row g-3">
    


     
      
              <div className="col-12 mt-3">
                  <label htmlFor="resignation_date" className="form-label">
                  Date of Resignation <span className="text-danger">*</span>
                  </label>
                
                <input
                  type="date"
                  className="form-control"
                  id="resignation_date"
                  name="resignation_date"
                  max={today}
                  value={formData.resignation_date}
                  onChange={handleCreateInputChange}
                />
                  {validationErrors.resignation_date && (
                    <div className="invalid-feedback d-block">
                      {validationErrors.resignation_date}
                    </div>
                  )}
                </div>


                {!editMode && (
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
        )}
     

             
           

      <div className="col-12">
        <label htmlFor="resignation_reason" className="form-label">
          Reason<span className="text-danger">*</span>
        </label>
        <textarea
          className={`form-control ${validationErrors.reason_of_leave ? 'is-invalid' : ''}`}
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

export default Resignation;