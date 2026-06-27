// Feedback.test.jsx
// PATH: frontend/src/components/Feedback.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Feedback from './Feedback';

const mockResult = {
  risk_level: 'low',
  message: 'You are doing great! Keep following your recovery plan.',
  escalation: false,
  checkin_id: 42,
};

test('renders nothing when result is null', () => {
  const { container } = render(<Feedback result={null} onClose={() => {}} />);
  expect(container.firstChild).toBeNull();
});

test('renders feedback with low risk', () => {
  render(<Feedback result={mockResult} onClose={() => {}} />);
  expect(screen.getByText(/On Track/i)).toBeInTheDocument();
  expect(screen.getByText(/You are doing great/i)).toBeInTheDocument();
});

test('renders checkin ID', () => {
  render(<Feedback result={mockResult} onClose={() => {}} />);
  expect(screen.getByText(/#42/i)).toBeInTheDocument();
});

test('calls onClose when Done button clicked', () => {
  const mockClose = jest.fn();
  render(<Feedback result={mockResult} onClose={mockClose} />);
  fireEvent.click(screen.getByRole('button', { name: /Done/i }));
  expect(mockClose).toHaveBeenCalledTimes(1);
});

test('renders escalation alert for high risk', () => {
  const highRiskResult = {
    ...mockResult,
    risk_level: 'high',
    escalation: true,
    message: 'Your symptoms need attention.',
  };
  render(<Feedback result={highRiskResult} onClose={() => {}} />);
  expect(screen.getByText(/nurse has been notified/i)).toBeInTheDocument();
});
