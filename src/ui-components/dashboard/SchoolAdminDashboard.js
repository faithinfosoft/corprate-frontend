import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../utilities/useAuth';
import Breadcum from '../Breadcum';
import axios from 'axios';
import globalVariables from "../../Global.js";
import logo_image from '../../assets/ui-master/img/logo.png';
import defaultPhoto from "../../assets/ui-master/img/no_image_uploaded.jpg";
import { X, Calendar, Clock, MapPin, User, Bell } from 'lucide-react';
import print_toast from "../../utilities/Toaster.js";
import SecureImage from "../SecureImage.js";
const CenterContent = () => {
  const [breadcum, setBreadcum] = useState([

  ]);
  const auth = useAuth();
  const username = auth.user.username;
  const school_id = auth.user.user_id;
  const [loaded, setLoaded] = useState(false);
  const [school, setSchool] = useState(false);
  const [appointments, setAppointments] = useState(false);
  const user_type = auth.user.user_type;
  const [classStrength, setClassStrength] = useState({
    totals: [],
    boysTotals: [],
    girlsTotals: [],
    csTotals: [],
    ncsTotals: [],
  });



  const [StaffSummary, setStaffSummary] = useState(null);

  const [permanentStaff, setPermanentStaff] = useState(null);
  const [temporaryStaff, setTemporaryStaff] = useState(null);

  const fetchstaffsCount = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/dashboard/get_school_staff_count`, {
        params: { school_id }, // Pass school_id as a query parameter
      });
      if (response.data.status) {

        setStaffSummary(response.data.data);

      } else {
        console.error('Error fetching staff count:', response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };
  const fetchschool = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/schooldetails/${school_id}`);

      if (response.data.status) {
        if (Array.isArray(response.data.data) && response.data.data.length > 0) {
          setSchool(response.data.data[0]);
        } else {
          setSchool(response.data.data || {});
        }

      } else {
        console.error('Error fetching staff count:', response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };




  const fetchClassStrength = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/class-strength/get_classstrengths_schoolid`, {
        params: { school_id }
      });

      if (response.data.status) {
        const classStrengths = response.data.data;

        if (classStrengths.length === 0) {
          // Handle empty data case
          setClassStrength({
            classNames: [],
            totals: [],
            boysTotals: [],
            girlsTotals: [],
            csTotals: [],
            ncsTotals: []
          });
          setLoaded(true);
          return;
        }

        // Get unique class names from the data
        const classNames = [...new Set(classStrengths.map(item => item.class_name))].sort();
        const numClasses = classNames.length;

        // Initialize totals arrays for each class
        const totals = Array(numClasses).fill(0);
        const boysTotals = Array(numClasses).fill(0);
        const girlsTotals = Array(numClasses).fill(0);
        const csTotals = Array(numClasses).fill(0);
        const ncsTotals = Array(numClasses).fill(0);

        // Fill the totals arrays based on the API response
        classStrengths.forEach((item) => {
          const classIndex = classNames.indexOf(item.class_name);
          if (classIndex >= 0 && classIndex < numClasses) {
            boysTotals[classIndex] += parseInt(item.strength_boys, 10) || 0;
            girlsTotals[classIndex] += parseInt(item.strength_girls, 10) || 0;
            csTotals[classIndex] += parseInt(item.strength_cs, 10) || 0;
            ncsTotals[classIndex] += parseInt(item.strength_ncs, 10) || 0;
            totals[classIndex] += (parseInt(item.strength_boys, 10) || 0) + (parseInt(item.strength_girls, 10) || 0);
          }
        });

        // Update state with processed data
        setClassStrength({
          classNames,
          totals,
          boysTotals,
          girlsTotals,
          csTotals,
          ncsTotals
        });
      } else {
        console.error('Error fetching class strength:', response.data.message);
        // Initialize empty state for error case
        setClassStrength({
          classNames: [],
          totals: [],
          boysTotals: [],
          girlsTotals: [],
          csTotals: [],
          ncsTotals: []
        });
      }

      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      // Initialize empty state for error case
      setClassStrength({
        classNames: [],
        totals: [],
        boysTotals: [],
        girlsTotals: [],
        csTotals: [],
        ncsTotals: []
      });
      setLoaded(true);
    }
  };
  useEffect(() => {

    fetchschool();
    fetchClassStrength();
    fetchstaffsCount();
    fetchAppointments();
  }, []);


  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff-appointment/school_staff_appointments/${school_id}`);

      if (response.data.status) {
        setAppointments(response.data.data);

      } else {
        console.error('Error fetching staff count:', response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };


  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [selectednatureAppointment, setNatureAppointment] = useState(null);
  const [selected_fk_staff_school_id, set_fk_staff_school_id] = useState(null);
  const [selected_fk_service_id, set_fk_service_id] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    school_id: '', // Make sure this has the actual school_id value
    // Add other form fields as needed
  });

  const openModal = (e, appointments) => {
    e.preventDefault();
    setSelectedStaffId(appointments.staff_id);
    setSelectedAppointmentId(appointments.appointment_id);
    setNatureAppointment(appointments.nature_appointment);
    set_fk_staff_school_id(appointments.fk_staff_school_id);
    set_fk_service_id(appointments.fk_service_id);

    setRemarks('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setRemarks('');
    setSelectedStaffId(null);
    setSelectedAppointmentId(null);
  };

  const submitAppointment = async () => {


    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        staff_id: selectedStaffId,
        school_id: school_id, // Make sure this is available in formData
        appointment_id: selectedAppointmentId,
        nature_appointment: selectednatureAppointment,
        fk_staff_school_id: selected_fk_staff_school_id,
        fk_service_id: selected_fk_service_id,
        remarks: remarks.trim()
      };

      const response = await axios.post(
        `${globalVariables.api_url}/staff-appointment/add_staff_appointment`,
        dataToSend
      );

      if (response.data.status) {
        print_toast("success", "Appointment created successfully");
        closeModal();
        // Optionally refresh appointments or navigate
        // navigate("/appointment");
      } else {
        if (response.data.error) {
          setValidationErrors(response.data.error);
          const firstErrorField = Object.keys(response.data.error)[0];
          const firstErrorMessage = response.data.error[firstErrorField];
          print_toast("error", firstErrorMessage);
        } else {
          print_toast("error", response.data.message || "Failed to create appointment");
        }
      }
    } catch (error) {
      console.error("Error creating appointment:", error);

      if (error.response?.data?.error) {
        setValidationErrors(error.response.data.error);
        const firstErrorField = Object.keys(error.response.data.error)[0];
        const firstErrorMessage = error.response.data.error[firstErrorField];
        print_toast("error", 'Validation Error: ' + firstErrorMessage);
      } else {
        print_toast("error", "An error occurred while creating the appointment");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <Breadcum items={breadcum} title="Dashboard" /> */}
      <div className="container mt-2">
        {appointments.length > 0 && (
          <div className="alert alert-danger" role="alert">
            <strong>🛎️ New Staff Appointed</strong>
            <br />
            Mr./Ms. <strong>{appointments[0].staff_official_name}</strong> has been appointed to your school by the Corporate Manager.
            <br />
            <button
              className="btn btn-danger btn-sm mt-2"
              onClick={(e) => openModal(e, appointments[0])}
            >
              Add Now
            </button>
          </div>
        )}


        {/* School Details and Overview Cards */}
        <div className="row g-4">
          {/* LEFT COLUMN: Profile & Contact */}
          <div className="col-lg-4 col-md-5">
            {/* Profile Card */}
            <div className="card shadow border-0 rounded-4 mb-4" style={{ background: 'linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)', color: 'white' }}>
              <div className="card-body box-profile text-center pt-4 pb-4">
                <div className="mb-3">
                  <SecureImage
                    src={
                      school.photo && school.photo !== "null" && school.photo !== ""
                        ? `${globalVariables.api_url}/secure_file/school_photos/${school.photo}`
                        : defaultPhoto
                    }
                    fallbackSrc={defaultPhoto}
                    alt="School Logo"
                    className="img-fluid rounded-circle shadow"
                    style={{ width: '120px', height: '120px', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.8)' }}
                  />
                </div>
                <h4 className="fw-bold mb-1" style={{ fontSize: '1.25rem', color: 'white' }}>
                  {school.school_name}
                </h4>
                <p className="mb-3" style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>
                  <MapPin size={16} className="mr-1" style={{ display: 'inline', marginTop: '-3px' }}/> {school.location}
                </p>
                <div>
                  <span className="badge bg-white text-primary rounded-pill px-3 py-2 shadow-sm" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                    School Code: {school.school_code}
                  </span>
                </div>
              </div>
            </div>

            {/* About School Card */}
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-header bg-white border-bottom-0 pt-4 pb-0">
                <h5 className="card-title fw-bold text-dark mb-0">About School</h5>
              </div>
              <div className="card-body pt-3 pb-4">
                <div className="d-flex align-items-start mb-4">
                  <div className="bg-light text-primary rounded-circle p-2 mr-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-map-marked-alt"></i>
                  </div>
                  <div>
                    <h6 className="mb-1 text-dark fw-bold" style={{ fontSize: '0.9rem' }}>Contact Address</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                      {school.address}
                      {school.post_office ? `, P.O ${school.post_office}` : ""}
                      {school.pin_no ? `, ${school.pin_no}` : ""}
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-4">
                  <div className="bg-light text-success rounded-circle p-2 mr-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div>
                    <h6 className="mb-1 text-dark fw-bold" style={{ fontSize: '0.9rem' }}>Phone</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>{school.phone}</p>
                  </div>
                </div>

                <div className="d-flex align-items-center">
                  <div className="bg-light text-danger rounded-circle p-2 mr-3" style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h6 className="mb-1 text-dark fw-bold" style={{ fontSize: '0.9rem' }}>Email</h6>
                    <p className="text-muted mb-0" style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{school.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* RIGHT COLUMN: Statistics & Tables */}
          <div className="col-lg-8 col-md-7">
            
            <h5 className="fw-bold text-dark mb-3">Staff Overview</h5>
            <div className="row g-3 mb-4">
              {/* Teaching Staff Widget */}
              <div className="col-sm-6">
                <div className="card shadow-sm border-0 rounded-4 h-100" style={{ borderLeft: '4px solid #007bff !important' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="text-muted mb-0">Teaching Staff</h6>
                        <h2 className="text-dark fw-bold mb-0 mt-1">{StaffSummary?.total_teaching_staff || 0}</h2>
                      </div>
                      <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                        <i className="fas fa-chalkboard-teacher text-primary fa-lg"></i>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between border-top pt-3 mt-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-muted"><i className="fas fa-male text-primary mr-1"></i> Male: <strong>{StaffSummary?.teaching_male || 0}</strong></span>
                      <span className="text-muted"><i className="fas fa-female text-danger mr-1"></i> Female: <strong>{StaffSummary?.teaching_female || 0}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Non-Teaching Staff Widget */}
              <div className="col-sm-6">
                <div className="card shadow-sm border-0 rounded-4 h-100" style={{ borderLeft: '4px solid #17a2b8 !important' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <h6 className="text-muted mb-0">Non-Teaching Staff</h6>
                        <h2 className="text-dark fw-bold mb-0 mt-1">{StaffSummary?.total_non_teaching_staff || 0}</h2>
                      </div>
                      <div className="bg-info bg-opacity-10 rounded-circle p-3">
                        <i className="fas fa-users-cog text-info fa-lg"></i>
                      </div>
                    </div>
                    <div className="d-flex justify-content-between border-top pt-3 mt-2" style={{ fontSize: '0.85rem' }}>
                      <span className="text-muted"><i className="fas fa-male text-primary mr-1"></i> Male: <strong>{StaffSummary?.non_teaching_male || 0}</strong></span>
                      <span className="text-muted"><i className="fas fa-female text-danger mr-1"></i> Female: <strong>{StaffSummary?.non_teaching_female || 0}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h5 className="fw-bold text-dark mb-3 mt-2">Student Enrollment</h5>
            <div className="card shadow-sm border-0 rounded-4">
              <div className="card-body p-0">
                {loaded ? (
                  classStrength.classNames && classStrength.classNames.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover table-borderless align-middle mb-0">
                        <thead className="bg-light text-muted" style={{ borderBottom: '2px solid #f4f6f9' }}>
                          <tr>
                            <th className="py-3 px-4 fw-bold">Class / Grade</th>
                            {classStrength.classNames.map((className, i) => (
                              <th key={i} className="py-3 text-center fw-bold">{className}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #f4f6f9' }}>
                            <td className="px-4 py-3 text-dark"><i className="fas fa-mars text-primary mr-2" style={{ width: '16px' }}></i> Total Boys</td>
                            {classStrength.boysTotals.map((total, index) => (
                              <td key={index} className="text-center">{total}</td>
                            ))}
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f4f6f9' }}>
                            <td className="px-4 py-3 text-dark"><i className="fas fa-venus text-danger mr-2" style={{ width: '16px' }}></i> Total Girls</td>
                            {classStrength.girlsTotals.map((total, index) => (
                              <td key={index} className="text-center">{total}</td>
                            ))}
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f4f6f9' }}>
                            <td className="px-4 py-3 text-dark"><i className="fas fa-cross text-warning mr-2" style={{ width: '16px' }}></i> Catholic Students</td>
                            {classStrength.csTotals.map((total, index) => (
                              <td key={index} className="text-center">{total}</td>
                            ))}
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f4f6f9' }}>
                            <td className="px-4 py-3 text-dark"><i className="fas fa-users text-secondary mr-2" style={{ width: '16px' }}></i> Non-Catholic Students</td>
                            {classStrength.ncsTotals.map((total, index) => (
                              <td key={index} className="text-center">{total}</td>
                            ))}
                          </tr>
                          <tr className="bg-light">
                            <td className="px-4 py-3 text-dark fw-bold"><i className="fas fa-graduation-cap text-success mr-2" style={{ width: '16px' }}></i> Grand Total</td>
                            {classStrength.totals.map((total, index) => (
                              <td key={index} className="text-center fw-bold text-dark">{total}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-5 text-center" style={{ background: '#f8f9fc', borderRadius: '15px' }}>
                      <div className="bg-white rounded-circle d-inline-flex p-4 mb-3 shadow-sm border" style={{ borderColor: '#e3e6f0 !important' }}>
                        <i className="fas fa-folder-open fa-2x text-warning"></i>
                      </div>
                      <h6 className="text-dark fw-bold" style={{ fontSize: '1.1rem' }}>No Enrollment Data</h6>
                      <p className="text-muted mb-0">Student strength data has not been added for this school yet.</p>
                    </div>
                  )
                ) : (
                  <div className="p-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                    <p className="text-muted mt-2">Loading enrollment data...</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Student Details Table */}
      </div>



      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Appointment Remarks</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="remarks" className="form-label">Remarks</label>
                  <textarea
                    className="form-control"
                    id="remarks"
                    rows="4"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter remarks for this appointment..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={submitAppointment}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Appointment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CenterContent;
