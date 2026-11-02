import React, { useState, useEffect } from "react";
import axios from "axios";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import { convertDateFormat } from '../../utilities/dateconverter';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ObituaryVacancy from "./ObituaryVacancy";
import ResignationVacancy from "./ResignationVacancy";
import RetirementVacancy from "./RetirementVacancy";
import LeaveVacancy from "./LeaveVacancy";

import { getVacancyData } from "./VacancyTypeHandler";
import { useNavigate, useLocation } from 'react-router-dom';
import { capitalizeWords } from '../../utilities/dateconverter';
const CreateVacancy = () => {
    const [selectedVacancy, setSelectedVacancy] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [staff, setStaff] = useState([]);
    const [staffMessage, setStaffMessage] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedVacancyData, setSelectedVacancyData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
     const [natureOptions, setNatureOptions] = useState([]);
      const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        vacancy_title: "",
        school: "",
        school_id: "",
        designation: "",
        designation_id: "",
        staff_name: "",
        staff_id: "",
        vacancy_nature: "",
        vacancy_start_date: "",
        remarks: "",
        fk_ref_id: "",
    });

    // Effect to auto-select vacancy type from query string and trigger search
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const natureParam = queryParams.get('nature');
        
        if (natureParam) {
            setSelectedVacancy(natureParam);
            
            // Use setTimeout to ensure state is updated before triggering search
            setTimeout(() => {
                handleSearch(natureParam);
            }, 100);
        }
    }, [location.search]);
 


    const handleSearch = async (vacancyType = null) => {
        // Use provided vacancyType if available, otherwise use the state value
        const currentVacancy = vacancyType || selectedVacancy;
        
        if (!currentVacancy) {
            alert("Please select a nature of vacancy.");
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axios.get(`${globalVariables.api_url}/vacancy/get_all_vacancies_nature?nature=${currentVacancy}`);
            if (response.data.status) {
                setStaff(response.data.data);
                setStaffMessage("");
            } else {
                setStaff([]);
                setStaffMessage("No records found");
            }
        } catch (error) {
            console.error("Error fetching vacancy data:", error);
            setStaff([]);
            setStaffMessage("Error fetching data. Please try again.");
        }
        setIsLoading(false);
    };
    
    // Open modal with vacancy data based on type
    const openModal = (vacancy) => {
        setSelectedVacancyData(vacancy);
        
        // Get vacancy data based on the selected vacancy type
        const vacancyData = getVacancyData(selectedVacancy, vacancy);
        
        // Set form data
        setFormData(vacancyData);
        
        setShowModal(true);
    };
  
    // Close modal
    const closeModal = () => {
        setShowModal(false);
    };
  
    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({}); // Clear previous errors before submission
    
        // Prepare data for submission - make sure IDs are included
        const submissionData = {
            vacancy_title: formData.vacancy_title,
            fk_school_id: formData.school_id,
            fk_designation_id: formData.designation_id,
            staff_id: formData.staff_id,
            vacancy_nature: formData.vacancy_nature,
            vacancy_start_date: formData.vacancy_start_date,
            vacancy_remarks: formData.remarks,
            fk_ref_id: formData.fk_ref_id,
        };
    
        try {
            const response = await axios.post(`${globalVariables.api_url}/vacancy/save_vacancy`, submissionData, {
                headers: { "Content-Type": "application/json" }, // Ensure JSON format
            });

            if (response.data.status === false) {
                if (response.data.error) {
                    // Handle validation errors
                    setErrors(response.data.error);
                } else {
                    // Handle other errors returned by API
                    print_toast("error", response.data.message || "Failed to create vacancy.");
                }
            } else if (response.data.status === true) {
                // Success case
                print_toast("success", "Vacancy created successfully!");
                navigate("/vacancy/vacancy-details")
                setShowModal(false);
                setErrors({}); // Clear errors on success
                handleSearch(); // Refresh data
            }
        } catch (error) {
            console.error("Error saving vacancy:", error);
            
            // Handle possible Axios error responses
            if (error.response && error.response.data && error.response.data.error) {
                setErrors(error.response.data.error);
            } else {
                print_toast("error", "Failed to create vacancy.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prevState => {
                const newErrors = {...prevState};
                delete newErrors[name];
                return newErrors;
            });
        }
    };
  
    const renderVacancyComponent = () => {
        if (staff.length === 0) return null;

        const commonProps = {
            staff,
            openModal,
        };

        switch (selectedVacancy) {
            case "obituary":
                return <ObituaryVacancy {...commonProps} />;
            case "resignation":
                return <ResignationVacancy {...commonProps} />;
             case "retirement":
                 return <RetirementVacancy {...commonProps} />;
                 case "leave":
                 return <LeaveVacancy {...commonProps} />;
            // case "transfer":
            //     return <TransferVacancy {...commonProps} />;
            // case "promotion":
            //     return <PromotionVacancy {...commonProps} />;
            default:
                return null;
        }
    };


    
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

    return (
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-body">
                        {/* Vacancy Selection */}
                        <div className="row mb-3 align-items-center">
                         <div className="col-md-8 d-flex align-items-center">
  <label htmlFor="nature_of_vacancy" className="form-label me-2 mb-0">
    Nature Of Vacancy<span className="text-danger">*</span>
  </label>
  <select
    id="nature_of_vacancy"
    name="nature_of_vacancy"
    className="form-control me-2"
    value={selectedVacancy}
    onChange={(e) => setSelectedVacancy(e.target.value)}
    style={{ width: "60%" }}
  >
    <option value="">Select Nature Of Vacancy</option>
    {natureOptions.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
  <button type="button" className="btn btn-primary" onClick={() => handleSearch()}>
    Search
  </button>
</div>
                        </div>
  
                        {/* Loader */}
                        {isLoading && (
                            <div className="d-flex justify-content-center my-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}
  
                        {/* No Records Found */}
                        {!isLoading && staffMessage && (
                            <div className="alert alert-info mt-3" role="alert">
                                {staffMessage}
                            </div>
                        )}
  
                        {/* Render the specific vacancy component */}
                        {renderVacancyComponent()}
  
                        {/* Modal using React Bootstrap */}
                        <Modal show={showModal} onHide={closeModal} backdrop="static">
                            <Modal.Header closeButton>
                                <Modal.Title>Create Vacancy</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="vacancy_title" className="form-label">
                                            Vacancy Title<span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.vacancy_title ? 'is-invalid' : ''}`}
                                            id="vacancy_title"
                                            name="vacancy_title"
                                            value={formData.vacancy_title}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.vacancy_title && (
                                            <div className="invalid-feedback">{errors.vacancy_title}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="school" className="form-label">School<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="school"
                                            value={formData.school}
                                            readOnly
                                        />
                                        <input type="hidden" name="school_id" value={formData.school_id} />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="staff_name" className="form-label">Staff Name<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="staff_name"
                                            value={formData.staff_name}
                                            readOnly
                                        />
                                        <input type="hidden" name="staff_id" value={formData.staff_id} />
                                    </div>
                             
                                    <div className="mb-3">
                                        <label htmlFor="designation" className="form-label">Designation<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="designation" 
                                            value={formData.designation}
                                            readOnly
                                        />
                                        <input type="hidden" name="designation_id" value={formData.designation_id} />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="vacancy_nature" className="form-label">Nature of Vacancy<span className="text-danger">*</span></label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.vacancy_nature ? 'is-invalid' : ''}`}
                                            id="vacancy_nature" 
                                            value={formData.vacancy_nature}
                                            readOnly
                                        />
                                        {errors.vacancy_nature && (
                                            <div className="invalid-feedback">{errors.vacancy_nature}</div>
                                        )}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="vacancy_start_date" className="form-label">
                                            Vacancy Start Date<span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className={`form-control ${errors.vacancy_start_date ? 'is-invalid' : ''}`}
                                            id="vacancy_start_date"
                                            name="vacancy_start_date"
                                            value={formData.vacancy_start_date}
                                            onChange={handleChange}
                                        />
                                        {errors.vacancy_start_date && (
                                            <div className="invalid-feedback">{errors.vacancy_start_date}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="remarks" className="form-label">Remarks</label>
                                        <textarea
                                            className="form-control"
                                            id="remarks"
                                            name="remarks"
                                            rows="3"
                                            value={formData.remarks}
                                            onChange={handleChange}
                                        ></textarea>
                                    </div>
                                </form>
                            </Modal.Body>
                            <Modal.Footer>
                                <Button 
                                    variant="success" 
                                    onClick={handleSubmit}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateVacancy;