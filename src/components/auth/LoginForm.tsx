import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Input } from "../ui/UI";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../layouts/AuthContext";

const LoginForm = () => {
  const { login } = useAuth();

  // We use the 'useState' hook to manage the form's data.
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // This function updates the state whenever a user types in an input field.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // This function is called when the user clicks the "Login" button.
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const loggedInUser = await loginUser(formData.email, formData.password);
      toast.success("Login successful!");
      login(loggedInUser);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <Input id="email" label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
      <Input id="password" label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
      <button type="submit" className="w-full bg-[#2563eb] text-white p-3 rounded-md hover:bg-[#1d4ed8] transition-colors duration-300 font-bold mt-2">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
