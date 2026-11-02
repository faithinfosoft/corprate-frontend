import React, { useState, useEffect, useCallback,useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Breadcum from './Breadcum.js';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";
import 'react-image-crop/dist/ReactCrop.css';
import useAuth from '../utilities/useAuth';
import ImageCropper from './ImageCropper';
import photo from "../assets/ui-master/img/no_image_uploaded.jpg";
import SchoolStaff from './SchoolStaff';

const SchoolProfile = () => {
  const auth = useAuth();
 const username = auth.user.username;
 const school_id= auth.user.user_id;
 //const username = 'joseph@gmail.com';
 console.log('User object in School component:', auth.user);
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ new_password: '', confirm_password: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [zones, setZones] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [selectedForane, setSelectedForane] = useState('');
  const [parishesConvents, setParishesConvents] = useState([]);
  const [foranes, setForanes] = useState([]);
  const [changeImageModal, setChangeImageModal] = useState(false);
  const [newImage, setNewImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  // const { school_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [cropModalIsOpen, setCropModalIsOpen] = useState(false);
  const [currentEditingSchool, setCurrentEditingSchool] = useState(null);
  const avatarUrl = useRef(photo);

  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    // { Title: 'School', Link: '/school' },
    { Title: 'School Profile', Link: '' },
  ]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveTab(hash);
      }
    };

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    // Handle initial load
    handleHashChange();

    // Cleanup listener
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleTabClick = (tabName, e) => {
    e.preventDefault();
    setActiveTab(tabName);
    navigate(`#${tabName}`, { replace: true });
  };



  const validateForm = () => {
    let errors = {};
    if (formData.school_code !== schoolDetails.school_code && !formData.school_code) errors.school_code = "School code is required";
    if (!formData.school_name) errors.school_name = "School name is required";
    if (!formData.location) errors.location = "Location is required";
    if (!formData.address) errors.address = "Address is required";
    if (formData.email !== schoolDetails.email) {
      if (!formData.email) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    }
    if (formData.phone !== schoolDetails.phone) {
      if (!formData.phone) errors.phone = "Phone number is required";
      else if (!/^\d{10}$/.test(formData.phone)) errors.phone = "Phone number must be 10 digits";
    }
    if (!formData.district) errors.district = "District is required";
    if (!formData.fk_zone_id) errors.fk_zone_id = "Zone is required";
    if (!formData.established_year) errors.established_year = "Established year is required";
    if (!formData.school_gender_type) errors.school_gender_type = "School gender type is required";
    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({});
    setFormError({});
  };

  const resetPasswordModal = () => {
    setPasswordData({ new_password: '', confirm_password: '' });
    setFormError({});
    setChangePasswordModal(false);
  };

  const openEditModal = () => {
    resetForm();  // Reset form and errors when opening the modal
    setEditMode(true);
  };

  const closeEditModal = () => {
    resetForm();  // Reset form and errors when closing the modal
    setEditMode(false);
  };




  const fetchSchoolDetails = useCallback(async () => {
    try {
      const formData = {
        username: username, // Replace this with the actual username variable
        schoolid: school_id
      };
  
      const response = await axios.post(`${globalVariables.api_url}/school/schooldetails_by_email`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
  
      if (response.data.status) {
        setSchoolDetails(response.data.data);
        setFormData({
          ...response.data.data,
          lp: response.data.data.lp === '1',
          up: response.data.data.up === '1',
          hs: response.data.data.hs === '1',
          hse: response.data.data.hse === '1'
        });
        setSelectedType(response.data.data.fk_parish_covent_id ? 'parish' : 'convent');
  
        if (response.data.data.fk_parish_covent_id) {
          fetchParishConventDetails(response.data.data.fk_parish_covent_id);
        }
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error fetching school details:', error);
      print_toast("error", "Failed to fetch school details");
    }
  }, [username]);
  
  

  const fetchParishConventDetails = async (id) => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_parish_convent_details/${id}`);
      if (response.data) {
        setParishesConvents(response.data);
        if (response.data.type === 'parish') {
          setSelectedForane(response.data.forane_id);
          fetchForanes();
        }
      }
    } catch (error) {
      console.error('Error fetching parish/convent details:', error);
    }
  };

  const fetchForanes = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/forane/view_forane`);
      setForanes(response.data.data);
    } catch (error) {
      console.error('Error fetching foranes:', error);
    }
  };


  useEffect(() => {
   
    fetchSchoolDetails();
    fetchZones();
    fetchDistricts();
  }, [fetchSchoolDetails]);

  useEffect(() => {
    if (editMode && schoolDetails) {
      setFormData({
        school_code: schoolDetails.school_code,
        school_name: schoolDetails.school_name,
        location: schoolDetails.location,
        address: schoolDetails.address,
        email: schoolDetails.email,
        phone: schoolDetails.phone,
        district: schoolDetails.district,
        fk_zone_id: schoolDetails.fk_zone_id,
        established_year: schoolDetails.established_year,
        school_gender_type: schoolDetails.school_gender_type,
        lp: schoolDetails.lp === '1',
        up: schoolDetails.up === '1',
        hs: schoolDetails.hs === '1',
        hse: schoolDetails.hse === '1',
        type: parishesConvents.type || '',
        fk_parish_covent_id: parishesConvents.id || '',  // Assuming parishesConvents has id
      });
      setSelectedType(parishesConvents.type || '');
      setSelectedForane(parishesConvents.forane_id || '');
    }
  }, [editMode, schoolDetails, parishesConvents]);

  useEffect(() => {
    if (editMode && schoolDetails) {
      setFormData({
        ...schoolDetails,
        lp: schoolDetails.lp === '1',
        up: schoolDetails.up === '1',
        hs: schoolDetails.hs === '1',
        hse: schoolDetails.hse === '1'
      });
    }
  }, [editMode, schoolDetails]);


  const fetchZones = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_zones`);
      
      if (response.data.status) {
        setZones(response.data.data); // Access the array from the response
      } else {
        setZones([]); // Handle the case where no zones are found
      }
    } catch (error) {
      console.error('Error fetching zones:', error.message);
    }
  };

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_districts`);
      
      if (response.data.status) {
        setDistricts(response.data.data); // Access the array from the response
      } else {
        setDistricts([]); // Handle the case where no districts are found
      }
    } catch (error) {
      console.error('Error fetching districts:', error.message);
    }
  };

  const fetchParishesConvents = async (type, foraneId = '') => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_parishes_convents`, {
        params: { type, forane_id: foraneId }
      });
      setParishesConvents(response.data);
    } catch (error) {
      console.error('Error fetching parishes/convents:', error);
    }
  };

  const handleEditImageChange = () => {
    setCurrentEditingSchool(schoolDetails);
    setCropModalIsOpen(true);
  };

  const handleEditImageUpdate = async (croppedImage) => {
    try {
      const formData = new FormData();
      formData.append('school_id', school_id);
      formData.append('username', username); // Add username to the form data
      formData.append('photo', croppedImage);

      const response = await axios.post(`${globalVariables.api_url}/school/schoolprofile/update_profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status) {
        print_toast('success', 'School photo updated successfully');
        fetchSchoolDetails();
      } else {
        print_toast('error', response.data.message || 'Failed to update school photo');
      }
    } catch (error) {
      console.error('Error updating school photo:', error);
      print_toast('error', 'Failed to update school photo');
    } finally {
      setCropModalIsOpen(false);
      setCurrentEditingSchool(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTypeChange = async (e) => {
    const type = e.target.value;
    setSelectedType(type);
    setSelectedForane('');
    setFormData(prevData => ({ ...prevData, fk_parish_covent_id: '' }));

    if (type === 'parish') {
      fetchForanes();
    } else if (type === 'convent') {
      fetchParishesConvents('convent');
    }
  };

  const handleForaneChange = async (e) => {
    const foraneId = e.target.value;
    setSelectedForane(foraneId);
    fetchParishesConvents('parish', foraneId);
  };

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setNewImage(file);  // Store the selected file for form submission
  //     setSelectedImage(URL.createObjectURL(file));  // Create a temporary URL for image preview
  //   }
  // };



  const updateAvatar = (imgSrc, file) => {
    avatarUrl.current = imgSrc;
    // handleImageUpdate(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUpdating(true);
    const formDataToSend = new FormData();

    // Only include fields that have changed
    for (const key in formData) {
      if (formData[key] !== schoolDetails[key]) {
        if (key === 'photo') {
          if (formData[key]) formDataToSend.append(key, formData[key]);
        } else if (['phone', 'established_year', 'fk_zone_id', 'fk_parish_covent_id'].includes(key)) {
          formDataToSend.append(key, Number(formData[key]));
        } else if (['lp', 'up', 'hs', 'hse'].includes(key)) {
          formDataToSend.append(key, formData[key] ? '1' : '0');
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    }

    // Always include the school_id
    formDataToSend.append('school_id', schoolDetails.school_id);

    try {
      const response = await axios.post(`${globalVariables.api_url}/school/schoolprofile/updateprofile`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status) {
        print_toast("success", "School updated successfully");
        setEditMode(false);
        fetchSchoolDetails();
      } else {
        // Handle validation errors
        if (response.data.error) {
          const errors = response.data.error;
          let updatedErrors = {};

          for (const key in errors) {
            // Only keep errors for fields that we're actually trying to update
            if (formDataToSend.has(key)) {
              updatedErrors[key] = errors[key];
            }
          }

          if (Object.keys(updatedErrors).length > 0) {
            setFormError(updatedErrors);
            print_toast("error", "Please correct the errors in the form.");
          } else {
            // If all errors were for unchanged fields, consider it a success
            print_toast("success", "School updated successfully");
            setEditMode(false);
            fetchSchoolDetails();
          }
        } else {
          print_toast("error", response.data.message);
        }
      }
    } catch (error) {
      console.error('Error updating school:', error);
      print_toast("error", "Failed to update school");
    } finally {
      setIsUpdating(false);
    }
  };


  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      try {
        const response = await axios.post(`${globalVariables.api_url}/school/schooldetails/delete`, { school_id: school_id });
        if (response.data.status) {
          print_toast("success", response.data.message);
          navigate('/school');
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error('Error deleting school:', error);
        print_toast("error", "Failed to delete school");
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    let errors = {};
  
    // Validate password fields
    if (!passwordData.new_password) errors.new_password = "New password is required";
    if (!passwordData.confirm_password) errors.confirm_password = "Confirm password is required";
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }
  
    // Set form errors and return if there are any
    setFormError(errors);
    if (Object.keys(errors).length > 0) return;
  
    setIsUpdating(true);
    try {
      // Log the school ID and new password for debugging
      console.log('Sending request with:', {
        school_id: school_id,
        new_password: passwordData.new_password,
        username: username
      });
  
      const response = await axios.post(`${globalVariables.api_url}/school/schooldetails/change_password`, {
        school_id: school_id, // Ensure this is defined
        new_password: passwordData.new_password, // Ensure this is defined
        username: username // Adding the username as per previous request
      });
  
      if (response.data.status) {
        print_toast("success", response.data.message);
        resetPasswordModal(); // Reset the modal when password update is successful
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      print_toast("error", "Failed to change password");
    } finally {
      setIsUpdating(false);
    }
  };
  

  if (!schoolDetails) {
    return <div>Loading...</div>;
  }




  // ... (keep other existing functions)

  return (
    <>
      <div>
        <Breadcum items={breadcum} title={schoolDetails.school_name} />

      <div className="card">
        {/* Tabs with School Name and Actions in Header */}
        <div className="card-header d-flex justify-content-between align-items-center">
          {/* Tab Navigation */}
          <ul className="nav nav-tabs">
            {/* School Name Tab (active by default) */}
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={(e) => handleTabClick('overview', e)}
                href="#overview"
              >
                {schoolDetails.school_name}
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'stafftab' ? 'active' : ''}`}
                onClick={(e) => handleTabClick('stafftab', e)}
                href="#stafftab"
              >
                Staff
              </a>
            </li>
            {/* Tab 1 */}
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'tab1' ? 'active' : ''}`}
                onClick={() => setActiveTab('tab1')}
                href="#tab1"
              >
                Class Details
              </a>
            </li>
            {/* Tab 2 */}
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'tab2' ? 'active' : ''}`}
                onClick={() => setActiveTab('tab2')}
                href="#tab2"
              >
                Infrastructure
              </a>
            </li>
          </ul>

          {/* Conditionally render the More Actions dropdown only on the school tab */}
          {activeTab === 'overview' && (
            <Dropdown>
              <Dropdown.Toggle variant="btn btn-primary" id="dropdown-basic">
                More Actions
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {/* <Dropdown.Item onClick={() => openEditModal(true)}>Edit</Dropdown.Item> */}
                <Dropdown.Item onClick={handleDelete}>Delete</Dropdown.Item>
                <Dropdown.Item onClick={() => setChangePasswordModal(true)}>
                  Change Password
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

        {/* Tab Content */}
        <div className="card-body">
          <div className="tab-content mt-3">
            {/* Overview / School Details Tab */}
            <div className={`tab-pane fade ${activeTab === 'overview' ? 'show active' : ''}`} id="overview">
            {activeTab === 'overview' && (
              <div className="section profile">
                <div className="row">
                  {/* Left Section: School Photo and Image Actions */}
                  <div className="col-xl-4">
                    <div class="card">
                      <div class="card-body profile-card pt-4 d-flex flex-column align-items-center">
                      <img
                        src={schoolDetails.photo
                          ? `${globalVariables.api_url}/uploads/school_photos/${schoolDetails.photo}`
                          : photo}
                        alt="School"
                        className="img-fluid mb-3"
                      />
                      <button
                        className="btn btn-primary btn-sm mt-2"
                        onClick={handleEditImageChange}
                      >
                        Change Image
                      </button>
                    </div>
                    </div>
                  </div>

                  {/* Right Section: School Details */}
                  <div className="col-xl-8">
                    <div class="card">
                    <div className="card-body pt-3">
                      <div className="tab-content pt-2">
                        <div className="tab-pane fade show active profile-overview" id="overview">
                          {/* <h5 className="card-title">School Details</h5> */}

                          {/* School Details Rows */}
                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">School Code</div>
                            <div className="col-lg-9 col-md-8">{schoolDetails.school_code}</div>
                          </div>

                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">Location</div>
                            <div className="col-lg-9 col-md-8">{schoolDetails.location}</div>
                          </div>

                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">Address</div>
                            <div className="col-lg-9 col-md-8">{schoolDetails.address}</div>
                          </div>

                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">Email</div>
                            <div className="col-lg-9 col-md-8">{schoolDetails.email}</div>
                          </div>

                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">Phone</div>
                            <div className="col-lg-9 col-md-8">{schoolDetails.phone}</div>
                          </div>

                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">District</div>
                            <div className="col-lg-9 col-md-8">{schoolDetails.district}</div>
                          </div>

                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">Zone</div>
                            <div className="col-lg-9 col-md-8">
                              {zones.find((z) => z.zone_id === schoolDetails.fk_zone_id)?.zone_name}
                            </div>
                          </div>

                          {parishesConvents && (
                            <>
                              {parishesConvents.type === 'parish' && (
                                <>
                                  <div className="row">
                                    <div className="col-lg-3 col-md-4 label">Forane Name</div>
                                    <div className="col-lg-9 col-md-8">{parishesConvents.forane_name}</div>
                                  </div>
                                  <div className="row">
                                    <div className="col-lg-3 col-md-4 label">Parish Name</div>
                                    <div className="col-lg-9 col-md-8">{parishesConvents.parish_name}</div>
                                  </div>
                                </>
                              )}
                              {parishesConvents.type === 'convent' && (
                                <div className="row">
                                  <div className="col-lg-3 col-md-4 label">Convent Name</div>
                                  <div className="col-lg-9 col-md-8">{parishesConvents.parish_name}</div>
                                </div>
                              )}
                            </>
                          )}

                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">Established Year</div>
                            <div className="col-lg-9 col-md-8">{schoolDetails.established_year}</div>
                          </div>

                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">Gender Type</div>
                            <div className="col-lg-9 col-md-8">{schoolDetails.school_gender_type}</div>
                          </div>

                          <div className="row">
                            <div className="col-lg-3 col-md-4 label">School Types</div>
                            <div className="col-lg-9 col-md-8">
                              {[
                                schoolDetails.lp === '1' ? 'LP' : null,
                                schoolDetails.up === '1' ? 'UP' : null,
                                schoolDetails.hs === '1' ? 'HS' : null,
                                schoolDetails.hse === '1' ? 'HSE' : null,
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </div>
                          </div>

                          <button
                            className="btn btn-primary btn-sm mt-3"
                            onClick={openEditModal}
                          >
                            Edit Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
               )}
            </div>

            <div className={`tab-pane fade ${activeTab === 'stafftab' ? 'show active' : ''}`} id="stafftab">
              {activeTab === 'stafftab' && <SchoolStaff school_id={school_id} />}
            </div>

            {/* Tab 1 Content */}
            <div className={`tab-pane fade ${activeTab === 'tab1' ? 'show active' : ''}`} id="tab1">
              <h3>Tab 1 Content</h3>
              <p>This is where you can add content for Tab 1.</p>
            </div>

            {/* Tab 2 Content */} 
            <div className={`tab-pane fade ${activeTab === 'tab2' ? 'show active' : ''}`} id="tab2">
              <h3>Tab 2 Content</h3>
              <p>This is where you can add content for Tab 2.</p>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Edit Modal */}
      <Modal show={editMode} onHide={closeEditModal} size="xxl">
  <Modal.Header closeButton>
    <Modal.Title>Edit School</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={handleSubmit}>
      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="fk_zone_id">
            Zone <span className="text-danger">*</span>
          </label>
          <select
            className="form-control"
            id="fk_zone_id"
            name="fk_zone_id"
            value={formData.fk_zone_id || ''}
            onChange={handleChange}
          >
            <option value="">Select Zone</option>
            {zones.map(zone => (
              <option key={zone.zone_id} value={zone.zone_id}>{zone.zone_name}</option>
            ))}
          </select>
          {formError.fk_zone_id && <div className="text-danger">{formError.fk_zone_id}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="email">
            Email <span className="text-danger">*</span>
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
          />
          {formError.email && <div className="text-danger">{formError.email}</div>}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="district">
            District <span className="text-danger">*</span>
          </label>
          <select
            className="form-control"
            id="district"
            name="district"
            value={formData.district || ''}
            onChange={handleChange}
          >
            <option value="">Select District</option>
            {districts.map((district, index) => (
              <option key={index} value={district}>{district}</option>
            ))}
          </select>
          {formError.district && <div className="text-danger">{formError.district}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="phone">
            Phone <span className="text-danger">*</span>
          </label>
          <input
            type="tel"
            className="form-control"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
          />
          {formError.phone && <div className="text-danger">{formError.phone}</div>}
        </div>
      </div>

      {/* <div className="row mb-3">
        <div className="col-md-6">
          <label>Type <span className="text-danger">*</span></label>
          <div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="type"
                id="typeParish"
                value="parish"
                checked={formData.type === 'parish'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeParish">Parish</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="type"
                id="typeConvent"
                value="convent"
                checked={formData.type === 'convent'}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="typeConvent">Convent</label>
            </div>
          </div>
          {formError.type && <div className="text-danger">{formError.type}</div>}
        </div>
        <div className="col-md-6">
          <label htmlFor="established_year">
            Established Year <span className="text-danger">*</span>
          </label>
          <input
            type="number"
            className="form-control"
            id="established_year"
            name="established_year"
            value={formData.established_year || ''}
            onChange={handleChange}
          />
          {formError.established_year && <div className="text-danger">{formError.established_year}</div>}
        </div>
      </div>

      {formData.type === 'parish' && (
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="forane_id">
              Forane <span className="text-danger">*</span>
            </label>
            <select
              className="form-control"
              id="forane_id"
              name="forane_id"
              value={formData.forane_id || ''}
              onChange={handleChange}
            >
              <option value="">Select Forane</option>
              {foranes.map(forane => (
                <option key={forane.forane_id} value={forane.forane_id}>{forane.forane_name}</option>
              ))}
            </select>
            {formError.forane_id && <div className="text-danger">{formError.forane_id}</div>}
          </div>
          <div className="col-md-6">
            <label htmlFor="school_gender_type">
              School Gender Type <span className="text-danger">*</span>
            </label>
            <select
              className="form-control"
              id="school_gender_type"
              name="school_gender_type"
              value={formData.school_gender_type || ''}
              onChange={handleChange}
            >
              <option value="">Select Gender Type</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="boys and girls">Boys and Girls</option>
            </select>
            {formError.school_gender_type && <div className="text-danger">{formError.school_gender_type}</div>}
          </div>
        </div>
      )} */}

      {formData.type === 'parish' && formData.forane_id && (
        <div className="row mb-3">
          {/* <div className="col-md-6">
            <label htmlFor="fk_parish_covent_id">
              Parish <span className="text-danger">*</span>
            </label>
            <select
              className="form-control"
              id="fk_parish_covent_id"
              name="fk_parish_covent_id"
              value={formData.fk_parish_covent_id || ''}
              onChange={handleChange}
            >
              <option value="">Select Parish</option>
              {Array.isArray(parishesConvents) && parishesConvents.map(parish => (
                <option key={parish.parish_id} value={parish.parish_id}>{parish.parish_name}</option>
              ))}
            </select>
            {formError.fk_parish_covent_id && <div className="text-danger">{formError.fk_parish_covent_id}</div>}
          </div> */}
          <div className="col-md-6">
            <label>School Type <span className="text-danger">*</span></label>
            <div>
              {['lp', 'up', 'hs', 'hse'].map(type => (
                <div className="form-check form-check-inline" key={type}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={type}
                    name={type}
                    checked={formData[type] || false}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor={type}>
                    {type.toUpperCase()}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {formData.type === 'convent' && (
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="school_code">
              School Code <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="school_code"
              name="school_code"
              value={formData.school_code || ''}
              onChange={handleChange}
            />
            {formError.school_code && <div className="text-danger">{formError.school_code}</div>}
          </div>
          <div className="col-md-6">
            <label htmlFor="school_gender_type">
              School Gender Type <span className="text-danger">*</span>
            </label>
            <select
              className="form-control"
              id="school_gender_type"
              name="school_gender_type"
              value={formData.school_gender_type || ''}
              onChange={handleChange}
            >
              <option value="">Select Gender Type</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="boys and girls">Boys and Girls</option>
            </select>
            {formError.school_gender_type && <div className="text-danger">{formError.school_gender_type}</div>}
          </div>
        </div>
      )}

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="school_name">
            School Name <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="school_name"
            name="school_name"
            value={formData.school_name || ''}
            onChange={handleChange}
          />
          {formError.school_name && <div className="text-danger">{formError.school_name}</div>}
        </div>
        {/* <div className="col-md-6">
          <label htmlFor="password">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password || ''}
            onChange={handleChange}
          />
          {formError.password && <div className="text-danger">{formError.password}</div>}
        </div> */}
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="address">
            Address <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            rows="3"
          ></textarea>
          {formError.address && <div className="text-danger">{formError.address}</div>}
        </div>
        <div className="col-md-6">
          <label>School Type <span className="text-danger">*</span></label>
          <div>
            {['lp', 'up', 'hs', 'hse'].map(type => (
              <div className="form-check form-check-inline" key={type}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={type}
                  name={type}
                  checked={formData[type] || false}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor={type}>
                  {type.toUpperCase()}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label htmlFor="location">
            Location <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
          />
          {formError.location && <div className="text-danger">{formError.location}</div>}
        </div>
      </div>

      <div className="d-flex justify-content-end">
        <button type="submit" className="btn btn-success me-2" disabled={isUpdating}>
          {isUpdating ? 'Updating...' : 'Update'}
        </button>
        <button type="button" className="btn btn-danger" onClick={closeEditModal}>
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
          {currentEditingSchool && (
            <ImageCropper
              updateAvatar={(croppedImage) => handleEditImageUpdate(croppedImage)}
              closeModal={() => setCropModalIsOpen(false)}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={changePasswordModal} onHide={resetPasswordModal}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-3">
              <label htmlFor="new_password" className="form-label">
                New Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control" // Removed is-invalid class logic
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}

              />
              {formError.new_password && <div className="text-danger">{formError.new_password}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="confirm_password" className="form-label">
                Confirm New Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control" // Removed is-invalid class logic
                id="confirm_password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}

              />
              {formError.confirm_password && <div className="text-danger">{formError.confirm_password}</div>}
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-success me-2" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
              <button type="button" className="btn btn-danger" onClick={resetPasswordModal}>
                Cancel
              </button>
            </div>

          </form>
        </Modal.Body>
      </Modal>

    </>
  );
};

export default SchoolProfile;