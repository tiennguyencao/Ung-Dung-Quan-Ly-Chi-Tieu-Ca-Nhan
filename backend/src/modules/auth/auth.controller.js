import * as authService from './auth.service.js';

// No try/catch anywhere — Express 5 forwards a rejected promise straight to
// errorHandler.middleware.js automatically.

export async function register(req, res) {
  const user = await authService.registerUser(req.body);
  res.status(201).json({ success: true, data: user });
}

export async function login(req, res) {
  const { token, user } = await authService.loginUser(req.body);
  res.status(200).json({
    success: true,
    data: { token, user: { id: user._id, email: user.email, name: user.name } },
  });
}

export async function forgotPassword(req, res) {
  const result = await authService.requestPasswordReset(req.body);
  res.status(200).json({ success: true, data: result });
}

export async function resetPassword(req, res) {
  const result = await authService.resetPassword(req.body);
  res.status(200).json({ success: true, data: result });
}
