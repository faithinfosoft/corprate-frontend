import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import { Link } from 'react-router-dom';
import { Form, Button, Row, Col } from 'react-bootstrap';
import DataTable from "react-data-table-component";
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper from './ImageCropper';
import photo from "../assets/ui-master/img/no_image_uploaded.jpg";
import { Spinner } from "react-bootstrap";
import useAuth from '../utilities/useAuth';
import Cookies from 'js-cookie';

const School = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [schools, setSchools] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // const [parishes, setParishes] = useState([]);
  // const [convents, setConvents] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [showTable, setShowTable] = useState(false);
  const dataTableRef = useRef(null);
  const [congregations, setCongregations] = useState([]);
  const [treasury, setTreasury] = useState([]);
  const [classlevels, setClasslevels] = useState([]);
  const [convents, setConvents] = useState([]);
  const [selectedCongregation, setSelectedCongregation] = useState('');
  const [selectedConvent, setSelectedConvent] = useState('');
  const [loadingCongregation, setLoadingCongregation] = useState(false);
  const [loadingZone, setLoadingZone] = useState(false);
  const [loadingConvent, setLoadingConvent] = useState(false);


  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'School Details', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    school_code: '',
    school_name: '',
    location: '',
    address: '',
    email: '',
    phone: '',
    district: '',
    fk_zone_id: '', 
    fk_parish_covent_id: '', 
    lp_established_year: '', 
    up_established_year: '',  
    hs_established_year: '',  
    hse_established_year: '',  
    school_gender_type: '',  
    school_type: '',  
    fk_treasury_id: '',  
    fk_class_level_id: '',  
    dept_type: '',  
    password: '',  
    school_category:'',
    pin_no: '',
    post_office: '',
    save_flag: false,  
    photo: null,  
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Add this handler to track page changes
  const handlePageChange = page => {
    setCurrentPage(page);
  };
  
  // Add this handler to track rows per page changes
  const handlePerRowsChange = (newRowsPerPage, page) => {
    setRowsPerPage(newRowsPerPage);
  };
  
  const [formError, setFormError] = useState({});
