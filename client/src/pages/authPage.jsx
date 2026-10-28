import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../components/common/loading';
import { useAuth } from '../context/context';
import api from '../config/api';

const InputField = ({ label, value, placeholder, type = 'text', onChange, required = true, icon = null }) => (
    <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className={`auth-input ${icon ? 'pl-10' : ''}`}
            />
            {icon && (
                <div className="absolute left-3.5 top-3.5 text-slate-400 pointer-events-none">
                    {icon}
                </div>
            )}
        </div>
    </div>
);

export default function AuthPage() {
    const [isSignIn, setIsSignIn] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        rememberMe: true,
    });

    // Forgot Password Flow States
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Send OTP, 2: Verify OTP & Reset Password
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);

    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignIn) {
                await login(formData.email, formData.password);
                toast.success('Welcome back! Signed in successfully.');
            } else {
                await register(formData.name, formData.email, formData.password);
                toast.success('Account created successfully! Check your email for welcome info.');
            }
            navigate('/');
        } catch (error) {
            const msg =
                error.response?.data?.message || 'Authentication failed. Please check your credentials.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password: Request OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!forgotEmail || !forgotEmail.trim()) {
            toast.error('Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/api/auth/forgot-password', { email: forgotEmail.trim() });
            toast.success(res.data?.message || 'Verification code sent to your email! 📩');
            setForgotStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password: Verify OTP & Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp || otp.trim().length !== 6) {
            toast.error('Please enter the 6-digit verification code');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            toast.error('New password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/api/auth/reset-password', {
                email: forgotEmail.trim(),
                otp: otp.trim(),
                newPassword,
            });
            toast.success(res.data?.message || 'Password reset successfully! Please sign in.');
            setFormData((prev) => ({ ...prev, email: forgotEmail.trim(), password: '' }));
            setIsForgotPassword(false);
            setForgotStep(1);
            setOtp('');
            setNewPassword('');
            setConfirmPassword('');
            setIsSignIn(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full bg-white min-h-screen lg:h-screen rounded-none sm:rounded-[38px] overflow-y-auto lg:overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-160 lg:min-h-180">
            {/* Left Column - Branding Banner */}
            <div className="hidden lg:flex relative lg:col-span-6 p-2 sm:p-3 flex-col">
                <div className="relative size-full rounded-[26px] sm:rounded-4xl overflow-hidden flex flex-col justify-between p-8 sm:p-12 text-white bg-black">
                    <img
                        src="/login_ribbon.png"
                        alt="Fluid Neon Art"
                        className="absolute inset-0 size-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/60 to-black" />
                    <div className="relative z-10 mt-auto pt-24 sm:pt-32">
                        <h2 className="text-4xl sm:text-5xl lg:text-5xl font-medium ">ImageCloud</h2>
                        <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm mt-4 sm:mt-5">
                            Safely store and organize your HD photos and videos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="lg:col-span-6 bg-white px-6 py-8 sm:px-12 sm:py-14 lg:px-16 lg:py-16 flex flex-col justify-between min-h-screen lg:min-h-0">
                <div className="hidden lg:block" />

                <div className="max-w-md w-full mx-auto my-auto py-2">
                    <div className="flex flex-col items-center text-center mb-8">
                        <img
                            src="/logo.png"
                            alt="ImageCloud Logo"
                            className="size-14 sm:size-16 object-contain mb-3 sm:mb-4"
                        />

                        {isForgotPassword ? (
                            <>
                                <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 font-normal tracking-tight">
                                    {forgotStep === 1 ? 'Reset Password' : 'Enter Verification Code'}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm">
                                    {forgotStep === 1
                                        ? 'Enter your registered email address to receive a 6-digit verification code.'
                                        : `We sent a 6-digit code to ${forgotEmail}. Enter it below along with your new password.`}
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 font-normal tracking-tight">
                                    {isSignIn ? 'Welcome Back' : 'Create Account'}
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 mt-2">
                                    {isSignIn
                                        ? 'Enter your email and password to access your photo library'
                                        : 'Join ImageCloud to organize your albums'}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Forgot Password View */}
                    {isForgotPassword ? (
                        forgotStep === 1 ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <InputField
                                    key="forgot-email"
                                    label="Registered Email"
                                    type="email"
                                    value={forgotEmail}
                                    placeholder="Enter your registered email"
                                    onChange={setForgotEmail}
                                    icon={<Mail className="size-4" />}
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="auth-btn-primary"
                                >
                                    {loading ? (
                                        <Loading inline size="xs" />
                                    ) : (
                                        <span>Send Verification Code</span>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(false);
                                        setForgotStep(1);
                                    }}
                                    className="w-full text-center text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-medium py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <ArrowLeft className="size-3.5" />
                                    <span>Back to Sign In</span>
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                        6-Digit Verification Code (OTP)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="123456"
                                            required
                                            className="auth-input text-center text-xl tracking-[6px] font-mono font-semibold"
                                        />
                                        <KeyRound className="size-4 absolute left-3.5 top-3.5 text-slate-400" />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1 text-center">
                                        Code expires in 10 minutes
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter at least 6 characters"
                                            required
                                            className="auth-input pr-11"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword((prev) => !prev)}
                                            className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your new password"
                                        required
                                        className="auth-input"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="auth-btn-primary"
                                >
                                    {loading ? (
                                        <Loading inline size="xs" />
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            <ShieldCheck className="size-4 text-emerald-400" />
                                            Reset Password
                                        </span>
                                    )}
                                </button>

                                <div className="flex items-center justify-between text-xs pt-1">
                                    <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={loading}
                                        className="text-red-600 hover:underline font-medium cursor-pointer"
                                    >
                                        Resend Code
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsForgotPassword(false);
                                            setForgotStep(1);
                                        }}
                                        className="text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                                    >
                                        Back to Sign In
                                    </button>
                                </div>
                            </form>
                        )
                    ) : (
                        /* Normal Login / Register Form */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isSignIn && (
                                <InputField
                                    key="name"
                                    label="Full Name"
                                    value={formData.name}
                                    placeholder="Enter your name"
                                    onChange={(val) => handleChange('name', val)}
                                />
                            )}

                            <InputField
                                key="email"
                                label="Email"
                                type="email"
                                value={formData.email}
                                placeholder="Enter your email"
                                onChange={(val) => handleChange('email', val)}
                            />

                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        className="auth-input pr-11"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="size-4" />
                                        ) : (
                                            <Eye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-0.5">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={formData.rememberMe}
                                        onChange={(e) => handleChange('rememberMe', e.target.checked)}
                                        className="size-4 rounded border-slate-300 accent-slate-900"
                                    />
                                    <span className="text-slate-600">Remember me</span>
                                </label>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsForgotPassword(true);
                                        setForgotStep(1);
                                        setForgotEmail(formData.email || '');
                                    }}
                                    className="text-slate-700 hover:text-slate-950 hover:underline transition cursor-pointer"
                                >
                                    Forgot Password
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-btn-primary"
                            >
                                {loading ? (
                                    <Loading inline size="xs" />
                                ) : isSignIn ? (
                                    'Sign In'
                                ) : (
                                    'Sign Up'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {!isForgotPassword && (
                    <div className="mt-8 text-xs sm:text-sm text-center text-slate-600">
                        {isSignIn ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => setIsSignIn((prev) => !prev)}
                            className="font-medium text-slate-900 hover:underline cursor-pointer"
                        >
                            {isSignIn ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
