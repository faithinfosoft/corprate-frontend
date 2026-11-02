import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NoDataFound from "./NoDataFound";
import globalVariables from "../Global.js";
import Modal from "react-bootstrap/Modal";
import print_toast from "../utilities/Toaster.js";
import Breadcum from "./Breadcum.js";
import { Link } from 'react-router-dom';

const StaffByAdmin = () => {
  const navigate = useNavigate();
  const [staffs, setStaffs] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formError, setFormError] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    staff_official_name: "",
    dob: "",
    gender: "",
    phone_no1: "",
    email: "",
    password: "",
  });

  const fieldNames = {
    staff_official_name: "Official Name",
    dob: "Date of Birth",
    gender: "Gender",
    phone_no1: "Primary Phone",
    email: "Email",
    password: "Password"
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/view_staffs`);
      if (response.data.status) {
        setStaffs(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching staff data:", error.message);
      print_toast("error", "Failed to fetch staff data");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError((prevError) => ({ ...prevError, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        photo: file,
      });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e, shouldContinue = false) => {
    e.preventDefault();
    console.log("shouldContinue value:", shouldContinue);
    setIsSaving(true);
  
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      }
  
      const response = await axios.post(
        `${globalVariables.api_url}/staff/save_staff`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      console.log("API Response:", response.data); // Debugging
  
      if (response.data.status) {
        await fetchStaffs();
        setModalIsOpen(false);
        clearForm();
        print_toast("success", response.data.message);
  
        // Debugging: Check if shouldContinue is true and staff_id is available
        if (shouldContinue && response.data) {  
          const staff_id = response.data;  // assuming response.data is the staff_id directly
          console.log("Navigating to staff details page with staff_id:", staff_id);
          
          navigate(`/staffdetails/${response.data.data}`, {  // Use the staff_id in the URL
            state: { newStaffData: response.data.data, activeTab: "overview" },
          });
        } else {
          console.log("Staff ID not found or shouldContinue is false");
        }
        
        
        
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error("Error saving staff:", error); // Debugging
      print_toast("error", "Failed to save staff");
    } finally {
      setIsSaving(false);
    }
  };
  
  
  

  const clearForm = () => {
    setFormData({
      staff_official_name: "",
      dob: "",
      gender: "",
      phone_no1: "",
      email: "",
      password:""
    });
    setPhotoPreview(null);
    setFormError({});
  };

  const handleOpenModal = () => {
    clearForm();
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    clearForm();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = staffs.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Breadcum
        items={[
          { Title: "Home", Link: "/" },
          { Title: "Staff", Link: "" },
        ]}
        title="Staff"
      />

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title">Staff Details</h5>
          <button className="btn btn-primary" onClick={handleOpenModal}>
            Add Staff
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th scope="col" className="text-center">
                    Sl No.
                  </th>
                  <th scope="col" className="text-center">
                    Official Name
                  </th>
                  <th scope="col" className="text-center">
                    Gender
                  </th>
                  <th scope="col" className="text-center">
                    Phone No.
                  </th>
                  <th scope="col" className="text-center">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {loaded && currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <NoDataFound />
                    </td>
                  </tr>
                ) : (
                  currentItems.map((staff, index) => (
                    <tr key={staff.staff_id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      {/* <td>{staff.staff_official_name}</td> */}
                      <td>
                      <Link to={`/staffdetails/${staff.staff_id}`} style={{ color: 'blue', textDecoration: 'none' }}>
                        {staff.staff_official_name}
                      </Link>
                    </td>
                      <td>{staff.gender}</td>
                      <td>{staff.phone_no1}</td>
                      <td>{staff.email}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <nav>
            <ul className="pagination">
              {[...Array(Math.ceil(staffs.length / itemsPerPage)).keys()].map(
                (number) => (
                  <li
                    key={number + 1}
                    className={`page-item ${
                      currentPage === number + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      onClick={() => paginate(number + 1)}
                      className="page-link"
                    >
                      {number + 1}
                    </button>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Add Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="staff_official_name">
                  Official Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    formError.staff_official_name ? "is-invalid" : ""
                  }`}
                  name="staff_official_name"
                  value={formData.staff_official_name}
                  onChange={handleChange}
                />
                {formError.staff_official_name && (
                  <div className="invalid-feedback">
                    {formError.staff_official_name}
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="dob">
                  Date of Birth <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className={`form-control ${
                    formError.dob ? "is-invalid" : ""
                  }`}
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
                {formError.dob && (
                  <div className="invalid-feedback">{formError.dob}</div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="gender">
                  Gender <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-control ${
                    formError.gender ? "is-invalid" : ""
                  }`}
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formError.gender && (
                  <div className="invalid-feedback">{formError.gender}</div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="phone_no1">
                  Phone No. 1 <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${
                    formError.phone_no1 ? "is-invalid" : ""
                  }`}
                  name="phone_no1"
                  value={formData.phone_no1}
                  onChange={handleChange}
                />
                {formError.phone_no1 && (
                  <div className="invalid-feedback">{formError.phone_no1}</div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="email">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${
                    formError.email ? "is-invalid" : ""
                  }`}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {formError.email && (
                  <div className="invalid-feedback">{formError.email}</div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="photo">Upload Photo</label>
                <input
                  type="file"
                  className="form-control"
                  name="photo"
                  onChange={handleFileChange}
                />
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Photo Preview"
                    className="mt-3"
                    style={{ width: "150px", height: "150px" }}
                  />
                )}
              </div>
              <div className="col-md-6">
          <label htmlFor="password">Password <span className="text-danger">*</span></label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {formError.password && <div className="text-danger">{formError.password}</div>}
        </div>
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-success me-2"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save & Exit"}
              </button>
              <button
                type="button"
                className="btn btn-primary me-2"
                disabled={isSaving}
                onClick={(e) => handleSubmit(e, true)}
              >
                {isSaving ? "Saving..." : "Save & Continue"}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleCloseModal}
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

export default StaffByAdmin;