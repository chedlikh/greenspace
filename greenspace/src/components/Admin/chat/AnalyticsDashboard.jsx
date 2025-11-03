import { Bar } from 'react-chartjs-2';
import {
  useTotalMessages,
  useMessageFrequency,
  useTotalCalls,
  useAverageCallDuration,
  useTotalConversations,
  useTotalUsers,
  useEngagementMetrics,
} from '../../../services/chathooks/analytics';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const { data: totalMessages } = useTotalMessages();
  const { data: messageFrequency } = useMessageFrequency('2025-01-01', '2025-05-20');
  const { data: totalCalls } = useTotalCalls();
  const { data: avgCallDuration } = useAverageCallDuration();
  const { data: totalConversations } = useTotalConversations();
  const { data: totalUsers } = useTotalUsers();
  const { data: engagement } = useEngagementMetrics();

  const chartData = {
    labels: messageFrequency?.map((f) => f.date) || [],
    datasets: [
      {
        label: 'Messages Sent',
        data: messageFrequency?.map((f) => f.count) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold">Total Messages</h3>
          <p className="text-2xl">{totalMessages || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold">Total Calls</h3>
          <p className="text-2xl">{totalCalls || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold">Average Call Duration</h3>
          <p className="text-2xl">{avgCallDuration || 0}s</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold">Total Conversations</h3>
          <p className="text-2xl">{totalConversations || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold">Total Users</h3>
          <p className="text-2xl">{totalUsers || 0}</p>
        </div>
      </div>
      <div className="mt-4 bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-semibold">Message Frequency</h3>
        <Bar data={chartData} />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;