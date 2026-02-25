import { describe, expect, it } from 'vitest';
import {
  dedupeMemberVotes,
  normalizeVotePosition,
  parseHouseRollCallXmlText,
  parseSenateRollCallXmlText,
} from './congress-votes';

describe('congress-votes parser', () => {
  it('parses House XML and normalizes vote positions', async () => {
    const xml = `
      <rollcall-vote>
        <vote-data>
          <recorded-vote>
            <legislator name-id="A000001" party="R" state="TX">Alice Adams</legislator>
            <vote>Aye</vote>
          </recorded-vote>
          <recorded-vote>
            <legislator name-id="B000002" party="D" state="CA">Bob Brown</legislator>
            <vote>No</vote>
          </recorded-vote>
        </vote-data>
      </rollcall-vote>
    `;

    const parsed = await parseHouseRollCallXmlText(xml);

    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toMatchObject({
      bioguide_id: 'A000001',
      member_name: 'Alice Adams',
      vote_position: 'Yea',
    });
    expect(parsed[1]).toMatchObject({
      bioguide_id: 'B000002',
      member_name: 'Bob Brown',
      vote_position: 'Nay',
    });
  });

  it('parses Senate XML and supports bioguide_id fallback', async () => {
    const xml = `
      <roll_call_vote>
        <members>
          <member>
            <bioguide_id>C000003</bioguide_id>
            <first_name>Carla</first_name>
            <last_name>Clark</last_name>
            <party>I</party>
            <state>VT</state>
            <vote_cast>Present</vote_cast>
          </member>
        </members>
      </roll_call_vote>
    `;

    const parsed = await parseSenateRollCallXmlText(xml);

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      bioguide_id: 'C000003',
      member_name: 'Carla Clark',
      vote_position: 'Present',
    });
  });

  it('normalizes common vote variants', () => {
    expect(normalizeVotePosition('Yea')).toBe('Yea');
    expect(normalizeVotePosition('Aye')).toBe('Yea');
    expect(normalizeVotePosition('No')).toBe('Nay');
    expect(normalizeVotePosition('Absent')).toBe('Not Voting');
  });
});

describe('congress-votes dedupe', () => {
  it('dedupes duplicate member vote rows', () => {
    const input = [
      {
        bioguide_id: 'A000001',
        member_name: 'Alice Adams',
        party: 'R',
        state: 'TX',
        vote_position: 'Yea' as const,
      },
      {
        bioguide_id: 'A000001',
        member_name: 'Alice Adams',
        party: 'R',
        state: 'TX',
        vote_position: 'Yea' as const,
      },
      {
        bioguide_id: 'B000002',
        member_name: 'Bob Brown',
        party: 'D',
        state: 'CA',
        vote_position: 'Nay' as const,
      },
    ];

    const result = dedupeMemberVotes(input);

    expect(result.votes).toHaveLength(2);
    expect(result.removed).toBe(1);
  });
});
