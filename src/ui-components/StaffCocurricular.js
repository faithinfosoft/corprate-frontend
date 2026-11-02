import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import useAuth from "../utilities/useAuth";
import { convertDateFormat } from "../utilities/dateconverter";
const StaffCocurricular = (staff) => {
  const staffId = staff.staffId;
  const auth = useAuth();
  const userType = auth.user.user_type;
  const [cocurriculars, setCocurriculars] = useState([]);
  const [activities, setActivities] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [formError, setFormError] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    fk_activity_id: '',
    fk_staff_id: '',
    start_date: '',
    end_date: '',
    qualification: ''
  });

  const clearForm = () => {
    setFormData({
      fk_activity_id: '',
      fk_staff_id: '',
      start_date: '',
      end_date: '',
      qualification: '',
    });
    setIsEditing(false);
    setEditId(null);
  };

  const resetCreateForm = () => {
    clearForm();
    setFormError({});
  };

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await axios.get(`${globalVariables.api_url}/cocurricular/view`);
        console.log('API Response (Activities):', response.data);
        if (response.data && response.data.data) {
          setActivities(response.data.data);
        } else {
          console.error('Activities data is missing');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };

    const fetchStaffMembers = async () => {
      try {
        const response = await axios.get(`${globalVariables.api_url}/staffcocurricular/view`);
        console.log('API Response (Staff Members):', response.data);
        if (response.data && response.data.data) {
          const firstStaff = response.data.data[0];
          const staff_id = firstStaff.fk_staff_id || '';

          setFormData(prevState => ({
            ...prevState,
            fk_staff_id: staff_id,
          }));
        } else {
          setErrorMessage('No staff available.');
          setStaffMembers([]);
        }
      } catch (error) {
        console.error('Error fetching staff members:', error);
      }
    };

    fetchActivities();
    fetchStaffMembers();
  }, []);

  const fetchStaffCocurricular = async () => {
    console.log(staffId);
    try {
      const response = await axios.get(`${globalVariables.api_url}/staffcocurricular/view/${staffId}`);
      console.log('API Response (Staff Cocurricular):', response.data);
      if (response.data && response.data.data) {
        setCocurriculars(response.data.data);
      } else {
        setErrorMessage('No staff cocurricular activities available.');
        setCocurriculars([]);
      }
    } catch (error) {
      console.error('Error fetching staff cocurricular:', error);
      setErrorMessage('Error fetching staff cocurricular activities.');
    }
  };

  useEffect(() => {
    fetchStaffCocurricular();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setFormError(prevErrors => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleDelete = async (cocurricular) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this co-curricular activity?");

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.post(`${globalVariables.api_url}/staffcocurricular/deleteActivity`, {
        staff_cocurricular_activity_id: cocurricular.staff_cocurricular_activity_id,
      });

      if (response.data.status) {
        print_toast("success", response.data.message);

        setCocurriculars((prev) =>
          prev.filter(
            (item) => item.staff_cocurricular_activity_id !== cocurricular.staff_cocurricular_activity_id
          )
        );
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting activity:", error.message);
      print_toast("error", "Error deleting activity");
    }
  };

  const handleEdit = (cocurricular) => {
    // Format dates for the input fields
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setFormData({
      fk_activity_id: cocurricular.fk_activity_id,
      fk_staff_id: staffId,
      start_date: formatDateForInput(cocurricular.start_date),
      end_date: formatDateForInput(cocurricular.end_date),
      qualification: cocurricular.qualification || '',
    });

    setIsEditing(true);
    setEditId(cocurricular.staff_cocurricular_activity_id);
    setShowEditModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    console.log("Staff ID (from prop):", staffId);

    // Validate form
    let errors = {};
    if (!formData.fk_activity_id) errors.fk_activity_id = "Activity is required";
    if (!formData.start_date) errors.start_date = "Start Date is required";
    if (!formData.end_date) errors.end_date = "End Date is required";

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      errors.end_date = "End Date cannot be earlier than Start Date";
    }

    // If editing, don't check for duplicate activity
    if (!isEditing) {
      const isActivityAssigned = cocurriculars.some(
        (cocurricular) => cocurricular.fk_activity_id === formData.fk_activity_id
      );

      if (isActivityAssigned) {
        errors.fk_activity_id = 'This activity has already been assigned to the staff member.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        fk_activity_id: formData.fk_activity_id,
        fk_staff_id: staffId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        qualification: formData.qualification,
      };

      console.log("Payload being sent to backend:", payload);

      let response;

      if (isEditing) {
        // Update existing record
        response = await axios.post(
          `${globalVariables.api_url}/staffcocurricular/update/${editId}`,
          payload
        );
      } else {
        // Create new record
        response = await axios.post(
          `${globalVariables.api_url}/staffcocurricular/save`,
          payload
        );
      }

      if (response.data.status) {
        print_toast("success", response.data.message);
        clearForm();
        fetchStaffCocurricular();
        setShowEditModal(false);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error submitting the form:', error);
      print_toast("error", 'Error submitting the form');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title">Cocurricular Activities</h5>
              {/* { userType != 'staff' && ( */}
              <button className="btn btn-danger" onClick={() => {
                resetCreateForm();
                setIsEditing(false);
                setShowEditModal(true);
              }}>
                <i className="fas fa-plus me-1"></i>
                Create
              </button>
              {/* )} */}
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th scope="col">SL No.</th>
                      <th scope="col">Activity Name</th>
                      <th scope="col">Qualification</th>
                      <th scope="col">Start Date</th>
                      <th scope="col">End Date</th>
                      {/* { userType != 'staff' && ( */}
                      <th scope="col">Actions</th>
                      {/* )} */}
                    </tr>
                  </thead>
                  <tbody>
                    {cocurriculars.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">No cocurricular activities available</td>
                      </tr>
                    ) : (
                      cocurriculars.map((cocurricular, index) => {


                        return (
                          <tr key={cocurricular.staff_cocurricular_activity_id}>
                            <td>{index + 1}</td>
                            <td>{cocurricular.activity_name}</td>
                            <td>{cocurricular.qualification}</td>
                            <td>{convertDateFormat(cocurricular.start_date)}</td>
                            <td>{convertDateFormat(cocurricular.end_date)}</td>
                            {/* { userType != 'staff' && ( */}
                            <td className="fw-bold text-center">
                              <div className="dropdown">
                                <button
                                  className="btn btn-dark dropdown-toggle"
                                  type="button"
                                  id="dropdownMenuButton1"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  Action
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                  <li>
                                    <a
                                      href="#"
                                      className="dropdown-item"
                                      onClick={() => handleEdit(cocurricular)}
                                    >
                                      Edit
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="dropdown-item"
                                      onClick={() => handleDelete(cocurricular)}
                                    >
                                      Delete
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </td>
                            {/* )} */}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      <Modal show={showEditModal} onHide={() => { setShowEditModal(false); resetCreateForm(); }} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit' : 'Add'} Co-curricular Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            {/* Activity Selection */}
            <div className="mb-3">
              <label className="form-label">Select Co-curricular Activity:</label>
              <select
                name="fk_activity_id"
                className="form-control"
                value={formData.fk_activity_id}
                onChange={handleChange}
                required
              >
                <option value="">Select an Activity</option>
                {activities.map((activity) => (
                  <option key={activity.activity_id} value={activity.activity_id}>
                    {activity.activity_name}
                  </option>
                ))}
              </select>
              {formError.fk_activity_id && <div className="text-danger">{formError.fk_activity_id}</div>}
            </div>

            <div className="mb-3">
              <label className="form-label">Qualification:</label>
              <input
                type="text"
                name="qualification"
                className="form-control"
                value={formData.qualification}
                onChange={handleChange}
                required
              />
              {formError.qualification && <div className="text-danger">{formError.qualification}</div>}
            </div>

            {/* Start Date */}
            <div className="mb-3">
              <label className="form-label">Start Date:</label>
              <input
                type="date"
                name="start_date"
                className="form-control"
                value={formData.start_date}
                onChange={handleChange}
                required
              />
              {formError.start_date && <div className="text-danger">{formError.start_date}</div>}
            </div>

            {/* End Date */}
            <div className="mb-3">
              <label className="form-label">End Date:</label>
              <input
                type="date"
                name="end_date"
                className="form-control"
                value={formData.end_date}
                onChange={handleChange}
                required
              />
              {formError.end_date && <div className="text-danger">{formError.end_date}</div>}
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-success m-1"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-danger m-1"
                onClick={() => {
                  setShowEditModal(false);
                  resetCreateForm();
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StaffCocurricular;