const [cropModalIsOpen, setCropModalIsOpen] = useState(false);
const avatarUrl = useRef(photo);
const fileInputRef = useRef(null);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [zones, setZones] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [foranes, setForanes] = useState([]);
  const [selectedForane, setSelectedForane] = useState('');
  const [parishesConvents, setParishesConvents] = useState([]);
  const [congregationConvents, setcongregationConvents] = useState([]);
  //const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [secondaryOptions, setSecondaryOptions] = useState([]);
  const [deoOptions, setDeoOptions] = useState([]);
  const [aeoOptions, setAeoOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState({ dept_id: null, dept_type: "" });
  const [deptDetails, setDeptDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const fieldNames = {
    school_code: 'School Code',
    school_name: 'School Name',
    location: 'Location',
    address: 'Address',
    email: 'Email',
    phone: 'Phone',
    district: 'District',
    fk_zone_id: 'Zone',
    fk_parish_covent_id: 'Parish/Convent',
    established_year: 'Established Year',
    school_gender_type: 'School Gender Type',
    password: 'Password'
  };

  useEffect(() => {
    fetchSchools();
    fetchZones();
    fetchDistricts();
  }, []);

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/;

  
    // Basic field validations
    if (!formData.school_code) {
      errors.school_code = 'School code is required.';
    }
  
    if (!formData.school_name) {
      errors.school_name = 'School name is required.';
    } else if (formData.school_name.length < 3 || formData.school_name.length > 200) {
      errors.school_name = 'School name must be between 3 and 200 characters.';
    }
  
    if (!formData.location) {
      errors.location = 'Location is required.';
    } else if (formData.location.length < 3 || formData.location.length > 200) {
      errors.location = 'Location must be between 3 and 200 characters.';
    }
  
   
  
    if (!formData.email) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
  
    if (!formData.phone) {
      errors.phone = 'Phone number is required.';
    } 
    /*else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits.';
    }*/
  
    if (!formData.district) {
      errors.district = 'District is required.';
    }
  
    if (!formData.edu_dept) {
      errors.edu_dept = 'Department is required.';
    }
    if (!formData.photo) {
      errors.photo = 'photo is required.';
    }
    if (!formData.fk_zone_id) {
      errors.fk_zone_id = 'Zone is required.';
    }

    if (!formData.class_levels) {
      errors.class_levels = 'Class Level is required.';
    }
  
    // Type-specific validations
    if (!selectedType) {
      errors.type = 'Please select either Parish or Convent';
    } else if (selectedType === 'parish') {
      if (!selectedForane) {
        errors.forane_id = 'Please select a Forane';
      }
      if (selectedForane && !formData.fk_parish_covent_id) {
        errors.fk_parish_covent_id = 'Please select a Parish';
      }
    } else if (selectedType === 'convent') {
      if (!formData.fk_parish_covent_id) {
        errors.fk_parish_covent_id = 'Please select a Convent';
      }
    }
  

  
    if (!formData.school_gender_type) {
      errors.school_gender_type = 'School gender type is required.';
    } else if (!['boys', 'girls', 'Co-education'].includes(formData.school_gender_type)) {
      errors.school_gender_type = 'Invalid school gender type selected.';
    }
  

    // const hasSelectedType = formData.lp || formData.up || formData.hs || formData.hse;
    // if (!hasSelectedType) {
    //   errors.school_type = 'At least one school type must be selected.';
    // }

    const hasSelectedDept  = formData.aeo || formData.deo || formData.dde || formData.rdd;
    if (!hasSelectedDept ) {
      errors.department  = 'At least one department must be selected.';
    }

  
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Password must be at least 6 characters long and contain at least one letter and one number.';
    }
    
  
    return errors;
  };

  const fetchAllTreasury = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/treasury/view_treasury`);
      
      if (response.data.status) {
        setTreasury(response.data.data); 
      } else {
        setTreasury([]);
      }
    } catch (error) {
      console.error('Error fetching treasuries:', error.message);
    }
  
   };
   useEffect(() => {
    fetchAllTreasury();
  }, []);




 const fetchClasslevels = async () => {
  try {
    const response = await axios.get(`${globalVariables.api_url}/class-strength/get_classs_levels`);
    
    if (response.data.status) {
      setClasslevels(response.data.data); 
    } else {
      setClasslevels([]);
    }
  } catch (error) {
    console.error('Error fetching classes:', error.message);
  }

 };
 useEffect(() => {
  fetchClasslevels();
}, []);


const handleRowClick = (row) => {
     
  // Set selectedDept first, then show modal
  setSelectedDept({ dept_id: row.dept_id, dept_type: row.dept_type });
  setShowModal(true); // Open the modal after updating the state
};

useEffect(() => {
  console.log("useEffect triggered");
  console.log("showModal:", showModal);
console.log("selectedDept:", selectedDept);
  if (showModal && selectedDept?.dept_id) {
    fetchDeptDetails(selectedDept.dept_id, selectedDept.dept_type);
  }
}, [showModal, selectedDept]); // Make sure the effect triggers when either showModal or selectedDept changes

const fetchDeptDetails = async (dept_id, dept_type) => {
  if (!dept_id) return; // Prevent unnecessary API calls if dept_id is not available
  setLoading(true);
  setDeptDetails(null);

  try {
    console.log("Fetching details for:", dept_id, dept_type); // Debug log to see the request
    const response = await axios.get(
      `${globalVariables.api_url}/education-department/view_education_department_details?dept_id=${dept_id}&dept_type=${dept_type}`
    );

    console.log("API Response:", response.data); // Log API response
    setDeptDetails(response.data.data[0]);
  } catch (error) {
    console.error("Error fetching department details:", error);
  } finally {
    setLoading(false);
  }
};


  const fetchSchools = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/view_schools`);
      if (response.data.status) {
        setTableData(response.data.data);
      setShowTable(true);
       // setSchools(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch School data");
    }
  };
  const capitalizeWords = (str) => {
    if (!str) {
      return ""; // Return an empty string if the input is null, undefined, or falsy
    }
    return str.toUpperCase(); // Convert the entire string to uppercase
  };


  const handleSchoolLogin = async (email) => {
    try {

      const params = new URLSearchParams();
      params.append('pid', email);
    
      const response = await axios.post(
        `${globalVariables.api_url}/login/user_login`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );



      //const response = await axios.get(`${globalVariables.api_url}/login/user_login?pid=${email}`);
   
      if (response.data.status === true) {
      
        const token = response.data.token;
        Cookies.set('token', token, { sameSite: 'None', secure: true });
        
       
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
   
        const newTab = window.open('/school-dashboard', '_blank');
    
        if (newTab) {
         
          newTab.onload = () => {
         
            newTab.postMessage({ 
              type: 'AUTH_USER', 
              payload: { user: response.data.user, token } 
            }, window.location.origin);
          };
        }
      } else {
        print_toast("error", response.data.message || "School login failed");
        console.error("School login failed:", response.data.message);
      }
    } catch (error) {
      print_toast("error", "An error occurred during school login");
      console.error("School login error:", error);
    }
  };

  
  const handleDeleteSchool = async (school_id) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      try {
        const formData = new FormData();
        formData.append('school_id', school_id);
        const response = await axios.post(`${globalVariables.api_url}/school/schooldetails/delete`, formData);
        
        if (response.data.status) {
          print_toast("success", response.data.message);
          fetchSchools();
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error('Error deleting school:', error);
        print_toast("error", "An error occurred while deleting the school");
      }
    }
  };

  const columns = [

    // {
    //   name: "Actions",
    //   minWidth: '140px',
    //   cell: (row) => (
    //     <div className='parish_buttons' style={{ textAlign: 'center' }}>
    //       <button 
    //         onClick={() => handleSchoolLogin(row.email)}
    //         className="btn btn-primary btn-sm mt-10 float-end"  target="_blank" 
    //       >
    //         School
    //       </button>
    //     </div>
    //   )
    // },

   // Column definition for Actions


   
    {
      name: "Sl No.",
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      minWidth: '100px'
    },

    { name: "School Code", selector: (row) => row.school_code, sortable: true, minWidth: '140px' },
    // {
    //   name: "School Name",
    //   selector: (row) => (
    //     <a 
    //       href={`/schooldetails/${row.school_id}`} 
    //       className="nav-link reports" 
    //       style={{ color: 'blue', textDecoration: 'none' }} 
    //       target="_blank" 
    //       rel="noopener noreferrer"
    //     >
    //       {row.location} {row.school_name}
    //     </a>
    //   ),
    //   sortable: true,
    //   minWidth: '340px'
    // },

    {
      name: "School",
     minWidth: '340px',
     sortable: true,
      cell: (row) => (
        <div className='text-dark' style={{ textAlign: 'center' }}>
          <a   
          style={{ color: 'blue', textDecoration: 'none' }} 
            href="#"
            className="dropdown-item nav-link reports"
            onClick={(e) => {
              e.preventDefault(); // Prevent default link behavior
              handleSchoolLogin(row.email);
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {row.location} {row.school_name}
          </a>
        </div>
      )
    },
    
   
    { name: "Class Levels", selector: (row) => row.class_level_name, sortable: true, minWidth: '150px' },
    { name: "Edu. Department", selector: (row) => capitalizeWords(row.dept_type), sortable: true, minWidth: '170px' ,},
    { name: "Edu. Office", selector: (row) => row.office_name, sortable: true, minWidth: '180px',cell: (row) => (
      <button className="btn" onClick={() => handleRowClick(row)} style={{ color: '#3081d2', textDecoration: 'none' }}>
        {row.office_name}
      </button>
    ), },    // { name: "Location", selector: (row) => row.location, sortable: true, minWidth: '270px' },
    { name: "Email", selector: (row) => row.email, sortable: true, minWidth: '250px' },
    { name: "Phone", selector: (row) => row.phone, sortable: true, minWidth: '170px' },
    ...(auth.user?.user_type === 'corporate_admin' ? [{
      name: "Actions",
      minWidth: '100px',
      cell: (row) => (
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDeleteSchool(row.school_id)}
          title="Delete"
        >
          <i className="bi bi-trash"></i>
        </button>
      )
    }] : [])
  ];

  const handleSearch = (event) => {
    setSearchText(event.target.value);
  };

  // const filteredData = tableData.filter(item =>
  //   Object.values(item).some(val =>
  //     val.toString().toLowerCase().includes(searchText.toLowerCase())
  //   )
  // );

  const filteredData = tableData.filter(tdata =>
    (tdata.school_code || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (tdata.school_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (tdata.location || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (tdata.class_level_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (tdata.dept_type || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (tdata.phone || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (tdata.email || '').toLowerCase().includes(searchText.toLowerCase())
  );
  const fetchZones = async () => {
    setLoadingZone(true);  // Start loading
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_zones`);
      
      if (response.data.status) {
        setZones(response.data.data); // Update zones data
      } else {
        setZones([]); // Handle empty data
      }
    } catch (error) {
      console.error('Error fetching zones:', error.message);
    } finally {
      setLoadingZone(false); // End loading
    }
  };
  
  
  

  const fetchDistricts = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_districts`);
      
      if (response.data.status) {
        setDistricts(response.data.data); // Access the array from the response
      } else {
        setDistricts([]); // Handle the case where no districts are found
      }
    } catch (error) {
      console.error('Error fetching districts:', error.message);
    }
  };
  
  
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    const updatedValue = (name === 'school_name' || name === 'location') ? value.toUpperCase() : value;
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: updatedValue, // Set the selected value
    }));
  
    // Remove any form error for this field
    setFormError((prevError) => {
      const newErrors = { ...prevError };
      delete newErrors[name];
      return newErrors;
    });
  };
  
  
  
  
  
  const handleChange123 = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  
    // Clear the specific field error
    setFormError(prevError => {
      const newErrors = { ...prevError };
      
      // If this is a checkbox for school type (lp, up, hs, hse)
      if (['lp', 'up', 'hs', 'hse'].includes(name)) {
        // Check if at least one checkbox will be checked after this change
        const willHaveChecked = ['lp', 'up', 'hs', 'hse'].some(type => {
          if (type === name) {
            return checked; // Use the new value for the changed checkbox
          }
          return formData[type]; // Use existing values for other checkboxes
        });
        
        // If at least one will be checked, remove the school_type error
        if (willHaveChecked) {
          delete newErrors.school_type;
        }
      } else {
        // For non-checkbox fields, just delete their specific error
        delete newErrors[name];
      }
      
      return newErrors;
    });
  };

  // const handleFileChange = (e) => {
  //   setFormData(prevData => ({ ...prevData, photo: e.target.files[0] }));
  // };

  // const handlePhotoChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setFormData({
  //       ...formData,
  //       photo: file
  //     });
  //     setPhotoPreview(URL.createObjectURL(file)); // Set the preview
  //   }
  // };






  const handleTypeChange = async (e) => { 
    const type = e.target.value;
    setSelectedType(type);
    setSelectedForane(''); 
    setFormData(prevData => ({ ...prevData, fk_parish_covent_id: '' })); 
  
    // Clear the type error when a selection is made
    setFormError(prevError => {
      const newErrors = { ...prevError };
      delete newErrors.type;
      return newErrors;
    });
  
    if (type === 'parish') {
      try {
        const response = await axios.get(`${globalVariables.api_url}/forane/view_forane`);
        setForanes(response.data.data);
      } catch (error) {
        console.error('Error fetching foranes:', error.message);
      }
    } else if (type === 'convent') {
      setCongregations([]);  // Clear previous data if the type changes
      setSelectedCongregation('');  // Clear selected congregation
      setConvents([]);  // Clear convents list
  
      // Call the API to get congregations
      try {
        const response = await axios.get(`${globalVariables.api_url}/congregation/get_congregation`);
        setCongregations(response.data.data); // Assuming the response contains the list of congregations
      } catch (error) {
        console.error('Error fetching congregations:', error.message);
      }
    }
  };
  

  const handleForaneChange = async (e) => {
    const foraneId = e.target.value;
    setSelectedForane(foraneId);
    fetchParishesConvents('parish', foraneId);
  };



  
  


  const handleCongregationChange = async (e) => {
    const congregationId = e.target.value;
    setSelectedCongregation(congregationId);
    fetchCongregationConvents('convent', congregationId);
  };





  const fetchParishesConvents = async (type, foraneId = '') => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_parishes_convents`, {
        params: { type, forane_id: foraneId }
      });
      
      // Assuming response.data is structured as: { status, message, data }
      if (response.data.status) {
        setParishesConvents(response.data.data); // Set only the data array
      } else {
        setParishesConvents([]); // Set an empty array if no data is found
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching parishes/convents:', error.message);
    }
  };



  const fetchCongregationConvents = async (type, congregationId = '') => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/getConvents`, {
        params: { type, congregation_id: congregationId }
      });
      
      if (response.data.status) {
        setcongregationConvents(response.data.data); 
      } else {
        setcongregationConvents([]); 
        console.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching convents:', error.message);
    }
  };
  

 // Frontend changes
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData(prevState => ({
      ...prevState,
      photo: file
    }));
    setPhotoPreview(URL.createObjectURL(file));
    setFormError(prevErrors => ({
      ...prevErrors,
      photo: ''
    }));
    setCropModalIsOpen(true);
  }
};

