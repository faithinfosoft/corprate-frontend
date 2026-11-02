import React, { Suspense, lazy, useEffect } from 'react';
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import '../App.css';
import "../assets/ui-master/css/style.css"
import "../assets/ui-master/vendor/bootstrap/css/bootstrap.min.css"
import "../assets/ui-master/vendor/bootstrap-icons/bootstrap-icons.css"
import "../assets/ui-master/vendor/boxicons/css/boxicons.min.css"
import "../assets/ui-master/vendor/bootstrap/js/bootstrap.bundle.min.js"
import "../assets/ui-master/vendor/bootstrap/css/bootstrap.min.css"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



// Pass the child props
function MasterLayout() {
  const location = useLocation();
  useEffect(() => {
    localStorage.setItem('from', location.pathname);
  }, [location.pathname]);

  // Easy selector helper function
  const select = (el, all = false) => {
    el = el.trim();
    if (all) {
      return [...document.querySelectorAll(el)];
    } else {
      return document.querySelector(el);
    }
  };

  // Easy event listener function
  const on = (type, el, listener, all = false) => {
    if (all) {
      select(el, all).forEach((e) => e.addEventListener(type, listener));
    } else {
      select(el, all).addEventListener(type, listener);
    }
  };

  // Easy on scroll event listener
  const onscroll = (el, listener) => {
    el.addEventListener('scroll', listener);
  };


  // Sidebar toggle and transparent layer
  useEffect(() => {
    const handleToggleSidebar = (e) => {
      const body = document.body;
      body.classList.toggle('toggle-sidebar');
      if (body.classList.contains('toggle-sidebar')) {
        const transparentLayer = document.createElement('div');
        transparentLayer.classList.add('sidebar-transparent-layer');
        transparentLayer.addEventListener('click', function () {
          body.classList.remove('toggle-sidebar');
          body.removeChild(transparentLayer);
        });
        body.appendChild(transparentLayer);
      } else {
        const transparentLayer = select('.sidebar-transparent-layer');
        if (transparentLayer) {
          body.removeChild(transparentLayer);
        }
      }
    };

    const handleClickOutsideSidebar = (e) => {
      const sidebar = select('.sidebar');
      const toggleBtn = select('.toggle-sidebar-btn');
      if (sidebar && toggleBtn && !sidebar.contains(e.target) && e.target !== toggleBtn) {
        const body = document.body;
        body.classList.remove('toggle-sidebar');
        const transparentLayer = select('.sidebar-transparent-layer');
        if (transparentLayer) {
          body.removeChild(transparentLayer);
        }
      }
    };

    const sidebarButton = select('.toggle-sidebar-btn');
    if (sidebarButton) {
      on('click', '.toggle-sidebar-btn', handleToggleSidebar);
    }

    document.addEventListener('click', handleClickOutsideSidebar);

    // Cleanup when component unmounts
    return () => {
      if (sidebarButton) {
        sidebarButton.removeEventListener('click', handleToggleSidebar);
      }
      document.removeEventListener('click', handleClickOutsideSidebar);
    };
  }, []);

  // Navbar links active state on scroll
  useEffect(() => {
    let navbarlinks = select('#navbar .scrollto', true);
    const handleNavbarLinksActive = () => {
      let position = window.scrollY + 200;
      navbarlinks.forEach((navbarlink) => {
        if (!navbarlink.hash) return;
        let section = select(navbarlink.hash);
        if (!section) return;
        if (
          position >= section.offsetTop &&
          position <= section.offsetTop + section.offsetHeight
        ) {
          navbarlink.classList.add('active');
        } else {
          navbarlink.classList.remove('active');
        }
      });
    };

    window.addEventListener('load', handleNavbarLinksActive);
    onscroll(document, handleNavbarLinksActive);

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('load', handleNavbarLinksActive);
      window.removeEventListener('scroll', handleNavbarLinksActive);
    };
  }, []);

  // Toggle .header-scrolled class to #header when page is scrolled
  useEffect(() => {
    const handleHeaderScrolled = () => {
      const header = select('#header');
      if (header) {
        if (window.scrollY > 100) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      }
    };

    window.addEventListener('load', handleHeaderScrolled);
    onscroll(document, handleHeaderScrolled);

    // Cleanup when component unmounts
    return () => {
      window.removeEventListener('load', handleHeaderScrolled);
      window.removeEventListener('scroll', handleHeaderScrolled);
    };
  }, []);

  // Initiate tooltips
  useEffect(() => {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    const tooltipList = tooltipTriggerList.map((tooltipTriggerEl) => {
      return new window.bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Cleanup when component unmounts
    return () => {
      tooltipList.forEach((tooltip) => tooltip.dispose());
    };
  }, []);


  return (
    <>



      <link href="../assets/ui-master/img/favicon.png" rel="icon" />
      <link href="../assets/ui-master/img/apple-touch-icon.png" rel="apple-touch-icon" />

      <link href="https://fonts.gstatic.com" rel="preconnect" />
      <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,300i,400,400i,600,600i,700,700i|Nunito:300,300i,400,400i,600,600i,700,700i|Poppins:300,300i,400,400i,500,500i,600,600i,700,700i" rel="stylesheet" />







      <h2>testing...................</h2>
      <Header />
      <Sidebar />




      <main id="main" className="main">



        <ToastContainer
          position="top-right"
          autoClose={10000}
          hideProgressBar={false}
          theme="colored"
        />
        <section className="section dashboard">

          <Suspense fallback={<div><i className="bi bi-arrow-clockwise animate-spin"></i> Loading...</div>}>
            <Outlet />
          </Suspense>
        </section>

      </main>

      <Footer />





    </>
  );
}

export default MasterLayout;