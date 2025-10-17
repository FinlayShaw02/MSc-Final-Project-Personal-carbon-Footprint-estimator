/**
 * ============================================================
 *  File: RegisterForm.jsx
 *  Component: RegisterForm
 *
 *  Description:
 *  A reusable signup form component that handles new user registration.
 *  Collects basic account details and submits them to the backend API
 *  for account creation.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InputField from '../ui/InputField';
import Button from '../ui/Button';

export default function RegisterForm() {
  // State hooks to manage form input values and UI feedback
  const [name, setName] = useState('');                 // Stores user's name
  const [email, setEmail] = useState('');               // Stores user's email
  const [password, setPassword] = useState('');         // Stores password input
  const [confirmPassword, setConfirmPassword] = useState(''); // Stores password confirmation
  const [isLoading, setIsLoading] = useState(false);    // Indicates loading state during registration
  const [error, setError] = useState('');               // Stores error message if registration fails

  const navigate = useNavigate();                       // Hook for programmatic navigation

  // Handles registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();           // Prevent default form behavior (page reload)
    setError('');                 // Clear previous errors

    // Validate matching passwords before sending to backend
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setIsLoading(true);           // Start loading state while request is processing

    try {
      // Send user registration data to backend API
      const response = await fetch('http://localhost/carbon_app_api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }) // Include form data in JSON format
      });

      const data = await response.json(); // Parse JSON response from server

      // Handle any non-OK HTTP responses
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed.');
      }

      // Redirect to dashboard on successful registration
      navigate('/dashboard');
    } catch (err) {
      // Capture and display any error that occurs
      setError(err.message);
    } finally {
      // Reset loading state after request completes
      setIsLoading(false);
    }
  };

  // JSX structure of the registration form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Input for full name */}
      <InputField
        label="Name"
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* Input for email */}
      <InputField
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      {/* Input for password */}
      <InputField
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      {/* Input for confirming password */}
      <InputField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {/* Display error message if registration fails */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Submit button with loading indicator */}
      <Button type="submit" isLoading={isLoading} variant="primary">
        Sign Up
      </Button>

      {/* Navigation link for users who already have an account */}
      <p className="text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-green-700 hover:underline font-semibold">
          Log in
        </Link>
      </p>
    </form>
  );
}
