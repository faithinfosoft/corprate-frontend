import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import { Button, Form, Table, Spinner } from "react-bootstrap";
import { useData } from "./SchoolEvaluationForm";

const OverallChampionship = () => {
  const { evaluationDocumentDetails } = useData();
  const academicYearId = evaluationDocumentDetails.academic_year_id;
  const schoolId = evaluationDocumentDetails.school_id;
  const year_label = evaluationDocumentDetails.year_label;

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [championshipId, setChampionshipId] = useState(null);

  // Fetch data when component mounts
  useEffect(() => {
    if (schoolId && academicYearId) {
      fetchItems();
      fetchLevels();
    }
  }, [schoolId, academicYearId]);

  useEffect(() => {
    if (items.length > 0 && categories.length > 0 && schoolId && academicYearId) {
      fetchExistingData();
    }
  }, [items, categories, schoolId, academicYearId]);
  

  // Fetch Championship Items from the API
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/championship/get_items`);
      
      if (response.data && typeof response.data === 'object') {
        // Convert the response into an array of objects with key and value pairs
        const formattedItems = Object.entries(response.data).map(([key, value]) => ({
          key: key,
          name: value
        }));
        
        setItems(formattedItems);
      } else {
        setItems([]);
        print_toast("info", "No items found for overall championships.");
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      print_toast("error", "Failed to fetch items.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch championship levels
  const fetchLevels = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/championship/get_levels`);
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

  // Fetch existing championship data
  const fetchExistingData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/championship/view`, {
        params: {
          fk_school_id: schoolId,
          academicYearId: academicYearId
        }
      });

      if (response.data.status && response.data.data) {
        initializeFormWithExistingData(response.data.data);
        setChampionshipId(response.data.championship_id	);
        setIsEditMode(true);
      } else {
        initializeEmptyForm();
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Error fetching championship data:", error);
      print_toast("error", "Failed to fetch existing data.");
      initializeEmptyForm();
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize empty form data
  const initializeEmptyForm = () => {
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
    
    setFormData(initialData);
  };
  const initializeFormWithExistingData = (data) => {
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
    //   const matchingItem = items.find(item => 
    //     item.name.toLowerCase() === itemData.name.toLowerCase()
    //   );
      
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
    
    console.log("Populated form data:", initialData);
    setFormData(initialData);
  };
  // Initialize form with existing data
  const initializeFormWithExistingData1 = (data) => {
    if (items.length === 0 || categories.length === 0) return;
    
    const initialData = {};
    
    // First initialize with empty structure
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
    
    // Then populate with existing data
    data.forEach(itemData => {
      // Find the item object that matches the name from the data
      const matchingItem = items.find(item => item.name === itemData.name);
      
      if (matchingItem) {
        const itemKey = matchingItem.key;
        
        itemData.categories.forEach(cat => {
          if (initialData[itemKey] && initialData[itemKey][cat.category]) {
            // Copy each level value individually
            Object.keys(cat.levels).forEach(level => {
              initialData[itemKey][cat.category][level] = cat.levels[level];
            });
          }
        });
      }
    });
    
    setFormData(initialData);
  };
  // Handle input changes
  const handleInputChange = (itemKey, category, level, value) => {
    setFormData(prev => {
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
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const url = `${globalVariables.api_url}/championship/${isEditMode ? 'update' : 'save'}`;
      const response = await axios.post(url, {
        fk_school_id: schoolId,
        academicYearId: academicYearId,
        form_data: JSON.stringify(formData),
        championship_id: championshipId
      });

      if (response.data.status) {
        print_toast("success", isEditMode ? "Championships updated successfully!" : "Championships added successfully!");
        
        // Refresh data after successful save
       
        if (response.data.championship_id) {
            setChampionshipId(response.data.championship_id);
          }
          
          // Set edit mode to true after successful save
          setIsEditMode(true);
          fetchExistingData();
      } else {
        print_toast("error", response.data.message || "Operation failed.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      print_toast("error", "Failed to save championships.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render table headers
  const renderTableHeader = () => {
    return (
      <thead>
        <tr>
          <th rowSpan="2">Item</th>
          {categories.map((category, idx) => (
            <th key={idx} colSpan={Object.keys(category.levels).length}>{category.category}</th>
          ))}
        </tr>
        <tr>
          {categories.map((category) => 
            Object.keys(category.levels).map((level, idx) => (
              <th key={`${category.category}-${level}-${idx}`}>{level}</th>
            ))
          )}
        </tr>
      </thead>
    );
  };

  // Render input cell
  const renderInputCell1 = (itemKey, category, level) => {
    const value = formData[itemKey]?.[category]?.[level] || '';
    
    return (
      <td key={`${itemKey}-${category}-${level}`}>
        <Form.Control
          type="text"
          value={value}
          onChange={(e) => handleInputChange(itemKey, category, level, e.target.value)}
        style={{ width: '100px' }}
        />
      </td>
    );
  };
  const renderInputCell = (itemKey, category, level) => {
    // Safely access the value with optional chaining and default to empty string
    const value = formData[itemKey]?.[category]?.[level] || '';
    
    return (
      <td key={`${itemKey}-${category}-${level}`}>
        <Form.Control
          type="text"
          value={value}
          onChange={(e) => handleInputChange(itemKey, category, level, e.target.value)}
          style={{ width: '100px' }}
        />
      </td>
    );
  };

  // Render table rows
  const renderTableRows = () => {
    return items.map((item, index) => (
      <tr key={index}>
        <td>{item.name}</td>
        {categories.map((category) => 
          Object.keys(category.levels).map((level) => 
            renderInputCell(item.key, category.category, level)
          )
        )}
      </tr>
    ));
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
        <Table bordered responsive>
          {renderTableHeader()}
          <tbody>
            {renderTableRows()}
          </tbody>
        </Table>

        <div className="mt-3 d-flex justify-content-between">
          <Button 
            type="submit" 
            variant={isEditMode ? "primary" : "success"} 
            disabled={isLoading}
          >
            {isLoading 
              ? (isEditMode ? 'Updating...' : 'Adding...') 
              : (isEditMode ? 'Update Championships' : 'Add Championships')
            }
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default OverallChampionship;