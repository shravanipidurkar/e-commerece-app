import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/admin-feedback.css'; // Make sure this CSS is updated as per below

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('customerToken');
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedbacks(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const filteredFeedbacks = feedbacks.filter(fb => {
    const search = searchTerm.toLowerCase();
    return (
      (filterRating === 'all' || fb.rating === parseInt(filterRating)) &&
      (
        fb.customer_name?.toLowerCase().includes(search) ||
        fb.product_name?.toLowerCase().includes(search) ||
        fb.review_description?.toLowerCase().includes(search)
      )
    );
  });

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const renderStars = (rating) => {
    const stars = Array.from({ length: 5 }, (_, i) => i < rating ? '★' : '☆');
    return <span className="feedback-page-stars">{stars.join(' ')}</span>;
  };

  if (loading) return <div className="feedback-page-loading">Loading feedback...</div>;
  if (error) return <div className="feedback-page-error">Error: {error}</div>;

  return (
    <div className="feedback-page-container">
      <h1 className="feedback-page-title">Feedback</h1>

      <div className="feedback-page-header">
        <div className="feedback-page-search-bar">
          <input
            type="text"
            placeholder="Search by customer, product or review"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="feedback-page-rating-filter">
          <select value={filterRating} onChange={e => setFilterRating(e.target.value)}>
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map(r => (
              <option key={r} value={r}>{r} Stars</option>
            ))}
          </select>
        </div>
      </div>

      <div className="feedback-page-table-container">
        <table className="feedback-page-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Rating</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.map(fb => (
              <tr key={fb.feedback_id}>
                <td>{formatDate(fb.review_date)}</td>
                <td>{fb.customer_name}</td>
                <td>{fb.product_name}</td>
                <td>
                  {renderStars(fb.rating)} 
                  <span className="feedback-page-rating-number">({fb.rating})</span>
                </td>
                <td>{fb.review_description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Feedback;
