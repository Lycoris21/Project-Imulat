import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../src/pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../src/context/AuthContext';


// Mock login function
const mockLogin = jest.fn();

// Wrap component in router and context
const renderLogin = () => {
  render(
    <AuthContext.Provider value={{ user: null, login: mockLogin }}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    mockLogin.mockClear();
    // Optional: clear localStorage/sessionStorage
  });

  it('renders email and password fields and login button', () => {
    renderLogin();

    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('lets user type in email and password', () => {
    renderLogin();

    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('testpass');
  });

  it('shows error on failed login (mocked)', async () => {
    // Override fetch to simulate failed login
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      })
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: 'fail@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    const errorMessage = await screen.findByText(/invalid credentials/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('calls login function on successful login', async () => {
    const mockUser = { email: 'test@example.com', name: 'Test User' };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      })
    );

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText(/enter your email/i), {
      target: { value: mockUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'testpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(mockUser));
  });
});
