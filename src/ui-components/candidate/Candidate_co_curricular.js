import React, { useState, useEffect, useRef } from 'react';
import SecureLink from '../SecureLink';
import { useParams } from 'react-router-dom'; // Add this import for useParams
import axios from 'axios';
import NoDataFound from '../NoDataFound.js';
import globalVariables from "../../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../../utilities/Toaster.js";
import Breadcum from '../Breadcum.js';
import pdf from "../../assets/ui-master/img/pdf.jpg";
import DataTable from "react-data-table-component";
import ImageCropper from '../ImageCropperCandicate';

const Candidate_co_curricular = ({ candidateId, readOnly }) => {
  const { candidate_id: param_id } = useParams();
  const effective_candidate_id = candidateId || param_id;
  // const [breadcum, setBreadcum] = useState([
  //   { Title: 'Home', Link: '/' },
  //   { Title: 'Designations', Link: '' },
  // ]);

  const [loaded, setLoaded] = useState(false);
  const [isProfileLocked, setIsProfileLocked] = useState(readOnly || false);
  const [certificates, setCertificates] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [ageRange, setAgeRange] = useState([0, 100]);
  const [formError, setFormError] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editFormError, setEditFormError] = useState({});
  const [editImgModalOpen, seteditImgModalOpen] = useState(false);
  const [editDocModalOpen, seteditDocModalOpen] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [certificate, setCertificate] = useState({});
  const [formData, setFormData] = useState({
    fk_mark_category_id: '',
    m_title: '',
    m_remark: '',
    fk_candidate_id: effective_candidate_id,
    m_document: null,
  });

  const [editFormData, setEditFormData] = useState({
    candidate_cert_id: '',
    fk_mark_category_id: '',
    m_title: '',
    m_remark: '',
  });




  const [editDocFormData, setEditDocFormData] = useState({
    m_document: '',
    m_id: '',
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [saveFlag, setSaveFlag] = useState(false);
  const [editSaveFlag, setEditSaveFlag] = useState(false);
  const [musicianToEdit, setmusicianToEdit] = useState(null);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => {
    setModalIsOpen(false);
    setEditFormData({
      candidate_cert_id: '',
      fk_mark_category_id: '',
      m_title: '',
      m_remark: '',
    });
    setEditFormError({});
  };

  const clearactivityform = () => {
    setFormData({
      fk_mark_category_id: '',
      m_title: '',
      m_remark: '',
      fk_candidate_id: effective_candidate_id,
      m_document: null,
    });
    setEditFormData({});
    // Reset file input
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleEditDoc = (memberData) => {
    setEditDocFormData(prevState => ({
      ...prevState,
      m_document: null,
      m_id: memberData.m_id,
    }));

    seteditDocModalOpen(true);
  };




  const avatarUrl = useRef(formData.m_image);
  const documentInputRef = useRef(null);


  const updateAvatar = (imgSrc, file) => {
    avatarUrl.current = imgSrc;

    //console.log(avatarUrl.current );
    setFormData({
      ...formData,
      m_image: file, // Update the state with the cropped image file


    });
    seteditImgModalOpen(false);
  };






  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/markcategory/get_all_categories`);
      if (response.data.status) {
        setCategoryList(response.data.data);
        // console.log('Category List:', response.data.data); 
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      print_toast('error', 'Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
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



  const updateDocument = async (event) => {
    event.preventDefault();

    try {
      console.log("File to upload:", editDocFormData.m_document);

      // Create a new FormData object and append necessary fields
      const formDataToUpdateDoc = new FormData();
      formDataToUpdateDoc.append('m_id', editDocFormData.m_id);
      formDataToUpdateDoc.append('m_document', editDocFormData.m_document); // File field

      // Log form data for debugging
      for (let [key, value] of formDataToUpdateDoc.entries()) {
        console.log(key, value);
      }

      // Send the POST request with formData
      const response = await axios.post(`${globalVariables.api_url}/musicians/changedoc`, formDataToUpdateDoc, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status) {
        // If successful, fetch the updated musicians and close the modal
        await fetchCertificates();
        print_toast("success", response.data.message);
        seteditDocModalOpen(false);
      } else {
        let error = response.data.error;
        print_toast("error", response.data.message);
        if (error) {
          setFormError(error);
        } else {
          setFormError('');
        }
      }
    } catch (error) {
      console.error('Error updating profile document:', error.message);
    } finally {
      setEditDocFormData((prevState) => ({
        ...prevState,
        save_flag: false,
      }));
    }
  };





  const handleFileChange = (e) => {
    const { name, files } = e.target;

    if (modalIsOpen) {
      // If modal is open, update editFormData
      setEditFormData((prev) => ({
        ...prev,
        [name]: files[0] // Set the first selected file
      }));
    } else {
      // If modal is not open, update formData
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] // Set the first selected file
      }));
    }
  };

  const handleDocumentChange = (e) => {
    const { name, files } = e.target;

    // Update the state correctly based on the modal state
    if (editDocModalOpen) {
      setEditDocFormData((prev) => ({
        ...prev,
        [name]: files[0],  // Store the file in m_document
      }));
    } else {
      // Handle other forms if necessary
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    }
  };




  const decodeHtml = (html) => {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value.replace(/<[^>]*>?/gm, '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (modalIsOpen) {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setEditFormError((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setFormError((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };







  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveFlag(true);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("fk_mark_category_id", formData.fk_mark_category_id);
    formDataToSubmit.append("m_title", formData.m_title);
    formDataToSubmit.append("m_remark", formData.m_remark);
    formDataToSubmit.append("m_document", formData.m_document);
    formDataToSubmit.append("fk_candidate_id", effective_candidate_id);

    try {
      const response = await axios.post(`${globalVariables.api_url}/CandidateCertificates/save`, formDataToSubmit, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        await fetchCertificates();
        clearactivityform();
      } else {
        print_toast("Failed To Save!!!", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error("Catch error details:", error);
      print_toast("error", "An error occurred while saving.");
    } finally {
      setSaveFlag(false);
    }
  };


  const handleEdit = (certificate) => {
    setEditFormData({
      candidate_cert_id: certificate.candidate_cert_id,
      fk_mark_category_id: certificate.fk_mark_category_id,
      m_title: certificate.m_title || '',
      m_remark: certificate.m_remark || '',
    });
    setModalIsOpen(true);
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    setEditSaveFlag(true);

    const formDataToSubmit = new URLSearchParams();
    formDataToSubmit.append("candidate_cert_id", editFormData.candidate_cert_id);
    formDataToSubmit.append("fk_mark_category_id", editFormData.fk_mark_category_id);
    formDataToSubmit.append("m_title", editFormData.m_title);
    formDataToSubmit.append("m_remark", editFormData.m_remark);

    try {
      const response = await axios.post(`${globalVariables.api_url}/CandidateCertificates/update`, formDataToSubmit, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        await fetchCertificates();
        closeModal();
      } else {
        print_toast("error", response.data.message);
        setEditFormError(response.data.error || {});
      }
    } catch (error) {
      console.error("Error updating certificate:", error);
      if (error.response) {
        print_toast("error", `Error: ${error.response.data.message || 'Unknown error occurred.'}`);
      } else {
        print_toast("error", "A network error occurred.");
      }
    } finally {
      setEditSaveFlag(false);
    }
  };



  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/CandidateCertificates/view`, {
        params: {
          candidate_id: effective_candidate_id, // Ensure candidate_id is passed correctly
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
    if (effective_candidate_id) {
      fetchCertificates();
    }
  }, [effective_candidate_id]);



  const handleDelete = async (certificate) => {
    try {
      certificate.delete_flag = true; // Show a loading state or spinner if needed
      setCertificates((prevCertificates) =>
        prevCertificates.map((cert) =>
          cert.candidate_cert_id === certificate.candidate_cert_id
            ? { ...cert, delete_flag: true }
            : cert
        )
      );

      // Send delete request to API
      const formData = new URLSearchParams();
      formData.append('candidate_cert_id', certificate.candidate_cert_id);

      const response = await axios.post(
        `${globalVariables.api_url}/CandidateCertificates/delete`,
        formData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      certificate.delete_flag = false;

      if (response.data.status) {
        print_toast("success", response.data.message);

        // Optimistically update the certificates state
        setCertificates((prevCertificates) =>
          prevCertificates.filter(
            (cert) => cert.candidate_cert_id !== certificate.candidate_cert_id
          )
        );
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting certificate:', error.message);
      print_toast("error", "An error occurred while deleting the certificate.");
    } finally {
      certificate.delete_flag = false;
    }
  };





  const changedocument = (id) => {
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
          const response = await axios.post(globalVariables.api_url + '/CandidateCertificates/updatedocument', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.status) {
            print_toast("success", response.data.message);


            await fetchCertificates();
          } else {
            print_toast("error", response.data.message);
          }
        } catch (error) {
          //console.error('Error uploading document:', error.message);
          //print_toast("error", "An error occurred while uploading the document.");
        }
      }
    };

    input.click(); // Programmatically click the input to open the file dialog
  };




  return (
    <>
      {/* <Breadcum items={breadcum} title="Designations" /> */}

      {/* <p>{JSON.stringify(categoryList,null,2)}</p> */}
      <div className="row">
        <div className={isProfileLocked ? "col-lg-12" : "col-lg-8"}>
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Co Curricular Activities</h5>
            </div>
            <div className="card-body">

              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Category</th>
                      <th scope="col" className="text-center">Title</th>
                      <th scope="col" className="text-center">Document</th>
                      <th scope="col" className="text-center">Remark</th>
                      {!isProfileLocked && <th scope="col" className="text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && certificates.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      certificates.map((certificate, index) => (
                        <tr key={certificate.candidate_cert_id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{decodeHtml(certificate.category_title)}</td>
                          <td className="text-center">{certificate.m_title || '-'}</td>
                          <td className="text-center">
                            {certificate.doc_url !== '' && certificate.certificate_path && certificate.certificate_path.match(/\.[a-zA-Z0-9]+$/) ? (
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
                                {!isProfileLocked && (
                                  <button
                                    onClick={() => changedocument(certificate.candidate_cert_id)}
                                    className="btn btn-primary btn-sm mt-1"
                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                  >
                                    Change Document
                                  </button>
                                )}
                              </div>
                            ) : (
                              !isProfileLocked && (
                                <button
                                  onClick={() => changedocument(certificate.candidate_cert_id)}
                                  className="btn btn-warning btn-sm"
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                  Upload PDF
                                </button>
                              )
                            )}
                          </td>
                          <td className="text-center">{certificate.m_remark || '-'}</td>





                          {!isProfileLocked && (
                            <td className="fw-bold text-center">
                              <div className="dropdown">
                                <button className="btn btn-dark dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                  Action
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                  <li>
                                    <a href="#" className="dropdown-item" onClick={(e) => {
                                      e.preventDefault();
                                      handleEdit(certificate);
                                    }}>Edit</a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      disabled={certificate.delete_flag}
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.preventDefault(); // Prevent default link behavior
                                        // Show confirmation dialog
                                        if (window.confirm('Are you sure you want to delete this certificate?')) {
                                          handleDelete(certificate);
                                        }
                                      }}
                                    >
                                      {certificate.delete_flag ? 'Deleting...' : 'Delete'}
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

                {/* <select>
  {categoryList.flatMap((category) => {
    if (category.sub_cat_english === "IV. Textual Activities" && category.subcategories?.length) {
      return category.subcategories.map((subCategory) => {
        if (subCategory.subcategories?.length) {
          const lastSection = subCategory.subcategories[subCategory.subcategories.length - 1]; // Get last section
          return (
            <option key={lastSection.mark_category_id} value={lastSection.mark_category_id}>
              {lastSection.sub_cat_english}
            </option>
          );
        }
        return null;
      });
    }
    return [];
  })}
</select> */}




              </div>
            </div>
          </div>
        </div>
        {!isProfileLocked && (
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Create Co-Curricular Activities</h5>
              </div>
              <div className="card-body">
                <form role="form" onSubmit={handleSubmit} className="row g-3">



                  {/* 1. Category */}
                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Category<span className="text-danger">*</span></label>
                    <select className="form-control" name="fk_mark_category_id" value={formData.fk_mark_category_id} onChange={handleChange} required>
                      <option value="">Select Category</option>
                      {categoryList.map((category) => {
                        if (category.sub_cat_english === "IV. Textual Activities" || 
                            category.category_title === "IV. Textual Activities" ||
                            category.sub_cat_malayalam === "IV. പാഠ്യേതര പ്രവർത്തനങ്ങൾ") {
                          
                          const getSafeLabel = (obj) => {
                            const label = (obj.sub_cat_english && obj.sub_cat_english !== "undefined")
                              ? obj.sub_cat_english
                              : obj.category_title;
                            return decodeHtml(label || '');
                          };

                          return category.subcategories?.map((level2) => {
                            const label2 = getSafeLabel(level2);

                            const leafOptions = [];
                            if (level2.subcategories && level2.subcategories.length > 0) {
                              level2.subcategories.forEach(level3 => {
                                if (level3.subcategories && level3.subcategories.length > 0) {
                                  level3.subcategories.forEach(level4 => {
                                    const l4Label = getSafeLabel(level4);
                                    if (l4Label && l4Label !== "undefined") {
                                      leafOptions.push({ id: level4.mark_category_id, label: l4Label });
                                    }
                                  });
                                } else {
                                  const l3Label = getSafeLabel(level3);
                                  if (l3Label && l3Label !== "undefined") {
                                    leafOptions.push({ id: level3.mark_category_id, label: l3Label });
                                  }
                                }
                              });

                              if (leafOptions.length === 0) return null;

                              return (
                                <optgroup key={level2.mark_category_id} label={label2}>
                                  {leafOptions.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                  ))}
                                </optgroup>
                              );
                            } else {
                              if (!label2 || label2 === "undefined") return null;
                              return (
                                <option key={level2.mark_category_id} value={level2.mark_category_id}>
                                  {label2}
                                </option>
                              );
                            }
                          });
                        }
                        return null;
                      })}
                    </select>
                    <span className="text-danger">{formError.fk_mark_category_id}</span>
                  </div>

                  {/* 2. Title */}
                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Title<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="m_title"
                      value={formData.m_title}
                      onChange={handleChange}
                      placeholder="Enter title"
                      required
                    />
                    <span className="text-danger">{formError.m_title}</span>
                  </div>

                  {/* 3. Document */}
                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Document<span className="text-danger">*</span></label>
                    <input
                      type="file"
                      accept=".pdf"
                      className="form-control"
                      name="m_document"
                      ref={documentInputRef}
                      onChange={handleDocumentChange}
                      required
                    />
                    {formError.m_document && <div className="error text-danger">{formError.m_document}</div>}
                  </div>

                  {/* 4. Remark */}
                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Remark</label>
                    <textarea
                      className="form-control"
                      name="m_remark"
                      value={formData.m_remark}
                      onChange={handleChange}
                      placeholder="Enter remark (optional)"
                      rows="3"
                    ></textarea>
                    <span className="text-danger">{formError.m_remark}</span>
                  </div>







                  <div className="col-12 text-end">
                    <button type="submit" className="btn btn-success m-1" disabled={formData.save_flag}>
                      {formData.save_flag ? 'Saving...' : 'Save'}
                    </button>
                    {/* <button type="button" onClick={clearDesignationForm} className="btn btn-danger m-1">Cancel</button> */}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal show={modalIsOpen} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Co-Curricular Activity</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleUpdate} className="row g-3">
            {/* 1. Category */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">Category<span className="text-danger">*</span></label>
              <select
                className="form-control"
                name="fk_mark_category_id"
                value={editFormData.fk_mark_category_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categoryList.map((category) => {
                  if (category.sub_cat_english === "IV. Textual Activities" || 
                      category.category_title === "IV. Textual Activities" ||
                      category.sub_cat_malayalam === "IV. പാഠ്യേതര പ്രവർത്തനങ്ങൾ") {
                    
                    return category.subcategories?.map((level2) => {
                      const label2 = decodeHtml(level2.sub_cat_english || level2.category_title || '');

                      const leafOptions = [];

                      if (level2.subcategories && level2.subcategories.length > 0) {
                        level2.subcategories.forEach(level3 => {
                          if (level3.subcategories && level3.subcategories.length > 0) {
                            level3.subcategories.forEach(level4 => {
                              const l4Label = decodeHtml(level4.sub_cat_english || level4.category_title || '');
                              leafOptions.push({ id: level4.mark_category_id, label: l4Label });
                            });
                          } else {
                            const l3Label = decodeHtml(level3.sub_cat_english || level3.category_title || '');
                            leafOptions.push({ id: level3.mark_category_id, label: l3Label });
                          }
                        });

                        return (
                          <optgroup key={level2.mark_category_id} label={label2}>
                            {leafOptions.map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                          </optgroup>
                        );
                      } else {
                        return (
                          <option key={level2.mark_category_id} value={level2.mark_category_id}>
                            {label2}
                          </option>
                        );
                      }
                    });
                  }
                  return null;
                })}
              </select>
              <span className="text-danger">{editFormError.fk_mark_category_id}</span>
            </div>

            {/* 2. Title */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">Title<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="m_title"
                value={editFormData.m_title}
                onChange={handleChange}
                placeholder="Enter title"
                required
              />
              <span className="text-danger">{editFormError.m_title}</span>
            </div>

            {/* 3. Remark */}
            <div className="col-12">
              <label className="col-sm-12 col-form-label">Remark</label>
              <textarea
                className="form-control"
                name="m_remark"
                value={editFormData.m_remark}
                onChange={handleChange}
                placeholder="Enter remark (optional)"
                rows="3"
              ></textarea>
              <span className="text-danger">{editFormError.m_remark}</span>
            </div>

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1" disabled={editSaveFlag}>
                {editSaveFlag ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={closeModal} className="btn btn-secondary m-1">
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

    </>
  );
};

export default Candidate_co_curricular
