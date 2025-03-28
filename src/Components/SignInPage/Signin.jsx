import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import './Signin.css';

const Signin = () => {
  const [userMail, setUserMail] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [gender, setGender] = useState('');
  const [dept, setDept] = useState('');
  const [designation, setDesignation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [branch, setBranch] = useState('');
  const [userType, setUserType] = useState('Employee');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginData = { userMail, password };

    try {
      const response = await axios.post('https://localhost:7287/api/Auth', loginData);
      const { token } = response.data;

      if (!token) throw new Error('No token received');

      Cookies.set('token', token, { expires: 7, path: '' });

      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);

      toast.success('Login Successful!', { autoClose: 2000 });

      if (decoded.role === 'Admin') {
        navigate('/admin/Dashboard', { replace: true });
      } else if (decoded.role === 'Employee') {
        navigate('/EmpDashboard', { replace: true });
      } else {
        toast.error('Unknown user role', { autoClose: 2000 });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid credentials';
      toast.error(errorMessage, { autoClose: 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const registerData = {
      userName,
      userMail: email,
      gender,
      dept,
      designation,
      phoneNumber,
      address,
      password,
      branch,
      userType,
    };

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        'Password must be at least 8 characters, include uppercase, lowercase, number, and special character.',
        { autoClose: 2000 }
      );
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Invalid email format.', { autoClose: 2000 });
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error('Phone number must be 10 digits long.', { autoClose: 2000 });
      return;
    }

    try {
      await axios.post('https://localhost:7287/api/Auth/register', registerData);
      toast.success('Registration Successful!', { autoClose: 2000 });
      setTimeout(() => navigate('/', { replace: true }), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Mail ID already exists';
      toast.error(errorMessage, { autoClose: 2000 });
    }
  };

  const styles = {
    background: {
      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', // Gradient background with purple-blue tone
      height: '100vh',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    },
    formContainer: {
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      padding: '40px',
      width: '100%',
      maxWidth: '450px',
      position: 'relative',
    },
    title: {
      fontSize: '32px',
      fontWeight: '600',
      color: '#333',
      textAlign: 'center',
      marginBottom: '20px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    input: {
      padding: '12px 20px',
      marginBottom: '16px',
      borderRadius: '8px',
      border: '1px solid #ddd',
      fontSize: '16px',
      outline: 'none',
      transition: 'border-color 0.3s ease',
    },
    inputFocus: {
      borderColor: '#2575fc',
    },
    passwordContainer: {
      position: 'relative',
    },
    eyeIcon: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
    },
    button: {
      backgroundColor: '#2575fc',
      color: '#fff',
      padding: '14px 20px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    buttonDisabled: {
      backgroundColor: '#b0c4de',
      cursor: 'not-allowed',
    },
    switchFormButton: {
      backgroundColor: 'transparent',
      color: '#2575fc',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'center',
      marginTop: '20px',
      fontSize: '16px',
    },
    switchFormButtonHover: {
      textDecoration: 'underline',
    },
  };

  return (
    <div style={styles.background}>
      <ToastContainer />
      <div style={styles.formContainer}>
        <h2 style={styles.title}>{isSignUp ? 'Create an Account' : 'Sign in to Hexa Asset Management'}</h2>

        <form onSubmit={isSignUp ? handleRegister : handleLogin} style={styles.form}>
          {isSignUp && (
            <input
              type="text"
              placeholder="User Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="form-input"
              style={styles.input}
              required
            />
          )}

          <input
            type="text"
            placeholder="UserMail"
            value={userMail}
            onChange={(e) => setUserMail(e.target.value)}
            className="form-input"
            style={styles.input}
            required
          />

          <div style={styles.passwordContainer}>
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <span
              onClick={() => setPasswordVisible(!passwordVisible)}
              style={styles.eyeIcon}
            >
              {passwordVisible ? '👁️' : '👁️‍🗨️'}
            </span>
          </div>

          {isSignUp && (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Department"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={styles.input}
                required
              />
              <input
                type="text"
                placeholder="Branch"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={styles.input}
                required
              />
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                style={styles.input}
                required
              >
                <option value="Employee">Employee</option>
                <option value="Admin">Admin</option>
              </select>
            </>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isSignUp ? 'Register' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              ...styles.switchFormButton,
              ...(isSignUp ? styles.switchFormButtonHover : {}),
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signin;
