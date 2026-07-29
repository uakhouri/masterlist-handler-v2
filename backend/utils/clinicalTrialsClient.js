const axios = require('axios');
const xml2js = require('xml2js');

const CANADIAN_PROVINCES = [
  'ab', 'alberta',
  'bc', 'british columbia',
  'mb', 'manitoba',
  'nb', 'new brunswick',
  'nl', 'newfoundland and labrador', 'newfoundland', 'labrador',
  'ns', 'nova scotia',
  'nt', 'northwest territories',
  'nu', 'nunavut',
  'on', 'ontario',
  'pe', 'pei', 'prince edward island',
  'qc', 'quebec',
  'sk', 'saskatchewan',
  'yt', 'yukon'
].map((s) => s.toLowerCase());

const OBVIOUS_US_PATTERNS = [
  'california', 'san francisco', 'palo alto', 'los angeles',
  'arkansas', 'alabama', 'phoenix', 'fort smith', 'sacramento',
  'fresno', 'modesto', 'san jose', 'ucla', 'usc',
  'kaiser permanente', 'ucsf', 'md anderson'
].map((s) => s.toLowerCase());

const CANADIAN_NAME_HINTS = [
  'toronto', 'vancouver', 'ottawa', 'montreal', 'calgary',
  'edmonton', 'winnipeg', 'halifax', 'saskatoon', 'regina',
  'victoria', 'bc cancer', 'princess margaret', 'sunnybrook',
  'juravinski', 'mcmaster', 'university health network'
].map((s) => s.toLowerCase());

function looksLikeCanadianState(state) {
  if (!state) return false;
  return CANADIAN_PROVINCES.includes(state.toLowerCase().trim());
}

function containsAny(text, patterns) {
  if (!text) return false;
  const t = text.toLowerCase();
  return patterns.some((p) => t.includes(p));
}

function extractLocations(root) {
  let locations = [];
  if (!root.location) return locations;

  const locs = Array.isArray(root.location) ? root.location : [root.location];

  locs.forEach((loc) => {
    const status = (loc.status || '').toLowerCase();
    if (!['active', 'recruiting', 'not yet recruiting'].includes(status)) {
      return;
    }

    const facilityName = loc.facility && loc.facility.name ? loc.facility.name : '';
    const addr = loc.facility && loc.facility.address ? loc.facility.address : {};
    const city = addr.city || '';
    const state = addr.state || '';
    const country = addr.country || '';

    const locationStr = [facilityName, city, state, country].filter(Boolean).join(', ');

    // Bethesda, Maryland is explicitly allowed — it hosts the NIH Clinical
    // Center and is the one U.S. site this portal tracks alongside Canada.
    const isBethesdaMaryland =
      city.trim().toLowerCase() === 'bethesda' &&
      ['md', 'maryland'].includes(state.trim().toLowerCase());

    if (isBethesdaMaryland) {
      locations.push(locationStr);
      return;
    }

    if (country && country.toLowerCase() === 'canada') {
      locations.push(locationStr);
      return;
    }

    if (country && country.toLowerCase().includes('united states')) {
      return;
    }

    if (!country) {
      if (containsAny(facilityName, OBVIOUS_US_PATTERNS) || containsAny(city, OBVIOUS_US_PATTERNS)) {
        return;
      }

      if (
        looksLikeCanadianState(state) ||
        containsAny(facilityName, CANADIAN_NAME_HINTS) ||
        containsAny(city, CANADIAN_NAME_HINTS)
      ) {
        locations.push(locationStr);
      }
    }
  });

  return Array.from(new Set(locations));
}

function mergeMultilineCriteria(lines) {
  const merged = [];
  let buffer = '';

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (/^(\d+[.)]|[*\-•])/.test(line) || (buffer && /^[A-Z]/.test(line))) {
      if (buffer) merged.push(buffer.trim());
      buffer = line;
    } else {
      buffer += ` ${line}`;
    }
  }
  if (buffer) merged.push(buffer.trim());
  return merged;
}

function extractCriteria(root) {
  let inclusionCriteria = [];
  let exclusionCriteria = [];

  const eligibility =
    root.eligibility && root.eligibility.criteria && root.eligibility.criteria.textblock
      ? root.eligibility.criteria.textblock
      : '';

  if (!eligibility) {
    return { inclusionCriteria, exclusionCriteria };
  }

  const inclusionMatch = eligibility.match(/Inclusion Criteria:(.*?)(?:Exclusion Criteria:|$)/is);
  const exclusionMatch = eligibility.match(/Exclusion Criteria:(.*)/is);

  if (inclusionMatch) {
    const rawLines = inclusionMatch[1].trim().split('\n').map((l) => l.trim());
    inclusionCriteria = mergeMultilineCriteria(rawLines);
  }

  if (exclusionMatch) {
    const rawLines = exclusionMatch[1].trim().split('\n').map((l) => l.trim());
    exclusionCriteria = mergeMultilineCriteria(rawLines);
  }

  if (!inclusionCriteria.length && !exclusionCriteria.length) {
    const rawAll = eligibility.split('\n').map((l) => l.trim());
    inclusionCriteria = mergeMultilineCriteria(rawAll);
  }

  return { inclusionCriteria, exclusionCriteria };
}

/**
 * Fetches and parses a single trial from clinicaltrials.gov by NCT id.
 * Location filtering intentionally keeps only Canadian (or plausibly Canadian)
 * sites, plus Bethesda, Maryland (the NIH Clinical Center).
 */
async function fetchTrialByNct(nctId) {
  const url = `https://clinicaltrials.gov/ct2/show/${nctId}?displayxml=true`;
  const response = await axios.get(url, { timeout: 15000 });

  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
  const parsed = await parser.parseStringPromise(response.data);
  const root = parsed.clinical_study || {};

  const briefTitle = root.brief_title || '';
  const officialTitle = root.official_title || '';
  const phase = root.phase || '';
  const studyType = root.study_type || '';
  const sponsor =
    root.sponsors && root.sponsors.lead_sponsor && root.sponsors.lead_sponsor.agency
      ? root.sponsors.lead_sponsor.agency
      : '';

  const locations = extractLocations(root);
  const { inclusionCriteria, exclusionCriteria } = extractCriteria(root);

  return {
    nct: nctId,
    title: officialTitle || briefTitle,
    phase,
    study_type: studyType,
    sponsor,
    url: `https://clinicaltrials.gov/study/${nctId}`,
    location: locations,
    inclusion_criteria: inclusionCriteria,
    exclusion_criteria: exclusionCriteria
  };
}

module.exports = { fetchTrialByNct };