const updateAvatar = (imgSrc, file) => {
  avatarUrl.current = imgSrc;
  // Store the base64 image
  setFormData(prevState => ({
    ...prevState,
    photo: imgSrc // Store the base64 string directly
  }));
  setCropModalIsOpen(false);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  
  // const errors = validateForm();

  // if (Object.keys(errors).length > 0) {
  //   setFormError(errors); 
  //   return; 
  // }

  setIsSaving(true);

  try {
    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    if (selectedType) {
      formDataToSend.append("school_category", selectedType);
    }

    const response = await axios.post(
      `${globalVariables.api_url}/school/save_school`,
      formDataToSend,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (response.data.status) {
      await fetchSchools();
      setModalIsOpen(false);
      clearSchoolForm();
      print_toast("success", response.data.message);
    } else {
      print_toast("error", response.data.message);
      setFormError(response.data.error || {});
    }
  } catch (error) {
    console.error("Error saving School:", error.message);
    print_toast("error", "Failed to save School");
    setFormError({ general: "An error occurred. Please try again." });
  } finally {
    setIsSaving(false);
  }
};

const handleRefresh = async () => {
  setLoadingConvent(true); 
  setcongregationConvents([]); 
  try {
    const type = 'convent';
    await fetchCongregationConvents(type, selectedCongregation);
  } catch (error) {
    console.error('Error refreshing convents:', error.message);
  } finally {
    setLoadingConvent(false); 
  }
};


  const handleCloseModal = () => {
    setModalIsOpen(false);
    clearSchoolForm();
  };

  const handleOpenModal = () => {
    clearSchoolForm(); // Reset form and errors
    setModalIsOpen(true); // Open the modal
  };


  const handleRefreshCongregation = async () => {
  setCongregations([]);  
  setLoadingCongregation(true);  
  try {
    const response = await axios.get(`${globalVariables.api_url}/congregation/get_congregation`);
    if (response.data.status) {
      setCongregations(response.data.data);  
    } else {
      setCongregations([]);  
    }
  } catch (error) {
    console.error('Error fetching congregations:', error.message);
  } finally {
    setLoadingCongregation(false);  
  }
};

  

  const clearSchoolForm = () => {
    setFormData({
      school_code: '',
      school_name: '',
      location: '',
      address: '',
      email: '',
      phone: '',
      district: '',
      fk_zone_id: '',
      fk_parish_covent_id: '',
      established_year: '',
      school_gender_type: '',
      lp: false,
      up: false,
      hs: false,
      hse: false,
      photo: 'null',
      password: '',
      edu_dept:'',
      aeo: false,
      deo: false,
      dde: false,
      rdd: false,
    });
    setPhotoPreview(null);
    setFormError({});
    setSelectedType('');
    setSelectedForane('');
    avatarUrl.current = photo; // Reset the avatar URL to the default photo
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  // const indexOfLastItem = currentPage * itemsPerPage;
  // const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  // const currentItems = schools.slice(indexOfFirstItem, indexOfLastItem);

  // const paginate = (pageNumber) => setCurrentPage(pageNumber);
  

  const handleDepartmentChange = async (e) => {
    const selectedDepartment = e.target.value;
    console.log("Selected Department:", selectedDepartment);
    if (!formData.district) {
      alert("Please select the district first.");
      e.target.value = "";
      return; // Stop the function if district is not selected
    }
    // Reset the dropdowns when department changes
    setFormData((prevData) => ({
      ...prevData,
      dept_type: selectedDepartment,
      secondaryDropdown: "", // Clear the secondary dropdown value
      ddeDropdown: "", // Clear DDE dropdown value when changing department
      deoDropdown: "", // Clear DEO dropdown value when changing department
    }));
  
    // Clear the options for the dropdowns
    setSecondaryOptions([]);
    setDeoOptions([]);
  
    if (!selectedDepartment) return;
  
    try {
      let response1;
      let response2;
  
      if (selectedDepartment === "rdd" || selectedDepartment === "dde") {
        response1 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`, // Use backticks here
          { params: { dept_type: selectedDepartment, district: formData.district } }
        );
      } else if (selectedDepartment === "deo") {
        response1 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`, // Use backticks here too
          { params: { dept_type: "dde", district: formData.district } }
        );
      }
      
      else if (selectedDepartment === "aeo") {
        response1 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: 'dde', district: formData.district } } 
        );
        
      }
      const data1 = response1?.data?.data || [];
      const data2 = response2?.data?.data || [];
  
      setSecondaryOptions(data1); // Set the DDE or RDD options
      setDeoOptions(data2); // Set the DEO options if department is 'deo'
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleChangedeo = async (e) => {
    const { name, value } = e.target;
  
    // Update the form data
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  
    // Fetch DEO options if DDE value changes
    if (name === "ddeDropdown") {
      if (!value) {
        setDeoOptions([]); // Clear DEO options if no DDE is selected
        return;
      }
  
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_dde`,
          {
            params: { dept_type: "deo", dde_id: value },
          }
        );
  
        setDeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching DEO options:", error);
        setDeoOptions([]);
      }
    }
  };

  const handleChangeaeo = async (e) => {
    const { name, value } = e.target;
  
    // Update form data
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  
    // Fetch AEO options if DEO changes
    if (name === "deoDropdown") {
      if (!value) {
        setAeoOptions([]); // Clear AEO options if no DEO is selected
        return;
      }
  
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/education-department/get_aeo_options`,
          { params: { deo_id: value } }
        );
  
        setAeoOptions(response.data.data || []);
      } catch (error) {
        console.error("Error fetching AEO options:", error);
        setAeoOptions([]);
      }
    }
  };
  return (
    <>
      <Breadcum items={breadcum} title="School Details" />

      <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title">School Details</h5>
        <button className="btn btn-danger" onClick={handleOpenModal}>
          Add School
        </button>
      </div>
      <div className="card-body">
        <div className="d-flex justify-content-end mb-3">
          <input
            type="text"
            className="form-control w-25"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearch}
          />
        </div>

        <div className="table-container">
                {showTable ? (
                 <DataTable
                 className="custom-data-table"
                 columns={columns}
                 data={filteredData}
                 pagination
                 highlightOnHover
                 pointerOnHover
                 ref={dataTableRef}
                 noDataComponent="No data available"
                 onChangePage={handlePageChange}
                 onChangeRowsPerPage={handlePerRowsChange}
                 paginationDefaultPage={currentPage}
                 paginationPerPage={rowsPerPage}
               />
                ) : (
                  <div></div>
                )}
              </div>
 
      </div>
    </div>

    <Modal show={modalIsOpen} onHide={handleCloseModal} size="xxl"   backdrop="static">
  <Modal.Header closeButton>
    <Modal.Title>Add School</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6">
          {/* Column 1 */}
    <div className="mb-3 position-relative"> 
    <label htmlFor="fk_zone_id">
      Zone <span className="text-danger">*</span>
    </label>
    <select
      className="form-control"
      id="fk_zone_id"
      name="fk_zone_id"
      value={formData.fk_zone_id}
      onChange={handleChange}
    >
      <option value="">Select Zone</option>
      {zones.map(zone => (
        <option key={zone.zone_id} value={zone.zone_id}>{zone.zone_name}</option>
      ))}
    </select>

    {/* Refresh icon with spinner */}
    <i 
      className={`bi bi-arrow-clockwise position-absolute ${loadingZone ? 'spinning' : ''}`} 
      style={{ right: '50px', top: '70%', transform: 'translateY(-50%)', color: 'green', cursor: 'pointer' }} 
      onClick={fetchZones}
    >
      {loadingZone && (
        <div className="spinner-border text-primary position-absolute" style={{ top: '-5px', left: '-5px', width: '20px', height: '20px' }} />
      )}
    </i>

    {/* Plus icon */}
    <i 
      className="bi bi-plus-lg position-absolute" 
      style={{ right: '10px', top: '70%', transform: 'translateY(-50%)', color: 'red', cursor: 'pointer' }} 
      onClick={() => window.open(`${window.location.origin}/zone`, '_blank')}
    ></i>

    {formError.fk_zone_id && <div className="text-danger">{formError.fk_zone_id}</div>}
  </div>







          <div className="mb-3">
            <label htmlFor="district">District <span className="text-danger">*</span></label>
            <select
              className="form-control"
              id="district"
              name="district"
              value={formData.district || ""}
              onChange={handleChange}
            >
              <option value="">Select District</option>
              {districts.map((district, index) => (
                <option key={index} value={district}>{district}</option>
              ))}
            </select>
            {formError.district && <div className="text-danger">{formError.district}</div>}
          </div>

          
