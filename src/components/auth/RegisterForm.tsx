import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Input, Select } from "../ui/UI";
import { registerUser, checkUsernameAvailability } from "../../services/authService";

const RegisterForm = () => {
  const navigate = useNavigate();

  // State to hold all the form data for registration.
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phoneNumber: "",
    role: "student",
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

  // Per-field validation messages
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "fullName":
        if (!value.trim()) return "Full name is required.";
        return "";
      case "username":
        if (!value.trim()) return "Username is required.";
        if (value.trim().length < 3) return "Username must be at least 3 characters.";
        if (!/^[a-zA-Z0-9_]+$/.test(value))
          return "Username can only contain letters, numbers, and underscores.";
        return "";
      case "email":
        if (!value.trim()) return "Email is required.";
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
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#\._-]).{8,}$/;
        if (!passwordRegex.test(value)) {
          return "Password must be at least 8 characters, and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#.).";
        }
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password.";
        if (value !== formData.password) return "Passwords do not match.";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = async (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));

    if (name === "username" && !fieldError && value.trim().length >= 3) {
      const isAvailable = await checkUsernameAvailability(value);
      if (!isAvailable) {
        setErrors((prev) => ({ ...prev, username: "Username is already taken." }));
      }
    }
  };

  // This function runs when the registration form is submitted.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Destructure form data for easier access.
    const { fullName, username, email, password, role, phoneNumber } = formData;

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
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, username: "Username is already taken." }));
        toast.error("Username is already taken.");
        return;
      }

      await registerUser({ fullName, username, email, password, phoneNumber, role });
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
    <form onSubmit={handleSubmit} autoComplete="off">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0">
        {/* Row 1: Full Name & Username */}
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
          autoComplete="off"
        />
        <Input
          id="username"
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleFieldChange}
          placeholder="johndoe"
          required
          error={errors.username}
          autoComplete="off"
        />

        {/* Row 2: Email (Single Full Line) */}
        <div className="sm:col-span-2">
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
            autoComplete="off"
          />
        </div>

        {/* Row 3: Role & Phone */}
        <Select
          id="role"
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleFieldChange}
          options={roleOptions}
          required
          error={errors.role}
        />
        <Input
          id="phoneNumber"
          label="Phone Number"
          type="tel"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleFieldChange}
          placeholder="+1234567890"
          error={errors.phoneNumber}
          autoComplete="off"
        />

        {/* Row 4: Password (Single Full Line) */}
        <div className="sm:col-span-2">
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
            autoComplete="new-password"
          />
        </div>

        {/* Row 5: Confirm Password (Single Full Line) */}
        <div className="sm:col-span-2">
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
            autoComplete="new-password"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-[#2563eb] text-white p-3 rounded-md hover:bg-[#1d4ed8] transition-colors duration-300 font-bold mt-2 cursor-pointer"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;
