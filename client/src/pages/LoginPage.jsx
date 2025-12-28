import React, { useContext, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/* Convert image to base64 */
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [mode, setMode] = useState("Login"); // Login | Sign up
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // 🔥 NEW

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
    bio: "",
    profileImage: null,
  });

  const resetForm = () => {
    setStep(1);
    setErrors({});
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
      bio: "",
      profileImage: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,
    }));

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ===== Step 1 Validation ===== */
  const validateStep1 = () => {
    let err = {};

    if (!formData.name.trim()) err.name = "Full name required";

    if (!formData.email.trim())
      err.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      err.email = "Invalid email";

    if (!formData.password)
      err.password = "Password required";
    else if (formData.password.length < 6)
      err.password = "Min 6 characters";

    if (formData.password !== formData.confirmPassword)
      err.confirmPassword = "Passwords do not match";

    if (!formData.terms)
      err.terms = "Accept terms & conditions";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ===== Step 2 Validation ===== */
  const validateStep2 = () => {
    let err = {};

    if (!formData.bio.trim()) err.bio = "Bio required";
    if (!formData.profileImage) err.profileImage = "Profile image required";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ===== SUBMIT HANDLER ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      /* LOGIN */
      if (mode === "Login") {
        await login("login", {
          email: formData.email,
          password: formData.password,
        });
        navigate("/");
        return;
      }

      /* SIGNUP STEP 1 */
      if (step === 1 && validateStep1()) {
        setStep(2);
        return;
      }

      /* SIGNUP STEP 2 */
      if (step === 2 && validateStep2()) {
        const imageBase64 = await toBase64(formData.profileImage);

        await login("signup", {
          userName: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          profilePic: imageBase64,
        });

        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gap-8 backdrop-blur-2xl max-sm:flex-col">
      <img src={assets.logo_big} alt="logo" className="w-[min(30vw,250px)]" />

      <form
        onSubmit={handleSubmit}
        className="bg-white/10 border border-gray-500 text-white p-6 rounded-lg w-[90%] max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-medium text-center">
          {mode === "Login"
            ? "Login"
            : step === 1
            ? "Sign up – Step 1"
            : "Sign up – Step 2"}
        </h2>

        {/* ===== LOGIN ===== */}
        {mode === "Login" && (
          <>
            <input
              className="input"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <input
              className="input"
              placeholder="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />

            <button
              className={`btn ${loading && "opacity-60 cursor-not-allowed"}`}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </>
        )}

        {/* ===== SIGNUP STEP 1 ===== */}
        {mode === "Sign up" && step === 1 && (
          <>
            <input
              className="input"
              placeholder="Full Name"
              name="name"
              onChange={handleChange}
            />
            {errors.name && <p className="error">{errors.name}</p>}

            <input
              className="input"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
            {errors.email && <p className="error">{errors.email}</p>}

            <div className="relative">
              <input
                className="input pr-14"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                onChange={handleChange}
              />
              <button
                type="button"
                className="show-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}

            <input
              className="input"
              placeholder="Confirm Password"
              type="password"
              name="confirmPassword"
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <p className="error">{errors.confirmPassword}</p>
            )}

            <div className="flex gap-2 text-sm">
              <input type="checkbox" name="terms" onChange={handleChange} />
              <span>I agree to Terms & Conditions</span>
            </div>
            {errors.terms && <p className="error">{errors.terms}</p>}

            <button
              className={`btn ${loading && "opacity-60 cursor-not-allowed"}`}
              disabled={loading}
            >
              Next
            </button>
          </>
        )}

        {/* ===== SIGNUP STEP 2 ===== */}
        {mode === "Sign up" && step === 2 && (
          <>
            <textarea
              className="input resize-none"
              rows="3"
              placeholder="Your bio"
              name="bio"
              onChange={handleChange}
            />
            {errors.bio && <p className="error">{errors.bio}</p>}

            <div className="flex flex-col items-center gap-2">
              <img
                src={
                  formData.profileImage
                    ? URL.createObjectURL(formData.profileImage)
                    : assets.avatar_icon
                }
                className="w-24 h-24 rounded-full object-cover border"
              />
              <input
                type="file"
                accept="image/*"
                name="profileImage"
                onChange={handleChange}
                className="text-sm"
              />
            </div>
            {errors.profileImage && (
              <p className="error">{errors.profileImage}</p>
            )}

            <button
              className={`btn ${loading && "opacity-60 cursor-not-allowed"}`}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </>
        )}

        {/* SWITCH MODE */}
        <p className="text-sm text-center text-gray-300">
          {mode === "Login"
            ? "Don't have an account?"
            : "Already have an account?"}{" "}
          <span
            className="text-violet-400 cursor-pointer"
            onClick={() => {
              setMode(mode === "Login" ? "Sign up" : "Login");
              resetForm();
            }}
          >
            {mode === "Login" ? "Sign up" : "Login"}
          </span>
        </p>
      </form>

      {/* Styles */}
      <style>{`
        .input {
          width: 100%;
          padding: 10px;
          border: 1px solid #6b7280;
          border-radius: 6px;
          background: transparent;
          color: white;
        }
        .error {
          font-size: 12px;
          color: #f87171;
        }
        .btn {
          background: #7c3aed;
          padding: 10px;
          border-radius: 6px;
          font-weight: 500;
        }
        .show-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
