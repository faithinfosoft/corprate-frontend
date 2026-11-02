import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NoDataFound from "./NoDataFound";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from "./Breadcum.js";
import DataTable from "react-data-table-component";
import { Link } from 'react-router-dom';
import Select from 'react-select';
import { capitalizeWords } from '../utilities/dateconverter';
import useAuth from "../utilities/useAuth";
import Cookies from 'js-cookie';
const StaffList = () => {
  const auth = useAuth();
  const userType = auth.user.user_type;
  const [staffs, setStaffs] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(""); // Selected school filter
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dataTableRef = useRef(null);
  const [loading, setLoading] = useState(false);

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

  const breadcum = [
    { Title: "Home", Link: "/" },
    { Title: "Staff Members List ", Link: "" },
  ];

  useEffect(() => {
    fetchSchools();
    fetchStaffs();
  }, []);

  useEffect(() => {
    // Reset table data when selectedSchool changes and fetch new staff data
    setTableData([]);
    fetchStaffs(selectedSchool);
  }, [selectedSchool]);

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/schools`);
      if (response.data.status) {
        setSchools(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching schools:", error.message);
      print_toast("error", "Failed to fetch school data");
    }
  };

  const fetchStaffs = async (schoolId = "") => {
    setLoading(true);
    try {

   
const params = {
  school_id: schoolId,
  userType: userType,
  // token: token
};

 const response = await axios.get(
  `${globalVariables.api_url}/staff/getallstaffdetails`,
  {
    params, // ✅ axios will serialize this to ?school_id=...&userType=...
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }
);

    
      // const response = await axios.post(`${globalVariables.api_url}/staff/getallstaffdetails`, {
      //   params: { 
      //     school_id: schoolId, 
      //     userType: userType,
      //     token: token  // Pass token as query parameter
      //   }
      // });

      // const response = await axios.get(`${globalVariables.api_url}/staff/getallstaffdetails`, {
      //   params: { school_id: schoolId,userType:userType }, // Pass selected school ID as a filter
      // });

      if (response.data.status) {
        setTableData(response.data.data);
        setShowTable(response.data.data.length > 0); // Only show table if data is available
      } else {
        setShowTable(false); // Show "No data available" if no staff found
      }
      setLoaded(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching staff data:", error.message);
      setLoading(false);
    }
  };

  const handleSchoolChange1 = (event) => {
    setSelectedSchool(event.target.value);
  };
  const handleSchoolChange = (selectedOption) => {
  setSelectedSchool(selectedOption ? selectedOption.value : "");
  console.log(setSelectedSchool);
};

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredApplications = tableData.filter((tdata) =>
    tdata.staff_official_name.toLowerCase().includes(searchTerm.toLowerCase()) || tdata.staff_type.toLowerCase().includes(searchTerm.toLowerCase())
    || tdata.position_type.toLowerCase().includes(searchTerm.toLowerCase()) || tdata.email.toLowerCase().includes(searchTerm.toLowerCase()) || tdata.phone_no1.toLowerCase().includes(searchTerm.toLowerCase()));

  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      minWidth: '90px' 
    },

    {
      name: "Official Name",
      selector: (row) => (
        <a
          href={`/staffdetails/${row.encrypted_staff_id}`}
          className="nav-link reports"
          style={{ color: 'blue', textDecoration: 'none' }}
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.staff_official_name}
        </a>
      ),
      sortable: true,
      minWidth: '200px'
    },

    { name: "School Name", selector: (row) => row.location_school_name, sortable: true, minWidth: "340px" },
    { name: "Staff Type", selector: (row) => capitalizeWords(row.staff_type), sortable: true, minWidth: "160px" },
    { name: "Position Type", selector: (row) => capitalizeWords(row.position_type), sortable: true, minWidth: "150px" },

 

   
    // { name: "Staff Name", selector: (row) => row.staff_official_name, sortable: true, minWidth: "200px" },
    { name: "Phone", selector: (row) => row.phone_no1, sortable: true, minWidth: "160px" },
    { name: "Email", selector: (row) => row.email, sortable: true, minWidth: "250px" },
  ];

  const schoolOptions = schools.map((school) => ({
    value: school.school_id,
    label: `${school.location} ${school.school_name} `
  }));
  return (
    <>
      <Breadcum items={breadcum} title="Staff Members List " />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Staff Members List </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                {/* School Dropdown */}
         <Select
  id="fk_school_id"
  name="fk_school_id"
  options={[{ value: "", label: "All Schools" }, ...schoolOptions]}
  value={[{ value: "", label: "All Schools" }, ...schoolOptions].find(
    (option) => option.value === selectedSchool
  )}
  onChange={handleSchoolChange}   // ✅ pass directly, no event wrapping
  isSearchable
  placeholder="Select School"
  classNamePrefix="react-select"
  styles={{
    control: (provided) => ({
      ...provided,
      width: "500px", // Adjust width as needed
    }),
  }}
/>



                {/* <select className="form-control w-25" value={selectedSchool} onChange={handleSchoolChange}>
                  <option value="">All Schools</option>
                  {schools.map((school) => (
                    <option key={school.school_id} value={school.school_id}>
                       {school.location} {school.school_name}
                    </option>
                  ))}
                </select> */}

                {/* Search Input */}
                <input
                  type="text"
                  className="form-control w-25"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              <div className="table-container">
                {loading ? (
                  <p>Loading...</p>
                ) : showTable ? (
                  <DataTable
                    className="custom-data-table"
                    columns={columns}
                    data={filteredApplications}
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
                ) : (
                  <NoDataFound message="No staff data found for the selected school." />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffList;
