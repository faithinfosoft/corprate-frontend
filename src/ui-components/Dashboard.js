import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import logo_image from "../assets/ui-master/img/banner.jpg";

import AdminDashboard from './dashboard/AdminDashboard';
import SchoolAdminDashboard from './dashboard/SchoolAdminDashboard';
import StaffDashboard from './dashboard/StaffDashboard';
import SchoolManagerDashboard from './dashboard/SchoolManagerDashboard';
import CandidateDashboard from './dashboard/CandidateDashboard';


import axios from 'axios';
import globalVariables from "../Global.js";
import moment from 'moment'; 
import useAuth from '../utilities/useAuth'; // Import the default export

const Dashboard = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.setItem('lastVisitedPage', '/');
  }, []);

  



  return (
 <>
  <div className="row">

         {auth.user.user_type === 'corporate_admin' && <AdminDashboard />}

         {(auth.user.user_type === 'school_admin' || auth.user.user_type === 'school_office') && <SchoolAdminDashboard />}

         {auth.user.user_type === 'school_manager' && <SchoolManagerDashboard />}

         {auth.user.user_type === 'staff' && <StaffDashboard />}
         {auth.user.user_type === 'candidate' && <CandidateDashboard />}
      
      </div>

  

  


  </>
  );
}


export default Dashboard