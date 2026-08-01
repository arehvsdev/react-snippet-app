import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Input } from "../ui/UI";
import { loginUser, verifyEmail, resetPassword } from "../../services/authService";
import { useAuth } from "../../layouts/AuthContext";

const LoginForm = () => {
  const { login } = useAuth();

  // We use the 'useState' hook to manage the form's data.
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Reset password states
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: verify email, 2: change password
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

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

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setErrors({ email: "Email is required" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
      setErrors({ email: "Enter a valid email" });
      return;
    }
    setErrors({});
    try {
      toast.loading("Verifying email...", { id: "verify-email" });
      await verifyEmail(resetEmail);
      toast.success("Email verified! Please enter your new password.", { id: "verify-email" });
      setResetStep(2);
    } catch (err: any) {
      toast.error(err.message || "Failed to verify email", { id: "verify-email" });
      setErrors({ email: err.message || "Email is not registered." });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { password?: string; confirmPassword?: string } = {};
    if (!newPassword) {
      newErrors.password = "Password is required.";
    } else {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        newErrors.password = "Password must be at least 8 characters, and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#).";
      }
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      toast.loading("Resetting password...", { id: "reset-password" });
      await resetPassword(resetEmail, newPassword);
      toast.success("Password reset successful! Please login with your new password.", { id: "reset-password" });
      setIsResetMode(false);
      setResetStep(1);
      setResetEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password", { id: "reset-password" });
    }
  };

  if (isResetMode) {
    if (resetStep === 1) {
      return (
        <form onSubmit={handleVerifyEmail} autoComplete="off">
          <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
          <p className="text-xs text-gray-400 mb-4">Enter your registered email address to verify your account.</p>
          <Input
            id="resetEmail"
            label="Email Address"
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="you@example.com"
            required
            error={errors.email}
          />
          <button
            type="submit"
            className="w-full bg-[#2563eb] text-white p-3 rounded-md hover:bg-[#1d4ed8] transition-colors duration-300 font-bold mt-2"
          >
            Verify Email
          </button>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setIsResetMode(false);
                setResetStep(1);
                setErrors({});
              }}
              className="text-xs text-gray-400 hover:text-white hover:underline"
            >
              Back to Login
            </button>
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={handleResetPassword} autoComplete="off">
        <h3 className="text-lg font-bold text-white mb-2">Change Password</h3>
        <p className="text-xs text-green-400 mb-4 font-semibold">Email verified: {resetEmail}</p>
        <Input
          id="newPassword"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
          error={errors.password}
        />
        <Input
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          error={errors.confirmPassword}
        />
        <button
          type="submit"
          className="w-full bg-[#2563eb] text-white p-3 rounded-md hover:bg-[#1d4ed8] transition-colors duration-300 font-bold mt-2"
        >
          Change Password
        </button>
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsResetMode(false);
              setResetStep(1);
              setErrors({});
            }}
            className="text-xs text-gray-400 hover:text-white hover:underline"
          >
            Cancel and Back to Login
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleLogin}>
      <Input id="email" label="Email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
      <Input id="password" label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required />
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => {
            setIsResetMode(true);
            setResetStep(1);
            setErrors({});
          }}
          className="text-xs text-blue-400 hover:underline font-semibold"
        >
          Forgot password?
        </button>
      </div>
      <button type="submit" className="w-full bg-[#2563eb] text-white p-3 rounded-md hover:bg-[#1d4ed8] transition-colors duration-300 font-bold mt-2">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
