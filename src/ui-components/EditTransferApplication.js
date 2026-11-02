import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import globalVariables from "../Global.js";
import { convertDateFormat } from '../utilities/dateconverter.js';
import { useNavigate, useParams } from 'react-router-dom';
import Multiselect from 'multiselect-react-dropdown';
import NoDataFound from "./NoDataFound";
import Breadcum from "./Breadcum";
import useAuth from '../utilities/useAuth.js';
import print_toast from '../utilities/Toaster.js';
const EditTransfer = () => {
  const { transfer_application_id } = useParams(); // Get transfer_application_id from URL
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const auth = useAuth();
  const username = auth.user.username;
  const staffId = auth.user.user_id;

  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'My Transfer Requests', Link: '/staff-transfer-request' },
    { Title: 'Edit Transfer Application', Link: '' },
  ]);

  // Define state variables
  const [formData, setFormData] = useState({
    staff_name: '',
    designation: '',
    dob: '',
    age: '',
    school: '',
    address: '',
    phone: '',
    commencement_date: '',
    first_appointment: '',
    period_of_leave: '',
    scale_of_pay: '',
    marital_status: '',
    corporate_employee: '',
    spouse_officail_name: '',
    spouse_school_location: '',
    spouse_designation_name: '',
    transfer_reason: '',
    selectedSchools: [],
    saving: false
  });

  // Define states for dependent data
  const [serviceDetails, setServiceDetails] = useState([]);
  const [childrenDetails, setChildrenDetails] = useState([]);
  const [cocurriculars, setCocurriculars] = useState([]);
  const [errors, setErrors] = useState({});

  const [modalData, setModalData] = useState({
    fromSchool: '',
    staffId: '',
    fromSchoolid: '',
    toSchool: '',
    staffName: '',
    designationId: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all necessary data when component mounts
    fetchStaffTransferDetails();
    fetchSchools();
  }, [transfer_application_id]);

  const fetchStaffTransferDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${globalVariables.api_url}/transfer/transferdetails/${transfer_application_id}`
      );

      const data = response.data.data;
      setStaffData(data);

      // Parse address components
      const address = [
        data.present_address,
        data.present_place,
        data.present_city,
        data.present_district,
        data.present_state,
        data.present_pin_no,
      ].filter((field) => field).join(", ");

      // Calculate age from DOB if available
      let age = '';
      if (data.dob) {
        const birthDate = new Date(data.dob);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
      }

      // Transform preferred_schools to match the format expected by Multiselect
      const formattedPreferredSchools = data.preferred_schools ? data.preferred_schools.map(school => ({
        ...school,
        label: `${school.school_name}, ${school.location}`,
        school_id: school.fk_school_id,
        school_name: school.school_name,
        location: school.location
      })) : [];

      // Set form data
      setFormData({
        staff_name: data.staff_official_name || '',
        designation: data.designation || '',
        dob: data.dob ? convertDateFormat(data.dob) : '',
        age: age,
        school: `${data.location || ''}, ${data.school_name || ''}`.trim(),
        address: address,
        phone: data.phone || '',
        commencement_date: data.commencement_date ? convertDateFormat(data.commencement_date) : '',
        first_appointment: data.first_appointment_date ? convertDateFormat(data.first_appointment_date) : '',
        period_of_leave: `${data.leave_years || 0} years, ${data.leave_months || 0} months, ${data.leave_days || 0} days`,
        scale_of_pay: data.pay && data.scale_of_pay 
        ? `${data.pay} & ${data.scale_of_pay}` 
        : `${data.pay || data.scale_of_pay || ''}`,
        marital_status: data.marital_status || '',
        corporate_employee: data.corporate_employee || '',
        spouse_officail_name: data.spouse_officail_name || '',
        spouse_designation_name: data.spouse_designation_name || '',
        spouse_school_location: data.spouse_school_location || '',
        transfer_reason: data.transfer_reason || '',
        selectedSchools: formattedPreferredSchools
      });
      
      // Set service details, children details, and co-curricular activities
      if (data.previous_schools) {
        setServiceDetails(data.previous_schools);
      }

    } catch (error) {
      console.error("Error fetching staff details:", error);
      setErrorMessage("Failed to load transfer details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [transfer_application_id]);

  const [qualifications, setQualifications] = useState([]);
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
        //  print_toast("error", "Failed to fetch service details");
      }
      setServiceDetails([]);
    }
  };


  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff_transfer/schools`);
      if (response.data.status) {
        // Add label property to schools for Multiselect component
        const schoolsWithLabels = response.data.data.map(school => ({
          ...school,
          label: `${school.school_name}, ${school.location}`
        }));
        setSchools(schoolsWithLabels);
      }
    } catch (error) {
      setErrorMessage('Failed to fetch schools');
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the field is academic_year, update selectedYear
    if (name === "academic_year") {
      setSelectedYear(value);
    } else {
      // Otherwise update the formData state
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const handleSchoolChange = (selectedList) => {
    setFormData(prev => ({
      ...prev,
      selectedSchools: selectedList
    }));
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
    fetchChildrenDetails();
    fetchServiceDetails();
  }, []);


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
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation checks
    if (formData.selectedSchools.length === 0) {
      setErrors(prev => ({ ...prev, selectedSchools: 'Please select at least one school' }));
      print_toast('error', 'Please select at least one school');
      return;
    } else if (formData.selectedSchools.length > 5) {
      setErrors(prev => ({ ...prev, selectedSchools: 'You can only select up to 5 schools' }));
      print_toast('error', 'You can only select up to 5 schools');
      return;
    }
      
    setFormData(prev => ({ ...prev, saving: true }));
    
    try {
      const updateData = new URLSearchParams();
      updateData.append('transfer_id', transfer_application_id);
      updateData.append('staff_id', modalData.staffId);
      updateData.append('staff_email', username);
      updateData.append('transfer_reason', formData.transfer_reason);
      updateData.append('pay', formData.pay);
      updateData.append('scale_of_pay', formData.scale_of_pay);
      updateData.append('transfer_request_type', formData.transfer_request_type);
      updateData.append('selected_schools', JSON.stringify(formData.selectedSchools.map(school => school.school_id)));
      
      console.log('Sending data:', Object.fromEntries(updateData));
      
      const response = await axios.post(
        `${globalVariables.api_url}/staff_transfer/update`,
        updateData,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }
      );
      
      console.log('API Response:', response.data);
      
      if (response.data.status === true) {
        print_toast('success', response.data.message);
        navigate('/staff-transfer-request');
      } else {
        print_toast('error', response.data.message || 'Failed to update transfer');
        if (response.data.errors) {
          setErrors(prev => ({ ...prev, ...response.data.errors }));
        }
      }
    } catch (error) {
      console.error('Error updating transfer:', error);
      
      // Better error handling with more detailed logging
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        const errorMessage = error.response.data?.message || 'Server error occurred';
        print_toast('error', errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        print_toast('error', 'No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        console.error('Request error:', error.message);
        print_toast('error', 'Error sending request: ' + error.message);
      }
    } finally {
      setFormData(prev => ({ ...prev, saving: false }));
    }
  };

  const handleSubmit1 = async (e) => {
    e.preventDefault();

    if (!modalData.toSchool) {
      alert("Please select a destination school.");
      return;
    }


    // Set saving state to true to disable buttons
    setFormData(prev => ({
      ...prev,
      saving: true
    }));


    try {
      const updateData = {
        transfer_id: transfer_application_id,
        academic_year_id: selectedYear,
        transfer_date: transferDate,
        from_school_id: modalData.fromSchoolid,
        to_school_id: modalData.toSchool,
        staff_id: modalData.staffId,

        transfer_reason: formData.transfer_reason,
        preferred_schools: JSON.stringify(formData.selectedSchools)
      };

      const response = await axios.put(
        `${globalVariables.api_url}/transfer/update_transfer`,
        updateData
      );

      if (response.data.status) {
        alert("Transfer updated successfully!");
        navigate('/transferlist'); // Redirect to transfer list page
      } else {
        alert(response.data.message || "Failed to update transfer");
        // Reset saving state
        setFormData(prev => ({
          ...prev,
          saving: false
        }));
      }
    } catch (error) {
      console.error("Error updating transfer:", error);
      alert("An error occurred while updating the transfer.");
      // Reset saving state
      setFormData(prev => ({
        ...prev,
        saving: false
      }));
    }

  };

  const handleCancel = () => {
    navigate('/staff-transfer-request'); // Redirect back to transfer list
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading transfer data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Breadcum items={breadcum} title="Transfer Application Form" />
      <div className="row">
        <div className="container py-4">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Edit Transfer</h2>
            </div>
            <div className="card-body">
              <h4 className="mb-4 text-center fw-bold">APPLICATION FOR TRANSFER</h4>

              <form onSubmit={handleSubmit}>
                {/* Academic Year and Transfer Date */}


                {/* Teacher Information Section */}
                <div className="card mb-4">

                  <div className="card-body">
                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Name of Teacher</label>
                      <div className="col-md-8">
                        <input
                          type="text"
                          name="staff_name"
                          value={formData.staff_name}
                          className="form-control"
                          required readOnly
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Designation (If HST / HSST mention subject)</label>
                      <div className="col-md-8">
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
                          name="dob_age"
                          value={`${formData.dob} (${formData.age} years old)`}
                          className="form-control"
                          required readOnly
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">School in which now working</label>
                      <div className="col-md-8">
                        <input
                          type="text"
                          name="school"
                          value={formData.school}
                          className="form-control"
                          required readOnly
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Place of permanent residence & Phone No.</label>
                      <div className="col-md-8">
                        <input
                          type="text"
                          name="address_phone"
                          value={`${formData.address} ${formData.phone ? '- ' + formData.phone : ''}`}
                          className="form-control"
                          required readOnly
                        />
                      </div>
                    </div>




                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Date of commencement of continuous service in the present category under this management</label>
                      <div className="col-md-8">
                        <input
                          type="text"
                          name="commencement_date"
                          value={formData.commencement_date}
                          className="form-control"
                          required readOnly
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Date of First Appointment on scale of pay</label>
                      <div className="col-md-8">
                        <input
                          type="text"
                          name="first_appointment"
                          value={formData.first_appointment}
                          className="form-control"
                          required readOnly
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Period of leave on loss of pay availed in all categories</label>
                      <div className="col-md-8">
                        <input
                          type="text"
                          name="period_of_leave"
                          value={formData.period_of_leave}
                          className="form-control"
                          required readOnly
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Pay and Scale of pay</label>
                      <div className="col-md-8">
                        <input
                          type="text"
                          name="scale_of_pay"
                          value={formData.scale_of_pay}
                          className="form-control"
                          required readOnly
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Whether married or not</label>
                      <div className="col-md-8">
                        <input
                          type="text"
                          name="marital_status"
                          value={formData.marital_status}
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
                            name="spouse_details"
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




                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">
                        Reasons for applying for the transfer
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
                      <label className="col-md-4 col-form-label text-end">Preferred Schools</label>
                      <div className="col-md-8">
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


                    {/* Previous Employment Section */}

                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Name of Schools in which employed previously from the date of commencement of continuous service with period of service in each</label>
                      <div className="col-md-8">

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
                                <td colSpan="3" className="text-center">
                                  <NoDataFound />
                                </td>
                              </tr>
                            ) : (
                              serviceDetails
                                .filter(service => service.service_status === 'Completed')
                                .map((service, index) => (
                                  <tr key={index}>
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


                    {/* Children Information Section (if married) */}
                    {formData.marital_status === "Married" && (

                      <div className="row mb-3">
                        <label className="col-md-4 col-form-label text-end">Details of schools your children are studying</label>
                        <div className="col-md-8">

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
                                  <tr key={index}>
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

                        </div>

                      </div>
                    )}

                    {/* Extra Curricular Activities Section */}

                    <div className="row mb-3">
                      <label className="col-md-4 col-form-label text-end">Are you in-charge of any extra curricular activities / organizations viz. SPC, NCC, Scout and Guides, NSS, Redcross, etc. in your school</label>
                      <div className="col-md-8">

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
                                <td colSpan="4" className="text-center">
                                  <NoDataFound />
                                </td>
                              </tr>
                            ) : (
                              cocurriculars.map((curricular, index) => (
                                <tr key={index}>
                                  <td className="text-center">{curricular.activity_name}</td>
                                  <td className="text-center">{convertDateFormat(curricular.start_date)}</td>
                                  <td className="text-center">{convertDateFormat(curricular.end_date)}</td>
                                  <td className="text-center">{curricular.qualification}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>

                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message Display */}
                {errorMessage && (
                  <div className="alert alert-danger">{errorMessage}</div>
                )}

                {/* Action Buttons */}
                <div className="col-12 d-flex justify-content-center mt-3 gap-2">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={formData.saving}
                  >
                    {formData.saving ? 'Submitting...' : 'Update Transfer'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleCancel}
                    disabled={formData.saving}
                  >
                    Cancel
                  </button>

                </div>
              </form>
            </div>
          </div>
        </div>  </div>
    </>
  );
};

export default EditTransfer;