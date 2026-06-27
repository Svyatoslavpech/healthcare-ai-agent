// Login.test.jsx
// PATH: frontend/src/components/Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Login from './Login';
import { AuthContext } from '../context/AuthContext';

const mockLogin = jest.fn();

const renderWithContext = () => {
  return render(
    <AuthContext.Provider value={{ login: mockLogin }}>
      <Login />
    </AuthContext.Provider>
  );
};

test('renders login form', () => {
  renderWithContext();
  expect(screen.getByPlaceholderText(/patient@hospital.com/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});

test('renders logo and title', () => {
  renderWithContext();
  expect(screen.getByText(/Post-Discharge Care/i)).toBeInTheDocument();
  expect(screen.getByText(/AI-powered recovery assistant/i)).toBeInTheDocument();
});

test('renders demo hint', () => {
  renderWithContext();
  expect(screen.getByText(/Demo credentials/i)).toBeInTheDocument();
});
