// src/components/NotificationDropdown.js
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Badge, Dropdown } from "react-bootstrap";

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
        if (isMounted.current) setNotifications(response.data);
      } catch (err) {
        // Handle error
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };
    fetchNotifications();
    // Optionally, poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

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
      <Dropdown.Menu style={{ minWidth: 300 }}>
        <Dropdown.Header>Notifications</Dropdown.Header>
        {loading && (
          <Dropdown.Item disabled>Loading...</Dropdown.Item>
        )}
        {!loading && notifications.length === 0 && (
          <Dropdown.Item disabled>No notifications</Dropdown.Item>
        )}
        {!loading &&
          notifications.map((notif) => (
            <Dropdown.Item
              key={notif.notificationId}
              className={!notif.isRead ? "fw-bold text-primary" : ""}
            >
              <div>{notif.title}</div>
              <small className="text-muted">{notif.message}</small>
            </Dropdown.Item>
          ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default NotificationDropdown;
