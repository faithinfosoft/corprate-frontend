import React, { useState, useEffect, useRef } from 'react';
import SecureLink from '../SecureLink';
import axios from 'axios';
import { useParams, Link, Navigate } from 'react-router-dom';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import NoDataFound from '../NoDataFound.js';
import useAuth from '../../utilities/useAuth'; // Import the default export
import CandidateSubjects from './CandidateSubjects'; // Import the CandidateSubjects component
import CandidateServiceDetails from './CandidateServiceDetails'; // Import the CandidateSubjects component
import CandidateQualification from './CandidateQualification'; // Import the CandidateSubjects component
import member_image from "../../assets/ui-master/img/no_image _uploaded.jpg";
import logo_image from "../../assets/ui-master/img/logo.png";
import ImageCropper from '../ImageCropperCandicate';
import pdf from "../../assets/ui-master/img/pdf.jpg";
const CandidatePreviewExam = () => {
  const decodeHtml = (html) => {
    if (!html) return "";
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    let str = txt.value.replace(/<[^>]*>?/gm, '');

    // Auto-repair Malayalam Mojibake if text was encoded as Latin-1/Windows-1252
    if (str.includes('Ã Â´') || str.includes('Ã Âµ')) {
      const win1252Map = {
        0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84,
        0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
        0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
        0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
        0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
        0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
        0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F
      };
      try {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
          const code = str.charCodeAt(i);
          if (win1252Map[code] !== undefined) {
            bytes.push(win1252Map[code]);
          } else if (code <= 0xFF) {
            bytes.push(code);
          } else {
            bytes.push(code & 0xFF);
          }
        }
        str = new TextDecoder('utf-8').decode(new Uint8Array(bytes));
      } catch (e) {
        // preserve str if decoding fails
      }
    }

    return str;
  };
  const auth = useAuth();
  const [pdfloading, setPdfLoading] = useState(false);
  const [family, setFamily] = useState([]);
  const [application, setApplication] = useState({});
  const [applicationexam, setApplicationExam] = useState({});

  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [religiouscertificates, setReligiousCertificates] = useState([]);
  const [services, setExperiances] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const candidate_id = auth.user.user_id;

  const { application_id } = useParams();
  const [loaded, setLoaded] = useState(false);
  const [candidateData, setCandidateData] = useState({});
  const [activeTab, setActiveTab] = useState('profile'); // State to manage active tab
  const [modalOpen, setModalOpen] = useState(false);
  const [form_error, setFormError] = useState({});
  const [editImgModalOpen, seteditImgModalOpen] = useState(false);
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
  }, [candidate_id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const isValidDate = (date) => date && !isNaN(new Date(date).getTime());
  const [formData, setFormData] = useState({
    member_image: '',
    candidate_id: '', // Ensure this is initialized
  });



  // Helper function to calculate age
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // Adjust if the birthday hasn't occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const fetchqualifications = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/candidatequalificationdetails/qualification_details', {

        params: {
          fk_candidate_id: candidate_id,
        },
        headers: {
          'Content-Type': 'application/json',
        },



      });
      if (response.data.status) {
        setQualifications(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    if (candidate_id) {
      fetchqualifications();
    }
  }, [candidate_id]);

  const fetchexperiences = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/candidateservicedetails/view_service_details', {

        params: {
          fk_candidate_id: candidate_id,
        },
        headers: {
          'Content-Type': 'application/json',
        },



      });
      if (response.data.status) {
        setExperiances(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    if (candidate_id) {
      fetchexperiences();
    }
  }, [candidate_id]);



  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/CandidateCertificates/view`, {
        params: {
          candidate_id: candidate_id, // Ensure candidate_id is passed correctly
          cert_type: "curricular", // Adjust "cert_type" to its correct value
        },
        headers: {
          'Content-Type': 'application/json', // This header is redundant for GET requests but harmless
        },
      });

      if (response.data?.status) {
        setCertificates(response.data.data); // Set certificates if status is true
      } else {
        console.warn('No data available or invalid response status.');
      }
    } catch (error) {
      console.error('Error fetching certificates:', error.message);
    } finally {
      setLoaded(true); // Ensure loaded is set even if the request fails
    }
  };

  useEffect(() => {
    if (candidate_id) {
      fetchCertificates();
    }
  }, [candidate_id]);


  const fetchfamilymembers = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/candidatefamily/view_family', {

        params: {
          fk_candidate_id: candidate_id,
        },
        headers: {
          'Content-Type': 'application/json',
        },



      });
      if (response.data.status) {
        setFamily(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    if (candidate_id) {
      fetchfamilymembers();
    }
  }, [candidate_id]);



  const fetchCertificates_religious = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/CandidateCertificates/view`, {
        params: {
          candidate_id: candidate_id, // Ensure candidate_id is passed correctly
          cert_type: "religious", // Adjust "cert_type" to its correct value
        },
        headers: {
          'Content-Type': 'application/json', // This header is redundant for GET requests but harmless
        },
      });

      if (response.data?.status) {
        setReligiousCertificates(response.data.data); // Set certificates if status is true
      } else {
        console.warn('No data available or invalid response status.');
      }
    } catch (error) {
      console.error('Error fetching certificates:', error.message);
    } finally {
      setLoaded(true); // Ensure loaded is set even if the request fails
    }
  };

  useEffect(() => {
    if (candidate_id) {
      fetchCertificates_religious();
    }
  }, [candidate_id]);

  const [formState, setFormState] = useState({
    is_presently_employed: "",
    employment_details: "",
    employment_document: null,
    employment_document_url: "",
    is_ever_suspended: "",
    is_convicted: "",
    is_removed_from_psc_list: "",
    is_in_cancelled_rank_list: "",
    rank_list_details: "",
    conviction_details: "",
    suspension_details: "",
    psc_removal_details: "",
    application_no: "",
    receipt_number: "",
  });

  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
    setFormError({ ...form_error, [name]: '' });
  };

  const handleEmploymentDocChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        print_toast("error", "Please upload a PDF document.");
        e.target.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        print_toast("error", "File size should not exceed 5MB.");
        e.target.value = null;
        return;
      }
      setFormState(prev => ({ ...prev, employment_document: file }));
      print_toast("success", `File "${file.name}" selected`);
    }
  };


  const todayStr = new Date().toISOString().substring(0, 10);
  const endStr = String(applicationexam?.end_date || '').substring(0, 10);
  const isClosed = Boolean(endStr && todayStr > endStr);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isClosed) {
      print_toast("error", "This exam is closed. Submissions are no longer accepted.");
      return;
    }

    const errors = {};
    if (!formState.application_no || !formState.application_no.trim()) {
      errors.application_no = "Application No is required.";
    }
    if (!formState.receipt_number || !formState.receipt_number.trim()) {
      errors.receipt_number = "Receipt Number is required.";
    }
    if (!formState.is_presently_employed) {
      errors.is_presently_employed = "This field is required.";
    } else if (formState.is_presently_employed === "Yes") {
      if (!formState.employment_document && !formState.employment_document_url) {
        errors.employment_document = "Employment document (NOC/proof PDF) is mandatory when employed.";
      }
    }
    if (!formState.is_ever_suspended) {
      errors.is_ever_suspended = "This field is required.";
    }
    if (!formState.is_convicted) {
      errors.is_convicted = "This field is required.";
    }
    if (!formState.is_removed_from_psc_list) {
      errors.is_removed_from_psc_list = "This field is required.";
    }
    if (!formState.is_in_cancelled_rank_list) {
      errors.is_in_cancelled_rank_list = "This field is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFormError(prev => ({ ...prev, ...errors }));
      print_toast("error", "Please fill in all mandatory fields.");
      return;
    }

    try {
      const data = new FormData();
      data.append('fk_candidate_id', candidate_id);
      data.append('application_no', formState.application_no.trim());
      data.append('receipt_number', formState.receipt_number.trim());
      data.append('is_ever_suspended', formState.is_ever_suspended);
      data.append('is_convicted', formState.is_convicted);
      data.append('is_removed_from_psc_list', formState.is_removed_from_psc_list);
      data.append('is_in_cancelled_rank_list', formState.is_in_cancelled_rank_list);
      data.append('application_id', application_id);
      data.append('fk_candidate_exam_application_id', applicationexam.candidate_exam_application_id);


      data.append('is_presently_employed', formState.is_presently_employed || '');
      data.append('employment_details', formState.employment_details || '');
      if (formState.employment_document) {
        data.append('employment_document', formState.employment_document);
      }
      data.append('rank_list_details', formState.rank_list_details);
      data.append('conviction_details', formState.conviction_details);
      data.append('suspension_details', formState.suspension_details);
      data.append('psc_removal_details', formState.psc_removal_details);
      data.append('save_flag', true); // Set the save flag



      const response = await axios.post(globalVariables.api_url + '/CandidateExamDetail/save', data);

      console.log(response.data); // Log the response for debugging

      if (response.data.status) {
        await fetchapplication_data();
        // clearDesignationForm();
        print_toast("success", response.data.message);
      } else {
        setFormError(response.data.error || {});
        print_toast("error", response.data.message || "Failed to save details");
      }
    } catch (error) {
      console.error('Error saving data:', error);
      const serverMsg = error.response?.data?.message || error.response?.data?.error || error.message;
      print_toast("error", serverMsg || "An error occurred while saving the data.");
    } finally {
      setFormData(prev => ({ ...prev, save_flag: false }));
    }
  };



  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/CandidateExamDetail/downlod_exam_details_preview`, {
        params: {
          fk_candidate_id: candidate_id,
          fk_candidate_exam_application_id: applicationexam.candidate_exam_application_id
        },
        responseType: 'blob', // Set responseType here
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const applicantName = candidateData?.applicant_name || '';
      const cleanName = applicantName ? applicantName.trim().replace(/[/\\?%*:|"<>]/g, '').trim() : '';
      const downloadFilename = cleanName ? `${cleanName}_Application.pdf` : 'Application.pdf';
      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };







  const fetchapplication_data_exam = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/candidateexamapplication/fetchapplication_data_exam`,
        {
          params: {
            fk_candidate_id: candidate_id,
            application_id: application_id
          },
          headers: { 'Content-Type': 'application/json' },
        }
      );

      // Check if the request was successful
      if (response.data.status) {
        setApplicationExam(response.data.data); // Update application state
      } else {
        console.warn('Failed to fetch application data:', response.data.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);

      // Optional: Show an error notification or update the UI
      // Example: setError('Failed to load application data.');
    } finally {
      setLoaded(true); // Ensure the loading state is updated
    }
  };

  useEffect(() => {
    if (candidate_id) {
      fetchapplication_data_exam();
    }
  }, [candidate_id]);

  const fetchExamDetails = async () => {
    if (!applicationexam?.candidate_exam_application_id) return;

    try {
      const response = await axios.get(`${globalVariables.api_url}/CandidateExamDetail/view`, {
        params: {
          fk_candidate_id: candidate_id,
          fk_candidate_exam_application_id: applicationexam.candidate_exam_application_id
        }
      });

      if (response.data.status && response.data.data) {
        const data = response.data.data;
        const docUrl = data.employment_document_url || (data.employment_document ? `${globalVariables.api_url}/secure_file/candidate_documents/${data.employment_document}` : "");
        setFormState({
          is_presently_employed: data.is_presently_employed || "",
          employment_details: data.employment_details || "",
          employment_document: null,
          employment_document_url: docUrl,
          is_ever_suspended: data.is_ever_suspended || "",
          is_convicted: data.is_convicted || "",
          is_removed_from_psc_list: data.is_removed_from_psc_list || "",
          is_in_cancelled_rank_list: data.is_in_cancelled_rank_list || "",
          rank_list_details: data.rank_list_details || "",
          conviction_details: data.conviction_details || "",
          suspension_details: data.suspension_details || "",
          psc_removal_details: data.psc_removal_details || "",
          application_no: data.application_no || "",
          receipt_number: data.receipt_number || "",
        });
      }
    } catch (error) {
      //  console.error("Error fetching exam details:", error);
    }
  };

  useEffect(() => {
    fetchExamDetails();
  }, [applicationexam]);



  const fetchapplication_data = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidateexamapplication/get_by_id`, {
        params: { candidate_exam_application_id: applicationexam.candidate_exam_application_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setApplication(response.data.data);


      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    if (applicationexam && applicationexam.candidate_exam_application_id) {
      fetchapplication_data();
    }
  }, [applicationexam]);


  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const handleOpenModal = (data) => {
    setCandidateData(data);
    openModal();
  };







  const handlesubmitdata = async (e) => {
    e.preventDefault();

    if (isClosed) {
      print_toast("error", "This exam is closed. Submissions are no longer accepted.");
      return;
    }

    try {
      const data = new FormData();
      // data.append('fk_candidate_id', candidate_id);

      data.append('fk_candidate_exam_application_id', application.candidate_exam_application_id);


      const response = await axios.post(globalVariables.api_url + '/CandidateExamDetail/send', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log(response.data); // Log the response for debugging

      if (response.data.status) {

        print_toast("success", response.data.message);

        navigate('/CandidateExamNotifications');
      } else {
        // setFormError(response.data.error || {});
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error saving data:', error.message);
      print_toast("error", "An error occurred while saving the data.");
    } finally {
      setFormData(prev => ({ ...prev, save_flag: false }));
    }
  };

  return (
    <>
      <div className="row">

        <div className="col-md-12">



          <div className="card-body">
            <div className="row align-items-center">
              {/* Left Section: Header Content */}
              <div className="col-lg-5 col-md-12 text-center text-lg-start mb-3 mb-lg-0">
                <h5 style={{ color: 'brown', marginBottom: 0 }}>
                  <span className="d-block mb-2">CORPORATE MANAGEMENT OF SCHOOLS</span>
                  <span>ARCHEPARCHY OF CHANGANACHERRY</span>
                </h5>
              </div>

              {/* Center Section: Logo */}
              <div className="col-lg-2 col-md-12 text-center mb-3 mb-lg-0">
                <img
                  src={logo_image}
                  alt="Logo"
                  className="img-fluid"
                  style={{ width: '100px', height: '100px' }}
                />
              </div>

              {/* Right Section: Address Content */}
              <div className="col-lg-5 col-md-12 text-center text-lg-end" style={{ color: 'brown' }}>
                <div style={{ marginBottom: '5px' }}>Pastoral Center</div>
                <div style={{ marginBottom: '5px' }}>P.B. No. 20, Changanacherry 686 101</div>
                <div>Ph: 0481-2420378 &nbsp; Office Mob: 9947797841</div>
              </div>
            </div>
          </div>


          <hr style={{
            border: 'none',
            height: '2px',
            background: 'linear-gradient(to right, #6b4226, #c19a6b, #6b4226)',
            margin: '20px 0'
          }} />








          <div className="basic_profile">

            <div class="row">
              <div className="col-md-3">

                <div style={{ textAlign: 'center', width: '160px', margin: '0 auto' }}>
                  <img
                    src={
                      candidateData.photo_url && candidateData.photo_url !== "null" && candidateData.photo_url !== "undefined"
                        ? candidateData.photo_url
                        : (candidateData.photo && candidateData.photo !== "null" && candidateData.photo !== "undefined"
                            ? (candidateData.photo.startsWith('http') || candidateData.photo.startsWith('data:')
                                ? candidateData.photo
                                : `${globalVariables.img_url}/uploads/candidate_photos/${candidateData.photo}`)
                            : member_image)
                    }
                    alt={candidateData.applicant_name}
                    style={{
                      width: '150px',
                      height: '200px',
                      display: 'block',
                      margin: '0 auto',
                      border: '2px solid #000',
                      borderRadius: '4px',
                      padding: '5px',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      const photo = candidateData.photo;
                      const photoUrl = candidateData.photo_url;
                      const candidateImg = (photo && photo !== 'null' && photo !== 'undefined')
                        ? (photo.startsWith('http') ? photo.split('/').pop() : photo)
                        : (photoUrl && photoUrl !== 'null' ? photoUrl.split('/').pop() : null);

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
                          e.target.src = `https://corporate-api.archeparchybookkeeping.org/uploads/candidate_photos/${candidateImg}`;
                          return;
                        } else if (step === 3) {
                          e.target.dataset.fallbackStep = '4';
                          e.target.src = `http://localhost/corporate_management/public/uploads/candidate_photos/${candidateImg}`;
                          return;
                        }
                      }
                      e.target.onerror = null;
                      e.target.src = member_image;
                    }}
                  />

                </div>



              </div>

              <div className="col-md-9">

                {formState.application_no && (
                  <div className="row m-2">
                    <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Application No</div>
                    <div className="col-lg-9 col-md-8 customdata text-primary fw-bold">{formState.application_no}</div>
                  </div>
                )}

                {formState.receipt_number && (
                  <div className="row m-2">
                    <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Receipt Number</div>
                    <div className="col-lg-9 col-md-8 customdata text-success fw-bold">{formState.receipt_number}</div>
                  </div>
                )}

                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Official Name</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.applicant_name}</div>
                </div>

                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Gender</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.gender}</div>
                </div>

                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Marital Status</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.marital_status}</div>
                </div>
                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Address</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.address}</div>
                </div>



                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Parish</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.parish_name},{candidateData.location}</div>
                </div>
                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Date of Birth</div>
                  <div className="col-lg-9 col-md-8 customdata">{formatDate(candidateData.dob)}</div>
                </div>

                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Age</div>
                  <div className="col-lg-9 col-md-8 customdata">
                    {calculateAge(candidateData.dob)}
                  </div>

                </div>
                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Contact Number</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.phone_no}</div>
                </div>
                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Whatsapp Number</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.whatappno}</div>
                </div>

                <div className="row m-2 pt-3">
                  <div className="col-12">
                    <h6 className="fw-bold" style={{ color: "brown", textDecoration: "underline" }}>General Information</h6>
                  </div>
                </div>

                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Malayalam Studied</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.malayalam_details || 'No'}</div>
                </div>
                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>In Corporate Rank List</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.previous_corporate_rank_list || 'No'}</div>
                </div>
                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Four+ Children</div>
                  <div className="col-lg-9 col-md-8 customdata">
                    {candidateData.four_plus_children || 'No'}
                    {candidateData.general_documents?.find(d => d.doc_type === 'four_plus_children') && (
                      <div className="mt-1">
                        <a href={candidateData.general_documents.find(d => d.doc_type === 'four_plus_children').document_url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-danger py-0 px-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                          <i className="bi bi-file-earmark-pdf-fill me-1"></i>View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Married Three+ Children</div>
                  <div className="col-lg-9 col-md-8 customdata">
                    {candidateData.married_three_plus_children || 'No'}
                    {candidateData.general_documents?.find(d => d.doc_type === 'married_three_plus_children') && (
                      <div className="mt-1">
                        <a href={candidateData.general_documents.find(d => d.doc_type === 'married_three_plus_children').document_url} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-danger py-0 px-2 rounded-pill" style={{ fontSize: '0.7rem' }}>
                          <i className="bi bi-file-earmark-pdf-fill me-1"></i>View Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Nadar/Dalit/Kammalar Status</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.nadar_arabic || 'No'}</div>
                </div>
                <div className="row m-2">
                  <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Differently Abled</div>
                  <div className="col-lg-9 col-md-8 customdata">{candidateData.differently_abled || 'No'}</div>
                </div>
              </div>



            </div>


            <hr style={{
              border: 'none',
              height: '2px',
              background: 'linear-gradient(to right, #6b4226, #c19a6b, #6b4226)',
              margin: '20px 0'
            }} />


          </div>

          <div className="container">
            <div class="row">
              <div className="col-md-12">

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h6 style={{ color: "brown", fontWeight: "bold" }}>Qualifications</h6>
                  {/* <Link to={`/CandidateProfile/${candidate_id}`}>
    <span style={{ color: "blue" }}>Edit</span>
  </Link> */}
                </div>



                <div class="accordion" id="accordionExample">
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne">
                      <button class="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                        Academic Qualifications
                      </button>
                    </h2>
                    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                      <div class="accordion-body">
                        <div className="table-responsive">
                          <table className="table table-bordered datatable">
                            <thead>
                              <tr>
                                <th scope="col" className="text-center">Sl No.</th>
                                <th scope="col" className="text-center">Course</th>
                                <th scope="col" className="text-center">Title with optioned Subject/subjects</th>
                                <th scope="col" className="text-center">Main</th>
                                <th scope="col" className="text-center">Subsid. Sec.Lang</th>
                                <th scope="col" className="text-center">Reg.No</th>
                                <th scope="col" className="text-center">College/School</th>
                                <th scope="col" className="text-center">University/Board</th>
                                <th scope="col" className="text-center">Year of passing</th>
                                <th scope="col" className="text-center">% of Mark</th>
                                <th scope="col" className="text-center">Documents</th>
                                <th scope="col" className="text-center">Remarks</th>

                              </tr>
                            </thead>
                            <tbody>
                              {loaded && qualifications.length === 0 ? (
                                <tr>
                                  <td colSpan="12">
                                    <NoDataFound />
                                  </td>
                                </tr>
                              ) : (
                                qualifications.map((qualification, index) => (
                                  qualification.qual_type === "Academic" ? ( // Check the qualification type
                                    <tr key={qualification.qual_id}>
                                      <td className="text-center">{index + 1}</td>
                                      <td className="text-center">{qualification.course}</td>
                                      <td className="text-center">{qualification.title}</td>
                                      <td className="text-center">{qualification.main_subject}</td>
                                      <td className="text-center">{qualification.second_language}</td>
                                      <td className="text-center">{qualification.reg_no}</td>
                                      <td className="text-center">{qualification.school_university}</td>
                                      <td className="text-center">{qualification.university_board}</td>
                                      <td className="text-center">{qualification.year_passing}</td>
                                      <td className="text-center">{qualification.percentage}</td>
                                      <td className="text-center">
                                        {qualification.doc_path ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                              <img
                                                src={pdf}
                                                alt="PDF"
                                                className="pdf-thumbnail"
                                                style={{
                                                  width: '50px',
                                                  height: '70px',
                                                  display: 'block',
                                                }}
                                              />
                                            </SecureLink>
                                          </div>
                                        ) : null}
                                      </td>
                                      <td className="text-center">{qualification.remarks}</td>

                                    </tr>
                                  ) : null // Return null if qualification is not Academic
                                ))
                              )}
                            </tbody>
                          </table>

                        </div>      </div>
                    </div>
                  </div>
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="headingTwo">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                        Professional Qualification
                      </button>
                    </h2>
                    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                      <div class="accordion-body">
                        <div className="table-responsive">
                          <table className="table table-bordered datatable">
                            <thead>
                              <tr>
                                <th scope="col" className="text-center">Sl No.</th>
                                <th scope="col" className="text-center">Course</th>
                                <th scope="col" className="text-center">Title with optioned Subject/subjects</th>
                                <th scope="col" className="text-center">Main</th>
                                <th scope="col" className="text-center">Subsid. Sec.Lang</th>
                                <th scope="col" className="text-center">Reg.No</th>
                                <th scope="col" className="text-center">College/School</th>
                                <th scope="col" className="text-center">University/Board</th>
                                <th scope="col" className="text-center">Year of passing</th>
                                <th scope="col" className="text-center">% of Mark</th>
                                <th scope="col" className="text-center">Documents</th>
                                <th scope="col" className="text-center">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loaded && qualifications.length === 0 ? (
                                <tr>
                                  <td colSpan="9">
                                    <NoDataFound />
                                  </td>
                                </tr>
                              ) : (
                                qualifications.map((qualification, index) => (
                                  qualification.qual_type === "Professional" ? ( // Check the qualification type
                                    <tr key={qualification.qual_id}>
                                      <td className="text-center">{index + 1}</td>
                                      <td className="text-center">{qualification.course}</td>
                                      <td className="text-center">{qualification.title}</td>
                                      <td className="text-center">{qualification.main_subject}</td>
                                      <td className="text-center">{qualification.second_language}</td>
                                      <td className="text-center">{qualification.reg_no}</td>
                                      <td className="text-center">{qualification.school_university}</td>
                                      <td className="text-center">{qualification.university_board}</td>
                                      <td className="text-center">{qualification.year_passing}</td>
                                      <td className="text-center">{qualification.percentage}</td>
                                      <td className="text-center">
                                        {qualification.doc_path ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                              <img
                                                src={pdf}
                                                alt="PDF"
                                                className="pdf-thumbnail"
                                                style={{
                                                  width: '50px',
                                                  height: '70px',
                                                  display: 'block',
                                                }}
                                              />
                                            </SecureLink>
                                          </div>
                                        ) : null}
                                      </td>
                                      <td className="text-center">{qualification.remarks}</td>



                                    </tr>
                                  ) : null
                                ))
                              )}
                            </tbody>
                          </table>

                        </div>       </div>
                    </div>
                  </div>
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="headingThree">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                        Eligibility Test Qualification
                      </button>
                    </h2>
                    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                      <div class="accordion-body">
                        <div className="table-responsive">
                          <table className="table table-bordered datatable">
                            <thead>
                              <tr>
                                <th scope="col" className="text-center">Sl No.</th>
                                <th scope="col" className="text-center">Name of Test</th>
                                <th scope="col" className="text-center">Conducted By Whom</th>
                                <th scope="col" className="text-center">Reg.No</th>
                                <th scope="col" className="text-center">Month and Year of Passing(05/2010)</th>
                                <th scope="col" className="text-center">Certificate No</th>
                                <th scope="col" className="text-center">Date</th>
                                <th scope="col" className="text-center">Documents</th>
                                <th scope="col" className="text-center">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loaded && qualifications.length === 0 ? (
                                <tr>
                                  <td colSpan="9">
                                    <NoDataFound />
                                  </td>
                                </tr>
                              ) : (
                                qualifications.map((qualification, index) => (
                                  qualification.qual_type === "EligibilityTest" ? ( // Check the qualification type
                                    <tr key={qualification.qual_id}>
                                      <td className="text-center">{index + 1}</td>
                                      <td className="text-center">{qualification.course}</td>
                                      <td className="text-center">{qualification.conducted_whom}</td>
                                      <td className="text-center">{qualification.reg_no}</td>
                                      <td className="text-center">{qualification.month_of_passing}</td>
                                      <td className="text-center">{qualification.certificate_no}</td>
                                      <td className="text-center">{qualification.certificate_date}</td>
                                      <td className="text-center">
                                        {qualification.doc_path ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                              <img
                                                src={pdf}
                                                alt="PDF"
                                                className="pdf-thumbnail"
                                                style={{
                                                  width: '50px',
                                                  height: '70px',
                                                  display: 'block',
                                                }}
                                              />
                                            </SecureLink>
                                          </div>
                                        ) : null}
                                      </td>
                                      <td className="text-center">{qualification.remarks}</td>



                                    </tr>
                                  ) : null // Return null if qualification is not Academic
                                ))
                              )}
                            </tbody>
                          </table>

                        </div>



                      </div>
                    </div>
                  </div>

                  <div class="accordion-item">
                    <h2 class="accordion-header" id="headingThree">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                        Department Test Qualification
                      </button>
                    </h2>
                    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                      <div class="accordion-body">
                        <div className="table-responsive">
                          <table className="table table-bordered datatable">
                            <thead>
                              <tr>
                                <th scope="col" className="text-center">Sl No.</th>
                                <th scope="col" className="text-center">Name of Test</th>
                                <th scope="col" className="text-center">Conducted By Whom</th>
                                <th scope="col" className="text-center">Reg.No</th>
                                <th scope="col" className="text-center">Month and Year of Passing(05/2010)</th>
                                <th scope="col" className="text-center">Certificate No</th>
                                <th scope="col" className="text-center">Date</th>
                                <th scope="col" className="text-center">Documents</th>
                                <th scope="col" className="text-center">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loaded && qualifications.length === 0 ? (
                                <tr>
                                  <td colSpan="9">
                                    <NoDataFound />
                                  </td>
                                </tr>
                              ) : (
                                qualifications.map((qualification, index) => (
                                  qualification.qual_type === "DepartmentTest" ? ( // Check the qualification type
                                    <tr key={qualification.qual_id}>
                                      <td className="text-center">{index + 1}</td>
                                      <td className="text-center">{qualification.course}</td>
                                      <td className="text-center">{qualification.conducted_whom}</td>
                                      <td className="text-center">{qualification.reg_no}</td>
                                      <td className="text-center">{qualification.month_of_passing}</td>
                                      <td className="text-center">{qualification.certificate_no}</td>
                                      <td className="text-center">{qualification.certificate_date}</td>
                                      <td className="text-center">
                                        {qualification.doc_path ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                              <img
                                                src={pdf}
                                                alt="PDF"
                                                className="pdf-thumbnail"
                                                style={{
                                                  width: '50px',
                                                  height: '70px',
                                                  display: 'block',
                                                }}
                                              />
                                            </SecureLink>
                                          </div>
                                        ) : null}
                                      </td>
                                      <td className="text-center">{qualification.remarks}</td>



                                    </tr>
                                  ) : null // Return null if qualification is not Academic
                                ))
                              )}
                            </tbody>
                          </table>

                        </div>       </div>
                    </div>
                  </div>


                  <div class="accordion-item">
                    <h2 class="accordion-header" id="headingFour">
                      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseFour">
                        Additional Qualification
                      </button>
                    </h2>
                    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
                      <div class="accordion-body">
                        <div className="table-responsive">
                          <table className="table table-bordered datatable">
                            <thead>
                              <tr>
                                <th scope="col" class="text-center">Sl No.</th>
                                <th scope="col" class="text-center">Course</th>
                                <th scope="col" class="text-center">Title with optioned Subject/subjects</th>
                                <th scope="col" class="text-center">Main</th>
                                <th scope="col" class="text-center">Subsid. Sec.Lang</th>
                                <th scope="col" class="text-center">Reg.No</th>
                                <th scope="col" class="text-center">College/School</th>
                                <th scope="col" class="text-center">University/Board</th>
                                <th scope="col" class="text-center">Year of passing</th>
                                <th scope="col" class="text-center">% of Mark</th>
                                <th scope="col" class="text-center">Documents</th>
                                <th scope="col" class="text-center">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loaded && qualifications.length === 0 ? (
                                <tr>
                                  <td colSpan="9">
                                    <NoDataFound />
                                  </td>
                                </tr>
                              ) : (
                                qualifications.map((qualification, index) => (
                                  qualification.qual_type === "Additional" ? ( // Check the qualification type
                                    <tr key={qualification.qual_id}>
                                      <td className="text-center">{index + 1}</td>
                                      <td className="text-center">{qualification.course}</td>
                                      <td className="text-center">{qualification.title}</td>
                                      <td className="text-center">{qualification.main_subject}</td>
                                      <td className="text-center">{qualification.second_language}</td>
                                      <td className="text-center">{qualification.reg_no}</td>
                                      <td className="text-center">{qualification.school_university}</td>
                                      <td className="text-center">{qualification.university_board}</td>
                                      <td className="text-center">{qualification.year_passing}</td>
                                      <td className="text-center">{qualification.percentage}</td>
                                      <td className="text-center">
                                        {qualification.doc_path ? (
                                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                              <img
                                                src={pdf}
                                                alt="PDF"
                                                className="pdf-thumbnail"
                                                style={{
                                                  width: '50px',
                                                  height: '70px',
                                                  display: 'block',
                                                }}
                                              />
                                            </SecureLink>
                                          </div>
                                        ) : null}
                                      </td>
                                      <td className="text-center">{qualification.remarks}</td>



                                    </tr>
                                  ) : null
                                ))
                              )}
                            </tbody>
                          </table>

                        </div>       </div>
                    </div>
                  </div>

                  <div class="accordion-item">
                    <h2 class="accordion-header" id="headingPublishedWorks">
                      <button
                        class={`accordion-button ${qualifications.some(q => (q?.qual_type || '').toLowerCase().replace(/[\s_]/g, '') === 'publishedworks') ? '' : 'collapsed'}`}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapsePublishedWorks"
                        aria-expanded={qualifications.some(q => (q?.qual_type || '').toLowerCase().replace(/[\s_]/g, '') === 'publishedworks')}
                        aria-controls="collapsePublishedWorks"
                      >
                        Published Works
                      </button>
                    </h2>
                    <div
                      id="collapsePublishedWorks"
                      class={`accordion-collapse collapse ${qualifications.some(q => (q?.qual_type || '').toLowerCase().replace(/[\s_]/g, '') === 'publishedworks') ? 'show' : ''}`}
                      aria-labelledby="headingPublishedWorks"
                      data-bs-parent="#accordionExample"
                    >
                      <div class="accordion-body">
                        <div className="table-responsive">
                          <table className="table table-bordered datatable">
                            <thead>
                              <tr>
                                <th scope="col" className="text-center">Sl No.</th>
                                <th scope="col" className="text-center">Title of Work / Article / Book</th>
                                <th scope="col" className="text-center">Publication Type</th>
                                <th scope="col" className="text-center">Publisher / Journal</th>
                                <th scope="col" className="text-center">Publication &amp; Research Identifier</th>
                                <th scope="col" className="text-center">Year of Publication</th>
                                <th scope="col" className="text-center">Documents</th>
                                <th scope="col" className="text-center">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {loaded && qualifications.filter(q => (q?.qual_type || '').toLowerCase().replace(/[\s_]/g, '') === 'publishedworks').length === 0 ? (
                                <tr>
                                  <td colSpan="8">
                                    <NoDataFound />
                                  </td>
                                </tr>
                              ) : (
                                qualifications.filter(q => (q?.qual_type || '').toLowerCase().replace(/[\s_]/g, '') === 'publishedworks').map((qualification, index) => (
                                  <tr key={qualification.qual_id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td className="text-center">{qualification.title}</td>
                                    <td className="text-center">{qualification.course || 'N/A'}</td>
                                    <td className="text-center">{qualification.university_board || 'N/A'}</td>
                                    <td className="text-center">{qualification.reg_no || 'N/A'}</td>
                                    <td className="text-center">{qualification.year_passing || 'N/A'}</td>
                                    <td className="text-center">
                                      {qualification.doc_path && qualification.doc_path !== '' && qualification.doc_path !== 'null' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                          <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                            <img
                                              src={pdf}
                                              alt="PDF"
                                              className="pdf-thumbnail"
                                              style={{
                                                width: '50px',
                                                height: '70px',
                                                display: 'block',
                                              }}
                                            />
                                          </SecureLink>
                                        </div>
                                      ) : null}
                                    </td>
                                    <td className="text-center">{qualification.remarks}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>





            </div>

          </div>


          <hr style={{
            border: 'none',
            height: '2px',
            background: 'linear-gradient(to right, #6b4226, #c19a6b, #6b4226)',
            margin: '20px 0'
          }} />

          <div className="col-lg-12">
            <div className="card">

              <div className="card-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h6 style={{ color: "brown", fontWeight: "bold" }}>Teaching Experience</h6>
                  {/* <Link to={`/CandidateProfile/${candidate_id}`}>
    <span style={{ color: "blue" }}>Edit</span>
  </Link> */}
                </div>
                <div className="table-responsive">
                  <table className="table table-bordered datatable">
                    <thead>
                      <tr>
                        <th scope="col" className="text-center">Sl No.</th>
                        <th scope="col" className="text-center">Institution/Organization Name</th>
                        <th scope="col" className="text-center">Location</th>
                        <th scope="col" className="text-center">Service Start Date</th>
                        <th scope="col" className="text-center">Service End Date</th>
                        <th scope="col" className="text-center">Designation</th>

                      </tr>
                    </thead>
                    <tbody>
                      {loaded && services.length === 0 ? (
                        <tr>
                          <td colSpan="7">
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        services.map((service, index) => (
                          <tr key={service.designation_id}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">{service.institution_organization_name}</td>
                            <td className="text-center">{service.location}</td>



                            <td className="text-center">
                              {isValidDate(service.service_start_date)
                                ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
                                  .format(new Date(service.service_start_date))
                                : ""}
                            </td>

                            <td className="text-center">
                              {isValidDate(service.service_end_date)
                                ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
                                  .format(new Date(service.service_end_date))
                                : ""}
                            </td>


                            <td className="text-center">{service.candidate_designation}</td>



                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>



          <hr style={{
            border: 'none',
            height: '2px',
            background: 'linear-gradient(to right, #6b4226, #c19a6b, #6b4226)',
            margin: '20px 0'
          }} />


          <div className="card">



            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h6 style={{ color: "brown", fontWeight: "bold" }}>Co Curricular Activities</h6>
                {/* <Link to={`/Candidate_co_curricular/${candidate_id}`}>
    <span style={{ color: "blue" }}>Edit</span>
  </Link> */}
              </div>
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Category</th>
                      <th scope="col" className="text-center">Document</th>

                    </tr>
                  </thead>
                  <tbody>
                    {loaded && certificates.length === 0 ? (
                      <tr>
                        <td colSpan="3">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      certificates.map((certificate, index) => (
                        <tr key={certificate.designation_id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">
                            {decodeHtml((certificate.sub_cat_english && certificate.sub_cat_english !== "undefined") ? certificate.sub_cat_english : certificate.category_title)}
                          </td>


                          <td className="text-center">
                            {certificate.doc_url !== '' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <SecureLink href={certificate.doc_url} rel="noopener noreferrer" target='_blank'>
                                  <img
                                    src={pdf}
                                    alt="Link to PDF Document"
                                    className="pdf-thumbnail"
                                    style={{
                                      width: '50px',
                                      height: '70px',
                                      display: 'block',
                                    }}
                                  />
                                </SecureLink>

                              </div>
                            ) : null}
                          </td>






                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


          <hr style={{
            border: 'none',
            height: '2px',
            background: 'linear-gradient(to right, #6b4226, #c19a6b, #6b4226)',
            margin: '20px 0'
          }} />




          <div className="card">



            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h6 style={{ color: "brown", fontWeight: "bold" }}>Religious Activities</h6>
                {/* <Link to={`/Religious_activities/${candidate_id}`}>
    <span style={{ color: "blue" }}>Edit</span>
  </Link> */}
              </div>
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Category</th>
                      <th scope="col" className="text-center">Document</th>

                    </tr>
                  </thead>
                  <tbody>
                    {loaded && religiouscertificates.length === 0 ? (
                      <tr>
                        <td colSpan="3">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      religiouscertificates.map((certificate, index) => (
                        <tr key={certificate.designation_id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">
                            {decodeHtml((certificate.sub_cat_english && certificate.sub_cat_english !== "undefined") ? certificate.sub_cat_english : certificate.category_title)}
                          </td>


                          <td className="text-center">
                            {certificate.doc_url !== '' ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <SecureLink href={certificate.doc_url} rel="noopener noreferrer" target='_blank'>
                                  <img
                                    src={pdf}
                                    alt="Link to PDF Document"
                                    className="pdf-thumbnail"
                                    style={{
                                      width: '50px',
                                      height: '70px',
                                      display: 'block',
                                    }}
                                  />
                                </SecureLink>

                              </div>
                            ) : null}
                          </td>






                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <hr style={{
            border: 'none',
            height: '2px',
            background: 'linear-gradient(to right, #6b4226, #c19a6b, #6b4226)',
            margin: '20px 0'
          }} />



          <div className="card">

            <div className="card-body">

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h6 style={{ color: "brown", fontWeight: "bold" }}>Family Details</h6>
                {/* <Link to={`/CandidateProfile/${candidate_id}`}>
    <span style={{ color: "blue" }}>Edit</span>
  </Link> */}
              </div>
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Official Name</th>
                      <th scope="col" className="text-center">Relationship</th>
                      <th scope="col" className="text-center">Date Of Birth</th>
                      <th scope="col" className="text-center">Gender</th>
                      <th scope="col" className="text-center">Occupation</th>
                      <th scope="col" className="text-center">Corporate Employee</th>
                      <th scope="col" className="text-center">SundaySchool Teacher</th>
                      <th scope="col" className="text-center">SundaySchool Name</th>
                      <th scope="col" className="text-center">Total Service</th>
                      <th scope="col" className="text-center">Catechism Service Book</th>

                    </tr>
                  </thead>
                  <tbody>
                    {loaded && family.length === 0 ? (
                      <tr>
                        <td colSpan="11">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      family.map((f, index) => (
                        <tr key={f.candidate_member_id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{f.official_name}</td>
                          <td className="text-center">{f.relationship}</td>



                          <td className="text-center">
                            {isValidDate(f.dob)
                              ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })
                                .format(new Date(f.dob))
                              : ""}
                          </td>




                          <td className="text-center">{f.gender}</td>
                          <td className="text-center">{f.occupation}</td>
                          <td className="text-center">{f.is_corporate_employee}</td>
                          <td className="text-center">{f.is_sunday_school_teacher}</td>
                          <td className="text-center">{f.sunday_school_name}</td>
                          <td className="text-center">
                            {f.total_service_years != 0 ? f.total_service_years : ''}
                          </td>

                          <td className="text-center">
                            {f.doc_url !== '' ? (
                              <>
                                <a href={f.doc_url} target='_blank' rel="noopener noreferrer">
                                  <img
                                    src={pdf}
                                    alt="Link to PDF Document" // Update alt text for clarity
                                    className="pdf-thumbnail" // Use a CSS class instead of inline styles
                                    style={{
                                      width: '100px',
                                      height: '150px',
                                      display: 'block',
                                    }}
                                  />
                                </a>

                              </>
                            ) : null}
                          </td>



                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>


          <hr style={{
            border: 'none',
            height: '2px',
            background: 'linear-gradient(to right, #6b4226, #c19a6b, #6b4226)',
            margin: '20px 0'
          }} />

          {/* General Documents Section */}
          <div className="card">
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h6 style={{ color: "brown", fontWeight: "bold" }}>General Documents</h6>
              </div>
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Document Type</th>
                      <th scope="col" className="text-center">Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidateData.general_documents && candidateData.general_documents.length > 0 ? (
                      candidateData.general_documents.map((doc, index) => (
                        <tr key={index}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">
                            {doc.doc_type === 'malayalam_study' ? 'Malayalam Studied' :
                              doc.doc_type === 'differently_abled' ? 'Differently Abled Certificate' :
                                doc.doc_type === 'four_plus_children' ? 'Four or More Children' :
                                  doc.doc_type === 'married_three_plus_children' ? 'Married with Three or More Children' :
                                    doc.doc_type}
                          </td>
                          <td className="text-center">
                            {doc.document_url ? (
                              <a href={doc.document_url} target='_blank' rel="noopener noreferrer">
                                <img
                                  src={pdf}
                                  alt="PDF"
                                  style={{
                                    width: '50px',
                                    height: '70px',
                                    display: 'block',
                                    margin: '0 auto'
                                  }}
                                />
                              </a>
                            ) : 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      loaded && (
                        <tr>
                          <td colSpan="3">
                            <NoDataFound />
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>






          <hr style={{
            border: 'none',
            height: '2px',
            background: 'linear-gradient(to right, #6b4226, #c19a6b, #6b4226)',
            margin: '20px 0'
          }} />


          <div className="card">
            <div className="card-body">
              <div className="row">

                <form role="form" onSubmit={handleSubmit} className="row g-3">
                  <div className="col-12">
                    <div className="card shadow-sm border-0 mb-3" style={{ backgroundColor: "#f8fafc", borderLeft: "4px solid #0d6efd" }}>
                      <div className="card-body py-3">
                        <h6 className="fw-bold text-primary mb-3">
                          <i className="bi bi-file-earmark-text me-2"></i>Application &amp; Payment Details
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label fw-bold" htmlFor="application_no">
                              Application No <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${form_error.application_no ? 'is-invalid' : ''}`}
                              id="application_no"
                              name="application_no"
                              placeholder="Enter Application No"
                              value={formState.application_no || ''}
                              onChange={handleRadioChange}
                            />
                            {form_error.application_no && (
                              <div className="text-danger small mt-1">{form_error.application_no}</div>
                            )}
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-bold" htmlFor="receipt_number">
                              Receipt Number <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${form_error.receipt_number ? 'is-invalid' : ''}`}
                              id="receipt_number"
                              name="receipt_number"
                              placeholder="Enter Receipt Number"
                              value={formState.receipt_number || ''}
                              onChange={handleRadioChange}
                            />
                            {form_error.receipt_number && (
                              <div className="text-danger small mt-1">{form_error.receipt_number}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="card shadow-sm border-0 mb-3" style={{ backgroundColor: "#f8fafc", borderLeft: "4px solid #198754" }}>
                      <div className="card-body py-3">
                        <label className="col-sm-12 col-form-label fw-bold" style={{ fontSize: '0.95rem' }}>
                          Whether the applicant is presently employed? <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex align-items-center gap-4 my-2">
                          <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer fw-semibold text-dark">
                            <input
                              type="radio"
                              className="form-check-input mt-0"
                              name="is_presently_employed"
                              value="Yes"
                              checked={formState.is_presently_employed === "Yes"}
                              onChange={handleRadioChange}
                            /> Yes
                          </label>
                          <label className="form-check-label d-flex align-items-center gap-2 cursor-pointer fw-semibold text-dark">
                            <input
                              type="radio"
                              className="form-check-input mt-0"
                              name="is_presently_employed"
                              value="No"
                              checked={formState.is_presently_employed === "No"}
                              onChange={handleRadioChange}
                            /> No
                          </label>
                        </div>
                        {form_error.is_presently_employed && (
                          <div className="text-danger small mt-1 mb-2">{form_error.is_presently_employed}</div>
                        )}
                        {formState.is_presently_employed === "Yes" && (
                          <div className="mt-3 pt-2 border-top">
                            <div className="row g-3">
                              <div className="col-md-8 col-12">
                                <label className="form-label fw-semibold small text-secondary">
                                  Upload Document (PDF only) <span className="text-danger">* (Mandatory)</span>
                                </label>
                                <input
                                  type="file"
                                  className={`form-control ${form_error.employment_document ? 'is-invalid' : ''}`}
                                  accept=".pdf,application/pdf"
                                  onChange={handleEmploymentDocChange}
                                />
                                <div className="form-text small text-muted">Upload NOC, appointment order, or employment proof (PDF, max 5MB).</div>
                                {form_error.employment_document && (
                                  <div className="text-danger small mt-1 fw-semibold">{form_error.employment_document}</div>
                                )}
                                {formState.employment_document_url && (
                                  <div className="mt-2 d-flex align-items-center gap-2">
                                    <SecureLink
                                      href={formState.employment_document_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-success btn-sm d-flex align-items-center gap-2 shadow-sm text-white fw-semibold"
                                    >
                                      <i className="fas fa-file-pdf text-white"></i> View Uploaded Document
                                    </SecureLink>
                                    <span className="badge bg-light text-success border">Already Attached</span>
                                  </div>
                                )}
                                {formState.employment_document && (
                                  <div className="mt-1 small text-success fw-bold">
                                    <i className="fas fa-check-circle me-1"></i> Selected: {formState.employment_document.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="col-12">
                      <label className="col-sm-12 col-form-label">
                        Whether the candidate was ever suspended/dismissed/disqualified/given any punishment
                        from any school/college/University<span className="text-danger">*</span>
                      </label>
                      <input
                        type="radio"
                        name="is_ever_suspended"
                        value="Yes"
                        checked={formState.is_ever_suspended === "Yes"}
                        onChange={handleRadioChange}
                      />{" "}
                      Yes{" "}
                      <input
                        type="radio"
                        name="is_ever_suspended"
                        value="No"
                        checked={formState.is_ever_suspended === "No"}
                        onChange={handleRadioChange}
                      />{" "}
                      No
                      <span className="text-danger">{form_error.is_ever_suspended}</span>
                      {formState.is_ever_suspended === "Yes" && (
                        <>
                          <textarea
                            className="form-control"
                            name="suspension_details"
                            rows="3"
                            placeholder="Provide details here..."
                            value={formState.suspension_details}
                            onChange={handleRadioChange}
                          ></textarea>
                          <span className="text-danger">{form_error.suspension_details}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="col-12">
                      <label className="col-sm-12 col-form-label">
                        Whether the applicant is convicted by any court of law for offence involving moral
                        turpitude<span className="text-danger">*</span>
                      </label>
                      <input
                        type="radio"
                        name="is_convicted"
                        value="Yes"
                        checked={formState.is_convicted === "Yes"}
                        onChange={handleRadioChange}
                      />{" "}
                      Yes{" "}
                      <input
                        type="radio"
                        name="is_convicted"
                        value="No"
                        checked={formState.is_convicted === "No"}
                        onChange={handleRadioChange}
                      />{" "}
                      No
                      <span className="text-danger">{form_error.is_convicted}</span>
                      {formState.is_convicted === "Yes" && (
                        <>
                          <textarea
                            className="form-control"
                            name="conviction_details"
                            rows="3"
                            placeholder="Provide details here..."
                            value={formState.conviction_details}
                            onChange={handleRadioChange}
                          ></textarea>
                          <span className="text-danger">{form_error.conviction_details}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="col-12">
                      <label className="col-sm-12 col-form-label">
                        Whether the name of the applicant is removed from the PSC list on adverse police
                        report<span className="text-danger">*</span>
                      </label>
                      <input
                        type="radio"
                        name="is_removed_from_psc_list"
                        value="Yes"
                        checked={formState.is_removed_from_psc_list === "Yes"}
                        onChange={handleRadioChange}
                      />{" "}
                      Yes{" "}
                      <input
                        type="radio"
                        name="is_removed_from_psc_list"
                        value="No"
                        checked={formState.is_removed_from_psc_list === "No"}
                        onChange={handleRadioChange}
                      />{" "}
                      No
                      <span className="text-danger">{form_error.is_removed_from_psc_list}</span>
                      {formState.is_removed_from_psc_list === "Yes" && (
                        <>
                          <textarea
                            className="form-control"
                            name="psc_removal_details"
                            rows="3"
                            placeholder="Provide details here..."
                            value={formState.psc_removal_details}
                            onChange={handleRadioChange}
                          ></textarea>
                          <span className="text-danger">{form_error.psc_removal_details}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="col-12">
                      <label className="col-sm-12 col-form-label">
                        Were you in the cancelled Rank List? (if yes, state the subject and rank)
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="radio"
                        name="is_in_cancelled_rank_list"
                        value="Yes"
                        checked={formState.is_in_cancelled_rank_list === "Yes"}
                        onChange={handleRadioChange}
                      />{" "}
                      Yes{" "}
                      <input
                        type="radio"
                        name="is_in_cancelled_rank_list"
                        value="No"
                        checked={formState.is_in_cancelled_rank_list === "No"}
                        onChange={handleRadioChange}
                      />{" "}
                      No
                      {/* <p>{application.status}</p> */}

                      <span className="text-danger">{form_error.is_in_cancelled_rank_list}</span>
                      {formState.is_in_cancelled_rank_list === "Yes" && (
                        <>
                          <textarea
                            className="form-control"
                            name="rank_list_details"
                            rows="3"
                            placeholder="Provide details here..."
                            value={formState.rank_list_details}
                            onChange={handleRadioChange}
                          ></textarea>
                          <span className="text-danger">{form_error.rank_list_details}</span>
                        </>
                      )}
                    </div>


                  </div>

                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    {isClosed ? (
                      <div className="alert alert-secondary py-2 px-4 text-center">
                        <strong className="text-danger"><i className="bi bi-clock-history me-1"></i> Exam Application Closed</strong>
                        <span className="d-block small text-muted">The deadline for this exam has passed. Modifications and new submissions are closed.</span>
                        {(application.status == "submitted" || application.status == "requested") && (
                          <a
                            href="#"
                            className="btn btn-sm btn-danger mt-2"
                            onClick={() => handleGeneratePDF(candidateData)}
                          >
                            Print Preview
                          </a>
                        )}
                      </div>
                    ) : (
                      <>
                        {application.status != "submitted" && (
                          <button type="submit" className="btn btn-success">
                            Continue
                          </button>
                        )}
                        {application.status == "submitted" && (
                          <>
                            <a
                              href="#"
                              className="btn btn-danger"
                              onClick={() => handleGeneratePDF(candidateData)}
                            >
                              Print Preview
                            </a>
                            <a href="#" className="btn btn-primary" onClick={() => handleOpenModal(candidateData)}>
                              Send Application Form
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <Modal show={modalIsOpen} onHide={closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Submit Application Form</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form role="form" onSubmit={handlesubmitdata} className="row g-3">
              <div className="col-12">
                <p>Are you sure you want to submit the application?</p>
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-success" onClick={handlesubmitdata}>
              Yes, Send
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalIsOpen(false)}
            >
              Cancel
            </button>
          </Modal.Footer>
        </Modal>


      </div>
    </>
  );
};

export default CandidatePreviewExam;

