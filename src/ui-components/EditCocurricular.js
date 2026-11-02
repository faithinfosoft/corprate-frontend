import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import globalVariables from "../Global.js";

const EditCocurricular = ({ categoryId, categoryDetailsId, onSaveSuccess, onClose }) => {
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/schoolevaluation/get_cocurricular_data?category_id=${categoryId}`
        );
        setItems(Array.isArray(response.data) ? response.data : [response.data]);
      } catch (error) {
        const message = error.response?.data?.message || 'Network or server error occurred.';
        console.error('Error fetching data:', message);
        setError(message);
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
  
    // Validate inputs
    const invalidItems = items.filter(
      (item) => !item.enrolled_strength?.trim() || !item.achievements?.trim()
    );
    if (invalidItems.length > 0) {
      alert('Please fill out all required fields.');
      return;
    }
  
    setIsSaving(true);
  
    const transformedItems = items.map((item) => ({
      category_activity_id: item.category_activity_id,
      category_details_id: item.category_details_id,
      category_id: item.category_id,
      item_name: item.item_name,
      activityData: {
        enrolled_strength: item.enrolled_strength,
        achievements: item.achievements,
      },
    }));
  
    const dataToSubmit = {
      responses: transformedItems,
      categoryDetailsId: categoryDetailsId,
      fk_category_id: categoryId,
    };
  
    try {
      const result = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/updateCocurricular`,
        dataToSubmit
      );
  
      if (result.data && result.data.status) {
        alert('Data updated successfully!');
        onSaveSuccess(); 
        onClose(); 
      } else {
        const message = result.data?.message || 'Failed to update data.';
        alert(message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while saving data.';
      console.error('Error saving data:', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };
  

  const handleCancel = () => {
    onClose(); 
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
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
                  <label>Enrolled Strength</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.enrolled_strength ?? ''}
                    onChange={(e) =>
                      handleInputChange(index, 'enrolled_strength', e.target.value)
                    }
                  />
                </div>
                <div className="col-6">
                  <label>Achievements</label>
                  <input
                    type="text"
                    className="form-control"
                    value={item.achievements ?? ''}
                    onChange={(e) =>
                      handleInputChange(index, 'achievements', e.target.value)
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

EditCocurricular.propTypes = {
  categoryId: PropTypes.number.isRequired,
  categoryDetailsId: PropTypes.number.isRequired,
  onSaveSuccess: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EditCocurricular;
