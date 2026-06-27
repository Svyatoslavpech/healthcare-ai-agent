// PATH: frontend/src/__tests__/Onboarding.test.jsx
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Onboarding from '../components/Onboarding';

test('renders onboarding wizard', () => {
  render(<Onboarding onComplete={() => {}} />);
  expect(screen.getByText(/Welcome! 👋/i)).toBeInTheDocument();
});

test('shows step 1 of 3 initially', () => {
  render(<Onboarding onComplete={() => {}} />);
  expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument();
});

test('renders Continue button on first step', () => {
  render(<Onboarding onComplete={() => {}} />);
  expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
});

test('advances to step 2 on Continue click', () => {
  render(<Onboarding onComplete={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  expect(screen.getByText(/Step 2 of 3/i)).toBeInTheDocument();
  expect(screen.getByText(/Check-in Time/i)).toBeInTheDocument();
});

test('advances to step 3 and shows Reminder Method', () => {
  render(<Onboarding onComplete={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  expect(screen.getByText(/Step 3 of 3/i)).toBeInTheDocument();
  expect(screen.getByText(/Reminder Method/i)).toBeInTheDocument();
});

test('calls onComplete on final Get Started click', () => {
  const mockComplete = jest.fn();
  render(<Onboarding onComplete={mockComplete} />);
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
  fireEvent.click(screen.getByRole('button', { name: /Get Started/i }));
  expect(mockComplete).toHaveBeenCalledTimes(1);
});
