import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import NoDataFound from './NoDataFound';
import globalVariables from '../Global.js';
import Modal from 'react-bootstrap/Modal';
import print_toast from '../utilities/Toaster.js';
import Breadcum from './Breadcum';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

const SchoolCategoryItem = () => {
  const [maxPosition, setMaxPosition] = useState(0);
  const { fk_category_id } = useParams();
  const [categoryItems, setCategoryItems] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [breadcum, setBreadcum] = useState([
    { Title: "Home", Link: "/" },
    { Title: "School Category Items", Link: "" }
  ]);
  const [formData, setFormData] = useState({
    item_name: "",
    item_capacity: "",
    fk_category_id: fk_category_id,
    item_position: 0,
    save_flag: false,
  });
  const [categoryItem, setCategoryItem] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    item_name: "",
    item_capacity: "",
    fk_category_id: fk_category_id,
  });
  const [modalErrors, setModalErrors] = useState({});

  const fetchCategoryItems = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/school-category-item/get_all_category_items/${fk_category_id}`);
      if (response.data.status) {
        setCategoryItems(response.data.data);

        const highestPosition = Math.max(...response.data.data.map(item => item.item_position), 0);
        setMaxPosition(highestPosition);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching category items:', error.message);
    }
  };

  useEffect(() => {
    fetchCategoryItems();
  }, [fk_category_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modalIsOpen) {
      setEditFormData((prevData) => ({ ...prevData, [name]: value }));
      setModalErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
      setFormError((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const clearForm = () => {
    setFormData({
      item_name: "",
      item_capacity: "",
      fk_category_id: fk_category_id,
      item_position: 0,
      save_flag: false,
    });
  };

  const saveCategoryItem = async (e) => {
    e.preventDefault();
    setFormData((prevData) => ({ ...prevData, save_flag: true }));
  
    try {
      const response = await axios.post(
        `${globalVariables.api_url}/school-category-item/save_category_item`,
        {
          ...formData,
          fk_category_id: fk_category_id,
          item_position: maxPosition + 1, // Set the position to be one more than the current max
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
  
      if (response.data.status) {
        await fetchCategoryItems(); // This will update the list and the maxPosition
        clearForm();
        print_toast('success', response.data.message);
      } else {
        print_toast('error', response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving category item:', error.message);
    } finally {
      setFormData((prevData) => ({ ...prevData, save_flag: false }));
    }
  };

  const deleteCategoryItem = async (_categoryItem) => {
    if (_categoryItem.delete_flag) return;

    try {
      _categoryItem.delete_flag = true;
      setCategoryItem({ ..._categoryItem });

      const response = await axios.post(
        `${globalVariables.api_url}/school-category-item/delete_category_item`,
        { school_evaluation_category_item_id: _categoryItem.school_evaluation_category_item_id },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (response.data.status) {
        setCategoryItems(
          categoryItems.filter((item) => item.school_evaluation_category_item_id !== _categoryItem.school_evaluation_category_item_id)
        );
        print_toast('success', response.data.message);
      } else {
        print_toast('error', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting category item:', error.message);
    } finally {
      _categoryItem.delete_flag = false;
    }
  };

  const editCategoryItem = (_categoryItem) => {
    setCategoryItem(_categoryItem);
    setEditFormData({
      item_name: _categoryItem.item_name,
      item_capacity: _categoryItem.item_capacity,
      fk_category_id: fk_category_id,
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

  const updateCategoryItem = async (e) => {
    e.preventDefault();
    if (formData.save_flag) return;

    setFormData((prevData) => ({ ...prevData, save_flag: true }));

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/school-category-item/update_category_item`,
        {
          school_evaluation_category_item_id: categoryItem.school_evaluation_category_item_id,
          item_name: editFormData.item_name,
          item_capacity: editFormData.item_capacity,
          fk_category_id: fk_category_id,
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (response.data.status) {
        await fetchCategoryItems();
        clearForm();
        print_toast('success', response.data.message);
        closeModal();
      } else {
        print_toast('error', response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error('Error updating category item:', error.message);
    } finally {
      setFormData((prevData) => ({ ...prevData, save_flag: false }));
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const updatedItems = Array.from(categoryItems);
    const [movedItem] = updatedItems.splice(source.index, 1);
    updatedItems.splice(destination.index, 0, movedItem);

    updatedItems.forEach((item, index) => {
      item.item_position = index + 1;
    });

    try {
      await axios.post(
        `${globalVariables.api_url}/school-category-item/update_category_item_positions`,
        {
          positions: updatedItems.map(({ school_evaluation_category_item_id, item_position }) => ({
            school_evaluation_category_item_id,
            item_position,
          })),
        },
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      setCategoryItems(updatedItems);
      print_toast('success', 'Positions updated successfully.');
    } catch (error) {
      console.error('Error updating positions:', error.message);
      print_toast('error', 'Error updating positions.');
    }
  };

  return (
    <>
      <Breadcum items={breadcum} title="School Category Items" />
      <div className="row">
        {/* Category Item List */}
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">School Category Items List</h5>
            </div>
            <div className="card-body">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="categoryItems">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="table-responsive"
                    >
                      <table className="table table-bordered datatable">
                        <thead>
                          <tr>
                            <th scope="col" className="text-center">Sl No.</th>
                            
                            <th scope="col" className="text-center">Item Name</th>
                            <th scope="col" className="text-center">Capacity</th>
                            <th scope="col" className="text-center">Position</th>
                            <th scope="col" className="text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loaded && categoryItems.length === 0 ? (
                            <tr>
                              <td colSpan="5">
                                <NoDataFound />
                              </td>
                            </tr>
                          ) : (
                            categoryItems.map((item, index) => (
                              <Draggable
                                key={item.school_evaluation_category_item_id}
                                draggableId={String(item.school_evaluation_category_item_id)}
                                index={index}
                              >
                                {(provided) => (
                                  <tr
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <td className="text-center">{index + 1}</td>
                                    
                                    <td className="text-center">{item.item_name}</td>
                                    <td className="text-center">{item.item_capacity}</td>
                                    <td className="text-center">{item.item_position}</td>
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
                                        <ul className="dropdown-menu" aria-labelledby={`dropdownMenuButton${index}`}>
                                          <li>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => editCategoryItem(item)}
                                            >
                                              Edit
                                            </button>
                                          </li>
                                          <li>
                                            <button
                                              className="dropdown-item"
                                              onClick={() => {
                                                if (window.confirm('Are you sure you want to delete this item?')) {
                                                  deleteCategoryItem(item);
                                                }
                                              }}
                                              disabled={item.delete_flag}
                                            >
                                              {item.delete_flag ? 'Deleting...' : 'Delete'}
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

        {/* Add New Category Item */}
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Add New School Category Item</h5>
            </div>
            <div className="card-body">
              <form onSubmit={saveCategoryItem} className="row g-3">
                <div className="col-12">
                  <label htmlFor="item_name" className="form-label">Item Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control "
                    id="item_name"
                    name="item_name"
                    value={formData.item_name}
                    onChange={handleChange}
                  />
                  {formError.item_name && <div className="text-danger">{formError.item_name}</div>}
                </div>
               
                <div className="col-12">
                <label htmlFor="item_capacity" className="form-label">Item Capacity <span className="text-danger"></span></label>
            <select
              className="form-control"
              id="item_capacity"
              name="item_capacity"
              value={formData.item_capacity}
              onChange={handleChange}
            >
              <option value="">Select Capacity</option>
              <option value="number">Number</option>
              <option value="sqft">Square Feet</option>
             
            </select>
            {formError.school_gender_type && <div className="text-danger">{formError.school_gender_type}</div>}
          </div>


                <div className="col-12 text-end">
                  <button type="submit" className="btn btn-success" disabled={formData.save_flag}>
                    {formData.save_flag ? 'Saving...' : 'Save'}
                  </button>
                  <button type="button" className="btn btn-danger ms-2" onClick={clearForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Category Item Modal */}
      <Modal show={modalIsOpen} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form role="form" onSubmit={updateCategoryItem} className="row g-3">
            <div className="col-12">
              <label htmlFor="edit_item_name" className="form-label">
                Item Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="edit_item_name"
                name="item_name"
                placeholder="Enter Item Name"
                value={editFormData.item_name}
                onChange={handleChange}
              />
              {modalErrors.item_name && (
                <span className="text-danger">
                  {modalErrors.item_name}
                </span>
              )}
            </div>

            <div className="col-12">
              <label htmlFor="edit_item_capacity" className="form-label">
                Item Capacity <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                id="edit_item_capacity"
                name="item_capacity"
                placeholder="Enter Item Capacity"
                value={editFormData.item_capacity}
                onChange={handleChange}
              />
              {modalErrors.item_capacity && (
                <span className="text-danger">
                  {modalErrors.item_capacity}
                </span>
              )}
            </div>

            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn btn-success m-1"
                disabled={formData.save_flag}
              >
                {formData.save_flag ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                className="btn btn-danger m-1"
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

export default SchoolCategoryItem;
