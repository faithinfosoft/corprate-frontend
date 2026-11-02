import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from "../../utilities/useAuth";
const ParishregisMenu = () => {

  const auth = useAuth();

  const staff_id = auth.user.user_id;

  return (
    <>


      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"></link>

      <ul className="sidebar-nav" id="sidebar-nav">



        <li className="nav-item">
          <Link to="/" className="nav-link"> <i className="bi bi-house-fill"></i><span>Dashboard</span></Link>

        </li>

        <li className="nav-item">
          <Link to={`/staffdetails/${staff_id}`} className="nav-link"> <i className="bi bi-file-earmark-person"></i><span>Staff Profile</span></Link>

        </li>

        <li className="nav-item">
          <Link to="/staff-leave-request" className="nav-link"> <i className="bi bi-arrow-right-circle"></i><span>Leave Request</span></Link>

        </li>

        {/* <li className="nav-item">
      <Link to="transfernotification/"  className="nav-link"> <i className="bi bi-chat-text"></i><span>Transfer Notification</span></Link>
     
    </li>

    <li className="nav-item">
      <Link to="staff-transfer-request/"  className="nav-link"> <i className="bi bi-arrow-left-right"></i><span>Transfer Details</span></Link>
     
    </li> */}
        {/* <li className="nav-item">
      <Link to="staff-promotion-requests/"  className="nav-link"> <i className="bi bi-arrow-left-right"></i><span>Promotion Request</span></Link>
     
    </li> */}






      </ul>
    </>
  )
}

export default ParishregisMenu