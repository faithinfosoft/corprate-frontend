import React, { useState, useEffect } from "react";
import print_toast from "../utilities/Toaster.js";
import axios from "axios";
import globalVariables from "../Global.js";

const StaffSubjectsNew = (staff_id) => {
  const [formData, setFormData] = useState({
    class_level: "",
    subject_id: "",
  });
  const [formError, setFormError] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [staffSubjects, setStaffSubjects] = useState([]);
  const [classlevels, setClasslevels] = useState([]);
  const clearForm = () => {
    setFormData({
      class_level: "",
      subject_id: "",
    });
  };
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClassLevel, setSelectedClassLevel] = useState('');
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    setFormError((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  // const handleClassLevelChange = (classLevel) => {
  //   setFormData({
  //     ...formData,
  //     class_level: classLevel,
  //   });
  // };

  const handleClassLevelChange = async (classLevel) => {
    setFormData({
      ...formData,
      class_level: classLevel,
    });
   // setSelectedClassLevel(classLevel);
    //setSelectedSubject(""); // Reset subject selection
    setSubjects([]); // Clear previous subjects
  
    if (classLevel) {
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/subject/get_subject_class_level/${classLevel}`
        );
        setSubjects(response.data.data || []); // Update subjects
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    }
  };
  const handleSubmit = async (e) => { 
    e.preventDefault();

    console.log("Staff ID:", staff_id);
  
    if (!formData.class_level || !formData.subject_id) {
      setFormError({
        class_level: !formData.class_level ? "Class Level is required" : "",
        subject_id: !formData.subject_id ? "Subject is required" : "",
      });
      return;
    }
  
    const isSubjectAssigned = staffSubjects.some(
      (subject) =>
        subject.class_level === formData.class_level &&
        subject.fk_subject_id === formData.subject_id
    );
  
    if (isSubjectAssigned) {
      print_toast("error", "This activity has already been assigned to the staff member.");
      return;
    }
  
    try {
    
      const response = await axios.post(
        `${globalVariables.api_url}/staff_subject/saveSubject`,
        {
          fk_subject_id: formData.subject_id,
          fk_staff_id: staff_id, 
        }
      );
      
      if (response.data.status) {
        print_toast("success", "Subject submitted successfully");
        fetchStaffSubjects();
        clearForm();
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", "Error submitting form");
      console.error("Error submitting form:", error);
    }
  };
  
  

  const handleDelete = async (staffSubjectId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${globalVariables.api_url}/staff_subject/delete/${staffSubjectId}`
      );

      if (response.data.status) {
        print_toast("success", "Record deleted successfully");
        setStaffSubjects((prevSubjects) =>
          prevSubjects.filter(
            (subject) => subject.staff_subject_id !== staffSubjectId
          )
        );
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      print_toast("error", "Error deleting record");
      console.error("Error deleting record:", error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/staff_subject/getAllActivities`
        );
        if (response.data.status) {
          setSubjects(response.data.data);
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };


  useEffect(() => {
    if (formData.class_level) {
      const filtered = subjects.filter(
        (subject) => subject.class_level === formData.class_level
      );
      setFilteredSubjects(filtered);
    } else {
      setFilteredSubjects([]);
    }
  }, [formData.class_level, subjects]);


    const fetchStaffSubjects = async () => {
      try {
        const response = await axios.get(
          `${globalVariables.api_url}/staff_subject/getStaffSubjects`
        );
        if (response.data.status) {
          setStaffSubjects(response.data.data);
        } else {
          print_toast("error", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching staff subjects:", error);
      }
    };
    useEffect(() => {
    fetchStaffSubjects();
  }, []);
  const fetchClasslevels = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/class-strength/get_classs_levels`
      );
      if (response.data.status) {
        setClasslevels(response.data.data);
      } else {
        setClasslevels([]);
      }
    } catch (error) {
      console.error("Error fetching classes:", error.message);
    }
  };

  // Fetch class levels on component mount
  useEffect(() => {
    fetchClasslevels();
  }, []);
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Subject Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th scope="col">Sl.No</th>
                      <th scope="col">Class Level</th>
                      <th scope="col">Subject</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffSubjects.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No class-subject mappings available
                        </td>
                      </tr>
                    ) : (
                      staffSubjects.map((subject, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{subject.class_level_name	}</td>
                          <td>{subject.subject_name}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                
                                handleDelete(subject.staff_subject_id)
                              }
                            >
                              Delete
                            </button>
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
              <h5 className="card-title">Add Subject Details</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Select Class Level:</label>

                  <select
        id="class_level"
        className="form-select"
        value={formData.class_level}
        onChange={(e) => handleClassLevelChange(e.target.value)}
        >
  <option value="">Select Class Level</option>
                   
                  
{classlevels.map((level) => (
<option key={level.class_level_id} value={level.class_level_id}>
{level.class_level_name}
</option>
))}
      </select>

      
                 
                  {formError.class_level && (
                    <div className="text-danger">{formError.class_level}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Select Subject:</label>
                  <select
                    name="subject_id"
                    className="form-control"
                    value={formData.subject_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.subject_id} value={subject.subject_id}>
                        {subject.subject_name}
                      </option>
                    ))} 
                     
                  </select>
                  {formError.subject_id && (
                    <div className="text-danger">{formError.subject_id}</div>
                  )}
                </div>

                <div className="d-flex justify-content-end">
                  <button type="submit" className="btn btn-success">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffSubjectsNew;