<div className="mb-3">
      <label htmlFor="dept_type">
        Education Department <span className="text-danger">*</span>
      </label>
      <select
        id="dept_type"
        className="form-control"
        name="dept_type"
        value={formData.dept_type}
        onChange={handleDepartmentChange}
      >
        <option value="">Select Department</option>
        <option value="rdd">RDD</option>
        <option value="dde">DDE</option>
        <option value="deo">DEO</option>
        <option value="aeo">AEO</option>
      </select>
      {formError.department && (
        <div className="text-danger">{formError.department}</div>
      )}
    </div>

    {/* Conditionally render the secondary dropdown */}
    {["rdd", "dde"].includes(formData.dept_type) && (
      <div className="mb-3">
        <label htmlFor="secondary-dropdown">
          {formData.dept_type.toUpperCase()} Details{" "}
          <span className="text-danger">*</span>
        </label>
        <select
          id="secondary-dropdown"
          className="form-control"
          name="secondaryDropdown"
          value={formData.secondaryDropdown}
          onChange={handleChange}
        >
          <option value="">Select Option</option>
          {secondaryOptions.map((option) => (
            <option key={option.dept_id} value={option.dept_id}>
              {option.office_name}
            </option>
          ))}
        </select>
        {formError.secondaryDropdown && (
          <div className="text-danger">{formError.secondaryDropdown}</div>
        )}
      </div>
    )}

    {/* Conditionally render the DDE and DEO dropdowns */}
    {formData.dept_type === "deo" && (
  <div>
    {/* DDE Details Dropdown */}
    <div className="mb-3">
      <label htmlFor="dde-dropdown">
        DDE Details <span className="text-danger">*</span>
      </label>
      <select
        id="dde-dropdown"
        className="form-control"
        name="ddeDropdown"
        value={formData.ddeDropdown}
        onChange={handleChangedeo}
      >
        <option value="">Select DDE Option</option>
        {secondaryOptions.map((option) => (
          <option key={option.dept_id} value={option.dept_id}>
            {option.office_name}
          </option>
        ))}
      </select>
      {formError.ddeDropdown && (
        <div className="text-danger">{formError.ddeDropdown}</div>
      )}
    </div>

    {/* DEO Details Dropdown */}
    <div className="mb-3">
      <label htmlFor="deo-dropdown">
        DEO Details <span className="text-danger">*</span>
      </label>
      <select
        id="deo-dropdown"
        className="form-control"
        name="deoDropdown"
        value={formData.deoDropdown}
        onChange={handleChange}
      >
        <option value="">Select DEO Option</option>
        {deoOptions.map((option) => (
          <option key={option.dept_id} value={option.dept_id}>
            {option.office_name}
          </option>
        ))}
      </select>
      {formError.deoDropdown && (
        <div className="text-danger">{formError.deoDropdown}</div>
      )}
    </div>
  </div>
)}


    {/* Conditionally render the DDE and DEO dropdowns */}
 
