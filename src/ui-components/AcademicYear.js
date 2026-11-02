import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum';

const AcademicYear = () => {
  const [year_list, setYear_list] = useState([]);
  const [form_error, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Academic Year', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    save_flag: false,
    status:'',
  });
  const [year, setYear] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    start_date: '',
    end_date: '',
    status:'',
  });
  const [modalErrors, setModalErrors] = useState({}); // New state for modal errors

  const fetchYearsettings = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/academicyear/view');
      if (response.data.status) {
        setYear_list(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchYearsettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modalIsOpen) {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
      setModalErrors({ // Clear modal-specific errors on change
        ...modalErrors,
        [name]: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      setFormError({
        ...form_error,
        [name]: '',
      });
    }
  };

  const clearYearsettingform = () => {
    setFormData({
      start_date: '',
      end_date: '',
      save_flag: false,
      status:'',
    });
  };

  const saveYearsetting = async (e) => {
    e.preventDefault();
    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));

    try {
      const response = await axios.post(globalVariables.api_url + '/academicyear/save', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status) {
        await fetchYearsettings();
        clearYearsettingform();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving Year:', error.message);
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

  const deleteYear = async (_year) => {
    if (_year.delete_flag) return;

    try {
      _year.delete_flag = true;
      setYear(_year);

      const formData = { 'academic_year_id': _year.academic_year_id };
      const response = await axios.post(globalVariables.api_url + '/academicyear/delete', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.status) {
        setYear_list(year_list.filter((y) => y.academic_year_id !== _year.academic_year_id));
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting year:', error.message);
    } finally {
      _year.delete_flag = false;
    }
  };

  const enableYear = async (_year) => {
    if (_year.enable_flag) return;

    try {
      _year.enable_flag = true;
      setYear(_year);

      const formData = { 'academic_year_id': _year.academic_year_id, 'settings_status': 'enable' };
      const response = await axios.post(globalVariables.api_url + '/academicyear/update-status', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status) {
        print_toast("success", response.data.message);
        await fetchYearsettings();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error enabling year:', error.message);
    } finally {
      _year.enable_flag = false;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const editYear = (_year) => {
    setYear(_year);
    setEditFormData({
      start_date: _year.start_date,
      end_date: _year.end_date,
      status: _year.status,
    });
    openModal();
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalErrors({}); // Clear modal errors when closing the modal
  };

  const updateYear = async (e) => {
    e.preventDefault();
    if (formData.save_flag) return; // Prevent multiple submissions

    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));

    try {
      const formDataToUpdate = {
        academic_year_id: year.academic_year_id,
        start_date: editFormData.start_date,
        end_date: editFormData.end_date,
        status: editFormData.status,
      };

      const response = await axios.post(globalVariables.api_url + '/academicyear/update', formDataToUpdate, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status) {
        await fetchYearsettings();
        clearYearsettingform();
        print_toast("success", response.data.message);
        closeModal();
      } else {
        print_toast("error", response.data.message);
        setModalErrors(response.data.error || {}); // Set modal-specific errors
      }
    } catch (error) {
      console.error('Error updating Year:', error.message);
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };



  const getTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };
  
  return (
    <>
      <Breadcum items={breadcum} title="Academic Year" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Academic Year</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className='text-center'>Sl No.</th>
                      <th scope="col" className='text-center'>Start Date</th>
                      <th scope="col" className='text-center'>End Date</th>
                      <th scope="col" className='text-center'>Year</th>
                      <th scope="col" className='text-center'>Status</th>
                      <th scope="col" className='text-center'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && year_list.length === 0 ? (
                      <tr>
                        <td colSpan="6">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                     

                      year_list.map((year_setting, index) => (
                       
                        <tr key={index} className={year_setting.status === "enabled" ? "table-success" : ""}>
                          <td className=" text-center">{index + 1}</td>
<td className="fw-bold text-center "> <span className={`badge ${year_setting.status === "enabled" ? "bg-success text-white" : "bg-light text-dark"}`}>
    {formatDate(year_setting.start_date)}
  </span></td>
<td className="fw-bold text-center"> <span className={`badge ${year_setting.status === "enabled" ? "bg-success text-white" : "bg-light text-dark"}`}>
    {formatDate(year_setting.end_date)}
  </span></td>
<td className="fw-bold text-center"> <span className={`badge ${year_setting.status === "enabled" ? "bg-success text-white" : "bg-light text-dark"}`}>
{year_setting.year_label}
  </span></td>
<td className="text-center">
  {year_setting.status === "enabled"
    ?(
      <span className="badge bg-success text-white">Ongoing</span>
    )
    : year_setting.status === "disabled"
    ?(
      <span className="badge bg-light text-dark">Completed</span>
    ) 
    : year_setting.status === "not_started"
    ?(
      <span className="badge bg-light text-dark">Not Started</span>
    ) 
    : ""}
</td>


                          <td className="fw-bold text-center">
                            <div className="dropdown">
                              <button className="btn btn-dark dropdown-toggle btn-sm" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                Action
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                {/* <li>
                                  <a href="#" disabled={year_setting.enable_flag} className="dropdown-item" onClick={() => enableYear(year_setting)}>
                                    {year_setting.enable_flag ? 'Enabling...' : 'Enable'}
                                  </a>
                                </li> */}
                                <li>
                                  <a href="#" className="dropdown-item" onClick={() => editYear(year_setting)}>Edit</a>
                                </li>
                                <li>
                                  <a
                                    href="#"
                                    disabled={year_setting.delete_flag}
                                    className="dropdown-item"
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this year?')) {
                                        deleteYear(year_setting);
                                      }
                                    }}
                                  >
                                    {year_setting.delete_flag ? 'Deleting...' : 'Delete'}
                                  </a>
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
              <h5 className="card-title">Create Academic Year</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={saveYearsetting} className='row g-3'>
                <div className="col-12">
                  <label htmlFor="inputName" className="col-sm-12 col-form-label">Start Date<span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    id="start_date"
                    name="start_date"
                    placeholder=""
                    value={formData.start_date}
                    onChange={handleChange}
                    // min={getTodayDate()}
                  />
                  <span className="text-danger">{form_error.start_date}</span>
                </div>
                <div className="col-12">
                  <label htmlFor="inputName" className="col-sm-12 col-form-label">End Date<span className="text-danger">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    id="end_date"
                    name="end_date"
                    placeholder=""
                    value={formData.end_date}
                    onChange={handleChange}
                    // min={getTodayDate()}
                  />
                  <span className="text-danger">{form_error.end_date}</span>
                </div>


                <div className="col-12">
  <label htmlFor="status" className="col-sm-12 col-form-label">
    Status<span className="text-danger">*</span>
  </label>
  <select
    className="form-control"
    id="status"
    name="status"
    value={formData.status}
    onChange={handleChange}
  >
    <option value="">Select Status</option>
    <option value="disabled">Completed</option>
    <option value="enabled">Ongoing</option>
    <option value="not_started">Not Started</option>
  </select>
  <span className="text-danger">{form_error.status}</span>
</div>

                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-success m-1" disabled={formData.save_flag}>
                    {formData.save_flag ? 'Saving...' : 'Save'}
                  </button>
                  <button type="reset" className="btn btn-danger m-1" onClick={clearYearsettingform}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Academic Year</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* {JSON.stringify(editFormData,null,2)} */}
          <form role="form" onSubmit={updateYear} className="row g-3">
            <div className="col-12">
              <label htmlFor="start_date" className="col-sm-12 col-form-label">Start Date <span className="text-danger">*</span></label>             <input
                type="date"
                className="form-control"
                id="start_date"
                name="start_date"
                placeholder="Enter Start Date"
                value={editFormData.start_date}
                onChange={handleChange}
                // min={getTodayDate()}
              />
              <span className="text-danger">{modalErrors.start_date}</span>
            </div>
            <div className="col-12">
              <label htmlFor="end_date" className="col-sm-12 col-form-label">End Date<span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                id="end_date"
                name="end_date"
                placeholder="Enter End Date"
                value={editFormData.end_date}
                onChange={handleChange}
                // min={getTodayDate()}
              />
              <span className="text-danger">{modalErrors.end_date}</span>
            </div>


            <div className="col-12">
  <label htmlFor="status" className="col-sm-12 col-form-label">
    Status<span className="text-danger">*</span>{editFormData.status}
  </label>
  <select
    className="form-control"
    id="status"
    name="status"
    value={editFormData.status || ""}
    onChange={handleChange}
  >
    <option value="" disabled>
      Select Status
    </option>
    <option value="disabled" selected={editFormData.status === "disabled"}>
      Completed
    </option>
    <option value="enabled" selected={editFormData.status === "enabled"}>
      Ongoing
    </option>
    <option value="not_started" selected={editFormData.status === "not_started"}>
      Not Started
    </option>
  </select>
  <span className="text-danger">{modalErrors.status}</span>
</div>

            <div className="col-12 text-end">
              <button type="submit" className="btn btn-success m-1" disabled={formData.save_flag}>
                {formData.save_flag ? 'Updating...' : 'Update'}
              </button>
              <button type="button" onClick={() => { clearYearsettingform(); closeModal(); }} className="btn btn-danger m-1">Cancel</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AcademicYear;
