import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Input, Select } from "../ui/UI";
import { createUserWithEmailAndPassword, type User } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const RegisterForm = () => {
  const navigate = useNavigate();

  // State to hold all the form data for registration.
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  // Options for the 'Role' select dropdown.
  const roleOptions = [
    { value: "developer", label: "Developer" },
    { value: "student", label: "Student" },
    { value: "mentor", label: "Mentor" },
    { value: "recruiter", label: "Recruiter" },
  ];

  // A single function to handle changes for all input fields.
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // This function runs when the registration form is submitted.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Destructure form data for easier access.
    const { fullName, email, password, confirmPassword, role } = formData;

    // --- Validation ---
    if (!fullName || !email || !password || !confirmPassword || !role) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    // --- Backend Simulation ---
    console.log("Form Submitted:", formData);
    toast.success("Registration successful! Please log in.");

    // Redirect to the login page after successful registration.
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      userCredential.user;
      navigate("/login");
    } catch (error) {
      console.log(error);
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      <Input id="fullName" label="Full Name" type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" required />
      <Input id="email" label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
      <Input id="phoneNumber" label="Phone Number" type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="(123) 456-7890" />
      <Select id="role" label="Role" name="role" value={formData.role} onChange={handleChange} placeholder="Select your role" options={roleOptions} required />
      <Input id="password" label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
      <Input id="confirmPassword" label="Confirm Password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" required />
      <button type="submit"
        className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors duration-300 font-bold mt-2"
        onClick={handleSignUp}>
        Register
      </button>
    </form>
  );
};

export default RegisterForm;


