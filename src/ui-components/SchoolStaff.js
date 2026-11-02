import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";
import { useNavigate } from 'react-router-dom';
import DataTable from "react-data-table-component";
import print_toast from "../utilities/Toaster.js";
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper from './ImageCropper1';
import Modal from 'react-bootstrap/Modal';
import useAuth from '../utilities/useAuth';
import photo from "../assets/ui-master/img/no_image _uploaded.jpg";
import { convertDateFormat } from '../utilities/dateconverter';
const SchoolStaff = ({ school_id }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showTable, setShowTable] = useState(false);
  const dataTableRef = useRef(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isSavingExit, setIsSavingExit] = useState(false);
   const [cropModalIsOpen, setCropModalIsOpen] = useState(false);
   const avatarUrl = useRef(photo);
   const [isSavingContinue, setIsSavingContinue] = useState(false);
  const [formError, setFormError] = useState({});
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(null);
  const username = auth.user.username;
   const validateForm = () => {
    let errors = {};
    
    // Staff name validation
    if (!formData.staff_official_name) {
      errors.staff_official_name = "Staff name is required";
    } else if (!/^[a-zA-Z\s]*$/.test(formData.staff_official_name)) {
      errors.staff_official_name = "Staff name should only contain letters and spaces";
    }

    // Date of Birth validation
    if (!formData.dob) {
      errors.dob = "Date of Birth is required";
    }

    // Gender validation
    if (!formData.gender) {
      errors.gender = "Gender is required";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    // Phone number validation
    if (!formData.phone_no1) {
      errors.phone_no1 = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_no1)) {
      errors.phone_no1 = "Phone number must be 10 digits";
    }

    // Password validation for new staff
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    fetchStaffs();
  }, [school_id]);


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
    const fetchStaffs = async () => {
      try {
        const response = await axios.get(`${globalVariables.api_url}/staff/view_staffs`, {
          params: { school_id: school_id }
        });
    
        if (response.data.status && response.data.data.length > 0) {
          setTableData(response.data.data);
          setShowTable(true);
        } else {
          setTableData([]);
          setShowTable(false);
        }
      } catch (error) {
        console.error('Error fetching staff data:', error.message);
      }
    };
    
  const fetchStaffs1 = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/view_staffs`, {
        params: { school_id: school_id }
      });
      if (response.data.status) {
        setTableData(response.data.data);
        setShowTable(true);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error.message);
      
    }
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
    date_of_joining: "", // New field
    save_flag: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
    setFormError(prevError => ({ ...prevError, [name]: '' }));
  };


  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,
      minWidth: '80px' 
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
      minWidth: '200px' 
    },
    { name: "Gender", selector: (row) => row.gender, sortable: true, minWidth: '150px' },
    { name: "DOB", selector: (row) =>convertDateFormat(row.dob), sortable: true, minWidth: '170px'  },
   
    { name: "Phone", selector: (row) => row.phone_no1, sortable: true, minWidth: '160px'  },
    
    { name: "Email", selector: (row) => row.email, sortable: true, minWidth: '200px'  },
  ];

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  const filteredData = tableData.filter(item =>
    Object.values(item).some(val =>
      val?.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );


  const updateAvatar = (imgSrc, file) => {
    avatarUrl.current = imgSrc;
    setFormData({
      ...formData,
      photo: imgSrc,
    });
  };

  const handleSubmit = async (e, shouldContinue = false) => {
    e.preventDefault();
    
    // Set loading state for the appropriate button
    if (shouldContinue) {
      setIsSavingContinue(true);
    } else {
      setIsSavingExit(true);
    }

    if (!validateForm()) {
      setIsSavingExit(false);
      setIsSavingContinue(false);
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

      // Append username and date_of_joining if available
      formDataToSend.append('username', username);
      if (formData.date_of_joining) {
        formDataToSend.append('date_of_joining', formData.date_of_joining);
      }

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
    <div>
    <input
          type="text"
          className="form-control w-25"
          placeholder="Search staff..."
          value={searchText}
          onChange={handleSearch}
        />
    {filteredData && filteredData.length > 0 && (
      <div className="d-flex justify-content-end mb-3">
     {/* <button className="btn btn-primary" onClick={handleOpenModal}>
  Add Staff
</button> */}
      
      </div>
    )}
      {/* <div className="row" ref={dataTableRef}>
        <div className="col-md-12">
          {showTable && (
            <DataTable
             className="custom-data-table"
              columns={columns}
              data={filteredData}
              noDataComponent={<div className="text-center p-4">No staffs found</div>}
              pagination
              paginationComponentOptions={{
                rowsPerPageText: "Rows per page:",
                rangeSeparatorText: "of",
                selectAllRowsItem: true,
                selectAllRowsItemText: "All",
              }}
            />
          )}
        </div>
      </div> */}
      <div className="row" ref={dataTableRef}>
  <div className="col-md-12">
    {filteredData && filteredData.length > 0 ? (
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
      />
    ) : (
      <div className="text-center">
        <strong>**** Staff Details Not Found ****</strong>
      </div>
    )}
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
      <div className="col-md-6">
<label htmlFor="date_of_joining">Date of Joining <span className="text-danger">*</span></label>
<input
    type="date"
    className="form-control"
    name="date_of_joining"
    value={formData.date_of_joining || ''}
    onChange={handleChange}
/>
{formError.date_of_joining && (
    <div className="text-danger">{formError.date_of_joining}</div>
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
<label htmlFor="photo">
Photo <span className="text-danger">*</span>
</label>
<input
type="file"
id="photo"
name="photo"
accept="image/*"
onChange={handleImageChange}
ref={fileInputRef}
/>

{/* Display the image preview below the file input */}
<div className="mt-3">
<img
src={avatarUrl.current}
alt="School Preview"
style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
/>
</div>

{formError.photo && <div className="text-danger">{formError.photo}</div>}
</div>
</div>


<div className="d-flex justify-content-end">
<button
  type="submit"
  className="btn btn-success me-2"
  disabled={isSavingExit || isSavingContinue}
  onClick={(e) => handleSubmit(e, false)}
>
  {isSavingExit ? "Saving..." : "Save & Exit"}
</button>
<button
  type="button"
  className="btn btn-primary me-2"
  disabled={isSavingExit || isSavingContinue}
  onClick={(e) => handleSubmit(e, true)}
>
  {isSavingContinue ? "Saving..." : "Save & Continue"}
</button>
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
<Modal show={cropModalIsOpen} onHide={() => setCropModalIsOpen(false)}>
<Modal.Header closeButton>
<Modal.Title>Crop Image</Modal.Title>
</Modal.Header>
<Modal.Body>
<ImageCropper
image={formData.photo}
updateAvatar={updateAvatar}
closeModal={() => setCropModalIsOpen(false)}
/>
</Modal.Body>
</Modal>
 </>
  );
};

export default SchoolStaff;