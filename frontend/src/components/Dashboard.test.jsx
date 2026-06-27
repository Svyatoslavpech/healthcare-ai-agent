// Dashboard.test.jsx
// PATH: frontend/src/components/Dashboard.test.jsx
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

// Mock recharts to avoid canvas errors in test environment
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Line: () => null,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  CartesianGrid: () => null,
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      pain_trend: [{ date: '2025-11-15', severity: 4.0, adherence: 1 }],
      adherence_percentage: 87.5,
      checkins_completed: 14,
      milestones_completed: 3,
      high_risk_flags: 0,
    }),
  })
);

test('shows loading state initially', () => {
  render(<Dashboard token="test-token" />);
  expect(screen.getByText(/Loading dashboard/i)).toBeInTheDocument();
});
