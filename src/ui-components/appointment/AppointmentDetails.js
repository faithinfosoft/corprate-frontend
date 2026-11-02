import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import "react-datepicker/dist/react-datepicker.css";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import useAuth from "../../utilities/useAuth.js";
import NoDataFound from "../NoDataFound.js";
import { convertDateFormat } from '../../utilities/dateconverter.js';
import { useNavigate } from 'react-router-dom';
import { capitalizeWords } from '../../utilities/dateconverter.js';

const AppointmentDetails = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const auth = useAuth();
  const { username, user_id } = auth.user;
  const school_id = auth.user.school_id;
  
  const [loaded, setLoaded] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Apointment Details', Link: '' },
  ]);

  // Search states
  const [searchStartDate, setSearchStartDate] = useState('');
  const [searchEndDate, setSearchEndDate] = useState('');
  const [natureOfVacancy, setNatureOfVacancy] = useState('');
  const [allotmentStatus, setAllotmentStatus] = useState('');
  const [filteredappointments, setFilteredappointments] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
const [natureOptions, setNatureOptions] = useState([]);


  // Fetch all Appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/staff-appointment/get_appointmets`
      );
      if (response.data.status) {
        setAppointments(response.data.data);
        setFilteredappointments(response.data.data); // Initialize filtered data with all Appointments
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      //print_toast("error", "Failed to fetch Appointments");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  
  }, [fetchAppointments]);


  // Handle input changes for search fields
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "searchStartDate":
        setSearchStartDate(value);
        if (startDateError) setStartDateError("");
        break;
      case "searchEndDate":
        setSearchEndDate(value);
        if (endDateError) setEndDateError("");
        break;
      case "natureOfVacancy":
        setNatureOfVacancy(value);
        break;
      case "allotmentStatus":
        setAllotmentStatus(value);
        break;
      default:
        break;
    }
  };




  
  // Handle search button click
  const handleSearch = () => {
    filterappointments();
  };

  
