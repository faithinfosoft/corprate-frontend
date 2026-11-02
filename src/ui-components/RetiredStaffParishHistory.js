import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Table, Modal } from 'react-bootstrap';
import NoDataFound from './NoDataFound.js';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import useAuth from "../utilities/useAuth.js";

const RetiredStaffParishHistory = ({ staffId }) => {
    const auth = useAuth();
    const [parishHistory, setParishHistory] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [parishes, setParishes] = useState([]);
    const [foranes, setForanes] = useState([]);
    const [parishesForEdit, setParishesForEdit] = useState([]);
    
    const [editFormData, setEditFormData] = useState({
        fk_staff_id: staffId,
        parish_name: '',
        parish_location: '',
        parish_status: '',
        diocese: '',
        forane_id: '',
        other_diocese: '',
        other_forane: '',
        other_parish: ''
    });
    
    const [editErrors, setEditErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchParishHistory();
        fetchForanes();
    }, [staffId]);

    const fetchParishHistory = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/staff/parish-history/${staffId}`);
            if (response.data.status) {
                setParishHistory(response.data.data);
            } else {
                setParishHistory([]);
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Error fetching parish history:', error);
            }
            setParishHistory([]);
        }
    };

    const fetchForanes = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/forane/view_forane`);
            if (response.data.status) {
                setForanes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching foranes:', error.message);
            print_toast("error", "Failed to fetch Forane data");
        }
    };

    const fetchParishesByForane = async (foraneId) => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/candidate/get-parishes-by-forane/${foraneId}`);
            if (response.data.status && Array.isArray(response.data.data)) {
                setParishesForEdit(response.data.data);
            } else {
                setParishesForEdit([]);
            }
        } catch (error) {
            console.error('Error fetching parishes:', error);
            setParishesForEdit([]);
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
        setEditErrors({ ...editErrors, [name]: '' });

        if (name === 'forane_id') {
            fetchParishesByForane(value);
            setEditFormData(prev => ({ ...prev, parish_name: '' }));
        }
    };

    const validateForm = (formData) => {
        let newErrors = {};
        
        if (!formData.diocese) {
            newErrors.diocese = 'Diocese is required.';
        }

        if (formData.diocese === 'Others') {
            if (!formData.other_diocese) {
                newErrors.other_diocese = 'Diocese name is required.';
            }
            if (!formData.other_forane) {
                newErrors.other_forane = 'Forane name is required.';
            }
            if (!formData.parish_name) {
                newErrors.parish_name = 'Parish name is required.';
            }
        } else if (formData.diocese === 'Changanacherry') {
            if (!formData.forane_id) {
                newErrors.forane_id = 'Forane is required.';
            }
            if (!formData.parish_name) {
                newErrors.parish_name = 'Parish name is required.';
            } else if (formData.parish_name.length < 3) {
                newErrors.parish_name = 'Parish name must be at least 3 characters long.';
            } else if (formData.parish_name.length > 500) {
                newErrors.parish_name = 'Parish name cannot exceed 500 characters.';
            }
            if (!formData.parish_location) {
                newErrors.parish_location = 'Parish location is required.';
            } else if (formData.parish_location.length < 3) {
                newErrors.parish_location = 'Parish location must be at least 3 characters long.';
            } else if (formData.parish_location.length > 500) {
                newErrors.parish_location = 'Parish location cannot exceed 500 characters.';
            }
        }

        if (!formData.parish_status) {
            newErrors.parish_status = 'Parish status is required.';
        } else if (!['active', 'inactive'].includes(formData.parish_status)) {
            newErrors.parish_status = 'Invalid parish status. Must be either active or inactive.';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm(editFormData);
        setEditErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsSaving(true);
        try {
            const response = await axios.put(`${globalVariables.api_url}/staff/parish-history/${editingId}`, editFormData);

            if (response.data.status) {
                print_toast("success", response.data.message);
                fetchParishHistory();
                setShowEditModal(false);
                resetEditForm();
            } else {
                const serverErrors = response.data.errors || {};
                setEditErrors(serverErrors);
                print_toast("error", response.data.message);
            }
        } catch (error) {
            console.error('Error saving parish history:', error);
            print_toast("error", error.response?.data?.message || "Failed to save parish history");
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (parish) => {
        setEditFormData({
            ...parish,
            fk_staff_id: staffId
        });
        setEditingId(parish.staff_parish_history_id);
        setEditErrors({});
        
        if (parish.diocese === 'Changanacherry' && parish.forane_id) {
            fetchParishesByForane(parish.forane_id);
        }
        
        setShowEditModal(true);
    };

    const resetEditForm = () => {
        setEditFormData({
            fk_staff_id: staffId,
            parish_name: '',
            parish_location: '',
            parish_status: '',
            diocese: '',
            forane_id: '',
            other_diocese: '',
            other_forane: '',
            other_parish: ''
        });
        setEditingId(null);
        setEditErrors({});
        setParishesForEdit([]);
    };

    return (
        <>
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title">Parish History Details</h5>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered datatable">
                                    <thead>
                                        <tr>
                                            <th scope="col" className='text-center'>Sl No.</th>
                                            <th scope="col" className='text-center'>Diocese</th>
                                            <th scope="col" className='text-center'>Parish Name</th>
                                            <th scope="col" className='text-center'>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parishHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan={4}>
                                                    <NoDataFound />
                                                </td>
                                            </tr>
                                        ) : (
                                            parishHistory.map((parish, index) => (
                                                <tr key={parish.staff_parish_history_id}>
                                                    <td>{index + 1}</td>
                                                    <td>{parish.diocese}</td>
                                                    <td>{parish.parish_name}</td>
                                                    <td>
                                                        <div className="dropdown">
                                                            <button className="btn btn-dark dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                                                Action
                                                            </button>
                                                            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                                                <li>
                                                                    <a href="#" className="dropdown-item" onClick={() => handleEdit(parish)}>Edit</a>
                                                                </li>
                                                            </ul>
                                                        </div>
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
            </div>

            {/* Edit Parish History Modal */}
            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); resetEditForm(); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Parish History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form role="form" onSubmit={handleSubmit} className="row g-3">
                        {/* Diocese */}
                        <div className="col-12">
                            <label htmlFor="edit_diocese" className="col-sm-12 col-form-label">
                                Diocese<span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-control"
                                id="edit_diocese"
                                name="diocese"
                                value={editFormData.diocese}
                                onChange={handleEditInputChange}
                            >
                                <option value="">Select Diocese</option>
                                <option value="Changanacherry">Changanacherry</option>
                                <option value="Others">Others</option>
                            </select>
                            {editErrors.diocese && <span className="text-danger">{editErrors.diocese}</span>}
                        </div>

                        {/* When "Others" selected */}
                        {editFormData.diocese === "Others" && (
                            <>
                                <div className="col-12">
                                    <label htmlFor="edit_other_diocese" className="col-sm-12 col-form-label">
                                        Diocese Name<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="edit_other_diocese"
                                        name="other_diocese"
                                        value={editFormData.other_diocese || ''}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter Diocese"
                                    />
                                    {editErrors.other_diocese && <span className="text-danger">{editErrors.other_diocese}</span>}
                                </div>

                                <div className="col-12">
                                    <label htmlFor="edit_other_forane" className="col-sm-12 col-form-label">
                                        Forane Name<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="edit_other_forane"
                                        name="other_forane"
                                        value={editFormData.other_forane || ''}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter Forane"
                                    />
                                    {editErrors.other_forane && <span className="text-danger">{editErrors.other_forane}</span>}
                                </div>

                                <div className="col-12">
                                    <label htmlFor="edit_other_parish" className="col-sm-12 col-form-label">
                                        Parish Name<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="edit_other_parish"
                                        name="parish_name"
                                        value={editFormData.parish_name}
                                        onChange={handleEditInputChange}
                                        placeholder="Enter Parish"
                                    />
                                    {editErrors.parish_name && <span className="text-danger">{editErrors.parish_name}</span>}
                                </div>
                            </>
                        )}

                        {/* When "Changanacherry" selected */}
                        {editFormData.diocese === "Changanacherry" && (
                            <>
                                <div className="col-12">
                                    <label htmlFor="edit_forane_id" className="col-sm-12 col-form-label">
                                        Forane<span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        id="edit_forane_id"
                                        name="forane_id"
                                        value={editFormData.forane_id || ''}
                                        onChange={handleEditInputChange}
                                    >
                                        <option value="">Select Forane</option>
                                        {foranes.map(forane => (
                                            <option key={forane.forane_id} value={forane.forane_id}>
                                                {forane.forane_name}
                                            </option>
                                        ))}
                                    </select>
                                    {editErrors.forane_id && <span className="text-danger">{editErrors.forane_id}</span>}
                                </div>

                                <div className="col-12">
                                    <label htmlFor="edit_parish_name" className="col-sm-12 col-form-label">
                                        Parish Name<span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        id="edit_parish_name"
                                        name="parish_name"
                                        value={editFormData.parish_name}
                                        onChange={handleEditInputChange}
                                    >
                                        <option value="">Select Parish</option>
                                        {parishesForEdit.map((parish) => (
                                            <option key={parish.parish_id} value={`${parish.parish_name}, ${parish.location}`}>
                                                {parish.parish_name}, {parish.location}
                                            </option>
                                        ))}
                                    </select>
                                    {editErrors.parish_name && <span className="text-danger">{editErrors.parish_name}</span>}
                                </div>

                                <div className="col-12">
                                    <label htmlFor="edit_parish_location" className="col-sm-12 col-form-label">
                                        Parish Location<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="edit_parish_location"
                                        name="parish_location"
                                        value={editFormData.parish_location}
                                        onChange={handleEditInputChange}
                                        list="edit-location-options"
                                    />
                                    <datalist id="edit-location-options">
                                        {parishesForEdit.map((parish) => (
                                            <option key={parish.parish_id} value={parish.location} />
                                        ))}
                                    </datalist>
                                    {editErrors.parish_location && <span className="text-danger">{editErrors.parish_location}</span>}
                                </div>
                            </>
                        )}

                        {/* Status */}
                        <div className="col-12">
                            <label htmlFor="parish_status" className="col-sm-12 col-form-label">
                                Status<span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-control"
                                id="parish_status"
                                name="parish_status"
                                value={editFormData.parish_status}
                                onChange={handleEditInputChange}
                            >
                                <option value="">Select status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {editErrors.parish_status && <span className="text-danger">{editErrors.parish_status}</span>}
                        </div>
                        
                        <div className="col-12 text-end">
                            <button type="submit" className="btn btn-success m-1" disabled={isSaving}>
                                {isSaving ? 'Updating...' : 'Update'}
                            </button>
                            <button type="button" onClick={() => { resetEditForm(); setShowEditModal(false); }} className="btn btn-danger m-1" disabled={isSaving}>Cancel</button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default RetiredStaffParishHistory;