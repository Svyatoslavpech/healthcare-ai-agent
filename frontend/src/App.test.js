import { render, screen } from '@testing-library/react';
import App from './App';

test('renders patient care agent heading', () => {
  render(<App />);
  const heading = screen.getByText(/Post-Discharge Patient Care Agent/i);
  expect(heading).toBeInTheDocument();
});
