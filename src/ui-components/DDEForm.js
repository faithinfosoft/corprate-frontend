import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { Link, useNavigate } from 'react-router-dom';

const DDEForm = () => {
    const [districts, setDistricts] = useState([]);
  const [deptartments, setDepartments] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'DDE Details', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    district: '',
    office_name: '',
    office_address: '',
    phone: '',
    email:'',
    
    dept_type:'dde',
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

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_districts`);
      
      if (response.data.status) {
        setDistricts(response.data.data); // Access the array from the response
      } else {
        setDistricts([]); // Handle the case where no districts are found
      }
    } catch (error) {
      console.error('Error fetching districts:', error.message);
    }
  };
  
  const clearDDEForm = () => {
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


  const saveDDE = async (e) => {
    e.preventDefault();
    const formDataToSubmit = new FormData();
    formDataToSubmit.append("dept_type", 'dde');
    formDataToSubmit.append("district",  formData.district);
    formDataToSubmit.append("office_address",  formData.office_address);
    formDataToSubmit.append("office_name",  formData.office_name);
    formDataToSubmit.append("phone",  formData.phone);
    formDataToSubmit.append("email",  formData.email);
    formDataToSubmit.append("fk_parent_id",  0);

    try {
      const response = await axios.post(`${globalVariables.api_url}/education-department/save_education_department`, formDataToSubmit,{
      headers: {
        'Content-Type': 'application/json',
      },
    });

      if (response.data.status) {
        await fetchDDE();
        clearDDEForm();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving DDE:', error.message);
      print_toast("error", "Failed to save DDE");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

 

  const fetchDDE = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/education-department/view_education_department`, {
            params: { dept_type: 'dde' }
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
    fetchDistricts();
    fetchDDE();
   
  }, []);
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

  const clearParishForm = () => {
    setFormData({
      parish_name: '',
      location: '',
      forane_id: '',
      save_flag: false,
    });
    setFormError({});
  };

  


  const editParish = (parish) => {
    setSelectedParish(parish);
    setEditFormData({
      parish_name: parish.parish_name,
      location: parish.location,
      forane_id: parish.forane_id,
    });
    setModalIsOpen(true);
  };

  const updateParish = async (e) => {
    e.preventDefault();
    if (formData.save_flag) return;

    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));

    try {
      const formDataToUpdate = {
        parish_id: selectedParish.parish_id,
        parish_name: editFormData.parish_name,
        location: editFormData.location,
        forane_id: editFormData.forane_id,
      };

      const response = await axios.post(`${globalVariables.api_url}/parish/update_parish`, formDataToUpdate, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status) {
      //  await fetchParishes();
        clearParishForm();
        print_toast("success", response.data.message);
        setModalIsOpen(false);
      } else {
        print_toast("error", response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error('Error updating Parish:', error.message);
      print_toast("error", "Failed to update Parish");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const editDepartment = (dept) => {
    setSelectedDept(dept); // Set selected department data
    setShowModal(true); // Show the modal
  };
  const deleteDepartment = async (departmentId) => {
    try {
      const response = await axios.delete(`${globalVariables.api_url}/education-department/${departmentId}`);
      if (response.data.status === "success") {
        console.log("DDE Department deleted successfully:", response.data.message);
        print_toast("success", response.data.message);
  
        fetchDDE();
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
        clearDDEForm();  
        print_toast("success", response.data.message);
        setModalIsOpen(false);
  
        fetchDDE();
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



  
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/education-department/update/${selectedDept.dept_id}`,
        selectedDept,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data.status === "success") {
        await  fetchDDE();
        
        setShowModal(false);  // Ensure modal is closed
        setSelectedDept(null); // Clear selected department
        print_toast("success", response.data.message);
        
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      print_toast("error", "Failed to update RDD");
      console.error('Error updating RDD:', error);
    }
  };
  return (
    <>
      <Breadcum items={breadcum} title="DDE Details" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">DDE Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                  <tr>
                      <th scope="col" className='text-center'>Sl No.</th>
                      <th scope="col" className='text-center'>District</th>
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
                        <td colSpan="7">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      deptartments.map((dept, index) => (
                        <tr key={dept.dept_id}>
                          <td>{index + 1}</td>
                          <td>{dept.district}</td>
                          <td>{dept.office_name}</td>
                          <td>{dept.office_address}</td>
                          <td>{dept.phone}</td>
                          <td>{dept.email}</td>
                          <td>  <Link to={`/edu-deo/${dept.dept_id}`} className="btn btn-primary dropdown-item">
  DEO
</Link></td>
                          <td> 
                        
                          <div className="dropdown">
                              <button className="btn btn-dark dropdown-toggle btn-sm" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                Action
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                              {/* <li><Link to={`/edu-deo/${dept.dept_id}`} className="dropdown-item"> DEO </Link></li> */}
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
              <h5 className="card-title">Create DDE Details</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={saveDDE} className='row g-3'>
              <div className="col-12">
  <label htmlFor="district" className="col-sm-12 col-form-label">
    District <span className="text-danger">*</span>
  </label>
  <select
    className="form-control"
    id="district"
    name="district"
    value={formData.district}
    onChange={handleChange}
  >
    <option value="">Select District</option>
    {districts.map((district) => (
      <option key={district.id} value={district}>
        {district}
      </option>
    ))}
  </select>
  <span className="text-danger">{formError.district}</span>
</div>

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
                  <button type="reset" className="btn btn-danger m-1" onClick={clearParishForm}>Cancel</button>
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
          <h5 className="modal-title">Edit DDE Details</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
          ></button>
        </div>
        <div className="modal-body">
        <form onSubmit={handleUpdate}>
            <div className="mb-3">
              <label htmlFor="edit_district" className="form-label">
                District
              </label>
              <select
                id="edit_district"
                className="form-control"
                value={selectedDept?.district || ""}
                onChange={(e) =>
                  setSelectedDept({ ...selectedDept, district: e.target.value })
                }
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
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
                name="phone"
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
                type="text"
                id="edit_email"
                name="email"
                className="form-control"
                value={selectedDept?.email || ""}
                onChange={(e) =>
                  setSelectedDept({ ...selectedDept, email: e.target.value })
                }
              />
                  <span className="text-danger">{formError.email}</span>
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

export default DDEForm;