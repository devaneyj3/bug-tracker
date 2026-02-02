"use client";

export const ADMIN_EMAIL = "jordandevaney28@gmail.com";

export const isAdminEmail = (email = "") =>
  email.trim().toLowerCase() === ADMIN_EMAIL;
