import React, { useState, useEffect } from 'react';
import SecureLink from './SecureLink';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Modal from 'react-bootstrap/Modal';
import Multiselect from 'multiselect-react-dropdown';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import useAuth from '../utilities/useAuth.js';

const SchoolNotification = () => {
  const auth = useAuth();
  const username = auth.user.username;

  const [notifications, setNotifications] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentFileName, setCurrentFileName] = useState(null);
  const [receiverModalIsOpen, setReceiverModalIsOpen] = useState(false);
  const [currentReceivers, setCurrentReceivers] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [allStaffSelected, setAllStaffSelected] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null,
    receivers: []
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchStaff();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/schoolnotification/view_school_notifications`, { params: { username } });

      const sortedNotifications = response.data.data.sort((a, b) => {
        const dateComparison = new Date(b.posted_date) - new Date(a.posted_date);
        if (dateComparison === 0) {
          return b.notification_id - a.notification_id;
        }
        return dateComparison;
      });

      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      print_toast("error", "Failed to fetch notifications");
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/schoolnotification/get_school_staff`, { 
        params: { username } 
      });
  
      // Check if the request was successful and data exists
      if (response.data.status && response.data.data) {
        const staffOptions = response.data.data.map(staff => ({
          value: staff.staff_id,
          label: staff.staff_official_name
        }));
        setStaff(staffOptions);
      } else {
        // Handle case when no staff members are found
        console.warn('No staff found:', response.data.message);
        print_toast("warning", response.data.message || "No staff found");
        setStaff([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      print_toast("error", "Failed to fetch staff");
      setStaff([]);
    }
  };
  

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'file' ? files[0] : value
    }));
    setErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
  };

  const handleDescriptionChange = (event, editor) => {
    const data = editor.getData();
    setFormData(prevState => ({
      ...prevState,
      description: data
    }));
    setErrors(prevErrors => ({ ...prevErrors, description: '' }));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    new Date(notification.posted_date).toLocaleDateString().includes(searchTerm)
  );

  const handleStaffChange = (selectedList, selectedItem) => {
    if (selectedItem.value === 'all') {
      handleSelectAll(!allStaffSelected);
    } else {
      const updatedStaff = selectedList.filter(item => item.value !== 'all');
      setSelectedStaff(updatedStaff);
      setFormData(prevState => ({
        ...prevState,
        receivers: updatedStaff.map(staff => staff.value)
      }));
      setErrors(prevErrors => ({ ...prevErrors, receivers: '' }));
      setAllStaffSelected(updatedStaff.length === staff.length);
    }
  };

  const handleSelectAll = (isSelect) => {
    if (isSelect) {
      const allStaffOptions = staff.map(s => ({ label: s.label, value: s.value }));
      setSelectedStaff(allStaffOptions);
      setFormData(prevState => ({
        ...prevState,
        receivers: staff.map(s => s.value)
      }));
    } else {
      setSelectedStaff([]);
      setFormData(prevState => ({
        ...prevState,
        receivers: []
      }));
    }
    setAllStaffSelected(isSelect);
    setErrors(prevErrors => ({ ...prevErrors, receivers: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.receivers.length === 0) newErrors.receivers = 'At least one receiver is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append('title', formData.title);
      dataToSend.append('description', formData.description);
      dataToSend.append('username', username);
      
      // Ensure all selected receivers are included
      const receiversToSend = allStaffSelected ? staff.map(s => s.value) : formData.receivers;
      receiversToSend.forEach(id => dataToSend.append('receivers[]', id));

      if (formData.file) {
        dataToSend.append('file', formData.file);
      }

      let response;
      if (editingId) {
        response = await axios.post(
          `${globalVariables.api_url}/schoolnotification/update_school_notification/${editingId}`,
          dataToSend
        );
        print_toast("success", "Notification updated successfully");
      } else {
        response = await axios.post(`${globalVariables.api_url}/schoolnotification/save_school_notification`, dataToSend);
        print_toast("success", "Notification created successfully");
      }

      setModalIsOpen(false);
      fetchNotifications();
      resetForm();
    } catch (error) {
      console.error('Error submitting notification:', error);
      print_toast("error", "Failed to submit notification");
    } finally {
      setIsLoading(false);
    }
  };

  const checkAllStaffSelected = (selectedReceivers) => {
    const allStaffIds = staff.map(s => s.value);
    return allStaffIds.every(id => selectedReceivers.includes(id));
  };

  const handleEdit = (notification) => {
    setEditingId(notification.notification_id);
    const selectedReceivers = notification.receivers.split(', ').map(staffName => {
      const staffOption = staff.find(s => s.label === staffName);
      return staffOption ? staffOption.value : null;
    }).filter(Boolean);

    const formData = {
      title: notification.title,
      description: notification.description,
      receivers: selectedReceivers
    };

    setFormData(formData);
    
    const selectedStaffOptions = staff.filter(s => selectedReceivers.includes(s.value));
    const isAllSelected = checkAllStaffSelected(selectedReceivers);

    setSelectedStaff(isAllSelected ? [{ label: 'Select All', value: 'all' }, ...selectedStaffOptions] : selectedStaffOptions);
    setAllStaffSelected(isAllSelected);
    setCurrentFileName(notification.file_path);
    setModalIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await axios.delete(`${globalVariables.api_url}/schoolnotification/delete_school_notification/${id}`);
        print_toast("success", "Notification deleted successfully");
        fetchNotifications();
      } catch (error) {
        console.error('Error deleting notification:', error);
        print_toast("error", "Failed to delete notification");
      }
    }
  };

  const ReceiverModal = ({ show, onHide, receivers }) => (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Receivers</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul>
          {receivers.split(', ').map((receiver, index) => (
            <li key={index}>{receiver}</li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      file: null,
      receivers: []
    });
    setSelectedStaff([]);
    setEditingId(null);
    setErrors({});
    setCurrentFileName(null);
    const fileInput = document.getElementById('file');
    if (fileInput) fileInput.value = '';
  };


  const handleCancel = () => {
    setModalIsOpen(false);
    resetForm();
  };

  const sanitizeHtml = (html) => {
    const allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'a', 'span', 'div'
    ];
    const allowedAttributes = ['href', 'src', 'alt', 'style', 'class'];

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const sanitized = doc.body.innerHTML.replace(/<([^>]+)>/g, (match, tag) => {
      const tagName = tag.split(' ')[0];
      if (!allowedTags.includes(tagName)) return '';

      if (tag.includes(' ')) {
        const attrs = tag.split(' ').slice(1).join(' ');
        const sanitizedAttrs = attrs.replace(/(\w+)(?:=(?:["'](?:\\.|[^"])*["']|[^"'\s]*))?/g, (attrMatch, attrName) => {
          return allowedAttributes.includes(attrName) ? attrMatch : '';
        });
        return `<${tagName} ${sanitizedAttrs}>`;
      }

      return match;
    });

    return { __html: sanitized };
  };

  const capitalizeFirstLetter = (string) => {
    return string.replace(/<p[^>]*>(.*?)<\/p>/g, (match, p1) => 
      `<p>${p1.charAt(0).toUpperCase() + p1.slice(1)}</p>`
    );
  };

  const columns = [
    { 
      name: <strong>Sl No.</strong>,
      selector: (row, index) => index + 1, 
      sortable: true
    },
    { 
      name: <strong>Title</strong>,
      selector: row => capitalizeFirstLetter(row.title),
      sortable: true
    },
    { 
      name: <strong>Description</strong>,
      cell: row => (
        <div 
        dangerouslySetInnerHTML={sanitizeHtml(capitalizeFirstLetter(row.description))}
          style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}
        />
      ),
      sortable: true
    },
    { 
      name: <strong>Document</strong>,
      cell: row => row.file_path ? 
        <SecureLink href={row.file_url} target="_blank" rel="noopener noreferrer" className='text-dark'>
          View Document
        </SecureLink> 
        : 'No Document'
    },
    { 
      name: <strong>Receiver</strong>,
      cell: row => (
        <button onClick={() => {
          setCurrentReceivers(row.receivers);
          setReceiverModalIsOpen(true);
        }}>
          See Details
        </button>
      )
    },
    {
      name: <strong>Posted Date</strong>,
      selector: row => row.posted_date,
      sortable: true,
      format: row => new Date(row.posted_date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    },
    
    {
      name: <strong>Actions</strong>,
      cell: row => (
        <div className="dropdown">
          <button className="btn btn-dark dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
            Action
          </button>
          <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <li><a href="#" className="dropdown-item" onClick={() => handleEdit(row)}>Edit</a></li>
            <li><a href="#" className="dropdown-item" onClick={() => handleDelete(row.notification_id)}>Delete</a></li>
          </ul>
        </div>
      )
    }
  ];
  
  return (
    <>
      <Breadcum items={[{ Title: 'Home', Link: '/' }, { Title: 'School Notifications', Link: '' }]} title="School Notifications" />

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title">School Notifications</h5>
          <button className="btn btn-primary" onClick={() => { resetForm(); setModalIsOpen(true); }}>
            Add Notification
          </button>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-end mb-3">
            <input
              type="text"
              className="form-control w-25"
              placeholder="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <DataTable
            columns={columns}
            data={filteredNotifications}
            pagination
            responsive
          />
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={handleCancel} size="lg" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Notification' : 'Add Notification'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title<span className="text-danger">*</span></label>
              <input 
                type="text" 
                className="form-control"
                id="title" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
              />
              {errors.title && <div className="text-danger">{errors.title}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description<span className="text-danger">*</span></label>
              <CKEditor
                editor={ClassicEditor}
                data={formData.description}
                onChange={handleDescriptionChange}
              />
              {errors.description && <div className="text-danger">{errors.description}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="file" className="form-label">PDF File (Optional)</label>
              {currentFileName && <p>Current file: {currentFileName}</p>}
              <input type="file" className="form-control" id="file" name="file" onChange={handleChange} accept=".pdf" />
            </div>

            <div className="mb-3">
              <label className="form-label">Send To:<span className="text-danger">*</span></label>
              <Multiselect
                options={[{ label: 'Select All', value: 'all' }, ...staff]}
                selectedValues={selectedStaff}
                onSelect={handleStaffChange}
                onRemove={handleStaffChange}
                displayValue="label"
                showCheckbox={true}
                placeholder="Select Staff"
                hidePlaceholder={true}
                closeOnSelect={false}
                avoidHighlightFirstOption={true}
                showArrow={true}
              />
              {errors.receivers && <div className="text-danger">{errors.receivers}</div>}
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-success me-2" disabled={isLoading}>
                {isLoading ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update' : 'Create')}
              </button>
              <button type="button" className="btn btn-danger" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={receiverModalIsOpen} onHide={() => setReceiverModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Receivers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{currentReceivers}</p>
        </Modal.Body>
      </Modal>

      <ReceiverModal 
        show={receiverModalIsOpen} 
        onHide={() => setReceiverModalIsOpen(false)} 
        receivers={currentReceivers}
      />
    </>
  );
};

export default SchoolNotification;