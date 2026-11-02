import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";
import useAuth from "../utilities/useAuth";
import Breadcum from "./Breadcum";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { convertDateFormat } from '../utilities/dateconverter';
const LeaveApplicationForm = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { username, user_id } = auth.user; // Corrected user_id destructuring
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'My Leave Requests', Link: '/staff-leave-request' },
    { Title: 'Create Leave Request', Link: '' },
  ]);
  const school_id = auth.user.school_id;
  const [formData, setFormData] = useState({
    leave_id: "",
    entryDate: "",
    designation: '',
    confirmation: "",
    allowances: "",
    leavePeriod: "",
    sundays_holidays: "",
    leaveReason: "",
    lastLeave: "",
    remarks: "",
    leaveType: "",
    fk_staff_id: user_id,
    fk_school_id: school_id,
    start_date: '',
    end_date: '',
    no_of_days: 1,
    nature_of_leave: "",
    leave_type: "Personal Affairs",
    reason_of_leave: "",
    leave_status: "Pending",
    created_by: username,
    approved_on: null,
    approved_by: null,
    remarks: "",
    department_office_section:'',
    pay:'',
    scale_of_pay:''
  });

  const [staffData, setStaffData] = useState(null);
  const [loaded, setLoaded] = useState(false);



  const [alertShown, setAlertShown] = useState(false); // Track if alert has been shown
const [designationChecked, setDesignationChecked] = useState(false); // Track if designation is checked

const fetchStaffDetails = useCallback(async () => {
  // Don't fetch if we've already shown the alert and checked designation
  if (alertShown && designationChecked) return;

  try {
    setLoaded(false);
    const response = await axios.get(
      `${globalVariables.api_url}/leave/staffdetails/${user_id}`
    );

    const data = response.data.data;
    setStaffData(response.data.data);
    const address = [
      response.data.data.present_address,
      response.data.data.present_place,
      response.data.data.present_city,
      response.data.data.present_district,
      response.data.data.present_state,
      response.data.data.present_pin_no,
    ]
      .filter((field) => field)
      .join(", ");

    setFormData((prevState) => ({
      ...prevState,
      name_of_applicant: response.data.data.staff_official_name,
      address: address,
      dob: convertDateFormat(response.data.data.dob),
      designation: response.data.data.designation,
      commencement_date: convertDateFormat(response.data.data.commencement_date),
      doj: convertDateFormat(response.data.data.doj),
      department: "",
    }));

    // Only show alert and redirect if we haven't already done so
    if (!data.designation && !alertShown && !designationChecked   ) {
      setAlertShown(true);
      setDesignationChecked(true);
      alert("Please fill the service details before proceeding.");
      navigate(`/staffdetails/${user_id}#service-details`);
      return;
    }

    if (!address) {
      setAlertShown(true);
      alert("Address field is empty. Please update the basic details.");
      navigate(`/staffdetails/${user_id}#overview`);
      return;
    }
    setDesignationChecked(true);
    
    const errors = {};
    if (!data.staff_official_name) errors.name_of_applicant = "Name of applicant is required.";
    if (!data.designation) errors.designation = "Before submitting leave request, fill Staff Service Details.";
    if (!data.dob) errors.dob = "Date of birth is required.";
    if (!data.commencement_date) errors.commencement_date = "Commencement date is required.";
    if (!data.doj) errors.doj = "Date of joining is required.";

    setValidationErrors(errors);
  } catch (error) {
    console.error("Error fetching staff details:", error);
  } finally {
    setLoaded(true);
  }
}, [user_id, alertShown, designationChecked, navigate]); // Fixed dependency array

