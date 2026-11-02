import React, { useState, useEffect } from 'react';
import Breadcum from './Breadcum';
import axios from 'axios';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";

const AddCocurricular = () => {
  const [activity, setActivity] = useState(""); // State for new activity input
  const [activities, setActivities] = useState([]); // State for storing activities
  const [saveFlag, setSaveFlag] = useState(false); // Flag to indicate save in progress
  const [editActivityId, setEditActivityId] = useState(null); // Activity ID for edit
  const [editActivityName, setEditActivityName] = useState(""); // Activity name for editing
  const [showEditModal, setShowEditModal] = useState(false); // State to control modal visibility

  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Co-curricular Activity', Link: '' },
  ]);

  // Fetch activities from server
  const fetchActivities = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/cocurricular/view`);
      if (response.data.status) {
        setActivities(response.data.data);
       // print_toast("success", "Activities loaded successfully");
      } else {
        print_toast("error", "Failed to load activities");
      }
    } catch (error) {
      print_toast("error", "Error fetching activities");
    }
  };

  // Fetch activities when the component mounts
  useEffect(() => {
    fetchActivities();
  }, []);

  // Add new activity
  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (activity.trim() !== "") {
      try {
        setSaveFlag(true);
        const activityData = { activity_name: activity.trim() };

        const response = await axios.post(`${globalVariables.api_url}/cocurricular/save`, activityData);

        if (response.data.status) {
          setActivities([...activities, { activity_name: activity.trim() }]);
          setActivity("");
          print_toast("success", "Activity added successfully!");
        } else {
          print_toast("error", "Failed to add activity.");
        }
        setSaveFlag(false);
      } catch (error) {
        print_toast("error", "Error Inserting Data");
        setSaveFlag(false);
      }
    } else {
      print_toast("warning", "Activity cannot be empty!");
    }
  };

  // Edit activity handler
  const handleEditActivity = (activityId, activityName) => {
    setEditActivityId(activityId);
    setEditActivityName(activityName);
    setShowEditModal(true); // Open modal by setting state
  };

  // Save edited activity
  const handleUpdateActivity = async () => {
    if (editActivityName.trim() !== "") {
      try {
        const activityData = { activity_name: editActivityName.trim() };

        const response = await axios.put(`${globalVariables.api_url}/cocurricular/update/${editActivityId}`, activityData);

        if (response.data.status) {
          setActivities(activities.map(item => item.activity_id === editActivityId ? { ...item, activity_name: editActivityName } : item));
          print_toast("success", "Activity updated successfully!");
          setShowEditModal(false); // Hide modal after successful update
        } else {
          print_toast("error", "Failed to update activity.");
        }
      } catch (error) {
        print_toast("error", "Error updating activity");
      }
    } else {
      print_toast("warning", "Activity name cannot be empty!");
    }
  };

  // Delete activity
  const handleDeleteActivity = async (activityId) => {
    try {
      const response = await axios.delete(`${globalVariables.api_url}/cocurricular/delete/${activityId}`);

      if (response.data.status) {
        setActivities(activities.filter(item => item.activity_id !== activityId));
        print_toast("success", "Activity deleted successfully!");
      } else {
        print_toast("error", "Failed to delete activity.");
      }
    } catch (error) {
      print_toast("error", "Error deleting activity");
    }
  };

  return (
    <div className="container">
      <Breadcum items={breadcum} title="Co-curricular Activity" />
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Co-curricular Activity</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No</th>
                      <th scope="col" className="text-center">Activity Name</th>
                      <th scope="col" className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">No activities added yet.</td>
                      </tr>
                    ) : (
                      activities.map((item, index) => (
                        <tr key={item.activity_id}>
                          <td className="text-center">{index + 1}</td>
                          <td>{item.activity_name}</td>
                          <td className="text-center">
                            {/* Dropdown for actions */}
                            <div className="dropdown">
                              <button className="btn btn-secondary btn-sm dropdown-toggle" type="button" id={`dropdownMenuButton${item.activity_id}`} data-bs-toggle="dropdown" aria-expanded="false">
                                Actions
                              </button>
                              <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${item.activity_id}`}>
                                <li>
                                  <button className="dropdown-item" onClick={() => handleEditActivity(item.activity_id, item.activity_name)}>
                                    Edit
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item text-danger" onClick={() => handleDeleteActivity(item.activity_id)}>
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Add Cocurricular Activity</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddActivity} id="form-add-activity">
                <div className="form-group">
                  <label htmlFor="activity" className="col-form-label">Co-curricular Activity</label>
                  <input
                    type="text"
                    className="form-control"
                    id="activity"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                  />
                </div>
                <div className="col-12 text-end">
                  <button
                    type="submit"
                    className="btn btn-success m-1"
                    disabled={saveFlag}
                  >
                    {saveFlag ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="false">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editModalLabel">Edit Co-curricular Activity</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="editActivity" className="col-form-label">Activity Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="editActivity"
                    value={editActivityName}
                    onChange={(e) => setEditActivityName(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleUpdateActivity}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCocurricular;
