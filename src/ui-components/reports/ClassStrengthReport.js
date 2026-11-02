import React, { useState, useEffect, useRef } from 'react';
import ZoneDropdown from './ZoneList.js';
import axios from 'axios';
import globalVariables from "../../Global.js";
import useAuth from '../../utilities/useAuth';
import Breadcum from '../Breadcum';

const ClassStrengthReport = () => {
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Class Strength Report', Link: '' },
  ]);
 
  const auth = useAuth();
  const userType = auth.user.user_type;
  const dataTableRef = useRef(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [gender, setGender] = useState("");
    const [classDetails, setClassDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [EducationDept, setSelectedEducationDept] = useState("");
  const [schoolList, setSchoolList] = useState([]);
  const [secondaryOptions, setSecondaryOptions] = useState([]);
  const [deoOptions, setDeoOptions] = useState([]);
  const [aeoOptions, setAeoOptions] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [filteredSchoolList, setFilteredSchoolList] = useState([]);
  const [secondaryDropdown, setSecondaryDropdown] = useState("");
  const [ddeDropdown, setDdeDropdown] = useState(""); 
  const [deoDropdown, setDeoDropdown] = useState(""); 
  const [aeoDropdown, setAeoDropdown] = useState("");
  const [classes, setClasses] = useState([]);
  const [totalData, setTotalData] = useState({});
  
  useEffect(() => {
    // Scroll to DataTable component when data is fetched
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);

  // Fetch academic years on component mount
  useEffect(() => {
    fetchAcademicYears();
  }, []);

  // Reset dropdowns when EducationDept changes
  useEffect(() => {
    setDdeDropdown("");
    setDeoDropdown("");
    setAeoDropdown("");
    setDeoOptions([]);
    setAeoOptions([]);
    setSecondaryDropdown("");
  }, [EducationDept]);

  // Fetch schools when zone changes
  useEffect(() => {
    if (selectedZone !== undefined && selectedZone !== '') {
      fetchSchools(selectedZone);
    }
  }, [selectedZone, userType]);

  const handleSchoolSelect = (selectedSchool) => {
    setSelectedSchool(selectedSchool);
  };

  const handleZoneSelect = (zoneId) => {
    setSelectedZone(zoneId);
    setSelectedDistrict('');
    setSelectedSchool('');
    
    // Fetch schools based on the selected zone
    fetchSchools(zoneId);
  };

  const handleDistrictSelect = (district) => {
    setSelectedDistrict(district);
    setSelectedSchool('');
    
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

 
  const handleSearchClick = (event) => {
    event.preventDefault();
    fetchData();
  };
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const form_data = {
        params: {
          zoneid: selectedZone,
          district: selectedDistrict,
          academic_year_id: selectedYear,
          school: selectedSchool,
          EducationDept: EducationDept,
        }
      };
  
      if (EducationDept === "rdd") {
        form_data.params.rdd_id = secondaryDropdown;
      } else if (EducationDept === "deo") {
        form_data.params.deo_id = deoDropdown;
      } else if (EducationDept === "aeo") {
        form_data.params.aeo_id = aeoDropdown;
      } else if (EducationDept === "dde") {
        form_data.params.dde_id = secondaryDropdown;
      }
  
      const response = await axios.get(globalVariables.api_url + '/Reports/search_class_student_strength', form_data);
      
      if (response.data.status) {
        setClassDetails(response.data.data);
        
        // Format the data and set state variables
        const { formattedData, totals } = formatResponseData(response.data.data);
        
        // Set the formatted data to tableData state
        setTableData(formattedData);
        
        // Set the totals data
        setTotalData(totals);
        
        // Extract class names and set to classes state - make sure to sort them
        const classNames = Object.keys(formattedData);
        setClasses(classNames);
        
        // Show the table
        setShowTable(true);
      } else {
        // Handle case where status is false
        setErrorMessage(response.data.message || 'No data found');
        setShowTable(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('Failed to fetch data. Please try again.');
      setShowTable(false);
    }
    setLoading(false);
  };
  const fetchData12 = async () => {
    setLoading(true);
    try {
     
      const form_data = {
        params: {
          zoneid: selectedZone,
          district: selectedDistrict,
          academic_year_id: selectedYear,
          school: selectedSchool,
          EducationDept: EducationDept,
        }
      };

      if (EducationDept === "rdd") {
        form_data.params.rdd_id = secondaryDropdown;
      } else if (EducationDept === "deo") {
        form_data.params.deo_id = deoDropdown;
      } else if (EducationDept === "aeo") {
        form_data.params.aeo_id = aeoDropdown;
      } else if (EducationDept === "dde") {
        form_data.params.dde_id = secondaryDropdown;
      }
      


        const response = await axios.get(globalVariables.api_url + '/Reports/search_class_student_strength', form_data);
      
      if (response.data.status) {
        const { formattedData, totals } = formatResponseData(response.data.data);
        setClassDetails(response.data.data);


        
      }
     


    


    } catch (error) {
      console.error('Error fetching data:', error);
     // setErrorMessage('Failed to fetch data. Please try again.');
    }
    setLoading(false);
  };
  
  const formatResponseData = (data) => {
    const formattedData = {};
    const totals = {
      Science: { Boys: 0, Girls: 0, CS: 0, NCS: 0 },
      ComputerScience: { Boys: 0, Girls: 0, CS: 0, NCS: 0 },
      Commerce: { Boys: 0, Girls: 0, CS: 0, NCS: 0 },
      Humanities: { Boys: 0, Girls: 0, CS: 0, NCS: 0 },
      Total: { Boys: 0, Girls: 0, CS: 0, NCS: 0 }
    };
  
    // Process each school
    data.forEach(school => {
      if (school.student_strength && Array.isArray(school.student_strength)) {
        // Process student strength data for each class
        school.student_strength.forEach(item => {
          const className = item.class_name;
          let division = item.division;
          
          // Handle division mapping for classes I to X with divisions A, B, C, D
          if (["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"].includes(className)) {
            // Map divisions A, B, C, D to our table columns
            if (division === "A") {
              division = "Science";
            } else if (division === "B") {
              division = "ComputerScience";
            } else if (division === "C") {
              division = "Commerce";
            } else if (division === "D") {
              division = "Humanities";
            }
          } else {
            // For classes XI and XII, normalize division names
            division = division.replace('-', ''); // Convert "Computer-Science" to "ComputerScience"
          }
          
          // Initialize class in formattedData if not exists
          if (!formattedData[className]) {
            formattedData[className] = {
              Science: { Boys: 0, Girls: 0, CS: 0, NCS: 0 },
              ComputerScience: { Boys: 0, Girls: 0, CS: 0, NCS: 0 },
              Commerce: { Boys: 0, Girls: 0, CS: 0, NCS: 0 },
              Humanities: { Boys: 0, Girls: 0, CS: 0, NCS: 0 },
              Total: { Boys: 0, Girls: 0, CS: 0, NCS: 0 }
            };
          }
          
          // Parse numeric values
          const boys = parseInt(item.strength_boys) || 0;
          const girls = parseInt(item.strength_girls) || 0;
          const cs = parseInt(item.strength_cs) || 0;
          const ncs = parseInt(item.strength_ncs) || 0;
          
          // Only add data if the division is one of our standard divisions
          if (["Science", "ComputerScience", "Commerce", "Humanities"].includes(division)) {
            // Add to division totals
            formattedData[className][division].Boys += boys;
            formattedData[className][division].Girls += girls;
            formattedData[className][division].CS += cs;
            formattedData[className][division].NCS += ncs;
            
            // Add to class totals
            formattedData[className].Total.Boys += boys;
            formattedData[className].Total.Girls += girls;
            formattedData[className].Total.CS += cs;
            formattedData[className].Total.NCS += ncs;
            
            // Add to overall division totals
            totals[division].Boys += boys;
            totals[division].Girls += girls;
            totals[division].CS += cs;
            totals[division].NCS += ncs;
            
            // Add to overall totals
            totals.Total.Boys += boys;
            totals.Total.Girls += girls;
            totals.Total.CS += cs;
            totals.Total.NCS += ncs;
          }
        });
      }
    });
    
    // Sort classes in correct order
    const sortedData = {};
    const classOrder = [
      "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"
    ];
    
    classOrder.forEach(className => {
      if (formattedData[className]) {
        sortedData[className] = formattedData[className];
      }
    });
    
    return { formattedData: sortedData, totals };
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

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/Reports/get_academic_years`);
      if (response.data.status) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error.message);
      setErrorMessage('Failed to fetch academic years. Please try again.');
    }
  };

  const handleAcademicYearSelect = (selectedYear) => {
    setSelectedYear(selectedYear);
  };

  const fetchSchools = async (selectedZone) => {
    try {
      const response = await axios.get(globalVariables.api_url + '/school/get_schools_zone', {
        params: {
          userType: userType,
          selectedZone: selectedZone,
        }
      });
      
      const schools = response.data.data || [];
      setSchoolList(schools);
      setFilteredSchoolList(schools); // Set filtered list to all schools initially
      
      // Extract unique districts from fetched schools
      if (schools.length > 0) {
        const uniqueDistricts = [...new Set(schools.map(school => school.district))];
        setDistricts(['All', ...uniqueDistricts]);
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

  return (
    <>
      <Breadcum items={breadcum} title="Class Strength Report" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Class Strength Report</h5>
            </div>

            <div className="card-body">
              {errorMessage && (
                <div className="alert alert-danger" role="alert">
                  {errorMessage}
                  <button type="button" className="btn-close" onClick={() => setErrorMessage('')}></button>
                </div>
              )}

              <div className="row">
                <div className="col-md-12">
                  <form className="row g-3" onSubmit={handleSearchClick}>
                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">Academic Year<span className="text-danger">*</span></label>
                      <select
                        id="academic_year_id"
                        className="form-select"
                        value={selectedYear}
                        onChange={(e) => handleAcademicYearSelect(e.target.value)} required>
                        <option value="">Select Year</option>
                        {academicYears.map((year, index) => (
                          <option key={index} value={year.academic_year_id}>
                            {year.year_label}
                          </option>
                        ))}
                      </select>
                    </div>

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
                        {districts.map((d, index) => (
                          <option key={index} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 col-sm-12">
                      <label className="form-label">School</label>
                      <select
                        id="school"
                        className="form-select"
                        value={selectedSchool}
                        onChange={(e) => handleSchoolSelect(e.target.value)}>
                        <option value="">Select School</option>
                        <option value="All">All</option>
                        {filteredSchoolList.map((school, index) => (
                          <option key={index} value={school.school_id}>
                            {school.location} {school.school_name}
                          </option>
                        ))}
                      </select>
                    </div>

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
                    <div className="col-md-12 mt-3">
                      <button
                        type="submit"
                        className="btn btn-primary"
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
                </div>
              </div>
              
              <div className="row mt-4" ref={dataTableRef}>
              <div className="col-md-12">
  {/* Debug section */}
  {showTable && (
    <div className="mt-3">
      <details>
        <summary>Debug Data (click to expand)</summary>
        <pre>{JSON.stringify({
          classes: classes,
          hasData: classes.length > 0,
          tableData: tableData
        }, null, 2)}</pre>
      </details>
    </div>
  )}
  
  {/* Loading indicator */}
  {loading && (
    <div className="text-center">
      <span className="spinner-border" role="status" aria-hidden="true"></span> Loading...
    </div>
  )}
  
  {/* Table section - only show if showTable is true AND we have classes */}
  {showTable && classes.length > 0 && (
    <div className="table-responsive">
      <h4 className="text-center mb-3">Class Strength Report</h4>
      <table className="table table-bordered table-striped">
        <thead className="bg-primary text-white">
          <tr>
            <th rowSpan="2" className="align-middle">Class</th>
            <th colSpan="16" className="text-center">Batches</th>
            <th colSpan="4" className="text-center">Total Strength</th>
          </tr>
          <tr>
            <th colSpan="4" className="text-center">Science</th>
            <th colSpan="4" className="text-center">Computer Science</th>
            <th colSpan="4" className="text-center">Commerce</th>
            <th colSpan="4" className="text-center">Humanities</th>
            <th>Boys</th>
            <th>Girls</th>
            <th>CS</th>
            <th>NCS</th>
          </tr>
          <tr>
            <th></th>
            <th>Boys</th>
            <th>Girls</th>
            <th>CS</th>
            <th>NCS</th>
            <th>Boys</th>
            <th>Girls</th>
            <th>CS</th>
            <th>NCS</th>
            <th>Boys</th>
            <th>Girls</th>
            <th>CS</th>
            <th>NCS</th>
            <th>Boys</th>
            <th>Girls</th>
            <th>CS</th>
            <th>NCS</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        
        <tbody>
          {/* Render each class row */}
          {classes.map((className) => (
            <tr key={className}>
              <td>{className}</td>
              <td>{tableData[className]?.Science?.Boys || 0}</td>
              <td>{tableData[className]?.Science?.Girls || 0}</td>
              <td>{tableData[className]?.Science?.CS || 0}</td>
              <td>{tableData[className]?.Science?.NCS || 0}</td>
              
              <td>{tableData[className]?.ComputerScience?.Boys || 0}</td>
              <td>{tableData[className]?.ComputerScience?.Girls || 0}</td>
              <td>{tableData[className]?.ComputerScience?.CS || 0}</td>
              <td>{tableData[className]?.ComputerScience?.NCS || 0}</td>
              
              <td>{tableData[className]?.Commerce?.Boys || 0}</td>
              <td>{tableData[className]?.Commerce?.Girls || 0}</td>
              <td>{tableData[className]?.Commerce?.CS || 0}</td>
              <td>{tableData[className]?.Commerce?.NCS || 0}</td>
              
              <td>{tableData[className]?.Humanities?.Boys || 0}</td>
              <td>{tableData[className]?.Humanities?.Girls || 0}</td>
              <td>{tableData[className]?.Humanities?.CS || 0}</td>
              <td>{tableData[className]?.Humanities?.NCS || 0}</td>
              
              <td>{tableData[className]?.Total?.Boys || 0}</td>
              <td>{tableData[className]?.Total?.Girls || 0}</td>
              <td>{tableData[className]?.Total?.CS || 0}</td>
              <td>{tableData[className]?.Total?.NCS || 0}</td>
            </tr>
          ))}
          
          {/* Total row */}
          {totalData && (
            <tr className="fw-bold bg-light">
              <td>Total</td>
              <td>{totalData?.Science?.Boys || 0}</td>
              <td>{totalData?.Science?.Girls || 0}</td>
              <td>{totalData?.Science?.CS || 0}</td>
              <td>{totalData?.Science?.NCS || 0}</td>
              
              <td>{totalData?.ComputerScience?.Boys || 0}</td>
              <td>{totalData?.ComputerScience?.Girls || 0}</td>
              <td>{totalData?.ComputerScience?.CS || 0}</td>
              <td>{totalData?.ComputerScience?.NCS || 0}</td>
              
              <td>{totalData?.Commerce?.Boys || 0}</td>
              <td>{totalData?.Commerce?.Girls || 0}</td>
              <td>{totalData?.Commerce?.CS || 0}</td>
              <td>{totalData?.Commerce?.NCS || 0}</td>
              
              <td>{totalData?.Humanities?.Boys || 0}</td>
              <td>{totalData?.Humanities?.Girls || 0}</td>
              <td>{totalData?.Humanities?.CS || 0}</td>
              <td>{totalData?.Humanities?.NCS || 0}</td>
              
              <td>{totalData?.Total?.Boys || 0}</td>
              <td>{totalData?.Total?.Girls || 0}</td>
              <td>{totalData?.Total?.CS || 0}</td>
              <td>{totalData?.Total?.NCS || 0}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )}
  
  {/* No data message */}
  {showTable && classes.length === 0 && (
    <div className="alert alert-info">
      No data found for the selected criteria.
    </div>
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

export default ClassStrengthReport;







