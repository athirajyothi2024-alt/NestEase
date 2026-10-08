import React, { useEffect, useState } from 'react';
import './AdminPayments.css';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [residentId, setResidentId] = useState('');
  const [apartmentNumber, setApartmentNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const token = localStorage.getItem('token');

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/payments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to fetch payments');
        return;
      }

      setPayments(data.payments);
    } catch (error) {
      console.error('Fetch payments error:', error);
      alert('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    try {
      const response = await fetch(
        'http://localhost:5001/api/users/residents',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to fetch residents');
        return;
      }

      setResidents(data.residents);
    } catch (error) {
      console.error('Fetch residents error:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchResidents();
  }, []);

  const handleResidentChange = e => {
    const selectedId = e.target.value;

    setResidentId(selectedId);

    const selectedResident = residents.find(
      resident => resident._id === selectedId
    );

    if (selectedResident) {
      setApartmentNumber(selectedResident.apartmentNumber || '');
    } else {
      setApartmentNumber('');
    }
  };

  const handleCreatePayment = async e => {
    e.preventDefault();

    try {
      setCreating(true);

      const response = await fetch('http://localhost:5001/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          residentId,
          apartmentNumber,
          amount: Number(amount),
          description,
          dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to create payment');
        return;
      }

      alert('Payment created successfully!');

      setResidentId('');
      setApartmentNumber('');
      setAmount('');
      setDescription('');
      setDueDate('');

      fetchPayments();
    } catch (error) {
      console.error('Create payment error:', error);
      alert('Unable to connect to server');
    } finally {
      setCreating(false);
    }
  };

  const handleMarkPaid = async paymentId => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/payments/${paymentId}/pay`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to update payment');
        return;
      }

      alert('Payment marked as paid!');
      fetchPayments();
    } catch (error) {
      console.error('Mark paid error:', error);
      alert('Unable to connect to server');
    }
  };

  const handleDelete = async paymentId => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this payment?'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5001/api/payments/${paymentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to delete payment');
        return;
      }

      alert('Payment deleted successfully!');
      fetchPayments();
    } catch (error) {
      console.error('Delete payment error:', error);
      alert('Unable to connect to server');
    }
  };

  return (
    <div className="admin-payments-page">
      <div className="admin-payments-header">
        <h1>Manage Payments</h1>
        <p>Create and manage apartment payments</p>
      </div>

      {/* Create Payment */}

      <div className="create-payment-card">
        <h2>Create Payment</h2>

        <form onSubmit={handleCreatePayment}>
          <div className="payment-form-row">
            <div className="payment-form-group">
              <label>Resident</label>

              <select
                value={residentId}
                onChange={handleResidentChange}
                required
              >
                <option value="">Select resident</option>

                {residents.map(resident => (
                  <option key={resident._id} value={resident._id}>
                    {resident.name} - {resident.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="payment-form-group">
              <label>Apartment</label>

              <input
                type="text"
                value={apartmentNumber}
                placeholder="Apartment number"
                readOnly
                required
              />
            </div>
          </div>

          <div className="payment-form-row">
            <div className="payment-form-group">
              <label>Amount</label>

              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="payment-form-group">
              <label>Due Date</label>

              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="payment-form-group">
            <label>Description</label>

            <input
              type="text"
              placeholder="Example: Monthly maintenance"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="create-payment-button"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Payment'}
          </button>
        </form>
      </div>

      {/* Payment List */}

      <div className="payments-list">
        <h2>Payment Records</h2>

        {loading && <p className="loading-payments">Loading payments...</p>}

        {!loading && payments.length === 0 && (
          <div className="empty-payments">
            <h3>No Payments</h3>
            <p>No payment records have been created yet.</p>
          </div>
        )}

        {!loading && payments.length > 0 && (
          <div className="payments-table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Apartment</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id}>
                    <td>{payment.resident?.name || 'Unknown'}</td>

                    <td>{payment.apartmentNumber}</td>

                    <td>{payment.description}</td>

                    <td>₹{payment.amount}</td>

                    <td>{new Date(payment.dueDate).toLocaleDateString()}</td>

                    <td>
                      <span
                        className={
                          payment.status === 'paid'
                            ? 'payment-paid'
                            : 'payment-pending'
                        }
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td>
                      {payment.status === 'pending' && (
                        <button
                          className="mark-paid-button"
                          onClick={() => handleMarkPaid(payment._id)}
                        >
                          Mark Paid
                        </button>
                      )}

                      <button
                        className="delete-payment-button"
                        onClick={() => handleDelete(payment._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
