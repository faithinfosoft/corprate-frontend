import React, { useState, useEffect } from "react";
import axios from "axios";
import globalVariables from "../../Global.js";
import Breadcum from "../Breadcum";
import print_toast from "../../utilities/Toaster.js";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import useAuth from "../../utilities/useAuth";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import { useData } from "./SchoolEvaluationForm";
const SchoolActivities = () => {
  const { evaluationDocumentDetails } = useData();
  const academicYearId = evaluationDocumentDetails.academic_year_id;
  const school_id = evaluationDocumentDetails.school_id;
 
  const auth = useAuth();

  const navigate = useNavigate();
  const [responses, setResponses] = useState({
    activity_title: "",
    description: "",
    no_of_days: "",
    pdf_file: "",
    activity_start_date: "",
    created_date: "",
    fk_school_id: school_id,
  });

  const [editResponses, setEditResponses] = useState({
    activity_title: "",
    description: "",
    no_of_days: "",
    pdf_file: "",
    activity_start_date: "",
    created_date: "",
    selectedType: "",
    activity_type: "",
  });

  const [breadcum, setBreadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "School Activities", Link: "" },
  ]);

  const [errors, setErrors] = useState({
    activity_title: "",
    description: "",
    no_of_days: "",
    pdf_file: "",
    activity_start_date: "",
    created_date: "",
    selectedType: "",
  });

  const [editErrors, setEditErrors] = useState({
    activity_title: "",
    description: "",
    no_of_days: "",
    pdf_file: "",
    activity_start_date: "",
    created_date: "",
    camp_name: "",
    no_of_participants: "",
    venue: "",
    no_of_holymass: "",
    education_classes_conducted: "",
    trainer_name: "",
    celebration_item: "",
    celebration_guest: "",
    club: "",
    agenda: "",
    activities_done: "",
  });

  const months = [
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
    "january",
    "february",
    "march",
  ];
  const [activityTypes, setActivityTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [newPdf, setNewPdf] = useState(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [newDocument, setNewDocument] = useState(null);
  const [changeDocError, setChangeDocError] = useState("");
  const [activeTab, setActiveTab] = useState("june");
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");

  const [academicYear, setAcademicYear] = useState({
    start_date: "",
    end_date: "",
  });

  const openDocModal = (activity) => {
    setSelectedActivity(activity);
    setIsDocModalOpen(true);
  };
  const closeDocModal = () => {
    setIsDocModalOpen(false);
    setNewPdf(null);
  };

  const closeModal = () => {
    setSelectedActivity(null);
    setNewPdf(null);
  };
  const handleFileChange = (event) => {
    setNewPdf(event.target.files[0]);
  };

  const handleMoreInfo = (school_activity_id) => {
    navigate(`/schoolmedia/${school_activity_id}`);
  };

  const handleOpenAddModal = () => {
    setResponses((prev) => ({
      ...prev,
      activity_title: "",
      description: "",
      no_of_days: "",
      pdf_file: "",
      created_date: "",
    }));

    setErrors({});
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setResponses({
      activity_start_date: "",
      activity_title: "",
      description: "",
      no_of_days: "",
      pdf_file: null,
    });

    setErrors({});

    setSelectedType("");
    setIsSaving(false);
    setIsAddModalOpen(false);
  };

  const filteredActivities = activityData.filter(
    (activity) => activity.activity_month.toLowerCase() === activeTab
  );

  const handleInputChange = (field, value) => {
    if (field === "pdf_file") {
      setResponses({
        ...responses,
        [field]: value.target.files[0],
      });
    } else {
      setResponses({
        ...responses,
        [field]: value,
      });
    }

    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }

    if (field === "selectedType") {
      let resetFields = {};

      if (value === "Religion/Moral Science Education") {
        resetFields = {
          retreat_value_classes: "",
          trainer_name: "",
        };
      } else if (value === "KCSL") {
        resetFields = {
          name_of_camp: "",
          number_of_participants: "",
          venue: "",
          number_of_holy_mass: "",
        };
      } else if (value === "Celebrations") {
        resetFields = {
          item: "",
          guest: "",
        };
      } else if (value === "Socially Useful Productive Work") {
        resetFields = {
          activity: "",
          participation_students: "",
          participation_teachers: "",
          brief_description: "",
        };
      } else if (value === "Club Activities") {
        resetFields = {
          club: "",
          activities: "",
        };
      } else if (value === "School Assembly") {
        resetFields = {
          purpose: "",
          guest_addressed_students: "",
          manager_address_count: "",
        };
      } else if (value === "Student Council") {
        resetFields = {
          agenda: "",
          activities_done: "",
        };
      } else if (value === "Study Tour") {
        resetFields = {
          no_of_students: "",
          places_visited: "",
        };
      }

      setResponses({
        ...responses, // Keep previous values
        selectedType: value,
        ...resetFields, // Reset only the fields for the selected type
      });
    }
  };

  const fetchActivities = async () => {
    try {
     

      const response = await axios.get(`${globalVariables.api_url}/schoolactivitydetails/view_activities`, {
        params: {
          fk_school_id: school_id,
          fk_academic_year_id: academicYearId 
        }
      });

      if (response.data.status) {
        setActivityData(response.data.data);
      }
    } catch (error) {
      print_toast("error", "Error fetching activities");
    }
  };

  useEffect(() => {
    fetchActivities();
  },[school_id, academicYearId]);

  

  const fetchActivityTypes = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolactivitydetails/get_activity_type`
      );
      if (response.data.status) {
        setActivityTypes(Object.values(response.data.data));
      }
    } catch (error) {
      print_toast("error", "Error fetching activity types");
    }
  };

  useEffect(() => {
    fetchActivityTypes();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolactivitydetails/get_clubs`
      );
      if (response.data.status) {
        setClubs(Object.values(response.data.data));
      }
    } catch (error) {
      print_toast("error", "Error fetching clubs");
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleDateChange = async (e) => {
    console.log("Date selected:", e.target.value);
    const selectedDate = e.target?.value;

    if (!selectedDate) return;

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolactivitydetails/validateActivityDate`,
        { activity_start_date: selectedDate }
      );

      if (!response.data.status) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          activity_start_date: response.data.message,
        }));
        setIsSaving(true); // Disable Save button
        print_toast("error", response.data.message);
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          activity_start_date: "",
        }));
        setIsSaving(false); // Enable Save button when no error
      }
    } catch (error) {
      print_toast("error", "Error validating date");
      setIsSaving(true); // Ensure button stays disabled on error
    }
  };

  const handleTabChange = (month) => {
    setActiveTab(month);

    const academicYearStart = 6;
    const selectedMonthIndex = months.indexOf(month);

    let selectedMonth = academicYearStart + selectedMonthIndex;
    let selectedYear = 2024;

    if (selectedMonth > 12) {
      selectedMonth -= 12;
      selectedYear = 2025;
    }

    console.log("Tab changed to:", month);
    console.log("Setting selectedMonth:", selectedMonth);
    console.log("Setting selectedYear:", selectedYear);
    console.log("Resetting activity_start_date");

    setTimeout(() => {
      setResponses((prev) => ({
        ...prev,
        selectedMonth: selectedMonth.toString().padStart(2, "0"),
        selectedYear: selectedYear.toString(),
        activity_start_date: "",
      }));
    }, 0);
  };

  const handleChangeDocument = async () => {
    if (!newPdf) {
      print_toast("error", "Please select a document!");
      return;
    }

    // if (newPdf.type !== "application/pdf") {
    //   print_toast("error", "Only PDF files are allowed!");
    //   return;
    // }

    const formData = new FormData();
    formData.append("school_activity_id", selectedActivity.school_activity_id);
    formData.append("pdf_file", newPdf);

    try {
      setIsSaving(true);

      const response = await axios.post(
        `${globalVariables.api_url}/schoolactivitydetails/update-pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.success) {
        print_toast("success", "Document updated successfully!");

        setActivityData((prevData) =>
          prevData.map((item) =>
            item.school_activity_id === selectedActivity.school_activity_id
              ? { ...item, pdf_file: response.data.new_pdf_name }
              : item
          )
        );

        closeDocModal();
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to update document"
        );
      }
    } catch (error) {
      console.error("Error updating document:", error);
      print_toast("error", "An error occurred while updating the document.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    console.log("Before submitting:", responses);

    if (!responses.activity_start_date) {
      print_toast("error", "Please select an activity start date.");
      setErrors((prev) => ({
        ...prev,
        activity_start_date: "Please select an activity start date.",
      }));
      setIsSaving(false);
      return;
    }

    const newActivityMonth = responses.activity_start_date
      ? new Date(responses.activity_start_date)
          .toLocaleString("default", { month: "long" })
          .toLowerCase()
      : "invalid date";

    const todayDate = new Date().toISOString().split("T")[0];

    const formData = new FormData();
    formData.append("activity_start_date", responses.activity_start_date);
    formData.append("created_date", todayDate);
    formData.append("fk_school_id", school_id);
    formData.append("activity_month", newActivityMonth);
    formData.append("selected_type", responses.selectedType || "");

    if (responses.selectedType === "Religion/Moral Science Education") {
      formData.append("religion_class", responses.religion_class || "");
      formData.append("trainer_name", responses.trainer_name || "");
    } else if (responses.selectedType === "KCSL") {
      formData.append("name_of_camp", responses.name_of_camp || "");
      formData.append(
        "number_of_participants",
        responses.number_of_participants || ""
      );
      formData.append("venue", responses.venue || "");
      formData.append(
        "number_of_holy_mass",
        responses.number_of_holy_mass || ""
      );
    } else if (responses.selectedType === "Celebrations") {
      formData.append("item", responses.item || "");
      formData.append("guest", responses.guest || "");
    } else if (responses.selectedType === "Socially Useful Productive Work") {
      formData.append("activity", responses.activity || "");
      formData.append(
        "no_of_participating_students",
        responses.no_of_participating_students || ""
      );
      formData.append(
        "no_of_participating_teachers",
        responses.no_of_participating_teachers || ""
      );
      formData.append("brief_description", responses.brief_description || "");
    } else if (responses.selectedType === "Club Activities") {
      formData.append("club", responses.club || "");
      formData.append("activity", responses.activity || "");
    } else if (responses.selectedType === "School Assembly") {
      formData.append("purpose", responses.purpose || "");
      formData.append(
        "guest_addressed_student",
        responses.guest_addressed_student || ""
      );
      formData.append(
        "manager_addressed_student",
        responses.manager_addressed_student || ""
      );
    } else if (responses.selectedType === "Student Council") {
      formData.append("agenda", responses.agenda || "");
      formData.append("activities_done", responses.activities_done || "");
    } else if (responses.selectedType === "Study Tour") {
      formData.append("no_of_students", responses.no_of_students || "");
      formData.append("places_visited", responses.places_visited || "");
    } else {
      formData.append("activity_title", responses.activity_title || "");
      formData.append("description", responses.description || "");
      formData.append("no_of_days", responses.no_of_days || "");
      formData.append("pdf_file", responses.pdf_file || null);
    }

    console.log("Payload being sent:", Object.fromEntries(formData));

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolactivitydetails/save`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.status) {
        print_toast("success", "Data saved successfully!");
        setResponses({
          activity_title: "",
          description: "",
          no_of_days: "",
          pdf_file: null,
          activity_start_date: "",
          selectedType: "",
          religion_class: "",
          trainer_name: "",
          created_date: "",
          name_of_camp: "",
          number_of_participants: "",
          venue: "",
          number_of_holy_mass: "",
          item: "",
          guest: "",
          activity: "",
          no_of_participating_students: "",
          no_of_participating_teachers: "",
          brief_description: "",
          club: "",
          purpose: "",
          guest_addressed_student: "",
          manager_addressed_student: "",
          agenda: "",
          activities_done: "",
          no_of_students: "",
          places_visited: "",
        });
        setIsAddModalOpen(false);
        fetchActivities();
      } else {
        setErrors(response.data.errors || {});
        print_toast("error", response.data.message || "Failed to save data");
        setIsSaving(false);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      print_toast("error", "An error occurred while saving data.");
      setIsSaving(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (activity) => {
    setSelectedActivity(activity);
    setEditResponses({
      activity_title: activity.activity_title || "",
      description: activity.description || "",
      no_of_days: activity.no_of_days || "",
      pdf_file: activity.pdf_file || "",
      activity_start_date: activity.activity_start_date || "",
      fk_school_id: school_id,
      activity_type: activity.activity_type,
      camp_name: activity.camp_name || "",
      no_of_participants: activity.no_of_participants || "",
      venue: activity.venue || "",
      no_of_holymass: activity.no_of_holymass || "",
      education_classes_conducted: activity.education_classes_conducted || "",
      trainer_name: activity.trainer_name || "",
      celebration_item: activity.celebration_item || "",
      celebration_guest: activity.celebration_guest || "",
      activity: activity.activity || "",
      no_of_participating_students: activity.no_of_participating_students || "",
      no_of_participating_teachers: activity.no_of_participating_teachers || "",
      brief_description: activity.brief_description || "",
      club: activity.club || "",
      purpose: activity.purpose || "",
      guest_addressed_student: activity.guest_addressed_student || "",
      manager_addressed_student: activity.manager_addressed_student || "",
      agenda: activity.agenda || "",
      activities_done: activity.activities_done || "",
      no_of_students: activity.no_of_students || "",
      places_visited: activity.places_visited || "",
    });
    setIsModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setEditErrors({});

    try {
      const formData = new FormData();
      formData.append(
        "school_activity_id",
        selectedActivity.school_activity_id
      );
      formData.append("activity_type", selectedActivity.activity_type);
      formData.append("activity_start_date", editResponses.activity_start_date);
      formData.append("fk_school_id", school_id);

      if (
        selectedActivity.activity_type === "Religion/Moral Science Education"
      ) {
        formData.append(
          "education_classes_conducted",
          editResponses.education_classes_conducted
        );
        formData.append("trainer_name", editResponses.trainer_name);
      } else if (selectedActivity.activity_type === "KCSL") {
        formData.append("camp_name", editResponses.camp_name);
        formData.append("no_of_participants", editResponses.no_of_participants);
        formData.append("venue", editResponses.venue);
        formData.append("no_of_holymass", editResponses.no_of_holymass);
      } else if (
        selectedActivity.activity_type === "Other Activities" ||
        selectedActivity.activity_type === "Campus Beautification Activities"
      ) {
        formData.append("activity_title", editResponses.activity_title);
        formData.append("description", editResponses.description);
        formData.append("no_of_days", editResponses.no_of_days);
      } else if (selectedActivity.activity_type === "Celebrations") {
        formData.append("celebration_item", editResponses.celebration_item);
        formData.append("celebration_guest", editResponses.celebration_guest);
      } else if (
        selectedActivity.activity_type === "Socially Useful Productive Work"
      ) {
        formData.append("activity", editResponses.activity);
        formData.append(
          "no_of_participating_students",
          editResponses.no_of_participating_students
        );
        formData.append(
          "no_of_participating_teachers",
          editResponses.no_of_participating_teachers
        );
        formData.append("brief_description", editResponses.brief_description);
      } else if (selectedActivity.activity_type === "Club Activities") {
        formData.append("club", editResponses.club);
        formData.append("activity", editResponses.activity);
      } else if (selectedActivity.activity_type === "School Assembly") {
        formData.append("purpose", editResponses.purpose);
        formData.append(
          "guest_addressed_student",
          editResponses.guest_addressed_student
        );
        formData.append(
          "manager_addressed_student",
          editResponses.manager_addressed_student
        );
      } else if (selectedActivity.activity_type === "Student Council") {
        formData.append("agenda", editResponses.agenda);
        formData.append("activities_done", editResponses.activities_done);
      } else if (selectedActivity.activity_type === "Study Tour") {
        formData.append("no_of_students", editResponses.no_of_students);
        formData.append("places_visited", editResponses.places_visited);
      }

      const response = await axios.post(
        `${globalVariables.api_url}/schoolactivitydetails/update`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.data.success) {
        print_toast("success", "Data updated successfully!");
        setActivityData((prevData) =>
          prevData.map((item) =>
            item.school_activity_id === selectedActivity.school_activity_id
              ? { ...item, ...editResponses }
              : item
          )
        );
        setIsModalOpen(false);
        fetchActivities();
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setEditErrors(error.response.data.messages);
      }
      print_toast("error", "Failed to update data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditResponses({
      activity_title: "",
      description: "",
      no_of_days: "",
      pdf_file: "",
      activity_start_date: "",
    });

    setErrors({});
    setIsSaving(false);
    setEditErrors({});
    setIsModalOpen(false);
  };

  const handleDelete = async (school_activity_id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${globalVariables.api_url}/schoolactivitydetails/delete/${school_activity_id}`
      );

      if (response.data.success) {
        print_toast("success", "Activity deleted successfully!");

        setActivityData((prevData) =>
          prevData.filter(
            (item) => item.school_activity_id !== school_activity_id
          )
        );
      } else {
        print_toast(
          "error",
          response.data.message || "Failed to delete activity"
        );
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      print_toast("error", "An error occurred while deleting the activity.");
    }
  };

  const fetchAcademicYear = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolactivitydetails/getAcademicYear`
      );
      if (response.data.status) {
        setAcademicYear({
          start_date: response.data.start_date,
          end_date: response.data.end_date,
        });
      }
    } catch (error) {
      console.error("Error fetching academic year:", error);
    }
  };

  // useEffect(() => {
  //   if (activeTab) {
  //     const currentYear = new Date().getFullYear();
  //     const monthIndex = months.indexOf(activeTab) + 6;
  //     const defaultDate = `${currentYear}-${monthIndex
  //       .toString()
  //       .padStart(2, "0")}-01`;

  //     console.log("Setting activity_start_date to:", defaultDate);

  //     setResponses((prev) => ({
  //       ...prev,
  //       activity_start_date: defaultDate,
  //     }));
  //   }
  // }, [activeTab]);

  useEffect(() => {
    console.log("Updated activity_start_date:", responses.activity_start_date);
  }, [responses.activity_start_date]);

  useEffect(() => {
    fetchAcademicYear();
  }, []);

  useEffect(() => {}, [academicYear]);

  return (
    <div className="container mt-4">
    
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
        <ul className="nav nav-tabs">
            {months.map((month) => (
              <li className="nav-item" key={month}>
                <a
                  className={`nav-link ${activeTab === month ? "active" : ""}`}
                  onClick={() => handleTabChange(month)}
                  href="#!"
                >
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </a>
              </li>
            ))}
          </ul>
          <button className="btn btn-danger" onClick={handleOpenAddModal}>
            Create
          </button>
        </div>
        <div className="card-body">
          {/* Tabs */}
    

          {/* Tab Content */}

          <div className="tab-content mt-3">
            {[
              "Religion/Moral Science Education",
              "KCSL",
              "Campus Beautification Activities",
              "Other Activities",
              "Celebrations",
              "Socially Useful Productive Work",
              "Club Activities",
              "School Assembly",
              "Student Council",
              "Study Tour",
            ].map((type) => {
              const activitiesByType = filteredActivities.filter(
                (activity) => activity.activity_type === type
              );

              if (activitiesByType.length === 0) return null;

              return (
                <div key={type} className="mb-4">
                  <h4 className="text-secondary">{type}</h4>
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped">
                      <thead>
                        <tr>
                          <th>Sl No</th>
                          {type === "Religion/Moral Science Education" ? (
                            <>
                              <th>Retreat/Value Education Classes Conducted</th>
                              <th>Date</th>
                              <th>Name of Trainer</th>
                            </>
                          ) : type === "KCSL" ? (
                            <>
                              <th>Name of Camp</th>
                              <th>Number of Participants</th>
                              <th>Venue</th>
                              <th>No of Holy Mass for Students</th>
                              <th>Date</th>
                            </>
                          ) : type === "Celebrations" ? (
                            <>
                              <th>Item</th>
                              <th>Date</th>
                              <th>Guest</th>
                            </>
                          ) : type === "Socially Useful Productive Work" ? (
                            <>
                              <th>Activity</th>
                              <th>Date</th>
                              <th>Participation of Students</th>
                              <th>Participation of Teachers</th>
                              <th>Brief Description</th>
                            </>
                          ) : type === "Club Activities" ? (
                            <>
                              <th>Club</th>
                              <th>Activities</th>
                              <th>Date</th>
                            </>
                          ) : type === "School Assembly" ? (
                            <>
                              <th>Date</th>
                              <th>Purpose</th>
                              <th>Guest Addressed Student</th>
                              <th>School Manager Addressed Students</th>
                            </>
                          ) : type === "Student Council" ? (
                            <>
                              <th>Date</th>
                              <th>Agenda</th>
                              <th>Activities Done</th>
                            </>
                          ) : type === "Study Tour" ? (
                            <>
                              <th>Date</th>
                              <th>No of Students</th>
                              <th>Places Visited</th>
                            </>
                          ) : (
                            <>
                              <th>Activity Title</th>
                              <th>Description</th>
                              <th>No of Days</th>
                              <th>Date</th>
                              <th>Activity Document</th>
                            </>
                          )}
                          <th>Actions</th> {/* Actions column for all types */}
                        </tr>
                      </thead>
                      <tbody>
                        {activitiesByType.map((activity, index) => (
                          <tr key={activity.school_activity_id}>
                            <td>{index + 1}</td>

                            {type === "Religion/Moral Science Education" ? (
                              <>
                                <td>{activity.education_classes_conducted}</td>
                                <td>
                                  {new Date(
                                    activity.activity_start_date
                                  ).toLocaleDateString("en-GB")}
                                </td>
                                <td>{activity.trainer_name}</td>
                              </>
                            ) : type === "KCSL" ? (
                              <>
                                <td>{activity.camp_name}</td>
                                <td>{activity.no_of_participants}</td>
                                <td>{activity.venue}</td>
                                <td>{activity.no_of_holymass}</td>
                                <td>
                                  {new Date(
                                    activity.activity_start_date
                                  ).toLocaleDateString("en-GB")}
                                </td>
                              </>
                            ) : type === "Celebrations" ? (
                              <>
                                <td>{activity.celebration_item}</td>
                                <td>
                                  {new Date(
                                    activity.activity_start_date
                                  ).toLocaleDateString("en-GB")}
                                </td>
                                <td>{activity.celebration_guest}</td>
                              </>
                            ) : type === "Socially Useful Productive Work" ? (
                              <>
                                <td>{activity.activity}</td>
                                <td>
                                  {new Date(
                                    activity.activity_start_date
                                  ).toLocaleDateString("en-GB")}
                                </td>
                                <td>{activity.no_of_participating_students}</td>
                                <td>{activity.no_of_participating_teachers}</td>
                                <td>{activity.brief_description}</td>
                              </>
                            ) : type === "Club Activities" ? (
                              <>
                                <td>{activity.club}</td>

                                <td
                                  dangerouslySetInnerHTML={{
                                    __html: activity.activity,
                                  }}
                                ></td>

                                <td>
                                  {new Date(
                                    activity.activity_start_date
                                  ).toLocaleDateString("en-GB")}
                                </td>
                              </>
                            ) : type === "School Assembly" ? (
                              <>
                                <td>
                                  {new Date(
                                    activity.activity_start_date
                                  ).toLocaleDateString("en-GB")}
                                </td>
                                <td>{activity.purpose}</td>

                                <td>{activity.guest_addressed_student}</td>
                                <td>{activity.manager_addressed_student}</td>
                              </>
                            ) : type === "Student Council" ? (
                              <>
                                <td>
                                  {new Date(
                                    activity.activity_start_date
                                  ).toLocaleDateString("en-GB")}
                                </td>
                                <td>{activity.agenda}</td>

                                <td>{activity.activities_done}</td>
                              </>
                            ) : type === "Study Tour" ? (
                              <>
                                <td>
                                  {new Date(
                                    activity.activity_start_date
                                  ).toLocaleDateString("en-GB")}
                                </td>
                                <td>{activity.no_of_students}</td>

                                <td>{activity.places_visited}</td>
                              </>
                            ) : (
                              <>
                                <td>{activity.activity_title}</td>
                                <td>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: activity.description,
                                    }}
                                  ></div>
                                </td>

                                <td>{activity.no_of_days}</td>
                                <td>
                                  {new Date(
                                    activity.activity_start_date
                                  ).toLocaleDateString("en-GB")}
                                </td>
                                <td>
                                  <a
                                    className="btn btn-sm btn-primary"
                                    href={`${globalVariables.api_url}/uploads/pdfs/${activity.pdf_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <i className="bi bi-file-pdf"></i>
                                  </a>
                                  <button
                                    className="btn btn-sm btn-info ms-2"
                                    onClick={() => openDocModal(activity)}
                                  >
                                    Change Document
                                  </button>
                                </td>
                              </>
                            )}

                            {/* Actions for all types */}
                            <td>
                              <div className="dropdown">
                                <button
                                  className="btn btn-secondary btn-sm dropdown-toggle"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                >
                                  Actions
                                </button>
                                <ul className="dropdown-menu">
                                  <li>
                                    {/* <button
                                      className="btn btn-primary"
                                      onClick={() =>
                                        handleMoreInfo(
                                          activity.school_activity_id
                                        )
                                      }
                                    >
                                      More Info
                                    </button> */}
                                  </li>
                                  <li>
                                    <a
                                      href="#!"
                                      className="dropdown-item"
                                      onClick={() => handleEdit(activity)}
                                    >
                                      Edit
                                    </a>
                                  </li>
                                  <li>
                                    <a
                                      href="#!"
                                      className="dropdown-item text-danger"
                                      onClick={() =>
                                        handleDelete(
                                          activity.school_activity_id
                                        )
                                      }
                                    >
                                      Delete
                                    </a>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {isAddModalOpen && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ display: "block" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Activity</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseAddModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} id="form-add-activity">
                  <div className="form-group">
                    <label
                      htmlFor="activity_start_date"
                      className="col-form-label"
                    >
                      Activity Start Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="activity_start_date"
                      value={responses.activity_start_date || ""}
                      onFocus={(e) => {
                        if (
                          !responses.activity_start_date &&
                          responses.selectedMonth &&
                          responses.selectedYear
                        ) {
                          e.target.value = `${
                            responses.selectedYear
                          }-${responses.selectedMonth
                            .toString()
                            .padStart(2, "0")}-01`; // Ensure month format is 2 digits
                          requestAnimationFrame(() => {
                            e.target.showPicker(); // Open the picker with the correct month
                            e.target.value = ""; // Reset after opening so no date is prefilled
                          });
                        }
                      }}
                      onChange={(e) => {
                        handleInputChange(
                          "activity_start_date",
                          e.target.value
                        );
                        handleDateChange(e);
                      }}
                      min={
                        responses.selectedYear && responses.selectedMonth
                          ? `${responses.selectedYear}-${responses.selectedMonth
                              .toString()
                              .padStart(2, "0")}-01`
                          : ""
                      }
                    />

                    {errors.activity_start_date && (
                      <small className="text-danger">
                        {errors.activity_start_date}
                      </small>
                    )}
                  </div>

                  <div className="form-group mt-2">
                    <label>
                      Type of Activity <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-control"
                      value={responses.selectedType}
                      onChange={(e) =>
                        handleInputChange("selectedType", e.target.value)
                      }
                    >
                      <option value="">Select Activity Type</option>
                      {activityTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {errors.selectedType && (
                      <small className="text-danger">
                        {errors.selectedType}
                      </small>
                    )}
                  </div>

                  {responses.selectedType === "Study Tour" ? (
                    <>
                      <div className="form-group mt-2">
                        <label>
                          No. of Students <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.no_of_students || ""}
                          onChange={(e) =>
                            handleInputChange("no_of_students", e.target.value)
                          }
                        />
                        {errors.no_of_students && (
                          <small className="text-danger">
                            {errors.no_of_students}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Places Visited <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.places_visited || ""}
                          onChange={(e) =>
                            handleInputChange("places_visited", e.target.value)
                          }
                        />
                        {errors.places_visited && (
                          <small className="text-danger">
                            {errors.places_visited}
                          </small>
                        )}
                      </div>
                    </>
                  ) : responses.selectedType === "Student Council" ? (
                    <>
                      {/* Fields for Student Council */}
                      <div className="form-group mt-2">
                        <label>
                          Agenda <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.agenda || ""}
                          onChange={(e) =>
                            handleInputChange("agenda", e.target.value)
                          }
                        />
                        {errors.agenda && (
                          <small className="text-danger">{errors.agenda}</small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Activities Done <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.activities_done || ""}
                          onChange={(e) =>
                            handleInputChange("activities_done", e.target.value)
                          }
                        />
                        {errors.activities_done && (
                          <small className="text-danger">
                            {errors.activities_done}
                          </small>
                        )}
                      </div>
                    </>
                  ) : responses.selectedType === "School Assembly" ? (
                    <>
                      {/* Fields for School Assembly */}
                      <div className="form-group mt-2">
                        <label>
                          Purpose <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.purpose || ""}
                          onChange={(e) =>
                            handleInputChange("purpose", e.target.value)
                          }
                        />
                        {errors.purpose && (
                          <small className="text-danger">
                            {errors.purpose}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Guest Addressed Students{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.guest_addressed_student || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "guest_addressed_student",
                              e.target.value
                            )
                          }
                        />
                        {errors.guest_addressed_student && (
                          <small className="text-danger">
                            {errors.guest_addressed_student}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Has the School Manager Addressed the Students?{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="manager_yes"
                              name="manager_addressed_student"
                              value="Yes"
                              checked={
                                responses.manager_addressed_student === "Yes"
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "manager_addressed_student",
                                  e.target.value
                                )
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="manager_yes"
                            >
                              Yes
                            </label>
                          </div>

                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="manager_no"
                              name="manager_addressed_student"
                              value="No"
                              checked={
                                responses.manager_addressed_student === "No"
                              }
                              onChange={(e) =>
                                handleInputChange(
                                  "manager_addressed_student",
                                  e.target.value
                                )
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="manager_no"
                            >
                              No
                            </label>
                          </div>
                        </div>

                        {errors.manager_addressed_student && (
                          <small className="text-danger">
                            {errors.manager_addressed_student}
                          </small>
                        )}
                      </div>
                    </>
                  ) : responses.selectedType === "Club Activities" ? (
                    <>
                      {/* Fields for Club Activities */}
                      <div className="form-group mt-2">
                        <label>
                          Club <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          value={responses.club || ""}
                          onChange={(e) => {
                            const selectedClubName = e.target.value;
                            setResponses((prevResponses) => ({
                              ...prevResponses,
                              club: selectedClubName,
                            }));

                            if (errors.club) {
                              setErrors((prevErrors) => ({
                                ...prevErrors,
                                club: "",
                              }));
                            }
                          }}
                        >
                          <option value="">Select a club</option>
                          {clubs.map((club) => (
                            <option key={club.club_id} value={club.club_name}>
                              {club.club_name}
                            </option>
                          ))}
                        </select>

                        {errors.club && (
                          <small className="text-danger">{errors.club}</small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Activities <span className="text-danger">*</span>
                        </label>
                        <CKEditor
                          editor={ClassicEditor}
                          className="form-control"
                          data={responses.activity} // Set initial value
                          onChange={
                            (event, editor) =>
                              handleInputChange("activity", editor.getData()) // Handle input change
                          }
                        />
                        {errors.activity && (
                          <small className="text-danger">
                            {errors.activity}
                          </small>
                        )}
                      </div>
                    </>
                  ) : responses.selectedType === "Celebrations" ? (
                    <>
                      {/* Fields for Celebrations */}
                      <div className="form-group mt-2">
                        <label>
                          Item <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.item || ""}
                          onChange={(e) =>
                            handleInputChange("item", e.target.value)
                          }
                        />
                        {errors.item && (
                          <small className="text-danger">{errors.item}</small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Guest <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.guest || ""}
                          onChange={(e) =>
                            handleInputChange("guest", e.target.value)
                          }
                        />
                        {errors.guest && (
                          <small className="text-danger">{errors.guest}</small>
                        )}
                      </div>
                    </>
                  ) : responses.selectedType ===
                    "Socially Useful Productive Work" ? (
                    <>
                      {/* Fields for Socially Useful Productive Work */}
                      <div className="form-group mt-2">
                        <label>
                          Activity <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.activity || ""}
                          onChange={(e) =>
                            handleInputChange("activity", e.target.value)
                          }
                        />
                        {errors.activity && (
                          <small className="text-danger">
                            {errors.activity}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Number of Participating Students{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={responses.no_of_participating_students || ""}
                          min="0"
                          onChange={(e) =>
                            handleInputChange(
                              "no_of_participating_students",
                              e.target.value
                            )
                          }
                        />
                        {errors.no_of_participating_students && (
                          <small className="text-danger">
                            {errors.no_of_participating_students}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Number of Participating Teachers{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={responses.no_of_participating_teachers || ""}
                          min="0"
                          onChange={(e) =>
                            handleInputChange(
                              "no_of_participating_teachers",
                              e.target.value
                            )
                          }
                        />
                        {errors.no_of_participating_teachers && (
                          <small className="text-danger">
                            {errors.no_of_participating_teachers}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Brief Description{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={responses.brief_description || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "brief_description",
                              e.target.value
                            )
                          }
                        ></textarea>
                        {errors.brief_description && (
                          <small className="text-danger">
                            {errors.brief_description}
                          </small>
                        )}
                      </div>
                    </>
                  ) : responses.selectedType ===
                    "Religion/Moral Science Education" ? (
                    <>
                      {/* New Fields for Religion/Moral Science Education */}
                      <div className="form-group mt-2">
                        <label>
                          Retreat/Value Education Classes Conducted{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.religion_class || ""}
                          onChange={(e) =>
                            handleInputChange("religion_class", e.target.value)
                          }
                        />
                        {errors.religion_class && (
                          <small className="text-danger">
                            {errors.religion_class}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Name of Trainer <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.trainer_name || ""}
                          onChange={(e) =>
                            handleInputChange("trainer_name", e.target.value)
                          }
                        />
                        {errors.trainer_name && (
                          <small className="text-danger">
                            {errors.trainer_name}
                          </small>
                        )}
                      </div>
                    </>
                  ) : responses.selectedType === "KCSL" ? (
                    <>
                      {/* Fields for KCSL */}
                      <div className="form-group mt-2">
                        <label>
                          Name of Camp <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.name_of_camp || ""}
                          onChange={(e) =>
                            handleInputChange("name_of_camp", e.target.value)
                          }
                        />
                        {errors.name_of_camp && (
                          <small className="text-danger">
                            {errors.name_of_camp}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Number of Participants{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={responses.number_of_participants || ""}
                          min="0"
                          onChange={(e) =>
                            handleInputChange(
                              "number_of_participants",
                              e.target.value
                            )
                          }
                        />
                        {errors.number_of_participants && (
                          <small className="text-danger">
                            {errors.number_of_participants}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Venue <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={responses.venue || ""}
                          onChange={(e) =>
                            handleInputChange("venue", e.target.value)
                          }
                        />
                        {errors.venue && (
                          <small className="text-danger">{errors.venue}</small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Has the School Conducted Holy Mass for Students?{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="holy_mass_yes"
                              name="holy_mass"
                              value="Yes"
                              checked={responses.number_of_holy_mass === "Yes"}
                              onChange={(e) =>
                                handleInputChange(
                                  "number_of_holy_mass",
                                  e.target.value
                                )
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="holy_mass_yes"
                            >
                              Yes
                            </label>
                          </div>

                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="holy_mass_no"
                              name="holy_mass"
                              value="No"
                              checked={responses.number_of_holy_mass === "No"}
                              onChange={(e) =>
                                handleInputChange(
                                  "number_of_holy_mass",
                                  e.target.value
                                )
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="holy_mass_no"
                            >
                              No
                            </label>
                          </div>
                        </div>

                        {errors.number_of_holy_mass && (
                          <small className="text-danger">
                            {errors.number_of_holy_mass}
                          </small>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Default Fields */}
                      <div className="form-group mt-2">
                        <label
                          htmlFor="activity_title"
                          className="col-form-label"
                        >
                          Activity Title <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="activity_title"
                          value={responses.activity_title}
                          onChange={(e) =>
                            handleInputChange("activity_title", e.target.value)
                          }
                        />
                        {errors.activity_title && (
                          <small className="text-danger">
                            {errors.activity_title}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label htmlFor="description" className="col-form-label">
                          Description <span className="text-danger">*</span>
                        </label>
                        <CKEditor
                          editor={ClassicEditor}
                          className="form-control"
                          id="description"
                          data={responses.description}
                          onChange={(event, editor) =>
                            handleInputChange("description", editor.getData())
                          }
                        />
                        {errors.description && (
                          <small className="text-danger">
                            {errors.description}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label htmlFor="no_of_days" className="col-form-label">
                          Number of Days <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="no_of_days"
                          value={responses.no_of_days}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                              handleInputChange("no_of_days", value);
                            }
                          }}
                        />
                        {errors.no_of_days && (
                          <small className="text-danger">
                            {errors.no_of_days}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label htmlFor="pdf_file" className="col-form-label">
                          Upload PDF
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          id="pdf_file"
                          accept=".pdf"
                          onChange={(e) => handleInputChange("pdf_file", e)}
                        />
                        {errors.pdf_file && (
                          <small className="text-danger">
                            {errors.pdf_file}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  <div className="col-12 text-end mt-3">
                    <button
                      type="submit"
                      className="btn btn-success m-1"
                      disabled={isSaving || errors.activity_start_date} // Disable if there's an error
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger m-1"
                      onClick={handleCloseAddModal}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal" style={{ display: "block" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit School Activity Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditErrors({});
                  }}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleEditSubmit}>
                  {/* Fields for Campus Beautification Activities & Other Activities */}
                  {(editResponses.activity_type ===
                    "Campus Beautification Activities" ||
                    editResponses.activity_type === "Other Activities") && (
                    <>
                      <div className="form-group">
                        <label>
                          Activity Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editResponses.activity_start_date || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity_start_date: e.target.value,
                            });
                            handleDateChange(e);
                          }}
                        />
                        {editErrors.activity_start_date && (
                          <small className="text-danger">
                            {editErrors.activity_start_date}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Activity Title <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.activity_title}
                          onChange={(e) =>
                            setEditResponses({
                              ...editResponses,
                              activity_title: e.target.value,
                            })
                          }
                        />
                        {editErrors.activity_title && (
                          <small className="text-danger">
                            {editErrors.activity_title}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Description <span className="text-danger">*</span>
                        </label>
                        <CKEditor
                          editor={ClassicEditor}
                          data={editResponses.description}
                          onChange={(event, editor) =>
                            setEditResponses({
                              ...editResponses,
                              description: editor.getData(),
                            })
                          }
                        />
                        {editErrors.description && (
                          <small className="text-danger">
                            {editErrors.description}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Number of Days <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.no_of_days}
                          onChange={(e) =>
                            setEditResponses({
                              ...editResponses,
                              no_of_days: e.target.value,
                            })
                          }
                        />
                        {editErrors.no_of_days && (
                          <small className="text-danger">
                            {editErrors.no_of_days}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {/* Fields for KCSL */}
                  {editResponses.activity_type === "KCSL" && (
                    <>
                      <div className="form-group mt-2">
                        <label>
                          Activity Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editResponses.activity_start_date || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity_start_date: e.target.value,
                            });
                            handleDateChange(e);
                          }}
                        />
                        {editErrors.activity_start_date && (
                          <small className="text-danger">
                            {editErrors.activity_start_date}
                          </small>
                        )}
                      </div>
                      <div className="form-group mt-2">
                        <label>
                          Name of Camp <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.camp_name}
                          onChange={(e) =>
                            setEditResponses({
                              ...editResponses,
                              camp_name: e.target.value,
                            })
                          }
                        />
                        {editErrors.camp_name && (
                          <small className="text-danger">
                            {editErrors.camp_name}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Number of Participants{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={editResponses.no_of_participants}
                          onChange={(e) =>
                            setEditResponses({
                              ...editResponses,
                              no_of_participants: e.target.value,
                            })
                          }
                        />
                        {editErrors.no_of_participants && (
                          <small className="text-danger">
                            {editErrors.no_of_participants}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Venue <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.venue}
                          onChange={(e) =>
                            setEditResponses({
                              ...editResponses,
                              venue: e.target.value,
                            })
                          }
                        />
                        {editErrors.venue && (
                          <small className="text-danger">
                            {editErrors.venue}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Has the School Conducted Holy Mass for Students?{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="edit_holy_mass_yes"
                              name="edit_holy_mass"
                              value="Yes"
                              checked={editResponses.no_of_holymass === "Yes"}
                              onChange={(e) => {
                                setEditResponses({
                                  ...editResponses,
                                  no_of_holymass: e.target.value,
                                });
                                setEditErrors((prevErrors) => ({
                                  ...prevErrors,
                                  no_of_holymass: "",
                                }));
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="edit_holy_mass_yes"
                            >
                              Yes
                            </label>
                          </div>

                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="edit_holy_mass_no"
                              name="edit_holy_mass"
                              value="No"
                              checked={editResponses.no_of_holymass === "No"}
                              onChange={(e) => {
                                setEditResponses({
                                  ...editResponses,
                                  no_of_holymass: e.target.value,
                                });
                                setEditErrors((prevErrors) => ({
                                  ...prevErrors,
                                  no_of_holymass: "",
                                }));
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="edit_holy_mass_no"
                            >
                              No
                            </label>
                          </div>
                        </div>

                        {editErrors.no_of_holymass && (
                          <small className="text-danger">
                            {editErrors.no_of_holymass}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {/* Fields for Retreat */}
                  {editResponses.activity_type ===
                    "Religion/Moral Science Education" && (
                    <>
                      <div className="form-group mt-2">
                        <label>
                          Activity Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editResponses.activity_start_date || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity_start_date: e.target.value,
                            });
                            handleDateChange(e);
                          }}
                        />
                        {editErrors.activity_start_date && (
                          <small className="text-danger">
                            {editErrors.activity_start_date}
                          </small>
                        )}
                      </div>
                      <div className="form-group mt-2">
                        <label>
                          Retreat/Value Education Classes Conducted{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.education_classes_conducted}
                          onChange={(e) =>
                            setEditResponses({
                              ...editResponses,
                              education_classes_conducted: e.target.value,
                            })
                          }
                        />
                        {editErrors.education_classes_conducted && (
                          <small className="text-danger">
                            {editErrors.education_classes_conducted}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Name of Trainer <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.trainer_name}
                          onChange={(e) =>
                            setEditResponses({
                              ...editResponses,
                              trainer_name: e.target.value,
                            })
                          }
                        />
                        {editErrors.trainer_name && (
                          <small className="text-danger">
                            {editErrors.trainer_name}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {editResponses.activity_type === "Celebrations" && (
                    <>
                      <div className="form-group mt-2">
                        <label>
                          Activity Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editResponses.activity_start_date || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity_start_date: e.target.value,
                            });
                          }}
                        />
                        {editErrors.activity_start_date && (
                          <small className="text-danger">
                            {editErrors.activity_start_date}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Item <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.celebration_item || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              celebration_item: e.target.value,
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              celebration_item: "",
                            }));
                          }}
                        />
                        {editErrors.celebration_item && (
                          <small className="text-danger">
                            {editErrors.celebration_item}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Guest <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.celebration_guest || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              celebration_guest: e.target.value,
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              celebration_guest: "",
                            }));
                          }}
                        />
                        {editErrors.celebration_guest && (
                          <small className="text-danger">
                            {editErrors.celebration_guest}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {editResponses.activity_type ===
                    "Socially Useful Productive Work" && (
                    <>
                      <div className="form-group mt-2">
                        <label>
                          Activity Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editResponses.activity_start_date || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity_start_date: e.target.value,
                            });
                            handleDateChange(e);
                          }}
                        />
                        {editErrors.activity_start_date && (
                          <small className="text-danger">
                            {editErrors.activity_start_date}
                          </small>
                        )}
                      </div>
                      <div className="form-group mt-2">
                        <label>
                          Activity <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.activity}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity: e.target.value,
                            });
                            setEditErrors({
                              ...editErrors,
                              activity: "",
                            });
                          }}
                        />
                        {editErrors.activity && (
                          <small className="text-danger">
                            {editErrors.activity}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Number of Participating Students{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.no_of_participating_students}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              no_of_participating_students: e.target.value,
                            });
                            setEditErrors({
                              ...editErrors,
                              no_of_participating_students: "",
                            });
                          }}
                        />

                        {editErrors.no_of_participating_students && (
                          <small className="text-danger">
                            {editErrors.no_of_participating_students}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Number of Participating Teachers{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.no_of_participating_teachers}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              no_of_participating_teachers: e.target.value,
                            });
                            setEditErrors({
                              ...editErrors,
                              no_of_participating_teachers: "",
                            });
                          }}
                        />

                        {editErrors.no_of_participating_teachers && (
                          <small className="text-danger">
                            {editErrors.no_of_participating_teachers}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Brief Description{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.brief_description}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              brief_description: e.target.value,
                            });
                            setEditErrors({
                              ...editErrors,
                              brief_description: "",
                            });
                          }}
                        />

                        {editErrors.brief_description && (
                          <small className="text-danger">
                            {editErrors.brief_description}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {editResponses.activity_type === "Club Activities" && (
                    <>
                      <div className="form-group mt-2">
                        <label>
                          Activity Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editResponses.activity_start_date || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity_start_date: e.target.value,
                            });
                          }}
                        />
                        {editErrors.activity_start_date && (
                          <small className="text-danger">
                            {editErrors.activity_start_date}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Club <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-control"
                          value={editResponses.club || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              club: e.target.value,
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              club: "",
                            }));
                          }}
                        >
                          <option value="">Select a club</option>
                          {clubs.map((club) => (
                            <option
                              key={club.club_id}
                              value={club.club_name}
                              selected={club.club_name === editResponses.club}
                            >
                              {club.club_name}
                            </option>
                          ))}
                        </select>
                        {editErrors.club && (
                          <small className="text-danger">
                            {editErrors.club}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Activity <span className="text-danger">*</span>
                        </label>
                        <CKEditor
                          editor={ClassicEditor}
                          data={editResponses.activity || ""}
                          onReady={(editor) => {
                            editor.setData(editResponses.activity || "");
                          }}
                          onChange={(event, editor) => {
                            setEditResponses({
                              ...editResponses,
                              activity: editor.getData(),
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              activity: "",
                            }));
                          }}
                        />
                        {editErrors.activity && (
                          <small className="text-danger">
                            {editErrors.activity}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {editResponses.activity_type === "School Assembly" && (
                    <>
                      <div className="form-group mt-2">
                        <label>
                          Activity Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editResponses.activity_start_date || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity_start_date: e.target.value,
                            });
                            handleDateChange(e);
                          }}
                        />
                        {editErrors.activity_start_date && (
                          <small className="text-danger">
                            {editErrors.activity_start_date}
                          </small>
                        )}
                      </div>
                      <div className="form-group mt-2">
                        <label>
                          Purpose <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.purpose}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              purpose: e.target.value,
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              purpose: "",
                            }));
                          }}
                        />
                        {editErrors.purpose && (
                          <small className="text-danger">
                            {editErrors.purpose}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Guest Addressed Students{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.guest_addressed_student}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              guest_addressed_student: e.target.value,
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              guest_addressed_student: "",
                            }));
                          }}
                        />
                        {editErrors.guest_addressed_student && (
                          <small className="text-danger">
                            {editErrors.guest_addressed_student}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Has the School Manager Addressed the Students?{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <div className="d-flex gap-3">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="edit_manager_yes"
                              name="edit_manager_addressed_student"
                              value="Yes"
                              checked={
                                editResponses.manager_addressed_student ===
                                "Yes"
                              }
                              onChange={(e) => {
                                setEditResponses({
                                  ...editResponses,
                                  manager_addressed_student: e.target.value,
                                });
                                setEditErrors((prevErrors) => ({
                                  ...prevErrors,
                                  manager_addressed_student: "",
                                }));
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="edit_manager_yes"
                            >
                              Yes
                            </label>
                          </div>

                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              id="edit_manager_no"
                              name="edit_manager_addressed_student"
                              value="No"
                              checked={
                                editResponses.manager_addressed_student === "No"
                              }
                              onChange={(e) => {
                                setEditResponses({
                                  ...editResponses,
                                  manager_addressed_student: e.target.value,
                                });
                                setEditErrors((prevErrors) => ({
                                  ...prevErrors,
                                  manager_addressed_student: "",
                                }));
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="edit_manager_no"
                            >
                              No
                            </label>
                          </div>
                        </div>

                        {editErrors.manager_addressed_student && (
                          <small className="text-danger">
                            {editErrors.manager_addressed_student}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {editResponses.activity_type === "Student Council" && (
                    <>
                      <div className="form-group mt-2">
                        <label>
                          Activity Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editResponses.activity_start_date || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity_start_date: e.target.value,
                            });
                            handleDateChange(e);
                          }}
                        />
                        {editErrors.activity_start_date && (
                          <small className="text-danger">
                            {editErrors.activity_start_date}
                          </small>
                        )}
                      </div>
                      <div className="form-group mt-2">
                        <label>
                          Agenda <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.agenda}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              agenda: e.target.value,
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              agenda: "",
                            }));
                          }}
                        />
                        {editErrors.agenda && (
                          <small className="text-danger">
                            {editErrors.agenda}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Activities Done <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.activities_done}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activities_done: e.target.value,
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              activities_done: "",
                            }));
                          }}
                        />
                        {editErrors.activities_done && (
                          <small className="text-danger">
                            {editErrors.activities_done}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {editResponses.activity_type === "Study Tour" && (
                    <>
                      <div className="form-group mt-2">
                        <label>
                          Activity Start Date{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          value={editResponses.activity_start_date || ""}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              activity_start_date: e.target.value,
                            });
                            handleDateChange(e);
                          }}
                        />
                        {editErrors.activity_start_date && (
                          <small className="text-danger">
                            {editErrors.activity_start_date}
                          </small>
                        )}
                      </div>
                      <div className="form-group mt-2">
                        <label>
                          No of Students <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.no_of_students}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              no_of_students: e.target.value,
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              no_of_students: "",
                            }));
                          }}
                        />
                        {editErrors.no_of_students && (
                          <small className="text-danger">
                            {editErrors.no_of_students}
                          </small>
                        )}
                      </div>

                      <div className="form-group mt-2">
                        <label>
                          Places Visited <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          value={editResponses.places_visited}
                          onChange={(e) => {
                            setEditResponses({
                              ...editResponses,
                              places_visited: e.target.value,
                            });
                            setEditErrors((prevErrors) => ({
                              ...prevErrors,
                              places_visited: "",
                            }));
                          }}
                        />
                        {editErrors.places_visited && (
                          <small className="text-danger">
                            {editErrors.places_visited}
                          </small>
                        )}
                      </div>
                    </>
                  )}

                  {/* Submit and Cancel Buttons */}
                  <div className="col-12 text-end mt-4">
                    <button
                      type="submit"
                      className="btn btn-success m-1"
                      disabled={isSaving}
                    >
                      {isSaving ? "Updating..." : "Update"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-danger m-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDocModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Activity Document</h5>
                <button className="btn-close" onClick={closeDocModal}></button>
              </div>
              <div className="modal-body">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="form-control"
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={handleChangeDocument}
                  disabled={!newPdf || isSaving}
                >
                  {isSaving ? "Updating..." : "Update"}
                </button>
                <button className="btn btn-danger" onClick={closeDocModal}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolActivities;
