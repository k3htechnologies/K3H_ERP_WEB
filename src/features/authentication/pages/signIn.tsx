import { useState } from 'react'
import useToast from '@/core/hooks/useToast';
import { ToastContainer } from '@/ui/components/Toast';
import { Input } from '@/ui/components/forms/Input';
import { Button } from '@/ui/components/forms/Button';
import appLogo from '@/assets/images/appLogo.png'
import { authenticationService } from '@/features/authentication/services/AuthenticationService';
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from '@/core/utils';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper'
import { Loader } from '@/core/utils/loader';
import { useNavigate } from 'react-router-dom';

export function SignIn() {

    const [mobileNumber, setMobileNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const [isVerified, setIsVerified] = useState(false)
    const { toasts, removeToast, showSuccess, showError, addToast } = useToast()
    const navigate = useNavigate();
    
    //#region  SEND OTP
    const handleSendOTP = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                if (mobileNumber.length !== 10) {
                    showError('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number')
                    return
                }

                try {
                    const response = await authenticationService.apicallIsValidMobileNumber(mobileNumber)

                    if (E.isRight(response)) {

                        showSuccess('OTP Sent', response.right.SuccessMessage?.[0]);

                        setStep('otp');

                    } else {

                        showError('Failed', response.left.message);

                    }
                } catch (err: any) {

                    showError('Connection Error', err.message);

                }
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Send OTP...'
        ) // ✅ Properly closed
    }
    //#endregion

    //#region VERIFY OTP
    const handleVerifyOTP = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                if (otp.length !== 4) {
                    showError('Invalid OTP', 'Please enter a valid 4-digit OTP')
                    return
                }

                const response = await authenticationService.apicallIsValidOTP(mobileNumber, otp)

                if (E.isRight(response)) {

                    const employeeData = response.right.Data;

                    // ============================================================================
                    // ✅ STORE EMPLOYEE DATA INTO LOCAL STORAGE
                    // ============================================================================

                    LocalStorageHelper.storeEmployeeData(employeeData);

                    showSuccess('Login Successful', `Welcome, ${employeeData[0].FullName}`);

                    setIsVerified(true)

                    navigate('/dashboard');
                } else {
                    showError('Invalid OTP', response.left.message)
                }

            },
            undefined,
            (error: any) => {

                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Verify OTP...'
        ) // ✅ Properly closed
    }
    //#endregion

    //#region RESEND OTP
    const handleResendOTP = async () => {

        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {


                setOtp('');

                const response = await authenticationService.apicallIsValidMobileNumber(mobileNumber);

                if (E.isRight(response)) {

                    showSuccess('OTP Resent', response.right.SuccessMessage?.[0]);

                } else {

                    showError('Failed', response.left.message);
                }

            },
            undefined,

            (error: any) => {

                addToast({ type: 'error', title: error.message });
            },

            undefined,
            'Resend OTP...'
        )
    }
    //#endregion

    return (
        <>
            <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
            <div className="h-full flex flex-col">
                {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}

                <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

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
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                                    <img
                                        src={appLogo}
                                        alt="App Logo"
                                        style={{ height: '80px', objectFit: 'contain', marginBottom: '16px' }}
                                    />
                                    <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a' }}>Sign In</h1>
                                </div>

                                <Input
                                    type="tel"
                                    label="Mobile Number"
                                    placeholder="Enter mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    maxLength={10}
                                    required
                                    size="lg"
                                    variant="filled"
                                    fullWidth
                                    leftIcon={
                                        <span style={{
                                            color: '#6b7280',
                                            fontWeight: 500,
                                            fontSize: '16px',
                                            userSelect: 'none'
                                        }}>
                                            +91
                                        </span>
                                    }
                                />

                                <Button
                                    onClick={handleSendOTP}
                                    type="submit"
                                    disabled={isLoading || mobileNumber.length !== 10}
                                    loading={isLoading}
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
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
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

                                />

                                <Button
                                    onClick={handleVerifyOTP}
                                    type="submit"
                                    disabled={isLoading || isVerified || otp.length !== 4}
                                    loading={isLoading}
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
                                        disabled={isLoading}
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
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', color: '#6b7280' }}>
                                <span>📧 support@k3tech.com</span>
                                <span>📞 +91 9975535595</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignIn
