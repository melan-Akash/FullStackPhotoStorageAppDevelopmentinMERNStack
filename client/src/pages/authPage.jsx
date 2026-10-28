import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../components/common/loading';
import { useAuth } from '../context/context';

const InputField = ({ label, value, placeholder, type = 'text', onChange, required = true }) => (
    <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="auth-input"
        />
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
                toast.success('Account created successfully!');
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

    return (
        <div className="w-full bg-white h-screen rounded-[30px] sm:rounded-[38px] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-160 lg:min-h-180">
            {/* Left Column - Branding Banner */}
            <div className="relative lg:col-span-6 p-2 sm:p-3 flex flex-col">
                <div className="relative size-full rounded-[26px] sm:rounded-4xl overflow-hidden flex flex-col justify-between p-8 sm:p-12 text-white bg-black">
                    <img
                        src="/login_ribbon.png"
                        alt="Fluid Neon Art"
                        className="absolute inset-0 size-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/60 to-black" />
                    <div className="relative z-10 mt-auto pt-24 sm:pt-32">
                        <h2 className="text-4xl sm:text-5xl lg:text-5xl font-medium ">MY Photos</h2>
                        <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-sm mt-4 sm:mt-5">
                            Safely store and organize your HD photos and videos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Auth Form */}
            <div className="lg:col-span-6 bg-white px-8 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16 flex flex-col justify-between">
                <img
                    src="/logo.png"
                    alt="App Logo"
                    className="h-16 xl:h-20 xl:mt-10 w-auto object-contain self-start"
                />

                <div className="max-w-md w-full mx-auto my-auto py-2">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 font-normal tracking-tight">
                            {isSignIn ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-2">
                            {isSignIn
                                ? 'Enter your email and password to access your photo library'
                                : 'Join My photos to organize your albums'}
                        </p>
                    </div>

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
                </div>

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
            </div>
        </div>
    );
}

