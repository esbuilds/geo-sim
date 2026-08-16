import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getScenario } from '@/lib/db';
import { fmtPct, overallWinRateA } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export default async function ScenarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = getScenario(id);
  if (!data) notFound();

  const trend = data.runs.map((r) => ({
    id: r.id,
    createdAt: r.createdAt,
    winRateA: overallWinRateA(r.trials),
  }));

  return (
    <>
      <p className="muted">
        <Link href="/">runs</Link> / {data.scenario.id}
      </p>
      <h1>{data.scenario.id}</h1>
      <p className="muted">
        <strong>Query:</strong> {data.scenario.query}
        <br />
        <strong>Factor:</strong> {data.scenario.factor}
      </p>

      <h2>Trend — variant A win rate over time</h2>
      {trend.length < 2 ? (
        <div className="note">
          A trend needs more than one run for this scenario. So far: {trend.length}
          .
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>When</th>
              <th>A win rate</th>
              <th>Run</th>
            </tr>
          </thead>
          <tbody>
            {trend.map((t, i) => (
              <tr key={t.id}>
                <td>{i + 1}</td>
                <td>{new Date(t.createdAt).toLocaleString()}</td>
                <td>{fmtPct(t.winRateA)}</td>
                <td>
                  <Link href={`/runs/${t.id}`}>open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
