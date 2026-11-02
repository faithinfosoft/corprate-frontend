import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import { Button, Form, Table, Spinner } from "react-bootstrap";
import { useData } from "./SchoolEvaluationForm";

const ExaminationResults = () => {
  const { evaluationDocumentDetails } = useData();
  const academicYearId = evaluationDocumentDetails.academic_year_id;
  const schoolId = evaluationDocumentDetails.school_id;
  const year_label = evaluationDocumentDetails.year_label;

  // Initial form state
  const initialFormState = {
    sslcPrevTotal: '',
    sslcPrevPassed: '',
    sslcPrevAPlus: '',
    hsePrevTotal: '',
    hsePrevPassed: '',
    hsePrevAPlus: '',
    sslcCurrTotal: '',
    sslcCurrPassed: '',
    sslcCurrAPlus: '',
    hseCurrTotal: '',
    hseCurrPassed: '',
    hseCurrAPlus: '',
    subjectWiseAveragePrev: '',
    subjectWiseAverageCurr: '',
    id: null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [existingResults, setExistingResults] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing results when component mounts or school/academic year changes
  useEffect(() => {
    if (schoolId && academicYearId) {
      fetchExistingResults();
    }
  }, [schoolId, academicYearId]);

  // Populate form when existing results change
  useEffect(() => {
    if (existingResults.length > 0) {
      populateFormWithExistingData();
    }
  }, [existingResults]);
  const fetchExistingResults = async () => {
    setIsLoading(true);
    try {
      // Calculate previous academic year label
      const previousYearLabel = getPreviousAcademicYear(year_label);

      // Fetch current year results
      const response = await axios.get(`${globalVariables.api_url}/examination-results/view`, {
        params: {
          fk_school_id: schoolId,
          fk_academic_label: year_label
        }
      });

      // Fetch previous year results
      const prevYearResponse = await axios.get(`${globalVariables.api_url}/examination-results/view`, {
        params: {
          fk_school_id: schoolId,
          fk_academic_label: previousYearLabel
        }
      });

      // Combine results from both current and previous years
      const combinedResults = [
        ...(response.data.status && Array.isArray(response.data.data) ? response.data.data : []),
        ...(prevYearResponse.data.status && Array.isArray(prevYearResponse.data.data) ? prevYearResponse.data.data : [])
      ];

      if (combinedResults.length > 0) {
        setExistingResults(combinedResults);
      } else {
        setExistingResults([]);
        print_toast("info", "No existing examination results found.");
      }
    } catch (error) {
      console.error("Error fetching Examination Results:", error);
      setExistingResults([]);
      print_toast("error", "Failed to fetch existing results.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch existing results for the current academic year
  const fetchExistingResults1 = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/examination-results/view`, {
        params: {
          fk_school_id: schoolId,
          fk_academic_label: year_label
        }
      });

      if (response.data.status && Array.isArray(response.data.data)) {
        setExistingResults(response.data.data);
      } else {
        setExistingResults([]);
        print_toast("info", "No existing examination results found.");
      }
    } catch (error) {
      console.error("Error fetching Examination Results:", error);
      setExistingResults([]);
      print_toast("error", "Failed to fetch existing results.");
    } finally {
      setIsLoading(false);
    }
  };

  // Populate form with existing data
  const populateFormWithExistingData = () => {
    const sslcPrevRecord = existingResults.find(r => r.exam_level === 'SSLC' && r.is_current_year === '0');
    const sslcCurrRecord = existingResults.find(r => r.exam_level === 'SSLC' && r.is_current_year === '1');
    const hsePrevRecord = existingResults.find(r => r.exam_level === 'HSE' && r.is_current_year === '0');
    const hseCurrRecord = existingResults.find(r => r.exam_level === 'HSE' && r.is_current_year === '1');

    setFormData({
      sslcPrevTotal: sslcPrevRecord?.total || '',
      sslcPrevPassed: sslcPrevRecord?.passed || '',
      sslcPrevAPlus: sslcPrevRecord?.no_of_a_plus || '',
      hsePrevTotal: hsePrevRecord?.total || '',
      hsePrevPassed: hsePrevRecord?.passed || '',
      hsePrevAPlus: hsePrevRecord?.no_of_a_plus || '',
      sslcCurrTotal: sslcCurrRecord?.total || '',
      sslcCurrPassed: sslcCurrRecord?.passed || '',
      sslcCurrAPlus: sslcCurrRecord?.no_of_a_plus || '',
      hseCurrTotal: hseCurrRecord?.total || '',
      hseCurrPassed: hseCurrRecord?.passed || '',
      hseCurrAPlus: hseCurrRecord?.no_of_a_plus || '',
      subjectWiseAveragePrev: hsePrevRecord?.subject_wise_average || '',
      subjectWiseAverageCurr: hseCurrRecord?.subject_wise_average || '',
      id: sslcPrevRecord?.examination_id || null
    });

    // Set edit mode if data exists
    setIsEditMode(!!sslcPrevRecord);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form data
  const validateFormData = () => {
    // Add your validation logic here
    const requiredFields = [
      'sslcPrevTotal', 'sslcPrevPassed', 'sslcPrevAPlus',
      'sslcCurrTotal', 'sslcCurrPassed', 'sslcCurrAPlus',
      'hsePrevTotal', 'hsePrevPassed', 'hsePrevAPlus',
      'hseCurrTotal', 'hseCurrPassed', 'hseCurrAPlus'
    ];

    for (let field of requiredFields) {
      if (!formData[field]) {
        print_toast("error", `Please fill in all ${field} fields`);
        return false;
      }
    }

    return true;
  };
  const getPreviousAcademicYear = (year) => {
    const [startYear, endYear] = year.split('-').map(Number); // Split and convert to numbers
    const previousStartYear = startYear - 1;
    const previousEndYear = 2000 + (endYear - 1); // Handle short "25" to "2024" conversion
    return `${previousStartYear}-${String(previousEndYear).slice(2)}`; // Slice to get the last two digits
  };

  // Prepare results for submission
  const prepareResultsForSubmission = () => {
   
    const results = [
      // SSLC Previous Year
      {
        fk_school_id: schoolId,
        fk_academic_label: getPreviousAcademicYear(year_label),
        exam_level: 'SSLC',
        total: formData.sslcPrevTotal,
        passed: formData.sslcPrevPassed,
        no_of_a_plus: formData.sslcPrevAPlus,
        is_current_year: 0
      },
      // SSLC Current Year
      {
        fk_school_id: schoolId,
        fk_academic_label: year_label,
        exam_level: 'SSLC',
        total: formData.sslcCurrTotal,
        passed: formData.sslcCurrPassed,
        no_of_a_plus: formData.sslcCurrAPlus,
        is_current_year: 1
      },
      // HSE Previous Year
      {
        fk_school_id: schoolId,
        fk_academic_label: getPreviousAcademicYear(year_label),
        exam_level: 'HSE',
        total: formData.hsePrevTotal,
        passed: formData.hsePrevPassed,
        no_of_a_plus: formData.hsePrevAPlus,
        is_current_year: 0,
        subject_wise_average: formData.subjectWiseAveragePrev
      },
      // HSE Current Year
      {
        fk_school_id: schoolId,
        fk_academic_label: year_label,
        exam_level: 'HSE',
        total: formData.hseCurrTotal,
        passed: formData.hseCurrPassed,
        no_of_a_plus: formData.hseCurrAPlus,
        is_current_year: 1,
        subject_wise_average: formData.subjectWiseAverageCurr
      }
    ];

    return results;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data before submission
    if (!validateFormData()) {
      return;
    }

    setIsLoading(true);
    try {
      const resultsToSubmit = prepareResultsForSubmission();

      // Determine the appropriate endpoint based on edit mode
      const url = isEditMode 
        ? `${globalVariables.api_url}/examination-results/update`
        : `${globalVariables.api_url}/examination-results/batch-add`;

      const response = await axios.post(url, { 
        results: resultsToSubmit,
        id: formData.id // Send ID for update
      });

      if (response.data.status) {
        print_toast("success", isEditMode ? "Results updated successfully!" : "Results added successfully!");
        
        // Fetch updated results immediately after saving
        await fetchExistingResults();
        
        // Reset edit mode
        setIsEditMode(false);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", "Failed to save examination results.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel of edit mode
  const handleCancel = () => {
    setFormData(initialFormState);
    setIsEditMode(false);
  };

  return (
    <div className="container">
      {isLoading && (
        <div className="text-center my-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      <Form onSubmit={handleSubmit}>
        <Table bordered>
          <thead>
            <tr>
              <th>Item</th>
              <th colSpan="3">Previous Year</th>
              <th colSpan="3">Current Year</th>
            </tr>
            <tr>
              <th></th>
              <th>Total</th>
              <th>Passed</th>
              <th>Number of Full A+</th>
              <th>Total</th>
              <th>Passed</th>
              <th>Number of Full A+</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SSLC</td>
              {/* Previous Year SSLC Inputs */}
              <td>
                <Form.Control 
                  type="number" 
                  name="sslcPrevTotal"
                  value={formData.sslcPrevTotal}
                  onChange={handleInputChange}
                  placeholder="Total"
                  min="0"
                />
              </td>
              <td>
                <Form.Control 
                  type="number" 
                  name="sslcPrevPassed"
                  value={formData.sslcPrevPassed}
                  onChange={handleInputChange}
                  placeholder="Passed"
                  min="0"
                />
              </td>
              <td>
                <Form.Control 
                  type="number" 
                  name="sslcPrevAPlus"
                  value={formData.sslcPrevAPlus}
                  onChange={handleInputChange}
                  placeholder="Full A+"
                  min="0"
                />
              </td>
              {/* Current Year SSLC Inputs */}
              <td>
                <Form.Control 
                  type="number" 
                  name="sslcCurrTotal"
                  value={formData.sslcCurrTotal}
                  onChange={handleInputChange}
                  placeholder="Total"
                  min="0"
                />
              </td>
              <td>
                <Form.Control 
                  type="number" 
                  name="sslcCurrPassed"
                  value={formData.sslcCurrPassed}
                  onChange={handleInputChange}
                  placeholder="Passed"
                  min="0"
                />
              </td>
              <td>
                <Form.Control 
                  type="number" 
                  name="sslcCurrAPlus"
                  value={formData.sslcCurrAPlus}
                  onChange={handleInputChange}
                  placeholder="Full A+"
                  min="0"
                />
              </td>
            </tr>
            <tr>
              <td>HSE</td>
              {/* Previous Year HSE Inputs */}
              <td>
                <Form.Control 
                  type="number" 
                  name="hsePrevTotal"
                  value={formData.hsePrevTotal}
                  onChange={handleInputChange}
                  placeholder="Total"
                  min="0"
                />
              </td>
              <td>
                <Form.Control 
                  type="number" 
                  name="hsePrevPassed"
                  value={formData.hsePrevPassed}
                  onChange={handleInputChange}
                  placeholder="Passed"
                  min="0"
                />
              </td>
              <td>
                <Form.Control 
                  type="number" 
                  name="hsePrevAPlus"
                  value={formData.hsePrevAPlus}
                  onChange={handleInputChange}
                  placeholder="Full A+"
                  min="0"
                />
              </td>
              {/* Current Year HSE Inputs */}
              <td>
                <Form.Control 
                  type="number" 
                  name="hseCurrTotal"
                  value={formData.hseCurrTotal}
                  onChange={handleInputChange}
                  placeholder="Total"
                  min="0"
                />
              </td>
              <td>
                <Form.Control 
                  type="number" 
                  name="hseCurrPassed"
                  value={formData.hseCurrPassed}
                  onChange={handleInputChange}
                  placeholder="Passed"
                  min="0"
                />
              </td>
              <td>
                <Form.Control 
                  type="number" 
                  name="hseCurrAPlus"
                  value={formData.hseCurrAPlus}
                  onChange={handleInputChange}
                  placeholder="Full A+"
                  min="0"
                />
              </td>
            </tr>
          </tbody>
        </Table>

        <div className="mt-3 d-flex justify-content-between">
          {isEditMode ? (
            <>
              <Button type="submit" variant="primary" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Results'}
              </Button>
            
            </>
          ) : (
            <Button type="submit" variant="success" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Results'}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default ExaminationResults;