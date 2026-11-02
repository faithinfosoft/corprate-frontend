import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import { convertDateFormat } from "../utilities/dateconverter";
const RetiredStaffInfo = () => {
  const { staff_id } = useParams();
  const [loaded, setLoaded] = useState(false);
  const [formError, setFormError] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [actionStatus, setActionStatus] = useState(''); // To keep track of the action status
  const navigate = useNavigate();
  const [retiredData, setretiredData] = useState({});
  const location = useLocation();

  const fetchRetiredBasicinfo = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/retiredstaff/get-retired-staff-by-id`, {
        params: { staff_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setretiredData(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchRetiredBasicinfo();
  }, [staff_id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Handle Approve, Reject, and Block statuses
  const updateCandidateStatus = async (status) => {
    try {
      const formData = {
        'staff_id': retiredData.staff_id,
        'status': status,
        'reason': reason // Include the reason for reject/block
      };

      const response = await axios.post(`${globalVariables.api_url}/retiredstaff/update-staff-status`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });


      if (response.data.status) {
        print_toast("success", response.data.message);
        navigate('/retired-staff-management');
        await fetchRetiredBasicinfo();
        setShowReasonModal(false);
        setReason('');
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error updating candidate status:', error.message);
    }
  };

  // Show the reason modal for rejecting/blocking
  const handleActionClick = (status) => {
    if (status === 'Rejected') {
      setActionStatus(status); // Set the action status
      setShowReasonModal(true); // Show modal to enter reason
    } else {
      updateCandidateStatus(status); // Directly approve if it's "Approved"
    }
  };

  return (
    <>
      <div className="row">

        
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">BASIC DETAILS</h5>
            </div>
            <div className="card-body">



<div className="col-md-9">
  <ul className="list-group">
    {/* Personal Details Section */}
    <li className="list-group-item list-group-item-primary">
      <h5 className="mb-0">Personal Details</h5>
    </li>
    
    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Official Name</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.staff_official_name}</div>
      </div>
    </li>

    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Date of Birth</div>
        <div className="col-lg-9 col-md-8 customdata">{formatDate(retiredData.dob)}</div>
      </div>
    </li>

    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Gender</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.gender}</div>
      </div>
    </li>

    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Phone Number</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.phone_no1}</div>
      </div>
    </li>

    {/* <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>WhatsApp Number</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.whatsapp_no}</div>
      </div>
    </li> */}

    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Email</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.email}</div>
      </div>
    </li>
{/* 
    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Date of Joining</div>
        <div className="col-lg-9 col-md-8 customdata">{formatDate(retiredData.date_of_joining)}</div>
      </div>
    </li> */}

    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>PEN Number</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.pen_no}</div>
      </div>
    </li>

    {/* <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Marital Status</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.marital_status}</div>
      </div>
    </li> */}

    {/* <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Religion</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.religion}</div>
      </div>
    </li> */}
{/* 
    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Denomination</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.denomination}</div>
      </div>
    </li> */}

    {/* <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Subcaste</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.subcaste}</div>
      </div>
    </li> */}

    {/* Retirement Details Section */}
    <li className="list-group-item list-group-item-primary mt-3">
      <h5 className="mb-0">Retirement Details</h5>
    </li>

    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Retired From School</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.school_full_name}</div>
      </div>
    </li>

    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Designation at Retirement</div>
        <div className="col-lg-9 col-md-8 customdata">{retiredData.designation_name}</div>
      </div>
    </li>
<li className="list-group-item list-group-item-warning">
  <div className="row m-2">
    <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>
      Service Start Date (Last Designation)
    </div>
    <div className="col-lg-9 col-md-8 customdata">
      {retiredData.start_date && retiredData.start_date !== '0000-00-00' 
        ? formatDate(retiredData.start_date) 
        : 'N/A'}
    </div>
  </div>
</li>

    <li className="list-group-item list-group-item-warning">
      <div className="row m-2">
        <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Date of Retirement</div>
        <div className="col-lg-9 col-md-8 customdata">{formatDate(retiredData.retirement_date)}</div>
      </div>
    </li>

    {/* Parish Details Section */}
    <li className="list-group-item list-group-item-primary mt-3">
      <h5 className="mb-0">Parish Details</h5>
    </li>

  <li className="list-group-item list-group-item-warning">
  <div className="row m-2">
    <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Diocese</div>
    <div className="col-lg-9 col-md-8 customdata">{retiredData.diocese}</div>
  </div>
</li>

<li className="list-group-item list-group-item-warning">
  <div className="row m-2">
    <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Forane</div>
    <div className="col-lg-9 col-md-8 customdata">
      {retiredData.diocese === "Changanacherry" 
        ? retiredData.forane_name 
        : retiredData.diocese
      }
    </div>
  </div>
</li>

<li className="list-group-item list-group-item-warning">
  <div className="row m-2">
    <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Parish</div>
    <div className="col-lg-9 col-md-8 customdata">
      {retiredData.diocese === "Changanacherry" 
        ? retiredData.parish_name 
        : retiredData.diocese
      }
    </div>
  </div>
</li>

  </ul>
</div>
    </div>
            <div className='card-footer col-md-12'>
              {retiredData.approval_status === "pending" && (
                <>
                  <button type="button" className="btn btn-success m-1" onClick={() => handleActionClick('approved')}>Approve</button>
                  <button type="button" className="btn btn-warning m-1" onClick={() => handleActionClick('rejected')}>Reject</button>
            
                </>
              )}
              {retiredData.approval_status === "approved" && (
                   <>
                <button type="button" className="btn btn-warning" onClick={() => handleActionClick('rejected')}>Reject</button>
            
                </>
              )}
              {retiredData.approval_status === "rejected" && (
                      <>
          <button type="button" className="btn btn-success m-1" onClick={() => handleActionClick('approved')}>Approve</button>
         
          </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for entering rejection/block reason */}
      <Modal show={showReasonModal} onHide={() => setShowReasonModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Reason</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <textarea
            className="form-control"
            rows="4"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for this action"
          />
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={() => setShowReasonModal(false)}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={() => updateCandidateStatus(actionStatus)}>Submit</button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RetiredStaffInfo;
