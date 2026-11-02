import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { useNavigate, Link } from 'react-router-dom';
import DataTable from "react-data-table-component";
import useAuth from '../utilities/useAuth';
import { convertDateFormat } from '../utilities/dateconverter';
const Staff = () => {
  const auth = useAuth();
  const username = auth.user.username;
  const user_id = auth.user.user_id;
  const school_id = auth.user.school_id;
  const user_type = auth.user.user_type;
  const navigate = useNavigate();
  const [staffs, setStaffs] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formError, setFormError] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showTable, setShowTable] = useState(false);
  const dataTableRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    staff_official_name: "",
    dob: "",
    gender: "",
    phone_no1: "",
    email: "",
    password: "",
    fk_school_id: school_id
  });

  const validationRules = {
    staff_official_name: {
      required: true,
      minLength: 3,
      maxLength: 255,
      pattern: /^[a-zA-Z\s]*$/
    },
    dob: {
      required: true,
      isDate: true
    },
    gender: {
      required: true,
      inList: ['Male', 'Female', 'Other']
    },
    phone_no1: {
      required: true,
      isNumeric: true,
      length: 10
    },
    email: {
      required: true,
      isEmail: true
    },
    password: {
      required: true,
      minLength: 6
    }
  };

  

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/view_staffs`);
      if (response.data.status) {
        setTableData(response.data.data);
        setShowTable(true);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching staff data:', error.message);
      print_toast("error", "Failed to fetch staff data");
    }
  };

  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,
      width: '80px'
    },
    // { name: "Official Name", selector: (row) => row.staff_official_name, sortable: true, minWidth: '200px' },
    {
      name: "Official Name",
      cell: (row) => (
        <Link to={`/staffdetails/${row.staff_id}`} className="nav-link reports" style={{ color: 'blue', textDecoration: 'none' }}>
          {row.staff_official_name}
        </Link>
      ),
      sortable: false,
      minWidth: '150px'
    },
    { name: "Gender", selector: (row) => row.gender, sortable: true, minWidth: '100px' },
    { name: "DOB", selector: (row) => convertDateFormat(row.dob), sortable: true, width: '120px' },
    { name: "Phone", selector: (row) => row.phone_no1, sortable: true, minWidth: '180px' },
    { name: "Email", selector: (row) => row.email, sortable: true, minWidth: '200px' },
  ];

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const filteredData = tableData.filter(item =>
    Object.values(item).some(val =>
      val.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormError(prevError => ({ ...prevError, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        photo: file
      });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateField = (name, value) => {
    const rules = validationRules[name];
    if (!rules) return '';

    if (rules.required && !value) return `${name} is required.`;
    if (rules.minLength && value.length < rules.minLength) return `${name} must be at least ${rules.minLength} characters.`;
    if (rules.maxLength && value.length > rules.maxLength) return `${name} must not exceed ${rules.maxLength} characters.`;
    if (rules.pattern && !rules.pattern.test(value)) return `${name} format is invalid.`;
    if (rules.isDate && isNaN(Date.parse(value))) return `${name} must be a valid date.`;
    if (rules.inList && !rules.inList.includes(value)) return `${name} must be one of: ${rules.inList.join(', ')}.`;
    if (rules.isNumeric && !/^\d+$/.test(value)) return `${name} must contain only numbers.`;
    if (rules.length && value.length !== rules.length) return `${name} must be exactly ${rules.length} characters long.`;
    if (rules.isEmail && !/\S+@\S+\.\S+/.test(value)) return `${name} must be a valid email address.`;

    return '';
  };

  

  const handleSubmit = async (e, shouldContinue = false) => {
    e.preventDefault();
    setIsSaving(true);
    
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      setIsSaving(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (key === 'photo') {
          if (formData[key]) formDataToSend.append(key, formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }

      formDataToSend.append('username', username);

      const response = await axios.post(`${globalVariables.api_url}/staff/save_staff`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status) {
        await fetchStaffs();
        setModalIsOpen(false);
        clearForm();
        print_toast("success", response.data.message);

        if (shouldContinue && response.data.data) {
          const staff_id = response.data.data;
          console.log("Navigating to staff details page with staff_id:", staff_id);
          
          navigate(`/staffdetails/${staff_id}`, {
            state: { newStaffData: response.data.data, activeTab: "overview" },
          });
        }
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving staff:', error.message);
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
      password: "",
      fk_school_id: school_id
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
          <div className="d-flex justify-content-end mb-3">
            <input
              type="text"
              className="form-control w-25"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearch}
            />
          </div>
          <div className="row" ref={dataTableRef}>
            <div className="col-md-12">
              {showTable && (
                <DataTable
                 className="custom-data-table"
                  columns={columns}
                  data={filteredData}
                  pagination
                  paginationComponentOptions={{
                    rowsPerPageText: "Rows per page:",
                    rangeSeparatorText: "of",
                    selectAllRowsItem: true,
                    selectAllRowsItemText: "All",
                  }}
                  selectableRows
                  selectableRowsComponent={({ selectedCount, onSelectedCountChange }) => (
                    <div className="selectable-rows-component">
                      <div className="selectable-rows-component-actions">
                        {/* You can add actions related to selectable rows here */}
                      </div>
                    </div>
                  )}
                />
              )}
            </div>
          </div>
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
                  className="form-control"
                  name="staff_official_name"
                  value={formData.staff_official_name}
                  onChange={handleChange}
                />
                {formError.staff_official_name && (
                  <div className="text-danger">{formError.staff_official_name}</div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="dob">
                  Date of Birth <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
                {formError.dob && (
                  <div className="text-danger">{formError.dob}</div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="gender">
                  Gender <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
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
                  <div className="text-danger">{formError.gender}</div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="phone_no1">
                  Phone No. <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  name="phone_no1"
                  value={formData.phone_no1}
                  onChange={handleChange}
                />
                {formError.phone_no1 && (
                  <div className="text-danger">{formError.phone_no1}</div>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="email">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {formError.email && (
                  <div className="text-danger">{formError.email}</div>
                )}
              </div>
              <div className="col-md-6">
                <label htmlFor="password">
                  Password <span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {formError.password && (
                  <div className="text-danger">{formError.password}</div>
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

export default Staff;

