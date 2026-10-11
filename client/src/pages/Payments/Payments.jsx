import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payments.css';

const Payments = () => {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/');
        return;
      }

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

      setPayments(Array.isArray(data.payments) ? data.payments : []);
    } catch (err) {
      console.error('Fetch payments error:', err);
      setError('Unable to connect to the server. Please try again.');
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

  const paidPayments = payments.filter(payment => payment.status === 'paid');

  const totalPendingAmount = pendingPayments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  const formatCurrency = amount =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = date => {
    if (!date) return '—';

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? '—'
      : parsedDate.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  };

  return (
    <main className="payments-page">
      <header className="payments-topbar">
        <div className="payments-breadcrumb">
          Resident Portal <span>/</span> Payments
        </div>

        <button
          className="payments-back-button"
          onClick={() => navigate('/resident')}
        >
          ← Dashboard
        </button>
      </header>

      <section className="payments-header">
        <p className="payments-eyebrow">YOUR ACCOUNT</p>
        <h1>Payments</h1>
        <p>Track your apartment payments and outstanding balance.</p>
      </section>

      {loading && (
        <div className="payments-state">
          <span className="payments-loader" />
          <p>Loading your payment information...</p>
        </div>
      )}

      {!loading && error && (
        <div className="payments-error">
          <span className="payments-state-icon">!</span>
          <h2>Unable to load payments</h2>
          <p>{error}</p>
          <button className="payments-primary-button" onClick={fetchPayments}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <section className="payment-summary">
            <article className="payment-card pending-amount-card">
              <div className="payment-card-top">
                <span className="payment-icon pending-icon">₹</span>
                <span className="payment-card-arrow">↗</span>
              </div>

              <h2>Total Pending Amount</h2>
              <p className="payment-card-value">
                {formatCurrency(totalPendingAmount)}
              </p>
              <span className="payment-card-description">
                {pendingPayments.length === 0
                  ? 'No outstanding balance'
                  : `${pendingPayments.length} pending payment${
                      pendingPayments.length === 1 ? '' : 's'
                    }`}
              </span>
            </article>

            <article className="payment-card payment-status-card">
              <div className="payment-card-top">
                <span className="payment-icon status-icon">✓</span>
                <span className="payment-card-arrow">↗</span>
              </div>

              <h2>Payment Status</h2>
              <p
                className={`payment-card-value ${
                  pendingPayments.length === 0
                    ? 'payment-status-clear'
                    : 'payment-status-due'
                }`}
              >
                {pendingPayments.length === 0
                  ? 'Up to Date'
                  : 'Payment Pending'}
              </p>
              <span className="payment-card-description">
                {pendingPayments.length === 0
                  ? 'Your account is currently clear'
                  : 'Please review your outstanding payments'}
              </span>
            </article>

            <article className="payment-card paid-count-card">
              <div className="payment-card-top">
                <span className="payment-icon paid-icon">✓</span>
                <span className="payment-card-arrow">↗</span>
              </div>

              <h2>Payments Completed</h2>
              <p className="payment-card-value">{paidPayments.length}</p>
              <span className="payment-card-description">
                Successfully recorded as paid
              </span>
            </article>
          </section>

          <section className="payment-history">
            <div className="payment-history-header">
              <div>
                <h2>Payment History</h2>
                <p>Review your payment records and due dates.</p>
              </div>

              <span className="payment-record-count">
                {payments.length} record{payments.length === 1 ? '' : 's'}
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="empty-payments">
                <span className="empty-payments-icon">₹</span>
                <h3>No payment records yet</h3>
                <p>
                  Your apartment payment records will appear here when
                  management creates them.
                </p>
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
                        <td>
                          <div className="payment-description">
                            <span className="payment-row-icon">₹</span>
                            <strong>{payment.description}</strong>
                          </div>
                        </td>

                        <td className="payment-amount">
                          {formatCurrency(Number(payment.amount || 0))}
                        </td>

                        <td>{formatDate(payment.dueDate)}</td>

                        <td>
                          <span
                            className={`resident-payment-status ${
                              payment.status === 'paid'
                                ? 'resident-payment-paid'
                                : 'resident-payment-pending'
                            }`}
                          >
                            <span className="payment-status-dot" />
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
};

export default Payments;
