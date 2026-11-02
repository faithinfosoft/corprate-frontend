import React, { createContext, useState, useContext } from "react";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState("physicalFacilities"); // Default to Physical Facilities

  return (
    <MenuContext.Provider value={{ activeMenu, setActiveMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
