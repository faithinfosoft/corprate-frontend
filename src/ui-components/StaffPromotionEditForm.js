import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";
import useAuth from "../utilities/useAuth";
import Breadcum from "./Breadcum";
import "react-datepicker/dist/react-datepicker.css";
import { useLocation, useNavigate, Link, useParams } from 'react-router-dom';
import { convertDateFormat } from '../utilities/dateconverter';

const StaffPromotionEditForm = () => {
     const { promotion_detail_id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const { username, user_id } = auth.user;
  const { id } = useParams(); // Get the promotion ID from URL
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Promotion Requests', Link: '/staff-promotion-requests' },
    { Title: 'Edit Promotion Request', Link: '' },
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


  const [alertShown, setAlertShown] = useState(false);
  const [designationChecked, setDesignationChecked] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [qualifications, setQualifications] = useState([]);
  // Fetch promotion details
  const fetchPromotionDetails = useCallback(async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/promotion/promotiondetails/${promotion_detail_id}`
      );
  
      const promotionData = response.data.data;
      
      // Store the complete data object
      setStaffData(promotionData);
      
      const address = [
        promotionData.present_address,
        promotionData.present_place,
        promotionData.present_city,
        promotionData.present_district,
        promotionData.present_state,
        promotionData.present_pin_no,
      ].filter((field) => field).join(", ");
  
      setFormData((prevState) => ({
        ...prevState,
        name_of_applicant: promotionData.staff_official_name,
        address: address,
        dob: convertDateFormat(promotionData.dob),
        designation: promotionData.designation,
        commencement_date: convertDateFormat(promotionData.commencement_date),
        doj: convertDateFormat(promotionData.doj),
        email: promotionData.email,
        phone_no1: promotionData.phone_no1,
        phone_no2: promotionData.phone_no2,
        school: promotionData.school_name,
        marital_status: promotionData.marital_status,
        corporate_employee: promotionData.corporate_employee,
        spouse_officail_name: promotionData.spouse_officail_name,
        spouse_designation_name: promotionData.spouse_designation_name,
        spouse_school_location: promotionData.spouse_school_location,
        age: promotionData.age,
        diocese: promotionData.diocese,
        parish: promotionData.parish,
        	
      }));
  
      // Check designation using promotionData instead of undefined 'data'
      if (!promotionData.designation && !alertShown && !designationChecked) {
        setAlertShown(true);
        setDesignationChecked(true);
        alert("Please fill the service details before proceeding.");
        navigate(`/staffdetails/${user_id}#service-details`);
        return;
      }
      
      setDesignationChecked(true);
      
      const errors = {};
      // Use promotionData instead of undefined 'data'
      if (!promotionData.staff_official_name) errors.name_of_applicant = "Name of applicant is required.";
      if (!promotionData.designation) errors.designation = "Before submitting Promotion request, fill Staff Service Details.";
      if (!promotionData.dob) errors.dob = "Date of birth is required.";
      if (!promotionData.commencement_date) errors.commencement_date = "Commencement date is required.";
      if (!promotionData.doj) errors.doj = "Date of joining is required.";
  
      setValidationErrors(errors);
  
      // This part is redundant as we already set the form data above
      // Just need to set any missing fields that weren't covered in the first setFormData
      if (Object.keys(errors).length === 0) {
        setFormData(prev => ({
          ...prev,
          fk_staff_id: promotionData.fk_staff_id || user_id,
          fk_school_id: promotionData.fk_school_id || school_id,
          created_by: username,
        }));
        
        setLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching promotion details:", error);
      print_toast("error", "Failed to fetch promotion details");
      navigate('/staff-promotion-requests');
    }
  }, [promotion_detail_id, navigate, user_id, school_id, username, alertShown, designationChecked]);


  // Load both promotion and staff details on initial render
  useEffect(() => {
    fetchPromotionDetails();
   
  }, [fetchPromotionDetails]);


  const fetchqualifications = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/staffqualificationdetails/qualification_details', {
        params: {
          fk_candidate_id: user_id,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.data.status) {
        const allQualifications = response.data.data;
  
        // Filter qualifications by type
        const academicQualifications = allQualifications
          .filter(q => q.qual_type === "Academic")
          .map(q => q.title)
          .join(', ');
  
        const professionalQualifications = allQualifications
          .filter(q => q.qual_type === "Professional")
          .map(q => q.title)
          .join(', ');
  
        const additionalQualifications = allQualifications
          .filter(q => q.qual_type === "Additional")
          .map(q => q.title)
          .join(', ');
  
        setFormData(prevData => ({
          ...prevData,
          qualifications_general: academicQualifications,   // Academic
          qualifications_professional: professionalQualifications,  // Professional
          qualifications_additional: additionalQualifications,  // Additional
        }));
        
        setQualifications(allQualifications);
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };
  
  useEffect(() => {
    fetchqualifications();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value ?? "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    try {
      const url = `${globalVariables.api_url}/promotion/update_promotion/${id}`;

      const response = await axios.put(url, formData, {
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
      console.error("Error updating promotion request:", error);
      print_toast("error", "Failed to update promotion request");
    }
  };

  return (
    <>
      <Breadcum items={breadcum} title="Edit Promotion Request" />
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Edit Promotion Request</h5>
              <Link to="/staff-promotion-requests" className="btn btn-secondary">
                Back to List
              </Link>
            </div>
            <div className="card-body">
              <h4 className="mb-4 text-center fw-bold"><u>APPLICATION FOR PROMOTION AS PRINCIPAL/HEADMASTER</u></h4>
              {loaded ? (
                <form onSubmit={handleSubmit}>
                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Name of Teacher</label>
                    <div className="col-md-8">
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

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Date of Birth</label>
                    <div className="col-md-8">
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

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Age as on 01-04-{currentYear}</label>
                    <div className="col-md-8">
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

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Designation (If HST / HSST mention subject)</label>
                    <div className="col-md-8">
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

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">School in which now working</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="name_of_applicant"
                        value={formData.school}
                        className="form-control"
                        required readOnly
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Home Address</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="name_of_applicant"
                        value={`${formData.address} ${formData.phone}`}
                        className="form-control"
                        required readOnly
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Mobile No.</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="phone_no1"
                        value={formData.phone_no1}
                        className="form-control"
                        required readOnly
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Land No.</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="phone_no2"
                        value={formData.phone_no2}
                        className="form-control"
                        required readOnly
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Email ID</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="email"
                        value={formData.email}
                        className="form-control"
                        required readOnly
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Diocese</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="diocese"
                        value={formData.diocese}
                        className="form-control"
                        required readOnly
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Name & Address of the Parish</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="parish"
                        value={formData.parish}
                        className="form-control"
                        required readOnly
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">General Qualifications with Subject</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="department_office_and_section"
                        value={formData.qualifications_general}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Professional Qualification</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="department_office_and_section"
                        value={formData.qualifications_professional}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Additional Qualification</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="department_office_and_section"
                        value={formData.qualifications_additional}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Date of Commencement of Continuous service in each Grade</label>
                    <div className="col-md-8">
                      <input
                        type="text"
                        name="pay"
                        value={formData.pay}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Total continuous service in this Management in the present category as on 31-03-{new Date().getFullYear()}</label>
                    <div className="col-md-8">
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

                  <div className="row mb-3">
                    <label className="col-md-4 col-form-label text-end">Name of Schools previously employed from the date of continuous service</label>
                    <div className="col-md-8">
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
                          .filter(Boolean)
                          .join(', ')}
                          className="form-control"
                          required
                          readOnly
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <button type="submit" className="btn btn-primary me-2">Update</button>
                    <Link to="/staff-promotion-requests" className="btn btn-secondary">
                      Cancel
                    </Link>
                  </div>
                </form>
              ) : (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading promotion details...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffPromotionEditForm;