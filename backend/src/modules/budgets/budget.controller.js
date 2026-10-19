import * as budgetService from './budget.service.js';

export async function list(req, res) {
  const budgets = await budgetService.listBudgets(req.user.id, req.query.month);
  res.status(200).json({ success: true, data: budgets });
}

export async function create(req, res) {
  const budget = await budgetService.createBudget(req.user.id, req.body);
  res.status(201).json({ success: true, data: budget });
}

export async function update(req, res) {
  const budget = await budgetService.updateBudget(req.user.id, req.params.id, req.body);
  res.status(200).json({ success: true, data: budget });
}

export async function remove(req, res) {
  const result = await budgetService.deleteBudget(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
}
