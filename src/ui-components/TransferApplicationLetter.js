import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import { convertDateFormat } from '../utilities/dateconverter';
import { useParams } from "react-router-dom";
import Breadcum from "./Breadcum";
import useAuth from '../utilities/useAuth.js';
import print_toast from '../utilities/Toaster.js';
import NoDataFound from './NoDataFound';
const TransferApplicationLetter = () => {
  const { transfer_application_id } = useParams();
  const auth = useAuth();
  const username = auth.user.username;
  const staffId = auth.user.user_id;
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'My Transfer Requests', Link: '/staff-transfer-request' },
    { Title: 'Application for Transfer', Link: '' },
  ]);
    const [qualifications, setQualifications] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    age: '',
    designation: '',
    subject: '',
    currentSchool: '',
    serviceLength: '',
    permanentAddress: '',
    phoneNo: '',
    parish: '',
    serviceDate: '',
    appointmentDate: '',
    leavesTaken: { years: '', months: '', days: '' },
    totalService: '',
    payScale: '',
    qualifications: {
      general: '',
      professional: '',
      additional: ''
    },
    maritalStatus: '',
    spouseDetails: '',
    preferredSchools: ['', '', '', '', ''],
    transferReason: '',
    wasTransferRequested: '',
    previousSchools: [],
    childrenEducation: [],
    extraCurricular: []
  });
  
  const [pdfloading, setPdfLoading] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const [loaded, setLoaded] = useState(false);
 const [childrenDetails, setChildrenDetails] = useState([]);
 const [serviceDetails, setServiceDetails] = useState([]);
  const [cocurriculars, setCocurriculars] = useState([]);

  const fetchStaffTransferDetails = useCallback(async () => {
    try {
      setLoaded(false);
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

      setFormData({
        name: data.staff_official_name || '',
        dob: data.dob ? convertDateFormat(data.dob) : '',
        age: age,
        designation: data.designation		 || '',
        subject: data.subject || '',
        currentSchool: `${data.location || ''}, ${data.school_name || ''}`.trim(),


        serviceLength: data.current_school_years === 1  ? "1 yr"  : data.current_school_years + " yrs",
        permanentAddress: address,
        phoneNo: data.phone || '',
        parish: data.parish || '',
        serviceDate: data.commencement_date ? convertDateFormat(data.commencement_date) : '',
        appointmentDate: data.first_appointment_date ? convertDateFormat(data.first_appointment_date) : '',
        leavesTaken: {
          years: data.leave_years || '',
          months: data.leave_months || '',
          days: data.leave_days || ''
        },
        //totalService:staffData.total_years + " yrs",
        payScale:  `${data.pay} & ${data.scale_of_pay}` || '',
       
        maritalStatus: data.marital_status || '',
        corporate_employee	:data.corporate_employee	,
        spouse_officail_name:data.spouse_officail_name	,
        spouse_designation_name:data.spouse_designation_name,
        spouse_school_location	:data.spouse_school_location,	
        totalService: data.total_years === 1  ? "1 yr"  : data.total_years + " yrs",
       
        preferredSchools: data.preferred_schools
        ? data.preferred_schools.map((school) => `${school.location},${school.school_name} `)
        : ['', '', '', '', ''], // Ensure five values
        transferReason: data.transfer_reason || '',
        wasTransferRequested: data.transfer_request_type || '',
        previousSchools: data.previous_schools || [],
     
      });
    } catch (error) {
      console.error("Error fetching staff details:", error);
    } finally {
      setLoaded(true);
    }
  }, [transfer_application_id]);

  useEffect(() => {
    fetchStaffTransferDetails();
  }, [fetchStaffTransferDetails]);

  const handleGeneratePDF = async () => {
    const isConfirmed = window.confirm("Are you sure you want to generate and send the transfer application?");
  
    if (!isConfirmed) {
      return;
    }
  
    setPdfLoading(true);
    try {
      const form_data = {
        params: {
          transfer_application_id: transfer_application_id
        },
        responseType: 'blob'
      };
  
      const response = await axios.get(globalVariables.api_url + '/transfer/generate_transfer_application_form', form_data);
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staff_transfer_application.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };
  

  const fetchqualifications = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/staffqualificationdetails/qualification_details',{

        params: {
          fk_candidate_id:staffId,
        },
        headers: {
          'Content-Type': 'application/json',
        },



    });
      if (response.data.status) {
        setQualifications(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchqualifications();

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


useEffect(() => {
  fetchStaffCocurricular();
  fetchServiceDetails();
  fetchChildrenDetails();
  fetchSchools();

}, []);
  const [schoolsData, setSchoolsData] = useState([]);
    const [schools, setSchools] = useState([]);
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


const getschoolName = (schoolId) => {
  const school = schoolsData.find(d => d.school_id === schoolId);
  console.log(schoolsData)
  return school ? ` ${school.location} ${school.school_name}` : 'Unknown';
};


  return (
    <>
      <Breadcum items={breadcum} title="Transfer Application Form" />
      <div className="row">
        <div className="col-12">
          <div className="card">

            <div className="card-header d-flex justify-content-between align-items-center">
                          <h5 className="card-title mb-0">Application for  Transfer</h5>
                        
                        </div>
       
            <div className="card-body">
          
              <div className="max-w-4xl mx-auto p-4 font-serif" style={{ fontFamily: "Times New Roman, serif" }}>
                <div className="text-center mb-1">
                
                  <h5 className="text-md mt-3 font-semibold">APPLICATION FOR TRANSFER</h5>
                </div>

                {loaded ? (
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <td width="5%">1</td>
                        <td width="45%">Name of Teacher</td>
                        <td width="50%">{formData.name}</td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>Designation<br/>(If HST / HSST mention subject)</td>
                        <td>{formData.designation}<br/>{formData.subject}</td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>Date of birth and age</td>
                        <td>{formData.dob} - {formData.age} years</td>
                      </tr>
                      <tr>
                        <td>4</td>
                        <td>School in which now working</td>
                        <td>{formData.currentSchool}</td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>Length of service in the present School<br/>(Excluding the period of Leave Without Allowance)</td>
                        <td>{formData.serviceLength}</td>
                      </tr>
                      <tr>
                        <td>6</td>
                        <td>Place of permanent residence & Phone No.</td>
                        <td>{formData.permanentAddress}<br/>Phone: {formData.phoneNo}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>a) Parish</td>
                        <td>{formData.parish}</td>
                      </tr>
                      <tr>
                        <td>7</td>
                        <td>Date of commencement of continuous service in the present category under this management</td>
                        <td>{formData.serviceDate}</td>
                      </tr>
                      <tr>
                        <td>8</td>
                        <td>Date of First Appointment on scale of pay<br/>(Daily wages appointments are not required)</td>
                        <td>{formData.appointmentDate}</td>
                      </tr>
                      <tr>
                        <td>9</td>
                        <td>Period of leave on loss of pay availed in all categories</td>
                        <td>
                          <div className="row">
                            <div className="col-4 text-center">Y: {formData.leavesTaken.years}</div>
                            <div className="col-4 text-center">M: {formData.leavesTaken.months}</div>
                            <div className="col-4 text-center">D: {formData.leavesTaken.days}</div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>10</td>
                        <td>Total continuous service in this management as on 31.03.{new Date().getFullYear()}</td>
                        <td>{formData.totalService}</td>
                      </tr>
                      <tr>
                        <td>11</td>
                        <td>Pay and Scale of pay</td>
                        <td>{formData.payScale}</td>
                      </tr>
                      <tr>
                        <td>12</td>
                        <td colSpan="2">Qualifications</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>a) General<br/>(in the case of graduate teachers, mention subject for B.A./B.Sc., M.A., M.Sc./Ph.D., M.Ed.etc)</td>
                        <td>{qualifications
      .filter((qual) => qual.qual_type === "Academic")
      .map((qual, index) => (
        <div key={index}>
          {qual.title} ({qual.course}), {qual.school_university} - {qual.year_passing}
        </div>
      ))}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>b) Professional</td>
                        <td>{qualifications
      .filter((qual) => qual.qual_type === "Professional")
      .map((qual, index) => (
        <div key={index}>
          {qual.title} ({qual.course}), {qual.school_university} - {qual.year_passing}
        </div>
      ))}</td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>c) Additional</td>
                        <td>{qualifications
      .filter((qual) => qual.qual_type === "Additional")
      .map((qual, index) => (
        <div key={index}>
          {qual.title} ({qual.course}), {qual.school_university} - {qual.year_passing}
        </div>
      ))}</td>
                      </tr>
                      <tr>
                        <td>13</td>
                        <td>Whether married or not</td>
                        <td>{formData.maritalStatus}</td>
                      </tr>
                      <tr>
  <td>14</td>
  <td>Whether both husband and wife are employed in this management and if so give details</td>
  <td>
    {formData.marital_status === "Married" && formData.corporate_employee === "Yes" ? (
      [
        formData.corporate_employee,
        formData.spouse_officail_name,
        formData.spouse_school_location,
        formData.spouse_designation_name
      ]
      .filter(Boolean) // Remove null, undefined, or empty values
      .join(', ')
    ) : (
      formData.spouseDetails || "N/A"
    )}
  </td>
</tr>

                      <tr>
  <td>15</td>
  <td colSpan="2">Name of schools to which transfer is applied for (in order of preference, only five)</td>
</tr>
<tr>
  <td colSpan="3">
  <ol className="mb-0 ps-5">
  {formData.preferredSchools && formData.preferredSchools.length > 0 ? (
    formData.preferredSchools.map((school, index) => (
      <li key={index} className="mb-2">
        {school || '...............................................................................................'}
      </li>
    ))
  ) : (
    <li className="mb-2">...............................................................................................</li>
  )}
</ol>

  </td>
</tr>

                      <tr>
                        <td>16</td>
                        <td>Was the Transfer to the present school on request or in exigencies of service</td>
                        <td>{formData.wasTransferRequested}</td>
                      </tr>
                      <tr>
                        <td>17</td>
                        <td>Reasons for applying for the transfer</td>
                        <td>{formData.transferReason}</td>
                      </tr>
                      <tr>
                        <td>18</td>
                        <td colSpan="2">Name of Schools in which employed previously from the date of commencement of continuous service with period of service in each.</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <p>Loading...</p>
                )}

                {loaded && (
                  <>
                    <table className="table table-bordered mt-3">
                      <thead>
                        <tr>
                          <th>Name of School</th>
                          <th>From</th>
                          <th>To</th>
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

                    <h5 className="mt-4 mb-3" style={{ fontFamily: "Times New Roman, serif" }}>Details of schools your children are studying:</h5>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Sl.No.</th>
                          <th>Class</th>
                          <th>Name of School</th>
                          <th>Syllabus</th>
                          <th>Aided / Unaided</th>
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

                    <h5 style={{ fontFamily: "Times New Roman, serif" }} className="mt-4 mb-3">Are you in-charge of any extra curricular activities / organizations viz. SPC, NCC, Scout and Guides, NSS, Redcross, etc. in your school:</h5>
                    <table className="table table-bordered">
                      <thead>
                        <tr>
                          <th>Name of activities / organizations</th>
                          <th>Duration From (year)</th>
                          <th>to (year)</th>
                          <th>Qualification related to the activity / organization</th>
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

                    <div className="mt-4 p-3 border">
                      <h5 className="text-center mb-3" style={{ fontFamily: "Times New Roman, serif" }}>DECLARATION</h5>
                      <p>
                        I  {formData.name} teacher of {formData.currentSchool} do hereby declare that the particulars furnished in the application are true.
                        
                      </p>
                      <div className="text-end mt-3">
                        <p>Signature of Head of the Institution</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 border">
                      <p>
                        Certified that the service details and total service as on 31.03.{new Date().getFullYear()}furnished by the teacher are verified and found correct.
                      </p>
                      <div className="text-end mt-3">
                        <p>Signature of Head of the Institution</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 border">
                      <h5>Recommendation</h5>
                      <div className="mt-4 mb-4 border-bottom"></div>
                      <div className="text-end">
                        <p>Signature of the Local Manager</p>
                      </div>
                    </div>

                    <div className="mt-4 p-3 border">
                      <p><strong>N.B:</strong></p>
                      <ol>
                        <li>Incorrect applications will be rejected without any prior information.</li>
                        <li>Teaching and Non-teaching staff should submit their application through the HM.</li>
                        <li>Last date to submit the application is February 15.</li>
                      </ol>
                    </div>
                  </>
                )}

                <div className="text-center mt-4">
                  <button onClick={handleGeneratePDF} className="btn btn-success" disabled={pdfloading}>
                    {pdfloading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Generating Application...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-file-pdf me-2"></i>
                        Generate Transfer Application
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransferApplicationLetter;