import React, { useState } from 'react';
import Breadcum from './Breadcum.js';
import RDDForm from './RDDForm.js';

const EducationDepartment = () => {
  const [activeTab, setActiveTab] = useState('dept-rdd');
  const [breadcum] = useState([
    { Title: 'Home', Link: '/' },
    { Title: 'Education Department', Link: '' },
  ]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <Breadcum items={breadcum} title="Education Department" />
      <div className="row">
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header">
            <ul className="nav nav-tabs nav-tabs-bordered" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'dept-rdd' ? 'active' : ''}`}
                      onClick={() => handleTabChange('dept-rdd')}
                      role="tab"
                    >
                      RDD
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'dept-dde' ? 'active' : ''}`}
                      onClick={() => handleTabChange('dept-dde')}
                      role="tab"
                    >
                      DDE
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'dept-deo' ? 'active' : ''}`}
                      onClick={() => handleTabChange('dept-deo')}
                      role="tab"
                    >
                    DEO
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link ${activeTab === 'dept-aeo' ? 'active' : ''}`}
                      onClick={() => handleTabChange('dept-aeo')}
                      role="tab"
                    >
                    AEO
                    </button>
                  </li>
                </ul>
            </div>
            <div className="card-body">
          
                {/* Bordered Tabs */}
       

                <div className="tab-content pt-2">
                  {/* Overview Tab */}
                  {activeTab === 'dept-rdd' && (
                    <div className="tab-pane fade show active dept-rdd" id="dept-rdd" role="tabpanel">
                      <RDDForm/>
                    </div>
                  )}

                  {/* Edit Profile Tab */}
                  {activeTab === 'dept-dde' && (
                    <div className="tab-pane fade show active dept-dde pt-3" id="dept-dde" role="tabpanel">
                      <form>
                        <div className="row mb-3">
                          <label htmlFor="fullName" className="col-md-4 col-lg-3 col-form-label">
                            Full Name
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <input
                              name="fullName"
                              type="text"
                              className="form-control"
                              id="fullName"
                              defaultValue="Kevin Anderson"
                            />
                          </div>
                        </div>
                        <div className="row mb-3">
                          <label htmlFor="about" className="col-md-4 col-lg-3 col-form-label">
                            About
                          </label>
                          <div className="col-md-8 col-lg-9">
                            <textarea
                              name="about"
                              className="form-control"
                              id="about"
                              style={{ height: '100px' }}
                              defaultValue="Sunt est soluta temporibus accusantium neque nam maiores cumque temporibus."
                            ></textarea>
                          </div>
                        </div>
                        <div className="text-center">
                          <button type="submit" className="btn btn-primary">
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
     
    </>
  );
};

export default EducationDepartment;
