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

const filters = [
  { value: 'gender', label: 'School Gender Type' },
  { value: 'school_type', label: 'School Type' },
  { value: 'treasury', label: 'Treasury' },
  { value: 'class_level', label: 'Class Levels' },

];

const SchoolReport = () => {
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'School Report', Link: '' },
  ]);
  const [classlevels, setClasslevels] = useState([]);
  const auth = useAuth();
  const userType = auth.user.user_type;
  const [selectedClassLevels, setSelectedClassLevels] = useState([]);
  const dataTableRef = useRef(null);
  const [selectedZone, setselectedZone] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [gender, setGender] = useState("");
  const [school_type, setSchoolType] = useState("");
  const [treasury, setTreasury] = useState("");

  const [selectedSchoolType, setSelectedSchoolType] = useState('');
  const [selectedtreasury, setSelectedTreasury] = useState('');

  const [classlevel, setSelectedClassLevel] = useState("");
  const [education, setSelectedEducation] = useState("");

  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(['forane']);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedZones, setSelectedZones] = useState([]);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [parishesConvents, setParishesConvents] = useState([]);
  const [classLevel, setClassLevel] = useState([]); // List of qualifications
  const [selectedType, setSelectedType] = useState('');
  const [foranes, setForanes] = useState([]);
  const [selectedForane, setSelectedForane] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setselectedDistrict] = useState('');

  //const [selectedDepartment, setSelectedEducationDept] = useState([]);
  const [EducationDept, setSelectedEducationDept] = useState("");
  const [selectedParish, setSelectedParish] = useState('');
  const [selectedConvent, setSelectedConvent] = useState('');

  const [secondaryOptions, setSecondaryOptions] = useState([]);
  const [deoOptions, setDeoOptions] = useState([]);
  const [aeoOptions, setAeoOptions] = useState([]);
    const [selectedCongregation, setSelectedCongregation] = useState('');

  const handleEducationRemove = (removedList) => {
    setSelectedEducationDept(removedList); // Update state when values are removed
  };
  const handleClassLevelSelect = (selectedList) => {
    setSelectedClassLevels(selectedList);
  };





  useEffect(() => {

    // Scroll to DataTable component when data is fetched
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);



  // Function to fetch class levels
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

  const handleForaneChange = async (e) => {
    const foraneId = e.target.value;
    setSelectedForane(foraneId);
    fetchParishesConvents('parish', foraneId);
  };

  const handleTypeChange = async (e) => {
    const type = e.target.value;
    setSelectedType(type);
    setSelectedForane('');
    setSelectedCongregation('');
    if (type === 'convent') {
      setSelectedParish(''); // Reset parish selection when changing to convent
    }


    // Clear selected convent when switching to parish
    if (type === 'parish') {
      setSelectedConvent(''); // Reset convent selection when changing to parish
    }
    const fetchParishesConvents = async (type, foraneId = '') => {
      try {
        const response = await axios.get(`${globalVariables.api_url}/school/get_parishes_convents`, {
          params: { type, forane_id: foraneId }
        });

        // Assuming response.data is structured as: { status, message, data }
        if (response.data.status) {
          setParishesConvents(response.data.data); // Set only the data array
        } else {
          setParishesConvents([]); // Set an empty array if no data is found
          console.error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching parishes/convents:', error.message);
      }
    };


    if (type === 'parish') {
      try {
        const response = await axios.get(`${globalVariables.api_url}/forane/view_forane`);
        setForanes(response.data.data);
      } catch (error) {
        console.error('Error fetching foranes:', error.message);
      }
    } else if (type === 'convent') {
      try {
        const response = await axios.get(`${globalVariables.api_url}/congregation/get_congregation`);
        setCongregations(response.data.data); 
      } catch (error) {
        console.error('Error fetching foranes:', error.message);
      }

     // fetchParishesConvents(type);
    }
  };




    const [congregations, setCongregations] = useState([]);
  const [congregationConvents, setcongregationConvents] = useState([]);
  const fetchParishesConvents = async (type, foraneId = '') => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_parishes_convents`, {
        params: { type, forane_id: foraneId }
      });

      // Assuming response.data is structured as: { status, message, data }
      if (response.data.status) {
        setParishesConvents(response.data.data); // Set only the data array
      } else {
        setParishesConvents([]); // Set an empty array if no data is found
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching parishes/convents:', error.message);
    }
  };


  useEffect(() => {

    fetchDistricts();
  }, []);


  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_districts`);

      if (response.data.status) {
        setDistricts(response.data.data); // Access the array from the response
      } else {
        setDistricts([]); // Handle the case where no districts are found
      }
    } catch (error) {
      console.error('Error fetching districts:', error.message);
    }
  };



  const handleZoneSelect = (selectedZone) => {
    setselectedZone(selectedZone);
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
      case 'school_type':
        setSchoolType('');
        break;
      case 'treasury':
        setTreasury('');
        break;

      case 'edu_dept':
        setSelectedEducation('');
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
    if (filter === 'school_type') {
      setSelectedSchoolType(''); // 
    }
    if (filter === 'treasury') {
      setSelectedTreasury(''); // 
    }

    if (filter === 'class_level') {
      setSelectedClassLevel(''); // 
    }
    if (filter === 'edu_dept') {
      setSelectedEducation(''); // 
    }



  };



  const handleDistrictSelect = (selectedDistrict) => {
    setSelectedEducationDept("");
    setselectedDistrict(selectedDistrict);
  };
  const capitalizeWords = (str) => {
    return str.toUpperCase();
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    fetchData();

  };

  const fetchData = async () => {

    setLoading(true);
    try {

      if (!selectedZone && userType !== 'parish' && userType !== 'country' && userType !== 'zone' && userType !== 'global') {
        setTableData([]);
        setShowTable(false);
        return;
      }

      const form_data = {
        params: {

          zoneid: selectedZone,
          district: selectedDistrict,
          gender_type: gender,
          classLevels: classlevel,
          EducationDept: EducationDept,
          school_type: selectedSchoolType,
          treasury: selectedtreasury,
          type: selectedType, 
          forane_id: selectedForane,  
          parish_id: selectedParish,  
          convent_id: selectedConvent,
          congregation_id: selectedCongregation,

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




      const response = await axios.get(globalVariables.api_url + '/Reports/search_school', form_data);
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
      selector: (row, index) => index + 1,
      sortable: true,
      minWidth: '90px'
    },
    { name: "Zone", selector: (row) => row.zone_name, sortable: true, minWidth: '160px' },
    { name: "District", selector: (row) => row.district, sortable: true, minWidth: '180px' },
    { name: "School Code", selector: (row) => row.school_code, sortable: true, minWidth: '160px' },

    {
      name: "School Name",
      selector: (row) => `${row.school_name},${row.location}`,
      sortable: true,
      minWidth: '340px'
    },



    { name: "Email", selector: (row) => row.email, sortable: true, minWidth: '250px' },
    { name: "Phone", selector: (row) => row.phone, sortable: true, minWidth: '120px' },
    //
    { name: "School Gender Type", selector: (row) => row.school_gender_type, sortable: true, minWidth: '180px' },
    { name: "School Type", selector: (row) => row.school_type, sortable: true, minWidth: '180px' },
    {
      name: "Class Levels",
      selector: (row) => row.class_level_name,
      sortable: true,
      minWidth: '150px',
    },
    {
      name: "Edu. Department",
      selector: (row) => capitalizeWords(row.dept_type),
      sortable: true,
      minWidth: '170px',
    },
    {
      name: "Edu. Office",
      selector: (row) => row.dept_name,
      sortable: true,
      minWidth: '170px',
    },
    { name: "Treasury", selector: (row) => row.treasury_location, sortable: true, minWidth: '180px' },
    { name: "Type", selector: (row) => capitalizeWords(row.school_category), sortable: true, minWidth: '180px' },
    
  ];


  if (selectedType == 'parish') {
    columns.push(
      { name: "Forane", selector: (row) => row.forane_name, sortable: true, minWidth: '220px' },
      { name: "Parish", selector: (row) => row.parish_name, sortable: true, minWidth: '220px' },
    );
  }

  if (selectedType == 'convent') {
    columns.push(
      { name: "Congregation Name", selector: (row) => row.title, sortable: true, minWidth: '220px' },
      { name: "Convent Name", selector: (row) => row.parish_name, sortable: true, minWidth: '220px' },

    );
  }
  const handleEducationSelect = (selectedList) => {
    setSelectedEducationDept(selectedList);
  };


  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {


      const form_data = {
        params: {
          zoneid: selectedZone,
          district: selectedDistrict,
          gender_type: gender,
          classLevels: classlevel,
          EducationDept: EducationDept,
          school_type: selectedSchoolType,
          treasury: selectedtreasury,
          type: selectedType, 
          forane_id: selectedForane,  
          parish_id: selectedParish,  
          convent_id: selectedConvent,
          congregation_id: selectedCongregation,
          excel: "excel"
        }
      };

      // Add the department-specific ID based on the selected EducationDept
      if (EducationDept === "rdd") {
        form_data.params.rdd_id = secondaryDropdown; // Assuming `secondaryDropdown` holds the selected RDD value
      } else if (EducationDept === "deo") {
        form_data.params.deo_id = deoDropdown; // Assuming `deoDropdown` holds the selected DEO value
      } else if (EducationDept === "aeo") {
        form_data.params.aeo_id = aeoDropdown; // Assuming `aeoDropdown` holds the selected AEO value
      } else if (EducationDept === "dde") {
        form_data.params.dde_id = secondaryDropdown; // Assuming `secondaryDropdown` holds the selected DDE value
      }

      // Send the request with updated form_data
      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_school', {
        ...form_data, // Spread the updated form_data object
        responseType: 'blob'
      });

      // Create a new Blob object using the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create a URL for the Blob object
      const url = window.URL.createObjectURL(blob);

      // Create a link element and trigger a download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'school_report.xlsx'); // Use .xlsx extension if the file is in .xlsx format
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

          zoneid: selectedZone,
          district: selectedDistrict,
          gender_type: gender,
          classLevels: classlevel,
          EducationDept: EducationDept,
          school_type: selectedSchoolType,
          treasury: selectedtreasury,
          type: selectedType, 
          forane_id: selectedForane,  
          parish_id: selectedParish,  
          convent_id: selectedConvent,
          congregation_id: selectedCongregation,
          print: "print"
        },
        responseType: 'blob'
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




      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_school', form_data);

      // Handle the response, for example, trigger a file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'school_report.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };

  const handleChange = (event) => {
    if (event.target.id === 'school_type') {
      setSelectedSchoolType(event.target.value);  // Update selected school type

    }
    else if (event.target.id === 'treasury') {
      setSelectedTreasury(event.target.value);  // Update selected school type

    }
    if (selectedType === 'parish') {
      setSelectedParish(event.target.value);
    } else if (selectedType === 'convent') {
      setSelectedConvent(event.target.value);
    }

  };



  const [secondaryDropdown, setSecondaryDropdown] = useState("");

  const handleChangeedu = (e) => {
    setSecondaryDropdown(e.target.value); // ✅ Update state when dropdown changes
  };

  const handleDepartmentChange = async (e) => {
    const selectedDept = e.target.value; // Get selected value
    setSelectedEducationDept(selectedDept); // Update state

    console.log("Selected Department:", selectedDept); // Debugging log

    if (!selectedDistrict) {
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
    }
  };
  const [ddeDropdown, setDdeDropdown] = useState("");
  const [deoDropdown, setDeoDropdown] = useState("");
  const [aeoDropdown, setAeoDropdown] = useState("");

  // Reset dropdowns when EducationDept changes
  useEffect(() => {
    setDdeDropdown("");
    setDeoDropdown("");
    setAeoDropdown("");
    setDeoOptions([]);
    setAeoOptions([]);
  }, [EducationDept]);

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
      }
    }

    if (name === "aeoDropdown") {
      setAeoDropdown(value);
    }
  };



  const handleChangedeo12 = async (e) => {
    const { name, value } = e.target;

    if (name === "ddeDropdown") {
      setDdeDropdown(value); // ✅ Update DDE selection

      if (!value) {
        setDeoOptions([]); // Clear DEO options if no DDE is selected
        return;
      }

      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_dde`,
          {
            params: { dept_type: "deo", dde_id: value },
          }
        );

        setDeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching DEO options:", error);
        setDeoOptions([]);
      }
    }

    if (name === "deoDropdown") {
      setDeoDropdown(value); // ✅ Update DEO selection
    }
  };



  const handleChangedeo1 = async (e) => {
    const { name, value } = e.target;



    // Fetch DEO options if DDE value changes
    if (name === "ddeDropdown") {
      setDeoDropdown(value);
      if (!value) {
        setDeoOptions([]); // Clear DEO options if no DDE is selected
        return;
      }

      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_dde`,
          {
            params: { dept_type: "deo", dde_id: value },
          }
        );

        setDeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching DEO options:", error);
        setDeoOptions([]);
      }
    }
  };

  const handleChangeaeo12 = async (e) => {
    const { name, value } = e.target;

    if (name === "deoDropdown") {
      setDeoDropdown(value); // ✅ Update DEO selection
      setAeoDropdown(""); // ✅ Reset AEO when DEO changes

      if (!value) {
        setAeoOptions([]); // Clear AEO options if no DEO is selected
        return;
      }

      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_aeo_options`,
          { params: { deo_id: value } }
        );

        setAeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching AEO options:", error);
        setAeoOptions([]);
      }
    }

    if (name === "aeoDropdown") {
      setAeoDropdown(value); // ✅ Update AEO selection
    }
  };

  const handleChangeaeo1 = async (e) => {
    const { name, value } = e.target;

    // Update form data

    // Fetch AEO options if DEO changes
    if (name === "deoDropdown") {
      setAeoDropdown(value);
      if (!value) {
        setAeoOptions([]); // Clear AEO options if no DEO is selected
        return;
      }

      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_aeo_options`,
          { params: { deo_id: value } }
        );

        setAeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching AEO options:", error);
        setAeoOptions([]);
      }
    }
  };

  const fetchAllTreasury = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/treasury/view_treasury`);

      if (response.data.status) {
        setTreasury(response.data.data);
      } else {
        setTreasury([]);
      }
    } catch (error) {
      console.error('Error fetching treasuries:', error.message);
    }

  };
  useEffect(() => {
    fetchAllTreasury();
  }, []);
  const fetchCongregationConvents = async (type, congregationId = '') => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/getConvents`, {
        params: { type, congregation_id: congregationId }
      });
      
      if (response.data.status) {
        setcongregationConvents(response.data.data); 
      } else {
        setcongregationConvents([]); 
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching convents:', error.message);
    }
  };
  
  const handleCongregationChange = async (e) => {
    const congregationId = e.target.value;
    setSelectedCongregation(congregationId);
    fetchCongregationConvents('convent', congregationId);
  };


  return (
    <>

      <Breadcum items={breadcum} title="School Report" /> {/* Pass breadcum as a prop */}
      {/* Rest of your component code */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card">

            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>School Report</h5>
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


                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Zone<span className="text-danger">*</span></label>
                      <ZoneDropdown
                        className="form-control"
                        value={selectedZone}
                        onSelect={handleZoneSelect}
                        showAllOption={true}

                      />
                    </div>



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

                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Type</label>
                      <select
                        id="type"
                        className="form-control"
                        name="type"
                        value={selectedType} // Controlled component
                        onChange={handleTypeChange}
                      >
                        <option value="">Select Type</option>
                        <option value="All">All</option>
                        <option value="parish">Parish</option>
                        <option value="convent">Convent</option>
                        <option value="procurator">Procurator</option>
                        <option value="general">General</option>
                        
                      </select>
                    </div>



                    {/* 
                    <div className="mb-3">
                      <label className="form-label">Type<span className="text-danger">*</span></label>

                      <div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="type"
                            id="typeParish"
                            value="parish"
                            checked={selectedType === 'parish'}
                            onChange={handleTypeChange}
                          />
                          <label className="form-check-label" htmlFor="typeParish">Parish</label>
                        </div>
                        <div className="form-check form-check-inline">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="type"
                            id="typeConvent"
                            value="convent"


                            checked={selectedType === 'convent'}
                            onChange={handleTypeChange}
                          />
                          <label className="form-check-label" htmlFor="typeConvent">Convent</label>
                        </div>
                      </div>

                    </div> */}


                    {selectedType === 'parish' && (
                      <div className="col-md-6 col-sm-12">
                        <label htmlFor="forane_id" className="form-label">Forane <span className="text-danger">*</span></label>
                        <select
                          className="form-control"
                          id="forane_id"
                          name="forane_id"
                          value={selectedForane}
                          onChange={handleForaneChange} required
                        >
                          <option value="">Select Forane</option>
                          <option value="All">All</option>
                          {foranes.map(forane => (
                            <option key={forane.forane_id} value={forane.forane_id}>{forane.forane_name}</option>
                          ))}
                        </select>

                      </div>
                    )}

                    {selectedType === 'parish' && selectedForane && (
                      <div className="col-md-6 col-sm-12">
                        <label htmlFor="fk_parish_covent_id" className="form-label">Parish <span className="text-danger">*</span></label>
                        <select
                          className="form-control"
                          id="fk_parish_covent_id"
                          name="fk_parish_covent_id"
                          value={selectedParish}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Parish</option>
                          <option value="All">All</option>
                          {parishesConvents.map(parish => (
                            <option key={parish.parish_id} value={parish.parish_id}>{parish.parish_name} ,{parish.location	}</option>
                          ))}
                        </select>
                      </div>
                    )}


                     {/* Congregation Dropdown for Convent */}
        {selectedType === 'convent' && (
          <div className="col-md-6 col-sm-12">
            <label htmlFor="congregation_id" className="form-label">
              Congregation <span className="text-danger">*</span>
            </label>
            <select
              className="form-control"
              id="congregation_id"
              name="congregation_id"
              value={selectedCongregation}
              onChange={handleCongregationChange}
              required
            >
              <option value="">Select Congregation</option>
              <option value="All">All</option>
              {congregations.map(congregation => (
                <option 
                  key={congregation.congregation_id} 
                  value={congregation.congregation_id}
                >
                  {congregation.title}
                </option>
              ))}
            </select>
          </div>
        )}

                    {selectedType === 'convent' && selectedCongregation && (
                      <div className="col-md-6 col-sm-12">
                        <label htmlFor="fk_parish_covent_id" className="form-label">Convent <span className="text-danger">*</span></label>
                        <select
                          className="form-control"
                          id="fk_parish_covent_id"
                          name="fk_parish_covent_id"
                          value={selectedConvent}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Convent</option>
                          <option value="All">All</option>
                          {congregationConvents.map(convent => (
        <option key={convent.parish_id} value={convent.parish_id}>
          {convent.parish_name}, {convent.location}
        </option>
      ))}
                        </select>
                      </div>
                    )}
                    <div className="col-md-6 col-sm-12">

                      <label htmlFor="edu_dept" className="col-sm-6 form-label">
                        Education Department:
                      </label>


                      <div className="col-sm-12">
                        <select
                          id="dept_type"
                          className="form-control"
                          name="dept_type"
                          value={EducationDept} // Controlled component
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
                    </div>


                    {/* Secondary Dropdown - Visible only for RDD or DDE */}
                    {["rdd", "dde"].includes(EducationDept || "") && (

                      <div className="col-md-6 col-sm-12">
                        <div className="row mb-3 bg-light p-1 m-1">
                          <label htmlFor="edu_dept" className="col-sm-6 form-label">
                            {EducationDept.toUpperCase()} Details
                          </label>


                          <select
                            id="secondary-dropdown"
                            className="form-control"
                            name="secondaryDropdown"
                            value={secondaryDropdown} // Controlled component
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

                        </div></div>
                    )}
                    {EducationDept === "deo" && (
                      <div>
                        {/* DDE Details Dropdown */}
                        <div className="col-md-6 col-sm-12">
                          <label htmlFor="edu_dept" className="col-sm-6 form-label">
                            DDE Details
                          </label>
                          <select
                            id="dde-dropdown"
                            className="form-control"
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
                          <label htmlFor="edu_dept" className="col-sm-6 form-label">
                            DEO Details
                          </label>
                          <select
                            id="deo-dropdown"
                            className="form-control"
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
                      </div>
                    )}

                    {EducationDept === "aeo" && (
                      <div>
                        {/* DDE Details Dropdown */}
                        <div className="col-md-6 col-sm-12">

                          <label htmlFor="dde-dropdown" className="col-sm-6 form-label">
                            DDE Details <span className="text-danger"></span>
                          </label>
                          <select
                            id="dde-dropdown"
                            className="form-control"
                            name="ddeDropdown"
                            value={ddeDropdown}
                            onChange={handleChangedeo} // Handle change for DDE dropdown
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
                          <label htmlFor="deo-dropdown" className="col-sm-6 form-label">
                            DEO Details <span className="text-danger"></span>
                          </label>
                          <select
                            id="deo-dropdown"
                            className="form-control"
                            name="deoDropdown"
                            value={deoDropdown}
                            onChange={handleChangeaeo} // Handle change for DEO dropdown
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
                          <label htmlFor="aeo-dropdown" className="col-sm-6 form-label">
                            AEO Details <span className="text-danger"></span>
                          </label>
                          <select
                            id="aeo-dropdown" // Changed ID to avoid conflict with DEO dropdown
                            className="form-control"
                            name="aeoDropdown" // Updated name for clarity
                            value={aeoDropdown} // Updated to use the correct state
                            onChange={handleChangeaeo} // Generic change handler for AEO
                          >
                            <option value="">Select AEO Option</option>
                            <option value="All">All</option>
                            {aeoOptions.map((option) => ( // Assuming `aeoOptions` holds the AEO data
                              <option key={option.dept_id} value={option.dept_id}>
                                {option.office_name}
                              </option>
                            ))}
                          </select>

                        </div>
                      </div>
                    )}


                    {errorMessage && <div className="invalid-feedback d-block">{errorMessage}</div>}


                    {selectedFilters.map((filter) => (
                      <div key={filter} className="row form-fields">
                        {filter === 'gender' && (

                          <div class="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="gender" class="col-sm-10  form-label">School Gender Type:</label>
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
                                <option value="boys">Boys</option>
                                <option value="girls">Girls</option>
                                <option value="Co-education">Co-education</option>
                              </select> </div>
                          </div>
                        )}

                        {filter === 'school_type' && (

                          <div class="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="school_type" class="col-sm-10  form-label">School Type:</label>
                            <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('school_type')}>x</label>
                            <div class="col-sm-12">
                              <select
                                id="school_type"
                                className="form-control"
                                value={selectedSchoolType}
                                onChange={handleChange}
                              >
                                <option value="">Select School Type</option>
                                <option value="All">All</option>
                                <option value="School">School</option>
                                <option value="TTI">TTI (Teachers Training Institute)</option>
                              </select> </div>
                          </div>
                        )}

                        {filter === 'treasury' && (

                          <div class="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="treasury" class="col-sm-10  form-label">Treasury:</label>
                            <label className="col-sm-2 text-end" onClick={() => handleCloseFilter('treasury')}>x</label>
                            <div class="col-sm-12">
                              <select
                                id="treasury"
                                className="form-control"
                                value={selectedtreasury}
                                onChange={handleChange}
                              >
                                <option value="">Select treasury</option>
                                <option value="All">All</option>
                                {treasury.map((treasure) => (
                                  <option key={treasure.treasury_id} value={treasure.treasury_id}>
                                    {treasure.treasury_location}
                                  </option>
                                ))}
                              </select> </div>
                          </div>
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
                        {errorMessage && <div className="invalid-feedback d-block">{errorMessage}</div>}




                        {errorMessage && <div className="invalid-feedback d-block">{errorMessage}</div>}


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
                        <button onClick={handleGenerateExcel} className="btn btn-danger btn-sm mt-10 float-end ms-3 me-2" disabled={excelloading}>
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

                        <button onClick={handleGeneratePDF} className="btn btn-success btn-sm mt-10 float-end ms-3 me-2" disabled={pdfloading}>

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
                            {/* You can add actions related to selectable rows here */}
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

export default SchoolReport;







