import * as statsService from './stats.service.js';

export async function overview(req, res) {
  const data = await statsService.getOverview(req.user.id, req.query);
  res.status(200).json({ success: true, data });
}

export async function byCategory(req, res) {
  const data = await statsService.getByCategory(req.user.id, req.query);
  res.status(200).json({ success: true, data });
}

export async function compare(req, res) {
  const data = await statsService.compare(req.user.id, req.query);
  res.status(200).json({ success: true, data });
}
