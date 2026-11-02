import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Modal } from 'react-bootstrap';
import globalVariables from '../Global';
import print_toast from '../utilities/Toaster';
import useAuth from '../utilities/useAuth';
import { convertDateFormat } from '../utilities/dateconverter';
import NoDataFound from './NoDataFound';

const StaffRemarks = ({ staffId }) => {
  const auth = useAuth();
  const userType = auth?.user?.user_type;
  const isCorporateManager = userType === 'corporate_admin' || userType === 'corporate_manager';

  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRemark, setSelectedRemark] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const initialFormState = {
    remark_title: '',
    remark_date: getTodayDate(),
    remark_text: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  const fetchRemarks = useCallback(async () => {
    if (!staffId || !isCorporateManager) return;
    setLoading(true);
    try {
      const response = await axios.get(`${globalVariables.api_url}/staff/remarks/${staffId}`);
      if (response.data?.status) {
        setRemarks(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        setRemarks([]);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        print_toast('error', 'Access denied: Corporate Manager authorization required');
      } else {
        console.error('Error fetching staff remarks:', error);
      }
      setRemarks([]);
    } finally {
      setLoading(false);
    }
  }, [staffId, isCorporateManager]);

  useEffect(() => {
    fetchRemarks();
  }, [fetchRemarks]);

  if (!isCorporateManager) {
    return (
      <div className="alert alert-danger" role="alert">
        <h5 className="alert-heading fw-bold mb-1">Access Restricted</h5>
        <p className="mb-0 small">
          The Staff Remarks section is accessible exclusively by the Corporate Manager.
        </p>
      </div>
    );
  }

  const validateForm = () => {
    const errors = {};
    if (!formData.remark_date) {
      errors.remark_date = 'Remark date is required.';
    }
    if (!formData.remark_text || formData.remark_text.trim() === '') {
      errors.remark_text = 'Remarks cannot be empty.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormData({
      remark_title: '',
      remark_date: getTodayDate(),
      remark_text: '',
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleOpenEditModal = (remark) => {
    setSelectedRemark(remark);
    setFormData({
      remark_title: remark.remark_title || '',
      remark_date: remark.remark_date || getTodayDate(),
      remark_text: remark.remark_text || '',
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (remark) => {
    setSelectedRemark(remark);
    setShowDeleteModal(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        fk_staff_id: staffId,
        remark_title: formData.remark_title.trim(),
        remark_type: 'General Remark',
        priority: 'Normal',
        remark_date: formData.remark_date,
        remark_text: formData.remark_text.trim(),
      };

      const response = await axios.post(`${globalVariables.api_url}/staff/remarks`, payload);
      if (response.data?.status) {
        print_toast('success', response.data.message || 'Remark added successfully');
        setShowAddModal(false);
        fetchRemarks();
      } else {
        print_toast('error', response.data?.message || 'Failed to add remark');
      }
    } catch (error) {
      console.error('Error saving remark:', error);
      print_toast('error', error.response?.data?.message || 'An error occurred while saving the remark');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!selectedRemark?.remark_id) return;

    setIsSubmitting(true);
    try {
      const payload = {
        remark_title: formData.remark_title.trim(),
        remark_type: selectedRemark.remark_type || 'General Remark',
        priority: selectedRemark.priority || 'Normal',
        remark_date: formData.remark_date,
        remark_text: formData.remark_text.trim(),
      };

      const response = await axios.put(
        `${globalVariables.api_url}/staff/remarks/${selectedRemark.remark_id}`,
        payload
      );
      if (response.data?.status) {
        print_toast('success', response.data.message || 'Remark updated successfully');
        setShowEditModal(false);
        setSelectedRemark(null);
        fetchRemarks();
      } else {
        print_toast('error', response.data?.message || 'Failed to update remark');
      }
    } catch (error) {
      console.error('Error updating remark:', error);
      print_toast('error', error.response?.data?.message || 'An error occurred while updating the remark');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRemark?.remark_id) return;
    setIsSubmitting(true);
    try {
      const response = await axios.delete(
        `${globalVariables.api_url}/staff/remarks/${selectedRemark.remark_id}`
      );
      if (response.data?.status) {
        print_toast('success', response.data.message || 'Remark deleted successfully');
        setShowDeleteModal(false);
        setSelectedRemark(null);
        fetchRemarks();
      } else {
        print_toast('error', response.data?.message || 'Failed to delete remark');
      }
    } catch (error) {
      console.error('Error deleting remark:', error);
      print_toast('error', error.response?.data?.message || 'An error occurred while deleting the remark');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter remarks
  const filteredRemarks = remarks.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.remark_title || '').toLowerCase().includes(term) ||
      (r.remark_text || '').toLowerCase().includes(term) ||
      (r.created_by || '').toLowerCase().includes(term) ||
      (r.remark_date || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="row staff-remarks-wrapper">
      <div className="col-lg-12">
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden staff-remarks-card">
          {/* Consistent Card Header */}
          <div
            className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center"
            style={{ borderTop: '4px solid #0ea5e9', color: '#012970' }}
          >
            <h5
              className="card-title mb-0 fw-bold text-dark"
              style={{ color: '#012970', fontWeight: '600', fontSize: '1.15rem' }}
            >
              Staff Remarks
            </h5>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleOpenAddModal}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Remark
            </button>
          </div>

          <div className="card-body">
            {/* Search toolbar */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
              <span className="text-muted small">
                Showing <strong>{filteredRemarks.length}</strong> of <strong>{remarks.length}</strong> remarks
              </span>
              <div className="d-flex align-items-center">
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '280px' }}
                  placeholder="Search remarks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Remarks Table */}
            <div className="table-responsive">
              <table className="table table-bordered table-striped table-hover align-middle mb-0">
                <thead className="table-light text-muted">
                  <tr>
                    <th scope="col" className="text-center fw-semibold py-3" style={{ width: '60px' }}>
                      Sl No.
                    </th>
                    <th scope="col" className="text-center fw-semibold py-3" style={{ width: '130px' }}>
                      Date
                    </th>
                    <th scope="col" className="text-center fw-semibold py-3" style={{ width: '220px' }}>
                      Title / Subject
                    </th>
                    <th scope="col" className="text-start fw-semibold py-3">
                      Remark / Observation
                    </th>
                    <th scope="col" className="text-center fw-semibold py-3" style={{ width: '210px' }}>
                      Recorded By
                    </th>
                    <th scope="col" className="text-center fw-semibold py-3" style={{ width: '150px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                        Loading remarks...
                      </td>
                    </tr>
                  ) : filteredRemarks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        <NoDataFound />
                      </td>
                    </tr>
                  ) : (
                    filteredRemarks.map((remark, index) => (
                      <tr key={remark.remark_id}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center text-nowrap">
                          {convertDateFormat(remark.remark_date)}
                        </td>
                        <td className="text-center fw-semibold">
                          {remark.remark_title || '-'}
                        </td>
                        <td className="text-start" style={{ whiteSpace: 'pre-wrap' }}>
                          {remark.remark_text}
                        </td>
                        <td className="text-center small">
                          <span className="fw-medium text-dark">{remark.created_by || 'Corporate Manager'}</span>
                          {remark.created_at && (
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                              {new Date(remark.created_at).toLocaleDateString()} {new Date(remark.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          {remark.updated_by && (
                            <div className="text-muted fst-italic" style={{ fontSize: '0.75rem' }}>
                              Updated by {remark.updated_by}
                            </div>
                          )}
                        </td>
                        <td className="text-center text-nowrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleOpenEditModal(remark)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleOpenDeleteModal(remark)}
                          >
                            Delete
                          </button>
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

      {/* Modal: Add Remark */}
      <Modal show={showAddModal} onHide={() => !isSubmitting && setShowAddModal(false)} backdrop="static" size="lg">
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title className="h5 fw-bold mb-0">Add Remark</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveAdd}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.remark_date}
                  onChange={(e) => {
                    setFormData({ ...formData, remark_date: e.target.value });
                    if (formErrors.remark_date) setFormErrors({ ...formErrors, remark_date: null });
                  }}
                  required
                />
                {formErrors.remark_date && (
                  <div className="text-danger small mt-1">{formErrors.remark_date}</div>
                )}
              </div>

              <div className="col-md-8 mb-3">
                <label className="form-label">Title / Subject</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Annual Review, Observation"
                  value={formData.remark_title}
                  onChange={(e) => setFormData({ ...formData, remark_title: e.target.value })}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">
                  Remarks <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={5}
                  placeholder="Enter remarks..."
                  value={formData.remark_text}
                  onChange={(e) => {
                    setFormData({ ...formData, remark_text: e.target.value });
                    if (formErrors.remark_text) setFormErrors({ ...formErrors, remark_text: null });
                  }}
                  required
                ></textarea>
                {formErrors.remark_text && (
                  <div className="text-danger small mt-1">{formErrors.remark_text}</div>
                )}
              </div>
            </div>

            <div className="text-end mt-3">
              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal: Edit Remark */}
      <Modal show={showEditModal} onHide={() => !isSubmitting && setShowEditModal(false)} backdrop="static" size="lg">
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title className="h5 fw-bold mb-0">Edit Remark</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSaveEdit}>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.remark_date}
                  onChange={(e) => {
                    setFormData({ ...formData, remark_date: e.target.value });
                    if (formErrors.remark_date) setFormErrors({ ...formErrors, remark_date: null });
                  }}
                  required
                />
                {formErrors.remark_date && (
                  <div className="text-danger small mt-1">{formErrors.remark_date}</div>
                )}
              </div>

              <div className="col-md-8 mb-3">
                <label className="form-label">Title / Subject</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.remark_title}
                  onChange={(e) => setFormData({ ...formData, remark_title: e.target.value })}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">
                  Remarks <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={5}
                  value={formData.remark_text}
                  onChange={(e) => {
                    setFormData({ ...formData, remark_text: e.target.value });
                    if (formErrors.remark_text) setFormErrors({ ...formErrors, remark_text: null });
                  }}
                  required
                ></textarea>
                {formErrors.remark_text && (
                  <div className="text-danger small mt-1">{formErrors.remark_text}</div>
                )}
              </div>
            </div>

            <div className="text-end mt-3">
              <button
                type="submit"
                className="btn btn-primary me-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Update'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal show={showDeleteModal} onHide={() => !isSubmitting && setShowDeleteModal(false)} backdrop="static" centered>
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title className="h5 fw-bold mb-0 text-danger">Delete Remark</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">Are you sure you want to delete this remark?</p>
          {selectedRemark?.remark_title && (
            <p className="fw-semibold text-dark mb-0">"{selectedRemark.remark_title}"</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .staff-remarks-card .card-header,
        .staff-remarks-card .card-header .card-title,
        .staff-remarks-card .card-title {
          color: #012970 !important;
          font-weight: 600 !important;
          font-size: 1.15rem !important;
        }
      `}</style>
    </div>
  );
};

export default StaffRemarks;
