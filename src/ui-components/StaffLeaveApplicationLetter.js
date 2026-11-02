import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import { convertDateFormat } from '../utilities/dateconverter';
import { useParams } from "react-router-dom";
import Breadcum from "./Breadcum";
import { useNavigate } from 'react-router-dom';

const LeaveApplication = () => {
  const { leave_id } = useParams();
  const navigate = useNavigate();
    const [breadcum] = useState([
      { Title: 'Home', Link: '/' },
      { Title: 'My Leave Requests', Link: '/staff-leave-request' },
      { Title: 'Application for Leave', Link: '' },
    ]);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    post: '',
    department: '',
    payScale: '',
    entryDate: '',
    serviceDate: '',
    confirmation: '',
    address: '',
    allowance: '',
    leavePeriod: '',
    holidays: '',
    grounds: '',
    lastLeave: '',
    place: '',
    remarks: '',
    orders: '',
  });
  const [pdfloading, setPdfLoading] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const fetchStaffLeaveDetails = useCallback(async () => {
    try {
      setLoaded(false);
      const response = await axios.get(
        `${globalVariables.api_url}/leave/leavedetails/${leave_id}`
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
        dob: convertDateFormat(data.dob),
        post: data.designation,
        entryDate: convertDateFormat(data.commencement_date),
        serviceDate: convertDateFormat(data.doj),
        allowance:data.allowances,	
        sundays_holidays:data.sundays_holidays,
        reason_of_leave	:data.reason_of_leave,
        nature_of_leave_date:nature_of_leave_date,
        nature_of_leave:data.nature_of_leave,
        start_date:convertDateFormat(data.start_date),
        end_date:convertDateFormat(data.end_date),
        department: data.department_office_section,
        payScale: `${data.pay}${data.scale_of_pay ? ' & ' + data.scale_of_pay : ''}`


      }));
    } catch (error) {
      console.error("Error fetching staff details:", error);
    } finally {
      setLoaded(true);
    }
  }, [leave_id]);

  useEffect(() => {
    fetchStaffLeaveDetails();
  }, [fetchStaffLeaveDetails]);

  const formRows = [
    { label: 'Name of applicant', value: formData.name },
    { label: 'Date of birth', value: formData.dob },
    { label: 'Post held', value: formData.post },
    { label: 'Department/Office and section', value: formData.department },
    { label: 'Pay and Scale of Pay', value: formData.payScale },
    { label: 'Date of entry in service', value: formData.entryDate },
    { label: 'Date of commencement of continuous service', value: formData.serviceDate },
    { label: 'Whether the applicant has got confirmation in any post, if so from which date in which post', value: formData.confirmation },
    { label: 'Address during leave', value: formData.address },
    { label: 'House Rent Allowance, Conveyance Allowance or other compensatory allowance drawn in the present post', value: formData.allowance },
    { label: 'Nature and period of leave applied for and date from which required', value: formData.nature_of_leave_date },
    { label: 'Sundays and Holidays if any proposed to be Prefixed/Suffixed on leave', value: formData.sundays_holidays },
    { label: 'Ground on which leave is applied for', value: formData.reason_of_leave },
    { label: 'Date of return from last leave and the nature and period of that leave', value: formData.lastLeave },
   
  ];

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
            leave_id: leave_id
        },
        responseType: 'blob'
      };
  
      const response = await axios.get(globalVariables.api_url + '/leave/generate_leave_application_form', form_data);
  
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
  

  return (
    <>
    <Breadcum items={breadcum} title="Leave Application Letter" />
      <div className="row justify-content-center">
        <div className="col-11 col-lg-10">
          <div className="card shadow-sm border-0 rounded-4 mb-5">
            <div className="card-header bg-white border-bottom py-3" style={{ borderTop: "4px solid #0ea5e9" }}>
              <h5 className="card-title mb-0 text-dark fw-bold">Application for Leave</h5>
            </div>
            <div className="card-body p-4 p-md-5">
              <div className="mx-auto" style={{ fontFamily: "'Times New Roman', Times, serif", maxWidth: "800px", color: "#000" }}>
                <div className="text-center mb-5">
                  <h4 className="fw-bold text-decoration-underline" style={{ letterSpacing: "1px" }}>APPLICATION FOR LEAVE</h4>
                </div>

                {loaded ? (
                  <table width="100%" className="table-borderless mb-4">
                    <tbody>
                      {formRows.map((row, index) => (
                        <tr key={index} className="align-top">
                          <td className="py-2 pe-2 text-end" width="5%">{index + 1}.</td>
                          <td className="py-2 pe-3" width="35%">{row.label}</td>
                          <td className="py-2 text-center" width="2%">:</td>
                          <td className="py-2 ps-2 fw-semibold" width="58%">{row.value || "-"}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-3 pe-2 text-end align-top">15.</td>
                        <td colSpan={3} className="py-3">
                          <p className="mb-2 text-justify" style={{ lineHeight: "1.6" }}>
                            a) I undertake to refund the difference between the leave salary drawn during commuted leave and that admissible during half pay leave which would not have been admissible in the event of my retirement from service at the end or during the currency of leave.
                          </p>
                          <p className="mb-0 text-justify" style={{ lineHeight: "1.6" }}>
                            b) I undertake to refund the leave salary drawn during "leave not due" which would not have been admissible under Rule 85 Part 1, had it not been applied in the event of my voluntary retirement or resignation from service at any time until I earn half pay leave not less than the amount of leave not due availed by me.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 pe-2 text-end align-top">16.</td>
                        <td className="py-4 fw-semibold">Place</td>
                        <td colSpan={2} className="py-4 text-end fw-semibold">Signature of applicant (With date)</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading application details...</p>
                  </div>
                )}



                <table width="100%" className="table-borderless mb-4 mt-2">
                  <tbody>
                    <tr>
                      <td className="py-2 pe-2 text-end align-top" width="5%">17.</td>
                      <td className="py-2 pe-3 align-top" width="35%">Remarks and/or recommendation of the controlling officer</td>
                      <td className="py-2 text-center align-top" width="2%">:</td>
                      <td className="py-2 ps-2 fw-semibold align-top" width="58%">{formData.remarks || "-"}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="pt-5 pb-3 text-end fw-semibold">Signature (with date and designation)</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-center my-4">
                  <h5 className="fw-bold text-decoration-underline" style={{ letterSpacing: "0.5px" }}>Certificate Regarding Admissibility of Leave</h5>
                </div>

                <table width="100%" className="table-borderless">
                  <tbody>
                    <tr>
                      <td className="py-2 pe-2 text-end align-top" width="5%">18.</td>
                      <td colSpan={3} className="py-2 ps-2" style={{ lineHeight: "1.6" }}>
                        Certified that <strong>{formData.nature_of_leave || "______"}</strong> for <strong>{formData.name || "______"}</strong> from <strong>{formData.start_date || "______"}</strong> to <strong>{formData.end_date || "______"}</strong> is admissible under rule ________________ of the Kerala Service Rule.
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pe-2 text-end align-top">19.</td>
                      <td className="py-3 pe-3 align-top">Orders of the sanctioning authority</td>
                      <td className="py-3 text-center align-top">:</td>
                      <td className="py-3 ps-2 fw-semibold align-top">{formData.orders || "-"}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="pt-5 pb-2 text-end fw-semibold">Signature (with date) and Designation</td>
                    </tr>
                  </tbody>
                </table>

      <div className="exportpdf col-lg-12 m-2">
                    

                      <>
                     

                        <button onClick={handleGeneratePDF} className="btn btn-primary px-4 py-2 rounded-pill shadow-sm fw-bold mt-4 mb-3 text-center mx-auto d-block" disabled={pdfloading} style={{ letterSpacing: "0.5px" }}>
                          {pdfloading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-send-fill me-2"></i> Send Letter
                            </>
                          )}
                        </button>


                      </>
                    
                  </div>
    </div>
</div></div></div></div>
    </>
  );
};

export default LeaveApplication;
