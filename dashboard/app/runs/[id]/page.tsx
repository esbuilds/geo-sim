import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRun } from '@/lib/db';
import { fmtPct, providerCounts } from '@/lib/stats';

export const dynamic = 'force-dynamic';

export default async function RunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) notFound();

  const rows = providerCounts(run.trials);

  return (
    <>
      <p className="muted">
        <Link href="/">runs</Link> /{' '}
        <Link href={`/scenarios/${run.scenario.id}`}>{run.scenario.id}</Link>
      </p>
      <h1>Run results</h1>
      <p className="muted">
        <strong>Query:</strong> {run.scenario.query}
        <br />
        <strong>Factor:</strong> {run.scenario.factor}
      </p>

      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>A</th>
            <th>B</th>
            <th>both</th>
            <th>neither</th>
            <th>errors</th>
            <th>A win rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.provider}>
              <td>{c.provider}</td>
              <td>{c.A}</td>
              <td>{c.B}</td>
              <td>{c.both}</td>
              <td>{c.neither}</td>
              <td>{c.errors}</td>
              <td>{fmtPct(c.winRateA)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="note">
        For confidence intervals and significance, run{' '}
        <code>geo-sim report --run {id}</code>.
      </div>
    </>
  );
}
