import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcum from './Breadcum.js';
import Modal from 'react-bootstrap/Modal';
import { Button, Form, Row, Col } from 'react-bootstrap';
import Dropdown from 'react-bootstrap/Dropdown';
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";
import { useLocation } from 'react-router-dom';
import photo from "../assets/ui-master/img/no_image_uploaded.jpg";
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper from './ImageCropperCandicate';
  import StaffParishHistory from './RetiredStaffParishHistory';
 import StaffServiceDetails from './RetiredStaffServiceDetails';
 import { convertDateFormat } from '../utilities/dateconverter';
 import { capitalizeWords } from '../utilities/dateconverter';
import useAuth from "../utilities/useAuth";


const RetiredStaffDetails = () => {
  const auth = useAuth();
  const userType = auth.user.user_type; // Get the user type
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ new_password: '', confirm_password: '' });
  const [activeTab, setActiveTab] = useState('overview');
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
  
  


  const resetForm = () => {
    setFormData({});
    setFormError({});
  };

  

  useEffect(() => {
    // Handle initial load and subsequent hash changes
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveTab(hash);
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
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };


const handleTabClick = (tabName, e) => {
  e.preventDefault();
  setActiveTab(tabName);
  window.location.hash = tabName;
};

  const fetchStaffDetails = useCallback(async () => {
    try {
     const response = await axios.get(
  `${globalVariables.api_url}/retiredstaff/get-retired-staff-by-id`,
  { params: { staff_id: staff_id } } 
);
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
    formData.append('staff_id', staff_id);
    formData.append('photo', croppedImage);

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
    print_toast('error', 'Failed to update staff photo');
  } finally {
    setCropModalIsOpen(false);
    setCurrentEditingStaff(null);
  }
};


const handleSubmit = async (e) => {
    e.preventDefault();
   // if (!validateForm()) return;
  
    setIsUpdating(true);
    
    // Clear previous errors
    setFormError({});
    
    const formDataToSend = new FormData();
  
    // Append all form data (not just changed fields)
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    }
    
    formDataToSend.append('staff_id', staff_id);
   // formDataToSend.append('school_id', staffDetails.school_id);
  
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/retiredstaff/update`,
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
        // Switch to overview tab after successful update
        setActiveTab('overview');
        window.location.hash = 'overview';
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
      if (error.response && error.response.data && error.response.data.error) {
        setFormError(error.response.data.error);
        print_toast("error", "Please correct the errors in the form.");
      } else {
        print_toast("error", "Failed to update staff");
      }
    } finally {
      setIsUpdating(false);
    }
  };
  const handleSubmit1 = async (e) => {
    e.preventDefault();
   // if (!validateForm()) return;
  
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
   
    	
  
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/retiredstaff/update`,
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
      <Breadcum items={breadcum} title={staffDetails.staff_official_name} />

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={(e) => handleTabClick('overview', e)}
                href="#overview"
              >
                {staffDetails.staff_official_name}
              </a>
            </li>

      

            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'parish-history' ? 'active' : ''}`}
                onClick={() => setActiveTab('parish-history')}
                href="#parish-history"
              >
                Parish History
              </a>
            </li> 
           {/*} <li className="nav-item">
              <a
                className={`nav-link ${activeTab === 'education' ? 'active' : ''}`}
                onClick={() => setActiveTab('education')}
                href="#education"
              >
                Qualification
              </a>
            </li>*/}
            

      


<li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'service-details' ? 'active' : ''}`}
                  onClick={(e) => handleTabClick('service-details', e)}
                  href="#service-details"
                >
                  Service 
                </a>
              </li>

             
            </ul>

       

        </div>

        <div className="card-body">
          <div className="tab-content mt-3">
            <div className={`tab-pane fade ${activeTab === 'overview' ? 'show active' : ''}`} id="overview">
            <div className="d-flex justify-content-end mb-2">
          {activeTab === 'overview' &&(
          
            <Dropdown>
              <Dropdown.Toggle variant="btn btn-primary" id="dropdown-basic">
                More Actions
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setEditMode(true)}>Edit</Dropdown.Item>
                {userType != 'staff' && (       
  <>
                <Dropdown.Item onClick={handleDelete}>Delete</Dropdown.Item>
              
                </>
                )}
              </Dropdown.Menu>
            </Dropdown>
        
          )}
</div>
              <div className="row">
                <div className="col-md-4">
               
<div className="d-flex flex-column align-items-center">
<img
  src={
    staffDetails.photo ? `${globalVariables.img_url}/uploads/staff_photos/${staffDetails.photo}`
      : photo
  }
  alt="staff"
  className="img-fluid mb-3"
/>
{ userType != 'staff' && (
  <button
    className="btn btn-primary btn-sm mt-2"
    onClick={handleEditImageChange}
  >
    Change Image
  </button>
)}
</div>

                  
                </div>

                <div className="col-md-8">

                <table className="table table-bordered table-striped">
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
            <th>Caste</th>
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
            <th>PEN No</th>
            <td>{staffDetails.pen_no}</td>
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

             <div className={`tab-pane fade ${activeTab === 'parish-history' ? 'show active' : ''}`} id="parish-history">
              <StaffParishHistory staffId={staff_id} />
            </div>
   

            <div className={`tab-pane fade ${activeTab === 'service-details' ? 'show active' : ''}`} id="service-details">
                <StaffServiceDetails staffId={staff_id} />
              </div> 
       

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
    disabled={!formData.religion || !religionCasteSubcaste[formData.religion]}
  >
    <option value="">Select Denomination</option>
    {formData.religion && religionCasteSubcaste[formData.religion] 
      ? religionCasteSubcaste[formData.religion].map((caste) => (
          <option key={caste} value={caste}>
            {caste}
          </option>
        ))
      : null
    }
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
              <img 
                src={`${globalVariables.api_url}/uploads/staff_photos/${staffDetails.photo}`} 
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
          <button className="btn btn-success me-2" onClick={handleImageUpdate}>Update Image</button>
          <button className="btn btn-danger" onClick={() => setChangeImageModal(false)}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </>
  );
  };
  
  export default RetiredStaffDetails;