{formData.dept_type === "aeo" && (
  <div>
    {/* DDE Details Dropdown */}
    <div className="mb-3">
      <label htmlFor="dde-dropdown">
        DDE Details <span className="text-danger">*</span>
      </label>
      <select
        id="dde-dropdown"
        className="form-control"
        name="ddeDropdown"
        value={formData.ddeDropdown}
        onChange={handleChangedeo} // Handle change for DDE dropdown
      >
        <option value="">Select DDE Option</option>
        {secondaryOptions.map((option) => (
          <option key={option.dept_id} value={option.dept_id}>
            {option.office_name}
          </option>
        ))}
      </select>
      {formError.ddeDropdown && (
        <div className="text-danger">{formError.ddeDropdown}</div>
      )}
    </div>

    {/* DEO Details Dropdown */}
    <div className="mb-3">
      <label htmlFor="deo-dropdown">
        DEO Details <span className="text-danger">*</span>
      </label>
      <select
        id="deo-dropdown"
        className="form-control"
        name="deoDropdown"
        value={formData.deoDropdown}
        onChange={handleChangeaeo} // Handle change for DEO dropdown
      >
        <option value="">Select DEO Option</option>
        {deoOptions.map((option) => (
          <option key={option.dept_id} value={option.dept_id}>
            {option.office_name}
          </option>
        ))}
      </select>
      {formError.deoDropdown && (
        <div className="text-danger">{formError.deoDropdown}</div>
      )}
    </div>

    {/* AEO Details Dropdown */}
    <div className="mb-3">
      <label htmlFor="aeo-dropdown">
        AEO Details <span className="text-danger">*</span>
      </label>
      <select
        id="aeo-dropdown" // Changed ID to avoid conflict with DEO dropdown
        className="form-control"
        name="aeoDropdown" // Updated name for clarity
        value={formData.aeoDropdown} // Updated to use the correct state
        onChange={handleChange} // Generic change handler for AEO
      >
        <option value="">Select AEO Option</option>
        {aeoOptions.map((option) => ( // Assuming `aeoOptions` holds the AEO data
          <option key={option.dept_id} value={option.dept_id}>
            {option.office_name}
          </option>
        ))}
      </select>
      {formError.aeoDropdown && (
        <div className="text-danger">{formError.aeoDropdown}</div>
      )}
    </div>
  </div>
)}

          <div className="mb-3">
  <label>Type <span className="text-danger">*</span></label>
  <div>
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        name="type"
        id="typeParish"
        value="parish"
        checked={selectedType === 'parish'}
        onChange={handleTypeChange}
      />
      <label className="form-check-label" htmlFor="typeParish">Parish</label>
    </div>
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        name="type"
        id="typeConvent"
        value="convent"
        checked={selectedType === 'convent'}
        onChange={handleTypeChange}
      />
      <label className="form-check-label" htmlFor="typeConvent">Convent</label>
    </div>
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        name="type"
        id="typegeneral"
        value="general"
        checked={selectedType === 'general'}
        onChange={handleTypeChange}
      />
      <label className="form-check-label" htmlFor="typeParish">General</label>
    </div>
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        name="type"
        id="typeprocurator"
        value="procurator"
        checked={selectedType === 'procurator'}
        onChange={handleTypeChange}
      />
      <label className="form-check-label" htmlFor="typeprocurator">Procurator</label>
    </div>
  </div>
  {formError.type && <div className="text-danger">{formError.type}</div>}
