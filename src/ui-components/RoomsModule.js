import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";

const RoomsModule = ({ category, docID,items = [], onSubmit, isSaving, setIsSaving, onClose }) => {
  const [responses, setResponses] = useState({});
  const [generalInstructions, setGeneralInstructions] = useState(''); 

  // Initialize responses when items are available
  useEffect(() => {
    if (items && items.length > 0) {
      const initialResponses = items.reduce((acc, item) => {
        acc[item.school_evaluation_category_item_id] = {
          answer: null, 
          measurement_values: '', 
          item_values: '', 
          item_capacity: item.item_capacity, 
          fk_category_id: item.fk_category_id,
          school_evaluation_category_item_id: item.school_evaluation_category_item_id
        };
        return acc;
      }, {});
      setResponses(initialResponses);
    }
  }, [items]);

  const handleRadioChange = (itemId, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [itemId]: {
        ...prevResponses[itemId],
        answer: value,
        item_values: value === 'no' ? 'no' : 'yes', 
        measurement_values: value === 'no' ? null : prevResponses[itemId]?.measurement_values,
      },
    }));
  };

  const handleInputChange = (itemId, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [itemId]: {
        ...prevResponses[itemId],
        measurement_values: value, // Update the value for measurement
      },
    }));
  };

  const handleGeneralInstructionsChange = (e) => {
    setGeneralInstructions(e.target.value); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true); 
    
    const responsesArray = Object.values(responses);
    
    const payload = {
      responses: responsesArray.map((response, index) => ({
        ...response,
        school_evaluation_category_item_id: items[index].school_evaluation_category_item_id, 
        measurement_values: response.answer === 'no' ? null : response.measurement_values,
        item_values: response.answer === 'no' ? 'no' : response.item_values,
      })),
      generalInstructions,
      fk_category_id: items[0]?.fk_category_id, 
      docID: docID, 
    };

    console.log('Payload:', payload);
    
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolinfrastructure/saveRoomData`,
        payload
      );
      
      if (response.data.status) {
        alert('Data saved successfully!');
       // onClose(); 
       window.location.reload();
      } else {
        alert(response.data.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      alert('An error occurred while saving data.');
    } finally {
      setIsSaving(false); 
    }
  };

  const handleCancel = () => {
    setResponses({});
    setGeneralInstructions('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          {items && items.length > 0 ? (
            items.map((item) => (
              <div key={item.school_evaluation_category_item_id} className="form-group">
                <div className="row">
                  <label className="col-12">
                    {item.item_name} <span style={{ color: 'red' }}>*</span>
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

                {/* Additional fields based on answer */}
                {responses[item.school_evaluation_category_item_id]?.answer === 'yes' && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <label>
                        Enter value in {item.item_capacity} <span style={{ color: 'red' }}>*</span> ({item.item_capacity === 'number' ? 'Count' : item.item_capacity})
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder={`Enter value in ${item.item_capacity}`}
                        value={responses[item.school_evaluation_category_item_id]?.measurement_values || ''}
                        onChange={(e) =>
                          handleInputChange(item.school_evaluation_category_item_id, e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No items available</p>
          )}
        </div>

        {/* General Instructions */}
        <div className="row mt-4">
          <div className="col-12">
            <label>
              Mention the constructions during this year <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              className="form-control"
              rows="3"
              value={generalInstructions}
              onChange={handleGeneralInstructionsChange}
              placeholder="Mention the constructions during this year"
            />
          </div>
        </div>

        {/* Buttons Section */}
        <div className="d-flex justify-content-start mt-4">
          <button type="submit" disabled={isSaving} className="btn btn-success" style={{ marginRight: '8px' }}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn btn-danger" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomsModule;
