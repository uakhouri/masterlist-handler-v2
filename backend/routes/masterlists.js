const express = require('express');
const asyncHandler = require('express-async-handler');
const { body, query, validationResult } = require('express-validator');
const Masterlist = require('../models/Masterlist');
const auth = require('../middleware/auth');
const { fetchTrialByNct } = require('../utils/clinicalTrialsClient');

const router = express.Router();

router.use(auth);

/**
 * @route   GET /api/masterlists
 * @desc    List masterlists with pagination + optional search
 * @access  Private
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim()
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;
    const search = req.query.search;

    const filter = search
      ? {
          $or: [
            { name: new RegExp(search, 'i') },
            { cancerType: new RegExp(search, 'i') }
          ]
        }
      : {};

    const [items, total] = await Promise.all([
      Masterlist.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Masterlist.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1
      }
    });
  })
);

/**
 * @route   POST /api/masterlists
 * @desc    Create new masterlist
 * @access  Private
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Masterlist name is required'),
    body('cancerType').trim().notEmpty().withMessage('Cancer type is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, cancerType } = req.body;

    const masterlist = new Masterlist({
      name,
      cancerType,
      user: req.user.id,
      trials: []
    });

    await masterlist.save();

    res.status(201).json({ success: true, data: masterlist });
  })
);

/**
 * @route   GET /api/masterlists/:id
 * @desc    Get single masterlist by id
 * @access  Private
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const masterlist = await Masterlist.findById(req.params.id);

    if (!masterlist) {
      return res.status(404).json({ success: false, message: 'Masterlist not found' });
    }

    res.json({ success: true, data: masterlist });
  })
);

/**
 * @route   POST /api/masterlists/:id/trials
 * @desc    Add one or multiple trials by NCT id(s)
 * @access  Private
 *
 * Body options:
 *   { "nct": "NCT01234567" }
 *   { "ncts": ["NCT01234567", "NCT08976543"] }
 */
router.post(
  '/:id/trials',
  [
    body('nct').optional().isString(),
    body('ncts').optional().isArray({ min: 1 })
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const masterlist = await Masterlist.findById(req.params.id);
    if (!masterlist) {
      return res.status(404).json({ success: false, message: 'Masterlist not found' });
    }

    let nctIds = [];
    if (req.body.ncts && Array.isArray(req.body.ncts)) {
      nctIds = req.body.ncts;
    } else if (req.body.nct) {
      nctIds = [req.body.nct];
    } else {
      return res.status(400).json({ success: false, message: 'Provide "nct" or "ncts" in request body' });
    }

    nctIds = Array.from(
      new Set(nctIds.filter(Boolean).map((id) => id.toString().trim().toUpperCase()))
    );

    if (!nctIds.length) {
      return res.status(400).json({ success: false, message: 'No valid NCT ids provided' });
    }

    const added = [];
    const skipped = [];

    for (const nctId of nctIds) {
      const exists = masterlist.trials.find((t) => t.nct.toUpperCase() === nctId);
      if (exists) {
        skipped.push({ nct: nctId, reason: 'Already exists in masterlist' });
        continue;
      }

      try {
        const trialData = await fetchTrialByNct(nctId);
        masterlist.trials.push(trialData);
        added.push({ nct: nctId });
      } catch (err) {
        console.error(`Error fetching NCT ${nctId}:`, err.message);
        skipped.push({ nct: nctId, reason: 'Failed to fetch/parse trial' });
      }
    }

    await masterlist.save();

    res.status(201).json({
      success: true,
      data: masterlist,
      summary: { added, skipped }
    });
  })
);

/**
 * @route   DELETE /api/masterlists/:id/trials/:nct
 * @desc    Remove a trial by NCT from masterlist
 * @access  Private
 */
router.delete(
  '/:id/trials/:nct',
  asyncHandler(async (req, res) => {
    const { id, nct } = req.params;

    const masterlist = await Masterlist.findById(id);
    if (!masterlist) {
      return res.status(404).json({ success: false, message: 'Masterlist not found' });
    }

    const initialCount = masterlist.trials.length;
    masterlist.trials = masterlist.trials.filter((t) => t.nct.toLowerCase() !== nct.toLowerCase());

    if (masterlist.trials.length === initialCount) {
      return res.status(404).json({ success: false, message: 'Trial with this NCT not found in masterlist' });
    }

    await masterlist.save();

    res.json({ success: true, data: masterlist });
  })
);

/**
 * @route   DELETE /api/masterlists/:id
 * @desc    Delete a masterlist
 * @access  Private
 */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const masterlist = await Masterlist.findByIdAndDelete(req.params.id);

    if (!masterlist) {
      return res.status(404).json({ success: false, message: 'Masterlist not found' });
    }

    res.json({ success: true, message: 'Masterlist deleted' });
  })
);

module.exports = router;
