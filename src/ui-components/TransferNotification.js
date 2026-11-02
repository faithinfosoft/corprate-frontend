import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from '../Global.js';
import Modal from 'react-bootstrap/Modal';
import print_toast from '../utilities/Toaster.js';
import Breadcum from './Breadcum';
import { useNavigate } from 'react-router-dom';
import useAuth from '../utilities/useAuth';

const TransferNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Transfer Notifications', Link: '' },
  ]);
  const [hasApplied, setHasApplied] = useState(false);

  const navigate = useNavigate();
  const auth = useAuth();
  const username = auth.user.username;
  const usertype = auth.user.user_type;

  const initialFormState = {
    notification_title: '',
    notification_desc: '',
    start_date: '',
    end_date: '',
    fk_academic_year_id: '',
    notification_status: '',
   // notification_type:'',
    save_flag: false,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState(initialFormState);
  const [modalErrors, setModalErrors] = useState({});
  const [appliedNotifications, setAppliedNotifications] = useState({});

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/transfer_notification/view_notifications`);
      if (response.data.status) {
        if (usertype === 'staff') {
          // Filter notifications for staff:
          // 1. Only show notifications with status = "published"
          // 2. Only show notifications where end_date hasn't passed
          const currentDate = new Date();
          const filteredNotifications = response.data.data.filter(notification => {
            //const endDate = new Date(notification.end_date);
            return notification.notification_status === 'published';
          });
          setNotifications(filteredNotifications);
        } else {
          // For corporate_admin, show all notifications
          setNotifications(response.data.data);
        }
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching notifications:', error.message);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/transfer_notification/get_all_years`);
      if (response.data.status) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchAcademicYears();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modalIsOpen && Object.keys(notification).length > 0) {
      setEditFormData((prevData) => ({ ...prevData, [name]: value }));
      setModalErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setFormError((prevErrors) => ({ ...prevErrors, [name]: '' }));
    }
  };

  const clearNotificationForm = () => {
    setFormData(initialFormState);
    setFormError({});
    setEditFormData(initialFormState);
    setModalErrors({});
  };

  const saveNotification = async (e) => {
    e.preventDefault();
   setFormData((prevData) => ({ ...prevData, save_flag: true }));
    //setFormData((prevData) => ({ ...prevData, notification_type: 'transfer', save_flag: true }));


    try {

      const response = await axios.post(
        `${globalVariables.api_url}/transfer_notification/save_notification`,
        {
        
          notification_type: 'transfer', // Ensure notification_type is passed here as well
          ...formData,
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      


    
   

      if (response.data.status) {
        await fetchNotifications();
        clearNotificationForm();
        closeModal();
        print_toast('success', response.data.message);
      } else {
        print_toast('error', response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving notification:', error.message);
    } finally {
      setFormData((prevData) => ({ ...prevData, save_flag: false }));
    }
  };

  const deleteNotification = async (_notification) => {
    if (_notification.delete_flag) return;
  
    try {
      _notification.delete_flag = true;
      setNotification({ ..._notification });
  
      const response = await axios.post(
        `${globalVariables.api_url}/transfer_notification/delete_notification`,
        { tr_notification_id: _notification.tr_notification_id },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
  
      if (response.data.status) {
        setNotifications(notifications.filter((n) => n.tr_notification_id !== _notification.tr_notification_id));
        print_toast('success', response.data.message);
      } else {
        // Reset delete_flag if the deletion was not successful
        _notification.delete_flag = false;
        setNotification({ ..._notification });
        print_toast('error', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting notification:', error.message);
    } finally {
      // Ensure delete_flag is reset after the process is complete
      _notification.delete_flag = false;
      setNotification({ ..._notification });
    }
  };
  

  const editNotification = (_notification) => {
    setNotification(_notification);
    setEditFormData({
      notification_title: _notification.notification_title,
      notification_desc: _notification.notification_desc,
      start_date: _notification.start_date,
      end_date: _notification.end_date,
      fk_academic_year_id: _notification.fk_academic_year_id,
      notification_status: _notification.notification_status,
      save_flag: false,
      notification_type:_notification.notification_type,
    });
    setModalErrors({});
    openModal();
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalErrors({});
    setNotification({});
    clearNotificationForm();
  };

  const updateNotification = async (e) => {
    e.preventDefault();
    if (editFormData.save_flag) return;

    setEditFormData(prev => ({ ...prev, save_flag: true }));

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/transfer_notification/update_notification`,
        {
          tr_notification_id: notification.tr_notification_id,
          ...editFormData,
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      if (response.data.status) {
        await fetchNotifications();
        clearNotificationForm();
        closeModal();
        print_toast('success', response.data.message);
      } else {
        print_toast('error', response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error('Error updating notification:', error.message);
    } finally {
      setEditFormData(prev => ({ ...prev, save_flag: false }));
    }
  };

  const handleApply = async (notification) => {
    try {
      if (!username) {
        print_toast('error', 'Username not found');
        return;
      }

      const response = await axios.get(
        `${globalVariables.api_url}/transfer_notification/check_existing_application`, {
          params: {
            email: username, // Using username since it contains the email
            notification_id: notification.tr_notification_id
          }
        }
      );

      if (response.data.status) {
        if (response.data.data.hasApplied) {
          print_toast('error', 'You have already applied for this Transfer');
          return;
        }

        // If not applied, proceed to application page
        navigate('/stafftransferapplication', {
          state: {
            notificationId: notification.tr_notification_id,
            notificationTitle: notification.notification_title,
            startDate: notification.start_date,
            endDate: notification.end_date,
            description: notification.notification_desc,
            academicyear: notification.fk_academic_year_id
          }
        });
      } else {
        print_toast('error', response.data.message || 'Error checking application status');
      }
    } catch (error) {
      console.error('Error checking application status:', error);
      const errorMessage = error.response?.data?.message || 'Error checking application status';
      print_toast('error', errorMessage);
    }
  };

  const checkIfUserHasApplied = async (notificationId) => {
    try {
      if (!username || !notificationId) {
        return;
      }
  
      const response = await axios.get(
        `${globalVariables.api_url}/transfer_notification/check_existing_application`, {
          params: {
            email: username,
            notification_id: notificationId
          }
        }
      );
  
      if (response.data.status) {
        setAppliedNotifications(prev => ({
          ...prev,
          [notificationId]: response.data.data.hasApplied
        }));
      }
    } catch (error) {
      console.error('Error checking if user has applied:', error);
    }
  };
  
  useEffect(() => {
    if (notifications.length > 0) {
      notifications.forEach(notification => {
        checkIfUserHasApplied(notification.tr_notification_id);
      });
    }
  }, [notifications]);

  return (
    <>
      <Breadcum items={breadcum} title="Transfer Notifications" />

      <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Transfer Notification Details</h5>
            {usertype === 'corporate_admin' && (
    <button className="btn btn-danger" onClick={() => {
      clearNotificationForm();
      setNotification({});
      setModalIsOpen(true);
    }}>
      Create Transfer Notification
    </button>
  )}
          </div>
          <div className="card-body">
  <div className="table-responsive">
    <table className="table table-bordered datatable">
      <thead>
        <tr>
          <th scope="col" className="text-center">Sl No.</th>
          <th scope="col" className="text-center">Academic Year</th>
          <th scope="col" className="text-center">Title</th>
          <th scope="col" className="text-center">Description</th>
          <th scope="col" className="text-center">Start Date</th>
          <th scope="col" className="text-center">End Date</th>
  
          {usertype === 'corporate_admin' && (
            <>
              <th scope="col" className="text-center">Status</th>
   
            </>
          )}
        <th scope="col" className="text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {loaded && notifications.length === 0 ? (
          <tr>
            <td colSpan={usertype === 'corporate_admin' ? 8 : 7}>
              <NoDataFound />
            </td>
          </tr>
        ) : (
          notifications.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.year_label}</td>
              <td>{item.notification_title}</td>
              <td>{item.notification_desc}</td>
              <td >
  {`${new Date(item.start_date).getDate().toString().padStart(2, '0')}-${(new Date(item.start_date).getMonth() + 1).toString().padStart(2, '0')}-${new Date(item.start_date).getFullYear()}`}
</td>
<td>
  {`${new Date(item.end_date).getDate().toString().padStart(2, '0')}-${(new Date(item.end_date).getMonth() + 1).toString().padStart(2, '0')}-${new Date(item.end_date).getFullYear()}`}
</td>

   
              
              {usertype === 'corporate_admin' && (
                <>
                  <td>
                    {item.notification_status === 'published' 
                      ? 'Published' 
                      : item.notification_status === 'closed' 
                      ? 'Closed' 
                      : 'Not Published'}
                  </td>

                  <td className="text-center">
                    <div className="dropdown">
                      <button
                        className="btn btn-dark dropdown-toggle"
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
                            onClick={() => editNotification(item)}
                          >
                            Edit
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this notification?')) {
                                deleteNotification(item);
                              }
                            }}
                            disabled={item.delete_flag}
                          >
                            {item.delete_flag ? 'Deleting...' : 'Delete'}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </>
              )}

{usertype !== 'corporate_admin' && (
  <td className="text-center">
    <button
      className="btn btn-primary"
      disabled={appliedNotifications[item.tr_notification_id]}
      onClick={() => handleApply(item)}
    >
      {appliedNotifications[item.tr_notification_id] ? 'Applied' : 'Apply'}
    </button>
  </td>
)}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>

        </div>
      </div>
    </div>

    <Modal show={modalIsOpen} onHide={closeModal} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>
      {Object.keys(notification).length > 0 ? 'Edit Transfer Notification' : 'Create Transfer Notification'}
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={Object.keys(notification).length > 0 ? updateNotification : saveNotification} className="row g-3">

    <div className="col-12">
        <label htmlFor="fk_academic_year_id" className="form-label">
          Academic Year <span className="text-danger">*</span>
        </label>
        <select
          className="form-control"
          id="fk_academic_year_id"
          name="fk_academic_year_id"
          value={Object.keys(notification).length > 0 ? editFormData.fk_academic_year_id : formData.fk_academic_year_id}
          onChange={handleChange}
        >
          <option value="">Select Academic Year</option>
          {academicYears.map((year) => (
            <option key={year.academic_year_id} value={year.academic_year_id}>
              {year.year_label}
            </option>
          ))}
        </select>
        {(Object.keys(notification).length > 0 ? modalErrors.fk_academic_year_id : formError.fk_academic_year_id) && (
          <span className="text-danger">
            {Object.keys(notification).length > 0 ? modalErrors.fk_academic_year_id : formError.fk_academic_year_id}
          </span>
        )}
      </div>

      <div className="col-12">
        <label htmlFor="notification_title" className="form-label">
          Title <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="notification_title"
          name="notification_title"
          placeholder="Enter Title"
          value={Object.keys(notification).length > 0 ? editFormData.notification_title : formData.notification_title}
          onChange={handleChange}
        />


        {(Object.keys(notification).length > 0 ? modalErrors.notification_title : formError.notification_title) && (
          <span className="text-danger">
            {Object.keys(notification).length > 0 ? modalErrors.notification_title : formError.notification_title}
          </span>
        )}
      </div>

      <div className="col-12">
        <label htmlFor="notification_desc" className="form-label">
          Description 
        </label>
        <textarea
          className="form-control"
          id="notification_desc"
          name="notification_desc"
          placeholder="Enter Description"
          value={Object.keys(notification).length > 0 ? editFormData.notification_desc : formData.notification_desc}
          onChange={handleChange}
        />
        {(Object.keys(notification).length > 0 ? modalErrors.notification_desc : formError.notification_desc) && (
          <span className="text-danger">
            {Object.keys(notification).length > 0 ? modalErrors.notification_desc : formError.notification_desc}
          </span>
        )}
      </div>



      <div className="col-6">
        <label htmlFor="start_date" className="form-label">
          Start Date <span className="text-danger">*</span>
        </label>
        <input
          type="date"
          className="form-control"
          id="start_date"
          name="start_date"
          value={Object.keys(notification).length > 0 ? editFormData.start_date : formData.start_date}
          onChange={handleChange}
        />
        {(Object.keys(notification).length > 0 ? modalErrors.start_date : formError.start_date) && (
          <span className="text-danger">
            {Object.keys(notification).length > 0 ? modalErrors.start_date : formError.start_date}
          </span>
        )}
      </div>

      <div className="col-6">
        <label htmlFor="end_date" className="form-label">
          End Date <span className="text-danger">*</span>
        </label>
        <input
          type="date"
          className="form-control"
          id="end_date"
          name="end_date"
          value={Object.keys(notification).length > 0 ? editFormData.end_date : formData.end_date}
          min={Object.keys(notification).length > 0 ? editFormData.start_date : formData.start_date}
          onChange={handleChange}
        />
        {(Object.keys(notification).length > 0 ? modalErrors.end_date : formError.end_date) && (
          <span className="text-danger">
            {Object.keys(notification).length > 0 ? modalErrors.end_date : formError.end_date}
          </span>
        )}
      </div>

            <div className="col-12">
              <label htmlFor="notification_status" className="form-label">
                Status <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                id="notification_status"
                name="notification_status"
                value={Object.keys(notification).length > 0 ? editFormData.notification_status : formData.notification_status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="published">Published</option>
                <option value="not published">Not Published</option>
                <option value="closed">Closed</option>
              </select>
              {(Object.keys(notification).length > 0 ? modalErrors.notification_status : formError.notification_status) && (
                <span className="text-danger">
                  {Object.keys(notification).length > 0 ? modalErrors.notification_status : formError.notification_status}
                </span>
              )}
            </div>
    </form>
  </Modal.Body>
  <Modal.Footer>

    <button
      className="btn btn-success"
      onClick={Object.keys(notification).length > 0 ? updateNotification : saveNotification}
      disabled={Object.keys(notification).length > 0 ? editFormData.save_flag : formData.save_flag}
    >
      {Object.keys(notification).length > 0 ? 
        (editFormData.save_flag ? 'Updating...' : 'Update') : 
        (formData.save_flag ? 'Saving...' : 'Save')}
    </button>
    <button className="btn btn-danger" onClick={closeModal}>
      Close
    </button>
  </Modal.Footer>
</Modal>
</>
  );
};

export default TransferNotification;