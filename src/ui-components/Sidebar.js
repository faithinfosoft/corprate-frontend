import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo_image from '../assets/ui-master/img/logo.png';
import AdminMenu from './sidebar/AdminMenu';
import SchoolAdminMenu from './sidebar/SchoolAdminMenu';
import StaffMenu from './sidebar/StaffMenu';
import CandidateMenu from './sidebar/CandidateMenu';
import SchoolManagerMenu from './sidebar/SchoolManagerMenu';
import SchoolOfficeMenu from './sidebar/SchoolOfficeMenu';



import useAuth from '../utilities/useAuth'; // Import the default export
const Sidebar = () => {
  const auth = useAuth();
  const user_type = auth.user.user_type;

  useEffect(() => {
    const handleSidebarItemClick = () => {
      if (window.innerWidth <= 991) {
        document.body.classList.remove('toggle-sidebar');
        const transparentLayer = document.querySelector('.sidebar-transparent-layer');
        if (transparentLayer) {
          document.body.removeChild(transparentLayer);
        }
      }
    };

    const sidebarItems = document.querySelectorAll('.sidebar-nav .nav-link:not(.collapsed)');
sidebarItems.forEach(item => {
  item.addEventListener('click', handleSidebarItemClick);
});

    return () => {
      sidebarItems.forEach(item => {
        item.removeEventListener('click', handleSidebarItemClick);
      });
    };
  }, []);
  

  return (
    <aside id="sidebar" className="sidebar">
      <div className="sidebar_logo">
        <img src={logo_image} style={{ width: '180px', height: '180px' }} alt="Logo" />
        <h3 className="fs-5 text-white p-0 m-0 pl-2">
  {user_type === "school_admin" && auth.user.login_user_name.includes(",") ? (
    <>
      {auth.user.login_user_name.split(",")[0]}
      <br />
      <h3 class="fs-6 text-white p-0mm-0 pl-2">{auth.user.login_user_name.split(",")[1]}</h3>
    </>
  ) : (
    
    auth.user.login_user_name
  )}
</h3>
     
      </div>
      <ul className="sidebar-nav" id="sidebar-nav">
        
        {(auth.user.user_type === 'corporate_admin' || auth.user.user_type === 'corporate_office' || auth.user.user_type === 'certificate_verifier') && <AdminMenu />}

        {auth.user.user_type === 'school_admin' && <SchoolAdminMenu />}
        {auth.user.user_type === 'school_office' && <SchoolOfficeMenu />}
        {auth.user.user_type === 'staff' && <StaffMenu />}
        {auth.user.user_type === 'candidate' && <CandidateMenu />}
        {auth.user.user_type === 'school_manager' && <SchoolManagerMenu />}

      </ul>
    </aside>
  );
};

export default Sidebar;
