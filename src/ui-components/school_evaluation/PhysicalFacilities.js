import React, { useState, useEffect } from "react";
// import Breadcum from "./Breadcum";
import CustomModal from "../CustomModal";
import RoomsModule from "../RoomsModule.js";
import EditModule from "../EditModule";
import Table from "../Table";
import Kcsl_Table from "../Kcsl_Table.js";
import print_toast from "../../utilities/Toaster.js";
import globalVariables from "../../Global.js";
import axios from "axios";
import KcslModule from "../KcslModule";
import Scholarship from "../Scholarship.js";
import EditScholarship from "../EditScholarship";
import EditKcsl from "../EditKcsl";
import ScholarshipTable from "../ScholarshipTable.js";
import VincentModule from "../VincentModule.js";  
import EditVincent from "../EditVincent";
import VincentTable from "../VincentTable.js";
import Cocurricular from "../Cocurricular.js";
import CocurricularTable from "../CocurricularTable.js";
import Championship from "./OverallChampionship.js";
import EditCocurricular from "../EditCocurricular.js";
import { useData } from "./SchoolEvaluationForm";
const PhysicalFacilities = () => {
     const { evaluationDocumentDetails } = useData();
     const evaluation_doc_id = evaluationDocumentDetails.evaluation_doc_id;

//   const [breadcum, setBreadcum] = useState([
//     { Title: "Home", Link: "/" },
//     { Title: "School Category Items", Link: "" },
//   ]);

  const [categories, setCategories] = useState([]);
  const [tableToShow, setTableToShow] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [moduleToOpen, setModuleToOpen] = useState(null);
  const [categoryItems, setCategoryItems] = useState([]);
  const [itemsLengthMap, setItemsLengthMap] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryDetailsId, setCategoryDetailsId] = useState(null);
  const [pdfloading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/get_all_categories`
      );
      if (response.data.status) {
        console.log(response.data.data);
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      print_toast("error", "Failed to fetch categories");
    }
  };

  const handleCategorySelection = (category) => {
    setSelectedCategory(category);

    if (category.module_name === "kcsltalenthunt") {
      setTableToShow("Kcsl");
    } else {
      setTableToShow("Default");
    }
  };

  const handleOpenModal = async (category) => {
    setActiveCategory(category);
    setModalIsOpen(true);
    setIsEditing(false);
  
    console.log(categoryItems);
  
    const categoryDetailsId = category.category_details_id;
    setCategoryDetailsId(categoryDetailsId);
  
    if (category.module_name === "kcsltalenthunt") {
      setModuleToOpen("Kcsl");
    } else if (category.module_name === "scholarshipexam") {
      setModuleToOpen("Scholarship");
    } else if (category.module_name === "cocurricularmodule") {
      setModuleToOpen("Cocurricular"); // Added Cocurricular here
    } else if (category.module_name === "vincentmodule") {
      setModuleToOpen("Vincent");
    } 
   else if (category.module_name === "championship") {
    setModuleToOpen("Championship");
  } 
    else {
      setModuleToOpen("Rooms");
    }
  
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/school-category-item/get_all_category_items/${category.category_id}`
      );
      if (response.data.status) {
        setCategoryItems(response.data.data);
        setItemsLengthMap((prev) => ({
          ...prev,
          [category.category_id]: response.data.data.length,
        }));
      }
    } catch (error) {
      console.error("Error fetching category items:", error);
      print_toast("error", "An error occurred while fetching items");
    }
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);

    try {
      const config = {
        params: {
          print: "print",
        },
        responseType: "blob",
      };

      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/generatePDF_school`,
        config
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "school_evaluation_document.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error generating PDF");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setActiveCategory(null);
    setCategoryItems([]);
  };

  const handleEditClick = (category) => {
    setActiveCategory(category);
    setCategoryDetailsId(category.category_details_id);
    setIsEditing(true);
    setModalIsOpen(true);
  };

  return (
    <>
      {/* <Breadcum items={breadcum} title="School Evaluation Form" /> */}

      <div className="card">
        {/* <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="card-title">School Evaluation Form</h5>
        </div> */}
        <div className="card-body">
          <div className="accordion" id="accordionExample">


            
          {categories.length > 0 && categories.map((category, index) => (
      <div className="accordion-item" key={category.category_id}>
        <h2 className="accordion-header" id={`heading${index}`}>
          <button
            className="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse${index}`}
            aria-expanded="false"
            aria-controls={`collapse${index}`}
          >
            {category.category_title}
          </button>
        </h2>
        <div
          id={`collapse${index}`}
          className="accordion-collapse collapse"
          aria-labelledby={`heading${index}`}
          data-bs-parent="#accordionExample"
        >
          <div className="accordion-body text-end">
            {itemsLengthMap[category.category_id] === 0 ? (
              <button
                className="btn btn-primary btn-sm mb-3"
                onClick={() => handleOpenModal(category)}
              >
                Add
              </button>
            ) : (
              <button
                className="btn btn-warning btn-sm mb-3"
                onClick={() => handleEditClick(category)}
              >
                Edit
              </button>
            )}

            {category.module_name === "kcsltalenthunt" ? (
              <Kcsl_Table
                category_id={category.category_id}
                onDataStatus={(hasData) => {
                  setItemsLengthMap((prev) => ({
                    ...prev,
                    [category.category_id]: hasData ? 1 : 0,
                  }));
                }}
              />
            ) : category.module_name === "scholarshipexam" ? (
              <ScholarshipTable
                category_id={category.category_id}
                onDataStatus={(hasData) => {
                  setItemsLengthMap((prev) => ({
                    ...prev,
                    [category.category_id]: hasData ? 1 : 0,
                  }));
                }}
              />
            ) : category.module_name === "vincentmodule" ? (
              <VincentTable
                category_id={category.category_id}
                onDataStatus={(hasData) => {
                  setItemsLengthMap((prev) => ({
                    ...prev,
                    [category.category_id]: hasData ? 1 : 0,
                  }));
                }}
              />
            ) : category.module_name === "cocurricularmodule" ? (
              <CocurricularTable
                category_id={category.category_id}
                onDataStatus={(hasData) => {
                  setItemsLengthMap((prev) => ({
                    ...prev,
                    [category.category_id]: hasData ? 1 : 0,
                  }));
                }}
              />
            ) : (
              <Table
              docID={evaluation_doc_id}
                category_id={category.category_id}
                onDataStatus={(hasData) => {
                  setItemsLengthMap((prev) => ({
                    ...prev,
                    [category.category_id]: hasData ? 1 : 0,
                  }));
                }}
              />
            )}
          </div>
        </div>
      </div>
    ))}
    
          </div>
        </div>
      </div>

      {/* <button
        onClick={handleGeneratePDF}
        className="btn btn-success btn-sm mt-10"
        disabled={pdfloading}
        style={{
          float: "left",
          marginTop: "-25px",
          backgroundColor: "#007bff",
          borderColor: "#007bff",
        }}
      >
        {pdfloading ? (
          <>
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>{" "}
            Exporting...
          </>
        ) : (
          <>
            <span
              className="bi bi-file-pdf"
              role="status"
              aria-hidden="true"
            ></span>{" "}
            Submit
          </>
        )}
      </button> */}

