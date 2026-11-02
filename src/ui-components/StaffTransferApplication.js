import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Multiselect from 'multiselect-react-dropdown';
import globalVariables from '../Global.js';
import useAuth from '../utilities/useAuth.js';
import print_toast from '../utilities/Toaster.js';
import Breadcum from './Breadcum.js';
import NoDataFound from './NoDataFound';
import { convertDateFormat } from '../utilities/dateconverter';
const StaffTransferApplication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const username = auth.user.username;
  const staffId = auth.user.user_id;
  const [cocurriculars, setCocurriculars] = useState([]);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Transfer Notifications', Link: '/transfernotification' },
    { Title: 'Transfer Application', Link: ',stafftransferapplication' },
  ]);

  const [formData, setFormData] = useState({
    staff_name: '',
    pen_no: '',
    current_school: '',
    transfer_reason:'',
    pay:'',
    scale_of_pay:'',
    transfer_request_type:'',
    selectedSchools: [],
    saving: false
  });
  const [qualifications, setQualifications] = useState([]);
  const [notificationDetails, setNotificationDetails] = useState({
    title: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  // const [academicyear, setAcademicYear] = useState({
  //   fk_academic_year_id: ''
  // });
  const [academicyear, setAcademicYear] = useState('');
  const [academicYearLabel, setAcademicYearLabel] = useState('');
  const [schools, setSchools] = useState([]);
  const [schoolsData, setSchoolsData] = useState([]);
  
  const [notification, setNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedSchools, setSelectedSchools] = useState([]);
 const [childrenDetails, setChildrenDetails] = useState([]);
 const [serviceDetails, setServiceDetails] = useState([]);
  useEffect(() => {
    if (!location.state?.notificationId) {
      navigate('/transfernotification');
      return;
    }

    setNotification({
      id: location.state.notificationId,
      title: location.state.notificationTitle
    });

    setNotificationDetails({
      title: location.state.notificationTitle || '',
      start_date: location.state.startDate || '',
      end_date: location.state.endDate || '',
      description: location.state.description || ''
    });

    setAcademicYear(location.state.academicyear || '');

    fetchStaffDetails();
    fetchSchools();
    fetchChildrenDetails();
    fetchServiceDetails();
  }, [location.state, navigate]);



  const [alertShown, setAlertShown] = useState(false); // Track if alert has been shown
  const [designationChecked, setDesignationChecked] = useState(false); // Track if designation is checked
  
  const fetchStaffDetails = async () => {
    if (alertShown && designationChecked) return;

    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/staff_details`, {
        params: { email: username }
      });

      if (response.data.status) {
        const staffData = response.data.data;



        const address = [
          response.data.data.permanent_address,
          response.data.data.permanent_place,
          response.data.data.permanent_city,
          response.data.data.permanent_district,
          response.data.data.permanent_state,
          response.data.data.permanent_pin_no,

        ]
          .filter((field) => field)
          .join(", ");


        setFormData(prev => ({
          ...prev,
          staff_name: staffData.staff_official_name,
          dob: staffData.dob,
          age:staffData.age,
          pen_no: staffData.pen_no,
          current_school: staffData.current_school_id,
          school:staffData.school_name,
          address:address,
          phone:staffData.phone_no1	,
          marital_status	:staffData.marital_status	,
          designation:staffData.designation,
          corporate_employee	:staffData.corporate_employee	,
          spouse_officail_name:staffData.spouse_officail_name	,
          spouse_designation_name:staffData.spouse_designation_name,
          spouse_school_location	:staffData.spouse_school_location	,
          parish:staffData.parish,
          current_school_years: staffData.current_school_years 
          ? (staffData.current_school_years === 1 ? "1 yr" : staffData.current_school_years + " yrs")
          : "0 yrs",
          total_years: staffData.total_years 
          ? (staffData.total_years === 1 ? "1 yr" : staffData.total_years + " yrs")
          : "0 yrs",
         
        }));

            // Only show alert and redirect if we haven't already done so
            if (!staffData.designation && !alertShown && !designationChecked   ) {
              setAlertShown(true);
              setDesignationChecked(true);
              alert("Please fill the service details before proceeding.");
              navigate(`/staffdetails/${staffId}#service-details`);
              return;
            }
            setDesignationChecked(true);

      } else {
        print_toast('error', 'Failed to fetch staff details');
      }
    } catch (error) {
      console.error('Error fetching staff details:', error);
      print_toast('error', 'Error fetching staff details');
    }
  };

  


  const fetchChildrenDetails = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/staff/children-details/${staffId}`);
        if (response.data.status) {
            setChildrenDetails(response.data.data);
        } else {
            // If the API returns status false but it's not a server error
            setChildrenDetails([]);
        }
    } catch (error) {
        // Only show error toast for actual errors (network, server, etc.)
        if (error.response?.status !== 404) {  // Assuming 404 means no data
            console.error('Error fetching children details:', error);
            //print_toast("error", "Failed to fetch children details");
        }
        setChildrenDetails([]);
    }
};


const fetchStaffCocurricular = async () => {
  console.log(staffId);
  try {
    const response = await axios.get(`${globalVariables.api_url}/staffcocurricular/view/${staffId}`);
    console.log('API Response (Staff Cocurricular):', response.data);
    if (response.data && response.data.data) {
      setCocurriculars(response.data.data);
    } 
  } catch (error) {
    console.error('Error fetching staff cocurricular:', error);
 
  }
};

useEffect(() => {
  fetchStaffCocurricular();
  
}, []);

const fetchqualifications = async () => {
  try {
    const response = await axios.get(globalVariables.api_url + '/staffqualificationdetails/qualification_details', {
      params: {
        fk_candidate_id: staffId,
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

  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/schools`);
      if (response.data.status) {
        setSchoolsData(response.data.data);
     
        const schoolOptions = response.data.data.map(school => ({
          value: school.school_id,
          label: `${school.school_name} (${school.location})`
        }));
        setSchools(schoolOptions);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
      print_toast('error', 'Error fetching schools');
    }
  };

  useEffect(() => {
    const fetchAcademicYearLabel = async () => {
      if (academicyear) {
        try {
          // Use the ID directly in the URL
          const response = await axios.get(`${globalVariables.api_url}/staff_transfer/academic_year/${academicyear}`);
          if (response.data.status) {
            setAcademicYearLabel(response.data.data.year_label);
          }
        } catch (error) {
          console.error('Error fetching academic year label:', error);
        }
      }
    };

    fetchAcademicYearLabel();
  }, [academicyear]);

  const handleSchoolChange = (selectedList, selectedItem) => {
    setSelectedSchools(selectedList);
    setFormData(prevState => ({
      ...prevState,
      selectedSchools: selectedList
    }));
  
    // Update error only if selection exceeds 5
    if (selectedList.length > 5) {
      setErrors(prevErrors => ({ ...prevErrors, selectedSchools: 'You can only select up to 5 schools' }));
    } else {
      setErrors(prevErrors => ({ ...prevErrors, selectedSchools: '' }));
    }
  };
  

  const validateForm = () => {
    const newErrors = {};
    if (formData.selectedSchools.length === 0) {
      newErrors.selectedSchools = 'Please select at least one school';
    } else if (formData.selectedSchools.length > 5) {
      newErrors.selectedSchools = 'You can only select up to 5 schools';
    }
    setErrors(newErrors);
    return true; // Always return true to allow form submission
  };


  const fetchServiceDetails = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/staff/service-details/${staffId}`);
        if (response.data.status) {
            setServiceDetails(response.data.data);
        } else {
            // If the API returns status false but it's not a server error
            setServiceDetails([]);
        }
    } catch (error) {
        // Only show error toast for actual errors (network, server, etc.)
        if (error.response?.status !== 404) {  // Assuming 404 means no data
            console.error('Error fetching service details:', error);
            print_toast("error", "Failed to fetch service details");
        }
        setServiceDetails([]);
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Trigger validation message if needed
    if (formData.selectedSchools.length === 0) {
      setErrors(prev => ({ ...prev, selectedSchools: 'Please select at least one school' }));
      print_toast('error', 'Please select at least one school');
      return;
    } else if (formData.selectedSchools.length > 5) {
      setErrors(prev => ({ ...prev, selectedSchools: 'You can only select up to 5 schools' }));
      print_toast('error', 'You can only select up to 5 schools');
      return;
    }
    if (!formData.transfer_reason || formData.transfer_reason.trim() === '') {
      setErrors(prev => ({ ...prev, transfer_reason: 'Please provide a reason for transfer' }));
  
      return;
    }
  
    setFormData(prev => ({ ...prev, saving: true }));
  
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/staff_transfer/save`,
        {
          staff_email: username,
          notification_id: notification.id,
          transfer_reason:formData.transfer_reason,
          pay:formData.pay,
          pay:formData.scale_of_pay,
          
          transfer_request_type:formData.transfer_request_type,
          selected_schools: JSON.stringify(formData.selectedSchools.map(school => school.value))
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
  
      if (response.data.status === true) {
        print_toast('success', response.data.message);
        navigate('/staff-transfer-request');
      } else {
        print_toast('error', response.data.message);
        if (response.data.errors) {
          setErrors(prev => ({ ...prev, ...response.data.errors }));
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error.response?.data?.message || 'Error submitting application';
      print_toast('error', errorMessage);
    } finally {
      setFormData(prev => ({ ...prev, saving: false }));
    }
  };

  function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  
  const getschoolName = (schoolId) => {
    const school = schoolsData.find(d => d.school_id === schoolId);
    console.log(schoolsData)
    return school ? ` ${school.location} ${school.school_name}` : 'Unknown';
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <Breadcum items={breadcum} title="Transfer Application" />
      <div className="row">
        <div className="col-12">
          <div className="card">
          <div className="card-header">
          <h5 className="card-title mb-0">
                Transfer Application Form ({academicYearLabel || 'Loading...'})
              </h5>
</div>

            <div className="card-body transfer-notification">
            <div className="mb-4">
  <div className="row">
    <div className="col-md-12">
      <h6 className="fw-bold d-flex">
        <span style={{ width: '150px' }}>Title:</span>
        <span className="fw-normal">{notificationDetails.title}</span>
      </h6>
    </div>
  </div>
  <div className="row mt-2">
    <div className="col-md-12">
      <h6 className="fw-bold d-flex">
        <span style={{ width: '150px' }}>Start Date:</span>
        <span className="fw-normal">{formatDate(notificationDetails.start_date)}</span>
      </h6>
    </div>
    <div className="col-md-12">
      <h6 className="fw-bold d-flex">
        <span style={{ width: '150px' }}>End Date:</span>
        <span className="fw-normal">{formatDate(notificationDetails.end_date)}</span>
      </h6>
    </div>
  </div>
  {notificationDetails.description && (
    <div className="row mt-2">
      <div className="col-md-12">
        <div className="d-flex">
          <h6 className="fw-bold d-flex">
            <span style={{ width: '150px' }}>Description:</span>
          </h6>
          <p className="fw-normal mb-0">{notificationDetails.description}</p>
        </div>
      </div>
    </div>
  )}
  <hr className="my-3" />
</div>
<h4 className="mb-4 text-center fw-bold">APPLICATION FOR TRANSFER</h4><br></br>
              <form onSubmit={handleSubmit} className="row g-3">

          
 
              <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Name of Teacher</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={formData.staff_name}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>

                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">Designation (If HST / HSST mention subject)</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>


                <div className="row mb-3">
  <label className="col-md-4 col-form-label text-end">Date of Birth and Age</label>
  <div className="col-md-8">
    <input
      type="text"
      name="name_of_applicant"
      value={`${convertDateFormat(formData.dob)} (${formData.age} years old)`} // Combine dob and age
      className="form-control"
      required 
      readOnly
    />
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
                  <label class="col-md-4 col-form-label text-end">  Length of service in the present School<br></br>(Excluding the period of Leave Without Allowance)</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={formData.current_school_years}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>

                

                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">  Place of permanent residence & Phone No.</label>
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

                 {/* Added Parish field */}
                 <div className="row mb-3">
                  <label className="col-md-4 col-form-label text-end">Parish</label>
                  <div className="col-md-8">
                    <input
                      type="text"
                      name="parish"
                      value={formData.parish}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">  Date of commencement of continuous service in the present category under this management</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={convertDateFormat(formData.commencement_date	)}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>

                
                {/* Added fields for appointment dates */}
                <div className="row mb-3">
                  <label className="col-md-4 col-form-label text-end">Date of First Appointment in the lower category, if any</label>
                  <div className="col-md-8">
                    <input
                      type="date"
                      name="lower_category_first_appointment"
                      value={formData.lower_category_first_appointment}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <label className="col-md-4 col-form-label text-end">Date of 1st appointment in higher category</label>
                  <div className="col-md-8">
                    <input
                      type="date"
                      name="higher_category_first_appointment"
                      value={formData.higher_category_first_appointment}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <label className="col-md-4 col-form-label text-end">Date of commencement of continuous service in the lower category, if any</label>
                  <div className="col-md-8">
                    <input
                      type="date"
                      name="lower_category_continuous_service"
                      value={formData.lower_category_continuous_service}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <label className="col-md-4 col-form-label text-end">Date of commencement of continuous service in the higher category</label>
                  <div className="col-md-8">
                    <input
                      type="date"
                      name="higher_category_continuous_service"
                      value={formData.higher_category_continuous_service}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                </div>

                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end"> Date of First Appointment on scale of pay<br></br>(Daily wages appointments are not required)</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={formData.first_appointment}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>
                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">  Period of leave on loss of pay availed in all categories</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={formData.period_of_leave}
                     
                      className="form-control"
                      required readOnly
                    />

                   
                  </div>
                </div>
           
           

                       {/* Added Total Service field */}
                       <div className="row mb-3">
                  <label className="col-md-4 col-form-label text-end">Total continuous service in this management as on 31-03-{new Date().getFullYear()}</label>
                  <div className="col-md-8">
                    <div className="row">
                     
                        <div className="input-group">
                        <input
                      type="text"
                      name="name_of_applicant"
                      value={formData.total_years}
                     
                      className="form-control"
                      required readOnly
                    />

                         
                        </div>
                     
                  
                   
                    </div>
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

                <div className="row mb-3">
                  <label className="col-md-4 col-form-label text-end">Qualifications</label>
                  <div className="col-md-8">
                    <div className="mb-2">
                      <label className="form-label">General (in the case of graduate teachers, subject for B.A./B.Sc., M.A., M.Sc./ Ph.D., M.Ed. etc)</label>
                      <input 
    type="text"
    name="qualifications_general"
    value={formData.qualifications_general}
    onChange={handleChange}
    className="form-control"
  />
                    </div>
                    <div className="mb-2">
                      <label className="form-label">Professional</label>
                      <input
                        type="text"
                        name="qualifications_professional"
                        value={formData.qualifications_professional}
                        onChange={handleChange}
                        className="form-control"
                      />
                    </div>
                    <div>
                      <label className="form-label">Additional</label>
                      <input 
    type="text"
    name="qualifications_additional"
    value={formData.qualifications_additional}
    onChange={handleChange}
    className="form-control"
  />
                    </div>
                  </div>
                </div>


                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">     Whether married or not</label>
                  <div class="col-md-8">
                    <input
                      type="text"
                      name="name_of_applicant"
                      value={formData.marital_status	}
                     
                      className="form-control"
                      required readOnly
                    />

                   
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



                <div class="row mb-3">
                  <label class="col-md-4 col-form-label text-end">   Preferred Schools <span className="text-danger">*</span></label>
                  
                 <div class="col-md-8">
                  
                  <Multiselect
                      options={schools}
                      selectedValues={formData.selectedSchools}
                      onSelect={handleSchoolChange}
                      onRemove={handleSchoolChange}
                      displayValue="label"
                      showCheckbox={true}
                      placeholder="Select Schools"
                      hidePlaceholder={true}
                      closeOnSelect={false}
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                      style={{
                        chips: {
                          background: '#007bff',
                          color: 'white'
                        },
                        multiselectContainer: {
                          color: '#495057',
                          background: 'white',
                          border: '1px solid #ced4da',
                          borderRadius: '0.25rem'
                        },
                        searchBox: {
                          border: 'none',
                          borderBottom: '1px solid #ced4da',
                          borderRadius: '0'
                        }
                      }}
                      className="z-index-1000"
                    />
                     {errors.selectedSchools && (
                    <div className="text-danger mt-1">{errors.selectedSchools}</div>
                  )}
                  </div>
                </div>

                <div className="row mb-3">
      <label className="col-md-4 col-form-label text-end">
        Reasons for applying for the transfer <span className="text-danger">*</span>
          </label>
      <div className="col-md-8">
        <textarea
          name="transfer_reason"
          value={formData.transfer_reason}
          onChange={handleChange}
          className={`form-control ${errors.transfer_reason ? 'is-invalid' : ''}`}
          rows="4"
          placeholder="Please provide detailed reasons for your transfer request..."
        />
        {errors.transfer_reason && (
          <div className="invalid-feedback d-block">
            {errors.transfer_reason}
          </div>
        )}
      </div>
    </div>
    <div className="row mb-3">
                  <label className="col-md-4 col-form-label text-end">
                    Was the Transfer to the present school on request or in exigencies of service <span className="text-danger">*</span> </label>
                    
                  <div className="col-md-8">
                    <select
                      name="transfer_request_type"
                      value={formData.transfer_request_type}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select</option>
                      <option value="On request">On request</option>
                      <option value="Exigencies of service">Exigencies of service</option>
                    </select>
                  </div>
                </div>
                <div class="row">
                  <label class="col-md-4 col-form-label text-end">    Name of Schools in which employed previously from the date of commencement of continuous service with period of service in each</label> 
                  <div class="col-md-8">
                  <div className="row ">
    
        <div className="col-12">
         
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th className="text-center">Name of School</th>
                  <th className="text-center">From</th>
                  <th className="text-center">To</th>
                </tr>
              </thead>
              <tbody>
                        {serviceDetails.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    <NoDataFound />
                                </td>
                            </tr>
                        ) : (
                          serviceDetails
                          .filter(service => service.service_status	 === 'Completed')  // Only get completed items
                          .map((service, index) => (
                            <tr key={service.staff_childrens_details_id}>
                                <td className="text-center">{service.school_name}</td>
                              <td className="text-center">{convertDateFormat(service.start_date)}</td>
                              <td className="text-center">{convertDateFormat(service.end_date)}</td>
                           
                            </tr>
                          ))
                        )}
                    </tbody>
            </table>
          
        </div>
      </div>
                   
                  </div>
                </div>
              
             
                {formData.marital_status === "Married" && (
                <div class="row ">
                  <label class="col-md-4 col-form-label text-end">    Details of schools your children are studying</label>
                  <div class="col-md-8">
                  <div className="col-12">
        
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th className="text-center">Sl No</th>
                  <th className="text-center">Class</th>
                  <th className="text-center">Name of School</th>
                  <th className="text-center">Syllabus</th>
                  <th className="text-center">Aided/Unaided</th>
                </tr>
              </thead>
              <tbody>
                        {childrenDetails.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    <NoDataFound />
                                </td>
                            </tr>
                        ) : (
                          childrenDetails.map((child, index) => (
                                <tr key={child.staff_childrens_details_id}>
                                    <td className="text-center">{index + 1}</td>
                                    <td className="text-center">{child.childrens_class}</td>
                                    <td className="text-center">{child.childrens_school_name}</td>
                                   
                                    <td className="text-center">{child.syllabus}</td>
                                    <td className="text-center">{child.school_type}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
            </table>
         

                   
                  </div>  </div>
                </div>

)}


                <div class="row">
                  <label class="col-md-4 col-form-label text-end"> Are you in-charge of any extra curricular activities / organizations viz. SPC, NCC, Scout and Guides, NSS, Redcross, etc. in your school</label>
                  <div class="col-md-8">
                  <div className="col-12">
       
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th className="text-center">Name of activities / organizations</th>
                  <th className="text-center">From year</th>
                  <th className="text-center">To year</th>
                  <th className="text-center">Qualification related to the activity / organization</th>
                </tr>
              </thead>
              <tbody>
                        {cocurriculars.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-center">
                                    <NoDataFound />
                                </td>
                            </tr>
                        ) : (
                          cocurriculars.map((curricular, index) => (
                                <tr key={curricular.staff_childrens_details_id}>
                                    <td className="text-center">{curricular.activity_name			}</td>
                                    <td className="text-center">{convertDateFormat(curricular.start_date)		}</td>
                                    <td className="text-center">{convertDateFormat(curricular.end_date)	}</td>
                                    <td className="text-center">{curricular.qualification	}</td>
                                   
                                </tr>
                            ))
                        )}
                    </tbody>
            </table>
        
        </div>
                   
                  </div>
                </div>

     

                <div className="col-12 d-flex justify-content-center">
                  <button
                    type="submit"
                    className="btn btn-success me-2"
                    disabled={formData.saving}
                  >
                    {formData.saving ? 'Submitting...' : 'Submit Application'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => navigate('/transfernotification')}
                    disabled={formData.saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffTransferApplication;