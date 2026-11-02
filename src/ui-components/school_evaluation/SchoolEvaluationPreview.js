import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import useAuth from "../../utilities/useAuth";
import globalVariables from "../../Global.js";
import { useData } from "./SchoolEvaluationForm";
import { useNavigate } from 'react-router-dom';
import { convertDateFormat } from "../../utilities/dateconverter.js";
const SchoolBasicInfoTable = () => {
  const { evaluationDocumentDetails } = useData();
  const year_label = evaluationDocumentDetails.year_label;
  const [schoolDetails, setSchoolDetails] = useState(null);
  const academicYearId = evaluationDocumentDetails.academic_year_id;
  const schoolId = evaluationDocumentDetails.school_id;
  const evaluation_status = evaluationDocumentDetails.evaluation_status;
  const evaluation_doc_id = evaluationDocumentDetails.evaluation_doc_id;
  const [pdfloading, setPdfLoading] = useState(false);
  const [previewloading, setPreviewLoading] = useState(false);
  const [kcslActivities, setKcslActivities] = useState([]);
  const [clubActivities, setClubActivities] = useState([]);
  const [supwActivities, setSupwActivities] = useState([]);
  const [celebrationActivities, setCelebrationActivities] = useState([]);
  const [assembly, setAssembly] = useState([]);
  const [studentCouncil, setStudentCouncil] = useState([]);
  const [studyTour, setStudyTour] = useState([]);
  const [religionMoral, setReligionMoral] = useState([]);
  const [otherActivities, setOtherActivities] = useState([]);
  const [campusBeautification, setCampusBeautification] = useState([]);
  const navigate = useNavigate();
  const fetchSchoolDetails = useCallback(async () => {
    if (!academicYearId || !schoolId) return; // Prevent unnecessary API calls

    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/schoolbasicdetails`,
        {
          params: { academic_year_id: academicYearId, school_id: schoolId, year_label: year_label },
        }
      );

      if (response.data?.status) {
        setSchoolDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching school details:", error);
    }
  }, [academicYearId, schoolId]);

  useEffect(() => {
    fetchSchoolDetails();
  }, [fetchSchoolDetails]);

  // Extract data from the schoolDetails
  const school = schoolDetails?.school || {};
  const currentYearStrength = schoolDetails?.current_year_class_strength || {};
  const previousYearStrength = schoolDetails?.previous_year_class_strength || { total_boys: 0, total_girls: 0 };

  // Extract staff counts
  const teachingMale = school.male_teaching || 0;
  const teachingFemale = school.female_teaching || 0;
  const clerkMale = school.male_clerk || 0;
  const clerkFemale = school.female_clerk || 0;
  const oaMale = school.male_office_attendant || 0;
  const oaFemale = school.female_office_attendant || 0;
  const ftmMale = school.male_ftm || 0;
  const ftmFemale = school.female_ftm || 0;

  // Get headmaster info from head_of_schools array if available
  const headmaster = school.head_of_schools && school.head_of_schools.length > 0
    ? school.head_of_schools[0]
    : { name: "N/A", mobile: "N/A" };


  const handleGeneratePDF = async () => {
    setPdfLoading(true);

    try {

      const config = {
        params: {
          academic_year_id: academicYearId,
          school_id: schoolId,
          year_label: year_label,
          evaluation_doc_id: evaluation_doc_id,
          pdfstatus: 'sent',
          print: "print",
        },
        responseType: "blob",
      };

      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/generatePDF_school`,
        config
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "school_evaluation_document.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      navigate("/school-evaluation-report");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF");
    } finally {
      setPdfLoading(false);
    }
  };


  const handleGeneratePreview = async () => {
    setPreviewLoading(true);

    try {
      const config = {
        params: {
          academic_year_id: academicYearId,
          school_id: schoolId,
          evaluation_doc_id: evaluation_doc_id,
          pdfstatus: 'preview',
          year_label: year_label,
          print: "print",
        },
        responseType: "blob",
      };

      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/generatePDF_school`,
        config
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "school_evaluation_document.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      //navigate("/school-evaluation-report");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF");
    } finally {
      setPreviewLoading(false);
    }
  };
  const [activities, setActivities] = useState([]);



  useEffect(() => {
    fetchSchoolDetails();
  }, [fetchSchoolDetails]);

  const [magazines, setMagazines] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const fetchActivities = useCallback(async () => {

    try {

      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/getactivitydetails`,
        {
          params: { academic_year_id: academicYearId, school_id: schoolId },
        }
      );


      console.log("API Response:", response.data);

      if (
        response.data &&
        response.data.data &&
        response.data.data.groupedCategories
      ) {
        console.log(
          "Grouped Categories:",
          response.data.data.groupedCategories
        );
        setActivities(response.data.data.groupedCategories);
      } else {
        console.error("Grouped categories data is missing");
      }
      if (response.data.data.magazines) {
        setMagazines(response.data.data.magazines);
      }

      if (response.data.data.staff_achievements) {
        setAchievements(response.data.data.staff_achievements);
      }

      if (response.data.data.schoolActivities) {
        const schoolActivities = response.data.data.schoolActivities;

        const kcslActs = schoolActivities.filter(activity => activity.activity_type === "KCSL");
        const clubActs = schoolActivities.filter(activity => activity.activity_type === "Club Activities");
        const supwActs = schoolActivities.filter(activity => activity.activity_type === "Socially Useful Productive Work");
        const celebrationActs = schoolActivities.filter(activity => activity.activity_type === "Celebrations");
        const assembly = schoolActivities.filter(activity => activity.activity_type === "School Assembly");
        const studentCouncil = schoolActivities.filter(activity => activity.activity_type === "Student Council");
        const studyTour = schoolActivities.filter(activity => activity.activity_type === "Study Tour");
        const religionMoral = schoolActivities.filter(activity => activity.activity_type === "Religion/Moral Science Education");
        const otherActivities = schoolActivities.filter(activity => activity.activity_type === "Religion/Other Activities");
        const campusBeautification = schoolActivities.filter(activity => activity.activity_type === "Campus Beautification Activities");
        setKcslActivities(kcslActs);
        setClubActivities(clubActs);
        setSupwActivities(supwActs);
        setCelebrationActivities(celebrationActs);

        setAssembly(assembly);
        setStudentCouncil(studentCouncil);
        setStudyTour(studyTour);
        setReligionMoral(religionMoral);
        setOtherActivities(otherActivities);
        setCampusBeautification(campusBeautification);
      }


    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  }, [academicYearId, schoolId]);
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const fetchStaff = useCallback(async () => {

    try {
      const response = await axios.get(
        `${globalVariables.api_url}/staffachievement/fetch_staff/${schoolId}`
      );
      if (response.data.status) {
        setStaffList(response.data.data);
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffList([]);
    }
  }, [schoolId]);


  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);



  return (
    <div className="max-w-3xl mx-auto p-6 bg-white font-serif container">
      <div className="text-end mt-3 mb-4">
        {/* Print Preview Button (Always Visible) */}
        <button
          onClick={handleGeneratePreview}
          className="btn btn-primary btn-sm"
          disabled={previewloading}
          style={{ marginTop: "6px" }}
        >
          {previewloading ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>{" "}
              Exporting...
            </>
          ) : (
            <>
              <span className="bi bi-file-pdf" role="status" aria-hidden="true"></span>{" "}
              Print Preview
            </>
          )}
        </button>

        {/* Send Report Button (Only When evaluation_status is "preview") */}
        {evaluation_status === "preview" && (
          <button
            onClick={handleGeneratePDF}
            className="btn btn-success btn-sm"
            disabled={pdfloading}
            style={{ marginTop: "6px", marginLeft: "10px" }}
          >
            {pdfloading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>{" "}
                Exporting...
              </>
            ) : (
              <>
                <span className="bi bi-file-pdf" role="status" aria-hidden="true"></span>{" "}
                Send Report
              </>
            )}
          </button>
        )}
      </div>


      <div style={{ textAlign: 'center' }} className='m-2'>
        <h4 className='fw-bold'>
          Corporate Management of Schools, Archdiocese of Changanacherry
        </h4>
        <h5 className='fw-bold'>
          School Evaluation Report {year_label}
        </h5>
      </div><br></br>
      <table className="w-full border-separate border-spacing-y-2" align='center'>
        <tbody>
          <tr>
            <td className="w-1/2 font-bold">Name of the School</td>
            <td className="w-4 text-center">:</td>
            <td>{school.location} {school.school_name}</td>
          </tr>

          <tr>
            <td className="w-1/2 font-bold">Phone No (School)</td>
            <td className="w-4 text-center">:</td>
            <td>{school.phone}</td>
          </tr>

          <tr>
            <td className="w-1/2 font-bold">Name of Headmaster/ Principal</td>
            <td className="w-4 text-center">:</td>
            <td>{headmaster.name}</td>
          </tr>

          <tr>
            <td className="w-1/2 font-bold">Mobile Phone No</td>
            <td className="w-4 text-center">:</td>
            <td>{headmaster.phone}</td>
          </tr>

          <tr>
            <td className="w-1/2 font-bold">Strength - Previous Year</td>
            <td className="w-4 text-center">:</td>
            <td>
              <span>Boys (</span>
              <span>{previousYearStrength.total_boys}</span>
              <span>)</span>
              <span className="inline-block w-8"></span>
              <span>Girls (</span>
              <span>{previousYearStrength.total_girls}</span>
              <span>)</span>
            </td>
          </tr>

          <tr>
            <td className="w-1/2 font-bold">Strength - Current Year</td>
            <td className="w-4 text-center">:</td>
            <td>
              <span>Boys (</span>
              <span>{currentYearStrength.total_boys || 0}</span>
              <span>)</span>
              <span className="inline-block w-8"></span>
              <span>Girls (</span>
              <span>{currentYearStrength.total_girls || 0}</span>
              <span>)</span>
            </td>
          </tr>

          <tr>
            <td className="w-1/2 font-bold">Total Number of Staff: Teaching</td>
            <td className="w-4 text-center">:</td>
            <td>
              <span>Male (</span>
              <span>{teachingMale}</span>
              <span>)</span>
              <span className="inline-block w-8"></span>
              <span>Female (</span>
              <span>{teachingFemale}</span>
              <span>)</span>
            </td>
          </tr>

          <tr>
            <td className="pl-16 w-1/2 font-bold">Clerk</td>
            <td className="w-4 text-center">:</td>
            <td>
              <span>Male (</span>
              <span>{clerkMale}</span>
              <span>)</span>
              <span className="inline-block w-8"></span>
              <span>Female (</span>
              <span>{clerkFemale}</span>
              <span>)</span>
            </td>
          </tr>

          <tr>
            <td className="pl-16 w-1/2 font-bold">Office Attender</td>
            <td className="w-4 text-center">:</td>
            <td>
              <span>Male (</span>
              <span>{oaMale}</span>
              <span>)</span>
              <span className="inline-block w-8"></span>
              <span>Female (</span>
              <span>{oaFemale}</span>
              <span>)</span>
            </td>
          </tr>

          <tr>
            <td className="pl-16 w-1/2 font-bold">FTM</td>
            <td className="w-4 text-center">:</td>
            <td>
              <span>Male (</span>
              <span>{ftmMale}</span>
              <span>)</span>
              <span className="inline-block w-8"></span>
              <span>Female (</span>
              <span>{ftmFemale}</span>
              <span>)</span>
            </td>
          </tr>
        </tbody>
      </table>

      {Object.entries(activities).map(([categoryTitle, categoryData]) => (
        <div key={categoryTitle} className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            {categoryTitle}
          </p>

          {categoryData[0]?.activity_data ? (
            <table
              style={{
                width: "100%",
                marginTop: "10px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th style={tableHeaderStyle}>Item Name</th>
                  {Object.keys(JSON.parse(categoryData[0].activity_data)).map(
                    (key) => (
                      <th key={key} style={tableHeaderStyle}>
                        {key.replace("_", " ")}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {categoryData.map((item, index) => {
                  const activityData = JSON.parse(item.activity_data);
                  return (
                    <tr key={index}>
                      <td style={tableCellStyle}>{item.item_name}</td>
                      {Object.values(activityData).map((value, i) => (
                        <td key={i} style={tableCellStyle}>
                          {value}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <table
              style={{
                width: "100%",
                marginTop: "10px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f2f2f2" }}>
                  <th style={tableHeaderStyle}>Item Name</th>
                  <th style={tableHeaderStyle}>(Yes/No)</th>
                  <th style={tableHeaderStyle}>Measurement Values</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((item, index) => (
                  <tr key={index}>
                    <td style={tableCellStyle}>{item.item_name}</td>
                    <td style={tableCellStyle}>{item.item_value}</td>
                    <td style={tableCellStyle}>{item.measurement_values}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
      {magazines && magazines.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            School Magazines/Publications
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Number of Copies</th>
                <th style={tableHeaderStyle}>Manuscript/Printed</th>
              </tr>
            </thead>
            <tbody>
              {magazines.map((item, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>{item.title}</td>
                  <td style={tableCellStyle}>{item.no_of_copies}</td>
                  <td style={tableCellStyle}>{item.publication_format}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {achievements && achievements.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Achievements of Staff
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Event</th>
                <th style={tableHeaderStyle}>Achievement</th>
              </tr>
            </thead>
            <tbody>
              {achievements.map((item, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>
                    {staffList.find(
                      (staff) => staff.staff_id === item.fk_staff_id
                    )?.staff_official_name || "N/A"}
                  </td>

                  <td style={tableCellStyle}>{item.event_name}</td>
                  <td style={tableCellStyle}>{item.event_achievement}</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* KCSL Activities */}
      {kcslActivities && kcslActivities.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            KCSL Activities (other than regular activities)
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>

                <th style={tableHeaderStyle}>Name of Camp</th>
                <th style={tableHeaderStyle}>Number of Participants</th>
                <th style={tableHeaderStyle}>Date & Venue</th>
              </tr>
            </thead>
            <tbody>
              {kcslActivities.map((item, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>{item.camp_name || "N/A"}</td>
                  <td style={tableCellStyle}>{item.no_of_participants || "0"}</td>
                  <td style={tableCellStyle}>
                    {convertDateFormat(item.activity_start_date)} & {item.venue || "N/A"}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Club Activities */}
      {clubActivities && clubActivities.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Club Activities
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>

                <th style={tableHeaderStyle}>Club</th>
                <th style={tableHeaderStyle}>Activity</th>
              </tr>
            </thead>
            <tbody>
              {clubActivities.map((item, index) => (
                <tr key={index}>

                  <td style={tableCellStyle}>{item.club || "N/A"}</td>
                  <td style={tableCellStyle}>
                    {item.activity ? <div dangerouslySetInnerHTML={{ __html: item.activity }} /> : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUPW Activities */}
      {supwActivities && supwActivities.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Socially Useful Productive Work
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>

                <th style={tableHeaderStyle}>Activity</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Participation of Students & Teachers</th>
                <th style={tableHeaderStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {supwActivities.map((item, index) => (
                <tr key={index}>

                  <td style={tableCellStyle}>{item.activity || "N/A"}</td>
                  <td style={tableCellStyle}>{convertDateFormat(item.activity_start_date)}</td>
                  <td style={tableCellStyle}>
                    Students: {item.no_of_participating_students || "0"}<br />
                    Teachers: {item.no_of_participating_teachers || "0"}
                  </td>

                  <td style={tableCellStyle}>{item.brief_description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Celebration Activities */}
      {celebrationActivities && celebrationActivities.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Celebrations
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={tableHeaderStyle}>Item</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Chief Guest</th>
              </tr>
            </thead>
            <tbody>
              {celebrationActivities.map((item, index) => (
                <tr key={index}>

                  <td style={tableCellStyle}>{item.celebration_item || "N/A"}</td>
                  <td style={tableCellStyle}>{convertDateFormat(item.activity_start_date)}</td>
                  <td style={tableCellStyle}>{item.celebration_guest || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* School Assembly */}
      {assembly && assembly.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            School Assembly (other than celebrations and school assembly)
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>

                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Purpose</th>
                <th style={tableHeaderStyle}>Guest Addressed Student</th>
              </tr>
            </thead>
            <tbody>
              {assembly.map((item, index) => (
                <tr key={index}>

                  <td style={tableCellStyle}>{convertDateFormat(item.activity_start_date)}</td>
                  <td style={tableCellStyle}>{item.assembly_theme || "N/A"}</td>
                  <td style={tableCellStyle}>{item.brief_description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Council */}
      {studentCouncil && studentCouncil.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Student Council
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>

                <th style={tableHeaderStyle}>Date of Meeting </th>
                <th style={tableHeaderStyle}>Agenda</th>
                <th style={tableHeaderStyle}>Activities done</th>
              </tr>
            </thead>
            <tbody>
              {studentCouncil.map((item, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>{item.activity || "N/A"}</td>
                  <td style={tableCellStyle}>{convertDateFormat(item.activity_start_date)}</td>
                  <td style={tableCellStyle}>{item.brief_description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Study Tour */}
      {studyTour && studyTour.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Study Tour
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>

                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Number of Students</th>
                <th style={tableHeaderStyle}>Places visited</th>
              </tr>
            </thead>
            <tbody>
              {studyTour.map((item, index) => (
                <tr key={index}>

                  <td style={tableCellStyle}>{convertDateFormat(item.activity_start_date)}</td>
                  <td style={tableCellStyle}>{item.no_of_participants || "0"}</td>
                  <td style={tableCellStyle}>{item.brief_description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Religion/Moral Science Education */}
      {religionMoral && religionMoral.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Religion/Moral Science Education
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={tableHeaderStyle}>Retreat/Value Education Classes conducted</th>
                <th style={tableHeaderStyle}>Dates</th>
                <th style={tableHeaderStyle}>Name of Trainer</th>
              </tr>
            </thead>
            <tbody>
              {religionMoral.map((item, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>{item.activity || "N/A"}</td>
                  <td style={tableCellStyle}>{convertDateFormat(item.activity_start_date)}</td>
                  <td style={tableCellStyle}>{item.brief_description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Other Activities */}
      {otherActivities && otherActivities.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Other Activities
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={tableHeaderStyle}>Activity</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {otherActivities.map((item, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>{item.activity || "N/A"}</td>
                  <td style={tableCellStyle}>{convertDateFormat(item.activity_start_date)}</td>
                  <td style={tableCellStyle}>{item.brief_description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Campus Beautification Activities */}
      {campusBeautification && campusBeautification.length > 0 && (
        <div className="category-details">
          <p
            className="category-title"
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: "20px",
              marginBottom: "10px",
            }}
          >
            Campus Beautification Activities
          </p>
          <table
            style={{
              width: "100%",
              marginTop: "10px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f2f2f2" }}>
                <th style={tableHeaderStyle}>Activity</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {campusBeautification.map((item, index) => (
                <tr key={index}>
                  <td style={tableCellStyle}>{item.activity || "N/A"}</td>
                  <td style={tableCellStyle}>{convertDateFormat(item.activity_start_date)}</td>
                  <td style={tableCellStyle}>{item.brief_description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
const tableHeaderStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left",
};

const tableCellStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};
export default SchoolBasicInfoTable;