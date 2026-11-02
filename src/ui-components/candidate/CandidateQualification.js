import React, { useState, useEffect } from 'react';
import SecureLink from '../SecureLink';
import { useParams } from 'react-router-dom'; // Add this import for useParams
import axios from 'axios';
import NoDataFound from '../NoDataFound.js';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';
import Breadcum from '../Breadcum.js';
import pdf from "../../assets/ui-master/img/pdf.jpg";
import CandidateAcademic from './CandidateAcademic.js'; // Import the CandidateSubjects component
const CandidateQualification = ({ candidateId, readOnly, isProfileLocked }) => {
  const { candidate_id: param_id } = useParams();
  const effective_candidate_id = candidateId || param_id;
  const [academicqualifications, setAcademicQualifications] = useState([]);
  const [tests, setTestsQualifications] = useState([]);
  const [professional, setProfessionalQualifications] = useState([]);

  const [qualifications, setQualifications] = useState([]);

  const [types, setTypes] = useState([]);
  const [identifierType, setIdentifierType] = useState('');
  const [identifierValue, setIdentifierValue] = useState('');

  const getIdentifierPlaceholder = (type) => {
    switch (type) {
      case 'Scopus EID':
        return 'e.g. 2-s2.0-85012345678';
      case 'Web of Science Accession number':
        return 'e.g. WOS:000123456700001';
      case 'ISBN/e-ISBN':
        return 'e.g. 978-3-16-148410-0';
      case 'ISSN/e-ISSN':
        return 'e.g. 2049-3630';
      case 'PMID/PMCID':
        return 'e.g. PMID: 12345678 / PMC1234567';
      case 'DOI':
        return 'e.g. 10.1000/182';
      case 'ORCID ID':
        return 'e.g. 0000-0002-1825-0097';
      default:
        return `Enter ${type}`;
    }
  };

  const handleIdentifierTypeChange = (e) => {
    const selectedType = e.target.value;
    setIdentifierType(selectedType);
    if (!selectedType) {
      setIdentifierValue('');
      setFormData(prev => ({ ...prev, reg_no: '' }));
    } else {
      const combined = identifierValue ? `${selectedType}: ${identifierValue}` : '';
      setFormData(prev => ({ ...prev, reg_no: combined }));
    }
    setFormError(prev => ({ ...prev, reg_no: '' }));
  };

  const handleIdentifierValueChange = (e) => {
    const val = e.target.value;
    setIdentifierValue(val);
    const combined = identifierType ? `${identifierType}: ${val}` : val;
    setFormData(prev => ({ ...prev, reg_no: combined }));
    setFormError(prev => ({ ...prev, reg_no: '' }));
  };
  const [showModal, setShowModal] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [loaded, setLoaded] = useState(false);
  const [formError, setFormError] = useState({});
  const [formeditError, seteditFormError] = useState({});
  const [formData, setFormData] = useState({
    fk_candidate_id: effective_candidate_id,
    course: '',
    title: '',
    reg_no: '',
    university_board: '',
    year_passing: '',
    qual_type: '',
    percentage: '',
    doc_path: null,
    name_of_test: '',
    conducted_whom: '',
    month_of_passing: '',
    certificate_no: '',
    certificate_date: '',
    remarks: '',
    save_flag: false,
    action_type: 'save',
    school_university: '',
    main_subject: '',
    second_language: '',
  });
  const [editFormData, setEditFormData] = useState({

    fk_candidate_id: effective_candidate_id,
    course: '',
    title: '',
    reg_no: '',
    university_board: '',
    year_passing: '',
    qual_type: '',
    percentage: '',
    doc_path: null,
    name_of_test: '',
    conducted_whom: '',
    month_of_passing: '',
    certificate_no: '',
    certificate_date: '',
    remarks: '',
    save_flag: false,
    school_university: '',
    main_subject: '',
    second_language: '',
    action_type: 'update',


  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [designation, setDesignation] = useState({});

  const clearDesignationForm = () => {
    setFormData({
      fk_candidate_id: effective_candidate_id,
      course: '',
      title: '',
      reg_no: '',
      university_board: '',
      year_passing: '',
      qual_type: '',
      percentage: '',
      doc_path: null,
      name_of_test: '',
      conducted_whom: '',
      month_of_passing: '',
      certificate_no: '',
      certificate_date: '',
      remarks: '',
      save_flag: false,
      action_type: 'save',
      school_university: '',
      main_subject: '',
      second_language: '',
    });
    setEditFormData({});
    setIdentifierType('');
    setIdentifierValue('');
    setFormError({});
    seteditFormError({});
    setFileInputKey(Date.now());
  };

  const [pdfFormData, setPdfFormData] = useState({
    qual_id: '',
    doc_path: null,
    save_flag: false
  });
  const [showPdfModal, setShowPdfModal] = useState(false);

  const editPdf = (qualification) => {
    setPdfFormData({
      qual_id: qualification.qual_id,
      doc_path: null,
      save_flag: false
    });
    setShowPdfModal(true);
  };

  const handlePdfFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 500 * 1024) {
      print_toast("error", "File size must be less than 500KB.");
      e.target.value = ""; // Clear the input
      setPdfFormData(prev => ({ ...prev, doc_path: null }));
      return;
    }
    setPdfFormData(prev => ({ ...prev, doc_path: file }));
  };

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFormData.doc_path) {
      print_toast("error", "Please select a PDF file.");
      return;
    }

    if (pdfFormData.doc_path.size > 500 * 1024) {
      print_toast("error", "File size must be less than 500KB.");
      return;
    }

    setPdfFormData(prev => ({ ...prev, save_flag: true }));
    const formDataToSend = new FormData();
    formDataToSend.append('qual_id', pdfFormData.qual_id);
    formDataToSend.append('doc_path', pdfFormData.doc_path);

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/candidatequalificationdetails/update-pdf`,
        formDataToSend,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.status) {
        print_toast("success", response.data.message);
        setShowPdfModal(false);
        fetchqualifications();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error updating PDF:", error.message);
      print_toast("error", "An error occurred.");
    } finally {
      setPdfFormData(prev => ({ ...prev, save_flag: false }));
    }
  };

  const editqualification = (_qualification) => {

    _qualification.save_flag = false;
    _qualification.action_type = 'update';
    _qualification.fk_candidate_id = effective_candidate_id;

    const identifierList = [
      "Scopus EID",
      "Web of Science Accession number",
      "ISBN/e-ISBN",
      "ISSN/e-ISSN",
      "PMID/PMCID",
      "DOI",
      "ORCID ID"
    ];
    let matchedType = '';
    let val = _qualification.reg_no || '';
    if (_qualification.qual_type === 'PublishedWorks' && val) {
      for (const t of identifierList) {
        if (val.startsWith(t + ': ')) {
          matchedType = t;
          val = val.substring((t + ': ').length);
          break;
        } else if (val.startsWith(t + ':')) {
          matchedType = t;
          val = val.substring((t + ':').length).trim();
          break;
        }
      }
      if (!matchedType && val) {
        if (val.toLowerCase().includes('isbn')) matchedType = 'ISBN/e-ISBN';
        else if (val.toLowerCase().includes('issn')) matchedType = 'ISSN/e-ISSN';
        else if (val.toLowerCase().includes('doi') || val.startsWith('10.')) matchedType = 'DOI';
        else if (val.toLowerCase().includes('scopus')) matchedType = 'Scopus EID';
        else if (val.toLowerCase().includes('pmid') || val.toLowerCase().includes('pmc')) matchedType = 'PMID/PMCID';
        else if (val.toLowerCase().includes('orcid')) matchedType = 'ORCID ID';
        else if (val.toLowerCase().includes('wos')) matchedType = 'Web of Science Accession number';
        else matchedType = 'ISBN/e-ISBN';
      }
    }
    setIdentifierType(matchedType);
    setIdentifierValue(val);

    setFormData(_qualification);
    setShowModal(true);
  }

  const fetchTypes = async () => {
    try {
      const response = await axios.post(globalVariables.api_url + '/candidatequalificationdetails/get_type', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.status) {
        const typesData = response.data.data || {};
        if (!typesData.PublishedWorks) {
          typesData.PublishedWorks = 'Published Works';
        }
        setTypes(Object.entries(typesData));
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, [effective_candidate_id]);





  const handleDocumentChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];

    if (file && file.size > 500 * 1024) {
      print_toast("error", "Maximum file size is 500KB.");
      e.target.value = ""; // Clear the input
      setFormData(prev => ({ ...prev, [name]: null }));
      setFormError(prev => ({ ...prev, [name]: "Maximum file size is 500KB." }));
      return;
    } else {
      setFormError(prev => ({ ...prev, [name]: "" }));
    }

    // Handle other forms if necessary
    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

  };




  const handleChange = (e) => {
    const { name, value } = e.target;

    if (e.target.type === 'file') {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
    if (name === 'qual_type' && value !== 'PublishedWorks') {
      setIdentifierType('');
      setIdentifierValue('');
    }
    if (modalIsOpen) {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormError(prevErrors => ({ ...prevErrors, [name]: '' }));
    seteditFormError(prevErrors => ({ ...prevErrors, [name]: '' }));
  };





  // const handleSubmit = async (e, closeModal = false) => {
  //   e.preventDefault();

  //   const formDataToSend = new FormData();
  //   for (const key in formData) {
  //     formDataToSend.append(key, formData[key]);
  //   }

  //   try {
  //     let response;
  //     const config = {
  //       headers: { 'Content-Type': 'multipart/form-data' }
  //     };

  //     if (formData.action_type === "save") {
  //       response = await axios.post(
  //         `${globalVariables.api_url}/candidatequalificationdetails/save`,
  //         formDataToSend,
  //         config
  //       );
  //     } else if (formData.action_type === "update") {
  //       response = await axios.post(
  //         `${globalVariables.api_url}/candidatequalificationdetails/update_qualification_details`,
  //         formDataToSend,
  //         config
  //       );
  //     }

  //     // Rest of the function remains the same
  //   } catch (error) {
  //     console.error("Error saving data:", error.message);
  //   }
  // };




  const validateForm = () => {
    const errors = {};
    if (!formData.qual_type) {
      errors.qual_type = "Qualification type is required.";
      return errors;
    }

    if (formData.qual_type === "PublishedWorks") {
      if (!formData.course || !formData.course.trim()) {
        errors.course = "Publication type is required.";
      }
      if (!formData.title || !formData.title.trim()) {
        errors.title = "Title of published work is required.";
      }
      if (!formData.university_board || !formData.university_board.trim()) {
        errors.university_board = "Publisher / Journal / Organization is required.";
      }
      if (!formData.year_passing || !String(formData.year_passing).trim()) {
        errors.year_passing = "Year of publication is required.";
      } else if (!/^\d{4}$/.test(String(formData.year_passing).trim())) {
        errors.year_passing = "Year of publication must be a valid 4-digit year.";
      }
      if (identifierType && (!identifierValue || !identifierValue.trim())) {
        errors.reg_no = `Please enter ${identifierType}.`;
      }
    } else if (formData.qual_type === "Academic" || formData.qual_type === "Professional") {
      if (!formData.course) {
        errors.course = "Course name is required.";
      }
      if (!formData.title || !formData.title.trim()) {
        errors.title = "Title is required.";
      }
      if (formData.qual_type === "Academic") {
        if (!(formData.course === 'SSLC/Equivalent' || formData.course === 'SSC/Equivalent' || formData.course === 'HSE/VHSE/Pre-Degree')) {
          if (!formData.main_subject || !formData.main_subject.trim()) {
            errors.main_subject = "Main is required.";
          }
        }
        if (!(formData.course === 'SSLC/Equivalent' || formData.course === 'SSC/Equivalent')) {
          if (!formData.second_language || !formData.second_language.trim()) {
            errors.second_language = "Subsidary/Second Language name is required.";
          }
        }
      } else {
        if (!formData.main_subject || !formData.main_subject.trim()) {
          errors.main_subject = "Main is required.";
        }
        if (!formData.second_language || !formData.second_language.trim()) {
          errors.second_language = "Subsidary/Second Language name is required.";
        }
      }
      if (!formData.school_university || !formData.school_university.trim()) {
        errors.school_university = "College/School name is required.";
      }
      if (!formData.reg_no || !formData.reg_no.trim()) {
        errors.reg_no = "Registration number is required.";
      }
      if (!formData.university_board || !formData.university_board.trim()) {
        errors.university_board = "University/Board name is required.";
      }
      if (!formData.year_passing || !String(formData.year_passing).trim()) {
        errors.year_passing = "Year of passing is required.";
      }
      if (!formData.percentage || !String(formData.percentage).trim()) {
        errors.percentage = "Percentage is required.";
      }
    } else if (formData.qual_type === "EligibilityTest" || formData.qual_type === "DepartmentTest") {
      if (!formData.course) {
        errors.course = "Course name is required.";
      }
      if (!formData.name_of_test || !formData.name_of_test.trim()) {
        errors.name_of_test = "Name of test is required.";
      }
      if (!formData.conducted_whom || !formData.conducted_whom.trim()) {
        errors.conducted_whom = "Conducted by is required.";
      }
      if (!formData.month_of_passing || !formData.month_of_passing.trim()) {
        errors.month_of_passing = "Month of passing is required.";
      }
      if (!formData.certificate_no || !formData.certificate_no.trim()) {
        errors.certificate_no = "Certificate number is required.";
      }
      if (!formData.certificate_date) {
        errors.certificate_date = "Certificate date is required.";
      }
    } else if (formData.qual_type === "Additional") {
      if (!formData.title || !formData.title.trim()) {
        errors.title = "Title is required.";
      }
    }
    return errors;
  };

  const handleSubmit = async (e, closeModal = false) => {
    e.preventDefault();

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFormError(clientErrors);
      print_toast("error", "Please fill in all required fields.");
      return;
    }

    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === 'reg_no' && formData.qual_type === 'PublishedWorks') {
        const finalRegNo = identifierType ? (identifierValue ? `${identifierType}: ${identifierValue}` : '') : (formData.reg_no || '');
        formDataToSend.append(key, finalRegNo);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      let response;
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };

      if (formData.action_type === "save") {
        response = await axios.post(
          `${globalVariables.api_url}/candidatequalificationdetails/save`,
          formDataToSend,
          config
        );
      } else if (formData.action_type === "update") {
        response = await axios.post(
          `${globalVariables.api_url}/candidatequalificationdetails/update_qualification_details`,
          formDataToSend,
          config
        );
      }

      setFormData(prevFormData => ({
        ...prevFormData,
        save_flag: false
      }));
      if (response.data.status) {
        await fetchqualifications();
        clearDesignationForm();
        print_toast("success", response.data.message);
        if (closeModal || formData.action_type === "update") {
          setShowModal(false);
        }
      } else {
        let error = response.data.error;
        print_toast("error", response.data.message);
        setFormError(error || {});
      }
    } catch (error) {
      console.error('Error saving designation:', error.message);
    } finally {
      setFormData(prevFormData => ({
        ...prevFormData,
        save_flag: false
      }));
    }
  };

  const handleOpenModal = () => {
    setIdentifierType('');
    setIdentifierValue('');

    setFormData({
      fk_candidate_id: effective_candidate_id,
      course: '',
      title: '',
      reg_no: '',
      university_board: '',
      year_passing: '',
      qual_type: '',
      percentage: '',
      doc_path: null,
      name_of_test: '',
      conducted_whom: '',
      month_of_passing: '',
      certificate_no: '',
      certificate_date: '',
      remarks: '',
      save_flag: false,
      action_type: 'save',
      school_university: '',
      main_subject: '',
      second_language: '',

    });
    setFileInputKey(Date.now());
    setShowModal(true);
  };




  const handleCloseModal = () => {
    setShowModal(false);
    clearDesignationForm();
  };


  const fetchAcademicQualifications = async () => {
    try {
      const response = await axios.post(globalVariables.api_url + '/candidatequalificationdetails/academic_qualifications', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.status) {
        // Assuming response.data.data is the object containing the qualifications
        setAcademicQualifications(Object.entries(response.data.data)); // Convert object to array of [key, value]
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchAcademicQualifications();
  }, [effective_candidate_id]);




  const test = async () => {
    try {
      const response = await axios.post(globalVariables.api_url + '/candidatequalificationdetails/test', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.status) {
        // Assuming response.data.data is the object containing the qualifications
        let qualData = { ...response.data.data };
        if (!qualData['GATE']) {
          const entries = Object.entries(qualData);
          const setIndex = entries.findIndex(([key]) => key === 'SET');
          if (setIndex !== -1) {
            entries.splice(setIndex + 1, 0, ['GATE', 'GATE']);
          } else {
            entries.push(['GATE', 'GATE']);
          }
          setTestsQualifications(entries);
        } else {
          setTestsQualifications(Object.entries(qualData));
        }
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    test();
  }, [effective_candidate_id]);


  const fetchproffessional = async () => {
    try {
      const response = await axios.post(globalVariables.api_url + '/candidatequalificationdetails/proffessional', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.status) {
        // Assuming response.data.data is the object containing the qualifications
        setProfessionalQualifications(Object.entries(response.data.data)); // Convert object to array of [key, value]
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchproffessional();
  }, [effective_candidate_id]);



  const fetchqualifications = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/candidatequalificationdetails/qualification_details', {

        params: {
          fk_candidate_id: effective_candidate_id,
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
    fetchqualifications();
  }, [effective_candidate_id]);


  const handleDelete = async (_qualification) => {

    try {
      const response = await axios.post(globalVariables.api_url + '/candidatequalificationdetails/delete_qualification_details', {
        qual_id: _qualification.qual_id,
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.status) {
        await fetchqualifications();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting designation:', error.message);
    }

  };

  return (
    <>
      {/* <Breadcum items={breadcum} title="Designations" /> */}

      <div className="d-flex justify-content-between align-items-center mb-3">
        {!readOnly && <button className="btn btn-primary" onClick={() => handleOpenModal()}>Add Qualification</button>}
      </div>
      <div className="row">
        <div class="accordion" id="accordionExample">
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingAcademic">
              <button class="accordion-button " type="button" data-bs-toggle="collapse" data-bs-target="#collapseAcademic" aria-expanded="true" aria-controls="collapseAcademic">
                Academic Qualifications
              </button>
            </h2>
            <div id="collapseAcademic" class="accordion-collapse collapse show" aria-labelledby="headingAcademic" data-bs-parent="#accordionExample">
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
                        {!readOnly && <th scope="col" className="text-center">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loaded && qualifications.filter(q => q.qual_type === "Academic").length === 0 ? (
                        <tr>
                          <td colSpan="13">
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        qualifications.filter(q => q.qual_type === "Academic").map((qualification, index) => (
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
                              {qualification.doc_path && qualification.doc_path !== '' && qualification.doc_path !== 'null' && (
                                <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                  <img
                                    src={pdf}
                                    alt="PDF"
                                    className="pdf-thumbnail mb-1"
                                    style={{ width: '30px', height: '30px' }}
                                  />
                                </SecureLink>
                              )}
                              {!isProfileLocked && (!qualification.doc_path || qualification.doc_path === '' || qualification.doc_path === 'null') && (
                                <button
                                  className="btn btn-primary btn-sm d-block mx-auto"
                                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                  onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                >
                                  Upload Document
                                </button>
                              )}
                            </td>
                            <td className="text-center">{qualification.remarks}</td>
                            {!isProfileLocked && !readOnly && (
                              <td className="fw-bold text-center">
                                <div className="dropdown">
                                  <button
                                    className="btn btn-dark dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    Action
                                  </button>
                                  <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                      >
                                        Update Document
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={() => editqualification(qualification)}
                                      >
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        disabled={qualification.delete_flag}
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.preventDefault(); // Prevent default link behavior
                                          if (window.confirm('Are you sure you want to delete this data?')) {
                                            handleDelete(qualification);
                                          }
                                        }}
                                      >
                                        {qualification.delete_flag ? 'Deleting...' : 'Delete'}
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                </div>      </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingProfessional">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseProfessional" aria-expanded="false" aria-controls="collapseProfessional">
                Professional Qualification
              </button>
            </h2>
            <div id="collapseProfessional" class="accordion-collapse collapse" aria-labelledby="headingProfessional" data-bs-parent="#accordionExample">
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
                        {!readOnly && <th scope="col" className="text-center">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loaded && qualifications.filter(q => q.qual_type === "Professional").length === 0 ? (
                        <tr>
                          <td colSpan="13">
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        qualifications.filter(q => q.qual_type === "Professional").map((qualification, index) => (
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
                              {qualification.doc_path && qualification.doc_path !== '' && qualification.doc_path !== 'null' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                    <img
                                      src={pdf}
                                      alt="Link to PDF Document"
                                      className="pdf-thumbnail mb-1"
                                      style={{
                                        width: '30px',
                                        height: '30px',
                                        display: 'block',
                                      }}
                                    />
                                  </SecureLink>
                                </div>
                              )}
                              {!isProfileLocked && (!qualification.doc_path || qualification.doc_path === '' || qualification.doc_path === 'null') && (
                                <button
                                  className="btn btn-primary btn-sm d-block mx-auto"
                                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                  onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                >
                                  Upload Document
                                </button>
                              )}
                            </td>



                            <td className="text-center">{qualification.remarks}</td>

                            {!isProfileLocked && !readOnly && (
                              <td className="fw-bold text-center">
                                <div className="dropdown">
                                  <button
                                    className="btn btn-dark dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    Action
                                  </button>
                                  <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={() => editqualification(qualification)}
                                      >
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        disabled={qualification.delete_flag}
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.preventDefault(); // Prevent default link behavior
                                          if (window.confirm('Are you sure you want to delete this data?')) {
                                            handleDelete(qualification);
                                          }
                                        }}
                                      >
                                        {qualification.delete_flag ? 'Deleting...' : 'Delete'}
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                </div>       </div>
            </div>
          </div>
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingEligibility">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseEligibility" aria-expanded="false" aria-controls="collapseEligibility">
                Eligibility Test Qualification
              </button>
            </h2>
            <div id="collapseEligibility" class="accordion-collapse collapse" aria-labelledby="headingEligibility" data-bs-parent="#accordionExample">
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
                        {!readOnly && <th scope="col" className="text-center">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loaded && qualifications.filter(q => q.qual_type === "EligibilityTest").length === 0 ? (
                        <tr>
                          <td colSpan="10">
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        qualifications.filter(q => q.qual_type === "EligibilityTest").map((qualification, index) => (
                          <tr key={qualification.qual_id}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">{qualification.course}</td>
                            <td className="text-center">{qualification.conducted_whom}</td>
                            <td className="text-center">{qualification.reg_no}</td>
                            <td className="text-center">{qualification.month_of_passing}</td>
                            <td className="text-center">{qualification.certificate_no}</td>
                            <td className="text-center">{qualification.certificate_date}</td>
                            <td className="text-center">
                              {qualification.doc_path && qualification.doc_path !== '' && qualification.doc_path !== 'null' && (
                                <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                  <img
                                    src={pdf}
                                    alt="PDF"
                                    className="pdf-thumbnail mb-1"
                                    style={{ width: '30px', height: '30px' }}
                                  />
                                </SecureLink>
                              )}
                              {!isProfileLocked && (!qualification.doc_path || qualification.doc_path === '' || qualification.doc_path === 'null') && (
                                <button
                                  className="btn btn-primary btn-sm d-block mx-auto"
                                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                  onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                >
                                  Upload Document
                                </button>
                              )}
                            </td>
                            <td className="text-center">{qualification.remarks}</td>

                            {!isProfileLocked && !readOnly && (
                              <td className="fw-bold text-center">
                                <div className="dropdown">
                                  <button
                                    className="btn btn-dark dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    Action
                                  </button>
                                  <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                      >
                                        Update Document
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={() => editqualification(qualification)}
                                      >
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        disabled={qualification.delete_flag}
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.preventDefault(); // Prevent default link behavior
                                          if (window.confirm('Are you sure you want to delete this data?')) {
                                            handleDelete(qualification);
                                          }
                                        }}
                                      >
                                        {qualification.delete_flag ? 'Deleting...' : 'Delete'}
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            )}

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                </div>



              </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header" id="headingDepartment">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDepartment" aria-expanded="false" aria-controls="collapseDepartment">
                Department Test Qualification
              </button>
            </h2>
            <div id="collapseDepartment" class="accordion-collapse collapse" aria-labelledby="headingDepartment" data-bs-parent="#accordionExample">
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
                        {!readOnly && <th scope="col" className="text-center">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loaded && qualifications.filter(q => q.qual_type === "DepartmentTest").length === 0 ? (
                        <tr>
                          <td colSpan="10">
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        qualifications.filter(q => q.qual_type === "DepartmentTest").map((qualification, index) => (
                          <tr key={qualification.qual_id}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">{qualification.course}</td>
                            <td className="text-center">{qualification.conducted_whom}</td>
                            <td className="text-center">{qualification.reg_no}</td>
                            <td className="text-center">{qualification.month_of_passing}</td>
                            <td className="text-center">{qualification.certificate_no}</td>
                            <td className="text-center">{qualification.certificate_date}</td>
                            <td className="text-center">
                              {qualification.doc_path && qualification.doc_path !== '' && qualification.doc_path !== 'null' ? (
                                <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                  <img
                                    src={pdf}
                                    alt="PDF"
                                    style={{ width: '30px', height: '30px' }}
                                  />
                                </SecureLink>
                              ) : 'N/A'}
                            </td>
                            <td className="text-center">{qualification.remarks}</td>

                            {!readOnly && (
                              <td className="fw-bold text-center">
                                <div className="dropdown">
                                  <button
                                    className="btn btn-dark dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    Action
                                  </button>
                                  <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                      >
                                        Update Document
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={() => editqualification(qualification)}
                                      >
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        disabled={qualification.delete_flag}
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.preventDefault(); // Prevent default link behavior
                                          if (window.confirm('Are you sure you want to delete this data?')) {
                                            handleDelete(qualification);
                                          }
                                        }}
                                      >
                                        {qualification.delete_flag ? 'Deleting...' : 'Delete'}
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            )}

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                </div>       </div>
            </div>
          </div>


          <div class="accordion-item">
            <h2 class="accordion-header" id="headingAdditional">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseAdditional" aria-expanded="false" aria-controls="collapseAdditional">
                Additional Qualification
              </button>
            </h2>
            <div id="collapseAdditional" class="accordion-collapse collapse" aria-labelledby="headingAdditional" data-bs-parent="#accordionExample">
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
                        {!readOnly && <th scope="col" className="text-center">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loaded && qualifications.filter(q => q.qual_type === "Additional").length === 0 ? (
                        <tr>
                          <td colSpan="13">
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        qualifications.filter(q => q.qual_type === "Additional").map((qualification, index) => (
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
                              {qualification.doc_path && qualification.doc_path !== '' && qualification.doc_path !== 'null' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target='_blank'>
                                    <img
                                      src={pdf}
                                      alt="Link to PDF Document"
                                      className="pdf-thumbnail mb-1"
                                      style={{
                                        width: '30px',
                                        height: '30px',
                                        display: 'block',
                                      }}
                                    />
                                  </SecureLink>
                                </div>
                              ) : null}
                              {!isProfileLocked && (!qualification.doc_path || qualification.doc_path === '' || qualification.doc_path === 'null') && (
                                <button
                                  className="btn btn-primary btn-sm d-block mx-auto"
                                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                  onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                >
                                  Upload Document
                                </button>
                              )}
                            </td>
                            <td className="text-center">{qualification.remarks}</td>

                            {!isProfileLocked && !readOnly && (
                              <td className="fw-bold text-center">
                                <div className="dropdown">
                                  <button
                                    className="btn btn-dark dropdown-toggle"
                                    type="button"
                                    id="dropdownMenuButton1"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    Action
                                  </button>
                                  <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                      >
                                        Update Document
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={() => editqualification(qualification)}
                                      >
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        disabled={qualification.delete_flag}
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.preventDefault(); // Prevent default link behavior
                                          if (window.confirm('Are you sure you want to delete this data?')) {
                                            handleDelete(qualification);
                                          }
                                        }}
                                      >
                                        {qualification.delete_flag ? 'Deleting...' : 'Delete'}
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                </div>       </div>
            </div>
          </div>

          <div class="accordion-item">
            <h2 class="accordion-header" id="headingPublishedWorks">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePublishedWorks" aria-expanded="false" aria-controls="collapsePublishedWorks">
                Published Works
              </button>
            </h2>
            <div id="collapsePublishedWorks" class="accordion-collapse collapse" aria-labelledby="headingPublishedWorks" data-bs-parent="#accordionExample">
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
                        {!readOnly && <th scope="col" className="text-center">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loaded && qualifications.filter(q => q.qual_type === "PublishedWorks").length === 0 ? (
                        <tr>
                          <td colSpan="9">
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        qualifications.filter(q => q.qual_type === "PublishedWorks").map((qualification, index) => (
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
                                      alt="Link to PDF Document"
                                      className="pdf-thumbnail mb-1"
                                      style={{
                                        width: '30px',
                                        height: '30px',
                                        display: 'block',
                                      }}
                                    />
                                  </SecureLink>
                                </div>
                              ) : null}
                              {!isProfileLocked && (!qualification.doc_path || qualification.doc_path === '' || qualification.doc_path === 'null') && (
                                <button
                                  className="btn btn-primary btn-sm d-block mx-auto"
                                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                  onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                >
                                  Upload Document
                                </button>
                              )}
                            </td>
                            <td className="text-center">{qualification.remarks}</td>

                            {!isProfileLocked && !readOnly && (
                              <td className="fw-bold text-center">
                                <div className="dropdown">
                                  <button
                                    className="btn btn-dark dropdown-toggle"
                                    type="button"
                                    id={`dropdownMenuButtonPublished_${qualification.qual_id}`}
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                  >
                                    Action
                                  </button>
                                  <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButtonPublished_${qualification.qual_id}`}>
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={(e) => { e.preventDefault(); editPdf(qualification); }}
                                      >
                                        Update Document
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        className="dropdown-item"
                                        onClick={() => editqualification(qualification)}
                                      >
                                        Edit
                                      </a>
                                    </li>
                                    <li>
                                      <a
                                        href="#"
                                        disabled={qualification.delete_flag}
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (window.confirm('Are you sure you want to delete this data?')) {
                                            handleDelete(qualification);
                                          }
                                        }}
                                      >
                                        {qualification.delete_flag ? 'Deleting...' : 'Delete'}
                                      </a>
                                    </li>
                                  </ul>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>       </div>
            </div>
          </div>
        </div>
      </div>



      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>  {formData.action_type === "save" ? "Create Qualification" : "Edit Qualification"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
            {/* {JSON.stringify(formData,null,2)}  */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">
                Select Qualification<span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                name="qual_type" // This matches your state definition
                value={formData.qual_type} // Use qual_type
                onChange={handleChange}
              >
                <option value="">Select Qualification</option>
                {loaded && types.length > 0 ? (
                  types.map(([key, value], index) => (
                    <option key={index} value={key}>
                      {value}
                    </option>
                  ))
                ) : (
                  <option disabled>Loading...</option>
                )}
              </select>
              <span className="text-danger">{formError.qual_type}</span>
            </div>

            <div className="col-md-12">


              {(
                formData.qual_type === "Academic" ||
                formData.qual_type === "EligibilityTest" ||
                formData.qual_type === "Professional" ||
                formData.qual_type === "DepartmentTest"
              ) && (
                  <label className="col-sm-12 col-form-label">
                    Course<span className="text-danger">*</span>
                  </label>
                )}


              {formData.qual_type === "Academic" && (
                <select
                  className="form-control"
                  name="course" // Ensure this matches your state and backend
                  value={formData.course} // Update value to qualification_type
                  onChange={handleChange}
                >
                  <option value="">Select </option> {/* Default option */}
                  {loaded && academicqualifications.length > 0 ? (
                    academicqualifications.map(([key, value], index) => (
                      <option key={index} value={key}>
                        {value}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option> // Loading state
                  )}
                </select>

              )}

              {formData.qual_type === "EligibilityTest" && (
                <select
                  className="form-control"
                  name="course" // Ensure this matches your state and backend
                  value={formData.course} // Update value to qualification_type
                  onChange={handleChange}
                >
                  <option value="">Select </option> {/* Default option */}
                  {loaded && tests.length > 0 ? (
                    tests.map(([key, value], index) => (
                      <option key={index} value={key}>
                        {value}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option> // Loading state
                  )}
                </select>
              )}

              {formData.qual_type === "Professional" && (
                <select
                  className="form-control"
                  name="course" // Ensure this matches your state and backend
                  value={formData.course} // Update value to qualification_type
                  onChange={handleChange}
                >
                  <option value="">Select </option> {/* Default option */}
                  {loaded && professional.length > 0 ? (
                    professional.map(([key, value], index) => (
                      <option key={index} value={key}>
                        {value}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading...</option> // Loading state
                  )}
                </select>
              )}


              {formData.qual_type === "DepartmentTest" && (
                <input type="text"
                  className="form-control"
                  name="course" // Ensure this matches your state and backend
                  value={formData.course} // Update value to qualification_type
                  onChange={handleChange}
                />

              )}

              {formData.qual_type === "PublishedWorks" && (
                <>
                  <label className="col-sm-12 col-form-label">
                    Publication Type<span className="text-danger">*</span>
                  </label>
                  <select
                    className={`form-control ${formError.course ? 'is-invalid' : ''}`}
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                  >
                    <option value="">Select Publication Type</option>
                    <option value="Journal Article">Journal Article</option>
                    <option value="Book">Book</option>
                    <option value="Research Paper">Research Paper</option>
                    <option value="Conference Paper">Conference Paper</option>
                    <option value="Book Chapter">Book Chapter</option>
                    <option value="Monograph">Monograph</option>
                    <option value="Other">Other</option>
                  </select>
                </>
              )}
              <span className="text-danger">{formError.course}</span>
            </div>


            {(formData.qual_type === "Academic" || formData.qual_type === "Professional" || formData.qual_type === "Additional" || formData.qual_type === "PublishedWorks") && (
              <>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">{formData.qual_type === "PublishedWorks" ? "Title of Published Work / Article / Book" : "Title"}<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                  />


                  <span className="text-danger">{formError.title}</span>
                </div>

              </>
            )}


            {(formData.qual_type === "Academic" || formData.qual_type === "Professional") && (
              <>

                {!(formData.qual_type === "Academic" && (formData.course === 'SSLC/Equivalent' || formData.course === 'SSC/Equivalent' || formData.course === 'HSE/VHSE/Pre-Degree')) && (
                  <div className="col-md-12">
                    <label className="col-sm-12 col-form-label">Main Subject<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="main_subject"
                      value={formData.main_subject}
                      onChange={handleChange}
                    />
                    <span className="text-danger">{formError.main_subject}</span>
                  </div>
                )}


                {!(formData.qual_type === "Academic" && (formData.course === 'SSLC/Equivalent' || formData.course === 'SSC/Equivalent')) && (
                  <div className="col-md-12">
                    <label className="col-sm-12 col-form-label">
                      Subsidary/Second Language <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formError.second_language ? 'is-invalid' : ''}`}
                      name="second_language"
                      value={formData.second_language}
                      onChange={handleChange}
                    />
                    <div className="invalid-feedback">{formError.second_language}</div>
                  </div>
                )}



                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">College/School<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="school_university"
                    value={formData.school_university}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.school_university}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">Registration Number<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="reg_no"
                    value={formData.reg_no}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.reg_no}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">University/Board<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="university_board"
                    value={formData.university_board}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.university_board}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">Year of Passing<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="year_passing"
                    value={formData.year_passing}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.year_passing}</span>
                </div>



                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">Percentage<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.percentage}</span>
                </div>


              </>
            )}






            {(formData.qual_type === "Additional") && (
              <>




                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">College/School</label>
                  <input
                    type="text"
                    className="form-control"
                    name="school_university"
                    value={formData.school_university}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.school_university}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">Registration Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="reg_no"
                    value={formData.reg_no}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.reg_no}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">University/Board</label>
                  <input
                    type="text"
                    className="form-control"
                    name="university_board"
                    value={formData.university_board}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.university_board}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">Year of Passing</label>
                  <input
                    type="text"
                    className="form-control"
                    name="year_passing"
                    value={formData.year_passing}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.year_passing}</span>
                </div>



                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">Percentage</label>
                  <input
                    type="text"
                    className="form-control"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.percentage}</span>
                </div>


              </>
            )}

            {(formData.qual_type === "PublishedWorks") && (
              <>
                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">
                    Publisher / Journal / Organization<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formError.university_board ? 'is-invalid' : ''}`}
                    name="university_board"
                    value={formData.university_board}
                    onChange={handleChange}
                    placeholder="e.g. Oxford University Press, IEEE, Springer, etc."
                  />
                  <span className="text-danger">{formError.university_board}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">Publication &amp; Research Identifiers</label>
                  <select
                    className="form-control"
                    name="identifier_type"
                    value={identifierType}
                    onChange={handleIdentifierTypeChange}
                  >
                    <option value="">Select Identifier</option>
                    <option value="Scopus EID">Scopus EID</option>
                    <option value="Web of Science Accession number">Web of Science Accession number</option>
                    <option value="ISBN/e-ISBN">ISBN/e-ISBN</option>
                    <option value="ISSN/e-ISSN">ISSN/e-ISSN</option>
                    <option value="PMID/PMCID">PMID/PMCID</option>
                    <option value="DOI">DOI</option>
                    <option value="ORCID ID">ORCID ID</option>
                  </select>
                </div>

                {identifierType && (
                  <div className="col-md-12">
                    <label className="col-sm-12 col-form-label">
                      Enter {identifierType}<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${formError.reg_no ? 'is-invalid' : ''}`}
                      name="reg_no"
                      value={identifierValue}
                      onChange={handleIdentifierValueChange}
                      placeholder={getIdentifierPlaceholder(identifierType)}
                    />
                    <span className="text-danger">{formError.reg_no}</span>
                  </div>
                )}

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">
                    Year of Publication<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${formError.year_passing ? 'is-invalid' : ''}`}
                    name="year_passing"
                    value={formData.year_passing}
                    onChange={handleChange}
                    placeholder="e.g. 2024"
                  />
                  <span className="text-danger">{formError.year_passing}</span>
                </div>
              </>
            )}
            {(formData.qual_type === "DepartmentTest" || formData.qual_type === "EligibilityTest") && (
              <>
                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">
                    Name of Test<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="name_of_test"
                    value={formData.name_of_test}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.name_of_test}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">
                    Conducted By<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="conducted_whom"
                    value={formData.conducted_whom}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.conducted_whom}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">Registration Number<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="reg_no"
                    value={formData.reg_no}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.reg_no}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">
                    Month of Passing<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="month_of_passing"
                    value={formData.month_of_passing}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.month_of_passing}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">
                    Certificate Number<span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="certificate_no"
                    value={formData.certificate_no}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.certificate_no}</span>
                </div>

                <div className="col-md-12">
                  <label className="col-sm-12 col-form-label">
                    Certificate Date<span className="text-danger">*</span>
                  </label>
                  <input
                    type="Date"
                    className="form-control"
                    name="certificate_date"
                    value={formData.certificate_date}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.certificate_date}</span>
                </div>
              </>
            )}


            <div className="col-md-12">
              <label className="col-sm-12 col-form-label">Document</label>

              <input
                key={fileInputKey}
                type="file"
                className="form-control"
                name="doc_path"
                accept=".pdf" // Restrict to PDF files only
                onChange={handleDocumentChange}
              />
              <div className="text-danger small mt-1">Maximum file size: 500KB</div>
              <span className="text-danger">{formError.doc_path}</span>
            </div>

            <div className="col-md-12">
              <label className="col-sm-12 col-form-label">Remarks</label>
              <textarea
                className="form-control"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
              <span className="text-danger">{formError.remarks}</span>
            </div>

            <div className="col-12 text-end">
              {formData.action_type === "save" && (
                <>
                  <div className="col-12 text-end">
                    <button
                      type="submit"
                      className="btn btn-success m-1"
                      disabled={formData.save_flag}
                      onClick={(e) => handleSubmit(e, false)}  // Keep modal open
                    >
                      {formData.save_flag ? "Saving..." : "Save And Next"}
                    </button>

                    <button
                      type="submit"
                      className="btn btn-primary m-1"
                      disabled={formData.save_flag}
                      onClick={(e) => handleSubmit(e, true)}  // Close modal
                    >
                      {formData.save_flag ? "Saving..." : "Save And Exit"}
                    </button>

                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="btn btn-danger m-1"
                    >
                      Cancel
                    </button>
                  </div>

                </>
              )}

              {formData.action_type === "update" && (
                <>
                  <button
                    type="submit"
                    className="btn btn-success m-1"
                    disabled={formData.save_flag}
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    {formData.save_flag ? 'Updating...' : 'Update'}
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn btn-danger m-1"
                  >
                    Cancel
                  </button>
                </>
              )}


            </div>

          </form>
        </Modal.Body>
      </Modal>
      <Modal show={showPdfModal} onHide={() => setShowPdfModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Qualification Document</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handlePdfSubmit} className="row g-3">
            <div className="col-12">
              <label className="form-label">Select PDF Document<span className="text-danger">*</span></label>
              <input
                type="file"
                className="form-control"
                accept=".pdf"
                onChange={handlePdfFileChange}
                required
              />
              <div className="text-danger small mt-1">Maximum file size: 500KB</div>
            </div>
            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={pdfFormData.save_flag}
              >
                {pdfFormData.save_flag ? "Updating..." : "Update Document"}
              </button>
              <button
                type="button"
                className="btn btn-danger m-1"
                onClick={() => setShowPdfModal(false)}
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

export default CandidateQualification
