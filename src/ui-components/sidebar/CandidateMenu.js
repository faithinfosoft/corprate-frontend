import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../utilities/useAuth'; // Import the default export
const CandidateMenu = () => {
  const auth = useAuth();

  const candidate_id = auth.user.user_id;
  const username = auth.user.username;
  //console.log(candidate_id);
  return (
    <>


      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>

      <ul className="sidebar-nav" id="sidebar-nav">



        <li className="nav-item">
          <Link to="/" className="nav-link"> <i className="bi bi-house-fill"></i><span>Home</span></Link>

        </li>

        <li className="nav-item">
          <Link to={`/CandidateProfile/${candidate_id}`} className="nav-link"> <i className="bi bi-person-lines-fill"></i><span> Profile</span></Link>

        </li>

        <li className="nav-item">
          <Link to={`/Candidate_co_curricular/${candidate_id}`} className="nav-link"> <i className="bi bi-trophy-fill"></i><span> Co - curricular Activities</span></Link>

        </li>

        <li className="nav-item">
          <Link to={`/Religious_activities/${candidate_id}`} className="nav-link"> <i className="bi bi-star-fill"></i><span>Religious Activities</span></Link>

        </li>
        <li className="nav-item">
          <Link to='/CandidateexamGuidelines' className="nav-link"> <i className="bi bi-file-earmark-text-fill"></i><span> Exam Guidelines</span></Link>

        </li>
        <li className="nav-item">
          <Link to='/candidatemarkguidelines' className="nav-link"> <i className="bi bi-list-check"></i><span> Mark Guidelines</span></Link>

        </li>

        <li className="nav-item">
          <Link to='/CandidateExamNotifications' className="nav-link"> <i className="bi bi-bell-fill"></i><span> Exam Notifications</span></Link>

        </li>











      </ul>
    </>
  )
}

export default CandidateMenu