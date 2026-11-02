import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { useParams } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
const AEOForm = () => {
    const [districts, setDistricts] = useState([]);
  const [deptartments, setDepartments] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
   const [deo, setDEO] = useState([]);
  const { dept_id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'DDE', Link: '/edu-dde' },
    { Title: 'DEO', Link: '/' },
    { Title: 'AEO Details', Link: '' },
  ]);
  
  useEffect(() => {
    if (deo && deo.fk_parent_id) {
      setBreadcum(prevBreadcum => 
        prevBreadcum.map(bc => 
          bc.Title === 'DEO' 
            ? { ...bc, Link: `/edu-deo/${deo.fk_parent_id}` } 
            : bc
        )
      );
    }
  }, [deo]);

 
const [formData, setFormData] = useState({
    district: '',
    office_name: '',
    office_address: '',
    phone: '',
    email: '',
    fk_parent_id: "",  // Initially empty, will be set in useEffect
    dept_type: 'aeo',
    save_flag: false,
  });
  
  useEffect(() => {
    if (selectedDept) {
      setFormData(prevData => ({
        ...prevData,
        fk_parent_id: selectedDept.fk_parent_id,
        district: selectedDept.district,
        office_name: selectedDept.office_name,
        office_address: selectedDept.office_address,
        phone: selectedDept.phone,
        email: selectedDept.email,
      }));
    }
  }, [selectedDept]);
  const [selectedParish, setSelectedParish] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    parish_name: '',
    location: '',
    forane_id: '',
  });
  const [modalErrors, setModalErrors] = useState({});


  const clearAEOForm = () => {
    setFormData({
     
        office_name: '',
        office_address: '',
        phone: '',
        email:'',
      save_flag: false,
    });
    setFormError({});
  };

 
  const fetchDEODetails = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/education-department/get_education_department_type`, {
            params: {dept_id:dept_id }
          });
      if (response.data.status) {
        setDEO(response.data.data);


        setFormData(prevData => ({
          ...prevData,
          district: deo.district ,
          fk_parent_id: deo.dept_id,
          dept_type:'aeo'
        }));
        
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch Parish data");
    }
  };



  const saveAEO = async (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("dept_type", 'aeo');
    formDataToSubmit.append("district",  formData.district);
    formDataToSubmit.append("office_address",  formData.office_address);
    formDataToSubmit.append("office_name",  formData.office_name);
    formDataToSubmit.append("phone",  formData.phone);
    formDataToSubmit.append("email",  formData.email);
    formDataToSubmit.append("fk_parent_id",  formData.fk_parent_id);
  
    try {
      const response = await axios.post(`${globalVariables.api_url}/education-department/save_education_department`, formDataToSubmit,{
      headers: {
        'Content-Type': 'application/json',
      },
    });

      if (response.data.status) {
        await fetchAEO();
        await fetchDEODetails();
        clearAEOForm();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving AEO:', error.message);
      print_toast("error", "Failed to save AEO");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };



  const fetchAEO = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/education-department/view_education_department_deptid`, {
            params: { dept_type: 'aeo',dept_id:dept_id }
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

  useEffect(() => {
    
    fetchDEODetails();
    fetchAEO();
   
  }, [dept_id]);


  useEffect(() => {
    if (deo && deo.district) {
      setFormData((prevData) => ({
        ...prevData,
        district: deo.district, 
        fk_parent_id: deo.dept_id,
         dept_type:'aeo'
      }));
    }
  }, [deo]); // Run when dde updates





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






  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const [dEOOptions, setDEOOptions] = useState([]);
  const handleChangeDEO = async (e) => {
    const { name, value } = e.target;
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  
    if (name === "district") {
      setFormData((prevData) => ({
        ...prevData,
        fk_parent_id: "", // Reset DDE dropdown
      }));
      const deptType = "deo";
      setDEOOptions([]); // Clear DDE options initially
  
      if (value) {
        try {
          const response = await axios.get(
            `${globalVariables.api_url}/education-department/get_department_district`,
            { params: { district: value, dept_type: deptType } }
          );
  
          setDEOOptions(response.data.data || []); // Populate DDE options with the API response
        } catch (error) {
          console.error("Error fetching DDE options:", error);
          setDEOOptions([]); // Clear options in case of an error
        }
      }
    }
  };

  const editDepartment = (dept) => {
    setSelectedDept(dept); // Set selected department data
    setShowModal(true); // Show the modal
  };
  const deleteDepartment = async (departmentId) => {
    try {
      const response = await axios.delete(`${globalVariables.api_url}/education-department/${departmentId}`);
      if (response.data.status === "success") {
        console.log("DEO Department deleted successfully:", response.data.message);
        print_toast("success", response.data.message);
  
        fetchAEO();
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
        district: selectedDept.district,
        office_name: selectedDept.office_name,
        office_address: selectedDept.office_address,
        phone: selectedDept.phone,
        email: selectedDept.email,
      };
  
      const response = await axios.post(
        `${globalVariables.api_url}/education-department/update/${selectedDept.dept_id}`,
        formDataToUpdate,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (response.data.status === "success") {
        clearAEOForm();  
        print_toast("success", response.data.message);
        setModalIsOpen(false);
  
        fetchAEO();
      } else {
        print_toast("error", response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error("Error updating AEO:", error.message);
      print_toast("error", "Failed to update AEO. Please try again.");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

  
  useEffect(() => {
    if (selectedDept) {
      setFormData(prevData => ({
        ...prevData,
        fk_parent_id: selectedDept.fk_parent_id,
        district: selectedDept.district,
        office_name: selectedDept.office_name,
        office_address: selectedDept.office_address,
        phone: selectedDept.phone,
        email: selectedDept.email,
      }));
    }
  }, [selectedDept]); 
  return (
    <>
      <Breadcum items={breadcum} title="AEO Details" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">AEO Details</h5>
            </div>
            <div className="card-body">
            <div className="mb-4">
            {deo ? (
              <>
                <div className="row">
                  <div className="col-md-12">
                    <h6 className="fw-bold d-flex">
                      <span style={{ width: '150px' }}>DEO:</span>
                      <span className="fw-normal">{deo.office_name}</span>
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
                      <th scope="col" className='text-center'>Actions</th>
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
                          <td>
                          <div className="dropdown">
                              <button className="btn btn-dark dropdown-toggle btn-sm" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                Action
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            
                                
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
              <h5 className="card-title">Create AEO Details</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={saveAEO} className='row g-3'>




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
                  <button type="reset" className="btn btn-danger m-1" onClick={clearAEOForm}>Cancel</button>
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
                <span className="text-danger">{formError.phone}</span>
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

export default AEOForm;