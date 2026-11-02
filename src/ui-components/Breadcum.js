import React from 'react';
import { Link } from 'react-router-dom';

const Breadcum = ({ items, title, children }) => {
  return (
    <>

<div class="pagetitle">
<h3 >{title}</h3>
      <nav>
      <ol className="breadcrumb">
                  {items.map((item, index) => (
                    <li className="breadcrumb-item" key={index}>
                      {item.Link ? (
                        <Link to={item.Link}>{item.Title}</Link>
                      ) : (
                        <span>{item.Title}</span>
                      )}
                    </li>
                  ))}
                </ol>
      </nav>
      {children}
    </div>

  
       
     
    </>
  );
};

export default Breadcum;