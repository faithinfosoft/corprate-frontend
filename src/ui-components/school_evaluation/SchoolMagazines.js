import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import { Button, Dropdown } from "react-bootstrap";
import useAuth from "../../utilities/useAuth";
import { useData } from "./SchoolEvaluationForm";

const SchoolMagazines = () => {

  const { evaluationDocumentDetails } = useData();
  const academicYearId = evaluationDocumentDetails.academic_year_id;
  const schoolId = evaluationDocumentDetails.school_id;
  const auth = useAuth();
 
  const username = auth.user.username;

  const [magazines, setMagazines] = useState([]);
  const [saveFlag, setSaveFlag] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMagazine, setSelectedMagazine] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: "",
    title: "",
    copies: "",
    format: "",
  });
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  useEffect(() => {
   
    if (schoolId && academicYearId) {
      fetchMagazines();
    }
  }, [schoolId, academicYearId]);

  const fetchMagazines = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/magazines/view_magazines`, {
        params: {
          fk_school_id: schoolId,
          fk_academic_year_id: academicYearId 
        }
      });


      
      console.log("API Response:", response.data);
      if (response.data.status && Array.isArray(response.data.data)) {
        setMagazines(response.data.data);
      } else {
        setMagazines([]);
      }
    } catch (error) {
      console.error("Error fetching Magazines:", error);
      setMagazines([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validationErrors = {};

    if (!formData.type) validationErrors.type = "Type is required!";
    if (!formData.title.trim()) validationErrors.title = "Title is required!";
    if (!formData.copies || formData.copies <= 0)
      validationErrors.copies = "No. of copies is required!";
    if (!formData.format)
      validationErrors.format = "Publication Format is required!";

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const today = new Date();
      const created_date = today.toLocaleDateString("en-GB");

      const payload = {
        ...formData,
        fk_school_id: schoolId,
        fk_academic_year_id: academicYearId,
        created_by: username,
        created_date,
      };

      const response = await axios.post(
        `${globalVariables.api_url}/magazines/add_magazine`,
        payload
      );

      if (response.data.status) {
        print_toast("success", "Magazine added successfully!");
        fetchMagazines();
        setFormData({ type: "", title: "", copies: "", format: "" });
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", "Failed to add magazine.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this magazine?"))
      return;

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/magazines/delete_magazine`,
        { publication_id: id }
      );

      if (response.data.status) {
        print_toast("success", "Magazine deleted successfully!");
        fetchMagazines();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", "Failed to delete magazine.");
    }
  };

  const openEditModal = (magazine) => {
    setSelectedMagazine(magazine);
    setEditErrors({});
    setEditModalOpen(true);
  };
  const updateField = (field, value) => {
    setSelectedMagazine((prev) => ({
      ...prev,
      [field]: value,
    }));

    setEditErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    let errors = {};
    if (!selectedMagazine.publication_type)
      errors.publication_type = "Type is required";
    if (!selectedMagazine.title) errors.title = "Title is required";
    if (!selectedMagazine.publication_format)
      errors.publication_format = "Format is required";
    if (!selectedMagazine.no_of_copies)
      errors.no_of_copies = "No. of copies is required";

    setEditErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/magazines/update_magazine`,
        selectedMagazine
      );

      if (response.data.status) {
        print_toast("success", "Magazine updated successfully!");
        fetchMagazines();
        setEditModalOpen(false);
        setEditErrors({});
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", "Failed to update magazine.");
    }
  };

  const handleCancel = () => {
    setFormData({
      type: "",
      title: "",
      copies: "",
      format: "",
    });
    setErrors({});
  };

  return (
    <div className="container">
     
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">School Magazines </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th className="text-center">Sl No</th>
                      <th className="text-center">Type</th>
                      <th className="text-center">Title</th>
                      <th className="text-center">No. of Copies</th>
                      <th className="text-center">Format</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(magazines) && magazines.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          No magazines added yet.
                        </td>
                      </tr>
                    ) : (
                      magazines?.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">
                            {item.publication_type}
                          </td>
                          <td>{item.title}</td>
                          <td className="text-center">{item.no_of_copies}</td>
                          <td className="text-center">
                            {item.publication_format}
                          </td>
                          <td className="text-center">
                            <Dropdown>
                              <Dropdown.Toggle variant="secondary" size="sm">
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => openEditModal(item)}
                                >
                                  Edit
                                </Dropdown.Item>

                                <Dropdown.Item
                                  onClick={() =>
                                    handleDelete(item.publication_id)
                                  }
                                >
                                  Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
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
              <h5 className="card-title">Add Magazine</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>
                    Type <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Type</option>
                    <option value="Magazine">Magazine</option>
                    <option value="Publication">Publication</option>
                  </select>
                  {errors.type && (
                    <small className="text-danger">{errors.type}</small>
                  )}
                </div>
                <div className="form-group mt-2">
                  <label>
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                  {errors.title && (
                    <small className="text-danger">{errors.title}</small>
                  )}
                </div>
                <div className="form-group mt-2">
                  <label>
                    No of Copies <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="copies"
                    min="1"
                    value={formData.copies}
                    onChange={handleInputChange}
                  />
                  {errors.copies && (
                    <small className="text-danger">{errors.copies}</small>
                  )}
                </div>
                <div className="form-group mt-2">
                  <label>
                    Publication Format <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control"
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Format</option>
                    <option value="Manuscript">Manuscript</option>
                    <option value="Printed">Printed</option>
                  </select>
                  {errors.format && (
                    <small className="text-danger">{errors.format}</small>
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
      {editModalOpen && selectedMagazine && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Magazine</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditModalOpen(false)}
                ></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleEditSubmit}>
                  <div className="form-group">
                    <label>
                      Type<span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={selectedMagazine.publication_type}
                      onChange={(e) =>
                        updateField("publication_type", e.target.value)
                      }
                    >
                      <option value="">Select Type</option>
                      <option value="Magazine">Magazine</option>
                      <option value="Publication">Publication</option>
                    </select>
                    {editErrors.publication_type && (
                      <small className="text-danger">
                        {editErrors.publication_type}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Title<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={selectedMagazine.title}
                      onChange={(e) => updateField("title", e.target.value)}
                    />
                    {editErrors.title && (
                      <small className="text-danger">{editErrors.title}</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      No. of Copies<span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={selectedMagazine.no_of_copies}
                      min="1"
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 1) {
                          updateField("no_of_copies", value);
                        }
                      }}
                    />
                    {editErrors.no_of_copies && (
                      <small className="text-danger">
                        {editErrors.no_of_copies}
                      </small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>
                      Publication Format<span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={selectedMagazine.publication_format}
                      onChange={(e) =>
                        updateField("publication_format", e.target.value)
                      }
                    >
                      <option value="">Select Format</option>
                      <option value="Printed">Printed</option>
                      <option value="Manuscript">Manuscript</option>
                    </select>
                    {editErrors.publication_format && (
                      <small className="text-danger">
                        {editErrors.publication_format}
                      </small>
                    )}
                  </div>

                  <div className="col-12 text-end pt-2">
                    <button
                      type="submit"
                      className="btn btn-success m-1"
                      disabled={isSaving}
                    >
                      {isSaving ? "Updating..." : "Update"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger m-1"
                      onClick={() => setEditModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolMagazines;
