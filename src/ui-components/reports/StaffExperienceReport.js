import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ZoneDropdown from './ZoneList.js';
import axios from 'axios';
import globalVariables from "../../Global.js";
import Multiselect from 'multiselect-react-dropdown';
import DataTable from "react-data-table-component";
import useAuth from '../../utilities/useAuth';
import  {convertDateFormat} from '../../utilities/dateconverter.js';
import Breadcum from '../Breadcum'; // Corrected import path



const StaffExperienceReport = () => {

  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Staff Service Report', Link: '' },
  ]);
  const auth = useAuth();
  const userType = auth.user.user_type;
  const userId = auth.user.user_id;
  const dataTableRef = useRef(null);
  const [selectedZone, setselectedZone] = useState(null);

  const [selectedSchool, setselectedSchool] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);

  const [schoolList, setSchoolList] = useState([]);

  const [errorMessage, setErrorMessage] = useState('');


  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
 
 
  const [selectedZones, setSelectedZones] = useState([]);



  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);


  const [selectedSchoolCategory, setSelectedSchoolCategory] = useState('');


  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [isYearToActive, setIsYearToActive] = useState(false);
  const [yearToTouched, setYearToTouched] = useState(false);
  const [yeartoerror, setYearToError] = useState('');
  const [yearfromerror, setYearFromError] = useState('');
  const [isYearDisabled, setIsYearDisabled] = useState(false);
  useEffect(() => {
  

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
          selectedZone: selectedZone,
          school_id:userId,
        }
      });
      setSchoolList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parishes:', error);
    }
  };




 
 



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






  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
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


     
      if (userType === 'school_admin' && selectedSchool=='') {
        setErrorMessage('Please select School.');
        setLoading(false);
        
        return;
      }
   

      const form_data = {
        params: {
          zones: selectedZone,
          school: selectedSchool,
          school_category: selectedSchoolCategory,
          year_from: yearFrom,
          year_to: yearTo,

        }
      };


      const response = await axios.get(globalVariables.api_url + '/Reports/search_staff_experience_list', form_data);
      setTableData(response.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      //alert(error.message);
    }
    setLoading(false);
    setErrorMessage('');

  };

  


  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,
       minWidth: '90px'
    },
    { name: "Zone", selector: (row) => row.zone_name, sortable: true, minWidth: '180px' },
    { name: "School Name", selector: (row) => `${row.school_name} , ${row.location}`, sortable: true, minWidth: '280px' },
    {
      name: "Staff Name",
      selector: (row) => row.staff_official_name ,
      sortable: true,
      minWidth: '220px'
    },

    
    { name: "DOB", selector: (row) => convertDateFormat(row.dob), sortable: true, minWidth: '150px' },
    { name: "Age", selector: (row) => row.age, sortable: true, minWidth: '120px' },
    { name: "Gender", selector: (row) =>capitalizeWords(row.gender) , sortable: true, minWidth: '120px' },
   
    { name: "Total Years", selector: (row) => row.total_years, sortable: true, minWidth: '120px' },
 


  ];

 







  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {



      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_experiencelist', {
        params: {
            zones: selectedZone,
            school: selectedSchool,
            school_category: selectedSchoolCategory,
            year_from: yearFrom,
            year_to: yearTo,
        
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
            school_category: selectedSchoolCategory,
            year_from: yearFrom,
            year_to: yearTo,
         
          print: "print"
        },
        responseType: 'blob'
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_experiencelist', form_data);

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


  const handleSchoolCategoryChange = (value) => {
    setSelectedSchoolCategory(value);
  };



  const handleYearToChange = (e) => {
    const value = e.target.value.trim();
    setYearTo(value);
    setYearToTouched(true);
    if (!isNaN(value) && parseInt(value) > 0) {
      if (parseInt(value) <= parseInt(yearFrom)) {
        setIsYearDisabled(true);
        setYearToError('Year To must be greater than Year From');
      } else {
        setYearToError('');
        setIsYearDisabled(false);
      }
    } else {
      setIsYearDisabled(true);
      setYearToError('Please enter a valid year (greater than 0)');
    }
  };

  const handleYearFromChange = (e) => {
    const value = e.target.value.trim();
    if (!isNaN(value) && parseInt(value) > 0) {
      setYearFrom(value);
      setIsYearToActive(true);
      setYearFromError('');
    } else {
      setYearFrom('');
      setYearTo('');
      setIsYearToActive(false);
      setYearToTouched(false);
      setYearFromError('Please enter a valid year (greater than 0)');
    }
  };
  return (
    <>

<Breadcum items={breadcum} title="Staff Service Report" /> {/* Pass breadcum as a prop */}
{/* Rest of your component code */}
      <div className="row">
        <div className="col-lg-12">
          <div className="card">

            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Staff Service Report</h5>
        
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <form className="row g-3" onSubmit={handleSearchClick}>

                  {userType === 'corporate_admin'  &&
                      <div className="col-md-4 col-sm-12">
                        <label className="form-label">Zone<span className="text-danger">*</span></label>
                        <ZoneDropdown
                          className="form-control"
                          value={selectedZone}
                          onSelect={handleZoneSelect}
                          showAllOption={true}

                        />
                      </div>
}
                   

                   
                      <div className="col-md-4 col-sm-12">
                        <label className="form-label">School</label>
                        <select
                          id="parish"
                          className="form-select"
                          value={selectedSchool}
                          onChange={(e) => handleSchoolSelect(e.target.value)} required={userType === 'parish'}>
                          <option value="">Select School</option>
                          {userType === 'corporate_admin'  &&<option value="All">All</option>}

                          {schoolList.map((zone, index) => (
                            <option key={index} value={zone.school_id}>
                              {zone.school_name},{zone.location}
                            </option>
                          ))}
                        </select>
                        {errorMessage && <div className="invalid-feedback d-block">{errorMessage}</div>}
                      </div>

                      <div className="col-md-4 col-sm-12">
                            <label htmlFor="school_cat" class="col-sm-10 form-label">School Category</label>
                           
                           
                              <select
                                id="school_cat"
                                className="form-control"
                                value={selectedSchoolCategory}
                                onChange={(e) => handleSchoolCategoryChange(e.target.value)}
                              >
                                <option value="">Select School Category</option>
                                <option value="All">All Schools</option>
                                <option value="Active">Current School</option> 
                              </select>
                            </div>
                      

                    
                          <div className="row mb-3 bg-light p-1 m-1">
                            <label htmlFor="year" className="col-sm-10 form-label">Year:</label>
                         
                            <div className="form-group col-md-6">
                              <label htmlFor="yearFrom" className="form-label">From</label>
                              <input
                                type="number"
                                id="yearFrom"
                                className="form-control"
                                value={yearFrom}
                                onChange={handleYearFromChange}
                              />
                              {yearfromerror && <div className="error">{yearfromerror}</div>}
                            </div>
                            <div className="form-group col-md-6">
                              <label htmlFor="yearTo" className="form-label">To</label>
                              <input
                                type="number"
                                id="yearTo"
                                className="form-control"
                                value={yearTo}
                                onChange={handleYearToChange}
                                disabled={!isYearToActive}
                                min="1"
                              />
                              {yearToTouched && yeartoerror && <div className="error">{yeartoerror}</div>}
                            </div>
                          </div>

                
    


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

export default StaffExperienceReport;







