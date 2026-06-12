import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS,
    },
});

class EmailService {
    async sendVerificationCode(email, code) {
        await transporter.sendMail({
            from: `"FashionStore" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Підтвердження реєстрації — FashionStore',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 12px;">
                    <h2 style="color: #111; margin-bottom: 8px;">Підтвердження реєстрації</h2>
                    <p style="color: #555; margin-bottom: 24px;">Ваш код підтвердження для FashionStore:</p>
                    <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; letter-spacing: 12px; font-size: 32px; font-weight: bold; color: #111;">
                        ${code}
                    </div>
                    <p style="color: #888; font-size: 13px; margin-top: 20px;">Код дійсний протягом <b>10 хвилин</b>. Якщо ви не реєструвались — проігноруйте цей лист.</p>
                </div>
            `,
        });
    }
}

export default new EmailService();
