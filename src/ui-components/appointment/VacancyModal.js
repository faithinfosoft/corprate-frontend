import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import globalVariables from "../../Global.js";
import { useNavigate } from "react-router-dom";
import print_toast from "../../utilities/Toaster.js";

const VacancyModal = ({ selectedStaff, vacancy_nature,onClose, show }) => {
    const navigate = useNavigate();
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState([]);
    const [shouldFetchRemarks, setShouldFetchRemarks] = useState(false);

    // Update formData when selectedStaff changes
    useEffect(() => {
   

        if (selectedStaff.length > 0) {
            console.log(selectedStaff);
            const newFormData = selectedStaff.map(staff => {
                // Base form data that's common for all vacancy types
                const baseData = {
                    fk_school_id: staff.school_id || "",
                    fk_designation_id: staff.latest_service_record?.designation_id || "",
                    staff_id: staff.staff_id || "",
                    vacancy_nature: vacancy_nature,
                    vacancy_start_date: "",
                    vacancy_end_date: "",
                    vacancy_remarks: "",
                    staff_name: staff.staff_official_name || "", 
                    school_name: staff.school_location || "", 
                    designation_name: staff.latest_service_record?.designation_name || "",
                    
                };
                
                // Add specific fields based on vacancy nature
                if (vacancy_nature === 'obituary') {
                    return {
                        ...baseData,
                        death_date: staff.death_date || "",
                        fk_ref_id: staff.death_id || "",
                    };
                } else if (vacancy_nature === 'resignation') {
                    return {
                        ...baseData,
                        resignation_date: staff.resignation_date || "",
                        fk_ref_id: staff.resignation_id || "",
                    };
                }
                else if (vacancy_nature === 'retirement') {
                    return {
                        ...baseData,
                        retirement_date: staff.retirement_date || "",
                        fk_ref_id: staff.retirement_id || "",
                    };
                }
                else if (vacancy_nature === 'leave') {
                    
                    return {
                        ...baseData,
                       leave_date: staff.leave_start_date || "",
                        fk_ref_id: staff.leave_id || "",
                    };
                }
                // Default case for other vacancy types
                return baseData;
            });
            
            setFormData(newFormData);
            // Set flag to fetch remarks after formData is updated
            setShouldFetchRemarks(true);
        
    
        }
    }, [selectedStaff, vacancy_nature]);

    // Separate useEffect to fetch remarks when formData is ready
    useEffect(() => {
     
        if (shouldFetchRemarks && formData.length > 0) {
           
            formData.forEach((data, index) => {
              
                fetchRemarks(index);
            });
            // Reset the flag after fetching
            setShouldFetchRemarks(false);
        }
    }, [shouldFetchRemarks, formData]);

    const handleChange = (index, field, value) => {
        const updatedFormData = [...formData];
        updatedFormData[index][field] = value;
        setFormData(updatedFormData);
        
        // Only re-fetch remarks if death_date changes
        if (field === "death_date"|| field === "resignation_date" || field === "leave_start_date" ) {
            fetchRemarks(index);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setErrors({}); // Reset errors before making the API call
    
        try {
            const response = await axios.post(`${globalVariables.api_url}/vacancy/save_vacancy`, formData, {
                headers: { "Content-Type": "application/json" },
            });
    
            if (response.data.status === false) {
                // Handle backend validation errors
                if (response.data.errors) {
                    const fieldErrors = {};
                    
                    // Parse errors from backend
                    response.data.errors.forEach((error, index) => {
                        // Check if error is an object with specific field validations
                        if (typeof error === 'object') {
                            // Iterate through each key in the error object
                            Object.keys(error).forEach(key => {
                                // Create an error entry for each field
                                if (!fieldErrors[index]) {
                                    fieldErrors[index] = {};
                                }
                                fieldErrors[index][key] = error[key];
                            });
                        } else if (typeof error === 'string') {
                            // Handle case of general error message
                            if (!fieldErrors[index]) {
                                fieldErrors[index] = {};
                            }
                            fieldErrors[index].general = error;
                        }
                    });
    
                    // Set the parsed errors
                    setErrors(fieldErrors);
    
                    // Optional: Show a toast with error message
                    print_toast("error", response.data.message || "Validation errors occurred");
                }
            } else if (response.data.status === true) {
                print_toast("success", "Vacancy created successfully!");
                navigate("/vacancy/vacancy-details");
                onClose();
            }
        } catch (error) {
            console.error("Error saving vacancy:", error);
            if (error.response?.data?.errors) {
                const fieldErrors = {};
                error.response.data.errors.forEach((error, index) => {
                    fieldErrors[index] = { ...fieldErrors[index], ...error };
                });
                setErrors(fieldErrors);
            } else {
                print_toast("error", "Failed to create vacancy.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const fetchRemarks = async (index) => {
     
        try {
            const data = formData[index];
          console.log(data);
            // Determine which date to use based on vacancy nature
            let relevantDate = "";
            if (data.vacancy_nature === 'obituary') {
                relevantDate = data.death_date;
            } else if (data.vacancy_nature === 'resignation') {
                relevantDate = data.resignation_date;
            }
            else if (data.vacancy_nature === 'retirement') {
                relevantDate = data.retirement_date;
            }
            else if (data.vacancy_nature === 'leave') {
              
                relevantDate = data.leave_date;
            }
          
            // Only proceed if we have all necessary data
            if (!data || !data.school_name || !data.staff_name || 
                !data.designation_name || !data.vacancy_nature || !relevantDate) {
                return; // Not enough data to generate remarks
            }
            
            const response = await axios.get(`${globalVariables.api_url}/vacancy/get_remarks`, {
                params: { 
                    school_name: data.school_name,
                    staff_name: data.staff_name,
                    designation: data.designation_name,
                    nature_vacancy: data.vacancy_nature,
                    date: relevantDate  // Using the appropriate date based on vacancy nature
                }
            });
            
            if (response.data) {
                // Update the remarks field with the response
                const updatedFormData = [...formData];
                updatedFormData[index].vacancy_remarks = response.data;
                setFormData(updatedFormData);
            }
        } catch (error) {
            console.error('Error fetching remarks:', error.message);
            print_toast("error", `Failed to fetch remarks: ${error.message}`);
        }
    };

    return (
        <Modal show={show} onHide={onClose} fullscreen>
            <Modal.Header closeButton>
                <Modal.Title>Create Vacancy</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form onSubmit={handleSubmit}>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>School</th>
                                <th>Staff</th>
                                <th>Designation</th>
                                <th>Vacancy Nature</th>
                                <th>Vacancy Start Date</th>
                                {vacancy_nature === 'leave' && <th>Vacancy End Date</th>}
                            
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.length > 0 ? (
                                formData.map((data, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={data.school_name}
                                                readOnly
                                            />
                                          {errors[index]?.fk_school_id && (
    <div className="text-danger">{errors[index].fk_school_id}</div>
)}  
                                            <input type="hidden" name="fk_school_id" value={data.fk_school_id} />
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={data.staff_name}
                                                readOnly
                                            />
                                            <input type="hidden" name="staff_id" value={data.staff_id} />
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={data.designation_name}
                                                readOnly
                                            />
                                             {errors[index]?.fk_designation_id && (
    <div className="text-danger">{errors[index].fk_designation_id}</div>
)}
                                            <input type="hidden" name="fk_designation_id" value={data.fk_designation_id} />
                                        </td>
                                        <td>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={data.vacancy_nature}
                                                readOnly
                                            />
                                             {errors[index]?.vacancy_nature && (
    <div className="text-danger">{errors[index].vacancy_nature}</div>
)}
                                        </td>
                                        <td>
                                            <input 
                                                type="date" 
                                                className="form-control"
                                                name="vacancy_start_date"
                                                value={data.vacancy_start_date}
                                                onChange={(e) => handleChange(index, "vacancy_start_date", e.target.value)}
                                            />
                                            {errors[index]?.vacancy_start_date && (
    <div className="text-danger">{errors[index].vacancy_start_date}</div>
)}
                                        </td>
                                        {vacancy_nature === 'leave' && 
                                        <td>
                                            <input 
                                                type="date" 
                                                className="form-control"
                                                name="vacancy_end_date"
                                                value={data.vacancy_end_date}
                                                onChange={(e) => handleChange(index, "vacancy_end_date", e.target.value)}
                                            />


        
                                            {errors[index]?.vacancy_end_date && (
    <div className="text-danger">{errors[index].vacancy_end_date}</div>
)}
                                        </td>
}
                                        <td>
                                            <textarea 
                                                className="form-control"
                                                value={data.vacancy_remarks}
                                                onChange={(e) => handleChange(index, "vacancy_remarks", e.target.value)}
                                                rows="3"
                                            ></textarea>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center">No staff selected</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {errors.general && <p className="text-danger">{errors.general}</p>}
                    <Modal.Footer>
                        <Button type="submit" variant="success" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                            Close
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal.Body>
        </Modal>
    );
};

export default VacancyModal;