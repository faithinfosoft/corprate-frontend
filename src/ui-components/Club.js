import React, { useState, useEffect } from "react";
import Breadcum from "./Breadcum";
import axios from "axios";
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import { Modal, Button, Dropdown } from "react-bootstrap";

const Club = () => {
  const [clubs, setClubs] = useState([]);
  const [clubName, setClubName] = useState("");
  const [saveFlag, setSaveFlag] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editClub, setEditClub] = useState({ club_id: "", club_name: "" });
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleChange = (e) => {
    setClubName(e.target.value);
    if (error) setError("");
  };

  const handleEditChange = (e) => {
    setEditClub({ ...editClub, club_name: e.target.value });
    if (editError) setEditError("");
  };

  const fetchClubs = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/club/view_clubs`
      );
      if (response.data.status) {
        setClubs(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const handleAddClub = async (e) => {
    e.preventDefault();

    if (!clubName.trim()) {
      setError("Club name cannot be empty!");
      return;
    } else {
      setError("");
    }

    setSaveFlag(true);
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/club/add_club`,
        { club_name: clubName }
      );
      if (response.data.status) {
        fetchClubs();
        setClubName("");
        setError("");
        print_toast("success", "Club added successfully!");
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", "Failed to add club.");
    }
    setSaveFlag(false);
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    try {
      const response = await axios.delete(
        `${globalVariables.api_url}/club/delete/${clubId}`
      );
      if (response.data.status) {
    
        print_toast("success", "Club deleted successfully!");
        setClubs((prevclubs) => prevclubs.filter(clubs => clubs.club_id !== clubId));
        await fetchClubs();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", "Failed to delete club.");
    }
  };

  const handleEditClick = (club) => {
    setEditClub(club);
    setEditModal(true);
  };

  const handleUpdateClub = async () => {
    if (!editClub.club_name.trim()) {
      setEditError("Club name cannot be empty!"); // Show error if empty
      return;
    }

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/club/update_club/${editClub.club_id}`,
        { club_name: editClub.club_name }
      );

      if (response.data.status) {
        fetchClubs();
        setEditModal(false);
        setEditError(""); // Clear error after successful update
        print_toast("success", "Club updated successfully!");
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", "Failed to update club.");
    }
  };

  return (
    <div className="container">
      <Breadcum
        items={[
          { Title: "Home", Link: "/" },
          { Title: "Club", Link: "" },
        ]}
        title="Clubs"
      />
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Clubs</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th className="text-center">Sl No</th>
                      <th className="text-center">Club Name</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubs.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center">
                          No clubs added yet.
                        </td>
                      </tr>
                    ) : (
                      clubs.map((item, index) => (
                        <tr key={item.club_id}>
                          <td className="text-center">{index + 1}</td>
                          <td>{item.club_name}</td>
                          <td className="text-center">
                            <Dropdown>
                              <Dropdown.Toggle variant="secondary" size="sm">
                                Actions
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => handleEditClick(item)}
                                >
                                  Edit
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => handleDeleteClub(item.club_id)}
                                >
                                  Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
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

        {/* Add Club Form */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Add Club</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleAddClub}>
                <div className="form-group">
                  <label htmlFor="club_name">
                    Club Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="club_name"
                    value={clubName}
                    onChange={handleChange}
                  />
                  {error && <small className="text-danger">{error}</small>}
                </div>

                <div className="col-12 mt-3 text-end">
                  <button
                    type="submit"
                    className="btn btn-success m-1"
                    disabled={saveFlag}
                  >
                    {saveFlag ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger m-1"
                    onClick={() => {
                      setClubName("");
                      setError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Club Modal */}
      <Modal show={editModal} onHide={() => setEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Club</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>
              Club Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              value={editClub.club_name}
              onChange={handleEditChange} // Calls function to update state & clear errors
            />
            {editError && <small className="text-danger">{editError}</small>}{" "}
            {/* Show error if present */}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleUpdateClub}>
            Update
          </Button>
          <Button variant="danger" onClick={() => setEditModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Club;
