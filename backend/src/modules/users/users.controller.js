import * as usersService from './users.service.js';

export async function getMe(req, res) {
  const user = await usersService.getUserById(req.user.id);
  res.status(200).json({ success: true, data: user });
}

export async function updateMe(req, res) {
  const user = await usersService.updateUser(req.user.id, req.body);
  res.status(200).json({ success: true, data: user });
}
