import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import NoDataFound from './NoDataFound.js';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import useAuth from '../utilities/useAuth.js';
import { convertDateFormat } from "../utilities/dateconverter.js";
import { capitalizeWords } from '../utilities/dateconverter.js';
import Select from 'react-select';

const RetiredStaffServiceDetails = ({ staffId }) => {
  const auth = useAuth();
  const username = auth.user.username;
  const usertype = auth.user.user_type;
  const [serviceDetails, setServiceDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [editFormData, setEditFormData] = useState({
    fk_staff_id: staffId,
    staff_type: '',
    fk_designation_id: '',
    fk_school_id: '',
    service_type: '',
    start_date: '',
    end_date: '',
    service_status: 'Completed',
    save_flag: false
  });

  const [editingId, setEditingId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
    fetchServiceDetails();
    fetchSchools();
    fetchDesignations();
  }, [staffId]);

  const fetchServiceDetails = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/service-details/${staffId}`);
      if (response.data.status) {
        setServiceDetails(response.data.data);
      } else {
        setServiceDetails([]);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching service details:', error);
        print_toast("error", "Failed to fetch service details");
      }
      setServiceDetails([]);
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

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/designations/view`);
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
      const newData = { 
        ...prevData, 
        [name]: value,
        designation_name: name === "fk_designation_id" ? selectedText : prevData.designation_name,
      };
      
      if (name === 'start_date') {
        if (newData.end_date && new Date(newData.end_date) <= new Date(value)) {
          newData.end_date = '';
        }
      }
      
      // Auto-set staff_type based on designation selection
      if (name === 'fk_designation_id' && value) {
        const designation = designations.find(d => d.designation_id === parseInt(value));
        if (designation) {
          newData.staff_type = designation.staff_type;
        }
      }
      
      return newData;
    });

    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (data) => {
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
    if (!data.service_type) {
      newErrors.service_type = 'Service type is required.';
    }
    if (!data.start_date) {
      newErrors.start_date = 'Start date is required.';
    }
    if (!data.end_date) {
      newErrors.end_date = 'End date is required.';
    }
    if (data.end_date && new Date(data.end_date) <= new Date(data.start_date)) {
      newErrors.end_date = 'End date must be after the start date.';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm(editFormData)) {
      return;
    }

    setIsUpdating(true);
    
    try {
      // Prepare data - remove fields not in allowedFields
      const updateData = {
        staff_type: editFormData.staff_type,
        fk_designation_id: editFormData.fk_designation_id,
        fk_school_id: editFormData.fk_school_id,
        service_type: editFormData.service_type,
        start_date: editFormData.start_date,
        end_date: editFormData.end_date,
        service_status: editFormData.service_status,
        fk_staff_id: staffId // Use the original staffId prop
      };

      console.log('Sending update data:', updateData); // Debug log

      const response = await axios.put(
        `${globalVariables.api_url}/retiredstaff/update-service-details/${editingId}`, 
        updateData
      );

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchServiceDetails();
        setShowModal(false);
        resetEditForm();
      } else {
        setEditErrors(response.data.errors || {});
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error updating service details:', error);
      console.error('Error response:', error.response?.data); // Debug log
      setEditErrors(error.response?.data?.errors || {});
      print_toast("error", error.response?.data?.message || "Failed to update service details");
    } finally {
      setIsUpdating(false);
    }
  };

  const getschoolName = (schoolId) => {
    const school = schools.find(d => d.school_id === schoolId);
    return school ? `${school.location} ${school.school_name}` : 'Unknown';
  };

  const handleEdit = (service) => {
    // Ensure all fields are populated
    setEditFormData({
      ...service,
      fk_staff_id: staffId,
      service_status: service.service_status || 'Completed',
      staff_type: service.staff_type || '',
      service_type: service.service_type || ''
    });
    setEditingId(service.service_id);
    setEditErrors({});
    setShowModal(true);
  };

  const resetEditForm = () => {
    setEditFormData({
      fk_staff_id: staffId,
      staff_type: '',
      fk_designation_id: '',
      fk_school_id: '',
      service_type: '',
      start_date: '',
      end_date: '',
      service_status: 'Completed',
      save_flag: false
    });
    setEditingId(null);
    setEditErrors({});
  };

  const schoolOptions = schools.map((school) => ({
    value: school.school_id,
    label: `${school.school_code} - ${school.school_name}, ${school.location}`
  }));

  // Separate designations by staff_type
  const teachingDesignations = designations.filter(d => d.staff_type === "teaching");
  const nonTeachingDesignations = designations.filter(d => d.staff_type === "non_teaching");

  const designationOptions = [
    ...(nonTeachingDesignations.length > 0 ? [{
      label: 'Non-Teaching',
      options: nonTeachingDesignations
        .sort((a, b) => a.designation_position - b.designation_position)
        .map(d => ({
          value: d.designation_id,
          label: d.designation_name
        }))
    }] : []),
    ...(teachingDesignations.length > 0 ? [{
      label: 'Teaching',
      options: teachingDesignations
        .sort((a, b) => a.designation_position - b.designation_position)
        .map(d => ({
          value: d.designation_id,
          label: d.designation_name
        }))
    }] : [])
  ];

  return (
    <div className="row">
      <div className="col-lg-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title">Service Details</h5>
          </div>

          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-striped" style={{ width: '100%', minWidth: '1200px', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }} className="text-center">Sl No.</th>
                    <th style={{ width: '180px' }} className="text-center">School</th>
                    <th style={{ width: '150px' }} className="text-center">Designation</th>
                    <th style={{ width: '120px', whiteSpace: 'nowrap' }} className="text-center">Start Date</th>
                    <th style={{ width: '120px', whiteSpace: 'nowrap' }} className="text-center">End Date</th>
                    <th style={{ width: '100px' }} className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceDetails.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <NoDataFound />
                      </td>
                    </tr>
                  ) : (
                    serviceDetails.map((service, index) => (
                      <tr key={service.service_id}>
                        <td className="text-center">{index + 1}</td>
                        <td>{getschoolName(service.fk_school_id)}</td>
                        <td>{service.designation_name}</td>
                        <td className="text-center">{convertDateFormat(service.start_date)}</td>
                        <td className="text-center">{service.end_date ? convertDateFormat(service.end_date) : ''}</td>
                        <td>
                          <div className="dropdown">
                            <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                              Action
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <a href="#" className="dropdown-item" onClick={() => handleEdit(service)}>Edit</a>
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

      {/* Edit Modal */}
      <Modal show={showModal} onHide={() => { setShowModal(false); resetEditForm(); }} backdrop='static'>
        <Modal.Header closeButton>
          <Modal.Title>Edit Service Detail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={handleUpdate} className="row g-3">

            {/* School */}
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

            {/* Designation */}
            <div className="col-12">
              <label htmlFor="fk_designation_id" className="form-label">
                Designation<span className="text-danger">*</span>
              </label>
              <Select
                id="fk_designation_id"
                name="fk_designation_id"
                options={designationOptions}
                value={
                  designationOptions
                    .flatMap(group => group.options || [])
                    .find(option => option.value === editFormData.fk_designation_id)
                }
                onChange={(selectedOption) => {
                  const designation = designations.find(d => d.designation_id === selectedOption?.value);
                  handleEditInputChange({
                    target: { 
                      name: "fk_designation_id", 
                      value: selectedOption ? selectedOption.value : "",
                      tagName: "SELECT",
                      selectedIndex: selectedOption ? 0 : -1,
                      options: [{ text: selectedOption ? selectedOption.label : '' }]
                    }
                  });
                }}
                isSearchable
                placeholder="Select Designation"
                classNamePrefix="react-select"
              />
              {editErrors.fk_designation_id && <div className="text-danger">{editErrors.fk_designation_id}</div>}
            </div>

            {/* Service Type */}
            <div className="col-12">
              <label htmlFor="service_type" className="form-label">
                Service Type<span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                id="service_type"
                name="service_type"
                value={editFormData.service_type}
                onChange={handleEditInputChange}
              >
                <option value="">Select Service Type</option>
                <option value="Regular">Regular</option>
                <option value="Contract">Contract</option>
                <option value="Deputation">Deputation</option>
              </select>
              {editErrors.service_type && <div className="text-danger">{editErrors.service_type}</div>}
            </div>

            {/* Start Date */}
            <div className="col-12">
              <label htmlFor="start_date" className="form-label">
                Start Date<span className="text-danger">*</span>
              </label>
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

            {/* End Date */}
            <div className="col-12">
              <label htmlFor="end_date" className="form-label">
                End Date (Retirement Date)<span className="text-danger">*</span>
              </label>
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

export default RetiredStaffServiceDetails;