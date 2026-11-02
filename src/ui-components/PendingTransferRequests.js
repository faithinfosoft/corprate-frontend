import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import NoDataFound from "./NoDataFound";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from "./Breadcum";
import useAuth from "../utilities/useAuth";
import { convertDateFormat } from "../utilities/dateconverter";
import { useNavigate } from "react-router-dom";
import pdf from "../assets/ui-master/img/pdf.jpg";
const PendingTransferRequests = () => {
  const auth = useAuth();
  const { username } = auth.user;
  const school_id = auth.user.user_id;
  const user_type = auth.user.user_type;
  const navigate = useNavigate();

  const [transferRequests, setTransferRequests] = useState([]);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "Pending Transfer Applications", Link: "" },
  ]);


  

  const fetchPendingTransferRequests = async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/staff_transfer/pending_transfer_requests`,
        {
          params: {
            school_id: school_id,
            username: username,
            user_type:user_type,
            status:'Pending'
          },
        }
      );
      if (response.data.status) {
        setTransferRequests(response.data.data);
      } 
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching pending leave requests:", error);
     // print_toast("error", "Failed to fetch pending leave requests");
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchPendingTransferRequests();
  }, []);

  const handleMoreInfo = (transfer) => {
    setSelectedTransfer(transfer);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTransfer(null);
  };

  const handleApprove = async () => {
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/staff_transfer/approve/${selectedTransfer.transfer_application_id}`,
        {
          approved_by: school_id,
          username: username,
          user_type:user_type
        }
      );

      if (response.data.status) {
        print_toast("success", "Transfer request approved");
        setTransferRequests((prevRequests) =>
          prevRequests.map((transfer) =>
            transfer.transfer_application_id === selectedTransfer.transfer_application_id
              ? { ...transfer, leave_status: "Approved" }
              : transfer
          )
        );
        setSelectedTransfer((prev) => ({ ...prev, leave_status: "Approved" }));
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to approve transfer request"
        );
      }
    } catch (error) {
      console.error("Error approving transfer request:", error);
      print_toast("error", "Failed to approve transfer request");
    }
  };

  const handleRejectConfirm = () => {
    setShowRejectConfirm(true);
  };

  const closeRejectConfirm = () => {
    setShowRejectConfirm(false);
  };

  const handleReject = async () => {
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/staff_transfer/reject/${selectedTransfer.transfer_application_id}`,
        {
          approved_by: school_id,
          username: username,
          user_type:user_type
        }
      );

      if (response.data.status) {
        print_toast("success", "Transfer request rejected");
        setTransferRequests((prevRequests) =>
          prevRequests.filter(
            (transfer) => transfer.transfer_application_id !== selectedTransfer.transfer_application_id
          )
        );
        setShowRejectConfirm(false);
        closeModal();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to reject transfer request"
        );
      }
    } catch (error) {
      console.error("Error rejecting transfer request:", error);
      print_toast("error", "Failed to reject transfer request");
    }
  };






  return (
    <>
      <Breadcum items={breadcum} title="Pending Transfer Applications" />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Staff Pending Transfer Applications</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">
                        Sl No.
                      </th>
   

<th scope="col" className="text-center">
                       Academic Year
                      </th>
                      <th scope="col" className="text-center">
                        Staff Name
                      </th>
                     
                      <th scope="col" className="text-center">
                        Prefered Schools
                      </th>
                      <th scope="col" className="text-center">
                      Transfer Application
                      </th>

                      <th scope="col" className="text-center">
                       Transfer Status
                      </th>
                      <th scope="col" className="text-center">
                        Actions
                      </th>
                    </tr>



                  </thead>
                  <tbody>
                    {loaded && transferRequests.length === 0 ? (
                      <tr>
                        <td colSpan="8">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      transferRequests.map((transfer, index) => (
                        <tr key={transfer.transfer_application_id}>

                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{transfer.academic_year}</td>
                          <td className="text-center">{transfer.staff_name}</td>
                          <td className="text-center"> <ul className="list-unstyled mb-0">
          {transfer.preferred_schools.map((school, index) => (
            <li key={index}>• {school.location} {school.school_name}</li>
          ))}
        </ul></td>
                         
                          <td className="text-center"> <a
            href={`${globalVariables.img_url}/uploads/staff_transfer_application_letter/${transfer.request_letter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-dark"
          >
            <img
        src={pdf} 
        alt="PDF"
        width="40"
        height="60"
      />
          </a></td>
                          <td className="text-center">{transfer.status}</td>
   
                          <td className="text-center">
                            <div className="dropdown">
                              <button
                                className="btn btn-dark dropdown-toggle"
                                type="button"
                                id={`dropdownMenuButton${index}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                More Info
                              </button>
                              <ul
                                className="dropdown-menu"
                                aria-labelledby={`dropdownMenuButton${index}`}
                              >
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleMoreInfo(transfer)}
                                  >
                                    View Details
                                  </button>
                                </li>




                                {transfer.leave_status === "Approved" && (
                                  <>
                                   <li>
  <button
    className="dropdown-item"
    onClick={() => {
      setSelectedTransfer(transfer); // Update state first
    }}
  >
    Generate Leave Letter
  </button>
</li>
                                    {/* {calculateDuration(
        leave.start_date,
        leave.end_date
      ) > 45 && (
        <li>
          <button
            className="dropdown-item"
            onClick={() => {
              setSelectedTransfer(leave);
              handleVacancy();
            }}
          >
            Vacancy
          </button>
        </li>
      )} */}
                                  </>
                                )}
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
      </div>

      {/* Leave Details Modal */}
      <Modal
        show={modalIsOpen}
        onHide={closeModal}
        size="lg"
        aria-labelledby="leave-detail-modal"
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title id="leave-detail-modal" className="text-primary">
            Transfer Application Review
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white">
          {selectedTransfer && (
            <div className="container-fluid">
              {/* Employee Information Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-secondary border-bottom pb-2">
                    Staff Information
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex flex-column">
                        <small className="text-muted">Staff Name</small>
                        <span className="fw-medium">
                          {selectedTransfer.staff_name}
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex flex-column">
                        <small className="text-muted">Contact Number</small>
                        <span className="fw-medium">{selectedTransfer.phone}</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex flex-column">
                        <small className="text-muted">Email Address</small>
                        <span className="fw-medium">{selectedTransfer.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Leave Details Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-secondary border-bottom pb-2">
                    Transfer Details
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="d-flex flex-column">
                        <small className="text-muted">Prefered Schools</small>
                       
                        <ul className="list-unstyled mb-0">
          {selectedTransfer.preferred_schools.map((school, index) => (
            <li key={index}>• {school.school_name}, {school.location}</li>
          ))}
        </ul>
                      
                      </div>
                    </div>
                   
                 
                  </div>
                </div>
              </div>

              {/* Reason Section */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6 className="text-secondary border-bottom pb-2">
                    Transfer Reason
                  </h6>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-0">{selectedTransfer.transfer_reason}</p>
                  </div>
                </div>
              </div>

          
            </div>
          )}

{user_type === "school_admin" && selectedTransfer?.manager_approval_status === "Pending" && (
    <div className="alert alert-warning text-center fw-bold">
     Waiting for the Manager to approve this request...
    </div>
  )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
        <div className="d-flex justify-content-end gap-2">
  {(selectedTransfer?.status !== "Approved" &&
    selectedTransfer?.manager_approval_status === "Pending" &&
    user_type === "school_manager") ||
  (user_type === "school_admin" &&
    selectedTransfer?.status !== "Approved" &&
    selectedTransfer?.manager_approval_status == "Approved") ? (
    <>
      <button
        type="button"
        className="btn btn-success px-4"
        onClick={handleApprove}
      >
        Approve Transfer
      </button>
      <button
        type="button"
        className="btn btn-danger px-4"
        onClick={handleRejectConfirm}
      >
        Reject Leave
      </button>
    </>
  ) : null}


  <button
    type="button"
    className="btn btn-outline-secondary px-4"
    onClick={closeModal}
  >
    Close
  </button>
</div>

        </Modal.Footer>
      </Modal>

      {/* Reject Confirmation Modal */}
      <Modal
        show={showRejectConfirm}
        onHide={closeRejectConfirm}
        size="md"
        centered
        aria-labelledby="reject-confirm-modal"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title id="reject-confirm-modal" className="text-danger">
            Confirm Rejection
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-white">
          <div className="text-center mb-3">
            <i className="bi bi-exclamation-triangle text-warning fs-1"></i>
          </div>
          <p className="text-center mb-0">
            Are you sure you want to reject this leave request from{" "}
            <strong>{selectedTransfer?.staff_name}</strong>?
          </p>
          <p className="text-center text-muted small">
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <div className="d-flex justify-content-center w-100 gap-2">
            
            <button
              type="button"
              className="btn btn-danger px-4"
              onClick={handleReject}
            >
              Confirm Rejection
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={closeRejectConfirm}
            >
              Cancel
            </button>
            
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PendingTransferRequests;