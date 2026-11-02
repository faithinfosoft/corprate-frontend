import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import Breadcum from './Breadcum';
import NoDataFound from './NoDataFound';
import print_toast from "../utilities/Toaster";
import globalVariables from "../Global";
import useAuth from '../utilities/useAuth';
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper from './AlbumImageCropper';
import album_image from "../assets/ui-master/img/no_image_uploaded.jpg";

const SchoolAlbum = () => {
  const auth = useAuth();
  const username = auth.user.username;
  const [albums, setAlbums] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [formData, setFormData] = useState({
    album_title: '',
    album_image: null,
    save_flag: false
  });
  const [editFormData, setEditFormData] = useState({
    album_id: '',
    album_title: '',
    album_image: null,
    save_flag: false
  });
  const [formError, setFormError] = useState({});
  const [modalErrors, setModalErrors] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [cropModalIsOpen, setCropModalIsOpen] = useState(false);
  const [editCropModalIsOpen, setEditCropModalIsOpen] = useState(false);
  const [currentEditingAlbum, setCurrentEditingAlbum] = useState(null);
  const avatarUrl = useRef(album_image);
  const fileInputRef = useRef(null);

  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'School Album', Link: '' },
  ]);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await axios.post(`${globalVariables.api_url}/school-album/get-albums`, { username });
      if (response.data.status) {
        setAlbums(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching albums:', error);
      print_toast('error', 'Failed to fetch albums');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (modalIsOpen) {
      setEditFormData({
        ...editFormData,
        [name]: value,
      });
      setModalErrors({
        ...modalErrors,
        [name]: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      setFormError({
        ...formError,
        [name]: '',
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prevState => ({
        ...prevState,
        album_image: file
      }));
      setFormError(prevErrors => ({
        ...prevErrors,
        album_image: ''
      }));
      setCropModalIsOpen(true);
    }
  };

  const handleEditImageChange = (album) => {
    setCurrentEditingAlbum(album);
    setEditCropModalIsOpen(true);
  };

  const updateAvatar = (imgSrc, file) => {
    avatarUrl.current = imgSrc;
    // console.log(avatarUrl.current)
    setFormData({
          ...formData,
          album_image: imgSrc, // Update the state with the cropped image file   
        }
    );   
  };

  const updateEditAvatar = (croppedImage) => {
    setEditFormData(prevState => ({
      ...prevState,
      album_image: croppedImage
    }));
    setEditCropModalIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData(prevState => ({ ...prevState, save_flag: true }));
    setFormError({});
    
    let errors = {};
    if (!formData.album_title.trim()) {
      errors.album_title = 'Album title is required';
    }
    if (!formData.album_image) {
      errors.album_image = 'Please upload an image';
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      setFormData(prevState => ({ ...prevState, save_flag: false }));
      return;
    }
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', username);
      formDataToSend.append('album_title', formData.album_title);
      formDataToSend.append('album_image', formData.album_image);
      const response = await axios.post(
        `${globalVariables.api_url}/school-album/create-album`,
        formDataToSend,
        {
         'Content-Type': 'multipart/form-data',
        }
      );
      if (response.data.status) {
        print_toast('success', 'Album created successfully');
        fetchAlbums();
        clearAlbumform();
      } else {
        if (response.data.errors) {
          setFormError(response.data.errors);
        } else {
          print_toast('error', 'Failed to create album');
        }
      }
    } catch (error) {
      console.error('Error creating album:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setFormError(error.response.data.errors);
      } else {
        print_toast('error', 'Failed to create album');
      }
    } finally {
      setFormData(prevState => ({ ...prevState, save_flag: false }));
    }
  };

  const handleEdit = (album) => {
    setEditFormData({
      album_id: album.album_id,
      album_title: album.album_title,
      album_image: null,
      save_flag: false
    });
    setModalErrors({});
    setModalIsOpen(true);
  };
  
  const updateAlbum = async (e) => {
    e.preventDefault();
    setEditFormData(prevState => ({ ...prevState, save_flag: true }));
    setModalErrors({});
    
    let errors = {};
    if (!editFormData.album_title.trim()) {
      errors.album_title = 'Album title is required';
    }
  
    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      setEditFormData(prevState => ({ ...prevState, save_flag: false }));
      return;
    }
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', username);
      formDataToSend.append('album_id', editFormData.album_id);
      formDataToSend.append('album_title', editFormData.album_title);
  
      const response = await axios.post(`${globalVariables.api_url}/school-album/update-album`, formDataToSend);
      
      if (response.data.status) {
        print_toast('success', 'Album updated successfully');
        fetchAlbums();
        setModalIsOpen(false);
        clearEditForm();
      } else {
        if (response.data.errors) {
          setModalErrors(response.data.errors);
        } else {
          print_toast('error', 'Failed to update album');
        }
      }
    } catch (error) {
      console.error('Error updating album:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setModalErrors(error.response.data.errors);
      } else {
        print_toast('error', 'Failed to update album');
      }
    } finally {
      setEditFormData(prevState => ({ ...prevState, save_flag: false }));
    }
  };

  const handleEditImageUpdate = async (album, croppedImage) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', username);
      formDataToSend.append('album_id', album.album_id);
      formDataToSend.append('album_image', croppedImage);
  
      const response = await axios.post(`${globalVariables.api_url}/school-album/update-album-image`, formDataToSend);
  
      if (response.data.status) {
        print_toast('success', 'Album image updated successfully');
        fetchAlbums();
      } else {
        print_toast('error', 'Failed to update album image');
      }
    } catch (error) {
      console.error('Error updating album image:', error);
      print_toast('error', 'Failed to update album image');
    } finally {
      setEditCropModalIsOpen(false);
      setCurrentEditingAlbum(null);
    }
  };

  const handleDelete = async (album) => {
    if (album.delete_flag) return;

    if (window.confirm('Are you sure you want to delete this album?')) {
      try {
        album.delete_flag = true;
        setAlbums(prevAlbums => prevAlbums.map(a => a.album_id === album.album_id ? {...a, delete_flag: true} : a));

        const response = await axios.post(`${globalVariables.api_url}/school-album/delete-album`, {
          username,
          album_id: album.album_id
        });

        if (response.data.status) {
          print_toast('success', 'Album deleted successfully');
          fetchAlbums();
        } else {
          print_toast('error', response.data.message || 'Failed to delete album');
        }
      } catch (error) {
        console.error('Error deleting album:', error);
        if (error.response && error.response.status === 400 && error.response.data.messages) {
          const errorMessage = error.response.data.messages.message;
          print_toast('error', errorMessage || 'Failed to delete album');
        } else {
          print_toast('error', 'Failed to delete album');
        }
      } finally {
        album.delete_flag = false;
        setAlbums(prevAlbums => prevAlbums.map(a => a.album_id === album.album_id ? {...a, delete_flag: false} : a));
      }
    }
  };

  const clearAlbumform = () => {
    setFormData({
      album_title: '',
      album_image: null,
      save_flag: false
    });
    setFormError({});
    avatarUrl.current = album_image;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearEditForm = () => {
    setEditFormData({
      album_id: '',
      album_title: '',
      album_image: null,
      save_flag: false
    });
    setModalErrors({});
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    clearEditForm();
  };

  return (
    <div>
      <Breadcum items={breadcum} title="School Album Management" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title" style={{ color: 'white' }}>Album Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Album Title</th>
                      <th scope="col" className="text-center">Album Image</th>
                      <th scope="col" className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && albums.length === 0 ? (
                      <tr>
                        <td colSpan="4">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      albums.map((album, index) => (
                        <tr key={album.album_id}>
                          <td>{index + 1}</td>
                          <td>{album.album_title}</td>
                          <td>
                            <img
                              src={`${globalVariables.img_url}/uploads/album_images/${album.album_image}`}
                              alt={album.album_title}
                              style={{ width: '100px' }}
                            />
                            <a href="#" className="dropdown-item" onClick={() => handleEditImageChange(album)}>Change Image</a>
                          </td>
                          <td>
                            <div className="dropdown">
                              <button className="btn btn-dark dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                Action
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                <li><a href="#" className="dropdown-item" onClick={() => handleEdit(album)}>Edit</a></li>
                                <li>
                                  <Link to={`/schoolgallery/${album.album_id}`} className="dropdown-item">
                                    Photo Gallery
                                  </Link>
                                </li>
                                <li><a href="#" className="dropdown-item" onClick={() => handleDelete(album)}>Delete</a></li>
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
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title" style={{ color: 'white' }}>Create Album</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                  <label htmlFor="inputName" className="col-sm-12 col-form-label">Title<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    name="album_title"
                    value={formData.album_title}
                    onChange={handleChange}
                  />
                  {formError.album_title && (
                    <p className="text-danger">{formError.album_title}</p>
                  )}
                </div>
                <div className="col-12">
                  <label htmlFor="inputImage" className="col-sm-12 col-form-label">Image<span className="text-danger">*</span></label>
                  <input
                    type="file"
                    className="form-control"
                    name="album_image"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                  {formError.album_image && (
                    <p className="text-danger">{formError.album_image}</p>
                  )}
                </div>
                <div className='col-md-6'>
                  <img src={avatarUrl.current} alt="Album preview" style={{ width: '100%' }} />
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-success me-2" disabled={formData.save_flag}>
                      {formData.save_flag ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={clearAlbumform}>
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={handleCloseModal}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Album</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={updateAlbum}>
      <div className="mb-3">
        <label htmlFor="editAlbumTitle" className="form-label">Album Title<span className="text-danger">*</span></label>
        <input
          type="text"
          className="form-control"
          id="editAlbumTitle"
          name="album_title"
          value={editFormData.album_title}
          onChange={handleChange}
        />
        {modalErrors.album_title && <div className="text-danger">{modalErrors.album_title}</div>}
      </div>
      <div className="text-end">
        <button type="submit" className="btn btn-success me-2" disabled={editFormData.save_flag}>
          {editFormData.save_flag ? 'Updating...' : 'Update'}
        </button>
        <button type="button" className="btn btn-danger" onClick={handleCloseModal}>Cancel</button>
      </div>
    </form>
  </Modal.Body>
</Modal>

<Modal show={cropModalIsOpen} onHide={() => setCropModalIsOpen(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Crop Image</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <ImageCropper
      image={formData.album_image}
      updateAvatar={updateAvatar}
      closeModal={() => setCropModalIsOpen(false)}
    />
  </Modal.Body>
</Modal>

<Modal show={editCropModalIsOpen} onHide={() => setEditCropModalIsOpen(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Crop Image</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {currentEditingAlbum && (
      <ImageCropper
        updateAvatar={(croppedImage) => handleEditImageUpdate(currentEditingAlbum, croppedImage)}
        closeModal={() => setEditCropModalIsOpen(false)}
      />
    )}
  </Modal.Body>
</Modal>
</div>
);
};

export default SchoolAlbum;