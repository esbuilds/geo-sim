import Link from 'next/link';
import { listRuns } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function Home() {
  const runs = listRuns();

  return (
    <>
      <h1>Runs</h1>
      <p className="muted">
        Citation-preference given retrieval. Not a prediction of whether content
        gets retrieved in production.
      </p>

      {runs.length === 0 ? (
        <div className="note">
          No runs found. Run one with{' '}
          <code>geo-sim run --scenario ... --providers ...</code>, or point{' '}
          <code>GEO_SIM_DB</code> at the SQLite file.
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>When</th>
              <th>Scenario</th>
              <th>Factor</th>
              <th>Providers</th>
              <th>Trials</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link href={`/runs/${r.id}`}>
                    {new Date(r.createdAt).toLocaleString()}
                  </Link>
                </td>
                <td>
                  <Link href={`/scenarios/${r.scenarioId}`}>{r.scenarioId}</Link>
                </td>
                <td>{r.factor}</td>
                <td>{r.providers.join(', ')}</td>
                <td>{r.trialCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
