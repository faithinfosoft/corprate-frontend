import React, { useState, useEffect } from "react";
import Breadcum from "../Breadcum";
import axios from "axios";
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import useAuth from "../../utilities/useAuth";
import { Modal, Button, Form } from "react-bootstrap";
import { useData } from "./SchoolEvaluationForm";
import Multiselect from "multiselect-react-dropdown";

const SchoolInnovationsForm = () => {
    const auth = useAuth();
  const { evaluationDocumentDetails } = useData();
  const academicYearId = evaluationDocumentDetails.academic_year_id;
  const schoolId = evaluationDocumentDetails.school_id;
  const year_label = evaluationDocumentDetails.year_label;
  const [staffList, setStaffList] = useState([]);
  const [saveFlag, setSaveFlag] = useState(false);
  const [innovations, setInnovations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInnovation, setSelectedInnovation] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedSupportingStaff, setSelectedSupportingStaff] = useState([]);
  const school_id = auth.user.user_id;
  const [formData, setFormData] = useState({
    programme_name: "",
    fk_staff_id_in_charge: "",
    fk_staff_id_supporting: [],
    participant_count: "",
    direct_beneficiaries_count: "",
    indirect_beneficiaries_count: "",
    individual_student_benefits: "",
    total_students_benefits: "",
    school_benefits: ""
  });

  // Fetch existing data when component mounts
  useEffect(() => {
    if (schoolId && academicYearId) {
      fetchInnovations();
     // fetchStaff();
    }
  }, [schoolId, academicYearId]);

  // Fetch staff data
  const fetchStaff = async () => {
    try {

      
      const response = await axios.get(
        `${globalVariables.api_url}/schoolinnovations/fetch_staff/${school_id}`
      );
      if (response.data.status) {
        // Transform staff data to include label property for Multiselect
        const transformedStaffList = response.data.data.map(staff => ({
          ...staff,
          label: staff.staff_official_name,
          value: staff.staff_id
        }));
        setStaffList(transformedStaffList);
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      setStaffList([]);
    }
  };
  useEffect(() => {
    fetchStaff();
  }, [school_id]);
  // Fetch innovations data
  const fetchInnovations = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/schoolinnovations/view_innovations`, {
        params: {
          fk_school_id: school_id,
          fk_academic_year_id: academicYearId
        }
      });

      if (response.data && response.data.data) {
        setInnovations(response.data.data);
      } else {
        setInnovations([]);
      }
    } catch (error) {
      console.error("Error fetching innovations:", error);
      print_toast("error", "Failed to fetch innovations data.");
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      programme_name: "",
      fk_staff_id_in_charge: "",
      fk_staff_id_supporting: [],
      participant_count: "",
      direct_beneficiaries_count: "",
      indirect_beneficiaries_count: "",
      individual_student_benefits: "",
      total_students_benefits: "",
      school_benefits: ""
    });
    setSelectedSupportingStaff([]);
    setErrors({});
  };

  // Handle opening the modal for adding new innovation
  const handleOpenAddModal = () => {
    resetForm();
    setIsEditMode(false);
    setShowModal(true);
  };

  // Handle opening the modal for editing existing innovation
  const handleOpenEditModal = (innovation) => {
    // Find selected supporting staff from IDs
    const supportingStaffIds = innovation.fk_staff_id_supporting ? 
      innovation.fk_staff_id_supporting.split(',').map(id => parseInt(id)) : [];
    
    const supportingStaffList = staffList.filter(staff => 
      supportingStaffIds.includes(staff.value)
    );

    setFormData({
      programme_name: innovation.programme_name || "",
      fk_staff_id_in_charge: innovation.fk_staff_id_in_charge || "",
      fk_staff_id_supporting: supportingStaffIds || [],
      participant_count: innovation.participant_count || "",
      direct_beneficiaries_count: innovation.direct_beneficiaries_count || "",
      indirect_beneficiaries_count: innovation.indirect_beneficiaries_count || "",
      individual_student_benefits: innovation.individual_student_benefits || "",
      total_students_benefits: innovation.total_students_benefits || "",
      school_benefits: innovation.school_benefits || ""
    });
    
    setSelectedSupportingStaff(supportingStaffList);
    setSelectedInnovation(innovation);
    setIsEditMode(true);
    setShowModal(true);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle supporting staff multi-select
  const handleSupportingStaffChange = (selectedList) => {
    setSelectedSupportingStaff(selectedList);
    
    // Handle "Select All" option
    if (selectedList.some(item => item.value === 'all')) {
      const allStaffExceptAll = staffList.filter(staff => staff.value !== 'all');
      setSelectedSupportingStaff(allStaffExceptAll);
      setFormData(prev => ({
        ...prev,
        fk_staff_id_supporting: allStaffExceptAll.map(staff => staff.value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        fk_staff_id_supporting: selectedList.map(staff => staff.value)
      }));
    }

    // Clear error if exists
    if (errors.fk_staff_id_supporting) {
      setErrors(prev => ({
        ...prev,
        fk_staff_id_supporting: ""
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveFlag(true);
    
    try {
      const url = `${globalVariables.api_url}/schoolinnovations/${isEditMode ? 'update' : 'save'}`;
      
      // Prepare data for submission
      const requestData = {
        fk_school_id: school_id,
        fk_academic_year_id: academicYearId,
        academic_label: year_label,
        ...formData,
        // Convert supporting staff array to comma-separated string if needed by API
        fk_staff_id_supporting: formData.fk_staff_id_supporting.join(',')
      };

      if (isEditMode && selectedInnovation) {
        requestData.innovation_id = selectedInnovation.innovation_id;
      }

      const response = await axios.post(url, requestData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
         
        }
      });
      

      if (response.data.status) {
        print_toast("success", isEditMode ? 
          "Innovation details updated successfully!" : 
          "Innovation details added successfully!");
        
        setShowModal(false);
        fetchInnovations();
      } else {
        if (response.data.errors) {
          setErrors(response.data.errors);
        } else {
          print_toast("error", response.data.message || "Operation failed.");
        }
      }
    } catch (error) {
      console.error("Error saving innovation data:", error);
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        print_toast("error", "Failed to save innovation details.");
      }
    } finally {
      setSaveFlag(false);
    }
  };

  // Handle delete innovation
  const handleDelete = async (innovation_id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this innovation?");
    
    if (!confirmDelete) {
      return;
    }
    
    try {
      const response = await axios.post(`${globalVariables.api_url}/schoolinnovations/delete`, {
        innovation_id: innovation_id
      });
      
      if (response.data.status) {
        print_toast("success", "Innovation deleted successfully!");
        fetchInnovations();
      } else {
        print_toast("error", response.data.message || "Failed to delete innovation.");
      }
    } catch (error) {
      console.error("Error deleting innovation:", error);
      print_toast("error", "An error occurred while deleting data.");
    }
  };

  // Function to find staff name from ID
  const getStaffNameById = (staffId) => {
    const staff = staffList.find(s => s.staff_id === parseInt(staffId));
    return staff ? staff.staff_official_name : "Unknown";
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title mb-0">Innovations in school</h5>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <i className="fas fa-plus"></i> Add Innovation
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th className="text-center">Sl No</th>
                  <th>Programme Name</th>
                  <th>Teacher In-charge</th>
                  <th>Participants</th>
                  <th>Beneficiaries</th>
                  <th>Benefit for individual students</th>
                  <th>Benefits for total students</th>
                  <th>Benefit for school </th>
              
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {innovations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No innovations added yet.
                    </td>
                  </tr>
                ) : (
                  innovations.map((item, index) => (
                    <tr key={item.innovation_id || index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{item.programme_name}</td>
                      <td className="text-center">
                            {staffList.find(
                              (staff) => staff.staff_id === item.fk_staff_id_in_charge
                            )?.staff_official_name || "N/A"}
                          </td>
                      {/* <td>{getStaffNameById(item.fk_staff_id_in_charge)}</td> */}
                      <td>{item.participant_count}</td>
                      <td>
                        Direct: {item.direct_beneficiaries_count}<br />
                        Indirect: {item.indirect_beneficiaries_count}
                      </td>
                      <td>{item.individual_student_benefits}</td>
                      <td>{item.total_students_benefits}</td>
                      <td>{item.school_benefits}</td>
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
                          <ul
                            className="dropdown-menu"
                            aria-labelledby={`dropdownMenuButton${index}`}
                          >
                            <li>
                              <button
                                className="dropdown-item"
                                onClick={() => handleOpenEditModal(item)}
                              >
                                Edit
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item text-danger"
                                onClick={() => handleDelete(item.innovation_id)}
                              >
                                Delete
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

      {/* Modal for Add/Edit Innovation */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? "Edit Innovation" : "Add Innovation"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Name of the programme <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="programme_name"
                    value={formData.programme_name}
                    onChange={handleInputChange}
                    isInvalid={!!errors.programme_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.programme_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Teacher In-charge <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="fk_staff_id_in_charge"
                    value={formData.fk_staff_id_in_charge}
                    onChange={handleInputChange}
                    isInvalid={!!errors.fk_staff_id_in_charge}
                  >
                    <option value="">Select Teacher In-charge</option>
                    {staffList.map((staff) => (
                      <option key={staff.staff_id} value={staff.staff_id}>
                        {staff.staff_official_name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.fk_staff_id_in_charge}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Supporting Teachers <span className="text-danger">*</span></Form.Label>
                  <div className="form-control p-0 border-0">
                    <Multiselect
                      options={[{ label: 'Select All', value: 'all' }, ...staffList]}
                      selectedValues={selectedSupportingStaff}
                      onSelect={handleSupportingStaffChange}
                      onRemove={handleSupportingStaffChange}
                      displayValue="label"
                      showCheckbox={true}
                      placeholder="Select Supporting Teachers"
                      hidePlaceholder={true}
                      closeOnSelect={false}
                      avoidHighlightFirstOption={true}
                      showArrow={true}
                    />
                  </div>
                  {errors.fk_staff_id_supporting && <div className="text-danger">{errors.fk_staff_id_supporting}</div>}
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Number of participants <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="participant_count"
                    value={formData.participant_count}
                    onChange={handleInputChange}
                    isInvalid={!!errors.participant_count}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.participant_count}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Number of direct beneficiaries <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="direct_beneficiaries_count"
                    value={formData.direct_beneficiaries_count}
                    onChange={handleInputChange}
                    isInvalid={!!errors.direct_beneficiaries_count}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.direct_beneficiaries_count}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>

              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Number of indirect beneficiaries <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="indirect_beneficiaries_count"
                    value={formData.indirect_beneficiaries_count}
                    onChange={handleInputChange}
                    isInvalid={!!errors.indirect_beneficiaries_count}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.indirect_beneficiaries_count}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Benefit for individual students <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="individual_student_benefits"
                    value={formData.individual_student_benefits}
                    onChange={handleInputChange}
                    isInvalid={!!errors.individual_student_benefits}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.individual_student_benefits}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Benefits for total students <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="total_students_benefits"
                    value={formData.total_students_benefits}
                    onChange={handleInputChange}
                    isInvalid={!!errors.total_students_benefits}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.total_students_benefits}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>Benefit for school <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="school_benefits"
                    value={formData.school_benefits}
                    onChange={handleInputChange}
                    isInvalid={!!errors.school_benefits}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.school_benefits}
                  </Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
         
          <Button variant="success" onClick={handleSubmit} disabled={saveFlag}>
            {saveFlag ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Update" : "Save")}
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SchoolInnovationsForm;