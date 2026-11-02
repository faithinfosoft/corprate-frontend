import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import NoDataFound from "./NoDataFound";
import globalVariables from "../Global.js";
import Modal from "react-bootstrap/Modal";
import print_toast from "../utilities/Toaster.js";
import Breadcum from "./Breadcum";
import { useNavigate } from "react-router-dom";

const SchoolEvaluation = () => {
  const navigate = useNavigate();
  const [categoryList, setCategoryList] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [breadcum, setBreadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "School Evaluation", Link: "" },
  ]);
  const [formData, setFormData] = useState({
    category_title: "",
    position:'',
    editable_status: false,
    save_flag: false,
  });
  const [category, setCategory] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    category_title: "",
    position:'',
    editable_status: false,
  });
  const [modalErrors, setModalErrors] = useState({});

  const redirectToCategoryItem = (categoryId) => {
    navigate(`/school-category-item/${categoryId}`);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${globalVariables.api_url}/schoolevaluation/get_all_categories`
      );
      if (response.data.status) {
        setCategoryList(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (modalIsOpen) {
      setEditFormData((prevData) => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      }));
      setModalErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === 'checkbox' ? checked : value
      }));
      setFormError((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const clearCategoryForm = () => {
    setFormData({
      category_title: "",
      position:'',
      editable_status: false,
      save_flag: false,
    });
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    setFormData((prevData) => ({ ...prevData, save_flag: true }));

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/save_category`,
        formData,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.data.status) {
        await fetchCategories();
        clearCategoryForm();
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error("Error saving category:", error.message);
    } finally {
      setFormData((prevData) => ({ ...prevData, save_flag: false }));
    }
  };

  const deleteCategory = async (_category) => {
    if (_category.delete_flag) return;

    try {
      _category.delete_flag = true;
      setCategory({ ..._category });

      const response = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/delete_category`,
        { category_id: _category.category_id },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.data.status) {
        setCategoryList(
          categoryList.filter((c) => c.category_id !== _category.category_id)
        );
        print_toast("success", response.data.message);
      } else {
        print_toast("error", response.data.message);
      }
    } catch (error) {
      console.error("Error deleting category:", error.message);
    } finally {
      _category.delete_flag = false;
    }
  };

  const editCategory = (_category) => {
    setCategory(_category);
    setEditFormData({
      category_title: _category.category_title,
      position: _category.position,
      editable_status: _category.editable_status === "1",
    });
    openModal();
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalErrors({});
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (formData.save_flag) return;

    setFormData((prevData) => ({ ...prevData, save_flag: true }));

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/schoolevaluation/update_category`,
        {
          category_id: category.category_id,
          category_title: editFormData.category_title,
          position: editFormData.position,
          editable_status: editFormData.editable_status ? "1" : "0",
        },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      if (response.data.status) {
        await fetchCategories();
        clearCategoryForm();
        print_toast("success", response.data.message);
        closeModal();
      } else {
        print_toast("error", response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error("Error updating category:", error.message);
    } finally {
      setFormData((prevData) => ({ ...prevData, save_flag: false }));
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const updatedCategories = Array.from(categoryList);
    const [movedItem] = updatedCategories.splice(source.index, 1);
    updatedCategories.splice(destination.index, 0, movedItem);

    updatedCategories.forEach((item, index) => {
      item.position = index + 1;
    });

    try {
      await axios.post(
        `${globalVariables.api_url}/schoolevaluation/update_category_positions`,
        {
          positions: updatedCategories.map(({ category_id, position }) => ({
            category_id,
            position,
          })),
        },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      setCategoryList(updatedCategories);
      print_toast("success", "Positions updated successfully.");
    } catch (error) {
      console.error("Error updating positions:", error.message);
      print_toast("error", "Error updating positions.");
    }
  };

  return (
    <>
      <Breadcum items={breadcum} title="School Evaluation Category" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">School Evaluation Category List</h5>
            </div>
            <div className="card-body">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="categorys">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="table-responsive"
                    >
                      <table className="table table-bordered datatable">
                        <thead>
                          <tr>
                            <th scope="col" className="text-center">
                              Sl No.
                            </th>
                            <th scope="col" className="text-center">
                              Category Title
                            </th>
                            <th scope="col" className="text-center">
                              Editable Status
                            </th>
                            <th scope="col" className="text-center">
                              Position
                            </th>
                            <th scope="col" className="text-center">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {loaded && categoryList.length === 0 ? (
                            <tr>
                              <td colSpan="5">
                                <NoDataFound />
                              </td>
                            </tr>
                          ) : (
                            categoryList.map((categoryItem, index) => (
                              <Draggable
                                key={categoryItem.category_id}
                                draggableId={String(categoryItem.category_id)}
                                index={index}
                              >
                                {(provided) => (
                                  <tr
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <td className=" text-center">
                                      {index + 1}
                                    </td>
                                    <td className=" text-center">
                                      {categoryItem.category_title}
                                    </td>
                                    <td className=" text-center">
                                      {categoryItem.editable_status === "1" ? "Yes" : "No"}
                                    </td>
                                    <td className=" text-center">
                                      {categoryItem.position}
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
                                        <ul
                                          className="dropdown-menu"
                                          aria-labelledby={`dropdownMenuButton${index}`}
                                        >
                                          <li>
                                            <button
                                              className="dropdown-item"
                                              onClick={() =>
                                                editCategory(categoryItem)
                                              }
                                            >
                                              Edit
                                            </button>
                                          </li>
                                          <li>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => redirectToCategoryItem(categoryItem.category_id)}
                                            >
                                              School Category Item
                                            </button>
                                          </li>
                                          <li>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => {
                                                if (
                                                  window.confirm(
                                                    "Are you sure you want to delete this category?"
                                                  )
                                                ) {
                                                  deleteCategory(categoryItem);
                                                }
                                              }}
                                              disabled={
                                                categoryItem.delete_flag
                                              }
                                            >
                                              {categoryItem.delete_flag
                                                ? "Deleting..."
                                                : "Delete"}
                                            </button>
                                          </li>
                                        </ul>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Draggable>
                            ))
                          )}
                          {provided.placeholder}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Create School Evaluation Category</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={saveCategory} className="row g-3">
                <div className="col-12">
                  <label htmlFor="category_title" className="form-label">
                    Category Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="category_title"
                    name="category_title"
                    placeholder="Category Title"
                    
                    value={formData.category_title}
                    onChange={handleChange}
                  />
                  {formError.category_title && (
                    <span className="text-danger">{formError.category_title}</span>
                  )}
                </div>
                <div className="col-12">
                  <label htmlFor="inputName" className="col-sm-12 col-form-label">Position<span className="text-danger">*</span> </label>
                  <input
                    type="text"
                    className="form-control"
                    id="position"
                    name="position"
                    placeholder="Enter Position"
                    value={formData.position}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{formError.position}</span>
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="editable_status"
                      name="editable_status"
                      checked={formData.editable_status}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="editable_status">
                      Editable Status
                    </label>
                  </div>
                </div>
                <div className="col-12 text-end">
                  <button
                    type="submit"
                    className="btn btn-success me-2"
                    disabled={formData.save_flag}
                  >
                    {formData.save_flag ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={clearCategoryForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={updateCategory} className="row g-3">
            <div className="col-12">
              <label htmlFor="edit_category_title" className="form-label">
                Category Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="edit_category_title"
                name="category_title"
                placeholder="Enter Category Title"
                value={editFormData.category_title}
                onChange={handleChange}
              />
              {modalErrors.category_title && (
                <span className="text-danger">
                  {modalErrors.category_title}
                </span>
              )}
            </div>

            
            <div className="col-12">
                  <label htmlFor="inputName" className="col-sm-12 col-form-label">Position<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="position"
                    name="position"
                    placeholder="Enter Position"
                    value={editFormData.position}
                    onChange={handleChange}
                  />
                  <span className="text-danger">{modalErrors.position}</span>
                </div>

            <div className="col-12">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="edit_editable_status"
                  name="editable_status"
                  checked={editFormData.editable_status}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="edit_editable_status">
                  Editable Status
                </label>
              </div>
            </div>

            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn btn-success me-2"
                disabled={formData.save_flag}
              >
                {formData.save_flag ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SchoolEvaluation;