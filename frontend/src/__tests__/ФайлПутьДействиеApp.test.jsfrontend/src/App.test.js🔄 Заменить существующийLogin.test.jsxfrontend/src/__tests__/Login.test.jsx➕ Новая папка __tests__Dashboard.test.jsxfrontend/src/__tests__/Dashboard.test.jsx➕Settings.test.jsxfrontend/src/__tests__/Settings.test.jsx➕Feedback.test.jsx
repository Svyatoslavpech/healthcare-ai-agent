// PATH: frontend/src/__tests__/Feedback.test.jsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Feedback from '../components/Feedback';

const mockResult = {
  risk_level: 'low',
  message: 'Great job! Keep following your recovery plan.',
  escalation: false,
  checkin_id: 42,
};

test('renders feedback modal', () => {
  render(<Feedback result={mockResult} onClose={() => {}} />);
  expect(screen.getByText(/Great job!/i)).toBeInTheDocument();
});

test('renders On Track status for low risk', () => {
  render(<Feedback result={mockResult} onClose={() => {}} />);
  expect(screen.getByText(/On Track/i)).toBeInTheDocument();
});

test('renders checkin ID', () => {
  render(<Feedback result={mockResult} onClose={() => {}} />);
  expect(screen.getByText(/#42/i)).toBeInTheDocument();
});

test('calls onClose when Done clicked', () => {
  const mockClose = jest.fn();
  render(<Feedback result={mockResult} onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: /Done/i }));
  expect(mockClose).toHaveBeenCalledTimes(1);
});

test('renders escalation alert for high risk', () => {
  const highRisk = {
    ...mockResult,
    risk_level: 'high',
    escalation: true,
    message: 'Your symptoms need attention.',
  };
  render(<Feedback result={highRisk} onClose={() => {}} />);
  expect(screen.getByText(/nurse has been notified/i)).toBeInTheDocument();
});

test('renders nothing when result is null', () => {
  const { container } = render(<Feedback result={null} onClose={() => {}} />);
  expect(container.firstChild).toBeNull();
});
