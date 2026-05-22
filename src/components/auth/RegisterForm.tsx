import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Input, Select } from "../ui/UI";
import { registerUser } from "../../services/authService";

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

  // (legacy) single handler removed in favor of `handleFieldChange` below.

  // Per-field validation messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required.";
        return "";
      case "email":
        if (!value.trim()) return "Email is required.";
        // simple email check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Enter a valid email.";
        return "";
      case "phoneNumber":
        if (!value) return "";
        if (!/^[0-9 ()+-]{7,20}$/.test(value))
          return "Enter a valid phone number.";
        return "";
      case "role":
        if (!value) return "Please select a role.";
        return "";
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 6) return "Password must be at least 6 characters.";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password.";
        if (value !== formData.password) return "Passwords do not match.";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  // This function runs when the registration form is submitted.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Destructure form data for easier access.
    const { fullName, email, password, role, phoneNumber } = formData;

    // Run validations for all fields
    const newErrors: Record<string, string> = {};
    Object.entries(formData).forEach(([key, val]) => {
      const msg = validateField(key, String(val));
      if (msg) newErrors[key] = msg;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the highlighted errors.");
      return;
    }

    try {
      await registerUser({ fullName, email, password, phoneNumber, role });
      toast.success("Registration successful! Please log in.");
      // Redirect to the login page after successful registration.
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : (typeof error === 'string' ? error : 'Failed to register.');
      toast.error(msg);
      console.error("Registration error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        id="fullName"
        label="Full Name"
        type="text"
        name="fullName"
        value={formData.fullName}
        onChange={handleFieldChange}
        placeholder="John Doe"
        required
        error={errors.fullName}
      />
      <Input
        id="email"
        label="Email"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleFieldChange}
        placeholder="you@example.com"
        required
        error={errors.email}
      />
      <Input
        id="phoneNumber"
        label="Phone Number"
        type="text"
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={handleFieldChange}
        placeholder="(123) 456-7890"
        error={errors.phoneNumber}
      />
      <Select
        id="role"
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleFieldChange}
        placeholder="Select your role"
        options={roleOptions}
        required
        error={errors.role}
      />
      <Input
        id="password"
        label="Password"
        type="password"
        name="password"
        value={formData.password}
        onChange={handleFieldChange}
        placeholder="••••••••"
        required
        error={errors.password}
      />
      <Input
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleFieldChange}
        placeholder="••••••••"
        required
        error={errors.confirmPassword}
      />
      <button
        type="submit"
        className="w-full bg-[#2563eb] text-white p-3 rounded-md hover:bg-[#1d4ed8] transition-colors duration-300 font-bold mt-2"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
