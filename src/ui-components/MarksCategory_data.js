import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from '../Global.js';
import Modal from 'react-bootstrap/Modal';
import print_toast from '../utilities/Toaster.js';
import Breadcum from './Breadcum';
import { Pencil, Trash2, Plus } from 'lucide-react';

const MarkCategory = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Mark Category', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    category_title: '',
    total_mark: '',
    fk_parent_id: 0,
    save_flag: false,
  });
  const [category, setCategory] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    category_title: '',
    total_mark: '',
    fk_parent_id: 0,
  });
  const [modalErrors, setModalErrors] = useState({});
  const [editingSubcategory, setEditingSubcategory] = useState(false);
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [modalType, setModalType] = useState('edit');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(10); // Set the number of items per page

  const openAddSubcategoryModal = (parentCategory) => {
    setModalType('add');
    setAddingSubcategory(true);
    setSelectedParentId(parentCategory.mark_category_id);
    setEditFormData({
      category_title: '',
      total_mark: '',
      fk_parent_id: parentCategory.mark_category_id,
    });
    setModalIsOpen(true);
  };

  const fetchCategories = async (page = 1) => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/markcategory/get_all_categories`, {
        params: {
          page,
          limit: perPage,
        },
      });

      if (response.data.status) {
        setCategoryList(response.data.data.categories); // assuming response contains categories
        setTotalPages(Math.ceil(response.data.data.total / perPage)); // assuming response contains total number of categories
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      print_toast('error', 'Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modalIsOpen) {
      setEditFormData(prev => ({ ...prev, [name]: value }));
      setModalErrors(prev => ({ ...prev, [name]: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setFormError(prev => ({ ...prev, [name]: '' }));
    }
  };

  const clearForm = () => {
    setFormData({
      category_title: '',
      total_mark: '',
      fk_parent_id: 0,
      save_flag: false,
    });
    setAddingSubcategory(false);
    setSelectedParentId(null);
  };

  const saveCategory = async (e) => {
    e.preventDefault();

    // Don't proceed if already saving
    if (formData.save_flag) return;

    setFormData(prev => ({ ...prev, save_flag: true }));

    try {
      const dataToSend = {
        category_title: formData.category_title,
        total_mark: formData.total_mark,
        fk_parent_id: 0, // Always save as main category from the create form
        is_subcategory: 'false' // Always false for main form
      };

      const response = await axios.post(
        `${globalVariables.api_url}/markcategory/save_category`,
        dataToSend,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.data.status) {
        await fetchCategories();
        clearForm();
        print_toast('success', response.data.message);
      } else {
        print_toast('error', response.data.message);
        setFormError(response.data.error || {});
      }
    } catch (error) {
      console.error('Error saving category:', error.message);
      print_toast('error', 'Failed to save category');
    } finally {
      setFormData(prev => ({ ...prev, save_flag: false }));
    }
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (modalType === 'edit') {
      await updateCategory(e);
    } else {
      // Handle add subcategory
      try {
        const response = await axios.post(
          `${globalVariables.api_url}/markcategory/save_category`,
          {
            category_title: editFormData.category_title,
            total_mark: editFormData.total_mark,
            fk_parent_id: selectedParentId,
            is_subcategory: 'true',
          },
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.data.status) {
          await fetchCategories(currentPage);
          setModalIsOpen(false);
          print_toast('success', response.data.message);
        } else {
          print_toast('error', response.data.message);
          setModalErrors(response.data.error || {});
        }
      } catch (error) {
        console.error('Error adding subcategory:', error.message);
        print_toast('error', 'Failed to add subcategory');
      }
    }
  };

  const deleteCategory = async (categoryItem) => {
    if (categoryItem.delete_flag) return;

    // Check if the category has subcategories
    if (categoryItem.subcategories && categoryItem.subcategories.length > 0) {
      print_toast('error', 'Cannot delete category that has subcategories. Please delete all subcategories first.');
      return;
    }

    try {
      categoryItem.delete_flag = true;
      setCategory({ ...categoryItem });

      const response = await axios.post(
        `${globalVariables.api_url}/markcategory/delete_category`,
        { mark_category_id: categoryItem.mark_category_id },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.data.status) {
        await fetchCategories(currentPage);
        print_toast('success', response.data.message);
      } else {
        print_toast('error', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error.message);
      print_toast('error', 'Failed to delete category');
    } finally {
      categoryItem.delete_flag = false;
    }
  };

  const editCategory = (categoryItem) => {
    setModalType('edit');
    setCategory(categoryItem);
    setEditFormData({
      category_title: categoryItem.category_title,
      total_mark: categoryItem.total_mark,
      fk_parent_id: categoryItem.fk_parent_id,
    });
    setEditingSubcategory(categoryItem.fk_parent_id !== 0);
    setModalIsOpen(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderCategoryTree = (categories, level = 0, isFirstLevel = true) => {
    // Render table headings only once
    if (isFirstLevel) {
      return (
        <>
          <thead>
            <tr>
              <th>ഇനം</th>
              <th>പരമാവധി മാർക്ക് 1800</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((categoryItem) => (
              <React.Fragment key={categoryItem.mark_category_id}>
                {/* Render table rows */}
                <tr>
                  <td style={{ paddingLeft: `${level * 24}px` }}>
                    <div className="d-flex align-items-center">
                      <div
                        className={`expand-collapse-indicator me-3 ${
                          categoryItem.subcategories?.length > 0 ? 'expanded' : ''
                        }`}
                      >
                        {categoryItem.subcategories?.length > 0 ? (
                          <span className="arrow"></span>
                        ) : null}
                      </div>
                      {categoryItem.category_title}
                    </div>
                  </td>
                  <td>{categoryItem.total_mark}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => editCategory(categoryItem)}
                    >
                      <Pencil className="feather" />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteCategory(categoryItem)}
                    >
                      <Trash2 className="feather" />
                    </button>
                  </td>
                </tr>
                {categoryItem.subcategories && categoryItem.subcategories.length > 0 && (
                  <tr>
                    <td colSpan="3">
                      {renderCategoryTree(categoryItem.subcategories, level + 1, false)}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </>
      );
    }
  };

  return (
    <div>
      <Breadcum breadcum={breadcum} />
      <div className="table-container">
        <table className="table table-bordered">
          {renderCategoryTree(categoryList)}
        </table>
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarkCategory;
