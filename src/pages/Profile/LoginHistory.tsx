import React, { useEffect, useState } from 'react';
import { AuthService, LoginHistoryEntry } from '../../services/authService';
import toast from 'react-hot-toast';

const LoginHistory: React.FC = () => {
  const [history, setHistory] = useState<LoginHistoryEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const { data, error } = await AuthService.getLoginHistory();
        if (error) {
          throw new Error('Failed to fetch login history');
        }
        if (data) {
          setHistory(data);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        toast.error(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return <p>Loading login history...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">Login History</h2>
      <p className="mb-4 text-gray-600">Here are your last 10 logins.</p>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Date</th>
              <th className="py-2 px-4 border-b text-left">IP Address</th>
              <th className="py-2 px-4 border-b text-left">User Agent</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((entry) => (
                <tr key={entry.id}>
                  <td className="py-2 px-4 border-b">{new Date(entry.created_at).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">{entry.ip_address}</td>
                  <td className="py-2 px-4 border-b">{entry.user_agent}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                  No login history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoginHistory;
