import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from '../Global.js';
import Modal from 'react-bootstrap/Modal';
import print_toast from '../utilities/Toaster.js';
import Breadcum from './Breadcum';
import Sidebar from './Sidebar';
const Zone = () => {
  const [zoneList, setZoneList] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Zone', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    zone_name: '',
    save_flag: false,
  });
  const [zone, setZone] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    zone_name: '',
  });
  const [modalErrors, setModalErrors] = useState({});

  const fetchZones = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/zone/get_all_zones`);
      if (response.data.status) {
        setZoneList(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching zones:', error.message);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modalIsOpen) {
      setEditFormData((prevData) => ({ ...prevData, [name]: value }));
      setModalErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setFormError((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const clearZoneForm = () => {
    setFormData({
      zone_name: '',
      save_flag: false,
    });
  };

  const saveZone = async (e) => {
    e.preventDefault();
    setFormData((prevData) => ({ ...prevData, save_flag: true }));

    try {
      const response = await axios.post(`${globalVariables.api_url}/zone/save_zone`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status) {
        await fetchZones();
        clearZoneForm();
        print_toast('success', response.data.message);
      } else {
        print_toast('error', response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving zone:', error.message);
    } finally {
      setFormData((prevData) => ({ ...prevData, save_flag: false }));
    }
  };

  const deleteZone = async (_zone) => {
  if (_zone.delete_flag) return;

  try {
    _zone.delete_flag = true;
    setZone({ ..._zone });

    const response = await axios.post(`${globalVariables.api_url}/zone/delete_zone`, { zone_id: _zone.zone_id }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (response.data.status) {
      setZoneList(zoneList.filter((z) => z.zone_id !== _zone.zone_id));
      print_toast('success', response.data.message);
    } else {
      print_toast('error', response.data.message);
    }
  } catch (error) {
    console.error('Error deleting zone:', error.message);
  } finally {
    _zone.delete_flag = false;
  }
};


  const editZone = (_zone) => {
    setZone(_zone);
    setEditFormData({ zone_name: _zone.zone_name });
    openModal();
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalErrors({});
  };

  const updateZone = async (e) => {
    e.preventDefault();
    if (formData.save_flag) return;

    setFormData((prevData) => ({ ...prevData, save_flag: true }));

    try {
      const response = await axios.post(`${globalVariables.api_url}/zone/update_zone`, {
        zone_id: zone.zone_id,
        zone_name: editFormData.zone_name,
      }, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status) {
        await fetchZones();
        clearZoneForm();
        print_toast('success', response.data.message);
        closeModal();
      } else {
        print_toast('error', response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error('Error updating zone:', error.message);
    } finally {
      setFormData((prevData) => ({ ...prevData, save_flag: false }));
    }
  };

  return (
    <>
      <Breadcum items={breadcum} title="Zone" />

      <div className="row">
        {/* Zone List */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Zone Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
              <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Zone Name</th>
                      <th scope="col" className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && zoneList.length === 0 ? (
                      <tr>
                        <td colSpan="3">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      zoneList.map((zoneItem, index) => (
                        <tr key={index}>
                          <td className=" text-center">{index + 1}</td>
                          <td className=" text-center">{zoneItem.zone_name}</td>
                          <td className="text-center">
                            <div className="dropdown">
                              <button
                                className="btn btn-dark dropdown-toggle btn-sm"
                                type="button"
                                id={`dropdownMenuButton${index}`}
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                Action
                              </button>
                              <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${index}`}>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => editZone(zoneItem)}
                                  >
                                    Edit
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this zone?')) {
                                        deleteZone(zoneItem);
                                      }
                                    }}
                                    disabled={zoneItem.delete_flag}
                                  >
                                    {zoneItem.delete_flag ? 'Deleting...' : 'Delete'}
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

        {/* Create Zone Form */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Create Zone</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={saveZone} className="row g-3">
                <div className="col-12">
                  <label htmlFor="zone_name" className="form-label">
                    Zone Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="zone_name"
                    name="zone_name"
                    placeholder="Enter Zone Name"
                    value={formData.zone_name}
                    onChange={handleChange}
                  />
                  {formError.zone_name && (
                    <span className="text-danger">{formError.zone_name}</span>
                  )}
                </div>
                <div className="col-12 text-end">
                  <button
                    type="submit"
                    className="btn btn-success m-1"
                    disabled={formData.save_flag}
                  >
                    {formData.save_flag ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="reset"
                    className="btn btn-danger m-1"
                    onClick={clearZoneForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Zone Modal */}
      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Zone</Modal.Title>
        </Modal.Header>
        <Modal.Body>
                    <form role="form" onSubmit={updateZone} className="row g-3">
            <div className="col-12">
              <label htmlFor="edit_zone_name" className="form-label">
                Zone Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="edit_zone_name"
                name="zone_name"
                placeholder="Enter Zone Name"
                value={editFormData.zone_name}
                onChange={handleChange}
              />
              {modalErrors.zone_name && (
                <span className="text-danger">{modalErrors.zone_name}</span>
              )}
            </div>
            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn btn-success m-1"
                disabled={formData.save_flag}
              >
                {formData.save_flag ? 'Updating...' : 'Update'}
              </button>
              <button
                type="button"
                className="btn btn-danger m-1"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Zone;

          
