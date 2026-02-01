export const emailTemplates = {
    verification: (code, name) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #4f46e5; margin: 0;">Ma-Links</h1>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
                <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email</h2>
                <p style="color: #64748b;">Hi ${name || 'there'}, welcome to Ma-Links! Use the code below to verify your account:</p>
                <div style="background: #ffffff; display: inline-block; padding: 15px 30px; border-radius: 8px; border: 2px dashed #cbd5e1; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">${code}</span>
                </div>
                <p style="color: #64748b; font-size: 14px;">This code expires in 15 minutes.</p>
            </div>
            <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
                Ignore this email if you didn't request this code.
            </p>
        </div>
    `,
    resetPassword: (code) => `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #ef4444; margin: 0;">Ma-Links Security</h1>
            </div>
            <div style="background: #fff1f2; padding: 20px; border-radius: 8px; text-align: center;">
                <h2 style="color: #881337; margin-top: 0;">Reset Password</h2>
                <p style="color: #9f1239;">We received a request to reset your password. Use the code below:</p>
                <div style="background: #ffffff; display: inline-block; padding: 15px 30px; border-radius: 8px; border: 2px dashed #fda4af; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #881337;">${code}</span>
                </div>
                <p style="color: #9f1239; font-size: 14px;">This code expires in 15 minutes.</p>
            </div>
            <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
                If you didn't ask for this, your account is safe and you can ignore this email.
            </p>
        </div>
    `
};
