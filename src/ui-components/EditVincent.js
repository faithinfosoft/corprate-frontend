import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";

const EditVincent = ({ categoryId, categoryDetailsId, onSaveSuccess, onClose }) => {
  const [items, setItems] = useState([]);
  const [briefDescription, setBriefDescription] = useState(''); // To hold the brief description for all items
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/schoolevaluation/get_Vincent_data?category_id=${categoryId}`
        );

        // Assuming the response contains items and possibly a briefDescription field
        setItems(response.data || []);
        
        // Check if briefDescription is included in the API response, and set it
        if (response.data && response.data.length > 0) {
          setBriefDescription(response.data[0].construction_remarks || '');  // Set briefDescription from the first item or default to an empty string
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleInputChange = (e, index) => {
    // Update the specific item based on index for activity_data
    const updatedItems = [...items];
    updatedItems[index].activity_data = e.target.value;
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Prepare the items and brief description to submit
    const transformedItems = items.map((item) => ({
      category_activity_id: item.category_activity_id,
      category_details_id: item.category_details_id,
      category_id: item.category_id,
      item_name: item.item_name,
      activity_data: item.activity_data,
      construction_remarks: briefDescription,  // Save the brief description with each item
    }));

    const dataToSubmit = {
      responses: transformedItems,
      briefDescription,  // Send the briefDescription separately as well
      categoryDetailsId,
      fk_category_id: categoryId,
    };

    try {
      const result = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/updateVincentData`,
        dataToSubmit
      );

      if (result.data.status) {
        alert('Data updated successfully!');
        onSaveSuccess();  // Callback for successful save
        onClose();         // Close the modal
      } else {
        alert(result.data.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error.response || error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setItems([]);  // Reset items to initial state
    setBriefDescription('');
    onClose();     // Close the modal without saving
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Loop through Items and display activity_data */}
          {items.map((item, index) => (
            <div key={item.category_activity_id} className="form-group">
              <div className="row">
                <label className="col-12">
                  {item.item_name} <span style={{ color: 'red' }}>*</span>
                </label>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <label>Amount</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.activity_data || ''}
                    onChange={(e) => handleInputChange(e, index)}  // Pass index to update the specific item
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Common Text Field for Brief Description */}
          <div className="form-group mt-4">
            <label>Brief Description of Activities with Expenses</label>
            <textarea
              className="form-control"
              rows="3"
              value={briefDescription}
              onChange={(e) => setBriefDescription(e.target.value)}  // Update the brief description
              placeholder="Enter description"
            ></textarea>
          </div>

          {/* Buttons Section */}
          <div className="d-flex justify-content-start mt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-success"
              style={{ marginRight: '8px' }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditVincent;
