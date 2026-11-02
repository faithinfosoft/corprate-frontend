import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import NoDataFound from './NoDataFound';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import useAuth from '../utilities/useAuth';
import { convertDateFormat } from "../utilities/dateconverter";
const StaffServiceDetails = ({ staffId }) => {
  const auth = useAuth();
  const username = auth.user.username;
  const usertype = auth.user.user_type;
  const [serviceDetails, setServiceDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [schools, setSchools] = useState([]);
  const [createFormData, setCreateFormData] = useState({
    fk_staff_id: staffId,
    class_level: '',
    fk_designation_id: '',
    fk_school_id: '',
    start_date: '',
    end_date: '',
    service_type: '',
    remarks: '',
    service_status:'',
    status: 'pending',
    save_flag: false
  });
  
  // Separate state for modal form data
  const [editFormData, setEditFormData] = useState({
    fk_staff_id: staffId,
    class_level: '',
    fk_designation_id: '',
    fk_school_id: '',
    start_date: '',
    end_date: '',
    service_type: '',
    remarks: '',
    service_status:'',
    status: 'pending',
    save_flag: false
  });
  
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [classLevels, setClassLevels] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const validationMessages = {
    class_level: {
      required: 'Class level is required.',
      in_list: 'Invalid class level. Must be LP, UP, HS, or HSE.'
    },
    fk_designation_id: {
      required: 'Designation is required.'
    },
    fk_school_id: {
      required: 'School is required.'
    },
    start_date: {
      required: 'Start date is required.',
      valid_date: 'Invalid start date format.'
    },
   
    service_type: {
      required: 'Service type is required.',
      in_list: 'Invalid service type. Must be permanent, temporary, or contract.'
    },
    service_status: {
      required: 'Service Status is required.'
    },
   
    status: {
      required: 'Status is required.',
      in_list: 'Invalid status. Must be pending, active, or Completed.'
    },
    end_date: {
      required: 'End date is required.',
      valid_date: 'Invalid end date format.',
      later_than_start: 'End date must be later than the start date.'
    },
  };

  const canAddServiceDetails = ['corporate_admin', 'corporate_office', 'school_admin', 'school_office', 'staff'].includes(usertype);
  const canApprove = ['corporate_admin', 'school_admin'].includes(usertype);
  const canReject = usertype === 'corporate_admin';
  

  useEffect(() => {
    fetchLeaveDetails();
    
  }, [staffId]);

  const fetchLeaveDetails = async () => {
    try {
        const response = await axios.get(`${globalVariables.api_url}/leave/view/${staffId}`);
        if (response.data.status) {
            setServiceDetails(response.data.data);
        } else {
            // If the API returns status false but it's not a server error
            setServiceDetails([]);
        }
    } catch (error) {
        // Only show error toast for actual errors (network, server, etc.)
        if (error.response?.status !== 404) {  // Assuming 404 means no data
            console.error('Error fetching Leave Details:', error);
            print_toast("error", "Failed to fetch Leave Details");
        }
        setServiceDetails([]);
    }
};

 




  



  const resetCreateForm = () => {
    setCreateFormData({
      fk_staff_id: staffId,
      class_level: '',
      fk_designation_id: '',
      start_date: '',
      end_date: '',
      service_type: '',
      remarks: '',
      status: 'pending',
      save_flag: false
    });
    setCreateErrors({});
  };

  const resetEditForm = () => {
    setEditFormData({
      fk_staff_id: staffId,
      class_level: '',
      fk_designation_id: '',
      start_date: '',
      end_date: '',
      service_type: '',
      remarks: '',
      status: 'pending',
      save_flag: false
    });
    setEditingId(null);
    setEditErrors({});
  };

  return (
    <div className="row">
<div className="col-lg-12">
        <div className="card">
          <div className="card-header">
            <h5 className="card-title">Leave Details</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
            <table className="table table-bordered datatable" style={{ minWidth: '1000px' }}>
                <thead>
                <tr>
                      <th scope="col" className="text-center">Sl No.</th>
                      <th scope="col" className="text-center">Start Date</th>
                      <th scope="col" className="text-center">End Date</th>
                      <th scope="col" className="text-center">Days</th>
                      <th scope="col" className="text-center">Nature of Leave</th>
                      <th scope="col" className="text-center">Reason</th>
                      <th scope="col" className="text-center">Status</th>
                    
                    </tr>
                </thead>
                <tbody>
                {serviceDetails.length === 0 ? (
                                            <tr>
                                                <td colSpan={10}>
                                                <NoDataFound />
                                                </td>
                                            </tr>
                                        ) : (
                  serviceDetails.map((leave, index) => (
                       <tr key={leave.leave_id}>
                                              <td className="text-center">{index + 1}</td>
                                              <td className="text-center">
                                                {convertDateFormat(leave.start_date)}
                                              </td>
                                              <td className="text-center">
                                                {convertDateFormat(leave.end_date)}
                                              </td>
                                              <td className="text-center">{leave.no_of_days}</td>
                                              <td className="text-center">{leave.nature_of_leave}</td>
                                              <td className="text-center">{leave.reason_of_leave}</td>
                                              <td className="text-center">{leave.leave_status}</td>
                                             
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
  );
};

export default StaffServiceDetails;





