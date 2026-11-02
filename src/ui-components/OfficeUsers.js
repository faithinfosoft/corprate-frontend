import React, { useState, useEffect } from "react";
import axios from "axios";
// import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from "react-bootstrap/Modal";
import print_toast from "../utilities/Toaster.js";
import { Link, useNavigate } from "react-router-dom";
import Breadcum from "./Breadcum"; // Corrected import path
import useAuth from "../utilities/useAuth";

const OfficeUsers = () => {
  const [breadcum, setBreadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "Office Users", Link: "" },
  ]);
  const navigate = useNavigate();

  const auth = useAuth();

  console.log("Auth User Object:", auth.user); // Debugging

  const user_type = auth.user?.user_type;
  const school_id = auth.user?.user_id;

  console.log("Extracted School ID:", school_id);
  const [users, setUsers] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [formData, setFormData] = useState({
    user_name: "",
    password: "",
    confirm_password: "",
    user_role: "office",
    old_user_name: "",
    save_flag: false,
  });

  const [formErrorCreate, setFormErrorCreate] = useState({});
  const [formErrorEdit, setFormErrorEdit] = useState({});

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    user_name: "",
    password: "",
    user_role: "",
  });

  const openModal = () => {
    setModalIsOpen(true);
    // Clear any existing edit form errors when modal opens
    setFormErrorEdit({});
  };

  const closeModal = () => {
    setModalIsOpen(false);
    // Reset edit form data and clear errors when modal closes
    setEditFormData({ 
      user_name: "", 
      password: "",
      user_role: "",
      old_user_name: ""
    });
    setFormErrorEdit({});
  };
  const clearForm = () => {
    setFormData({
      user_name: "",
      password: "",
      confirm_password: "",
      user_role: "office",
      save_flag: false,
    });
    setFormError({});
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        globalVariables.api_url + "/users/view",
        {
          params: {
            usertype: user_type,
            school_id: school_id,
          },
        }
      );
      if (response.data.status) {
        setUsers(response.data.data);
        console.log("Fetched users:", response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setLoaded(true);
      print_toast("error", "Error fetching data. Please try again.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setFormErrorCreate((prevFormError) => ({
      ...prevFormError,
      [name]: "",
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevEditFormData) => ({
      ...prevEditFormData,
      [name]: value,
    }));
    setFormError((prevFormError) => ({
      ...prevFormError,
      [name]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let errors = {};

    if (!formData.user_name) {
      errors.user_name = "Username is required.";
    }
    if (!formData.password) {
      errors.password = "Password is required.";
    }
    if (!formData.confirm_password) {
      errors.confirm_password = "Confirm password is required.";
    }
    if (
      formData.password &&
      formData.confirm_password &&
      formData.password !== formData.confirm_password
    ) {
      errors.confirm_password = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrorCreate(errors);
      return;
    }

    // Clear errors if validation passes
    setFormErrorCreate({});

    setFormData((prevFormData) => ({ ...prevFormData, save_flag: true }));

    const formDataWithUserType = {
      ...formData,
      user_type: user_type,
      school_id: school_id,
    };

    try {
      const response = await axios.post(
        globalVariables.api_url + "/users/saveuser",
        new URLSearchParams(formDataWithUserType),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.data.status) {
        await fetchUsers();
        clearForm();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormErrorCreate(response.data.error || {});
      }
    } catch (error) {
      console.error("Error saving user:", error.message);
      setFormErrorCreate({ submit: "An error occurred. Please try again." });
      print_toast("error", "Error saving user. Please try again.");
    } finally {
      setFormData((prevFormData) => ({ ...prevFormData, save_flag: false }));
    }
  };

  const handleDelete = async (user) => {
    try {
      const formDataToDelete = new URLSearchParams();
      formDataToDelete.append("username", user.username);

      const response = await axios.post(
        globalVariables.api_url + "/users/delete",
        formDataToDelete,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.data.status) {
        // Refresh the user list
        await fetchUsers();
        setUsers(prevUsers => prevUsers.filter(u => u.username !== user.username));
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error.message);
      print_toast("error", "Error deleting user. Please try again.");
    }
  };
  
  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
      const formDataToUpdate = new URLSearchParams();
      formDataToUpdate.append("username", user.username);
      formDataToUpdate.append("old_user_name", user.username);
      formDataToUpdate.append("status", newStatus);

      const response = await axios.post(
        globalVariables.api_url + "/users/update",
        formDataToUpdate,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.data.status) {
        await fetchUsers();
        print_toast("success", `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error toggling status:", error.message);
      print_toast("error", "Error updating status. Please try again.");
    }
  };

  const handleEdit = (user) => {
    setEditFormData({
      user_name: user.username,
      old_user_name: user.username,
      password: user.password,
      user_role: user.user_type === 'certificate_verifier' ? 'certificate_verifier' : 'office',
      user_type: user.user_type,
    });
    openModal();
  };

  const updateUsers = async (e) => {
    e.preventDefault();

    try {
      // Prepare the form data to update
      const formDataToUpdate = new URLSearchParams();
      formDataToUpdate.append("username", editFormData.user_name); // Username to update
      formDataToUpdate.append("password", editFormData.password); // Password to update
      formDataToUpdate.append("user_role", editFormData.user_role); // User role to update
      formDataToUpdate.append("old_user_name", editFormData.old_user_name); // Old username to avoid re-checking in validation

      // Send POST request to the backend to update the user
      const response = await axios.post(
        globalVariables.api_url + "/users/update",
        formDataToUpdate,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      // Handle backend response
      if (response.data.status) {
        // If success, refresh the user list and close the modal
        await fetchUsers();
        closeModal();
        print_toast("success", response.data.message); // Success toast
      } else {
        // If there are errors, display the error messages and set form errors
        print_toast("error", response.data.message);
        setFormErrorEdit(response.data.error || {}); // Set field-specific errors for editing
      }
    } catch (error) {
      console.error("Error updating user:", error.message);
      setFormErrorEdit({ submit: "An error occurred. Please try again." }); // General error message
      print_toast("error", "Error updating user. Please try again.");
    }
  };

  return (
    <>
      <Breadcum items={breadcum} title="Office Users" />{" "}
      {/* Pass breadcum as a prop */}
      {/* Rest of your component code */}
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Office Users </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">
                        Sl No
                      </th>
                      <th scope="col" className="text-center">
                        User Type
                      </th>
                      <th scope="col" className="text-center">
                        Username
                      </th>
                      <th scope="col" className="text-center">
                        Status
                      </th>
                      <th scope="col" className="text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && users.length === 0 ? (
                      <tr>
                        <td colSpan="4">{/* <NoDataFound /> */}</td>
                      </tr>
                    ) : (
                      users.map((user, index) => (
                        <tr key={user.username}>
                          <td>{index + 1}</td>
                          <td className="text-center">
                            {user.user_type === 'certificate_verifier' ? 'Certificate Verifier' : 'Office'}
                          </td>
                          <td>{user.username}</td>
                          <td className="text-center">
                            <span className={`badge ${user.status === 'inactive' ? 'bg-danger' : 'bg-success'}`}>
                              {user.status === 'inactive' ? 'Inactive' : 'Active'}
                            </span>
                          </td>

                          <td>
                            <div className="dropdown">
                              <button
                                className="btn btn-dark dropdown-toggle btn-sm"
                                type="button"
                                id="dropdownMenuButton1"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                Action
                              </button>
                              <ul
                                className="dropdown-menu"
                                aria-labelledby="dropdownMenuButton1"
                              >
                                <li>
                                  <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={() => handleEdit(user)}
                                  >
                                    Edit
                                  </a>
                                </li>
                                <li>
                                  <a
                                    href="#"
                                    disabled={user.delete_flag}
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.preventDefault(); // Prevent the default link behavior
                                      // Show confirmation dialog
                                      if (
                                        window.confirm(
                                          "Are you sure you want to delete this user?"
                                        )
                                      ) {
                                        handleDelete(user);
                                      }
                                    }}
                                  >
                                    {user.delete_flag
                                      ? "Deleting..."
                                      : "Delete"}
                                  </a>
                                </li>
                                <li>
                                  <a
                                    href="#"
                                    className="dropdown-item"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleToggleStatus(user);
                                    }}
                                  >
                                    {user.status === 'inactive' ? 'Activate' : 'Deactivate'}
                                  </a>
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
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Create Office Users</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} id="form-educationcategory-web">
                <div className="form-group">
                  <label htmlFor="user_role" className="col-form-label">
                    User Type<span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    id="user_role"
                    name="user_role"
                    value={formData.user_role}
                    onChange={handleChange}
                  >
                    <option value="office">Office</option>
                    {user_type === 'corporate_admin' && (
                      <option value="certificate_verifier">Certificate Verifier</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="user_name" className="col-form-label">
                    Username<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="user_name"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                  />
                  {formErrorCreate.user_name && (
                    <div className="text-danger">
                      {formErrorCreate.user_name}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="col-form-label">
                    Password<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {formErrorCreate.password && (
                    <div className="text-danger">
                      {formErrorCreate.password}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirm_password" className="col-form-label">
                    Confirm Password<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                  />
                  {formErrorCreate.confirm_password && (
                    <div className="text-danger">
                      {formErrorCreate.confirm_password}
                    </div>
                  )}
                </div>

                <div className="col-12 text-end mt-3">
                  <button
                    type="submit"
                    className="btn btn-success m-1"
                    disabled={formData.save_flag}
                  >
                    {formData.save_flag ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger m-1"
                    onClick={clearForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Modal
        show={modalIsOpen}
        onHide={closeModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Update User</Modal.Title>
        </Modal.Header>
        <form onSubmit={updateUsers}>
          <Modal.Body>
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="edit_user_role" className="col-form-label">
                User Type<span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                id="edit_user_role"
                name="user_role"
                value={editFormData.user_role}
                onChange={handleEditChange}
              >
                <option value="office">Office</option>
                {user_type === 'corporate_admin' && (
                  <option value="certificate_verifier">Certificate Verifier</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="edit_user_name" className="col-form-label">
                Username<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="edit_user_name"
                name="user_name"
                value={editFormData.user_name}
                onChange={handleEditChange}
              />
              {formErrorEdit.user_name && (
                <div className="text-danger">{formErrorEdit.user_name}</div>
              )}
            </div>

            {/* Hidden Old Username Field */}
            <input
              type="hidden"
              id="old_user_name"
              name="old_user_name"
              value={editFormData.old_user_name}
            />
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-success m-1">
              Save
            </button>
            <button
              type="button"
              className="btn btn-danger m-1"
              onClick={closeModal}
            >
              Close
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};

export default OfficeUsers;
