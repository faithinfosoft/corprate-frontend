import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import DataTable from "react-data-table-component";
const Forane = () => {
  const [Forane, setForane] = useState([]);
  const [form_error, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Forane', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    forane_name: '',
    save_flag: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);
   const dataTableRef = useRef(null);
    const [show, setShow] = useState(false);
     const [tableData, setTableData] = useState([]);
     const [showTable, setShowTable] = useState(false);
  const [forane, set_forane] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    forane_name: '',
  });
  const [modalErrors, setModalErrors] = useState({});
// Add this handler to track page changes
const handlePageChange = page => {
  setCurrentPage(page);
};

// Add this handler to track rows per page changes
const handlePerRowsChange = (newRowsPerPage, page) => {
  setRowsPerPage(newRowsPerPage);
};
  const fetchForane = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/forane/view_forane');
      if (response.data.status) {
        setForane(response.data.data);
        setTableData(response.data);
        setShowTable(true);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch Forane data");
    }
  };

  useEffect(() => {
    fetchForane();
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
        ...form_error,
        [name]: '',
      });
    }
  };

  const clearForaneForm = () => {
    setFormData({
      forane_name: '',
      save_flag: false,
    });
    setFormError({});
  };

  const saveForane = async (e) => {
    e.preventDefault();
    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));

    try {
      const response = await axios.post(globalVariables.api_url + '/forane/save_forane', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status) {
        await fetchForane();
        clearForaneForm();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving Forane:', error.message);
      print_toast("error", "Failed to save Forane");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

  

  const deleteForane = async (_forane) => {
    if (_forane.delete_flag) return;

    try {
        // Set the delete flag to true to prevent multiple delete requests
        _forane.delete_flag = true;
        set_forane({ ..._forane });

        // Prepare the form data for the request
        const formData = { 'forane_id': _forane.forane_id };
        
        // Send the delete request
        const response = await axios.post(globalVariables.api_url + '/forane/delete_forane', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        // Check the response from the server
        if (response.data.status) {
            // If successfully deleted, update the list of forane
            setForane(Forane.filter((y) => y.forane_id !== _forane.forane_id));
            print_toast("success", response.data.message);
        } else {
            // If deletion failed because of associated parishes
            if (response.data.message.includes("parishes associated")) {
                // Show a specific toast message indicating the reason
                print_toast("error", "Cannot delete Forane. Parish(es) exist under this Forane.");
            } else {
                // General failure message
                print_toast("error", response.data.message);
            }
        }
    } catch (error) {
        // Catch any errors during the request and log them
        console.error('Error deleting Forane:', error.message);
        print_toast("error", "Failed to delete Forane");
    } finally {
        // Reset the delete flag once the request completes
        _forane.delete_flag = false;
        set_forane({ ..._forane });
    }
};



  const editForane = (_forane) => {
    set_forane(_forane);
    setEditFormData({
      forane_name: _forane.forane_name,
    });
    setModalIsOpen(true);
  };

  const updateForane = async (e) => {
    e.preventDefault();
    if (formData.save_flag) return;

    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));

    try {
      const formDataToUpdate = {
        forane_id: forane.forane_id,
        forane_name: editFormData.forane_name,
      };

      const response = await axios.post(globalVariables.api_url + '/forane/update_forane', formDataToUpdate, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status) {
        await fetchForane();
        clearForaneForm();
        print_toast("success", response.data.message);
        setModalIsOpen(false);
      } else {
        print_toast("error", response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error('Error updating Forane:', error.message);
      print_toast("error", "Failed to update Forane");
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
      sortable: true,
      minWidth: '40px' 
    },
    { 
      name: "Forane Name", 
      selector: (row) => capitalizeWords(row.forane_name), 
      sortable: true, 
      minWidth: '380px' 
    },
 

    
{
      name: "Actions",
      minWidth: '280px', 
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
            <li><a href="#" className="dropdown-item" onClick={() => editForane(row)}>Edit</a></li>
            <li>
              <a
                href="#"
                disabled={row.delete_flag}
                className="dropdown-item"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this Forane?')) {
                    deleteForane(row);
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
        tdata.forane_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <>
      <Breadcum items={breadcum} title="Forane" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Forane Details</h5>
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
              <h5 className="card-title">Create Forane</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={saveForane} className='row g-3'>
                <div className="col-12">
                  <label htmlFor="forane_name" className="col-sm-12 col-form-label">Forane Name<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="forane_name"
                    name="forane_name"
                    placeholder=""
                    value={formData.forane_name}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{form_error.forane_name}</span>
                </div>
                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-success m-1primary" disabled={formData.save_flag}>
                    {formData.save_flag ? 'Saving...' : 'Save'}
                  </button>
                  <button type="reset" className="btn btn-danger m-1" onClick={clearForaneForm}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Forane</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={updateForane} className="row g-3">
            <div className="col-12">
              <label htmlFor="edit_forane_name" className="col-sm-12 col-form-label">Forane Name<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="edit_forane_name"
                name="forane_name"
                placeholder="Enter Forane Name"
                value={editFormData.forane_name}
                onChange={handleChange}
              />
              <span className="text-danger">{modalErrors.forane_name}</span>
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1primary" disabled={formData.save_flag}>
                {formData.save_flag ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={() => { clearForaneForm(); setModalIsOpen(false); }} className="btn btn-danger m-1">Cancel</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Forane;



