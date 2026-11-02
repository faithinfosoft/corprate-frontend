import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Add this import for useParams
import axios from 'axios';
import NoDataFound from '../NoDataFound.js';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';
import Breadcum from '../Breadcum.js';
import pdf from "../../assets/ui-master/img/pdf.jpg";

const CandidateFamilyDetails = ({ candidateId, readOnly }) => {
  const { candidate_id: param_id } = useParams();
  const effective_candidate_id = candidateId || param_id;
  // const [breadcum, setBreadcum] = useState([
  //   { Title: 'Home', Link: '/' },
  //   { Title: 'Designations', Link: '' },
  // ]);

  const [family, setFamily] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [isProfileLocked, setIsProfileLocked] = useState(readOnly !== undefined ? readOnly : false);
  const [formError, setFormError] = useState({});
  const [formeditError, seteditFormError] = useState({});
  const [formData, setFormData] = useState({
    fk_candidate_id: effective_candidate_id,
    official_name: '',
    dob: '', // Consider using a string format or a Date object depending on how you're handling dates
    age: '', // This could be a number, but keeping it as a string for simplicity
    gender: '',
    relationship: '',
    occupation: '',
    is_corporate_employee: '', // Or 'Yes'/'No' based on your requirements
    is_sunday_school_teacher: '', // Or 'Yes'/'No'
    sunday_school_name: '',
    total_service_years: '',
    service_doc: null,
    save_flag: false,
  });

  const [editData, setEditFormData] = useState({

    fk_candidate_id: effective_candidate_id,
    official_name: '',
    dob: '', // Consider using a string format or a Date object depending on how you're handling dates
    age: '', // This could be a number, but keeping it as a string for simplicity
    gender: '',
    relationship: '',
    occupation: '',
    is_corporate_employee: '', // Or 'Yes'/'No' based on your requirements
    is_sunday_school_teacher: '', // Or 'Yes'/'No'
    sunday_school_name: '',
    total_service_years: '',
    service_doc: null,
    save_flag: false,




  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [designation, setDesignation] = useState({});

  const clearDesignationForm = () => {
    setFormData({
      fk_candidate_id: effective_candidate_id,
      official_name: '',
      dob: '', // Consider using a string format or a Date object depending on how you're handling dates
      age: '', // This could be a number, but keeping it as a string for simplicity
      gender: '',
      relationship: '',
      occupation: '',
      is_corporate_employee: '', // Or 'Yes'/'No' based on your requirements
      is_sunday_school_teacher: '', // Or 'Yes'/'No'
      sunday_school_name: '',
      total_service_years: '',
      service_doc: null,
      save_flag: false,
    });
    setEditFormData({});
  };

  const fetchfamilymembers = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/candidatefamily/view_family', {

        params: {
          fk_candidate_id: effective_candidate_id,
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
    fetchfamilymembers();
    if (readOnly === undefined) {
      checkLockStatus();
    }
  }, [effective_candidate_id, readOnly]);

  const checkLockStatus = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidateexamapplication/get_candidate_lock_status`, {
        params: { candidate_id: effective_candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setIsProfileLocked(response.data.is_locked);
      }
    } catch (error) {
      console.error('Error checking lock status:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      // Handle file input
      const file = files[0];
      if (modalIsOpen) {
        setEditFormData((prev) => ({ ...prev, [name]: file }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: file }));
      }
    } else {
      // Handle text input
      if (modalIsOpen) {
        setEditFormData((prev) => ({ ...prev, [name]: value }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }

    // Reset the error for the current input
    setFormError((prevErrors) => ({ ...prevErrors, [name]: '' }));
    seteditFormError((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };



  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files.length > 0) {
      setEditFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      if (modalIsOpen) {
        setEditFormData(prev => ({ ...prev, [name]: value }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    }
    setFormError(prevErrors => ({ ...prevErrors, [name]: '' }));
    seteditFormError(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     setFormData(prev => ({ ...prev, save_flag: true }));
  //     const response = await axios.post(globalVariables.api_url + '/candidatefamily/save', formData, {
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  //     });
  //     if (response.data.status) {
  //       await fetchfamilymembers();
  //       clearDesignationForm();
  //       print_toast("success", response.data.message);
  //     } else {
  //       setFormError(response.data.error || {});
  //       print_toast("error", response.data.message);
  //     }
  //   } catch (error) {
  //     console.error('Error saving data:', error.message);
  //   } finally {
  //     setFormData(prev => ({ ...prev, save_flag: false }));
  //   }
  // };


  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   try {
  //     // Initialize FormData to handle file uploads properly
  //     const data = new FormData();

  //     // Append all other form data fields
  //     data.append('fk_candidate_id', formData.fk_candidate_id);
  //     data.append('official_name', formData.official_name);
  //     data.append('dob', formData.dob);
  //     data.append('gender', formData.gender);
  //     data.append('relationship', formData.relationship);
  //     data.append('occupation', formData.occupation);
  //     data.append('is_corporate_employee', formData.is_corporate_employee);
  //     data.append('is_sunday_school_teacher', formData.is_sunday_school_teacher);
  //     data.append('sunday_school_name', formData.sunday_school_name);
  //     data.append('total_service_years', formData.total_service_years);
  //     data.append('save_flag', true); // Set the save flag

  //     // Append the file
  //     if (formData.service_doc) {
  //       data.append('service_doc', formData.service_doc);
  //     }

  //     // Send the request with `multipart/form-data`
  //     const response = await axios.post(globalVariables.api_url + '/candidatefamily/save', data, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });

  //     if (response.data.status) {
  //       await fetchfamilymembers();
  //       clearDesignationForm();
  //       print_toast("success", response.data.message);
  //     } else {
  //       setFormError(response.data.error || {});
  //       print_toast("error", response.data.message);
  //     }
  //   } catch (error) {
  //     console.error('Error saving data:', error.message);
  //   } finally {
  //     setFormData(prev => ({ ...prev, save_flag: false }));
  //   }
  // };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFatherOrMother = formData.relationship === "Father" || formData.relationship === "Mother";
    const isSundayTeacher = formData.is_sunday_school_teacher === "Yes";

    // Validate: for Father/Mother + Sunday School Teacher=Yes, extra fields are required
    if (isSundayTeacher && isFatherOrMother) {
      let errors = {};
      if (!formData.sunday_school_name) errors.sunday_school_name = "Sunday School Name is required";
      if (!formData.total_service_years) errors.total_service_years = "Total Service is required";
      if (!formData.service_doc) errors.service_doc = "Catechism Service Book is required";

      if (Object.keys(errors).length > 0) {
        setFormError(errors);
        print_toast("error", "Please fill all mandatory Sunday School fields");
        return;
      }
    }

    try {
      const data = new FormData();
      data.append('fk_candidate_id', formData.fk_candidate_id);
      data.append('official_name', formData.official_name);
      data.append('dob', formData.dob);
      data.append('gender', formData.gender);
      data.append('relationship', formData.relationship);
      data.append('occupation', formData.occupation);
      data.append('is_corporate_employee', formData.is_corporate_employee);
      data.append('is_sunday_school_teacher', formData.is_sunday_school_teacher);
      data.append('save_flag', true);

      // For Father/Mother + Sunday School=Yes: send the extra fields
      if (isSundayTeacher && isFatherOrMother) {
        data.append('sunday_school_name', formData.sunday_school_name);
        data.append('total_service_years', formData.total_service_years);
        if (formData.service_doc) {
          data.append('service_doc', formData.service_doc);
        }
      } else {
        // For other relationships: clear these fields
        data.append('sunday_school_name', '');
        data.append('total_service_years', '');
      }

      const response = await axios.post(globalVariables.api_url + '/candidatefamily/save', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        await fetchfamilymembers();
        clearDesignationForm();
        print_toast("success", response.data.message);
      } else {
        setFormError(response.data.error || {});
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error saving data:', error.message);
      print_toast("error", "An error occurred while saving the data.");
    } finally {
      setFormData(prev => ({ ...prev, save_flag: false }));
    }
  };

  const handleEdit = (_member) => {
    //setFamily(_member);
    setEditFormData({
      candidate_member_id: _member.candidate_member_id,
      fk_candidate_id: effective_candidate_id,
      official_name: _member.official_name,
      dob: _member.dob,
      age: _member.age,
      gender: _member.gender,
      relationship: _member.relationship,
      occupation: _member.occupation,
      is_corporate_employee: _member.is_corporate_employee,
      is_sunday_school_teacher: _member.is_sunday_school_teacher,
      sunday_school_name: _member.sunday_school_name,
      total_service_years: _member.total_service_years,
      current_service_doc: _member.service_doc,
      service_doc: null,
    });
    setModalIsOpen(true);
  };

  const updatefamilymember = async (e) => {
    e.preventDefault();

    const isFatherOrMother = editData.relationship === "Father" || editData.relationship === "Mother";
    const isSundayTeacher = editData.is_sunday_school_teacher === "Yes";

    // Validate: for Father/Mother + Sunday School Teacher=Yes, extra fields are required
    if (isSundayTeacher && isFatherOrMother) {
      let errors = {};
      if (!editData.sunday_school_name) errors.sunday_school_name = "Sunday School Name is required";
      if (!editData.total_service_years) errors.total_service_years = "Total Service is required";
      if (!editData.current_service_doc && !editData.service_doc) errors.service_doc = "Catechism Service Book is required";

      if (Object.keys(errors).length > 0) {
        seteditFormError(errors);
        print_toast("error", "Please fill mandatory Sunday School fields");
        return;
      }
    }

    try {
      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: true
      }));

      const data = new FormData();
      data.append('candidate_member_id', editData.candidate_member_id);
      data.append('fk_candidate_id', effective_candidate_id);
      data.append('official_name', editData.official_name);
      data.append('dob', editData.dob);
      data.append('age', editData.age);
      data.append('gender', editData.gender);
      data.append('relationship', editData.relationship);
      data.append('occupation', editData.occupation);
      data.append('is_corporate_employee', editData.is_corporate_employee);
      data.append('is_sunday_school_teacher', editData.is_sunday_school_teacher);

      // For Father/Mother + Sunday School=Yes: send the extra fields
      if (isSundayTeacher && isFatherOrMother) {
        data.append('sunday_school_name', editData.sunday_school_name);
        data.append('total_service_years', editData.total_service_years);
        if (editData.service_doc) {
          data.append('service_doc', editData.service_doc);
        }
      } else {
        // For other relationships: clear these fields
        data.append('sunday_school_name', '');
        data.append('total_service_years', '');
      }

      const response = await axios.post(globalVariables.api_url + '/candidatefamily/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: false
      }));
      if (response.data.status) {
        await fetchfamilymembers();
        clearDesignationForm();
        print_toast("success", response.data.message);
        setModalIsOpen(false);
      } else {
        seteditFormError(response.data.error || {});
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error updating data:', error.message);
      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: false
      }));
    }
  };

  const handleDelete = async (_member) => {

    try {
      const response = await axios.post(globalVariables.api_url + '/candidatefamily/delete', {
        candidate_member_id: _member.candidate_member_id,
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.status) {
        await fetchfamilymembers();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting data:', error.message);
    }

  };
  const isValidDate = (date) => date && !isNaN(new Date(date).getTime());




  const handleDocumentChange = (id) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {

        const formData = new FormData();
        formData.append('document', file);
        formData.append('id', id);

        try {
          const response = await axios.post(globalVariables.api_url + '/candidatefamily/updatedocument', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.status) {
            print_toast("success", response.data.message);
            await fetchfamilymembers();

          } else {
            print_toast("error", response.data.message);
          }
        } catch (error) {

        }
      }
    };

    input.click();
  };

  const handleDocumentChangedata = (e) => {
    const { name, files } = e.target;

    // Update the state correctly based on the modal state

    // Handle other forms if necessary
    setFormData((prev) => ({
      ...prev,
      [name]: files[0],
    }));

  };

  return (
    <>
      {/* <Breadcum items={breadcum} title="Designations" /> */}
      <div className="row">
        <div className={isProfileLocked ? "col-lg-12" : "col-lg-8"}>
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Family Details</h5>
            </div>
            <div className="card-body">
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
                      {!isProfileLocked && <th scope="col" className="text-center">Actions</th>}
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
                            {f.doc_url !== '' && (
                              <a href={f.doc_url} target='_blank' rel="noopener noreferrer">
                                <img
                                  src={pdf}
                                  alt="Link to PDF Document"
                                  className="pdf-thumbnail mb-1"
                                  width="40px"
                                  height="40px"
                                />
                              </a>
                            )}
                            {!isProfileLocked && f.is_sunday_school_teacher === 'Yes' && (f.relationship === 'Father' || f.relationship === 'Mother') && (
                              <button
                                onClick={() => handleDocumentChange(f.candidate_member_id)}
                                className="btn btn-primary btn-sm d-block mx-auto"
                                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                              >
                                {f.doc_url !== '' ? 'Change Document' : 'Upload Document'}
                              </button>
                            )}
                          </td>
                          {!isProfileLocked && (
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
                                      onClick={() => handleEdit(f)}
                                    >
                                      Edit
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      disabled={f.delete_flag}
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.preventDefault(); // Prevent default link behavior
                                        if (window.confirm('Are you sure you want to delete this data?')) {
                                          handleDelete(f);
                                        }
                                      }}
                                    >
                                      {f.delete_flag ? 'Deleting...' : 'Delete'}
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
        {!isProfileLocked && (
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Create Family Details</h5>
              </div>
              <div className="card-body">
                <form role="form" onSubmit={handleSubmit} className="row g-3">


                  <p style={{
                    color: "red",
                    backgroundColor: "#ffe6e6",
                    padding: "10px",
                    borderRadius: "5px",
                    fontWeight: "bold",
                  }}
                  >
                    [ In the case of a married female applicant, only the details of her in-laws and new family should be provided. However, she may furnish the details of her own parents for claiming additional weightage under the clause “Catechism Experience of Parents.” Any non-applicable sections should be struck out.]
                  </p>
                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Officiale  Name<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="official_name"
                      value={formData.official_name}
                      onChange={handleChange}

                    />

                    <span className="text-danger">{formError.official_name}</span>
                  </div>

                  {/* Dropdown for Relationship */}
                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">
                      Relationship<span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="relationship"
                      value={formData.relationship}
                      onChange={handleChange}
                    >
                      <option value="">Select Relationship</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Sister">Sister</option>
                      <option value="Brother">Brother</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Husband">Husband</option>
                      <option value="Wife">Wife</option>
                      <option value="Father-in-law">Father-in-law</option>
                      <option value="Mother-in-law">Mother-in-law</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Brother-in-law">Brother-in-law</option>
                      <option value="Sister-in-law">Sister-in-law</option>
                      <option value="Others">Others</option>
                    </select>
                    <span className="text-danger">{formError.relationship}</span>
                  </div>

                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Occupation<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}


                    />
                    <span className="text-danger">{formError.occupation}</span>
                  </div>


                  <div className="col-12">
                    <label className="col-sm-12 col-form-label"> Date Of Birth
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="dob"
                      value={formData.dob} // Ensure it matches the name field
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]} // Set max to today's date
                    />

                    <span className="text-danger">{formError.dob}</span>
                  </div>







                  <div className="col-12 mb-3"> {/* Add margin-bottom for spacing */}
                    <label className="col-sm-12 col-form-label">
                      Gender<span className="text-danger">*</span>
                    </label>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">Male</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">Female</label>
                    </div>
                    <span className="text-danger">{formError.gender}</span>
                  </div>




                  {/* Radio buttons for Corporate Employee */}
                  <div className="col-12 mb-3"> {/* Add margin-bottom for spacing */}
                    <label className="col-sm-12 col-form-label">
                      Corporate Employee<span className="text-danger">*</span>
                    </label>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="is_corporate_employee"
                        value="Yes"
                        checked={formData.is_corporate_employee === "Yes"}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">Yes</label>
                    </div>

                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="is_corporate_employee"
                        value="No"
                        checked={formData.is_corporate_employee === "No"}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">No</label>
                    </div>

                    <span className="text-danger">{formError.is_corporate_employee}</span>
                  </div>


                  {/* Radio buttons for Sunday School Teacher - shown for all relationships */}
                  <div className="col-12 mb-3">
                    <label className="col-sm-12 col-form-label">
                      Sunday School Teacher<span className="text-danger">*</span>
                    </label>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="is_sunday_school_teacher"
                        value="Yes"
                        checked={formData.is_sunday_school_teacher === "Yes"}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="is_sunday_school_teacher"
                        value="No"
                        checked={formData.is_sunday_school_teacher === "No"}
                        onChange={handleChange}
                      />
                      <label className="form-check-label">No</label>
                    </div>
                    <span className="text-danger">{formError.is_sunday_school_teacher}</span>
                  </div>

                  {/* For Father/Mother: show extra required fields when Sunday School Teacher = Yes */}
                  {(formData.relationship === "Father" || formData.relationship === "Mother") &&
                    formData.is_sunday_school_teacher === "Yes" && (
                      <>
                        <div className="col-12 mb-3">
                          <label className="col-sm-12 col-form-label">
                            Sunday School Name<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="sunday_school_name"
                            value={formData.sunday_school_name}
                            onChange={handleChange}
                          />
                          <span className="text-danger">{formError.sunday_school_name}</span>
                        </div>

                        <div className="col-12 mb-3">
                          <label className="col-sm-12 col-form-label">
                            Total Service<span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="total_service_years"
                            value={formData.total_service_years}
                            onChange={handleChange}
                          />
                          <span className="text-danger">{formError.total_service_years}</span>
                        </div>

                        <div className="col-12 mb-3">
                          <label className="col-sm-12 col-form-label">
                            Catechism Service Book <span className="text-danger">*</span>
                          </label>
                          <input
                            type="file"
                            accept=".pdf"
                            className="form-control"
                            name="service_doc"
                            onChange={handleChange}
                          />
                          <span className="text-danger">{formError.service_doc}</span>
                        </div>
                      </>
                    )}


                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-success m-1" disabled={formData.save_flag}>
                      {formData.save_flag ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" onClick={clearDesignationForm} className="btn btn-danger m-1">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div >

      {/* Modal for Editing */}
      {/* Edit Modal for Teaching Experience */}
      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Teaching Experience</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={updatefamilymember} className="row g-3">
            {/* Official Name */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">
                Official Name<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="official_name"
                value={editData.official_name} // Pre-fill value from state
                onChange={handleEditChange}
              />
              <span className="text-danger">{formeditError.official_name}</span>
            </div>

            {/* Relationship Dropdown */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">
                Relationship<span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="relationship"
                value={editData.relationship}
                onChange={handleEditChange}
              >
                <option value="">Select Relationship</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Husband">Husband</option>
                <option value="Wife">Wife</option>
                <option value="Father-in-law">Father-in-law</option>
                <option value="Mother-in-law">Mother-in-law</option>
                <option value="Grandmother">Grandmother</option>
                <option value="Grandfather">Grandfather</option>
                <option value="Brother-in-law">Brother-in-law</option>
                <option value="Sister-in-law">Sister-in-law</option>
                <option value="Others">Others</option>
                {/* Add more options as needed */}
              </select>
              <span className="text-danger">{formeditError.relationship}</span>
            </div>

            {/* Occupation */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">
                Occupation<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                name="occupation"
                value={editData.occupation}
                onChange={handleEditChange}
              />
              <span className="text-danger">{formeditError.occupation}</span>
            </div>

            {/* Date of Birth */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">
                Date of Birth<span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                name="dob"
                value={editData.dob}
                onChange={handleEditChange}
                max={new Date().toISOString().split("T")[0]} // Max set to today
              />
              <span className="text-danger">{formeditError.dob}</span>
            </div>

            {/* Gender Radio Buttons */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">
                Gender<span className="text-danger">*</span>
              </label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={editData.gender === "Male"}
                  onChange={handleEditChange}
                />
                <label className="form-check-label">Male</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={editData.gender === "Female"}
                  onChange={handleEditChange}
                />
                <label className="form-check-label">Female</label>
              </div>
              <span className="text-danger">{formeditError.gender}</span>
            </div>

            {/* Corporate Employee Radio */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">
                Corporate Employee<span className="text-danger">*</span>
              </label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="is_corporate_employee"
                  value="Yes"
                  checked={editData.is_corporate_employee === "Yes"}
                  onChange={handleEditChange}
                />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="is_corporate_employee"
                  value="No"
                  checked={editData.is_corporate_employee === "No"}
                  onChange={handleEditChange}
                />
                <label className="form-check-label">No</label>
              </div>
              <span className="text-danger">{formeditError.is_corporate_employee}</span>
            </div>



            {/* Sunday School Teacher - shown for all relationships */}
            <div className="col-12 mb-3">
              <label className="col-sm-12 col-form-label">
                Sunday School Teacher<span className="text-danger">*</span>
              </label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="is_sunday_school_teacher"
                  value="Yes"
                  checked={editData.is_sunday_school_teacher === "Yes"}
                  onChange={handleEditChange}
                />
                <label className="form-check-label">Yes</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="is_sunday_school_teacher"
                  value="No"
                  checked={editData.is_sunday_school_teacher === "No"}
                  onChange={handleEditChange}
                />
                <label className="form-check-label">No</label>
              </div>
              <span className="text-danger">{formeditError.is_sunday_school_teacher}</span>
            </div>

            {/* For Father/Mother only: show extra required fields when Sunday School Teacher = Yes */}
            {(editData.relationship === "Father" || editData.relationship === "Mother") &&
              editData.is_sunday_school_teacher === "Yes" && (
                <>
                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">
                      Sunday School Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="sunday_school_name"
                      value={editData.sunday_school_name}
                      onChange={handleEditChange}
                    />
                    <span className="text-danger">{formeditError.sunday_school_name}</span>
                  </div>

                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">
                      Total Service<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="total_service_years"
                      value={editData.total_service_years}
                      onChange={handleEditChange}
                    />
                    <span className="text-danger">{formeditError.total_service_years}</span>
                  </div>

                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">
                      Catechism Service Book
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      className="form-control"
                      name="service_doc"
                      onChange={handleEditChange}
                    />
                    <span className="text-danger">{formeditError.service_doc}</span>
                  </div>
                </>
              )}

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success">
                Update
              </button>
              <button type="button" onClick={() => setModalIsOpen(false)} className="btn btn-danger m-1">
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

    </>
  );
};

export default CandidateFamilyDetails
