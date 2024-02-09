export default function generateOTP(length) {
    const otpLength = length;
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }
