import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignUp from '../src/pages/SignUp';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../src/context/AuthContext';

// Mock login function and mock fetch
const mockLogin = jest.fn();
const renderSignUp = () => {
  render(
    <AuthContext.Provider value={{ user: null, login: mockLogin }}>
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('SignUp Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('renders all form fields and the signup button', () => {
    renderSignUp();

    expect(screen.getByPlaceholderText(/enter username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/re-enter password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/mm\/dd\/yyyy/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    renderSignUp();

const [passwordInput, confirmPasswordInput] = screen.getAllByPlaceholderText(/password/i);

fireEvent.change(passwordInput, {
  target: { value: 'password123' },
});
fireEvent.change(confirmPasswordInput, {
  target: { value: 'password123' },
});

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('shows error when birthdate is not selected', async () => {
    renderSignUp();

    fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/re-enter password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/birthdate is required/i)).toBeInTheDocument();
  });

  it('shows age restriction error for users under 13', async () => {
    renderSignUp();

    const today = new Date();
    const twelveYearsAgo = new Date(today.getFullYear() - 12, today.getMonth(), today.getDate());

    fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
      target: { value: 'younguser' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: 'young@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/re-enter password/i), {
      target: { value: 'password123' },
    });

    const birthdateInput = screen.getByPlaceholderText(/mm\/dd\/yyyy/i);
    fireEvent.change(birthdateInput, {
      target: { value: twelveYearsAgo.toLocaleDateString('en-US') },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    expect(await screen.findByText(/you must be at least 13 years old/i)).toBeInTheDocument();
  });

  it('calls login() on successful registration', async () => {
    const mockUser = {
      username: 'validuser',
      email: 'valid@example.com',
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      })
    );

    renderSignUp();

    fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
      target: { value: mockUser.username },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: mockUser.email },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/re-enter password/i), {
      target: { value: 'password123' },
    });

    const birthdateInput = screen.getByPlaceholderText(/mm\/dd\/yyyy/i);
    fireEvent.change(birthdateInput, {
      target: { value: '01/01/2000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith(mockUser));
  });

  it('displays API validation errors (multiple)', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            details: [
              { msg: 'Email is already taken' },
              { msg: 'Username must be unique' },
            ],
          }),
      })
    );

    renderSignUp();

    fireEvent.change(screen.getByPlaceholderText(/enter username/i), {
      target: { value: 'duplicate' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
      target: { value: 'taken@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText(/re-enter password/i), {
      target: { value: 'password123' },
    });

    const birthdateInput = screen.getByPlaceholderText(/mm\/dd\/yyyy/i);
    fireEvent.change(birthdateInput, {
      target: { value: '01/01/2000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await screen.findByText(/email is already taken/i);
    await screen.findByText(/username must be unique/i);
  });
});
