import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NoDataFound from '../NoDataFound';
import globalVariables from '../../Global.js';
import print_toast from '../../utilities/Toaster.js';
import Breadcum from '../Breadcum';

const CandidateMarkGuidelines = () => {
    const [categoryList, setCategoryList] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [breadcum] = useState([
        { Title: 'Home', Link: '/' },
        { Title: 'Mark Guidelines', Link: '' },
    ]);

    // Utility function to strip HTML tags (if needed for display, though usually we render HTML safely or strip it)
    // The original component used this for saving. For display, we might want to render it if it has HTML, 
    // but looking at original render, it just displays {categoryItem.category_title} which might contain HTML or be plain text.
    // The original component saves stripped text. So the data in DB is likely plain text.

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/markcategory/get_all_categories`);
            if (response.data.status) {
                setCategoryList(response.data.data);
            }
            setLoaded(true);
        } catch (error) {
            console.error('Error fetching categories:', error.message);
            print_toast('error', 'Failed to fetch categories');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const renderCategoryTree = (categories, level = 0, isFirstLevel = true) => {
        // Render table headings only once
        if (isFirstLevel) {
            return (
                <>
                    <thead>
                        <tr>
                            <th>ഇനം</th>
                            <th style={{ textAlign: 'center' }}>പരമാവധി മാർക്ക് 1800</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((categoryItem) => (
                            <React.Fragment key={categoryItem.mark_category_id}>
                                {/* Render table rows */}
                                <tr>
                                    <td style={{ paddingLeft: `${level * 24}px` }}>
                                        <div className="d-flex align-items-center">
                                            <div
                                                className={`expand-collapse-indicator me-3 ${categoryItem.subcategories?.length > 0 ? 'expanded' : ''
                                                    }`}
                                            >
                                                {categoryItem.subcategories?.length > 0 ? (
                                                    <span className="text-primary">▼</span>
                                                ) : (
                                                    <span className="text-muted">•</span>
                                                )}
                                            </div>
                                            <span className={level === 0 ? 'fw-bold' : ''} dangerouslySetInnerHTML={{ __html: categoryItem.category_title }} />
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {categoryItem.total_mark > 0 && (
                                            <span className="category-mark">
                                                <b>{categoryItem.total_mark}</b>
                                            </span>
                                        )}
                                    </td>
                                </tr>

                                {/* Render nested subcategories if they exist */}
                                {categoryItem.subcategories?.length > 0 &&
                                    renderCategoryTree(categoryItem.subcategories, level + 1, false)}
                            </React.Fragment>
                        ))}
                    </tbody>
                </>
            );
        }

        // Render categories without headings (for nested categories)
        return categories.map((categoryItem) => (
            <React.Fragment key={categoryItem.mark_category_id}>
                {/* Render table rows */}
                <tr>
                    <td style={{ paddingLeft: `${level * 24}px` }}>
                        <div className="d-flex align-items-center">
                            <div
                                className={`expand-collapse-indicator me-3 ${categoryItem.subcategories?.length > 0 ? 'expanded' : ''
                                    }`}
                            >
                                {categoryItem.subcategories?.length > 0 ? (
                                    <span className="text-primary">▼</span>
                                ) : (
                                    <span className="text-muted">•</span>
                                )}
                            </div>
                            <span className={level === 0 ? 'fw-bold' : ''} dangerouslySetInnerHTML={{ __html: categoryItem.category_title }} />
                        </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                        {categoryItem.total_mark > 0 && (
                            <span className="category-mark">{categoryItem.total_mark}</span>
                        )}
                    </td>
                </tr>

                {/* Render nested subcategories if they exist */}
                {categoryItem.subcategories?.length > 0 &&
                    renderCategoryTree(categoryItem.subcategories, level + 1, false)}
            </React.Fragment>
        ));
    };

    return (
        <>
            <Breadcum items={breadcum} title="Mark Guidelines" />
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">
                                Mark Guidelines
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="category-tree">
                                <table className="table table-bordered malayalam">
                                    {loaded && categoryList.length === 0 ? (
                                        <NoDataFound />
                                    ) : (
                                        renderCategoryTree(categoryList)
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CandidateMarkGuidelines;
