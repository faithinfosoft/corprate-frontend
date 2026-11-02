
import React, { createContext, useContext, useEffect, useState } from "react";
import { useParams, Outlet, Link,useNavigate } from "react-router-dom";
import Breadcum from "../Breadcum";
const Vacancy = () => {

  const [breadcum, setBreadcum] = useState([
       { Title: "Home", Link: "/" },
        { Title: "Vacancy Details", Link: "" },
      ]);
 const navigate = useNavigate();

  return (


    <div>
    <Breadcum items={breadcum} title={`Vacancy Details`} />
    <ul class="nav nav-tabs nav-tabs-bordered" role="tablist">
<li class="nav-item" role="presentation">
<button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="false" role="tab" tabindex="-1"  onClick={() =>  navigate('/vacancy/vacancy-details')}> Vacancy Details</button>
</li>
<li class="nav-item" role="presentation">
<button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="false" role="tab" tabindex="-1"  onClick={() =>  navigate('/vacancy/designation-vacancy')}> Vacancy By Designation</button>
</li>
<li class="nav-item" role="presentation">
<button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="false" role="tab" tabindex="-1"  onClick={() =>  navigate('/vacancy/nature-vacancy')}> Nature of Vacancy</button>
</li>
<li class="nav-item" role="presentation">
  <button class="nav-link" data-bs-toggle="tab" data-bs-target="#profile-edit" aria-selected="false" role="tab" tabindex="-1"  onClick={() =>  navigate('/vacancy/create-vacancy')}> Create Vacancy</button>
</li>
</ul>

      <Outlet /> {/* Renders the current nested route */}
    </div>

  );
};

export default Vacancy;
