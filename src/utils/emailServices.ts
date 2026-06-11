// utils/emailService.ts
import nodemailer from 'nodemailer';

// console.log("DEBUG: EMAIL_USER:", process.env.EMAIL_USER); // यो थप्नुहोस्
// console.log("DEBUG: EMAIL_PASS:", process.env.EMAIL_PASS ? "********" : "MISSING"); // यो थप्नुहोस्

const transporter = nodemailer.createTransport({
    service: 'gmail', // वा आफ्नो SMTP सर्भर
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async (to: string[], subject: string, text: string) => {
    await transporter.sendMail({
        from: '"News Portal" <sushimchaudhary.developer1@gmail.com>',
        to: to.join(','),
        subject,
        text
    });
};