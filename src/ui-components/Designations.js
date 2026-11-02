import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum'; // Corrected import path
import { capitalizeWords } from '../utilities/dateconverter';
import DataTable from "react-data-table-component";
const Designations = () => {
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Designations', Link: '' },
  ]);
  const dataTableRef = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [editformError, setEditFormError] = useState({});
  const [savingData, setSavingData] = useState(false);
  const [designation, setDesignation] = useState({});
  const [classLevels, setClassLevels] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const [formData, setFormData] = useState({
    designation_name: '',
    designation_position: '',
    staff_type: '',
    class_level: '',
    designation_category: '',
    save_flag: false,
  });

  const [editFormData, setEditFormData] = useState({
    designation_name: '',
    designation_position: '',
    staff_type: '',
    fk_class_level_id: '',
    designation_category: '',
    save_flag: false,
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const filteredApplications = (tableData.data || []).filter(tdata =>
    (tdata.designation_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (tdata.staff_type?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (tdata.class_level_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );


  const clearDesignationForm = () => {
    setFormData({
      designation_name: '',
      designation_position: '',
      staff_type: '',
      class_level: '',
      designation_category: '',
      save_flag: false,
    });
    setEditFormData({
      designation_name: '',
      designation_position: '',
      designation_position: '',
      staff_type: '',
      fk_class_level_id: '',
      designation_category: '',
      save_flag: false,
    });
  };

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/designations/view');
      if (response.data.status) {
        setDesignations(response.data.data);
        setTableData(response.data);
        setShowTable(true);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);


  useEffect(() => {
    if (editFormData.staff_type === "teaching") {
      fetchClassLevels();
    }
  }, [editFormData.staff_type]);

  const fetchClassLevels = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/class-strength/get_classs_levels`);
      if (response.data.status) {
        setClassLevels(response.data.data);

        // Ensure selected class level is set after fetching
        setEditFormData((prev) => ({
          ...prev,
          fk_class_level_id: prev.fk_class_level_id || response.data.data[0]?.class_level_id || "",
        }));
      } else {
        setClassLevels([]);
      }
    } catch (error) {
      console.error("Error fetching class levels:", error);
      setClassLevels([]);
    }
  };

  const getClassLevelNameById = (id) => {
    const level = classLevels.find(l => l.class_level_id == id);
    return level ? level.class_level_name : null;
  };

  const fetchCategories = async (staffType, classLevelName = null) => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/designations/get_designation_category`,
        {
          params: {
            class_level_name: classLevelName || ""
          }
        }
      );

      if (response.data.status) {
        const designationData = response.data.data;

        // Convert string array to object array
        let filteredDesignations = [];
        if (Array.isArray(designationData)) {
          if (typeof designationData[0] === 'string') {
            // Convert strings to objects for the dropdown
            filteredDesignations = designationData.map((name) => ({
              designation_id: name,
              designation_name: name
            }));
          } else {
            filteredDesignations = designationData;
          }
        }

        setCategories(filteredDesignations);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  // Effect to fetch categories when dependencies change
  useEffect(() => {
    // Identify which form is active
    const isEdit = modalIsOpen;
    const currentData = isEdit ? editFormData : formData;

    // Extract values
    const staffType = currentData.staff_type;
    // For Edit form use fk_class_level_id, for Create form use class_level
    const classLevelId = isEdit ? currentData.fk_class_level_id : currentData.class_level;

    if (staffType === 'non_teaching') {
      fetchCategories('non_teaching');
    } else if (staffType === 'teaching') {
      // Logic for teaching staff
      if (classLevelId) {
        // We need classLevels to be loaded to find the name
        if (classLevels && classLevels.length > 0) {
          // Use == to handle potential string/number mismatches
          const level = classLevels.find(l => l.class_level_id == classLevelId);
          if (level) {
            fetchCategories('teaching', level.class_level_name);
          } else {
            // If level ID exists but not found in list (shouldn't happen if logic is correct)
            setCategories([]);
          }
        }
      } else {
        // No class level selected
        setCategories([]);
      }
    } else {
      // No valid staff type
      setCategories([]);
    }
  }, [
    formData.staff_type,
    formData.class_level,
    editFormData.staff_type,
    editFormData.fk_class_level_id,
    classLevels,
    modalIsOpen
  ]);
  const handleChange = async (e) => {
    const { name, value } = e.target;

    if (modalIsOpen) {
      setEditFormData({
        ...editFormData,
        [name]: value
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    setFormError((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));

    setEditFormError((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));

    // If staff_type is changed, handle class level dropdown logic
    if (name === "staff_type") {
      if (value === "teaching") {
        fetchClassLevels();
      } else {
        setClassLevels([]); // Clear class levels if staff_type is non-teaching
        setFormData((prev) => ({ ...prev, class_level: "" })); // Reset class level selection
        setEditFormData((prev) => ({ ...prev, fk_class_level_id: "" })); // Reset class level selection in edit form
      }
    }
  };






  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormData(prevFormData => ({
        ...prevFormData,
        save_flag: true
      }));
      const response = await axios.post(globalVariables.api_url + '/designations/save', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      setFormData(prevFormData => ({
        ...prevFormData,
        save_flag: false
      }));
      if (response.data.status) {
        await fetchDesignations();
        clearDesignationForm();
        print_toast("success", response.data.message);
      } else {
        let error = response.data.error;
        print_toast("error", response.data.message);
        setFormError(error || {});
      }
    } catch (error) {
      console.error('Error saving designation:', error.message);
    } finally {
      setFormData(prevFormData => ({
        ...prevFormData,
        save_flag: false
      }));
    }
  };
  const handleDelete = async (_designation) => {
    try {
      _designation.delete_flag = true;
      setDesignation(_designation);

      const formData = new URLSearchParams({ 'designation_id': _designation.designation_id }).toString();

      const response = await axios.post(globalVariables.api_url + '/designations/delete', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      _designation.delete_flag = false;

      if (response.data.status) {
        print_toast("success", response.data.message);
        await fetchDesignations();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      _designation.delete_flag = false;

      console.error('Error deleting designation:', error);

      if (error.response) {
        // API response error
        print_toast("error", error.response.data.message || "An error occurred");
      } else if (error.request) {
        // Network error
        print_toast("error", "Network error. Please try again.");
      } else {
        // Unknown error
        print_toast("error", "Something went wrong.");
      }
    } finally {
      setDesignation(_designation);
    }
  };

  const handleDelete1 = async (_designation) => {
    try {
      _designation.delete_flag = true;
      setDesignation(_designation);

      const formData = { 'designation_id': _designation.designation_id };
      const response = await axios.post(globalVariables.api_url + '/designations/delete', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      _designation.delete_flag = false;
      if (response.data.status) {
        print_toast("success", response.data.message);
        await fetchDesignations();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting designation:', error.message);
    } finally {
      _designation.delete_flag = false;
    }
  };






  const handleEdit = (_designation) => {
    setDesignation(_designation);
    setEditFormData({
      designation_name: _designation.designation_name,
      staff_type: _designation.staff_type,
      fk_class_level_id: _designation.fk_class_level_id,
      designation_category: _designation.designation_category, // Assuming this is present in the object
      designation_position: _designation.designation_position,
      save_flag: false,
    });
    openModal();
  };

  const updateDesignation = async (e) => {
    e.preventDefault();
    try {
      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: true
      }));

      const formDataToUpdate = {
        designation_id: designation.designation_id,
        designation_name: editFormData.designation_name,
        designation_position: editFormData.designation_position,
        staff_type: editFormData.staff_type,
        fk_class_level_id: editFormData.fk_class_level_id,
        designation_category: editFormData.designation_category,

      };

      const response = await axios.post(globalVariables.api_url + '/designations/update', formDataToUpdate, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: false
      }));

      if (response.data.status) {
        await fetchDesignations();
        clearDesignationForm();
        print_toast("success", response.data.message);
        closeModal();
      } else {
        let error = response.data.error;
        print_toast("error", response.data.message);
        setEditFormError(error || {});
      }
    } catch (error) {
      console.error('Error updating designation:', error.message);
    } finally {
      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: false
      }));
    }
  };

  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      minWidth: '90px'
    },
    {
      name: "Type",
      selector: (row) => row.staff_type === 'teaching' ? 'Teaching' : 'Non-Teaching',
      sortable: true,
      minWidth: '150px'
    },

    {
      name: "Class Level",
      selector: (row) => capitalizeWords(row.class_level_name),
      sortable: true,
      minWidth: '150px'
    },
    {
      name: "Designation Name",
      selector: (row) => capitalizeWords(row.designation_name),
      sortable: true,
      minWidth: '250px'
    },

    {
      name: "Position",
      selector: (row) => row.designation_position,
      sortable: true,
      minWidth: '120px'
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
            <li><a href="#" className="dropdown-item" onClick={() => handleEdit(row)}>Edit</a></li>
            <li>
              <a
                href="#"
                disabled={row.delete_flag}
                className="dropdown-item"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this Forane?')) {
                    handleDelete(row);
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



  return (
    <>
      <Breadcum items={breadcum} title="Designations" />
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title"> Designations</h5>
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
              <h5 className="card-title">Create Designation</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={handleSubmit} className="row g-3">

                <div className="col-12">
                  <label htmlFor="staff_type" className="col-sm-12 col-form-label">
                    Staff Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    name="staff_type"
                    value={formData.staff_type}
                    onChange={handleChange}
                  >
                    <option value="">Select Staff Type</option>
                    <option value="teaching">Teaching</option>
                    <option value="non_teaching">Non-Teaching</option>
                  </select>
                  <span className="text-danger">{formError.staff_type}</span>
                </div>

                {/* Show Class Level Dropdown only if Staff Type is "Teaching" */}
                {formData.staff_type === "teaching" && (
                  <div className="col-12 mt-3">
                    <label htmlFor="class_level" className="col-sm-12 col-form-label">
                      Class Level <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      name="class_level"
                      value={formData.class_level}
                      onChange={handleChange}
                    >
                      <option value="">Select Class Level</option>
                      {classLevels.map((level) => (
                        <option key={level.class_level_id} value={level.class_level_id}>
                          {level.class_level_name}
                        </option>
                      ))}
                    </select>
                    <span className="text-danger">{formError.class_level}</span>
                  </div>
                )}

                {((formData.staff_type === 'non_teaching') ||
                  (formData.staff_type === 'teaching' && formData.class_level)) && (
                    <div className="col-12 mt-3">
                      <label className="col-sm-12 col-form-label">Category*</label>
                      <select
                        className="form-select"
                        name="designation_category"
                        value={formData.designation_category}
                        onChange={handleChange}
                      >
                        <option value="">Select Category</option>
                        {categories.map((d, index) => (
                          <option key={index} value={d.designation_id}>
                            {d.designation_name}
                          </option>
                        ))}
                      </select>
                      <span className="text-danger">{formError.designation_category}</span>
                    </div>
                  )}




                <div className="col-12">
                  <label htmlFor="inputName" className="col-sm-12 col-form-label"> Designation Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="designation_name"
                    name="designation_name"
                    placeholder="Enter Designation Name"
                    value={formData.designation_name}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.designation_name}</span>
                </div>

                <div className="col-12">
                  <label htmlFor="inputName" className="col-sm-12 col-form-label">Position<span className="text-danger">*</span> </label>
                  <input
                    type="text"
                    className="form-control"
                    id="designation_position"
                    name="designation_position"
                    placeholder="Enter Position"
                    value={formData.designation_position}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.designation_position}</span>
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
      </div>

      <Modal show={modalIsOpen} onHide={closeModal} backdrop='static'>
        <Modal.Header closeButton>
          <Modal.Title>Edit Designation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={updateDesignation} className="row g-3">


            <div className="col-12">
              <label htmlFor="staff_type" className="col-sm-12 col-form-label">
                Staff Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                name="staff_type"
                value={editFormData.staff_type}
                onChange={handleChange}
              >
                <option value="">Select Staff Type</option>
                <option value="teaching">Teaching</option>
                <option value="non_teaching">Non-Teaching</option>
              </select>
              <span className="text-danger">{editformError.staff_type}</span>
            </div>

            {/* Show Class Level Dropdown only if Staff Type is "Teaching" */}
            {editFormData.staff_type === "teaching" && (
              <div className="col-12 mt-3">
                <label htmlFor="fk_class_level_id" className="col-sm-12 col-form-label">
                  Class Level <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  name="fk_class_level_id"
                  value={editFormData.fk_class_level_id}
                  onChange={handleChange}
                >
                  <option value="">Select Class Level</option>
                  {classLevels.map((level) => (
                    <option key={level.class_level_id} value={level.class_level_id}>
                      {level.class_level_name}
                    </option>
                  ))}
                </select>
                <span className="text-danger">{editformError.fk_class_level_id}</span>
              </div>
            )}

            {((editFormData.staff_type === 'non_teaching') ||
              (editFormData.staff_type === 'teaching' && editFormData.fk_class_level_id)) && (
                <div className="col-12 mt-3">
                  <label className="col-sm-12 col-form-label">Category</label>
                  <select
                    className="form-select"
                    name="designation_category"
                    value={editFormData.designation_category}
                    onChange={handleChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((d, index) => (
                      <option key={index} value={d.designation_id}>
                        {d.designation_name}
                      </option>
                    ))}
                  </select>
                  <span className="text-danger">{editformError.designation_category}</span>
                </div>
              )}




            <div className="col-12">
              <label htmlFor="inputName" className="col-sm-12 col-form-label">Designation Name<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="designation_name"
                name="designation_name"
                placeholder="Enter Designation Name"
                value={editFormData.designation_name}
                onChange={handleChange}
              />
              <span className="text-danger">{editformError.designation_name}</span>
            </div>


            <div className="col-12">
              <label htmlFor="inputName" className="col-sm-12 col-form-label">Position<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="designation_position"
                name="designation_position"
                placeholder="Enter Position"
                value={editFormData.designation_position}
                onChange={handleChange}
              />
              <span className="text-danger">{editformError.designation_position}</span>
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1" disabled={editFormData.save_flag}>
                {editFormData.save_flag ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={closeModal} className="btn btn-danger m-1">Cancel</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Designations;
