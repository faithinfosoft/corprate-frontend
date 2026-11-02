import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';

const Treasury = () => {

  const [treasury, setTreasury] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [selectedTreasury, setSelectedTreasury] = useState(null);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Treasury Details', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    treasury_location: '',
    treasury_address: '',
    treasury_phone: '',
    treasury_email: '',
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


  
  const clearTreasuryForm = () => {
    setFormData({
        treasury_location: '',
    treasury_address: '',
    treasury_phone: '',
    treasury_email: '',
      save_flag: false,
    });
    setFormError({});
  };


  const saveTreasury = async (e) => {
    e.preventDefault();
    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));


    try {
      const response = await axios.post(`${globalVariables.api_url}/treasury/save_treasury`, formData,{
      headers: {
        'Content-Type': 'application/json',
      },
    });

      if (response.data.status) {
        await fetchTreasury();
        clearTreasuryForm();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving Treasury:', error.message);
      print_toast("error", "Failed to save Treasury");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

  const handleDelete = async (treasuryId) => {
    if (window.confirm("Are you sure you want to delete this treasury?")) {
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/treasury/delete_treasury`,
          { treasury_id: treasuryId }
        );
        if (response.data.status) {
          await fetchTreasury(); // Refresh treasury data
          print_toast("success", response.data.message);
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        
        console.error("Error deleting Treasury:",error.response?.data?.message || error.message);
        print_toast("error", error.response?.data?.message || "Failed to delete Treasury");
      }
    }
  };
  


  const saveEditTreasury = async (e) => {
    e.preventDefault();
    console.log("treasury_id: ", editFormData.treasury_id);
    try {
      const response = await axios.put(
        `${globalVariables.api_url}/treasury/update_treasury/${editFormData.treasury_id}`,
        editFormData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (response.data.status) {
        await fetchTreasury(); // Refresh treasury data
        setModalIsOpen(false); // Close modal after saving
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error("Error updating Treasury:", error.message);
      print_toast("error", "Failed to update Treasury");
    }
  };
    


  const handleEdit = (treasury) => {
    setEditFormData({
      treasury_id: treasury.treasury_id,
      treasury_location: treasury.treasury_location,
      treasury_phone: treasury.treasury_phone,
      treasury_email: treasury.treasury_email,
    });
    setModalIsOpen(true);
  };
  

 

  const fetchTreasury = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/treasury/view_treasury`);
      if (response.data.status) {
        setTreasury(response.data.data);
        
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch Treasury data");
    }
  };

  useEffect(() => {
  
    fetchTreasury();
   
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

  
  

  return (
    <>
      <Breadcum items={breadcum} title="Treasury Details" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Treasury Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                  <tr>
                      <th scope="col" className='text-center'>Sl No.</th>
                      <th scope="col" className='text-center'>Location</th>
                      <th scope="col" className='text-center'>Phone</th>
                      <th scope="col" className='text-center'>Email</th>
                      <th scope="col" className='text-center'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && treasury.length === 0 ? (
                      <tr>
                        <td colSpan="5">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      treasury.map((t, index) => (
                        <tr key={t.treasury_id}>
                          <td>{index + 1}</td>
                      
                          <td>{t.treasury_location}</td>
                          <td>{t.treasury_phone}</td>
                          <td>{t.treasury_email}</td>
                         
                          <td>
                            <div className="dropdown">
                              <button className="btn btn-dark dropdown-toggle btn-sm" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                Action
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                <li>
                                <li>
  <button
    className="dropdown-item"
    onClick={() => handleEdit(t)}
  >
    Edit
  </button>
</li>
<li>
  <button
    className="dropdown-item text-danger"
    onClick={() => {
     
        handleDelete(t.treasury_id)
      
    }}
    
  >
    Delete
  </button>
</li>

                                </li>
                                <li>
                               
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
              <h5 className="card-title">Create Treasury Details</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={saveTreasury} className='row g-3'>


                <div className="col-12">
                  <label htmlFor="treasury_location" className="col-sm-12 col-form-label">Location<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="treasury_location"
                    name="treasury_location"
                    placeholder="Enter Location"
                    value={formData.treasury_location}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.treasury_location}</span>
                </div>

                <div className="col-12">
                  <label htmlFor="treasury_phone" className="col-sm-12 col-form-label">Phone<span className="text-danger"></span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="treasury_phone"
                    name="treasury_phone"
                    placeholder="Enter Phone"
                    value={formData.treasury_phone}
                    onChange={handleChange}
                  />
               
                </div>
                <div className="col-12">
                  <label htmlFor="treasury_email" className="col-sm-12 col-form-label">Email<span className="text-danger"></span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="treasury_email"
                    name="treasury_email"
                    placeholder="Enter Email"
                    value={formData.treasury_email}
                    onChange={handleChange}
                  />
               
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

        <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Treasury</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form>
      <div className="mb-3">
        <label htmlFor="edit_location" className="form-label">Location</label>
        <input
          type="text"
          className="form-control"
          id="edit_location"
          name="treasury_location"
          value={editFormData.treasury_location}
          onChange={handleChange}
        />
        <span className="text-danger">{modalErrors.treasury_location}</span>
      </div>
      <div className="mb-3">
        <label htmlFor="edit_phone" className="form-label">Phone</label>
        <input
          type="text"
          className="form-control"
          id="edit_phone"
          name="treasury_phone"
          value={editFormData.treasury_phone}
          onChange={handleChange}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="edit_email" className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          id="edit_email"
          name="treasury_email"
          value={editFormData.treasury_email}
          onChange={handleChange}
        />
      </div>
    </form>
  </Modal.Body>
  <Modal.Footer>
    <button
      className="btn btn-primary"
      onClick={saveEditTreasury}
    >
     Update
    </button>
    <button
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

export default Treasury;