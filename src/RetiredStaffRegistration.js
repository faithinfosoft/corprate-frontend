import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap'
import './assets/ui-master/css/style.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from 'react-bootstrap/Modal';
import { useNavigate, Link } from 'react-router-dom';
import globalVariables from "./Global.js";
import logo_image from "./assets/ui-master/img/logo.png";
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper1 from './ui-components/ImageCropper1';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import Select from 'react-select';
import print_toast from "./utilities/Toaster.js";
import ReCAPTCHA from "react-google-recaptcha";
// import './toastStyles.css';
const CandidateRegistration = () => {
  const navigate = useNavigate();
  const avatarUrl = useRef(null);

  const [modalOpen, setModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0]; // For date max
  const [parishesConvents, setParishesConvents] = useState([]);
  const [selectedParish, setSelectedParish] = useState('');
  const [schools, setSchools] = useState([]);
  const [designations, setDesignations] = useState([]);
  const fileInputRef = useRef(null);
  // Image cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [croppedImageUrl, setCroppedImageUrl] = useState('');
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Address copy state
  const [sameAsPresent, setSameAsPresent] = useState(false);



  const isSavingExit = false;
  const isSavingContinue = false;
  const [captchaToken, setCaptchaToken] = useState(null);
  const [formError, setFormError] = useState({});
  const [loading, setLoading] = useState(false);
  const [foranes, setForanes] = useState([]);
  const [parishes, setParishes] = useState([]);

  const initialFormData = {
    staff_official_name: "",
    photo: "",
    dob: "",
    gender: "",
    phone_no1: "",
    email: "",
    password: "",
    fk_school_id: '',
    position_type: '',
    roll_type: '',
    date_of_commencement: '',
    appointment_approved: '',
    date_of_joining: "",
    fk_forane_id: '',
    fk_parish_id: '',
    whatsapp_no: '',
    pen_no: '',
    marital_status: '',
    religion: '',
    caste: '',
    subcaste: '',
    diocese: '',
    forane_id: '',
    fk_parish_covent_id: '',
    fk_designation_id: '',
    start_date: '',
    retirement_date: '',
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
    retired_future_interest: '',
    retired_school_details: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  // const [formData, setFormData] = useState({
  //   staff_official_name: "",
  //   photo: "",
  //   dob: "",
  //   gender: "",
  //   phone_no1: "",
  //   email: "",
  //   password: "",
  //   fk_school_id: '',
  //   position_type: '',
  //   roll_type: '',
  //   date_of_commencement: '',
  //   appointment_approved: '',
  //   date_of_joining: "", 
  //   fk_forane_id: '',
  //   fk_parish_id: '',
  //   whatsapp_no: '',
  //   pen_no: '',
  //   marital_status: '',
  //   religion: '',
  //   caste: '',
  //   subcaste: '',
  //   diocese: '',
  //   forane_id: '',
  //   fk_parish_covent_id: '',
  //   fk_designation_id: '',
  //   start_date: '',
  //   retirement_date: '',
  //   // Present address fields
  //   present_address: '',
  //   present_place: '',
  //   present_city: '',
  //   present_district: '',
  //   present_state: '',
  //   present_pin_no: '',
  //   // Permanent address fields
  //   permanent_address: '',
  //   permanent_place: '',
  //   permanent_city: '',
  //   permanent_district: '',
  //   permanent_state: '',
  //   permanent_pin_no: '',
  // });

  useEffect(() => {
    fetchForanes();
  }, []);

  const [selectedForane, setSelectedForane] = useState('');

  const fetchForanes = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/forane/view_forane`);
      setForanes(response.data.data);
    } catch (error) {
      console.error('Error fetching foranes:', error);
      setForanes([]);
    }
  };

  const fetchParishesByForane = async (foraneId) => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidate/get-parishes-by-forane/${foraneId}`);
      if (response.data.status && Array.isArray(response.data.data)) {
        setParishes(response.data.data);
      } else {
        setParishes([]);
      }
    } catch (error) {
      console.error('Error fetching parishes:', error);
      setParishes([]);
    }
  };

  // Handle checkbox for same address
  const handleSameAddressChange = (e) => {
    const checked = e.target.checked;
    setSameAsPresent(checked);

    if (checked) {
      // Copy present address to permanent address
      setFormData(prev => ({
        ...prev,
        permanent_address: prev.present_address,
        permanent_place: prev.present_place,
        permanent_city: prev.present_city,
        permanent_district: prev.present_district,
        permanent_state: prev.present_state,
        permanent_pin_no: prev.present_pin_no,
      }));
    } else {
      // Clear permanent address fields
      setFormData(prev => ({
        ...prev,
        permanent_address: '',
        permanent_place: '',
        permanent_city: '',
        permanent_district: '',
        permanent_state: '',
        permanent_pin_no: '',
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Handle dynamic loading of parishes
    if (name === 'fk_forane_id') {
      fetchParishesByForane(value);
    }

    // If same address is checked and present address fields change, update permanent address
    if (sameAsPresent && name.startsWith('present_')) {
      const permanentFieldName = name.replace('present_', 'permanent_');
      setFormData(prev => ({
        ...prev,
        [permanentFieldName]: value
      }));
    }
  };

  // Image upload and crop functions
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setShowCropModal(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };


  const handleRemovePhoto = () => {
    setCroppedImageUrl('');
    setFormData(prev => ({ ...prev, photo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (!captchaToken) {
    //     alert("Please verify that you are not a robot!");
    //     return;
    //   }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append("captchaToken", captchaToken);
      const response = await axios.post(
        `${globalVariables.api_url}/staff/save-retired-staff`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.status) {

        navigate('/registration-success', {
          state: {
            staff_official_name: formData.staff_official_name,
            email: formData.email,
            phone_no1: formData.phone_no1,
            retirement_date: formData.retirement_date
          }
        });
      } else {
        setFormError(response.data.error || {});
        if (response.data.message) {
          // ✅ Error toast
          print_toast("error", response.data.message);
        }
      }
    } catch (error) {
      setFormError(error.response?.data?.error || {});
      // ✅ Error toast for exception
      print_toast("error", error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForaneChange = async (e) => {
    const foraneId = e.target.value;
    setSelectedForane(foraneId);
    setFormData(prev => ({
      ...prev,
      forane_id: foraneId,
      fk_parish_covent_id: '' // Reset parish selection when forane changes
    }));
    setSelectedParish(''); // Reset selected parish state
    fetchParishesConvents('parish', foraneId);
  };

  const fetchParishesConvents = async (type, foraneId = '') => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_parishes_convents`, {
        params: { type, forane_id: foraneId }
      });

      if (response.data.status) {
        setParishesConvents(response.data.data);
      } else {
        setParishesConvents([]);
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching parishes/convents:', error.message);
    }
  };

  const clearFormFields = () => {
    setFormData(initialFormData);
  };

  const [religionCasteSubcaste, setReligionCasteSubcaste] = useState({
    Christian: [],
    Hindu: [],
    Muslim: [],
  });

  const fetchReligionCasteSubcaste = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/getReligionCasteSubcaste`);

      const defaultReligions = {
        Christian: [],
        Hindu: [],
        Muslim: [],
      };

      const updatedReligionCasteSubcaste = { ...defaultReligions, ...response.data };
      setReligionCasteSubcaste(updatedReligionCasteSubcaste);
    } catch (error) {
      console.error('Error fetching religion, caste, subcaste data:', error);
      setReligionCasteSubcaste({
        Christian: ["Syro-Malabar Syrian Catholic", "Protestant", "Orthodox", "Marthoma", "CSI", "Jacobite", "Pentacost", "Others"],
        Hindu: ["Brahmin", "Ezhava", "Vaishya", "Shudra"],
        Muslim: ["Sunni", "Shia", "Ahmadi"],
      });
    }
  };



  useEffect(() => {
    fetchReligionCasteSubcaste();
    fetchSchools();
    // fetchDesignations();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/schools`);
      if (response.data.status) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);

      print_toast("error", "Failed to fetch schools");
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/designations/view`);
      setDesignations(response.data.data);
    } catch (error) {
      console.error("Error fetching designations:", error);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  // Separate by staff_type
  const teachingDesignations = designations.filter(d => d.staff_type === "teaching");
  const nonTeachingDesignations = designations.filter(d => d.staff_type === "non_teaching");



  const schoolOptions = schools.map((school) => ({
    value: school.school_id,
    label: `${school.school_code} - ${school.school_name}, ${school.location}`
  }));


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('Image selected:', file);

    setFormData({
      ...formData,
      photo: file,
    });

    if (!modalOpen) {
      setModalOpen(true);
    }
  };

  const updateAvatar = (imgSrc) => {
    avatarUrl.current = imgSrc;
    setFormData(prev => ({
      ...prev,
      photo: imgSrc
    }));
  };

  const handleParishChange = (e) => {
    const parishId = e.target.value;
    setSelectedParish(parishId);
    setFormData(prev => ({
      ...prev,
      fk_parish_covent_id: parishId
    }));
  };
  return (
    <>
      <div className="login_page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="card">
                <div className="card-header text-center">
                  <img src={logo_image} style={{ width: '150px', height: '150px' }} alt="Logo" />
                </div>
                <div className="pt-2">
                  <h6 className="card-title text-center pb-0 fs-4 text-dark">Retired Staff Registration</h6>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>

                    {/* === Basic Details === */}
                    <div className="mb-4">
                      <h5 className="mb-3 text-primary border-bottom pb-2">Basic Details</h5>
                      <div className="row">

                        {/* Official Name */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Official Name <span className="text-danger">*</span></label>
                            <div className="flex-grow-1">
                              <input type="text" className="form-control" name="staff_official_name" value={formData.staff_official_name} onChange={handleChange} />
                              {formError.staff_official_name && (
                                <div className="text-danger mt-1">{formError.staff_official_name}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Date of Birth */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Date of Birth <span className="text-danger">*</span></label>
                            <div className="flex-grow-1">
                              <input type="date" className="form-control" name="dob" value={formData.dob} onChange={handleChange} max={today} />
                              {formError.dob && <div className="text-danger mt-1">{formError.dob}</div>}
                            </div>
                          </div>
                        </div>

                        {/* Gender */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Gender <span className="text-danger">*</span></label>
                            <div className="flex-grow-1">
                              <select className="form-control" name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="">Select</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                              </select>
                              {formError.gender && <div className="text-danger mt-1">{formError.gender}</div>}
                            </div>
                          </div>
                        </div>

                        {/* Phone Number */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Phone Number <span className="text-danger">*</span></label>
                            <div className="flex-grow-1">
                              <input type="text" className="form-control" name="phone_no1" value={formData.phone_no1} onChange={handleChange} />
                              {formError.phone_no1 && <div className="text-danger mt-1">{formError.phone_no1}</div>}
                            </div>
                          </div>
                        </div>

                        {/* Whatsapp Number */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>WhatsApp Number</label>
                            <div className="flex-grow-1">
                              <input type="text" className="form-control" name="whatsapp_no" value={formData.whatsapp_no || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Email <span className="text-danger">*</span></label>
                            <div className="flex-grow-1">
                              <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                              {formError.email && <div className="text-danger mt-1">{formError.email}</div>}
                            </div>
                          </div>
                        </div>

                        {/* Date of Joining */}
                        {/* <div className="col-md-12 mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <label className="form-label mb-0 flex-shrink-0" style={{minWidth: '120px'}}>Date of Joining</label>
                          <div className="flex-grow-1">
                            <input type="date" className="form-control" name="date_of_joining" value={formData.date_of_joining} onChange={handleChange} />
                          </div>
                        </div>
                      </div> */}

                        {/* PEN Number */}
                        {/* <div className="col-md-12 mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <label className="form-label mb-0 flex-shrink-0" style={{minWidth: '120px'}}>PEN Number</label>
                          <div className="flex-grow-1">
                            <input type="text" className="form-control" name="pen_no" value={formData.pen_no || ''} onChange={handleChange} />
                          </div>
                        </div>
                      </div> */}

                        {/* Marital Status */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Marital Status</label>
                            <div className="flex-grow-1">
                              <select className={`form-select ${formError.marital_status ? 'is-invalid' : ''}`} name="marital_status" value={formData.marital_status || ''} onChange={handleChange}>
                                <option value="">Select Marital Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Priest">Priest</option>
                                <option value="Sister">Sister</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                              </select>
                              {formError.marital_status && <div className="invalid-feedback">{formError.marital_status}</div>}
                            </div>
                          </div>
                        </div>

                        {/* Religion */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Religion</label>
                            <div className="flex-grow-1">
                              <select className="form-select" name="religion" value={formData.religion || ''} onChange={handleChange}>
                                <option value="">Select Religion</option>
                                {['Christian', 'Hindu', 'Muslim'].map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Denomination */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Denomination</label>
                            <div className="flex-grow-1">
                              <select className="form-select" name="caste" value={formData.caste || ''} onChange={handleChange} disabled={!formData.religion}>
                                <option value="">Select Denomination</option>
                                {formData.religion && religionCasteSubcaste[formData.religion].map((caste) => (
                                  <option key={caste} value={caste}>{caste}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Subcaste */}
                        {/* <div className="col-md-12 mb-3">
                        <div className="d-flex align-items-center gap-3">
                          <label className="form-label mb-0 flex-shrink-0" style={{minWidth: '120px'}}>Subcaste</label>
                          <div className="flex-grow-1">
                            <select className="form-select" name="subcaste" value={formData.subcaste || ''} onChange={handleChange}>
                              <option value="">Select Subcaste</option>
                              <option value="General">General</option>
                              <option value="SC">SC</option>
                              <option value="ST">ST</option>
                              <option value="OBC">OBC</option>
                              <option value="OEC">OEC</option>
                            </select>
                          </div>
                        </div>
                      </div> */}

                        {/* Photo */}


                        <div className="col-md-12 mb-3">
                          <div className="mb-3">
                            <label htmlFor="inputImage" className="form-label">Photo:<span className="text-danger">*</span></label>
                            <input
                              type="file"
                              className="form-control"
                              name="photo"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageChange}
                              onClick={(e) => e.target.value = ''}
                            />
                            {formError.photo && <div className="text-danger">{formError.photo}</div>}
                          </div>

                          <div className="mb-3">

                            <div className='col-md-12'>
                              {avatarUrl.current ? (
                                <img
                                  src={avatarUrl.current}
                                  alt="Uploaded"
                                  name="scheme_image"
                                  style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
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
                                    <div>No image uploaded</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* === Present Address === */}
                    <div className="mb-4">
                      <h5 className="mb-3 text-primary border-bottom pb-2">Present Address</h5>
                      <div className="row">

                        {/* House Name */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>House Name</label>
                            <div className="flex-grow-1">
                              <input type="text" className="form-control" name="present_address" value={formData.present_address || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>

                        {/* Place */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Place</label>
                            <div className="flex-grow-1">
                              <input type="text" className="form-control" name="present_place" value={formData.present_place || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>

                        {/* City */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>City</label>
                            <div className="flex-grow-1">
                              <input type="text" className="form-control" name="present_city" value={formData.present_city || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>

                        {/* District */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>District</label>
                            <div className="flex-grow-1">
                              <input type="text" className="form-control" name="present_district" value={formData.present_district || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>

                        {/* State */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>State</label>
                            <div className="flex-grow-1">
                              <input type="text" className="form-control" name="present_state" value={formData.present_state || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>

                        {/* PIN */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>PIN</label>
                            <div className="flex-grow-1">
                              <input type="text" className="form-control" name="present_pin_no" value={formData.present_pin_no || ''} onChange={handleChange} />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* === Permanent Address === */}
                    <div className="mb-4">
                      <h5 className="mb-3 text-primary border-bottom pb-2 d-flex align-items-center gap-3">
                        Permanent Address
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="sameAsPresent"
                            checked={sameAsPresent}
                            onChange={handleSameAddressChange}
                          />
                          <label className="form-check-label" htmlFor="sameAsPresent" style={{ fontSize: '14px', fontWeight: 'normal' }}>
                            Same as Present Address
                          </label>
                        </div>
                      </h5>
                      <div className="row">

                        {/* House Name */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>House Name</label>
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className="form-control"
                                name="permanent_address"
                                value={formData.permanent_address || ''}
                                onChange={handleChange}
                                disabled={sameAsPresent}
                              />
                            </div>
                          </div>
                        </div>


                        {/* Place */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>Place</label>
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className="form-control"
                                name="permanent_place"
                                value={formData.permanent_place || ''}
                                onChange={handleChange}
                                disabled={sameAsPresent}
                              />

                            </div>
                          </div>
                        </div>

                        {/* City */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>City</label>
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className="form-control"
                                name="permanent_city"
                                value={formData.permanent_city || ''}
                                onChange={handleChange}
                                disabled={sameAsPresent}
                              />

                            </div>
                          </div>
                        </div>

                        {/* District */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>District</label>
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className="form-control"
                                name="permanent_district"
                                value={formData.permanent_district || ''}
                                onChange={handleChange}
                                disabled={sameAsPresent}
                              />


                            </div>
                          </div>
                        </div>

                        {/* State */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>State</label>
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className="form-control"
                                name="permanent_state"
                                value={formData.permanent_state || ''}
                                onChange={handleChange}
                                disabled={sameAsPresent}
                              />


                            </div>
                          </div>
                        </div>

                        {/* PIN */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>PIN</label>
                            <div className="flex-grow-1">
                              <input
                                type="text"
                                className="form-control"
                                name="permanent_pin_no"
                                value={formData.permanent_pin_no || ''}
                                onChange={handleChange}
                                disabled={sameAsPresent}
                              />


                            </div>
                          </div>
                        </div>

                      </div>
                    </div>


                    {/* === Parish Details === */}
                    {/* Parish Details Section */}
                    <div className="mb-4">
                      <h5 className="mb-3 text-primary border-bottom pb-2">Parish Details</h5>
                      <div className="row">

                        {/* Diocese */}
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label htmlFor="diocese" className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>
                              Diocese<span className="text-danger">*</span>
                            </label>
                            <div className="flex-grow-1">
                              <select
                                className="form-control"
                                id="diocese"
                                name="diocese"
                                value={formData.diocese}
                                onChange={handleChange}

                              >
                                <option value="">Select Diocese</option>
                                <option value="Changanacherry">Changanacherry</option>
                                <option value="Others">Others</option>
                              </select>
                              {formError.diocese && <div className="text-danger mt-1">{formError.diocese}</div>}
                            </div>
                          </div>
                        </div>

                        {/* When "Others" → Textboxes */}
                        {formData.diocese === "Others" && (
                          <>
                            {/* Other Diocese Textbox */}
                            <div className="col-md-12 mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <label htmlFor="other_diocese" className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>
                                  Diocese Name<span className="text-danger">*</span>
                                </label>
                                <div className="flex-grow-1">
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="other_diocese"
                                    name="other_diocese"
                                    value={formData.other_diocese || ""}
                                    onChange={handleChange}
                                    placeholder="Enter Diocese"

                                  />
                                  {formError.other_diocese && <div className="text-danger mt-1">{formError.other_diocese}</div>}
                                </div>
                              </div>
                            </div>

                            {/* Forane Textbox */}
                            <div className="col-md-12 mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <label htmlFor="other_forane" className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>
                                  Forane Name<span className="text-danger">*</span>
                                </label>
                                <div className="flex-grow-1">
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="other_forane"
                                    name="other_forane"
                                    value={formData.other_forane || ""}
                                    onChange={handleChange}
                                    placeholder="Enter Forane"

                                  />
                                  {formError.other_forane && <div className="text-danger mt-1">{formError.other_forane}</div>}
                                </div>
                              </div>
                            </div>

                            {/* Parish Textbox */}
                            <div className="col-md-12 mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <label htmlFor="other_parish" className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>
                                  Parish Name<span className="text-danger">*</span>
                                </label>
                                <div className="flex-grow-1">
                                  <input
                                    type="text"
                                    className="form-control"
                                    id="other_parish"
                                    name="other_parish"
                                    value={formData.other_parish || ""}
                                    onChange={handleChange}
                                    placeholder="Enter Parish"

                                  />
                                  {formError.other_parish && <div className="text-danger mt-1">{formError.other_parish}</div>}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {/* When "Changanacherry" → Dropdowns */}
                        {formData.diocese === "Changanacherry" && (
                          <>
                            {/* Forane Dropdown */}
                            <div className="col-md-12 mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <label htmlFor="forane_id" className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>
                                  Forane<span className="text-danger">*</span>
                                </label>
                                <div className="flex-grow-1">
                                  <select
                                    className="form-control"
                                    id="forane_id"
                                    name="forane_id"
                                    value={selectedForane}
                                    onChange={handleForaneChange}

                                  >
                                    <option value="">Select Forane</option>
                                    {foranes.map(forane => (
                                      <option key={forane.forane_id} value={forane.forane_id}>
                                        {forane.forane_name}
                                      </option>
                                    ))}
                                  </select>
                                  {formError.forane_id && <div className="text-danger mt-1">{formError.forane_id}</div>}
                                </div>
                              </div>
                            </div>

                            {/* Parish Dropdown */}
                            <div className="col-md-12 mb-3">
                              <div className="d-flex align-items-center gap-3">
                                <label htmlFor="parish_name" className="form-label mb-0 flex-shrink-0" style={{ minWidth: '120px' }}>
                                  Parish Name<span className="text-danger">*</span>
                                </label>
                                <div className="flex-grow-1">
                                  <select
                                    className="form-control"
                                    id="fk_parish_covent_id"
                                    name="fk_parish_covent_id"
                                    value={formData.fk_parish_covent_id || ''} // Use formData value instead of selectedParish
                                    onChange={handleParishChange} // Use the new handler
                                  >
                                    <option value="">Select Parish</option>
                                    {parishesConvents.map(parish => (
                                      <option key={parish.parish_id} value={parish.parish_id}>
                                        {parish.parish_name}, {parish.location}
                                      </option>
                                    ))}
                                  </select>
                                  {formError.parish_name && <div className="text-danger mt-1">{formError.parish_name}</div>}
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                      </div>
                    </div>


                    {/* === retirement Details === */}
                    <div className="mb-4">
                      <h5 className="mb-3 text-primary border-bottom pb-2">Retirement Details</h5>
                      <div className="row">

                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label htmlFor="fk_school_id" className="form-label">
                              From which school did you retire?<span className="text-danger">*</span>
                            </label>
                            <div className="flex-grow-1">
                              <Select
                                id="fk_school_id"
                                name="fk_school_id"
                                options={schoolOptions}
                                value={schoolOptions.find(option => option.value === formData.fk_school_id)}
                                onChange={(selectedOption) =>
                                  handleChange({
                                    target: { name: "fk_school_id", value: selectedOption ? selectedOption.value : "" }
                                  })
                                }
                                isSearchable
                                placeholder="Select School"
                                classNamePrefix="react-select"
                              />
                              {formError.fk_school_id && <div className="text-danger">{formError.fk_school_id}</div>}
                            </div>
                          </div>
                        </div>




                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label htmlFor="fk_designation_id" className="form-label">
                              What was your designation at the time of retirement?<span className="text-danger">*</span>
                            </label>
                            <div className="flex-grow-1">
                              <select
                                id="fk_designation_id"
                                name="fk_designation_id"
                                className="form-control"
                                value={formData.fk_designation_id}
                                onChange={handleChange}
                              >
                                <option value="">-- Select Designation --</option>

                                {nonTeachingDesignations.length > 0 && (
                                  <optgroup label="Non-Teaching">
                                    {nonTeachingDesignations
                                      .sort((a, b) => a.designation_position - b.designation_position)
                                      .map(d => (
                                        <option key={d.designation_id} value={d.designation_id}>
                                          {d.designation_name}
                                        </option>
                                      ))}
                                  </optgroup>
                                )}

                                {teachingDesignations.length > 0 && (
                                  <optgroup label="Teaching">
                                    {teachingDesignations
                                      .sort((a, b) => a.designation_position - b.designation_position)
                                      .map(d => (
                                        <option key={d.designation_id} value={d.designation_id}>
                                          {d.designation_name}
                                        </option>
                                      ))}
                                  </optgroup>
                                )}
                              </select>
                              {formError.fk_designation_id && (
                                <div className="text-danger">{formError.fk_designation_id}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label htmlFor="start_date" className="form-label">What was the service start date in your last designation?<span className="text-danger"></span></label>
                            <div className="flex-grow-1">
                              <input
                                type="date"
                                className="form-control"
                                id="start_date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                              />
                              {formError.start_date && <div className="text-danger">{formError.start_date}</div>}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label htmlFor="retirement_date" className="form-label">Date of Retirement<span className="text-danger">*</span></label>
                            <div className="flex-grow-1">
                              <input
                                type="date"
                                className="form-control"
                                id="retirement_date"
                                name="retirement_date"
                                value={formData.retirement_date}
                                onChange={handleChange}
                                min={formData.start_date}
                                max={new Date().toISOString().split('T')[0]}
                              />
                              {formError.retirement_date && <div className="text-danger">{formError.retirement_date}</div>}
                            </div>
                          </div>
                        </div>

                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label htmlFor="retired_school_details" className="form-label">
                              Schools Where You Have Worked?<span className="text-danger"></span>
                            </label>
                            <div className="flex-grow-1">
                              <textarea
                                className="form-control"
                                id="retired_school_details"
                                name="retired_school_details"
                                value={formData.retired_school_details}
                                onChange={handleChange}
                                rows="3"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-12 mb-3">
                          <div className="d-flex align-items-center gap-3">
                            <label htmlFor="retired_future_interest" className="form-label">
                              Do you have any future interests (if any)?<span className="text-danger"></span>
                            </label>
                            <div className="flex-grow-1">
                              <textarea
                                className="form-control"
                                id="retired_future_interest"
                                name="retired_future_interest"
                                value={formData.retired_future_interest}
                                onChange={handleChange}
                                rows="3"
                              />
                            </div>
                          </div>
                        </div>




                      </div>
                    </div>

                    {/* <ReCAPTCHA
  sitekey="6Ldr89srAAAAAEi59Yxvynq86IcRi1AJloLIEh67"
  onChange={(token) => {
    setCaptchaToken(token);
    setFormError((prev) => ({ ...prev, captchaToken: '' })); // Clear error when solved
  }}
/> */}
                    {formError.captchaToken && (
                      <div className="text-danger">{formError.captchaToken}</div>
                    )}

                    {/* Buttons */}
                    <div className="d-flex justify-content-center">
                      <button type="submit" className="btn btn-success me-2" disabled={loading}>
                        {loading ? "Registering..." : "Register"}
                      </button>
                      <button type="button" className="btn btn-danger" onClick={clearFormFields} disabled={loading}>
                        Cancel
                      </button>
                    </div>
                  </form>
                  <ToastContainer
                    position="top-right"
                    autoClose={10000}
                    hideProgressBar={false}
                    theme="colored"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} backdrop="static" size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crop Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImageCropper1
            closeModal={() => setModalOpen(false)}
            updateAvatar={updateAvatar}
            image={formData.photo}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CandidateRegistration;
