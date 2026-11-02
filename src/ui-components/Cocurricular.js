import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";

const Cocurricular = ({ category, docID,items, onSubmit, isSaving, setIsSaving, onClose }) => {
  const [responses, setResponses] = useState({});

  useEffect(() => {
    const initialResponses = items.reduce((acc, item) => {
      acc[item.school_evaluation_category_item_id] = {
        activityData: {
          enrolled_strength: '',
          achievements: '',
        },
        fk_category_id: item.fk_category_id,
        school_evaluation_category_item_id: item.school_evaluation_category_item_id,
      };
      return acc;
    }, {});
    setResponses(initialResponses);
  }, [items]);

  const handleInputChange = (itemId, field, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [itemId]: {
        ...prevResponses[itemId],
        activityData: {
          ...prevResponses[itemId].activityData,
          [field]: value,
        },
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const responsesArray = Object.values(responses);

    const payload = {
      responses: responsesArray.map((response) => ({
        ...response,
      })),
      fk_category_id: items[0]?.fk_category_id,
      docID: docID, 
    };

    console.log('Payload:', payload);

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/saveCocurricular`,
        payload
      );

      if (response.data.status) {
        alert('Data saved successfully!');
        onClose();
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
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          {items.map((item) => (
            <div key={item.school_evaluation_category_item_id} className="form-group">
              <div className="row">
                <label className="col-12">
                  {item.item_name} <span style={{ color: 'red' }}>*</span>
                </label>
              </div>
              <div className="row mt-3">
                <div className="col-6">
                  <label>Enrolled Strength</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter number of enrolled strength"
                    value={responses[item.school_evaluation_category_item_id]?.activityData.enrolled_strength || ''}
                    onChange={(e) =>
                      handleInputChange(item.school_evaluation_category_item_id, 'enrolled_strength', e.target.value)
                    }
                  />
                </div>
                <div className="col-6">
                  <label>Achievements</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter achievements"
                    value={responses[item.school_evaluation_category_item_id]?.activityData.achievements || ''}
                    onChange={(e) =>
                      handleInputChange(item.school_evaluation_category_item_id, 'achievements', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
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

export default Cocurricular;
