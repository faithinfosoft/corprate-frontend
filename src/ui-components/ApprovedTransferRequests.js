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
const ApprovedTransferRequests = () => {
  const auth = useAuth();
  const { username } = auth.user;
  const school_id = auth.user.user_id;
  const user_type = auth.user.user_type;
  const navigate = useNavigate();

  const [transferRequests, setTransferRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showVacancyModal, setShowVacancyModal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "Approved Transfer Applications", Link: "" },
  ]);


  

  const fetchApprovedTransferRequests = async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/staff_transfer/pending_transfer_requests`,
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
    fetchApprovedTransferRequests();
  }, []);

  const handleMoreInfo = (leave) => {
    setSelectedLeave(leave);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedLeave(null);
  };





  const handleGenerateTransferLetterAndDownload = async () => {
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
        `Transfer_Letter_${selectedLeave.staff_name}.pdf`
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
  useEffect(() => {
    if (selectedLeave) {
        handleGenerateTransferLetterAndDownload();
    }
  }, [selectedLeave]);

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

 



  return (
    <>
      <Breadcum items={breadcum} title="Approved Transfer Applications" />

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Approved Staff Leave Applications</h5>
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

export default ApprovedTransferRequests;