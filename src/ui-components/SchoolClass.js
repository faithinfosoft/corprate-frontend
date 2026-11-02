import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Breadcum from './Breadcum.js';
import Modal from 'react-bootstrap/Modal';
import { Button, Form } from 'react-bootstrap';  
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";
import NoDataFound from './NoDataFound';
import useAuth from '../utilities/useAuth';

const SchoolClass = () => {
  const auth = useAuth();
  const username = auth.user.username;
  const [schoolTypes, setSchoolTypes] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [createdClasses, setCreatedClasses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'School Class', Link: '' },
  ]);

  useEffect(() => {
    fetchSchoolTypes();
  }, []);

  const fetchSchoolTypes = useCallback(async () => {
    try {
      const formData = { email: username };
      const response = await axios.post(`${globalVariables.api_url}/school/schooldetails_by_email`, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (response.data.status) {
        const classLevelName = response.data.data.class_level_name || "";
        
        setSchoolTypes([classLevelName]); // Push the entire value as a single element
        setActiveTab(classLevelName); // Set active tab to this value
      } else {
        print_toast("error", response.data.message || "Failed to fetch class levels");
      }}catch (error) {
      console.error('Error fetching class levels:', error);
      print_toast("error", "Failed to fetch class levels");
    }
  }, [username]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await axios.post(`${globalVariables.api_url}/school/get_classes`, {
        username: username,
        //schoolType: activeTab
      });
      if (response.data.status) {
        console.log('Fetched classes:', response.data.data);
        // Sort the classes by class_id in ascending order
        const sortedClasses = response.data.data.sort((a, b) => a.class_id - b.class_id);
        setCreatedClasses(sortedClasses);
        // Update selectedClasses with class_id from the fetched data
        const fetchedClassIds = sortedClasses.map(cls => cls.class_id.toString());
        console.log('Setting selectedClasses to:', fetchedClassIds);
        setSelectedClasses(fetchedClassIds);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoaded(true);
      print_toast("error", "Failed to fetch classes: " + (error.response?.data?.message || error.message));
    }
  }, [username, activeTab]);

  useEffect(() => {
    if (activeTab) {
      fetchClasses();
    }
  }, [activeTab, fetchClasses]);

  const handleTabClick = (type) => {
    setActiveTab(type);
  };

  const handleCreateClass = () => {
    console.log('Opening modal with selectedClasses:', selectedClasses);
    setShowCreateModal(true);
  };

  const handleSaveClasses = async () => {
    console.log('Saving classes:', selectedClasses);
    try {
      const response = await axios.post(`${globalVariables.api_url}/school/save_classes`, {
        username,
        schoolType: activeTab,
        classes: selectedClasses
      });
      if (response.data.status) {
        setShowCreateModal(false);
        fetchClasses();
        print_toast("success", "Classes saved successfully");
      }
    } catch (error) {
      console.error('Error saving classes:', error);
      print_toast("error", "Failed to save classes");
    }
  };

  const handleDeleteAllClasses = async (schoolType) => {
    if (window.confirm('Are you sure you want to delete all classes for this class level?')) {
      try {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('schoolType', schoolType);
        
        const response = await axios.post(
          `${globalVariables.api_url}/school/delete_all_classes`, 
          formData, 
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        // Check for success status in the response
        if (response.data.status === 'success') {
          fetchClasses();
          print_toast("success", response.data.message || "All classes deleted successfully");
        } else {
          // Handle the case where the request succeeded but the operation failed
          print_toast("error", response.data.message || "Failed to delete all classes");
        }
      } catch (error) {
        console.error('Error deleting all classes:', error);
        
        // Display the error message from the API if available
        const errorMessage = error.response?.data?.message || "Failed to delete all classes";
        print_toast("error", errorMessage);
      }
    }
  };
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Select all checkboxes
      const allClasses = getClassRange().map(classObj => classObj.class_id.toString());
      setSelectedClasses(allClasses);
    } else {
      // Deselect all checkboxes
      setSelectedClasses([]);
    }
  };

  const handleCheckboxChange = (classId) => {
    console.log('Checkbox changed for classId:', classId);
    setSelectedClasses(prev => {
      const newSelection = prev.includes(classId.toString())
        ? prev.filter(id => id !== classId.toString())
        : [...prev, classId.toString()];
      console.log('New selectedClasses:', newSelection);
      return newSelection;
    });
  };

  const getClassRange = () => {
    return [
      { class_id: 1, class_name: 'I' },
      { class_id: 2, class_name: 'II' },
      { class_id: 3, class_name: 'III' },
      { class_id: 4, class_name: 'IV' },
      { class_id: 5, class_name: 'V' },
      { class_id: 6, class_name: 'VI' },
      { class_id: 7, class_name: 'VII' },
      { class_id: 8, class_name: 'VIII' },
      { class_id: 9, class_name: 'IX' },
      { class_id: 10, class_name: 'X' },
      { class_id: 11, class_name: 'XI' },
      { class_id: 12, class_name: 'XII' },
    ];
  };

  return (
    <div>
      <Breadcum items={breadcum} title="School Class Management" />

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
        <div className="nav-wrapper w-100 mb-2 mb-md-0">
        <ul className="nav nav-tabs flex-nowrap">
            {schoolTypes.map(type => (
              <li className="nav-item" key={type}>
                <a
                  className={`nav-link ${activeTab === type ? 'active' : ''}`}
                  onClick={() => handleTabClick(type)}
                  href={`#${type}`}
                >
                  {type}
                </a>
              </li>
            ))}
          </ul>
          </div>
      
       
        </div>

        <div className="card-body">
          <div className="tab-content mt-3">
          {schoolTypes.map(type => (
            <div className={`tab-pane fade ${activeTab === type ? 'show active' : ''}`} id={type} key={type}>
              
              {/* {createdClasses.length > 0 && ( */}
             <div className="d-flex align-items-center justify-content-end mb-3">
                  {/* <h4 style={{ fontWeight: 'bold' }}>{type} Classes</h4> */}
                  <Button variant="primary" size="sm" onClick={handleCreateClass} className="me-2">
            {createdClasses.length === 0 ? 'Create Class' : 'Edit Classes'}
          </Button>
          {createdClasses.length > 0 && (
                  <Button variant="danger" size="sm" onClick={() => handleDeleteAllClasses(type)}>
                    Delete All Classes
                  </Button>)}
                </div>
              {/* )} */}
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className='text-center'>Sl No.</th>
                      <th scope="col" className='text-center'>Class Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && createdClasses.length === 0 ? (
                      <tr>
                        <td colSpan="2">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      createdClasses.map((cls, index) => (
                        <tr key={cls.school_class_id}>
                          <td className='text-center'>{index + 1}</td>
                          <td className='text-center'>{cls.class_name}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {createdClasses.length === 0 ? `Create Classes for ${activeTab}` : `Edit Classes for ${activeTab}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Check 
              type="checkbox"
              id="select-all"
              label="Select All"
              checked={selectedClasses.length === getClassRange().length}
              onChange={handleSelectAll}
            />

            {getClassRange().map(classObj => (
              <Form.Check 
                type="checkbox"
                id={`class-${classObj.class_id}`}
                label={`Class ${classObj.class_name}`}
                checked={selectedClasses.includes(classObj.class_id.toString())}
                onChange={() => handleCheckboxChange(classObj.class_id)}
                key={classObj.class_id}
              />
            ))}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="btn btn-success me-2" onClick={handleSaveClasses}>Save Changes</Button>
          <Button variant="btn btn-danger" onClick={() => setShowCreateModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchoolClass;