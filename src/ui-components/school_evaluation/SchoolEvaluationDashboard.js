import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import useAuth from "../../utilities/useAuth";
import globalVariables from "../../Global.js";
import { useData } from "./SchoolEvaluationForm";

const SchoolEvaluationDashboard = () => {
  const auth = useAuth();
  const school_id = auth.user?.user_id; // Added optional chaining for safety
  const [schoolDetails, setSchoolDetails] = useState(null);
  const { evaluationDocumentDetails } = useData();
  const academicYearId = evaluationDocumentDetails?.academic_year_id;
  const schoolId = evaluationDocumentDetails?.school_id;
  
  const fetchSchoolDetails = useCallback(async () => {
    if (!academicYearId || !schoolId) return; // Prevent unnecessary API calls
    
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/schoolbasicdetails`,
        {
          params: { academic_year_id: academicYearId, school_id: schoolId },
        }
      );
      
      if (response.data?.status) {
        setSchoolDetails(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching school details:", error);
    }
  }, [academicYearId, schoolId]); // Removed school_id as it's not used in the function

  useEffect(() => {
    fetchSchoolDetails();
  }, [fetchSchoolDetails]);

  if (!schoolDetails) {
    return <div className="text-center p-4">Loading school details...</div>;
  }

  // Extract total staff counts from school data
  const teachingMale = schoolDetails.school?.male_teaching || 0;
  const teachingFemale = schoolDetails.school?.female_teaching || 0;
  const clerkMale = schoolDetails.school?.male_clerk || 0;
  const clerkFemale = schoolDetails.school?.female_clerk || 0;
  const officeMale = schoolDetails.school?.male_office_attendant || 0;
  const officeFemale = schoolDetails.school?.female_office_attendant || 0;
  const ftmMale = schoolDetails.school?.male_ftm || 0;
  const ftmFemale = schoolDetails.school?.female_ftm || 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white m-1">
      <table className="border-collapse border border-gray-300 table table-bordered table-striped">
        <tbody>
          <tr className="border-b">
            <td className="p-2 font-bold w-1/3">Name of the School</td>
            <td className="p-2">{schoolDetails?.school?.location} {schoolDetails?.school?.school_name}</td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-bold">Phone No (School)</td>
            <td className="p-2">{schoolDetails?.school?.phone}</td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-bold">Name of Headmaster/ Principal</td>
            <td className="p-2">{schoolDetails?.school?.head_of_schools?.[0]?.name || "N/A"}</td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-bold">Mobile Phone No</td>
            <td className="p-2">{schoolDetails?.school?.head_of_schools?.[0]?.phone || "N/A"}</td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-bold">Strength - Current Year</td>
            <td className="p-2">
              Boys ({schoolDetails?.current_year_class_strength?.total_boys || 0}), 
              Girls ({schoolDetails?.current_year_class_strength?.total_girls || 0})
            </td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-bold">Total Number of Staff: Teaching</td>
            <td className="p-2">
              Male ({teachingMale}), 
              Female ({teachingFemale})
            </td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-bold">Clerk</td>
            <td className="p-2">
              Male ({clerkMale}), 
              Female ({clerkFemale})
            </td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-bold">Office Attender</td>
            <td className="p-2">
              Male ({officeMale}), 
              Female ({officeFemale})
            </td>
          </tr>
          <tr className="border-b">
            <td className="p-2 font-bold">FTM</td>
            <td className="p-2">
              Male ({ftmMale}), 
              Female ({ftmFemale})
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SchoolEvaluationDashboard;