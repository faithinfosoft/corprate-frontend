import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import Modal from 'react-bootstrap/Modal';
import 'react-datepicker/dist/react-datepicker.css';
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";

const EducationQualification = ({ staffId }) => {
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState(null);
  const [formData, setFormData] = useState({
    staff_ac_qu_id: '',
    staff_ac_qu_course: '',
    staff_ac_qu_subject: '',
    staff_ac_qu_reg_no: '',
    staff_ac_qu_university_board: '',
    staff_ac_qu_year: new Date(),
    staff_ac_qu_mark_grade: '',
    staff_ac_qu_document: null,
    fk_staff_id: staffId
  });

  const courses = ["Science", "Arts", "Commerce", "Engineering", "Medicine"];

  const fetchQualifications = useCallback(async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/qualifications/staff/${staffId}`);
      if (response.data.status) {
        setQualifications(response.data.data);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error fetching qualifications:', error);
      //print_toast("error", "Failed to fetch qualifications");
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchQualifications();
  }, [fetchQualifications]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prevState => ({
      ...prevState,
      staff_ac_qu_year: date,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const url = editMode
        ? `${globalVariables.api_url}/staff/qualifications/update`
        : `${globalVariables.api_url}/staff/qualifications`;
      const response = await axios.post(url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        fetchQualifications();
        handleCloseModal();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error saving/updating qualification:', error);
      print_toast("error", "Failed to save/update qualification");
    }
  };

  const handleDelete = async (qualificationId) => {
    if (window.confirm('Are you sure you want to delete this qualification?')) {
      try {
        const response = await axios.post(`${globalVariables.api_url}/staff/qualifications/delete`, { 
          staff_ac_qu_id: qualificationId 
        });
        if (response.data.status) {
          print_toast("success", response.data.message);
          fetchQualifications();
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error('Error deleting qualification:', error);
        print_toast("error", "Failed to delete qualification");
      }
    }
  };

  const handleOpenModal = (qualification = null) => {
    if (qualification) {
      setEditMode(true);
      setSelectedQualification(qualification);
      setFormData({
        ...qualification,
        staff_ac_qu_year: new Date(qualification.staff_ac_qu_year),
        staff_ac_qu_document: null
      });
    } else {
      setEditMode(false);
      setSelectedQualification(null);
      setFormData({
        staff_ac_qu_id: '',
        staff_ac_qu_course: '',
        staff_ac_qu_subject: '',
        staff_ac_qu_reg_no: '',
        staff_ac_qu_university_board: '',
        staff_ac_qu_year: new Date(),
        staff_ac_qu_mark_grade: '',
        staff_ac_qu_document: null,
        fk_staff_id: staffId
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedQualification(null);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Academic Qualifications</h4>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>Add Qualification</button>
      </div>
      {loading ? (
        <p>Loading qualifications...</p>
      ) : qualifications.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>Course</th>
                <th>Subject</th>
                <th>Registration No.</th>
                <th>University/Board</th>
                <th>Year</th>
                <th>Mark/Grade</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {qualifications.map((qualification, index) => (
                <tr key={index}>
                  <td>{qualification.staff_ac_qu_course}</td>
                  <td>{qualification.staff_ac_qu_subject}</td>
                  <td>{qualification.staff_ac_qu_reg_no}</td>
                  <td>{qualification.staff_ac_qu_university_board}</td>
                  <td>{qualification.staff_ac_qu_year}</td>
                  <td>{qualification.staff_ac_qu_mark_grade}</td>
                  <td>
                    {qualification.staff_ac_qu_document ? (
                      <a href={`${globalVariables.api_url}/uploads/staff_documents/${qualification.staff_ac_qu_document}`} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    ) : (
                      'No document'
                    )}
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary me-2" onClick={() => handleOpenModal(qualification)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(qualification.staff_ac_qu_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No qualifications found.</p>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit' : 'Add'} Educational Qualification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="row g-3">
          <div className="col-12">
              <label htmlFor="staff_ac_qu_course" className="form-label">
                Course <span className="text-danger">*</span>
              </label>
              <select
                id="staff_ac_qu_course"
                name="staff_ac_qu_course"
                className="form-select"
                value={formData.staff_ac_qu_course}
                onChange={handleChange}
                required
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label htmlFor="staff_ac_qu_subject" className="form-label">
                Subject <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="staff_ac_qu_subject"
                name="staff_ac_qu_subject"
                value={formData.staff_ac_qu_subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="staff_ac_qu_reg_no" className="form-label">
                Registration Number <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="staff_ac_qu_reg_no"
                name="staff_ac_qu_reg_no"
                value={formData.staff_ac_qu_reg_no}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="staff_ac_qu_university_board" className="form-label">
                University/Board <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="staff_ac_qu_university_board"
                name="staff_ac_qu_university_board"
                value={formData.staff_ac_qu_university_board}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="staff_ac_qu_year" className="form-label">
                Year <span className="text-danger">*</span>
              </label>
              <DatePicker
                id="staff_ac_qu_year"
                selected={formData.staff_ac_qu_year}
                onChange={handleDateChange}
                className="form-control"
                dateFormat="yyyy"
                showYearPicker
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="staff_ac_qu_mark_grade" className="form-label">
                Marks/Grade <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="staff_ac_qu_mark_grade"
                name="staff_ac_qu_mark_grade"
                value={formData.staff_ac_qu_mark_grade}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-12">
              <label htmlFor="staff_ac_qu_document" className="form-label">
                Document (PDF) {editMode ? '' : <span className="text-danger">*</span>}
              </label>
              <input
                type="file"
                className="form-control"
                id="staff_ac_qu_document"
                name="staff_ac_qu_document"
                onChange={handleChange}
                accept=".pdf"
                required={!editMode}
              />
            </div>
            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1">
                {editMode ? 'Update' : 'Save'}
              </button>
              <button type="button" className="btn btn-danger m-1" onClick={handleCloseModal}>
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EducationQualification;