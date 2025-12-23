const { DateTime } = require('luxon');
const overlap = require('../utils/overlap');

describe('overlap()', () => {
  const zone = { zone: 'America/Los_Angeles' };
  const date = '2025-12-29';
  const baseAppt = (start, minutes) => ({
    date,
    start_service_time: start,
    Services: [{ time: minutes }]
  });

  it('returns false when intervals just touch (end == start)', () => {
    const existing = [baseAppt('10:00', 60)]; // 10:00-11:00
    const newStart = DateTime.fromISO(`${date}T11:00`, zone);
    const newEnd = DateTime.fromISO(`${date}T11:30`, zone);
    expect(overlap(existing, newStart, newEnd)).toBe(false);
  });

  it('returns true when new is inside existing', () => {
    const existing = [baseAppt('10:00', 60)];
    const newStart = DateTime.fromISO(`${date}T10:15`, zone);
    const newEnd = DateTime.fromISO(`${date}T10:30`, zone);
    expect(overlap(existing, newStart, newEnd)).toBe(true);
  });

  it('returns true when existing is inside new', () => {
    const existing = [baseAppt('10:15', 15)];
    const newStart = DateTime.fromISO(`${date}T10:00`, zone);
    const newEnd = DateTime.fromISO(`${date}T11:00`, zone);
    expect(overlap(existing, newStart, newEnd)).toBe(true);
  });

  it('zero-length new interval counts as overlap at boundary per current logic', () => {
    const existing = [baseAppt('10:00', 60)];
    const newStart = DateTime.fromISO(`${date}T11:00`, zone);
    const newEnd = DateTime.fromISO(`${date}T11:00`, zone);
    expect(overlap(existing, newStart, newEnd)).toBe(true);
  });
});
