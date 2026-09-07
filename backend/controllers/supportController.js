const { pool } = require('../config/mysql');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { createNotification } = require('../services/notificationService');

const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, priority } = req.body;
  if (!subject || !description) throw new ApiError(400, 'subject and description are required');

  const [result] = await pool.query(
    'INSERT INTO support_tickets (user_id, subject, description, category, priority) VALUES (?, ?, ?, ?, ?)',
    [req.user.userId, subject, description, category || 'other', priority || 'medium']
  );
  const [rows] = await pool.query('SELECT * FROM support_tickets WHERE ticket_id = ?', [result.insertId]);
  res.status(201).json({ success: true, data: rows[0] });
});

const getMyTickets = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId]);
  res.json({ success: true, data: rows });
});

// Support staff / admin view: all tickets, optionally filtered by status.
const getAllTickets = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';
  if (status) {
    where = 'WHERE t.status = ?';
    params.push(status);
  }
  const [rows] = await pool.query(
    `SELECT t.*, u.name AS user_name, u.email AS user_email, a.name AS assignee_name
     FROM support_tickets t JOIN users u ON u.user_id = t.user_id
     LEFT JOIN users a ON a.user_id = t.assigned_to
     ${where} ORDER BY t.created_at DESC`,
    params
  );
  res.json({ success: true, data: rows });
});

const assignTicket = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  const [existing] = await pool.query('SELECT * FROM support_tickets WHERE ticket_id = ?', [req.params.id]);
  if (!existing[0]) throw new ApiError(404, 'Ticket not found');

  await pool.query("UPDATE support_tickets SET assigned_to = ?, status = 'in_progress' WHERE ticket_id = ?", [assignedTo, req.params.id]);
  const [rows] = await pool.query('SELECT * FROM support_tickets WHERE ticket_id = ?', [req.params.id]);

  createNotification({
    userId: existing[0].user_id,
    type: 'support_update',
    title: 'Support ticket assigned',
    message: `Your ticket "${existing[0].subject}" is now being handled.`,
    link: '/support',
  }).catch(() => {});

  res.json({ success: true, data: rows[0] });
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNotes } = req.body;
  const allowed = ['open', 'in_progress', 'resolved', 'closed'];
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);

  const [existing] = await pool.query('SELECT * FROM support_tickets WHERE ticket_id = ?', [req.params.id]);
  if (!existing[0]) throw new ApiError(404, 'Ticket not found');

  await pool.query('UPDATE support_tickets SET status = ?, resolution_notes = COALESCE(?, resolution_notes) WHERE ticket_id = ?', [status, resolutionNotes || null, req.params.id]);
  const [rows] = await pool.query('SELECT * FROM support_tickets WHERE ticket_id = ?', [req.params.id]);

  createNotification({
    userId: existing[0].user_id,
    type: 'support_update',
    title: 'Support ticket updated',
    message: `Your ticket "${existing[0].subject}" status is now "${status}".`,
    link: '/support',
  }).catch(() => {});

  res.json({ success: true, data: rows[0] });
});

module.exports = { createTicket, getMyTickets, getAllTickets, assignTicket, updateTicketStatus };
