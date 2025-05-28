import React, { useEffect, useState } from "react";
import axios from "axios";
import { ListGroup, Badge, Button, Spinner } from "react-bootstrap";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const res = await axios.get("/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
        });

        setNotifications(res.data);
        console.log("Fetched notification");
      } catch (err) {
        console.error("Error fetching notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
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
      console.error("Error marking notification as read", err);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <div className="container mt-4">
      <h4>
        Notifications{" "}
        <Badge bg="primary">
          {notifications.filter((n) => !n.isRead).length}
        </Badge>
      </h4>
      <ListGroup>
        {notifications.length === 0 && (
          <ListGroup.Item>No notifications.</ListGroup.Item>
        )}
        {notifications.map((notif) => (
          <ListGroup.Item
            key={notif.notificationId}
            className={
              notif.isRead
                ? ""
                : "list-group-item-warning fw-bold" 
            }
          >
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div>{notif.title}</div>
                <div className="small text-muted">{notif.message}</div>
                <div className="small text-muted">
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
              {!notif.isRead && (
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={() => markAsRead(notif.notificationId)}
                >
                  Mark as Read
                </Button>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Notification;
