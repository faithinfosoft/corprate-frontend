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
const StaffPromotionForm = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { username, user_id } = auth.user; // Corrected user_id destructuring
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
  
    { Title: 'Create Promotion Request', Link: '' },
  ]);
  const school_id = auth.user.school_id;
  const [formData, setFormData] = useState({
    Promotion_id: "",
    payScale: "",
    entryDate: "",
    designation: '',
    confirmation: "",
    allowances: "",
    PromotionPeriod: "",
    sundays_holidays: "",
    PromotionReason: "",
    lastPromotion: "",
    remarks: "",
    PromotionType: "",
    fk_staff_id: user_id,
    fk_school_id: school_id,
    start_date: '',
    end_date: '',
    no_of_days: 1,
    nature_of_Promotion: "",
    Promotion_type: "Personal Affairs",
    reason_of_Promotion: "",
    Promotion_status: "Pending",
    created_by: username,

  });
  const currentYear = new Date().getFullYear();
  const [staffData, setStaffData] = useState(null);
  const [loaded, setLoaded] = useState(false);



  const [alertShown, setAlertShown] = useState(false); // Track if alert has been shown
const [designationChecked, setDesignationChecked] = useState(false); // Track if designation is checked

const fetchStaffDetails = useCallback(async () => {
  // Don't fetch if we've already shown the alert and checked designation
  if (alertShown && designationChecked) return;

  try {
    setLoaded(false);
    const response = await axios.get(`${globalVariables.api_url}/staff_transfer/staff_details`, {
        params: { email: username }
      });
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
      email: response.data.data.email,
      phone_no1: response.data.data.phone_no1,
      phone_no2: response.data.data.phone_no2,
      school: response.data.data.school_name,
      marital_status:response.data.data.marital_status	,
      corporate_employee:response.data.data.corporate_employee	,
      spouse_officail_name:response.data.data.spouse_officail_name	,
      spouse_designation_name:response.data.data.spouse_designation_name,
      spouse_school_location	:response.data.data.spouse_school_location	,
      age: response.data.data.age,
      department: "",
    }));

    // Only show alert and redirect if we haven't already done so
    if (!data.designation && !alertShown && !designationChecked) {
      setAlertShown(true);
      setDesignationChecked(true);
      alert("Please fill the service details before proceeding.");
      navigate(`/staffdetails/${user_id}#service-details`);
      return;
    }
    
    setDesignationChecked(true);
    
    const errors = {};
    if (!data.staff_official_name) errors.name_of_applicant = "Name of applicant is required.";
    if (!data.designation) errors.designation = "Before submitting Promotion request, fill Staff Service Details.";
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
      const url = `${globalVariables.api_url}/promotion/create_promotion`;

      const response = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        navigate('/staff-promotion-requests');

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

  const [validationErrors, setValidationErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});


  return (
    <>
      <Breadcum items={breadcum} title="Create Promotion Request" />
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Create Promotion Request</h5>
            </div>
            <div className="card-body">
              <h4 className="mb-4 text-center fw-bold"><u>APPLICATION FOR PROMOTION AS PRINCIPAL/HEADMASTER</u></h4>
              <form onSubmit={handleSubmit}>
                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Name of Teacher</label>
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
                  <label class="col-md-4 col-form-label text-end">Age as on 01-04-{currentYear}</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="form-control"

                    />

                    {formErrors.age && (
                      <div className="text-danger">{formErrors.age}</div>
                    )}
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Designation (If HST / HSST mention subject)</label>
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
                  <label class="col-md-4 col-form-label text-end">  School in which now working</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={formData.school}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end"> Home Address</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={`${formData.address} ${formData.phone}`}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>

                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end"> Mobile No.</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="phone_no1"
                      value={formData.phone_no1} 
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>
                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Land No.</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="phone_no2"
                      value={formData.phone_no2} 
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end"> Email ID</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end"> Diocese</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={`${formData.address} ${formData.phone}`}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end"> Name & Address of the Parish</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={`${formData.address} ${formData.phone}`}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>



                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">General Qualifications with Subject</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="department_office_and_section"
                      value={formData.department_office_and_section}
                      onChange={handleChange}
                      className="form-control"

                    />
                  </div>
                </div>

                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Professional Qualification</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="department_office_and_section"
                      value={formData.department_office_and_section}
                      onChange={handleChange}
                      className="form-control"

                    />
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Additional Qualification</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="department_office_and_section"
                      value={formData.department_office_and_section}
                      onChange={handleChange}
                      className="form-control"

                    />
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Date  of Commencement of Continuous service in each Grade</label>
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
                  <label class="col-md-4 col-form-label text-end"> Total continuous service in this Management in the present category as on 31-03-{new Date().getFullYear()}</label>
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
                  <label class="col-md-4 col-form-label text-end"> Name of Schools   previously employed from the date of continuous service</label>
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




                {formData.marital_status === "Married" && formData.corporate_employee === "Yes" && (
  <div className="row mb-3">
    <label className="col-md-4 col-form-label text-end">
      Whether both husband and wife are employed in this management and if so give details
    </label>
    <div className="col-md-8">
      <input
        type="text"
        name="name_of_applicant"
        value={[
          formData.corporate_employee,
          formData.spouse_officail_name,
          formData.spouse_school_location,
          formData.spouse_designation_name
        ]
        .filter(Boolean)  // Remove null, undefined, empty strings
        .join(', ')}
        className="form-control"
        required
        readOnly
      />
    </div>
  </div>
)}




         




              

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

export default StaffPromotionForm;
