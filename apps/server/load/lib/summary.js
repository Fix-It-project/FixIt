// handleSummary helper: write terminal + HTML + JSON artifacts.
//
// textSummary renders the same table k6 prints by default; the HTML report
// comes from the community jslib (loaded over https at parse time by k6).
import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Returns a handleSummary() that writes results/<name>.{html,json} and
// echoes the summary to stdout.
export function makeSummary(name) {
  return function handleSummary(data) {
    const out = {
      stdout: textSummary(data, { indent: " ", enableColors: true }),
    };
    out[`load/results/${name}.html`] = htmlReport(data);
    out[`load/results/${name}.json`] = JSON.stringify(data, null, 2);
    return out;
  };
}
