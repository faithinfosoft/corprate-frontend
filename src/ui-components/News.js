import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import NoDataFound from './NoDataFound';
import globalVariables from '../Global.js';
import Modal from 'react-bootstrap/Modal';
import print_toast from '../utilities/Toaster.js';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper1 from './ImageCropper1';
import news_image from "../assets/ui-master/img/no_image _uploaded.jpg";
import photo from "../assets/ui-master/img/no_image_uploaded.jpg";
import { Link, useNavigate } from 'react-router-dom';

import useAuth from '../utilities/useAuth';
import Breadcum from './Breadcum'; // Corrected import path
const News = () => {

  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },

    { Title: 'News', Link: '' },
  ]);
  const navigate = useNavigate();
  const auth = useAuth();
 const user_id= auth.user.user_id;
 const username= auth.user.username;
 const school_id = auth.user.school_id;

 const editorRef = useRef(null);
 const [searchQuery, setSearchQuery] = useState('');
  const [filteredNews, setFilteredNews] = useState([]);
 const [editorData, setEditorData] = useState('');
 const [editEditorData, setEditEditorData] = useState('');
    const [albums, setAlbums] = useState([]);
  const [news, setNews] = useState([]);
  const [formError, setFormError] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [editImgModalOpen, seteditImgModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    news_id: '',
    
    news_title: '',
    news_description: '',
    news_image: '',
    created_by: username,
    news_end_date: '',
    news_status: '',
    user_id:user_id,
    fk_school_id: school_id,
    save_flag: false,
  });

  const [addModalIsOpen, setAddModalIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    news_id: '',
   
    news_title: '',
    news_description: '',
    news_image: '',
    news_posted_date: '',
    news_end_date: '',
    news_status: '',
    created_date: '',
   
    save_flag: false,
    created_by: username,
    fk_school_id: school_id
  });

  const [editImgFormData, setEditImgFormData] = useState({
    news_image: '',
    news_id:''
  
  });

  const [imgFormData, setImgFormData] = useState({
    news_image: '',
    news_id:''
  
  });

  const avatarUrl = useRef(
    news_image
    );

    const updateAvatar = (imgSrc, file) => {
        avatarUrl.current = imgSrc;
        setFormData({
              ...formData,
              news_image: imgSrc, // Update the state with the cropped image file
        
            
            });
          
          };  

  const [modalOpen, setModalOpen] = useState(false);
 

  const openAddModal = () => {
    setAddModalIsOpen(true);
  };

  const closeAddModal = () => {
    setAddModalIsOpen(false);
    clearNewsForm();
  };

  const openEditModal = () => {
    setEditModalIsOpen(true);
  };

const [descriptionModalIsOpen, setDescriptionModalIsOpen] = useState(false);
const [currentDescription, setCurrentDescription] = useState('');
const [currentType, setCurrentType] = useState('');
const [currentImage, setCurrentImage] = useState('');
const [currentTitle, setCurrentTitle] = useState('');
const [currentCreated, setCurrentCreated] = useState('');

