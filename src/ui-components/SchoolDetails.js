import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcum from './Breadcum.js';
import Modal from 'react-bootstrap/Modal';
import Dropdown from 'react-bootstrap/Dropdown';
import print_toast from "../utilities/Toaster.js";
import globalVariables from "../Global.js";
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper from './ImageCropper';
import photo from "../assets/ui-master/img/no_image_uploaded.jpg";
import SchoolStaff from './SchoolStaff';
import useAuth from "../utilities/useAuth";
import defaultPhoto from "../assets/ui-master/img/no_image_uploaded.jpg";
import { capitalizeWords } from '../utilities/dateconverter';
import SecureImage from './SecureImage';

const SchoolDetails = () => {
  const auth = useAuth();
  const user_type = auth.user.user_type;
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formError, setFormError] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ new_password: '', confirm_password: '' });
  const [activeTab, setActiveTab] = useState('overview');
  const [zones, setZones] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [congregations, setCongregations] = useState([]);
  const [selectedCongregation, setSelectedCongregation] = useState('');
  const [convents, setConvents] = useState([]);
  const [congregationConvents, setcongregationConvents] = useState([]);
  const [dependentOptions, setDependentOptions] = useState([]);
  const [forceUpdate, setForceUpdate] = useState(false);

  const [parishesConvents, setParishesConvents] = useState();



  const [selectedForane, setSelectedForane] = useState('');
  //const [parishesConvents, setParishesConvents] = useState([]);
  const [classlevels, setClasslevels] = useState([]);
  const [secondaryOptions, setSecondaryOptions] = useState([]);
  const [deoOptions, setDeoOptions] = useState([]);
  const [aeoOptions, setAeoOptions] = useState([]);

  const [treasury, setTreasury] = useState([]);


  const [classDetails, setClassDetails] = useState([]);
  const [foranes, setForanes] = useState([]);
  // const [changeImageModal, setChangeImageModal] = useState(false);
  const [newImage, setNewImage] = useState(null);

  const [cropModalIsOpen, setCropModalIsOpen] = useState(false);
  const [currentEditingSchool, setCurrentEditingSchool] = useState(null);
  const avatarUrl = useRef(photo);
  // const [croppedImage, setCroppedImage] = useState(null);
  // const [selectedImage, setSelectedImage] = useState(null);  
  const { school_id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    school_code: '',
    school_name: '',
    location: '',
    address: '',
    email: '',
    phone: '',
    district: '',
    fk_zone_id: '',
    established_year: '',
    school_type: '',
    fk_class_level_id: '',
    dept_type: '',
    fk_dept_id: '',
    fk_treasury_id: '',
    school_category: '',
    secondaryDropdown: '',
    ddeDropdown: '',
    deoDropdown: '',
    aeoDropdown: '',
    type: '',
    congregation_id: '',
    forane_id: '',
    school_gender_type: '',
    pin_no: '',
    post_office: '',
    lp: 0,
    up: 0,
    hs: 0,
    hse: 0,
    aeo: 0,
    deo: 0,
    dde: 0,
    rdd: 0,
    fk_parish_covent_id: '',
  });




  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    ...(user_type === "corporate_admin" ? [{ Title: 'School', Link: '/school' }] : []),
    { Title: 'School Details', Link: '' },
  ]);

  const validateForm = () => {
    let errors = {};
    if (formData.school_code !== schoolDetails.school_code && !formData.school_code) errors.school_code = "School code is required";
    if (!formData.school_name) errors.school_name = "School name is required";
    if (!formData.location) errors.location = "Location is required";
    if (!formData.address) errors.address = "Address is required";
    if (formData.email !== schoolDetails.email) {
      if (!formData.email) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid";
    }
    if (formData.phone !== schoolDetails.phone) {
      if (!formData.phone) errors.phone = "Phone number is required";
      else if (!/^\d{10}$/.test(formData.phone)) errors.phone = "Phone number must be 10 digits";
    }
    if (!formData.district) errors.district = "District is required";
    if (!formData.fk_zone_id) errors.fk_zone_id = "Zone is required";
    if (!formData.established_year) errors.established_year = "Established year is required";
    const hasSelectedType = formData.lp || formData.up || formData.hs || formData.hse;
    if (!hasSelectedType) {
      errors.school_type = 'At least one school type must be selected.';
    }
    if (!formData.school_gender_type) errors.school_gender_type = "School gender type is required";
    setFormError(errors);
    return Object.keys(errors).length === 0;

  };


  const [dropdownOptions, setDropdownOptions] = useState({
    secondaryOptions: [],
    ddeOptions: [],
    deoOptions: [],
    aeoOptions: [],
  });

  useEffect(() => {
    fetchSchoolDetails();
  }, []);

  useEffect(() => {
    // Fetch your data
    fetchParishConventDetails().then(data => {
      setParishesConvents(data); // Ensure the data is an array
    });
  }, []);




  useEffect(() => {
    setForceUpdate((prev) => !prev);
  }, [formData.ddeDropdown, formData.deoDropdown]);

  const resetForm = () => {
    setFormData({});
    setFormError({});
  };

  const resetPasswordModal = () => {
    setPasswordData({ new_password: '', confirm_password: '' });
    setFormError({});
    setChangePasswordModal(false);
  };

  const openEditModal = () => {
    resetForm();  // Reset form and errors when opening the modal
    setEditMode(true);
  };

  const closeEditModal = () => {
    resetForm();  // Reset form and errors when closing the modal
    setEditMode(false);
  };

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


  const fetchSchoolDetails = useCallback(async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/schooldetails/${school_id}`);

      if (response.data.status) {
        let data = response.data.data;
        if (Array.isArray(data) && data.length > 0) {
          data = data[0];
        } else if (Array.isArray(data)) {
          data = {};
        }
        
        if (!data) {
          data = {};
        }

        // Set school details
        setSchoolDetails(data);

        // Update form data with dropdown logic
        setFormData({
          ...data,
          lp: data.lp === '1',
          up: data.up === '1',
          hs: data.hs === '1',
          hse: data.hse === '1',
          secondaryDropdown: data.fk_dept_id?.secondaryDropdown || "",
          ddeDropdown: data.fk_dept_id?.ddeDropdown || "",
          deoDropdown: data.fk_dept_id?.deoDropdown || "",
          aeoDropdown: data.fk_dept_id?.aeoDropdown || "",
        });

        // Populate dropdown options
        setDropdownOptions({
          secondaryOptions: data.secondaryOptions || [], // Ensure array fallback
          ddeOptions: data.ddeOptions || [],
          deoOptions: data.deoOptions || [],
          aeoOptions: data.aeoOptions || [],
        });

        // Set the type based on fk_parish_covent_id
        setSelectedType(data.fk_parish_covent_id ? 'parish' : 'convent');
        console.log(data.fk_parish_covent_id);
        // Fetch additional details if fk_parish_covent_id is present
        if (data.fk_parish_covent_id) {
          fetchParishConventDetails(data.fk_parish_covent_id);
        }
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error fetching school details:', error);
      print_toast("error", "Failed to fetch school details");
    }
  }, [school_id]);

  const fetchParishConventDetails1 = async (id) => {
    try {
      // Make the API call
      const response = await axios.get(`${globalVariables.api_url}/school/get_parish_convent_details/${id}`);
      console.log('Response parish convent:', response.data);

      // Check if the response data exists and handle different formats
      if (response.data) {
        // If the response data is an array, set it directly
        if (Array.isArray(response.data)) {
          setParishesConvents(response.data);
        }
        // If it's an object, wrap it in an array and set
        else if (typeof response.data === 'object') {
          setParishesConvents([response.data]);
        }
        // Handle unexpected data format
        else {
          console.warn('Unexpected data format:', response.data);
          setParishesConvents([]); // Set empty array for unexpected formats
        }

        // If the type is 'parish', handle additional logic
        if (response.data.type === 'parish') {
          // Safeguard for missing forane_id and set selected forane
          setSelectedForane(response.data.forane_id || null);
          fetchForanes(); // Ensure this function is defined and works correctly
        }
      } else {
        console.warn('Response data is empty');
        setParishesConvents([]); // Set empty array for null/undefined response
      }
    } catch (error) {
      console.error('Error fetching parish/convent details:', error);
      setParishesConvents([]); // Reset state on error
    }
  };

  const fetchParishConventDetails = async (id) => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_parish_convent_details/${id}`);

      console.log('Response parish convent:', response.data);

      // Check if response.data is an object, and convert it to an array if needed
      if (response.data && Array.isArray(response.data)) {
        setParishesConvents(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object, convert it into an array containing this object
        setParishesConvents([response.data]);
      }

      if (response.data.type === 'parish') {
        setSelectedForane(response.data.forane_id);
        fetchForanes();
      }

    } catch (error) {
      console.error('Error fetching parish/convent details:', error);
    }
  };

  const fetchClassDetails = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/class-strength/get_classstrengths_schoolid`,
        { params: { school_id: school_id } }
      );
      if (response.data && response.data.status) {
        setClassDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };
  const standardClasses = classDetails.filter(item => 
    !['XI', 'XII'].includes(item.class_name)
  );
  
  const higherClasses = classDetails.filter(item => 
    ['XI', 'XII'].includes(item.class_name)
  );

  
  // Render Standard Classes Table (I-X with divisions A, B, C, D)
  const renderStandardClassesTable = () => {
    if (standardClasses.length === 0) return null;

    const standardDivisions = ['A', 'B', 'C', 'D'];
    
    // Initialize column totals
    const columnTotals = {};
    standardDivisions.forEach(division => {
      columnTotals[division] = { boys: 0, girls: 0, cs: 0, ncs: 0 };
    });
    columnTotals.overall = { boys: 0, girls: 0, cs: 0, ncs: 0 };

    // Group data by class name
    const classDivisionMap = {};
    
    standardClasses.forEach((item) => {
      if (!classDivisionMap[item.class_name]) {
        classDivisionMap[item.class_name] = {
          divisions: {},
          total: { boys: 0, girls: 0, cs: 0, ncs: 0 }
        };
      }
      
      // Store division data
      classDivisionMap[item.class_name].divisions[item.division] = item;
      
      // Convert string values to numbers
      const boys = parseInt(item.strength_boys, 10) || 0;
      const girls = parseInt(item.strength_girls, 10) || 0;
      const cs = parseInt(item.strength_cs, 10) || 0;
      const ncs = parseInt(item.strength_ncs, 10) || 0;
      
      // Update class totals
      classDivisionMap[item.class_name].total.boys += boys;
      classDivisionMap[item.class_name].total.girls += girls;
      classDivisionMap[item.class_name].total.cs += cs;
      classDivisionMap[item.class_name].total.ncs += ncs;
      
      // Update division totals
      if (columnTotals[item.division]) {
        columnTotals[item.division].boys += boys;
        columnTotals[item.division].girls += girls;
        columnTotals[item.division].cs += cs;
        columnTotals[item.division].ncs += ncs;
      }
      
      // Update overall totals
      columnTotals.overall.boys += boys;
      columnTotals.overall.girls += girls;
      columnTotals.overall.cs += cs;
      columnTotals.overall.ncs += ncs;
    });

    return (
      <>
        {/* <h5 className="text-center mt-4">Standard Classes (I-X)</h5> */}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th rowSpan="3">Class</th>
              <th colSpan={standardDivisions.length * 4}>Divisions</th>
              <th colSpan="4">Total Strength</th>
            </tr>
            <tr>
              {standardDivisions.map((division) => (
                <th colSpan="4" key={division}>{division}</th>
              ))}
              <th rowSpan="2">Boys</th>
              <th rowSpan="2">Girls</th>
              <th rowSpan="2">CS</th>
              <th rowSpan="2">NCS</th>
            </tr>
            <tr>
              {standardDivisions.map((division) => (
                <React.Fragment key={division}>
                  <th>Boys</th>
                  <th>Girls</th>
                  <th>CS</th>
                  <th>NCS</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(classDivisionMap).map(([className, { divisions, total }]) => (
              <tr key={className}>
                <td>{className}</td>
                {standardDivisions.map((division) => (
                  <React.Fragment key={division}>
                    <td>{divisions[division]?.strength_boys || 0}</td>
                    <td>{divisions[division]?.strength_girls || 0}</td>
                    <td>{divisions[division]?.strength_cs || 0}</td>
                    <td>{divisions[division]?.strength_ncs || 0}</td>
                  </React.Fragment>
                ))}
                <td>{total.boys}</td>
                <td>{total.girls}</td>
                <td>{total.cs}</td>
                <td>{total.ncs}</td>
              </tr>
            ))}
            <tr>
              <td><strong>Total</strong></td>
              {standardDivisions.map((division) => (
                <React.Fragment key={division}>
                  <td><strong>{columnTotals[division]?.boys || 0}</strong></td>
                  <td><strong>{columnTotals[division]?.girls || 0}</strong></td>
                  <td><strong>{columnTotals[division]?.cs || 0}</strong></td>
                  <td><strong>{columnTotals[division]?.ncs || 0}</strong></td>
                </React.Fragment>
              ))}
              <td><strong>{columnTotals.overall.boys}</strong></td>
              <td><strong>{columnTotals.overall.girls}</strong></td>
              <td><strong>{columnTotals.overall.cs}</strong></td>
              <td><strong>{columnTotals.overall.ncs}</strong></td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  // Render Higher Secondary Classes Table (XI-XII with special divisions)
  const renderHigherClassesTable = () => {
    if (higherClasses.length === 0) return null;

    // Get unique divisions for higher classes
    const higherDivisions = [...new Set(higherClasses.map(item => item.division))];
    
    // Initialize column totals
    const columnTotals = {};
    higherDivisions.forEach((division) => {
      columnTotals[division] = { boys: 0, girls: 0, cs: 0, ncs: 0 };
    });
    columnTotals.overall = { boys: 0, girls: 0, cs: 0, ncs: 0 };
    
    // Group data by class name
    const classDivisionMap = {};
    
    higherClasses.forEach((item) => {
      if (!classDivisionMap[item.class_name]) {
        classDivisionMap[item.class_name] = {
          divisions: {},
          total: { boys: 0, girls: 0, cs: 0, ncs: 0 }
        };
      }
      
      // Store division data
      classDivisionMap[item.class_name].divisions[item.division] = item;
      
      // Convert string values to numbers
      const boys = parseInt(item.strength_boys, 10) || 0;
      const girls = parseInt(item.strength_girls, 10) || 0;
      const cs = parseInt(item.strength_cs, 10) || 0;
      const ncs = parseInt(item.strength_ncs, 10) || 0;
      
      // Update class totals
      classDivisionMap[item.class_name].total.boys += boys;
      classDivisionMap[item.class_name].total.girls += girls;
      classDivisionMap[item.class_name].total.cs += cs;
      classDivisionMap[item.class_name].total.ncs += ncs;
      
      // Update division totals
      columnTotals[item.division].boys += boys;
      columnTotals[item.division].girls += girls;
      columnTotals[item.division].cs += cs;
      columnTotals[item.division].ncs += ncs;
      
      // Update overall totals
      columnTotals.overall.boys += boys;
      columnTotals.overall.girls += girls;
      columnTotals.overall.cs += cs;
      columnTotals.overall.ncs += ncs;
    });

    return (
      <>
        {/* <h5 className="text-center mt-4">Higher Secondary Classes (XI-XII)</h5> */}
        <table className="table table-bordered">
          <thead>
            <tr>
              <th rowSpan="3">Class</th>
              <th colSpan={higherDivisions.length * 4}>Batches</th>
              <th colSpan="4">Total Strength</th>
            </tr>
            <tr>
              {higherDivisions.map((division) => (
                <th colSpan="4" key={division}>{division}</th>
              ))}
              <th rowSpan="2">Boys</th>
              <th rowSpan="2">Girls</th>
              <th rowSpan="2">CS</th>
              <th rowSpan="2">NCS</th>
            </tr>
            <tr>
              {higherDivisions.map((division) => (
                <React.Fragment key={division}>
                  <th>Boys</th>
                  <th>Girls</th>
                  <th>CS</th>
                  <th>NCS</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(classDivisionMap).map(([className, { divisions, total }]) => (
              <tr key={className}>
                <td>{className}</td>
                {higherDivisions.map((division) => (
                  <React.Fragment key={division}>
                    <td>{divisions[division]?.strength_boys || 0}</td>
                    <td>{divisions[division]?.strength_girls || 0}</td>
                    <td>{divisions[division]?.strength_cs || 0}</td>
                    <td>{divisions[division]?.strength_ncs || 0}</td>
                  </React.Fragment>
                ))}
                <td>{total.boys}</td>
                <td>{total.girls}</td>
                <td>{total.cs}</td>
                <td>{total.ncs}</td>
              </tr>
            ))}
            <tr>
              <td><strong>Total</strong></td>
              {higherDivisions.map((division) => (
                <React.Fragment key={division}>
                  <td><strong>{columnTotals[division].boys}</strong></td>
                  <td><strong>{columnTotals[division].girls}</strong></td>
                  <td><strong>{columnTotals[division].cs}</strong></td>
                  <td><strong>{columnTotals[division].ncs}</strong></td>
                </React.Fragment>
              ))}
              <td><strong>{columnTotals.overall.boys}</strong></td>
              <td><strong>{columnTotals.overall.girls}</strong></td>
              <td><strong>{columnTotals.overall.cs}</strong></td>
              <td><strong>{columnTotals.overall.ncs}</strong></td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };
  const fetchForanes = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/forane/view_forane`);
      setForanes(response.data.data);
    } catch (error) {
      console.error('Error fetching foranes:', error);
    }
  };


  useEffect(() => {
    fetchSchoolDetails();
    fetchZones();
    fetchDistricts();
    fetchClassDetails();
  }, [fetchSchoolDetails]);


  useEffect(() => {
    if (formData.dept_type) {
      fetchDependentDropdownData(formData.dept_type);
    }
  }, [formData.dept_type]);


  useEffect(() => {
    if (editMode && schoolDetails) {
      setFormData({
        school_code: schoolDetails.school_code,
        school_name: schoolDetails.school_name,
        location: schoolDetails.location,
        address: schoolDetails.address,
        email: schoolDetails.email,
        phone: schoolDetails.phone,
        district: schoolDetails.district,
        fk_zone_id: schoolDetails.fk_zone_id,
        school_gender_type: schoolDetails.school_gender_type,
        fk_class_level_id: schoolDetails.fk_class_level_id,
        fk_dept_id: schoolDetails.fk_dept_id || '',
        fk_treasury_id: schoolDetails.fk_treasury_id || '',
        lp_established_year: schoolDetails.lp_established_year || '',  // Added this field
        up_established_year: schoolDetails.up_established_year || '',  // Added this field
        hs_established_year: schoolDetails.hs_established_year || '',  // Added this field
        hss_established_year: schoolDetails.hss_established_year || '',
        type: schoolDetails.school_category || '',
        fk_parish_covent_id: schoolDetails.parish_id	 || '',
        school_type: schoolDetails.school_type || '',
        congregation_id: schoolDetails.fk_congregation_id	 || '',
        forane_id: schoolDetails.fk_forane_id || '',
        dept_type: schoolDetails.dept_type || '',
        post_office: schoolDetails.post_office || '',
        pin_no: schoolDetails.pin_no || '',
        secondaryDropdown: (schoolDetails.dept_type === 'rdd' || schoolDetails.dept_type === 'dde')
          ? schoolDetails.dept_id || ''
          : '',
        // deoDropdown: schoolDetails.dept_type === 'deo' ? schoolDetails.dept_id : '',
        // ddeDropdown: schoolDetails.dept_type === 'deo' ? schoolDetails.edu_dept_id : '',
        aeoDropdown: schoolDetails.dept_type === 'aeo' ? schoolDetails.dept_id : '',
        //  deoDropdown: schoolDetails.dept_type === 'aeo' ? schoolDetails.edu_dept_id : '',
        //ddeDropdown: schoolDetails.dept_type === 'aeo' ? schoolDetails.edu_parent_id : '',
        deoDropdown: schoolDetails.dept_type === 'deo'
          ? schoolDetails.dept_id
          : schoolDetails.dept_type === 'aeo'
            ? schoolDetails.edu_dept_id
            : '',


        ddeDropdown: schoolDetails.dept_type === 'deo'
          ? schoolDetails.edu_dept_id
          : schoolDetails.dept_type === 'aeo'
            ? schoolDetails.edu_parent_id
            : '',

      });


      if (schoolDetails.fk_parish_covent_id) {
        setSelectedCongregation(schoolDetails.fk_parish_covent_id); // Set the congregation selected
      }

      if (schoolDetails.fk_convent_id) {
        setcongregationConvents(schoolDetails.fk_convent_id);
      }

      if (schoolDetails.dept_type) {
        fetchDependentDropdownData(schoolDetails.dept_type, schoolDetails.secondaryDropdown);
      }



    }
  }, [editMode, schoolDetails]);
  // Only one useEffect hook for both

  useEffect(() => {
    console.log("FormData:", formData);
  }, [formData]);





  const fetchZones = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school/get_zones`);

      if (response.data.status) {
        setZones(response.data.data); // Access the array from the response
      } else {
        setZones([]); // Handle the case where no zones are found
      }
    } catch (error) {
      console.error('Error fetching zones:', error.message);
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

  // to fetch convents






  const handleEditImageChange = () => {
    setCurrentEditingSchool(schoolDetails);
    setCropModalIsOpen(true);
  };

  const handleEditImageUpdate = async (croppedImage) => {
    try {
      const formData = new FormData();
      formData.append('school_id', school_id);
      formData.append('photo', croppedImage);

      const response = await axios.post(`${globalVariables.api_url}/school/schooldetails/update_photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status) {
        print_toast('success', 'School photo updated successfully');
        fetchSchoolDetails();
      } else {
        print_toast('error', response.data.message || 'Failed to update school photo');
      }
    } catch (error) {
      console.error('Error updating school photo:', error);
      print_toast('error', 'Failed to update school photo');
    } finally {
      setCropModalIsOpen(false);
      setCurrentEditingSchool(null);
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const updatedValue = (name === 'school_name' || name === 'location') ? value.toUpperCase() : value;

    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : updatedValue // Convert checkbox state to 1 or 0
    }));
  };


  useEffect(() => {
    console.log('formData:', formData); // Log formData to check its value
    // Check if 'convent' type or 'congregation_id' is selected
    if (formData.type === 'convent' || formData.congregation_id) {
      console.log('Calling API for congregations...');
      // Fetch congregations
      axios.get(`${globalVariables.api_url}/congregation/get_congregation`)
        .then(response => {
          console.log('Congregations fetched:', response.data); // Log the response data
          if (Array.isArray(response.data.data)) {
            setCongregations(response.data.data); // Set the congregation data in state
          } else {
            setCongregations([]); // Empty array if no data
          }
        })
        .catch(error => console.error('Error fetching congregations:', error));

      // Fetch convents for the selected congregation if `formData.congregation_id` exists
      if (formData.congregation_id) {
        console.log('Calling API for convents...');
        fetchCongregationConvents('convent', formData.congregation_id); // This triggers the convent fetch based on the selected congregation
      }
    }
  }, [formData.type, formData.congregation_id]); // Depend on `formData.type` and `formData.congregation_id`


  useEffect(() => {
    if (formData.dept_type && formData.district) {
      fetchDepartmentData(formData.dept_type, formData.district);
    }
  }, [formData.dept_type, formData.district]);

  const fetchDepartmentData = async (deptType, district) => {
    try {
      let response1, response2 = null;

      if (["rdd", "dde"].includes(deptType)) {
        response1 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: deptType, district: district } }
        );
      } else if (deptType === "deo" || deptType === "aeo") {
        response1 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: "dde", district: district } }
        );
        response2 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: "deo", district: district } }
        );
      }

      setSecondaryOptions(response1?.data?.data || []);
      if (deptType === "deo" || deptType === "aeo") {
        setDeoOptions(response2?.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };




  const handleTypeChange = async (e) => {
    const type = e.target.value;
    setSelectedType(type);

    setFormData(prevData => ({
      ...prevData,
      type: type,  // Update the type in the formData
      fk_parish_covent_id: ''  // Reset fk_parish_covent_id when type changes
    }));

    setSelectedForane(''); // Reset selected forane when type changes

    // Reset errors related to type
    setFormError(prevError => {
      const newErrors = { ...prevError };
      delete newErrors.type; // Remove error related to type
      return newErrors;
    });

    // Conditional logic for fetching data based on selected type
    if (type === 'parish') {
      try {
        const response = await axios.get(`${globalVariables.api_url}/forane/view_forane`);
        if (Array.isArray(response.data.data)) {
          setForanes(response.data.data); // Only set if data is an array
        } else {
          setForanes([]); // Fallback to empty array if no valid data is returned
          console.error('Invalid data format for foranes:', response.data);
        }
      } catch (error) {
        console.error('Error fetching foranes:', error.message);
        setForanes([]); // Reset foranes on error
      }
    } else if (type === 'convent') {
      setCongregations([]); // Clear previous data if the type changes
      setSelectedCongregation(''); // Clear selected congregation
      setConvents([]); // Clear convents list

      try {
        const response = await axios.get(`${globalVariables.api_url}/congregation/get_congregation`);
        if (Array.isArray(response.data.data)) {
          setCongregations(response.data.data); // Only set if data is an array
        } else {
          setCongregations([]); // Fallback to empty array if no valid data is returned
          console.error('Invalid data format for congregations:', response.data);
        }
      } catch (error) {
        console.error('Error fetching congregations:', error.message);
        setCongregations([]); // Reset congregations on error
      }
    }
  };

  useEffect(() => {
    if (formData.congregation_id) {
      setSelectedCongregation(formData.congregation_id);
    }
  }, [formData.congregation_id]);


  useEffect(() => {
    if (formData.type && formData.type !== selectedType) {
      setSelectedType(formData.type);
    }
  }, [formData, selectedType]);





  const handleForaneChange = async (e) => {
    const foraneId = e.target.value;
    setSelectedForane(foraneId);
    fetchParishesConvents('parish', foraneId);
  };


  const fetchParishesConvents = async (type, foraneId = '') => {
    try {
      const apiUrl = `${globalVariables.api_url}/school/get_parishes_convents`;
      console.log('Making request to:', apiUrl);

      const response = await axios.get(apiUrl, {
        params: { type, forane_id: foraneId }
      });

      console.log('API response:', response.data);

      if (response.data.status) {
        console.log('Setting parishesConvents with data:', response.data.data);
        setParishesConvents(response.data.data);
      } else {
        console.error('API returned an error status:', response.data.message);
        setParishesConvents([]);
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

        console.log("API Response:", response.data); // Debugging output

        if (response.data.status && Array.isArray(response.data.data)) {
            setcongregationConvents(response.data.data);  // Ensure it's an array
        } else {
            setcongregationConvents([]); // Reset to an empty array to avoid errors
            console.error("Invalid data format:", response.data);
        }
    } catch (error) {
        console.error('Error fetching convents:', error.message);
        setcongregationConvents([]); // Reset on error
    }
};


  const handleCongregationChange = async (e) => {
    const congregationId = e.target.value;
    setSelectedCongregation(congregationId);
    fetchCongregationConvents('convent', congregationId);
  };


  const handleImageUpdate = async (croppedImageFile) => {
    if (!croppedImageFile) {
      print_toast("error", "Failed to crop image");
      return;
    }

    const formData = new FormData();
    formData.append('school_id', school_id);
    formData.append('photo', croppedImageFile);

    try {
      const response = await axios.post(`${globalVariables.api_url}/school/schooldetails/update_photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status) {
        print_toast("success", "School photo updated successfully");
        fetchSchoolDetails();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error updating school photo:', error);
      print_toast("error", "Failed to update school photo");
    } finally {
      setCropModalIsOpen(false);
      setNewImage(null);
    }
  };

  const updateAvatar = (imgSrc, file) => {
    avatarUrl.current = imgSrc;
    handleImageUpdate(file);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Create a new FormData object
    const formDataToSend = new FormData();
    
    // Copy all entries from existing formData if it exists
    if (formData instanceof FormData) {
      for (const [key, value] of formData.entries()) {
        formDataToSend.append(key, value);
      }
    } else if (typeof formData === 'object' && formData !== null) {
      // If formData is a regular object, convert it to FormData
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
    }
    
    // Always include the school_id (which is required)
    formDataToSend.append("school_id", schoolDetails.school_id);
    
    console.log("Form data being sent:", Array.from(formDataToSend.entries()));
    
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/school/schooldetails/update`, 
        formDataToSend, 
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      if (response.data.status) {
        print_toast("success", "School updated successfully");
        setEditMode(false);
        fetchSchoolDetails();
      } else {
        print_toast("error", response.data.message || "Update failed");
      }
    } catch (error) {
      console.error("Error updating school:", error);
      print_toast("error", error.response?.data?.message || "Failed to update school");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSubmit1 = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
console.log(formData);
    const formDataToSend = new FormData();

    // Loop through the fields and append only changed fields
    for (const key in formData) {
      if (formData[key] !== schoolDetails[key]) {
        if (key === "photo" && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else if (["phone", "fk_zone_id", "fk_parish_covent_id", "fk_treasury_id", "fk_class_level_id"].includes(key)) {
          formDataToSend.append(key, Number(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      }
    }

    // Ensure unchanged fields are included to prevent resetting them
    // const fields = [
    //   'lp_established_year', 'up_established_year', 'hs_established_year', 'hss_established_year'
    // ];

    // fields.forEach((field) => {
    //   // Only append if field is not empty or null
    //   if (schoolDetails[field] !== undefined && schoolDetails[field] !== null && schoolDetails[field] !== '') {
    //     formDataToSend.append(field, schoolDetails[field]);
    //   }
    // });

    // Always include the school_id (which is required)
    formDataToSend.append("school_id", schoolDetails.school_id);
    formDataToSend.append("dept_type", schoolDetails.dept_type);

    try {
      const response = await axios.post(`${globalVariables.api_url}/school/schooldetails/update`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        print_toast("success", "School updated successfully");
        setEditMode(false);
        fetchSchoolDetails();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error updating school:", error);
      print_toast("error", "Failed to update school");
    } finally {
      setIsUpdating(false);
    }
  };







  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this school?')) {
        try {
            const response = await axios.post(`${globalVariables.api_url}/school/schooldetails/delete`, { school_id: school_id });
            if (response.data.status) {
                print_toast("success", response.data.message);
                navigate('/school');
            } else {
                print_toast("error", response.data.message);
            }
        } catch (error) {
            console.error('Error deleting school:', error);
            if (error.response && error.response.data && error.response.data.message) {
                print_toast("error", error.response.data.message);
            } else {
                print_toast("error", "Failed to delete school");
            }
        }
    }
};

  const capitalizeFullWords = (str) => {
    if (!str) {
      return ""; // Return an empty string if the input is null, undefined, or falsy
    }
    return str.toUpperCase(); // Convert the entire string to uppercase
  };
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    let errors = {};
    if (!passwordData.new_password) errors.new_password = "New password is required";
    if (!passwordData.confirm_password) errors.confirm_password = "Confirm password is required";
    if (passwordData.new_password !== passwordData.confirm_password) {
      errors.confirm_password = "Passwords do not match";
    }
    setFormError(errors);
    if (Object.keys(errors).length > 0) return;

    setIsUpdating(true);
    try {
      const response = await axios.post(`${globalVariables.api_url}/school/schooldetails/change_password`, {
        school_id: school_id,
        new_password: passwordData.new_password
      });
      if (response.data.status) {
        print_toast("success", response.data.message);
        resetPasswordModal(); // Reset the modal when password update is successful
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      print_toast("error", "Failed to change password");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!schoolDetails) {
    return <div>Loading...</div>;
  }



  const handleDepartmentChange1 = async (e) => {
    const selectedDepartment = e.target.value;
    console.log("Selected Department:", selectedDepartment);

    if (!formData.district) {
      alert("Please select the district first.");
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      dept_type: selectedDepartment,
      secondaryDropdown: "",
      ddeDropdown: "",
      deoDropdown: "",
    }));
    setSecondaryOptions([]);
    setDeoOptions([]);

    if (!selectedDepartment) return;

    try {
      let response1;
      let response2 = null;

      if (["rdd", "dde"].includes(selectedDepartment)) {
        response1 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: selectedDepartment, district: formData.district } }
        );
      } else if (selectedDepartment === "deo" || selectedDepartment === "aeo") {
        response1 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: "dde", district: formData.district } }
        );
        response2 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: "deo", district: formData.district } }
        );
      }

      const data1 = response1?.data?.data || [];
      const data2 = response2?.data?.data || [];

      setSecondaryOptions(data1);
      if (selectedDepartment === "deo" || selectedDepartment === "aeo") {
        setDeoOptions(data2);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };

  const handleDepartmentChange = async (e) => {
    const selectedDepartment = e.target.value;
    console.log("Selected Department:", selectedDepartment);

    if (!formData.district) {
      alert("Please select the district first.");
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      dept_type: selectedDepartment,
      secondaryDropdown: "",
      ddeDropdown: "",
      deoDropdown: "",
    }));
    setSecondaryOptions([]);
    setDeoOptions([]);

    if (!selectedDepartment) return;

    try {
      let response1;
      let response2 = null;

      if (["rdd", "dde"].includes(selectedDepartment)) {
        response1 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: selectedDepartment, district: e.target.value } }

        );
      } else if (selectedDepartment === "deo" || selectedDepartment === "aeo") {
        response1 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: "dde", district: formData.district } }
        );
        response2 = await axios.get(
          `${globalVariables.api_url}/education-department/get_department_district`,
          { params: { dept_type: "deo", district: formData.district } }
        );
      }

      const data1 = response1?.data?.data || [];
      const data2 = response2?.data?.data || [];

      setSecondaryOptions(data1);
      if (selectedDepartment === "deo" || selectedDepartment === "aeo") {
        setDeoOptions(data2);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
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



  const fetchDependentDropdownData = async (deptId, prefillValue = '') => {
    try {
      console.log('Fetching dependent dropdown data with deptId:', deptId);

      const response = await axios.get(`${globalVariables.api_url}/school/schooldetails/fetchSchoolsWithDepartments`, {
        params: { dept_id: deptId }
      });

      console.log('API response:', response.data);

      if (response.data.status) {
        console.log('Setting dependent dropdown data:', response.data.data);
        const options = response.data.data || [];

        setDependentOptions(options);

        setFormData((prevState) => ({
          ...prevState,
          secondaryDropdown: prefillValue || options[0]?.dept_id || '',
        }));
      } else {
        console.error('API returned an error status:', response.data.message);
        setDependentOptions([]);
      }
    } catch (error) {
      console.error('Error fetching dependent dropdown data:', error.message);
    }
  };


  const handleDownloadProfile = async () => {
   

  //  setPdfLoading(true);
    try {
      const form_data = {
        params: {
         school_id: school_id
        },
        responseType: 'blob'
      };
  
      const response = await axios.get(globalVariables.api_url + '/school/download_school_profile', form_data);
  
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'school_details.pdf');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
    //setPdfLoading(false);
  };




  // ... (keep other existing functions)

  return (
    <>
      <div>
        <Breadcum items={breadcum} title={schoolDetails.school_name} />

        <div className="card">
          {/* Tabs with School Name and Actions in Header */}
          <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
  <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center">
    <ul className="nav nav-tabs flex-nowrap" >
       {/* School Name Tab (active by default) */}
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                  href="#overview"
                >
                  {schoolDetails.school_name}
                </a>
              </li>
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'stafftab' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stafftab')}
                  href="#stafftab"
                >
                  Staff
                </a>
              </li>
              {/* Tab 1 */}
              <li className="nav-item">
                <a
                  className={`nav-link ${activeTab === 'classtab' ? 'active' : ''}`}
                  onClick={() => setActiveTab('classtab')}
                  href="#classtab"
                >
                  Class Details
                </a>
              </li>
              {/* Tab 2 */}

            </ul>
            </div>

            {/* Conditionally render the More Actions dropdown only on the school tab */}
  
          </div>

          {/* Tab Content */}
          <div className="card-body">
            <div className="tab-content">
              {/* Overview / School Details Tab */}
              <div className={`tab-pane fade ${activeTab === 'overview' ? 'show active' : ''}`} id="overview">
              <div className="d-flex justify-content-end mb-2">
              {activeTab === 'overview' && (
              <Dropdown>
              <Dropdown.Toggle variant="btn btn-primary" id="dropdown-basic" >
                  More Actions
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => openEditModal(true)}>Edit</Dropdown.Item>
             
                   <Dropdown.Item onClick={() => handleDownloadProfile()}>Download</Dropdown.Item>
                  {user_type === 'corporate_admin' && (
                    <>
                      <Dropdown.Item onClick={handleDelete}>Delete</Dropdown.Item>
                      <Dropdown.Item onClick={() => setChangePasswordModal(true)}>
                        Change Password
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            )}
            </div>
                <div className="section profile">
                  <div className="row">
                    {/* Left Section: School Photo and Image Actions */}
                    <div className="col-xl-4">
                      <div class="card">
                        <div class="card-body profile-card pt-4 d-flex flex-column align-items-center">
                          {/* <img
                            src={
                              schoolDetails.photo ? `${globalVariables.img_url}/uploads/school_photos/${schoolDetails.photo}`
                                : photo
                            }
                            alt="School"
                            className="img-fluid mb-3"
                          /> */}

<SecureImage
  src={
    schoolDetails.photo && schoolDetails.photo !== "null" && schoolDetails.photo !== ""
      ? `${globalVariables.api_url}/secure_file/school_photos/${schoolDetails.photo}`
      : defaultPhoto
  }
  fallbackSrc={defaultPhoto}
  alt="School"
  className="img-fluid mb-3"
/>
                          <button
                            className="btn btn-primary btn-sm mt-2"
                            onClick={handleEditImageChange}
                          >
                            Change Image
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Right Section: School Details */}
                    <div className="col-xl-8">


                      <table className="table table-bordered">
                        <tbody>
                          <tr>
                            <th>School Code</th>
                            <td>{schoolDetails.school_code}</td>
                          </tr>
                          <tr>
                            <th>Location</th>
                            <td>{schoolDetails.location}</td>
                          </tr>
                          <tr>
                            <th>Address</th>
                            <td>{schoolDetails.address}
                              {schoolDetails.post_office ? `, P.O ${schoolDetails.post_office}` : ""}
                              {schoolDetails.pin_no ? `, ${schoolDetails.pin_no}` : ""}</td>
                          </tr>

                          <tr>
                            <th>Email</th>
                            <td>{schoolDetails.email}</td>
                          </tr>
                          <tr>
                            <th>Phone</th>
                            <td>{schoolDetails.phone}</td>
                          </tr>
                          <tr>
                            <th>Zone</th>
                            <td>{zones.find((z) => z.zone_id === schoolDetails.fk_zone_id)?.zone_name}</td>
                          </tr>

                          <tr>
                            <th>District</th>
                            <td>{schoolDetails.district}</td>
                          </tr>


                          <tr>
                            <th>Class Level</th>
                            <td>{schoolDetails.class_level_name}</td>
                          </tr>

                          <tr>
                            <th>Education Department</th>
                            <td>{capitalizeFullWords(schoolDetails.dept_type)}</td>
                          </tr>

                          <tr>
                            <th>Education Office</th>
                            <td>{schoolDetails.office_name}</td>
                          </tr>
                          <tr>
                            <th>Type</th>
                            <td>{capitalizeWords(schoolDetails.school_category)}</td>
                          </tr>


                          {parishesConvents && parishesConvents.length > 0 && (
                            <>
                              {parishesConvents[0].type === 'parish' && (
                                <>
                                  <tr>
                                    <th>Forane Name</th>
                                    <td>{parishesConvents[0].forane_name}</td>
                                  </tr>
                                  <tr>
                                    <th>Parish Name</th>
                                    <td>{parishesConvents[0].parish_name},{parishesConvents[0].location}</td>
                                  </tr>
                                </>
                              )}
                              {parishesConvents[0].type === 'convent' && (
                                 <>
                                 <tr>
                                 <th>Congregation Name</th>
                                 <td>{parishesConvents[0].title}</td>
                               </tr>
                                <tr>
                                  <th>Convent Name</th>
                                  <td>{parishesConvents[0].parish_name},{parishesConvents[0].location}</td>
                                </tr>
                                </>
                              )}
                            </>
                          )}



                          {schoolDetails.lp_established_year !== "0000" && schoolDetails.lp_established_year !== null && (
                            <tr>
                              <th>LP Established Year</th>
                              <td>{schoolDetails.lp_established_year}</td>
                            </tr>

                          )}
                          {schoolDetails.up_established_year !== "0000" && schoolDetails.up_established_year !== null && (

                            <tr>
                              <th>UP Established Year</th>
                              <td>{schoolDetails.up_established_year}</td>
                            </tr>

                          )}
                          {schoolDetails.hs_established_year !== "0000" && schoolDetails.hs_established_year !== null && (

                            <tr>
                              <th>HS Established Year</th>
                              <td>{schoolDetails.hs_established_year}</td>
                            </tr>

                          )}
                          {schoolDetails.hss_established_year !== "0000" && schoolDetails.hss_established_year !== null && (

                            <tr>
                              <th>HSS Established Year</th>
                              <td>{schoolDetails.hss_established_year}</td>
                            </tr>


                          )}




                          <tr>
                            <th>Gender Type</th>
                            <td>{schoolDetails.school_gender_type}</td>
                          </tr>

                          <tr>
                            <th>Treasury</th>
                            <td>{schoolDetails.treasury_location}</td>
                          </tr>
                          <tr>
                            <th>School Type</th>
                            <td>{schoolDetails.school_type}</td>
                          </tr>
                        </tbody></table>


              
                    </div>
                  </div>
                </div>

              </div>

              <div className={`tab-pane fade ${activeTab === 'stafftab' ? 'show active' : ''}`} id="stafftab">
                {activeTab === 'stafftab' && <SchoolStaff school_id={school_id} />}
              </div>

              {/* classtab Content */}
              <div className={`tab-pane fade ${activeTab === 'classtab' ? 'show active' : ''}`} id="classtab">
      {classDetails.length > 0 ? (
        <>
          {renderStandardClassesTable()}
          {renderHigherClassesTable()}
          <div className="d-flex gap-4 p-4">
            <span className="text-danger fw-bold">* CS - Catholic Students, NCS - Non-Catholic Students</span>
          </div>
        </>
      ) : (
        <>
          <br></br>
          <div className="text-center"><strong>**** Class Details Not Found ****</strong></div>
        </>
      )}
    </div>

              {/* Tab 2 Content */}
              <div className={`tab-pane fade ${activeTab === 'tab2' ? 'show active' : ''}`} id="tab2">
                <h3>Tab 2 Content</h3>
                <p>This is where you can add content for Tab 2.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal show={editMode} onHide={closeEditModal} size="xxl">
        <Modal.Header closeButton>
          <Modal.Title>Edit School</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="fk_zone_id">
                  Zone <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  id="fk_zone_id"
                  name="fk_zone_id"
                  value={formData.fk_zone_id || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Zone</option>
                  {zones.map(zone => (
                    <option key={zone.zone_id} value={zone.zone_id}>{zone.zone_name}</option>
                  ))}
                </select>


                {formError.fk_zone_id && <div className="text-danger">{formError.fk_zone_id}</div>}
              </div>


              <div className="col-md-6">
                <label htmlFor="school_type">School Type <span className="text-danger">*</span></label>
                <select
                  id="school_type"
                  name="school_type"
                  className="form-select"
                  value={formData.school_type || ''}
                  onChange={handleChange}
                >
                  <option value="">Select School Type</option>
                  <option value="School">School</option>
                  <option value="TTI">TTI (Teachers Training Institute)</option>
                </select>
                {formError.school_type && <div className="text-danger">{formError.school_type}</div>}
              </div>








            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="district">
                  District <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  id="district"
                  name="district"
                  value={formData.district || ''}
                  onChange={handleChange}
                >
                  <option value="">Select District</option>
                  {districts.map((district, index) => (
                    <option key={index} value={district}>{district}</option>
                  ))}
                </select>
                {formError.district && <div className="text-danger">{formError.district}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="phone">
                  Phone <span className="text-danger"></span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
                {formError.phone && <div className="text-danger">{formError.phone}</div>}
              </div>
            </div>

            <div className="col-md-6">
              <label>Type <span className="text-danger">*</span></label>
              <div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="typeParish"
                    value="parish"
                    checked={formData.type === 'parish'}  // Ensure the radio button is checked based on formData.type
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
                    checked={formData.type === 'convent'}  // Ensure the radio button is checked based on formData.type
                    onChange={handleTypeChange}
                  />
                  <label className="form-check-label" htmlFor="typeConvent">Convent</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="typeGeneral"
                    value="general"
                    checked={formData.type === 'general'}  // Ensure the radio button is checked based on formData.type
                    onChange={handleTypeChange}
                  />
                  <label className="form-check-label" htmlFor="typeGeneral">General</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id="typeProcurator"
                    value="procurator"
                    checked={formData.type === 'procurator'}  // Ensure the radio button is checked based on formData.type
                    onChange={handleTypeChange}
                  />
                  <label className="form-check-label" htmlFor="typeProcurator">Procurator</label>
                </div>
              </div>
              {formError.type && <div className="text-danger">{formError.type}</div>}
            </div>





            {selectedType !== 'general' && (
              <>
                {/* Forane Dropdown for Parish */}
                {selectedType === 'parish' && (
                  <div className="mb-3">
                    <div className="col-md-6">
                      <label htmlFor="forane_id">Forane <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        id="forane_id"
                        name="forane_id"
                        value={selectedForane || formData.forane_id}  // Prefill with saved value (formData.forane_id)
                        onChange={handleForaneChange}
                      >
                        <option value="">Select Forane</option>
                        {foranes.map(forane => (
                          <option key={forane.forane_id} value={forane.forane_id}>
                            {forane.forane_name}
                          </option>
                        ))}
                      </select>
                      {formError.forane_id && <div className="text-danger">{formError.forane_id}</div>}
                    </div></div>
                )}

                {/* Parish Dropdown when Forane is selected */}
                {selectedType === 'parish' && selectedForane && (
                  <div className="mb-3">
                    <div className="col-md-6">
                      <label htmlFor="fk_parish_covent_id">Parish <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        id="fk_parish_covent_id"
                        name="fk_parish_covent_id"
                        value={formData.fk_parish_covent_id || ''}  // Prefill with saved value (formData.fk_parish_covent_id)
                        onChange={handleChange}
                      >
                     
                        <option value="">Select Parish</option>
                        {parishesConvents && parishesConvents.length > 0 ? (
                          parishesConvents.map(parish => (
                            <option key={parish.parish_id} value={parish.parish_id}>
                              {parish.parish_name}, {parish.location}
                            </option>
                          ))
                        ) : null}




                      </select>
                      {formError.fk_parish_covent_id && <div className="text-danger">{formError.fk_parish_covent_id}</div>}
                    </div> </div>
                )}

                {/* Congregation Dropdown for Convent */}
                {selectedType === 'convent' && (
                  <div className="mb-3">
                    <div className="col-md-6">
                      <label htmlFor="congregation_id">Congregation <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        id="congregation_id"
                        name="congregation_id"
                        value={selectedCongregation || formData.congregation_id || ''}  // Prefill with saved value (formData.congregation_id)
                        onChange={handleCongregationChange}
                      >
                        <option value="">Select Congregation</option>
                        {congregations.map(congregation => (
                          <option key={congregation.congregation_id} value={congregation.congregation_id}>
                            {congregation.title}
                          </option>
                        ))}
                      </select>
                      {formError.congregation_id && <div className="text-danger">{formError.congregation_id}</div>}
                    </div></div>
                )}

                {/* Convent Dropdown when Congregation is selected */}
                {selectedType === 'convent' && selectedCongregation && (
                  <div className="mb-3">
                    <div className="col-md-6">
                      <label htmlFor="fk_parish_covent_id">Convent <span className="text-danger">*</span></label>
                      <select
                        className="form-control"
                        id="fk_parish_covent_id"
                        name="fk_parish_covent_id"
                        value={formData.fk_parish_covent_id || ''}
                        onChange={handleChange}
                      >
                        <option value="">Select Convent</option>
                        {congregationConvents && Array.isArray(congregationConvents) && congregationConvents.map(convent => (
  <option key={convent.parish_id} value={convent.parish_id}>
    {convent.parish_name}, {convent.location}
  </option>
))}
                      </select>
                      {formError.fk_parish_covent_id && <div className="text-danger">{formError.fk_parish_covent_id}</div>}
                    </div>
                  </div>
                )}
              </>
            )}




            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="school_code">
                  School Code <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="school_code"
                  name="school_code"
                  value={formData.school_code || ''}
                  onChange={handleChange}
                />
                {formError.school_code && <div className="text-danger">{formError.school_code}</div>}
              </div>

              <div className="col-md-6">
                <label htmlFor="established_year">Year of Establishment</label>

                <div className="row">
                  {/* LP Section */}
                  <div className="col-md-3">
                    <label htmlFor="lp_established_year">LP</label>
                    <input
                      type="text"
                      className="form-control"
                      id="lp_established_year"
                      name="lp_established_year"
                    
                      value={formData.lp_established_year === "0000" ? "" : formData.lp_established_year || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,4}$/.test(value)) {
                          setFormData(prev => ({
                            ...prev,
                            lp_established_year: value
                          }));
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
                      value={formData.up_established_year === "0000" ? "" : formData.up_established_year || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,4}$/.test(value)) {
                          setFormData(prev => ({
                            ...prev,
                            up_established_year: value
                          }));
                          setFormError((prev) => ({
                            ...prev,
                            up_established_year: "",
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
                    <label htmlFor="hs_established_year">HS</label>
                    <input
                      type="text"
                      className="form-control"
                      id="hs_established_year"
                      name="hs_established_year"
                      value={formData.hs_established_year === "0000" ? "" : formData.hs_established_year || ""}
                    
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,4}$/.test(value)) {
                          setFormData(prev => ({
                            ...prev,
                            hs_established_year: value
                          }));
                          setFormError((prev) => ({
                            ...prev,
                            hs_established_year: "",
                          }));
                        } else {
                          setFormError((prev) => ({
                            ...prev,
                            hs_established_year: "Numbers with a maximum of 4 digits are allowed.",
                          }));
                        }
                      }}
                    />
                    {formError.hs_established_year && (
                      <div className="text-danger">{formError.hs_established_year}</div>
                    )}
                  </div>

                  {/* HSS Section */}
                  <div className="col-md-3">
                    <label htmlFor="hss_established_year">HSS</label>
                    <input
                      type="text"
                      className="form-control"
                      id="hss_established_year"
                      name="hss_established_year"
                     
                      value={formData.hss_established_year === "0000" ? "" : formData.hss_established_year || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d{0,4}$/.test(value)) {
                          setFormData(prev => ({
                            ...prev,
                            hss_established_year: value
                          }));
                          setFormError((prev) => ({
                            ...prev,
                            hss_established_year: "",
                          }));
                        } else {
                          setFormError((prev) => ({
                            ...prev,
                            hss_established_year: "Numbers with a maximum of 4 digits are allowed.",
                          }));
                        }
                      }}
                    />
                    {formError.hss_established_year && (
                      <div className="text-danger">{formError.hss_established_year}</div>
                    )}
                  </div>
                </div> </div>





            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="school_name">
                  School Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="school_name"
                  name="school_name"
                  value={formData.school_name || ''}
                  onChange={handleChange}
                />
                {formError.school_name && <div className="text-danger">{formError.school_name}</div>}
              </div>


              <div className="col-md-6">
                <label htmlFor="school_gender_type">
                  School Gender Type <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  id="school_gender_type"
                  name="school_gender_type"
                  value={formData.school_gender_type || ''}
                  onChange={handleChange}
                >
                  <option value="">Select Gender Type</option>
                  <option value="boys">Boys</option>
                  <option value="girls">Girls</option>
                  <option value="Co-education">Co-education</option>
                </select>
                {formError.school_gender_type && <div className="text-danger">{formError.school_gender_type}</div>}
              </div>

            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="location">
                  Location <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                />
                {formError.location && <div className="text-danger">{formError.location}</div>}
              </div>

              {formData.school_type === 'School' && (
              <div className="col-md-6">
                <label htmlFor="fk_class_level_id">
                  Class Levels <span className="text-danger">*</span>
                </label>
                <select
                  id="fk_class_level_id"
                  name="fk_class_level_id"
                  className="form-select"
                  value={formData.fk_class_level_id || ""} // Ensure fallback for undefined values
                  onChange={handleChange} // Update formData on change
                >
                  {/* Default option */}
                  <option value="">Select Class Level</option>

                  {/* Dynamically render options */}
                  {classlevels.map((level) => (
                    <option key={level.class_level_id} value={level.class_level_id}>
                      {level.class_level_name}
                    </option>
                  ))}
                </select>

                {/* Show error message if validation fails */}
                {formError.class_levels && <div className="text-danger">{formError.class_levels}</div>}
              </div>

                )}

            </div>




            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="address">
                  Address <span className="text-danger"></span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                />


                {formError.address && <div className="text-danger">{formError.address}</div>}
              </div>

              <div className="col-md-6">
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
                    <option key={treasure.treasury_id} value={treasure.treasury_id}>
                      {treasure.treasury_location}
                    </option>
                  ))}
                </select>
                {formError.treasury && <div className="text-danger">{formError.treasury}</div>}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="post_office">
                  Post Office <span className="text-danger"></span>
                </label>

                <input
                  type="text"
                  className="form-control"
                  id="post_office"
                  name="post_office"
                  value={formData.post_office || ''}
                  onChange={handleChange}
                />


                {formError.post_office && <div className="text-danger">{formError.post_office}</div>}
              </div>
              <div className="col-md-6">
                <label htmlFor="email">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
                {formError.email && <div className="text-danger">{formError.email}</div>}
              </div>

            </div>

            <div className="row mb-3">
  <div className="col-md-6">
    <label htmlFor="pin_no">
      Pin Number <span className="text-danger"></span>
    </label>
    <input
      type="text"
      className="form-control"
      id="pin_no"
      name="pin_no"
      value={formData.pin_no || ''}
      onChange={(e) => {
        const value = e.target.value;
        
        if (/^\d{0,6}$/.test(value)) {
          setFormData((prev) => ({
            ...prev,
            pin_no: value
          }));
          setFormError((prev) => ({
            ...prev,
            pin_no: ""
          }));
        } else {
          setFormError((prev) => ({
            ...prev,
            pin_no: "Pin number must be exactly 6 digits."
          }));
        }
      }}
    />
    {formError.pin_no && <div className="text-danger">{formError.pin_no}</div>}
  </div>
