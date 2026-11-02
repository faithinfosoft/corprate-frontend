import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import globalVariables from "../../Global.js";
import Multiselect from 'multiselect-react-dropdown';
import DataTable from "react-data-table-component";
import useAuth from '../../utilities/useAuth';
import Breadcum from '.././Breadcum';
import { convertDateFormat } from '../../utilities/dateconverter';
import ZoneDropdown from './ZoneList.js';
const VaccancyReport = () => {

    const [breadcum] = useState([
        { Title: 'Home', Link: '/' },
        { Title: 'Vaccancy Report', Link: '' },
      ]);
      const [academicYears, setAcademicYears] = useState([]);
  const auth = useAuth();
  const userType = auth.user.user_type;
  const dataTableRef = useRef(null);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  
  
  const [isDisabled, setIsDisabled] = useState(false);
  const [schoolList, setSchoolList] = useState([]);
    const [designations, setDesignations] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState(['forane']);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);     
 const [selectedZone, setselectedZone] = useState(null);
  const handleZoneSelect = (selectedZone) => {
    setselectedZone(selectedZone);
  };
  
useEffect(() => {

fetchDesignations();

    // Scroll to DataTable component when data is fetched
    if (showTable && dataTableRef.current) {
      dataTableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTable]);

 useEffect(() => {
    
      if (selectedZone !== undefined) {
        fetchSchools(selectedZone);
      }
    }, [selectedZone, userType]);
  
  const fetchSchools = async (selectedZone) => {
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
 

  const fetchDesignations = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/designations/view`);
        if (response.data.status) {
          setDesignations(response.data.data);
        }
    } catch (error) {
        console.error('Error fetching schools:', error);
      
    }
  };
  const handleSchoolSelect = (selectedSchool) => {
    setSelectedSchool(selectedSchool);
  };

  const handleDesignationSelect = (selectedDesignation) => {
    setSelectedDesignation(selectedDesignation);
  };

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const handleSearchClick = (event) => {
    event.preventDefault();
    fetchData();

  };
  const handleStartDateChange = (date) => {
         setStartDate(date);
       };
      
       const handleEndDateChange = (date) => {
         setEndDate(date);
       };

  const fetchData = async () => {
    setLoading(true);
    try {

    
      const form_data = {
        params: {
          zone_id: selectedZone,
          school_id: selectedSchool,
          designation_id:  selectedDesignation,
          start_date: convertDateFormat(startDate),
          end_date:  convertDateFormat(endDate),
        }
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_vacancy', form_data);
      setTableData(response.data);
      setShowTable(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(error.message);
    }
    setLoading(false);
  };

  const isFilterSelected = (filterValue) => selectedFilters.includes(filterValue);




  const columns = [
    {
      name: "Sl No.",
      selector: (row, index) => index + 1,
      sortable: true,minWidth: '80px'
    },
    { name: "School", selector: (row) => row.forane_name, sortable: true, minWidth: '180px' },
    
    {
      name: "Title",
      selector: (row) => row.vacancy_title,
      sortable: true,
      minWidth: '200px'
    },
    { name: "Description", selector: (row) => row.vacancy_remarks, sortable: true, minWidth: '280px' },
    { name: "Start Date", selector: (row) => convertDateFormat(row.vacancy_start_date), sortable: true, minWidth: '100px' },
    { name: "End Date", selector: (row) => convertDateFormat(row.vacancy_end_date), sortable: true, minWidth: '100px' },
    { name: "Status", selector: (row) => row.vacancy_status, sortable: true, minWidth: '100px' },
    
  ];


  const handleGenerateExcel = async () => {
    setExcelLoading(true);
    try {



      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_vacancies', {
        params: {
          
          zone_id: selectedZone,
          school_id: selectedSchool,
          designation_id:  selectedDesignation,
          start_date: convertDateFormat(startDate),
          end_date:  convertDateFormat(endDate),
          
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
      link.setAttribute('download', 'vacancyreport.xlsx'); // Use .xlsx extension if the file is in .xlsx format
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
         
          zone_id: selectedZone,
          school_id: selectedSchool,
          designation_id:  selectedDesignation,
          start_date: convertDateFormat(startDate),
          end_date:  convertDateFormat(endDate),
            
          print: "print"
        },
        responseType: 'blob'
      };

      const response = await axios.get(globalVariables.api_url + '/Reports/search_reports_vacancies', form_data);

      // Handle the response, for example, trigger a file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'vacancyreport.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };


  return (
    <>
      <Breadcum items={breadcum} title="Vaccancy Report" />

      <div className="row">
        <div className="col-lg-12">
          <div className="card">

            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>Vaccancy Details Report</h5>

            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-12">
                  <form className="row g-3" onSubmit={handleSearchClick}>

                 

     <div className="col-md-4 col-sm-12">
                                         <label className="form-label"><span className="text-danger">*</span>Zone</label>
                                         <ZoneDropdown
                                           className="form-control"
                                           value={selectedZone}
                                           onSelect={handleZoneSelect}
                                           showAllOption={true}
                 
                                         />
                                       </div>
                                    
                 
                                    
                                       <div className="col-md-4 col-sm-12">
                                         <label className="form-label">School</label>
                                         <select
                                           id="parish"
                                           className="form-select"
                                           value={selectedSchool}
                                           onChange={(e) => handleSchoolSelect(e.target.value)} required={userType === 'parish'}>
                                           <option value="">Select School</option>
                                           {userType !== 'zone' && userType !== 'country' && userType !== 'parish' && <option value="All">All</option>}
                 
                                           {schoolList.map((school, index) => (
                                             <option key={index} value={school.school_id}>
                                               {school.school_name},{school.location}
                                             </option>
                                           ))}
                                         </select>
                                       </div>

                      

<div className="col-md-4 col-sm-12">
                        <label className="form-label">Designation</label>
                        <select
                          id="academic_year_id"
                          className="form-select"
                          value={selectedDesignation}
                          onChange={(e) => handleDesignationSelect(e.target.value)} >
                          <option value="">Select Designation</option>
                          {designations.map((d, index) => (
                            <option key={index} value={d.designation_id}>
                              {d.designation_name}
                            </option>
                          ))}
                        </select>
                      </div>


                      <div className="row mb-3 bg-light p-1 m-1">
  <label htmlFor="dateOfJoining" className="col-sm-10 form-label"></label>
  <div className="col-sm-2 text-end"></div>
  
  <div className="form-group col-md-6">
    <label htmlFor="startDate" className="form-label">Start Date</label>
    <input 
      type="date"
      id="startDate"
      name="startDate"
      className="form-control col-md-6 col-sm-12"
      value={startDate ? startDate.toISOString().split('T')[0] : ''}
      onChange={(e) => handleStartDateChange(new Date(e.target.value))}
      
    />
  </div>
  
  <div className="form-group col-md-6">
    <label htmlFor="endDate" className="form-label">End Date</label>
    <input 
      type="date"
      id="endDate"
      name="endDate"
      className="form-control col-md-6 col-sm-12"
      value={endDate ? endDate.toISOString().split('T')[0] : ''}
      onChange={(e) => handleEndDateChange(new Date(e.target.value))}
      
    />
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

export default VaccancyReport;







