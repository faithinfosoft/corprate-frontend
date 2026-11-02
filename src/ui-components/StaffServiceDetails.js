import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import useAuth from '../utilities/useAuth';
import { convertDateFormat } from "../utilities/dateconverter";
import { capitalizeWords } from '../utilities/dateconverter';
import Select from 'react-select';

const StaffServiceDetails = ({ staffId }) => {
  const auth = useAuth();
  const username = auth.user.username;
  const usertype = auth.user.user_type;
  const [serviceDetails, setServiceDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [createFormData, setCreateFormData] = useState({
    fk_staff_id: staffId,
    staff_type: '',
    fk_designation_id: '',
    fk_school_id: '',
    start_date: '',
    end_date: '',
    service_type: '',
    remarks: '',
    service_status:'',
    status: 'pending',
    save_flag: false
  });
  
  // Separate state for modal form data
  const [editFormData, setEditFormData] = useState({
    fk_staff_id: staffId,
    staff_type: '',
    fk_designation_id: '',
    fk_school_id: '',
    start_date: '',
    end_date: '',
    service_type: '',
    remarks: '',
    service_status:'',
    status: 'pending',
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
      in_list: 'Invalid class level. Must be LP, UP, HS, or HSS.'
    },
    fk_designation_id: {
      required: 'Designation is required.'
    },
    fk_school_id: {
      required: 'School is required.'
    },
    start_date: {
      required: 'Start date is required.',
      valid_date: 'Invalid start date format.'
    },
   
    service_type: {
      required: 'Service type is required.',
      in_list: 'Invalid service type. Must be permanent and  temporary.'
    },
    service_status: {
      required: 'Service Status is required.'
    },
   
    status: {
      required: 'Status is required.',
      in_list: 'Invalid status. Must be pending, active, or Completed.'
    },
    end_date: {
      required: 'End date is required.',
      valid_date: 'Invalid end date format.',
      later_than_start: 'End date must be later than the start date.'
    },
  };

  const canAddServiceDetails = ['corporate_admin', 'corporate_office', 'school_admin', 'school_office', 'staff'].includes(usertype);
  //const canApprove = ['corporate_admin'].includes(usertype);
  const canReject = usertype === 'corporate_admin';
  const canApprove =usertype === 'corporate_admin';

  useEffect(() => {
    fetchServiceDetails();
    fetchClassLevels();
    //fetchDesignations();
    fetchSchools();
  }, [staffId]);

  const fetchServiceDetails = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/staff/service-details/${staffId}`);
        if (response.data.status) {
            setServiceDetails(response.data.data);
        } else {
            // If the API returns status false but it's not a server error
            setServiceDetails([]);
        }
    } catch (error) {
        // Only show error toast for actual errors (network, server, etc.)
        if (error.response?.status !== 404) {  // Assuming 404 means no data
            console.error('Error fetching service details:', error);
            print_toast("error", "Failed to fetch service details");
        }
        setServiceDetails([]);
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

  // const fetchDesignations = async () => {
  //   try {
  //     const response = await axios.get(`${globalVariables.api_url}/staff/designations`);
  //     if (response.data.status) {
  //       setDesignations(response.data.data);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching designations:', error);
  //     print_toast("error", "Failed to fetch designations");
  //   }
  // };

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


    const selectedText = e.target.tagName === "SELECT" 
    ? e.target.options[e.target.selectedIndex].text 
    : value;

    setCreateFormData(prevData => {
      const newData = { ...prevData, [name]: value,
        designation_name: name === "fk_designation_id" ? selectedText : prevData.designation_name,
       };
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

    if (name === "staff_type") {
      fetchDesignations(value); // Fetch designations based on the selected staff_type
    }
  };
  const fetchDesignations = async (staffType) => {
    try {
      // Replace with your API endpoint that fetches designations based on the staff_type
      
      //const response = await axios.get(`${globalVariables.api_url}/staff/designations`);
      const response = await axios.get(`${globalVariables.api_url}/staff/designations`, {
        params: { staff_type: staffType }
      });
      
      // Update the designations based on the fetched data
      setDesignations(response.data.data);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    const selectedText = e.target.tagName === "SELECT" 
    ? e.target.options[e.target.selectedIndex].text 
    : value;

    setEditFormData(prevData => {
      const newData = { ...prevData, [name]: value,
        designation_name: name === "fk_designation_id" ? selectedText : prevData.designation_name, // Store selected text
       };
      if (name === 'start_date') {
        if (newData.end_date && new Date(newData.end_date) <= new Date(value)) {
          newData.end_date = '';
        }
      }
      
      return newData;
    });

    if (name === "staff_type") {
      fetchDesignations(value); // Fetch designations based on the selected staff_type
    }
    // Clear only edit form errors
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (data, isEdit = false) => {
    let newErrors = {};
    
    if (!data.staff_type) {
      newErrors.staff_type = 'Staff Type is required.';
    }
    if (!data.fk_designation_id) {
      newErrors.fk_designation_id = 'Designation is required.';
    }
    if (!data.fk_school_id) {
      newErrors.fk_school_id = 'School is required.';
    }
    if (!data.start_date) {
      newErrors.start_date = 'Start date is required.';
    }
    if (data.service_status === 'Completed' && !data.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (data.end_date && new Date(data.end_date) <= new Date(data.start_date)) {
      newErrors.end_date = 'End date must be after the start date.';
    }
    if (!data.service_type) {
      newErrors.service_type = 'Service type is required.';
    }
    if (!data.service_status) {
      newErrors.service_status = 'Service status is required.';
    }
    // Set errors based on whether we're validating create or edit form
    if (isEdit) {
      setEditErrors(newErrors);
    } else {
      setCreateErrors(newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };


  const handleCreateClose = () => {
    setIsModalOpen(false);
  };
  

  const handleCreate = async (e) => {
  
    e.preventDefault();
    
    if (!validateForm(createFormData, false)) {
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await axios.post(`${globalVariables.api_url}/staff/service-details`, {
        ...createFormData,
        usertype: usertype
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchServiceDetails();
        resetCreateForm();
        handleCreateClose();  // Close the modal after successful submission
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
        fetchServiceDetails();
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


  const handleStatusChange = async (id, newStatus,service_status,fk_school_id) => {
    if (newStatus === 'verified' && usertype === 'school_admin') {
      if (!window.confirm('Once approved, you cannot delete or edit the details. Do you want to continue?')) {
        return;
      }
    }

    setIsProcessing(true);
    try {
      const response = await axios.put(`${globalVariables.api_url}/staff/service-details/${id}`, {
        status: newStatus,
        usertype: usertype ,
        service_status : service_status,
        fk_school_id:fk_school_id
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchServiceDetails();
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
    return school ? ` ${school.location} ${school.school_name}` : 'Unknown';
  };

  const handleEdit1 = (service) => {
    // Format dates for the form
    const formattedService = {
      ...service,
      //start_date: convertDateFormat(service.start_date),
      //end_date: convertDateFormat(service.end_date)
    };
    
    setEditFormData(formattedService);
    setEditingId(service.service_id);
    setErrors({});
    setShowModal(true);
  };

  const handleEdit = (service) => {
    // Format dates for the form
    const formattedService = {
      ...service,
      //start_date: convertDateFormat(service.start_date),
      //end_date: convertDateFormat(service.end_date)
    };
    
    setEditFormData(formattedService);
    setEditingId(service.service_id);
    setErrors({});
    setShowModal(true);
    
    // Fetch designations based on the staff type when editing
    if (service.staff_type) {
      fetchDesignations(service.staff_type);
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service detail?')) {
      try {
        const response = await axios.delete(`${globalVariables.api_url}/staff/service-details/${id}`);
        if (response.data.status) {
          print_toast("success", response.data.message);
          fetchServiceDetails();
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error('Error deleting service details:', error);
        print_toast("error", "Failed to delete service details");
      }
    }
  };


  const handleCreateClick = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };




  

  const resetCreateForm = () => {
    setCreateFormData({
      fk_staff_id: staffId,
      staff_type: '',
      fk_school_id:'',
      fk_designation_id: '',
      start_date: '',
      end_date: '',
      service_type: '',
      remarks: '',
      status: 'pending',
      save_flag: false
    });
    setCreateErrors({});
  };

  const resetEditForm = () => {
    setEditFormData({
      fk_staff_id: staffId,
      staff_type: '',
      fk_designation_id: '',
      fk_school_id:'',
      start_date: '',
      end_date: '',
      service_type: '',
      remarks: '',
      status: 'pending',
      save_flag: false
    });
    setEditingId(null);
    setEditErrors({});
  };

  const schoolOptions = schools.map((school) => ({
    value: school.school_id,
    label: `${school.school_code} - ${school.school_name}, ${school.location}`
}));

const designationOptions = designations.map((designation) => ({
  value: designation.designation_id,
  label: designation.designation_name
}));

  return (
    <div className="row">
<div className="col-lg-12">
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center" style={{ borderTop: "4px solid #0ea5e9" }}>
  <h5 className="card-title">Service Details</h5>
  {/* {usertype != 'staff' &&( */}
  <button 
    className="btn btn-danger" 
    onClick={handleCreateClick}  
  >
   <i className="fas fa-plus me-1"></i>
   Create
  </button>
   {/* )}  */}
</div>

          <div className="card-body p-0">
            
            <div className="table-responsive">
            <table className="table table-bordered table-striped" style={{ width: '100%', minWidth: '1000px', tableLayout: 'fixed' }}>
  <thead className="table-light text-muted">
    <tr>
      <th style={{ width: '50px' }} className="text-center">Sl No.</th>
      <th style={{ width: '120px' }} className="text-center">Staff Type</th>
      <th style={{ width: '150px' }} className="text-center">Designation</th>
      <th style={{ width: '180px' }} className="text-center">School</th>
      <th style={{ width: '120px', whiteSpace: 'nowrap' }} className="text-center">Start Date</th>
      <th style={{ width: '120px', whiteSpace: 'nowrap' }} className="text-center">End Date</th>
      <th style={{ width: '150px' }} className="text-center">Service Type</th>
      <th style={{ width: '150px' }} className="text-center">Remarks</th>
      <th style={{ width: '150px' }} className="text-center">Service Status</th>
      <th style={{ width: '180px' }} className="text-center">Verification Status</th>
      {/* { usertype != 'staff' && ( */}
      <th style={{ width: '100px' }} className="text-center">Actions</th>
     {/* )}  */}
    </tr>
  </thead>
                <tbody>
                {serviceDetails.length === 0 ? (
                                            <tr>
                                                <td colSpan={11}>
                                                <NoDataFound />
                                                </td>
                                            </tr>
                                        ) : (
                  serviceDetails.map((service, index) => (
                    <tr 
                    key={service.service_id} 
                    className={service.service_status === 'Active' ? 'table-success' : ''}
                  >
                      <td>{index + 1}</td>
                      <td>{service.staff_type === 'teaching' ? 'Teaching' : service.staff_type === 'non_teaching' ? 'Non-Teaching' : ''}</td>
                      <td>{service.designation_name	}</td>
                      <td>{getschoolName(service.fk_school_id)}</td>
                      <td>{convertDateFormat(service.start_date)}</td>
                      <td>{service.end_date ? convertDateFormat(service.end_date) : ''}</td>
                      <td>{service.service_type}</td>
                      <td>{service.remarks}</td>
                      <td>{capitalizeWords(service.service_status)}</td>

                      <td>{capitalizeWords(service.status)}</td>
                      {/* { usertype != 'staff' && ( */}
                      <td>
                        <div className="dropdown">
                          <button className="btn btn-outline-primary btn-sm rounded-pill dropdown-toggle px-3 shadow-sm" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Action
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1">
                            {service.status === 'pending' && (
                              <>
                                <li>
                                  <a href="#" className="dropdown-item" onClick={() => handleEdit(service)}>Edit</a>
                                </li>
                              </>
                            )}
                            {service.status === 'pending' && usertype=='corporate_admin' && (
                              <li>
                                <a 
                                  href="#" 
                                  className="dropdown-item" 
                                  onClick={() => handleStatusChange(service.service_id, 'verified',service.service_status,service.fk_school_id)}
                                  style={{ pointerEvents: isProcessing ? 'none' : 'auto' }}
                                >
                                  {isProcessing ? 'Approving...' : 'Approve'}
                                </a>
                              </li>
                            )}
                            {service.status === 'verified' && canReject && (
                              <li>
                                <a 
                                  href="#" 
                                  className="dropdown-item" 
                                  onClick={() => handleStatusChange(service.service_id, 'pending',service.service_status,service.fk_school_id)}
                                  style={{ pointerEvents: isProcessing ? 'none' : 'auto' }}
                                >
                                  {isProcessing ? 'Rejecting...' : 'Reject'}
                                </a>
                              </li>
                            )}
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
                          {/* )}  */}
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

{/* Modal */}

<div className={`modal fade ${isModalOpen ? "show" : ""}`} id="createModal" tabIndex="-1" aria-labelledby="createModalLabel" aria-hidden="true" style={{ display: isModalOpen ? "block" : "none" }}>
  <div className="modal-dialog modal-lg">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="createModalLabel">Create Service Details</h5>
        <button type="button" className="btn-close" onClick={handleCreateClose} aria-label="Close"></button>
      </div>
      <div className="modal-body">
        <form onSubmit={handleCreate}>
          <div className="row">
          <div className="col-12">
        <label htmlFor="fk_school_id" className="form-label">
            School<span className="text-danger">*</span>
        </label>
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
        {createErrors.fk_school_id && <div className="text-danger">{createErrors.fk_school_id}</div>}
    </div>
            <div className="col-12">
    <label htmlFor="staff_type" className="form-label">Staff Type<span className="text-danger">*</span></label>
    <select
      className="form-control"
      name="staff_type"
      value={createFormData.staff_type}
      onChange={handleCreateInputChange}
    >
      <option value="">Select Staff Type</option>
      <option value="teaching">Teaching</option>
      <option value="non_teaching">Non-Teaching</option>
    </select>
    
    {createErrors.staff_type && <div className="text-danger">{createErrors.staff_type}</div>}
  </div>

  <div className="col-12">
    <label htmlFor="fk_designation_id" className="form-label">Designation<span className="text-danger">*</span></label>
    
    <Select
    id="fk_designation_id"
    name="fk_designation_id"
    options={designationOptions}
    value={designationOptions.find(option => option.value === createFormData.fk_designation_id)}
    onChange={(selectedOption) =>
      handleCreateInputChange({
        target: { 
          name: "fk_designation_id", 
          value: selectedOption ? selectedOption.value : "",
          tagName: "SELECT",
          selectedIndex: selectedOption ? designationOptions.findIndex(opt => opt.value === selectedOption.value) : -1,
          options: designationOptions.map(opt => ({ text: opt.label }))
        }
      })
    }
    isSearchable
    placeholder="Select Designation"
    classNamePrefix="react-select"
  />
    {/* <select
      className="form-select"
      id="fk_designation_id"
      name="fk_designation_id"
      value={createFormData.fk_designation_id}
      onChange={handleCreateInputChange}
    >
      <option value="">Select Designation</option>
      {designations.map((designation) => (
        <option key={designation.designation_id} value={designation.designation_id}>
          {designation.designation_name}
        </option>
      ))}
    </select> */}
    {createErrors.fk_designation_id && <div className="text-danger">{createErrors.fk_designation_id}</div>}
  </div>
            <div className="col-12">
              <label htmlFor="service_type" className="form-label">Service Type<span className="text-danger">*</span></label>
              <select
                className="form-select"
                id="service_type"
                name="service_type"
                value={createFormData.service_type}
                onChange={handleCreateInputChange}
              >
                <option value="">Select Service Type</option>
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary</option>
              </select>
              {createErrors.service_type && <div className="text-danger">{createErrors.service_type}</div>}
            </div>

            <div className="col-12">
              <label htmlFor="service_status" className="form-label">Do you continue your service to the school with designation 
              <span> {createFormData.designation_name || "?"} </span> <span className="text-danger">*</span></label>
              <div>
                <div className="form-check form-check-inline">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    id="active" 
                    name="service_status" 
                    value="Active" 
                    checked={createFormData.service_status === "Active"}
                    onChange={handleCreateInputChange} 
                  />
                  <label className="form-check-label" htmlFor="active">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    id="completed" 
                    name="service_status" 
                    value="Completed" 
                    checked={createFormData.service_status === "Completed"}
                    onChange={handleCreateInputChange} 
                  />
                  <label className="form-check-label" htmlFor="completed">No</label>
                </div>
              </div>
              {createErrors.service_status && <div className="text-danger">{createErrors.service_status}</div>}
            </div>

            <div className="col-12">
              <label htmlFor="start_date" className="form-label">{createFormData.class_level} Start Date<span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                id="start_date"
                name="start_date"
                value={createFormData.start_date}
                onChange={handleCreateInputChange}
                max={new Date().toISOString().split('T')[0]}
              />
              {createErrors.start_date && <div className="text-danger">{createErrors.start_date}</div>}
            </div>

            {createFormData.service_status === "Completed" && (
              <div className="col-12">
                <label htmlFor="end_date" className="form-label">
                  {createFormData.class_level} End Date<span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="end_date"
                  name="end_date"
                  value={createFormData.end_date}
                  onChange={handleCreateInputChange}
                  min={createFormData.start_date}
                  max={new Date().toISOString().split('T')[0]}
                />
                {createErrors.end_date && <div className="text-danger">{createErrors.end_date}</div>}
              </div>
            )}

            <div className="col-12">
              <label htmlFor="remarks" className="form-label">Remarks (optional)</label>
              <textarea
                className="form-control"
                id="remarks"
                name="remarks"
                value={createFormData.remarks}
                onChange={handleCreateInputChange}
              ></textarea>
            </div>

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn btn-danger m-1" onClick={resetCreateForm} disabled={isSaving}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>











      

      <Modal show={showModal} onHide={() => { setShowModal(false); resetEditForm(); }} backdrop='static'>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={handleUpdate} className="row g-3">

            
          <div className="col-12">
        <label htmlFor="fk_school_id" className="form-label">
            School<span className="text-danger">*</span>
        </label>
        <Select
            id="fk_school_id"
            name="fk_school_id"
            options={schoolOptions}
            value={schoolOptions.find(option => option.value === editFormData.fk_school_id)}
            onChange={(selectedOption) =>
                handleEditInputChange({
                    target: { name: "fk_school_id", value: selectedOption ? selectedOption.value : "" }
                })
            }
            isSearchable
            placeholder="Select School"
            classNamePrefix="react-select"
        />
        {editErrors.fk_school_id && <div className="text-danger">{editErrors.fk_school_id}</div>}
    </div>


            <div className="col-12">
              <label htmlFor="staff_type" className="form-label">Staff Type<span className="text-danger">*</span></label>
              <select
                className="form-select"
                id="staff_type"
                name="staff_type"
                value={editFormData.staff_type}
                onChange={handleEditInputChange}
              >
               <option value="">Select Staff Type</option>
      <option value="teaching">Teaching</option>
      <option value="non_teaching">Non-Teaching</option>
              </select>
              {editErrors.staff_type && <div className="text-danger">{editErrors.staff_type}</div>}
            </div>

            <div className="col-12">
              <label htmlFor="fk_designation_id" className="form-label">Designation<span className="text-danger">*</span></label>
              <Select
    id="fk_designation_id"
    name="fk_designation_id"
    options={designationOptions}
    value={designationOptions.find(option => option.value === editFormData.fk_designation_id)}
    onChange={(selectedOption) =>
      handleEditInputChange({
        target: { 
          name: "fk_designation_id", 
          value: selectedOption ? selectedOption.value : "",
          tagName: "SELECT",
          selectedIndex: selectedOption ? designationOptions.findIndex(opt => opt.value === selectedOption.value) : -1,
          options: designationOptions.map(opt => ({ text: opt.label }))
        }
      })
    }
    isSearchable
    placeholder="Select Designation"
    classNamePrefix="react-select"
  />
            
              {/* <select
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
              </select> */}
              {editErrors.fk_designation_id && <div className="text-danger">{editErrors.fk_designation_id}</div>}
            </div>
 
            <div className="col-12">
              <label htmlFor="service_type" className="form-label">Service Type<span className="text-danger">*</span></label>
              <select
                className="form-select"
                id="service_type"
                name="service_type"
                value={editFormData.service_type}
                onChange={handleEditInputChange}
              >
                <option value="">Select Service Type</option>
                <option value="Permanent">Permanent</option>
                <option value="Temporary">Temporary</option>
             
              </select>
              {editErrors.service_type && <div className="text-danger">{editErrors.service_type}</div>}
            </div>

   <div className="col-12">
              <label htmlFor="service_status" className="form-label">Do you continue your service to the school with designation 
              <span> {editFormData.designation_name || "?"} </span> <span className="text-danger">*</span></label>
              <div>
                <div className="form-check form-check-inline">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    id="active" 
                    name="service_status" 
                    value="Active" 
                    checked={editFormData.service_status === "Active"}
                    onChange={handleEditInputChange} 
                  />
                  <label className="form-check-label" htmlFor="active">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    id="completed" 
                    name="service_status" 
                    value="Completed" 
                    checked={editFormData.service_status === "Completed"}
                    onChange={handleEditInputChange} 
                  />
                  <label className="form-check-label" htmlFor="completed">No</label>
                </div>
              </div>
              {editErrors.service_status && <div className="text-danger">{editErrors.service_status}</div>}
            </div>



{/* Start Date - Always visible */}
{editFormData.service_status && (
  <div className="col-12">
    <label htmlFor="start_date" className="form-label">Start Date<span className="text-danger">*</span></label>
    <input
      type="date"
      className="form-control"
      id="start_date"
      name="start_date"
      value={editFormData.start_date}
      onChange={handleEditInputChange}
      max={new Date().toISOString().split('T')[0]}
    />
    {editErrors.start_date && <div className="text-danger">{editErrors.start_date}</div>}
  </div>
)}

{/* End Date - Only visible if service_status is 'Completed' */}
{editFormData.service_status === "Completed" && (
  <div className="col-12">
    <label htmlFor="end_date" className="form-label">End Date<span className="text-danger">*</span></label>
    <input
      type="date"
      className="form-control"
      id="end_date"
      name="end_date"
      value={editFormData.end_date}
      onChange={handleEditInputChange}
      min={editFormData.start_date}
      max={new Date().toISOString().split('T')[0]}
    />
    {editErrors.end_date && <div className="text-danger">{editErrors.end_date}</div>}
  </div>
)}

       

            <div className="col-12">
              <label htmlFor="remarks" className="form-label">Remarks (optional)</label>
              <textarea
                className="form-control"
                id="remarks"
                name="remarks"
                value={editFormData.remarks}
                onChange={handleEditInputChange}
              ></textarea>
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

export default StaffServiceDetails;