</div>


            <div className="row mb-3">

              <div className="mb-3">
                <div className="col-md-6">
                  <label htmlFor="dept_type">
                    Education Department <span className="text-danger">*</span>
                  </label>
                  <select
                    id="dept_type"
                    className="form-control"
                    name="dept_type"
                    value={formData.dept_type}  // Prefilled value
                    onChange={handleDepartmentChange}  // Update formData on change
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
                </div></div>

              {["rdd", "dde"].includes(formData.dept_type) && (
                <div className="mb-3">
                  <div className="col-md-6">
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
                  </div></div>
              )}

              {/* DDE and DEO Dropdowns */}
              {formData.dept_type === "deo" && (
                <div>
                  <div className="mb-3">
                    <div className="col-md-6">
                      <label htmlFor="dde-dropdown">
                        DDE Details <span className="text-danger">*</span>
                      </label>
                      <select
                        id="dde-dropdown"
                        className="form-control"
                        name="ddeDropdown"
                        value={formData.ddeDropdown}  // Prefilled value
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
                    </div>   </div>

                  <div className="mb-3">
                    <div className="col-md-6">
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
                  </div> </div>
              )}

              {/* AEO Dropdown */}
              {formData.dept_type === "aeo" && (
                <div>
                  <div className="mb-3">
                    <div className="col-md-6">
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
                    </div>  </div>

                  <div className="mb-3">
                    <div className="col-md-6">
                      <label htmlFor="deo-dropdown">
                        DEO Details <span className="text-danger">*</span>
                      </label>
                      <select
                        id="deo-dropdown"
                        className="form-control"
                        name="deoDropdown"
                        value={formData.deoDropdown}
                        onChange={handleChangeaeo}
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
                    </div>  </div>

                  <div className="mb-3">
                    <div className="col-md-6">
                      <label htmlFor="aeo-dropdown">
                        AEO Details <span className="text-danger">*</span>
                      </label>
                      <select
                        id="aeo-dropdown"
                        className="form-control"
                        name="aeoDropdown"
                        value={formData.aeoDropdown}
                        onChange={handleChange}
                      >
                        <option value="">Select AEO Option</option>
                        {aeoOptions.map((option) => (
                          <option key={option.dept_id} value={option.dept_id}>
                            {option.office_name}
                          </option>
                        ))}
                      </select>
                      {formError.aeoDropdown && (
                        <div className="text-danger">{formError.aeoDropdown}</div>
                      )}
                    </div>
                  </div>  </div>
              )}








            </div>



            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-success me-2" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
              <button type="button" className="btn btn-danger" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* <Modal show={changeImageModal} onHide={() => setChangeImageModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change School Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="file"
            className="form-control"
            onChange={handleImageChange}
          />
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-danger" onClick={() => setChangeImageModal(false)}>Cancel</button>
        </Modal.Footer>
      </Modal> */}

      <Modal show={cropModalIsOpen} onHide={() => setCropModalIsOpen(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Crop Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentEditingSchool && (
            <ImageCropper
              updateAvatar={(croppedImage) => handleEditImageUpdate(croppedImage)}
              closeModal={() => setCropModalIsOpen(false)}
            />
          )}
        </Modal.Body>
      </Modal>

      {/* Change Password Modal */}
      <Modal show={changePasswordModal} onHide={resetPasswordModal}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-3">
              <label htmlFor="new_password" className="form-label">
                New Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control" // Removed is-invalid class logic
                id="new_password"
                name="new_password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}

              />
              {formError.new_password && <div className="text-danger">{formError.new_password}</div>}
            </div>

            <div className="mb-3">
              <label htmlFor="confirm_password" className="form-label">
                Confirm New Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className="form-control" // Removed is-invalid class logic
                id="confirm_password"
                name="confirm_password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}

              />
              {formError.confirm_password && <div className="text-danger">{formError.confirm_password}</div>}
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-success me-2" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
              <button type="button" className="btn btn-danger" onClick={resetPasswordModal}>
                Cancel
              </button>
            </div>

          </form>
        </Modal.Body>
      </Modal>

    </>
  );
};

export default SchoolDetails;