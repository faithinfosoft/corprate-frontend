import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound.js';
import globalVariables from '../Global.js';
import Modal from 'react-bootstrap/Modal';
import print_toast from '../utilities/Toaster.js';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Breadcum from './Breadcum'; // Corrected import path


const Data_Settings = () => {
  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Rules', Link: '' },
  ]);
  const [editImgModalOpen, seteditImgModalOpen] = useState(false);
  const editorRef = useRef(null);
  const [editorData, setEditorData] = useState('');
  const [editEditorData, setEditEditorData] = useState('');
  const [errors, setErrors] = useState({});
  const [editformError, setEditFormError] = useState({});
  const [datasettingss, setDataSettings] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [editImgFormData, setEditImgFormData] = useState({
    data_setting_image: '',
    data_setting_id:''
  
  });
  const [formData, setFormData] = useState({
    data_setting_head: '',
    data_setting_title: '',
    data_setting_description: '',
  });

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [readMoreModal, setReadMoreModal] = useState(false);
  const [descriptionToShow, setDescriptionToShow] = useState('');
  const [editFormData, setEditFormData] = useState({
    data_setting_id: '',
    data_setting_head: '',
    data_setting_title: '',
    data_setting_description: '',
  });

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    clearEditForm();
  };

  const clearDataSettingsForm = () => {
    setFormData({
      data_setting_head: '',
      data_setting_title: '',
      data_setting_description: '',
      save_flag: false,
    });
    setEditorData(''); // Clear CKEditor content
    setFormError({});
  };

  const clearEditForm = () => {
    setEditFormData({
      data_setting_id: '',
      data_setting_head: '',
      data_setting_title: '',
      data_setting_description: '',
    });
    setEditEditorData(''); // Clear CKEditor content for edit form
    setEditFormError({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setFormError({
      ...formError,
      [name]: '',
    });

    setEditFormError((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
    setFormError({
      ...formError,
      [name]: '',
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.data_setting_description || !formData.data_setting_description.trim()) {
      print_toast('warning', 'Please enter rules description');
      return;
    }
    try {
      setFormData((prev) => ({ ...prev, save_flag: true }));
      const response = await axios.post(globalVariables.api_url + '/datasettings/save', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status) {
        clearDataSettingsForm();
        await fetchDataSettings();
        setAddModalOpen(false);
        print_toast('success', response.data.message);
      } else {
        setFormError(response.data.error || {});
        print_toast('error', response.data.message);
      }
    } catch (error) {
      console.error('Error saving data settings:', error.message);
      setFormError({ submit: 'An error occurred. Please try again.' });
    } finally {
      setFormData((prev) => ({ ...prev, save_flag: false }));
    }
  };

  const fetchDataSettings = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/datasettings/view');
      if (response.data.status) {
        setDataSettings(response.data.data);
      } else {
        //alert(response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  };

  useEffect(() => {
    fetchDataSettings();
  }, []);

  const handleDelete = async (datasetting) => {
    try {
      datasetting.delete_flag = true;
      setDataSettings((prevDataSettings) =>
        prevDataSettings.map((ds) =>
          ds.data_setting_id === datasetting.data_setting_id ? datasetting : ds
        )
      );
      const formData = { data_setting_id: datasetting.data_setting_id };
      const response = await axios.post(globalVariables.api_url + '/datasettings/delete', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (response.data.status) {
        print_toast('success', response.data.message);
        await fetchDataSettings();
      } else {
        print_toast('error', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting data setting:', error.message);
    } finally {
      datasetting.delete_flag = false;
      setDataSettings((prevDataSettings) =>
        prevDataSettings.map((ds) =>
          ds.data_setting_id === datasetting.data_setting_id ? datasetting : ds
        )
      );
    }
  };

  const handleEdit = (datasetting) => {
    setEditFormData({
      data_setting_id: datasetting.data_setting_id,

      data_setting_description: datasetting.data_setting_description,
    });
    setEditEditorData(datasetting.data_setting_description); // Set CKEditor data
    openModal();
  };

  const updateDataSettings = async (e) => {
    e.preventDefault();
    const sanitizedDescription = sanitizeHtml(editFormData.data_setting_description);
    try {
      const formDataToUpdate = {

        data_setting_id: editFormData.data_setting_id,
        data_setting_description: sanitizedDescription.__html,
      };

      const response = await axios.post(globalVariables.api_url + '/datasettings/update', formDataToUpdate, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.data.status) {
        await fetchDataSettings();
        
        closeModal();
        print_toast('success', response.data.message);
      } else {
        let error = response.data.error;
        print_toast('error', response.data.message);
        if (error) {
          setEditFormError(error);
        } else {
          setEditFormError({});
        }
      }
    } catch (error) {
      console.error('Error updating data setting:', error.message);
    }
  };

  const handleReadMore = (description) => {
    setDescriptionToShow(description);
    setReadMoreModal(true);
  };
  const closeReadMoreModal = () => {
    setReadMoreModal(false);
    setDescriptionToShow('');

  };


 

  


  const handleDescriptionChange = (event, editor) => {
    const data = editor.getData();
    setFormData(prevState => ({
      ...prevState,
      data_setting_description	: data
    }));
    setErrors(prevErrors => ({ ...prevErrors, description: '' }));
  };


  const handleeditDescriptionChange = (event, editor) => {
    const data = editor.getData(); // Captures the HTML content
    setEditFormData((prevState) => ({
      ...prevState,
      data_setting_description: data,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, description: '' }));
  };
  
   const sanitizeHtml = (html) => {
    const allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'img', 'a', 'span', 'div'
    ];
    const allowedAttributes = ['href', 'src', 'alt', 'style', 'class'];

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const sanitized = doc.body.innerHTML.replace(/<([^>]+)>/g, (match, tag) => {
      const tagName = tag.split(' ')[0];
      if (!allowedTags.includes(tagName)) return '';

      if (tag.includes(' ')) {
        const attrs = tag.split(' ').slice(1).join(' ');
        const sanitizedAttrs = attrs.replace(/(\w+)(?:=(?:["'](?:\\.|[^"])*["']|[^"'\s]*))?/g, (attrMatch, attrName) => {
          return allowedAttributes.includes(attrName) ? attrMatch : '';
        });
        return `<${tagName} ${sanitizedAttrs}>`;
      }

      return match;
    });

    return { __html: sanitized };
  };
  return (
    <>
      <Breadcum items={breadcum} title="Rules" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">Rules</h5>
              <button
                type="button"
                className="btn btn-primary shadow-sm"
                onClick={() => {
                  clearDataSettingsForm();
                  setAddModalOpen(true);
                }}
              >
                <i className="bi bi-plus-circle me-1"></i> Add Rule
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover datatable align-middle">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="text-center" style={{ width: '80px' }}>Sl No.</th>
                      <th scope="col">Rules</th>
                      <th scope="col" className="text-center" style={{ width: '130px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && datasettingss.length === 0 ? (
                      <tr>
                        <td colSpan="3">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      datasettingss.map((datasetting, index) => (
                        <tr key={datasetting.data_setting_id}>
                          <td className="text-center fw-bold">{index + 1}</td>
                          <td className="exam-guidelines-content" style={{ fontFamily: "'Noto Sans Malayalam', 'Manjari', sans-serif" }}>
                            {datasetting.data_setting_description.length > 200 ? (
                              <>
                                <span
                                  dangerouslySetInnerHTML={sanitizeHtml(
                                    datasetting.data_setting_description.slice(0, 200)
                                  )}
                                />
                                ...
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm p-0 ms-1 fw-bold text-decoration-none"
                                  onClick={() => handleReadMore(datasetting.data_setting_description)}
                                >
                                  Read More
                                </button>
                              </>
                            ) : (
                              <span
                                dangerouslySetInnerHTML={sanitizeHtml(datasetting.data_setting_description)}
                              />
                            )}
                          </td>
                          <td className="text-center">
                            <div className="dropdown">
                              <button className="btn btn-dark dropdown-toggle btn-sm" type="button" id={`dropdownMenuButton-${index}`} data-bs-toggle="dropdown" aria-expanded="false">
                                Action
                              </button>
                              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby={`dropdownMenuButton-${index}`}>
                                <li>
                                  <a href="#" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleEdit(datasetting); }}>
                                    <i className="bi bi-pencil-square me-2 text-primary"></i>Edit
                                  </a>
                                </li>
                                <li>
                                  <a
                                    href="#"
                                    disabled={datasetting.delete_flag}
                                    className="dropdown-item text-danger"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (window.confirm('Are you sure you want to delete this rule?')) {
                                        handleDelete(datasetting);
                                      }
                                    }}
                                  >
                                    <i className="bi bi-trash me-2 text-danger"></i>{datasetting.delete_flag ? 'Please Wait...' : 'Delete'}
                                  </a>
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
        </div>
      </div>

      {/* Add Rule Modal */}
      <Modal show={addModalOpen} onHide={() => { setAddModalOpen(false); clearDataSettingsForm(); }} backdrop="static" size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fs-5 text-white fw-bold">
            <i className="bi bi-plus-circle me-2"></i>Add Rule
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="data_setting_description" className="form-label fw-bold">
                Rules <span className="text-danger">*</span>
              </label>
              <CKEditor
                editor={ClassicEditor}
                config={{
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "link",
                    "bulletedList",
                    "numberedList",
                    "|",
                    "blockQuote",
                    "undo",
                    "redo",
                    "insertTable",
                  ],
                  table: {
                    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
                  },
                }}
                data={editorData}
                onReady={(editor) => {
                  editorRef.current = editor;
                }}
                onChange={handleDescriptionChange}
              />
            </div>
            <div className="col-12 text-end mt-4">
              <button type="submit" className="btn btn-success px-4 me-2" disabled={formData.save_flag}>
                {formData.save_flag ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearDataSettingsForm();
                  setAddModalOpen(false);
                }}
                className="btn btn-danger px-4"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Rule Modal */}
      <Modal show={modalIsOpen} onHide={closeModal} backdrop="static" size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fs-5 text-white fw-bold">
            <i className="bi bi-pencil-square me-2"></i>Edit Rule
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={updateDataSettings}>
            <div className="mb-3">
              <label htmlFor="edit_data_setting_description" className="form-label fw-bold">
                Rules <span className="text-danger">*</span>
              </label>
              <CKEditor
                editor={ClassicEditor}
                config={{
                  toolbar: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "link",
                    "bulletedList",
                    "numberedList",
                    "|",
                    "blockQuote",
                    "undo",
                    "redo",
                    "insertTable",
                  ],
                  table: {
                    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
                  },
                }}
                data={editEditorData}
                onReady={(editor) => {
                  editorRef.current = editor;
                }}
                onChange={handleeditDescriptionChange}
              />
            </div>
            <div className="mb-3 text-end mt-4">
              <button type="submit" className="btn btn-success px-4 me-2">Update</button>
              <button type="button" className="btn btn-danger px-4" onClick={closeModal}>Cancel</button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal show={readMoreModal} onHide={closeReadMoreModal} backdrop="static" size="xl">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fs-5 text-white fw-bold">
            <i className="bi bi-file-earmark-text me-2"></i>Exam Guidelines
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="exam-guidelines-content" dangerouslySetInnerHTML={{ __html: descriptionToShow }} />
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <button className="btn btn-secondary px-4" onClick={closeReadMoreModal}>
            Close
          </button>
        </Modal.Footer>
      </Modal>
      
  
    </>


   
  );
};

export default Data_Settings;
