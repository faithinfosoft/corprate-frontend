
import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams, Outlet, Link,useNavigate } from "react-router-dom";
import Breadcum from "../Breadcum";
const StaffRetirementDetails = () => {

  const [breadcum, setBreadcum] = useState([
       { Title: "Home", Link: "/" },
        { Title: "Retirement Details", Link: "" },
      ]);
 const navigate = useNavigate();

  return (


    <div>
    <Breadcum items={breadcum} title={`Retirement Details`} />
   
    <ul class="nav nav-tabs nav-tabs-bordered" role="tablist">
        
<li class="nav-item" role="presentation">
<button class="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="true" role="tab" tabindex="-1"  onClick={() =>  navigate('/staff-retirement-details/retirement-details')}> Retirement Details</button>
</li>

<li class="nav-item" role="presentation">
  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="false" role="tab" tabindex="-1"  onClick={() =>  navigate('/staff-retirement-details/create-retirement')}> Create a Retirement</button>
</li>

</ul>

      <Outlet /> {/* Renders the current nested route */}
    </div>

  );
};

export default StaffRetirementDetails;
