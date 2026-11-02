import React, { useState, useEffect } from 'react';
import SecureLink from './SecureLink';
import axios from 'axios';
import DataTable from 'react-data-table-component';
import Modal from 'react-bootstrap/Modal';
import useAuth from '../utilities/useAuth.js';
import globalVariables from "../Global.js";
import print_toast from "../utilities/Toaster.js";
import Breadcum from './Breadcum.js';

const StaffViewNotification = () => {
    const [notifications, setNotifications] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const auth = useAuth();
    const username = auth.user.username;
  
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(`${globalVariables.api_url}/schoolnotification/view_staff_notifications`, {
                params: { email: username }
            });
            setNotifications(response.data.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            print_toast("error", "Failed to fetch notifications");
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };
    
    const filteredNotifications = notifications.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        new Date(notification.posted_date).toLocaleDateString().includes(searchTerm)
    );

    const handleMoreDetails = async (notification) => {
        setSelectedNotification(notification);
        setModalIsOpen(true);

        try {
            await axios.post(
                `${globalVariables.api_url}/schoolnotification/mark_as_read`,
                {
                    notificationId: notification.notification_id,
                    email: username
                }
            );
            fetchNotifications(); // Refresh the list to update the read status
        } catch (error) {
            console.error('Error marking notification as read:', error);
            print_toast("error", "Failed to mark notification as read");
        }
    };

    const columns = [
        { 
            name: <strong>Sl No.</strong>,
            selector: (row, index) => index + 1, 
            sortable: true
        },
        { 
            name: <strong>Title</strong>,
            selector: row => row.title,
            sortable: true
        },
        {
            name: <strong>Posted Date</strong>,
            selector: row => row.posted_date,
            sortable: true,
            format: row => new Date(row.posted_date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        },
        {
            name: <strong>Status</strong>,
            selector: row => row.read_flag === '1' ? 'Read' : 'Unread',
            sortable: true
        },
        {
            name: <strong>Actions</strong>,
            cell: row => (
                <button className="btn btn-primary" onClick={() => handleMoreDetails(row)}>
                    More Details
                </button>
            )
        }
    ];
  
    return (
        <>
            <Breadcum items={[{ Title: 'Home', Link: '/' }, { Title: 'Notifications', Link: '' }]} title="Notifications" />

            <div className="card">
                <div className="card-header">
                    <h5 className="card-title">Notifications</h5>
                </div>
                <div className="card-body">
                    <div className="d-flex justify-content-end mb-3">
                        <input
                            type="text"
                            className="form-control w-25"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                    <DataTable
                        columns={columns}
                        data={filteredNotifications}
                        pagination
                        responsive
                    />
                </div>
            </div>

            <Modal show={modalIsOpen} onHide={() => setModalIsOpen(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{selectedNotification?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Description:</strong></p>
                    <div dangerouslySetInnerHTML={{ __html: selectedNotification?.description }} />
                    <p><strong>Posted Date:</strong> {new Date(selectedNotification?.posted_date).toLocaleDateString()}</p>
                    <p><strong>Posted By:</strong> School Admin</p>
                    {selectedNotification?.file_path && (
                        <p>
                            <strong>Attachment:</strong>{' '}
                            <SecureLink 
                                href={selectedNotification.file_url} target='_blank'
                                download
                            >
                                Download File
                            </SecureLink>
                        </p>
                    )}
                </Modal.Body>
            </Modal>
        </>
    );
};

export default StaffViewNotification;