import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders login page by default (no token)', () => {
  render(<App />);
  // Проверяем элементы страницы логина
  expect(screen.getByText('Post-Discharge Care')).toBeInTheDocument();
  expect(screen.getByText('Your AI-powered recovery assistant')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('patient@hospital.com')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
});