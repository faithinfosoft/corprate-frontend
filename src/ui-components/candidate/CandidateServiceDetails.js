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

const CandidateServiceDetails = ({ candidateId, readOnly }) => {
  const { candidate_id: param_id } = useParams();
  const effective_candidate_id = candidateId || param_id;
  // const [breadcum, setBreadcum] = useState([
  //   { Title: 'Home', Link: '/' },
  //   { Title: 'Designations', Link: '' },
  // ]);

  const [services, setExperiances] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [formError, setFormError] = useState({});
  const [formeditError, seteditFormError] = useState({});
  const [formData, setFormData] = useState({
    fk_candidate_id: effective_candidate_id,
    service_start_date: '',
    service_end_date: '',
    institution_organization_name: '',
    location: '',
    candidate_designation: '',
    save_flag: false,
    candidate_service_document: null,
  });
  const [editFormData, setEditFormData] = useState({

    fk_candidate_id: effective_candidate_id,
    service_start_date: '',
    service_end_date: '',
    institution_organization_name: '',
    location: '',
    candidate_designation: '',
    save_flag: false,
    candidate_service_document: null,




  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [designation, setDesignation] = useState({});

  const clearDesignationForm = () => {
    setFormData({
      fk_candidate_id: effective_candidate_id,
      service_start_date: '',
      service_end_date: '',
      institution_organization_name: '',
      location: '',
      candidate_designation: '',
      save_flag: false,
      candidate_service_document: null,
    });
    setEditFormData({});
  };

  const fetchexperiences = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/candidateservicedetails/view_service_details', {

        params: {
          fk_candidate_id: effective_candidate_id,
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
    fetchexperiences();
  }, [effective_candidate_id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (modalIsOpen) {
        setEditFormData(prev => ({ ...prev, [name]: files[0] }));
      } else {
        setFormData(prev => ({ ...prev, [name]: files[0] }));
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormData(prev => ({ ...prev, save_flag: true }));
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      const response = await axios.post(globalVariables.api_url + '/candidateservicedetails/save_service_details', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.status) {
        await fetchexperiences();
        clearDesignationForm();
        print_toast("success", response.data.message);
      } else {
        setFormError(response.data.error || {});
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error saving data:', error.message);
    } finally {
      setFormData(prev => ({ ...prev, save_flag: false }));
    }
  };

  const handleEdit = (designation) => {
    setDesignation(designation);
    setEditFormData({
      fk_candidate_id: effective_candidate_id,
      service_start_date: designation.service_start_date,
      service_end_date: designation.service_end_date,
      institution_organization_name: designation.institution_organization_name,
      location: designation.location,
      candidate_designation: designation.candidate_designation,
      candidate_service_document: null,
    });
    setModalIsOpen(true);
  };

  const updateDesignation = async (e) => {
    e.preventDefault();
    try {

      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: true
      }));

      const data = new FormData();
      data.append('candidate_service_details_id', designation.candidate_service_details_id);
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key] !== null) {
          data.append(key, editFormData[key]);
        }
      });

      const response = await axios.post(globalVariables.api_url + '/candidateservicedetails/update_service_details', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: false
      }));
      if (response.data.status) {
        await fetchexperiences();
        clearDesignationForm();
        print_toast("success", response.data.message);
        setModalIsOpen(false);
      } else {
        seteditFormError(response.data.error || {});
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error updating data:', error.message);
    }
  };

  const handleDelete = async (experiance) => {

    try {
      const response = await axios.post(globalVariables.api_url + '/candidateservicedetails/delete_service_details', {
        candidate_service_details_id: experiance.candidate_service_details_id,
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.data.status) {
        await fetchexperiences();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting designation:', error.message);
    }
  };

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
          const response = await axios.post(globalVariables.api_url + '/candidateservicedetails/update_document', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.status) {
            print_toast("success", response.data.message);
            await fetchexperiences();
          } else {
            print_toast("error", response.data.message);
          }
        } catch (error) {
          console.error('Error uploading document:', error);
          print_toast("error", "Failed to upload document.");
        }
      }
    };
    input.click();
  };

  const isValidDate = (date) => date && !isNaN(new Date(date).getTime());
  return (
    <>
      {/* <Breadcum items={breadcum} title="Designations" /> */}
      <div className="row">
        <div className={readOnly ? "col-lg-12" : "col-lg-8"}>
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Candidate Service</h5>
            </div>
            <div className="card-body">
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
                      <th scope="col" className="text-center">Service Document</th>
                      {!readOnly && <th scope="col" className="text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && services.length === 0 ? (
                      <tr>
                        <td colSpan="8">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      services.map((service, index) => (
                        <tr key={service.candidate_service_details_id}>
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
                          <td className="text-center">
                            {service.candidate_service_document && service.candidate_service_document !== "" && service.candidate_service_document !== "null" ? (
                              <>
                                <SecureLink href={service.doc_url} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={pdf}
                                    alt="PDF"
                                    className="pdf-thumbnail mb-1"
                                    style={{ width: "30px", height: "30px" }}
                                  />
                                </SecureLink>
                                {!readOnly && (
                                  <button
                                    onClick={() => handleDocumentChange(service.candidate_service_details_id)}
                                    className="btn btn-primary btn-sm d-block mx-auto"
                                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                  >
                                    Change Document
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {!readOnly ? (
                                  <button
                                    onClick={() => handleDocumentChange(service.candidate_service_details_id)}
                                    className="btn btn-primary btn-sm d-block mx-auto"
                                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                                  >
                                    Upload Document
                                  </button>
                                ) : (
                                  <span className="badge bg-secondary">No Document</span>
                                )}
                              </>
                            )}
                          </td>
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
                                      onClick={(e) => { e.preventDefault(); handleDocumentChange(service.candidate_service_details_id); }}
                                    >
                                      Update Document
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      className="dropdown-item"
                                      onClick={() => handleEdit(service)}
                                    >
                                      Edit
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#"
                                      disabled={service.delete_flag}
                                      className="dropdown-item"
                                      onClick={(e) => {
                                        e.preventDefault(); // Prevent default link behavior
                                        if (window.confirm('Are you sure you want to delete this data?')) {
                                          handleDelete(service);
                                        }
                                      }}
                                    >
                                      {service.delete_flag ? 'Deleting...' : 'Delete'}
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
        {!readOnly && (
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Add Candidate Service</h5>
              </div>
              <div className="card-body">
                <form role="form" onSubmit={handleSubmit} className="row g-3">
                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Institution/Organization Name<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="institution_organization_name"
                      value={formData.institution_organization_name}
                      onChange={handleChange}


                    />
                    <span className="text-danger">{formError.institution_organization_name}</span>
                  </div>

                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Location<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}


                    />
                    <span className="text-danger">{formError.location}</span>
                  </div>

                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Service Start Date
                      <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="service_start_date"
                      value={formData.service_start_date}
                      onChange={handleChange}
                      max={new Date().toISOString().split("T")[0]} // Max date set to current date
                    />
                    <span className="text-danger">{formError.service_start_date}</span>
                  </div>

                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Service End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="service_end_date"
                      value={formData.service_end_date}
                      onChange={handleChange}
                      min={formData.service_start_date} // Ensure end date is after start date
                      max={new Date().toISOString().split("T")[0]} // Max date set to current date
                    />
                    {/* <span className="text-danger">{formError.service_end_date}</span> */}
                  </div>


                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Designation<span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      name="candidate_designation"
                      value={formData.candidate_designation}
                      onChange={handleChange}

                    />
                    <span className="text-danger">{formError.candidate_designation}</span>
                  </div>

                  <div className="col-12">
                    <label className="col-sm-12 col-form-label">Service Document (PDF)</label>
                    <input
                      type="file"
                      className="form-control"
                      name="candidate_service_document"
                      accept=".pdf"
                      onChange={handleChange}
                    />
                    <span className="text-danger">{formError.candidate_service_document}</span>
                  </div>

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
      < Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)} centered >
        <Modal.Header closeButton>
          <Modal.Title>Edit Candidate Service</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={updateDesignation} className="row g-3">
            <div className="col-12">
              <label className="col-sm-12 col-form-label">Institution/Organization Name</label>
              <input
                type="text"
                className="form-control"
                name="institution_organization_name"
                value={editFormData.institution_organization_name}
                onChange={handleChange}
              />
              <span className="text-danger">{formeditError.institution_organization_name}</span>
            </div>

            <div className="col-12">
              <label className="col-sm-12 col-form-label">Location</label>
              <input
                type="text"
                className="form-control"
                name="location"
                value={editFormData.location}
                onChange={handleChange}
              />
              <span className="text-danger">{formeditError.location}</span>
            </div>

            <div className="col-12">
              <label className="col-sm-12 col-form-label">Service Start Date</label>
              <input
                type="date"
                className="form-control"
                name="service_start_date"
                value={editFormData.service_start_date}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
              />
              <span className="text-danger">{formeditError.service_start_date}</span>
            </div>

            <div className="col-12">
              <label className="col-sm-12 col-form-label">Service End Date</label>
              <input
                type="date"
                className="form-control"
                name="service_end_date"
                value={editFormData.service_end_date}
                onChange={handleChange}
                min={editFormData.service_start_date}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="col-12">
              <label className="col-sm-12 col-form-label">Designation</label>
              <input
                type="text"
                className="form-control"
                name="candidate_designation"
                value={editFormData.candidate_designation}
                onChange={handleChange}
              />
              <span className="text-danger">{formeditError.candidate_designation}</span>
            </div>

            <div className="col-12">
              <label className="col-sm-12 col-form-label">Service Document (PDF)</label>
              <input
                type="file"
                className="form-control"
                name="candidate_service_document"
                accept=".pdf"
                onChange={handleChange}
              />
              <span className="text-danger">{formeditError.candidate_service_document}</span>
            </div>

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1" disabled={editFormData.save_flag}>
                {editFormData.save_flag ? 'Saving...' : 'Update'}
              </button>
              <button type="button" onClick={() => setModalIsOpen(false)} className="btn btn-secondary m-1">
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal >
    </>
  );
};

export default CandidateServiceDetails
