import { render, screen } from '@testing-library/react';
import App from './App';

test('renders patient care agent heading', () => {
  render(<App />);
  expect(screen.getByText('Post-Discharge Patient Care Agent')).toBeTruthy();
});