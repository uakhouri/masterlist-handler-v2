export function getTrialUrl(trial) {
  if (trial?.url) return trial.url;
  if (trial?.nct) return `https://clinicaltrials.gov/study/${trial.nct}`;
  return null;
}
