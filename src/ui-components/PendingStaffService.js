import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Breadcum from './Breadcum';
import useAuth from '../utilities/useAuth';
import globalVariables from "../Global.js";
import { useNavigate } from 'react-router-dom';
import { capitalizeWords } from '../utilities/dateconverter';
const PendingStaffService = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const username = auth.user.username;
  const userType = auth.user.user_type;
    const dataTableRef = useRef(null);
  const [pendingServices, setPendingServices] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Add this handler to track page changes
    const handlePageChange = page => {
      setCurrentPage(page);
    };
    
    // Add this handler to track rows per page changes
    const handlePerRowsChange = (newRowsPerPage, page) => {
      setRowsPerPage(newRowsPerPage);
    };
  useEffect(() => {
    fetchPendingServices();
  }, []);

  const fetchPendingServices = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/pending-services`, {
        params: {
          username: username,
          user_type: userType
        }
      });
      
      if (response.data.status) {
        setPendingServices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pending services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffClick = (staffId) => {
    // Navigate to staff details with encrypted staff ID
    const encryptedStaffId = staffId; // staffId is already encrypted from the backend
    navigate(`/staffdetails/${encryptedStaffId}#service-details`);
  };

  const corporateAdminColumns = [
    {
      name: "Sl No.",
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      minWidth: '90px' 
    },
    {
      name: "School Name",
      selector: row => `${row.location} ${row.school_name} `, 
      sortable: true,
      minWidth: "340px"
    },
 
    {
      name: "Staff Type",
      selector: row => capitalizeWords(row.staff_type)	,
      sortable: true,
      minWidth: "150px"
    },
    {
      name: "Staff Name",
      cell: row => (
        <span 
          className="text-primary cursor-pointer" 
          onClick={() => handleStaffClick(row.fk_staff_id)} // Use fk_staff_id instead of staff_id
          style={{ cursor: 'pointer' }}
        >
          {row.staff_official_name}
        </span>
      ),
      sortable: true,
      minWidth: "200px"
    },
   

    {
      name: "Designation",
      selector: row => capitalizeWords(row.designation_name),
      sortable: true,
      minWidth: "150px"
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      width: "150px"
    }
  ];

  const schoolAdminColumns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,
      width: "90px"
    },
    {
      name: "PEN Number",
      selector: row => row.pen_no,
      sortable: true,
      minWidth: "90px"
    },
    {
      name: "Staff Name",
      cell: row => (
        <span 
          className="text-primary cursor-pointer" 
          onClick={() => handleStaffClick(row.fk_staff_id)} // Use fk_staff_id instead of staff_id
          style={{ cursor: 'pointer' }}
        >
          {row.staff_official_name}
        </span>
      ),
      sortable: true,
      minWidth: "190px"
    },
    {
      name: "Contact No.",
      selector: row => row.phone_no1,
      sortable: true,
      width: "170px"
    },
    {
      name: "Email",
      selector: row => row.email,
      sortable: true,
      width: "180px"
    },
    
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      width: "100px"
    }
  ];

  const columns = userType === 'corporate_admin' ? corporateAdminColumns : schoolAdminColumns;

  const filteredData = pendingServices.filter(item => {
    const searchLower = searchText.toLowerCase();
    if (userType === 'corporate_admin') {
      return (
        item.school_name?.toLowerCase().includes(searchLower) ||
        item.staff_official_name?.toLowerCase().includes(searchLower)
      );
    } else {
      return item.staff_official_name?.toLowerCase().includes(searchLower);
    }
  });

  return (
    <>
      <Breadcum
        items={[
          { Title: "Home", Link: "/" },
          { Title: "Pending Staff Services", Link: "" },
        ]}
        title="Pending Staff Services"
      />

      <div className="card">
        <div className="card-header">
          <h5 className="card-title">Pending Staff Service Details</h5>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-end mb-3">
            <input
              type="text"
              className="form-control w-25"
              placeholder={userType === 'corporate_admin' ? "Search by school or staff name..." : "Search by staff name..."}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <DataTable
           className="custom-data-table"
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            pointerOnHover
            ref={dataTableRef}
            noDataComponent="No data available"
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            paginationDefaultPage={currentPage}
            paginationPerPage={rowsPerPage}
          />
        </div>
      </div>
    </>
  );
};

export default PendingStaffService;