</div>





{selectedType !== 'general' && selectedType !== 'procurator' &&(
  <>
{selectedType === 'parish' && (
<div className="mb-3 position-relative">
<label htmlFor="forane_id">
  Forane <span className="text-danger">*</span>
</label>
<select
  className="form-control"
  id="forane_id"
  name="forane_id"
  value={selectedForane}
  onChange={handleForaneChange}
>
  <option value="">Select Forane</option>
  {foranes.map(forane => (
    <option key={forane.forane_id} value={forane.forane_id}>{forane.forane_name}</option>
  ))}
</select>
{formError.forane_id && <div className="text-danger">{formError.forane_id}</div>}
</div>
)}



{selectedType === 'parish' && selectedForane && (
 <div className="mb-3 position-relative">
  <label htmlFor="fk_parish_covent_id">
    Parish <span className="text-danger">*</span>
  </label>
  <select
    className="form-control"
    id="fk_parish_covent_id"
    name="fk_parish_covent_id"
    value={formData.fk_parish_covent_id}
    onChange={handleChange}
  >
    <option value="">Select Parish</option>
    {parishesConvents.map(parish => (
      <option key={parish.parish_id} value={parish.parish_id}>
        {parish.parish_name} , {parish.location}
      </option>
    ))}
  </select>
  {formError.fk_parish_covent_id && <div className="text-danger">{formError.fk_parish_covent_id}</div>}
</div>

          )}
          </>
        )}





          {selectedType === 'convent' && (
<div className="mb-3 position-relative">
  <label htmlFor="congregation_id">
    Congregation <span className="text-danger">*</span>
  </label>
  <select
    className="form-control"
    id="congregation_id"
    name="congregation_id"
    value={selectedCongregation}
    onChange={handleCongregationChange}
  >
    <option value="">Select Congregation</option>
    {congregations.map(congregation => (
      <option key={congregation.congregation_id} value={congregation.congregation_id}>
        {congregation.title}
      </option>
    ))}
  </select>

  <i 
    className="bi bi-arrow-clockwise position-absolute" 
    style={{ right: '50px', top: '70%', transform: 'translateY(-50%)', color: 'green', cursor: 'pointer' }} 
    onClick={handleRefreshCongregation}
  >
    {loadingCongregation && (
      <div className="spinner-border text-primary position-absolute" style={{ top: '-5px', left: '-5px', width: '20px', height: '20px' }} />
    )}
  </i>

  <i 
    className="bi bi-plus-lg position-absolute" 
    style={{ right: '10px', top: '70%', transform: 'translateY(-50%)', color: 'red', cursor: 'pointer' }} 
    onClick={() => window.open(`${window.location.origin}/congregation`, '_blank')}
  ></i>

  {formError.congregation_id && <div className="text-danger">{formError.congregation_id}</div>}
</div>
    
          )}

          {selectedType === 'convent' && selectedCongregation && (
           <div className="mb-3 position-relative">
    <label htmlFor="fk_parish_covent_id">
      Convents <span className="text-danger">*</span>
    </label>
    <select
      className="form-control"
      id="fk_parish_covent_id"
      name="fk_parish_covent_id"
      value={formData.fk_parish_covent_id}
      onChange={handleChange}
    >
      <option value="">Select Convents</option>
      {congregationConvents.map(convent => (
        <option key={convent.parish_id} value={convent.parish_id}>
          {convent.parish_name}, {convent.location}
        </option>
      ))}
    </select>

    {/* Refresh icon with spinner */}
    <i 
      className={`bi bi-arrow-clockwise position-absolute ${loadingConvent ? 'spinning' : ''}`} 
      style={{ right: '50px', top: '70%', transform: 'translateY(-50%)', color: 'green', cursor: 'pointer' }} 
      onClick={handleRefresh}
    >
      {loadingConvent && (
        <div className="spinner-border text-primary position-absolute" style={{ top: '-5px', left: '-5px', width: '20px', height: '20px' }} />
      )}
    </i>

    {/* Plus icon */}
    <i 
      className="bi bi-plus-lg position-absolute" 
      style={{ right: '10px', top: '70%', transform: 'translateY(-50%)', color: 'red', cursor: 'pointer' }} 
      onClick={() => window.open(`${window.location.origin}/convents`, '_blank')}
    ></i>

    {formError.fk_parish_covent_id && <div className="text-danger">{formError.fk_parish_covent_id}</div>}
  </div>

          )}








          {/* {selectedType === 'convent' && ( */}
            <div className="mb-3">
              <label htmlFor="school_code">School Code <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="school_code"
                name="school_code"
                value={formData.school_code}
                onChange={handleChange}
              />
              {formError.school_code && <div className="text-danger">{formError.school_code}</div>}
            </div>
          {/* )} */}

          <div className="mb-3">
            <label htmlFor="school_name">School Name <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              id="school_name"
              name="school_name"
              value={formData.school_name}
              onChange={handleChange}
            />
            {formError.school_name && <div className="text-danger">{formError.school_name}</div>}
          </div>



          <div className="mb-3">
            <label htmlFor="location">Location <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
            {formError.location && <div className="text-danger">{formError.location}</div>}
          </div>


