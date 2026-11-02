import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { useNavigate, Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import DataTable from "react-data-table-component";
import useAuth from '../utilities/useAuth';
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper from './ImageCropper';
import { convertDateFormat } from '../utilities/dateconverter';
import { capitalizeWords } from '../utilities/dateconverter';
import Cookies from 'js-cookie';
const SchoolAdminStaff = () => {
  const auth = useAuth();
  const username = auth.user.username;
  const school_id = auth.user.user_id;
  const { staffType } = useParams();
  const user_type = auth.user.user_type;
  const navigate = useNavigate();
  const [staffs, setStaffs] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  // const [isSaving, setIsSaving] = useState(false);
  const [isSavingExit, setIsSavingExit] = useState(false);
  const [isSavingContinue, setIsSavingContinue] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showTable, setShowTable] = useState(false);
  const dataTableRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Add this handler to track page changes
  const handlePageChange = page => {
    setCurrentPage(page);
  };
  
  // Add this handler to track rows per page changes
  const handlePerRowsChange = (newRowsPerPage, page) => {
    setRowsPerPage(newRowsPerPage);
  };

  const [formData, setFormData] = useState({
    staff_official_name: "",
    photo:"",
    dob: "",
    gender: "",
    phone_no1: "",
    email: "",
    password: "",
    fk_school_id: school_id,
    position_type: '',
    roll_type: '',
    date_of_commencement: '',
    appointment_approved: '',

    date_of_joining: "", 
    save_flag: false
  });
  const [formError, setFormError] = useState({});
  const [cropModalIsOpen, setCropModalIsOpen] = useState(false);
  // const avatarUrl = useRef(photo);
  const fileInputRef = useRef(null);

  // const validateForm = () => {
  //   let errors = {};
    
  //   // Staff name validation
  //   if (!formData.staff_official_name) {
  //     errors.staff_official_name = "Staff name is required";
  //   } else if (!/^[a-zA-Z\s]*$/.test(formData.staff_official_name)) {
  //     errors.staff_official_name = "Staff name should only contain letters and spaces";
  //   }

  //   // Date of Birth validation
  //   if (!formData.dob) {
  //     errors.dob = "Date of Birth is required";
  //   }

  //   // Gender validation
  //   if (!formData.gender) {
  //     errors.gender = "Gender is required";
  //   }

  //   // Email validation
  //   if (!formData.email) {
  //     errors.email = "Email is required";
  //   } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
  //     errors.email = "Email is invalid";
  //   }

  //   // Phone number validation
  //   if (!formData.phone_no1) {
  //     errors.phone_no1 = "Phone number is required";
  //   } else if (!/^\d{10}$/.test(formData.phone_no1)) {
  //     errors.phone_no1 = "Phone number must be 10 digits";
  //   }

  //   if (!formData.password) {
  //     errors.password = "Password is required";
  //   } else if (formData.password.length < 6) {
  //     errors.password = "Password must be at least 6 characters";
  //   } else if (!/[A-Z]/.test(formData.password)) {
  //     errors.password = "Password must include at least one uppercase letter (A-Z)";
  //   } else if (!/[a-z]/.test(formData.password)) {
  //     errors.password = "Password must include at least one lowercase letter (a-z)";
  //   } else if (!/[0-9]/.test(formData.password)) {
  //     errors.password = "Password must include at least one number (0-9)";
  //   } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
  //     errors.password = "Password must include at least one special character (!@#$%^&*)";
  //   }

  //   setFormError(errors);
  //   return Object.keys(errors).length === 0;
  // };

  useEffect(() => {
    if (user_type === 'school_admin') {
      fetchStaffs();
    } else {
      print_toast("error", "You don't have permission to view staff details.");
      navigate('/');
    }
  }, [user_type, school_id,staffType]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        photo: file
      }));
      setFormError(prevErrors => ({
        ...prevErrors,
        photo: ''
      }));
      setCropModalIsOpen(true);
    }
  };
  
  // Update avatar after cropping
  // const updateAvatar = (imgSrc, file) => {
  //   avatarUrl.current = imgSrc;
  //   setFormData({
  //     ...formData,
  //     photo: imgSrc,
  //   });
  // };

  

  const fetchStaffs = async () => { 
    try {
      console.log("Staff Type from URL params:", staffType);

      const response = await axios.get(`${globalVariables.api_url}/staff/view_staffs`, {
        params: { 
          school_id: school_id, 
          staff_type: staffType 
        }
      });

      if (response.data.status) {
        setTableData(response.data.data);
        setShowTable(true);
      }
      else {
        setTableData([]);
        setShowTable(false);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching staff data:', error.message);
      print_toast("error", "Failed to fetch staff data");
    }
};



  const handleStaffLogin = async (email) => {
    try {

      const params = new URLSearchParams();
      params.append('pid', email);
    
      const response = await axios.post(
        `${globalVariables.api_url}/login/user_login`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );



      //const response = await axios.get(`${globalVariables.api_url}/login/user_login?pid=${email}`);
   
      if (response.data.status === true) {
      
        const token = response.data.token;
        Cookies.set('token', token, { sameSite: 'None', secure: true });
        
       
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
   
        const newTab = window.open('/staff-dashboard', '_blank');
    
        if (newTab) {
         
          newTab.onload = () => {
         
            newTab.postMessage({ 
              type: 'AUTH_USER', 
              payload: { user: response.data.user, token } 
            }, window.location.origin);
          };
        }
      } else {
        print_toast("error", response.data.message || "School login failed");
        console.error("School login failed:", response.data.message);
      }
    } catch (error) {
      print_toast("error", "An error occurred during school login");
      console.error("School login error:", error);
    }
  };



  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      minWidth: '90px' 
    },

    { 
      name: "Staff Name", 
      selector: (row) => (

        <a 
          href={`/staffdetails/${row.encrypted_staff_id}`} 
          className="nav-link reports" 
          style={{ color: 'blue', textDecoration: 'none' }} 
          target="_blank" 
          rel="noopener noreferrer"
        >


      
          {row.staff_official_name}
        </a>
      ),
      sortable: true, 
      minWidth: '240px' 
    },


    // {
    //   name: "Staff Name",
    //  minWidth: '200px',
    //  sortable: true,
    //   cell: (row) => (
    //     <div className='text-dark' style={{ textAlign: 'center' }}>
    //       <a   
    //       style={{ color: 'blue', textDecoration: 'none' }} 
    //         href="#"
    //         className="dropdown-item nav-link reports"
    //         onClick={(e) => {
    //           e.preventDefault(); // Prevent default link behavior
    //           handleStaffLogin(row.email);
    //         }}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         {row.location} {row.staff_official_name}
    //       </a>
    //     </div>
    //   )
    // },
    



    { name: "Gender", selector: (row) => row.gender, sortable: true, minWidth: '130px' },
     { name: "DOB", selector: (row) => convertDateFormat(row.dob), sortable: true, minWidth: '150px' },
    { name: "Phone", selector: (row) => row.phone_no1, sortable: true, minWidth: '180px' },
    { name: "Email", selector: (row) => row.email, sortable: true, minWidth: '280px' },
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
  
    setFormError(prevError => {
      let updatedErrors = { ...prevError, [name]: '' };
      
      if (name === "password" || name === "confirm_password") {
        updatedErrors.confirm_password = '';
      }
      
      return updatedErrors;
    });
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

  // const validateField = (name, value) => {
  //   const rules = validationRules[name];
  //   if (!rules) return '';

  //   if (rules.required && !value) return `${name} is required.`;
  //   if (rules.minLength && value.length < rules.minLength) return `${name} must be at least ${rules.minLength} characters.`;
  //   if (rules.maxLength && value.length > rules.maxLength) return `${name} must not exceed ${rules.maxLength} characters.`;
  //   if (rules.pattern && !rules.pattern.test(value)) return `${name} format is invalid.`;
  //   if (rules.isDate && isNaN(Date.parse(value))) return `${name} must be a valid date.`;
  //   if (rules.inList && !rules.inList.includes(value)) return `${name} must be one of: ${rules.inList.join(', ')}.`;
  //   if (rules.isNumeric && !/^\d+$/.test(value)) return `${name} must contain only numbers.`;
  //   if (rules.length && value.length !== rules.length) return `${name} must be exactly ${rules.length} characters long.`;
  //   if (rules.isEmail && !/\S+@\S+\.\S+/.test(value)) return `${name} must be a valid email address.`;

  //   return '';
  // };

  const handleSubmit = async (e, shouldContinue = false) => {
    e.preventDefault();
  
    // Reset previous errors
    setFormError({});
  
    // Set loading states based on action
    if (shouldContinue) {
      setIsSavingContinue(true);
    } else {
      setIsSavingExit(true);
    }
  

  
    // // Validate the form
    // if (!validateForm()) {
    //   setIsSavingExit(false);
    //   setIsSavingContinue(false);
    //   return;
    // }
  
    try {
      // Create FormData to send the data
      const formDataToSend = new FormData();
  
      // Append fields from formData
      formDataToSend.append('username', username);
      formDataToSend.append('date_of_joining', formData.date_of_joining || "");
      formDataToSend.append('position_type', formData.position_type || "");
      formDataToSend.append('staff_official_name', formData.staff_official_name || "");
      formDataToSend.append('dob', formData.dob || "");
      formDataToSend.append('gender', formData.gender || "");
      formDataToSend.append('phone_no1', formData.phone_no1 || "");
      formDataToSend.append('email', formData.email || "");
      formDataToSend.append('password', formData.password || "");
      formDataToSend.append('confirm_password', formData.confirm_password || "");
      formDataToSend.append('roll_type', formData.roll_type || "");
      formDataToSend.append('date_of_commencement', formData.date_of_commencement || "");
      formDataToSend.append('appointment_approved', formData.appointment_approved || "");
  
      // If there are other fields (such as photo), append them too
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }
  
      // Log the payload to the console to check the data being sent
      console.log('FormData payload:', formDataToSend);
  
      // Make the API call
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
          navigate(`/staffdetails/${staff_id}`, {
            state: { newStaffData: response.data.data, activeTab: "overview" },
          });
        }
      } else {
        // Handle backend validation errors
        print_toast("error", response.data.message || "Validation Error");
  
        if (response.data.error) {
          // Map backend error keys to form field names
          const errorMapping = {
            'username': 'email',
            'email': 'email',
            'staff_official_name': 'staff_official_name',
            'dob': 'dob',
            'gender': 'gender',
            'phone_no1': 'phone_no1',
            'position_type': 'position_type',
            'roll_type': 'roll_type',
            'date_of_commencement': 'date_of_commencement',
            'appointment_approved': 'appointment_approved',
            'password': 'password'
          };
  
          // Process and set backend errors
          const formErrors = {};
          Object.keys(response.data.error).forEach(key => {
            const mappedKey = errorMapping[key] || key;
            formErrors[mappedKey] = response.data.error[key];
          });
  
          // Set form errors
          setFormError(formErrors);
        }
      }
    } catch (error) {
      console.error('Error saving staff:', error);
  
      // Handle network or unexpected errors
      if (error.response && error.response.data) {
        const backendErrors = error.response.data.error;
        
        print_toast("error", error.response.data.message || "An error occurred");
  
        if (backendErrors) {
          const formErrors = {};
          
          Object.keys(backendErrors).forEach(key => {
            formErrors[key] = backendErrors[key];
          });
  
          setFormError(formErrors);
        }
      } else {
        print_toast("error", "Failed to save staff");
      }
    } finally {
      // Reset loading states
      setIsSavingExit(false);
      setIsSavingContinue(false);
    }
  };

  const handleSubmit1 = async (e, shouldContinue = false) => {
    e.preventDefault();
  
    // Set loading states based on action
    if (shouldContinue) {
      setIsSavingContinue(true);
    } else {
      setIsSavingExit(true);
    }
  
    // Check if passwords match
    if (formData.password !== formData.confirm_password) {
      setFormError((prevErrors) => ({
        ...prevErrors,
        confirm_password: "Passwords do not match!",
      }));
      setIsSavingExit(false);
      setIsSavingContinue(false);
      return;
    }
  
    // Validate the form
    // if (!validateForm()) {
    //   setIsSavingExit(false);
    //   setIsSavingContinue(false);
    //   return;
    // }
  
    try {
      // Create FormData to send the data
      const formDataToSend = new FormData();
      
      // Append fields from formData
      formDataToSend.append('username', username);
      formDataToSend.append('date_of_joining', formData.date_of_joining || "");
      formDataToSend.append('position_type', formData.position_type || "");
      formDataToSend.append('staff_official_name', formData.staff_official_name || "");
      formDataToSend.append('dob', formData.dob || "");
      formDataToSend.append('gender', formData.gender || "");
      formDataToSend.append('phone_no1', formData.phone_no1 || "");
      formDataToSend.append('email', formData.email || "");
      formDataToSend.append('password', formData.password || "");
      formDataToSend.append('confirm_password', formData.confirm_password || "");
      formDataToSend.append('roll_type', formData.roll_type || "");
      formDataToSend.append('date_of_commencement', formData.date_of_commencement || "");
      formDataToSend.append('appointment_approved', formData.appointment_approved || "");
      
      // If there are other fields (such as photo), append them too
      if (formData.photo) {
        formDataToSend.append('photo', formData.photo);
      }
  
      // Log the payload to the console to check the data being sent
      console.log('FormData payload:', formDataToSend);
  
      // Make the API call
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
          navigate(`/staffdetails/${staff_id}`, {
            state: { newStaffData: response.data.data, activeTab: "overview" },
          });
        }
      } else {
        print_toast("error", response.data.message);
        if (response.data.error) {
          setFormError(response.data.error);
        }
      }
    } catch (error) {
      console.error('Error saving staff:', error.message);
      print_toast("error", "Failed to save staff");
    } finally {
      // Reset loading states
      setIsSavingExit(false);
      setIsSavingContinue(false);
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

  const handleOpenModal = (staffType) => {
    clearForm();  // clear any previous form data
    setFormData((prevState) => ({
      ...prevState,
      position_type: staffType === 'permanent' ? 'Permanent' : 'Temporary', // Set the default value
    }));
    setModalIsOpen(true);
  };
  

  const handleCloseModal = () => {
    setModalIsOpen(false);
    clearForm();
  };
  const today = new Date().toISOString().split("T")[0];
  return (
    <>
      <Breadcum
        items={[
          { Title: "Home", Link: "/" },
          { Title: `${capitalizeWords(staffType)} Staff Details`, Link: "" },
        ]}
        title={`${capitalizeWords(staffType)} Staff Details`}
      />

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title">{capitalizeWords(staffType)} Staff Details</h5>
          <button className="btn btn-danger" onClick={() => handleOpenModal(staffType)}>
            Create Staff
          </button>
        </div>
        <div className="card-body">
        {filteredData && filteredData.length > 0 && (
          <div className="d-flex justify-content-end mb-3">
            <input
              type="text"
              className="form-control w-25"
              placeholder="Search..."
              value={searchText}
              onChange={handleSearch}
            />
          </div>
            )}
          <div className="row" ref={dataTableRef}>
            <div className="col-md-12">
            {filteredData && filteredData.length > 0 ? (
                <DataTable
                  columns={columns}
                   className="custom-data-table"
                  data={filteredData}
                  pagination
                  highlightOnHover
                  pointerOnHover
                  ref={dataTableRef}
                  noDataComponent="No data available"
                  onChangePage={handlePageChange}
                  onChangeRowsPerPage={handlePerRowsChange}
                  paginationDefaultPage={currentPage}
                  paginationPerPage={rowsPerPage}
                />

              ) : (
      <div className="text-center">
        <strong>**** Staff Details Not Found ****</strong>
      </div>
    )}
            </div>
          </div>
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={handleCloseModal} size="xl"  backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Create Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <form onSubmit={(e) => handleSubmit(e, false)}>


        <div className="mb-3">
  <label>Position Type <span className="text-danger">*</span></label>
  <div>
    <div className="form-check form-check-inline">
      <input
        type="radio"
        id="permanent"
        name="position_type"
        value="Permanent"
        checked={formData.position_type === 'Permanent'}
        onChange={handleChange}
        className="form-check-input"
      />
      <label htmlFor="permanent" className="form-check-label">
        Permanent
      </label>
    </div>
    <div className="form-check form-check-inline">
      <input
        type="radio"
        id="temporary"
        name="position_type"
        value="Temporary"
        checked={formData.position_type === 'Temporary'}
        onChange={handleChange}
        className="form-check-input"
      />
      <label htmlFor="temporary" className="form-check-label">
        Temporary
      </label>
    </div>
  </div>
  {formError.type && (
    <div className="text-danger">{formError.type}</div>
  )}
  </div>

  {formData.position_type === "Permanent" && (
    <div className="mb-3">
       <label>Appointment Approved In <span className="text-danger">*</span></label>
     
      <div>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="scale_of_pay"
            name="appointment_approved"
            value="Scale of Pay"
            checked={formData.appointment_approved === "Scale of Pay"}
            onChange={handleChange}
            className="form-check-input"
          />
          <label htmlFor="scale_of_pay" className="form-check-label">
            Scale of Pay
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            type="radio"
            id="daily_wages"
            name="appointment_approved"
            value="Daily Wages"
            checked={formData.appointment_approved === "Daily Wages"}
            onChange={handleChange}
            className="form-check-input"
          />
          <label htmlFor="daily_wages" className="form-check-label">
            Daily Wages
          </label>
        </div>
        {formError.appointment_approved && (
    <div className="text-danger">{formError.appointment_approved}</div>
  )}
      </div>
    </div>
  )}







  <div className="mb-3">
  <label htmlFor="staff_type">
    Staff Type <span className="text-danger">*</span>
  </label>
  <select
    className="form-control"
    name="roll_type"
    value={formData.roll_type}
    onChange={handleChange}
  >
    <option value="">Select Staff Type</option>
    <option value="teaching">Teaching</option>
    <option value="non_teaching">Non-Teaching</option>
  </select>
  {formError.roll_type && (
    <div className="text-danger">{formError.roll_type}</div>
  )}
</div>


<div className="mb-3">
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

  <div className="mb-3">
    <label htmlFor="dob">
      Date of Birth <span className="text-danger">*</span>
    </label>
    <input
      type="date"
      className="form-control"
      name="dob"
      value={formData.dob}
      onChange={handleChange}
      max={today}
    />
    {formError.dob && <div className="text-danger">{formError.dob}</div>}
  </div>

  <div className="mb-3">
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
  
    </select>
    {formError.gender && <div className="text-danger">{formError.gender}</div>}
  </div>


  <div className="mb-3">
  <label htmlFor="date_of_joining">
    Date of Joining
  </label>
  <input
    type="date"
    className="form-control"
    name="date_of_joining"
    value={formData.date_of_joining}
    onChange={handleChange}
  />
</div>


<div className="mb-3">
  <label htmlFor="date_of_commencement">
    Date of Commencement of Continuing Service
  </label>
  <input
    type="date"
    className="form-control"
    name="date_of_commencement"
    value={formData.date_of_commencement}
    onChange={handleChange}
  />
</div>

  <div className="mb-3">
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
    {formError.phone_no1 && <div className="text-danger">{formError.phone_no1}</div>}
  </div>



  <div className="mb-3">
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
    {formError.email && <div className="text-danger">{formError.email}</div>}
  </div>

  <div className="mb-3">
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
    {formError.password && <div className="text-danger">{formError.password}</div>}
  </div>

  <div className="mb-3">
    <label htmlFor="confirm_password">
      Confirm Password <span className="text-danger">*</span>
    </label>
    <input
      type="password"
      className="form-control"
      name="confirm_password"
      value={formData.confirm_password}
      onChange={handleChange}
    />
    {formError.confirm_password && <div className="text-danger">{formError.confirm_password}</div>}
  </div>



  <div className="d-flex justify-content-end">
    <button
      type="submit"
      className="btn btn-success me-2"
      disabled={isSavingExit || isSavingContinue}
      onClick={(e) => handleSubmit(e, false)}
    >
      {isSavingExit ? "Saving..." : "Save"}
    </button>
    {/* <button
      type="button"
      className="btn btn-primary me-2"
      disabled={isSavingExit || isSavingContinue}
      onClick={(e) => handleSubmit(e, true)}
    >
      {isSavingContinue ? "Saving..." : "Save & Continue"}
    </button> */}
    <button
      type="button"
      className="btn btn-danger"
      onClick={handleCloseModal}
      disabled={isSavingExit || isSavingContinue}
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

export default SchoolAdminStaff;