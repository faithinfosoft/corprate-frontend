import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import { Button, Form, Table, Spinner, Tabs, Tab } from "react-bootstrap";
import { useData } from "./SchoolEvaluationForm";

const SchoolAchievementsForm = () => {
  const { evaluationDocumentDetails } = useData();
  const academicYearId = evaluationDocumentDetails.academic_year_id;
  const schoolId = evaluationDocumentDetails.school_id;
  const year_label = evaluationDocumentDetails.year_label;

  const [activeTab, setActiveTab] = useState('previous');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentYearData, setCurrentYearData] = useState({});
  const [previousYearData, setPreviousYearData] = useState({});
  const [isEditMode, setIsEditMode] = useState({
    current: false,
    previous: false
  });
  const [isLoading, setIsLoading] = useState({
    current: false,
    previous: false,
    items: false,
    categories: false
  });
  const [achievementIds, setAchievementIds] = useState({
    current: null,
    previous: null
  });

  // Fetch data when component mounts
  useEffect(() => {
    if (schoolId && academicYearId) {
      fetchItems();
      fetchLevels();
    }
  }, [schoolId, academicYearId]);

  useEffect(() => {
    if (items.length > 0 && categories.length > 0 && schoolId && academicYearId) {
      fetchExistingData('current');
      fetchExistingData('previous');
    }
  }, [items, categories, schoolId, academicYearId]);

  // Fetch Achievement Items from the API
  const fetchItems = async () => {
    setIsLoading(prev => ({ ...prev, items: true }));
    try {
      const response = await axios.get(`${globalVariables.api_url}/achievements/get_items`);
      
      if (response.data && typeof response.data === 'object') {
        // Convert the response into an array of objects with key and value pairs
        const formattedItems = Object.entries(response.data).map(([key, value]) => ({
          key: key,
          name: value
        }));
        
        setItems(formattedItems);
      } else {
        setItems([]);
        print_toast("info", "No items found for achievements.");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      print_toast("error", "Failed to fetch items.");
    } finally {
      setIsLoading(prev => ({ ...prev, items: false }));
    }
  };

  // Fetch achievement categories and levels
  const fetchLevels = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/achievements/get_levels`);
      if (response.data.status && Array.isArray(response.data.data)) {
        setCategories(response.data.data);
      } else {
        print_toast("info", "No levels found.");
      }
    } catch (error) {
      console.error("Error fetching championship levels:", error);
      print_toast("error", "Failed to fetch levels.");
    }
  };
  // Fetch existing achievement data for specified year type
  const fetchExistingData = async (yearType) => {
    setIsLoading(prev => ({ ...prev, [yearType]: true }));
    try {
      const response = await axios.get(`${globalVariables.api_url}/achievements/view`, {
        params: {
          fk_school_id: schoolId,
          academic_label: year_label,
          
        }
      });

      if (response.data.status && response.data.data) {
        initializeFormWithExistingData(response.data.data, yearType);
        setAchievementIds(prev => ({
          ...prev,
          [yearType]: response.data.achievement_id
        }));
        setIsEditMode(prev => ({
          ...prev,
          [yearType]: true
        }));
      } else {
        initializeEmptyForm(yearType);
        setIsEditMode(prev => ({
          ...prev,
          [yearType]: false
        }));
      }
    } catch (error) {
      console.error(`Error fetching ${yearType} year achievement data:`, error);
      print_toast("error", `Failed to fetch existing ${yearType} year data.`);
      initializeEmptyForm(yearType);
    } finally {
      setIsLoading(prev => ({ ...prev, [yearType]: false }));
    }
  };

  // Initialize empty form data
  const initializeEmptyForm = (yearType) => {
    if (items.length === 0 || categories.length === 0) return;
  
    const initialData = {};
    
    items.forEach(item => {
      initialData[item.key] = {};
      
      categories.forEach(category => {
        initialData[item.key][category.category] = {};
        
        // Initialize each level with empty string
        Object.keys(category.levels).forEach(level => {
          initialData[item.key][category.category][level] = "";
        });
      });
    });
    
    if (yearType === 'current') {
      setCurrentYearData(initialData);
    } else {
      setPreviousYearData(initialData);
    }
  };

  // Initialize form with existing data
  const initializeFormWithExistingData = (data, yearType) => {
    if (items.length === 0 || categories.length === 0) return;
    
    // First create an empty form data structure
    const initialData = {};
    
    items.forEach(item => {
      initialData[item.key] = {};
      
      categories.forEach(category => {
        initialData[item.key][category.category] = {};
        
        Object.keys(category.levels).forEach(level => {
          initialData[item.key][category.category][level] = "";
        });
      });
    });
    
    // Now populate with the API data
    data.forEach(itemData => {
      // Find the corresponding item in our items array
      const matchingItem = items.find(item => 
        item.key === itemData.name
      );
      
      if (matchingItem) {
        const itemKey = matchingItem.key;
        
        // Process each category in the response
        itemData.categories.forEach(catData => {
          // Make sure the category exists in our form structure
          if (initialData[itemKey] && initialData[itemKey][catData.category]) {
            // Process each level in the response category
            Object.entries(catData.levels).forEach(([levelKey, levelValue]) => {
              // Only set the value if the level exists in our form structure
              if (initialData[itemKey][catData.category][levelKey] !== undefined) {
                initialData[itemKey][catData.category][levelKey] = levelValue;
              }
            });
          }
        });
      }
    });
    
    if (yearType === 'current') {
      setCurrentYearData(initialData);
    } else {
      setPreviousYearData(initialData);
    }
  };

  // Handle input changes
  const handleInputChange = (itemKey, category, level, value, yearType) => {
    if (yearType === 'current') {
      setCurrentYearData(prev => {
        const newData = {...prev};
        if (!newData[itemKey]) {
          newData[itemKey] = {};
        }
        if (!newData[itemKey][category]) {
          newData[itemKey][category] = {};
        }
        newData[itemKey][category][level] = value;
        return newData;
      });
    } else {
      setPreviousYearData(prev => {
        const newData = {...prev};
        if (!newData[itemKey]) {
          newData[itemKey] = {};
        }
        if (!newData[itemKey][category]) {
          newData[itemKey][category] = {};
        }
        newData[itemKey][category][level] = value;
        return newData;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e, yearType) => {
    e.preventDefault();
    
    setIsLoading(prev => ({ ...prev, [yearType]: true }));
    try {
      const isEdit = isEditMode[yearType];
      const url = `${globalVariables.api_url}/achievements/${isEdit ? 'update' : 'save'}`;
      
      const formData = yearType === 'current' ? currentYearData : previousYearData;
      const achievementId = achievementIds[yearType];
      
      const response = await axios.post(url, {
        fk_school_id: schoolId,
        academic_label: year_label,
        form_data: JSON.stringify(formData),
        achievement_id: achievementId,
        
      });

      if (response.data.status) {
        print_toast("success", isEdit ? 
          `${yearType === 'current' ? 'Current' : 'Previous'} year achievements updated successfully!` : 
          `${yearType === 'current' ? 'Current' : 'Previous'} year achievements added successfully!`);
        
        // Update achievement ID and edit mode
        if (response.data.achievement_id) {
          setAchievementIds(prev => ({
            ...prev,
            [yearType]: response.data.achievement_id
          }));
        }
        
        setIsEditMode(prev => ({
          ...prev,
          [yearType]: true
        }));
        
        // Refresh data
        fetchExistingData(yearType);
      } else {
        print_toast("error", response.data.message || "Operation failed.");
      }
    } catch (error) {
      console.error(`Error saving ${yearType} year data:`, error);
      print_toast("error", `Failed to save ${yearType} year achievements.`);
    } finally {
      setIsLoading(prev => ({ ...prev, [yearType]: false }));
    }
  };

  // Render table headers
  const renderTableHeader = () => {
    if (categories.length === 0) return null;
    
    return (
      <thead>
        <tr>
          <th rowSpan="2">Item</th>
          {categories.map((category, idx) => (
            <th key={idx} colSpan={Object.keys(category.levels).length}>
              {category.category}
            </th>
          ))}
        </tr>
        <tr>
          {categories.map((category) => 
            Object.keys(category.levels).map((level, idx) => (
              <th key={`${category.category}-${level}-${idx}`}>
                {level}
              </th>
            ))
          )}
        </tr>
      </thead>
    );
  };

  // Render input cell
  const renderInputCell = (itemKey, category, level, yearType) => {
    // Get the appropriate form data based on year type
    const formData = yearType === 'current' ? currentYearData : previousYearData;
    
    // Safely access the value with optional chaining and default to empty string
    const value = formData[itemKey]?.[category]?.[level] || '';
    
    return (
      <td key={`${itemKey}-${category}-${level}`}>
        <Form.Control
          type="text"
          value={value}
          onChange={(e) => handleInputChange(itemKey, category, level, e.target.value, yearType)}
          style={{ width: '60px' }}
          placeholder="0"
        />
      </td>
    );
  };

  // Render table rows
  const renderTableRows = (yearType) => {
    return items.map((item, index) => (
      <tr key={index}>
        <td>{item.name}</td>
        {categories.map((category) => 
          Object.keys(category.levels).map((level) => 
            renderInputCell(item.key, category.category, level, yearType)
          )
        )}
      </tr>
    ));
  };

  // Check if any loading state is active
  const isAnyLoading = Object.values(isLoading).some(state => state === true);

  return (
    <div className="container">
    
      
      {isAnyLoading && (
        <div className="text-center my-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        id="achievements-tabs"
      >
        <Tab eventKey="previous" title="Previous Year">
          <Form onSubmit={(e) => handleSubmit(e, 'previous')}>
            <Table bordered responsive>
              {renderTableHeader()}
              <tbody>
                {renderTableRows('previous')}
              </tbody>
            </Table>
            
            <div className="mt-1 mb-4">
              <small>*Specify the number of positions</small>
            </div>

            <div className="mt-3 d-flex justify-content-between">
              <Button 
                type="submit" 
                variant={isEditMode.previous ? "primary" : "success"} 
                disabled={isLoading.previous}
              >
                {isLoading.previous 
                  ? (isEditMode.previous ? 'Updating...' : 'Adding...') 
                  : (isEditMode.previous ? 'Update Previous Year' : 'Add Previous Year')
                }
              </Button>
            </div>
          </Form>
        </Tab>
        
        <Tab eventKey="current" title="Current Year">
          <Form onSubmit={(e) => handleSubmit(e, 'current')}>
            {/* <div className="mb-3">
              <small><i>(Attach detailed list in separate sheet)</i></small>
            </div> */}
            
            <Table bordered responsive>
              {renderTableHeader()}
              <tbody>
                {renderTableRows('current')}
              </tbody>
            </Table>
            
            <div className="mt-1 mb-4">
              <small>*specify the number of positions</small>
            </div>

            <div className="mt-3 d-flex justify-content-between">
              <Button 
                type="submit" 
                variant={isEditMode.current ? "primary" : "success"} 
                disabled={isLoading.current}
              >
                {isLoading.current 
                  ? (isEditMode.current ? 'Updating...' : 'Adding...') 
                  : (isEditMode.current ? 'Update Current Year' : 'Add Current Year')
                }
              </Button>
            </div>
          </Form>
        </Tab>
      </Tabs>
    </div>
  );
};

export default SchoolAchievementsForm;