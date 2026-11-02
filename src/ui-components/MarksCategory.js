import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from '../Global.js';
import Modal from 'react-bootstrap/Modal';
import print_toast from '../utilities/Toaster.js';
import Breadcum from './Breadcum';
import { Pencil, Trash2, Plus, PlusCircle } from 'lucide-react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

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
    sub_cat_english: '', 
    total_mark: '',
    fk_parent_id: 0,
    save_flag: false,
  });
  const [category, setCategory] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [createModalIsOpen, setCreateModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    category_title: '',
    sub_cat_english: '',
    total_mark: '',
    fk_parent_id: 0,
  });
  const [modalErrors, setModalErrors] = useState({});
  const [editingSubcategory, setEditingSubcategory] = useState(false);
  const [addingSubcategory, setAddingSubcategory] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [modalType, setModalType] = useState('edit');


    // CKEditor configuration
    const editorConfig = {
      toolbar: [
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'undo',
        'redo'
      ],
      language: 'en',
      placeholder: 'Enter category title...'
    };

  // Utility function to strip HTML tags
  const stripHtmlTags = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const fixMojibake = (str) => {
    if (!str) return '';
    if (typeof str !== 'string') return str;
    if (!str.includes('à´') && !str.includes('àµ')) return str;
    const win1252Map = {
      0x20AC: 0x80, 0x201A: 0x82, 0x0192: 0x83, 0x201E: 0x84,
      0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02C6: 0x88,
      0x2030: 0x89, 0x0160: 0x8A, 0x2039: 0x8B, 0x0152: 0x8C,
      0x017D: 0x8E, 0x2018: 0x91, 0x2019: 0x92, 0x201C: 0x93,
      0x201D: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
      0x02DC: 0x98, 0x2122: 0x99, 0x0161: 0x9A, 0x203A: 0x9B,
      0x0153: 0x9C, 0x017E: 0x9E, 0x0178: 0x9F
    };
    try {
      const bytes = [];
      for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (win1252Map[code] !== undefined) {
          bytes.push(win1252Map[code]);
        } else if (code <= 0xFF) {
          bytes.push(code);
        } else {
          bytes.push(code & 0xFF);
        }
      }
      return new TextDecoder('utf-8').decode(new Uint8Array(bytes));
    } catch (e) {
      return str;
    }
  };
  
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${globalVariables.api_url}/markcategory/get_all_categories`);
      if (response.data.status) {
        setCategoryList(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      print_toast('error', 'Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
      sub_cat_english: '', 
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
        sub_cat_english: formData.sub_cat_english,
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
        setCreateModalIsOpen(false);
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
            sub_cat_english: editFormData.sub_cat_english,
            total_mark: editFormData.total_mark,
            fk_parent_id: selectedParentId,
            is_subcategory: 'true',
          },
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        if (response.data.status) {
          await fetchCategories();
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
        await fetchCategories();
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
      category_title: fixMojibake(categoryItem.category_title),
      sub_cat_english: categoryItem.sub_cat_english || '',
      total_mark: categoryItem.total_mark,
      fk_parent_id: categoryItem.fk_parent_id,
    });
    setEditingSubcategory(categoryItem.fk_parent_id !== 0);
    setModalIsOpen(true);
  };

  

  // const addSubcategory = (parentCategory) => {
  //   setAddingSubcategory(true);
  //   setSelectedParentId(parentCategory.mark_category_id);
  //   setFormData({
  //     category_title: '',
  //     total_mark: '',
  //     fk_parent_id: parentCategory.mark_category_id,
  //     save_flag: false,
  //   });
  // };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (formData.save_flag) return;

    setFormData(prev => ({ ...prev, save_flag: true }));

    try {
      const response = await axios.post(
        `${globalVariables.api_url}/markcategory/update_category`,
        {
          mark_category_id: category.mark_category_id,
          category_title: editFormData.category_title,
          sub_cat_english: editFormData.sub_cat_english,
          total_mark: editFormData.total_mark,
          fk_parent_id: editFormData.fk_parent_id,
        },
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.data.status) {
        await fetchCategories();
        setModalIsOpen(false);
        print_toast('success', response.data.message);
      } else {
        print_toast('error', response.data.message);
        setModalErrors(response.data.error || {});
      }
    } catch (error) {
      console.error('Error updating category:', error.message);
      print_toast('error', 'Failed to update category');
    } finally {
      setFormData(prev => ({ ...prev, save_flag: false }));
    }
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
                          <span className="text-primary">▼</span>
                        ) : (
                          <span className="text-muted">•</span>
                        )}
                      </div>
                      <span 
                        className={level === 0 ? 'fw-bold' : ''}
                        dangerouslySetInnerHTML={{ __html: fixMojibake(categoryItem.category_title) }}
                      />
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {categoryItem.total_mark > 0 && (
                      <span className="category-mark">
                        <b>
                        {categoryItem.total_mark}</b>
                      </span>
                    )}
                  </td>
  
                  <td>
                    <div className="actions-container d-flex gap-2">
                      <button
                        className="btn btn-light btn-sm rounded-circle"
                        onClick={() => openAddSubcategoryModal(categoryItem)}
                        title="Add Subcategory"
                      >
                        <Plus size={16} className="text-success" />
                      </button>
                      <button
                        className="btn btn-light btn-sm rounded-circle"
                        onClick={() => editCategory(categoryItem)}
                        title="Edit Category"
                      >
                        <Pencil size={16} className="text-primary" />
                      </button>
                      <button
                        className="btn btn-light btn-sm rounded-circle"
                        onClick={() => {
                          if (categoryItem.subcategories?.length > 0) {
                            print_toast('error', 'Please delete all subcategories first');
                          } else if (
                            window.confirm('Are you sure you want to delete this category?')
                          ) {
                            deleteCategory(categoryItem);
                          }
                        }}
                        disabled={categoryItem.delete_flag}
                        title="Delete Category"
                      >
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </td>
                </tr>
  
                {/* Render nested subcategories if they exist */}
                {categoryItem.subcategories?.length > 0 &&
                  renderCategoryTree(categoryItem.subcategories, level + 1, false)}
              </React.Fragment>
            ))}
          </tbody>
        </>
      );
    }
  
    // Render categories without headings (for nested categories)
    return categories.map((categoryItem) => (
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
                  <span className="text-primary">▼</span>
                ) : (
                  <span className="text-muted">•</span>
                )}
              </div>
              <span 
                className={level === 0 ? 'fw-bold' : ''}
                dangerouslySetInnerHTML={{ __html: fixMojibake(categoryItem.category_title) }}
              />
            </div>
          </td>
          <td style={{ textAlign: 'center' }}>
            {categoryItem.total_mark > 0 && (
              <span className="category-mark">{categoryItem.total_mark}</span>
            )}
          </td>
  
          <td>
            <div className="actions-container d-flex gap-2">
              <button
                className="btn btn-light btn-sm rounded-circle"
                onClick={() => openAddSubcategoryModal(categoryItem)}
                title="Add Subcategory"
              >
                <Plus size={16} className="text-success" />
              </button>
              <button
                className="btn btn-light btn-sm rounded-circle"
                onClick={() => editCategory(categoryItem)}
                title="Edit Category"
              >
                <Pencil size={16} className="text-primary" />
              </button>
              <button
                className="btn btn-light btn-sm rounded-circle"
                onClick={() => {
                  if (categoryItem.subcategories?.length > 0) {
                    print_toast('error', 'Please delete all subcategories first');
                  } else if (
                    window.confirm('Are you sure you want to delete this category?')
                  ) {
                    deleteCategory(categoryItem);
                  }
                }}
                disabled={categoryItem.delete_flag}
                title="Delete Category"
              >
                <Trash2 size={16} className="text-danger" />
              </button>
            </div>
          </td>
        </tr>
  
        {/* Render nested subcategories if they exist */}
        {categoryItem.subcategories?.length > 0 &&
          renderCategoryTree(categoryItem.subcategories, level + 1, false)}
      </React.Fragment>
    ));
  };
  
  

  const handleCategoryTitleChange = (event, editor, isMainModal = false) => {
    const data = editor.getData();
    if (isMainModal) {
      setFormData(prev => ({ ...prev, category_title: data }));
      setFormError(prev => ({ ...prev, category_title: '' }));
    } else {
      setEditFormData(prev => ({ ...prev, category_title: data }));
      setModalErrors(prev => ({ ...prev, category_title: '' }));
    }
  };

  const handleSubCategoryEnglishChange = (event, editor, isMainModal = false) => {
    const data = editor.getData();
    if (isMainModal) {
      setFormData(prev => ({ ...prev, sub_cat_english: data }));
    } else {
      setEditFormData(prev => ({ ...prev, sub_cat_english: data }));
    }
  };
  
  
   
  
  return (
    
    <>
      <Breadcum items={breadcum} title="Mark Category" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                Mark Category {addingSubcategory && selectedParentId && 
                  <span className="text-muted"></span>}
              </h5>
              <button 
                className="btn btn-danger" 
                onClick={() => setCreateModalIsOpen(true)}
              >
                <PlusCircle size={20} className="me-2" /> Create Category
              </button>
            </div>
            <div className="card-body">
              <div className="category-tree">
              <table className="table table-bordered malayalam">
                {loaded && categoryList.length === 0 ? (
                  <NoDataFound />
                ) : (
                 
                  renderCategoryTree(categoryList)
                
                )}
                  </table>
              </div>
            </div>
          </div>
        </div>

        

      </div>

      <Modal show={createModalIsOpen} onHide={() => setCreateModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={saveCategory} className="row g-3">
            <div className="col-12">
              <label htmlFor="category_title" className="form-label">
              Category Title (Malayalam) <span className="text-danger">*</span>
              </label>
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={formData.category_title}
                onChange={(event, editor) => handleCategoryTitleChange(event, editor, true)}
              />
              {formError.category_title && (
                <span className="text-danger">{formError.category_title}</span>
              )}
            </div>

            <div className="col-12">
              <label htmlFor="sub_cat_english" className="form-label">
                Category Title (English)
              </label>
              <CKEditor
                editor={ClassicEditor}
                config={{...editorConfig, language: 'en'}}
                data={formData.sub_cat_english}
                onChange={(event, editor) => handleSubCategoryEnglishChange(event, editor, true)}
              />
            </div>

            <div className="col-12">
              <label htmlFor="total_mark" className="form-label">
                Total Mark 
              </label>
              <input
                type="number"
                className="form-control"
                id="total_mark"
                name="total_mark"
                value={formData.total_mark}
                onChange={handleChange}
                placeholder="Enter Total Mark"
                min="0"
              />
              {formError.total_mark && (
                <span className="text-danger">{formError.total_mark}</span>
              )}
            </div>

            <div className="col-12 text-end">
              <button
                type="submit"
                className="btn btn-success m-1"
                disabled={formData.save_flag}
              >
                {formData.save_flag ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-danger m-1"
                onClick={() => {
                  clearForm();
                  setCreateModalIsOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === 'edit' 
              ? (editingSubcategory ? 'Edit Subcategory' : 'Edit Category')
              : 'Add Subcategory'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleModalSubmit}>
          <div className="mb-3">
              <label htmlFor="edit_category_title" className="form-label">
                {modalType === 'edit'
                  ? (editingSubcategory ? 'Subcategory Title (Malayalam)' : 'Category Title (Malayalam)')
                  : 'Subcategory Title (Malayalam)'}
                <span className="text-danger">*</span>
              </label>
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={editFormData.category_title}
                onChange={(event, editor) => handleCategoryTitleChange(event, editor)}
              />
              {modalErrors.category_title && (
                <span className="text-danger">{modalErrors.category_title}</span>
              )}
            </div>
            <div className="mb-3">
              <label htmlFor="edit_sub_cat_english" className="form-label">
                {modalType === 'edit'
                  ? (editingSubcategory ? 'Subcategory Title (English)' : 'Category Title (English)')
                  : 'Subcategory Title (English)'}
              </label>
              <CKEditor
                editor={ClassicEditor}
                config={{...editorConfig, language: 'en'}}
                data={editFormData.sub_cat_english}
                onChange={(event, editor) => handleSubCategoryEnglishChange(event, editor)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="edit_total_mark" className="form-label">
                Total Mark <span className="text-danger"></span>
              </label>
              <input
                type="number"
                className="form-control"
                id="edit_total_mark"
                name="total_mark"
                value={editFormData.total_mark}
                onChange={handleChange}
                min="0" // This prevents negative numbers
              />
              {modalErrors.total_mark && (
                <span className="text-danger">{modalErrors.total_mark}</span>
              )}
            </div>
            <div className="text-end">

            <button
                type="submit"
                className="btn btn-success"
                disabled={formData.save_flag}
              >
                {formData.save_flag ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setModalIsOpen(false)}
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

export default MarkCategory;