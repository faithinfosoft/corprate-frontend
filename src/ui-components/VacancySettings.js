import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum';
import DataTable from "react-data-table-component";
import { useParams } from 'react-router-dom';

const VacancySettings = () => {
  const { id, nature_of_vacancy } = useParams();

  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Vacancy Details', Link: '' },
  ]);
  const [designations, setDesignations] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const dataTableRef = useRef(null);
  const [search, setSearch] = useState('');
  
  const [schools, setSchools] = useState([]);
  const [vacancies, setVacancies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [editformError, setEditFormError] = useState({});
  const [savingData, setSavingData] = useState(false);
  const [vacancy, setVacancy] = useState({});
  const [formData, setFormData] = useState({
    vacancy_title: '',
    fk_designation_id: '',
    vacancy_remarks: '',
    vacancy_start_date: '',
    vacancy_end_date: '',
    fk_school_id: '',
    fk_ref_id: id, // Ensure id is properly set here
    nature_of_vaccancy:nature_of_vacancy,
    save_flag: false,
  });

  const [editFormData, setEditFormData] = useState({
    vacancy_title: '',
    fk_designation_id: '',
    vacancy_remarks: '',
    vacancy_start_date: '',
    vacancy_end_date: '',
    fk_school_id: '',
    fk_ref_id: id, // Ensure id is properly set here
    nature_of_vaccancy:nature_of_vacancy,
    save_flag: false,
  });

  // Add states for both modals
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [createModalIsOpen, setCreateModalIsOpen] = useState(false);

  // Modal handlers
  const openEditModal = () => setEditModalIsOpen(true);
  const closeEditModal = () => setEditModalIsOpen(false);
  const openCreateModal = () => setCreateModalIsOpen(true);
  const closeCreateModal = () => setCreateModalIsOpen(false);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/view_schools`);
      if (response.data.status) {
        setSchools(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };
 
  useEffect(() => {
    fetchSchools();
  }, []);
  
  const clearDesignationForm = () => {
    setFormData({
      vacancy_title: '',
      fk_designation_id: '',
      vacancy_remarks: '',
      vacancy_start_date: '',
      vacancy_end_date: '',
      fk_school_id: '',
      no_of_vacancy: '',
      fk_subject_id: '',
      fk_ref_id: id, // Ensure id is properly set here
      nature_of_vaccancy:nature_of_vacancy,
      save_flag: false,
    });
    setEditFormData({
      vacancy_title: '',
      fk_designation_id: '',
      vacancy_remarks: '',
      vacancy_start_date: '',
      vacancy_end_date: '',
      fk_school_id: '',
      no_of_vacancy: '',
      fk_subject_id: '',
      fk_ref_id: id, // Ensure id is properly set here
      nature_of_vaccancy:nature_of_vacancy,
      save_flag: false,
    });
  };

  const fetchVacancy = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + `/vacancySetting/view?ref_id=${id}`);
      if (response.data.status) {
        setVacancies(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchVacancy();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Determine which form to update based on which modal is open
    if (editModalIsOpen) {
      setEditFormData(prev => ({ ...prev, [name]: value }));
      setEditFormError(prev => ({ ...prev, [name]: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setFormError(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormData(prevFormData => ({
        ...prevFormData,
        save_flag: true
      }));
      
      // Ensure that fk_ref_id is included in the form data
      const submissionData = {
        ...formData,
        fk_ref_id: id // Explicitly set id to ensure it's not lost
      };
      
      const response = await axios.post(globalVariables.api_url + '/vacancySetting/save', submissionData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      setFormData(prevFormData => ({
        ...prevFormData,
        save_flag: false
      }));
      
      if (response.data.status) {
        await fetchVacancy();
        clearDesignationForm();
        print_toast("success", response.data.message);
        closeCreateModal(); // Close the modal after successful submission
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

  const handleDelete = async (_vacancy) => {
    try {
      _vacancy.delete_flag = true;
      setVacancy(_vacancy);

      const formData = { 'vacancy_id': _vacancy.vacancy_id };
      const response = await axios.post(globalVariables.api_url + '/vacancySetting/delete', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      _vacancy.delete_flag = false;
      if (response.data.status) {
        print_toast("success", response.data.message);
        setVacancies((prevvacancies) => prevvacancies.filter(vacancies => vacancies.vacancy_id !== _vacancy.vacancy_id));
        await fetchVacancy();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting vacancy:', error.message);
    } finally {
      _vacancy.delete_flag = false;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleEdit = (_vacancy) => {
    setVacancy(_vacancy);
    setEditFormData({
      vacancy_title: _vacancy.vacancy_title,
      fk_designation_id: _vacancy.fk_designation_id,
      vacancy_start_date: _vacancy.vacancy_start_date,
      vacancy_remarks: _vacancy.vacancy_remarks,
      vacancy_end_date: _vacancy.vacancy_end_date,
      fk_school_id: _vacancy.fk_school_id, // Make sure school_id is properly saved here
      vacancy_id: _vacancy.vacancy_id,
      fk_ref_id: id, // Ensure ref_id is properly set
      nature_of_vaccancy: _vacancy.nature_of_vaccancy ||nature_of_vacancy,
      save_flag: false,
    });
    openEditModal();
  };

  const updatevacancy = async (e) => {
    e.preventDefault();
    try {
      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: true
      }));

      const formDataToUpdate = {
        vacancy_id: vacancy.vacancy_id,
        vacancy_title: editFormData.vacancy_title,
        fk_designation_id: editFormData.fk_designation_id,
        vacancy_start_date: editFormData.vacancy_start_date,
        vacancy_remarks: editFormData.vacancy_remarks,
        vacancy_end_date: editFormData.vacancy_end_date,
        fk_school_id: editFormData.fk_school_id,
        fk_ref_id: id, // Ensure ref_id is included
        nature_of_vaccancy: editFormData.nature_of_vaccancy || nature_of_vacancy,
      };

      const response = await axios.post(globalVariables.api_url + '/vacancySetting/update', formDataToUpdate, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: false
      }));

      if (response.data.status) {
        await fetchVacancy();
        clearDesignationForm();
        print_toast("success", response.data.message);
        closeEditModal();
      } else {
        let error = response.data.error;
        print_toast("error", response.data.message);
        setEditFormError(error || {});
      }
    } catch (error) {
      console.error('Error updating Vacancy:', error.message);
    } finally {
      setEditFormData(prevEditFormData => ({
        ...prevEditFormData,
        save_flag: false
      }));
    }
  };

  const fetchDesignations = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/designations/view');
      if (response.data.status) {
        setDesignations(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  const filteredVacancies = vacancies.filter((vacancy) =>
    vacancy.vacancy_title.toLowerCase().includes(search.toLowerCase()) ||
    vacancy.designation_name.toLowerCase().includes(search.toLowerCase())  
  );

  const columns = [
    { name: "Sl No.", selector: (row, index) => index + 1, center: true, minWidth: '100px' },
    { name: "School Name", selector: (row) => `${row.location} ,${row.school_name} `, center: true, minWidth: '350px' },
    { name: "Vacancy Title", selector: (row) => row.vacancy_title, center: true, minWidth: '210px' },
    { name: "Vacancy Designation", selector: (row) => row.designation_name, center: true, minWidth: '180px' },
    { name: "Start Date", selector: (row) => formatDate(row.vacancy_start_date), center: true, minWidth: '150px' },
    { name: "End Date", selector: (row) => formatDate(row.vacancy_end_date), center: true, minWidth: '150px' },
    { name: "Remarks", selector: (row) => row.vacancy_remarks, center: true, minWidth: '210px' },
    {
      name: "Actions",
      center: true,
      cell: (row) => (
        <div className="dropdown">
          <button className="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
            Action
          </button>
          <ul className="dropdown-menu">
            <li>
              <a href="#" className="dropdown-item" onClick={() => handleEdit(row)}>Edit</a>
            </li>
            <li>
              <a
                href="#"
                disabled={row.delete_flag}
                className="dropdown-item"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm('Are you sure you want to delete this vacancy?')) {
                    handleDelete(row);
                  }
                }}
              >
                {row.delete_flag ? 'Delete' : 'Delete'}
              </a>
            </li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <>
      <Breadcum items={breadcum} title="Vacancy Details" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Vacancy Details</h5>
              {vacancies.length === 0 && (
    <button className="btn btn-primary" onClick={openCreateModal}>
      <i className="fas fa-plus me-1"></i> Create Vacancy
    </button>
  )}
            </div>
            <div className="card-body">
              <DataTable
                className="custom-data-table"
                columns={columns}
                data={filteredVacancies}
                pagination
                highlightOnHover
                pointerOnHover
                ref={dataTableRef}
                noDataComponent="No data available"
                subHeader
                subHeaderComponent={
                  <div className="custom-search-container">
                    <input
                      type="text"
                      className="custom-search-input form-control"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Vacancy Modal */}
      <Modal show={createModalIsOpen} onHide={closeCreateModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Vacancy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-12">
              <label htmlFor="fk_school_id" className="col-form-label">
                School <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="fk_school_id"
                name="fk_school_id"
                value={formData.fk_school_id}
                onChange={handleChange}
              >
                <option value="">Select</option>
                {schools.map((school) => (
                  <option key={school.school_id} value={school.school_id}>
                    {school.school_name}, {school.location}
                  </option>
                ))}
              </select>
              <span className="text-danger">{formError.fk_school_id}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="vacancy_title" className="col-form-label">
                Vacancy Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="vacancy_title"
                name="vacancy_title"
                value={formData.vacancy_title}
                onChange={handleChange}
              />
              <span className="text-danger">{formError.vacancy_title}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="fk_designation_id" className="col-form-label">
                Designation <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                id="fk_designation_id"
                name="fk_designation_id"
                value={formData.fk_designation_id}
                onChange={handleChange}
              >
                <option value="">Select a designation</option>
                {designations.map((designation, index) => (
                  <option key={index} value={designation.designation_id}>
                    {designation.designation_name}
                  </option>
                ))}
              </select>
              <span className="text-danger">{formError.fk_designation_id}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="vacancy_start_date" className="col-form-label">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="vacancy_start_date"
                name="vacancy_start_date"
                value={formData.vacancy_start_date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
              <span className="text-danger">{formError.vacancy_start_date}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="vacancy_end_date" className="col-form-label">
                End Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="vacancy_end_date"
                name="vacancy_end_date"
                value={formData.vacancy_end_date}
                onChange={handleChange}
                min={formData.vacancy_start_date || new Date().toISOString().split("T")[0]}
              />
              <span className="text-danger">{formError.vacancy_end_date}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="vacancy_remarks" className="col-form-label">Remarks</label>
              <textarea
                className="form-control"
                id="vacancy_remarks"
                name="vacancy_remarks"
                value={formData.vacancy_remarks}
                onChange={handleChange}
                rows="4"
              ></textarea>
              <span className="text-danger">{formError.vacancy_remarks}</span>
            </div>

            <div className="col-12 text-end mt-3">
              <button type="submit" className="btn btn-success m-1" disabled={formData.save_flag}>
                {formData.save_flag ? 'Saving...' : 'Save'}
              </button>
              <button type="button" onClick={() => { clearDesignationForm(); closeCreateModal(); }} className="btn btn-danger m-1">
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Vacancy Modal */}
      <Modal show={editModalIsOpen} onHide={closeEditModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Vacancy</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={updatevacancy} className="row g-3">
            <div className="col-md-12">
              <label htmlFor="fk_school_id" className="col-form-label">
                School <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                id="fk_school_id"
                name="fk_school_id"
                value={editFormData.fk_school_id}
                onChange={handleChange}
                // Don't disable the field to allow changes
              >
                <option value="">Select</option>
                {schools.map((school) => (
                  <option key={school.school_id} value={school.school_id}>
                    {school.school_name}, {school.location}
                  </option>
                ))}
              </select>
              <span className="text-danger">{editformError.fk_school_id}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="vacancy_title" className="col-form-label">
                Vacancy Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="vacancy_title"
                name="vacancy_title"
                value={editFormData.vacancy_title}
                onChange={handleChange}
              />
              <span className="text-danger">{editformError.vacancy_title}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="fk_designation_id" className="col-form-label">
                Designation <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                id="fk_designation_id"
                name="fk_designation_id"
                value={editFormData.fk_designation_id}
                onChange={handleChange}
              >
                <option value="">Select a designation</option>
                {designations.map((designation, index) => (
                  <option key={index} value={designation.designation_id}>
                    {designation.designation_name}
                  </option>
                ))}
              </select>
              <span className="text-danger">{editformError.fk_designation_id}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="vacancy_start_date" className="col-form-label">
                Start Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="vacancy_start_date"
                name="vacancy_start_date"
                value={editFormData.vacancy_start_date}
                onChange={handleChange}
              />
              <span className="text-danger">{editformError.vacancy_start_date}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="vacancy_end_date" className="col-form-label">
                End Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-control"
                id="vacancy_end_date"
                name="vacancy_end_date"
                value={editFormData.vacancy_end_date}
                onChange={handleChange}
                min={editFormData.vacancy_start_date || new Date().toISOString().split("T")[0]}
              />
              <span className="text-danger">{editformError.vacancy_end_date}</span>
            </div>

            <div className="col-md-12">
              <label htmlFor="vacancy_remarks" className="col-form-label">Remarks</label>
              <textarea
                className="form-control"
                id="vacancy_remarks"
                name="vacancy_remarks"
                value={editFormData.vacancy_remarks}
                onChange={handleChange}
                rows="4"
              ></textarea>
              <span className="text-danger">{editformError.vacancy_remarks}</span>
            </div>

            <div className="col-12 text-end mt-3">
              <button type="submit" className="btn btn-success m-1" disabled={editFormData.save_flag}>
                {editFormData.save_flag ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={closeEditModal} className="btn btn-danger m-1">
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default VacancySettings;