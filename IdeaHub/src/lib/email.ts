import nodemailer from 'nodemailer';

const sendEmail = async (
    options: {
        email: string;
        subject: string;
        message: string
    }
) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        if (process.env.NODE_ENV === 'development') {
            console.log('Mock Email:', { to: options.email, subject: options.subject });
        }
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
        if (process.env.NODE_ENV === 'development') {
            console.log('Email sent successfully');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        if (process.env.NODE_ENV === 'development') {
            console.log('--- MOCK EMAIL (FAILED SEND) ---');
            console.log({ to: options.email, subject: options.subject });
        }
    }
};

export default sendEmail;
