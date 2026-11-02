
import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams, Outlet, Link,useNavigate } from "react-router-dom";
import Breadcum from "../Breadcum";
const StaffResignationDetails = () => {

  const [breadcum, setBreadcum] = useState([
       { Title: "Home", Link: "/" },
        { Title: "Resignation Details", Link: "" },
      ]);

 const navigate = useNavigate();
  return (

 <div>
    <Breadcum items={breadcum} title={`Resignation Details`} />
    <ul class="nav nav-tabs nav-tabs-bordered" role="tablist">
<li class="nav-item" role="presentation">
<button class="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="true" role="tab"   onClick={() =>  navigate('/staff-resignation-details/resignation-details')}> Resignation Details</button>
</li>

<li class="nav-item" role="presentation">
  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="false" role="tab" tabindex="-1"  onClick={() =>  navigate('/staff-resignation-details/create-resignation')}> Create a Resignation</button>
</li>
</ul>

    {/* <nav className="navbar navbar-expand-lg">
      <div className="container">
        <ul className="navbar-nav d-flex flex-row gap-3 ">
        <li className="nav-item ">
            <Link className="btn btn-light d-flex align-items-center gap-2 bg-info text-light" to="/staff-resignation-details/resignation-details" >
            <i className="bi bi-list-ul"></i>
            <span className="fw-bold">Resignation Details</span></Link>
          </li>
          <li className="nav-item">
            <Link className="btn btn-light d-flex align-items-center gap-2 bg-info text-light" to="/staff-resignation-details/create-resignation">
            <i className="bi bi-plus-circle"></i>
            <span className="fw-bold">Create Resignation</span></Link>
          </li>
                  
        </ul>
      </div>
    </nav> */}
      <Outlet /> {/* Renders the current nested route */}
    </div>

  );
};

export default StaffResignationDetails;
