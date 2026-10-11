import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPayments.css';

const AdminPayments = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    residentId: '',
    apartmentNumber: '',
    amount: '',
    dueDate: '',
    description: '',
  });

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [paymentsResponse, residentsResponse] = await Promise.all([
        fetch('http://localhost:5001/api/payments', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:5001/api/users/residents', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const paymentsData = await paymentsResponse.json();
      const residentsData = await residentsResponse.json();

      if (!paymentsResponse.ok) {
        throw new Error(paymentsData.message || 'Failed to load payments');
      }

      if (!residentsResponse.ok) {
        throw new Error(residentsData.message || 'Failed to load residents');
      }

      setPayments(paymentsData.payments || []);
      setResidents(residentsData.residents || []);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResidentChange = e => {
    const residentId = e.target.value;
    const selectedResident = residents.find(
      resident => resident._id === residentId
    );

    setFormData(prev => ({
      ...prev,
      residentId,
      apartmentNumber: selectedResident?.apartmentNumber || '',
    }));
  };

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment');
      }

      alert('Payment created successfully!');

      setFormData({
        residentId: '',
        apartmentNumber: '',
        amount: '',
        dueDate: '',
        description: '',
      });

      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create payment');
    }
  };

  const updatePaymentStatus = async paymentId => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/payments/${paymentId}/pay`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update payment');
      }

      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update payment status');
    }
  };

  const deletePayment = async paymentId => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/payments/${paymentId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete payment');
      }

      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete payment');
    }
  };

  const formatDate = date => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="admin-payments-page">
      <header className="admin-payments-header">
        <div className="admin-payments-breadcrumb">
          <span>Admin Portal</span>
          <span className="breadcrumb-divider">/</span>
          <span>Payments</span>
        </div>

        <button
          className="payments-dashboard-button"
          onClick={() => navigate('/admin')}
        >
          ← Dashboard
        </button>
      </header>

      <main className="admin-payments-content">
        <section className="payments-page-heading">
          <span className="payments-eyebrow">FINANCIAL MANAGEMENT</span>
          <h1>Manage Payments</h1>
          <p>Create and manage apartment payments.</p>
        </section>

        {error && <div className="payments-error">{error}</div>}

        <section className="create-payment-card">
          <div className="payment-section-heading">
            <div>
              <h2>Create Payment</h2>
              <p>Assign a payment to a registered resident.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-payment-form">
            <div className="payment-form-grid">
              <div className="payment-form-group">
                <label htmlFor="residentId">Resident</label>
                <select
                  id="residentId"
                  name="residentId"
                  value={formData.residentId}
                  onChange={handleResidentChange}
                  required
                >
                  <option value="">Select resident</option>
                  {residents.map(resident => (
                    <option key={resident._id} value={resident._id}>
                      {resident.name} ({resident.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="payment-form-group">
                <label htmlFor="apartmentNumber">Apartment</label>
                <input
                  id="apartmentNumber"
                  name="apartmentNumber"
                  value={formData.apartmentNumber}
                  onChange={handleChange}
                  placeholder="Apartment number"
                  required
                />
              </div>

              <div className="payment-form-group">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div className="payment-form-group">
                <label htmlFor="dueDate">Due Date</label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="payment-form-group payment-description-group">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Example: Monthly maintenance"
                  required
                />
              </div>
            </div>

            <button type="submit" className="create-payment-button">
              Create Payment
            </button>
          </form>
        </section>

        <section className="payment-records-section">
          <div className="payment-records-heading">
            <div>
              <h2>Payment Records</h2>
              <p>Review payment status and due dates.</p>
            </div>

            <span className="payment-record-count">
              {payments.length} {payments.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          {loading ? (
            <div className="payments-message">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="payments-message">No payment records found.</div>
          ) : (
            <div className="payments-table-wrapper">
              <table className="admin-payments-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Resident</th>
                    <th>Apartment</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map(payment => (
                    <tr key={payment._id}>
                      <td className="payment-description-cell">
                        {payment.description}
                      </td>
                      <td>
                        {payment.resident?.name || 'Resident'}
                        <span className="payment-secondary-text">
                          {payment.resident?.email || ''}
                        </span>
                      </td>
                      <td>{payment.apartmentNumber || '—'}</td>
                      <td className="payment-amount-cell">
                        ₹
                        {Number(payment.amount).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td>{formatDate(payment.dueDate)}</td>
                      <td>
                        <span
                          className={`payment-status-badge ${
                            payment.status === 'paid' ? 'paid' : 'pending'
                          }`}
                        >
                          {payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="payment-action-buttons">
                          {payment.status !== 'paid' && (
                            <button
                              className="mark-paid-button"
                              onClick={() => updatePaymentStatus(payment._id)}
                            >
                              Mark Paid
                            </button>
                          )}

                          <button
                            className="delete-payment-button"
                            onClick={() => deletePayment(payment._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminPayments;
