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
const LeaveApplications = () => {
  const auth = useAuth();
  const { username } = auth.user;
  const school_id = auth.user.user_id;
  const user_type = auth.user.user_type;
  const navigate = useNavigate();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "Pending Leave Applications", Link: "" },
  ]);


  

  const fetchPendingLeaveRequests = async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/leave/pending_requests`,
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
        let requests = response.data.data;
        // Workflow Rule: Corporate Manager should only see requests approved by Headmaster
        if (user_type === "corporate_admin" || user_type === "school_manager") {
          requests = requests.filter(req => req.school_admin_approval_status === "Approved");
        }
        setLeaveRequests(requests);
      }
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching pending leave requests:", error);
     // print_toast("error", "Failed to fetch pending leave requests");
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchPendingLeaveRequests();
  }, []);

  const handleMoreInfo = (leave) => {
    navigate('/leave-details', { 
      state: { 
        leave: leave,
        source: '/leave-applications'
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
          user_type:user_type
        }
      );

      if (response.data.status) {
        print_toast("success", "Leave request approved");
        setLeaveRequests((prevRequests) =>
          prevRequests.map((leave) =>
            leave.leave_id === selectedLeave.leave_id
              ? { ...leave, leave_status: "Approved" }
              : leave
          )
        );
        setSelectedLeave((prev) => ({ ...prev, leave_status: "Approved" }));
        setShowApproveConfirm(false);
        closeModal();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to approve leave request"
        );
      }
    } catch (error) {
      console.error("Error approving leave request:", error);
      print_toast("error", "Failed to approve leave request");
    }
  };

  const handleRejectConfirm = () => {
    setShowRejectConfirm(true);
  };
  const handleApproveConfirm = () => {
    setShowApproveConfirm(true);
  };
  const closeApproveConfirm = () => {
    setShowApproveConfirm(false);
  };
  const closeRejectConfirm = () => {
    setShowRejectConfirm(false);
  };

  const handleReject = async () => {
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/leave/reject/${selectedLeave.leave_id}`,
        {
          approved_by: school_id,
          username: username,
          user_type:user_type
        }
      );

      if (response.data.status) {
        print_toast("success", "Leave request rejected");
        setLeaveRequests((prevRequests) =>
          prevRequests.filter(
            (leave) => leave.leave_id !== selectedLeave.leave_id
          )
        );
        setShowRejectConfirm(false);
        closeModal();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to reject leave request"
        );
      }
    } catch (error) {
      console.error("Error rejecting leave request:", error);
      print_toast("error", "Failed to reject leave request");
    }
  };

  const handleGenerateLeaveLetterAndDownload = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/leave/generate_letter/${selectedLeave.leave_id}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Leave_Letter_${selectedLeave.staff_name}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      //print_toast("success", "Leave letter generated successfully");
    } catch (error) {
      console.error("Error generating leave letter:", error);
      print_toast("error", "Failed to generate leave letter");
    }
  };
  // useEffect(() => {
  //   if (selectedLeave) {
  //     handleGenerateLeaveLetterAndDownload();
  //   }
  // }, [selectedLeave]);

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const formatDate = (dateString) => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleVacancy = () => {
    // Navigate to the vacancy page and pass leave details as state
    navigate('/vacancy', { 
      state: { 
        leaveDetails: selectedLeave 
      } 
    });
  };

  const closeVacancyModal = () => {
    setShowVacancyModal(false);
  };

  const handleSubmitVacancy = async (e) => {
    e.preventDefault();
    try {
      // Implement vacancy submission logic
      const response = await axios.post(
        `${globalVariables.api_url}/leave/manage_vacancy`,
        {
          leave_id: selectedLeave.leave_id,
          staff_name: selectedLeave.staff_name,
          start_date: selectedLeave.start_date,
          end_date: selectedLeave.end_date,
          submitted_by: username
        }
      );

      if (response.data.status) {
        print_toast("success", "Vacancy management initiated successfully");
        closeVacancyModal();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to manage vacancy"
        );
      }
    } catch (error) {
      console.error("Error managing vacancy:", error);
      print_toast("error", "Failed to manage vacancy");
    }
  };

  return (
    <>
      <Breadcum items={breadcum} title="Pending Leave Applications" />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Staff Pending Leave Applications</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">
                        Sl No.
                      </th>
                      {user_type === 'corporate_admin' && (
          <>
            <th scope="col" className="text-center">
              School Code
            </th>
            <th scope="col" className="text-center">
              School Name
            </th>
          </>
        )}
                      <th scope="col" className="text-center">
                        Staff Name
                      </th>
                      <th scope="col" className="text-center">
                        Start Date
                      </th>
                      <th scope="col" className="text-center">
                        End Date
                      </th>
                      <th scope="col" className="text-center">
                      Leave Application
                      </th>

                      <th scope="col" className="text-center">
                        Status
                      </th>
                      <th scope="col" className="text-center">
                        Actions
                      </th>
                    </tr>



                  </thead>
                  <tbody>
                    {loaded && leaveRequests.length === 0 ? (
                      <tr>
                        <td colSpan="8">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      leaveRequests.map((leave, index) => (
                        <tr key={leave.leave_id}>

                          <td className="text-center">{index + 1}</td>
                          {user_type === 'corporate_admin' && (
          <>
            <td className="text-center">{leave.school_code}</td>
            <td className="text-center">{leave.school_name},{leave.location}</td>
          </>
        )}
                          <td className="text-center">{leave.staff_name}</td>
                          <td className="text-center">
                            {convertDateFormat(leave.start_date)}
                          </td>
                          <td className="text-center">
                            {convertDateFormat(leave.end_date)}
                          </td>
                          <td className="text-center"> <a
            href={`${globalVariables.img_url}/uploads/staff_leave_application_letter/${leave.application_letter_document}`}
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
                          <td className="text-center">{leave.leave_status}</td>
   
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
                                    onClick={() => handleMoreInfo(leave)}
                                  >
                                    View Details
                                  </button>
                                </li>




                                {calculateDuration(leave.start_date, leave.end_date) > 45 && leave.leave_status === "Approved" && (
                                  <>
                                   <li>
  <button
    className="dropdown-item"
    onClick={() => {
      setSelectedLeave(leave); // Update state first
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
              setSelectedLeave(leave);
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

    </>
  );
};

export default LeaveApplications;