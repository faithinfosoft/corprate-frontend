import React, { useState, useEffect } from "react";
import Breadcum from "../Breadcum";
import axios from "axios";
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import useAuth from "../../utilities/useAuth";
import { Modal, Button, Form } from "react-bootstrap";
import { useData } from "./SchoolEvaluationForm";
const StaffAchievement = () => {
  const auth = useAuth();
  const { evaluationDocumentDetails } = useData();
  const academicYearId = evaluationDocumentDetails.academic_year_id;
  const schoolId = evaluationDocumentDetails.school_id;

  const [saveFlag, setSaveFlag] = useState(false);

 
  const school_id = auth.user.user_id;

  const [formData, setFormData] = useState({
    fk_staff_id: "",
    event_name: "",
    event_achievement: "",
  });

  const [achievements, setAchievements] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});


  useEffect(() => {
     
    if (schoolId && academicYearId) {
      fetchAchievements();
    }
  }, [schoolId, academicYearId]);
  const fetchAchievements = async () => {
    try {
    

      const response = await axios.get(`${globalVariables.api_url}/staffachievement/view_achievements`, {
        params: {
          fk_school_id: schoolId,
          fk_academic_year_id: academicYearId 
        }
      });


      if (response.data && response.data.data) {
        setAchievements(response.data.data);
      } else {
        console.error("Activities data is missing");
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };


  

  const fetchStaff = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/staffachievement/fetch_staff/${school_id}`
      );
      if (response.data.status) {
        setStaffList(response.data.data);
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffList([]);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [school_id]);

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleCancel = () => {
    setFormData({
      fk_staff_id: "",
      event_name: "",
      event_achievement: "",
    });
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedAchievement({ ...selectedAchievement, [name]: value });

    if (editErrors[name]) {
      setEditErrors({ ...editErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      fk_staff_id: formData.fk_staff_id,
      event_name: formData.event_name,
      event_achievement: formData.event_achievement,
      school_id: school_id,
      fk_academic_year_id:academicYearId,
    };

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/staffachievement/saveEvent`,
        payload
      );

      if (response.data.status) {
        print_toast("success", "Event added successfully!");
        setFormData({ fk_staff_id: "", event_name: "", event_achievement: "" });
        fetchAchievements();
      } else {
        if (response.data.errors) {
          setErrors(response.data.errors);
        } else {
          print_toast("error", response.data.message);
        }
      }
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        print_toast("error", "Failed to add event.");
      }
    }
  };

  const openEditModal = (achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      staff_achievement_id: selectedAchievement.staff_achievement_id,
      fk_staff_id: selectedAchievement.fk_staff_id,
      event_name: selectedAchievement.event_name,
      event_achievement: selectedAchievement.event_achievement,
      school_id: school_id,
      fk_academic_year_id: academicYearId,
    };

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/staffachievement/updateEvent`,
        payload
      );

      if (response.data.status) {
        print_toast("success", "Event updated successfully!");
        setShowModal(false);
        fetchAchievements();
        setEditErrors({});
      } else {
        if (response.data.errors) {
          setEditErrors(response.data.errors);
        } else {
          print_toast("error", response.data.message);
        }
      }
    } catch (error) {
      print_toast("error", "Failed to update event.");
    }
  };

  const handleDelete = async (staff_achievement_id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this achievement?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/staffachievement/delete`,
        { staff_achievement_id }
      );

      if (response.data.status) {
        print_toast("success", "Achievement deleted successfully!");
        fetchAchievements();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to delete Achievement."
        );
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      print_toast("error", "An error occurred while deleting data.");
    }
  };

  const clearEditErrors = () => {
    setEditErrors({});
  };

  return (
    <div className="container">
    
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title"> Staff Achievements</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th className="text-center">Sl No</th>
                      <th className="text-center">Event Name</th>
                      <th className="text-center">Event Achievements</th>
                      <th className="text-center">Staff Name</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center">
                          No events added yet.
                        </td>
                      </tr>
                    ) : (
                      achievements.map((item, index) => (
                        <tr key={item.staff_achievement_id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{item.event_name}</td>
                          <td className="text-center">
                            {item.event_achievement}
                          </td>
                          <td className="text-center">
                            {staffList.find(
                              (staff) => staff.staff_id === item.fk_staff_id
                            )?.staff_official_name || "N/A"}
                          </td>

                          <td className="text-center">
                            <div className="dropdown">
                              <button
                                className="btn btn-dark dropdown-toggle btn-sm"
                                type="button"
                                id={`dropdownMenuButton${index}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                Action
                              </button>
                              <ul
                                className="dropdown-menu"
                                aria-labelledby={`dropdownMenuButton${index}`}
                              >
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => openEditModal(item)}
                                  >
                                    Edit
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() =>
                                      handleDelete(item.staff_achievement_id)
                                    }
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
              <h5 className="card-title">Add Achievements</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group mt-2">
                  <label>
                    Event <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleAddInputChange}
                  />
                  {errors.event_name && (
                    <span className="text-danger">{errors.event_name}</span>
                  )}
                </div>

                <div className="form-group mt-2">
                  <label>
                    Achievements <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    name="event_achievement"
                    value={formData.event_achievement}
                    rows="3"
                    onChange={handleAddInputChange}
                  ></textarea>
                  {errors.event_achievement && (
                    <span className="text-danger">
                      {errors.event_achievement}
                    </span>
                  )}
                </div>

                <div className="form-group mt-2">
                  <label>
                    Staff <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    name="fk_staff_id"
                    value={formData.fk_staff_id}
                    onChange={handleAddInputChange}
                  >
                    <option value="">Select Staff</option>
                    {staffList.map((staff) => (
                      <option key={staff.staff_id} value={staff.staff_id}>
                        {staff.staff_official_name}
                      </option>
                    ))}
                  </select>
                  {errors.fk_staff_id && (
                    <span className="text-danger">{errors.fk_staff_id}</span>
                  )}
                </div>

                <div className="col-12 mt-3 text-end">
                  <button
                    type="submit"
                    className="btn btn-success m-1"
                    disabled={saveFlag}
                  >
                    {saveFlag ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger m-1"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Achievement</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAchievement && (
            <form>
              {/* Event Name */}
              <div className="mb-3">
                <label
                  htmlFor="edit_event_name"
                  className="form-label fw-normal"
                >
                  Event Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="edit_event_name"
                  name="event_name"
                  value={selectedAchievement.event_name}
                  onChange={handleInputChange}
                />
                {editErrors.event_name && (
                  <span className="text-danger">{editErrors.event_name}</span>
                )}
              </div>

              {/* Event Achievement */}
              <div className="mb-3">
                <label
                  htmlFor="edit_event_achievement"
                  className="form-label fw-normal"
                >
                  Event Achievement <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="edit_event_achievement"
                  name="event_achievement"
                  value={selectedAchievement.event_achievement}
                  onChange={handleInputChange}
                />
                {editErrors.event_achievement && (
                  <span className="text-danger">
                    {editErrors.event_achievement}
                  </span>
                )}
              </div>

              {/* Staff ID */}
              <div className="mb-3">
                <label htmlFor="edit_staff_id" className="form-label fw-normal">
                  Staff <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  id="edit_staff_id"
                  name="fk_staff_id"
                  value={selectedAchievement?.fk_staff_id || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Select Staff</option>
                  {staffList.map((staff) => (
                    <option key={staff.staff_id} value={staff.staff_id}>
                      {staff.staff_official_name}
                    </option>
                  ))}
                </select>
                {editErrors.fk_staff_id && (
                  <span className="text-danger">{editErrors.fk_staff_id}</span>
                )}
              </div>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-success" onClick={handleEditSubmit}>
            Update
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              setShowModal(false);
              clearEditErrors();
            }}
          >
            Cancel
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default StaffAchievement;
