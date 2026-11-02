import React, { useState, useEffect } from 'react';
import axios from 'axios';
import globalVariables from "../Global.js";

const EditScholarship = ({ categoryId, categoryDetailsId, onSaveSuccess, onClose }) => {
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/schoolevaluation/get_scholarship_data?category_id=${categoryId}`
        );
        setItems(Array.isArray(response.data) ? response.data : [response.data]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  const handleInputChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    setItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    // Add category_activity_id to each transformed item
    const transformedItems = items.map((item) => ({
      category_activity_id: item.category_activity_id,
      category_details_id: item.category_details_id,
      category_id: item.category_id,
      item_name: item.item_name,
      activityData: {
        participants: item.participants,
        rank: item.rank,
      },
    }));

    const dataToSubmit = {
      responses: transformedItems,
      categoryDetailsId: categoryDetailsId,
      fk_category_id: categoryId,
    };

    try {
      const result = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/updateScholarshipData`,
        dataToSubmit
      );

      if (result.data.status) {
        alert('Data updated successfully!');
        onSaveSuccess();  // Callback to indicate successful save
        onClose();         // Close the modal
      } else {
        console.log(result.data.message || 'Failed to save data');
      }
    } catch (error) {
      console.error('Error saving data:', error.response || error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setItems([]);  // Reset items to initial state
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
          <input type="hidden" name="categoryDetailsId" value={categoryDetailsId} />

          {items.map((item, index) => (
            <div key={index} className="form-group">
              <div className="row">
                <label className="col-12">
                  {item.item_name} <span style={{ color: 'red' }}>*</span>
                </label>
              </div>
              <div className="row mt-3">
                <div className="col-6">
                  <label>Number of Participants</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.participants || ''}
                    onChange={(e) =>
                      handleInputChange(index, 'participants', e.target.value)
                    }
                  />
                </div>
                <div className="col-6">
                  <label>Rank</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.rank || ''}
                    onChange={(e) =>
                      handleInputChange(index, 'rank', e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}

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

export default EditScholarship;
