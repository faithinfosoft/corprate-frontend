
import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams, Outlet, Link,useNavigate } from "react-router-dom";
import Breadcum from "../Breadcum";
const StaffDeathDetails = () => {

  const [breadcum, setBreadcum] = useState([
       { Title: "Home", Link: "/" },
        { Title: "Obituary Details", Link: "" },
      ]);
 const navigate = useNavigate();

  return (


    <div>
    <Breadcum items={breadcum} title={`Obituary Details`} />
   
    <ul class="nav nav-tabs nav-tabs-bordered" role="tablist">
        
<li class="nav-item" role="presentation">
<button class="nav-link active" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="true" role="tab" tabindex="-1"  onClick={() =>  navigate('/staff-death-details/death-details')}> Obituary Details</button>
</li>

<li class="nav-item" role="presentation">
  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="false" role="tab" tabindex="-1"  onClick={() =>  navigate('/staff-death-details/create-death')}> Create a Obituary</button>
</li>

</ul>

      <Outlet /> {/* Renders the current nested route */}
    </div>

  );
};

export default StaffDeathDetails;
