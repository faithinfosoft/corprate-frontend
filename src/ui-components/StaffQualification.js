import React, { useState, useEffect } from 'react';
import SecureLink from './SecureLink';
import { useParams } from 'react-router-dom'; // Add this import for useParams
import axios from 'axios';
import NoDataFound from './NoDataFound.js';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';
import Breadcum from './Breadcum.js';
import pdf from "../assets/ui-master/img/pdf.jpg";
import useAuth from "../utilities/useAuth";
const StaffQualification = () => {
  const auth = useAuth();
    const userType = auth.user.user_type;
  const { staff_id } = useParams();
  const [academicqualifications, setAcademicQualifications] = useState([]);
  const [tests, setTestsQualifications] = useState([]);
  const [professional, setProfessionalQualifications] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [qualifications, setQualifications] = useState([]);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [formError, setFormError] = useState({});
  const [formeditError, seteditFormError] = useState({});

  const openDocModal = (activity) => {
    setSelectedActivity(activity);
    setIsDocModalOpen(true);
  };
  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setNewPdf(null);
  };

  const [newPdf, setNewPdf] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const handleFileChange = (event) => {
    setNewPdf(event.target.files[0]);
  };

  const handleChangeDocument = async () => {
    if (!newPdf) {
      print_toast("error", "Please select a document!");
      return;
    }

    const formData = new FormData();
    formData.append("qual_id", selectedActivity.qual_id);
    formData.append("pdf_file", newPdf);

    try {
      setIsSaving(true);

      const response = await axios.post(
        `${globalVariables.api_url}/staffqualificationdetails/update-pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        print_toast("success", "Document updated successfully!");
        
        closeDocModal();

        // setActivityData((prevData) =>
        //   prevData.map((item) =>
        //     item.qual_id === selectedActivity.qual_id 
        //       ? { ...item, pdf_file: response.data.new_pdf_name }
        //       : item
        //   )
        // );

        closeDocModal();
        await fetchqualifications();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to update document"
        );
      }
    } catch (error) {
      console.error("Error updating document:", error);
      // print_toast("error", "An error occurred while updating the document.");
    } finally {
      setIsSaving(false);
    }
  };



  const [formData, setFormData] = useState({
    fk_candidate_id: staff_id, 
    course: '',                   
    title: '',                    
    reg_no: '',                     
    university_board: '',       
    year_passing: '',               
    qual_type: '',                  
    percentage: '',                
    doc_path:'',                 
    name_of_test: '',               
    conducted_whom: '',        
    month_of_passing: '',           
    certificate_no: '',  
    certificate_date: '',       
    remarks: ''  ,
    save_flag: false,
    action_type:'save', 
    school_university:'',
    main_subject:'',
    second_language:'',            
});
  const [editFormData, setEditFormData] = useState({

    fk_candidate_id: staff_id, 
    course: '',                   
    title: '',                    
    reg_no: '',                     
    university_board: '',       
    year_passing: '',               
    qual_type: '',                  
    percentage: '',                
    doc_path: '',                 
    name_of_test: '',               
    conducted_whom: '',        
    month_of_passing: '',           
    certificate_no: '',  
    certificate_date: '',       
    remarks: ''  ,
    save_flag: false,
    school_university:'',
    main_subject:'',
    second_language:'', 
    action_type:'update',  


  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [designation, setDesignation] = useState({});

  const clearDesignationForm = () => {
    setFormData({
      fk_candidate_id: staff_id, 
      course: '',                   
      title: '',                    
      reg_no: '',                     
      university_board: '',       
      year_passing: '',               
      qual_type: '' ,                  
      percentage: '',                
      doc_path: '',                 
      name_of_test: '',               
      conducted_whom: '',        
      month_of_passing: '',           
      certificate_no: '',  
      certificate_date: '',       
      remarks: ''  ,
      save_flag: false,
      school_university:'',
      main_subject:'',
      second_language:'', 
    });
    setEditFormData({});
  };

  const editqualification = (_qualification) => {

    _qualification.save_flag=false;
    _qualification.action_type='update';
    _qualification.fk_candidate_id=staff_id;

    setFormData(_qualification);
   setShowModal(true);
  }

  const fetchTypes = async () => {
    try {
        const response = await axios.post(globalVariables.api_url + '/staffqualificationdetails/get_type', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        if (response.data.status) {
            // Assuming response.data.data is the object containing the qualifications
            setTypes(Object.entries(response.data.data)); // Convert object to array of [key, value]
        }
        setLoaded(true);
    } catch (error) {
        console.error('Error fetching data:', error.message);
    }
};

  useEffect(() => {
    fetchTypes();
  }, []);





const handleDocumentChange = (e) => {
  const { name, files } = e.target;

 
    // Handle other forms if necessary
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));
 
};




  const handleChange = (e) => {
    const { name, value } = e.target;

    if (e.target.type === 'file') {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
  //         `${globalVariables.api_url}/staffqualificationdetails/save`,
  //         formDataToSend,
  //         config
  //       );
  //     } else if (formData.action_type === "update") {
  //       response = await axios.post(
  //         `${globalVariables.api_url}/staffqualificationdetails/update_qualification_details`,
  //         formDataToSend,
  //         config
  //       );
  //     }
  
  //     // Rest of the function remains the same
  //   } catch (error) {
  //     console.error("Error saving data:", error.message);
  //   }
  // };




  const handleSubmit = async (e, closeModal = false) => {
    e.preventDefault();
  
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }
  
    try {
      let response;
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' },
      };
  
      if (formData.action_type === "save") {
        response = await axios.post(
          `${globalVariables.api_url}/staffqualificationdetails/save`,
          formDataToSend,
          config
        );}
      //  else if (formData.action_type === "update") {
      //   response = await axios.post(
      //     `${globalVariables.api_url}/staffqualificationdetails/update_qualification_details`,
      //     formDataToSend,
      //     config
      //   );
      // }
  
      setFormData(prevFormData => ({
        ...prevFormData,
        save_flag: false
      }));
      if (response.data.status) {
      await fetchqualifications();
        clearDesignationForm();
        print_toast("success", response.data.message);
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
  
  const handleOpenModal= () => {
     
    setFormData({
      fk_candidate_id: staff_id, 
       course: '',                   
       title: '',                    
       reg_no: '',                     
       university_board: '',       
       year_passing: '',               
       qual_type: '',                  
       percentage: '',                
       doc_path: '',                 
       name_of_test: '',               
     conducted_whom: '',        
      month_of_passing: '',           
      certificate_no: '',  
      certificate_date: '',       
      remarks: ''  ,
      save_flag: false,
      action_type:'save', 
      school_university:'',
      main_subject:'',
      second_language:'', 

    });
    setShowModal(true);
  };




  const handleCloseModal = () => {
    setShowModal(false);
    // setEditMode(false);
    // setSelectedQualification(null);
  };


  const fetchAcademicQualifications = async () => {
    try {
        const response = await axios.post(globalVariables.api_url + '/staffqualificationdetails/academic_qualifications', formData, {
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
  }, []);




  const test = async () => {
    try {
        const response = await axios.post(globalVariables.api_url + '/staffqualificationdetails/test', formData, {
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
  }, []);


  const fetchproffessional = async () => {
    try {
        const response = await axios.post(globalVariables.api_url + '/staffqualificationdetails/proffessional', formData, {
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
  }, []);



  const fetchqualifications = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/staffqualificationdetails/qualification_details',{

        params: {
          fk_candidate_id:staff_id,
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
  }, []);


  const handleDelete = async (_qualification) => {
  
    try {
      const response = await axios.post(globalVariables.api_url + '/staffqualificationdetails/delete_qualification_details', {
        qual_id : _qualification.qual_id ,
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
      {/* { userType != 'staff' && ( */}
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>Add Qualification</button>
      {/* )} */}
      </div>
      <div className="row">
      <div class="accordion" id="accordionExample">
  <div class="accordion-item border-0 shadow-sm mb-4 overflow-hidden">
    <h2 class="accordion-header" id="headingOne">
      <button class="accordion-button fw-bold text-dark bg-light" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
 Academic Qualifications
      </button>
    </h2>
    <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
      <div class="accordion-body">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
  <thead className="table-light text-muted">
    <tr>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Sl No.</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Course</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Title with optioned Subject/subjects</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Main</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Subsid. Sec.Lang</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Reg.No</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">College/School</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">University/Board</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Year of passing</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">% of Mark</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Documents</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Remarks</th>
      {/* { userType != 'staff' && ( */}
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Actions</th>
      {/* )} */}
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
    {qualification.doc_path && qualification.doc_url ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target="_blank">
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
            <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => openDocModal(qualification)}
                                  >
                                    Change Document
                                  </button>
        </div>
    ) : 
    
    <div>

<button
                                    className="btn btn-sm btn-info"
                                    onClick={() => openDocModal(qualification)}
                                  >
                                    Add Document
                                  </button>
    </div>
    
    }


{/* <a
                                    className="btn btn-sm btn-primary"
                                    href={qualification.doc_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <i className="bi bi-file-pdf"></i>
                                  </a> */}
                                 

 
</td>




            <td className="text-center">{qualification.remarks}</td>
            {/* { userType != 'staff' && ( */}
            <td className="fw-bold text-center">
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary btn-sm rounded-pill dropdown-toggle px-3 shadow-sm"
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Action
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1" aria-labelledby="dropdownMenuButton1">
                <li>
        <a
          href="#"
          className="dropdown-item py-2 fw-medium text-primary d-flex align-items-center"
          onClick={() => editqualification(qualification)}
        ><i className="bi bi-pencil-square me-2"></i> Edit</a>
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
            {/* )} */}
          </tr>
        ) : null // Return null if qualification is not Academic
      ))
    )}
  </tbody>
</table>

              </div>      </div>
    </div>
  </div>
  <div class="accordion-item border-0 shadow-sm mb-4 overflow-hidden">
    <h2 class="accordion-header" id="headingTwo">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
      Professional Qualification
      </button>
    </h2>
    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
      <div class="accordion-body">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
  <thead className="table-light text-muted">
    <tr>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Sl No.</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Course</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Title with optioned Subject/subjects</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Main</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Subsid. Sec.Lang</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Reg.No</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">College/School</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">University/Board</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Year of passing</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">% of Mark</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Documents</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Remarks</th>
      {/* { userType != 'staff' && ( */}
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Actions</th>
      {/* )} */}
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
    {qualification.doc_path && qualification.doc_url ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target="_blank">
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

            <button
                                    className="btn btn-sm btn-info"
                                    onClick={() => openDocModal(qualification)}
                                  >
                                    Change Document
                                  </button>
        </div>
        
    ) : 
    
    
    <div>

    <button
                                        className="btn btn-sm btn-info"
                                        onClick={() => openDocModal(qualification)}
                                      >
                                        Add Document
                                      </button>
        </div>
    
    
    }
</td>


    
            <td className="text-center">{qualification.remarks}</td>
            {/* { userType != 'staff' && ( */}
            <td className="fw-bold text-center">
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary btn-sm rounded-pill dropdown-toggle px-3 shadow-sm"
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Action
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1" aria-labelledby="dropdownMenuButton1">
                  <li>
                    <a
                      href="#"
                      className="dropdown-item py-2 fw-medium text-primary d-flex align-items-center"
                      onClick={() => editqualification(qualification)}
                    ><i className="bi bi-pencil-square me-2"></i> Edit</a>
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
             {/* )} */}
     
          </tr>
        ) : null 
      ))
    )}
  </tbody>
</table>

              </div>       </div>
    </div>
  </div>
  <div class="accordion-item border-0 shadow-sm mb-4 overflow-hidden">
    <h2 class="accordion-header" id="headingThree">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
      Eligibility Test Qualification
      </button>
    </h2>
    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
      <div class="accordion-body">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
  <thead className="table-light text-muted">
    <tr>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Sl No.</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Name of Test</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Conducted By Whom</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Reg.No</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Month and Year of Passing(05/2010)</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Certificate No</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Date</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Documents</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Remarks</th>
      {/* { userType != 'staff' && ( */}
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Actions</th>
      {/* )} */}
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
    {qualification.doc_path && qualification.doc_url ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target="_blank">
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

            <td className="text-center">{qualification.remarks}</td>
            {/* { userType != 'staff' && ( */}
            <td className="fw-bold text-center">
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary btn-sm rounded-pill dropdown-toggle px-3 shadow-sm"
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Action
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1" aria-labelledby="dropdownMenuButton1">
                <li>
        <a
          href="#"
          className="dropdown-item py-2 fw-medium text-primary d-flex align-items-center"
          onClick={() => editqualification(qualification)}
        ><i className="bi bi-pencil-square me-2"></i> Edit</a>
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
             {/* )} */}
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

  <div class="accordion-item border-0 shadow-sm mb-4 overflow-hidden">
    <h2 class="accordion-header" id="headingThree">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
Department Test Qualification
      </button>
    </h2>
    <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
      <div class="accordion-body">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
  <thead className="table-light text-muted">
    <tr>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Sl No.</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Name of Test</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Conducted By Whom</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Reg.No</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Month and Year of Passing(05/2010)</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Certificate No</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Date</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Documents</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Remarks</th>
      {/* { userType != 'staff' && ( */}
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Actions</th>
      {/* )} */}
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
    {qualification.doc_path && qualification.doc_url ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target="_blank">
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

            <div>

<button
                                    className="btn btn-sm btn-info"
                                    onClick={() => openDocModal(qualification)}
                                  >
                                    Change Document
                                  </button>
    </div>



        </div>
    ) :   <div>

    <button
                                        className="btn btn-sm btn-info"
                                        onClick={() => openDocModal(qualification)}
                                      >
                                        Add Document
                                      </button>
        </div>}
</td>

            <td className="text-center">{qualification.remarks}</td>
            {/* { userType != 'staff' && ( */}
            <td className="fw-bold text-center">
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary btn-sm rounded-pill dropdown-toggle px-3 shadow-sm"
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Action
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1" aria-labelledby="dropdownMenuButton1">
                <li>
        <a
          href="#"
          className="dropdown-item py-2 fw-medium text-primary d-flex align-items-center"
          onClick={() => editqualification(qualification)}
        ><i className="bi bi-pencil-square me-2"></i> Edit</a>
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
            {/* // )} */}
          </tr>
        ) : null // Return null if qualification is not Academic
      ))
    )}
  </tbody>
</table>

              </div>       </div>
    </div>
  </div>


  <div class="accordion-item border-0 shadow-sm mb-4 overflow-hidden">
    <h2 class="accordion-header" id="headingFour">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseFour">
    Additional Qualification
      </button>
    </h2>
    <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#accordionExample">
      <div class="accordion-body">
      <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
  <thead className="table-light text-muted">
    <tr>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Sl No.</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Course</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Title with optioned Subject/subjects</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Main</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Subsid. Sec.Lang</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Reg.No</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">College/School</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">University/Board</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Year of passing</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">% of Mark</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Documents</th>
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Remarks</th>
      {/* { userType != 'staff' && ( */}
      <th scope="col" className="text-center fw-semibold py-3 border-bottom">Actions</th>
      {/* )} */}
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
    {qualification.doc_path && qualification.doc_url ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SecureLink href={qualification.doc_url} rel="noopener noreferrer" target="_blank">
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

            <div>

<button
                                    className="btn btn-sm btn-info"
                                    onClick={() => openDocModal(qualification)}
                                  >
                                    Change Document
                                  </button>
    </div>
        </div>
    ) :   <div>

    <button
                                        className="btn btn-sm btn-info"
                                        onClick={() => openDocModal(qualification)}
                                      >
                                        Add Document
                                      </button>
        </div>}
</td>

            <td className="text-center">{qualification.remarks}</td>
            {/* { userType != 'staff' && ( */}
            <td className="fw-bold text-center">
              <div className="dropdown">
                <button
                  className="btn btn-outline-primary btn-sm rounded-pill dropdown-toggle px-3 shadow-sm"
                  type="button"
                  id="dropdownMenuButton1"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Action
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 mt-1" aria-labelledby="dropdownMenuButton1">
                  <li>
                    <a
                      href="#"
                      className="dropdown-item py-2 fw-medium text-primary d-flex align-items-center"
                      onClick={() => editqualification(qualification)}
                    ><i className="bi bi-pencil-square me-2"></i> Edit</a>
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
            {/* // )} */}
          </tr>
        ) : null 
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
          <Modal.Title>  {formData.action_type === "save" ? "Create Qualification" : "Create Qualification"}</Modal.Title>
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
    <span className="text-danger">{formError.course}</span>
</div>


{(formData.qual_type === "Academic" || formData.qual_type === "Professional" ||formData.qual_type === "Additional") && (
  <>

            <div className="col-md-12">
              <label className="col-sm-12 col-form-label">Title<span className="text-danger">*</span></label>
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


{(formData.qual_type === "Academic" || formData.qual_type === "Professional" ) && (
  <>

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


            <div className="col-md-12">
  <label className="col-sm-12 col-form-label">
    Subsidary/Second Language 
    {(formData.course !== "Master Degree" && formData.course !== "B.Ed/Equivalent") && (
  <span className="text-danger">*</span>
)}


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






      {(formData.qual_type === "Additional" ) && (
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
    type="file"
    className="form-control"
    name="doc_path"
    
    accept=".pdf" // Restrict to PDF files only
    onChange={handleDocumentChange}
/>
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
    onClick={clearDesignationForm}
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
onClick={clearDesignationForm}
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




      {isDocModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change  Document</h5>
                <button className="btn-close" onClick={closeDocModal}></button>
              </div>
              <div className="modal-body">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="form-control"
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={handleChangeDocument}
                  disabled={!newPdf || isSaving}
                >
                  {isSaving ? "Updating..." : "Update"}
                </button>
                <button className="btn btn-danger" onClick={closeDocModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )} 
    </>
  );
};

export default StaffQualification