<CustomModal
  show={modalIsOpen}
  onHide={handleCloseModal}
  title={`${
    isEditing ? "Edit Items for" : "Add Items to"
  } ${activeCategory?.category_title || ""}`}
  isSaving={isSaving}
>
  {isEditing ? (
    activeCategory?.module_name === "kcsltalenthunt" ? (
      <EditKcsl
        categoryId={activeCategory?.category_id}
        categoryDetailsId={categoryDetailsId}
        items={categoryItems}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        onClose={handleCloseModal}
      />
    ) : activeCategory?.module_name === "scholarshipexam" ? (
      <EditScholarship
        categoryId={activeCategory?.category_id}
        categoryDetailsId={categoryDetailsId}
        items={categoryItems}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        onClose={handleCloseModal}
      />
    ) : activeCategory?.module_name === "vincentmodule" ? (
      <EditVincent
        categoryId={activeCategory?.category_id}
        categoryDetailsId={categoryDetailsId}
        items={categoryItems}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        onClose={handleCloseModal}
      />
    ) : activeCategory?.module_name === "cocurricularmodule" ? ( 
      <EditCocurricular
        categoryId={activeCategory?.category_id}
        categoryDetailsId={categoryDetailsId}
        items={categoryItems}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        onClose={handleCloseModal}
      />
    ) : (
      <EditModule
        categoryId={activeCategory?.category_id}
        categoryDetailsId={categoryDetailsId}
        items={categoryItems}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        onClose={handleCloseModal}
      />
    )
  ) : (
    moduleToOpen === "Kcsl" ? (
      <KcslModule
        categoryId={activeCategory?.category_id}
        docID={evaluation_doc_id}
        items={categoryItems} 
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        onClose={handleCloseModal}
      />
    ) : moduleToOpen === "Scholarship" ? (
      <Scholarship
        categoryId={activeCategory?.category_id}
        docID={evaluation_doc_id}
        items={categoryItems} 
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        onClose={handleCloseModal}
      />
    ) : moduleToOpen === "Vincent" ? (
      <VincentModule
        categoryId={activeCategory?.category_id}
        docID={evaluation_doc_id}
        items={categoryItems} 
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        onClose={handleCloseModal}
      />
    ) : moduleToOpen === "Cocurricular" ? ( 
      <Cocurricular
        categoryId={activeCategory?.category_id}
        docID={evaluation_doc_id}
        items={categoryItems} 
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        onClose={handleCloseModal}
      />
    ) : moduleToOpen === "Championship" ? ( 
    
    <Championship
      categoryId={activeCategory?.category_id}
      docID={evaluation_doc_id}
      items={categoryItems} 
      isSaving={isSaving}
      setIsSaving={setIsSaving}
      onClose={handleCloseModal}
    />
  ) : (
      <RoomsModule
      categoryId={activeCategory?.category_id}
      docID={evaluation_doc_id}
      items={categoryItems}  // Ensure items is being passed here
      isSaving={isSaving}
      setIsSaving={setIsSaving}
      onClose={handleCloseModal}
    />
    
    )
  )}
</CustomModal>

    </>
  );
};

export default PhysicalFacilities;
