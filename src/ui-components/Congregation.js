import React, { useState, useEffect } from 'react';
import Breadcum from './Breadcum';
import axios from 'axios';
import globalVariables from '../Global.js';
import print_toast from '../utilities/Toaster.js';

const Congregation = () => {
  const [title, setTitle] = useState(''); 
  const [congregations, setCongregations] = useState([]); 
  const [saveFlag, setSaveFlag] = useState(false); 
  const [editCongregationId, setEditCongregationId] = useState(null); 
  const [editTitle, setEditTitle] = useState(''); 
  const [showEditModal, setShowEditModal] = useState(false); 
  const [formError, setFormError] = useState('');

  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Congregation', Link: '' },
  ]);

  const fetchCongregations = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/congregation/view`);
      if (response.data.status) {
        setCongregations(response.data.data);
       //print_toast('success', 'Congregations loaded successfully');
      } else {
        print_toast('error', 'Failed to load congregations');
      }
    } catch (error) {
      //print_toast('error', 'Error fetching congregations');
    }
  };

  useEffect(() => {
    fetchCongregations();
  }, []);

  const handleAddCongregation = async (e) => {
    e.preventDefault();
  
    // Clear any previous error message
    setFormError('');
  
    if (title.trim() !== '') {
      setSaveFlag(true);
      const titleData = { title: title.trim() };
  
      try {
        const response = await axios.post(`${globalVariables.api_url}/congregation/save`, titleData);
  
        if (response.data.status) {
          setCongregations([...congregations, { title: title.trim() }]);
          setTitle('');
          print_toast('success', 'Congregation added successfully!');
        } else {
          print_toast('error', 'Failed to add congregation.');
        }
      } catch (error) {
        console.error(error);
      }
  
      setSaveFlag(false);
    } else {
      // Set the error message when title is empty
      setFormError('Congregation Name cannot be empty!');
    }
  };
  
  
  
  
  
  
  

  const handleEditCongregation = (congregationId, congregationTitle) => {
    setEditCongregationId(congregationId);
    setEditTitle(congregationTitle);
    setShowEditModal(true); 
  };

  const handleUpdateCongregation = async () => {
    if (editTitle.trim() !== '') {
      try {
        const titleData = { title: editTitle.trim() };

        const response = await axios.put(
          `${globalVariables.api_url}/congregation/update/${editCongregationId}`,
          titleData
        );

        if (response.data.status) {
          setCongregations(
            congregations.map((item) =>
              item.congregation_id === editCongregationId ? { ...item, title: editTitle } : item
            )
          );
          print_toast('success', 'Congregation updated successfully!');
          setShowEditModal(false); 
        } else {
          print_toast('error', 'Failed to update congregation.');
        }
      } catch (error) {
        print_toast('error', 'Error updating congregation');
      }
    } else {
      print_toast('warning', 'Title cannot be empty!');
    }
  };

  
  const handleDeleteCongregation = async (congregationId) => {
    try {
      const response = await axios.delete(`${globalVariables.api_url}/congregation/delete/${congregationId}`); // Pass the ID in the URL
      if (response.data.status) {
        setCongregations(congregations.filter((item) => item.congregation_id !== congregationId));
        print_toast('success', response.data.message);
      } else {
        print_toast('error', response.data.message);
      }
    } catch (error) {
      print_toast('error', 'Error deleting congregation');
    }
  };
  

  return (
    <div className="container">
      <Breadcum items={breadcum} title="Congregation" />
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Congregation Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No</th>
                      <th scope="col" className="text-center">Title</th>
                      <th scope="col" className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {congregations.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">No congregations added yet.</td>
                      </tr>
                    ) : (
                      congregations.map((item, index) => (
                        <tr key={item.congregation_id}>
                          <td className="text-center">{index + 1}</td>
                          <td>{item.title}</td>
                          <td className="text-center">
                            <div className="dropdown">
                              <button
                                className="btn btn-secondary btn-sm dropdown-toggle"
                                type="button"
                                id={`dropdownMenuButton${item.congregation_id}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                Actions
                              </button>
                              <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${item.congregation_id}`}>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleEditCongregation(item.congregation_id, item.title)}
                                  >
                                    Edit
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => handleDeleteCongregation(item.congregation_id)}
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
              <h5 className="card-title">Create Congregation</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddCongregation} id="form-add-congregation">
              <div className="form-group">
  <label htmlFor="title" className="col-form-label">
    Congregation Name: <span className="text-danger">*</span>
  </label>
  <input
    type="text"
    className="form-control"
    id="title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
  {/* Inline error message */}
  {formError && <div className="text-danger mt-2">{formError}</div>}
</div>


                <div className="col-12 text-end">
                  <button
                    type="submit"
                    className="btn btn-success m-1"
                    disabled={saveFlag}
                  >
                    {saveFlag ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="false">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editModalLabel">Edit Congregation</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="editTitle" className="col-form-label">Congregation Name: <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="editTitle"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">

              <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateCongregation}
                >
                  Update
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Congregation;
