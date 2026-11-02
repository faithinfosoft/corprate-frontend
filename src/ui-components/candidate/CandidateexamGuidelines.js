import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NoDataFound from '../NoDataFound';
import globalVariables from "../../Global.js";
import print_toast from "../../utilities/Toaster.js";
import Modal from 'react-bootstrap/Modal';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Breadcum from '../Breadcum'; // Corrected import path


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
    <div className="card">
      <div className="card-header">
        <h5 className="card-title">Exam Guidelines</h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          {loaded && datasettingss.length === 0 ? (
            <p>No data available</p> // Provide a valid fallback when datasettingss is empty
          ) : (
            datasettingss.map((datasetting, index) => (
              <div key={index} className='exam-guidelines-content p-0'>
                <div
                  dangerouslySetInnerHTML={{
                    __html: datasetting.data_setting_description,
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
</div>



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
