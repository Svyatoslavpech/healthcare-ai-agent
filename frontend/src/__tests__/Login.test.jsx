// PATH: frontend/src/__tests__/Login.test.jsx
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';
import Login from '../components/Login';

const mockLogin = jest.fn();

const renderWithContext = () =>
  render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      <Login />
    </AuthContext.Provider>
  );

test('renders login form', () => {
  renderWithContext();
  expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
});

test('renders email and password fields', () => {
  renderWithContext();
  expect(screen.getByPlaceholderText(/patient@hospital.com/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
});

test('renders app title', () => {
  renderWithContext();
  expect(screen.getByText(/Post-Discharge Care/i)).toBeInTheDocument();
});

test('renders demo credentials hint', () => {
  renderWithContext();
  expect(screen.getByText(/Demo credentials/i)).toBeInTheDocument();
});
