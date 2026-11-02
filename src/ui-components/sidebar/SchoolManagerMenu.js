import React, { useState } from 'react';
import { Link ,useLocation } from 'react-router-dom';
import useAuth from '../../utilities/useAuth';
const SchoolManagerMenu = () => {

  return (
    <>


  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>

<ul className="sidebar-nav" id="sidebar-nav">
     

      
       <li className="nav-item">
      <Link to="/"  className="nav-link"> <i className="bi bi-house-fill"></i><span>Dashboard</span></Link>
     
    </li>

     <li className="nav-item">
      <Link to="school-manager-profile"  className="nav-link"> <i className="bi bi-file-earmark-person"></i><span>Staff Profile</span></Link>
     
    </li> 



    <li className="nav-item">
        <a className="nav-link collapsed" data-bs-target="#icons-nav" data-bs-toggle="collapse" href="#">
       <i class="bi bi-list-task"></i><span>Satff Leave Requests</span><i className="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="icons-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
        
        <li className="nav-item">
      <Link to="leave-applications"  className="nav-link"> <i className="bi bi-building"></i><span>Pending Leave Requests</span></Link>
     
    </li>

    <li className="nav-item">
      <Link to="approved-leave-applications"  className="nav-link"> <i className="bi bi-building"></i><span>Approved Leave Requests</span></Link>
     
    </li>
  
      </ul></li>

      <li className="nav-item">
        <a className="nav-link collapsed" data-bs-target="#transfer-nav" data-bs-toggle="collapse" href="#">
       <i class="bi bi-menu-up"></i><span>Satff Transfer Requests</span><i className="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="transfer-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
        
        <li className="nav-item">
      <Link to="pending-transfer-applications"  className="nav-link"> <i className="bi bi-building"></i><span>Pending Transfer Requests</span></Link>
     
    </li>

    <li className="nav-item">
      <Link to="approved-transfer-applications"  className="nav-link"> <i className="bi bi-building"></i><span>Approved Transfer Requests</span></Link>
     
    </li>
  
      </ul></li>

  










 
     
</ul>
</>
  )
}

export default SchoolManagerMenu