import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';

import pdf from "../../assets/ui-master/img/pdf.jpg";
import SecureLink from '../SecureLink';
const CandidateBasicinfo = () => {
  const { candidate_id } = useParams();
  const [loaded, setLoaded] = useState(false);
  const [formError, setFormError] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [actionStatus, setActionStatus] = useState(''); // To keep track of the action status
  const navigate = useNavigate();
  const [candidateData, setCandidateData] = useState({});
  const location = useLocation();

  const fetchCandidateBasicinfo = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/candidateManagement/get-candidate-by-id`, {
        params: { candidate_id },
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.status) {
        setCandidateData(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchCandidateBasicinfo();
  }, [candidate_id]);

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
        'candidate_id': candidateData.candidate_id,
        'status': status,
        'reason': reason // Include the reason for reject/block
      };

      const response = await axios.post(`${globalVariables.api_url}/candidateManagement/Update-candidate-status`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });


      if (response.data.status) {
        print_toast("success", response.data.message);
        navigate('/CandidateManagement');
        await fetchCandidateBasicinfo();
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
    if (status === 'Rejected' || status === 'Blocked') {
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



<ul class="list-group">
<li class="list-group-item list-group-item-warning">
    <div className="row m-2">
    <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Official Name</div>
    <div className="col-lg-9 col-md-8 customdata">{candidateData.applicant_name}</div>
   
   

    </div>
    </li>
    <li class="list-group-item list-group-item-warning">
    <div className="row m-2">
      <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Address</div>
      <div className="col-lg-9 col-md-8 customdata">{candidateData.address}</div>
    </div>
    </li>
    <li class="list-group-item list-group-item-warning">
    <div className="row m-2">
      <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Gender</div>
      <div className="col-lg-9 col-md-8 customdata">
        {candidateData.gender ? (candidateData.gender.charAt(0).toUpperCase() + candidateData.gender.slice(1)) : (candidateData.candidate_type === 'sister' ? 'Female' : candidateData.candidate_type === 'priest' ? 'Male' : '-')}
      </div>
    </div>
    </li>
    <li class="list-group-item list-group-item-warning">
    <div className="row m-2">
      <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Date of Birth</div>
      <div className="col-lg-9 col-md-8 customdata">{formatDate(candidateData.dob)}</div>
    </div>
    </li>
    <li class="list-group-item list-group-item-warning">
    <div className="row m-2">
      <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Marital Status</div>
      <div className="col-lg-9 col-md-8 customdata">{candidateData.marital_status}</div>
    </div>
    </li>
    <li class="list-group-item list-group-item-warning">
    <div className="row m-2">
      <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Contact Number</div>
      <div className="col-lg-9 col-md-8 customdata">{candidateData.phone_no}</div>
    </div>
    </li>
    <li class="list-group-item list-group-item-warning">
    <div className="row m-2">
      <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Whatsapp Number</div>
      <div className="col-lg-9 col-md-8 customdata">{candidateData.whatappno}</div>
    </div>
    </li>
    <li class="list-group-item list-group-item-warning">
    <div className="row m-2">
      <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Email ID</div>
      <div className="col-lg-9 col-md-8 customdata">{candidateData.email}</div>
    </div>
    </li>


    <li class="list-group-item list-group-item-warning">
    <div className="row m-2">
      <div className="col-lg-3 col-md-4 label customLabel" style={{ fontWeight: 'bold' }}>Priest Document</div>
      <div className="col-lg-9 col-md-8 customdata">

      {candidateData.priest_letter && candidateData.priest_letter !== '' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <SecureLink href={candidateData.priest_letter} title="View Priest Document">
            <img 
              src={pdf} 
              alt="Link to PDF Document" 
              className="pdf-thumbnail"
              style={{
                width: '50px',
                height: '70px',
                display: 'block',
                cursor: 'pointer'
              }} 
            />
          </SecureLink>
          <SecureLink 
            href={candidateData.priest_letter} 
            className="btn btn-primary d-inline-flex align-items-center px-3 py-1 shadow-sm"
            style={{ borderRadius: '20px', fontWeight: '500' }}
            title="View / Download Priest Document"
          >
            <i className="fas fa-eye me-2"></i> View
          </SecureLink>
        </div>
      ) : null}

      </div>
    </div>
    </li>

 
    
    </ul>
    </div>
    </div>
            <div className='card-footer col-md-12'>
              {candidateData.status === "requested" && (
                <>
                  <button type="button" className="btn btn-success m-1" onClick={() => handleActionClick('Approved')}>Approve</button>
                  <button type="button" className="btn btn-warning m-1" onClick={() => handleActionClick('Rejected')}>Reject</button>
                  <button type="button" className="btn btn-danger m-1" onClick={() => handleActionClick('Blocked')}>Block</button>
                </>
              )}
              {candidateData.status === "Approved" && (
                   <>
                <button type="button" className="btn btn-warning" onClick={() => handleActionClick('Rejected')}>Reject</button>
                <button type="button" className="btn btn-danger m-1" onClick={() => handleActionClick('Blocked')}>Block</button>
                </>
              )}
              {candidateData.status === "Rejected" && (
                      <>
          <button type="button" className="btn btn-success m-1" onClick={() => handleActionClick('Approved')}>Approve</button>
          <button type="button" className="btn btn-danger m-1" onClick={() => handleActionClick('Blocked')}>Block</button>
          </>
              )}


{candidateData.status === "Blocked" && (
                      <>
          <button type="button" className="btn btn-success m-1" onClick={() => handleActionClick('Approved')}>Approve</button>
          <button type="button" className="btn btn-warning" onClick={() => handleActionClick('Rejected')}>Reject</button>
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

export default CandidateBasicinfo;
