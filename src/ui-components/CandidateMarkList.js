import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../Global.js";
import Breadcum from "./Breadcum.js";
import { useParams, useLocation } from "react-router-dom";
import { capitalizeWords } from '../utilities/dateconverter';
import print_toast from "../utilities/Toaster.js";
const CategoryForm = () => {

  
  // Format to 3 decimal places ONLY if decimals exist, otherwise show as integer
  const formatTo3 = (num) => {
    if (num === null || num === undefined || isNaN(num) || num === "") return "0";
    const val = parseFloat(num);
    if (val % 1 === 0) return val.toString();
    // Use rounding to 3 decimals to handle floating point noise (e.g. 30.383999 -> 30.384)
    return (Math.round((val + Number.EPSILON) * 1000) / 1000).toFixed(3);
  };

  const [categoryList, setCategoryList] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { canididate_application_subject_id } = useParams();

  const location = useLocation();
  const [candidateInfo, setCandidateInfo] = useState(location.state?.candidateInfo || null);

  // Calculate Total Max Marks will be set dynamically based on Category I-IV + Weightage
  // We specify it as 1800+120=1920 or similar based on categories
  const [totalMaxMarks, setTotalMaxMarks] = useState(1920);

  const [breadcum, setBreadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "Exam Portal", Link: "/exam-notifications" },
    { Title: "Exam Portal", Link: `/exam-application-details/${canididate_application_subject_id || ''}#marks` },
    { Title: "Candidate Assessment", Link: "" },
  ]);

  // Fetch categories from the server
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/markcategory/get_all_categories`
      );
      if (response.data.status) {
        setCategoryList(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      print_toast("error", "Failed to fetch categories");
    }
  };

  // Fetch existing mark data if in edit mode
  const fetchExistingMarkData = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/candidatemarklist/get_candidate_marks/${canididate_application_subject_id}`
      );

      if (response.data.status) {
        const markData = response.data.data;

        // Capture candidate info if available in response
        // Use a smart merge to avoid overwriting state with null values
        const updateCandidateDetails = (newData) => {
          if (!newData) return;
          setCandidateInfo(prev => {
            const merged = { ...prev };
            ['applicant_name', 'subject_name', 'candidate_type', 'application_title', 'application_id', 'photo_url', 'subject_code', 'registration_number'].forEach(key => {
              // Priority: API response (newData) > Existing State (prev)
              const newVal = newData[key] || (key === 'application_id' ? newData['fk_application_id'] : null);
              if (newVal) merged[key] = newVal;
            });
            return merged;
          });
        };

        if (markData.candidateInfo && Object.keys(markData.candidateInfo).length > 0) {
          updateCandidateDetails(markData.candidateInfo);
        } else if (markData.enteredMarks && markData.enteredMarks.length > 0) {
          // Fallback guess field names if candidateInfo isn't a direct object
          updateCandidateDetails(markData.enteredMarks[0]);
        }

        // Process mark data to populate the form
        const initialFormData = {};

        // Process subcategory marks (enteredMarks)
        if (markData.enteredMarks && markData.enteredMarks.length > 0) {
          markData.enteredMarks.forEach(mark => {
            // Format given_mark to remove trailing zeros
            // Format given_mark using truncation to avoid rounding up
            let formattedMark = mark.given_mark ? formatTo3(parseFloat(mark.given_mark)) : "";
            initialFormData[mark.fk_mark_category_id] = formattedMark;
            if (mark.remarks) {
              initialFormData[`remarks_${mark.fk_mark_category_id}`] = mark.remarks;
            }
            // Store parent IDs for validation
            initialFormData[`parent_${mark.fk_mark_category_id}`] = mark.fk_parent_id;
          });
        }

        setFormData(initialFormData);
        setIsEditMode(true);
      }

    } catch (error) {
      console.error("Error fetching existing mark data:", error.message);
    }
  };

  // Helper to calculate marks recursively for any category from the nested tree structure
  const calculateObtainedMarksRecursive = (category) => {
    if (!category || !category.mark_category_id) return { rawObtained: 0, obtained: 0, max: 0 };

    // 1. Start with the mark entered directly for THIS category (if any)
    const ownVal = parseFloat(formData[category.mark_category_id]) || 0;

    // 2. Tree Logic: Get children
    const children = category.subcategories || [];
    
    if (children.length === 0) {
      return { 
        rawObtained: ownVal,
        obtained: ownVal, 
        max: parseFloat(category.total_mark) || 0 
      };
    }

    // 3. Parent node: Sum up children AND ownVal
    let childrenTotal = 0;
    children.forEach(child => {
      // Recursive call
      childrenTotal += calculateObtainedMarksRecursive(child).obtained;
    });

    const totalRaw = ownVal + childrenTotal;

    // Enforce capping: Subtotal cannot exceed parent's maximum mark
    const maximumAllowed = category.total_mark > 0 ? parseFloat(category.total_mark) : Infinity;
    return { 
      rawObtained: totalRaw,
      obtained: maximumAllowed !== Infinity ? Math.min(totalRaw, maximumAllowed) : totalRaw, 
      max: category.total_mark || 0 
    };
  };

  // Calculate the complex Weightage (Category V)
  const calculateWeightageMarks = () => {
    // 1. Sum up ONLY Category I, II, III, IV (The first 4 main sections)
    const sectionCats = categoryList
      .filter(cat => (!cat.fk_parent_id || Number(cat.fk_parent_id) === 0) && !(cat.category_title?.toUpperCase().includes('WEIGHTAGE')))
      .slice(0, 4);

    const baseTotalMarks = sectionCats.reduce((sum, cat) => sum + calculateObtainedMarksRecursive(cat).obtained, 0);

    // 2. Find the Weightage Category
    const weightageCat = categoryList.find(cat => cat.category_title?.toUpperCase().includes('WEIGHTAGE'));
    if (!weightageCat) return 0;

    // 3. Find children of weightageCat (The individual weightage percentages)
    // Tree Logic: Look in subcategories property instead of global filter
    const weightageChildren = weightageCat.subcategories || [];
    const weightageSum = weightageChildren.reduce((sum, child) => sum + (parseFloat(formData[child.mark_category_id]) || 0), 0);

    // 4. Return the calculated additional mark (Max 10%)
    const cappedWeightageSum = Math.min(weightageSum, 10);
    const rawWeightageValue = (baseTotalMarks * cappedWeightageSum) / 100;
    
    // Limit to 10% of I-IV if needed (though weightageSum itself is likely capped)
    return rawWeightageValue;
  };

  const calculatedWeightageMarks = calculateWeightageMarks();

  useEffect(() => {
    fetchCategories();
    if (canididate_application_subject_id) {
      fetchExistingMarkData();
    }
  }, [canididate_application_subject_id]);

  useEffect(() => {
    if (candidateInfo && candidateInfo.application_id) {
      setBreadcum([
        { Title: "Home", Link: "/" },
        { Title: "Exam Applications", Link: "/exam-application" },
        { Title: "Exam Portal", Link: `/exam-application-details/${candidateInfo.application_id}#marks` },
        { Title: "Candidate Assessment", Link: "" },
      ]);
    }
  }, [candidateInfo]);

  const handleInputChange = (id, value, totalMark, parent_Id, parentInfo = {}) => {
    const { parentModuleName, parentId: passedParentId } = parentInfo;
    const checkParentId = passedParentId; // Track parent ID for duplicate validation

    const parsedValue = value.trim() === "" ? "" : parseFloat(value);

    // Copy previous errors
    const newErrors = { ...errors };

    // Update form data - Store the raw value to preserve decimal point while typing
    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [id]: value, // Changed from parsedValue to value
        [`parent_${id}`]: checkParentId
      };

      // Perform parent total validation if applicable
      if (checkParentId && checkParentId !== 0) {
        // Find parent category to get its total_mark
        const findParent = (list) => {
          for (const cat of list) {
            if (cat.mark_category_id === checkParentId) return cat;
            if (cat.subcategories) {
              const found = findParent(cat.subcategories);
              if (found) return found;
            }
          }
          return null;
        };

        const parentCategory = findParent(categoryList);
        if (parentCategory && parentCategory.total_mark > 0) {
          // Sum up siblings
          const sum = parentCategory.subcategories.reduce((acc, sub) => {
            const val = sub.mark_category_id === id ? parsedValue : (parseFloat(updatedFormData[sub.mark_category_id]) || 0);
            return acc + val;
          }, 0);

          if (sum > parentCategory.total_mark) {
            newErrors[id] = `Total marks for this section cannot exceed ${parentCategory.total_mark}.`;
          } else if (newErrors[id] && newErrors[id].includes("Total marks for this section")) {
            delete newErrors[id];
          }
        }
      }

      return updatedFormData;
    });

    setErrors(newErrors);

    // Delay validation (to avoid instant errors while typing)
    setTimeout(() => {
      validateAdditionalCategory(id, parentModuleName, checkParentId);
    }, 300);
  };

  const updateMarkValueWithValidation = (id, value, totalMark, checkParentId, parentModuleName) => {
    // Only allow digits and up to 3 decimal points
    if (value !== "" && !/^\d*\.?\d{0,3}$/.test(value)) {
      return;
    }

    let parsedValue = value === "" ? "" : parseFloat(value);

    // Check if value exceeds limit
    const maxAllowed = totalMark > 0 ? totalMark : Infinity;
    let autoCorrected = false;

    if (parsedValue !== "" && !isNaN(parsedValue)) {
      if (maxAllowed !== Infinity && parsedValue > maxAllowed) {
        parsedValue = maxAllowed;
        value = maxAllowed.toString();
        autoCorrected = true;
      }
    }

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [id]: value,
        [`parent_${id}`]: checkParentId
      };

      if (value !== "" && (parentModuleName === "academic_additional" || parentModuleName === "professional_additional")) {
        const findParent = (list) => {
          for (const cat of list) {
            if (cat.mark_category_id === checkParentId) return cat;
            if (cat.subcategories) {
              const found = findParent(cat.subcategories);
              if (found) return found;
            }
          }
          return null;
        };
        const parentCategory = findParent(categoryList);
        if (parentCategory && parentCategory.subcategories) {
          parentCategory.subcategories.forEach(sub => {
            if (sub.mark_category_id !== id) {
              updatedFormData[sub.mark_category_id] = "0";
              updatedFormData[`parent_${sub.mark_category_id}`] = checkParentId;
            }
          });
        }
      }

      // Chain the additional category validation with the latest data
      if (parentModuleName) {
        validateAdditionalCategory(id, parentModuleName, checkParentId, updatedFormData);
      }

      return updatedFormData;
    });

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (parsedValue !== "" && !isNaN(parsedValue)) {
        // If it was auto-corrected, we don't show the "Value cannot exceed" error
        // because the value in the box is now valid.
        if (autoCorrected) {
          delete newErrors[id];
        } else {
          delete newErrors[id];
        }
      } else if (parsedValue !== "" && isNaN(parsedValue)) {
        newErrors[id] = "Please enter a valid number.";
      } else {
        delete newErrors[id];
      }

      return newErrors;
    });
  };

  const validateAdditionalCategory = (id, parentModuleName, checkParentId, currentFormData) => {
    if (parentModuleName === "academic_additional" || parentModuleName === "professional_additional") {
      const dataToUse = currentFormData || formData;
      // Get all valid values where parent ID matches
      const parentEntries = Object.keys(dataToUse).filter(
        (key) => dataToUse[key] !== "" && parseFloat(dataToUse[key]) > 0 && dataToUse[`parent_${key}`] === checkParentId
      );

      if (parentEntries.length > 1) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [id]: "Only one mark entry is allowed for " + parentModuleName + " category.",
        }));
      } else {
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          // Only clear errors specifically for this multi-entry validation
          if (newErrors[id] && newErrors[id].includes("Only one mark entry is allowed")) {
            delete newErrors[id];
          }
          return newErrors;
        });
      }
    }
  };


  // Identify the top-level categories
  const topLevelCategories = categoryList.filter(cat => !cat.fk_parent_id || Number(cat.fk_parent_id) === 0);

  // Use effect to keep totalMaxMarks in sync with the top-level categories
  useEffect(() => {
    if (categoryList.length > 0) {
      const regularCats = topLevelCategories.filter(cat => !cat.category_title.toUpperCase().includes('WEIGHTAGE'));
      const weightageCat = topLevelCategories.find(cat => cat.category_title.toUpperCase().includes('WEIGHTAGE'));
      const baseMax = regularCats.reduce((sum, cat) => sum + (parseFloat(cat.total_mark) || 0), 0);
      const weightageMax = weightageCat ? (parseFloat(weightageCat.total_mark) || 0) : 0;
      setTotalMaxMarks(baseMax + weightageMax);
    }
  }, [categoryList, topLevelCategories]);

  // Separate regular categories and the weightage category
  const allRegularCategories = topLevelCategories.filter(cat => !cat.category_title.toUpperCase().includes('WEIGHTAGE'));
  const weightageCategory = topLevelCategories.find(cat => cat.category_title.toUpperCase().includes('WEIGHTAGE'));

  // Final Grand Total calculation using the restored functions at the top
  const sectionCategories = allRegularCategories.slice(0, 4);
  const baseTotalMax = sectionCategories.reduce((sum, cat) => sum + (parseFloat(cat.total_mark) || 0), 0);
  const baseTotalObtained = sectionCategories.reduce((sum, cat) => sum + calculateObtainedMarksRecursive(cat).obtained, 0);

  const weightagePercentValue = weightageCategory ? calculateObtainedMarksRecursive(weightageCategory).obtained : 0;

  const sumOfAllRegularObtained = categoryList
    .filter(cat => (!cat.fk_parent_id || Number(cat.fk_parent_id) === 0) && !(cat.category_title?.toUpperCase().includes('WEIGHTAGE')))
    .reduce((sum, cat) => sum + calculateObtainedMarksRecursive(cat).obtained, 0);

  const finalGrandTotal = sumOfAllRegularObtained + calculatedWeightageMarks;

  const renderTableRows = (categories, isSubcategory = false, parentContext = {}) => {
    return categories.map((category) => {
      // Use the passed parentContext or default to the current category's module name
      const parentModuleName = parentContext.moduleName || category.module_name;
      const parentId = parentContext.parentId || category.fk_parent_id;
      const isInWeightage = (category.category_title.toUpperCase().includes('WEIGHTAGE') && Number(category.fk_parent_id) === 0) || parentContext.isInWeightage;

      // Check if the subcategory is in a higher course module or textual activities sub-group
      const isHigherCourseSubcategory = isSubcategory && (parentModuleName === 'higher_course' || parentModuleName === 'office_bearers' || parentModuleName === 'arts' || Number(parentId) === 43);

      const isSpecialModule = category.module_name === 'religious' || parentModuleName === 'religious' || category.module_name === 'cocurricular' || parentModuleName === 'cocurricular';
      const isSpecialParent = isSpecialModule && category.subcategories?.length > 0;

      const { rawObtained: rawObtainedMarks, obtained: obtainedMarks } = calculateObtainedMarksRecursive(category);

      // Function to handle checkbox change for higher course subcategories
      const handleHigherCourseCheck = (markCategoryId, totalMark, parentId, moduleName) => {
        const currentValue = formData[markCategoryId] || "";
        const newValue = currentValue !== String(totalMark) ? String(totalMark) : "";
        updateMarkValueWithValidation(markCategoryId, newValue, totalMark, parentId, moduleName);
      };

      const isMainCategory = Number(category.fk_parent_id) === 0;
      const isSubOfMain = !isMainCategory && !isHigherCourseSubcategory;

      const isWeightage = category.category_title.toUpperCase().includes('WEIGHTAGE') && Number(category.fk_parent_id) === 0;

      return (
        <React.Fragment key={category.mark_category_id}>
          {isWeightage && (
            <tr className="total-section-tr">
              <td colSpan="3" className="py-2 px-4 text-start bg-success-light border-0">
                <span className="fs-6 fw-bold text-success-dark">Total Marks of I to IV Section</span>
              </td>
              <td className="text-center py-2 bg-success-light border-0">
                <div className="total-section-pill">
                  {formatTo3(baseTotalObtained)} / {(baseTotalMax % 1 === 0 ? baseTotalMax : formatTo3(baseTotalMax))}
                </div>
              </td>
              <td className="bg-success-light border-0"></td>
            </tr>
          )}
          <tr className={`${isMainCategory ? "main-category-row" : "subcategory-row"} ${(category.module_name === 'religious' || category.module_name === 'cocurricular') ? "religious-row" : ""}`}>
            <td className={`text-start ${isSubcategory ? "ps-4" : ""}`}>
              <div className="d-flex align-items-center">
                {/* Checkbox for higher course subcategories */}
                {isHigherCourseSubcategory && parseFloat(category.total_mark) > 0 && (!category.subcategories || category.subcategories.length === 0) && (
                  <input
                    type="checkbox"
                    checked={formData[category.mark_category_id] === String(category.total_mark)}
                    onChange={() => handleHigherCourseCheck(category.mark_category_id, category.total_mark, category.fk_parent_id, category.module_name || parentModuleName)}
                    className="form-check-input me-2"

                  />
                )}
                <span
                  className="me-2"
                  style={{ fontSize: '1.2rem', color: '#0d6efd' }}
                >
                  {isMainCategory ? "▼" : "•"}
                </span>
                <span dangerouslySetInnerHTML={{ __html: category.category_title }} className={isMainCategory ? "category-title-red fw-bold" : "text-dark"} style={{ fontSize: isMainCategory ? '1rem' : '1rem' }} />
              </div>
            </td>

            <td className="text-center fw-bold" style={{ width: '10%', fontSize: isMainCategory ? '1rem' : '1rem', color: isMainCategory ? '#0d6efd' : '#212529' }}>
              {category.total_mark != 0 && (category.total_mark % 1 === 0 ? category.total_mark : parseFloat(category.total_mark).toFixed(3).replace(/\.?0+$/, ''))}
            </td>
            <td style={{ minWidth: '110px' }}>
              {!isSpecialParent && isHigherCourseSubcategory && category.total_mark > 0 && (
                <input
                  type="text"
                  className={`form-control ${errors[category.mark_category_id] ? "is-invalid" : ""
                    }`}
                  value={formData[category.mark_category_id] || ""}
                  onChange={(e) =>
                    updateMarkValueWithValidation(
                      category.mark_category_id,
                      e.target.value,
                      category.total_mark,
                      category.fk_parent_id,
                      category.module_name || parentModuleName
                    )
                  }
                  style={{ fontSize: '1rem', fontWeight: 'bold', height: '35px', textAlign: 'center', width: '100%' }}
                  placeholder="Marks"
                  disabled={formData[category.mark_category_id] === "20"}

                />
              )}
              {!isSpecialParent && !isHigherCourseSubcategory && isSubcategory && category.total_mark > 0 && (
                <input
                  type="text"
                  className={`form-control ${errors[category.mark_category_id] ? "is-invalid" : ""
                    }`}
                  value={formData[category.mark_category_id] || ""}
                  onChange={(e) => handleInputChange(category.mark_category_id, e.target.value, category.total_mark, category.fk_parent_id, {
                    parentModuleName: category.module_name || parentModuleName,
                    parentId: category.fk_parent_id || parentId
                  })}
                  style={{ fontSize: '1rem', fontWeight: 'bold', height: '35px', textAlign: 'center', width: '100%' }}
                  placeholder={isInWeightage ? "Percentage (%)" : "Marks"}

                />
              )}
              {errors[category.mark_category_id] && (
                <div className="invalid-feedback d-block" style={{ fontSize: '0.75rem' }}>
                  {errors[category.mark_category_id]}
                </div>
              )}
            </td>
            <td className="text-center" style={{ width: '13%' }}>
              {(category.total_mark != 0 || isMainCategory) && (
                <div className="d-flex align-items-center justify-content-center gap-4 flex-nowrap">
                  {(isMainCategory || category.module_name === 'religious' || category.module_name === 'cocurricular') ? (
                    <>
                      {isWeightage ? (
                        <>
                          <span className="mark-pill-red">
                            {formatTo3(calculatedWeightageMarks)} / {category.total_mark}
                          </span>
                          <span className="mark-pill-orange">
                            Actual: {formatTo3(weightagePercentValue)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="mark-pill-red">
                            {formatTo3(obtainedMarks)} {category.total_mark > 0 ? `/ ${category.total_mark % 1 === 0 ? category.total_mark : formatTo3(category.total_mark)}` : ""}
                          </span>
                          {category.total_mark > 0 && rawObtainedMarks > category.total_mark && (
                            <span className="mark-pill-orange">
                              Actual Marks: {formatTo3(rawObtainedMarks)}
                            </span>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <span className="subcategory-mark-text fw-bold">
                      {formatTo3(obtainedMarks)} {category.total_mark > 0 ? `/ ${category.total_mark % 1 === 0 ? category.total_mark : formatTo3(category.total_mark)}` : ""}
                    </span>
                  )}
                </div>
              )}
            </td>
            <td>
              {!isSpecialParent && isSubcategory && category.total_mark > 0 && (
                <textarea
                  className="form-control"
                  placeholder="Remarks"
                  value={formData[`remarks_${category.mark_category_id}`] || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [`remarks_${category.mark_category_id}`]: e.target.value,
                    }))
                  }
                ></textarea>
              )}
            </td>
          </tr>
          {/* Recursively render subcategories */}
          {category.subcategories?.length > 0 &&
            renderTableRows(
              category.subcategories,
              true,
              {
                moduleName: category.module_name,
                parentId: category.mark_category_id,
                isInWeightage: isInWeightage
              }
            )}
        </React.Fragment>
      );
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(errors).length > 0) {
      print_toast("error", "Please fix errors before submitting.");
      return;
    }

    const enteredMarks = [];
    const obtainedMarks = [];

    // Helper to walk the tree and collect all data
    const collectMarksRecursive = (categories) => {
      categories.forEach((category) => {
        const isMainCategory = !category.fk_parent_id || category.fk_parent_id === 0 || category.fk_parent_id === "0";

        // 1. For Main Categories: Calculate and push the capped/weighted totals
        if (isMainCategory) {
          const isWeightage = category.category_title?.toUpperCase().includes("WEIGHTAGE");
          const calc = calculateObtainedMarksRecursive(category);
          const totalObtainedMark = isWeightage ? calculatedWeightageMarks : calc.obtained;

          obtainedMarks.push({
            category_id: category.mark_category_id,
            obtained_mark: totalObtainedMark,
            maximum_mark: category.total_mark,
          });
        }

        // 2. For All Categories: Collect individual entered mark
        const enteredMark = formData[category.mark_category_id];
        if (enteredMark !== undefined && enteredMark !== null && enteredMark !== "") {
          enteredMarks.push({
            sub_category_id: category.mark_category_id,
            fk_canididate_application_subject_id: canididate_application_subject_id,
            given_mark: enteredMark,
            maximum_mark: category.total_mark,
            remarks: formData[`remarks_${category.mark_category_id}`] || "",
            fk_parent_id: category.fk_parent_id,
          });
        }

        // 3. Recurse into subcategories
        if (category.subcategories && category.subcategories.length > 0) {
          collectMarksRecursive(category.subcategories);
        }
      });
    };

    // Start collection from the root of the tree
    collectMarksRecursive(categoryList);

    try {
      const endpoint = isEditMode
        ? `${globalVariables.api_url}/candidatemarklist/update_mark_list`
        : `${globalVariables.api_url}/candidatemarklist/save_mark_list`;

      const response = await axios.post(
        endpoint,
        {
          canididate_application_subject_id,
          enteredMarks,
          obtainedMarks,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.status) {
        print_toast("success", isEditMode ? "Marks updated successfully!" : "Marks saved successfully!");
        setIsEditMode(true);
        fetchExistingMarkData();
      } else {
        print_toast("error", "Failed to save marks: " + response.data.message);
      }
    } catch (error) {
      console.error("Error saving marks:", error);
      print_toast("error", "An error occurred while saving marks.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete all marks for this candidate? This action cannot be undone.")) {
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/candidatemarklist/delete_mark_list`,
          { canididate_application_subject_id },
          { headers: { "Content-Type": "application/json" } }
        );

        if (response.data.status) {
          print_toast("success", "Marks deleted successfully!");
          // Reset form and mode
          setFormData({});
          setErrors({});
          setIsEditMode(false);
        } else {
          print_toast("error", "Failed to delete marks: " + response.data.message);
        }
      } catch (error) {
        console.error("Error deleting marks:", error.message);
        print_toast("error", "An error occurred while deleting marks.");
      }
    }
  };

  const handleDownloadPDF = () => {
    window.open(`${globalVariables.api_url}/candidatemarklist/generate_mark_list_pdf/${canididate_application_subject_id}`, '_blank');
  };

  const handleGenerateHallTicket = () => {
    window.open(`${globalVariables.api_url}/candidateexamapplication/generate_hall_ticket?id=${canididate_application_subject_id}&send_email=1`, '_blank');
  };

  return (
    <>
      <Breadcum 
        items={breadcum} 
        title={
          isEditMode 
            ? `Edit Candidate Marks ${candidateInfo?.registration_number ? `(${candidateInfo.registration_number})` : ''}` 
            : `Add Candidate Marks ${candidateInfo?.registration_number ? `(${candidateInfo.registration_number})` : ''}`
        } 
      />

      {candidateInfo && (
        <div className="official-candidate-banner mb-4">
          <div className="banner-content">
            <div className="row align-items-center">
              <div className="col-lg-9">
                <div className="d-flex align-items-center">
                  <div className="candidate-avatar-bg me-4 overflow-hidden d-flex align-items-center justify-content-center">
                    {candidateInfo.photo_url ? (
                      <img
                        src={candidateInfo.photo_url}
                        alt="Applicant"
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = ""; // Clear src if loading fails to show fallback icon
                          e.target.parentElement.classList.remove('overflow-hidden');
                        }}
                      />
                    ) : (
                      <i className={`fas ${candidateInfo.candidate_type?.toLowerCase().includes('priest') ? 'fa-church' :
                        candidateInfo.candidate_type?.toLowerCase().includes('sister') ? 'fa-pray' :
                          candidateInfo.candidate_type?.toLowerCase().includes('female') ? 'fa-female' :
                            candidateInfo.candidate_type?.toLowerCase().includes('male') ? 'fa-male' :
                              'fa-user-tie'
                        } fa-3x text-gold`}></i>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <h2 className="candidate-name mb-1 text-white">
                      {candidateInfo.applicant_name ? capitalizeWords(candidateInfo.applicant_name) : (isEditMode ? 'Candidate Assessment' : 'Loading...')}
                    </h2>
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      {candidateInfo.registration_number && (
                        <span className="info-badge-blue-glass">
                          <i className="fas fa-id-card me-2 text-gold"></i>
                          <span className="text-white fw-bold">REG: {candidateInfo.registration_number}</span>
                        </span>
                      )}
                      <span className="info-badge-blue-glass">
                        <i className="fas fa-book me-2 text-gold"></i>
                        {candidateInfo.subject_name ? (
                          <>
                            {(candidateInfo.subject_code || (candidateInfo.registration_number ? candidateInfo.registration_number.slice(0, -3) : '')) ? (candidateInfo.subject_code || candidateInfo.registration_number.slice(0, -3)) + '-' : ''}{candidateInfo.subject_name}
                          </>
                        ) : 'Subject Details'}
                      </span>
                      <span className="info-badge-blue-glass">
                        <i className="fas fa-user-tag me-2 text-gold"></i>
                        {candidateInfo.candidate_type ? capitalizeWords(candidateInfo.candidate_type) : 'Category'}
                      </span>
                      {totalMaxMarks > 0 && (
                        <span className="info-badge-blue-glass border-gold-light shadow-sm">
                          <i className="fas fa-poll-h me-2 text-gold"></i>
                          <span className="text-white fw-bold">
                            Marks: <span className="text-gold fw-bolder ms-1">{formatTo3(finalGrandTotal)} / {totalMaxMarks}</span>
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-3 text-lg-end mt-3 mt-lg-0">
                <div className="exam-context-box-glass p-3">
                  <small className="d-block text-white-50 fw-bold x-small text-uppercase mb-1 ls-1">Assessment Context</small>
                  <div className="text-white fw-bold fs-6">
                    <i className="fas fa-file-invoice me-2 text-gold"></i>
                    {candidateInfo.application_title || "Official Exam Assessment"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">

          <div className="official-instruction-alert d-flex align-items-center mb-4 p-3 rounded shadow-sm border-start border-4 border-warning">
            <i className="fas fa-info-circle fs-4 me-3 text-warning"></i>
            <div>
              <strong className="text-dark">Official Guidance:</strong> Enter marks for each category based on the candidate's performance. The total marks will be calculated automatically.
            </div>
          </div>

          <div className="table-responsive rounded shadow-sm overflow-hidden border">
            {loaded ? (
              <form onSubmit={handleSubmit}>
                <table className="table table-hover align-middle mb-0 malayalam">
                  <thead className="bg-dark text-white">
                    <tr>
                      <th className="py-3 px-4" style={{ width: '25%' }}>
                        <i className="fas fa-list-alt me-2"></i>ഇനം (Category)
                      </th>

                      <th className="text-center py-3" style={{ width: '10%' }}>
                        <i className="fas fa-star-half-alt me-2"></i>പരമാവധി മാർക്ക് ({totalMaxMarks % 1 === 0 ? totalMaxMarks : formatTo3(totalMaxMarks)})
                      </th>
                      <th className="text-center py-3" style={{ minWidth: '110px' }}>
                        <i className="fas fa-edit me-2"></i>Given Marks
                      </th>
                      <th className="text-center py-3" style={{ width: '13%' }}>
                        <i className="fas fa-chart-line me-2"></i>Obtained
                      </th>
                      <th className="py-3" style={{ width: '55%' }}>
                        <i className="fas fa-comment-dots me-2"></i>Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody>{renderTableRows(categoryList)}</tbody>
                  <tfoot>
                    <tr className="grand-total-bar align-middle">
                      <td className="ps-4 py-3 border-0 text-start">
                        <span className="fs-5 fw-bold">Grand Total</span>
                      </td>
                      <td colSpan="2" className="border-0"></td>
                      <td className="text-center py-2 border-0">
                        <div className="grand-total-pill d-inline-block">
                          {formatTo3(finalGrandTotal)} / {totalMaxMarks}
                        </div>
                      </td>
                      <td className="border-0"></td>
                    </tr>
                  </tfoot>
                </table>
                <div className="bg-light p-4 border-top d-flex flex-wrap justify-content-end gap-3 align-items-center">
                  <button type="submit" className="btn btn-success btn-lg shadow-sm px-4 fw-bold">
                    {isEditMode ? (
                      <><i className="fas fa-save me-2"></i>Update Marks</>
                    ) : (
                      <><i className="fas fa-check-circle me-2"></i>Submit Assessment</>
                    )}
                  </button>
                  {isEditMode && (
                    <>
                      <button
                        type="button"
                        className="btn btn-lg shadow-sm px-4 fw-bold premium-pdf-btn"
                        onClick={handleDownloadPDF}
                      >
                        <i className="fas fa-file-pdf me-2 text-gold"></i>Export to PDF
                      </button>
                      <button
                        type="button"
                        className="btn btn-lg shadow-sm px-4 fw-bold premium-hallticket-btn"
                        onClick={handleGenerateHallTicket}
                      >
                        <i className="fas fa-id-card me-2 text-gold"></i>Generate Hall Ticket
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger btn-lg shadow-sm px-4 fw-bold"
                        onClick={handleDelete}
                      >
                        <i className="fas fa-trash-alt me-2"></i>Delete Marks
                      </button>
                    </>
                  )}
                </div>
              </form>
            ) : (
              <div className="text-center py-5">
                <div className="spinner-border text-primary me-2" role="status"></div>
                <span className="fw-medium text-muted">Loading assessment categories...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .official-candidate-banner {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            padding: 2rem 2.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(30, 58, 138, 0.2);
            position: relative;
            overflow: hidden;
            border-bottom: 4px solid #ffd700;
        }
        .grand-total-bar {
            background: linear-gradient(90deg, #82b77c 0%, #a5d6a7 100%) !important;
            color: #1b4332 !important;
            font-weight: bold;
            border-radius: 0 0 8px 8px;
        }
        .grand-total-bar td {
            background-color: transparent !important;
            color: inherit !important;
        }
        .grand-total-pill {
            background: #ffffff;
            color: #1b4332;
            padding: 6px 15px;
            border-radius: 50px;
            font-weight: 900;
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            font-size: 1.1rem;
            white-space: nowrap;
        }
        .total-section-bar {
            background: linear-gradient(90deg, #a5d6a7 0%, #c8e6c9 100%) !important;
            color: #1b4332 !important;
            border-top: 1px solid #81c784;
            border-bottom: 1px solid #81c784;
        }
        .total-section-pill {
            background: transparent;
            color: #1b4332;
            padding: 4px 8px;
            font-weight: 800;
            font-size: 1rem;
        }
        .subcategory-row {
            background-color: #ffffff !important;
            border-bottom: 1px solid #eee;
        }
        .category-title-red {
            color: #da3a4a !important;
            font-weight: 700;
        }
        .subcategory-mark-text {
            color: #28a745;
            font-size: 1.1rem;
        }
        .religious-row td {
            background-color: #fff9db !important;
            border-bottom: 2px solid #ffec99 !important;
        }
        .religious-row .mark-pill-red {
            background-color: transparent !important;
            color: #da3a4a !important;
            border: none !important;
            font-weight: 800 !important;
            font-size: 1.1rem !important;
            padding: 0 !important;
        }
        .religious-row .mark-pill-orange {
            border-radius: 50px !important;
            padding: 6px 20px !important;
        }
        .mark-pill-red {
            background-color: #da3a4a;
            color: white;
            padding: 6px 20px;
            border-radius: 50px;
            font-weight: 700;
            display: inline-block;
            font-size: 1rem;
            white-space: nowrap;
        }
        .mark-pill-orange {
            background-color: #e67e22;
            color: white;
            padding: 6px 20px;
            border-radius: 50px;
            font-weight: 700;
            display: inline-block;
            font-size: 1rem;
            white-space: nowrap;
        }
        .form-control {
            border-radius: 8px;
            border: 1px solid #dee2e6;
            padding: 8px 12px;
        }
        .grand-total-pill-center {
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 15px;
            border-radius: 50px;
        }
        .grand-total-pill {
            background: #ffffff !important;
            color: #1b4332 !important;
            padding: 8px 30px !important;
            border-radius: 50px !important;
            font-size: 1.4rem !important;
            font-weight: 800 !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
            display: inline-block;
        }
        .main-category-row td { 
            background: #e0f2fe !important; 
            font-weight: 700; 
            color: #1e40af !important; 
            font-size: 1rem !important;
            border-bottom: none !important; 
        }
        .subcategory-row td { 
            border-bottom: 1px solid #e2e8f0 !important; 
        }
        .mark-pill-white {
            background: #ffffff;
            color: #334155;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 700;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .mark-pill-red {
            background: #da3a4a;
            color: #ffffff;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 700;
            border: 1px solid #dbeafe;
        }
        .mark-pill-orange {
            background: #ff9800;
            color: #ffffff;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 700;
            border: 1px solid #bfdbfe;
        }
        .mark-pill-green {
            background: #dcfce7;
            color: #16a34a;
            padding: 4px 12px;
            border-radius: 20px;
            font-weight: 700;
            border: 1px solid #bbf7d0;
        }
        .premium-pdf-btn {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            border: none;
            color: white !important;
            transition: all 0.3s ease;
        }
        .premium-pdf-btn:hover {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
            color: white !important;
        }
        .premium-hallticket-btn {
            background: linear-gradient(135deg, #881337 0%, #da3a4a 100%);
            border: none;
            color: white !important;
            transition: all 0.3s ease;
        }
        .premium-hallticket-btn:hover {
            background: linear-gradient(135deg, #6b0f2a 0%, #881337 100%);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(136, 19, 55, 0.3);
            color: white !important;
        }
        .candidate-avatar-bg {
            background: rgba(255, 255, 255, 0.15);
            width: 80px;
            height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(5px);
        }
        .candidate-name {
            font-size: 1.75rem;
            font-weight: 800;
            letter-spacing: -0.5px;
            color: #ffffff;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-badge-blue-glass {
            background: rgba(255, 255, 255, 0.1);
            color: #ffffff;
            padding: 0.4rem 1rem;
            border-radius: 50px;
            font-size: 0.85rem;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(5px);
        }
        .exam-context-box-glass {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 10px;
            border-left: 3px solid #ffd700;
            display: inline-block;
            text-align: left;
            min-width: 250px;
            backdrop-filter: blur(5px);
        }
        .text-gold { color: #ffd700 !important; }
        .ls-1 { letter-spacing: 1px; }
        .x-small { font-size: 0.65rem; }
        
        .table-primary td { 
            background-color: #eff6ff !important; 
            font-weight: 700; 
            color: #1e40af !important; 
            font-size: 1.05rem !important;
            border-bottom: 1px solid #94a3b8 !important; 
        }
        .table-secondary td { background-color: #ffffff !important; font-size: 0.95rem; border-bottom: 1px solid #cbd5e1 !important; }
        
        .table thead th {
            background-color: #1e40af !important;
            color: #fff !important;
            font-weight: 700;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
            border: none;
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
        }
        
        .official-instruction-alert {
            background-color: #fffbeb;
            border: 2px solid #ffd700;
        }

        .breadcrumb-item a {
            color: #2563eb !important;
            text-decoration: none;
            font-weight: 500;
        }
        .breadcrumb-item a:hover {
            color: #1d4ed8 !important;
            text-decoration: underline;
        }

        .bg-success-light { background-color: #dcfce7 !important; }
        .text-success-dark { color: #166534 !important; }
        .border-gold-light { border: 1px solid rgba(255, 215, 0, 0.4) !important; }
        .malayalam { font-family: 'Inter', sans-serif; }
      `}</style>
    </>
  );
};

export default CategoryForm;