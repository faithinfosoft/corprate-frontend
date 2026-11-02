import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Add this import for useParams
import axios from 'axios';
import NoDataFound from '../NoDataFound.js';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';
import Breadcum from '../Breadcum.js';

const CandidateAcademic = () => {
  const { candidate_id } = useParams();
  
  const [academicqualifications, setAcademicQualifications] = useState([]);

  const [types, setTypes] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [formError, setFormError] = useState({});
  const [formeditError, seteditFormError] = useState({});
  const [formData, setFormData] = useState({
    fk_candidate_id: candidate_id, 
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
                   
});
  const [editFormData, setEditFormData] = useState({

    fk_candidate_id: candidate_id, 
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




  });
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [designation, setDesignation] = useState({});

  const clearDesignationForm = () => {
    setFormData({
      fk_candidate_id: candidate_id, 
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
    });
    setEditFormData({});
  };

  const fetchTypes = async () => {
    try {
        const response = await axios.post(globalVariables.api_url + '/candidatequalificationdetails/get_type', formData, {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modalIsOpen) {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setFormError(prevErrors => ({ ...prevErrors, [name]: '' }));
    seteditFormError(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     setFormData(prev => ({ ...prev, save_flag: true }));
  //     const response = await axios.post(globalVariables.api_url + '/candidateservicedetails/save_service_details', formData, {
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  //     });
  //     if (response.data.status) {
  //       await fetchexperiences();
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

  // const handleEdit = (designation) => {
  //   setDesignation(designation);
  //   setEditFormData({
  //     fk_candidate_id: candidate_id,
  //     service_start_date: designation.service_start_date,
  //     service_end_date: designation.service_end_date,
  //     institution_organization_name: designation.institution_organization_name,
  //     location: designation.location,
  //     candidate_designation: designation.candidate_designation,
  //   });
  //   setModalIsOpen(true);
  // };

  // const updateDesignation = async (e) => {
  //   e.preventDefault();
  //   try {

  //     setEditFormData(prevEditFormData => ({
  //       ...prevEditFormData,
  //       save_flag: true
  //     }));
  //     const response = await axios.post(globalVariables.api_url + '/candidateservicedetails/update_service_details', {
  //       candidate_service_details_id : designation.candidate_service_details_id ,
  //       ...editFormData,
  //     }, {
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  //     });

  //     setEditFormData(prevEditFormData => ({
  //       ...prevEditFormData,
  //       save_flag: false
  //     }));
  //     if (response.data.status) {
  //       await fetchexperiences();
  //       clearDesignationForm();
  //       print_toast("success", response.data.message);
  //       setModalIsOpen(false);
  //     } else {
  //       seteditFormError(response.data.error || {});
  //       print_toast("error", response.data.message);
  //     }
  //   } catch (error) {
  //     console.error('Error updating data:', error.message);
  //   }
  // };

  // const handleDelete = async (experiance) => {
  
  //     try {
  //       const response = await axios.post(globalVariables.api_url + '/candidateservicedetails/delete_service_details', {
  //         candidate_service_details_id : experiance.candidate_service_details_id ,
  //       }, {
  //         headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  //       });

  //       if (response.data.status) {
  //         await fetchexperiences();
  //         print_toast("success", response.data.message);
  //       } else {
  //         print_toast("error", response.data.message);
  //       }
  //     } catch (error) {
  //       console.error('Error deleting designation:', error.message);
  //     }
   
  // };


  
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
  }, []);

  return (
    <>
      {/* <Breadcum items={breadcum} title="Designations" /> */}
      <div className="row">
  <div className="col-lg-12">
    <div className="card">
      <div className="card-header">
        <h5 className="card-title">Create Academic Qualifications</h5>
      </div>
      <div className="card-body">
        <form role="form" className="row g-3">
          <div className="row">
            <div className="col-md-6">
              <label className="col-sm-12 col-form-label">Course<span className="text-danger">*</span></label>
              <select
    className="form-control"
    name="course" // Ensure this matches your state and backend
    value={formData.course} // Update value to qualification_type
    onChange={handleChange}
>
    <option value="">Select </option> {/* Default option */}
    {loaded && types.length > 0 ? (
        academicqualifications.map(([key, value], index) => ( // Destructure to get key and value
            <option key={index} value={key}>
                {value}
            </option>
        ))
    ) : (
        <option disabled>Loading...</option> // Loading state
    )}
</select>
              
              
              
              <span className="text-danger">{formError.course}</span>
            </div>

            <div className="col-md-6">
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

            <div className="col-md-6">
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

            <div className="col-md-6">
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

            <div className="col-md-6">
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

            <div className="col-md-6">
              <label className="col-sm-12 col-form-label">Qualification Type<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="qual_type"
                value={formData.qual_type}
                onChange={handleChange}
              />
              <span className="text-danger">{formError.qual_type}</span>
            </div>

            <div className="col-md-6">
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

            <div className="col-md-6">
              <label className="col-sm-12 col-form-label">Document Path</label>
              <input
                type="text"
                className="form-control"
                name="doc_path"
                value={formData.doc_path}
                onChange={handleChange}
              />
              <span className="text-danger">{formError.doc_path}</span>
            </div>

            <div className="col-md-6">
              <label className="col-sm-12 col-form-label">Name of Test</label>
              <input
                type="text"
                className="form-control"
                name="name_of_test"
                value={formData.name_of_test}
                onChange={handleChange}
              />
              <span className="text-danger">{formError.name_of_test}</span>
            </div>

            <div className="col-md-6">
              <label className="col-sm-12 col-form-label">Conducted by Whom</label>
              <input
                type="text"
                className="form-control"
                name="conducted_whom"
                value={formData.conducted_whom}
                onChange={handleChange}
              />
              <span className="text-danger">{formError.conducted_whom}</span>
            </div>

            <div className="col-md-6">
              <label className="col-sm-12 col-form-label">Month of Passing</label>
              <input
                type="text"
                className="form-control"
                name="month_of_passing"
                value={formData.month_of_passing}
                onChange={handleChange}
              />
              <span className="text-danger">{formError.month_of_passing}</span>
            </div>

            <div className="col-md-6">
              <label className="col-sm-12 col-form-label">Certificate Number</label>
              <input
                type="text"
                className="form-control"
                name="certificate_no"
                value={formData.certificate_no}
                onChange={handleChange}
              />
              <span className="text-danger">{formError.certificate_no}</span>
            </div>

            <div className="col-md-6">
              <label className="col-sm-12 col-form-label">Certificate Date</label>
              <input
                type="date"
                className="form-control"
                name="certificate_date"
                value={formData.certificate_date}
                onChange={handleChange}
              />
              <span className="text-danger">{formError.certificate_date}</span>
            </div>

            <div className="col-md-6">
              <label className="col-sm-12 col-form-label">Remarks</label>
              <textarea
                className="form-control"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
              ></textarea>
              <span className="text-danger">{formError.remarks}</span>
            </div>
          </div>

          <div className="col-12 text-end">
            <button type="submit" className="btn btn-success m-1" disabled={formData.save_flag}>
              {formData.save_flag ? 'Saving...' : 'Save'}
            </button>
            <button type="button" onClick={clearDesignationForm} className="btn btn-danger m-1">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>


        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Teaching Experience</h5>
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
                      <th scope="col" className="text-center">Actions</th>
                    </tr>
                  </thead>
                  {/* <tbody>
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
  {service.service_start_date
    ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(service.service_start_date))
    : null}
</td>
<td className="text-center">
  {service.service_end_date
    ? new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(service.service_end_date))
    : null}
</td>

                          <td className="text-center">{service.candidate_designation}</td>
                          
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

                        </tr>
                      ))
                    )}
                  </tbody> */}
                </table>
              </div>
            </div>
          </div>
        </div>
       
      </div>

      {/* Modal for Editing */}
      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Teaching Experience</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <form onSubmit={updateDesignation}>
            <div className="mb-3">
              <label className="col-form-label">Institution/Organization Name:<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="institution_organization_name"
                value={editFormData.institution_organization_name}
                onChange={handleChange}
                required
              />
              <span className="text-danger">{formeditError.institution_organization_name}</span>
            </div>
            <div className="mb-3">
              <label className="col-form-label">Location:<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                name="location"
                value={editFormData.location}
                onChange={handleChange}
                required
              />
              <span className="text-danger">{formeditError.location}</span>
            </div>
            <div className="mb-3">
              <label className="col-form-label">Service Start Date:<span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                name="service_start_date"
                value={editFormData.service_start_date}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]} // Max date set to current date
                required
              />
              <span className="text-danger">{formeditError.service_start_date}</span>
            </div>
            <div className="mb-3">
              <label className="col-form-label">Service End Date:</label>
              <input
                type="date"
                className="form-control"
                name="service_end_date"
                value={editFormData.service_end_date}
                min={editFormData.service_start_date} // Ensure end date is after start date
                max={new Date().toISOString().split("T")[0]} // Max date set to current date
                onChange={handleChange}
                required
              />
              <span className="text-danger">{formeditError.service_end_date}</span>
            </div>
            <div className="mb-3">
              <label className="col-form-label">Designation:<span className="text-danger">*</span></label>
              <input
                    type="text"
                    className="form-control"
                    name="candidate_designation"
                    value={editFormData.candidate_designation}
                    onChange={handleChange}
                    
                  />
              <span className="text-danger">{formeditError.candidate_designation}</span>
            </div>
            <div className="col-12 text-end">
                  <button type="submit" className="btn btn-success m-1" disabled={editFormData.save_flag}>
                    {editFormData.save_flag ? 'Updating...' : 'Update'}
                  </button>
                  <button type="button" onClick={clearDesignationForm} className="btn btn-danger m-1">Cancel</button>
                </div>
          </form> */}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CandidateAcademic
