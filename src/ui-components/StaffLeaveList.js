import React, { useState, useEffect } from "react";
import axios from "axios";
import NoDataFound from "./NoDataFound";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from "./Breadcum.js";
import Modal from "react-bootstrap/Modal";
import DataTable from "react-data-table-component";
import Select from 'react-select';
import useAuth from "../utilities/useAuth";
import { convertDateFormat } from "../utilities/dateconverter";
import pdf from "../assets/ui-master/img/pdf.jpg";
import { useNavigate } from "react-router-dom";
const StaffLeaveList = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { username } = auth.user;
  const school_id = auth.user.user_id;
  const user_type = auth.user.user_type;
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [remarks, setRemarks] = useState("");
  const breadcum = [
    { Title: "Home", Link: "/" },
    { Title: "Staff Leave Details", Link: "" },
  ];

  useEffect(() => {
    fetchSchools();
  
  }, []);


  const fetchApprovedLeaveRequests = async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/leave/pending_requests`,
        {
          params: {
            school_id: school_id,
            username: username,
            user_type:user_type,
            status:'Approved'
          },
        }
      );
      if (response.data.status) {
        setLeaveRequests(response.data.data);
      } 
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching pending leave requests:", error);
     // print_toast("error", "Failed to fetch pending leave requests");
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchApprovedLeaveRequests();
  }, []);


  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/schools`);
      if (response.data.status) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching schools:", error.message);
      print_toast("error", "Failed to fetch school data");
    }
  };



  const handleSchoolChange = (selectedOption) => {
    setSelectedSchool(selectedOption ? selectedOption.value : "");
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredLeaveRequests = leaveRequests.filter((request) => {
    const matchesSchool = !selectedSchool || request.fk_staff_school_id === selectedSchool;
    const matchesSearch = request.staff_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSchool && matchesSearch;
  });

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleMoreInfo = (leave) => {
    navigate('/leave-details', { 
      state: { 
        leave: leave,
        source: '/staff-leave-list'
      }
    });
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedLeave(null);
  };

  const handleApprove = async () => {
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/leave/approve/${selectedLeave.leave_id}`,
        {
          approved_by: school_id,
          username: username,
          user_type: user_type,
          remarks: remarks
        }
      );

      if (response.data.status) {
        print_toast("success", "Leave request approved");
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.leave_id === selectedLeave.leave_id
              ? { ...leave, manager_approval_status: "Approved" }
              : leave
          )
        );
        setSelectedLeave((prev) => ({ ...prev, manager_approval_status: "Approved" }));
        setShowApproveConfirm(false);
        closeModal();
      } else {
        print_toast("error", response.data.message || "Failed to approve leave request");
      }
    } catch (error) {
      console.error("Error approving leave request:", error);
      print_toast("error", "Failed to approve leave request");
    }
  };

  const handleReject = async () => {
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/leave/reject/${selectedLeave.leave_id}`,
        {
          approved_by: school_id,
          username: username,
          user_type: user_type,
          remarks: remarks
        }
      );

      if (response.data.status) {
        print_toast("success", "Leave request rejected");
        setLeaveRequests((prevRequests) =>
          prevRequests.filter((leave) => leave.leave_id !== selectedLeave.leave_id)
        );
        setShowRejectConfirm(false);
        closeModal();
      } else {
        print_toast("error", response.data.message || "Failed to reject leave request");
      }
    } catch (error) {
      console.error("Error rejecting leave request:", error);
      print_toast("error", "Failed to reject leave request");
    }
  };

  const handleRejectConfirm = () => { setRemarks(""); setShowRejectConfirm(true); };
  const handleApproveConfirm = () => { setRemarks(""); setShowApproveConfirm(true); };
  const closeApproveConfirm = () => setShowApproveConfirm(false);
  const closeRejectConfirm = () => setShowRejectConfirm(false);

  const formatDate = (dateString) => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };
  const columns = [
    { 
      name: "Sl No.", 
      selector: (row, index) => index + 1, 
      sortable: true, 
      width: "80px" 
    },
    { 
      name: "Staff Name", 
      selector: (row) => row.staff_name, 
      sortable: true, 
      minWidth: "160px" 
    },
    { 
      name: "School Name", 
      selector: (row) => `${row.location} ${row.school_name}`, 
      sortable: true, 
      minWidth: "250px" 
    },
    { 
      name: "Leave Type", 
      selector: (row) => row.leave_type, 
      sortable: true, 
      minWidth: "140px" 
    },
    { 
      name: "Status", 
      selector: (row) => row.leave_status, 
      sortable: true, 
      minWidth: "150px",
      cell: (row) => (
        <div className="d-flex flex-column gap-1">
          <span className={`badge ${row.school_admin_approval_status === 'Approved' ? 'bg-success' : row.school_admin_approval_status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'} w-100 rounded-pill py-1`} style={{fontSize: "10px"}}>
            HM: {row.school_admin_approval_status || 'Pending'}
          </span>
          <span className={`badge ${row.manager_approval_status === 'Approved' ? 'bg-success' : row.manager_approval_status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'} w-100 rounded-pill py-1`} style={{fontSize: "10px"}}>
            Manager: {row.manager_approval_status || 'Pending'}
          </span>
        </div>
      )
    },
    {
      name: "Actions",
      cell: (row, index) => (
        <button 
          className="btn btn-outline-primary btn-sm rounded-pill px-3" 
          onClick={() => handleMoreInfo(row)}
        >
          <i className="bi bi-eye me-1"></i> View Details
        </button>
      ),
      minWidth: "140px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    }
  ];


  const schoolOptions = schools.map((school) => ({
    value: school.school_id,
    label: `${school.location} ${school.school_name}`
  }));

  return (
    <>
      <Breadcum items={breadcum} title="Staff Leave Details" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Staff Leave Details</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                <Select 
                  id="fk_school_id"
                  name="fk_school_id"
                  options={[{ value: "", label: "All Schools" }, ...schoolOptions]}
                  value={schoolOptions.find(option => option.value === selectedSchool)}
                  onChange={handleSchoolChange}
                  isSearchable
                  placeholder="Select School"
                  classNamePrefix="react-select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      width: "500px",
                    }),
                  }}
                />

                <input
                  type="text"
                  className="form-control w-25"
                  placeholder="Search by Staff Name"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
       
              <div className="table-container">
                {loading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : filteredLeaveRequests.length > 0 ? (
                    <DataTable
                 
                    columns={columns}
                     className="custom-data-table"
                    data={filteredLeaveRequests}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    responsive
                    striped
           
                  />
                ) : (
                  <NoDataFound message="No leave requests found." />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* Modals inserted below */}
      <Modal show={modalIsOpen} onHide={closeModal} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-primary">Leave Application Review</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white">
          {selectedLeave && (
            <div className="container-fluid">
              {/* Employee Information Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-secondary border-bottom pb-2">Staff Information</h6>
                  <div className="row g-3">
                    <div className="col-md-6 d-flex flex-column">
                      <small className="text-muted">Staff Name</small>
                      <span className="fw-medium">{selectedLeave.staff_name}</span>
                    </div>
                    <div className="col-md-6 d-flex flex-column">
                      <small className="text-muted">Contact Number</small>
                      <span className="fw-medium">{selectedLeave.phone}</span>
                    </div>
                    <div className="col-md-6 d-flex flex-column">
                      <small className="text-muted">School Name</small>
                      <span className="fw-medium">{selectedLeave.school_name}, {selectedLeave.location}</span>
                    </div>
                    <div className="col-md-6 d-flex flex-column">
                      <small className="text-muted">School Code</small>
                      <span className="fw-medium">{selectedLeave.school_code}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Leave Details Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-secondary border-bottom pb-2">Leave Details</h6>
                  <div className="row g-3">
                    <div className="col-md-6 d-flex flex-column">
                      <small className="text-muted">Leave Type</small>
                      <span className="fw-medium">{selectedLeave.nature_of_leave}</span>
                    </div>
                    <div className="col-md-6 d-flex flex-column">
                      <small className="text-muted">Duration</small>
                      <span className="fw-medium">{calculateDuration(selectedLeave.start_date, selectedLeave.end_date)} Days</span>
                    </div>
                    <div className="col-md-6 d-flex flex-column">
                      <small className="text-muted">Start Date</small>
                      <span className="fw-medium">{formatDate(selectedLeave.start_date)}</span>
                    </div>
                    <div className="col-md-6 d-flex flex-column">
                      <small className="text-muted">End Date</small>
                      <span className="fw-medium">{formatDate(selectedLeave.end_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Reason Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-secondary border-bottom pb-2">Leave Reason</h6>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0">{selectedLeave.reason_of_leave}</p>
                  </div>
                </div>
              </div>
              {/* Supporting Documents Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-secondary border-bottom pb-2">Documents & Actions</h6>
                  <div className="d-flex flex-wrap gap-3 mt-3">
                    {selectedLeave.application_letter_document && (
                      <a
                        href={`${globalVariables.img_url}/uploads/staff_leave_application_letter/${selectedLeave.application_letter_document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-danger btn-sm rounded-pill px-3 py-2 d-flex align-items-center"
                      >
                        <i className="bi bi-file-earmark-pdf me-2 fs-5"></i> View Original Application
                      </a>
                    )}
                    {selectedLeave.letter_file && (
                      <a
                        href={`${globalVariables.img_url}/uploads/leave_letter/${selectedLeave.letter_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 d-flex align-items-center"
                      >
                        <i className="bi bi-download me-2 fs-5"></i> Download Leave Letter
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(user_type === "school_manager" || user_type === "corporate_admin") && selectedLeave?.manager_approval_status !== "Approved" && (
            <div className="alert alert-info text-center fw-bold mt-3">
              This request requires your approval to complete the process.
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <div className="d-flex justify-content-end gap-2">
            {(user_type === "school_manager" || user_type === "corporate_admin") && selectedLeave?.manager_approval_status !== "Approved" && (
              <>
                <button type="button" className="btn btn-success px-4" onClick={handleApproveConfirm}>Approve Leave</button>
                <button type="button" className="btn btn-danger px-4" onClick={handleRejectConfirm}>Reject Leave</button>
              </>
            )}
            <button type="button" className="btn btn-outline-secondary px-4" onClick={closeModal}>Close</button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Approve Confirm Modal */}
      <Modal show={showApproveConfirm} onHide={closeApproveConfirm} size="md" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-success">Confirm Approval</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white text-center">
          <i className="bi bi-check-circle text-success fs-1 mb-3"></i>
          <p className="mb-3">Are you sure you want to approve this leave request from <strong>{selectedLeave?.staff_name}</strong>?</p>
          <div className="text-start">
            <label className="form-label fw-bold text-secondary">Remarks (Optional)</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Add any remarks for this approval..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            ></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light justify-content-center">
          <button type="button" className="btn btn-success px-4" onClick={handleApprove}>Confirm Approval</button>
          <button type="button" className="btn btn-outline-secondary px-4" onClick={closeApproveConfirm}>Cancel</button>
        </Modal.Footer>
      </Modal>

      {/* Reject Confirm Modal */}
      <Modal show={showRejectConfirm} onHide={closeRejectConfirm} size="md" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="text-danger">Confirm Rejection</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white text-center">
          <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
          <p className="mb-3">Are you sure you want to reject this leave request from <strong>{selectedLeave?.staff_name}</strong>?</p>
          <div className="text-start">
            <label className="form-label fw-bold text-secondary">Remarks (Required for Rejection)</label>
            <textarea 
              className="form-control" 
              rows="3" 
              placeholder="Please provide a reason for rejecting this leave..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            ></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light justify-content-center">
          <button type="button" className="btn btn-danger px-4" onClick={handleReject} disabled={!remarks.trim()}>Confirm Rejection</button>
          <button type="button" className="btn btn-outline-secondary px-4" onClick={closeRejectConfirm}>Cancel</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StaffLeaveList;