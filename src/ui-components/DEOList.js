import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound.js';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import DataTable from "react-data-table-component";
const DEOList = () => {
  const [DEO, setDEO] = useState([]);
  const [form_error, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'DEO Details', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    DEO_name: '',
    save_flag: false,
  });

   const dataTableRef = useRef(null);
    const [show, setShow] = useState(false);
     const [tableData, setTableData] = useState([]);
     const [showTable, setShowTable] = useState(false);
  




  useEffect(() => {
    fetchDEO();
  }, []);

 


  const capitalizeWords = (str) => {
    // Check if str is undefined or not a string
    if (typeof str !== 'string') {
      console.error('Input is not a valid string:', str);
      return ''; // Return an empty string if the input is not valid
    }
    
    return str.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,
      minWidth: '40px' 
    },
    { 
      name: "District", 
      selector: (row) => capitalizeWords(row.dept_district), 
      sortable: true, 
      minWidth: '200px' 
    },
    { 
        name: "DDE", 
        selector: (row) => capitalizeWords(row.deo_name), 
        sortable: true, 
        minWidth: '200px' 
      },
      
    { 
      name: "DEO Office", 
      selector: (row) => capitalizeWords(row.dept_name), 
      sortable: true, 
      minWidth: '200px' 
    },
    { 
        name: "Office Address", 
        selector: (row) => capitalizeWords(row.office_address), 
        sortable: true, 
        minWidth: '200px' 
      },
      { 
        name: "Phone", 
        selector: (row) => capitalizeWords(row.phone), 
        sortable: true, 
        minWidth: '200px' 
      },
      { 
        name: "Email", 
        selector: (row) => capitalizeWords(row.email), 
        sortable: true, 
        minWidth: '200px' 
      },


  ];
  
  const fetchDEO = async () => {
    try {
     
      const response = await axios.get(`${globalVariables.api_url}/education-department/view_education_department_type`, {
        params: {dept_type:'deo' }
      });

      if (response.data.status) {
        setTableData(response.data.data);
      setShowTable(true);
       // setSchools(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch School data");
    }
  };

    const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  
  const filteredApplications = tableData.filter(tdata =>
    tdata.dept_name.toLowerCase().includes(searchTerm.toLowerCase())|| tdata.dept_name.toLowerCase().includes(searchTerm.toLowerCase())
   
  );
  return (
    <>
      <Breadcum items={breadcum} title="DEO Details" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">DEO Details</h5>
            </div>
            <div className="card-body">
       <div className="d-flex justify-content-end mb-3">
            <input
              type="text"
              className="form-control w-25"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
            <div className="table-container">
                {showTable ? (
                  <DataTable
                   className="custom-data-table"
                    columns={columns}
                    data={filteredApplications}
                    pagination
                    highlightOnHover
                    pointerOnHover
                    ref={dataTableRef}
                    noDataComponent="No data available"
                  />
                ) : (
                  <div></div>
                )}
              </div>


       
            </div>
          </div>
        </div>

    
      </div>


    </>
  );
};

export default DEOList;