// Single useEffect for initial fetch
useEffect(() => {
  fetchStaffDetails();
}, [fetchStaffDetails]);

  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value ?? "", // ✅ Prevent null values
    }));
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    try {
      const url = `${globalVariables.api_url}/leave/create`;

      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        navigate('/staff-leave-request');

        setValidationErrors({});

      } else {
        if (response.data.error) {
          setValidationErrors(response.data.error);
        }
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error saving/updating leave request:", error);
      print_toast("error", "Failed to save/update leave request");
    }
  };
  const leaveNatures = [
    "Half Pay Leave",
    "Leave without  Allowance",
    "Maternity Leave",
    "Commuted Leave",

  ];
  const [validationErrors, setValidationErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const handleDateChange = (date, name) => {
    setFormData((prevState) => ({
      ...prevState,
      [name]: date,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };
  return (
    <>
      <Breadcum items={breadcum} title="Create Leave Request" />
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Create Leave Request</h5>
            </div>
            <div className="card-body">
              <h4 className="mb-4 text-center fw-bold">APPLICATION FOR LEAVE</h4>
              <form onSubmit={handleSubmit}>
                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Name of Applicant</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={formData.name_of_applicant}
                      onChange={handleChange}
                      className="form-control"
                      required readOnly
                    />

                    {formErrors.name_of_applicant && (
                      <div className="text-danger">{formErrors.name_of_applicant}</div>
                    )}
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Date of Birth</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="date_of_birth"
                      value={formData.dob}
                      onChange={handleChange}
                      className="form-control"

                    />

                    {formErrors.dob && (
                      <div className="text-danger">{formErrors.dob}</div>
                    )}
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Post held</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      className="form-control"
                      readOnly
                      required
                    />
                    {validationErrors.designation && (
                      <div className="text-danger">{validationErrors.designation}</div>
                    )}
                  </div>
                </div>



                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Department/Office and Section</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="department_office_section"
                      value={formData.department_office_section}
                      onChange={handleChange}
                      className="form-control"

                    />
                  </div>
                </div>




                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Pay</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="pay"
        value={formData.pay}
        onChange={handleChange}
        className="form-control"
       
      />
                  </div>
                </div>



                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Scale of Pay</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="scale_of_pay"
        value={formData.scale_of_pay}
        onChange={handleChange}
        className="form-control"
       
      />
                  </div>
                </div>





                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Date of entry in service</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="date_of_entry_in_service"
        value={formData.doj}
        onChange={handleChange}
        className="form-control"
       
      />
      {formErrors.doj && (
      <div className="text-danger">{formErrors.doj}</div>
    )}
                  </div>
                </div>





                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Date of commencement of continuous service</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="date_of_commencement_of_continuous_service"
        value={formData.commencement_date}
        onChange={handleChange}
        className="form-control"
        
      />
      {formErrors.commencement_date && (
      <div className="text-danger">{formErrors.commencement_date}</div>
    )}
                  </div>
                </div>





                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Whether the applicant has got confirmation in any post, if so from which date in which post</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="confirmation_in_post"
        value={formData.confirmation_in_post}
        onChange={handleChange}
        className="form-control"
       
      />
                  </div>
                </div>





                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Address during leave</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="address_during_leave"
        value={formData.address}
        onChange={handleChange}
        className="form-control"
       
      />
                  </div>
                </div>





                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">House Rent Allowance, Conveyance Allowance or other compensatory allowance drawn in the present post</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="allowances"
        value={formData.allowances}
        onChange={handleChange}
        className="form-control"
       
      />
                  </div>
                </div>





                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Nature of Leave</label>
                  <div class="col-md-8">
                  <select
          className="form-control"
          id="nature_of_leave"
          name="nature_of_leave"
          value={formData.nature_of_leave}
          onChange={handleChange}
          
        >
          <option value="">Select Nature of Leave</option>
          {leaveNatures.map((nature, index) => (
            <option key={index} value={nature}>
              {nature}
            </option>
          ))}
        </select>
        {validationErrors.nature_of_leave && (
          <div className="invalid-feedback d-block">
            {validationErrors.nature_of_leave}
          </div>
        )}
                  </div>
                </div>

                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Leave Start Date</label>
                  <div class="col-md-8">
                     <DatePicker
                                   id="start_date"
                                   selected={formData.start_date}
                                   onChange={(date) => handleDateChange(date, "start_date")}
                                   className="form-control"
                                   dateFormat="dd-MM-yyyy"
                                  
                                 />
                                  {validationErrors.start_date && (
                                  <div className="invalid-feedback d-block">
                                    {validationErrors.start_date}
                                  </div>
                                )}
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Leave End Date</label>
                  <div class="col-md-8">
                    <DatePicker
                                     id="end_date"
                                     selected={formData.end_date}
                                     onChange={(date) => handleDateChange(date, "end_date")}
                                     className="form-control"
                                     dateFormat="dd-MM-yyyy"
                                     minDate={formData.start_date}
                                   />
                                    {validationErrors.end_date && (
                                  <div className="invalid-feedback d-block">
                                    {validationErrors.end_date}
                                  </div>
                                )}
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Sundays and Holidays if any proposed to be Prefixed/Suffixed on leave</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="sundays_holidays"
        value={formData.sundays_holidays}
        onChange={handleChange}
        className="form-control"
       
      />
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Ground on which leave is applied for</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="reason_of_leave"
        value={formData.reason_of_leave}
        onChange={handleChange}
        className="form-control"
       
      />
       {validationErrors.reason_of_leave && (
          <div className="invalid-feedback d-block">
            {validationErrors.reason_of_leave}
          </div>
        )}
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Date of return from last leave and the nature and period of that leave</label>
                  <div class="col-md-8">
                  <input
        type="text"
        name="last_leave"
        value={formData.last_leave}
        onChange={handleChange}
        className="form-control"
       
      />
                  </div>
                </div>





                <div class="text-center">
                <button type="submit" className="btn btn-primary">Submit</button>
                </div>


              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeaveApplicationForm;
