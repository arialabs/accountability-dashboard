/**
 * Fetch complete finance data (including top_contributors) for congressional leaders.
 * Uses the fixed getTopContributors with Schedule A endpoint.
 */
import * as fs from "fs";
import { fetchMemberFinanceDetailed } from "./sources/fec.js";

const LEADERS = [
  { bioguide_id: "J000299", full_name: "Mike Johnson", state: "Louisiana", chamber: "house" as const, district: 4 },
  { bioguide_id: "S001176", full_name: "Steve Scalise", state: "Louisiana", chamber: "house" as const, district: 1 },
  { bioguide_id: "E000294", full_name: "Tom Emmer", state: "Minnesota", chamber: "house" as const, district: 6 },
  { bioguide_id: "J000294", full_name: "Hakeem Jeffries", state: "New York", chamber: "house" as const, district: 8 },
  { bioguide_id: "C001101", full_name: "Katherine Clark", state: "Massachusetts", chamber: "house" as const, district: 5 },
  { bioguide_id: "T000250", full_name: "John Thune", state: "South Dakota", chamber: "senate" as const, district: null },
  { bioguide_id: "S000148", full_name: "Charles Schumer", state: "New York", chamber: "senate" as const, district: null },
];

async function main() {
  console.log("Fetching complete finance data for congressional leaders...\n");
  console.log(`FEC_API_KEY: ${process.env.FEC_API_KEY ? '***set***' : 'NOT SET!'}\n`);

  const financeJsonPath = "./src/data/finance.json";
  const financeData: Record<string, any> = fs.existsSync(financeJsonPath)
    ? JSON.parse(fs.readFileSync(financeJsonPath, "utf-8"))
    : {};

  let updated = 0;
  for (const leader of LEADERS) {
    console.log(`\n${leader.full_name} (${leader.bioguide_id})...`);
    try {
      const data = await fetchMemberFinanceDetailed(
        leader.full_name, leader.state, leader.chamber, leader.district, leader.bioguide_id
      );
      if (data && data.total_raised > 0) {
        financeData[leader.bioguide_id] = data;
        console.log(`  ✓ $${(data.total_raised/1e6).toFixed(1)}M raised, ${data.top_contributors.length} top contributors`);
        data.top_contributors.forEach((c: any) => console.log(`    ${c.name}: $${c.total.toLocaleString()}`));
        updated++;
      } else {
        console.log(`  ✗ No data found`);
      }
    } catch (err) {
      console.error(`  ✗ Error:`, err);
    }
    // Rate limit pause
    await new Promise(r => setTimeout(r, 2000));
  }

  fs.writeFileSync(financeJsonPath, JSON.stringify(financeData, null, 2));
  console.log(`\n✓ Updated ${updated}/${LEADERS.length} leaders in ${financeJsonPath}`);
}

main().catch(console.error);
