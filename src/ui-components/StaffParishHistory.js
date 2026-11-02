import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Table, Modal } from 'react-bootstrap';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import useAuth from "../utilities/useAuth";
import { capitalizeWords } from '../utilities/dateconverter';

const StaffParishHistory = ({ staffId }) => {
    const auth = useAuth();
    const userType = auth.user.user_type;
    const [parishHistory, setParishHistory] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [parishes, setParishes] = useState([]);
    const [foranes, setForanes] = useState([]);
    const [parishesForCreate, setParishesForCreate] = useState([]);
    const [parishesForEdit, setParishesForEdit] = useState([]);
    
    const [createFormData, setCreateFormData] = useState({
        fk_staff_id: staffId,
        parish_name: '',
        parish_status: '',
        diocese: '',
        forane_id: '',
        other_diocese: '',
        other_forane: '',
        other_parish: ''
    });
    
    const [editFormData, setEditFormData] = useState({
        fk_staff_id: staffId,
        parish_name: '',
        parish_status: '',
        diocese: '',
        forane_id: '',
        other_diocese: '',
        other_forane: '',
        other_parish: ''
    });
    
    const [createErrors, setCreateErrors] = useState({});
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

    const fetchParishesByForane = async (foraneId, isEdit = false) => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/candidate/get-parishes-by-forane/${foraneId}`);
            if (response.data.status && Array.isArray(response.data.data)) {
                if (isEdit) {
                    setParishesForEdit(response.data.data);
                } else {
                    setParishesForCreate(response.data.data);
                }
            } else {
                if (isEdit) {
                    setParishesForEdit([]);
                } else {
                    setParishesForCreate([]);
                }
            }
        } catch (error) {
            console.error('Error fetching parishes:', error);
            if (isEdit) {
                setParishesForEdit([]);
            } else {
                setParishesForCreate([]);
            }
        }
    };

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        setCreateFormData({ ...createFormData, [name]: value });
        setCreateErrors({ ...createErrors, [name]: '' });

        if (name === 'forane_id') {
            fetchParishesByForane(value, false);
            setCreateFormData(prev => ({ ...prev, parish_name: '' }));
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({ ...editFormData, [name]: value });
        setEditErrors({ ...editErrors, [name]: '' });

        if (name === 'forane_id') {
            fetchParishesByForane(value, true);
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
            }
        }

        if (!formData.parish_status) {
            newErrors.parish_status = 'Parish status is required.';
        } else if (!['active', 'inactive'].includes(formData.parish_status)) {
            newErrors.parish_status = 'Invalid parish status. Must be either active or inactive.';
        }

        return newErrors;
    };

    const handleSubmit = async (e, isEditing) => {
        e.preventDefault();
        const formData = isEditing ? { ...editFormData } : { ...createFormData };
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
                response = await axios.put(`${globalVariables.api_url}/staff/parish-history/${editingId}`, formData);
            } else {
                response = await axios.post(`${globalVariables.api_url}/staff/parish-history`, formData);
            }

            if (response.data.status) {
                print_toast("success", response.data.message);
                fetchParishHistory();
                if (isEditing) {
                    setShowEditModal(false);
                    resetEditForm();
                } else {
                    setShowCreateModal(false);
                    resetCreateForm();
                }
            } else {
                const serverErrors = response.data.errors || {};
                if (isEditing) {
                    setEditErrors(serverErrors);
                } else {
                    setCreateErrors(serverErrors);
                }
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
        // Prepare the form data based on diocese type
        let formData = {
            fk_staff_id: staffId,
            parish_status: parish.parish_status,
            forane_id: '',
            parish_name: '',
            diocese: '',
            other_diocese: '',
            other_forane: '',
            other_parish: ''
        };

        if (parish.diocese === 'Changanacherry') {
            // For "Changanacherry" diocese, populate forane_id and parish_name
            formData.diocese = 'Changanacherry';
            formData.forane_id = parish.forane_id || '';
            formData.parish_name = parish.fk_parish_id || '';
            
            // Fetch parishes for the selected forane
            if (parish.forane_id) {
                fetchParishesByForane(parish.forane_id, true);
            }
        } else {
            // For "Others" diocese, populate the "other" fields
            formData.diocese = 'Others';
            formData.other_diocese = parish.diocese || '';
            formData.other_forane = parish.forane || '';
            formData.parish_name = parish.parish_name || '';
        } 

        setEditFormData(formData);
        setEditingId(parish.staff_parish_history_id);
        setEditErrors({});
        setShowEditModal(true);
    };
const handleEdit1 = (parish) => {
        // Prepare the form data based on diocese type
        let formData = {
            fk_staff_id: staffId,
            diocese: parish.diocese,
            parish_status: parish.parish_status,
            forane_id: '',
            parish_name: '',
            other_diocese: '',
            other_forane: '',
            other_parish: ''
        };

      if (parish.diocese === 'Changanacherry') {
            // For "Changanacherry" diocese, populate forane_id and parish_name
            formData.forane_id = parish.forane_id || '';
            formData.parish_name = parish.fk_parish_id || '';
            
            // Fetch parishes for the selected forane
            if (parish.forane_id) {
                fetchParishesByForane(parish.forane_id, true);
            }
        }
        else  {
            formData.diocese = parish.diocese || '';
            // For "Others" diocese, populate the "other" fields
            formData.other_diocese = parish.diocese || '';
            formData.other_forane = parish.forane || '';
            formData.parish_name = parish.parish_name || '';
        } 

        setEditFormData(formData);
        setEditingId(parish.staff_parish_history_id);
        setEditErrors({});
        setShowEditModal(true);
    };


    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this parish history?')) {
            try {
                const response = await axios.delete(`${globalVariables.api_url}/staff/parish-history/${id}`);
                if (response.data.status) {
                    print_toast("success", response.data.message);
                    fetchParishHistory();
                } else {
                    print_toast("error", response.data.message);
                }
            } catch (error) {
                console.error('Error deleting parish history:', error);
                print_toast("error", "Failed to delete parish history");
            }
        }
    };

    const resetCreateForm = () => {
        setCreateFormData({
            fk_staff_id: staffId,
            parish_name: '',
            parish_status: '',
            diocese: '',
            forane_id: '',
            other_diocese: '',
            other_forane: '',
            other_parish: ''
        });
        setCreateErrors({});
        setParishesForCreate([]);
    };

    const resetEditForm = () => {
        setEditFormData({
            fk_staff_id: staffId,
            parish_name: '',
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
                    <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ overflow: 'hidden' }}>
                        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center" style={{ borderTop: '4px solid #0ea5e9' }}>
                            <h5 className="card-title mb-0 fw-bold text-dark">Parish History Details</h5>
                            <button className="btn btn-primary rounded-pill px-4 shadow-sm fw-medium" onClick={() => {
                                resetCreateForm();
                                setShowCreateModal(true);
                            }}>
                                <i className="bi bi-plus-lg me-2"></i>
                                Create
                            </button>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
  <thead className="table-light text-muted">
    <tr>
      <th scope="col" className='text-center fw-semibold py-3 border-bottom'>Sl No.</th>
      <th scope="col" className='text-center fw-semibold py-3 border-bottom'>Diocese</th>
      <th scope="col" className='text-center fw-semibold py-3 border-bottom'>Forane</th>
      <th scope="col" className='text-center fw-semibold py-3 border-bottom'>Parish Name</th>
      <th scope="col" className='text-center fw-semibold py-3 border-bottom'>Status</th>
      <th scope="col" className='text-center fw-semibold py-3 border-bottom'>Actions</th>
    </tr>
  </thead>
  <tbody>
    {parishHistory.length === 0 ? (
      <tr>
        <td colSpan={6} className="text-center py-5">
          <NoDataFound />
        </td>
      </tr>
    ) : (
      parishHistory.map((parish, index) => (
        <tr key={parish.staff_parish_history_id} style={{ transition: 'all 0.2s' }}>
          <td className="text-center text-muted fw-medium py-3">{index + 1}</td>
          <td className="text-center fw-medium text-dark py-3">{parish.diocese}</td>
          <td className="text-center text-muted py-3">
            {parish.diocese === "Changanacherry"
              ? parish.forane_name || "-"
              : parish.forane || "-"
            }
          </td>
          <td className="text-center text-muted py-3">
            {parish.diocese === "Changanacherry"
              ? parish.parish || "-"
              : parish.parish_name || "-"
            }
          </td>
          <td className="text-center py-3">
            <span className={`badge ${parish.parish_status?.toLowerCase() === 'active' ? 'bg-success text-white' : 'bg-secondary text-white'} rounded-pill px-3 py-2 shadow-sm fw-medium`}>
              {capitalizeWords(parish.parish_status)}
            </span>
          </td>
          <td className="text-center py-3">
            <div className="dropdown">
              <button
                className="btn btn-outline-primary btn-sm rounded-pill dropdown-toggle px-3 shadow-sm"
                type="button"
                id={`dropdownMenuButton-${index}`}
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Action
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1" aria-labelledby={`dropdownMenuButton-${index}`}>
                <li>
                  <button className="dropdown-item py-2 fw-medium text-primary d-flex align-items-center" onClick={() => handleEdit(parish)}>
                    <i className="bi bi-pencil-square me-2"></i> Edit
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2 fw-medium text-danger d-flex align-items-center" onClick={() => handleDelete(parish.staff_parish_history_id)}>
                    <i className="bi bi-trash me-2"></i> Delete
                  </button>
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

            {/* Create Parish History Modal */}
            <Modal show={showCreateModal} onHide={() => { setShowCreateModal(false); resetCreateForm(); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Parish History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form role="form" onSubmit={(e) => handleSubmit(e, false)} className='row g-3'>
                        {/* Diocese */}
                        <div className="col-12">
                            <label htmlFor="diocese" className="col-sm-12 col-form-label">
                                Diocese<span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-control"
                                id="diocese"
                                name="diocese"
                                value={createFormData.diocese}
                                onChange={handleCreateInputChange}
                            >
                                <option value="">Select Diocese</option>
                                <option value="Changanacherry">Changanacherry</option>
                                <option value="Others">Others</option>
                            </select>
                            {createErrors.diocese && <span className="text-danger">{createErrors.diocese}</span>}
                        </div>

                        {/* When "Others" selected */}
                        {createFormData.diocese === "Others" && (
                            <>
                                <div className="col-12">
                                    <label htmlFor="other_diocese" className="col-sm-12 col-form-label">
                                        Diocese Name<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="other_diocese"
                                        name="other_diocese"
                                        value={createFormData.other_diocese || ''}
                                        onChange={handleCreateInputChange}
                                        placeholder="Enter Diocese"
                                    />
                                    {createErrors.other_diocese && <span className="text-danger">{createErrors.other_diocese}</span>}
                                </div>

                                <div className="col-12">
                                    <label htmlFor="other_forane" className="col-sm-12 col-form-label">
                                        Forane Name<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="other_forane"
                                        name="other_forane"
                                        value={createFormData.other_forane || ''}
                                        onChange={handleCreateInputChange}
                                        placeholder="Enter Forane"
                                    />
                                    {createErrors.other_forane && <span className="text-danger">{createErrors.other_forane}</span>}
                                </div>

                                <div className="col-12">
                                    <label htmlFor="other_parish" className="col-sm-12 col-form-label">
                                        Parish Name<span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="other_parish"
                                        name="parish_name"
                                        value={createFormData.parish_name}
                                        onChange={handleCreateInputChange}
                                        placeholder="Enter Parish"
                                    />
                                    {createErrors.parish_name && <span className="text-danger">{createErrors.parish_name}</span>}
                                </div>
                            </>
                        )}

                        {/* When "Changanacherry" selected */}
                        {createFormData.diocese === "Changanacherry" && (
                            <>
                                <div className="col-12">
                                    <label htmlFor="forane_id" className="col-sm-12 col-form-label">
                                        Forane<span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        id="forane_id"
                                        name="forane_id"
                                        value={createFormData.forane_id || ''}
                                        onChange={handleCreateInputChange}
                                    >
                                        <option value="">Select Forane</option>
                                        {foranes.map(forane => (
                                            <option key={forane.forane_id} value={forane.forane_id}>
                                                {forane.forane_name}
                                            </option>
                                        ))}
                                    </select>
                                    {createErrors.forane_id && <span className="text-danger">{createErrors.forane_id}</span>}
                                </div>

                                <div className="col-12">
                                    <label htmlFor="parish_name" className="col-sm-12 col-form-label">
                                        Parish Name<span className="text-danger">*</span>
                                    </label>
                                    <select
                                        className="form-control"
                                        id="parish_name"
                                        name="parish_name"
                                        value={createFormData.parish_name}
                                        onChange={handleCreateInputChange}
                                    >
                                        <option value="">Select Parish</option>
                                        {parishesForCreate.map((parish) => (
                                            <option key={parish.parish_id} value={parish.parish_id}>
                                                {parish.parish_name}
                                            </option>
                                        ))}
                                    </select>
                                    {createErrors.parish_name && <span className="text-danger">{createErrors.parish_name}</span>}
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
                                value={createFormData.parish_status}
                                onChange={handleCreateInputChange}
                            >
                                <option value="">Select status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {createErrors.parish_status && <span className="text-danger">{createErrors.parish_status}</span>}
                        </div>

                        <div className="col-12 text-end">
                            <button type="submit" className="btn btn-success m-1" disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" className="btn btn-danger m-1" onClick={() => { setShowCreateModal(false); resetCreateForm(); }} disabled={isSaving}>Cancel</button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Edit Parish History Modal */}
            <Modal show={showEditModal} onHide={() => { setShowEditModal(false); resetEditForm(); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Parish History</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form role="form" onSubmit={(e) => handleSubmit(e, true)} className="row g-3">
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
                                            <option key={parish.parish_id} value={parish.parish_id}>
                                                {parish.parish_name} ,{parish.location}
                                            </option>
                                        ))}
                                    </select>
                                    {editErrors.parish_name && <span className="text-danger">{editErrors.parish_name}</span>}
                                </div>
                            </>
                        )}

                        {/* Status */}
                        <div className="col-12">
                            <label htmlFor="edit_parish_status" className="col-sm-12 col-form-label">
                                Status<span className="text-danger">*</span>
                            </label>
                            <select
                                className="form-control"
                                id="edit_parish_status"
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

export default StaffParishHistory;