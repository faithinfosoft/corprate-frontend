import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import { useNavigate } from "react-router-dom";
import Breadcum from "./Breadcum";
import print_toast from "../utilities/Toaster.js";
import useAuth from "../utilities/useAuth";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { convertDateFormat } from '../utilities/dateconverter';

const SchoolManager = () => {
  const auth = useAuth();
  const school_id = auth.user.user_id;
  const navigate = useNavigate();
  
  // Initial form state
  const initialFormState = {
    official_name: "",
    mobile_no: "",
    whatsapp_no: "",
    email: "",
    password: "",
    confirm_password: "",
    start_date: "",
    end_date: "",
    fk_school_id: school_id,
  };
  
  // Form state
  const [responses, setResponses] = useState(initialFormState);
  const [editResponses, setEditResponses] = useState(initialFormState);
  
  // Error states - single error state object for each form
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Other states
  const [activeTab, setActiveTab] = useState("active");
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [workingManagers, setWorkingManagers] = useState([]);
  const [formerManagers, setFormerManagers] = useState([]);
  
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  
  const [breadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "School Manager", Link: "" },
  ]);

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
  };

  // Validation functions
  const validateForm = (formData, setFormErrors) => {
    let formErrors = {};
    let isValid = true;

    // Required field validation
    if (!formData.official_name || formData.official_name.trim() === "") {
      formErrors.official_name = "Name is required";
      isValid = false;
    }

    if (!formData.mobile_no || formData.mobile_no.trim() === "") {
      formErrors.mobile_no = "Mobile number is required";
      isValid = false;
    } else if (formData.mobile_no.length !== 10) {
      formErrors.mobile_no = "Mobile number must be 10 digits";
      isValid = false;
    }

    if (!formData.whatsapp_no || formData.whatsapp_no.trim() === "") {
      formErrors.whatsapp_no = "WhatsApp number is required";
      isValid = false;
    } else if (formData.whatsapp_no.length !== 10) {
      formErrors.whatsapp_no = "WhatsApp number must be 10 digits";
      isValid = false;
    }

    if (!formData.email || formData.email.trim() === "") {
      formErrors.email = "Email is required";
      isValid = false;
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        formErrors.email = "Please enter a valid email address";
        isValid = false;
      }
    }

    if (!formData.start_date || formData.start_date.trim() === "") {
      formErrors.start_date = "Start date is required";
      isValid = false;
    }

    setFormErrors(formErrors);
    return isValid;
  };

  const validatePassword = (formData, setFormErrors) => {
    let passwordErrors = {};
    let isValid = true;

    if (!formData.password || formData.password.trim() === "") {
      passwordErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      passwordErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (!formData.confirm_password || formData.confirm_password.trim() === "") {
      passwordErrors.confirm_password = "Confirm password is required";
      isValid = false;
    } else if (formData.confirm_password !== formData.password) {
      passwordErrors.confirm_password = "Passwords do not match";
      isValid = false;
    }

    setFormErrors(prevErrors => ({ ...prevErrors, ...passwordErrors }));
    return isValid;
  };

  const validateChangePassword = (data) => {
    const errors = {};
    let isValid = true;

    if (!data.newPassword || data.newPassword.trim() === "") {
      errors.newPassword = "New password is required";
      isValid = false;
    } 
    if (!data.confirmPassword || data.confirmPassword.trim() === "") {
      errors.confirmPassword = "Confirm password is required";
      isValid = false;
    } else if (data.confirmPassword !== data.newPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    return { isValid, errors };
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    setResponses(initialFormState);
    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleEdit = (manager) => {
    setSelectedManager(manager);
    setEditResponses({
      official_name: manager.official_name,
      mobile_no: manager.mobile_no,
      whatsapp_no: manager.whatsapp_no,
      email: manager.email,
      start_date: manager.start_date,
      end_date: manager.end_date && manager.end_date !== "0000-00-00" ? manager.end_date : "",
      fk_school_id: school_id,
    });
    setEditErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenPasswordModal = (item) => {
    setSelectedManager(item);
    setPasswordData({ newPassword: "", confirmPassword: "" });
    setIsPasswordModalOpen(true);
  };

  // Input handlers
  const handleInputChange = (field, value) => {
    setResponses({
      ...responses,
      [field]: value,
    });

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditResponses({
      ...editResponses,
      [field]: value,
    });

    if (editErrors[field]) {
      setEditErrors({
        ...editErrors,
        [field]: "",
      });
    }
  };

  // Email validation
  const handleEmailChange = (emailValue) => {
    handleInputChange("email", emailValue);
    setErrors((prev) => ({ ...prev, email: "" }));

    if (emailValue && validateEmail(emailValue)) {
      // Debounce the API call
      const timeoutId = setTimeout(() => {
        checkEmailUnique(emailValue);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailUnique = async (emailValue) => {
    setIsChecking(true);

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolmanager/check-email`,
        { email: emailValue }
      );

      if (!response.data.isUnique) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already taken",
        }));
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Data fetching
  const fetchManagersByStatus = async (status) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolmanager/view_managers/${status}/${school_id}`
      );
      if (response.data.status) {
        if (status === "active") {
          setWorkingManagers(response.data.managers);
        } else {
          setFormerManagers(response.data.managers);
        }
      }
    } catch (error) {
      console.error("Error fetching managers by status:", error);
      print_toast("error", "Failed to load managers");
    } finally {
      setLoading(false);
    }
  };

  // Side effects
  useEffect(() => {
    fetchManagersByStatus(activeTab);
  }, [activeTab]);

  // Form submission handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    setIsSaving(true);

    const payload = {
      official_name: responses.official_name,
      mobile_no: responses.mobile_no,
      whatsapp_no: responses.whatsapp_no,
      email: responses.email,
      password: responses.password,
      confirm_password: responses.confirm_password,
      start_date: responses.start_date,
      end_date: responses.end_date,
      fk_school_id: school_id,
    };

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolmanager/save_managers`,
        payload
      );

      if (response.data.status) {
        print_toast("success", "School manager added successfully!");
        setResponses(initialFormState);
        setIsAddModalOpen(false);
        fetchManagersByStatus(activeTab);
      } else if (response.data.status === false && response.data.error) {
        // Set form errors from backend validation
        setErrors(response.data.error);
        print_toast('error', response.data.message || 'Please fix the validation errors');
      }
    } catch (error) {
      console.error("Error saving data:", error);
      if (error.response && error.response.data) {
        if (error.response.data.error) {
          setErrors(error.response.data.error);
        }
        print_toast("error", error.response.data.message || "An error occurred while saving data");
      } else {
        print_toast("error", "An error occurred while saving data");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    
    setIsSaving(true);

    const payload = {
      official_name: editResponses.official_name,
      mobile_no: editResponses.mobile_no,
      whatsapp_no: editResponses.whatsapp_no,
      email: editResponses.email,
      start_date: editResponses.start_date,
      end_date: editResponses.end_date,
      fk_school_id: school_id,
    };

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolmanager/update/${selectedManager.manager_id}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status) {
        print_toast("success", "Manager updated successfully!");
        setIsEditModalOpen(false);
        
        // Refresh the data for the current tab
        await fetchManagersByStatus(editResponses.end_date ? "inactive" : "active");
        
        // If end date was added/removed, switch tab and refresh data
        if ((selectedManager.end_date === null || selectedManager.end_date === "0000-00-00") && 
            editResponses.end_date) {
          setActiveTab("inactive");
        } else if ((selectedManager.end_date && selectedManager.end_date !== "0000-00-00") && 
                   !editResponses.end_date) {
          setActiveTab("active");
        }
      } 
      else if (response.data.status === false && response.data.error) {
        // Set form errors from backend validation
        setEditErrors(response.data.error);
        print_toast('error', response.data.message || 'Please fix the validation errors');
      }
      
    } catch (error) {
      console.error("Error updating data:", error);
      if (error.response && error.response.data && error.response.data.error) {
        setEditErrors(error.response.data.error);
      }
      print_toast("error", "An error occurred while updating data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (manager_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this manager?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.delete(
        `${globalVariables.api_url}/schoolmanager/delete/${manager_id}`
      );

      if (response.data.status) {
        print_toast("success", "Manager deleted successfully!");
        fetchManagersByStatus(activeTab);
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to delete manager"
        );
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      print_toast("error", "An error occurred while deleting data");
    }
  };

  const handleChangePassword = async () => {
    const { isValid, errors } = validateChangePassword(passwordData);
    
    if (!isValid) {
      setIsSubmitted(true);
      return;
    }

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolmanager/update-password`,
        {
          email: selectedManager.email,
          new_password: passwordData.newPassword,
        }
      );

      if (response.data.status) {
        print_toast("success", "Password updated successfully!");
        setIsPasswordModalOpen(false);
        setIsSubmitted(false);
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to update password"
        );
      }
    } catch (error) {
      console.error("Error updating password:", error);
      print_toast("error", "An error occurred while updating the password");
    }
  };

  return (
    <div className="container">
      {/* Breadcrumbs Section */}
      <Breadcum items={breadcum} title="School Manager" />

      {/* Page Header */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <ul className="nav nav-tabs">
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === "active" ? "active" : ""}`}
                    onClick={() => setActiveTab("active")}
                    href="#!"
                  >
                    Working Managers
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === "inactive" ? "active" : ""}`}
                    onClick={() => setActiveTab("inactive")}
                    href="#!"
                  >
                    Former Managers
                  </a>
                </li>
              </ul>
              <button className="btn btn-danger" onClick={handleOpenAddModal}>
                Create
              </button>
            </div>
            <div className="card-body">
              <div className="tab-content mt-3">
                {/* Working Managers Tab */}
                <div className={`tab-pane fade ${activeTab === "active" ? "show active" : ""}`}>
                  <div className="table-responsive mt-3">
                    {loading ? (
                      <p className="text-center">Loading...</p>
                    ) : workingManagers.length === 0 ? (
                      <p className="text-center">No working managers found.</p>
                    ) : (
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th className="text-center">Sl No</th>
                            <th className="text-center">Name</th>
                            <th className="text-center">Mobile Number</th>
                            <th className="text-center">WhatsApp Number</th>
                            <th className="text-center">Email</th>
                            <th className="text-center">Start Date</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {workingManagers.map((item, index) => (
                            <tr key={item.manager_id}>
                              <td className="text-center">{index + 1}</td>
                              <td>{item.official_name}</td>
                              <td>{item.mobile_no}</td>
                              <td>{item.whatsapp_no}</td>
                              <td>{item.email}</td>
                              <td>{convertDateFormat(item.start_date)}</td>
                              <td className="text-center">
                                <div className="dropdown">
                                  <button className="btn btn-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                                    Actions
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li>
                                      <a href="#!" className="dropdown-item" onClick={() => handleEdit(item)}>
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a href="#!" className="dropdown-item" onClick={() => handleOpenPasswordModal(item)}>
                                        Change Password
                                      </a>
                                    </li>
                                    <li>
                                      <a href="#!" className="dropdown-item" onClick={() => handleDelete(item.manager_id)}>
                                        Delete
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Former Managers Tab */}
                <div className={`tab-pane fade ${activeTab === "inactive" ? "show active" : ""}`}>
                  <div className="table-responsive mt-3">
                    {loading ? (
                      <p className="text-center">Loading...</p>
                    ) : formerManagers.length === 0 ? (
                      <p className="text-center">No former managers found.</p>
                    ) : (
                      <table className="table table-bordered table-striped">
                        <thead>
                          <tr>
                            <th className="text-center">Sl No</th>
                            <th className="text-center">Name</th>
                            <th className="text-center">Mobile Number</th>
                            <th className="text-center">WhatsApp Number</th>
                            <th className="text-center">Email</th>
                            <th className="text-center">Start Date</th>
                            <th className="text-center">End Date</th>
                            <th className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formerManagers.map((item, index) => (
                            <tr key={item.manager_id}>
                              <td className="text-center">{index + 1}</td>
                              <td>{item.official_name}</td>
                              <td>{item.mobile_no}</td>
                              <td>{item.whatsapp_no}</td>
                              <td>{item.email}</td>
                              <td>{convertDateFormat(item.start_date)}</td>
                              <td>{convertDateFormat(item.end_date)}</td>
                              <td className="text-center">
                                <div className="dropdown">
                                  <button className="btn btn-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                                    Actions
                                  </button>
                                  <ul className="dropdown-menu">
                                    <li>
                                      <a href="#!" className="dropdown-item" onClick={() => handleEdit(item)}>
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a href="#!" className="dropdown-item" onClick={() => handleDelete(item.manager_id)}>
                                        Delete
                                      </a>
                                    </li>
                                    {/* <li>
                                      <a href="#!" className="dropdown-item" onClick={() => handleOpenPasswordModal(item)}>
                                        Change Password
                                      </a>
                                    </li> */}
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal show={isAddModalOpen} onHide={handleCloseAddModal} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Add School Manager</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} id="form-add-school">
            <div className="form-group mb-3">
              <label htmlFor="official_name" className="form-label">
                Official Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.official_name ? 'is-invalid' : ''}`}
                id="official_name"
                value={responses.official_name}
                onChange={(e) => handleInputChange("official_name", e.target.value)}
              />
              {errors.official_name && (
                <div className="invalid-feedback">{errors.official_name}</div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="mobile_no" className="form-label">
                Mobile Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                className={`form-control ${errors.mobile_no ? 'is-invalid' : ''}`}
                id="mobile_no"
                value={responses.mobile_no}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    handleInputChange("mobile_no", value);
                  }
                }}
              />
              {errors.mobile_no && (
                <div className="invalid-feedback">{errors.mobile_no}</div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="whatsapp_no" className="form-label">
                WhatsApp Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                className={`form-control ${errors.whatsapp_no ? 'is-invalid' : ''}`}
                id="whatsapp_no"
                value={responses.whatsapp_no}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 10) {
                    handleInputChange("whatsapp_no", value);
                  }
                }}
              />
              {errors.whatsapp_no && (
                <div className="invalid-feedback">{errors.whatsapp_no}</div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="email" className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                value={responses.email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="start_date" className="form-label">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className={`form-control ${errors.start_date ? 'is-invalid' : ''}`}
                id="start_date"
                max={new Date().toISOString().split("T")[0]}
                value={responses.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
              />
              {errors.start_date && (
                <div className="invalid-feedback">{errors.start_date}</div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="end_date" className="form-label">
                End Date
              </label>
              <input
                type="date"
                className="form-control"
                id="end_date"
                min={responses.start_date}
                max={new Date().toISOString().split("T")[0]}
                value={responses.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
              />
            </div>

            <div className="form-group mb-3">
              <label htmlFor="password" className="form-label">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                value={responses.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="confirm_password" className="form-label">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                id="confirm_password"
                value={responses.confirm_password}
                onChange={(e) => handleInputChange("confirm_password", e.target.value)}
              />
              {errors.confirm_password && (
                <div className="invalid-feedback">{errors.confirm_password}</div>
              )}
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={handleSubmit} 
            disabled={isSaving || isChecking}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>


     {/* Edit Modal */}
<Modal show={isEditModalOpen} onHide={() => setIsEditModalOpen(false)} backdrop="static" keyboard={false}>
  <Modal.Header closeButton>
    <Modal.Title>Edit School Manager</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={handleEditSubmit}>
      <div className="form-group mb-3">
        <label htmlFor="edit_official_name" className="form-label">
          Official Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className={`form-control ${editErrors.official_name ? 'is-invalid' : ''}`}
          id="edit_official_name"
          value={editResponses.official_name}
          onChange={(e) => handleEditInputChange("official_name", e.target.value)}
        />
        {editErrors.official_name && (
          <div className="invalid-feedback">{editErrors.official_name}</div>
        )}
      </div>

      <div className="form-group mb-3">
        <label htmlFor="edit_mobile_no" className="form-label">
          Mobile Number <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          className={`form-control ${editErrors.mobile_no ? 'is-invalid' : ''}`}
          id="edit_mobile_no"
          value={editResponses.mobile_no}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) {
              handleEditInputChange("mobile_no", value);
            }
          }}
        />
        {editErrors.mobile_no && (
          <div className="invalid-feedback">{editErrors.mobile_no}</div>
        )}
      </div>

      <div className="form-group mb-3">
        <label htmlFor="edit_whatsapp_no" className="form-label">
          WhatsApp Number <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          className={`form-control ${editErrors.whatsapp_no ? 'is-invalid' : ''}`}
          id="edit_whatsapp_no"
          value={editResponses.whatsapp_no}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 10) {
              handleEditInputChange("whatsapp_no", value);
            }
          }}
        />
        {editErrors.whatsapp_no && (
          <div className="invalid-feedback">{editErrors.whatsapp_no}</div>
        )}
      </div>

      <div className="form-group mb-3">
        <label htmlFor="edit_start_date" className="form-label">
          Start Date <span className="text-danger">*</span>
        </label>
        <input
          type="date"
          className={`form-control ${editErrors.start_date ? 'is-invalid' : ''}`}
          id="edit_start_date"
          value={editResponses.start_date || ""}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => handleEditInputChange("start_date", e.target.value)}
        />
        {editErrors.start_date && (
          <div className="invalid-feedback">{editErrors.start_date}</div>
        )}
      </div>

      <div className="form-group mb-3">
        <label htmlFor="edit_end_date" className="form-label">End Date</label>
        <input
          type="date"
          className="form-control"
          id="edit_end_date"
          value={
            editResponses.end_date && editResponses.end_date !== "0000-00-00"
              ? editResponses.end_date
              : ""
          }
          min={editResponses.start_date || ""}
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => handleEditInputChange("end_date", e.target.value || "")}
        />
      </div>

      <div className="form-group mb-3">
        <label htmlFor="edit_email" className="form-label">
          Email <span className="text-danger">*</span>
        </label>
        <input
          type="email"
          className={`form-control ${editErrors.email ? 'is-invalid' : ''}`}
          id="edit_email"
          value={editResponses.email}
          onChange={(e) => handleEditInputChange("email", e.target.value)}
        />
        {editErrors.email && (
          <div className="invalid-feedback">{editErrors.email}</div>
        )}
      </div>

      <div className="col-12 text-end pt-2">
        <button
          type="submit"
          className="btn btn-success m-1"
          disabled={isSaving}
        >
          {isSaving ? "Updating..." : "Update"}
        </button>
        <button
          type="button"
          
          className="btn btn-danger m-1"
        >
          Cancel
        </button>
      </div>
    </form>
  </Modal.Body>
</Modal>

{/* Password Modal */}
<Modal show={isPasswordModalOpen} onHide={() => {
  setIsSubmitted(false);
  handleClosePasswordModal();
}} backdrop="static" keyboard={false}>
  <Modal.Header closeButton>
    <Modal.Title>Change Password</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="form-group mb-3">
      <input
        type="password"
        placeholder="New Password"
        className={`form-control ${isSubmitted && !passwordData.newPassword ? 'is-invalid' : ''}`}
        value={passwordData.newPassword}
        onChange={(e) => setPasswordData({
          ...passwordData,
          newPassword: e.target.value,
        })}
      />
      {isSubmitted && !passwordData.newPassword && (
        <div className="invalid-feedback">New password is required</div>
      )}
    </div>

    <div className="form-group mb-3">
      <input
        type="password"
        placeholder="Confirm Password"
        className={`form-control ${isSubmitted && !passwordData.confirmPassword ? 'is-invalid' : ''}`}
        value={passwordData.confirmPassword}
        onChange={(e) => setPasswordData({
          ...passwordData,
          confirmPassword: e.target.value,
        })}
      />
      {isSubmitted && !passwordData.confirmPassword && (
        <div className="invalid-feedback">Confirm password is required</div>
      )}
    </div>
  </Modal.Body>
  <Modal.Footer>
    <button
      className="btn btn-success"
      onClick={handleChangePassword}
    >
      Update
    </button>
    <button
      className="btn btn-danger"
      onClick={() => {
        setIsSubmitted(false);
        handleClosePasswordModal();
      }}
    >
      Cancel
    </button>
  </Modal.Footer>
</Modal>

{/* Password Modal */}
<Modal show={isPasswordModalOpen} onHide={() => {
  setIsSubmitted(false);
  handleClosePasswordModal();
}} backdrop="static" keyboard={false}>
  <Modal.Header closeButton>
    <Modal.Title>Change Password</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="form-group mb-3">
      <label htmlFor="new_password" className="form-label">New Password <span className="text-danger">*</span></label>
      <input
        type="password"
        id="new_password"
        placeholder="Enter new password"
        className={`form-control ${isSubmitted && !passwordData.newPassword ? 'is-invalid' : ''}`}
        value={passwordData.newPassword}
        onChange={(e) => setPasswordData({
          ...passwordData,
          newPassword: e.target.value,
        })}
      />
      {isSubmitted && !passwordData.newPassword && (
        <div className="invalid-feedback">New password is required</div>
      )}
      {isSubmitted && passwordData.newPassword && passwordData.newPassword.length < 6 && (
        <div className="invalid-feedback">Password must be at least 6 characters</div>
      )}
    </div>

    <div className="form-group mb-3">
      <label htmlFor="confirm_new_password" className="form-label">Confirm Password <span className="text-danger">*</span></label>
      <input
        type="password"
        id="confirm_new_password"
        placeholder="Confirm new password"
        className={`form-control ${isSubmitted && (!passwordData.confirmPassword || passwordData.confirmPassword !== passwordData.newPassword) ? 'is-invalid' : ''}`}
        value={passwordData.confirmPassword}
        onChange={(e) => setPasswordData({
          ...passwordData,
          confirmPassword: e.target.value,
        })}
      />
      {isSubmitted && !passwordData.confirmPassword && (
        <div className="invalid-feedback">Confirm password is required</div>
      )}
      {isSubmitted && passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
        <div className="invalid-feedback">Passwords do not match</div>
      )}
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="danger" onClick={() => {
      setIsSubmitted(false);
      handleClosePasswordModal();
    }}>
      Cancel
    </Button>
    <Button variant="success" onClick={handleChangePassword}>
      Update
    </Button>
  </Modal.Footer>
</Modal>
    </div>
  );
};

export default SchoolManager;