<div className="mb-3">
  <label htmlFor="address">Address </label>
  <input
    type="text"
    className="form-control"
    id="address"
    name="address"
    value={formData.address}
    onChange={handleChange}
  />
  {formError.address && <div className="text-danger">{formError.address}</div>}
</div>






<div className="mb-3">
  <label htmlFor="post_office">Post Office </label>
  <input
    type="text"
    className="form-control"
    id="post_office"
    name="post_office"
    value={formData.post_office}
    onChange={handleChange}
  />
  {formError.post_office && <div className="text-danger">{formError.post_office}</div>}
</div>





          
          <div className="mb-3">
            <label htmlFor="location"> Pin Number </label>
            <input
              type="text"
              className="form-control"
              id="pin_no"
              name="pin_no"
              value={formData.pin_no}
              onChange={handleChange}
            />
            {formError.pin_no && <div className="text-danger">{formError.pin_no}</div>}
          </div>





        </div>

        <div className="col-md-6">
          {/* Column 2 */}


  <div className="mb-3">
  <label htmlFor="school_type">School Type <span className="text-danger">*</span></label>
  <select
    id="school_type"
    name="school_type"
    className="form-select"
    value={formData.school_type}
    onChange={handleChange}
  >
    <option value="">Select School Type</option>
    <option value="School">School</option>
    <option value="TTI">TTI (Teachers Training Institute)</option>
  </select>
  {formError.school_type && <div className="text-danger">{formError.school_type}</div>}
</div>







          <div className="mb-3">
            <label htmlFor="phone">Phone <span className="text-danger">*</span></label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            {formError.phone && <div className="text-danger">{formError.phone}</div>}
          </div>

          <div className="mb-3">
  <label htmlFor="established_year">
    Year of Establishment 
  </label>

  <div className="row">
    {/* LP Section */}
    <div className="col-md-3">
      <label htmlFor="lp_established_year">LP</label>
      <input
        type="text"
        className="form-control"
        id="lp_established_year"
        name="lp_established_year"
        value={formData.lp_established_year}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d{0,4}$/.test(value)) { // Allow only up to 4 digits
            handleChange(e); // Update formData if valid
            setFormError((prev) => ({
              ...prev,
              lp_established_year: "",
            }));
          } else {
            setFormError((prev) => ({
              ...prev,
              lp_established_year: "Numbers with a maximum of 4 digits are allowed.",
            }));
          }
        }}
      />
      {formError.lp_established_year && (
        <div className="text-danger">{formError.lp_established_year}</div>
      )}
    </div>

    {/* UP Section */}
    <div className="col-md-3">
      <label htmlFor="up_established_year">UP</label>
      <input
        type="text"
        className="form-control"
        id="up_established_year"
        name="up_established_year"
        value={formData.up_established_year}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d{0,4}$/.test(value)) { // Allow only up to 4 digits
            handleChange(e); // Update formData if valid
            setFormError((prev) => ({
              ...prev,
              established_year_hs: "",
            }));
          } else {
            setFormError((prev) => ({
              ...prev,
              up_established_year: "Numbers with a maximum of 4 digits are allowed.",
            }));
          }
        }}
      />
      {formError.up_established_year && (
        <div className="text-danger">{formError.up_established_year}</div>
      )}
    </div>

    {/* HS Section */}
    <div className="col-md-3">
      <label htmlFor="established_year_hs">HS</label>
      <input
        type="text"
        className="form-control"
        id="established_year_hs"
        name="established_year_hs"
        value={formData.established_year_hs}
      
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d{0,4}$/.test(value)) { // Allow only up to 4 digits
            handleChange(e); // Update formData if valid
            setFormError((prev) => ({
              ...prev,
              established_year_hs: "",
            }));
          } else {
            setFormError((prev) => ({
              ...prev,
              established_year_hs: "Numbers with a maximum of 4 digits are allowed.",
            }));
          }
        }}
      />
      {formError.established_year_hs && (
        <div className="text-danger">{formError.established_year_hs}</div>
      )}
    </div>

    {/* HSE Section */}
    <div className="col-md-3">
      <label htmlFor="established_year_hse">HSS</label>
      <input
        type="text"
        className="form-control"
        id="established_year_hse"
        name="established_year_hse"
        value={formData.established_year_hse}
       
         onChange={(e) => {
          const value = e.target.value;
          if (/^\d{0,4}$/.test(value)) { // Allow only up to 4 digits
            handleChange(e); // Update formData if valid
            setFormError((prev) => ({
              ...prev,
              established_year_hse: "",
            }));
          } else {
            setFormError((prev) => ({
              ...prev,
              established_year_hse: "Numbers with a maximum of 4 digits are allowed.",
            }));
          }
        }}
      />
     
      {formError.established_year_hse && (
        <div className="text-danger">{formError.established_year_hse}</div>
      )}
    </div>
  </div>
