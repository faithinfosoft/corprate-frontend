import { useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import { useNavigate } from "react-router-dom";
import Breadcum from "./Breadcum";
import print_toast from "../utilities/Toaster.js";
import useAuth from "../utilities/useAuth";
import { convertDateFormat } from '../utilities/dateconverter';
const SchoolManagerProfile = () => {


  const auth = useAuth();
  const managerId = auth.user.manager_id;
  //console.log("School ID:", school_id);

  const [managerDetails, setManagerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!managerId) return;
    fetchManagerDetails();
  }, [managerId]);

  const fetchManagerDetails = async () => {
    try {
      const apiUrl = `${globalVariables.api_url}/schoolmanager/getmanagerById/${managerId}`;
      console.log("API Request URL:", apiUrl);

      const response = await axios.get(apiUrl);
      setManagerDetails(response.data);
      setEditResponses(response.data);
    } catch (error) {
      console.error("Error fetching manager details:", error);
      print_toast("Error fetching manager details", "error");
    } finally {
      setLoading(false);
    }
  };
  const [editResponses, setEditResponses] = useState({
    official_name: "",
    mobile_no: "",
    whatsapp_no: "",
    start_date: "",
    end_date: "",
    email: "",
    fk_school_id:""
  });

  useEffect(() => {
    if (isModalOpen) {
      setEditResponses(managerDetails);
      setEditErrors({});
    }
  }, [isModalOpen, managerDetails]);

  const handleOpenModal = () => {
    setFormData(managerDetails);
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditResponses((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setEditErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleCancel = () => {
    setEditResponses(managerDetails);
    setEditErrors({});
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    let errors = {};

    if (!editResponses.official_name) {
      errors.official_name = "Official name is required.";
    }
    if (!editResponses.mobile_no) {
      errors.mobile_no = "Mobile number is required.";
    }
    if (!editResponses.whatsapp_no) {
      errors.whatsapp_no = "WhatsApp number is required.";
    }
    if (!editResponses.email) {
      errors.email = "Email is required.";
    }
    if (!editResponses.start_date) {
      errors.start_date = "Start date is required.";
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      setIsSaving(false);
      return;
    }

    try {
      const apiUrl = `${globalVariables.api_url}/schoolmanager/update/${editResponses.manager_id}`;

      const updatedData = {
        official_name: editResponses.official_name,
        mobile_no: editResponses.mobile_no,
        whatsapp_no: editResponses.whatsapp_no,
        email: editResponses.email,
        start_date: editResponses.start_date,
        end_date: editResponses.end_date || null,
        fk_school_id:  editResponses.fk_school_id,
      };

      const response = await axios.post(apiUrl, updatedData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.status) {
        print_toast(
          "success",
          response.data.message || "Manager updated successfully!"
        );
        setIsModalOpen(false);
        fetchManagerDetails();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to update manager."
        );
      }
    } catch (error) {
      console.error("Error updating manager:", error);
      print_toast("error", "An error occurred while updating the manager.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container">
      <Breadcum
        items={[
          { Title: "School Manager", Link: "/" },
          { Title: "School Manager Profile", Link: "" },
        ]}
        title="School Manager Profile"
      />
      {loading ? (
        <p>Loading...</p>
      ) : managerDetails ? (
        <div className="col-xl-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">School Manager Profile</h5>
            </div>
            <div className="card-body pt-3">
              <div className="tab-content pt-2">
                <div
                  className="tab-pane fade show active profile-overview"
                  id="overview"
                >
                  <div className="row mb-2">
                    <div className="col-lg-3 col-md-4 text-muted">
                      Manager Name
                    </div>
                    <div className="col-lg-9 col-md-8 ">
                      {managerDetails.official_name || "N/A"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-lg-3 col-md-4 text-muted">Email</div>
                    <div className="col-lg-9 col-md-8 ">
                      {managerDetails.email || "N/A"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-lg-3 col-md-4 text-muted">Phone</div>
                    <div className="col-lg-9 col-md-8 ">
                      {managerDetails.mobile_no || "N/A"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-lg-3 col-md-4 text-muted">WhatsApp</div>
                    <div className="col-lg-9 col-md-8 ">
                      {managerDetails.whatsapp_no || "N/A"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-lg-3 col-md-4 text-muted">
                      Start Date
                    </div>
                    <div className="col-lg-9 col-md-8 ">
                      {convertDateFormat(managerDetails.start_date) || "N/A"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-lg-3 col-md-4 text-muted">End Date</div>
                    <div className="col-lg-9 col-md-8 ">
                      {convertDateFormat(managerDetails.end_date) || "N/A"}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-lg-3 col-md-4 text-muted">Remarks</div>
                    <div className="col-lg-9 col-md-8 ">
                      {managerDetails.remarks || "N/A"}
                    </div>
                  </div>

                  <div className="text-start">
                    <button
                      className="btn btn-primary btn-sm mt-3"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p>Manager not found</p>
      )}

      {isModalOpen && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit School Manager</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditSubmit}>
                  {/* Official Name */}
                  <div className="form-group">
                    <label>
                      Official Name<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="official_name"
                      className="form-control"
                      value={editResponses.official_name}
                      onChange={handleInputChange}
                    />
                    {editErrors.official_name && (
                      <small className="text-danger">
                        {editErrors.official_name}
                      </small>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div className="form-group">
                    <label>
                      Mobile Number<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="mobile_no"
                      className="form-control"
                      value={editResponses.mobile_no}
                      onChange={handleInputChange}
                    />
                    {editErrors.mobile_no && (
                      <small className="text-danger">
                        {editErrors.mobile_no}
                      </small>
                    )}
                  </div>

                  {/* Whatsapp Number */}
                  <div className="form-group">
                    <label>
                      Whatsapp Number<span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="whatsapp_no"
                      className="form-control"
                      value={editResponses.whatsapp_no}
                      onChange={handleInputChange}
                    />
                    {editErrors.whatsapp_no && (
                      <small className="text-danger">
                        {editErrors.whatsapp_no}
                      </small>
                    )}
                  </div>

                  {/* Start Date */}
                  <div className="form-group">
                    <label>
                      Start Date<span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      className="form-control"
                      value={editResponses.start_date}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={handleInputChange}
                    />
                    {editErrors.start_date && (
                      <small className="text-danger">
                        {editErrors.start_date}
                      </small>
                    )}
                  </div>

                  {/* End Date */}
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      className="form-control"
                      value={editResponses.end_date || ""}
                      min={editResponses.start_date || ""}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label>
                      Email<span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={editResponses.email}
                      onChange={handleInputChange}
                    />

<input
                      type="hidden"
                      name="fk_school_id"
                      className="form-control"
                      value={editResponses.fk_school_id}
                      onChange={handleInputChange}
                    />
                    {editErrors.email && (
                      <small className="text-danger">{editErrors.email}</small>
                    )}
                  </div>

                  {/* Submit & Cancel Buttons */}
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
                      onClick={handleCancel}
                      className="btn btn-danger m-1"
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

export default SchoolManagerProfile;
