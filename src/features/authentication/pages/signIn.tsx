import { useState } from 'react'
import useToast from '../../../core/hooks/useToast';
import { ToastContainer } from '../../../ui/components/Toast';
import { Input } from '../../../ui/components/forms/Input';
import { Button } from '../../../ui/components/forms/Button';
import appLogo from '../../../assets/images/appLogo.png'
import { authenticationService } from '../services/AuthenticationService';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '../../../core/utils';

export function SignIn() {

    const [mobileNumber, setMobileNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
    const [loading, setLoading] = useState(false)
    const [verified, setVerified] = useState(false)
    const { toasts, removeToast, showSuccess, showError, addToast } = useToast()

    // ✅ Send OTP
    const handleSendOTP = async () => {
        await runApiWithLoader(
            setLoading,
            async () => {

                if (mobileNumber.length !== 10) {
                    showError('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number')
                    return
                }

                try {
                    const response = await authenticationService.apicallIsValidMobileNumber(mobileNumber)

                    if (E.isRight(response)) {
                        showSuccess(
                            'OTP Sent',
                            response.right.SuccessMessage?.[0] || 'OTP has been sent to your mobile number'
                        )
                        setStep('otp')
                    } else {
                        showError('Failed', response.left.message?.[0] || 'Unable to send OTP')
                    }
                } catch (err: any) {
                    showError('Connection Error', err.message || 'Please try again later')
                }
            },
            undefined,
            (error: any) => {
                addToast({
                    type: 'error',
                    title: error.message || 'Failed to load data'
                })
            }
        ) // ✅ Properly closed
    }


    // ✅ Verify OTP
    const handleVerifyOTP = async () => {
        await runApiWithLoader(
            setLoading,
            async () => {

                if (otp.length !== 4) {
                    showError('Invalid OTP', 'Please enter a valid 4-digit OTP')
                    return
                }

                const response = await authenticationService.apicallIsValidOTP(mobileNumber, otp)

                if (E.isRight(response)) {

                    const employee = response.right.Data;

                    localStorage.setItem('EmployeeData', JSON.stringify(employee));

                    showSuccess('Login Successful', `Welcome, ${employee.FullName}`);

                    setVerified(true)

                    setTimeout(() => {
                        window.location.href = '/dashboard'
                    }, 1500)
                } else {
                    showError('Invalid OTP', response.left.message?.[0] || 'Invalid code')
                }

            },
            undefined,
            (error: any) => {
                addToast({
                    type: 'error',
                    title: error.message || 'Failed to load data'
                })
            }
        ) // ✅ Properly closed
    }

    // ✅ Resend OTP
    const handleResendOTP = async () => {

        await runApiWithLoader(
            setLoading,

            async () => {


                setOtp('')
                const response = await authenticationService.apicallIsValidMobileNumber(mobileNumber);

                if (E.isRight(response)) {
                    showSuccess('OTP Resent', response.right.SuccessMessage?.[0] || 'OTP resent successfully')
                } else {
                    showError('Failed', response.left.message?.[0])
                }

            },
            undefined,
            (error: any) => {
                addToast({
                    type: 'error',
                    title: error.message || 'Failed to load data'
                })
            }
        ) // ✅ Properly closed
    }

    return (
        <>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                    padding: '16px',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        maxWidth: '420px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '20px',
                        padding: '40px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                >
                    {step === 'mobile' ? (
                        <form onSubmit={(e) => { e.preventDefault(); handleSendOTP() }}>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <img
                                    src={appLogo}
                                    alt="App Logo"
                                    style={{ height: '80px', objectFit: 'contain', marginBottom: '16px' }}
                                />
                                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a' }}>Sign In</h1>
                            </div>

                            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '6px', display: 'block' }}>
                                Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                            </label>

                            <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50 focus-within:border-blue-500 focus-within:bg-white transition-colors">
                                <span className="px-3 py-3 text-gray-500 font-medium border-r border-gray-300">+91</span>
                                <input
                                    type="tel"
                                    placeholder="Enter mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    maxLength={10}
                                    required
                                    className="flex-1 px-3 py-3 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-400"
                                />
                            </div>

                            <Button
                                onClick={handleSendOTP}
                                type="submit"
                                disabled={loading || mobileNumber.length !== 10}
                                loading={loading}
                                loadingText="Sending..."
                                size="lg"
                                variant="solid"
                                color="primary"
                                fullWidth
                                style={{ marginTop: '20px' }}
                            >
                                Send OTP
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); handleVerifyOTP() }}>
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <img
                                    src={appLogo}
                                    alt="App Logo"
                                    style={{ height: '80px', objectFit: 'contain', marginBottom: '16px' }}
                                />
                                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a' }}>Verify OTP</h2>
                                <p style={{ color: '#6b7280', fontSize: '16px' }}>Sent to +91 {mobileNumber}</p>
                            </div>

                            <Input
                                type="text"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                                size="lg"
                                variant="filled"
                                style={{
                                    textAlign: 'center',
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    letterSpacing: '8px',
                                }}
                            />

                            <Button
                                onClick={handleVerifyOTP}
                                type="submit"
                                disabled={loading || verified || otp.length !== 4}
                                loading={loading}
                                loadingText="Verifying..."
                                size="lg"
                                variant="solid"
                                color="primary"
                                fullWidth
                                style={{ marginTop: '20px' }}
                            >
                                Verify OTP
                            </Button>

                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                                    Didn’t receive the code?
                                </p>
                                <Button
                                    onClick={handleResendOTP}
                                    disabled={loading}
                                    variant="link"
                                    color="primary"
                                    size="sm"
                                >
                                    Resend OTP
                                </Button>
                            </div>
                        </form>
                    )}

                    <div
                        style={{
                            marginTop: '40px',
                            textAlign: 'center',
                            paddingTop: '24px',
                            borderTop: '1px solid #e5e7eb',
                        }}
                    >
                        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
                            Need help? Contact our support
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', color: '#6b7280' }}>
                            <span>📧 support@k3tech.com</span>
                            <span>📞 +91 9975535595</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignIn
