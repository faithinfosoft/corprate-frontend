import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";

const VincentModule = ({ category, docID,items, onSubmit, isSaving, setIsSaving, onClose }) => {
  const [responses, setResponses] = useState({});
  const [isAffiliated, setIsAffiliated] = useState(null); // State for the Yes/No question
  const [briefDescription, setBriefDescription] = useState(''); // State for the common text field

  useEffect(() => {
    const initialResponses = items.reduce((acc, item) => {
      acc[item.school_evaluation_category_item_id] = {
        amount: '',
        fk_category_id: item.fk_category_id,
        school_evaluation_category_item_id: item.school_evaluation_category_item_id,
      };
      return acc;
    }, {});
    setResponses(initialResponses);
  }, [items]);

  const handleInputChange = (itemId, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [itemId]: {
        ...prevResponses[itemId],
        amount: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const responsesArray = Object.values(responses);

    const payload = {
      responses: responsesArray,
      isAffiliated, 
      briefDescription,
      fk_category_id: items[0]?.fk_category_id,
      docID: docID, 
    };

    console.log('Payload:', payload);

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/saveVincent`,
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
    setIsAffiliated(null);
    setBriefDescription('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Radio Button for Yes/No Question */}
        <div className="form-group">
          <label>Whether affiliated to central council?</label>
          <div>
            <label>
              <input
                type="radio"
                name="affiliated"
                value="yes"
                checked={isAffiliated === 'yes'}
                onChange={() => setIsAffiliated('yes')}
              />
              Yes
            </label>
            <label className="ms-3">
              <input
                type="radio"
                name="affiliated"
                value="no"
                checked={isAffiliated === 'no'}
                onChange={() => setIsAffiliated('no')}
              />
              No
            </label>
          </div>
        </div>

        {/* Loop through Items */}
        <div>
          {items.map((item) => (
            <div key={item.school_evaluation_category_item_id} className="form-group">
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
                    placeholder="Enter amount"
                    value={responses[item.school_evaluation_category_item_id]?.amount || ''}
                    onChange={(e) =>
                      handleInputChange(item.school_evaluation_category_item_id, e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Common Text Field */}
        <div className="form-group mt-4">
          <label>Brief Description of Activities with Expenses</label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="Enter description"
            value={briefDescription}
            onChange={(e) => setBriefDescription(e.target.value)}
          ></textarea>
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

export default VincentModule;
