import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import NoDataFound from "./NoDataFound";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from "./Breadcum.js";
import DataTable from "react-data-table-component";
import {  Link } from 'react-router-dom';
import Select from 'react-select';
const SchoolManagersList = () => {
  const [staffs, setStaffs] = useState([]);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(""); // Selected school filter
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dataTableRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const breadcum = [
    { Title: "Home", Link: "/" },
    { Title: "School Managers Details", Link: "" },
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
      const response = await axios.get(`${globalVariables.api_url}/schoolmanager/get_managers_school`, {
        params: { school_id: schoolId }, // Pass selected school ID as a filter
      });

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

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredApplications = tableData.filter((tdata) =>
    tdata.official_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { name: "Sl No.", selector: (row, index) => index + 1, sortable: true, width: "100px" },
    { name: "School Name", selector: (row) => row.location_school_name, sortable: true, minWidth: "280px" },

      {
          name: "Official Name",
          cell: (row) => (
          
              row.official_name
           
          ),
          sortable: false,
         minWidth: '180px'
        },

    { name: "Phone", selector: (row) => row.mobile_no, sortable: true, minWidth: "160px" },
    { name: "Email", selector: (row) => row.email, sortable: true, minWidth: "200px" },
  ];

  const schoolOptions = schools.map((school) => ({
    value: school.school_id,
    label: `${school.location} ${school.school_name} `
}));
  return (
    <>
      <Breadcum items={breadcum} title="School Managers Details" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">School Managers Details</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-3">
                {/* School Dropdown */}
                <Select 
  id="fk_school_id"
  name="fk_school_id"
  options={[{ value: "", label: "All Schools" }, ...schoolOptions]}
  value={[{ value: "", label: "All Schools" }, ...schoolOptions].find(option => option.value === selectedSchool)}
  onChange={(selectedOption) =>
    handleSchoolChange({
      target: { name: "fk_school_id", value: selectedOption ? selectedOption.value : "" }
    })
  }
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

export default SchoolManagersList;
