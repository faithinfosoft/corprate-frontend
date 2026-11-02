import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { convertDateFormat } from '../utilities/dateconverter';
import Breadcum from "./Breadcum";
import axios from "axios";
import globalVariables from "../Global.js";
import logo_image from '../assets/ui-master/img/logo.png';
import useAuth from "../utilities/useAuth";
const StaffPromotionApplicationLetter = () => {
  const { promotion_detail_id } = useParams();

  const auth = useAuth();
  const staff_id = auth.user.user_id;
 
   const [parishHistory, setParishHistory] = useState([]);
  const navigate = useNavigate();
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'My Applications', Link: '/staff-applications' },
    { Title: 'Application for Promotion', Link: '' },
  ]);
  const [qualifications, setQualifications] = useState([]);
  const [formData, setFormData] = useState({
    teacherName: '',
    dateOfBirth: '',
    age: '',
    designation: '',
    subject: '',
    currentSchool: '',
    homeAddress: '',
    mobileNo: '',
    landNo: '',
    emailId: '',
    parish: '',
    diocese: '',
    generalQualification: '',
    professionalQualification: '',
    additionalQualification: [],
    serviceDate: {
      lpst: '',
      upst: '',
      hst: '',
      hsst: ''
    },
    totalService: '',
    previousSchools: '',
    spouseDetails: ''
  });
  
  const [pdfloading, setPdfLoading] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  
  const fetchParishHistory = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/staff/parish-history/${staff_id}`);
        // Always set the data regardless of whether it's empty or not
        if (response.data.status) {
            setParishHistory(response.data.data);
        } else {
            // If the API returns status false but it's not a server error
            setParishHistory([]);
        }
    } catch (error) {
        // Only show error toast for actual errors (network, server, etc.)
        if (error.response?.status !== 404) {  // Assuming 404 means no data
            console.error('Error fetching parish history:', error);
          //  print_toast("error", "Failed to fetch parish history");
        }
        setParishHistory([]);
    }
};


  const fetchStaffPromotionDetails = useCallback(async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/promotion/promotiondetails/${promotion_detail_id}`
      );

      const data = response.data.data;
      setStaffData(data);

      const address = [
        data.present_address,
        data.present_place,
        data.present_city,
        data.present_district,
        data.present_state,
        data.present_pin_no,
      ]
        .filter((field) => field) // Remove any empty values
        .join(", "); 

        const nature_of_leave_date = [
            data.nature_of_leave,
            data.start_date && data.end_date
              ? `${convertDateFormat(data.start_date)} to ${convertDateFormat(data.end_date)}`
              : null,
          ]
            .filter(Boolean) // Remove null or empty values
            .join(" & ");


      setFormData((prevState) => ({
        ...prevState,
        name: data.staff_official_name,
        address: address,
        age: data.age,
        current_school:data.school_name,
        dob: convertDateFormat(data.dob),
        designation: data.designation,
        phone:data.phone_no1,
        land_no:data.phone_no2,
        emailId:data.email,
        entryDate: convertDateFormat(data.commencement_date),
        serviceDate: convertDateFormat(data.doj),
        corporate_employee	:data.corporate_employee	,
          spouse_officail_name:data.spouse_officail_name	,
          spouse_designation_name:data.spouse_designation_name,
          spouse_school_location	:data.spouse_school_location,
          marital_status:data.marital_status,
          totalService: data.total_years,
      

      }));
    } catch (error) {
      console.error("Error fetching staff details:", error);
    } finally {
      setLoaded(true);
    }
  }, [promotion_detail_id]);

  useEffect(() => {
    fetchStaffPromotionDetails();

  }, [fetchStaffPromotionDetails]);

  const fetchqualifications = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/staffqualificationdetails/qualification_details',{

        params: {
          fk_candidate_id:staff_id,
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
    fetchServiceDetails();
    fetchParishHistory();
  }, []);



  const handleGeneratePDF = async () => {
    // Show confirmation prompt
    const isConfirmed = window.confirm("Are you sure you want to generate and send the letter?");
  
    if (!isConfirmed) {
      return; // Exit if the user cancels the action
    }
  
    setPdfLoading(true);
    try {
      const form_data = {
        params: {
            promotion_detail_id: promotion_detail_id
        },
        responseType: 'blob'
      };
  
      const response = await axios.get(globalVariables.api_url + '/promotion/generate_promotion_application_form', form_data);
  
      // Handle the response, for example, trigger a file download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'staff_leave_application_letter.pdf');
      document.body.appendChild(link);
      link.click();
      navigate('/staff-leave-request');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    setPdfLoading(false);
  };
  

 const [serviceDetails, setServiceDetails] = useState([]);
  const fetchServiceDetails = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/staff/service-details/${staff_id}`);
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
           // print_toast("error", "Failed to fetch service details");
        }
        setServiceDetails([]);
    }
};
  return (
    <>
      <Breadcum items={breadcum} title="Application for Promotion" />
      <div className="row" style={{ fontFamily: 'Times New Roman, serif' }}>
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="max-w-4xl mx-auto p-4" style={{ fontFamily: "Times New Roman, serif" }}>
               
  

<div className="text-center mb-6">
                  <h4 className="mb-4 text-center fw-bold"><u>APPLICATION FOR PROMOTION AS PRINCIPAL/HEADMASTER</u></h4>
                </div>

                {/* <div className="flex justify-center items-center mb-4">
  <div className="border border-gray-400 w-32 h-40 flex items-center justify-center">
    <p className="text-center text-sm italic">Affix your Recent Passport size Photo</p>
  </div>
</div> */}

                {loaded ? (
                   <table className="table table-bordered">
                  <tbody>
 
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">1</td>
    <td className="border border-gray-400 p-2"> Name of Teacher</td>
    <td className="border border-gray-400 p-2">{formData.name}</td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">2</td>
    <td className="border border-gray-400 p-2">
      Date of birth<br />
      <span className="pl-4">Age as on 01-04-{new Date().getFullYear()}</span>
    </td>
    <td className="border border-gray-400 p-2">
      {formData.dob}<br />
      {formData.age} years
    </td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">3</td>
    <td className="border border-gray-400 p-2">
       Designation<br />
      <span className="pl-4">(If HSST / HST mention subject)</span>
    </td>
    <td className="border border-gray-400 p-2">
      {formData.designation} - {formData.subject}
    </td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">4</td>
    <td className="border border-gray-400 p-2"> School in which now working</td>
    <td className="border border-gray-400 p-2">{formData.current_school}</td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">5</td>
    <td className="border border-gray-400 p-2"> Home Address</td>
    <td className="border border-gray-400 p-2">{formData.address}</td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">6</td>
    <td className="border border-gray-400 p-2">
      Mobile No.<br />
      <span className="pl-4">Land No.</span>
    </td>
    <td className="border border-gray-400 p-2">
      {formData.phone}<br />
      {formData.land_no}
    </td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">7</td>
    <td className="border border-gray-400 p-2"> Email ID</td>
    <td className="border border-gray-400 p-2">{formData.emailId}</td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">8</td>
    <td className="border border-gray-400 p-2">
       Name & Address of the Parish<br />
      <span className="pl-4">Diocese</span>
    </td>
    <td className="border border-gray-400 p-2">
    {parishHistory
      .filter(parish => parish.parish_status === "active")
      .map((parish, index) => (
        <div key={index}>{parish.parish_name},{parish.parish_location}<br></br>
         <span className="pl-4">{parish.diocese}</span>
        </div>

      ))}
    </td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">9</td>
    <td className="border border-gray-400 p-2"> a) General Qualification with Subject</td>
    <td className="border border-gray-400 p-2">
    {qualifications
      .filter((qual) => qual.qual_type === "Academic")
      .map((qual, index) => (
        <div key={index}>
          {qual.title} ({qual.course}), {qual.school_university} - {qual.year_passing}
        </div>
      ))}
  </td>
  </tr>
  <tr className="border border-gray-400">
  <td className="border border-gray-400 p-2 text-center"></td>
  <td className="border border-gray-400 p-2">b) Professional Qualification</td>
  <td className="border border-gray-400 p-2">
    {qualifications
      .filter((qual) => qual.qual_type === "Professional")
      .map((qual, index) => (
        <div key={index}>
          {qual.title} ({qual.course}), {qual.school_university} - {qual.year_passing}
        </div>
      ))}
  </td>
</tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">10</td>
    <td className="border border-gray-400 p-2">
       c) Additional Qualification<br />
      <span className="pl-4">(Put ✓ marks)</span>
    </td>
    <td className="border border-gray-400 p-2">
    {qualifications
      .filter((qual) => qual.qual_type === "Additional")
      .map((qual, index) => (
        <div key={index}>
          {qual.title} ({qual.course}), {qual.school_university} - {qual.year_passing}
        </div>
      ))}
      <br />
      {/* <span className="text-sm">(Attach copies)</span> */}
    </td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">11</td>
    <td className="border border-gray-400 p-2">
      Date of commencement of continuous<br />
      <span className="pl-4">service in each Grade</span>
    </td>
    <td className="border border-gray-400 p-2">
      <table className="w-full">
        <thead>
          <tr>
            <th className="border border-gray-400 p-1">LPST / UPST</th>
            <th className="border border-gray-400 p-1">HST</th>
            <th className="border border-gray-400 p-1">HSST</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-gray-400 p-1 text-center">
              {formData.serviceDate.lpst || formData.serviceDate.upst}
            </td>
            <td className="border border-gray-400 p-1 text-center">{formData.serviceDate.hst}</td>
            <td className="border border-gray-400 p-1 text-center">{formData.serviceDate.hsst}</td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">12</td>
    <td className="border border-gray-400 p-2">
       Total continuous service in this<br />
      <span className="pl-4">Management in the present category</span><br />
      <span className="pl-4">as on 31-03-{new Date().getFullYear()}</span>
    </td>
    <td className="border border-gray-400 p-2">{formData.totalService} Years</td>
  </tr>
  <tr className="border border-gray-400">
  <td className="border border-gray-400 p-2 text-center">13</td>
  <td className="border border-gray-400 p-2">
    Name of schools previously employed<br />
    <span className="pl-4">from the date of continuous service</span>
  </td>
  <td className="border border-gray-400 p-2">
    {serviceDetails
      .filter(service => service.service_status === "Completed")
      .map((service, index) => (
        <div key={index}>{service.school_name}</div>
      ))}
  </td>
</tr>
{formData.marital_status === "Married" && formData.corporate_employee === "Yes" && (
  <tr className="border border-gray-400">
    <td className="border border-gray-400 p-2 text-center">14</td>
    <td className="border border-gray-400 p-2">
      If married, specify whether husband /<br />
      <span className="pl-4">wife is employed in this Management.</span><br />
      <span className="pl-4">If so give details</span>
    </td>
    <td className="border border-gray-400 p-2">
  {[
    formData.corporate_employee,
    formData.spouse_officail_name,
    formData.spouse_school_location,
    formData.spouse_designation_name
  ]
    .filter(Boolean) // Remove null, undefined, and empty strings
    .join(', ')}
</td>

  </tr>
  )}
</tbody>
                  </table>
                ) : (
                  <p className="text-center py-4">Loading application data...</p>
                )}

                <div className="mt-8">
                  <h4 className="text-center font-semibold mb-4">Declaration of the Applicant</h4>
                  <p className="text-justify mb-4">
                    I, <b>{formData.name}</b> HSST / HST / UPST / LPST
                    do hereby declare that the particulars furnished in the application are true. I further declare that if
                    selected I shall be prepared to serve as Principal / Headmaster in any of the school under the
                    management for a minimum period of two years.
                  </p>
                  <div className="text-right mb-8">
                    <p >Signature of the Applicant</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-center font-semibold mb-4">Certificate of Principal / Headmaster / Headmistress</h4>
                  <p className="text-justify mb-8">
                    Certified that the service details and total service as on 31-03-{new Date().getFullYear()} furnished by the teacher
                    have been verified with the original records and found correct.
                  </p>
                  <div className="flex justify-between mb-4">
                    <div>
                      <p>Place: </p>
                      <p>Date: </p>
                    </div>
                    <div className="text-right">
                      <p>Signature of the Principal / Headmaster / Headmistress</p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                <button
                  onClick={handleGeneratePDF}
                  className="btn btn-primary"
                  disabled={pdfloading}
                >
                  {pdfloading ? "Submitting..." : "Submit Application"}
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

export default StaffPromotionApplicationLetter;