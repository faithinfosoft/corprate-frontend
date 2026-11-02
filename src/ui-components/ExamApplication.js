import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Modal from 'react-bootstrap/Modal';
import Multiselect from 'multiselect-react-dropdown';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { Link, useNavigate } from 'react-router-dom';
import { convertDateFormat } from '../utilities/dateconverter.js';
import { capitalizeWords } from '../utilities/dateconverter';
import useAuth from '../utilities/useAuth';
const ExamApplication = () => {
  const { user } = useAuth();
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Exam Applications', Link: '' },
  ]);
  const navigate = useNavigate(); // Use navigate hook
  const [, setapplicationid] = useState(null);
  const [applications, setApplications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [detailModalIsOpen, setDetailModalIsOpen] = useState(false);
  // const [selectedSubjectsNames, setSelectedSubjectsNames] = useState([]);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [formData, setFormData] = useState({
    application_title: '',
    description: '',
    start_date: '',
    end_date: '',
    exam_date: '',
    exam_location: '',
    application_status: '',
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchSubjects();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/exam_application/getApplications`);
      if (response.data.status) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching Applications:', error);
      //print_toast("error", "Failed to fetch applications");
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/exam_application/getSubjects`);
      const subjectOptions = response.data.data.map(subject => ({
        value: subject.subject_id,
        label: subject.class_level_name === 'HSS' && !subject.subject_name.toUpperCase().includes('HSS')
          ? `${subject.subject_name} (HSS)`
          : subject.subject_name,
        subject_type: subject.subject_type
      }));
      setSubjects(subjectOptions);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      //print_toast("error", "Failed to fetch subjects");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };


  const handleDescriptionChange = (event, editor) => {
    const data = editor.getData();
    setFormData(prevState => ({
      ...prevState,
      description: data
    }));
    setErrors(prevErrors => ({ ...prevErrors, description: '' }));
  };

  // const handleSeeSubjects = (subjectNames) => {
  //   setSelectedSubjectsNames(subjectNames.split(','));
  //   setSubjectsModalIsOpen(true);
  // };

  const handleSubjectChange = (selectedList, selectedItem) => {
    if (selectedItem.value === 'all') {
      if (selectedList.some(item => item.value === 'all')) {
        setSelectedSubjects([{ label: 'Select All', value: 'all' }, ...subjects]);
      } else {
        setSelectedSubjects([]);
      }
    } else {
      const updatedSelectedSubjects = selectedList.filter(item => item.value !== 'all');

      if (updatedSelectedSubjects.length === subjects.length) {
        setSelectedSubjects([{ label: 'Select All', value: 'all' }, ...subjects]);
      } else {
        setSelectedSubjects(updatedSelectedSubjects);
      }
    }
    setErrors(prevErrors => ({ ...prevErrors, subjects: '' }));
  };

  // const validateForm = () => {
  //   const newErrors = {};
  //   if (!formData.application_title.trim()) newErrors.application_title = 'Title is required';
  //   if (!formData.description.trim()) newErrors.description = 'Description is required';
  //   if (!formData.start_date) newErrors.start_date = 'Start date is required';
  //   if (!formData.end_date) newErrors.end_date = 'End date is required';
  //   if (new Date(formData.end_date) <= new Date(formData.start_date)) newErrors.end_date = 'End date must be after start date';
  //   if (selectedSubjects.length === 0) newErrors.subjects = 'At least one subject is required';
  //   if (!formData.status) newErrors.status = 'Status is required';
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.save_flag) return;

    setFormData(prevState => ({
      ...prevState,
      save_flag: true
    }));

    try {
      const dataToSend = {
        ...formData,
        subjects: selectedSubjects
          .filter(subject => subject.value !== 'all')
          .map(subject => subject.value)
      };

      const url = editingId
        ? `${globalVariables.api_url}/exam_application/update_Application/${editingId}`
        : `${globalVariables.api_url}/exam_application/save_Application`;

      const response = await axios.post(url, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        setEditModalIsOpen(false);
        fetchApplications();
        resetForm();
        if (editingId) {
          setSelectedApplication({ ...selectedApplication, ...dataToSend });
        }
      } else {
        print_toast("error", response.data.message);
        setErrors(response.data.error || {});
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      print_toast("error", "Failed to submit application");
    } finally {
      setFormData(prevState => ({
        ...prevState,
        save_flag: false
      }));
    }
  };

  const handleEdit = (application) => {
    setEditingId(application.application_id);
    setFormData({
      application_title: application.application_title,
      description: application.description,
      start_date: application.start_date,
      end_date: application.end_date,
      exam_date: application.exam_date || '',
      exam_location: application.exam_location || '',
      application_status: application.application_status
    });

    const subjectIds = application.subject_ids ? String(application.subject_ids).split(',') : [];
    const subjectNames = application.subject_names ? String(application.subject_names).split(/,(?![^(]*\))/) : [];

    const selectedSubjectsArray = subjectIds.map((id, index) => {
      const matched = subjects.find(s => String(s.value) === String(id));
      return matched || {
        value: parseInt(id),
        label: subjectNames[index] ? subjectNames[index].trim() : ''
      };
    });

    // If all subjects are selected, add the 'Select All' option
    if (subjects.length > 0 && selectedSubjectsArray.length === subjects.length) {
      selectedSubjectsArray.unshift({ label: 'Select All', value: 'all' });
    }

    setSelectedSubjects(selectedSubjectsArray);
    setDetailModalIsOpen(false);
    setEditModalIsOpen(true);
  };


  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;

    const application = { delete_flag: true };
    setSelectedApplication({ ...selectedApplication, ...application });

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/exam_application/delete_Application`,
        { application_id: id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchApplications();
        setDetailModalIsOpen(false);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      print_toast("error", "Failed to delete application");
    } finally {
      setSelectedApplication(prevState => ({
        ...prevState,
        delete_flag: false
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      application_title: '',
      description: '',
      start_date: '',
      end_date: '',
      exam_date: '',
      exam_location: '',
      application_status: '',
      save_flag: false
    });
    setSelectedSubjects([]);
    setEditingId(null);
    setErrors({});
  };

  const handleCancel = () => {
    setEditModalIsOpen(false);
    resetForm();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredApplications = applications.filter(application =>
    application.application_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(application.start_date).toLocaleDateString().includes(searchTerm)
  );

  const getRowStyle = (status) => {
    switch (status) {
      case 'published':
        return { backgroundColor: '#d4edda' }; // success color
      case 'not published':
        return { backgroundColor: '#fff3cd' }; // light yellow
      case 'closed':
        return { backgroundColor: '#f8d7da' }; // light red
      default:
        return {};
    }
  };
  const handleCertificate = (application) => {
    if (application) {
      setapplicationid(application);

      navigate('/certificate-verification-schedule', { state: { application: application } });

      console.error('candidates is null or undefined');

    }
  };
  const columns = [
    {
      name: <strong className="text-dark">#</strong>,
      selector: (row, index) => index + 1,
      sortable: true,
      width: '60px'
    },
    {
      name: <strong className="text-dark"><i className="fas fa-file-alt me-2"></i>Title</strong>,
      selector: row => row.application_title,
      sortable: true,
      minWidth: '250px',
      cell: row => (
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleRowClick(row);
          }}
          className="fw-bold text-primary text-decoration-none hover-underline"
        >
          {row.application_title}
        </a>
      )
    },
    {
      name: <strong className="text-dark"><i className="fas fa-calendar-plus me-2"></i>Start Date</strong>,
      selector: row => row.start_date,
      sortable: true,
      format: row => convertDateFormat(row.start_date)
    },
    {
      name: <strong className="text-dark"><i className="fas fa-calendar-minus me-2"></i>End Date</strong>,
      selector: row => row.end_date,
      sortable: true,
      format: row => convertDateFormat(row.end_date)
    },
    {
      name: <strong className="text-dark"><i className="fas fa-calendar-check me-2"></i>Exam Date & Location</strong>,
      selector: row => row.exam_date,
      sortable: true,
      minWidth: '220px',
      cell: row => (
        <div className="d-flex flex-column">
          <span className="fw-bold text-primary">{row.exam_date ? convertDateFormat(row.exam_date) : '-'}</span>
          {row.exam_location && <span className="small text-muted mt-1"><i className="fas fa-map-marker-alt me-1"></i>{row.exam_location}</span>}
        </div>
      )
    },

    {
      name: <strong className="text-dark"><i className="fas fa-info-circle me-2"></i>Status</strong>,
      selector: row => capitalizeWords(row.application_status),
      sortable: true,
      cell: row => {
        const statuses = {
          published: 'bg-success',
          'not published': 'bg-warning text-dark',
          closed: 'bg-danger'
        };
        const colorClass = statuses[row.application_status] || 'bg-secondary';
        return (
          <span className={`badge rounded-pill ${colorClass} px-3 py-2 shadow-sm font-sm fw-medium`}>
            {capitalizeWords(row.application_status)}
          </span>
        );
      }
    },
    {
      name: <strong className="text-dark"><i className="fas fa-cogs me-2"></i>Actions</strong>,
      cell: row => (
        <Link
          to={`/exam-application-details/${row.application_id}`}
          className="btn btn-primary btn-sm rounded-pill px-4 fw-bold shadow-sm text-white btn-view-custom"
        >
          View
        </Link>
      )
    }
  ];

  const handleRowClick = (row) => {
    setSelectedApplication(row);
    setDetailModalIsOpen(true);
  };

  return (
    <>
      <Breadcum items={breadcum} title="Exam Applications" />

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title fw-bold text-dark mb-0">
            <i className="fas fa-file-invoice me-2 text-primary"></i>Exam Application Management
          </h5>
          {user?.user_type !== 'certificate_verifier' && (
            <button className="btn btn-primary shadow-sm px-4 fw-bold" onClick={() => { resetForm(); setEditModalIsOpen(true); }}>
              <i className="fas fa-plus-circle me-1"></i> Create New
            </button>
          )}
        </div>
        <div className="card-body p-4">
          <div className="d-flex justify-content-end mb-4">
            <div className="input-group shadow-sm" style={{ width: '300px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredApplications}
            className="table table-striped table-hover rounded overflow-hidden"
            pagination
            responsive
            onRowClicked={handleRowClick}
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                  color: '#333',
                  fontSize: '0.9rem'
                },
              },
              rows: {
                style: {
                  minHeight: '60px',
                  cursor: 'pointer'
                },
              },
            }}
            conditionalRowStyles={[
              {
                when: row => row.application_status === 'published',
                style: { borderLeft: '4px solid #198754' }
              },
              {
                when: row => row.application_status === 'not published',
                style: { borderLeft: '4px solid #ffc107' }
              },
              {
                when: row => row.application_status === 'closed',
                style: { borderLeft: '4px solid #dc3545' }
              }
            ]}
          />
        </div>
      </div>













      <Modal show={detailModalIsOpen} onHide={() => setDetailModalIsOpen(false)} size="lg" centered backdrop='static' className="custom-modal">
        <Modal.Header closeButton className="bg-light border-bottom-0 pt-4 px-4">
          <Modal.Title className="fw-bold text-dark">
            <i className="fas fa-file-alt me-2 text-primary"></i>
            {selectedApplication?.application_title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 pb-4">
          {selectedApplication && (
            <div className="container-fluid p-0">
              <div className="row g-4">
                <div className="col-12">
                  <div className="bg-light p-4 rounded-3 border-start border-4 border-primary shadow-sm">
                    <h6 className="fw-bold text-muted text-uppercase small ls-1 mb-3">
                      <i className="fas fa-align-left me-2"></i>Description
                    </h6>
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedApplication.description }}
                      className="text-secondary"
                      style={{ lineHeight: '1.6' }}
                    />
                  </div>
                </div>

                <div className="col-md-7">
                  <div className="card border shadow-sm">
                    <div className="card-header bg-dark-blue py-3 px-4">
                      <div className="fw-bold fs-6 text-white mb-0">
                        <i className="fas fa-book-open me-2 text-gold"></i>Associated Subjects
                      </div>
                    </div>
                    <div className="card-body p-0">
                      <div className="list-group list-group-flush">
                            {selectedApplication.subject_names?.split(/,(?![^(]*\))/).map((subject, index) => (
                          <div key={index} className="list-group-item d-flex align-items-center py-3 px-4 border-bottom-light hover-highlight">
                            <div className="subject-number-badge me-3">
                              {index + 1}
                            </div>
                            <span className="fw-bold text-dark-blue fs-6">{subject.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-5">
                  <div className="d-flex flex-column gap-3">
                    <div className="p-3 border rounded bg-white shadow-sm">
                      <small className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.7rem' }}>Timeline</small>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted"><i className="fas fa-calendar-plus me-2"></i>Opening Date</span>
                        <span className="fw-bold text-dark">{convertDateFormat(selectedApplication.start_date)}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small text-muted"><i className="fas fa-calendar-minus me-2"></i>Closing Date</span>
                        <span className="fw-bold text-danger">{convertDateFormat(selectedApplication.end_date)}</span>
                      </div>
                      {selectedApplication.exam_date && (
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="small text-muted"><i className="fas fa-calendar-check me-2"></i>Exam Date</span>
                          <span className="fw-bold text-primary">{convertDateFormat(selectedApplication.exam_date)}</span>
                        </div>
                      )}
                      {selectedApplication.exam_location && (
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="small text-muted"><i className="fas fa-map-marker-alt me-2"></i>Location</span>
                          <span className="fw-bold text-dark">{selectedApplication.exam_location}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-3 border rounded bg-white shadow-sm">
                      <small className="text-muted fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.7rem' }}>Current Status</small>
                      <span className={`badge rounded-pill ${selectedApplication.application_status === "published" ? "bg-success" : "bg-warning text-dark"} px-3 py-2 fw-medium shadow-sm w-100`}>
                        {capitalizeWords(selectedApplication.application_status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top-0 px-4 pb-4">
          <div className="d-flex justify-content-end gap-2 w-100">
            <button className="btn btn-outline-secondary px-4 fw-bold" onClick={() => setDetailModalIsOpen(false)}>
              Close
            </button>
            <div className="ms-auto d-flex gap-2">
              {user?.user_type !== 'certificate_verifier' && (
                <>
                  <button className="btn btn-danger px-4 fw-bold" onClick={() => handleDelete(selectedApplication.application_id)}>
                    <i className="fas fa-trash-alt me-2"></i>Delete
                  </button>
                  <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={() => handleEdit(selectedApplication)}>
                    <i className="fas fa-edit me-2"></i>Edit Application
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal.Footer>
      </Modal>


      <Modal show={editModalIsOpen} onHide={() => { resetForm(); setEditModalIsOpen(false); }} size="lg" backdrop='static' centered className="custom-modal">
        <Modal.Header closeButton className="bg-light border-bottom-0 pt-4 px-4">
          <Modal.Title className="fw-bold text-dark">
            <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'} me-2 text-primary`}></i>
            {editingId ? 'Edit Exam Application' : 'Create New Application'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-12">
                <label htmlFor="application_title" className="form-label fw-bold small text-muted text-uppercase">Application Title <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-heading text-muted"></i></span>
                  <input
                    type="text"
                    className={`form-control border-start-0 ${errors.application_title ? 'is-invalid' : ''}`}
                    id="application_title"
                    name="application_title"
                    placeholder="Enter assessment title"
                    value={formData.application_title}
                    onChange={handleChange}
                  />
                </div>
                {errors.application_title && <div className="text-danger x-small mt-1">{errors.application_title}</div>}
              </div>

              <div className="col-md-12">
                <label htmlFor="description" className="form-label fw-bold small text-muted text-uppercase">Description <span className="text-danger">*</span></label>
                <div className={`${errors.description ? 'border border-danger rounded' : ''}`}>
                  <CKEditor
                    editor={ClassicEditor}
                    data={formData.description}
                    onChange={handleDescriptionChange}
                  />
                </div>
                {errors.description && <div className="text-danger x-small mt-1">{errors.description}</div>}
              </div>

              <div className="col-md-12">
                <label className="form-label fw-bold small text-muted text-uppercase">Select Subjects <span className="text-danger">*</span></label>
                <Multiselect
                  options={[{ label: 'Select All', value: 'all', subject_type: 'General' }, ...subjects]}
                  selectedValues={selectedSubjects}
                  onSelect={handleSubjectChange}
                  onRemove={handleSubjectChange}
                  displayValue="label"
                  groupBy="subject_type"
                  showCheckbox={true}
                  placeholder="Choose subjects..."
                  hidePlaceholder={true}
                  closeOnSelect={false}
                  avoidHighlightFirstOption={true}
                  showArrow={true}
                  className="rounded"
                  style={{
                    chips: { background: '#0d6efd' },
                    searchBox: { border: '1px solid #dee2e6', borderRadius: '0.375rem', padding: '0.5rem' }
                  }}
                />
                {errors.subjects && <div className="text-danger x-small mt-1">{errors.subjects}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="start_date" className="form-label fw-bold small text-muted text-uppercase">Start Date <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-calendar-plus text-muted"></i></span>
                  <input
                    type="date"
                    className={`form-control border-start-0 ${errors.start_date ? 'is-invalid' : ''}`}
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
                {errors.start_date && <div className="text-danger x-small mt-1">{errors.start_date}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="end_date" className="form-label fw-bold small text-muted text-uppercase">End Date <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-calendar-minus text-muted"></i></span>
                  <input
                    type="date"
                    className={`form-control border-start-0 ${errors.end_date ? 'is-invalid' : ''}`}
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    min={formData.start_date}
                  />
                </div>
                {errors.end_date && <div className="text-danger x-small mt-1">{errors.end_date}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="exam_date" className="form-label fw-bold small text-muted text-uppercase">Exam Date</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-calendar-day text-muted"></i></span>
                  <input
                    type="date"
                    className="form-control border-start-0"
                    id="exam_date"
                    name="exam_date"
                    value={formData.exam_date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label htmlFor="exam_location" className="form-label fw-bold small text-muted text-uppercase">Exam Location</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-map-marked-alt text-muted"></i></span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    id="exam_location"
                    name="exam_location"
                    placeholder="Enter venue or location"
                    value={formData.exam_location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-12">
                <label htmlFor="application_status" className="form-label fw-bold small text-muted text-uppercase">Status <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-toggle-on text-muted"></i></span>
                  <select
                    className={`form-select border-start-0 ${errors.application_status ? 'is-invalid' : ''}`}
                    id="application_status"
                    name="application_status"
                    value={formData.application_status}
                    onChange={handleChange}
                  >
                    <option value="">Select current status</option>
                    <option value="published">Published</option>
                    <option value="not published">Not Published</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                {errors.application_status && <div className="text-danger x-small mt-1">{errors.application_status}</div>}
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-light px-4 me-2 fw-bold"
                onClick={() => { resetForm(); setEditModalIsOpen(false); }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary px-4 fw-bold shadow-sm"
                disabled={formData.save_flag}
              >
                {formData.save_flag ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {editingId ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <i className={`fas ${editingId ? 'fa-save' : 'fa-check-circle'} me-2`}></i>
                    {editingId ? 'Update Application' : 'Save Application'}
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
      <style>{`
        .btn-view-custom {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: linear-gradient(45deg, #0d6efd, #0b5ed7);
            border: none;
        }
        .btn-view-custom:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 5px 15px rgba(13, 110, 253, 0.4) !important;
            background: linear-gradient(45deg, #0b5ed7, #0a58ca);
            color: white !important;
        }
        .hover-underline:hover {
            color: #0a58ca !important;
            text-decoration: underline !important;
        }
        .bg-dark-blue { background-color: #1a237e !important; }
        .text-gold { color: #ffd700 !important; }
        .text-dark-blue { color: #1a237e !important; }
        .border-bottom-light { border-bottom: 1px solid #f1f4f8 !important; }
        .subject-number-badge {
            width: 32px;
            height: 32px;
            background: #e3f2fd;
            color: #1565c0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            font-weight: 800;
            border: 1px solid #bbdefb;
        }
        .hover-highlight:hover {
            background-color: #f8fbff;
            transition: background-color 0.2s ease;
        }
      `}</style>
    </>
  );
};

export default ExamApplication;