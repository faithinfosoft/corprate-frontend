import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import useAuth from '../utilities/useAuth';
import { convertDateFormat } from "../utilities/dateconverter";
const StaffPromotionDetails = ({ staffId }) => {
  const auth = useAuth();
  const username = auth.user.username;
  const usertype = auth.user.user_type;
  const [promotionDetails, setPromotionDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState([]);
  const [createFormData, setCreateFormData] = useState({
    fk_staff_id: staffId,
    class_level: '',
    fk_designation_id: '',
    fk_school_id: '',
    promotion_date: '',
    save_flag: false
  });
  
  // Separate state for modal form data
  const [editFormData, setEditFormData] = useState({
    fk_staff_id: staffId,
    class_level: '',
    fk_designation_id: '',
    fk_school_id: '',
    promotion_date: '',
    save_flag: false
  });
  
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [classLevels, setClassLevels] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const validationMessages = {
    class_level: {
      required: 'Class level is required.',
      in_list: 'Invalid class level. Must be LP, UP, HS, or HSE.'
    },
    fk_designation_id: {
      required: 'Designation is required.'
    },
    fk_school_id: {
      required: 'School is required.'
    },
   promotion_date: {
      required: 'Start date is required.',
      valid_date: 'Invalid start date format.'
    },
  
 
  };

  const canAddpromotionDetails = ['corporate_admin', 'corporate_office', 'school_admin', 'school_office'].includes(usertype);
  const canApprove = ['corporate_admin', 'school_admin'].includes(usertype);
  const canReject = usertype === 'corporate_admin';
  

  useEffect(() => {
    fetchPromotionDetails();
    fetchClassLevels();
    fetchDesignations();
    fetchSchools();
  }, [staffId]);

  const fetchPromotionDetails = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/promotion/promotion-details/${staffId}`);
        if (response.data.status) {
            setPromotionDetails(response.data.data);
        } else {
            // If the API returns status false but it's not a server error
            setPromotionDetails([]);
        }
    } catch (error) {
        // Only show error toast for actual errors (network, server, etc.)
        if (error.response?.status !== 404) {  // Assuming 404 means no data
            console.error('Error fetching promotion details:', error);
           
        }
        setPromotionDetails([]);
    }
};

  const fetchClassLevels = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/class-levels/${staffId}`);
      if (response.data.status) {
        setClassLevels(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching class levels:', error);
      print_toast("error", "Failed to fetch class levels");
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/designations`);
      if (response.data.status) {
        setDesignations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching designations:', error);
      print_toast("error", "Failed to fetch designations");
    }
  };

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

  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      if (name === 'start_date') {
        if (newData.end_date && new Date(newData.end_date) <= new Date(value)) {
          newData.end_date = '';
        }
      }
      return newData;
    });

    // Clear only create form errors
    if (createErrors[name]) {
      setCreateErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => {
      const newData = { ...prevData, [name]: value };
      if (name === 'start_date') {
        if (newData.end_date && new Date(newData.end_date) <= new Date(value)) {
          newData.end_date = '';
        }
      }
      return newData;
    });

    // Clear only edit form errors
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (data, isEdit = false) => {
    let newErrors = {};
    
    if (!data.class_level) {
      newErrors.class_level = 'Class level is required.';
    }
    if (!data.fk_designation_id) {
      newErrors.fk_designation_id = 'Designation is required.';
    }
    if (!data.fk_school_id) {
      newErrors.fk_school_id = 'School is required.';
    }
    if (!data.promotion_date) {
      newErrors.promotion_date = 'Promotion date is required.';
    }
  
    // Set errors based on whether we're validating create or edit form
    if (isEdit) {
      setEditErrors(newErrors);
    } else {
      setCreateErrors(newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!validateForm(createFormData, false)) {
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await axios.post(`${globalVariables.api_url}/promotion/save_promotion`, {
        ...createFormData,
        usertype: usertype
      ,
      
    },
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchPromotionDetails();
        resetCreateForm();
      } else {
        setCreateErrors(response.data.error || {});
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error saving service details:', error);
      setCreateErrors(error.response?.data?.error || {});
      print_toast("error", error.response?.data?.message || "Failed to save service details");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm(editFormData, true)) {
      return;
    }

    setIsUpdating(true);
    
    try {
      const response = await axios.put(`${globalVariables.api_url}/staff/service-details/${editingId}`, {
        ...editFormData,
        usertype: usertype
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchPromotionDetails();
        setShowModal(false);
        resetEditForm();
      } else {
        setEditErrors(response.data.error || {});
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error updating service details:', error);
      setEditErrors(error.response?.data?.error || {});
      print_toast("error", error.response?.data?.message || "Failed to update service details");
    } finally {
      setIsUpdating(false);
    }
  };


  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'verified' && usertype === 'school_admin') {
      if (!window.confirm('Once approved, you cannot delete or edit the details. Do you want to continue?')) {
        return;
      }
    }

    setIsProcessing(true);
    try {
      const response = await axios.put(`${globalVariables.api_url}/staff/service-details/${id}`, {
        status: newStatus,
        usertype: usertype // Adding usertype to the request
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchPromotionDetails();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      print_toast("error", "Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const getDesignationName = (designationId) => {
    const designation = designations.find(d => d.designation_id === designationId);
    return designation ? designation.designation_name : 'Unknown';
  };

  const getschoolName = (schoolId) => {
    const school = schools.find(d => d.school_id === schoolId);
    return school ? school.school_name : 'Unknown';
  };

  const handleEdit = (service) => {
    // Format dates for the form
    const formattedService = {
      ...service,
      start_date:convertDateFormat(service.start_date),
      end_date: convertDateFormat(service.end_date)
    };
    
    setEditFormData(formattedService);
    setEditingId(service.service_id);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service detail?')) {
      try {
        const response = await axios.delete(`${globalVariables.api_url}/staff/service-details/${id}`);
        if (response.data.status) {
          print_toast("success", response.data.message);
          fetchPromotionDetails();
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error('Error deleting service details:', error);
        print_toast("error", "Failed to delete service details");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const year = date.getFullYear();
    return `${day}-${month}-${year}`; // Format as dd-mm-yyyy
  };
  

  const resetCreateForm = () => {
    setCreateFormData({
      fk_staff_id: staffId,
      class_level: '',
      fk_designation_id: '',
      promotion_date: '',
      end_date: '',
     
      save_flag: false
    });
    setCreateErrors({});
  };

  const resetEditForm = () => {
    setEditFormData({
        fk_staff_id: staffId,
        class_level: '',
        fk_designation_id: '',
        promotion_date: '',
        end_date: '',
       
        save_flag: false
     
    });
    setEditingId(null);
    setEditErrors({});
  };

  return (
    <div className="row">
<div className="col-lg-8">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Promotion Details</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
            <table className="table table-bordered datatable" style={{ minWidth: '1000px' }}>
                <thead>
                  <tr>
                    <th scope="col" className="text-center">Sl No.</th>
                    <th scope="col" className="text-center">School</th>
                    <th scope="col" className="text-center">Class Level</th>
                    <th scope="col" className="text-center">Designation</th>
                 
                    <th scope="col" className="text-center">Promotion Date</th>
                    <th scope="col" className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                {promotionDetails.length === 0 ? (
                                            <tr>
                                                <td colSpan={10}>
                                                <NoDataFound />
                                                </td>
                                            </tr>
                                        ) : (
                  promotionDetails.map((service, index) => (
                    <tr key={service.promotion_detail_id}>
                      <td>{index + 1}</td>
                      <td>{getschoolName(service.fk_school_id)}</td>
                      <td>{service.class_level}</td>
                      <td>{getDesignationName(service.fk_designation_id)}</td>
                     
                      <td>{formatDate(service.promotion_date)}</td>
                     

                      <td>
                        <div className="dropdown">
                          <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Action
                          </button>
                          <ul className="dropdown-menu">
                           
                              <>
                                <li>
                                  <a href="#" className="dropdown-item" onClick={() => handleEdit(service)}>Edit</a>
                                </li>
                              </>
                     
                        
                         
                            {service.status === 'pending' && (
                              <>
                                <li>
                                  <a href="#" className="dropdown-item" onClick={() => handleDelete(service.service_id)}>Delete</a>
                                </li>
                              </>
                            )}
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

      <div className="col-lg-4">
        <div className="card">
          <div className="card-header">
          <h5 className="card-title">Create Promotion Detail</h5>
          </div>
          <div className="card-body">
            <form role="form" onSubmit={handleCreate} className="row g-3">
            <div className="col-12">
                  <label htmlFor="fk_school_id" className="form-label">School<span className="text-danger">*</span></label>
                  <select
                      className="form-select"
                      id="fk_school_id"
                      name="fk_school_id"
                      value={createFormData.fk_school_id}
                      onChange={handleCreateInputChange}
                  >
                      <option value="">Select School</option>
                      {schools.map((school) => (
                          <option key={school.school_id} value={school.school_id}>
                              {school.school_name} , {school.location}
                          </option>
                      ))}
                  </select>
                  {createErrors.fk_school_id && <div className="text-danger">{createErrors.fk_school_id}</div>}
              </div>
              <div className="col-12">
                <label htmlFor="class_level" className="form-label">Class Level<span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  id="class_level"
                  name="class_level"
                  value={createFormData.class_level}
                  onChange={handleCreateInputChange}
                >
                  <option value="">Select Class Level</option>
                  {classLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                {createErrors.class_level && <div className="text-danger">{createErrors.class_level}</div>}
              </div>

              <div className="col-12">
                <label htmlFor="fk_designation_id" className="form-label">Designation<span className="text-danger">*</span></label>
                <select
                  className="form-select"
                  id="fk_designation_id"
                  name="fk_designation_id"
                  value={createFormData.fk_designation_id}
                  onChange={handleCreateInputChange}
                >
                  <option value="">Select Designation</option>
                  {designations.map((designation) => (
                    <option key={designation.designation_id} value={designation.designation_id}>{designation.designation_name}</option>
                  ))}
                </select>
                {createErrors.fk_designation_id && <div className="text-danger">{createErrors.fk_designation_id}</div>}
              </div>

             

              <div className="col-12">
                <label htmlFor="promotion_date" className="form-label">Promotion Date<span className="text-danger">*</span></label>
                <input
                  type="date"
                  className="form-control"
                  id="promotion_date"
                  name="promotion_date"
                  value={createFormData.promotion_date}
                  onChange={handleCreateInputChange}
                />
                {createErrors.promotion_date && <div className="text-danger">{createErrors.promotion_date}</div>}
              </div>

          

              <div className="col-12 text-end">
                <button type="submit" className="btn btn-success m-1" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="btn btn-danger m-1" onClick={resetCreateForm} disabled={isSaving}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => { setShowModal(false); resetEditForm(); }}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Promotion Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={handleUpdate} className="row g-3">
            <div className="col-12">
              <label htmlFor="class_level" className="form-label">Class Level<span className="text-danger">*</span></label>
              <select
                className="form-select"
                id="class_level"
                name="class_level"
                value={editFormData.class_level}
                onChange={handleEditInputChange}
              >
                <option value="">Select Class Level</option>
                {classLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              {editErrors.class_level && <div className="text-danger">{editErrors.class_level}</div>}
            </div>

            <div className="col-12">
              <label htmlFor="fk_designation_id" className="form-label">Designation<span className="text-danger">*</span></label>
              <select
                className="form-select"
                id="fk_designation_id"
                name="fk_designation_id"
                value={editFormData.fk_designation_id}
                onChange={handleEditInputChange}
              >
                <option value="">Select Designation</option>
                {designations.map((designation) => (
                  <option key={designation.designation_id} value={designation.designation_id}>{designation.designation_name}</option>
                ))}
              </select>
              {editErrors.fk_designation_id && <div className="text-danger">{editErrors.fk_designation_id}</div>}
            </div>

            <div className="col-12">
                <label htmlFor="fk_school_id" className="form-label">School<span className="text-danger">*</span></label>
                <select
                    className="form-select"
                    id="fk_school_id"
                    name="fk_school_id"
                    value={editFormData.fk_school_id}
                    onChange={handleEditInputChange}
                >
                    <option value="">Select School</option>
                    {schools.map((school) => (
                        <option key={school.school_id} value={school.school_id}>
                            {school.school_name} , {school.location}
                        </option>
                    ))}
                </select>
                {editErrors.fk_school_id && <div className="text-danger">{editErrors.fk_school_id}</div>}
            </div>

            <div className="col-12">
              <label htmlFor="promotion_date" className="form-label">Promotion Date<span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                id="promotion_date"
                name="promotion_date"
                value={editFormData.promotion_date}
                onChange={handleEditInputChange}
              />
              {editErrors.promotion_date && <div className="text-danger">{editErrors.promotion_date}</div>}
            </div>

      


            <div className="col-12 text-end">
              <Button type="submit" variant="success" className="m-1" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
              <Button 
                variant="danger" 
                className="m-1" 
                onClick={() => { setShowModal(false); resetEditForm(); }} 
                disabled={isUpdating}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

    </div>
  );
};

export default StaffPromotionDetails;