const filterappointments = () => {
  setIsSearching(true);
  setStartDateError('');
  setEndDateError('');

  // Validate date range
  if (searchStartDate && searchEndDate && searchEndDate < searchStartDate) {
    setStartDateError("Start date must be before end date");
    setEndDateError("End date must be after start date");
    setIsSearching(false);
    return;
  }

  let filtered = appointments;

  // Filter by start date
  if (searchStartDate) {
    filtered = filtered.filter(app =>
      new Date(app.appointment_date) >= new Date(searchStartDate)
    );
  }

  // Filter by end date
  if (searchEndDate) {
    filtered = filtered.filter(app =>
      new Date(app.appointment_date) <= new Date(searchEndDate)
    );
  }

  setFilteredappointments(filtered);
  setIsFiltered(true);

  if (filtered.length === 0) {
    print_toast("info", "No appointments found between selected dates");
  }

  setIsSearching(false);
};

  // Handle reset button click
  const handleReset = () => {
    setSearchStartDate('');
    setSearchEndDate('');
    setNatureOfVacancy('');
    setAllotmentStatus('');
    setFilteredappointments(appointments);
    setIsFiltered(false);
    setStartDateError('');
    setEndDateError('');
  };


 

 
  // Handle delete Appointment
  const handleDelete = async (appointment) => {
    if (window.confirm("Are you sure you want to Cancel this Appointment?")) {
      try {

        const appointmentId=appointment.appointment_id;

        const response = await axios.post(
          `${globalVariables.api_url}/staff-appointment/delete_appointment`,
          { appointment_id: appointmentId,staff_id:appointment.staff_id },
          
        );
        if (response.data.status) {
          print_toast("success", response.data.message);
          setAppointments(prevappointments => prevappointments.filter(appointments => appointments.appointment_id !== appointmentId));
          setFilteredappointments(prevFilteredappointments => prevFilteredappointments.filter(appointments => appointments.appointment_id !== appointmentId));
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error("Error deleting Appointment:", error);
        print_toast("error", "Failed to delete Appointment");
      }
    }
  };

  const today = new Date().toISOString().split("T")[0];

  // Nature of vacancy options

  const handleGenerateAppointmentLetter = async (appointment) => {
   const appointmentId=appointment.appointment_id;

  //  setPdfLoading(true);
    try {
      const form_data = {
        params: {
          appointmentId: appointmentId
        },
        responseType: 'blob'
      };
  
      const response = await axios.get(globalVariables.api_url + '/staff-appointment/generate_appointment_letter', form_data);
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staff_appointment_letter.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    //setPdfLoading(false);
  };

  // Allotment status options
  const statusOptions = [
    { value: "", label: "Select Status" },
    { value: "All", label: "All" },
    { value: "appointed", label: "Appointed" },
    { value: "not-appointed", label: "Not Appointed" },
  ];

  return (
    <>
      <div className="col-12">
        <div className="card">
          <div className="card-body">
           
     <div className="row mb-1">
  {/* Start Date */}
  <div className="col-md-3">
    <label htmlFor="searchStartDate" className="form-label">
      Start Date
    </label>
    <div className="input-group">
      <input
        type="date"
        className={`form-control ${startDateError ? 'is-invalid' : ''}`}
        id="searchStartDate"
        name="searchStartDate"
        value={searchStartDate}
        onChange={handleSearchInputChange}
        max={today}
      />
      <span className="input-group-text">
        <i className="fa fa-calendar"></i>
      </span>
    </div>
    {startDateError && (
      <div className="invalid-feedback d-block">{startDateError}</div>
    )}
  </div>

  {/* End Date */}
  <div className="col-md-3">
    <label htmlFor="searchEndDate" className="form-label">
      End Date
    </label>
    <div className="input-group">
      <input
        type="date"
        className={`form-control ${endDateError ? 'is-invalid' : ''}`}
        id="searchEndDate"
        name="searchEndDate"
        value={searchEndDate}
        onChange={handleSearchInputChange}
        max={today}
        min={searchStartDate}
      />
      <span className="input-group-text">
        <i className="fa fa-calendar"></i>
      </span>
    </div>
    {endDateError && (
      <div className="invalid-feedback d-block">{endDateError}</div>
    )}
  </div>

  {/* Search Button */}
  <div className="col-md-3">
    <label className="form-label">&nbsp;</label>
    <button
      type="button"
      className="btn btn-primary px-4 d-block"
      onClick={handleSearch}
    disabled={isSearching || (!searchStartDate && !searchEndDate)}
    >
       {isSearching ? (
        <>
          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          Searching...
        </>
      ) : (
        <>
          
          Search
        </>
      )}
    </button>
  </div>
</div>

    

            
          
            {/* Appointment Results Table */}
            <div className="table-responsive">
              <table className="table table-bordered datatable">
                <thead>
                  <tr>
                    <th scope="col" className="text-center">Sl No.</th>
                     <th scope="col" className="text-center">Appointment Date</th>
                    <th scope="col" className="text-center">School</th>
                     <th scope="col" className="text-center">Staff</th>
                    <th scope="col" className="text-center">Nature of Appointment</th>
                    {/* <th scope="col" className="text-center">Designation</th> */}
                    <th scope="col" className="text-center">Remarks</th>
                    {/* <th scope="col" className="text-center">Appointment Status</th>*/}
                    <th scope="col" className="text-center">Actions</th> 
                  </tr>
                </thead>
                <tbody>
                  {!loaded ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <div className="d-flex justify-content-center my-3">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : filteredappointments.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center">
                        <NoDataFound />
                      </td>
                    </tr>
                  ) : (
                    filteredappointments.map((appointments, index) => (
                      <tr key={appointments.vacancy_id || index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">
                          {convertDateFormat(appointments.appointment_date)}
                        </td>
                        <td className="text-center">{appointments.school_location}</td>
                         <td className="text-center">{appointments.staff_official_name}</td>
                        <td className="text-center">
 {appointments.nature_appointment}
</td>
                        {/* <td className="text-center">{vacancy.designation_name}</td> */}
                        <td className="text-center">{appointments.remarks}</td>
                        
<td className="text-center">
  {!appointments.is_appointed && (
    <button
      className="btn btn-danger btn-sm text-nowrap me-2"
      onClick={() => handleDelete(appointments)}
    >
      <i className="fa fa-times me-1"></i> Cancel
    </button>
  )}
  
  <button
    className="btn btn-success btn-sm text-nowrap"
    onClick={() => handleGenerateAppointmentLetter(appointments)}
  >
    <i className="fa fa-file-text me-1"></i> Generate Appointment Letter
  </button>
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default AppointmentDetails;