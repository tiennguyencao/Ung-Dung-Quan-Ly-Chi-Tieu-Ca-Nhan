import * as transactionService from './transaction.service.js';

export async function list(req, res) {
  const transactions = await transactionService.listTransactions(req.user.id, req.query);
  res.status(200).json({ success: true, data: transactions });
}

export async function getOne(req, res) {
  const transaction = await transactionService.getTransaction(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: transaction });
}

export async function create(req, res) {
  const transaction = await transactionService.createTransaction(req.user.id, req.body);
  res.status(201).json({ success: true, data: transaction });
}

export async function update(req, res) {
  const transaction = await transactionService.updateTransaction(req.user.id, req.params.id, req.body);
  res.status(200).json({ success: true, data: transaction });
}

export async function remove(req, res) {
  const result = await transactionService.deleteTransaction(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: result });
}
