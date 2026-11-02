import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
const DEOForm = () => {
   
  const [deptartments, setDepartments] = useState([]);
  const [dde, setDDE] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const { dept_id } = useParams();
  const [selectedDept, setSelectedDept] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'DDE', Link: '/edu-dde' },
    { Title: 'DEO Details', Link: '' },
  ]);

 


  const [formData, setFormData] = useState({
    district: '',
    office_name: '',
    office_address: '',
    phone: '',
    email:'',
    fk_parent_id:'',
    dept_type:'deo',
    save_flag: false,
  });
  const [selectedParish, setSelectedParish] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    parish_name: '',
    location: '',
    forane_id: '',
  });
  const [modalErrors, setModalErrors] = useState({});




  
  const clearDEOForm = () => {
    setFormData({
        district: '',
        office_name: '',
        office_address: '',
        phone: '',
        email:'',
        
       
        
      save_flag: false,
    });
    setFormError({});
  };
  const fetchDDEDetails = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/education-department/get_education_department_type`, {
            params: {dept_id:dept_id }
          });
      if (response.data.status) {
        setDDE(response.data.data);

        setFormData(prevData => ({
          ...prevData,
          district: dde.district ,
          fk_parent_id: dde.dept_id,
          dept_type:'deo'
        }));

   
        
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch Parish data");
    }
  };

  const fetchDDEOptions = async (district) => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/education-department/get_department_district`,
        {
          params: {
            district: district,
            dept_type: 'dde'
          }
        }
      );

      if (response.data.status) {
        setDdeOptions(response.data.data || []);
      } else {
        setDdeOptions([]);
      }
    } catch (error) {
      console.error('Error fetching DDE options:', error);
      setDdeOptions([]);
      print_toast("error", "Failed to fetch DDE options");
    }
  };



  // useEffect(() => {
   
  //   fetchDEO();
  //   fetchDDEDetails();
   
  // }, []);



  const saveDEO = async (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("dept_type", formData.dept_type);
    formDataToSubmit.append("district",  formData.district);
    formDataToSubmit.append("office_address",  formData.office_address);
    formDataToSubmit.append("office_name",  formData.office_name);
    formDataToSubmit.append("phone",  formData.phone);
    formDataToSubmit.append("email",  formData.email);
    formDataToSubmit.append("fk_parent_id",formData.fk_parent_id);
    try {
      const response = await axios.post(`${globalVariables.api_url}/education-department/save_education_department`, formData,{
      headers: {
        'Content-Type': 'application/json',
      },
    });

      if (response.data.status) {
        await fetchDEO();
        await fetchDDEDetails();
        clearDEOForm();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving DEO:', error.message);
      print_toast("error", "Failed to save DEO");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

 

  const fetchDEO = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/education-department/view_education_department_deptid`, {
            params: { dept_type: 'deo',dept_id:dept_id }
          });
      if (response.data.status) {
        setDepartments(response.data.data);
        
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch Parish data");
    }
  };




  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modalIsOpen) {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
      setModalErrors({
        ...modalErrors,
        [name]: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      setFormError({
        ...formError,
        [name]: '',
      });
    }
  };



  

  useEffect(() => {
    fetchDEO();
    fetchDDEDetails();
  }, [dept_id]); // Run when dept_id changes
  
  useEffect(() => {
    if (dde && dde.district) {
      setFormData((prevData) => ({
        ...prevData,
        district: dde.district, 
        fk_parent_id: dde.dept_id,
         dept_type:'deo'
      }));
    }
  }, [dde]); // Run when dde updates



  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const [ddeOptions, setDdeOptions] = useState([]);
  

  const editDepartment = async (dept) => {
    setSelectedDept(dept);
    
    // If we have the DDE details with district, fetch DDE options
    if (dde && dde.district) {
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          {
            params: {
              district: dde.district,
              dept_type: 'dde'
            }
          }
        );
  
        if (response.data.status) {
          setDdeOptions(response.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching DDE options for edit:', error);
        print_toast("error", "Failed to fetch DDE options");
      }
    }
    
    setShowModal(true);
  };
  


  const deleteDepartment = async (departmentId) => {
    try {
      const response = await axios.delete(`${globalVariables.api_url}/education-department/${departmentId}`);
      if (response.data.status === "success") {
        console.log("DEO Department deleted successfully:", response.data.message);
        print_toast("success", response.data.message);
  
        fetchDEO();
      } else {
        console.error("Failed to delete department:", response.data.message);
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting department:", error.response?.data?.message || error.message);
      print_toast("error", error.response?.data?.message || "An error occurred while deleting the department.");
    }
  };
  const updateDepartment = async () => {
    if (formData.save_flag) return;
  
    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));
  
    try {
      const formDataToUpdate = {
        dept_id: selectedDept.dept_id,
        office_name: selectedDept.office_name,
        office_address: selectedDept.office_address,
        phone: selectedDept.phone,
        email: selectedDept.email,
      };
  
      const response = await axios.post(
        `${globalVariables.api_url}/education-department/update_DEO/${selectedDept.dept_id}`,
        formDataToUpdate,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.status === "success") {
        clearDEOForm();  
        print_toast("success", response.data.message);
        setModalIsOpen(false);
  
        fetchDEO();
      } else {
        print_toast("error", response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error("Error updating DDE:", error.message);
      print_toast("error", "Failed to update DDE. Please try again.");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };
  return (
    <>
      <Breadcum items={breadcum} title="DEO Details" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">DEO Details</h5>
            </div>
            <div className="card-body">
           <div className="mb-4">
            {dde ? (
              <>
                <div className="row">
                  <div className="col-md-12">
                    <h6 className="fw-bold d-flex">
                      <span style={{ width: '150px' }}>DDE:</span>
                      <span className="fw-normal">{dde.office_name}</span>
                    </h6>
                  </div>
                </div>
          
         
                <hr className="my-3" />
              </>
            ) : (
              <p>No application data available.</p>
            )}
          </div>

              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                 
                  <tr>
                      <th scope="col" className='text-center'>Sl No.</th>
                      <th scope="col" className='text-center'>Office Name</th>
                      <th scope="col" className='text-center'>Address</th>
                      <th scope="col" className='text-center'>Phone</th>
                      <th scope="col" className='text-center'>Email</th>
                      <th scope="col" className='text-center' colSpan={2}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && deptartments.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      deptartments.map((dept, index) => (
                        <tr key={dept.dept_id}>
                          <td>{index + 1}</td>
                          <td>{dept.office_name}</td>
                          <td>{dept.office_address}</td>
                          <td>{dept.phone}</td>
                          <td>{dept.email}</td>
                          <td>  <Link to={`/edu-aeo/${dept.dept_id}`} className="btn btn-primary dropdown-item"> AEO </Link></td>
                          <td>
                          <div className="dropdown">
                              <button className="btn btn-dark dropdown-toggle btn-sm" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                Action
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                              {/* <li><Link to={`/edu-aeo/${dept.dept_id}`} className="dropdown-item"> AEO </Link></li> */}
                              <li>
                  <button
                    className="dropdown-item text-primary"
                    onClick={() => editDepartment(dept)}
                  >
                    Edit
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this data?")) {
                        deleteDepartment(dept.dept_id);
                      }
                    }}
                  >
                    Delete
                  </button>
                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Create DEO Details</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={saveDEO} className='row g-3'>


                <div className="col-12">
                  <label htmlFor="office_name" className="col-sm-12 col-form-label">Office Name<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="office_name"
                    name="office_name"
                    placeholder="Enter Office Name"
                    value={formData.office_name}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.office_name}</span>
                </div>
                <div className="col-12">
  <label htmlFor="office_address" className="col-sm-12 col-form-label">
    Office Address<span className="text-danger"></span>
  </label>
  <textarea
    className="form-control"
    id="office_address"
    name="office_address"
    placeholder="Enter Office Address"
    value={formData.office_address}
    onChange={handleChange}
    rows="4" // Adjust the number of rows as needed
  />

</div>
                <div className="col-12">
                  <label htmlFor="phone" className="col-sm-12 col-form-label">Phone<span className="text-danger"></span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="phone"
                    name="phone"
                    placeholder="Enter Phone"
                    value={formData.Phone}
                    onChange={handleChange}
                  />
                 <span className="text-danger">{formError.phone}</span>
                </div>
                <div className="col-12">
                  <label htmlFor="email" className="col-sm-12 col-form-label">Email<span className="text-danger"></span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                    <span className="text-danger">{formError.email}</span>
                </div>
                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-success m-1primary" disabled={formData.save_flag}>
                    {formData.save_flag ? 'Saving...' : 'Save'}
                  </button>
                  <button type="reset" className="btn btn-danger m-1" onClick={clearDEOForm}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Edit DEO Details</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>
        <div className="modal-body">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateDepartment(selectedDept.dept_id); 
              setShowModal(false); 
            }}
          >
    




            <div className="mb-3">
              <label htmlFor="edit_office_name" className="form-label">
                Office Name
              </label>
              <input
                type="text"
                id="edit_office_name"
                className="form-control"
                value={selectedDept?.office_name || ""}
                onChange={(e) =>
                  setSelectedDept({
                    ...selectedDept,
                    office_name: e.target.value,
                  })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="edit_office_address" className="form-label">
                Office Address
              </label>
              <textarea
                id="edit_office_address"
                className="form-control"
                rows="3"
                value={selectedDept?.office_address || ""}
                onChange={(e) =>
                  setSelectedDept({
                    ...selectedDept,
                    office_address: e.target.value,
                  })
                }
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="edit_phone" className="form-label">
                Phone
              </label>
              <input
                type="text"
                id="edit_phone"
                className="form-control"
                value={selectedDept?.phone || ""}
                onChange={(e) =>
                  setSelectedDept({ ...selectedDept, phone: e.target.value })
                }
              />

            </div>
            <div className="mb-3">
              <label htmlFor="edit_email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="edit_email"
                className="form-control"
                value={selectedDept?.email || ""}
                onChange={(e) =>
                  setSelectedDept({ ...selectedDept, email: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn btn-primary">
Update            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default DEOForm;