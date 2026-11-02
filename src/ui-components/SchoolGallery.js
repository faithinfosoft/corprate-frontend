import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import Breadcum from './Breadcum';
import NoDataFound from './NoDataFound';
import print_toast from "../utilities/Toaster";
import globalVariables from "../Global";
import useAuth from '../utilities/useAuth';
import 'react-image-crop/dist/ReactCrop.css';
import ImageCropper from './AlbumImageCropper';
import gallery_image from "../assets/ui-master/img/no_image_uploaded.jpg";

const SchoolGallery = () => {
  const auth = useAuth();
  const username = auth.user.username;
  const { album_id } = useParams();
  const [photos, setPhotos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [formData, setFormData] = useState({
    gallery_title: '',
    gallery_image: null,
    save_flag: false
  });
  const [editFormData, setEditFormData] = useState({
    photo_gallery_id: '',
    gallery_title: '',
    gallery_image: null,
    save_flag: false
  });
  const [formError, setFormError] = useState({});
  const [modalErrors, setModalErrors] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [cropModalIsOpen, setCropModalIsOpen] = useState(false);
  const [editCropModalIsOpen, setEditCropModalIsOpen] = useState(false);
  const [currentEditingPhoto, setCurrentEditingPhoto] = useState(null);
  const avatarUrl = useRef(gallery_image);
  const fileInputRef = useRef(null);

  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'School Album', Link: '/schoolalbum' },
    { Title: 'Photo Gallery', Link: '' },
  ]);

  useEffect(() => {
    fetchPhotos();
  }, [album_id]);

  const fetchPhotos = async () => {
    try {
      const response = await axios.post(`${globalVariables.api_url}/school-gallery/get-photos`, { username, album_id });
      if (response.data.status) {
        setPhotos(response.data.data);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error fetching photos:', error);
      print_toast('error', 'Failed to fetch photos');
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
        gallery_image: file
      }));
      setFormError(prevErrors => ({
        ...prevErrors,
        gallery_image: ''
      }));
      setCropModalIsOpen(true);
    }
  };

  const handleEditImageChange = (photo) => {
    setCurrentEditingPhoto(photo);
    setEditCropModalIsOpen(true);
  };

  const updateAvatar = (imgSrc, file) => {
    avatarUrl.current = imgSrc;
    setFormData({
      ...formData,
      gallery_image: imgSrc,
    });
  };

  const updateEditAvatar = (croppedImage) => {
    setEditFormData(prevState => ({
      ...prevState,
      gallery_image: croppedImage
    }));
    setEditCropModalIsOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormData(prevState => ({ ...prevState, save_flag: true }));
    setFormError({});

    let errors = {};
    if (!formData.gallery_title.trim()) {
      errors.gallery_title = 'Photo title is required';
    }
    if (!formData.gallery_image) {
      errors.gallery_image = 'Please upload an image';
    }

    if (Object.keys(errors).length > 0) {
      setFormError(errors);
      setFormData(prevState => ({ ...prevState, save_flag: false }));
      return;
    }

    try {
      const response = await axios.post(`${globalVariables.api_url}/school-gallery/add-photo`, {
        username: formData.username,
        album_id:formData.album_id,
        gallery_title: formData.gallery_title,
        gallery_image: formData.gallery_image, // This is now a base64 string
      }, {
        'Content-Type': 'multipart/form-data',
       });

      if (response.data.status) {
        print_toast('success', 'Photo added successfully');
        fetchPhotos();
        clearPhotoForm();
      } else {
        print_toast('error', response.data.message || 'Failed to add photo');
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setFormError(error.response.data.errors);
      } else {
        print_toast('error', 'Failed to add photo');
      }
    } finally {
      setFormData(prevState => ({ ...prevState, save_flag: false }));
    }
  };

  const handleEdit = (photo) => {
    setEditFormData({
      photo_gallery_id: photo.photo_gallery_id,
      gallery_title: photo.gallery_title,
      gallery_image: null,
      save_flag: false
    });
    setModalErrors({});
    setModalIsOpen(true);
  };

  const updatePhoto = async (e) => {
    e.preventDefault();
    setEditFormData(prevState => ({ ...prevState, save_flag: true }));
    setModalErrors({});

    let errors = {};
    if (!editFormData.gallery_title.trim()) {
      errors.gallery_title = 'Photo title is required';
    }

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      setEditFormData(prevState => ({ ...prevState, save_flag: false }));
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', username);
      formDataToSend.append('photo_gallery_id', editFormData.photo_gallery_id);
      formDataToSend.append('gallery_title', editFormData.gallery_title);
      if (editFormData.gallery_image) {
        formDataToSend.append('gallery_image', editFormData.gallery_image);
      }

      const response = await axios.post(`${globalVariables.api_url}/school-gallery/update-photo`, formDataToSend);

      if (response.data.status) {
        print_toast('success', 'Photo updated successfully');
        fetchPhotos();
        setModalIsOpen(false);
        clearEditForm();
      } else {
        print_toast('error', response.data.message || 'Failed to update photo');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setModalErrors(error.response.data.errors);
      } else {
        print_toast('error', 'Failed to update photo');
      }
    } finally {
      setEditFormData(prevState => ({ ...prevState, save_flag: false }));
    }
  };

  const handleEditImageUpdate = async (photo, croppedImage) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('username', username);
      formDataToSend.append('photo_gallery_id', photo.photo_gallery_id);
      formDataToSend.append('gallery_image', croppedImage);

      const response = await axios.post(`${globalVariables.api_url}/school-gallery/update-photo-image`, formDataToSend);

      if (response.data.status) {
        print_toast('success', 'Photo image updated successfully');
        fetchPhotos();
      } else {
        print_toast('error', 'Failed to update photo image');
      }
    } catch (error) {
      console.error('Error updating photo image:', error);
      print_toast('error', 'Failed to update photo image');
    } finally {
      setEditCropModalIsOpen(false);
      setCurrentEditingPhoto(null);
    }
  };

  const handleDelete = async (photo) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        const response = await axios.post(`${globalVariables.api_url}/school-gallery/delete-photo`, {
          username,
          photo_gallery_id: photo.photo_gallery_id
        });
        if (response.data.status) {
          print_toast('success', 'Photo deleted successfully');
          fetchPhotos();
        } else {
          print_toast('error', response.data.message || 'Failed to delete photo');
        }
      } catch (error) {
        console.error('Error deleting photo:', error);
        print_toast('error', 'Failed to delete photo');
      }
    }
  };

  const clearPhotoForm = () => {
    setFormData({
      gallery_title: '',
      gallery_image: null,
      save_flag: false
    });
    setFormError({});
    avatarUrl.current = gallery_image;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearEditForm = () => {
    setEditFormData({
      photo_gallery_id: '',
      gallery_title: '',
      gallery_image: null,
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
      <Breadcum items={breadcum} title="Photo Gallery Management" />

      <div className="row">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title" style={{ color: 'white' }}>Gallery Details</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered datatable">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Photo Title</th>
                      <th scope="col" className="text-center">Photo Image</th>
                      <th scope="col" className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loaded && photos.length === 0 ? (
                      <tr>
                        <td colSpan="4">
                          <NoDataFound />
                        </td>
                      </tr>
                    ) : (
                      photos.map((photo, index) => (
                        <tr key={photo.photo_gallery_id}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{photo.gallery_title}</td>
                          <td className="text-center">
                            <img
                              src={`${globalVariables.img_url}/uploads/gallery_images/${photo.gallery_image}`}
                              alt={photo.gallery_title}
                              style={{ width: '100px' }}
                            />
                            <a href="#" className="dropdown-item" onClick={() => handleEditImageChange(photo)}>Change Image</a>
                          </td>
                          <td className="text-center">
                            <div className="dropdown">
                              <button className="btn btn-dark dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                                Action
                              </button>
                              <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                                <li><a href="#" className="dropdown-item" onClick={() => handleEdit(photo)}>Edit</a></li>
                                <li><a href="#" className="dropdown-item" onClick={() => handleDelete(photo)}>Delete</a></li>
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
              <h5 className="card-title" style={{ color: 'white' }}>Create Gallery</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={handleSubmit} className="row g-3">
                <div className="col-12">
                  <label htmlFor="inputTitle" className="col-sm-12 col-form-label">Title<span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="gallery_title"
                    name="gallery_title"
                    value={formData.gallery_title}
                    onChange={handleChange}
                  />
                  {formError.gallery_title && (
                    <p className="text-danger">{formError.gallery_title}</p>
                  )}
                </div>
                <div className="col-12">
                  <label htmlFor="inputImage" className="col-sm-12 col-form-label">Image<span className="text-danger">*</span></label>
                  <input
                    type="file"
                    className="form-control"
                    id="gallery_image"
                    name="gallery_image"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                  />
                  {formError.gallery_image && (
                    <p className="text-danger">{formError.gallery_image}</p>
                  )}
                </div>
                <div className='col-md-6'>
                  <img src={avatarUrl.current} alt="Gallery preview" style={{ width: '100%' }} />
                </div>
                <div className="col-12">
                  <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-success me-2" disabled={formData.save_flag}>
                      {formData.save_flag ? 'Saving...' : 'Save'}
                    </button>
                    <button type="button" className="btn btn-danger" onClick={clearPhotoForm}>
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
          <Modal.Title>Edit Gallery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={updatePhoto}>
            <div className="mb-3">
              <label htmlFor="editTitle" className="form-label">Title<span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                id="editTitle"
                name="gallery_title"
                value={editFormData.gallery_title}
                onChange={handleChange}
              />
              {modalErrors.gallery_title && <div className="text-danger">{modalErrors.gallery_title}</div>}
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
            image={formData.gallery_image}
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
          {currentEditingPhoto && (
            <ImageCropper
              updateAvatar={(croppedImage) => handleEditImageUpdate(currentEditingPhoto, croppedImage)}
              closeModal={() => setEditCropModalIsOpen(false)}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SchoolGallery;