</div>



          <div className="mb-3">
            <label htmlFor="school_gender_type">School Gender Type <span className="text-danger">*</span></label>
            <select
              className="form-control"
              id="school_gender_type"
              name="school_gender_type"
              value={formData.school_gender_type}
              onChange={handleChange}
            >
              <option value="">Select Gender Type</option>
              <option value="boys">Boys</option>
              <option value="girls">Girls</option>
              <option value="Co-education">Co-education</option>
            </select>
            {formError.school_gender_type && <div className="text-danger">{formError.school_gender_type}</div>}
          </div>
          {formData.school_type === 'School' && (
          <div className="mb-3">
           <label htmlFor="fk_class_level_id">Class Levels <span className="text-danger">*</span></label>
              <select
                id="fk_class_level_id"
                name="fk_class_level_id"
                className="form-select"
                value={formData.fk_class_level_id}
                onChange={handleChange}
              >
    <option value="">Select Class Level</option>
    {classlevels.map((level) => (
      <option key={level.class_level_id} value={level.class_level_id}>
        {level.class_level_name}
      </option>
    ))}
  </select>
  {formError.class_levels && <div className="text-danger">{formError.class_levels}</div>}
</div>

)}


<div className="mb-3">
           <label htmlFor="fk_treasury_id">Treasury <span className="text-danger">*</span></label>
              <select
                id="fk_treasury_id"
                name="fk_treasury_id"
                className="form-select"
                value={formData.fk_treasury_id}
                onChange={handleChange}
              >
    <option value="">Select treasury</option>
    {treasury.map((treasure) => (
      <option key={treasure.treasury_id } value={treasure.treasury_id }>
        {treasure.treasury_location}
      </option>
    ))}
  </select>
  {formError.treasury && <div className="text-danger">{formError.treasury}</div>}
</div>





          <div className="mb-3">
            <label htmlFor="email">Email <span className="text-danger">*</span></label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {formError.email && <div className="text-danger">{formError.email}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="password">Password <span className="text-danger">*</span></label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {formError.password && <div className="text-danger">{formError.password}</div>}
          </div>

  
        </div>
      </div>

      {/* Submit button */}
      <div className="text-end">
        <button type="submit" className="btn btn-success me-2" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button className="btn btn-danger" onClick={handleCloseModal} disabled={isSaving}>
          Cancel
        </button>
      </div>
    </form>
  </Modal.Body>
</Modal>

<Modal show={cropModalIsOpen} onHide={() => setCropModalIsOpen(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Crop Image</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <ImageCropper
      image={formData.photo}
      updateAvatar={updateAvatar}
      closeModal={() => setCropModalIsOpen(false)}
    />
  </Modal.Body>
</Modal>
<Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
  <Modal.Header closeButton>
    <Modal.Title>Department Details</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {loading ? (
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p>Loading data...</p>
      </div>
    ) : deptDetails ? (
      <div>
 
  {/* Conditionally render based on dept_type */}
  {selectedDept.dept_type === 'rdd' || selectedDept.dept_type === 'dde' ? (
<>


<div className="bg-beige card mb-2">
  <div className="card-body">
    <h5 className="card-title">{capitalizeWords(selectedDept.dept_type)} Details</h5>
    <ul className="list-group">
    <li className="list-group-item d-flex justify-content-between align-items-center">
    <b>Office</b>
      {deptDetails.office_name}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Address </b>
      {deptDetails.office_address}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Email </b>
        <span className="badge bg-info rounded-pill">{deptDetails.email}</span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Phone </b>
      {deptDetails.phone}
      </li>
    </ul>
  </div>
</div>

</>


  ) : null}

  {selectedDept.dept_type === 'deo' ? (
    <div>

<div className="bg-beige card mb-2">
  <div className="card-body">
    <h5 className="card-title">DDE Details</h5>
    <ul className="list-group">
    <li className="list-group-item d-flex justify-content-between align-items-center">
    <b>Office</b>
      {deptDetails.parent_office_name	}
      </li>
     
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Address</b>
       {deptDetails.parent_office_address}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Email</b>
        <span className="badge bg-info rounded-pill">{deptDetails.parent_email}</span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Phone</b>
      {deptDetails.parent_phone}
      </li>
    </ul>
  </div>
</div>


<div className="bg-dangerous card mb-2">
  <div className="card-body">
    <h5 className="card-title">DEO Details</h5>
    <ul className="list-group">
    <li className="list-group-item d-flex justify-content-between align-items-center">
    <b>Office</b>
      {deptDetails.office_name}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Address</b>
      {deptDetails.office_address}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Email</b>
        <span className="badge bg-info rounded-pill">{deptDetails.email}</span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Phone</b>
      {deptDetails.phone}
      </li>
    </ul>
  </div>
</div>
     
    </div>
  ) : null}

  {selectedDept.dept_type === 'aeo' ? (
    <div>
  {/* <div className="bg-beige card mb-2">
  <div className="card-body">
    <h5 className="card-title">DDE Details</h5>
    <ul className="list-group">
      <li className="list-group-item d-flex justify-content-between align-items-center">
      Address
      {deptDetails.address}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      Email
        <span className="badge bg-info rounded-pill">{deptDetails.email}</span>
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      Phone
      {deptDetails.phone}
      </li>
    </ul>
  </div>
</div> */}

<div className="bg-selected card mb-2">
  <div className="card-body">
    <h5 className="card-title">DEO Details</h5>
    <ul className="list-group">
    <li className="list-group-item d-flex justify-content-between align-items-center">
    <b>Office</b>
      {deptDetails.parent_office_name	}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b> Address  : </b>
      {deptDetails.parent_office_address}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Email  : </b>
       {deptDetails.parent_email}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Phone : </b>
      {deptDetails.parent_phone}
      </li>
    </ul>
  </div>
</div>

<div className="bg-beige card mb-2">
  <div className="card-body">
    <h5 className="card-title">AEO Details</h5>
    <ul className="list-group">
    <li className="list-group-item d-flex justify-content-between align-items-center">
    <b>Office</b>
      {deptDetails.office_name	}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Address :</b> 
      {deptDetails.office_address}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Email : </b>
       {deptDetails.email}
      </li>
      <li className="list-group-item d-flex justify-content-between align-items-center">
      <b>Phone : </b>
      {deptDetails.phone}
      </li>
    </ul>
  </div>
</div>
    </div>
  ) : null}
</div>
    ) : (
      <p>No details available.</p>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>
    </>
  );
};

export default School;