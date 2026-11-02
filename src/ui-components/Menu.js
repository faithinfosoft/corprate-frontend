import React, { useContext } from "react";
import { MenuContext } from "./MenuContext";

const Menu = () => {
  const { activeMenu, setActiveMenu } = useContext(MenuContext);

  return (
    <div className="menu">
      <button 
        className={activeMenu === "home" ? "active" : ""} 
        onClick={() => setActiveMenu("home")}
      >
        Home
      </button>
      <button 
        className={activeMenu === "evaluation" ? "active" : ""} 
        onClick={() => setActiveMenu("evaluation")}
      >
        Evaluation
      </button>
      <button 
        className={activeMenu === "results" ? "active" : ""} 
        onClick={() => setActiveMenu("results")}
      >
        Results
      </button>
    </div>
  );
};

export default Menu;
