import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import './login.css';

const Login = () => {
  return (
    <AuthLayout type="login">
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
