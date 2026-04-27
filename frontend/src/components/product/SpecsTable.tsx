type V = string | number | boolean;

const fmtVal = (v: V) =>
  typeof v === "boolean"
    ? v ? "Oui" : "Non"
    : typeof v === "number"
    ? new Intl.NumberFormat("fr-FR").format(v)
    : v;

const fmtKey = (k: string) =>
  k
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export function SpecsTable({ specs }: { specs: Record<string, V> }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200">
      <table className="w-full text-sm text-left border-collapse">
        <tbody className="divide-y divide-stone-200">
          {Object.entries(specs).map(([k, v]) => (
            <tr key={k}>
              <th
                scope="row"
                className="bg-stone-50 px-4 py-3 font-bold text-stone-700 w-1/3"
              >
                {fmtKey(k)}
              </th>
              <td className="px-4 py-3 text-stone-950">{fmtVal(v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