const closeModal = () => {
    setAddModalIsOpen(false);
    setEditFormData({
      news_id: '',
    
      news_title: '',
      news_description: '',
      news_image: '',
      news_posted_date: '',
      news_end_date: '',
      news_status: '',
      created_date: '',
      created_by: '',
    });
    setFormError({});
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    setEditFormData({
      news_id: '',
    //   news_type: '',
      news_title: '',
      news_description: '',
    //   news_image: '',
      news_posted_date: '',
      news_end_date: '',
      news_status: '',
      created_date: '',
      created_by: '',
    });
    setFormError({});
  };

  const clearNewsForm = () => {
    setFormData({
      news_id: '',
    //   news_type: '',
      news_title: '',
      news_description: '',
      news_image: '',
      news_posted_date: '',
      news_end_date: '',
      news_status: '',
      created_date: '',
      created_by: '',
      save_flag: false,
    });
    setFormError({});
    setEditorData(''); // Clear CKEditor content
  };

  const cropEditedImage = (imgSrc, file) => {
    // Update the state with the new image data
    setEditImgFormData(prevState => {
      const updatedState = {
        ...prevState,
        news_image: imgSrc,
        save_flag: true
      };
  
      // Call the function with the updated state
      updateAlbumImage(updatedState);
  
      return updatedState;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
  
    if (file) {
      console.log('File selected:', file);
  
      // Update form data
      setFormData((prevData) => ({
        ...prevData,
        news_image: file, // Update with selected file
      }));
  
      // Update imgFormData correctly based on its previous state
      setImgFormData((prevImgData) => ({
        ...prevImgData,
        news_image: file,
      }));
  
      // Open the modal if not already open
      if (!modalOpen) {
        setModalOpen(true);
      }
    } else {
      console.error('No file selected.');
    }
  };

  const fetchNews = async () => {
    try {
      const response = await axios.get(globalVariables.api_url + '/news/view',
        {
          params: {
            username: username
          },
        }
      );
      if (response.data.status) {
        const sortedNews = response.data.data.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      setNews(sortedNews);
      } else {
      //  alert(response.data.message);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching news:', error.message);
    }
  };

 


  useEffect(() => {
    fetchNews();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
    setFormError({
      ...formError,
      [e.target.name]: ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
    setFormError({
      ...formError,
      [name]: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedFormData = {
        ...formData,
        save_flag: true,
        fk_school_id: school_id,
      };

      const response = await axios.post(globalVariables.api_url + '/news/save', updatedFormData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.status) {
        await fetchNews();
        clearNewsForm();
        avatarUrl.current=news_image;
        print_toast('success', response.data.message);
        closeAddModal();
      } else {
        let error = response.data.error;
        print_toast('error', response.data.message);
        if (error) {
          setFormError(error);
        } else {
          setFormError({});
        }
      }
    } catch (error) {
      console.error('Error saving news:', error.message);
    }
  };

  const handleDelete = async (newsItem) => {
    try {
      newsItem.delete_flag = true;
      setNews((prevNews) =>
        prevNews.map((n) =>
          n.news_id === newsItem.news_id ? newsItem : n
        )
      );
      const formData = { news_id: newsItem.news_id };
      const response = await axios.post(globalVariables.api_url + '/news/delete', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      if (response.data.status) {
        print_toast('success', response.data.message);
        await fetchNews();
        setNews((prevnews) => prevnews.filter(news => news.news_id !== newsItem.news_id));
      } else {
        print_toast('error', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting news:', error.message);
    } finally {
      newsItem.delete_flag = false;
      setNews((prevNews) =>
        prevNews.map((n) =>
          n.news_id === newsItem.news_id ? newsItem : n
        )
      );
    }
  };

  const handleEdit = (newsItem) => {
    setEditFormData({
      news_id: newsItem.news_id,
    //   news_type: newsItem.news_type,
      news_title: newsItem.news_title,
      news_description: newsItem.news_description,
    //   news_image: newsItem.news_image,
      news_posted_date: newsItem.news_posted_date,
      news_end_date: newsItem.news_end_date,
      news_status: newsItem.news_status,
      created_date: newsItem.created_date,
      created_by: newsItem.created_by,
    });

    setEditEditorData(newsItem.news_description); // Set CKEditor data
    openEditModal();
  };

  const handleEditImage = (newsItem) => {
    
    setEditImgFormData(prevState => ({
      ...prevState,
      news_title: null,
      news_id: newsItem.news_id
    }));
    
    seteditImgModalOpen(true);
  };


  const handleDescription = (image, title, createddate, type, description) => {
    setCurrentCreated(createddate);
    setCurrentTitle(title);
    setCurrentImage(image);
    setCurrentType(type);
    setCurrentDescription(description);
    setDescriptionModalIsOpen(true);
  };

  const updateAlbumImage = async (editImgFormData) => {
    try {
      // Create a new FormData object
      const formDataToUpdateImg = new FormData();
      formDataToUpdateImg.append('news_id', editImgFormData.news_id);
      formDataToUpdateImg.append('news_image', editImgFormData.news_image);
  
      // Log FormData content for debugging
      for (let [key, value] of formDataToUpdateImg.entries()) {
        // console.log(key, value);
      }
  
      // Send the request using axios
      const response = await axios.post(globalVariables.api_url + '/news/updateimage', formDataToUpdateImg, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (response.data.status) {
        fetchNews();
        avatarUrl.current=news_image;
        print_toast("success", response.data.message);
        seteditImgModalOpen(false);
      } else {
        let error = response.data.error;
        print_toast("error", response.data.message);
        if (error) {
          setFormError(response.data.error);
        } else {   
          setFormError('');
        }
      }
    } catch (error) {
      console.error('Error updating  image:', error.message);
    } finally {
      setEditImgFormData(prevState => ({
        ...prevState,
        save_flag: false,
      }));
    }
  };
  

  const updateNews = async (e) => {
    e.preventDefault();
    try {
      const formDataToUpdate = {
        ...editFormData,
      };

      const response = await axios.post(globalVariables.api_url + '/news/update', formDataToUpdate, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (response.data.status) {
        await fetchNews();
        closeEditModal();
        print_toast('success', response.data.message);
      } else {
        let error = response.data.error;
        print_toast('error', response.data.message);
        if (error) {
          setFormError(error);
        } else {
          setFormError({});
        }
      }
    } catch (error) {
      console.error('Error updating news:', error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  };
  return (
    <>

<Breadcum items={breadcum} title="News" /> {/* Pass breadcum as a prop */}
{/* Rest of your component code */}
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
                <h5 className="card-title">News Details</h5>
                
      <div >
        <button className="btn btn-danger" onClick={openAddModal}>
          Add News
        </button>
      </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-bordered datatable">
                    <thead>
                      <tr>
                        <th scope="col" className="text-center">Sl No.</th>
                        
                        <th scope="col" className="text-center">News Title</th>
                        {/* <th scope="col" className="text-center">Description</th> */}
                        <th scope="col" className="text-center">Image</th>
                        <th scope="col" className="text-center">End Date</th>
                        <th scope="col" className="text-center">Status</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loaded && news.length === 0 ? (
                        <tr>
                          <td colSpan="8">
                            <NoDataFound />
                          </td>
                        </tr>
                      ) : (
                        news.map((newsItem, index) => (
                            console.log("Album Image URL:", newsItem.album_image_url),
                          <tr key={newsItem.news_id}>
                            <td>{index + 1}</td>
                            {/* <td>{newsItem.news_type}</td> */}
                            <td>{newsItem.news_title}</td>
                            {/* <td>
                            <td className="text-center">
                          <div dangerouslySetInnerHTML={{ __html: newsItem.news_description }} />
                        </td>
                            </td> */}
                    <td>
  <img
    src={newsItem.news_image ? `${globalVariables.img_url}/uploads/news/${newsItem.news_image}` : photo}
    alt="news"
    className="img-fluid mb-3"
    style={{ width: '100px' }}
  />
  <a href="#!" className="dropdown-item text-danger" onClick={() => handleEditImage(newsItem)}>
    Change Image
  </a>
</td>

                            <td>{formatDate(newsItem.news_end_date)}</td>
                            <td>
  {newsItem.news_status === "notpublished" ? (
    <strong style={{ color: 'red', fontWeight: 'bold' }}>{newsItem.news_status}</strong>
  ) : (
    newsItem.news_status
  )}
</td>


                            <td>
                              <div className="dropdown">
                                <button className="btn btn-dark dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                  Action
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                  <li>
                                    <a href="#" className="dropdown-item" onClick={() => handleEdit(newsItem)}>Edit</a>
                                  </li>
                                  <li>
                                    <a href="#" className="dropdown-item" onClick={() => handleDescription(newsItem.news_image, newsItem.news_title,newsItem.news_posted_date,newsItem.news_type,newsItem.news_description)}>News

                                    </a>
                                  </li>
                                  <li>
  <a
    href="#"
    disabled={newsItem.delete_flag}
    className="dropdown-item"
    onClick={(e) => {
      e.preventDefault(); // Prevent the default link behavior
      // Show confirmation dialog
      if (window.confirm('Are you sure you want to delete this news item?')) {
        handleDelete(newsItem);
      }
    }}
  >
    {newsItem.delete_flag ? 'Deleting...' : 'Delete'}
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
      </div>

    
      {/* Add News Modal */}
      <Modal show={addModalIsOpen} onHide={closeAddModal} size="xxl" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Add News Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
          <div class="row">  
           
          
          
         <div class="col-lg-6"> 
            <div className="form-group">
              <label htmlFor="news_title">News Title  <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="news_title"
                name="news_title"
                value={formData.news_title}
                onChange={handleChange}
              />
              {formError.news_title && (
                <div className="text-danger">{formError.news_title}</div>
              )}
            </div>
           </div> 
           
           <div class="col-lg-6">
            <div className="form-group">
              <label htmlFor="news_end_date">End Date  <span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                id="news_end_date"
                name="news_end_date"
                value={formData.news_end_date}
                onChange={handleChange}
              />
              {formError.news_end_date && (
                <div className="text-danger">{formError.news_end_date}</div>
              )}
            </div>
          </div> 
          <div class="col-lg-6">
            <div className="form-group">
              <label htmlFor="news_status">Status  <span className="text-danger">*</span></label>
              <select
                className="form-control"
                id="news_status"
                name="news_status"
                value={formData.news_status}
                onChange={handleChange}
              >
                <option value="">Select Status</option>
                <option value="published">Active</option>
                <option value="notpublished">Inactive</option>
              </select>
              {formError.news_status && (
                <div className="text-danger">{formError.news_status}</div>
              )}
            </div>
            </div>
            </div>

        <div class="col-rg-6">
         
        <div className="form-group">
          <div class="custom-editor-container">
          
              <label htmlFor="news_description">News Description  <span className="text-danger">*</span></label>
              



<CKEditor
                    editor={ClassicEditor}
                    data={editorData}
                    onReady={(editor) => {
                      editorRef.current = editor;
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditorData(data);
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        news_description: data,
                      }));
                    }}
                  />
              {formError.news_description && (
                <div className="text-danger">{formError.news_description}</div>
              )}
            </div>
            </div>
            </div>


            <div class="col-lg-6">
            <div className="form-group">
            <label htmlFor="inputImage" className="col-sm-12 col-form-label">Image: <span className="text-danger">*</span></label>
                
            <input
  type="file"
  className="form-control"
  name="news_image"
  accept="image/*"
  onChange={handleImageChange}
  onClick={(e) => (e.target.value = '')} // Clear file input when clicked
  required
/>
                </div>
                <div className='col-md-6'>
                  {avatarUrl.current? (
                    <img src={avatarUrl.current} alt="Uploaded"  name="news_image" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                  ) : (
                    <div style={{
                      width: '100%',
                     
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: '#f0f0f0',
                      border: '2px dashed #ccc'
                    }}>
                      No image uploaded
                    </div>
                  )}
                </div>
            </div>
         
           <div className="col-12 text-end">
            <div className="form-group m-1">
              <button type="submit" className="btn btn-success">
                Save
              </button>

              <button type="button" className="btn btn-danger m-1" onClick={closeAddModal}>
                Cancel
              </button>
            </div>
            </div>
          </form>
        </Modal.Body>
      </Modal>



      <Modal show={modalOpen} onHide={() => setModalOpen(false)}  backdrop="static">
  <Modal.Header closeButton>
    <Modal.Title>Crop Image</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <ImageCropper1
      closeModal={() => setModalOpen(false)}
      updateAvatar={updateAvatar}
      image={formData.news_image}
    />
  </Modal.Body>
</Modal>


      {/* Description Modal */}
<Modal show={descriptionModalIsOpen} onHide={() => setDescriptionModalIsOpen(false)} size="xl"  backdrop="static">
  <Modal.Header closeButton>
    <Modal.Title> 
      {currentType}
     </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div class="coloumn">
      
      <b> <div style={{ fontSize: '18px' }} dangerouslySetInnerHTML={{ __html: currentTitle }} /> </b>
      
      

      {currentImage && ( <div>  <img
    src={currentImage ? `${globalVariables.img_url}/uploads/news/${currentImage}` : photo}
    alt="news"
    className="img-fluid mb-3"
    style={{ width: '100px' }}
  /> </div> )}  
        <h6> <b> Detailed:</b></h6>
        <div 
        style={{ textAlign: 'justify' }} 
        dangerouslySetInnerHTML={{ __html: currentDescription }} 
      />
      </div>
    
  </Modal.Body>
  <Modal.Footer>
    <button className="btn btn-danger" onClick={() => setDescriptionModalIsOpen(false)}>
      Close
    </button>
  </Modal.Footer>
</Modal>



      {/* Edit News Modal */}
      <Modal show={editModalIsOpen} onHide={closeEditModal} size="xxl" backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit News Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={updateNews}>
            
            <div className="form-group">
              <label htmlFor="news_title">News Title  <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="news_title"
                name="news_title"
                value={editFormData.news_title}
                onChange={handleEditChange}
              />
              {formError.news_title && (
                <div className="text-danger">{formError.news_title}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="news_description">News Description  <span className="text-danger">*</span></label>
              <CKEditor
                    editor={ClassicEditor}
                    data={editEditorData}
                    onReady={(editor) => {
                      editorRef.current = editor;
                    }}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setEditEditorData(data);
                      setEditFormData((prevFormData) => ({
                        ...prevFormData,
                        news_description: data,
                      }));
                    }}
                  />
              {formError.news_description && (
                <div className="text-danger">{formError.news_description}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="news_end_date">End Date  <span className="text-danger">*</span></label>
              <input
                type="date"
                className="form-control"
                id="news_end_date"
                name="news_end_date"
                value={editFormData.news_end_date}
                onChange={handleEditChange}
              />
              {formError.news_end_date && (
                <div className="text-danger">{formError.news_end_date}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="news_status">Status  <span className="text-danger">*</span></label>
              <select
                className="form-control"
                id="news_status"
                name="news_status"
                value={editFormData.news_status}
                onChange={handleEditChange}
              >
                <option value="">Select Status</option>
                <option value="published">Published</option>
                <option value="notpublished">Not Published</option>
              </select>
              {formError.news_status && (
                <div className="text-danger">{formError.news_status}</div>
              )}
            </div>
            <div className="form-group text-end m-1">
              <button type="submit" className="btn btn-success">
                Update 
              </button>
              <button type="button" className="btn btn-danger m-1" onClick={closeEditModal}>
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>


      <Modal show={editImgModalOpen} onHide={() => seteditImgModalOpen(false)} backdrop="static">
  <Modal.Header closeButton>
    <Modal.Title>Edit Image</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <ImageCropper1 updateAvatar={cropEditedImage} closeModal={closeModal} updateAlbumImage={updateAlbumImage} />
  </Modal.Body>
</Modal>

    </>
);
};

export default News;