import { ObjectId } from 'mongodb';
import { getCollection } from './_db.js';

const VALID_SCOPES = new Set(['daily', 'weekly', 'monthly', 'yearly']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function handler(req, res) {
  try {
    const collection = await getCollection();

    switch (req.method) {
      case 'GET': {
        const { scope, date } = req.query;
        if (scope && !VALID_SCOPES.has(scope)) {
          return res.status(400).json({ error: 'Invalid scope' });
        }
        if (date && !DATE_RE.test(date)) {
          return res.status(400).json({ error: 'date must be in YYYY-MM-DD form' });
        }
        const filter = {};
        if (scope) filter.scope = scope;
        if (date) filter.date = date;
        const todos = await collection.find(filter).sort({ createdAt: -1 }).toArray();
        return res.status(200).json(todos);
      }

      case 'POST': {
        const { scope, date, text } = req.body || {};
        if (!VALID_SCOPES.has(scope)) {
          return res.status(400).json({ error: 'scope must be one of daily, weekly, monthly, yearly' });
        }
        if (!date || !DATE_RE.test(date)) {
          return res.status(400).json({ error: 'date is required and must be in YYYY-MM-DD form' });
        }
        if (!text || typeof text !== 'string' || !text.trim()) {
          return res.status(400).json({ error: 'text is required' });
        }
        const doc = {
          scope,
          date, // anchor date for this period (daily: the day, weekly: that week's Monday, monthly: 1st of month, yearly: Jan 1st)
          text: text.trim(),
          completed: false,
          createdAt: new Date().toISOString(),
        };
        const result = await collection.insertOne(doc);
        return res.status(201).json({ ...doc, _id: result.insertedId });
      }

      case 'PATCH': {
        const { id, completed, text } = req.body || {};
        if (!id || !ObjectId.isValid(id)) {
          return res.status(400).json({ error: 'valid id is required' });
        }
        const update = {};
        if (typeof completed === 'boolean') update.completed = completed;
        if (typeof text === 'string' && text.trim()) update.text = text.trim();
        if (Object.keys(update).length === 0) {
          return res.status(400).json({ error: 'nothing to update' });
        }
        const result = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: update },
          { returnDocument: 'after' }
        );
        if (!result) return res.status(404).json({ error: 'todo not found' });
        return res.status(200).json(result);
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id || !ObjectId.isValid(id)) {
          return res.status(400).json({ error: 'valid id is required' });
        }
        await collection.deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (err) {
    console.error('todos api error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
