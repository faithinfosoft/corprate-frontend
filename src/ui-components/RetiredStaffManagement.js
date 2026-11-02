import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import DataTable from "react-data-table-component";
import { useParams, useNavigate, Link } from 'react-router-dom';
import { convertDateFormat } from "../utilities/dateconverter";
const RetiredStaffManagement = () => {
  const [loaded, setLoaded] = useState(false);
  const [retiredData, setRetiredData] = useState([]);
  const [search, setSearch] = useState('');
  const dataTableRef = useRef(null);
  const [status, setStatus] = useState('pending'); // Status of candidates
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Retired Staff Management', Link: '' },
  ]);

  // Fetch candidates based on status
  const fetchStaffs = async (status) => {
    try {
      // Clear the previous data before fetching new data
      setRetiredData([]);

      const response = await axios.get(`${globalVariables.api_url}/retiredstaff/get-retired-status-based`, {
        params: { approval_status: status },  // Fetch data based on status
      });
     if (response.data.status) {
  const result = response.data.data;
  // Ensure retiredData is always an array
  setRetiredData(Array.isArray(result) ? result : [result]);
} else {
        // handle error if needed
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching staffs:', error.message);
    }
  };

  // Fetch new data whenever status changes
  useEffect(() => {
    fetchStaffs(status); // Fetch data on status change
  }, [status]);


  // Filter the candidate data based on the search input
  const filteredMembers = retiredData.filter((item) =>
    (item.staff_official_name?.toLowerCase() || "").includes(search.toLowerCase()));
  


  
  const columns = [
  {
    name: "Sl No.",
    selector: (row, index) => index + 1,
    sortable: true,
    width: '90px'
  },
  {
    name: "Official Name",
    selector: (row) => row.staff_official_name,
    sortable: true,
    minWidth: '180px'
  },
  {
    name: "Date of Birth",
    selector: (row) => row.dob,
    sortable: true,
    minWidth: '120px',
    cell: (row) => convertDateFormat(row.dob)
  },
  {
    name: "Gender",
    selector: (row) => row.gender,
    sortable: true,
    width: '100px'
  },
  {
    name: "Contact No.",
    selector: (row) => row.phone_no1,
    sortable: true,
    minWidth: '150px'
  },
  {
    name: "Email",
    selector: (row) => row.email,
    sortable: true,
    minWidth: '250px'
  },

  {
    name: "Date of Retirement",
    selector: (row) => row.retirement_date,
    sortable: true,
    minWidth: '180px',
    cell: (row) =>convertDateFormat(row.retirement_date)
  },
  {
    name: "Actions",
    cell: (row) => (
      <div>
        <Link
          to={`/retired-staff-info/${row.staff_id}?status=${status}`}
          className="btn btn-primary m-1 text-white"
        >
          Details
        </Link>
      </div>
    ),
    ignoreRowClick: true,
    allowOverflow: true,
    button: true,
    width: '120px'
  }
];

  return (
    <>
      <Breadcum items={breadcum} title="Retired Staff Management" />

      <div className="col-md-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title">Retired Staff Management</h5>
          </div>
          <div className="card-body pt-3">

            {/* Navigation Tabs */}
           <ul className="nav nav-tabs nav-tabs-bordered">
  <li className="nav-item" style={{ fontWeight: 'bold' }}>
    <button
      className={`nav-link ${status === 'pending' ? 'active' : ''}`}
      onClick={() => setStatus('pending')}>
      New
    </button>
  </li>

  <li className="nav-item" style={{ fontWeight: 'bold' }}>
    <button
      className={`nav-link ${status === 'approved' ? 'active' : ''}`}
      onClick={() => setStatus('approved')}>
      Approved
    </button>
  </li>

  <li className="nav-item" style={{ fontWeight: 'bold' }}>
    <button
      className={`nav-link ${status === 'rejected' ? 'active' : ''}`}
      onClick={() => setStatus('rejected')}>
      Rejected
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

export default RetiredStaffManagement;
