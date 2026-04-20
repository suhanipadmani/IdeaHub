import nodemailer from 'nodemailer';

const sendEmail = async (
    options: {
        email: string;
        subject: string;
        message: string
    }
) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return;
        return;
    }

    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"${process.env.FROM_NAME || 'Startup Platform'}" <${process.env.FROM_EMAIL || 'no-reply@example.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export default sendEmail;
