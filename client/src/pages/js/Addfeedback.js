import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/AddFeedback.css';

const Addfeedback = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('authToken');
  const custoken = localStorage.getItem('customerToken');
  const customerId = localStorage.getItem('customerId');

  useEffect(() => {
    console.log('Customer token:', custoken);
    if (!custoken) {
      setError('You must be logged in to add feedback.');
      return;
    }
const payload = JSON.parse(atob(custoken.split('.')[1]));
    console.log('Decoded token:', payload);
    axios
      .get(`${process.env.REACT_APP_SERVER_URL}/api/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
        setError('Failed to fetch product list.');
      });
  }, [custoken]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productId || !rating || !description) {
      setError('All fields are required.');
      return;
    }

    if (!custoken || !customerId) {
      setError('Authentication required. Please log in again.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const review_date = new Date().toISOString().slice(0, 10);

      await axios.post(
  `${process.env.REACT_APP_SERVER_URL}/api/feedback/add`,
  {
    review_date,
    rating,
    product_id: productId,
    review_description: description,
  },
  {
    headers: {
      Authorization: `Bearer ${custoken}`, // ✅ correct token
    },
  }
);



      setSuccess('✅ Thank you for your feedback!');
      setRating(0);
      setHoverRating(0);
      setDescription('');
      setProductId('');

      setTimeout(() => {
        setSuccess('');
        navigate(`/store/${storeId}/success`);
      }, 2000);
    } catch (err) {
      console.error('Submission error:', err);
      setError('❌ Failed to submit feedback. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-container">
      <h2>📝 Add Feedback</h2>

      <form onSubmit={handleSubmit} className="feedback-form">
        <label>Product:</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        >
          <option value="">-- Select Product --</option>
          {products.map((prod) => (
            <option key={prod.product_id} value={prod.product_id}>
              {prod.product_name}
            </option>
          ))}
        </select>

        <label>Rating:</label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= (hoverRating || rating) ? 'star selected' : 'star'}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </span>
          ))}
        </div>

        <label>Review:</label>
        <textarea
          placeholder="Write your feedback..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default Addfeedback;
