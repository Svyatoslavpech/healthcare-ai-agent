// PATH: frontend/src/components/Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthContext } from '../context/AuthContext';
import Login from './Login';

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

test('renders email field', () => {
  renderWithContext();
  expect(screen.getByPlaceholderText(/patient@hospital.com/i)).toBeInTheDocument();
});

test('renders password field', () => {
  renderWithContext();
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
