import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Badge, Dropdown, Spinner } from "react-bootstrap";
import SwipeToDelete from "react-swipe-to-delete-component";
import "react-swipe-to-delete-component/dist/swipe-to-delete.css";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    const fetchNotifications = async () => {
        try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched notifications:", response.data);
        if (isMounted.current) setNotifications(response.data);
        } catch (err) {
        console.error("Error fetching notifications", err);
        } finally {
        if (isMounted.current) setLoading(false);
        }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => {
        isMounted.current = false;
        clearInterval(interval);
    };
    }, []);


  // Mark as read (tick)
  const markAsRead = async (id, e) => {
    e.stopPropagation(); // Prevent dropdown from closing
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === id ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      // Optionally handle error
    }
  };

  // Delete notification (swipe)
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.filter((notif) => notif.notificationId !== id)
      );
    } catch (err) {
      // Optionally handle error
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Dropdown align="end" className="ms-3">
      <Dropdown.Toggle variant="light" id="dropdown-notifications">
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="ms-1">
            {unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{ minWidth: 350, maxHeight: 400, overflowY: "auto" }}>
        <Dropdown.Header>Notifications</Dropdown.Header>
        {loading && (
          <Dropdown.Item disabled>
            <Spinner animation="border" size="sm" /> Loading...
          </Dropdown.Item>
        )}
        {!loading && notifications.length === 0 && (
          <Dropdown.Item disabled>No notifications.</Dropdown.Item>
        )}
        {!loading &&
          notifications.map((notif) => (
            <SwipeToDelete
              key={notif.notificationId}
              onDelete={() => deleteNotification(notif.notificationId)}
              height={70}
              transitionDuration={250}
              deleteWidth={80}
              deleteColor="rgba(252, 58, 48, 1.00)"
              deleteText="Delete"
              rtl={false}
            >
              <div
                className={`d-flex justify-content-between align-items-center px-3 py-2 ${
                  !notif.isRead ? "fw-bold text-primary" : ""
                }`}
                style={{
                  background: "#fff",
                  borderBottom: "1px solid #eee",
                  minHeight: 60,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="text-truncate">{notif.title}</div>
                  <small className="text-muted text-truncate d-block">{notif.message}</small>
                </div>
                <span
                  style={{
                    cursor: notif.isRead ? "default" : "pointer",
                    marginLeft: 10,
                  }}
                  title={notif.isRead ? "Read" : "Mark as Read"}
                  onClick={
                    notif.isRead
                      ? (e) => e.stopPropagation()
                      : (e) => markAsRead(notif.notificationId, e)
                  }
                >
                  <i
                    className={`bi bi-check2-circle ${
                      notif.isRead ? "text-success opacity-50" : "text-secondary"
                    }`}
                    style={{ fontSize: "1.3rem" }}
                  ></i>
                </span>
              </div>
            </SwipeToDelete>
          ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificationDropdown;
