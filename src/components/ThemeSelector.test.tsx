import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeSelector } from './ThemeSelector';
import { ThemeProvider } from '../context/ThemeContext';

// Mock localStorage
class LocalStorageMock {
  store: Record<string,string> = {};
  getItem(key: string) { return this.store[key] || null; }
  setItem(key: string, value: string) { this.store[key] = value; }
  removeItem(key: string) { delete this.store[key]; }
  clear() { this.store = {}; }
}

Object.defineProperty(window, 'localStorage', { value: new LocalStorageMock() });

// Provide matchMedia mock so dark detection passes quietly
Object.defineProperty(window, 'matchMedia', {
  value: () => ({ matches: false, addListener: () => {}, removeListener: () => {} })
});

describe('ThemeSelector', () => {
  it('defaults to corporate-dark and switches to corporate-light', () => {
    render(
      <ThemeProvider>
        <ThemeSelector />
      </ThemeProvider>
    );
    const darkRadio = screen.getByDisplayValue('corporate-dark');
    const lightRadio = screen.getByDisplayValue('corporate-light');
    expect(darkRadio).toBeChecked();
    fireEvent.click(lightRadio);
    expect(lightRadio).toBeChecked();
  });
});
