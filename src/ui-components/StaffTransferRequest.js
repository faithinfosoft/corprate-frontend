import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DataTable from "react-data-table-component";
import useAuth from '../utilities/useAuth';
import Breadcum from './Breadcum';
import globalVariables from "../Global.js";
import { useNavigate } from "react-router-dom";
import print_toast from "../utilities/Toaster.js";
const TransferRequest = () => {
  const auth = useAuth();
  const user_id = auth.user.user_id;
  const userType = auth.user.user_type;
  const dataTableRef = useRef(null);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Transfer Requests', Link: '' },
  ]);
  // State variables

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  

  // Fetch academic years on component mount
  useEffect(() => {
    fetchTransferRequests();
  
  }, []);

  // Scroll to table when data is loaded
  useEffect(() => {
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);



  const handleDelete = async (transferId) => {
    if (!window.confirm("Are you sure you want to delete this Transfer request?")) return;

    try {
      const formData = new URLSearchParams();
      formData.append('transfer_id', transferId);
      
      const response = await axios.post(
        `${globalVariables.api_url}/staff_transfer/delete`,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

        if (response.data.status) {
            print_toast("success", response.data.message);
            setTableData((prevData) => 
              prevData.filter(item => item.transfer_application_id !== transferId)
            );
       

            await fetchTransferRequests(); // Refresh the list after deletion
        } else {
            print_toast("error", response.data.message);
        }
    } catch (error) {
        console.error("Error deleting Transfer request:", error);
        print_toast("error", "Failed to delete Transfer request");
    }
};


  const fetchTransferRequests = async () => {

   
    setLoading(true);

    try {
 const form_data = {
        params: {
            user_id: user_id,
          
        }
      };

      const response = await axios.get(globalVariables.api_url + '/staff_transfer/staff_transfer_requests', form_data);


      setTableData(response.data.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching transfer data:', error);
     // setErrorMessage('Failed to fetch transfer data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (row) => {
    navigate(`/edit-transfer-application/${row.transfer_application_id}`); // Redirect to an edit page with the leave ID
  };

  const handleSendLetter = (transfer) => {
    // Redirect to the desired page with the leave ID or details
    navigate(`/transfer-application-letter/${transfer.transfer_application_id}`, { state: { transferData: transfer } });
  };
  const baseColumns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,
      minWidth: '100px'
    },
    {
      name: "Academic Year",
      selector: row => row.year_label,
      sortable: true,
      minWidth: '150px'
    },
    {
      name: "Staff Name",
      selector: row => row.staff_official_name,
      sortable: true,
      minWidth: '200px'
    },
    {
      name: "PEN Number",
      selector: row => row.pen_no,
      sortable: true,
      minWidth: '150px'
    },
    {
      name: "Preferred Schools",
      cell: row => (
        <ul className="list-unstyled mb-0">
          {row.preferred_schools.map((school, index) => (
            <li key={index}>• {school.school_name}, {school.location}</li>
          ))}
        </ul>
      ),
      width: '300px'
    },
    {
      name: "Status",
      selector: row => row.status,
      sortable: true,
      width: '120px'
    },
  

  {
    name: <strong>Actions</strong>,
    cell: row => (
      <div className="dropdown">
        <button
          className="btn btn-dark dropdown-toggle"
          type="button"
          id="dropdownMenuButton1"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Action
        </button>
        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
        {row.request_letter_status === "draft" && (
                  <>
        <li>


        <button
                        className="dropdown-item"
                        onClick={() => handleEditClick(row)}
                      >
                        Edit
                      </button>
          </li>

          <li>
          <button
        className="dropdown-item"
        onClick={() => handleDelete(row.transfer_application_id)}
      >
             Delete
             </button>
          </li>
          </>
                )}
          {
  row.request_letter_status === "draft" ? (
    <li>
      <button
        className="dropdown-item"
        onClick={() => handleSendLetter(row)}
      >
        Send Transfer Application
      </button>
    </li>
  ) : (
<li>
  <a 
    href={`${globalVariables.img_url}/uploads/staff_transfer_application_letter/${row.request_letter}`} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="dropdown-item text-dark"
  >
    Transfer Application
  </a>
</li>

  )
}
   
   
        </ul>
      </div>
    ),
    width: '150px'
  }
];
  
  // Conditional columns
  const conditionalColumns = [
    {
      name: "Date",
      selector: row => row.date,
      sortable: true,
      minWidth: '150px'
    },
    {
      name: "School",
      selector: row => row.school_name,
      sortable: true,
      minWidth: '200px'
    },

  ];
  
  // Combine base columns with conditional columns if `status === 'approved'`
  const columns = tableData.some(row => row.status === 'approved')
  ? [...baseColumns, ...conditionalColumns]
  : baseColumns;
  

  return (
    <>
        <Breadcum items={breadcum} title="Transfer Requests" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Transfer Request Report</h5>
            </div>

            <div className="card-body">
             

              <div className="row" ref={dataTableRef}>
                <div className="col-md-12">
                  {showTable && (
                    <DataTable
                      className="custom-data-table"
                      columns={columns}
                      data={tableData}
                      pagination
                      paginationComponentOptions={{
                        rowsPerPageText: "Rows per page:",
                        rangeSeparatorText: "of",
                        selectAllRowsItem: true,
                        selectAllRowsItemText: "All",
                      }}
                      selectableRows
                      selectableRowsComponent={({ selectedCount, onSelectedCountChange }) => (
                        <div className="selectable-rows-component">
                          <div className="selectable-rows-component-actions">
                          </div>
                        </div>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransferRequest;