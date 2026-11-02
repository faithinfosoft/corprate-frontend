import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Dropdown } from 'react-bootstrap';
import Breadcum from './Breadcum.js';
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";
import NoDataFound from './NoDataFound';
import useAuth from '../utilities/useAuth';

const ClassStrength = () => {
  const auth = useAuth();
  const username = auth.user.username;
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [classStrength, setClassStrength] = useState([]);
  const [schoolClasses, setSchoolClasses] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedStrengths, setEditedStrengths] = useState({});
  const [showTable, setShowTable] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Class Strength Details', Link: '' },
  ]);

  useEffect(() => {
    fetchAcademicYears();
    fetchSchoolClasses();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/class-strength/get-academic-years`);
      if (response.data.status) {
        const allYears = response.data.data;

        const sortedYears = allYears.sort((a, b) => {
          if (a.status === b.status) {
            return b.year_label.split('-')[0] - a.year_label.split('-')[0];
          }
          return b.status.localeCompare(a.status);
        });

        setAcademicYears(sortedYears);

        const firstEnabledYear = sortedYears.find(year => year.status === 'enabled');
        if (firstEnabledYear) {
          setSelectedAcademicYear(firstEnabledYear.academic_year_id);
        }
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      print_toast("error", "Failed to fetch academic years");
    }
  };

  const fetchSchoolClasses = async () => {
    try {
      const response = await axios.post(`${globalVariables.api_url}/class-strength/get-school-classes`, { username });
      if (response.data.status) {
        setSchoolClasses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching school classes:', error);
      print_toast("error", "Failed to fetch school classes");
    }
  };

  const fetchClassStrength = async () => {
    if (!selectedAcademicYear) return;
    setLoaded(false);
    try {
      const response = await axios.post(`${globalVariables.api_url}/class-strength/get-class-strength`, {
        username,
        academicYearId: selectedAcademicYear
      },
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      console.log(response.data);
      if (response.data.status) {
        setClassStrength(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching class strength:', error);
      setLoaded(true);
      print_toast("error", "Failed to fetch class strength");
    }
  };

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchClassStrength();
      fetchSchoolClasses();
      setShowTable(true);
    }
  }, [selectedAcademicYear]);

  const handleStrengthChange = (classId, division, field, value) => {
    // Ensure value is a non-negative number
    const numValue = Math.max(0, parseInt(value) || 0);
    
    // Get current values for this class and division
    const currentValues = editedStrengths[classId]?.[division] || {};
    const strengthData = classStrength.find(
      s => s.fk_class_id === classId && s.division === division
    );
    
    // Get boys and girls counts (either from edited values or existing data)
    const boysCount = field === 'strengthBoys' ? numValue : 
    parseInt(currentValues.strengthBoys ?? strengthData?.strength_boys ?? 0);
    const girlsCount = field === 'strengthGirls' ? numValue :
    parseInt(currentValues.strengthGirls ?? strengthData?.strength_girls ?? 0);
     
    // Calculate total students
    const totalStudents = boysCount + girlsCount;

    // Clear previous validation errors for this cell
    const errorKey = `${classId}-${division}-${field}`;
    const newValidationErrors = { ...validationErrors };
    delete newValidationErrors[errorKey];
    
    if (field === 'strengthCS' || field === 'strengthNCS') {
      const otherField = field === 'strengthCS' ? 'strengthNCS' : 'strengthCS';
      const otherValue = currentValues[otherField] ?? 
        (otherField === 'strengthCS' ? strengthData?.strength_cs : strengthData?.strength_ncs) ?? 0;
      
      if (numValue + otherValue > totalStudents) {
        // Set validation error
        newValidationErrors[errorKey] = `Total of CS and NCS cannot exceed total students (${totalStudents})`;
        print_toast("error", `For Class ${classId} Division ${division}: CS + NCS cannot exceed total students (${totalStudents})`);
        setValidationErrors(newValidationErrors);
        return; // Don't update the value
      }
    }
    
    // Update the validation errors
    setValidationErrors(newValidationErrors);
    
    // Update the edited strengths
    setEditedStrengths(prev => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [division]: {
          ...prev[classId]?.[division],
          [field]: numValue
        }
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedData = schoolClasses.map(cls => {
        // Get divisions based on class name
        const divisions = isHigherClass(cls.class_name) ? 
          ['Science', 'Computer-Science','Commerce', 'Humanities'] : 
          ['A', 'B', 'C', 'D'];
        
        // Map each division to an update object
        return divisions.map(division => {
          // Find existing strength data for this specific division
          const divisionStrength = classStrength.find(s => 
            s.fk_class_id === cls.class_id && s.division === division
          );
  
          // Get existing values for this division
          const existingBoys = divisionStrength?.strength_boys ?? 0;
          const existingGirls = divisionStrength?.strength_girls ?? 0;
          const existingCS = divisionStrength?.strength_cs ?? 0;
          const existingNCS = divisionStrength?.strength_ncs ?? 0;
  
          // Only use edited values if they exist, otherwise keep existing values
          const finalData = {
            classId: cls.class_id,
            division,
            academicYearId: selectedAcademicYear,
            strengthBoys: editedStrengths[cls.class_id]?.[division]?.strengthBoys !== undefined 
              ? editedStrengths[cls.class_id][division].strengthBoys 
              : existingBoys,
            strengthGirls: editedStrengths[cls.class_id]?.[division]?.strengthGirls !== undefined 
              ? editedStrengths[cls.class_id][division].strengthGirls 
              : existingGirls,
            strengthCS: editedStrengths[cls.class_id]?.[division]?.strengthCS !== undefined 
              ? editedStrengths[cls.class_id][division].strengthCS 
              : existingCS,
            strengthNCS: editedStrengths[cls.class_id]?.[division]?.strengthNCS !== undefined 
              ? editedStrengths[cls.class_id][division].strengthNCS 
              : existingNCS,
            classStrengthId: divisionStrength?.class_strength_id || null
          };
  
          return finalData;
        });
      }).flat();
  
      const response = await axios.post(`${globalVariables.api_url}/class-strength/save-class-strength`, {
        username,
        data: updatedData
      });
  
      if (response.data.status) {
        print_toast("success", "Class strength updated successfully");
        fetchClassStrength();
        setEditedStrengths({});
      }
    } catch (error) {
      console.error('Error updating class strength:', error);
      print_toast("error", "Failed to update class strength");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAcademicYearSelect = (yearId) => {
    setSelectedAcademicYear(yearId);
    setShowTable(true);
  };

  // Helper function to check if a class is XI or XII
  const isHigherClass = (className) => {
    return className === 'XI' || className === 'XII';
  };

  // Function to get divisions based on class name
  const getDivisionsForClass = (className) => {
    return isHigherClass(className) ? 
      ['Science', 'Computer-Science','Commerce', 'Humanities'] : 
      ['A', 'B', 'C', 'D'];
  };

  const calculateRowTotal = (classId, field) => {
    let total = 0;
    const classInfo = schoolClasses.find(cls => cls.class_id === classId);
    const divisions = classInfo ? getDivisionsForClass(classInfo.class_name) : ['A', 'B', 'C', 'D'];
    
    divisions.forEach(division => {
      const editedValue = editedStrengths[classId]?.[division]?.[field];
      if (editedValue !== undefined) {
        total += parseInt(editedValue) || 0;
      } else {
        const strengthData = classStrength.find(
          s => s.fk_class_id === classId && s.division === division
        );
        const strengthField = field === 'strengthBoys' ? 'strength_boys' :
                            field === 'strengthGirls' ? 'strength_girls' :
                            field === 'strengthCS' ? 'strength_cs' :
                            'strength_ncs';
        total += parseInt(strengthData?.[strengthField]) || 0;
      }
    });
    return total;
  };
  
  const calculateDivisionTotal = (field, division) => {
    let total = 0;
    schoolClasses.forEach(cls => {
      // Skip if this division doesn't apply to this class
      const applicableDivisions = getDivisionsForClass(cls.class_name);
      if (!applicableDivisions.includes(division)) {
        return;
      }
      
      const editedValue = editedStrengths[cls.class_id]?.[division]?.[field];
      
      if (editedValue !== undefined) {
        total += parseInt(editedValue) || 0;
      } else {
        const strengthData = classStrength.find(
          s => s.fk_class_id === cls.class_id && s.division === division
        );
        const strengthField = field === 'strengthBoys' ? 'strength_boys' :
                            field === 'strengthGirls' ? 'strength_girls' :
                            field === 'strengthCS' ? 'strength_cs' :
                            'strength_ncs';
        total += parseInt(strengthData?.[strengthField]) || 0;
      }
    });
    return total;
  };

  // Get all unique divisions across all classes
  const getAllDivisions = () => {
    const allDivisions = new Set();
    schoolClasses.forEach(cls => {
      const divisions = getDivisionsForClass(cls.class_name);
      divisions.forEach(div => allDivisions.add(div));
    });
    return Array.from(allDivisions);
  };

  return (
    <div>
      <Breadcum items={breadcum} title="Class Strength Details" />

      <div className="card">
        <div className="card-header">
          <h5>Class Strength Details</h5>
        </div>
        <div className="card-body">
         
        {schoolClasses.length === 0 ? (
            <NoDataFound />
          ) : (
            <>
              <Dropdown className="mb-3">
                <span style={{ fontWeight: 'bold', marginRight: '10px', fontSize: '16px' }}>
                  Select Academic Year:
                </span>
                <Dropdown.Toggle variant="primary" id="dropdown-academic-year">
                  {selectedAcademicYear
                    ? academicYears.find(year => year.academic_year_id === selectedAcademicYear)?.year_label
                    : 'Select Academic Year'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {academicYears.map(year => (
                    <Dropdown.Item
                      key={year.academic_year_id}
                      onClick={() => handleAcademicYearSelect(year.academic_year_id)}
                      className={year.status === 'disabled' ? 'text-muted' : ''}
                      style={{
                        backgroundColor: year.status === 'disabled' ? '#f8f9fa' : 'white',
                        borderBottom: '1px solid #dee2e6'
                      }}
                    >
                      {year.year_label} {year.status === 'disabled' ? '(Disabled)' : ''}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
             
              {showTable && (
                <div className="table-responsive">
                  <table className="table table-bordered datatable">
                    <thead>
                      <tr>
                        <th rowSpan="2" className="text-center">Class</th>
                        {['A', 'B', 'C', 'D', 'Science', 'Computer-Science','Commerce', 'Humanities'].map(div => {
  // Check if any class uses this division
  const isUsed = schoolClasses.some(cls => 
    getDivisionsForClass(cls.class_name).includes(div)
  );
  
  return isUsed ? (
    <th key={div} colSpan="4" className="text-center">
      {/* Use "Division" prefix only for A, B, C, D */}
      {['A', 'B', 'C', 'D'].includes(div) ? `Division ${div}` : div}
    </th>
  ) : null;
})}
                        <th colSpan="4" className="text-center">Total</th>
                      </tr>
                      <tr>
                        {['A', 'B', 'C', 'D', 'Science', 'Computer-Science','Commerce', 'Humanities'].map(div => {
                          // Check if any class uses this division
                          const isUsed = schoolClasses.some(cls => 
                            getDivisionsForClass(cls.class_name).includes(div)
                          );
                          return isUsed ? (
                            <React.Fragment key={`header-${div}`}>
                              <th className="text-center">Boys</th>
                              <th className="text-center">Girls</th>
                              <th className="text-center">CS</th>
                              <th className="text-center">NCS</th>
                            </React.Fragment>
                          ) : null;
                        })}
                        <th className="text-center">Boys</th>
                        <th className="text-center">Girls</th>
                        <th className="text-center">CS</th>
                        <th className="text-center">NCS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!loaded ? (
                        <tr>
                          <td colSpan="29" className="text-center">Loading...</td>
                        </tr>
                      ) : schoolClasses.length === 0 ? (
                        <tr>
                          <td colSpan="29">
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        <>
                          {schoolClasses.map(cls => (
                            <tr key={cls.class_id}>
                              <td>{cls.class_name}</td>
                              {['A', 'B', 'C', 'D', 'Science', 'Computer-Science','Commerce', 'Humanities'].map(division => {
                                // Check if this division applies to this class
                                const applicableDivisions = getDivisionsForClass(cls.class_name);
                                if (!applicableDivisions.includes(division)) {
                                  return null;
                                }
                                
                                const strengthData = classStrength.find(
                                  s => s.fk_class_id === cls.class_id && s.division === division
                                );
                                
                                return (
                                  <React.Fragment key={`${cls.class_id}-${division}`}>
                                    <td>
                                      <input
                                        type="text"
                                        min="0"
                                        value={editedStrengths[cls.class_id]?.[division]?.strengthBoys ?? strengthData?.strength_boys ?? ''}
                                        onChange={e => handleStrengthChange(cls.class_id, division, 'strengthBoys', e.target.value)}
                                        className="form-control"  style={{ width: '100px' }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        min="0"
                                        value={editedStrengths[cls.class_id]?.[division]?.strengthGirls ?? strengthData?.strength_girls ?? ''}
                                        onChange={e => handleStrengthChange(cls.class_id, division, 'strengthGirls', e.target.value)}
                                        className="form-control" style={{ width: '100px' }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        min="0"
                                        value={editedStrengths[cls.class_id]?.[division]?.strengthCS ?? strengthData?.strength_cs ?? ''}
                                        onChange={e => handleStrengthChange(cls.class_id, division, 'strengthCS', e.target.value)}
                                        className="form-control" style={{ width: '100px' }}
                                      />
                                    </td>
                                    <td>
                                      <input
                                        type="text"
                                        min="0"
                                        value={editedStrengths[cls.class_id]?.[division]?.strengthNCS ?? strengthData?.strength_ncs ?? ''}
                                        onChange={e => handleStrengthChange(cls.class_id, division, 'strengthNCS', e.target.value)}
                                        className="form-control" style={{ width: '100px' }}
                                      />
                                    </td>
                                  </React.Fragment>
                                );
                              })}
                              <td>{calculateRowTotal(cls.class_id, 'strengthBoys')}</td>
                              <td>{calculateRowTotal(cls.class_id, 'strengthGirls')}</td>
                              <td>{calculateRowTotal(cls.class_id, 'strengthCS')}</td>
                              <td>{calculateRowTotal(cls.class_id, 'strengthNCS')}</td>
                            </tr>
                          ))}
                          <tr>
                            <td><strong>Total</strong></td>
                            {['A', 'B', 'C', 'D', 'Science', 'Computer-Science','Commerce', 'Humanities'].map(division => {
                              // Check if any class uses this division
                              const isUsed = schoolClasses.some(cls => 
                                getDivisionsForClass(cls.class_name).includes(division)
                              );
                              
                              return isUsed ? (
                                <React.Fragment key={`total-${division}`}>
                                  <td>{calculateDivisionTotal('strengthBoys', division)}</td>
                                  <td>{calculateDivisionTotal('strengthGirls', division)}</td>
                                  <td>{calculateDivisionTotal('strengthCS', division)}</td>
                                  <td>{calculateDivisionTotal('strengthNCS', division)}</td>
                                </React.Fragment>
                              ) : null;
                            })}
                            {/* Grand totals for each category */}
                            {(() => {
                              const allDivisions = getAllDivisions();
                              
                              const totalBoys = allDivisions.reduce((sum, division) => 
                                sum + calculateDivisionTotal('strengthBoys', division), 0
                              );
                              const totalGirls = allDivisions.reduce((sum, division) => 
                                sum + calculateDivisionTotal('strengthGirls', division), 0
                              );
                              const totalCS = allDivisions.reduce((sum, division) => 
                                sum + calculateDivisionTotal('strengthCS', division), 0
                              );
                              const totalNCS = allDivisions.reduce((sum, division) => 
                                sum + calculateDivisionTotal('strengthNCS', division), 0
                              );

                              return (
                                <>
                                  <td>{totalBoys}</td>
                                  <td>{totalGirls}</td>
                                  <td>{totalCS}</td>
                                  <td>{totalNCS}</td>
                                </>
                              );
                            })()}
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>

                  <div className="d-flex gap-4 p-4">
                    <span className="text-danger fw-bold">
                      * CS - Catholic Students, NCS - Non-Catholic Students
                    </span>
                  </div>
                </div>
              )}
             
              <div className="d-flex justify-content-between">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassStrength;