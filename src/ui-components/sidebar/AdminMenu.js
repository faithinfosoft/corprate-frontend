import React from 'react';
import { Link } from 'react-router-dom';

const ParishregisteryMenu = () => {
  return (
    <>


  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>

<ul className="sidebar-nav" id="sidebar-nav">
     

      
<li className="nav-item">
      <Link to="/"  className="nav-link"> <i className="bi bi-house-fill"></i><span>Dashboard</span></Link>
     
    </li>


    <li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#gen-settings-nav1" data-bs-toggle="collapse" href="#">
     <i class="bi bi-grid"></i><span>General Settings</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="gen-settings-nav1" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      <li className="nav-item">
      <Link to="forane/"  className="nav-link"> <i className="bi bi-bank2"></i><span>Forane</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="parish/"  className="nav-link"> <i className="bi bi-bank"></i><span>Parish</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="congregation/"  className="nav-link"> <i className="bi bi-bank"></i><span>Congregation</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="convent/"  className="nav-link"> <i className="bi bi-building"></i><span>Convent</span></Link>
    </li>

    <li className="nav-item">
    
    <Link to="zone/"  className="nav-link"> <i className="bi bi-bank2"></i><span>Zone</span></Link>
    </li>
    <li className="nav-item">
      <Link to="/AcademicYear"  className="nav-link "> <i className="bi bi-calendar"></i><span>Academic Year</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="/designations"  className="nav-link "> <i className="bi bi-grid"></i><span>Designations</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="subject/"  className="nav-link"> <i className="bi bi-building"></i><span>Subjects</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="co-curricular/"  className="nav-link"> <i className="bi bi-building"></i><span>Co-Curricular Activity</span></Link>
     
    </li>

    <li className="nav-item">
    <Link to="club/"  className="nav-link"> <i className="bi bi-building"></i><span>Clubs</span></Link>
     
    </li> 
    <li className="nav-item">
    <Link to="office-users/"  className="nav-link"> <i className="bi bi-building"></i><span>Office Users</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="edu-rdd/"  className="nav-link"> <i className="bi bi-building"></i><span>RDD</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="edu-dde/"  className="nav-link"> <i className="bi bi-building"></i><span>DDE</span></Link>
     
    </li>

  
    <li className="nav-item">
    <Link to="treasury/"  className="nav-link"> <i className="bi bi-building"></i><span>Treasury</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="DEO-List/"  className="nav-link"> <i className="bi bi-building"></i><span>DEO Details</span></Link>
     
    </li>
    
    <li className="nav-item">
    <Link to="AEO-List/"  className="nav-link"> <i className="bi bi-building"></i><span>AEO Details</span></Link>
     
    </li>
    <li className="nav-item">
      <Link to="Data_Settings/"  className="nav-link"> <i className="bi bi-building"></i><span>Exam Guidelines</span></Link>
     
    </li>
 
    </ul></li>

   
    <li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#school-settings-nav1" data-bs-toggle="collapse" href="#">
     <i class="bi bi-browser-edge"></i><span>School Information</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="school-settings-nav1" className="nav-content collapse " data-bs-parent="#sidebar-nav">
   
    <li className="nav-item">
    <Link to="school/"  className="nav-link"> <i className="bi bi-building"></i><span>School</span></Link>
    </li>
    <li className="nav-item">
    <Link to="school-managers-list/"  className="nav-link"> <i className="bi bi-building"></i><span> School Managers List</span></Link>
    </li>
 
    
    
    </ul></li>


    <li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#staff-settings-nav1" data-bs-toggle="collapse" href="#">
     <i class="bi bi-people-fill"></i><span>Staff Information</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="staff-settings-nav1" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      

      <li className="nav-item">
    <Link to="staff-list/"  className="nav-link"> <i className="bi bi-grid"></i><span> Staff Members List </span></Link>
    </li>
    <li className="nav-item">
    <Link to="pendingstaffservice/"  className="nav-link"> <i className="bi bi-grid"></i><span> Service Records</span></Link>
    </li>
  {/* <li className="nav-item">
       <Link to="leave-applications"  className="nav-link"> <i className="bi bi-grid"></i><span>Leave Applications</span></Link>
      
     </li> */}

     <li className="nav-item">
      <Link to="staff-resignation-details/"  className="nav-link"> <i className="bi bi-grid"></i><span>Resignation</span></Link>
     
    </li>
    <li className="nav-item">
      <Link to="staff-death-details/"  className="nav-link"> <i className="bi bi-grid"></i><span>Death</span></Link>
     
    </li>

    
    </ul></li>
    <li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#eval-settings-nav1" data-bs-toggle="collapse" href="#">
     <i class="bi bi-newspaper"></i><span>School Evaluation Settings</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="eval-settings-nav1" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      <li className="nav-item">
      <Link to="schoolevaluation/"  className="nav-link"> <i className="bi bi-building"></i><span>Evaluation Category</span></Link>
     
    </li>
    <li className="nav-item">
      <Link to="evaluation-list/"  className="nav-link"> <i className="bi bi-building"></i><span>School Evaluation List</span></Link>
     
    </li>
    
    </ul></li>

    <li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#noti-settings-nav1" data-bs-toggle="collapse" href="#">
     <i class="bi bi-chat-quote-fill"></i><span>Notification Settings</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="noti-settings-nav1" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      <li className="nav-item">
      <Link to="notification/"  className="nav-link"> <i className="bi bi-building"></i><span>General Notification</span></Link>
     
    </li>
    <li className="nav-item">
    <Link to="examapplication/"  className="nav-link"> <i className="bi bi-building"></i><span>Exam Application</span></Link>
     
    </li>
    {/* <li className="nav-item">
    <Link to="school-evaluation-notification/"  className="nav-link"> <i className="bi bi-building"></i><span>School Evaluation</span></Link>
     
    </li> */}

    <li className="nav-item">
    <Link to="transfernotification/"  className="nav-link"> <i className="bi bi-building"></i><span>Transfer</span></Link>
     
    </li>
    
    </ul></li>
 

    <li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#icons-nav" data-bs-toggle="collapse" href="#">
     <i class="bi bi-list-task"></i><span>Teacher Selection</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="icons-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
      <li className="nav-item">
      <Link to="/mark-category"  className="nav-link"> <i className="bi bi-grid"></i><span>Marks Category</span></Link>
     
    </li>
      <li className="nav-item">
      <Link to="exam-application/"  className="nav-link"> <i className="bi bi-grid"></i><span>Exam Applications</span></Link>
     
    </li>
    {/* <li className="nav-item">
      <Link to="sample-rank-list/"  className="nav-link"> <i className="bi bi-grid"></i><span>Rank List</span></Link>
     
    </li> */}
  

   { /*<li className="nav-item">
      <Link to="candidate-application-details/"  className="nav-link"> <i className="bi bi-building"></i><span> Candidate Application Details</span></Link>
     
    </li>
    <li className="nav-item">
      <Link to="certificate-verification-schedule/"  className="nav-link"> <i className="bi bi-building"></i><span> Certificate Verification Schedule</span></Link>
     
    </li> */}
    
    </ul></li>


    { /* <li className="nav-item">
      <Link to="rank-list"  className="nav-link"> <i className="bi bi-card-checklist"></i><span>Rank List</span></Link>
     
    </li>*/}



    <li className="nav-item">
  <a className="nav-link collapsed" data-bs-target="#transfer-settings-nav1" data-bs-toggle="collapse" href="#">
    <i className="bi bi-gear"></i><span>Transfer Settings</span><i className="bi bi-chevron-down ms-auto"></i>
  </a>
  <ul id="transfer-settings-nav1" className="nav-content collapse" data-bs-parent="#sidebar-nav">
    <li className="nav-item">
      <Link to="/transferrequest" className="nav-link">
        <i className="bi bi-grid"></i>
        <span>Staff Request</span>
      </Link>
    </li>
    <li className="nav-item">
      <Link to="/transferlist" className="nav-link">
        <i className="bi bi-grid"></i>
        <span>Transfer List</span>
      </Link>

    </li>
  </ul>
</li>


<li className="nav-item">
  <a className="nav-link collapsed" data-bs-target="#leave-nav1" data-bs-toggle="collapse" href="#">
    <i className="bi bi-gear"></i><span>Leave </span><i className="bi bi-chevron-down ms-auto"></i>
  </a>
  <ul id="leave-nav1" className="nav-content collapse" data-bs-parent="#sidebar-nav">
    {/* <li className="nav-item">
      <Link to="/leave-applications" className="nav-link">
        <i className="bi bi-grid"></i>
        <span>Staff Request</span>
      </Link>
    </li> */}
    <li className="nav-item">
      <Link to="/staff-leave-list" className="nav-link">
        <i className="bi bi-grid"></i>
        <span>Leave Details</span>
      </Link>

    </li>
  </ul>
</li>


<li className="nav-item">
      <Link to="CandidateManagement/"  className="nav-link"> <i className="bi bi-person-check-fill"></i><span>Candidate Management</span></Link>
     
    </li>

    <li className="nav-item">
      <Link to="/approved-candidates-list" className="nav-link"> <i className="bi bi-person-check"></i><span>Approved Candidates</span></Link>
    </li>

    {/* <li className="nav-item">
      <Link to="VacancySettings/"  className="nav-link"> <i className="bi bi-grid-3x3-gap-fill"></i><span>Vacancy Settings</span></Link>
     
    </li> */}
   
    

<li className="nav-item">
      <a className="nav-link collapsed" data-bs-target="#exam-nav" data-bs-toggle="collapse" href="#">
     <i class="bi bi-printer"></i><span>Reports</span><i className="bi bi-chevron-down ms-auto"></i>
      </a>
      <ul id="exam-nav" className="nav-content collapse " data-bs-parent="#sidebar-nav">
     
        <li className="nav-item">
      <Link to="school-report/"  className="nav-link"> <i className="bi bi-building"></i><span>School Details</span></Link>
     
    </li>
   
      <li className="nav-item">
      <Link to="staff-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Staff Details</span></Link>
     
    </li>
    
    <li className="nav-item">
      
      <Link to="retirement-list"  className="nav-link"> <i className="bi bi-building"></i><span>Retirement List</span></Link>
     
    </li>

      {/* <li className="nav-item">
      
      <Link to="retired-staff-report"  className="nav-link"> <i className="bi bi-building"></i><span>Retired Staff List</span></Link>
     
    </li> */}
   
    {/* <li className="nav-item">
      <Link to="vaccancy-report/"  className="nav-link"> <i className="bi bi-building"></i><span> Vacancies</span></Link>
     
    </li> */}

    <li className="nav-item">
      <Link to="service-records-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Service Records</span></Link>
     
    </li>
    {/* <li className="nav-item">
      <Link to="transfers-report"  className="nav-link"> <i className="bi bi-building"></i><span>Transfers</span></Link>
     
    </li>*/}
  
   <li className="nav-item">
      <Link to="rank-list-report"  className="nav-link"> <i className="bi bi-building"></i><span>Rank List</span></Link>
     
    </li>

    <li className="nav-item">
      <Link to="staff-experience-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Staff Service Summary</span></Link>
     
    </li> 
    <li className="nav-item">
      <Link to="designation-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Designation Report</span></Link>
     
    </li> 
    

      {/* 
    
    <li className="nav-item">
      <Link to="candidate-report/"  className="nav-link"> <i className="bi bi-building"></i><span>Candidates</span></Link>
     
    </li> */}
    
    </ul></li>

    

   



 
     
</ul>
</>
  )
}

export default ParishregisteryMenu