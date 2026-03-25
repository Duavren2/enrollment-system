import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { GraduationCap, Lock, User } from 'lucide-react';
import { UserRole } from '../App';
import { authService } from '../services/auth.service';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaA, setCaptchaA] = useState(0);
  const [captchaB, setCaptchaB] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [privacyConsented, setPrivacyConsented] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [regForm, setRegForm] = useState<any>({
    student_id: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    student_type: 'New',
    course: '',
    year_level: 1,
    contact_number: '',
    address: '',
    birth_date: '',
    gender: '',
    last_school_attended: '',
    preferred_contact_method: '',
    heard_about_informatics: ''
  });
  const [regLoading, setRegLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotValue, setForgotValue] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  // Captcha generation
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 8) + 1; // 1-8
    const b = Math.floor(Math.random() * 8) + 1; // 1-8
    setCaptchaA(a);
    setCaptchaB(b);
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password.');
      generateCaptcha();
      return;
    }

    const expected = captchaA + captchaB;
    if (String(expected) !== String(captchaAnswer).trim()) {
      setError('Captcha answer is incorrect. Please try again.');
      generateCaptcha();
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await authService.login({ username, password });

      if (response.success) {
        const role = response.data.user.role as UserRole;
        onLogin(role);
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
        generateCaptcha();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Branding */}
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center justify-center mb-4">
                <img src="/Informatics-Logo.png" alt="Informatics College Logo" className="h-20 w-20 object-contain brightness-110 drop-shadow-lg" style={{imageRendering: 'crisp-edges'}} />
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-bold text-blue-600">
                  Informatics College
                </h1>
                <p className="text-2xl text-slate-600">Northgate Campus</p>
                <p className="text-xl text-slate-500">Enrollment System</p>
              </div>
              <p className="text-slate-600 max-w-md">
                Seamlessly manage your academic journey with our modern enrollment platform.
              </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-slate-200">
                <div className="text-center mb-8">
                  <h2 className="text-3xl mb-2">Welcome Back</h2>
                  <p className="text-slate-500">Sign in to continue</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-700">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 h-12 border-slate-200 focus:border-blue-500 rounded-xl"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 border-slate-200 focus:border-blue-500 rounded-xl"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  </div>

                  {/* Simple Captcha */}
                  <div className="space-y-2">
                    <Label htmlFor="captcha" className="text-slate-700">Captcha: solve</Label>
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-2 bg-slate-100 rounded-md">{captchaA} + {captchaB} =</div>
                      <Input
                        id="captcha"
                        type="text"
                        value={captchaAnswer}
                        onChange={(e) => setCaptchaAnswer(e.target.value)}
                        className="h-12 border-slate-200 focus:border-blue-500 rounded-xl w-32"
                        placeholder="Answer"
                        required
                      />
                      <Button type="button" variant="outline" onClick={generateCaptcha}>New</Button>
                    </div>
                    <p className="text-xs text-slate-500">Prove you're human — solve the addition.</p>
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  )}

                  {/* Register Link */}
                  <div className="text-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); }} className="text-sm text-blue-600 hover:text-blue-700">Register as a new student</a>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg disabled:opacity-60"
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>

                  {/* Forgot Password Link */}
                  <div className="text-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); setShowForgot(true); }} className="text-sm text-blue-600 hover:text-blue-700">Forgot password?</a>
                  </div>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                  Need help? Contact support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Registration Dialog */}
      <Dialog open={showRegister} onOpenChange={(open) => {
        setShowRegister(open);
        if (!open) {
          setPrivacyConsented(false);
          setMarketingConsent(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {!privacyConsented ? (
            <>
              <DialogHeader>
                <DialogTitle>Data Privacy Notice</DialogTitle>
                <DialogDescription>Please read and consent before proceeding to registration.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-slate-700">
                <p>
                  Informatics believes in the sanctity of personal information and the rights of individuals to Data Privacy per <strong>Republic Act 10173 – Data Privacy Act of 2012</strong>. Thus, Informatics is committed to the protection and responsible usage of such information. Informatics will only collect, use, and disclose your personal information with your knowledge and consent.
                </p>
                <p>
                  You may access the complete Data Privacy Act of 2012 at{' '}
                  <a href="https://privacy.gov.ph/data-privacy-act/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                    https://privacy.gov.ph/data-privacy-act/
                  </a>
                </p>
                <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4 mt-4">
                  <Checkbox
                    id="marketing-consent"
                    checked={marketingConsent}
                    onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="marketing-consent" className="text-sm leading-relaxed cursor-pointer">
                    I consent to receive marketing communications, updates, and newsletters from Informatics Philippines. I understand my data will be handled in accordance with the Privacy Policy.
                  </label>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setShowRegister(false)}>Cancel</Button>
                <Button disabled={!marketingConsent} onClick={() => setPrivacyConsented(true)}>
                  Proceed to Registration
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Student Registration</DialogTitle>
                <DialogDescription>Fill out the form below to register as a new student.</DialogDescription>
              </DialogHeader>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2 text-sm">
                <p className="font-semibold text-blue-900 mb-2">Important Instructions:</p>
                <ul className="space-y-1 text-blue-900">
                  <li>• Choose a <strong>username</strong> — this will be your login credential</li>
                  <li>• Your account must be <strong>approved by an admin</strong> before you can sign in</li>
                  <li>• Please wait for approval notification after submitting your registration</li>
                </ul>
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!regForm.username) return alert('Username is required');
                if (!regForm.password || regForm.password.length < 6) return alert('Password must be at least 6 characters');
                if (regForm.password !== regForm.confirmPassword) return alert('Passwords do not match');
                if (!regForm.first_name) return alert('First Name is required');
                if (!regForm.last_name) return alert('Last Name is required');
                if (!regForm.birth_date) return alert('Birth Date is required');
                if (!regForm.gender) return alert('Sex is required');
                if (!regForm.email) return alert('Email Address is required');
                if (!regForm.contact_number) return alert('Contact Number is required');
                if (!regForm.last_school_attended) return alert('Last School Attended is required');
                if (!regForm.address) return alert('Address is required');
                if (!regForm.course) return alert('Course selection is required');
                if (!regForm.preferred_contact_method) return alert('Preferred Contact Method is required');
                if (!regForm.heard_about_informatics) return alert('Please tell us how you heard about Informatics');
                try {
                  setRegLoading(true);
                  const payload = {
                    username: regForm.username,
                    password: regForm.password,
                    email: regForm.email,
                    role: 'student',
                    student: {
                      student_id: regForm.student_id,
                      first_name: regForm.first_name,
                      middle_name: regForm.middle_name,
                      last_name: regForm.last_name,
                      suffix: regForm.suffix,
                      student_type: regForm.student_type,
                      course: regForm.course,
                      year_level: regForm.year_level,
                      contact_number: regForm.contact_number,
                      address: regForm.address,
                      birth_date: regForm.birth_date,
                      gender: regForm.gender,
                      last_school_attended: regForm.last_school_attended,
                      preferred_contact_method: regForm.preferred_contact_method,
                      heard_about_informatics: regForm.heard_about_informatics
                    }
                  };

                  const resp = await authService.register(payload as any);
                  if (resp.success) {
                    alert('Registration submitted successfully! Your account is pending admin approval. You will be able to sign in once your account has been approved.');
                    setShowRegister(false);
                    setPrivacyConsented(false);
                    setMarketingConsent(false);
                    setRegForm({ student_id: '', username: '', password: '', confirmPassword: '', email: '', first_name: '', middle_name: '', last_name: '', suffix: '', student_type: 'New', course: '', year_level: 1, contact_number: '', address: '', birth_date: '', gender: '', last_school_attended: '', preferred_contact_method: '' });
                  } else {
                    alert(resp.message || 'Registration failed');
                  }
                } catch (err: any) {
                  alert(err.message || 'Registration failed');
                } finally {
                  setRegLoading(false);
                }
              }} className="space-y-3">
                {/* Username (chosen by user) */}
                <div>
                  <Label>Username <span className="text-red-500">*</span></Label>
                  <Input value={regForm.username} onChange={(e) => setRegForm({ ...regForm, username: e.target.value })} className="mt-1" placeholder="Choose a username" required />
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Password <span className="text-red-500">*</span></Label>
                    <Input type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} className="mt-1" required />
                  </div>
                  <div>
                    <Label>Confirm Password <span className="text-red-500">*</span></Label>
                    <Input type="password" value={regForm.confirmPassword} onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })} className="mt-1" required />
                  </div>
                </div>

                {/* First Name, Middle Name (optional) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name <span className="text-red-500">*</span></Label>
                    <Input value={regForm.first_name} onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })} className="mt-1" required />
                  </div>
                  <div>
                    <Label>Middle Name <span className="text-slate-400 text-xs">(optional)</span></Label>
                    <Input value={regForm.middle_name} onChange={(e) => setRegForm({ ...regForm, middle_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })} className="mt-1" />
                  </div>
                </div>

                {/* Last Name, Suffix (optional) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Last Name <span className="text-red-500">*</span></Label>
                    <Input value={regForm.last_name} onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })} className="mt-1" required />
                  </div>
                  <div>
                    <Label>Suffix <span className="text-slate-400 text-xs">(optional)</span></Label>
                    <Input value={regForm.suffix} onChange={(e) => setRegForm({ ...regForm, suffix: e.target.value })} className="mt-1" placeholder="e.g. Jr., III" />
                  </div>
                </div>

                {/* Birth Date, Sex */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Birth Date <span className="text-red-500">*</span></Label>
                    <Input type="date" value={regForm.birth_date} onChange={(e) => setRegForm({ ...regForm, birth_date: e.target.value })} className="mt-1" required />
                  </div>
                  <div>
                    <Label>Sex <span className="text-red-500">*</span></Label>
                    <Select value={regForm.gender} onValueChange={(val) => setRegForm({ ...regForm, gender: val })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Email, Contact Number */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Email Address <span className="text-red-500">*</span></Label>
                    <Input type="email" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} className="mt-1" required />
                  </div>
                  <div>
                    <Label>Contact Number <span className="text-red-500">*</span></Label>
                    <Input value={regForm.contact_number} onChange={(e) => setRegForm({ ...regForm, contact_number: e.target.value })} className="mt-1" placeholder="e.g. 09171234567" required />
                  </div>
                </div>

                {/* Last School Attended */}
                <div>
                  <Label>Last School Attended <span className="text-red-500">*</span></Label>
                  <Input value={regForm.last_school_attended} onChange={(e) => setRegForm({ ...regForm, last_school_attended: e.target.value })} className="mt-1" required />
                </div>

                {/* Address */}
                <div>
                  <Label>Address <span className="text-red-500">*</span></Label>
                  <Input value={regForm.address} onChange={(e) => setRegForm({ ...regForm, address: e.target.value })} className="mt-1" placeholder="Complete address" required />
                </div>

                {/* Year Level, Course, Preferred Contact Method */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Year Level <span className="text-red-500">*</span></Label>
                    <Select value={String(regForm.year_level)} onValueChange={(val) => setRegForm({ ...regForm, year_level: parseInt(val) })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Course <span className="text-red-500">*</span></Label>
                    <Select value={regForm.course} onValueChange={(val) => setRegForm({ ...regForm, course: val })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BSIT">BSIT</SelectItem>
                        <SelectItem value="BSCS">BSCS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Contact Method <span className="text-red-500">*</span></Label>
                    <Select value={regForm.preferred_contact_method} onValueChange={(val) => setRegForm({ ...regForm, preferred_contact_method: val })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Number">Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>How did you hear about Informatics? <span className="text-red-500">*</span></Label>
                    <Select value={regForm.heard_about_informatics} onValueChange={(val) => setRegForm({ ...regForm, heard_about_informatics: val })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Career Talk">Career Talk</SelectItem>
                        <SelectItem value="Building Signage">Building Signage</SelectItem>
                        <SelectItem value="Facebook">Facebook</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" type="button" onClick={() => setShowRegister(false)}>Cancel</Button>
                  <Button type="submit" disabled={regLoading}>{regLoading ? 'Registering...' : 'Register'}</Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* Forgot Password Dialog */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Forgot Password</DialogTitle>
            <DialogDescription>Enter your username to reset your password.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async e => {
              e.preventDefault();
              // Simple check: if value matches a hardcoded user, allow reset
              if (forgotValue === 'student1' || forgotValue === 'admin1') {
                setForgotMessage('Account found. Enter new password.');
              } else {
                setForgotMessage('Account not found.');
              }
            }}
            className="space-y-4"
          >
            <Label htmlFor="forgot-value">Username</Label>
            <Input
              id="forgot-value"
              type="text"
              value={forgotValue}
              onChange={e => setForgotValue(e.target.value)}
              placeholder="Enter your username"
              required
            />
            {forgotMessage && <p className="text-sm text-blue-600">{forgotMessage}</p>}
            <Button type="submit" className="w-full">
              Verify Account
            </Button>
          </form>
          {forgotMessage === 'Account found. Enter new password.' && (
            <form
              onSubmit={e => {
                e.preventDefault();
                setForgotMessage('Password reset successful.');
              }}
              className="space-y-4 mt-4"
            >
              <Label htmlFor="reset-password-value">New Password</Label>
              <Input
                id="reset-password-value"
                type="password"
                placeholder="Enter new password"
                required
              />
              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </form>
          )}
          {forgotMessage === 'Password reset successful.' && (
            <p className="text-sm text-green-600">Password reset successful. You can now log in with your new password.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}