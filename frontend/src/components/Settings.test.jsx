// Settings.test.jsx
// PATH: frontend/src/components/Settings.test.jsx
import { render, screen } from '@testing-library/react';
import Settings from './Settings';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      checkin_time: '09:00',
      reminder_method: 'app',
      notifications_on: true,
    }),
  })
);

test('renders settings header', () => {
  render(<Settings token="test-token" />);
  expect(screen.getByText(/Settings & Preferences/i)).toBeInTheDocument();
});

test('renders save button', () => {
  render(<Settings token="test-token" />);
  expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
});
