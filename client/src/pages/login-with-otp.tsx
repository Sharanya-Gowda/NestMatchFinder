import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation, Link } from "wouter";
import Logo from "@/components/logo";
import { Mail, Phone, ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginWithOtp() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'method' | 'email' | 'phone' | 'otp'>('method');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOtp = () => {
    // Simulate OTP sending
    toast({
      title: "OTP Sent!",
      description: `Verification code sent to your ${loginMethod === 'email' ? 'email' : 'phone number'}`,
    });
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    // Simulate OTP verification
    if (otp === '123456') {
      toast({
        title: "Login Successful",
        description: "Welcome to NestMatch!",
      });
      setLocation('/dashboard/user');
    } else {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct verification code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="lg" showText={true} />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Login with OTP
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Quick and secure login to your account
          </p>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {step === 'method' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-center">Choose login method</h3>
                
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start"
                  onClick={() => {
                    setLoginMethod('email');
                    setStep('email');
                  }}
                >
                  <Mail className="mr-3 h-5 w-5" />
                  Continue with Email
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-12 justify-start"
                  onClick={() => {
                    setLoginMethod('phone');
                    setStep('phone');
                  }}
                >
                  <Phone className="mr-3 h-5 w-5" />
                  Continue with Phone
                </Button>
                
                <div className="text-center mt-6">
                  <Link href="/login">
                    <Button variant="link">Use password instead</Button>
                  </Link>
                </div>
              </div>
            )}

            {step === 'email' && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('method')}
                  className="mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                
                <Button onClick={handleSendOtp} className="w-full">
                  Send OTP
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 'phone' && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep('method')}
                  className="mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
                
                <Button onClick={handleSendOtp} className="w-full">
                  Send OTP
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 'otp' && (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(loginMethod)}
                  className="mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Enter the 6-digit code sent to {loginMethod === 'email' ? email : phone}
                  </p>
                  
                  <div>
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Demo: Use 123456 to login
                  </p>
                </div>
                
                <Button onClick={handleVerifyOtp} className="w-full">
                  Verify & Login
                </Button>
                
                <Button variant="link" className="w-full text-sm">
                  Resend OTP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}