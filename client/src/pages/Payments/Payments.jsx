import React, { useEffect, useState } from 'react';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:5001/api/payments/my-payments',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to fetch payments');
        return;
      }

      setPayments(data.payments);
    } catch (error) {
      console.error('Fetch payments error:', error);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const pendingPayments = payments.filter(
    payment => payment.status === 'pending'
  );

  const totalPendingAmount = pendingPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  return (
    <div className="payments-page">
      <div className="payments-header">
        <h1>Payments</h1>
        <p>View your apartment payment information</p>
      </div>

      {loading && (
        <p className="payments-message">Loading payment information...</p>
      )}

      {error && !loading && (
        <div className="payments-error">
          <h3>Unable to load payments</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Payment Summary */}

          <div className="payment-summary">
            <div className="payment-card">
              <h3>Total Pending Amount</h3>

              <p>₹{totalPendingAmount}</p>

              <span>
                {pendingPayments.length === 0
                  ? 'No outstanding balance'
                  : `${pendingPayments.length} pending payment${
                      pendingPayments.length > 1 ? 's' : ''
                    }`}
              </span>
            </div>

            <div className="payment-card">
              <h3>Payment Status</h3>

              <p className="payment-status">
                {pendingPayments.length === 0
                  ? 'Up to Date'
                  : 'Payment Pending'}
              </p>

              <span>
                {pendingPayments.length === 0
                  ? 'Your account is currently clear'
                  : 'You have pending payments'}
              </span>
            </div>
          </div>

          {/* Payment History */}

          <div className="payment-history">
            <h2>Payment History</h2>

            {payments.length === 0 ? (
              <div className="empty-payments">
                <p>No payment records available yet.</p>
              </div>
            ) : (
              <div className="resident-payments-table-wrapper">
                <table className="resident-payments-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map(payment => (
                      <tr key={payment._id}>
                        <td>{payment.description}</td>

                        <td>₹{payment.amount}</td>

                        <td>
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </td>

                        <td>
                          <span
                            className={
                              payment.status === 'paid'
                                ? 'resident-payment-paid'
                                : 'resident-payment-pending'
                            }
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Payments;
