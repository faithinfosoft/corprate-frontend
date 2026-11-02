import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../utilities/useAuth'; // Import the default export
import CandidateSubjects from './CandidateSubjects'; // Import the CandidateSubjects component
import CandidateServiceDetails from './CandidateServiceDetails'; // Import the CandidateSubjects component
import CandidateQualification from './CandidateQualification'; // Import the CandidateSubjects component
import CandidateFamilyDetails from './CandidateFamilyDetails'; // Import the CandidateSubjects component
import Candidate_co_curricular from './Candidate_co_curricular.js';
import Religious_activities from './Religious_activities.js'; // Import the Religious_activities component
import pdf from "../../assets/ui-master/img/pdf.jpg";
import member_image from "../../assets/ui-master/img/no_image _uploaded.jpg";
import ImageCropper from '../ImageCropperCandicate';
import SecureLink from '../SecureLink';
const CandidateProfile = () => {
  const auth = useAuth();
  const { candidate_id } = useParams();
  const [loaded, setLoaded] = useState(false);
  const [candidateData, setCandidateData] = useState({});
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const isCandidate = auth?.user?.user_type === 'candidate';
  const effectiveLock = isCandidate && isProfileLocked;
  const [activeTab, setActiveTab] = useState('profile'); // State to manage active tab
  const [modalOpen, setModalOpen] = useState(false);
  const [form_error, setFormError] = useState('');
  const [editImgModalOpen, seteditImgModalOpen] = useState(false);
  const [editformError, setEditFormError] = useState({});
  const [editFormData, setEditFormData] = useState(false);
  const [generalInfoModalOpen, setGeneralInfoModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [category, setCategory] = useState("");
  const [isDifferentlyAbled, setIsDifferentlyAbled] = useState("");
  const [isNadarDalit, setIsNadarDalit] = useState("");
  const [malayalam_subject, setMalayalam_subject] = useState("");
  // File Upload State (if needed)
  const [uploadedFile, setUploadedFile] = useState(null);
  const [Certificates, setCertificates] = useState("");
  // Handle selection change for the first dropdown
  // Handle category selection
  const handleSelectionChange = (e) => {
    const { name, value } = e.target;
    setSelectedCategory(value); // Set the selected category

    console.log(value);
    setSelectedValue(""); // Reset the Yes/No selection when changing category
    setFormDatacertificate((prev) => ({
      ...prev,
      [name]: value, // Correctly set the category selection
      selected_value: "", // Reset selected_value when category is changed
    }));
  };


  const handleYesNoChange = (e) => {
    const { name, value } = e.target;
    setSelectedValue(value); // Set Yes/No selection
    setFormDatacertificate((prev) => ({
      ...prev,
      [name]: value, // Update the form state with the selected value
      selected_value: value, // Store the selected Yes/No value
    }));
  };





  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategory(value);
    setFormDatacertificate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };




  const handlChangemalayalam = (e) => {
    const { name, value } = e.target;
    setFormDatacertificate({
      ...formData,
      [name]: value
    });
  }




  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormDatacertificate((prevData) => ({
      ...prevData,
      [name]: files[0] || null
    }));
  };



  const fetchCandidateBasicinfo = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidateManagement/get_candidate_parish`, {
        params: { candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setCandidateData(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchCandidateBasicinfo();
    checkLockStatus();
  }, [candidate_id]);

  const checkLockStatus = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidateexamapplication/get_candidate_lock_status`, {
        params: { candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setIsProfileLocked(response.data.is_locked);
      }
    } catch (error) {
      console.error('Error checking lock status:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [editImgFormData, setEditImgFormData] = useState({
    member_image: '',
    candidate_id: '', // Ensure this is initialized
  });
  const [formData, setFormData] = useState({
    member_image: '',
    candidate_id: '', // Ensure this is initialized
  });

  const handleEditImage = (_memberData) => {

    setEditImgFormData(prevState => ({
      ...prevState,
      member_image: null,
      candidate_id: candidate_id,
    }));

    seteditImgModalOpen(true);
  };

  const avatarUrl = useRef(
    member_image
  );
  const updateAvatar = (imgSrc, file) => {
    avatarUrl.current = imgSrc;
    setFormData({
      ...formData,
      member_image: imgSrc, // Update the state with the cropped image file


    });

  };
  const closeModal = () => {
    seteditImgModalOpen(false);

  }

  const cropEditedImage = (imgSrc, file) => {
    //console.log('Cropping edited image:', imgSrc, file);
    setEditImgFormData(prevState => {
      const updatedState = {
        ...prevState,
        member_image: imgSrc,
        save_flag: true,
      };
      console.log('File passed to cropEditedImage:', imgSrc);

      updateAlbumImage(updatedState);
      console.log(updatedState);
      return updatedState;
    });
  };
  const updateAlbumImage = async (editImgFormData) => {
    try {
      const formDataToUpdateImg = new FormData();
      formDataToUpdateImg.append('candidate_id', editImgFormData.candidate_id);
      formDataToUpdateImg.append('member_image', editImgFormData.member_image);

      // Debugging: Log FormData content
      for (let [key, value] of formDataToUpdateImg.entries()) {
        console.log(key, value);
      }

      const response = await axios.post(`${globalVariables.api_url}/candidateManagement/Update-image`, formDataToUpdateImg);

      if (response.data.status) {
        // Ensure the member info is fetched and updated before closing the modal
        await fetchCandidateBasicinfo();
        print_toast("success", response.data.message);

        // Ensure the modal only closes after fetching new data
        seteditImgModalOpen(false);

      } else {
        let error = response.data.error;
        print_toast("error", response.data.message);
        if (error) {
          setFormError(response.data.error);
        } else {
          setFormError('');
        }
      }
    } catch (error) {
      console.error('Error updating profile image:', error.message);
    } finally {
      setEditImgFormData(prevState => ({
        ...prevState,
        save_flag: false,
      }));
    }
  };
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeeditModal = () => setModalIsOpen(false);

  const handleEdit = (_designation) => {
    setCandidateData(_designation);
    setEditFormData({
      applicant_name: _designation.applicant_name,
      marital_status: _designation.marital_status,
      phone_no: _designation.phone_no,
      whatappno: _designation.whatappno,
      gender: _designation.gender,
      dob: _designation.dob,
      address: _designation.address,
      email: _designation.email,
      differently_abled: _designation.differently_abled,
      malayalam_details: _designation.malayalam_details,
      nadar_arabic: _designation.nadar_arabic,

      corporate_arabic: _designation.corporate_arabic,
      candidate_type: _designation.candidate_type,
      status: _designation.status,
      reg_on: _designation.reg_on,
      convent_id: _designation.convent_id,
      fk_parish_id: _designation.fk_parish_id,
      fk_forane_id: _designation.fk_forane_id,
      reason: _designation.reason,

      save_flag: false,
    });
    openModal();
  };



  const clearDesignationForm = () => {

    setEditFormData({
      applicant_name: '',
      marital_status: '',
      phone_no: '',
      whatappno: '',
      gender: '',
      dob: '',
      address: '',
      email: '',
      differently_abled: '',
      photo: '',
      corporate_arabic: '',
      candidate_type: '',
      status: '',
      reg_on: '',
      convent_id: '',
      fk_parish_id: '',
      fk_forane_id: '',
      reason: '',
      nadar_arabic: '',
      malayalam_details: '',
      save_flag: false,
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (modalIsOpen || generalInfoModalOpen) {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    }



    setEditFormError(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };




  const [saveFlag, setSaveFlag] = useState(false);
  const [formDatacertificate, setFormDatacertificate] = useState({
    category_selection: '',
    fk_candidate_id: candidate_id,
    nadar_dalit: '',
    document_file: null,
    nadar_dalit_doc: null,
    malayalam_subject_doc: null,
    malayalam_details: '',
    selected_value: '' // Add selected_value here
  });


  const clearactivityform = () => {
    setFormDatacertificate({
      category_selection: '',
      fk_candidate_id: candidate_id,
      nadar_dalit: '',
      document_file: null,
      nadar_dalit_doc: null,
      malayalam_subject_doc: null,
      malayalam_details: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveFlag(true);



    const formDataToSubmit = new FormData();
    formDataToSubmit.append("category_selection", formDatacertificate.category_selection);
    formDataToSubmit.append("fk_candidate_id", candidate_id);
    formDataToSubmit.append("nadar_dalit", formDatacertificate.nadar_dalit);

    formDataToSubmit.append("nadar_dalit_doc", formDatacertificate.nadar_dalit_doc);
    formDataToSubmit.append("malayalam_details", formDatacertificate.malayalam_details);

    formDataToSubmit.append("selected_value", formDatacertificate.selected_value);
    try {
      const response = await axios.post(`${globalVariables.api_url}/CandidateGeneralDocument/save`, formDataToSubmit);

      if (response.data.status) {
        print_toast("success", response.data.message);
        await fetchCandidateBasicinfo();
        clearactivityform();  // Call function after successful submission
      } else {
        print_toast("Failed To Save!!!", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error("Catch error details:", error);
      if (error.response) {
        console.error("Response error:", error.response.data);
        print_toast("error", `Error: ${error.response.data.message || 'Unknown error occurred.'}`);
      } else {
        console.error("Network or other error:", error.message);
        print_toast("error", "A network error occurred.");
      }
    }
  };


  const fetchCandidatcertificate = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/CandidateGeneralDocument/view`, {
        params: { candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setCertificates(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchCandidatcertificate();
  }, [candidate_id]);




  const UpdateCandidatedata = async (e) => {
    e.preventDefault();
    setSaveFlag(true);



    const formDataToSubmit = new FormData();

    formDataToSubmit.append("fk_candidate_id", candidate_id);
    formDataToSubmit.append("applicant_name", editFormData.applicant_name);
    formDataToSubmit.append("marital_status", editFormData.marital_status);
    formDataToSubmit.append("phone_no", editFormData.phone_no);
    formDataToSubmit.append("whatappno", editFormData.whatappno);
    formDataToSubmit.append("gender", editFormData.gender);
    formDataToSubmit.append("dob", editFormData.dob);
    formDataToSubmit.append("address", editFormData.address);
    formDataToSubmit.append("email", editFormData.email);
    formDataToSubmit.append("malayalam_details", editFormData.malayalam_details);
    formDataToSubmit.append("nadar_arabic", editFormData.nadar_arabic);
    formDataToSubmit.append("differently_abled", editFormData.differently_abled);

    const malayalamFileInput = document.querySelector('input[name="malayalam_document_main"]');
    if (malayalamFileInput && malayalamFileInput.files[0]) {
      formDataToSubmit.append("malayalam_document", malayalamFileInput.files[0]);
    }

    const diffAbledFileInput = document.querySelector('input[name="differently_abled_document_main"]');
    if (diffAbledFileInput && diffAbledFileInput.files[0]) {
      formDataToSubmit.append("differently_abled_document", diffAbledFileInput.files[0]);
    }

    try {
      const response = await axios.post(`${globalVariables.api_url}/candidateManagement/Update`, formDataToSubmit);

      if (response.data.status) {
        print_toast("success", response.data.message);
        await fetchCandidateBasicinfo();
        closeeditModal();
      } else {
        print_toast("Failed To Save!!!", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error("Catch error details:", error);
      if (error.response) {
        console.error("Response error:", error.response.data);
        print_toast("error", `Error: ${error.response.data.message || 'Unknown error occurred.'}`);
      } else {
        console.error("Network or other error:", error.message);
        print_toast("error", "A network error occurred.");
      }
    }
  };
  return (
    <>
      <div className="candidate-dashboard-container pb-5">
        <div className="row g-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm overflow-hidden mb-4 rounded-4">
              <div className="card-header bg-white border-0 p-0">
                <ul className="nav nav-pills nav-fill p-2 bg-light rounded-4 m-3 mt-4 flex-column flex-md-row gap-2">
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'profile' ? 'active bg-primary text-white shadow-sm' : ''}`}
                      style={{ color: activeTab === 'profile' ? '#fff' : '#000' }}
                      onClick={() => setActiveTab('profile')}
                    >
                      <i className="bi bi-person-fill me-2"></i>My Profile
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'subjects' ? 'active bg-primary text-white shadow-sm' : ''}`}
                      style={{ color: activeTab === 'subjects' ? '#fff' : '#000' }}
                      onClick={() => setActiveTab('subjects')}
                    >
                      <i className="bi bi-book-fill me-2"></i>Subjects
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'services' ? 'active bg-primary text-white shadow-sm' : ''}`}
                      style={{ color: activeTab === 'services' ? '#fff' : '#000' }}
                      onClick={() => setActiveTab('services')}
                    >
                      <i className="bi bi-briefcase-fill me-2"></i>Experience
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'qualification' ? 'active bg-primary text-white shadow-sm' : ''}`}
                      style={{ color: activeTab === 'qualification' ? '#fff' : '#000' }}
                      onClick={() => setActiveTab('qualification')}
                    >
                      <i className="bi bi-mortarboard-fill me-2"></i>Qualifications
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'family' ? 'active bg-primary text-white shadow-sm' : ''}`}
                      style={{ color: activeTab === 'family' ? '#fff' : '#000' }}
                      onClick={() => setActiveTab('family')}
                    >
                      <i className="bi bi-people-fill me-2"></i>Family
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'curricular' ? 'active bg-primary text-white shadow-sm' : ''}`}
                      style={{ color: activeTab === 'curricular' ? '#fff' : '#000' }}
                      onClick={() => setActiveTab('curricular')}
                    >
                      <i className="bi bi-star-fill me-2"></i>Co-curricular
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link border-0 rounded-3 py-2 fw-semibold ${activeTab === 'religious' ? 'active bg-primary text-white shadow-sm' : ''}`}
                      style={{ color: activeTab === 'religious' ? '#fff' : '#000' }}
                      onClick={() => setActiveTab('religious')}
                    >
                      <i className="bi bi-star-fill me-2"></i>Religious Activities
                    </button>
                  </li>

                </ul>
              </div>

              <div className="card-body p-4 pt-0">
                {activeTab === 'profile' && loaded && (
                  <div className="profile-tab-content animate__animated animate__fadeIn">
                    <div className="row g-4">
                      {/* Left Side: Avatar & Action Card */}
                      <div className="col-lg-4 col-xl-3">
                        <div className="card border-0 bg-light rounded-4 h-100 shadow-none">
                          <div className="card-body text-center p-4">
                            <div className="profile-img-container mb-4 position-relative d-inline-block">
                              <img
                                src={
                                  candidateData.photo && candidateData.photo !== "null" && candidateData.photo !== "undefined"
                                    ? (candidateData.photo.startsWith('http') || candidateData.photo.startsWith('data:')
                                        ? candidateData.photo
                                        : `https://corporate.archeparchybookkeeping.org/uploads/candidate_photos/${candidateData.photo}`)
                                    : (candidateData.photo_url && candidateData.photo_url !== "null" && candidateData.photo_url !== "undefined"
                                        ? candidateData.photo_url
                                        : (candidateData.gender?.toLowerCase() === 'female'
                                            ? "https://cdn-icons-png.flaticon.com/512/3135/3135823.png"
                                            : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"))
                                }
                                alt={candidateData.applicant_name}
                                className="rounded-4 border border-4 border-white shadow-sm"
                                style={{ width: '180px', height: '240px', objectFit: 'cover' }}
                                onError={(e) => {
                                  const photo = candidateData.photo;
                                  const photoUrl = candidateData.photo_url;
                                  const candidateImg = (photo && photo !== 'null' && photo !== 'undefined')
                                    ? (photo.startsWith('http') ? photo.split('/').pop() : photo)
                                    : (photoUrl && photoUrl !== 'null' && photoUrl !== 'undefined' ? photoUrl.split('/').pop() : null);

                                  if (candidateImg) {
                                    const step = parseInt(e.target.dataset.fallbackStep || '0', 10);
                                    if (step === 0) {
                                      e.target.dataset.fallbackStep = '1';
                                      e.target.src = `/uploads/candidate_photos/${candidateImg}`;
                                      return;
                                    } else if (step === 1) {
                                      e.target.dataset.fallbackStep = '2';
                                      e.target.src = `https://corporate.archeparchybookkeeping.org/uploads/candidate_photos/${candidateImg}`;
                                      return;
                                    } else if (step === 2) {
                                      e.target.dataset.fallbackStep = '3';
                                      e.target.src = `${globalVariables.img_url}/uploads/candidate_photos/${candidateImg}`;
                                      return;
                                    } else if (step === 3) {
                                      e.target.dataset.fallbackStep = '4';
                                      e.target.src = `http://localhost/corporate_management/public/uploads/candidate_photos/${candidateImg}`;
                                      return;
                                    }
                                  }
                                  e.target.onerror = null;
                                  const isFemale = candidateData.gender?.toLowerCase() === 'female';
                                  e.target.src = isFemale
                                    ? "https://cdn-icons-png.flaticon.com/512/3135/3135823.png"
                                    : "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
                                }}
                              />
                              {!effectiveLock && (
                                <button
                                  className="btn btn-primary btn-sm rounded-circle position-absolute border-2 border-white shadow"
                                  style={{ bottom: '-10px', right: '-10px', padding: '10px 12px' }}
                                  onClick={() => handleEditImage(candidateData)}
                                  title="Update Photo"
                                >
                                  <i className="bi bi-camera-fill"></i>
                                </button>
                              )}
                            </div>

                            <h4 className="fw-bold text-dark mb-1">{candidateData.applicant_name}</h4>
                            <p className="text-muted small mb-0">{candidateData.email}</p>
                            <p className="text-secondary small mb-3">
                              <i className="bi bi-geo-alt-fill me-1"></i>{candidateData.address}
                            </p>

                            <div className={`badge rounded-pill px-3 py-2 mb-4 ${candidateData.status === 'Approved' ? 'text-bg-success' :
                              candidateData.status === 'Rejected' ? 'text-bg-danger' :
                                'text-bg-warning text-dark'
                              }`}>
                              <i className="bi bi-shield-check me-2"></i>
                              {candidateData.status?.toUpperCase() || 'PENDING'}
                            </div>

                            <div className="d-grid mb-4">
                              {!effectiveLock ? (
                                <>
                                  {isProfileLocked && !isCandidate && (
                                    <div className="alert alert-secondary py-1 mb-2 small text-center">
                                      <i className="bi bi-lock-fill text-warning me-1"></i> Locked for Candidate
                                    </div>
                                  )}
                                  <button
                                    className="btn btn-outline-primary btn-sm rounded-3 py-2"
                                    onClick={() => handleEdit(candidateData)}
                                  >
                                    <i className="bi bi-pencil-square me-2"></i>Edit Basic Info
                                  </button>
                                </>
                              ) : (
                                <div className="alert alert-warning py-2 mb-0 small text-center">
                                  <i className="bi bi-lock-fill me-1"></i> Profile Locked (Application Submitted)
                                </div>
                              )}
                            </div>


                          </div>
                        </div>
                      </div>

                      {/* Right Side: Information Panels */}
                      <div className="col-lg-8 col-xl-9">
                        <div className="row g-4">
                          {/* Summary Section */}
                          <div className="col-12">
                            <div className="card border-0 bg-primary-subtle rounded-4 mb-2 shadow-none">
                              <div className="card-body p-4">
                                <div className="row align-items-center">
                                  <div className="col-auto">
                                    <div className="bg-primary text-white rounded-4 p-3 shadow-sm">
                                      <i className="bi bi-geo-alt-fill fs-3"></i>
                                    </div>
                                  </div>
                                  <div className="col">
                                    <h6 className="text-primary-emphasis text-uppercase fw-bold small mb-1 ls-1"></h6>
                                    <h5 className="mb-0 fw-bold">
                                      {candidateData.candidate_type?.toLowerCase() === 'priest' ? (
                                        'Archdiocese of Changanassery'
                                      ) : (
                                        <>
                                          {candidateData.candidate_type?.toLowerCase() === 'sister' ? (
                                            (<>{candidateData.convent_name || candidateData.parish_name || 'N/A'}{(candidateData.location || candidateData.parish_place || candidateData.place) ? `, ${candidateData.location || candidateData.parish_place || candidateData.place}` : ''}</>)
                                          ) : (
                                            <>
                                              {candidateData.parish_name || 'N/A'}
                                              {(candidateData.location || candidateData.parish_place || candidateData.place) ? `, ${candidateData.location || candidateData.parish_place || candidateData.place}` : ''}
                                              {candidateData.forane_name ? `, ${candidateData.forane_name}` : ''}
                                            </>
                                          )}
                                        </>
                                      )}
                                    </h5>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Top Row: Personal Details & Connectivity */}
                          <div className="col-md-6">
                            <div className="card border-0 shadow-none bg-light rounded-4 h-100">
                              <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0">
                                <h5 className="fw-bold mb-0 text-dark">Personal Details</h5>
                              </div>
                              <div className="card-body p-4">
                                <ProfileInfoRow 
                                  icon="bi-person" 
                                  label="Gender" 
                                  value={
                                    candidateData.gender 
                                      ? (candidateData.gender.charAt(0).toUpperCase() + candidateData.gender.slice(1)) 
                                      : (candidateData.candidate_type?.toLowerCase() === 'sister' ? 'Female' : candidateData.candidate_type?.toLowerCase() === 'priest' ? 'Male' : '-')
                                  } 
                                />
                                <ProfileInfoRow icon="bi-calendar-date" label="Date of Birth" value={formatDate(candidateData.dob)} />
                                {(candidateData.corporate_arabic === 'arabic' || candidateData.candidate_type?.toLowerCase() === 'parishioner') && (
                                  <ProfileInfoRow icon="bi-heart" label="Marital Status" value={candidateData.marital_status} hideBorder />
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="card border-0 shadow-none bg-light rounded-4 h-100">
                              <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0">
                                <h5 className="fw-bold mb-0 text-dark">Connectivity</h5>
                              </div>
                              <div className="card-body p-4">
                                <div className="row g-0">
                                  <div className="col-12">
                                    <ProfileInfoRow icon="bi-phone" label="Mobile" value={candidateData.phone_no} />
                                  </div>
                                  <div className="col-12">
                                    <ProfileInfoRow icon="bi-whatsapp" label="Whatsapp" value={candidateData.whatappno} />
                                  </div>
                                  <div className="col-12">
                                    <ProfileInfoRow icon="bi-envelope-at" label="Email" value={candidateData.email} hideBorder />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Next Row: General Information (Stacked below) */}
                          <div className="col-12">
                            <div className="card border-0 shadow-none bg-light rounded-4">
                              <div className="card-header bg-transparent border-0 px-4 pt-4 pb-0 d-flex justify-content-between align-items-center">
                                <h5 className="fw-bold mb-0 text-dark">General Information</h5>
                                {!effectiveLock && (
                                  <button
                                    className="btn btn-sm btn-primary rounded-circle shadow-sm"
                                    onClick={() => handleEdit(candidateData)}
                                    title="Edit General Info"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                )}
                              </div>
                              <div className="card-body p-4">
                                {candidateData.malayalam_details && !candidateData.general_documents?.some(doc => doc.doc_type === 'malayalam_study') && (
                                  <div className="alert alert-warning py-2 mb-3 small d-flex align-items-center rounded-3 border-0">
                                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                    <span>If you studied Malayalam as a subject, please upload the supporting document by clicking the edit icon.</span>
                                  </div>
                                )}
                                {candidateData.differently_abled === 'Yes' && !candidateData.general_documents?.some(doc => doc.doc_type === 'differently_abled') && (
                                  <div className="alert alert-danger py-2 mb-3 small d-flex align-items-center rounded-3 border-0">
                                    <i className="bi bi-exclamation-circle-fill me-2"></i>
                                    <span>Differently Abled Certificate is required. Please upload it via Edit.</span>
                                  </div>
                                )}
                                <div className="row">
                                  <div className="col-md-4">
                                    <ProfileInfoRow icon="bi-translate" label="Malayalam Studied" value={candidateData.malayalam_details} />
                                  </div>
                                  <div className="col-md-4">
                                    <ProfileInfoRow icon="bi-person-badge" label="Nadar/Dalit Status" value={candidateData.nadar_arabic} />
                                  </div>
                                  <div className="col-md-4">
                                    <ProfileInfoRow icon="bi-accessibility" label="Differently Abled" value={candidateData.differently_abled} hideBorder />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* New Section: General Documents Table */}
                          {candidateData.general_documents && candidateData.general_documents.length > 0 && (
                            <div className="col-12 mt-4 animate__animated animate__fadeIn">
                              <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                                <div className="card-header bg-white border-bottom-0 px-4 pt-4 pb-0">
                                  <h5 className="fw-bold mb-0 text-dark">
                                    <i className="bi bi-file-earmark-check me-2 text-primary"></i>
                                    General Documents
                                  </h5>
                                  <p className="text-muted small mb-0 mt-1">Uploaded certificates and supporting documents</p>
                                </div>
                                <div className="card-body p-4">
                                  <div className="table-responsive">
                                    <table className="table table-hover align-middle border-0">
                                      <thead className="bg-light">
                                        <tr>
                                          <th className="border-0 rounded-start text-muted small text-uppercase ps-3">Document Type</th>
                                          <th className="border-0 rounded-end text-muted small text-uppercase text-center pe-3">Document</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {candidateData.general_documents.map((doc, index) => (
                                          <tr key={index}>
                                            <td className="ps-3">
                                              <span className="fw-bold text-dark">
                                                {doc.doc_type === 'malayalam_study' ? 'Malayalam Studied' :
                                                  doc.doc_type === 'differently_abled' ? 'Differently Abled Certificate' :
                                                    doc.doc_type}
                                              </span>
                                            </td>
                                            <td className="text-center pe-3">
                                              <SecureLink
                                                href={doc.document_url}
                                                className="text-danger fs-3 d-inline-flex align-items-center justify-content-center hover-scale"
                                                title="View PDF"
                                                style={{ transition: 'transform 0.2s', cursor: 'pointer' }}
                                              >
                                                <i className="bi bi-file-earmark-pdf-fill"></i>
                                              </SecureLink>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}


                        </div>
                      </div>
                    </div>
                  </div>
                )}


                {/* <div className="row">
  <div className="col-md-6">
    <div className="card">
      <div className="card-header">Certificates</div>
      <div className="card-body">
        <form role="form" onSubmit={handleSubmit} className="row g-3">
          <div className="col-md-12">
            <div className="col-12">
              <label className="col-sm-12 col-form-label">Select Category </label>
              <select
  name="category_selection"
  className="form-control"
  value={formDatacertificate.category_selection}
  onChange={handleSelectionChange}
>

                  <option value="">Select</option>
                  <option value="nadar_dalit">Whether the applicant is Nadar Catholic/Dalit Catholic</option>
                  <option value="differently_abled">Whether the applicant is Differently Abled</option>
                  <option value="malayalam_subject">Whether the applicant studied Malayalam as a subject School/Higher Studies (Give Details)</option>
                </select>
             
                <label className="col-sm-12 col-form-label">Select Category </label>
              {selectedCategory && (
                <select
                  name={selectedCategory}
                  className="form-control"
                  value={selectedValue}
                  onChange={handleYesNoChange}
                  nadar_dalit
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              )}

              {selectedCategory === "nadar_dalit" && selectedValue === "Yes" && (
                <>
                  <label className="col-sm-12 col-form-label">Select Caste</label>
                  <select
                    name="nadar_dalit"
                    className="form-control"
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    <option value="">Select</option>
                    <option value="Nadar">Nadar</option>
                    <option value="Dalit">Dalit</option>
                  </select>

                  <label className="col-sm-12 col-form-label">Certificate From Competent Govt. Authority</label>
                  <input type="file" name="nadar_dalit_doc" className="form-control" onChange={handleFileChange} />
                </>
              )}

              {selectedCategory === "differently_abled" && selectedValue === "Yes" && (
                <>
                  <label className="col-sm-12 col-form-label">Letter From Parish Priest</label>
                  <input type="file" name="nadar_dalit_doc" className="form-control" onChange={handleFileChange} />
                </>
              )}

              {selectedCategory === "malayalam_subject" && selectedValue === "Yes" && (
                <>
                  <label className="col-sm-12 col-form-label">Give Details</label>
                  <input type="text" name="malayalam_details" className="form-control" onChange={handlChangemalayalam} />
                  <label className="col-sm-12 col-form-label">Attach Copy of Original Document</label>
                  <input type="file" name="nadar_dalit_doc" className="form-control" onChange={handleFileChange} />
                </>
              )}
            </div>
          </div>

          <div className="col-md-12">
            <button type="submit" className="btn btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>


  <div className="col-md-6">
  <div className="card">
    <div className="card-header">Certificates</div>
    <div className="card-body">
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th className="text-center">Category</th>
              <th className="text-center">Document</th>
            </tr>
          </thead>
          <tbody>
            {Certificates?.length > 0 ? (
              Certificates.map((Certificate) => (
                <tr key={Certificate.candidate_subject_id}>
              
                  <td className="text-center fw-bold">
                    {Certificate.doc_type === "nadar_dalit"
                      ? Certificate.nadar_arabic
                      : Certificate.differently_abled === "Yes"
                      ? "Differently Abled Person"
                      : "Other Category"}
                  </td>

                  
                  <td className="text-center">
                    {Certificate.doc_url ? (
                      <div className="d-flex flex-column align-items-center">
                        <a
                          href={Certificate.doc_url}
                          rel="noopener noreferrer"
                          target="_blank"
                          className="d-block"
                        >
                          <img
                            src={pdf}  
                            alt="PDF Document"
                            className="pdf-thumbnail img-fluid"
                            style={{ width: "50px", height: "70px" }}
                          />
                        </a>
                      </div>
                    ) : (
                      <span className="text-muted">No Document</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center text-muted">
                  No Certificates Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
 */}

                {/* </div> */}





                {activeTab === 'subjects' && <CandidateSubjects candidateId={candidate_id} readOnly={effectiveLock} />}
                {activeTab === 'services' && <CandidateServiceDetails candidateId={candidate_id} readOnly={effectiveLock} />}
                {activeTab === 'qualification' && <CandidateQualification candidateId={candidate_id} readOnly={effectiveLock} />}
                {activeTab === 'family' && <CandidateFamilyDetails candidateId={candidate_id} readOnly={effectiveLock} />}
                {activeTab === 'curricular' && <Candidate_co_curricular candidateId={candidate_id} readOnly={effectiveLock} />}
                {activeTab === 'religious' && <Religious_activities candidateId={candidate_id} readOnly={effectiveLock} />}

              </div>
            </div>
          </div>
        </div>
        <Modal show={editImgModalOpen} onHide={() => seteditImgModalOpen(false)} backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>Edit Image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {/* {JSON.stringify(editImgFormData,null,2)} */}
            <ImageCropper updateAvatar={cropEditedImage} closeModal={closeModal} updateAlbumImage={updateAlbumImage} />
          </Modal.Body>
        </Modal>
        <Modal show={modalOpen} onHide={() => setModalOpen(false)} backdrop="static">
          <Modal.Header closeButton>
            <Modal.Title>Crop Image</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ImageCropper
              closeModal={() => setModalOpen(false)}
              updateAvatar={updateAvatar}
              image={formData.member_image}
            />
          </Modal.Body>
        </Modal>



        <Modal show={modalIsOpen} onHide={closeeditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit </Modal.Title>
          </Modal.Header>
          <Modal.Body>

            {/* {JSON.stringify(editFormData,null,2)} */}
            <form role="form" onSubmit={UpdateCandidatedata} className="row g-3">
              <div className="col-12">
                <label htmlFor="inputName" className="col-sm-12 col-form-label">Name<span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="applicant_name"
                  name="applicant_name"

                  value={editFormData.applicant_name}
                  onChange={handleChange}
                />
                <span className="text-danger">{editformError.applicant_name}</span>
              </div>


              <div className="col-12">
                <label htmlFor="inputName" className="col-sm-12 col-form-label">Address<span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"

                  value={editFormData.address}
                  onChange={handleChange}
                ></textarea>
                <span className="text-danger">{editformError.address}</span>
              </div>



              <div className="col-md-12">
                <label htmlFor="gender" className="col-form-label">
                  Gender: <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  id="gender"
                  name="gender"
                  value={editFormData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="transgender">Transgender</option>
                  <option value="other">Other</option>
                </select>
                <span className="text-danger">{editformError.gender}</span>
              </div>
              <div className="col-md-12">
                <label htmlFor="maritalStatus" className="col-form-label">
                  Marital Status: <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  id="maritalStatus"
                  name="marital_status"
                  value={editFormData.marital_status}
                  onChange={handleChange}
                >
                  <option value="">Select Marital Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widow">Widow</option>
                  <option value="Widower">Widower</option>
                  <option value="Bishop">Diocesan Bishops</option>
                  <option value="Other_Bishop">Bishops in other Eparchies</option>
                  <option value="Diocesan_Priest">Diocesan Priests</option>
                  <option value="Missionary">Priest in other Eparchies</option>
                  <option value="Priest">Religious Priests</option>
                  <option value="Sister">Religious Sisters</option>
                  <option value="Seminarian">Seminarians</option>
                  <option value="Brotherhood">Brotherhood</option>
                  <option value="Aspirants">Aspirants</option>
                  <option value="Irregular">Irregular Marriage/Intercaste Marriage</option>
                  <option value="Consecrated Life">Consecrated Life</option>
                </select>
                <span className="text-danger">{editformError.marital_status}</span>
              </div>


              <div className="col-md-12">
                <label htmlFor="date_of_birth" className="col-form-label">
                  Date of Birth: <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="dob"
                  name="dob"
                  value={editFormData.dob}
                  onChange={handleChange}
                />
                <span className="text-danger">{editformError.dob}</span>
              </div>
              <div className="col-12">
                <label htmlFor="inputName" className="col-sm-12 col-form-label">Contact Number<span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="phone_no"
                  name="phone_no"

                  value={editFormData.phone_no}
                  onChange={handleChange}
                />
                <span className="text-danger">{editformError.phone_no}</span>
              </div>
              <div className="col-12">
                <label htmlFor="inputName" className="col-sm-12 col-form-label">WhatsUp Number<span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="whatappno"
                  name="whatappno"

                  value={editFormData.whatappno}
                  onChange={handleChange}
                />
                <span className="text-danger">{editformError.whatappno}</span>
              </div>


              <div className="col-12">
                <label htmlFor="inputName" className="col-sm-12 col-form-label">Email<span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  name="email"

                  value={editFormData.email}
                  onChange={handleChange}
                />
                <span className="text-danger">{editformError.email}</span>
              </div>

              {/* General Information Fields Merged Here */}
              <div className="col-12 border-top pt-3 mt-3">
                <h6 className="fw-bold mb-3 text-primary">General Information</h6>
              </div>

              <div className="col-12">
                <label className="form-label fw-bold small">Whether applicant studied Malayalam as a subject</label>
                <textarea
                  className="form-control mb-2"
                  name="malayalam_details"
                  rows="2"
                  value={editFormData.malayalam_details}
                  onChange={handleChange}
                  placeholder="Details of Malayalam study..."
                ></textarea>
                {editFormData.malayalam_details && editFormData.malayalam_details.trim() !== "" && (
                  <div className="bg-light p-2 rounded-3 border border-dashed border-primary mb-3">
                    <label className="form-label d-block small fw-bold mb-1 text-primary">Upload Malayalam Certificate</label>
                    <input type="file" className="form-control form-control-sm" name="malayalam_document_main" accept=".pdf" />
                  </div>
                )}
              </div>

              <div className="col-12">
                <label className="form-label fw-bold small">Nadar Catholic / Dalit Catholic Details</label>
                <input type="text" className="form-control" name="nadar_arabic" value={editFormData.nadar_arabic} onChange={handleChange} placeholder="If yes, specify..." />
              </div>

              <div className="col-md-12">
                <label className="form-label fw-bold small d-block">Whether Differently Abled</label>
                <div className="form-check form-check-inline">
                  <input className="form-check-input border-primary" type="radio" name="differently_abled" id="main_gen_yes" value="Yes" checked={editFormData.differently_abled === 'Yes'} onChange={handleChange} style={{ border: '1px solid #0d6efd' }} />
                  <label className="form-check-label" htmlFor="main_gen_yes">Yes</label>
                </div>
                <div className="form-check form-check-inline">
                  <input className="form-check-input border-primary" type="radio" name="differently_abled" id="main_gen_no" value="No" checked={editFormData.differently_abled !== 'Yes'} onChange={handleChange} style={{ border: '1px solid #0d6efd' }} />
                  <label className="form-check-label" htmlFor="main_gen_no">No</label>
                </div>

                {editFormData.differently_abled === 'Yes' && (
                  <div className="bg-light p-2 mt-2 rounded-3 border border-dashed border-primary text-center">
                    <label className="form-label d-block small fw-bold mb-1 text-primary">Upload Differently Abled Certificate</label>
                    <input type="file" className="form-control form-control-sm" name="differently_abled_document_main" accept=".pdf" />
                    <div className="form-text small">PDF only</div>
                  </div>
                )}
              </div>

              <div className="col-12 text-end">
                <button type="submit" className="btn btn-success m-1" disabled={editFormData.save_flag}>
                  {editFormData.save_flag ? 'Updating...' : 'Update'}
                </button>
                <button type="button" onClick={closeeditModal} className="btn btn-danger m-1">Cancel</button>
              </div>
            </form>
          </Modal.Body>
        </Modal>

      </div>
    </>
  );
};

const ProfileInfoRow = ({ icon, label, value, hideBorder = false, className = "" }) => (
  <div className={`d-flex align-items-center py-3 ${hideBorder ? '' : 'border-bottom border-light'} ${className}`}>
    <div className="bg-white shadow-sm rounded-3 p-2 me-3 text-primary d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
      <i className={`bi ${icon} fs-5`}></i>
    </div>
    <div>
      <p className="text-muted small text-uppercase fw-bold mb-0 ls-1" style={{ fontSize: '0.65rem' }}>{label}</p>
      <p className="mb-0 text-dark fw-semibold">{value || <span className="text-muted small font-italic fw-normal">Not Provided</span>}</p>
    </div>
  </div>
);

export default CandidateProfile;
