import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import Settings from '../components/Settings';

const mockPreferences = {
  checkin_time: '09:00',
  reminder_method: 'app',
  notifications_on: true,
};

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => mockPreferences,
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders settings page', () => {
  render(<Settings token="mock-token" />);
  expect(screen.getByText(/Settings & Preferences/i)).toBeInTheDocument();
});

test('renders save button', () => {
  render(<Settings token="mock-token" />);
  expect(screen.getByRole('button', { name: /Save Settings/i })).toBeInTheDocument();
});

test('renders checkin time label', () => {
  render(<Settings token="mock-token" />);
  expect(screen.getByText(/Check-in Time/i)).toBeInTheDocument();
});

test('renders reminder method label', () => {
  render(<Settings token="mock-token" />);
  expect(screen.getByText(/Reminder Method/i)).toBeInTheDocument();
});