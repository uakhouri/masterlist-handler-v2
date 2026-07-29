const PHASE_ORDER = [
  'early phase 1',
  'phase 1',
  'phase 1/phase 2',
  'phase 2',
  'phase 2/phase 3',
  'phase 3',
  'phase 4',
  'not applicable'
];

function rank(value, order) {
  if (!value) return order.length;
  const idx = order.indexOf(value.toLowerCase().trim());
  return idx === -1 ? order.length : idx;
}

/**
 * Groups trials by study type, then by phase within each study type, so
 * same-type/same-phase trials sit together. Falls back to alphabetical
 * ordering for values outside the known phase list.
 */
function sortTrials(trials) {
  return [...trials].sort((a, b) => {
    const studyTypeA = (a.study_type || '').trim();
    const studyTypeB = (b.study_type || '').trim();
    if (studyTypeA !== studyTypeB) {
      return studyTypeA.localeCompare(studyTypeB);
    }

    const phaseRankDiff = rank(a.phase, PHASE_ORDER) - rank(b.phase, PHASE_ORDER);
    if (phaseRankDiff !== 0) return phaseRankDiff;

    const phaseA = (a.phase || '').trim();
    const phaseB = (b.phase || '').trim();
    if (phaseA !== phaseB) return phaseA.localeCompare(phaseB);

    return (a.nct || '').localeCompare(b.nct || '');
  });
}

module.exports = { sortTrials };
