import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcum from './Breadcum.js';
import Modal from 'react-bootstrap/Modal';
import { Button, Form, Row, Col } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import print_toast from "../utilities/Toaster";
import SecureImage from "./SecureImage";
import globalVariables from "../Global.js";
import { useLocation } from 'react-router-dom';
import photo from "../assets/ui-master/img/no_image_uploaded.jpg";
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper from './ImageCropperCandicate';
  import StaffParishHistory from './StaffParishHistory';
 import EducationQualification from './StaffQualification.js';
  import StaffChildrenDetails from './StaffChildrenDetails';
  import StaffFamilyDetails from './StaffFamilyDetails.js';
 import StaffServiceDetails from './StaffServiceDetails';
  //import StaffPromotionDetails from './StaffPromotionDetails';
  import StaffCocurricular from './StaffCocurricular';
 import { convertDateFormat } from '../utilities/dateconverter';
 import { capitalizeWords } from '../utilities/dateconverter';
  import StaffLeaveRequest from './StaffLeave';
  import StaffRemarks from './StaffRemarks';
import useAuth from "../utilities/useAuth";


const StaffDetails = () => {
  const auth = useAuth();
  const userType = auth.user.user_type; // Get the user type
  const isCorporateManager = userType === 'corporate_admin' || userType === 'corporate_manager';
  const { staff_id } = useParams();
  const [staffDetails, setStaffDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({staff_official_name: '',

    staff_ac_qu_course: '',
    dob: '',
    gender: '',
    marital_status: '',
    present_address: '',
    present_place: '',
    present_city: '',
    present_district: '',
    present_state: '',
    present_pin_no: '',
    permanent_address: '',
    permanent_place: '',
    permanent_city: '',
    permanent_district: '',
    permanent_state: '',
    permanent_pin_no: '',
    phone_no1: '',
    phone_no2: '',
    whatsapp_no: '',
    email: '',
    pen_no: '',
    religion: '',
    caste: '',
    subcaste: '',
    fk_school_id: '', 
    photo: '', 
    staff_type: '', 
    staff_current_status: '',
    staff_type: '',
    roll_type: '',
    position_type: '',
    commencement_date: '',
    appointment_approved:'',
    doj: ''
  });
  const [formError, setFormError] = useState({});
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ new_password: '', confirm_password: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [showChildrenDetails, setShowChildrenDetails] = useState(false);
  const [showFamilyDetails, setShowFamilyDetails] = useState(false);
  const [changeImageModal, setChangeImageModal] = useState(false);
 const [cropModalIsOpen, setCropModalIsOpen] = useState(false);
   const [currentEditingStaff, setCurrentEditingStaff] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [religionCasteSubcaste, setReligionCasteSubcaste] = useState({ christian: [],
    hindu: [],
    muslim: [], });
  const navigate = useNavigate();

  const [breadcum] = useState(() => {
    if (userType === 'staff') {
      return [
        { Title: 'Home', Link: '/' },
        { Title: 'Staff Profile' },
      ];
    } else if (userType === 'corporate_admin') {
      return [
        { Title: 'Home', Link: '/' },
        { Title: 'Staff Details' },
      ];
    } else {
      return [
        { Title: 'Home', Link: '/' },
        {
          Title: 'Staff',
          Link: userType === 'school_admin' ? '/schoolprofile#stafftab' : '/staff',
          onClick: (e) => {
            e.preventDefault();
            if (userType === 'school_admin') {
              navigate('/schoolprofile#stafftab');
            } else {
              navigate('/staff');
            }
          },
        },
        { Title: 'Staff Details', Link: '' },
      ];
    }
  });
  
  

  const validateForm = () => {
    let errors = {};
    if (!formData.staff_official_name) errors.staff_official_name = "Staff name is required";
    if (!formData.dob) errors.dob = "Date of Birth is required";
    if (!formData.gender) errors.gender = "Gender is required";
    if (!formData.email) errors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    if (!formData.phone_no1) errors.phone_no1 = "Phone number is required";
    if (!/^\d{10}$/.test(formData.phone_no1)) errors.phone_no1 = "Phone number must be 10 digits";
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({});
    setFormError({});
  };

  

  useEffect(() => {
    // Handle initial load and subsequent hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        if (hash === 'remarks' && !isCorporateManager) {
          setActiveTab('overview');
        } else {
          setActiveTab(hash);
        }
      }
    };

    // Add hash change listener
    window.addEventListener('hashchange', handleHashChange);
    
    // Handle initial load
    handleHashChange();

    // Cleanup listener
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isCorporateManager]);

  const handleTabChange = (tabId) => {
    if (tabId === 'remarks' && !isCorporateManager) return;
    setActiveTab(tabId);
    window.location.hash = tabId;
  };


  const handleTabClick = (tabName, e) => {
    e.preventDefault();
    if (tabName === 'remarks' && !isCorporateManager) return;
    setActiveTab(tabName);
    navigate(`/staffdetails/${staff_id}#${tabName}`, { replace: true });
  };

