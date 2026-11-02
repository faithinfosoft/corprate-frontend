import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import DataTable from "react-data-table-component";
const Parish = () => {
  const [parishes, setParishes] = useState([]);
  const [foranes, setForanes] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Parish', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    parish_name: '',
    location: '',
    forane_id: '',
    save_flag: false,
  });
  const dataTableRef = useRef(null);
  const [show, setShow] = useState(false);
   const [tableData, setTableData] = useState([]);
   const [showTable, setShowTable] = useState(false);
  const [selectedParish, setSelectedParish] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    parish_name: '',
    location: '',
    forane_id: '',
  });
  const [modalErrors, setModalErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);
// Add this handler to track page changes
const handlePageChange = page => {
  setCurrentPage(page);
};

// Add this handler to track rows per page changes
const handlePerRowsChange = (newRowsPerPage, page) => {
  setRowsPerPage(newRowsPerPage);
};
  const fetchParishes = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/parish/view_parish`);
      if (response.data.status) {
        setParishes(response.data.data);
        setTableData(response.data);
        setShowTable(true);
        
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch Parish data");
    }
  };

  const fetchForanes = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/parish/getForanes`);
      if (response.data.status) {
        setForanes(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching foranes:', error.message);
      print_toast("error", "Failed to fetch Forane data");
    }
  };

  useEffect(() => {
    fetchParishes();
    fetchForanes();
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

  const saveParish = async (e) => {
    e.preventDefault();
    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));

    try {
      const response = await axios.post(`${globalVariables.api_url}/parish/save_parish`, formData,{
      headers: {
        'Content-Type': 'application/json',
      },
    });

      if (response.data.status) {
        await fetchParishes();
        clearParishForm();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving Parish:', error.message);
      print_toast("error", "Failed to save Parish");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

  const deleteParish = async (parish) => {
    if (parish.delete_flag) return;

    try {
      const updatedParish = { ...parish, delete_flag: true };
      setSelectedParish(updatedParish);

      const formData = { 'parish_id': parish.parish_id };
      const response = await axios.post(`${globalVariables.api_url}/parish/delete_parish`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.status) {
        setParishes(parishes.filter((p) => p.parish_id !== parish.parish_id));
        print_toast("success", response.data.message);
      } else {
        // Handle specific error cases
        if (response.data.message.includes("associated schools")) {
          print_toast("error", "Cannot delete parish. There are associated schools.");
        } else {
          print_toast("error", response.data.message || "Failed to delete Parish");
        }
      }
    } catch (error) {
      console.error('Error deleting Parish:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        print_toast("error", error.response.data.message || "Server error occurred while deleting Parish");
      } else if (error.request) {
        // The request was made but no response was received
        print_toast("error", "No response received from server. Please try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        print_toast("error", "An unexpected error occurred. Please try again.");
      }
    } finally {
      setSelectedParish({ ...selectedParish, delete_flag: false });
    }
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
        await fetchParishes();
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
  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true
    },
    { 
      name: "Forane", 
      selector: (row) => capitalizeWords(row.forane_name), 
      sortable: true, 
      minWidth: '280px' 
    },
    { 
      name: "Parish", 
      selector: (row) => capitalizeWords(row.parish_name), 
      sortable: true, 
      minWidth: '280px' 
    },
    { 
      name: "Location", 
      selector: (row) => capitalizeWords(row.location), 
      sortable: true, 
      minWidth: '280px' 
    },

    
{
      name: "Actions",
      cell: (row) => (
        <div className="dropdown">
          <button 
            className="btn btn-dark dropdown-toggle btn-sm" 
            type="button" 
            id="dropdownMenuButton1" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            Action
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <li><a href="#" className="dropdown-item" onClick={() => editParish(row)}>Edit</a></li>
            <li>
              <a
                href="#"
                disabled={row.delete_flag}
                className="dropdown-item"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this parish?')) {
                    deleteParish(row);
                  }
                }}
              >
                {row.delete_flag ? 'Deleting...' : 'Delete'}
              </a>
            </li>
      
          </ul>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];
  
      const [searchTerm, setSearchTerm] = useState('');
  
    const handleSearch = (event) => {
      setSearchTerm(event.target.value);
    };
  
    const filteredApplications = (tableData.data || []).filter(tdata =>
      tdata.parish_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tdata.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  return (
    <>
      <Breadcum items={breadcum} title="Parish" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Parish Details</h5>
            </div>
            <div className="card-body">
            <div className="d-flex justify-content-end mb-3">
            <input
              type="text"
              className="form-control w-25"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
            <div className="table-container">
                {showTable ? (
                  <DataTable
                   className="custom-data-table"
                    columns={columns}
                    data={filteredApplications}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    ref={dataTableRef}
                    noDataComponent="No data available"
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handlePerRowsChange}
                    paginationDefaultPage={currentPage}
                    paginationPerPage={rowsPerPage}
                  />
                ) : (
                  <div></div>
                )}
              </div>


            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Create Parish</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={saveParish} className='row g-3'>
              <div className="col-12">
                  <label htmlFor="forane_id" className="col-sm-12 col-form-label">Forane Name<span className="text-danger">*</span></label>
                  <select
                    className="form-select"
                    id="forane_id"
                    name="forane_id"
                    value={formData.forane_id}
                    onChange={handleChange}
                  >
                    <option value="">Select Forane </option>
                    {foranes.map((forane) => (
                      <option key={forane.forane_id} value={forane.forane_id}>
                        {forane.forane_name}
                      </option>
                    ))}
                  </select>
                  <span className="text-danger">{formError.forane_id}</span>
                </div>
                <div className="col-12">
                  <label htmlFor="parish_name" className="col-sm-12 col-form-label">Parish Name<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="parish_name"
                    name="parish_name"
                    placeholder="Enter Parish Name"
                    value={formData.parish_name}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.parish_name}</span>
                </div>
                <div className="col-12">
                  <label htmlFor="location" className="col-sm-12 col-form-label">Location<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="location"
                    name="location"
                    placeholder="Enter Location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.location}</span>
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

      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Parish</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={updateParish} className="row g-3">
          <div className="col-12">
              <label htmlFor="edit_forane_id" className="col-sm-12 col-form-label">Forane Name<span className="text-danger">*</span></label>
              <select
                className="form-select"
                id="edit_forane_id"
                name="forane_id"
                value={editFormData.forane_id}
                onChange={handleChange}
              >
                <option value="">Select Forane</option>
                {foranes.map((forane) => (
                  <option key={forane.forane_id} value={forane.forane_id}>
                    {forane.forane_name}
                  </option>
                ))}
              </select>
              <span className="text-danger">{modalErrors.forane_id}</span>
            </div>
            <div className="col-12">
              <label htmlFor="edit_parish_name" className="col-sm-12 col-form-label">Parish Name<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="edit_parish_name"
                name="parish_name"
                placeholder="Enter Parish Name"
                value={editFormData.parish_name}
                onChange={handleChange}
              />
              <span className="text-danger">{modalErrors.parish_name}</span>
            </div>
            <div className="col-12">
              <label htmlFor="edit_location" className="col-sm-12 col-form-label">Location<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="edit_location"
                name="location"
                placeholder="Enter Location"
                value={editFormData.location}
                onChange={handleChange}
              />
              <span className="text-danger">{modalErrors.location}</span>
            </div>
            
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1primary" disabled={formData.save_flag}>
                {formData.save_flag ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={() => { clearParishForm(); setModalIsOpen(false); }} className="btn btn-danger m-1">Cancel</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Parish;