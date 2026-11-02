import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import Modal from 'react-bootstrap/Modal';
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';
import DataTable from "react-data-table-component";
import { capitalizeWords } from '../utilities/dateconverter';
const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
    const [classlevels, setClasslevels] = useState([]);

    const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);
const [tableData, setTableData] = useState([]);
     const [showTable, setShowTable] = useState(false);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Subject', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_name: '',
    fk_class_level_id: '', 
    save_flag: false,
    subject_type: '',
});

   const dataTableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subject, setSubject] = useState({});
  const [activeTab, setActiveTab] = useState('academic');
  const [subjectType, setSubjectType] = useState('Academic Subject'); 
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subject_code: '',
    subject_name: '',
   class_level: '',
    subject_type: '',  
    fk_class_level_id: '',
});
const handlePageChange = page => {
  setCurrentPage(page);
};

// Add this handler to track rows per page changes
const handlePerRowsChange = (newRowsPerPage, page) => {
  setRowsPerPage(newRowsPerPage);
};
  const [modalErrors, setModalErrors] = useState({});

  const classLevels = ['lp', 'up', 'hs', 'hse'];
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


  const fetchSubjects = async (subjectType = activeTab) => {
    try {
      const response = await axios.get(globalVariables.api_url + `/subject/view_subjects/${subjectType}`);
      
      if (response.data.status) {
        setSubjects(response.data.data);
        setTableData(response.data);
        setShowTable(true);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      print_toast("error", "Failed to fetch Subject data");
    }
  };
  
  useEffect(() => {
    fetchSubjects(activeTab);
  }, [activeTab]);

  


  const handleTabClick = (type) => {
    setSubjectType(type); 
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    console.log("Field Name:", name, "New Value:", value);
  
    if (modalIsOpen) {
      setEditFormData((prevData) => {
        const updatedData = {
          ...prevData,
          [name]: value,
          ...(name === "subject_type" && value === "Specialist Subject" ? { fk_class_level_id: "" } : {}),
          ...(name === "subject_type" && value === "Academic Subject" && prevData.fk_class_level_id === "" ? { fk_class_level_id: '' } : {}),
        };
        console.log("Updated Data in Modal:", updatedData);
        return updatedData;
      });
      setModalErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    } else {
      setFormData((prevData) => {
        const updatedData = {
          ...prevData,
          [name]: value,
          ...(name === "subject_type" && value === "Specialist Subject" ? { fk_class_level_id: "" } : {}),
          ...(name === "subject_type" && value === "Academic Subject" && prevData.fk_class_level_id === "" ? { fk_class_level_id: '' } : {}),
        };
        console.log("Updated Data in Non-Modal:", updatedData);
        return updatedData;
      });
      setFormError((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };
  
  
  
  

  const clearSubjectForm = () => {
    setFormData({
      subject_code: '',
      subject_name: '',
      class_level: '',
      fk_class_level_id: '', 
      save_flag: false,
      subject_type:'',
    });
    setFormError({});
  };

  
  useEffect(() => {
    console.log("Subjects updated:", subjects);
  }, [subjects]);  
  
  const saveSubject = async (e) => {
    e.preventDefault();
    
    let errors = {};
    if (!formData.subject_type) {
      errors.subject_type = "Subject Type is required.";
    }
    if (formData.subject_type === "Academic Subject" && !formData.class_level) {
      errors.class_level = "Class Level is required for Academic Subject.";
    }
    if (!formData.subject_code) {
      errors.subject_code = "Subject Code is required.";
    }
    if (!formData.subject_name) {
      errors.subject_name = "Subject Name is required.";
    }
  
    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      return;
    }
  
    setFormData((prevData) => ({
      ...prevData,
      save_flag: true,
    }));
  
    try {
      const response = await axios.post(
        globalVariables.api_url + '/subject/save_subject', 
        formData, 
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
  
      if (response.data.status) {
        await fetchSubjects();
        clearSubjectForm();
        print_toast("success", response.data.message);
      } else {
        // Server-side errors
        const serverErrors = response.data.error || {};
        
        // Set form errors (will show under text boxes)
        setFormError(serverErrors);
        
        // Show toast notification
        if (serverErrors.subject_name) {
          print_toast("error", serverErrors.subject_name);
        } else if (response.data.message) {
          print_toast("error", response.data.message);
        } else {
          print_toast("error", "Something went wrong.");
        }
      }
    } catch (error) {
      console.error('Error saving Subject:', error);
      if (error.response?.data?.error) {
        setFormError(error.response.data.error);
      }
      print_toast("error", error.response?.data?.message || "Failed to save Subject");
    } finally {
      setFormData((prevData) => ({
        ...prevData,
        save_flag: false,
      }));
    }
  };

  const deleteSubject = async (_subject) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to delete this Subject?');
      if (!confirmDelete) return;

      console.log('Attempting to delete subject:', _subject);
  
      const formData = new FormData();
      formData.append('subject_id', _subject.subject_id);
      
      console.log('Sending delete request with data:', formData);
      
      const response = await axios.post(globalVariables.api_url + '/subject/delete_subject', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Received response:', response);
  
      if (response.data.status) {
        setSubjects(prevSubjects => prevSubjects.filter((subject) => subject.subject_id !== _subject.subject_id));
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error('Error deleting Subject:', error);
      print_toast("error", "Failed to delete Subject");
    }
  };

  const editSubject = (_subject) => {
    setSubject(_subject);
    setEditFormData({
      subject_code: _subject.subject_code || '',
      subject_name: _subject.subject_name,
      fk_class_level_id: _subject.fk_class_level_id,
      subject_type: _subject.subject_type,
    });
    setModalIsOpen(true);
  };
  


console.log("editFormData before submitting:", editFormData);

const updateSubject = async (e) => {
  e.preventDefault();
  if (editFormData.save_flag) return;

  // Validation
  let errors = {};
  if (!editFormData.subject_type) {
    errors.subject_type = "Subject Type is required.";
  }
  if (editFormData.subject_type === "Academic Subject" && !editFormData.fk_class_level_id) {
    errors.class_level = "Class Level is required for Academic Subject.";
  }
  if (!editFormData.subject_code) {
    errors.subject_code = "Subject Code is required.";
  }
  if (!editFormData.subject_name) {
    errors.subject_name = "Subject Name is required.";
  }

  // If there are validation errors, set them and return
  if (Object.keys(errors).length > 0) {
    setModalErrors(errors);
    return;
  }

  setEditFormData((prevData) => ({
    ...prevData,
    save_flag: true,
  }));

  try {
    const formDataToUpdate = {
      subject_id: subject.subject_id,
      subject_code: editFormData.subject_code,
      subject_name: editFormData.subject_name,
      subject_type: editFormData.subject_type,
      class_level: editFormData.fk_class_level_id || "",  
    };

    console.log("Form data to update:", formDataToUpdate); 

    const response = await axios.post(
      globalVariables.api_url + "/subject/update_subject",
      formDataToUpdate,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.status) {
      await fetchSubjects();
      clearSubjectForm();
      print_toast("success", response.data.message);
      setModalIsOpen(false);
    } else {
      print_toast("error", response.data.message);
      setModalErrors(response.data.error || {});  
    }
  } catch (error) {
    console.error("Error updating Subject:", error.message);
    if (error.response?.data?.error) {
      setModalErrors(error.response.data.error);
    }
    print_toast("error", "Failed to update Subject");
  } finally {
    setEditFormData((prevData) => ({
      ...prevData,
      save_flag: false,
    }));
  }
};

let serialNumber = 1;
let slno = 1;



const getColumns = () => {
  const commonColumns = [
    {
      name: "Sl No.",
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
      minWidth: "50px",
    },
    {
      name: "Subject Code",
      selector: (row) => row.subject_code,
      sortable: true,
      minWidth: "120px",
    },
    {
      name: "Subject Name",
      selector: (row) => row.subject_name,
      sortable: true,
      minWidth: "180px",
    },
    {
      name: "Actions",
      minWidth: "150px",
      cell: (row) => (
        <div className="dropdown">
          <button
            className="btn btn-dark dropdown-toggle btn-sm"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Action
          </button>
          <ul className="dropdown-menu">
            <li>
              <a href="#!" className="dropdown-item" onClick={() => editSubject(row)}>
                Edit
              </a>
            </li>
            <li>
              <a href="#!" className="dropdown-item" onClick={() => deleteSubject(row)}>
                Delete
              </a>
            </li>
          </ul>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Add "Class Level" column only for Academic Subjects
  if (activeTab === "academic") {
    return [
      ...commonColumns.slice(0, 3), // Keep "Sl No.", "Subject Code" and "Subject Name"
      {
        name: "Class Level",
        selector: (row) => row.class_level_name,
        sortable: true,
        minWidth: "150px",
      },
      ...commonColumns.slice(3), // Keep "Actions"
    ];
  }

  return commonColumns; // Return without "Class Level" for Specialist Subjects
};


  useEffect(() => {
    const tabFiltered = subjects.filter((s) =>
      activeTab === "academic"
        ? s.subject_type === "Academic Subject"
        : s.subject_type === "Specialist Subject"
    );

    if (!searchTerm.trim()) {
      setFilteredSubjects(tabFiltered);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredSubjects(
        tabFiltered.filter(
          (s) =>
            (s.subject_code?.toLowerCase() || "").includes(lowerSearch) ||
            (s.subject_name?.toLowerCase() || "").includes(lowerSearch) ||
            (s.class_level_name?.toLowerCase() || "").includes(lowerSearch)
        )
      );
    }
  }, [activeTab, subjects, searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };
  return (
    <>
      <Breadcum items={breadcum} title="Subject Details" />

      <div className="row">
      <div className="col-lg-8">
      <div className="card">
        <div className="card-header">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === "academic" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("academic");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                href="#!"
              >
                Academic Subjects
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${activeTab === "specialist" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("specialist");
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                href="#!"
              >
                Specialist Subjects
              </a>
            </li>
          </ul>
        </div>

          <div className="card">

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
      
       

        <div className="table-container">
                {showTable ? (
                  <DataTable
                 // title={activeTab === "academic" ? "Academic Subjects" : "Specialist Subjects"}
                   className="custom-data-table"
                    columns={getColumns()}
                    data={filteredSubjects}
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
        </div></div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Create Subject</h5>
            </div>
<div className="card-body">
  <form role="form" onSubmit={saveSubject} className="row g-3">
    <div className="col-12">
      <label htmlFor="subject_type" className="col-sm-12 col-form-label">
        Subject Type <span className="text-danger">*</span>
      </label>
      <select
        className="form-select"
        id="subject_type"
        name="subject_type"
        value={formData.subject_type}
        onChange={handleChange}
      >
        <option value="">Select Subject Type</option>
        <option value="Academic Subject">Academic Subject</option>
        <option value="Specialist Subject">Specialist Subject</option>
      </select>
      <span className="text-danger">{formError.subject_type}</span>
    </div>

    {/* Conditionally Render Class Level Dropdown if Academic Subject is selected */}
    {formData.subject_type === "Academic Subject" && (
  <div className="col-12">
    <label htmlFor="class_level" className="col-sm-12 col-form-label">
      Class Level <span className="text-danger">*</span>
    </label>
    <select
  className="form-select"
  id="class_level"
  name="class_level"
  value={formData.class_level || ""}  
  onChange={handleChange}
>
  <option value="">Select Class Level</option>
  {classlevels.map((level) => (
    <option key={level.class_level_id} value={level.class_level_id}>
      {level.class_level_name}
    </option>
  ))}
</select>

    <span className="text-danger">{formError.class_level}</span>
  </div>
)}


    {/* Subject Code Field */}
    <div className="col-12">
      <label htmlFor="subject_code" className="col-sm-12 col-form-label">
        Subject Code <span className="text-danger">*</span>
      </label>
      <input
        type="text"
        className="form-control"
        id="subject_code"
        name="subject_code"
        placeholder="Enter Subject Code"
        value={formData.subject_code}
        onChange={handleChange}
      />
      <span className="text-danger">{formError.subject_code}</span>
    </div>

    {/* Always Show Subject Name Field */}
    <div className="col-12">
      <label htmlFor="subject_name" className="col-sm-12 col-form-label">
        Subject Name <span className="text-danger">*</span>
      </label>
      <input
        type="text"
        className="form-control"
        id="subject_name"
        name="subject_name"
        placeholder="Enter Subject Name"
        value={formData.subject_name}
        onChange={handleChange}
      />
      <span className="text-danger">{formError.subject_name}</span>
    </div>

    <div className="col-12 text-end">
      <button type="submit" className="btn btn-success m-1primary" disabled={formData.save_flag}>
        {formData.save_flag ? "Saving..." : "Save"}
      </button>
      <button type="reset" className="btn btn-danger m-1" onClick={clearSubjectForm}>
        Cancel
      </button>
    </div>
  </form>
</div>

          </div>
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit Subject</Modal.Title>
        </Modal.Header>
        <Modal.Body>
<form role="form" onSubmit={updateSubject} className="row g-3">
 
<div className="col-12">
  <label htmlFor="edit_subject_type" className="col-sm-12 col-form-label">
    Subject Type<span className="text-danger">*</span>
  </label>
  <select
    className="form-select"
    id="edit_subject_type"
    name="subject_type"
    value={editFormData.subject_type}
    onChange={handleChange}
  >
    <option value="">Select Subject Type</option>
    <option value="Academic Subject">Academic Subject</option>
    <option value="Specialist Subject">Specialist Subject</option>
  </select>
  <span className="text-danger">{modalErrors.subject_type}</span>
</div>


{editFormData.subject_type === "Academic Subject" && (
  <div className="col-12">
    <label htmlFor="edit_class_level" className="col-sm-12 col-form-label">
      Class Level<span className="text-danger">*</span>
    </label>
    <select
      className="form-select"
      id="edit_class_level"
      name="fk_class_level_id"  
      value={editFormData.fk_class_level_id}  
      onChange={handleChange}
    >
      <option value="">Select Class Level</option>
      {classlevels.map((level) => (
        <option key={level.class_level_id} value={level.class_level_id}>
          {level.class_level_name}
        </option>
      ))}
    </select>
    <span className="text-danger">{modalErrors.class_level}</span>
  </div>
)}

 
  <div className="col-12">
    <label htmlFor="edit_subject_code" className="col-sm-12 col-form-label">Subject Code<span className="text-danger">*</span></label>
    <input
      type="text"
      className="form-control"
      id="edit_subject_code"
      name="subject_code"
      placeholder="Enter Subject Code"
      value={editFormData.subject_code}
      onChange={handleChange}
    />
    <span className="text-danger">{modalErrors.subject_code}</span>
  </div>

  <div className="col-12">
    <label htmlFor="edit_subject_name" className="col-sm-12 col-form-label">Subject Name<span className="text-danger">*</span></label>
    <input
      type="text"
      className="form-control"
      id="edit_subject_name"
      name="subject_name"
      placeholder="Enter Subject Name"
      value={editFormData.subject_name}
      onChange={handleChange}
    />
    <span className="text-danger">{modalErrors.subject_name}</span>
  </div>

  <div className="col-12 text-end">
    <button type="submit" className="btn btn-success m-1primary" disabled={editFormData.save_flag}>
      {editFormData.save_flag ? 'Updating...' : 'Update'}
    </button>
    <button
  type="button"
  onClick={() => {
    clearSubjectForm();
    setModalErrors({});  // Clear errors when closing the modal
    setModalIsOpen(false);
  }}
  className="btn btn-danger m-1"
>
  Cancel
</button>  </div>
</form>

        </Modal.Body>
      </Modal>
    </>
  );
};

export default Subject;