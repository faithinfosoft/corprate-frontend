import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from "./Breadcum.js";
import useAuth from "../utilities/useAuth";

const LeaveDetailsView = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  
  const leave = state?.leave;
  const source = state?.source || "/leave-applications"; // Where to go back to
  
  const { username } = auth.user;
  const school_id = auth.user.user_id;
  const user_type = auth.user.user_type;

  const [remarks, setRemarks] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // If no leave data is passed, redirect back
  if (!leave) {
    navigate(source);
    return null;
  }

  const breadcum = [
    { Title: "Home", Link: "/" },
    { Title: "Leave Applications", Link: source },
    { Title: "Leave Details", Link: "" },
  ];

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleApprove = async () => {
    if (!window.confirm(`Are you sure you want to approve this leave request from ${leave.staff_name}?`)) return;
    
    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/leave/approve/${leave.leave_id}`,
        {
          approved_by: school_id,
          username: username,
          user_type: user_type === "corporate_admin" ? "school_manager" : user_type
        }
      );

      if (response.data.status) {
        print_toast("success", "Leave request approved");
        navigate(source);
      } else {
        print_toast("error", response.data.message || "Failed to approve leave request");
      }
    } catch (error) {
      console.error("Error approving leave request:", error);
      let errorMsg = "Failed to approve leave request (400 Bad Request)";
      if (error.response?.data?.messages) {
        // CodeIgniter validation errors are often an object in 'messages'
        errorMsg = Object.values(error.response.data.messages).join(", ");
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      print_toast("error", errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!remarks.trim()) {
      print_toast("error", "Remarks are required for rejection");
      return;
    }
    if (!window.confirm(`Are you sure you want to reject this leave request from ${leave.staff_name}?`)) return;

    setIsProcessing(true);
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/leave/reject/${leave.leave_id}`,
        {
          approved_by: school_id,
          username: username,
          user_type: user_type === "corporate_admin" ? "school_manager" : user_type
        }
      );

      if (response.data.status) {
        print_toast("success", "Leave request rejected");
        navigate(source);
      } else {
        print_toast("error", response.data.message || "Failed to reject leave request");
      }
    } catch (error) {
      console.error("Error rejecting leave request:", error);
      let errorMsg = "Failed to reject leave request";
      if (error.response?.data?.messages) {
        errorMsg = Object.values(error.response.data.messages).join(", ");
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      print_toast("error", errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSecureDownload = async (fileUrl, fileName) => {
    try {
      setIsProcessing(true);
      const response = await axios.get(fileUrl, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      print_toast("error", "Failed to download file securely.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateLeaveLetterAndDownload = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/leave/generate_letter/${leave.leave_id}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Leave_Letter_${leave.staff_name}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating leave letter:", error);
      print_toast("error", "Failed to generate leave letter");
    }
  };

  // Determine if the current user can approve/reject
  const canApprove = 
    ((user_type === "school_admin" && leave.school_admin_approval_status !== "Approved" && leave.school_admin_approval_status !== "Rejected") ||
    ((user_type === "school_manager" || user_type === "corporate_admin") && leave.school_admin_approval_status === "Approved" && leave.manager_approval_status !== "Approved" && leave.manager_approval_status !== "Rejected"));

  return (
    <>
      <Breadcum items={breadcum} title="Leave Application Details" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
              <h5 className="card-title text-primary m-0">Leave Application Details</h5>
              <button className="btn btn-secondary text-white btn-sm rounded-pill px-3" onClick={() => navigate(source)}>
                <i className="bi bi-arrow-left me-1"></i> Back to List
              </button>
            </div>
            <div className="card-body p-4">
              
              <div className="row">
                <div className="col-md-8">
                  {/* Employee Information Section */}
                  <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: '#f4f6fa', borderLeft: '5px solid #0d6efd' }}>
                    <div className="card-body">
                      <h6 className="text-secondary border-bottom pb-2 mb-3 fw-bold">
                        <i className="bi bi-person-badge me-2"></i>Staff Information
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6 d-flex flex-column">
                          <small className="text-muted">Staff Name</small>
                          <span className="fw-medium fs-6">{leave.staff_name}</span>
                        </div>
                        <div className="col-md-6 d-flex flex-column">
                          <small className="text-muted">Contact Number</small>
                          <span className="fw-medium fs-6">{leave.phone || "N/A"}</span>
                        </div>
                        <div className="col-md-6 d-flex flex-column">
                          <small className="text-muted">School Name</small>
                          <span className="fw-medium fs-6">{leave.school_name}{leave.location ? `, ${leave.location}` : ""}</span>
                        </div>
                        <div className="col-md-6 d-flex flex-column">
                          <small className="text-muted">School Code</small>
                          <span className="fw-medium fs-6">{leave.school_code || "N/A"}</span>
                        </div>
                        <div className="col-md-6 d-flex flex-column">
                          <small className="text-muted">Email Address</small>
                          <span className="fw-medium fs-6">{leave.email || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leave Details Section */}
                  <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: '#fff9e6', borderLeft: '5px solid #ffc107' }}>
                    <div className="card-body">
                      <h6 className="text-secondary border-bottom pb-2 mb-3 fw-bold">
                        <i className="bi bi-calendar-event me-2"></i>Leave Details
                      </h6>
                      <div className="row g-3">
                        <div className="col-md-6 d-flex flex-column">
                          <small className="text-muted">Leave Type</small>
                          <span className="fw-medium fs-6">{leave.nature_of_leave || leave.leave_type}</span>
                        </div>
                        <div className="col-md-6 d-flex flex-column">
                          <small className="text-muted">Duration</small>
                          <span className="fw-medium fs-6">{calculateDuration(leave.start_date, leave.end_date)} Days</span>
                        </div>
                        <div className="col-md-6 d-flex flex-column">
                          <small className="text-muted">Start Date</small>
                          <span className="fw-medium fs-6 text-primary">{formatDate(leave.start_date)}</span>
                        </div>
                        <div className="col-md-6 d-flex flex-column">
                          <small className="text-muted">End Date</small>
                          <span className="fw-medium fs-6 text-danger">{formatDate(leave.end_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reason Section */}
                  <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: '#fff0f0', borderLeft: '5px solid #dc3545' }}>
                    <div className="card-body">
                      <h6 className="text-secondary border-bottom pb-2 mb-3 fw-bold">
                        <i className="bi bi-chat-left-text me-2"></i>Leave Reason
                      </h6>
                      <p className="mb-0 fs-6">{leave.reason_of_leave}</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  {/* Status Section */}
                  <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: '#f0fdf4', borderLeft: '5px solid #198754' }}>
                    <div className="card-body">
                      <h6 className="text-secondary border-bottom pb-2 mb-3 fw-bold">
                        <i className="bi bi-info-circle me-2"></i>Current Status
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        <div>
                          <small className="text-muted d-block mb-1">Headmaster Approval</small>
                          <span className={`badge ${leave.school_admin_approval_status === 'Approved' ? 'bg-success' : leave.school_admin_approval_status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'} px-3 py-2 rounded-pill mb-2`}>
                            {leave.school_admin_approval_status || 'Pending'}
                          </span>
                          {leave.school_admin_remarks && (
                            <div className="text-muted small mt-1 fst-italic">
                              <i className="bi bi-chat-text me-1"></i> "{leave.school_admin_remarks}"
                            </div>
                          )}
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1">Manager Approval</small>
                          <span className={`badge ${leave.manager_approval_status === 'Approved' ? 'bg-success' : leave.manager_approval_status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'} px-3 py-2 rounded-pill mb-2`}>
                            {leave.manager_approval_status || 'Pending'}
                          </span>
                          {leave.manager_remarks && (
                            <div className="text-muted small mt-1 fst-italic">
                              <i className="bi bi-chat-text me-1"></i> "{leave.manager_remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="card border-0 mb-4 shadow-sm" style={{ backgroundColor: '#f8f9fa', borderLeft: '5px solid #6c757d' }}>
                    <div className="card-body">
                      <h6 className="text-secondary border-bottom pb-2 mb-3 fw-bold">
                        <i className="bi bi-folder2-open me-2"></i>Documents & Actions
                      </h6>
                      <div className="d-flex flex-column gap-3">
                        {leave.application_letter_document && (
                          <button
                            type="button"
                            onClick={() => handleSecureDownload(`${globalVariables.api_url}/secure_file/staff_leave_application_letter/${leave.application_letter_document}`, `Application_${leave.staff_name}.pdf`)}
                            className="btn btn-danger text-white w-100 rounded-pill d-flex align-items-center justify-content-center"
                          >
                            <i className="bi bi-file-earmark-pdf me-2 fs-5"></i> View Application PDF
                          </button>
                        )}
                        {leave.letter_file && (
                          <button
                            type="button"
                            onClick={() => handleSecureDownload(`${globalVariables.api_url}/leave/download/${leave.leave_id}`, `Leave_Letter_${leave.staff_name}.pdf`)}
                            className="btn btn-primary text-white w-100 rounded-pill d-flex align-items-center justify-content-center"
                          >
                            <i className="bi bi-download me-2 fs-5"></i> Download Leave Letter
                          </button>
                        )}
                        
                        {calculateDuration(leave.start_date, leave.end_date) > 45 && leave.leave_status === "Approved" && (
                          <button
                            className="btn btn-success text-white w-100 rounded-pill d-flex align-items-center justify-content-center"
                            onClick={handleGenerateLeaveLetterAndDownload}
                          >
                            <i className="bi bi-printer me-2 fs-5"></i> Generate Leave Letter
                          </button>
                        )}

                        {!leave.application_letter_document && !leave.letter_file && calculateDuration(leave.start_date, leave.end_date) <= 45 && (
                          <div className="text-muted text-center small py-2">No documents available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Action Area */}
              {canApprove && (
                <div className="card border-primary mb-0 mt-2 shadow-sm">
                  <div className="card-body p-4 bg-primary bg-opacity-10">
                    <h5 className="text-primary mb-3 fw-bold"><i className="bi bi-shield-check me-2"></i>Leave Application Decision</h5>
                    <div className="row align-items-end">
                      <div className="col-md-8">
                        <label className="form-label fw-bold text-secondary">Remarks (Required for rejection)</label>
                        <textarea 
                          className="form-control" 
                          rows="3" 
                          placeholder="Add your remarks here..."
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="col-md-4">
                        <div className="d-flex flex-column gap-2 mt-3 mt-md-0">
                          <button 
                            type="button" 
                            className="btn btn-success py-2 fw-bold" 
                            onClick={handleApprove}
                            disabled={isProcessing}
                          >
                            <i className="bi bi-check-circle me-2"></i> Approve Leave
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-danger py-2 fw-bold" 
                            onClick={handleReject}
                            disabled={isProcessing || !remarks.trim()}
                          >
                            <i className="bi bi-x-circle me-2"></i> Reject Leave
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {((user_type === "school_manager" || user_type === "corporate_admin") && leave.school_admin_approval_status !== "Approved") && (
                <div className="alert alert-warning text-center fw-bold mt-4 mb-0">
                  <i className="bi bi-hourglass-split me-2"></i> Waiting for the Headmaster to approve this request...
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaveDetailsView;
