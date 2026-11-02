import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ZoneDropdown from './ZoneList.js';
import axios from 'axios';
import globalVariables from "../../Global.js";
import Multiselect from 'multiselect-react-dropdown';
import DataTable from "react-data-table-component";
import useAuth from '../../utilities/useAuth';
import { convertDateFormat } from '../../utilities/dateconverter.js';
import Breadcum from '../Breadcum'; // Corrected import path
import { Spinner } from 'react-bootstrap';
//import { capitalizeWords } from '../../utilities/dateconverter';
const filters = [
  { value: 'gender', label: 'Gender' },
  // { value: 'designation', label: 'Designation' },
  // { value: 'subject', label: 'Subject' },
  // { value: 'class_level', label: 'Class Level' },
  { value: 'staff_type', label: 'Staff Type' },
  { value: 'position_type', label: 'Position Type' },
  { value: 'marital_status', label: 'Marital Status' },
  { value: 'religion', label: 'Religion' },
  { value: 'class_level', label: 'Class Levels' },
  //{ value: 'doj', label: 'Date of Joining' },
  ///  { value: 'leave', label: 'Leave' },
  //{ value: 'seniority', label: 'Seniority' },
];

const StaffReport = () => {
  const [classlevels, setClasslevels] = useState([]);
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Staff Report', Link: '' },
  ]);
  const auth = useAuth();
  const userType = auth.user.user_type;
  const userId = auth.user.user_id;
  

  const dataTableRef = useRef(null);
  const [selectedZone, setselectedZone] = useState(null);

  const [selectedSchool, setselectedSchool] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const [gender, setGender] = useState("");
  const [schoolList, setSchoolList] = useState([]);


  const [startDate, setStartDate] = useState();
  const [doj, setDoj] = useState(null);

  const [selectedFilters, setSelectedFilters] = useState(['forane']);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedZones, setSelectedZones] = useState([]);



  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [designation, setDesignation] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState('');
  //const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedStaffType, setSelectedStaffType] = useState('');
  const [selectedpositionType, setSelectedPositionType] = useState('');
  const [selectedmaritalstatus, setSelectedmaritalstatus] = useState('');
  const [selectedreligion, setSelectedreligion] = useState('');
  const [selectedDenomination, setSelectedDenomination] = useState('');
  const [selectedSubcaste, setSelectedSubcaste] = useState('');

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
 // const [selectedClassLevel, setSelectedClassLevel] = useState('');

  const [classLevel, setClassLevel] = useState([]); // List of qualifications
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [staff_type, setStaffType] = useState("");
  const [filteredSchoolList, setFilteredSchoolList] = useState([]);

    const [secondaryDropdown, setSecondaryDropdown] = useState("");
    const [ddeDropdown, setDdeDropdown] = useState(""); 
    const [deoDropdown, setDeoDropdown] = useState(""); 
    const [aeoDropdown, setAeoDropdown] = useState("");
     const [EducationDept, setSelectedEducationDept] = useState("");
      const [secondaryOptions, setSecondaryOptions] = useState([]);
      const [deoOptions, setDeoOptions] = useState([]);
        const [aeoOptions, setAeoOptions] = useState([]);
          const [classlevel, setSelectedClassLevel] = useState("");
          

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
    fetchDesignations();

    // Scroll to DataTable component when data is fetched
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);

  const fetchSchools = async (selectedZone) => {
    try {
      const response = await axios.get(globalVariables.api_url + '/school/get_schools_zone', {
        params: {
          userType: userType,
          school_id:userId,
          selectedZone: selectedZone,
        }
      });
      
      const schools = response.data.data || [];
      setSchoolList(schools);
      setFilteredSchoolList(schools); // Set filtered list to all schools initially
      
      // Extract unique districts from fetched schools
      if (schools.length > 0) {
        const uniqueDistricts = [...new Set(schools.map(school => school.district))];
        setDistricts(uniqueDistricts);
      } else {
        setDistricts([]);
      }
      
    } catch (error) {
      console.error('Error fetching schools:', error);
      setSchoolList([]);
      setFilteredSchoolList([]);
      setDistricts([]);
      setErrorMessage('Failed to fetch schools. Please try again.');
    }
  };
  const fetchSchools1 = async (selectedZone) => {
    try {
      const response = await axios.get(globalVariables.api_url + '/school/get_schools_zone', {
        params: {
          userType: userType,
          selectedZone: selectedZone,
        }
      });
      setSchoolList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parishes:', error);
    }
  };

  const handledoj = (date) => {
    setDoj(date);
  };


  const capitalizeWords = (str) => {
    return str.toUpperCase();
  };
  const fetchDesignations = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/designations/view`);
      if (response.data.status) {
        setDesignation(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);

    }
  };


  const fetchClasslevels = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/class-strength/get_classs_levels`
      );
      if (response.data.status) {
        setClasslevels(response.data.data);
      } else {
        setClasslevels([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error.message);
    }
  };

  // Fetch class levels on component mount
  useEffect(() => {
    fetchClasslevels();
  }, []);


  useEffect(() => {

    if (selectedZone !== undefined) {
      fetchSchools(selectedZone);
    }
  }, [selectedZone, userType]);

  const handleZoneSelect = (selectedZone) => {
    setselectedZone(selectedZone);
  };

  const handleSchoolSelect = (selectedSchool) => {
    setselectedSchool(selectedSchool);
  };

  const handleCheckboxChange = (event) => {

    const { value, checked } = event.target;
    if (checked) {
      setSelectedFilters([...selectedFilters, value]);
    } else {
      setSelectedFilters(selectedFilters.filter((item) => item !== value));
      clearFilterFields(value);
    }


  };


  const clearFilterFields = (filter) => {
    //alert(filter);
    switch (filter) {
      case 'gender':
        setGender('');
        break;

      case 'designation':
        setSelectedDesignation('');
        break;

      case 'staff_type':
        setSelectedStaffType('');
        break;
        case 'position_type':
          setSelectedPositionType('');
          break;
          case 'marital_status':
            setSelectedmaritalstatus('');
            break;
            case 'religion':
              setSelectedreligion('');
              break;
              case 'class_level':
        setSelectedClassLevel('');
        break;
      // Add more cases for other filters if needed
      default:
        break;
    }
  };

  const handleCloseFilter = (filter) => {
    setSelectedFilters(selectedFilters.filter((item) => item !== filter));
    if (filter === 'gender') {
      setGender(''); // 
    }

    if (filter === 'designation') {
      setSelectedDesignation(''); // 
    }
    if (filter === 'staff_type') {
      setSelectedStaffType(''); // 
    }
    if (filter === 'position_type') {
      setSelectedPositionType(''); // 
    }
    if (filter === 'marital_status') {
      setSelectedmaritalstatus(''); // 
    }
    if (filter === 'religion') {
      setSelectedreligion(''); 
      setSelectedDenomination(''); 
      setSelectedSubcaste(''); 
    }

    if (filter === 'class_level') {
      setSelectedClassLevel(''); // 
    }
    
  };



  const handleSearchClick = (event) => {
    event.preventDefault();
    fetchData();

  };

  const fetchData = async () => {

    setLoading(true);
    try {

      if (!selectedZone && userType !== 'school_admin') {
        setTableData([]);
        setShowTable(false);
        return;
      }



      const form_data = {
        params: {
          zones: selectedZone,
          school: selectedSchool,
          gender: gender,
          designation: selectedDesignation,
          stafftype: selectedStaffType,
          EducationDept: EducationDept,
          positiontype:selectedpositionType,
          maritalstatus:selectedmaritalstatus,
          religion:selectedreligion,
          caste:selectedDenomination,
          subcaste:selectedSubcaste,
          district: selectedDistrict,
          classLevel:classlevel,

        }
      };

      if (EducationDept === "rdd") {
        form_data.params.rdd_id = secondaryDropdown; // Assuming `selectedRdd` holds the selected RDD value
      } else if (EducationDept === "deo") {
        form_data.params.deo_id = deoDropdown; // Assuming `deoDropdown` holds the selected DEO value
      } else if (EducationDept === "aeo") {
        form_data.params.aeo_id = aeoDropdown; // Assuming `aeoDropdown` holds the selected AEO value
      } else if (EducationDept === "dde") {
        form_data.params.dde_id = secondaryDropdown; // Assuming `ddeDropdown` holds the selected DDE value
      }

      const response = await axios.get(globalVariables.api_url + '/Reports/search_staff', form_data);
      setTableData(response.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      //alert(error.message);
    }
    setLoading(false);


  };

  const isFilterSelected = (filterValue) => selectedFilters.includes(filterValue);

  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };


  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      minWidth: '90px' 
    },
    { name: "Zone", selector: (row) => row.zone_name, sortable: true, minWidth: '180px' },
    { name: "School Code", selector: (row) => row.school_code, sortable: true, minWidth: '130px' },
    { name: "School Name", selector: (row) => ` ${row.location} ${row.school_name} `, sortable: true, minWidth: '320px' },
    // {
    //   name: "Class Levels",
    //   selector: (row) => row.class_level_name,
    //   sortable: true,
    //   minWidth: '150px',
    // },
    // { name: "Edu. Department", selector: (row) => capitalizeWords(row.dept_type), sortable: true, minWidth: '180px' },
    // { name: "Edu. Office", selector: (row) =>  row.dept_name, sortable: true, minWidth: '180px' },
    	
    // {
    //   name: "Staff Name",
    //   selector: (row) => row.staff_official_name,
    //   sortable: true,
    //   minWidth: '250px'
    // },

    { 
      name: "Staff Name", 
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
    { name: "Staff Type", selector: (row) => row.staff_type, sortable: true, minWidth: '130px' },
    { name: "Position Type", selector: (row) => row.position_type, sortable: true, minWidth: '150px' },
 { name: "Appointment Approved", selector: (row) => row.appointment_approved, sortable: true, minWidth: '150px' },
    { name: "DOB", selector: (row) => convertDateFormat(row.dob), sortable: true, minWidth: '150px' },
    { name: "Age", selector: (row) => row.age, sortable: true, minWidth: '120px' },
    { name: "Gender", selector: (row) => capitalizeWords(row.gender), sortable: true, minWidth: '120px' },
    { name: "Contact No.", selector: (row) => row.phone_no1, sortable: true, minWidth: '180px' },
    { name: "Whatsapp No.", selector: (row) => row.whatsapp_no, sortable: true, minWidth: '180px' },
    { name: "Email", selector: (row) => row.email, sortable: true, minWidth: '250px' },
    { name: "Religion", selector: row => capitalizeWords(row.religion), sortable: true, minWidth: '200px' },
    { name: "Denomination", selector: row => capitalizeWords(row.caste), sortable: true, minWidth: '280px' },
    { name: "Subcaste", selector: row => capitalizeWords(row.subcaste), sortable: true, minWidth: '160px' },
    { name: "Status of Life", selector: row => capitalizeWords(row.marital_status), sortable: true, minWidth: '200px' },


  ];









  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {



      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_staff', {
        params: {
          zones: selectedZone,
          school: selectedSchool,
          gender: gender,
          designation: selectedDesignation,
          stafftype: selectedStaffType,
          positiontype:selectedpositionType,
          maritalstatus:selectedmaritalstatus,
          classLevel:classlevel,
          religion:selectedreligion,
          caste:selectedDenomination,
          subcaste:selectedSubcaste,
          subject: selectedSubject,
        
          excel: "excel"
        },
        responseType: 'blob'
      });

      // Create a new Blob object using the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create a URL for the Blob object
      const url = window.URL.createObjectURL(blob);

      // Create a link element and trigger a download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staffreport.xlsx'); // Use .xlsx extension if the file is in .xlsx format
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating Excel:', error);
    }
    setExcelLoading(false);
  };


  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {

      const form_data = {
        params: {
          zones: selectedZone,
          school: selectedSchool,
          gender: gender,
          designation: selectedDesignation,
          stafftype: selectedStaffType,
          classLevel:classlevel,
          subject: selectedSubject,
          positiontype:selectedpositionType,
          maritalstatus:selectedmaritalstatus,
          religion:selectedreligion,
          caste:selectedDenomination,
          subcaste:selectedSubcaste,
          print: "print"
        },
        responseType: 'blob'
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_staff', form_data);

      // Handle the response, for example, trigger a file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staffreport.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };

  const handleDesignationChange = (value) => {
    setSelectedDesignation(value);
  };
  const handlestafftpeChange = (value) => {
    setSelectedStaffType(value);
  };

  const handlestafftpositionChange = (value) => {
    setSelectedPositionType(value);
  };

  const handlemaritalstatusChange = (value) => {
    setSelectedmaritalstatus(value);
  };


  const handlereligionChange = (value) => {
    setSelectedreligion(value);
    setSelectedDenomination(''); // Reset denomination when religion changes
  };
  
  const handleDenominationChange = (value) => {
    setSelectedDenomination(value);
  };
  
  const handleSubcasteChange = (value) => {
    setSelectedSubcaste(value);
  };

  
  
  const handleClassLevelChange = async (classLevel) => {
    setSelectedClassLevel(classLevel);
    setSelectedSubject(""); // Reset subject selection
    setSubjects([]); // Clear previous subjects

    if (classLevel) {
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/subject/get_subject_class_level/${classLevel}`
        );
        setSubjects(response.data.data || []); // Update subjects
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    }
  };

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setselectedSchool('');
    
    // Filter schools based on the selected district
    if (district === 'All' || district === '') {
      // If "All" is selected, show all schools for the current zone
      setFilteredSchoolList(schoolList);
    } else {
      // Filter schools in the current zone by the selected district
      const filteredSchools = schoolList.filter(school => school.district === district);
      setFilteredSchoolList(filteredSchools);
    }
  };


  const handleChangeedu = (e) => {
    setSecondaryDropdown(e.target.value); // Update state when dropdown changes
  };

  const handleDepartmentChange = async (e) => {
    const selectedDept = e.target.value; // Get selected value
    setSelectedEducationDept(selectedDept); // Update state

    if (!selectedDistrict && selectedDept !== "" && selectedDept !== "All") {
        alert("Please select the district first.");
        setSelectedEducationDept("");
        return; // Stop execution if district is not selected
    }

    // Reset the dropdowns when department changes
    setSecondaryOptions([]);
    setDeoOptions([]);

    try {
        let response1 = null;
        let response2 = null;

        if (selectedDept === "rdd" || selectedDept === "dde") {
            response1 = await axios.get(`${globalVariables.api_url}/education-department/get_department_district`, {
                params: { dept_type: selectedDept, district: selectedDistrict }
            });
        } else if (selectedDept === "deo") {
            response1 = await axios.get(`${globalVariables.api_url}/education-department/get_department_district`, {
                params: { dept_type: "dde", district: selectedDistrict }
            });

            response2 = await axios.get(`${globalVariables.api_url}/education-department/get_department_district`, {
                params: { dept_type: "deo", district: selectedDistrict }
            });
        } else if (selectedDept === "aeo") {
            response1 = await axios.get(`${globalVariables.api_url}/education-department/get_department_district`, {
                params: { dept_type: "dde", district: selectedDistrict }
            });
        }

        const data1 = response1?.data?.data || [];
        const data2 = response2?.data?.data || [];

        setSecondaryOptions(data1);
        setDeoOptions(data2);
    } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage('Failed to fetch department data. Please try again.');
    }
  };

  const handleChangedeo = async (e) => {
    const { name, value } = e.target;

    if (name === "ddeDropdown") {
      setDdeDropdown(value);
      setDeoDropdown(""); // Reset DEO when DDE changes
      setAeoDropdown(""); // Reset AEO when DDE changes
      setDeoOptions([]);
      setAeoOptions([]);

      if (!value) return;

      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_dde`,
          { params: { dept_type: "deo", dde_id: value } }
        );
        setDeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching DEO options:", error);
        setDeoOptions([]);
        setErrorMessage('Failed to fetch DEO options. Please try again.');
      }
    }

    if (name === "deoDropdown") {
      setDeoDropdown(value);
      setAeoDropdown(""); // Reset AEO when DEO changes
      setAeoOptions([]);
    }
  };

  const handleChangeaeo = async (e) => {
    const { name, value } = e.target;

    if (name === "deoDropdown") {
      setDeoDropdown(value);
      setAeoDropdown(""); // Reset AEO when DEO changes
      setAeoOptions([]);

      if (!value) return;

      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_aeo_options`,
          { params: { deo_id: value } }
        );
        setAeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching AEO options:", error);
        setAeoOptions([]);
        setErrorMessage('Failed to fetch AEO options. Please try again.');
      }
    }

    if (name === "aeoDropdown") {
      setAeoDropdown(value);
    }
  };


  return (
    <>

      <Breadcum items={breadcum} title="Staff Report" /> {/* Pass breadcum as a prop */}
      {/* Rest of your component code */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card">

            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Staff Report</h5>
              <nav className="header-nav">
                <ul className="d-flex align-items-center">
                  <li className="nav-item dropdown pe-3">
                    <a className="nav-filters d-flex align-items-center pe-0 text-white" href="#" data-bs-toggle="dropdown">
                      More Filter options
                      <span className="d-none d-md-block dropdown-toggle ps-2 p-1" style={{ fontWeight: 'bold' }}></span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end dropdown-menu-arrow profile">
                      {filters.map((filter) => (
                        <li key={filter.value} className='p-1'>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={filter.value}
                              value={filter.value}
                              checked={isFilterSelected(filter.value)}
                              onChange={handleCheckboxChange}
                            />
                            <label className="form-check-label" htmlFor={filter.value}>
                              {filter.label}
                            </label>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <form className="row g-3" onSubmit={handleSearchClick}>
                 
               
{userType === 'corporate_admin'  &&
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Zone<span className="text-danger">*</span></label>
                      <ZoneDropdown
                        className="form-control"
                        value={selectedZone}
                        onSelect={handleZoneSelect}
                        showAllOption={true}

                      />
                    </div>
}
{userType === 'corporate_admin'  &&
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">District</label>
                      <select
                        id="district"
                        className="form-select"
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictSelect(e.target.value)}>
                        <option value="">Select District</option>
                        <option value="All">All</option>
                        {districts.map((d, index) => (
                          <option key={index} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  }
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">School</label>
                      <select
                        id="parish"
                        className="form-select"
                        value={selectedSchool}
                        onChange={(e) => handleSchoolSelect(e.target.value)} required={userType === 'parish'}>
                        <option value="">Select School</option>
                        {userType === 'corporate_admin'  && <option value="All">All</option>}

                        {schoolList.map((zone, index) => (
                          <option key={index} value={zone.school_id}>
                            {zone.school_name},{zone.location}
                          </option>
                        ))}
                      </select>
                    </div>
                    {userType === 'corporate_admin'  &&

                    <div className="col-md-6 col-sm-12">
                      <label htmlFor="edu_dept" className="form-label">
                        Education Department:
                      </label>
                      <select
                        id="dept_type"
                        className="form-select"
                        name="dept_type"
                        value={EducationDept}
                        onChange={handleDepartmentChange}
                      >
                        <option value="">Select Department</option>
                        <option value="All">All</option>
                        <option value="rdd">RDD</option>
                        <option value="dde">DDE</option>
                        <option value="deo">DEO</option>
                        <option value="aeo">AEO</option>
                      </select>
                    </div>
}

                    {/* Secondary Dropdown - Visible only for RDD or DDE */}
                    {["rdd", "dde"].includes(EducationDept) && (
                      <div className="col-md-6 col-sm-12">
                        <label htmlFor="secondary-dropdown" className="form-label">
                          {EducationDept.toUpperCase()} Details 
                        </label>
                        <select
                          id="secondary-dropdown"
                          className="form-select"
                          name="secondaryDropdown"
                          value={secondaryDropdown}
                          onChange={handleChangeedu}
                        >
                          <option value="">Select Option</option>
                          <option value="All">All</option>
                          {secondaryOptions.map((option) => (
                            <option key={option.dept_id} value={option.dept_id}>
                              {option.office_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {EducationDept === "deo" && (
                      <>
                        {/* DDE Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="dde-dropdown" className="form-label">
                            DDE Details
                          </label>
                          <select
                            id="dde-dropdown"
                            className="form-select"
                            name="ddeDropdown"
                            value={ddeDropdown}
                            onChange={handleChangedeo}
                          >
                            <option value="">Select DDE Option</option>
                            <option value="All">All</option>
                            {secondaryOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* DEO Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="deo-dropdown" className="form-label">
                            DEO Details 
                          </label>
                          <select
                            id="deo-dropdown"
                            className="form-select"
                            name="deoDropdown"
                            value={deoDropdown}
                            onChange={handleChangedeo}
                          >
                            <option value="">Select DEO Option</option>
                            <option value="All">All</option>
                            {deoOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  
                    {EducationDept === "aeo" && (
                      <>
                        {/* DDE Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="dde-dropdown" className="form-label">
                            DDE Details <span className="text-danger">*</span>
                          </label>
                          <select
                            id="dde-dropdown"
                            className="form-select"
                            name="ddeDropdown"
                            value={ddeDropdown}
                            onChange={handleChangedeo}
                          >
                            <option value="">Select DDE Option</option>
                            <option value="All">All</option>
                            {secondaryOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* DEO Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="deo-dropdown" className="form-label">
                            DEO Details <span className="text-danger">*</span>
                          </label>
                          <select
                            id="deo-dropdown"
                            className="form-select"
                            name="deoDropdown"
                            value={deoDropdown}
                            onChange={handleChangeaeo}
                          >
                            <option value="">Select DEO Option</option>
                            <option value="All">All</option>
                            {deoOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* AEO Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="aeo-dropdown" className="form-label">
                            AEO Details <span className="text-danger">*</span>
                          </label>
                          <select
                            id="aeo-dropdown"
                            className="form-select"
                            name="aeoDropdown"
                            value={aeoDropdown}
                            onChange={handleChangeaeo}
                          >
                            <option value="">Select AEO Option</option>
                            <option value="All">All</option>
                            {aeoOptions.map((option) => (
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}



                    {selectedFilters.map((filter) => (
                      <div key={filter} className="row form-fields">
                        {filter === 'gender' && (

                          <div class="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="gender" class="col-sm-10  form-label">Gender:</label>
                            <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('gender')}>x</label>
                            <div class="col-sm-12">
                              <select
                                id="gender"
                                className="form-control"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                              >
                                <option value="">Select Gender</option>
                                <option value="All">All</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                               
                              </select> </div>
                          </div>
                        )}
                        {filter === 'designation' && (
                          <div class="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="designation" class="col-sm-10 form-label">Designation:</label>
                            <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('designation')}>x</label>
                            <div class="col-sm-12">
                              <select
                                id="designation"
                                className="form-select"
                                value={selectedDesignation}
                                onChange={(e) => handleDesignationChange(e.target.value)} required>
                                <option value="">Select Designation</option>
                                {designation.map((d, index) => (
                                  <option key={index} value={d.designation_id}>
                                    {d.designation_name}
                                  </option>
                                ))}
                              </select></div>
                          </div>
                        )}


                        {filter === 'staff_type' && (
                          <div class="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="staff_type" class="col-sm-10 form-label">Staff Type:</label>
                            <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('staff_type')}>x</label>
                            <div class="col-sm-12">
                              <select
                                id="staff_type"
                                className="form-select"
                                value={selectedStaffType}
                                onChange={(e) => handlestafftpeChange(e.target.value)} required>
                                <option value="">Select Type</option>
                                <option value="All">All</option>

                                <option value="Teaching">Teaching Staff</option>
                                <option value="Non-Teaching">Non-Teaching Staff</option>

                              </select>
                            </div></div>
                        )}


{filter === 'position_type' && (
                          <div class="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="position_type" class="col-sm-10 form-label">Position Type:</label>
                            <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('position_type')}>x</label>
                            <div class="col-sm-12">
                              <select
                                id="position_type"
                                className="form-select"
                                value={selectedpositionType}
                                onChange={(e) => handlestafftpositionChange(e.target.value)} required>
                                <option value="">Select Type</option>
                                <option value="All">All</option>

                                <option value="Permanent">Permanent</option>
                                <option value="Temporary">Temporary</option>

                              </select>
                            </div></div>
                        )}


{filter === 'marital_status' && (
                          <div class="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="marital_status" class="col-sm-10 form-label">Marital Status:</label>
                            <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('marital_status')}>x</label>
                            <div class="col-sm-12">
                              <select
                                id="marital_status"
                                className="form-select"
                                value={selectedmaritalstatus}
                                onChange={(e) => handlemaritalstatusChange(e.target.value)} required>
                                <option value="">Select Marital Status</option>
                                <option value="All">All</option>

                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                              </select>
                            </div></div>
                        )}


{filter === 'class_level' && (
                          <div className="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="subject" className="col-sm-10 form-label">Class Levels:</label>
                            <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('class_level')}>x</label>
                            <div className="col-sm-12">
                              <select
                                className="form-select"
                                id="class_level"
                                name="class_level"
                                value={classlevel}
                                onChange={(e) => setSelectedClassLevel(e.target.value)}


                              >
                                <option value="">Select Class Level</option>

                                <option value="All">All</option>
                                {classlevels.map((level) => (
                                  <option key={level.class_level_id} value={level.class_level_id}>
                                    {level.class_level_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}
{filter === 'religion' && (
  <div className="row mb-3 bg-light p-1 m-1">
    <label htmlFor="religion" className="col-sm-10 form-label">Religion:</label>
    <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('religion')}>x</label>
    <div className="col-sm-12">
      <select
        id="religion"
        className="form-select"
        value={selectedreligion}
        onChange={(e) => handlereligionChange(e.target.value)} 
        required
      >
        <option value="">Select Religion</option>
        <option value="All">All</option>
        <option value="christian">Christian</option>
        <option value="hindu">Hindu</option>
        <option value="muslim">Muslim</option>
      </select>
    </div>
    
    <div className="col-sm-12 mt-2">
      <label htmlFor="denomination" className="form-label">Denomination:</label>
      <select
        id="denomination"
        className="form-select"
        value={selectedDenomination}
        onChange={(e) => handleDenominationChange(e.target.value)} 
       
      >
        <option value="">Select Denomination</option>
        <option value="All">All</option>
        {selectedreligion === 'christian' && (
          <>
            <option value="Syro-Malabar Syrian Catholic">Syro-Malabar Syrian Catholic</option>
            <option value="Protestant">Protestant</option>
            <option value="Orthodox">Orthodox</option>
            <option value="Marthoma">Marthoma</option>
            <option value="CSI">CSI</option>
            <option value="Jacobite">Jacobite</option>
            <option value="Pentacost">Pentacost</option>
            <option value="Others">Others</option>
          </>
        )}
        {selectedreligion === 'hindu' && (
          <>
            <option value="Brahmin">Brahmin</option>
            <option value="Ezhava">Ezhava</option>
            <option value="Vaishya">Vaishya</option>
            <option value="Shudra">Shudra</option>
          </>
        )}
        {selectedreligion === 'muslim' && (
          <>
            <option value="Sunni">Sunni</option>
            <option value="Shia">Shia</option>
            <option value="Ahmadi">Ahmadi</option>
          </>
        )}
      </select>
    </div>
    
    <div className="col-sm-12 mt-2">
      <label htmlFor="subcaste" className="form-label">Sub Caste:</label>
      <select
        id="subcaste"
        className="form-select"
        value={selectedSubcaste}
        onChange={(e) => handleSubcasteChange(e.target.value)} 
       
      >
        <option value="">Select Sub Caste</option>
        <option value="All">All</option>
        <option value="General">General</option>
        <option value="SC">SC</option>
        <option value="ST">ST</option>
        <option value="OBC">OBC</option>
        <option value="OEC">OEC</option>
      </select>
    </div>
  </div>
)}

                        {filter === 'doj' && (
                          <div class="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="doj" class="col-sm-10 form-label">Date of Joining:</label>
                            <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('doj')}>x</label>
                            <div class="col-sm-12">
                              <input
                                type="date"
                                id="doj"
                                name="doj"
                                className="form-control col-md-6 col-sm-12"
                                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => handledoj(new Date(e.target.value))}
                                required
                              />
                            </div></div>
                        )}



                      </div>
                    ))}


                    <div className="form-group">
                      <button
                        type="submit"
                        className="btn btn-primary btn-search"
                        disabled={loading || isDisabled}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching
                          </>
                        ) : (
                          <>
                            <span className="bi bi-search" role="status" aria-hidden="true"></span> Search
                          </>
                        )}
                      </button>
                    </div>

                  </form>

                  <div className="exportpdf col-lg-12 m-2">
                    {tableData.length > 0 && (

                      <>
                        <button onClick={handleGenerateExcel} className="btn btn-danger btn-sm mt-10 float-end ms-3" disabled={excelloading}>
                          {excelloading ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...
                            </>
                          ) : (
                            <>
                              <span className="bi bi-file-excel" role="status" aria-hidden="true"></span> Export to Excel
                            </>
                          )}
                        </button>

                        <button onClick={handleGeneratePDF} className="btn btn-success btn-sm mt-10 float-end" disabled={pdfloading}>

                          {pdfloading ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...
                            </>
                          ) : (
                            <>
                              <span className="bi bi-file-pdf" role="status" aria-hidden="true"></span> Export to PDF
                            </>
                          )}

                        </button>


                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="row" ref={dataTableRef}>
                <div className="col-md-12">
                  {showTable && (
                    <DataTable
                      className="custom-data-table"
                      columns={columns}
                      data={tableData}
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

export default StaffReport;







