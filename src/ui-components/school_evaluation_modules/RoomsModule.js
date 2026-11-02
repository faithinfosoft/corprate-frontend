import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../../Global.js";
const RoomsModule = ({ category, items, onSubmit, isSaving, setIsSaving, onClose }) => {
  const [responses, setResponses] = useState({});
  const [generalInstructions, setGeneralInstructions] = useState('');
  useEffect(() => {
    // Ensure each item has a valid structure in responses on component mount
    const initialResponses = items.reduce((acc, item) => {
      acc[item.school_evaluation_category_item_id] = {
        answer: null, // Default answer is null
        capacity: '', // Default capacity is an empty string
        sqft: '', // Default square footage is an empty string
      };
      return acc;
    }, {});
    setResponses(initialResponses); // Set the initialized state
  }, [items]); // Reinitialize when `items` changes

  const handleRadioChange = (itemId, value) => {
   
    setResponses((prevResponses) => ({
      ...prevResponses,
      [itemId]: {
        ...prevResponses[itemId],
        answer: value,
        capacity: '', // Reset capacity when changing answer to No
        sqft: '', // Reset square footage when changing answer to No
      },
    }));
  };

  const handleInputChange = (itemId, field, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [itemId]: {
        ...prevResponses[itemId],
        [field]: value,
      },
    }));
  };

  const handleGeneralInstructionsChange = (e) => {
    setGeneralInstructions(e.target.value); // Update general instructions
  };


  
  const handleSubmit = async (e) => {

    e.preventDefault(); // Prevent the default form submission
    setIsSaving(true); // Indicate the save operation is in progress

    const payload = {
      responses,
      generalInstructions,
    };

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/saveRoomData`,
        payload
      );

      if (response.data.status) {
        alert('Data saved successfully!');
        onClose(); // Close the modal after successful submission
      } else {
        alert(response.data.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('An error occurred while saving data.');
    } finally {
      setIsSaving(false); // Reset the saving state
    }
  };


  return (
    <div>
    {JSON.stringify(responses)}
    <form onSubmit={handleSubmit}>
        <div>
          {items.map((item) => (
            <div key={item.school_evaluation_category_item_id} className="form-group">
              <div className="row">
                <label className="col-12">
                 {item.item_name}
                </label>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`item-${item.school_evaluation_category_item_id}`}
                      value="yes"
                      checked={responses[item.school_evaluation_category_item_id]?.answer === 'yes'}
                      onChange={() => handleRadioChange(item.school_evaluation_category_item_id, 'yes')}
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`item-${item.school_evaluation_category_item_id}`}
                      value="no"
                      checked={responses[item.school_evaluation_category_item_id]?.answer === 'no'}
                      onChange={() => handleRadioChange(item.school_evaluation_category_item_id, 'no')}
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              </div>

              {/* If Yes is selected, show additional fields */}
              {responses[item.school_evaluation_category_item_id]?.answer === 'yes' && (
                <div className="row mt-3">
                  {/* Conditionally render the number input if item_capacity is 'number' */}
                  {item.item_capacity === 'number' && (
                    <div className="col-12">
                      <label>Specify the number</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter number"
                        value={responses[item.school_evaluation_category_item_id]?.capacity || ''}
                        onChange={(e) =>
                          handleInputChange(item.school_evaluation_category_item_id, 'capacity', e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* Conditionally render square footage input if item_capacity is 'sqft' */}
                  {item.item_capacity === 'sqft' && (
                    <div className="col-12">
                      <label>Specify the area in square feet (sqft)</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Enter area in sqft"
                        value={responses[item.school_evaluation_category_item_id]?.sqft || ''}
                        onChange={(e) =>
                          handleInputChange(item.school_evaluation_category_item_id, 'sqft', e.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* General Instructions (common for the entire form) */}
        <div className="row mt-4">
          <div className="col-12">
            <label>Mention the constructions during this year</label>
            <textarea
              className="form-control"
              rows="3"
              value={generalInstructions}
              onChange={handleGeneralInstructionsChange}
              placeholder="Mention the constructions during this year"
            />
          </div>
        </div>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default RoomsModule;
