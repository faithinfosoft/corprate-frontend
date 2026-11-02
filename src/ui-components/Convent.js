import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import DataTable from "react-data-table-component";
const Convent = () => {
     const dataTableRef = useRef(null);
    const [tableData, setTableData] = useState([]);
       const [showTable, setShowTable] = useState(false);
         const [searchTerm, setSearchTerm] = useState('');
  const [convents, setConvents] = useState([]);
  const [congregations, setCongregations] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
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
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Convent', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    parish_name: '',
    location: '',
    congregation: '',
    save_flag: false,
  });
  const [selectedConvent, setSelectedConvent] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    parish_name: '',
    location: '',
    fk_congregation_id: '',
  });
  const [modalErrors, setModalErrors] = useState({});

  const fetchCongregations = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/congregation/get_congregation`);
      console.log('Full response:', response); // Log the full response to inspect it
  
      // Check if the data is in the expected format
      if (response.data && Array.isArray(response.data.data)) {
        setCongregations(response.data.data); // Access data from response.data.data
        console.log('Fetched Congregations:', response.data.data); // Log the fetched data
      } else {
        console.error('Unexpected data format for congregations');
        print_toast("error", "Failed to fetch congregation data: Unexpected format");
      }
    } catch (error) {
      console.error('Error fetching congregation data:', error.message);
      print_toast("error", "Failed to fetch congregation data");
    }
  };
  
  
  

  const fetchConvents = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/convent/view_convent`);
      if (response.data.status) {
        setConvents(response.data.data);
        setTableData(response.data);
        setShowTable(true);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch Convent data");
    }
  };

  useEffect(() => {
    fetchCongregations(); // Fetch congregations when component mounts
    fetchConvents(); 
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

  const clearConventForm = () => {
    setFormData({
      parish_name: '',
      location: '',
      congregation: '',
      save_flag: false,
    });
    setFormError({});
  };

  const saveConvent = async (e) => {
    e.preventDefault();
    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));

    try {
      const response = await axios.post(`${globalVariables.api_url}/convent/save_convent`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status) {
        await fetchConvents();
        clearConventForm();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving Convent:', error.message);
      print_toast("error", "Failed to save Convent");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

  const deleteConvent = async (convent) => {
    if (convent.delete_flag) return;

    try {
      const updatedConvent = { ...convent, delete_flag: true };
      setSelectedConvent(updatedConvent);

      const formData = { 'parish_id': convent.parish_id };
      const response = await axios.post(`${globalVariables.api_url}/convent/delete_convent`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status) {
        setConvents(convents.filter((c) => c.parish_id !== convent.parish_id));
        print_toast("success", response.data.message);
      } else {
        // Handle specific error cases
        if (response.data.message.includes("associated schools")) {
          print_toast("error", "Cannot delete convent. There are associated schools.");
        } else {
          print_toast("error", response.data.message || "Failed to delete Convent");
        }
      }
    } catch (error) {
      console.error('Error deleting Convent:', error);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        print_toast("error", error.response.data.message || "Server error occurred while deleting Convent");
      } else if (error.request) {
        // The request was made but no response was received
        print_toast("error", "No response received from server. Please try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        print_toast("error", "An unexpected error occurred. Please try again.");
      }
    } finally {
      setSelectedConvent({ ...selectedConvent, delete_flag: false });
    }
  };

  const editConvent = (convent) => {
    setSelectedConvent(convent);
    setEditFormData({
      parish_name: convent.parish_name,
      location: convent.location,
      fk_congregation_id: convent.fk_congregation_id	,
    });
    setModalIsOpen(true);
  };

  const updateConvent = async (e) => {
    e.preventDefault();
    if (formData.save_flag) return;

    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));

    try {
      const formDataToUpdate = {
        parish_id: selectedConvent.parish_id,
        parish_name: editFormData.parish_name,
        location: editFormData.location,
        fk_congregation_id: editFormData.fk_congregation_id,
      };

      const response = await axios.post(`${globalVariables.api_url}/convent/update_convent`, formDataToUpdate, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status) {
        await fetchConvents();
        clearConventForm();
        print_toast("success", response.data.message);
        setModalIsOpen(false);
      } else {
        print_toast("error", response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error('Error updating Convent:', error.message);
      print_toast("error", "Failed to update Convent");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

  function getCongregationTitle(congregationId) {
    const congregation = congregations.find(
      (cong) => cong.congregation_id === congregationId
    );
    return congregation ? congregation.title : 'Unknown Congregation';
  }
  

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };




   const columns = [
      {
        name: "Sl No.",
        selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
        sortable: true,
        minWidth: '90px' 
      },
      {
        name: "Congregation",
        selector: (row) =>row.title,
        sortable: true,
        minWidth: '150px'
      },
      
      { 
        name: "Convent Name", 
        selector: (row) =>row.parish_name, 
        sortable: true, 
        minWidth: '310px' 
      },
      { 
        name: "Location", 
        selector: (row) => capitalizeWords(row.location), 
        sortable: true, 
        minWidth: '210px' 
      },
     
  {
        name: "Actions",
        minWidth: '150px', 
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
              <li><a href="#" className="dropdown-item" onClick={() =>  editConvent(row)}>Edit</a></li>
              <li>
                <a
                  href="#"
                  disabled={row.delete_flag}
                  className="dropdown-item"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this Convent?')) {
                      deleteConvent(row);
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
    const handleSearch = (event) => {
      setSearchTerm(event.target.value);
    };
    const filteredApplications = (tableData.data || []).filter(tdata =>
      (tdata.parish_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||  
      (tdata.location?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||  
      (tdata.title?.toLowerCase() || "").includes(searchTerm.toLowerCase())
     
    );
  return (
    <>
      <Breadcum items={breadcum} title="Convent" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Convent Details</h5>
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
              <h5 className="card-title">Create Convent</h5>
              </div>
            <div className="card-body">
              <form role="form" onSubmit={saveConvent} className='row g-3'>
                <div className="col-12">
                  <label htmlFor="congregation" className="col-sm-12 col-form-label">
                    Congregation Name <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    id="congregation"
                    name="congregation"
                    value={formData.congregation}
                    onChange={handleChange}
                  >
                    <option value="">Select Congregation</option>
                    {congregations.map((congregation) => (
                      <option key={congregation.congregation_id} value={congregation.congregation_id}>
                        {congregation.title}
                      </option>
                    ))}
                  </select>
                  <span className="text-danger">{formError.congregation}</span>
                </div>

                <div className="col-12">
                  <label htmlFor="parish_name" className="col-sm-12 col-form-label">Convent Name<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="parish_name"
                    name="parish_name"
                    placeholder="Enter Convent Name"
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
                  <button type="reset" className="btn btn-danger m-1" onClick={clearConventForm}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Convent</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={updateConvent} className="row g-3">
          <div className="col-12">
              <label htmlFor="edit_congregation" className="col-sm-12 col-form-label">
                Congregation Name <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                id="edit_congregation"
                name="fk_congregation_id"
                value={editFormData.fk_congregation_id}
                onChange={handleChange}
              >
                <option value="">Select Congregation</option>
                {congregations.map((congregation) => (
                  <option key={congregation.congregation_id} value={congregation.congregation_id}>
                    {congregation.title}
                  </option>
                ))}
              </select>
              <span className="text-danger">{modalErrors.fk_congregation_id}</span>
            </div>

            <div className="col-12">
              <label htmlFor="edit_parish_name" className="col-sm-12 col-form-label">Convent Name<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="edit_parish_name"
                name="parish_name"
                placeholder="Enter Convent Name"
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
              <button type="button" onClick={() => { clearConventForm(); setModalIsOpen(false); }} className="btn btn-danger m-1">Cancel</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Convent;