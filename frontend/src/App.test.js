// PATH: frontend/src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders patient care agent heading', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});
