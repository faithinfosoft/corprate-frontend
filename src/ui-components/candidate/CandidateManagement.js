import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import Breadcum from '../Breadcum.js';
import DataTable from "react-data-table-component";
import { useParams, useNavigate, Link } from 'react-router-dom';
const CandidateManagement = () => {
  const [loaded, setLoaded] = useState(false);
  const [candidateData, setCandidateData] = useState([]);
  const [search, setSearch] = useState('');
  const dataTableRef = useRef(null);
  const [status, setStatus] = useState('requested'); // Status of candidates
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Candidate Management', Link: '' },
  ]);

  // Fetch candidates based on status
  const fetchCandidates = async (status) => {
    try {
      // Clear the previous data before fetching new data
      setCandidateData([]);

      const response = await axios.get(`${globalVariables.api_url}/candidateManagement/get-candidate-status-based`, {
        params: { status: status },  // Fetch data based on status
      });
      if (response.data.status) {
        setCandidateData(response.data.data);
      } else {
        // handle error if needed
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching candidates:', error.message);
    }
  };

  // Fetch new data whenever status changes
  useEffect(() => {
    fetchCandidates(status); // Fetch data on status change
  }, [status]);

  const handleDeleteCandidate = async (candidate) => {
    const candidateName = candidate.applicant_name || 'this candidate';
    const isConfirmed = window.confirm(`Are you sure you want to delete ${candidateName}? This will permanently remove their registration and login account.`);
    if (!isConfirmed) return;

    try {
      const formData = new FormData();
      formData.append('candidate_id', candidate.candidate_id);

      const response = await axios.post(
        `${globalVariables.api_url}/candidateManagement/delete_candidate`,
        formData
      );

      if (response.data.status) {
        print_toast('success', response.data.message || 'Candidate deleted successfully.');
        fetchCandidates(status);
      } else {
        print_toast('error', response.data.message || 'Failed to delete candidate.');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      print_toast('error', error.response?.data?.message || 'Error deleting candidate.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Filter the candidate data based on the search input
  const filteredMembers = candidateData.filter((item) =>
    (item.applicant_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (item.gender?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (item.date_of_birth?.toLowerCase() || "").includes(search.toLowerCase()) ||
    (item.whatsapp_number?.toLowerCase() || "").includes(search.toLowerCase())
  );
  


  const calculateAge = (dob) => {
    if (!dob) return null; // Handle missing DOB
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    // Adjust age if the current month/day is before the birth month/day
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    return age;
  };
  
  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true
    },
    {
      name: "Name",
      selector: (row) => row.applicant_name,
      sortable: true,
       minWidth: '180px'
    },
    {
      name: "Gender",
      selector: (row) => row.gender,
      sortable: true,
      // minWidth: '200px'
    },
    {
      name: "Address",
      selector: (row) => row.address,
      sortable: true,
      minWidth: '200px'
    },

    {
      name: "Marital Status",

      selector: (row) => row.marital_status,
      sortable: true,
      minWidth: '200px'
    },
    {
      name: "Date Of Birth",
      selector: (row) => formatDate(row.dob),
      sortable: true,
       minWidth: '150px'
    },


    {
      name: "Age",
      selector: (row) => calculateAge(row.dob), // Calculate age
      sortable: true,
      minWidth: '150px',
    },
    
    {
      name: "Contact Number",
      selector: (row) => row.phone_no,
      sortable: true,
      minWidth: '150px'
    },
    {
      name: "Whatsapp Number",
      selector: (row) => row.whatappno,
      sortable: true,
      minWidth: '150px'
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      minWidth: '280px'
    },

    {
      name: "Candidate Type",
      selector: (row) => row.candidate_type,
      sortable: true,
      minWidth: '200px'
    },

    {
      name: "Corporate/Arabic",
      selector: (row) => row.corporate_arabic,
      sortable: true,
      minWidth: '200px'
    },

    
    
    {
        name: "Actions",
        cell: (row) => (
          <div className="d-flex align-items-center">
            <Link
              to={`/CandidateBasicinfo/${row.candidate_id}?status=${status}`}
              className="btn btn-primary btn-sm m-1 text-white"
            >
              Details
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm m-1 text-white"
              onClick={() => handleDeleteCandidate(row)}
              title="Delete Candidate"
            >
              Delete
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        minWidth: '160px',
      }
  ];

  return (
    <>
      <Breadcum items={breadcum} title="Candidate Management" />

      <div className="col-md-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Candidate Management</h5>
            <Link to="/approved-candidates-list" className="btn btn-outline-primary btn-sm">
              <i className="bi bi-person-check me-1"></i> Approved Candidates List
            </Link>
          </div>
          <div className="card-body pt-3">

            {/* Navigation Tabs */}
           <ul className="nav nav-tabs nav-tabs-bordered">
  <li className="nav-item" style={{ fontWeight: 'bold' }}>
    <button
      className={`nav-link ${status === 'requested' ? 'active' : ''}`}
      onClick={() => setStatus('requested')}>
      New
    </button>
  </li>

  <li className="nav-item" style={{ fontWeight: 'bold' }}>
    <button
      className={`nav-link ${status === 'Approved' ? 'active' : ''}`}
      onClick={() => setStatus('Approved')}>
      Approved
    </button>
  </li>

  <li className="nav-item" style={{ fontWeight: 'bold' }}>
    <button
      className={`nav-link ${status === 'Rejected' ? 'active' : ''}`}
      onClick={() => setStatus('Rejected')}>
      Rejected
    </button>
  </li>

  <li className="nav-item" style={{ fontWeight: 'bold' }}>
    <button
      className={`nav-link ${status === 'Blocked' ? 'active' : ''}`}
      onClick={() => setStatus('Blocked')}>
      Blocked
    </button>
  </li>
</ul>



            {/* Data Table */}
            <div className="tab-content pt-2">
              <div className="tab-pane fade show active">
                <div className="table-container">
                <DataTable
  className="custom-data-table"
  columns={columns}
  data={filteredMembers}
  pagination
  highlightOnHover
  pointerOnHover
  ref={dataTableRef}
  noDataComponent="No data available"
  subHeader
  subHeaderComponent={
    <div className="custom-search-container">
      <input
        type="text"
        className="custom-search-input form-control"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    
    </div>
  }
  subHeaderAlign="right"
/>

                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default CandidateManagement;
