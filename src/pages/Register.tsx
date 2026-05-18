import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';
import './register.css';

const Register = () => {
  return (
    <AuthLayout type="register">
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
