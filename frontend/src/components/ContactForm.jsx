import { useEffect, useState } from 'react';

const initialState = {
  name: '',
  email: '',
  phone: '',
  address: '',
};

const validate = (values) => {
  const errors = {};
  if (!values.name.trim()) {
    errors.name = 'Name is required';
  }
  if (!values.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }
  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required';
  }
  return errors;
};

const ContactForm = ({ onSubmit, initialData = initialState, submitting }) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({ ...initialState, ...initialData });
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={values.name} onChange={handleChange} />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" value={values.email} onChange={handleChange} />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="phone">Phone</label>
        <input id="phone" name="phone" value={values.phone} onChange={handleChange} />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="address">Address</label>
        <textarea id="address" name="address" value={values.address} onChange={handleChange} />
      </div>
      <button type="submit" className="primary" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Contact'}
      </button>
    </form>
  );
};

export default ContactForm;
