import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import useAuth from "../utilities/useAuth";
const StaffChildrenDetails = ({ staffId }) => {
    const auth = useAuth();
    const userType = auth.user.user_type;

    const [childrenDetails, setChildrenDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [createFormData, setCreateFormData] = useState({
        fk_staff_id: staffId,
        childrens_name: '',
        childrens_gender: '',
        childrens_class: '',
        childrens_school_name: '',
        childrens_school_location: '',
        school_type: '',
        syllabus: '',
    });
    const [editFormData, setEditFormData] = useState({
        fk_staff_id: staffId,
        childrens_name: '',
        childrens_gender: '',
        childrens_class: '',
        childrens_school_name: '',
        childrens_school_location: '',
        school_type: '',
        syllabus: '',
    });
    const [createErrors, setCreateErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchChildrenDetails();
    }, [staffId]);

    // Fetch function remains the same
    const fetchChildrenDetails = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/staff/children-details/${staffId}`);
            if (response.data.status) {
                setChildrenDetails(response.data.data);
            } else {
                setChildrenDetails([]);
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Error fetching children details:', error);
            }
            setChildrenDetails([]);
        }
    };

    // Form handling functions remain the same
    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        setCreateFormData({ ...createFormData, [name]: value });
        setCreateErrors({ ...createErrors, [name]: '' });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
        setEditErrors({ ...editErrors, [name]: '' });
    };

    // Validation function remains the same
    const validateForm = (formData) => {
        let newErrors = {};
        if (!formData.childrens_name) {
            newErrors.childrens_name = "Child's name is required.";
        } else if (formData.childrens_name.length < 3) {
            newErrors.childrens_name = "Child's name must be at least 3 characters long.";
        }

        if (!formData.childrens_gender) {
            newErrors.childrens_gender = "Gender is required.";
        }

        if (!formData.childrens_class) {
            newErrors.childrens_class = "Class is required.";
        }

        if (!formData.childrens_school_name) {
            newErrors.childrens_school_name = "School name is required.";
        }

        if (!formData.childrens_school_location) {
            newErrors.childrens_school_location = "School location is required.";
        }

        if (!formData.school_type) {
            newErrors.school_type = "School type is required.";
        }

        if (!formData.syllabus) {
            newErrors.syllabus = "Syllabus is required.";
        }

        return newErrors;
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
                response = await axios.put(`${globalVariables.api_url}/staff/children-details/${editingId}`, formData);
            } else {
                response = await axios.post(`${globalVariables.api_url}/staff/children-details`, formData);
            }
    
            if (response.data.status) {
                print_toast("success", response.data.message);
                fetchChildrenDetails();
                if (isEditing) {
                    setShowEditModal(false);
                } else {
                    setShowModal(false);
                }
                resetForms();
            } else {
                print_toast("error", response.data.message);
            }
        } catch (error) {
            console.error('Error saving children details:', error);
            print_toast("error", error.response?.data?.message || "Failed to save children details");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (child) => {
        setEditFormData({
            ...child,
            fk_staff_id: staffId
        });
        setEditingId(child.staff_childrens_details_id);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this child\'s details?')) {
            try {
                const response = await axios.delete(`${globalVariables.api_url}/staff/children-details/${id}`);
                if (response.data.status) {
                    print_toast("success", response.data.message);
                    fetchChildrenDetails();
                } else {
                    print_toast("error", response.data.message);
                }
            } catch (error) {
                console.error('Error deleting children details:', error);
                print_toast("error", "Failed to delete children details");
            }
        }
    };

    const resetForms = () => {
        setCreateFormData({
            fk_staff_id: staffId,
            childrens_name: '',
            childrens_gender: '',
            childrens_class: '',
            childrens_school_name: '',
            childrens_school_location: '',
            school_type: '',
            syllabus: ''
        });
        setEditFormData({
            fk_staff_id: staffId,
            childrens_name: '',
            childrens_gender: '',
            childrens_class: '',
            childrens_school_name: '',
            childrens_school_location: '',
            school_type: '',
            syllabus: ''
        });
        setCreateErrors({});
        setEditErrors({});
        setEditingId(null);
    };

    return (
        <>
            <div className="row">
                <div className="col-lg-12">
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        Enter the details if your child is studying in grades 1 to 12.
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center" style={{ borderTop: "4px solid #0ea5e9" }}>
                            <h5 className="card-title">Children Details</h5>
                            {/* { userType != 'staff' && ( */}
                            <button className="btn btn-danger" onClick={() => setShowModal(true)}>
                                <i className="fas fa-plus me-1"></i>
                Create
                            </button>
                              {/* )} */}
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light text-muted">
                                        <tr>
                                            <th scope="col" className="text-center fw-semibold py-3 border-bottom">Sl No.</th>
                                            <th scope="col" className="text-center fw-semibold py-3 border-bottom">Name</th>
                                            <th scope="col" className="text-center fw-semibold py-3 border-bottom">Gender</th>
                                            <th scope="col" className="text-center fw-semibold py-3 border-bottom">Class</th>
                                            <th scope="col" className="text-center fw-semibold py-3 border-bottom">School Name</th>
                                            <th scope="col" className="text-center fw-semibold py-3 border-bottom">School Type</th>
                                            <th scope="col" className="text-center fw-semibold py-3 border-bottom">Syllabus</th>
                                            {/* { userType != 'staff' && ( */}
                                            <th scope="col" className="text-center fw-semibold py-3 border-bottom">Actions</th>
                                        {/* )} */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {childrenDetails.length === 0 ? (
                                            <tr>
                                                <td colSpan={8}>
                                                    <NoDataFound />
                                                </td>
                                            </tr>
                                        ) : (
                                            childrenDetails.map((child, index) => (
                                                <tr key={child.staff_childrens_details_id}>
                                                    <td>{index + 1}</td>
                                                    <td>{child.childrens_name}</td>
                                                    <td>{child.childrens_gender}</td>
                                                    <td>{child.childrens_class}</td>
                                                    <td>{child.childrens_school_name}, {child.childrens_school_location}</td>
                                                    <td>{child.school_type}</td>
                                                    <td>{child.syllabus}</td>
                                                    {/* { userType != 'staff' && ( */}
                                                    <td>
                                                        <div className="dropdown">
                                                            <button className="btn btn-outline-primary btn-sm rounded-pill dropdown-toggle px-3 shadow-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                                Action
                                                            </button>
                                                            <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1">
                                                                <li>
                                                                    <a className="dropdown-item" href="#" onClick={() => handleEdit(child)}>Edit</a>
                                                                </li>
                                                                <li>
                                                                    <a className="dropdown-item" href="#" onClick={() => handleDelete(child.staff_childrens_details_id)}>Delete</a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </td>
                                                      {/* )} */}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            <Modal show={showModal} onHide={() => { setShowModal(false); resetForms(); }} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Add Children Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={(e) => handleSubmit(e, false)} className="row g-3">
                        <div className="col-12">
                            <label htmlFor="childrens_name" className="form-label">Child's Name<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="childrens_name"
                                name="childrens_name"
                                value={createFormData.childrens_name}
                                onChange={handleCreateInputChange}
                            />
                            {createErrors.childrens_name && <div className="text-danger">{createErrors.childrens_name}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="childrens_gender" className="form-label">Gender<span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                id="childrens_gender"
                                name="childrens_gender"
                                value={createFormData.childrens_gender}
                                onChange={handleCreateInputChange}
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            {createErrors.childrens_gender && <div className="text-danger">{createErrors.childrens_gender}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="childrens_class" className="form-label">Class<span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                id="childrens_class"
                                name="childrens_class"
                                value={createFormData.childrens_class}
                                onChange={handleCreateInputChange}
                            >
                                <option value="">Select class</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i+1} value={i+1}>{i+1}</option>
                                ))}
                            </select>
                            {createErrors.childrens_class && <div className="text-danger">{createErrors.childrens_class}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="childrens_school_name" className="form-label">School Name<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="childrens_school_name"
                                name="childrens_school_name"
                                value={createFormData.childrens_school_name}
                                onChange={handleCreateInputChange}
                            />
                            {createErrors.childrens_school_name && <div className="text-danger">{createErrors.childrens_school_name}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="childrens_school_location" className="form-label">School Location<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="childrens_school_location"
                                name="childrens_school_location"
                                value={createFormData.childrens_school_location}
                                onChange={handleCreateInputChange}
                            />
                            {createErrors.childrens_school_location && <div className="text-danger">{createErrors.childrens_school_location}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="school_type" className="form-label">School Type<span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                id="school_type"
                                name="school_type"
                                value={createFormData.school_type}
                                onChange={handleCreateInputChange}
                            >
                                <option value="">Select Type</option>
                                <option value="Aided">Aided</option>
                                <option value="Unaided">Unaided</option>
                            </select>
                            {createErrors.school_type && <div className="text-danger">{createErrors.school_type}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="syllabus" className="form-label">Syllabus<span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                id="syllabus"
                                name="syllabus"
                                value={createFormData.syllabus}
                                onChange={handleCreateInputChange}
                            >
                                <option value="">Select Syllabus</option>
                                <option value="ICSE">ICSE</option>
                                <option value="CBSE">CBSE</option>
                                <option value="Kerala">Kerala</option>
                                <option value="Other">Other</option>
                            </select>
                            {createErrors.syllabus && <div className="text-danger">{createErrors.syllabus}</div>}
                        </div>

                        <div className="col-12 text-end">
                            <button type="submit" className="btn btn-success m-1" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger m-1" 
                                onClick={() => { 
                                    setShowModal(false); 
                                    resetForms(); 
                                }} 
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Edit Modal */}
            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); resetForms(); }} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Edit Children Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={(e) => handleSubmit(e, true)} className="row g-3">
                        <div className="col-12">
                            <label htmlFor="edit_childrens_name" className="form-label">Child's Name<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="edit_childrens_name"
                                name="childrens_name"
                                value={editFormData.childrens_name}
                                onChange={handleEditInputChange}
                            />
                            {editErrors.childrens_name && <div className="text-danger">{editErrors.childrens_name}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="edit_childrens_gender" className="form-label">Gender<span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                id="edit_childrens_gender"
                                name="childrens_gender"
                                value={editFormData.childrens_gender}
                                onChange={handleEditInputChange}
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            {editErrors.childrens_gender && <div className="text-danger">{editErrors.childrens_gender}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="edit_childrens_class" className="form-label">Class<span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                id="edit_childrens_class"
                                name="childrens_class"
                                value={editFormData.childrens_class}
                                onChange={handleEditInputChange}
                            >
                                <option value="">Select class</option>
                                {[...Array(12)].map((_, i) => (
                                    <option key={i+1} value={i+1}>{i+1}</option>
                                ))}
                            </select>
                            {editErrors.childrens_class && <div className="text-danger">{editErrors.childrens_class}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="edit_childrens_school_name" className="form-label">School Name<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="edit_childrens_school_name"
                                name="childrens_school_name"
                                value={editFormData.childrens_school_name}
                                onChange={handleEditInputChange}
                            />
                            {editErrors.childrens_school_name && <div className="text-danger">{editErrors.childrens_school_name}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="edit_childrens_school_location" className="form-label">School Location<span className="text-danger">*</span></label>
                            <input
                                type="text"
                                className="form-control"
                                id="edit_childrens_school_location"
                                name="childrens_school_location"
                                value={editFormData.childrens_school_location}
                                onChange={handleEditInputChange}
                            />
                            {editErrors.childrens_school_location && <div className="text-danger">{editErrors.childrens_school_location}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="edit_school_type" className="form-label">School Type<span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                id="edit_school_type"
                                name="school_type"
                                value={editFormData.school_type}
                                onChange={handleEditInputChange}
                            >
                                <option value="">Select Type</option>
                                <option value="Aided">Aided</option>
                                <option value="Unaided">Unaided</option>
                            </select>
                            {editErrors.school_type && <div className="text-danger">{editErrors.school_type}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="edit_syllabus" className="form-label">Syllabus<span className="text-danger">*</span></label>
                            <select
                                className="form-select"
                                id="edit_syllabus"
                                name="syllabus"
                                value={editFormData.syllabus}
                                onChange={handleEditInputChange}
                            >
                                <option value="">Select Syllabus</option>
                                <option value="ICSE">ICSE</option>
                                <option value="CBSE">CBSE</option>
                                <option value="Kerala">Kerala</option>
                                <option value="Other">Other</option>
                            </select>
                            {editErrors.syllabus && <div className="text-danger">{editErrors.syllabus}</div>}
                        </div>

                        <div className="col-12 text-end">
                            <button type="submit" className="btn btn-success m-1" disabled={isSaving}>
                                {isSaving ? 'Updating...' : 'Update'}
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger m-1" 
                                onClick={() => { 
                                    setShowEditModal(false); 
                                    resetForms(); 
                                }} 
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default StaffChildrenDetails;