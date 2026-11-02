import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Table, Modal } from 'react-bootstrap';
import NoDataFound from './NoDataFound.js';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Select from 'react-select';
import useAuth from "../utilities/useAuth";
const StaffFamilyDetails = ({ staffId }) => {
    const auth = useAuth();
    const userType = auth.user.user_type;

    const [familyDetails, setFamilyDetails] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [schools, setSchools] = useState([]);
    const [staffOptions, setStaffOptions] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [createErrors, setCreateErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});

    const initialFormState = {
        fk_staff_id: staffId,
        corporate_employee: '',
        spouse_name: '',
        designation: '',
        fk_school_id: '',
        fk_staff_spouse_id: '',
    };

    const [createFormData, setCreateFormData] = useState(initialFormState);
    const [editFormData, setEditFormData] = useState(initialFormState);

    const fetchSchools = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/staff/schools`);
            if (response.data.status) {
                setSchools(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching schools:', error);
            print_toast("error", "Failed to fetch schools");
        }
    };

    useEffect(() => {
        fetchfamilyDetails();
        fetchSchools();
    }, [staffId]);

    const fetchStaffBySchool = async (schoolId) => {
        if (!schoolId) {
            setStaffOptions([]);
            return;
        }

        setLoadingStaff(true);

        try {
            const response = await axios.get(`${globalVariables.api_url}/school/get_staff_school_id`, {
                params: {
                    staff_id: staffId,
                    school_id: schoolId
                }
            });

            if (response.data.status && response.data.data.length > 0) {
                const staffList = response.data.data.map((staff) => ({
                    value: staff.staff_id,
                    label: staff.staff_official_name
                }));

                // If editing, maintain the current selection if it exists
                if (editingId && editFormData?.fk_staff_spouse_id) {
                    const currentStaff = familyDetails.find(f => 
                        f.fk_staff_spouse_id === editFormData.fk_staff_spouse_id
                    );
                    if (currentStaff && !staffList.find(s => s.value === currentStaff.fk_staff_spouse_id)) {
                        staffList.push({
                            value: currentStaff.fk_staff_spouse_id,
                            label: currentStaff.staff_official_name
                        });
                    }
                }

                setStaffOptions([{ value: "", label: "Select Staff" }, ...staffList]);
            } else {
                setStaffOptions([{ value: "", label: "Select Staff" }]);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
            setStaffOptions([{ value: "", label: "Select Staff" }]);
        }

        setLoadingStaff(false);
    };

    const fetchfamilyDetails = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/staff/get_family_details/${staffId}`);
            if (response.data.status) {
                setFamilyDetails(response.data.data);
            } else {
                setFamilyDetails([]);
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Error fetching family details:', error);
            }
            setFamilyDetails([]);
        }
    };

    const schoolOptions = schools.map((school) => ({
        value: school.school_id.toString(), // Ensure consistent type
        label: `${school.school_name}, ${school.location}`
    }));
    

    const validateForm = (formData) => {
        let newErrors = {};
        
        if (!formData.corporate_employee) {
            newErrors.corporate_employee = "Please select whether spouse is employed in corporate management";
        }

        if (formData.corporate_employee === "Yes") {
            if (!formData.fk_school_id) {
                newErrors.school_id = "Please select a school";
            }
            if (!formData.fk_staff_spouse_id) {
                newErrors.fk_staff_spouse_id = "Please select a staff member";
            }
        }

        if (formData.corporate_employee === "No") {
            if (!formData.spouse_name?.trim()) {
                newErrors.spouse_name = "Spouse name is required";
            } else if (formData.spouse_name.length < 3) {
                newErrors.spouse_name = "Spouse name must be at least 3 characters";
            }

            if (!formData.designation?.trim()) {
                newErrors.designation = "Designation is required";
            } else if (formData.designation.length < 2) {
                newErrors.designation = "Designation must be at least 2 characters";
            }
        }

        return newErrors;
    };

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'corporate_employee') {
            setCreateFormData({
                ...initialFormState,
                fk_staff_id: staffId,
                corporate_employee: value,
            });
            setCreateErrors({});
        } else {
            setCreateFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        setCreateErrors(prev => ({ ...prev, [name]: '' }));

        if (name === "fk_school_id") {
            fetchStaffBySchool(value);
        }
    };

    const handleEdit = async (family) => {
        try {
            // First, fetch the schools if not already loaded
            if (schools.length === 0) {
                await fetchSchools();
            }
    
            // Create the form data with all fields
            const formData = {
                fk_staff_id: staffId,
                corporate_employee: family.corporate_employee,
                spouse_name: family.spouse_name || '',
                designation: family.designation || '',
                fk_school_id: family.fk_school_id || '',
                fk_staff_spouse_id: family.fk_staff_spouse_id || ''
            };
    
            // Set the editing ID
            setEditingId(family.staff_family_id);
    
            // If it's a corporate employee, fetch staff options for the selected school
            if (family.corporate_employee === "Yes" && family.fk_school_id) {
                await fetchStaffBySchool(family.fk_school_id);
                
                // Ensure the current school is in the options
                const currentSchool = schools.find(school => school.school_id === family.fk_school_id);
                if (currentSchool) {
                    // Make sure schoolOptions includes this school
                    const schoolOption = {
                        value: currentSchool.school_id,
                        label: `${currentSchool.school_name}, ${currentSchool.location}`
                    };
                    
                    if (!schoolOptions.find(option => option.value === currentSchool.school_id)) {
                        schoolOptions.push(schoolOption);
                    }
                }
    
                // Add the current staff to options if not already present
                if (family.fk_staff_spouse_id && family.staff_official_name) {
                    const currentStaffOption = {
                        value: family.fk_staff_spouse_id,
                        label: family.staff_official_name
                    };
                    
                    setStaffOptions(prev => {
                        if (!prev.find(option => option.value === family.fk_staff_spouse_id)) {
                            return [...prev, currentStaffOption];
                        }
                        return prev;
                    });
                }
            }
    
            // Set the form data after ensuring options are available
            setEditFormData(formData);
            setShowEditModal(true);
        } catch (error) {
            console.error('Error setting up edit form:', error);
            print_toast("error", "Failed to load edit form");
        }
    };

    const handleEditInputChange = async (e) => {
        const { name, value } = e.target;
        
        if (name === 'corporate_employee') {
            setEditFormData({
                ...initialFormState,
                fk_staff_id: staffId,
              
                corporate_employee: value,
            });
            setEditErrors({});
            if (value === "No") {
                setStaffOptions([]);
            }
        } else if (name === 'fk_school_id') {
            const schoolId = value.toString(); // Ensure consistent type
            setEditFormData(prev => ({
                ...prev,
                [name]: schoolId,
                fk_staff_spouse_id: '' // Reset staff selection when school changes
            }));
            await fetchStaffBySchool(schoolId);
        } else {
            setEditFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        setEditErrors(prev => ({ ...prev, [name]: '' }));
    };
    const handleSubmit = async (e, isEditing) => {
        e.preventDefault();
        const formData = isEditing ? editFormData : createFormData;
        const errors = validateForm(formData);
        
        if (isEditing) {
            setEditErrors(errors);
        } else {
            setCreateErrors(errors);
        }

        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsSaving(true);
        try {
            let response;
            if (isEditing) {
                response = await axios.put(`${globalVariables.api_url}/staff/update_family_details/${editingId}`, formData);
            } else {
                response = await axios.post(`${globalVariables.api_url}/staff/add_family_details`, formData);
            }
    
            if (response.data.status) {
                print_toast("success", response.data.message);
                fetchfamilyDetails();
                if (isEditing) {
                    setShowEditModal(false);
                } else {
                    setShowCreateModal(false);
                }
                resetForms();
            } else {
                print_toast("error", response.data.message);
            }
        } catch (error) {
            console.error('Error saving family details:', error);
            print_toast("error", error.response?.data?.message || "Failed to save family details");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this family member\'s details?')) {
            try {
                const response = await axios.delete(`${globalVariables.api_url}/staff/delete_family_details/${id}`);
                if (response.data.status) {
                    print_toast("success", response.data.message);
                    fetchfamilyDetails();
                } else {
                    print_toast("error", response.data.message);
                }
            } catch (error) {
                console.error('Error deleting family details:', error);
                print_toast("error", "Failed to delete family details");
            }
        }
    };

    const resetForms = () => {
        setCreateFormData(initialFormState);
        setEditFormData(initialFormState);
        setCreateErrors({});
        setEditErrors({});
        setEditingId(null);
        setStaffOptions([]);
    };


    return (
        <div className="row">
            <div className="col-12">
                <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                    <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center" style={{ borderTop: "4px solid #0ea5e9" }}>
                        <h5 className="card-title mb-0">Family Details</h5>
                        {/* {familyDetails.length < 0 && ( */}
                     
                        {/* {familyDetails.length === 0 && userType != 'staff' && ( */}

{familyDetails.length === 0 && (
    <button 
        className="btn btn-danger" 
        onClick={() => setShowCreateModal(true)}
    >
        <i className="fas fa-plus me-1"></i>
                Create
    </button>
)}
                        {/* )}; */}
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-muted">
                                    <tr>
                                        <th scope="col" className="text-center fw-semibold py-3 border-bottom">Sl No.</th>
                                        <th scope="col" className="text-center fw-semibold py-3 border-bottom">Corporate Employee</th>
                                        <th scope="col" className="text-center fw-semibold py-3 border-bottom">Spouse Name</th>
                                        <th scope="col" className="text-center fw-semibold py-3 border-bottom">Designation</th>
                                        { userType != 'staff' && (
                                        <th scope="col" className="text-center fw-semibold py-3 border-bottom">Actions</th>
                                    )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {familyDetails.length === 0 ? (
                                        <tr>
                                            <td colSpan={5}>
                                                <NoDataFound />
                                            </td>
                                        </tr>
                                    ) : (
                                        familyDetails.map((family, index) => (
                                            <tr key={family.staff_childrens_details_id}>
                                                <td className="text-center">{index + 1}</td>
                                                <td className="text-center">{family.corporate_employee}</td>
                                                <td className="text-center">
    {family.corporate_employee === 'No' 
        ? family.spouse_name 
        : family.staff_official_name }
</td>
<td className="text-center">
  {family.corporate_employee === 'No' 
    ? family.designation
    : <>
     {family.designation_name}<br />
        School : {family.school_location} 
      
      </>
  }
</td>
{ userType != 'staff' && (
                                                <td className="text-center">
                                                    <button 
                                                        className="btn btn-sm btn-primary me-2"
                                                        onClick={() => handleEdit(family)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-danger"
                                                        onClick={() => handleDelete(family.staff_family_id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                                  )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); resetForms(); }} backdrop='static'>
                <Modal.Header closeButton>
                    <Modal.Title>Add Family Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={(e) => handleSubmit(e, false)}>
                        <div className="mb-3">
                            <label className="form-label">
                                Is the spouse employed in corporate management? <span className="text-danger">*</span>
                            </label>
                            <div>
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="corporate_employee"
                                        value="Yes"
                                        checked={createFormData.corporate_employee === "Yes"}
                                        onChange={handleCreateInputChange}
                                    />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="corporate_employee"
                                        value="No"
                                        checked={createFormData.corporate_employee === "No"}
                                        onChange={handleCreateInputChange}
                                    />
                                    <label className="form-check-label">No</label>
                                </div>
                            </div>
                            {createErrors.corporate_employee && (
                                <div className="text-danger">{createErrors.corporate_employee}</div>
                            )}
                        </div>
                        {createFormData.corporate_employee === "Yes" && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">School <span className="text-danger">*</span></label>
                                    <Select
            id="fk_school_id"
            name="fk_school_id"
            options={schoolOptions}
            value={schoolOptions.find(option => option.value === createFormData.fk_school_id)}
            onChange={(selectedOption) =>
                handleCreateInputChange({
                    target: { name: "fk_school_id", value: selectedOption ? selectedOption.value : "" }
                })
            }
            isSearchable
            placeholder="Select School"
            classNamePrefix="react-select"
        />
                                    {createErrors.school_id && (
                                        <div className="text-danger">{createErrors.school_id}</div>
                                    )}
                                </div>

                                <div className="mb-3">
  <label className="form-label">
    Staff <span className="text-danger">*</span>
  </label>
  <Select
    id="fk_staff_spouse_id"
    name="fk_staff_spouse_id"
    options={staffOptions}
    value={staffOptions.find(option => option.value === createFormData.fk_staff_spouse_id) || null}
    onChange={(selectedOption) =>
      setCreateFormData((prev) => ({
        ...prev,
        fk_staff_spouse_id: selectedOption ? selectedOption.value : "" // Fixed key name
      }))
    }
    isSearchable
    placeholder={loadingStaff ? "Loading staff..." : "Select Staff"}
    classNamePrefix="react-select"
    isDisabled={loadingStaff || staffOptions.length === 0}
  />

{createErrors.fk_staff_spouse_id && (
                                        <div className="text-danger">{createErrors.fk_staff_spouse_id}</div>
                                    )}
</div>

                          
                            </>
                        )}
                        {createFormData.corporate_employee === "No" && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Spouse Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="spouse_name"
                                        value={createFormData.spouse_name}
                                        onChange={handleCreateInputChange}
                                    />
                                    {createErrors.spouse_name && (
                                        <div className="text-danger">{createErrors.spouse_name}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Designation <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="designation"
                                        value={createFormData.designation}
                                        onChange={handleCreateInputChange}
                                    />
                                    {createErrors.designation && (
                                        <div className="text-danger">{createErrors.designation}</div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="text-end">
                        <button type="submit" className="btn btn-primary me-2" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>

                            <button type="button" className="btn btn-secondary " onClick={() => { setShowCreateModal(false); resetForms(); }}>
                                Cancel
                            </button>
                          
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); resetForms(); }} backdrop='static'>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Family Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={(e) => handleSubmit(e, true)}>
                        <div className="mb-3">
                            <label className="form-label">
                                Is the spouse employed in corporate management? <span className="text-danger">*</span>
                            </label>
                            <div>
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="corporate_employee"
                                        value="Yes"
                                        checked={editFormData.corporate_employee === "Yes"}
                                        onChange={handleEditInputChange}
                                    />
                                    <label className="form-check-label">Yes</label>
                                </div>
                                <div className="form-check form-check-inline">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="corporate_employee"
                                        value="No"
                                        checked={editFormData.corporate_employee === "No"}
                                        onChange={handleEditInputChange}
                                    />
                                    <label className="form-check-label">No</label>
                                </div>
                            </div>
                            {editErrors.corporate_employee && (
                                <div className="text-danger">{editErrors.corporate_employee}</div>
                            )}
                        </div>
                        {editFormData.corporate_employee === "Yes" && (
                <>
                    <div className="mb-3">
                        <label className="form-label">School <span className="text-danger">*</span></label>
                        <Select
            id="fk_school_id"
            name="fk_school_id"
            options={schoolOptions}
            value={schoolOptions.find(option => option.value === editFormData.fk_school_id) || null}
            onChange={(selectedOption) =>
                handleEditInputChange({
                    target: { name: "fk_school_id", value: selectedOption ? selectedOption.value : "" }
                })
            }
            isSearchable
            placeholder="Select School"
            classNamePrefix="react-select"
        />
                        {editErrors.school_id && (
                            <div className="text-danger">{editErrors.school_id}</div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Staff <span className="text-danger">*</span>
                        </label>
                        <Select
            id="fk_staff_spouse_id"
            name="fk_staff_spouse_id"
            options={staffOptions}
            value={staffOptions.find(option => option.value === editFormData.fk_staff_spouse_id) || null}
            onChange={(selectedOption) =>
                setEditFormData(prev => ({
                    ...prev,
                    fk_staff_spouse_id: selectedOption ? selectedOption.value : ""
                }))
            }
            isSearchable
            placeholder={loadingStaff ? "Loading staff..." : "Select Staff"}
            classNamePrefix="react-select"
            isDisabled={loadingStaff || staffOptions.length === 0}
        />
                        {editErrors.fk_staff_spouse_id && (
                            <div className="text-danger">{editErrors.fk_staff_spouse_id}</div>
                        )}
                    </div>
                </>
            )}
                        {editFormData.corporate_employee === "No" && (
                            <>
                                <div className="mb-3">
                                    <label className="form-label">Spouse Name <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="spouse_name"
                                        value={editFormData.spouse_name}
                                        onChange={handleEditInputChange}
                                    />
                                    {editErrors.spouse_name && (
                                        <div className="text-danger">{editErrors.spouse_name}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Designation <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="designation"
                                        value={editFormData.designation}
                                        onChange={handleEditInputChange}
                                    />
                                    {editErrors.designation && (
                                        <div className="text-danger">{editErrors.designation}</div>
                                    )}
                                </div>
                            </>
                        )}

                        <div className="text-end">
                        <button type="submit" className="btn btn-primary me-2" disabled={isSaving}>
                                {isSaving ? 'Updating...' : 'Update'}
                            </button>
                            <button type="button" className="btn btn-secondary " onClick={() => { setShowEditModal(false); resetForms(); }}>
                                Cancel
                            </button>
                           
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default StaffFamilyDetails;