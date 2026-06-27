// Onboarding.test.jsx
// PATH: frontend/src/components/Onboarding.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Onboarding from './Onboarding';

test('renders welcome step initially', () => {
  render(<Onboarding onComplete={() => {}} />);
  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
  expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
});

test('renders continue button', () => {
  render(<Onboarding onComplete={() => {}} />);
  expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
});

test('advances to next step on Continue click', () => {
  render(<Onboarding onComplete={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
  expect(screen.getByText(/Check-in Time/i)).toBeInTheDocument();
});

test('calls onComplete on final step', () => {
  const mockComplete = jest.fn();
  render(<Onboarding onComplete={mockComplete} />);
  // Step 1 → 2 → 3 → complete
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));
  expect(mockComplete).toHaveBeenCalledTimes(1);
});