const fetchStaffDetails = useCallback(async () => {
  try {
    const response = await axios.get(`${globalVariables.api_url}/staff/staffdetails/${staff_id}`);
    if (response.data.status) {
      const data = response.data.data;
      
      // Clean up invalid dates
      if (data.commencement_date === "0000-00-00") data.commencement_date = "";
      if (data.doj === "0000-00-00") data.doj = "";
      if (data.dob === "0000-00-00") data.dob = "";
      
      // Normalize religion to lowercase
      if (data.religion) {
        data.religion = data.religion.toLowerCase();
      }
      
      setStaffDetails(data);
      setFormData(data);
    } else {
      print_toast("error", response.data.message);
    }
  } catch (error) {
    console.error('Error fetching staff details:', error);
    print_toast("error", "Failed to fetch staff details");
  }
}, [staff_id]);
  const fetchStaffDetails1 = useCallback(async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/staffdetails/${staff_id}`);
      if (response.data.status) {
        setStaffDetails(response.data.data);
        //console.log(response.data.data)
        setFormData(response.data.data);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error fetching staff details:', error);
      print_toast("error", "Failed to fetch staff details");
    }
  }, [staff_id]);

const fetchReligionCasteSubcaste = async () => {
  try {
    const response = await axios.get(`${globalVariables.api_url}/staff/getReligionCasteSubcaste`);
    
    const defaultReligions = {
      christian: ["Syro-Malabar Syrian Catholic", "Protestant", "Orthodox","Marthoma","CSI","Jacobite","Pentacost","Others"],
      hindu: ["Brahmin", "Ezhava", "Vaishya", "Shudra"],
      muslim: ["Sunni", "Shia", "Ahmadi"],
    };

    const updatedReligionCasteSubcaste = { ...defaultReligions, ...response.data };
    setReligionCasteSubcaste(updatedReligionCasteSubcaste);
  } catch (error) {
    console.error('Error fetching religion, caste, subcaste data:', error);
    setReligionCasteSubcaste({
      christian: ["Syro-Malabar Syrian Catholic", "Protestant", "Orthodox","Marthoma","CSI","Jacobite","Pentacost","Others"],
      hindu: ["Brahmin", "Ezhava", "Vaishya", "Shudra"],
      muslim: ["Sunni", "Shia", "Ahmadi"],
    });
  }
};
  const fetchReligionCasteSubcaste1 = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/getReligionCasteSubcaste`);
      
      // Define the default religions to ensure they are always present
      const defaultReligions = {
        christian: [],
        hindu: [],
        muslim: [],
      };
  
      // Merge the fetched data with the default religions
      const updatedReligionCasteSubcaste = { ...defaultReligions, ...response.data };
  
      // Set the merged data to the state
      setReligionCasteSubcaste(updatedReligionCasteSubcaste);
    } catch (error) {
      console.error('Error fetching religion, caste, subcaste data:', error);
      // Set default religions even if the fetch fails
      setReligionCasteSubcaste({
        christian: ["Syro-Malabar Syrian Catholic", "Protestant", "Orthodox","Marthoma","CSI","Jacobite","Pentacost","Others"],
        hindu: ["Brahmin", "Ezhava", "Vaishya", "Shudra"],
        muslim: ["Sunni", "Shia", "Ahmadi"],
      });
    }
  };

  useEffect(() => {
    fetchStaffDetails();
    fetchReligionCasteSubcaste();
  }, [fetchStaffDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFormError((prevError) => ({
      ...prevError,
      [name]: "",
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setNewImage(file); // Store the file in state
        setSelectedImage(URL.createObjectURL(file)); // Create a URL for preview
    }
};

const handleImageUpdate = async (croppedImage) => {
  try {
    const formData = new FormData();
    // Pass both staff_id (unencrypted numeric ID if available, or param) and username/email
    formData.append('staff_id', staffDetails?.staff_id || staff_id);
    if (staffDetails?.email) {
      formData.append('username', staffDetails.email);
    }

    let photoFile = croppedImage;
    if (typeof croppedImage === 'string' && croppedImage.startsWith('data:image')) {
        const arr = croppedImage.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        photoFile = new Blob([u8arr], { type: mime });
    }

    if (typeof croppedImage === 'string' && croppedImage.startsWith('data:image')) {
      formData.append('photo', croppedImage);
      formData.append('photo_base64', croppedImage);
    } else if (photoFile instanceof Blob || photoFile instanceof File) {
      formData.append('photo', photoFile, 'profile_photo.jpg');
    } else {
      formData.append('photo', photoFile);
    }

    const response = await axios.post(`${globalVariables.api_url}/staff/staffdetails/update_photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.status) {
      print_toast('success', 'Staff photo updated successfully');
      fetchStaffDetails();
    } else {
      print_toast('error', response.data.message || 'Failed to update staff photo');
    }
  } catch (error) {
    console.error('Error updating staff photo:', error);
    const errorMsg = error?.response?.data?.message || 'Failed to update staff photo';
    print_toast('error', errorMsg);
  } finally {
    setCropModalIsOpen(false);
    setCurrentEditingStaff(null);
    setChangeImageModal(false);
  }
};

  const handleOpenQualificationModal = () => {
    setShowQualificationModal(true);
  };

  const handleCloseQualificationModal = () => {
    setShowQualificationModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    setIsUpdating(true);
    const formDataToSend = new FormData();
  
    for (const key in formData) {
      if (formData[key] !== staffDetails[key]) {
        formDataToSend.append(key, formData[key]);
      }
    }
  console.log(staffDetails);
    formDataToSend.append('staff_id', staffDetails.staff_id);
    formDataToSend.append('school_id', staffDetails.school_id	);
    formDataToSend.append('roll_type', formData.roll_type || staffDetails.staff_type || '');
    formDataToSend.append('position_type', formData.position_type || staffDetails.position_type || '');
    formDataToSend.append('commencement_date', formData.commencement_date  || '');
    formDataToSend.append('date_of_joining', formData.doj || staffDetails.doj || '');
    formDataToSend.append('appointment_approved', formData.appointment_approved || staffDetails.appointment_approved || '');
    	
  
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/staff/staffdetails/update`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
  
      if (response.data.status) {
        print_toast("success", "Staff updated successfully");
        setEditMode(false);
        setStaffDetails(response.data.data);
        setFormData(response.data.data);
      } else {
        if (response.data.error) {
          setFormError(response.data.error);
          print_toast("error", "Please correct the errors in the form.");
        } else {
          print_toast("error", response.data.message);
        }
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      print_toast("error", "Failed to update staff");
    } finally {
      setIsUpdating(false);
    }
  };
  

  useEffect(() => {
    if (editMode) {
      setFormData(staffDetails);
    }
  }, [editMode, staffDetails]);

const handleDelete = async () => {
  if (window.confirm('Are you sure you want to delete this staff member?')) {
    try {
      const formData = new URLSearchParams();
      formData.append('staff_id', staff_id);
      
      const response = await axios.post(
        `${globalVariables.api_url}/staff/staffdetails/delete`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
          
      if (response.data.status) {
        print_toast("success", response.data.message);
        navigate('/schooladminstaff/permanent');
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      
      // Check if the error has a response with data and message
      if (error.response && error.response.data) {
        print_toast("error", error.response.data.message || "Failed to delete staff");
      } else {
        print_toast("error", "Failed to delete staff");
      }
    }
  }
};

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!passwordData.new_password) errors.new_password = "New password is required";
    if (!passwordData.confirm_password) errors.confirm_password = "Confirm password is required";
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }
  
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
  
    try {
      const response = await axios.post(`${globalVariables.api_url}/staff/staffdetails/change_password`, {
        staff_id: staff_id,
        new_password: passwordData.new_password
      });
  
      if (response.data.status) {
        print_toast("success", "Password changed successfully");
        setChangePasswordModal(false);
        setPasswordData({ new_password: '', confirm_password: '' });
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      print_toast("error", "Failed to change password");
    }
  };

  useEffect(() => {
    if (staffDetails) {
      setShowChildrenDetails(['married', 'widowed', 'divorced'].includes(staffDetails.marital_status?.toLowerCase()));
      setShowFamilyDetails(['married', 'widowed', 'divorced'].includes(staffDetails.marital_status?.toLowerCase()));
     // setShowChildrenDetails(staffDetails.marital_status?.toLowerCase() === 'married');
      //setShowFamilyDetails(staffDetails.marital_status?.toLowerCase() === 'married');
    }
  }, [staffDetails]);



  const handleChildrenDetailsClick = () => {
    const confirmMessage = "Are your children studying under class 12?";
    if (window.confirm(confirmMessage)) {
      setActiveTab('children-details');
    } else {
      // Optionally, you can show a message to the user
      alert("Access to Children Details is only available for children studying under class 12.");
    }
  };


  const handleEditImageChange = () => {
    setCurrentEditingStaff(staffDetails);
    setCropModalIsOpen(true);
  };


  
  if (!staffDetails) {
    return <div>Loading...</div>;
  }
  
  return (
    <>
      <div>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <Breadcum items={breadcum} title={staffDetails.staff_official_name} />
          
          <Dropdown>
            <Dropdown.Toggle variant="outline-primary rounded-pill px-4 shadow-sm" id="dropdown-basic">
              More Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setEditMode(true)}>Edit</Dropdown.Item>
              {userType != 'staff' && (       
                <>
                  <Dropdown.Item onClick={handleDelete}>Delete</Dropdown.Item>
                  {staffDetails?.staff_current_status === 'active' && (
                    <Dropdown.Item onClick={() => setChangePasswordModal(true)}>
                      Change Password
                    </Dropdown.Item>
                  )}
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>

      <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ overflow: 'hidden' }}>
        <div className="card-header bg-white border-0 p-0" style={{ borderTop: '4px solid #0ea5e9' }}>
          <ul className="nav nav-pills p-2 bg-light rounded-4 m-3 mt-4 flex-nowrap overflow-auto gap-2 text-nowrap" style={{ WebkitOverflowScrolling: 'touch', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <li className="nav-item">
              <button
                className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'overview' ? 'active bg-primary text-white shadow' : 'bg-white text-secondary shadow-sm'}`}
                onClick={(e) => { e.preventDefault(); handleTabClick('overview', e); }}
              >
                <i className={`bi bi-person-fill me-2 ${activeTab === 'overview' ? '' : 'text-primary'}`}></i>Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'cocurricular' ? 'active bg-primary text-white shadow' : 'bg-white text-secondary shadow-sm'}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('cocurricular'); }}
              >
                <i className={`bi bi-star-fill me-2 ${activeTab === 'cocurricular' ? '' : 'text-primary'}`}></i>Co-curricular
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'parish-history' ? 'active bg-primary text-white shadow' : 'bg-white text-secondary shadow-sm'}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('parish-history'); }}
              >
                <i className={`bi bi-bank me-2 ${activeTab === 'parish-history' ? '' : 'text-primary'}`}></i>Parish History
              </button>
            </li>
            {showChildrenDetails && (
              <li className="nav-item">
                <button
                  className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'children-details' ? 'active bg-primary text-white shadow' : 'bg-white text-secondary shadow-sm'}`}
                  onClick={(e) => { e.preventDefault(); setActiveTab('children-details'); }}
                >
                  <i className={`bi bi-people-fill me-2 ${activeTab === 'children-details' ? '' : 'text-primary'}`}></i>Children Details
                </button>
              </li>
            )}
            {showFamilyDetails && (
              <li className="nav-item">
                <button
                  className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'family-details' ? 'active bg-primary text-white shadow' : 'bg-white text-secondary shadow-sm'}`}
                  onClick={(e) => { e.preventDefault(); setActiveTab('family-details'); }}
                >
                  <i className={`bi bi-house-door-fill me-2 ${activeTab === 'family-details' ? '' : 'text-primary'}`}></i>Family Details
                </button>
              </li>
            )}
            <li className="nav-item">
              <button
                className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'service-details' ? 'active bg-primary text-white shadow' : 'bg-white text-secondary shadow-sm'}`}
                onClick={(e) => { e.preventDefault(); handleTabClick('service-details', e); }}
              >
                <i className={`bi bi-briefcase-fill me-2 ${activeTab === 'service-details' ? '' : 'text-primary'}`}></i>Service
              </button>
            </li>
            {userType != 'staff' && (
              <li className="nav-item">
                <button
                  className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'leave-details' ? 'active bg-primary text-white shadow' : 'bg-white text-secondary shadow-sm'}`}
                  onClick={(e) => { e.preventDefault(); handleTabClick('leave-details', e); }}
                >
                  <i className={`bi bi-calendar2-minus-fill me-2 ${activeTab === 'leave-details' ? '' : 'text-primary'}`}></i>Leave
                </button>
              </li>
            )}
            <li className="nav-item">
              <button
                className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'education' ? 'active bg-primary text-white shadow' : 'bg-white text-secondary shadow-sm'}`}
                onClick={(e) => { e.preventDefault(); setActiveTab('education'); }}
              >
                <i className={`bi bi-mortarboard-fill me-2 ${activeTab === 'education' ? '' : 'text-primary'}`}></i>Education
              </button>
            </li>
            {isCorporateManager && (
              <li className="nav-item">
                <button
                  className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'remarks' ? 'active bg-primary text-white shadow' : 'bg-white text-secondary shadow-sm'}`}
                  onClick={(e) => { e.preventDefault(); handleTabClick('remarks', e); }}
                >
                  <i className={`bi bi-chat-left-text-fill me-2 ${activeTab === 'remarks' ? '' : 'text-primary'}`}></i>Remarks
                  
                </button>
              </li>
            )}
          </ul>



        </div>

        <div className="card-body px-4 py-4">
          <div className="tab-content mt-3">
            <div className={`tab-pane fade ${activeTab === 'overview' ? 'show active' : ''}`} id="overview">

              <div className="row g-4">
                <div className="col-md-4">
                  <div className="d-flex flex-column align-items-center mt-3">
                    <SecureImage
                      src={
                        staffDetails.photo ? `${globalVariables.api_url}/secure_file/staff_photos/${staffDetails.photo}`
                          : photo
                      }
                      fallbackSrc={photo}
                      alt="staff"
                      className="img-fluid mb-3 shadow-sm rounded-3 border border-2"
                      style={{ width: '150px', height: '200px', objectFit: 'cover', objectPosition: 'top', borderColor: '#e9ecef' }}
                    />
                    <button
                      className="btn btn-primary btn-sm mt-2"
                      onClick={handleEditImageChange}
                    >
                      Change Image
                    </button>
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="table-responsive rounded-4 shadow-sm border">
                    <table className="table table-bordered table-striped table-hover align-middle text-center mb-0">
        <tbody>
          <tr>
            <th>Name</th>
            <td>{staffDetails.staff_official_name}</td>
          </tr>
          <tr>
            <th>Date of Birth</th>
            <td>{convertDateFormat(staffDetails.dob)}</td>
          </tr>
          <tr>
            <th>Gender</th>
            <td>{staffDetails.gender}</td>
          </tr>
        
          <tr>
            <th>Marital Status</th>
            <td>{staffDetails.marital_status}</td>
          </tr>

          <tr>
            <th>Religion</th>
            <td>{capitalizeWords(staffDetails.religion)}</td>
          </tr>
          <tr>
            <th>Denomination</th>
            <td>{staffDetails.caste}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{staffDetails.email}</td>
          </tr>
          <tr>
            <th>Phone</th>
            <td>{staffDetails.phone_no1}</td>
          </tr>

     
          <tr>
            <th>Whatsapp No</th>
            <td>{staffDetails.whatsapp_no}</td>
          </tr>
          <tr>
            <th>Staff Type</th>
            <td>{capitalizeWords(staffDetails.staff_type)}</td>
          </tr>
          <tr>
            <th>Position Type</th>
            <td>{staffDetails.position_type}</td>
          </tr>
          <tr>
            <th>PEN No</th>
            <td>{staffDetails.pen_no}</td>
          </tr>
          <tr>
            <th>Date of Commencement</th>
            <td>{convertDateFormat(staffDetails.commencement_date)}</td>
          </tr>

          <tr>
            <th>Date of Joining</th>
            <td>{convertDateFormat(staffDetails.doj)}</td>
          </tr>

          {(staffDetails.present_address || staffDetails.present_city || staffDetails.present_district || staffDetails.present_state || staffDetails.present_pin_no) && (
  <tr>
    <th>Present Address</th>
    <td>
      {[
        staffDetails.present_address,
        staffDetails.present_place,
        staffDetails.present_city,
        staffDetails.present_district,
        staffDetails.present_state,
        staffDetails.present_pin_no
      ].filter(Boolean).join(", ")}
    </td>
  </tr>
)}

{(staffDetails.permanent_address || staffDetails.permanent_city || staffDetails.permanent_district || staffDetails.permanent_state || staffDetails.permanent_pin_no) && (
  <tr>
    <th>Permanent Address</th>
    <td>
      {[
        staffDetails.permanent_address,
        staffDetails.permanent_place,
        staffDetails.permanent_city,
        staffDetails.permanent_district,
        staffDetails.permanent_state,
        staffDetails.permanent_pin_no
      ].filter(Boolean).join(", ")}
    </td>
  </tr>
)}
        </tbody>
      </table>
                  </div>
                </div>
              </div>
            </div>

             <div className={`tab-pane fade ${activeTab === 'parish-history' ? 'show active' : ''}`} id="parish-history">
              <StaffParishHistory staffId={staff_id} />
            </div>
            {/* <div className={`tab-pane fade ${activeTab === 'promotion' ? 'show active' : ''}`} id="promotion">
              <StaffPromotionDetails staffId={staff_id} />
            </div> */}
            <div className={`tab-pane fade ${activeTab === 'cocurricular' ? 'show active' : ''}`} id="cocurricular">
              <StaffCocurricular staffId={staff_id} />
            </div> 
            <div className={`tab-pane fade ${activeTab === 'education' ? 'show active' : ''}`} id="education">
              <EducationQualification staffId={staff_id} />
            </div> 
         {/* 
  <div className={`tab-pane fade ${activeTab === 'education' ? 'show active' : ''}`} id="education">
    <EducationQualification
      staffId={staff_id}
      showModal={showQualificationModal}
      handleShowModal={handleShowModal}
      handleCloseModal={handleCloseQualificationModal}
    />
  </div> 
*/}

            <div className={`tab-pane fade ${activeTab === 'service-details' ? 'show active' : ''}`} id="service-details">
                <StaffServiceDetails staffId={staff_id} />
              </div> 
              <div className={`tab-pane fade ${activeTab === 'leave-details' ? 'show active' : ''}`} id="leave-details">
              <StaffLeaveRequest staffId={staff_id}  showModal={showQualificationModal}
                handleShowModal={handleShowModal}
                handleCloseModal={handleCloseQualificationModal}/>
            </div> 

            {/* Children Details Tab Content */}
           {showChildrenDetails && (
                <div className={`tab-pane fade ${activeTab === 'children-details' ? 'show active' : ''}`} id="children-details">
                  <StaffChildrenDetails staffId={staff_id} />
                </div>
              )}  

            {showFamilyDetails && (
              <div className={`tab-pane fade ${activeTab === 'family-details' ? 'show active' : ''}`} id="family-details">
                <StaffFamilyDetails staffId={staff_id} />
              </div>
            )}

            {isCorporateManager && (
              <div className={`tab-pane fade ${activeTab === 'remarks' ? 'show active' : ''}`} id="remarks">
                <StaffRemarks staffId={staff_id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>


  
      {/* Edit Modal */}
      <Modal show={editMode} onHide={() => setEditMode(false)} size="xl">
      {/* <Modal show={show} onHide={onHide} size="xxl"> */}
      <Modal.Header closeButton>
        <Modal.Title>Edit Staff Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
  <Form onSubmit={handleSubmit}>
    <Row>
      {/* First Column */}
      <Col md={6}>

      <Form.Group className="mb-3">
  <Form.Label>Position Type</Form.Label>
  <div>
    <Form.Check
      type="radio"
      label="Permanent"
      name="position_type"
      value="Permanent"
      checked={formData.position_type === "Permanent"}
      onChange={handleChange}
      className="d-inline-block me-3"
    />
    <Form.Check
      type="radio"
      label="Temporary"
      name="position_type"
      value="Temporary"
      checked={formData.position_type === "Temporary"}
      onChange={handleChange}
      className="d-inline-block"
    />
  </div>
</Form.Group>

{formData.position_type === "Permanent" && (
      <Form.Group className="mb-3">
        <Form.Label>
          Appointment Approved In <span className="text-danger">*</span>
        </Form.Label>
        <div>
          <Form.Check
            type="radio"
            id="scale_of_pay"
            name="appointment_approved"
            value="Scale of Pay"
            label="Scale of Pay"
            checked={formData.appointment_approved === "Scale of Pay"}
            onChange={handleChange}
           className="d-inline-block me-3"
          />
          <Form.Check
            type="radio"
            id="daily_wages"
            name="appointment_approved"
            value="Daily Wages"
            label="Daily Wages"
            checked={formData.appointment_approved === "Daily Wages"}
            onChange={handleChange}
           className="d-inline-block"
          />
        </div>
      </Form.Group>
    )}



        <Form.Group className="mb-3">
          <Form.Label>Staff Official Name</Form.Label>
          <Form.Control
            type="text"
            name="staff_official_name"
            value={formData.staff_official_name || ''}
            onChange={handleChange}
            isInvalid={!!formError.staff_official_name}
          />
          <Form.Control.Feedback type="invalid">
            {formError.staff_official_name}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date of Birth</Form.Label>
          <Form.Control
            type="date"
            name="dob"
            value={formData.dob || ''}
            onChange={handleChange}
            isInvalid={!!formError.dob}
            max={new Date().toISOString().split('T')[0]}
          />
          <Form.Control.Feedback type="invalid">
            {formError.dob}
          </Form.Control.Feedback>
        </Form.Group>


        <Form.Group className="mb-3">
  <Form.Label>Date of Commencement</Form.Label>
  <Form.Control
    type="date"
    name="commencement_date"
    value={formData.commencement_date || ''}
    onChange={handleChange}
    isInvalid={!!formError.commencement_date}
    max={new Date().toISOString().split('T')[0]}
  />
  <Form.Control.Feedback type="invalid">
    {formError.commencement_date}
  </Form.Control.Feedback>
</Form.Group>



<Form.Group className="mb-3">
  <Form.Label>Date of Joining</Form.Label>
  <Form.Control
    type="date"
    name="doj"
    value={formData.doj || ''}
    onChange={handleChange}
    isInvalid={!!formError.doj}
    max={new Date().toISOString().split('T')[0]}
  />
  <Form.Control.Feedback type="invalid">
    {formError.doj}
  </Form.Control.Feedback>
</Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Gender</Form.Label>
          <Form.Select
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            isInvalid={!!formError.gender}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {formError.gender}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            isInvalid={!!formError.email}
          />
          <Form.Control.Feedback type="invalid">
            {formError.email}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Marital Status</Form.Label>
          <Form.Select
            name="marital_status"
            value={formData.marital_status || ''}
            onChange={handleChange}
            isInvalid={!!formError.marital_status}
          >
            <option value="">Select Marital Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Priest">Priest</option>
            <option value="Sister">Sister</option>
        
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {formError.marital_status}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
  <Form.Label>Staff Type</Form.Label>
  <Form.Select
    name="staff_type"
    value={formData.staff_type || ''}
    onChange={handleChange}
    isInvalid={!!formError.staff_type}
  >
    <option value="">Select Staff Type</option>
    <option value="teaching">Teaching Staff</option>
    <option value="non_teaching">Non-Teaching Staff</option> {/* Update here */}
  </Form.Select>
  <Form.Control.Feedback type="invalid">
    {formError.staff_type}
  </Form.Control.Feedback>
</Form.Group>



        <Form.Group className="mb-3">
          <Form.Label>Present Address</Form.Label>
          <Form.Control
            type="text"
            name="present_address"
            value={formData.present_address || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Present Place</Form.Label>
          <Form.Control
            type="text"
            name="present_place"
            value={formData.present_place || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Present City</Form.Label>
          <Form.Control
            type="text"
            name="present_city"
            value={formData.present_city || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Present District</Form.Label>
          <Form.Control
            type="text"
            name="present_district"
            value={formData.present_district || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Present State</Form.Label>
          <Form.Control
            type="text"
            name="present_state"
            value={formData.present_state || ''}
            onChange={handleChange}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Present PIN</Form.Label>
          <Form.Control
            type="text"
            name="present_pin_no"
            value={formData.present_pin_no || ''}
            onChange={handleChange}
          />
        </Form.Group>
      </Col>

      {/* Second Column */}
      <Col md={6}>
       


        <Form.Group className="mb-3">
          <Form.Label>Permanent Address</Form.Label>
          <Form.Control
            type="text"
            name="permanent_address"
            value={formData.permanent_address || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Permanent Place</Form.Label>
          <Form.Control
            type="text"
            name="permanent_place"
            value={formData.permanent_place || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Permanent City</Form.Label>
          <Form.Control
            type="text"
            name="permanent_city"
            value={formData.permanent_city || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Permanent District</Form.Label>
          <Form.Control
            type="text"
            name="permanent_district"
            value={formData.permanent_district || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Permanent State</Form.Label>
          <Form.Control
            type="text"
            name="permanent_state"
            value={formData.permanent_state || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Permanent PIN</Form.Label>
          <Form.Control
            type="text"
            name="permanent_pin_no"
            value={formData.permanent_pin_no || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Religion</Form.Label>
          <Form.Select
            name="religion"
            value={formData.religion || ''}
            onChange={handleChange}
          >
            <option value="">Select Religion</option>
            {['christian', 'hindu', 'muslim'].map((religion) => (
              <option key={religion} value={religion}>
                {religion}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

    <Form.Group className="mb-3">
          <Form.Label>Denomination</Form.Label>
          <Form.Select
            name="caste"
            value={formData.caste || ''}
            onChange={handleChange}
            disabled={!formData.religion}
          >
            <option value="">Select Denomination</option>
            {formData.religion &&
              religionCasteSubcaste[formData.religion] &&
              religionCasteSubcaste[formData.religion].map((caste) => (
                <option key={caste} value={caste}>
                  {caste}
                </option>
              ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Subcaste</Form.Label>
          <Form.Select
            name="subcaste"
            value={formData.subcaste || ''}
            onChange={handleChange}
          >
            <option value="">Select Subcaste</option>
            <option value="General">General</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
           
            <option value="OBC">OBC</option>
            <option value="OEC">OEC</option>
          </Form.Select>
        </Form.Group>


        <Form.Group className="mb-3">
          <Form.Label>Phone Number 1</Form.Label>
          <Form.Control
            type="text"
            name="phone_no1"
            value={formData.phone_no1 || ''}
            onChange={handleChange}
            isInvalid={!!formError.phone_no1}
          />
          <Form.Control.Feedback type="invalid">
            {formError.phone_no1}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number 2</Form.Label>
          <Form.Control
            type="text"
            name="phone_no2"
            value={formData.phone_no2 || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>WhatsApp Number</Form.Label>
          <Form.Control
            type="text"
            name="whatsapp_no"
            value={formData.whatsapp_no || ''}
            onChange={handleChange}
          />
        </Form.Group>

        

        <Form.Group className="mb-3">
          <Form.Label>PEN Number</Form.Label>
          <Form.Control
            type="text"
            name="pen_no"
            value={formData.pen_no || ''}
            onChange={handleChange}
          />
        </Form.Group>
      </Col>
    </Row>
  </Form>
</Modal.Body>

      <Modal.Footer>
        {/* <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button> */}
        
          <button className="btn btn-success" onClick={handleSubmit} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Update'}
          </button>
          <button className="btn btn-danger" onClick={() => setEditMode(false)}>Close</button>
      </Modal.Footer>
    </Modal>
  
      {/* Change Password Modal */}
      <Modal show={changePasswordModal} onHide={() => setChangePasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                className="form-control"
                name="new_password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setChangePasswordModal(false)}>Close</button>
          <button className="btn btn-primary" onClick={handlePasswordChange}>Change Password</button>
        </Modal.Footer>
      </Modal>
  

      <Modal show={cropModalIsOpen} onHide={() => setCropModalIsOpen(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Crop Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentEditingStaff && (
            <ImageCropper
              updateAvatar={(croppedImage) => handleImageUpdate(croppedImage)}
              closeModal={() => setCropModalIsOpen(false)}
            />
          )}
        </Modal.Body>
      </Modal>







      {/* Change Image Modal */}
      <Modal show={changeImageModal} onHide={() => setChangeImageModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Staff Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage ? (
            <img 
              src={selectedImage} 
              alt="Selected Staff Image" 
              className="img-fluid mb-3"
            />
          ) : (
            staffDetails.photo && (
              <SecureImage 
                src={`${globalVariables.api_url}/secure_file/staff_photos/${staffDetails.photo}`} 
                fallbackSrc={photo}
                alt="Current Staff Image" 
                className="img-fluid mb-3"
              />
            )
          )}
          <input
            type="file"
            className="form-control"
            onChange={handleImageChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-success me-2" onClick={() => handleImageUpdate(newImage)}>Update Image</button>
          <button className="btn btn-danger" onClick={() => setChangeImageModal(false)}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </>
  );
  };
  
  export default StaffDetails;
