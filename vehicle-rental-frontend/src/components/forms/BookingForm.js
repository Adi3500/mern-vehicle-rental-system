import { useEffect, useRef, useState } from 'react';
import { Calendar } from 'lucide-react';
import { getTodayInputDate, isDateRangeBlocked } from '../../utils/format';

const initialState = {
  startDate: '',
  endDate: '',
  customerNotes: '',
};

export default function BookingForm({
  onSubmit,
  submitting = false,
  unavailableDates = [],
  initialValues,
  onValuesChange,
}) {
  const [formData, setFormData] = useState(initialValues || initialState);
  const [error, setError] = useState('');
  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const today = getTodayInputDate();

  useEffect(() => {
    setFormData(initialValues || initialState);
  }, [initialValues]);

  useEffect(() => {
    if (onValuesChange) {
      onValuesChange(formData);
    }
  }, [formData, onValuesChange]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'startDate' && prev.endDate && prev.endDate <value ? { endDate: '' } : {}),
    }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (formData.startDate <today) {
      setError('Start date cannot be in the past.');
      return;
    }

    if (formData.endDate <today) {
      setError('End date cannot be in the past.');
      return;
    }

    if (new Date(formData.endDate) <new Date(formData.startDate)) {
      setError('End date must be after the start date.');
      return;
    }

    if (isDateRangeBlocked(unavailableDates, formData.startDate, formData.endDate)) {
      setError('The selected dates overlap with unavailable dates for this vehicle.');
      return;
    }

    onSubmit(formData);
  };

  const openDatePicker = (inputRef) => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    input.focus();

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.click();
  };

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <div className="form-group">
        <label className="form-label" htmlFor="startDate">Start Date</label>
        <div className="date-input-container">
          <input
            ref={startDateRef}
            id="startDate"
            type="date"
            className="form-control"
            name="startDate"
            value={formData.startDate}
            min={today}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="date-input-button"
            // aria-label="Open start date calendar"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => openDatePicker(startDateRef)}
          >
            <Calendar className="date-input-icon" size={20} />
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="endDate">End Date</label>
        <div className="date-input-container">
          <input
            ref={endDateRef}
            id="endDate"
            type="date"
            className="form-control"
            name="endDate"
            value={formData.endDate}
            min={formData.startDate || today}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="date-input-button"
            // aria-label="Open end date calendar"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => openDatePicker(endDateRef)}
          >
            <Calendar className="date-input-icon" size={20} />
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="customerNotes">Special Requests</label>
        <textarea
          id="customerNotes"
          className="form-control"
          name="customerNotes"
          value={formData.customerNotes}
          onChange={handleChange}
          placeholder="Add any pickup notes, preferences, or special requests."
          maxLength={500}
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
        {submitting ? 'Creating Booking...' : 'Proceed to Checkout'}
      </button>
    </form>
  );
}
