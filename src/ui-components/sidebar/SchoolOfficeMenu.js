import React, { useState } from 'react';
import { Link ,useLocation } from 'react-router-dom';
import useAuth from '../../utilities/useAuth';
const SchoolAdminMenu = () => {
  const location = useLocation();
  const auth = useAuth();
  const school_id = auth.user.user_id;
  const [reloadKey, setReloadKey] = useState(0);  // State to track reloads

  const handleLinkClick = () => {
    setReloadKey(prevKey => prevKey + 1);  // Increment key to force re-render
  };
  return (
    <>


  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>

<ul className="sidebar-nav" id="sidebar-nav">
     

      
       <li className="nav-item">
      <Link to="/"  className="nav-link"> <i className="bi bi-house-fill"></i><span>Dashboard</span></Link>
     
    </li>

    {/* <li className="nav-item">
      <Link to="schoolprofile"  className="nav-link"> <i className="bi bi-building"></i><span>School Profile</span></Link>
     
    </li> */}

    <li className="nav-item">
  <a className="nav-link collapsed" data-bs-target="#school-settings-nav1" data-bs-toggle="collapse" href="#">
    <i className="bi bi-gear"></i><span>School Settings</span><i className="bi bi-chevron-down ms-auto"></i>
  </a>
  <ul id="school-settings-nav1" className="nav-content collapse" data-bs-parent="#sidebar-nav">
   
  <li className="nav-item">
  <Link to={`/schooldetails/${school_id}`} className="nav-link">
  <i className="bi bi-grid"></i>
  <span>School Profile</span>
</Link>



    </li>
   
    {/* <li className="nav-item">
      <Link to="/schoolclass" className="nav-link">
        <i className="bi bi-grid"></i>
        <span>Class</span>
      </Link> </li>

    <li className="nav-item">
      <Link to="/classstrength" className="nav-link">
        <i className="bi bi-grid"></i>
        <span>Class Strength</span>
      </Link>
    </li>  */}

      {/* <li className="nav-item">
      <Link to="/schooladminstaff" className="nav-link">
        <i className="bi bi-grid"></i>
        <span>Staff</span>
      </Link>
    </li>   */}

   
   
  </ul>
</li>
    <li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#gen-settings-nav1" data-bs-toggle="collapse" href="#">
     <i class="bi bi-grid"></i><span>General Settings</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="gen-settings-nav1" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      
      {/* <li className="nav-item">
      <Link to="office-users/"  className="nav-link"> <i className="bi bi-building"></i><span>Office Users</span></Link>
     
    </li> */}
 
    {/* <li className="nav-item">
      <Link to="school-activity"  className="nav-link"> <i className="bi bi-building"></i><span>School Activity</span></Link>
     
    </li>  */}
    {/* <li className="nav-item">
      <Link to="school-magazine"  className="nav-link"> <i className="bi bi-building"></i><span>School Magazines</span></Link>
     
    </li> */}
    <li className="nav-item">
      <Link to="/news"  className="nav-link"> <i className="bi bi-newspaper"></i><span>News</span></Link>
     
    </li>
    </ul></li>

    {/* <li className="nav-item">
        <a className="nav-link collapsed" data-bs-target="#staff-nav" data-bs-toggle="collapse" href="#">
       <i class="bi bi-list-task"></i><span>Staff</span><i className="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="staff-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
        
        <li className="nav-item">
      <Link to="/schooladminstaff/permanent"  className="nav-link" key={location.key} onClick={handleLinkClick}> <i className="bi bi-building"></i><span>Permanent Staff</span></Link>
     
    </li>
    <li className="nav-item">
      <Link to="/schooladminstaff/temporary"  className="nav-link" key={location.key} onClick={handleLinkClick}> <i className="bi bi-building"></i><span>Temporary Staff</span></Link>
     
    </li>
      </ul></li> */}



      {/* <li className="nav-item">
     <Link to="school-evaluation-report/"  className="nav-link"> <i className="bi bi-card-checklist"></i><span>School Evaluation Report</span></Link>
     
    </li> */}
{/* 
<li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#eval-settings-nav1" data-bs-toggle="collapse" href="#">
     <i class="bi bi-browser-edge"></i><span>School Evaluation Settings</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="eval-settings-nav1" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      
    <li className="nav-item">
      <Link to="view-evaluation-notifications/"  className="nav-link"> <i className="bi bi-building"></i><span>Evaluation Notifications</span></Link>
     
    </li>
    
    </ul></li> */}
    


   <li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#noti-settings-nav1" data-bs-toggle="collapse" href="#">
     <i class="bi bi-chat-quote-fill"></i><span>Notification Settings</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="noti-settings-nav1" className="nav-content collapse " data-bs-parent="#sidebar-nav">
     
      <li className="nav-item">
      <Link to="schoolnotification"  className="nav-link"> <i className="bi bi-building"></i><span>General Notification</span></Link>
     
    </li>
    <li className="nav-item">
      <Link to="schoolviewnotification"  className="nav-link"> <i className="bi bi-building"></i><span>Admin Notification</span></Link>
     
    </li>
    </ul></li>


    {/* <li className="nav-item">
        <a className="nav-link collapsed" data-bs-target="#icons-nav" data-bs-toggle="collapse" href="#">
       <i class="bi bi-list-task"></i><span>Staff Requests</span><i className="bi bi-chevron-down ms-auto"></i>
        </a>
        <ul id="icons-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
        
        <li className="nav-item">
      <Link to="leave-applications"  className="nav-link"> <i className="bi bi-building"></i><span>Pending Leave Applications</span></Link>
     
    </li>
    <li className="nav-item">
      <Link to="approved-leave-applications"  className="nav-link"> <i className="bi bi-building"></i><span>Approved Leave Applications</span></Link>
     
    </li>
    <li className="nav-item">
      <Link to="pendingstaffservice"  className="nav-link"> <i className="bi bi-building"></i><span>Pending Staff Service Details</span></Link>
     
    </li>
      </ul></li> */}

  

    {/* <li className="nav-item">
  <a className="nav-link collapsed" data-bs-target="#school-settings-nav2" data-bs-toggle="collapse" href="#">
    <i className="bi bi-gear"></i><span>Transfer Settings</span><i className="bi bi-chevron-down ms-auto"></i>
  </a>
  <ul id="school-settings-nav2" className="nav-content collapse" data-bs-parent="#sidebar-nav">
    <li className="nav-item">
      <Link to="/transferrequest" className="nav-link">
        <i className="bi bi-grid"></i>
        <span>Staff Request</span>
      </Link>

    </li>
  </ul>
</li> */}
<li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#exam-nav" data-bs-toggle="collapse" href="#">
     <i class="bi bi-printer"></i><span>Reports</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="exam-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">

        <li className="nav-item">
      <Link to="staff-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Staff Details</span></Link>
     
    </li> 
        <li className="nav-item">
          <Link to="student-strength-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Student Strength Details</span></Link>
         
        </li> 
  
      <li className="nav-item">
      
      <Link to="retirement-list"  className="nav-link"> <i className="bi bi-building"></i><span>Retirement List</span></Link>
     
    </li>
    <li className="nav-item">
          <Link to="staff-experience-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Staff Service Summary</span></Link>
         
        </li> 
{/*    
    <li className="nav-item">
      <Link to="vaccancy-report/"  className="nav-link"> <i className="bi bi-building"></i><span> Vacancies</span></Link>
     
    </li> */}

    <li className="nav-item">
      <Link to="service-records-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Service Records</span></Link>
      
    </li>
    {/* <li className="nav-item">
      <Link to="transfers-report"  className="nav-link"> <i className="bi bi-building"></i><span>Transfers</span></Link>
     
    </li> */}
  
    {/* <li className="nav-item">
      <Link to="promotions-report"  className="nav-link"> <i className="bi bi-building"></i><span>Promotions</span></Link>
     
    </li>
     */}
     {/* 
    <li className="nav-item">
      <Link to="candidate-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Candidates</span></Link>
     
    </li> */}
    
    </ul></li>








 
     
</ul>
</>
  )
}

export default SchoolAdminMenu