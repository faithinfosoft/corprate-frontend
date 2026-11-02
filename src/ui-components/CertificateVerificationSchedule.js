import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Modal from 'react-bootstrap/Modal';
import Multiselect from 'multiselect-react-dropdown';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { useParams } from 'react-router-dom';
import { convertDateFormat } from '../utilities/dateconverter.js';
import useAuth from "../utilities/useAuth";
const CertificateVerificationSchedule = ({ isEmbedded = false }) => {
  const { user } = useAuth();
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Exam Applications', Link: '/exam-application' },
    { Title: 'Certificate Verification Schedule', Link: '' },
  ]);

  const { application_id } = useParams();

  const [applications, setApplications] = useState([]);
  const [currentReceivers, setCurrentReceivers] = useState([]);
  const [applicationId, setApplicationId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedcandidates, setSelectedcandidates] = useState([]);
  const [candidatesModalIsOpen, setcandidatesModalIsOpen] = useState(false);
  const [selectedcandidatesNames, setSelectedcandidatesNames] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [receiverModalIsOpen, setReceiverModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    verification_date: '',
    verification_time: '',
    venue: '',
    fk_candidate_id: '',
    fk_application_id: application_id
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (application_id) {
      fetchCandidates();
      fetchSchedule();
      fetchApplications();
    }
  }, [application_id]);


  const [application, setApplication] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/exam_application/get_Applications_application_id`,
        {
          params: { application_id },
          headers: { 'Content-Type': 'application/json' },
        }
      );
      //  setApplications(response.data.data[0]);
      if (response.data?.data?.length > 0) {
        // Set the first application in the array
        setApplication(response.data.data[0]);
      } else {
        console.error('No application data found.');
      }
    } catch (error) {
      console.error('Error fetching Applications:', error);
      print_toast("error", "Failed to fetch applications");
    }
  };


  const fetchSchedule = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/certificate_verification/getSchedule`, {
        params: { application_id },
      });
      if (response.data.status) {
        setApplications(response.data.data);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching Applications:', error);
    }
  };

  const fetchCandidates = async () => {
    try {
      let candidateOptions = [];

      try {
        const response = await axios.get(`${globalVariables.api_url}/certificate_verification/getCandidates`, {
          params: { application_id },
        });
        const rawData = response.data?.data;
        const list = Array.isArray(rawData) ? rawData : [];
        candidateOptions = list.map(candidate => ({
          value: candidate.reg_id || candidate.fk_candidate_id,
          label: candidate.applicant_name
        }));
      } catch (err) {
        console.warn('certificate_verification/getCandidates failed, using fallback:', err);
      }

      // If backend getCandidates returned no candidates, fallback to getCandiadateExamApplications
      // (This guarantees approved candidates appear even before the remote backend update is deployed)
      if (!candidateOptions || candidateOptions.length === 0) {
        const appResponse = await axios.get(
          `${globalVariables.api_url}/candidateexamapplication/getCandiadateExamApplications`,
          { params: { application_id }, headers: { 'Content-Type': 'application/json' } }
        );
        const allCandidates = appResponse.data?.data || [];

        // Exclude candidates already scheduled for this application
        const scheduledIds = new Set();
        try {
          const schedResponse = await axios.get(`${globalVariables.api_url}/certificate_verification/getSchedule`, {
            params: { application_id },
          });
          const schedList = schedResponse.data?.data || [];
          if (Array.isArray(schedList)) {
            schedList.forEach(item => {
              if (item.candidate_ids) {
                item.candidate_ids.toString().split(',').forEach(id => {
                  const trimmed = id.trim();
                  if (trimmed) scheduledIds.add(String(trimmed));
                });
              }
            });
          }
        } catch (e) {
          console.warn('Error reading schedule for candidate filtering:', e);
        }

        const candidateMap = new Map();
        allCandidates.forEach(cand => {
          const appStatus = String(cand.appl_status || cand.status || '').toLowerCase().trim();
          const hasApprovedSubject = Array.isArray(cand.subjects) && cand.subjects.some(s =>
            String(s.subject_status || '').toLowerCase().trim() === 'approved'
          );
          const isApproved = appStatus === 'approved' || hasApprovedSubject;

          const candId = String(cand.reg_id || cand.fk_candidate_id || cand.candidate_id || '');
          if (isApproved && candId && !scheduledIds.has(candId)) {
            if (!candidateMap.has(candId)) {
              candidateMap.set(candId, {
                value: cand.reg_id || cand.fk_candidate_id || cand.candidate_id,
                label: cand.applicant_name || cand.name || `Candidate #${candId}`
              });
            }
          }
        });

        candidateOptions = Array.from(candidateMap.values());
      }

      setCandidates(candidateOptions);
    } catch (error) {
      console.error('Error fetching Candidates:', error);
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





  const handleCandidateChange = (selectedList, selectedItem) => {
    if (selectedItem.value === 'all') {
      if (selectedList.some(item => item.value === 'all')) {
        // If 'Select All' is selected, select all candidates including the 'all' option
        setSelectedcandidates([{ label: 'Select All', value: 'all' }, ...candidates]);
      } else {
        // If 'Select All' is deselected, clear the selection
        setSelectedcandidates([]);
      }
    } else {
      // Handle individual selections
      const updatedSelectedcandidates = selectedList.filter(item => item.value !== 'all');

      if (updatedSelectedcandidates.length === candidates.length) {
        // If all individual candidates are selected, automatically select 'Select All'
        setSelectedcandidates([{ label: 'Select All', value: 'all' }, ...candidates]);
      } else {
        setSelectedcandidates(updatedSelectedcandidates);
      }
    }

    // Clear error message for candidates
    setErrors(prevErrors => ({ ...prevErrors, candidates: '' }));
  };



  const validateForm = () => {
    const newErrors = {};
    if (!formData.venue) newErrors.venue = 'Location is required';
    if (!formData.verification_time) newErrors.verification_time = 'Verification Time is required';
    if (!formData.verification_date) newErrors.verification_date = 'Verification Date is required';


    if (selectedcandidates.length === 0) newErrors.candidates = 'At least one candidate is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // const dataToSend = {
      //   ...formData,
      //   candidates: selectedcandidates.map(candidate => candidate.value)

      // };
      const dataToSend = {
        ...formData,
        fk_application_id: formData.fk_application_id || application_id,
        candidates: selectedcandidates
          ?.filter(candidate => candidate && candidate.value && candidate.value !== 'all')
          .map(candidate => candidate.value) || []
      };

      let response;
      if (editingId) {
        response = await axios.post(`${globalVariables.api_url}/certificate_verification/update_Application/${editingId}`, dataToSend);
      } else {
        response = await axios.post(`${globalVariables.api_url}/certificate_verification/save_Application`, dataToSend, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (response.data.status) {
        print_toast("success", response.data.message);
        setModalIsOpen(false);
        fetchSchedule();
        fetchCandidates();
        resetForm();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      print_toast("error", "Failed to submit application");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit1 = (application) => {
    setEditingId(application.application_id);
    setFormData({
      application_title: application.application_title,

      status: application.status
    });

    // Parse the subject_ids string into an array of numbers
    const subjectIds = application.subject_ids.split(',').map(Number);
    const subjectNames = application.subject_names.split(/,(?![^(]*\))/);

    // Create an array of objects with value and label properties
    const selectedcandidatesArray = subjectIds.map((id, index) => ({
      value: id,
      label: subjectNames[index]
    }));

    setSelectedcandidates(selectedcandidatesArray);
    setModalIsOpen(true);
  };

  const handleEdit = async (schedule) => {
    // Set the editingId to the current schedule ID
    setEditingId(schedule.certificate_verification_id);

    // Split the candidate names and IDs
    const names = schedule.candidate_names ? schedule.candidate_names.split(',') : [];
    const ids = schedule.candidate_ids ? schedule.candidate_ids.split(',') : [];

    // Create candidate objects by combining names and IDs
    const candidateEntries = names.map((name, index) => ({
      value: ids[index] ? ids[index].trim() : '',
      label: name ? name.trim() : ''
    })).filter(c => c.value);

    // Ensure candidate options include the ones being edited
    setCandidates(prev => {
      const existingValues = new Set(prev.map(p => String(p.value)));
      const toAdd = candidateEntries.filter(entry => !existingValues.has(String(entry.value)));
      return [...prev, ...toAdd];
    });

    // Set the form data with the current schedule details
    const formData = {
      verification_date: schedule.verification_date,
      verification_time: schedule.verification_times,
      venue: schedule.venue,
      fk_candidate_id: schedule.fk_candidate_id,
      fk_application_id: schedule.fk_application_id || application_id,
    };

    setFormData(formData);
    setSelectedcandidates(candidateEntries);  // Set selected candidates
    setModalIsOpen(true);  // Open the modal for editing
  };
  const handleEdit12 = async (schedule) => {
    // Set the editingId to the current schedule ID
    setEditingId(schedule.certificate_verification_id);

    // Split the candidate names and prepare them for selection
    const receivers = schedule.candidate_names.split(',').map(candidate => {
      const name = candidate.split('::')[0].trim();  // Extract name part only
      return { name };
    });

    // Assuming 'candidates' holds the candidate data from the API
    const selectedCandidates = candidates.filter(candidate =>
      receivers.some(receiver => receiver.name === candidate.label)
    );

    // Set the form data with the current schedule details
    const formData = {
      verification_date: schedule.verification_date,
      verification_time: schedule.verification_times,
      venue: schedule.venue,
      fk_candidate_id: schedule.fk_candidate_id,
      fk_application_id: application_id  // Assuming this is part of the schedule data
    };

    setFormData(formData);
    setSelectedcandidates(selectedCandidates);  // Set selected candidates
    setModalIsOpen(true);  // Open the modal for editing
  };



  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/certificate_verification/deleteSchedule`,
          { certificate_verification_id: id },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.data.status) {
          print_toast("success", response.data.message);
          fetchSchedule();
          fetchCandidates();
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error('Error deleting application:', error);
        print_toast("error", "Failed to delete application");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      verification_date: '',
      verification_time: '',
      venue: '',
      fk_candidate_id: '',
      fk_application_id: application_id

    });


    setSelectedcandidates([]);
    setEditingId(null);
    setErrors({});
  };

  const handleCancel = () => {
    setModalIsOpen(false);
    resetForm();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredApplications = applications.filter(application =>
    application.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(application.verification_date).toLocaleDateString().includes(searchTerm)
  );

  const columns = [
    {
      name: <strong className="text-dark"><i className="fas fa-hashtag me-2"></i>#</strong>,
      selector: (row, index) => index + 1,
      sortable: true,
      width: '80px'
    },
    {
      name: <strong className="text-dark"><i className="fas fa-map-marker-alt me-2"></i>Location</strong>,
      selector: row => row.venue,
      sortable: true
    },
    {
      name: <strong className="text-dark"><i className="fas fa-clock me-2"></i>Time</strong>,
      selector: row => row.verification_times,
      sortable: true
    },

    {
      name: <strong className="text-dark"><i className="fas fa-users me-2"></i>Candidates</strong>,
      cell: row => (
        <button className="btn btn-outline-info btn-sm d-flex align-items-center shadow-sm" onClick={() => {
          const receivers = row.candidate_names.split(',').map(candidate => {
            const name = candidate.split('::')[0].trim();
            return { name };
          });
          setCurrentReceivers(receivers);
          setReceiverModalIsOpen(true);
        }}>
          <i className="fas fa-eye me-2"></i> Candidates
        </button>
      )
    },

    {
      name: <strong className="text-dark"><i className="fas fa-calendar-check me-2"></i>Verification Date</strong>,
      selector: row => convertDateFormat(row.verification_date),
      sortable: true,
    },


    {
      name: <strong className="text-dark"><i className="fas fa-cogs me-2"></i>Actions</strong>,
      cell: row => (
        <div className="dropdown">
          <button className="btn btn-dark btn-sm dropdown-toggle shadow-sm" type="button" id={`dropdown-${row.certificate_verification_id}`} data-bs-toggle="dropdown" aria-expanded="false">
            <i className="fas fa-ellipsis-v"></i>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby={`dropdown-${row.certificate_verification_id}`}>
            {user?.user_type !== 'certificate_verifier' && (
              <>
                <li>
                  <button className="dropdown-item py-2" onClick={() => handleEdit(row)}>
                    <i className="fas fa-edit text-primary me-2"></i> Edit
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2 text-danger" onClick={() => handleDelete(row.certificate_verification_id)}>
                    <i className="fas fa-trash-alt me-2"></i> Delete
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )
    }
  ];

  return (
    <>
      {!isEmbedded && <Breadcum items={breadcum} title="Certificate Verification Schedule" />}

      <div className={`card ${isEmbedded ? 'border-0 shadow-none' : 'shadow-sm'}`}>
        <div className={`card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center ${isEmbedded ? 'border-0' : ''}`}>
          {!isEmbedded ? (
            <h5 className="card-title fw-bold text-dark mb-0">
              <i className="fas fa-calendar-alt me-2 text-primary"></i>Certificate Verification Schedule
            </h5>
          ) : <div></div>}
          {user?.user_type !== 'certificate_verifier' && (
            <button className="btn btn-primary shadow-sm d-flex align-items-center px-4" onClick={() => { resetForm(); fetchCandidates(); setModalIsOpen(true); }}>
              <i className="fas fa-plus-circle me-2"></i> Create Schedule
            </button>
          )}
        </div>
        <div className="card-body p-4">
          {!isEmbedded && (
            <div className="mb-4 p-4 bg-light rounded shadow-sm border-start border-4 border-primary">
              {application ? (
                <>
                  <div className="row align-items-center">
                    <div className="col-md-7">
                      <h5 className="fw-bold text-primary mb-1">
                        <i className="fas fa-file-signature me-2"></i>{application.application_title}
                      </h5>
                      <div className="text-muted small">
                        <i className="fas fa-info-circle me-1"></i> Exam Details & Verification Process
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="d-flex justify-content-md-end gap-2 mt-2 mt-md-0">
                        <div className="bg-white border rounded px-3 py-2 text-center shadow-sm">
                          <small className="text-muted d-block fw-bold" style={{ fontSize: '0.65rem' }}>START DATE</small>
                          <span className="small fw-bold text-dark">{convertDateFormat(application.start_date)}</span>
                        </div>
                        <div className="bg-white border rounded px-3 py-2 text-center shadow-sm border-danger-light">
                          <small className="text-muted d-block fw-bold" style={{ fontSize: '0.65rem' }}>END DATE</small>
                          <span className="small fw-bold text-danger">{convertDateFormat(application.end_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="my-3 opacity-25" />
                  <div className="row">
                    <div className="col-md-12">
                      <div className="d-flex align-items-start">
                        <i className="fas fa-quote-left text-primary me-2 mt-1 opacity-50"></i>
                        <div
                          className="fw-normal text-secondary"
                          style={{ fontSize: '0.95rem', lineHeight: '1.5' }}
                          dangerouslySetInnerHTML={{ __html: application.description }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="fas fa-exclamation-triangle me-2"></i>No application data available.
                </div>
              )}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div></div>
            <div className="input-group w-auto">
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search schedule..."
                style={{ width: '250px' }}
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            className="table table-striped table-bordered shadow-sm rounded"
            data={filteredApplications}
            pagination
            responsive
            customStyles={{
              headCells: {
                style: {
                  backgroundColor: '#f8f9fa',
                  fontWeight: 'bold',
                  color: '#333'
                },
              },
            }}
          />
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={handleCancel} size="lg" backdrop="static" centered className="custom-modal">
        <Modal.Header closeButton className="bg-light border-bottom-0 pt-4 px-4">
          <Modal.Title className="fw-bold text-dark">
            <i className={`fas ${editingId ? 'fa-edit' : 'fa-plus-circle'} me-2 text-primary`}></i>
            {editingId ? 'Edit Schedule' : 'New Verification Schedule'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-12">
                <label htmlFor="venue" className="form-label fw-bold small text-muted text-uppercase">Location <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-map-marker-alt text-muted"></i></span>
                  <input
                    type="text"
                    className={`form-control border-start-0 ${errors.venue ? 'is-invalid' : ''}`}
                    id="venue"
                    name="venue"
                    placeholder="Enter verification venue/location"
                    value={formData.venue}
                    onChange={handleChange}
                  />
                </div>
                {errors.venue && <div className="text-danger x-small mt-1">{errors.venue}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="verification_date" className="form-label fw-bold small text-muted text-uppercase">Verification Date <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-calendar-alt text-muted"></i></span>
                  <input
                    type="date"
                    className={`form-control border-start-0 ${errors.verification_date ? 'is-invalid' : ''}`}
                    id="verification_date"
                    name="verification_date"
                    value={formData.verification_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.verification_date && <div className="text-danger x-small mt-1">{errors.verification_date}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="verification_time" className="form-label fw-bold small text-muted text-uppercase">Verification Time <span className="text-danger">*</span></label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-clock text-muted"></i></span>
                  <input
                    type="time"
                    className={`form-control border-start-0 ${errors.verification_time ? 'is-invalid' : ''}`}
                    id="verification_time"
                    name="verification_time"
                    value={formData.verification_time}
                    onChange={handleChange}
                  />
                </div>
                {errors.verification_time && <div className="text-danger x-small mt-1">{errors.verification_time}</div>}
              </div>

              <div className="col-md-12">
                <label className="form-label fw-bold small text-muted text-uppercase">Select Candidates <span className="text-danger">*</span></label>
                <Multiselect
                  options={candidates.length > 0 ? [{ label: 'Select All', value: 'all' }, ...candidates] : []}
                  selectedValues={selectedcandidates}
                  onSelect={handleCandidateChange}
                  onRemove={handleCandidateChange}
                  displayValue="label"
                  showCheckbox={true}
                  placeholder={candidates.length > 0 ? "Choose candidates..." : "No approved candidates available"}
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
                {candidates.length === 0 && (
                  <div className="text-muted small mt-1">
                    <i className="fas fa-info-circle me-1"></i>No unscheduled approved candidates found for this exam.
                  </div>
                )}
                {errors.candidates && <div className="text-danger x-small mt-1">{errors.candidates}</div>}
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4 pt-3 border-top">
              <button type="button" className="btn btn-light px-4 me-2 fw-bold" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4 fw-bold shadow-sm" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {editingId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <i className={`fas ${editingId ? 'fa-save' : 'fa-check-circle'} me-2`}></i>
                    {editingId ? 'Update Schedule' : 'Create Schedule'}
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={candidatesModalIsOpen} onHide={() => setcandidatesModalIsOpen(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold fs-5">Selected Candidates</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <ul className="list-group list-group-flush">
            {selectedcandidatesNames.map((subject, index) => (
              <li key={index} className="list-group-item d-flex align-items-center py-3">
                <div className="bg-primary-light text-primary rounded-circle p-2 me-3" style={{ width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {index + 1}
                </div>
                <span className="fw-medium">{subject.trim()}</span>
              </li>
            ))}
          </ul>
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <button className="btn btn-secondary px-4 fw-bold" onClick={() => setcandidatesModalIsOpen(false)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={receiverModalIsOpen} onHide={() => setReceiverModalIsOpen(false)} centered>
        <Modal.Header closeButton className="bg-light border-bottom-0 pt-4 px-4">
          <Modal.Title className="fw-bold text-dark">
            <i className="fas fa-users me-2 text-info"></i>Scheduled Candidates
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="list-group list-group-flush border rounded overflow-hidden">
            {currentReceivers.length > 0 ? (
              currentReceivers.map((candidate, index) => (
                <div key={index} className="list-group-item d-flex align-items-center py-3 border-light hvr-bg-light">
                  <div className="avatar-sm bg-info-light text-info rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold" style={{ minWidth: '32px', height: '32px', fontSize: '0.8rem' }}>
                    {candidate.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-medium text-dark">{candidate.name}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-user-slash d-block fs-2 mb-2 opacity-25"></i>
                No candidates scheduled
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CertificateVerificationSchedule;