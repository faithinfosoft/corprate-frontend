import React, { useState  } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import NoDataFound from './NoDataFound'; // Assuming NoDataFound component is defined in './NoDataFound'
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum'; // Corrected import path
import useAuth from '../utilities/useAuth'; // Import the default export
const ChangePassword = () => {


const navigate = useNavigate(); // Create a navigate function
const auth = useAuth();

const user_name = auth.user.username;

  const [breadcum, setBreadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Change Password', Link: '' },
  ]);
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
    username:user_name,
  });
  const [form_error, setFormError] = useState('');

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
  };


  const clearForm = () => {
    setFormData({
      old_password: '',
      new_password: '',
      confirm_password: '',
      username: user_name, // Ensure username remains in formData
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post(globalVariables.api_url + '/change_password/change_pass', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        if (response.data.status) {
          // navigate('/login');
          
        print_toast("success", response.data.message);
        clearForm();
         
        } else {
            const error = response.data.message;
            print_toast("error", response.data.message);
            setFormError(error); // Assuming error contains field-wise error messages
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        setFormData({
            ...formData,
            save_flag: false,
        });
    }
};

  return (
    <>
    <Breadcum items={breadcum} title="Change Password" /> {/* Pass breadcum as a prop */}
    {/* Rest of your component code */}
      <div className="row justify-content-center">
        <div className="col-md-6 ">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Change Password</h5>
            </div>
            <div className="card-body">
              <form role="form" onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <label htmlFor="old_password" className="col-sm-3 col-form-label">Old Password:<span className="text-danger">*</span></label>
                  <div className="col-sm-8">
                    <div className="input-group mt-2">
                      <input
                type="password"
                className="form-control"
                id="old_password"
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
              />


                    </div>
                    {form_error && form_error.old_password && (
    <div className="text-danger">{form_error.old_password}</div>
)}

                  </div>
                </div>
                <div className="row mb-3">
                <label htmlFor="new_password" className="col-sm-3 col-form-label">New Password:<span className="text-danger">*</span></label>
                  <div className="col-sm-8">
                    <div className="input-group mt-2">
                    <input
                type="password"
                className="form-control"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
              />



                    </div>
                    {form_error && form_error.new_password && (
    <div className="text-danger">{form_error.new_password}</div>
)}

                  </div>
                </div>
                <div className="row mb-3">
                  <label htmlFor="confirm_password" className="col-sm-3 col-form-label">Confirm Password:<span className="text-danger">*</span></label>
                  <div className="col-sm-8">
                    <div className="input-group mt-2">
                      <input
                        type="password"
                        className="form-control"
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleChange}
                      />


                    </div>
                    {form_error && form_error.confirm_password && (
    <div className="text-danger">{form_error.confirm_password}</div>
)}

                  </div>
                </div>
                <div className="card-footer">
                  <div className="row mb-3">
                    <div className="col-sm-12 text-right">
                      <button type="reset" className="btn btn-danger mr-2" style={{ float: 'right' }}>Cancel</button>
                      <button type="submit" className="btn btn-success" style={{ float: 'right', marginRight: '2px' }}>Update</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChangePassword;
