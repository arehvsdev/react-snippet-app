import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Input } from "../ui/UI";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const LoginForm = () => {
  const navigate = useNavigate();

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
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
      toast.success("Login successful!");
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );
      navigate("/profile");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <Input id="email" label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
      <Input id="password" label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
      <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded-md hover:bg-purple-700 transition-colors duration-300 font-bold mt-2">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
