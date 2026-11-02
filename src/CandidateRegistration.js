import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';
import './assets/ui-master/css/style.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import { useNavigate, Link } from 'react-router-dom';
import globalVariables from "./Global.js";
import logo_image from "./assets/ui-master/img/logo.png";
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropperCandicate from './ui-components/ImageCropperCandicate';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import print_toast from "./utilities/Toaster.js";


const CandidateRegistration = () => {
  const navigate = useNavigate();
  const avatarUrl = useRef(null);
  const fileInputRef = useRef(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [form_error, setFormError] = useState({});
  const [loading, setLoading] = useState(false);
  const [foranes, setForanes] = useState([]);
  const [parishes, setParishes] = useState([]);
  const [convents, setConvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false); // New state for crop modal
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    reg_id: '',
    corporate_arabic: '',
    candidate_type: '',
    applicant_name: '',
    phone_no: '',
    whatappno: '',
    gender: '',
    dob: '',
    marital_status: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
    candidate_document: null,
    fk_forane_id: '',
    fk_parish_id: '',
    convent_id: '',
    photo: '',
   
  });

  useEffect(() => {
    fetchForanes();
    fetchConvents();
  }, []);
  const [pdfLoading, setPdfLoading] = useState(false);

 

  useEffect(() => {
    // Dynamically import Bootstrap JS for tooltips
    import('bootstrap/dist/js/bootstrap.bundle.min').then((bootstrap) => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl); // Initialize tooltips
      });
    });
  }, []);

  const fetchForanes = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidate/get-foranes`);
      // Access the data array from the response
      if (response.data.status && Array.isArray(response.data.data)) {
        setForanes(response.data.data);
      } else {
        setForanes([]);
        console.error('Invalid foranes data structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching foranes:', error);
      setForanes([]);
    }
  };

  const fetchParishesByForane = async (foraneId) => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidate/get-parishes-by-forane/${foraneId}`);
      // Access the data array from the response
      if (response.data.status && Array.isArray(response.data.data)) {
        setParishes(response.data.data);
      } else {
        setParishes([]);
        console.error('Invalid parishes data structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching parishes:', error);
      setParishes([]);
    }
  };

  const fetchConvents = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidate/get-convents`);
      // Access the data array from the response
      if (response.data.status && Array.isArray(response.data.data)) {
        setConvents(response.data.data);
      } else {
        setConvents([]);
        console.error('Invalid convents data structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching convents:', error);
      setConvents([]);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'applicant_name') {
      value = value.toUpperCase();
    }
    // setFormData((prevData) => ({
    //   ...prevData,
    //   [name]: value,
    // }));

    // Clear error when input changes
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));

    if (name === 'corporate_arabic') {
      // Reset form fields when switching between corporate and arabic
      setFormData(prev => ({
        ...prev,
        [name]: value,
        candidate_type: '',
        convent_id: '',
        fk_forane_id: '',
        fk_parish_id: '',
        gender: '',
        marital_status: ''
      }));
  
      if (value === 'arabic') {
        setShowModal(true);
      }
    } else if (name === 'candidate_type' && formData.corporate_arabic === 'corporate') {
      // Handle candidate type changes for corporate
      let updatedData = { ...formData, [name]: value };
      
      // Reset validation errors for conditional fields
      let updatedErrors = { ...validationErrors };
      
      if (value === 'priest') {
        // For priest: reset these fields as they're not required
        updatedData = {
          ...updatedData,
          gender: 'male',
          marital_status: '',
          convent_id: '',
          fk_forane_id: '',
          fk_parish_id: ''
        };
        // Clear any errors for non-required fields
        delete updatedErrors.convent_id;
        delete updatedErrors.fk_forane_id;
        delete updatedErrors.fk_parish_id;
        delete updatedErrors.gender;
        delete updatedErrors.marital_status;
      } else if (value === 'sister') {
        // For sister: reset these fields, only convent is required
        updatedData = {
          ...updatedData,
          gender: 'female',
          marital_status: '',
          fk_forane_id: '',
          fk_parish_id: ''
        };
        // Clear errors for non-required fields but keep convent validation
        delete updatedErrors.fk_forane_id;
        delete updatedErrors.fk_parish_id;
        delete updatedErrors.gender;
        delete updatedErrors.marital_status;
      } else if (value === 'parish') {
        // For parish: reset convent as it's not required
        updatedData = {
          ...updatedData,
          convent_id: ''
        };
        delete updatedErrors.convent_id;
      }
      
      setFormData(updatedData);
      setValidationErrors(updatedErrors);
      
    } else if (name === 'fk_forane_id') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        fk_parish_id: '' // Reset parish when forane changes
      }));
      // Clear parish error when forane changes
      setValidationErrors(prev => ({
        ...prev,
        fk_parish_id: ''
      }));
      fetchParishesByForane(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  
    // File validation
    if (name === 'candidate_document') {
      const file = e.target.files[0];
      if (!file) {
        setValidationErrors(prev => ({
          ...prev,
          candidate_document: 'Candidate document is required'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          candidate_document: ''
        }));
      }
    }



    if (name === 'password' || name === 'confirmPassword') {
      if (formData.password === formData.confirmPassword) {
        setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: '' }));
      }
    }

    if (value === 'arabic') {
      // Show modal if Arabic is selected
      setShowModal(true);
    } else {
      // Directly update if corporate is selected
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateConfirmPassword = () => {
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: 'Passwords do not match' }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: '' }));
    }
  };

  const handleModalClose = (choice) => {
    setShowModal(false);
    setFormData(prev => ({
      ...prev,
      corporate_arabic: choice === 'yes' ? 'corporate' : 'arabic'
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 300 * 1024) { // 300KB limit
        setValidationErrors(prev => ({
          ...prev,
          photo: 'The photo size exceeds the limit of 300KB.'
        }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        // Just set the temp photo for cropping, don't set avatarUrl or formData yet
        setFormData(prev => ({
          ...prev,
          tempPhoto: reader.result 
        }));
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAvatar = (imgSrc) => {
    // Check size of base64 string (approximate size in bytes)
    const base64Length = imgSrc.length - (imgSrc.indexOf(',') + 1);
    const padding = (imgSrc.charAt(imgSrc.length - 1) === '=') ? ((imgSrc.charAt(imgSrc.length - 2) === '=') ? 2 : 1) : 0;
    const fileSize = (base64Length * 0.75) - padding;

    if (fileSize > 300 * 1024) { // 300KB limit
       setValidationErrors(prev => ({
          ...prev,
          photo: 'The cropped photo size exceeds the limit of 300KB. Please try a smaller image.'
        }));
        return;
    }

    avatarUrl.current = imgSrc;
    setFormData(prev => ({
      ...prev,
      photo: imgSrc,
      tempPhoto: null // Clear temp photo
    }));
    setValidationErrors(prev => ({
      ...prev,
      photo: ''
    }));
    setShowCropModal(false);
  };

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 500 * 1024) { // 500KB limit
      setValidationErrors(prev => ({
        ...prev,
        candidate_document: 'The document size exceeds the limit of 500KB.'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      candidate_document: file
    }));
    setValidationErrors(prev => ({
      ...prev,
      candidate_document: ''
    }));
  } else {
    setValidationErrors(prev => ({
      ...prev,
      candidate_document: 'Candidate document is required'
    }));
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);


    
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await axios.post(
        `${globalVariables.api_url}/candidate/register`,
        formDataToSend,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data.status) {
        navigate('/registration-success');
      } else {
        setValidationErrors(response.data.errors || {});
        if (response.data.message) {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      }
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
 


  const renderError = (field) => {
    return validationErrors[field] ? (
      <small className="text-danger">{validationErrors[field]}</small>
    ) : null;
  };


   // Add defensive checks in the render methods
   const renderForaneOptions = () => {
    if (!Array.isArray(foranes)) {
      return <option value="">No foranes available</option>;
    }
    
    return (
      <>
        <option value="">Select Forane</option>
        {foranes.map((forane) => (
          <option key={forane.forane_id} value={forane.forane_id}>
            {forane.forane_name}
          </option>
        ))}
      </>
    );
  };

  const renderParishOptions = () => {
    if (!Array.isArray(parishes)) {
      return <option value="">No parishes available</option>;
    }
    
    return (
      <>
        <option value="">Select Parish</option>
        {parishes.map((parish) => (
          <option key={parish.parish_id} value={parish.parish_id}>
            {parish.parish_name}, {parish.location}
          </option>
        ))}
      </>
    );
  };

  const renderConventOptions = () => {
    if (!Array.isArray(convents)) {
      return <option value="">No convents available</option>;
    }
    
    return (
      <>
        <option value="">Select Convent</option>
        {convents.map((convent) => (
          <option key={convent.parish_id} value={convent.parish_id}>
            {convent.parish_name}, {convent.location}
          </option>
        ))}
      </>
    );
  };
  

  const renderCorporateArabicChoice = () => (
    <div>
  
  <div className="mb-3">
      <label className="form-label">Corporate or Arabic <span className="text-danger">*</span></label>
      <div>
        <input
          type="radio"
          id="corporate"
          name="corporate_arabic"
          value="corporate"
          checked={formData.corporate_arabic === 'corporate'}
          onChange={handleChange}
        />
        <label htmlFor="corporate" className="ms-2">Corporate</label>
        
        <input
          type="radio"
          id="arabic"
          name="corporate_arabic"
          value="arabic"
          checked={formData.corporate_arabic === 'arabic'}
          onChange={handleChange}
          className="ms-3"
        />
        <label htmlFor="arabic" className="ms-2">Arabic</label>
      </div>
      {renderError('corporate_arabic')}
    </div>

      {/* Modal for confirmation */}
      <Modal show={showModal} onHide={() => handleModalClose('no')}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you coming under Changanassery Archdiocese?</Modal.Body>
        <Modal.Footer>
        <Button variant="success" onClick={() => handleModalClose('yes')}>
  Yes
</Button>
<Button variant="danger" onClick={() => handleModalClose('no')}>
  No
</Button>


        </Modal.Footer>
      </Modal>
    </div>
  );

  const renderSelectField = (name, label, options, required = true) => (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <select
        className="form-select"
        id={name}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
       
      >
        <option value="">{`Select ${label}`}</option>
        {options}
      </select>
      {renderError(name)}
    </div>
  );
  
  
  const renderCorporateFields = () => (
    <>
      {formData.corporate_arabic === 'corporate' && (
        renderSelectField(
          'candidate_type',
          'Candidate Type',
          <>
            <option value="priest">Priest</option>
            <option value="sister">Sister</option>
            <option value="parishioner">Parishioner</option>
          </>
        )
      )}
  
  {formData.candidate_type === 'sister' && (
        renderSelectField(
          'convent_id',
          'Convent Name',
          convents.map(convent => (
            <option key={convent.parish_id} value={convent.parish_id}>
              {convent.parish_name}, {convent.location}
            </option>
          ))
        )
      )}
  
  {formData.candidate_type === 'parishioner' && (
        <>
          {renderSelectField(
            'fk_forane_id',
            'Forane Name',
            foranes.map(forane => (
              <option key={forane.forane_id} value={forane.forane_id}>
                {forane.forane_name}
              </option>
            ))
          )}

          {formData.fk_forane_id && (
            renderSelectField(
              'fk_parish_id',
              'Parish Name',
              parishes.map(parish => (
                <option key={parish.parish_id} value={parish.parish_id}>
                  {parish.parish_name}, {parish.location}
                </option>
              ))
            )
          )}
        </>
      )}
    </>
  );
  

  const renderCommonFields = () => (
    <>

    
      <div className="mb-3">
        <label htmlFor="applicant_name" className="form-label">Applicant Name <span className="text-danger">*</span></label>
        <input
          type="text"
          className="form-control"
          id="applicant_name"
          name="applicant_name"
          value={formData.applicant_name}
          onChange={handleChange}
          autoComplete="off"
        />
        {renderError('applicant_name')}
      </div>

      <div className="mb-3">
        <label htmlFor="dob" className="form-label">Date of Birth <span className="text-danger">*</span></label>
        <input
          type="date"
          className="form-control"
          id="dob"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
          autoComplete="off"
        />
        {renderError('dob')}
      </div>

      <div className="mb-3">
        <label htmlFor="address" className="form-label">House Address (with PIN Code) <span className="text-danger">*</span></label>
        <textarea
          className="form-control"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          autoComplete="off"
        ></textarea>
        {renderError('address')}
      </div>


      {renderAdditionalFields()}
  


      <div className="mb-3">
        <label htmlFor="phone_no" className="form-label">Phone Number <span className="text-danger">*</span></label>
        <input
          type="tel"
          className="form-control"
          id="phone_no"
          name="phone_no"
          value={formData.phone_no}
          onChange={handleChange}
          autoComplete="off"
        />
        {renderError('phone_no')}
      </div>
  
      <div className="mb-3">
        <label htmlFor="whatappno" className="form-label">WhatsApp Number <span className="text-danger">*</span></label>
        <input
          type="tel"
          className="form-control"
          id="whatappno"
          name="whatappno"
          value={formData.whatappno}
          onChange={handleChange}
          autoComplete="off"
        />
        {renderError('whatappno')}
      </div>

      <div className="mb-3">
        <label htmlFor="inputImage" className="form-label">Photo <span className="text-danger">*</span></label>
        <div className="d-flex align-items-center gap-3">
          <div className="flex-grow-1">
            <input
              type="file"
              className="form-control"
              id="inputImage"
              name="photo"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleImageChange}
            />
            <small className="text-muted d-block mt-1">Upload a recent passport size photo (Allowed formats: jpg, jpeg, png)</small>
            {renderError('photo')}
          </div>
          <div style={{ width: '150px' }}>
            {avatarUrl.current ? (
              <img
                src={avatarUrl.current}
                alt="Uploaded"
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6'
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '150px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6',
                borderRadius: '8px',
                color: '#6c757d'
              }}>
                <div className="text-center">
                  <i className="fas fa-image fa-2x mb-2"></i>
                  <div className="small">No image</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {formData.candidate_type !== 'priest' && (
      <div className="mb-3">
      {/* Tooltip on the Heading */}
      <label
        htmlFor="candidate_document"
        className="form-label"
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="Upload the letter given by the parish priest"
      >
        Candidate Document (Letter from Parish Priest) <span className="text-danger">*</span>
      </label>
      
      {/* File Input with Tooltip */}
      <input
        type="file"
        className="form-control"
        id="candidate_document"
        name="candidate_document"
        onChange={handleFileChange}
        accept="application/pdf"
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="Upload the letter provided by the parish priest"
      />
      <small className="text-muted d-block mt-1">Only PDF format files are allowed</small>
      {renderError('candidate_document')}
    </div>
    )}
  

  
 <div className="mb-3">
        <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="off"
        />
        {errors.email && <small className="text-danger">{errors.email}</small>}
 {renderError('email')}
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label">Create Password <span className="text-danger">*</span></label>
        <input
          type="password"
          className="form-control"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        {errors.password && <small className="text-danger">{errors.password}</small>}
  {renderError('password')}
      </div>

      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></label>
        <input
          type="password"
          className="form-control"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={validateConfirmPassword} // Validate when user leaves the field
          autoComplete="new-password"
        />
        {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
        {renderError('confirmPassword')}
      </div>

    </>
  );
  

  const renderAdditionalFields = () => (
    <>
      {(formData.corporate_arabic === 'arabic' || formData.candidate_type === 'parishioner') && (
        <>
          {renderSelectField(
            'gender',
            'Gender',
            <>
              <option value="male">Male</option>
              <option value="female">Female</option>
              {/* <option value="other">Other</option> */}
            </>
          )}

          {renderSelectField(
            'marital_status',
            'Marital Status',
            <>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widow">Widow</option>
              <option value="widower">Widower</option>
            </>
          )}
        </>
      )}
    </>
  );
  


  return (
    <>
      <div className="login_page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-header text-center">
                  <img src={logo_image} style={{ width: '150px', height: '150px' }} alt="Logo" />
                </div>
                <div className="pt-2">
                  <h6 className="card-title text-center pb-0 fs-4 text-dark">Candidate Registration</h6>
                  <p className="text-center text-primary">Fill in the details to register</p>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    {renderCorporateArabicChoice()}
                    {renderCorporateFields()}
                    {renderCommonFields()}
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                    <div className="text-center mt-3">
                      <Link to="/candidate-login" className="text-primary">Already have an account? Login</Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => handleModalClose('no')}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you coming under Changanassery Archdiocese?</Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={() => handleModalClose('yes')}>Yes</Button>
          <Button variant="danger" onClick={() => handleModalClose('no')}>No</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCropModal} onHide={() => setShowCropModal(false)} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crop Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImageCropperCandicate
            closeModal={() => setShowCropModal(false)}
            updateAvatar={updateAvatar}
            image={formData.tempPhoto || formData.photo}
          />
        </Modal.Body>
      </Modal>



      <ToastContainer 
        position="top-right" 
        autoClose={10000} 
        hideProgressBar={false}
        theme="colored"
      />
    </>
  );
};

export default CandidateRegistration;





















































































// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { Button } from 'react-bootstrap';
// import './assets/ui-master/css/style.css';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Modal from 'react-bootstrap/Modal';
// import { useNavigate, Link } from 'react-router-dom';
// import globalVariables from "./Global.js";
// import logo_image from "./assets/ui-master/img/logo.png";
// import 'react-image-crop/dist/ReactCrop.css';
// import './Login.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min';

// import print_toast from "./utilities/Toaster.js";


// const CandidateRegistration = () => {
//   const navigate = useNavigate();
//   const [validationErrors, setValidationErrors] = useState({});
//   const [form_error, setFormError] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [foranes, setForanes] = useState([]);
//   const [parishes, setParishes] = useState([]);
//   const [convents, setConvents] = useState([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [formData, setFormData] = useState({
//     reg_id: '',
//     corporate_arabic: '',
//     candidate_type: '',
//     applicant_name: '',
//     phone_no: '',
//     whatappno: '',
//     gender: '',
//     dob: '',
//     marital_status: '',
//     address: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     candidate_document: null,
//     fk_forane_id: '',
//     fk_parish_id: '',
//     convent_id: '',
   
//   });

//   useEffect(() => {
//     fetchForanes();
//     fetchConvents();
//   }, []);

//   useEffect(() => {
//     // Dynamically import Bootstrap JS for tooltips
//     import('bootstrap/dist/js/bootstrap.bundle.min').then((bootstrap) => {
//       const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
//       tooltipTriggerList.forEach((tooltipTriggerEl) => {
//         new bootstrap.Tooltip(tooltipTriggerEl); // Initialize tooltips
//       });
//     });
//   }, []);

//   const fetchForanes = async () => {
//     try {
//       const response = await axios.get(`${globalVariables.api_url}/candidate/get-foranes`);
//       // Access the data array from the response
//       if (response.data.status && Array.isArray(response.data.data)) {
//         setForanes(response.data.data);
//       } else {
//         setForanes([]);
//         console.error('Invalid foranes data structure:', response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching foranes:', error);
//       setForanes([]);
//     }
//   };

//   const fetchParishesByForane = async (foraneId) => {
//     try {
//       const response = await axios.get(`${globalVariables.api_url}/candidate/get-parishes-by-forane/${foraneId}`);
//       // Access the data array from the response
//       if (response.data.status && Array.isArray(response.data.data)) {
//         setParishes(response.data.data);
//       } else {
//         setParishes([]);
//         console.error('Invalid parishes data structure:', response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching parishes:', error);
//       setParishes([]);
//     }
//   };

//   const fetchConvents = async () => {
//     try {
//       const response = await axios.get(`${globalVariables.api_url}/candidate/get-convents`);
//       // Access the data array from the response
//       if (response.data.status && Array.isArray(response.data.data)) {
//         setConvents(response.data.data);
//       } else {
//         setConvents([]);
//         console.error('Invalid convents data structure:', response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching convents:', error);
//       setConvents([]);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     // setFormData((prevData) => ({
//     //   ...prevData,
//     //   [name]: value,
//     // }));

//     // Clear error when input changes
//     setValidationErrors(prev => ({
//       ...prev,
//       [name]: ''
//     }));

//     if (name === 'corporate_arabic') {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value,
//         candidate_type: '',
//         convent_id: '',
//         fk_forane_id: '',
//         fk_parish_id: '',
//         gender: '',
//         marital_status: ''
//       }));

//       if (value === 'arabic') {
//         setShowModal(true);
//       }
//     } else if (name === 'candidate_type' && formData.corporate_arabic === 'corporate') {
//       let updatedData = { ...formData, [name]: value };
      
//       if (value === 'priest') {
//         updatedData = {
//           ...updatedData,
//           gender: 'male',
//           marital_status: '',
//           convent_id: '',
//           fk_forane_id: '',
//           fk_parish_id: ''
//         };
//       } else if (value === 'sister') {
//         updatedData = {
//           ...updatedData,
//           gender: 'female',
//           marital_status: '',
//           fk_forane_id: '',
//           fk_parish_id: ''
//         };
//       } else if (value === 'parish') {
//         updatedData = {
//           ...updatedData,
//           convent_id: ''
//         };
//       }
      
//       setFormData(updatedData);
//     } else if (name === 'fk_forane_id') {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value,
//         fk_parish_id: ''
//       }));
//       fetchParishesByForane(value);
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         [name]: value
//       }));
//     }
  
//     // File validation
//     if (name === 'candidate_document') {
//       const file = e.target.files[0];
//       if (!file) {
//         setValidationErrors(prev => ({
//           ...prev,
//           candidate_document: 'Candidate document is required'
//         }));
//       } else {
//         setValidationErrors(prev => ({
//           ...prev,
//           candidate_document: ''
//         }));
//       }
//     }



//     if (name === 'password' || name === 'confirmPassword') {
//       if (formData.password === formData.confirmPassword) {
//         setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: '' }));
//       }
//     }

//     if (value === 'arabic') {
//       // Show modal if Arabic is selected
//       setShowModal(true);
//     } else {
//       // Directly update if corporate is selected
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const validateConfirmPassword = () => {
//     if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
//       setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: 'Passwords do not match' }));
//     } else {
//       setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: '' }));
//     }
//   };

//   const handleModalClose = (choice) => {
//     setShowModal(false);
//     setFormData(prev => ({
//       ...prev,
//       corporate_arabic: choice === 'yes' ? 'corporate' : 'arabic'
//     }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     setFormData(prev => ({
//       ...prev,
//       candidate_document: file
//     }));
//     // Clear file error when new file is selected
//     setValidationErrors(prev => ({
//       ...prev,
//       candidate_document: ''
//     }));
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const formDataToSend = new FormData();
      
//       Object.keys(formData).forEach(key => {
//         if (formData[key] !== null && formData[key] !== undefined) {
//           formDataToSend.append(key, formData[key]);
//         }
//       });

//       const response = await axios.post(
//         `${globalVariables.api_url}/candidate/register`,
//         formDataToSend,
//         {
//           headers: { 'Content-Type': 'multipart/form-data' }
//         }
//       );

//       if (response.data.status) {
//         toast.success('Registration successful');
//         navigate('/login');
//       } else {
//         // Set validation errors from backend
//         setValidationErrors(response.data.errors || {});
//         if (response.data.message) {
//           toast.error(response.data.message);
//         }
//       }
//     } catch (error) {
//       if (error.response?.data?.errors) {
//         // Set validation errors from backend error response
//         setValidationErrors(error.response.data.errors);
//       }
//       toast.error(error.response?.data?.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };
 


//   const renderError = (field) => {
//     return validationErrors[field] ? (
//       <small className="text-danger">{validationErrors[field]}</small>
//     ) : null;
//   };


//    // Add defensive checks in the render methods
//    const renderForaneOptions = () => {
//     if (!Array.isArray(foranes)) {
//       return <option value="">No foranes available</option>;
//     }
    
//     return (
//       <>
//         <option value="">Select Forane</option>
//         {foranes.map((forane) => (
//           <option key={forane.forane_id} value={forane.forane_id}>
//             {forane.forane_name}
//           </option>
//         ))}
//       </>
//     );
//   };

//   const renderParishOptions = () => {
//     if (!Array.isArray(parishes)) {
//       return <option value="">No parishes available</option>;
//     }
    
//     return (
//       <>
//         <option value="">Select Parish</option>
//         {parishes.map((parish) => (
//           <option key={parish.parish_id} value={parish.parish_id}>
//             {parish.parish_name}, {parish.location}
//           </option>
//         ))}
//       </>
//     );
//   };

//   const renderConventOptions = () => {
//     if (!Array.isArray(convents)) {
//       return <option value="">No convents available</option>;
//     }
    
//     return (
//       <>
//         <option value="">Select Convent</option>
//         {convents.map((convent) => (
//           <option key={convent.parish_id} value={convent.parish_id}>
//             {convent.parish_name}, {convent.location}
//           </option>
//         ))}
//       </>
//     );
//   };
  

//   const renderCorporateArabicChoice = () => (
//     <div>
//   <div className="mb-3">
//       <label className="form-label">Corporate or Arabic <span className="text-danger">*</span></label>
//       <div>
//         <input
//           type="radio"
//           id="corporate"
//           name="corporate_arabic"
//           value="corporate"
//           checked={formData.corporate_arabic === 'corporate'}
//           onChange={handleChange}
//         />
//         <label htmlFor="corporate" className="ms-2">Corporate</label>
        
//         <input
//           type="radio"
//           id="arabic"
//           name="corporate_arabic"
//           value="arabic"
//           checked={formData.corporate_arabic === 'arabic'}
//           onChange={handleChange}
//           className="ms-3"
//         />
//         <label htmlFor="arabic" className="ms-2">Arabic</label>
//       </div>
//       {renderError('corporate_arabic')}
//     </div>

//       {/* Modal for confirmation */}
//       <Modal show={showModal} onHide={() => handleModalClose('no')}>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirmation</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Are you coming under Changanassery Archdiocese?</Modal.Body>
//         <Modal.Footer>
//         <Button variant="success" onClick={() => handleModalClose('yes')}>
//   Yes
// </Button>
// <Button variant="danger" onClick={() => handleModalClose('no')}>
//   No
// </Button>


//         </Modal.Footer>
//       </Modal>
//     </div>
//   );

//   const renderSelectField = (name, label, options, required = true) => (
//     <div className="mb-3">
//       <label htmlFor={name} className="form-label">
//         {label} {required && <span className="text-danger">*</span>}
//       </label>
//       <select
//        className="form-select"
//         id={name}
//         name={name}
//         value={formData[name] || ''}
//         onChange={handleChange}
       
//       >
//         <option value="">{`Select ${label}`}</option>
//         {options}
//       </select>
//       {renderError(name)}
//     </div>
//   );
  
  
//   const renderCorporateFields = () => (
//     <>
//       {formData.corporate_arabic === 'corporate' && (
//         renderSelectField(
//           'candidate_type',
//           'Candidate Type',
//           <>
//             <option value="priest">Priest</option>
//             <option value="sister">Sister</option>
//             <option value="parishioner">Parishioner</option>
//           </>
//         )
//       )}
  
//   {formData.candidate_type === 'sister' && (
//         renderSelectField(
//           'convent_id',
//           'Convent Name',
//           convents.map(convent => (
//             <option key={convent.parish_id} value={convent.parish_id}>
//               {convent.parish_name}, {convent.location}
//             </option>
//           ))
//         )
//       )}
  
//   {formData.candidate_type === 'parishioner' && (
//         <>
//           {renderSelectField(
//             'fk_forane_id',
//             'Forane Name',
//             foranes.map(forane => (
//               <option key={forane.forane_id} value={forane.forane_id}>
//                 {forane.forane_name}
//               </option>
//             ))
//           )}

//           {formData.fk_forane_id && (
//             renderSelectField(
//               'fk_parish_id',
//               'Parish Name',
//               parishes.map(parish => (
//                 <option key={parish.parish_id} value={parish.parish_id}>
//                   {parish.parish_name}, {parish.location}
//                 </option>
//               ))
//             )
//           )}
//         </>
//       )}
//     </>
//   );
  

//   const renderCommonFields = () => (
//     <>
    
//       <div className="mb-3">
//         <label htmlFor="applicant_name" className="form-label">Applicant Name <span className="text-danger">*</span></label>
//         <input
//           type="text"
//           className="form-control"
//           id="applicant_name"
//           name="applicant_name"
//           value={formData.applicant_name}
//           onChange={handleChange}
          
//         />
//         {renderError('applicant_name')}
//       </div>

//       <div className="mb-3">
//         <label htmlFor="dob" className="form-label">Date of Birth <span className="text-danger">*</span></label>
//         <input
//           type="date"
//           className="form-control"
//           id="dob"
//           name="dob"
//           value={formData.dob}
//           onChange={handleChange}
          
//         />
//         {renderError('dob')}
//       </div>

//       <div className="mb-3">
//         <label htmlFor="address" className="form-label">House Address <span className="text-danger">*</span></label>
//         <textarea
//           className="form-control"
//           id="address"
//           name="address"
//           value={formData.address}
//           onChange={handleChange}
          
//         ></textarea>
//         {renderError('address')}
//       </div>


//       {renderAdditionalFields()}
  


//       <div className="mb-3">
//         <label htmlFor="phone_no" className="form-label">Phone Number <span className="text-danger">*</span></label>
//         <input
//           type="tel"
//           className="form-control"
//           id="phone_no"
//           name="phone_no"
//           value={formData.phone_no}
//           onChange={handleChange}
          
//         />
//         {renderError('phone_no')}
//       </div>
  
//       <div className="mb-3">
//         <label htmlFor="whatappno" className="form-label">WhatsApp Number <span className="text-danger">*</span></label>
//         <input
//           type="tel"
//           className="form-control"
//           id="whatappno"
//           name="whatappno"
//           value={formData.whatappno}
//           onChange={handleChange}
//         />
//         {renderError('whatappno')}
//       </div>

//       <div className="mb-3">
//       {/* Tooltip on the Heading */}
//       <label
//         htmlFor="candidate_document"
//         className="form-label"
//         data-bs-toggle="tooltip"
//         data-bs-placement="top"
//         title="Upload the letter given by the parish priest"
//       >
//         Candidate Document <span className="text-danger">*</span>
//       </label>
      
//       {/* File Input with Tooltip */}
//       <input
//         type="file"
//         className="form-control"
//         id="candidate_document"
//         name="candidate_document"
//         onChange={handleFileChange}
        
//         data-bs-toggle="tooltip"
//         data-bs-placement="top"
//         title="Upload the letter provided by the parish priest"
//       />
//       {renderError('candidate_document')}
//     </div>
  

  
//  <div className="mb-3">
//         <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
//         <input
//           type="email"
//           className="form-control"
//           id="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
          
//         />
//         {errors.email && <small className="text-danger">{errors.email}</small>}
//  {renderError('email')}
//       </div>

//       <div className="mb-3">
//         <label htmlFor="password" className="form-label">Password <span className="text-danger">*</span></label>
//         <input
//           type="password"
//           className="form-control"
//           id="password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
          
//         />
//         {errors.password && <small className="text-danger">{errors.password}</small>}
//   {renderError('password')}
//       </div>

//       <div className="mb-3">
//         <label htmlFor="confirmPassword" className="form-label">Confirm Password <span className="text-danger">*</span></label>
//         <input
//           type="password"
//           className="form-control"
//           id="confirmPassword"
//           name="confirmPassword"
//           value={formData.confirmPassword}
//           onChange={handleChange}
//           onBlur={validateConfirmPassword} // Validate when user leaves the field
          
//         />
//         {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
//         {renderError('confirmPassword')}
//       </div>

//     </>
//   );
  

//   const renderAdditionalFields = () => (
//     <>
//       {(formData.corporate_arabic === 'arabic' || formData.candidate_type === 'parishioner') && (
//         <>
//           {renderSelectField(
//             'gender',
//             'Gender',
//             <>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </>
//           )}

//           {renderSelectField(
//             'marital_status',
//             'Marital Status',
//             <>
//               <option value="single">Single</option>
//               <option value="married">Married</option>
//               <option value="divorced">Divorced</option>
//               <option value="widow">Widow</option>
//               <option value="widower">Widower</option>
//             </>
//           )}
//         </>
//       )}
//     </>
//   );
  


//   return (
//     <>
//       <div className="login_page">
//         <div className="container">
//           <div className="row justify-content-center">
//             <div className="col-lg-6">
//               <div className="card">
//                 <div className="card-header text-center">
//                   <img src={logo_image} style={{ width: '150px', height: '150px' }} alt="Logo" />
//                 </div>
//                 <div className="pt-2">
//                   <h6 className="card-title text-center pb-0 fs-4 text-dark">Candidate Registration</h6>
//                   <p className="text-center text-primary">Fill in the details to register</p>
//                 </div>
//                 <div className="card-body">
//                   <form onSubmit={handleSubmit}>
//                     {renderCorporateArabicChoice()}
//                     {renderCorporateFields()}
//                     {renderCommonFields()}
//                     <div className="d-grid gap-2">
//                       <button type="submit" className="btn btn-primary" disabled={loading}>
//                         {loading ? 'Submitting...' : 'Submit'}
//                       </button>
//                     </div>
//                     <div className="text-center mt-3">
//                       <Link to="/login" className="text-primary">Already have an account? Login</Link>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <Modal show={showModal} onHide={() => handleModalClose('no')}>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirmation</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Are you coming under Changanassery Archdiocese?</Modal.Body>
//         <Modal.Footer>
//           <Button variant="success" onClick={() => handleModalClose('yes')}>Yes</Button>
//           <Button variant="danger" onClick={() => handleModalClose('no')}>No</Button>
//         </Modal.Footer>
//       </Modal>



//       <ToastContainer position="top-center" />
//     </>
//   );
// };

// export default CandidateRegistration;


















































