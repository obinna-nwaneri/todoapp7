import { useEffect, useState } from 'react';

const emptyValues = {
  name: '',
  email: '',
  phone: '',
  address: ''
};

const ContactForm = ({ initialValues = emptyValues, onSubmit, submitLabel }) => {
  const [values, setValues] = useState({ ...emptyValues, ...initialValues });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({ ...emptyValues, ...initialValues });
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const currentErrors = {};
    if (!values.name.trim()) {
      currentErrors.name = 'Name is required';
    }
    if (!values.email.trim()) {
      currentErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      currentErrors.email = 'Email is invalid';
    }
    if (!values.phone.trim()) {
      currentErrors.phone = 'Phone number is required';
    }
    return currentErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          className="form-control"
          value={values.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          required
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="form-control"
          value={values.email}
          onChange={handleChange}
          placeholder="jane@example.com"
          required
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          className="form-control"
          value={values.phone}
          onChange={handleChange}
          placeholder="(555) 555-5555"
          required
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>
      <div className="form-group">
        <label htmlFor="address">Address</label>
        <textarea
          id="address"
          name="address"
          className="form-control"
          value={values.address}
          onChange={handleChange}
          rows={3}
          placeholder="123 Main St, Springfield"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {submitLabel}
      </button>
    </form>
  );
};

export default ContactForm;
