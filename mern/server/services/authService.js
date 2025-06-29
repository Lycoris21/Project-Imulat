import bcrypt from "bcrypt";
import crypto from "crypto";
import { Resend } from "resend";
import User from "../models/User.js";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function findUserByEmail(email) {
  return await User.findOne({ email });
}

export async function verifyPassword(plainText, hash) {
  return await bcrypt.compare(plainText, hash);
}

export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = Date.now() + 1000 * 60 * 60; // 1 hour
  return { token, expiry };
}

export async function sendPasswordResetEmail(user, token) {
  const resetUrl = `http://localhost:5173/reset-password/${token}`;
  return await resend.emails.send({
    from: "onboarding@resend.dev",
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <p>Hello ${user.username || "there"},</p>
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>If you didn’t request this, you can ignore this email.</p>
    `,
  });
}
