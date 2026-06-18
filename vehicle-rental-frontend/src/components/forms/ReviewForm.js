import { useEffect, useState } from 'react';

const initialState = {
  rating: '5',
  comment: '',
};

export default function ReviewForm({
  onSubmit,
  initialValues,
  submitting = false,
  submitLabel = 'Submit Review',
}) {
  const [formData, setFormData] = useState(initialValues || initialState);

  useEffect(() => {
    setFormData(initialValues || initialState);
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      rating: Number(formData.rating),
      comment: formData.comment.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <div className="form-group">
        <label className="form-label" htmlFor="rating">Rating</label>
        <select
          id="rating"
          className="form-control"
          name="rating"
          value={formData.rating}
          onChange={handleChange}
        >
          <option value="5">★★★★★ Excellent</option>
          <option value="4">★★★★☆ Good</option>
          <option value="3">★★★☆☆ Average</option>
          <option value="2">★★☆☆☆ Poor</option>
          <option value="1">★☆☆☆☆ Very Poor</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="comment">Your Review</label>
        <textarea
          id="comment"
          className="form-control"
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          placeholder="Share your experience with this vehicle..."
          minLength="10"
          maxLength="1000"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
