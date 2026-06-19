type ParamRow = {
  name: string;
  type: string;
  required?: boolean;
  description: string;
};

type ParamTableProps = {
  rows: ParamRow[];
};

export function ParamTable({ rows }: ParamTableProps) {
  return (
    <div className="not-prose overflow-x-auto">
      <table className="doc-table w-full">
        <thead>
          <tr>
            <th>参数</th>
            <th>类型</th>
            <th>必填</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td>
                <code>{row.name}</code>
              </td>
              <td>{row.type}</td>
              <td>{row.required ? '是' : '否'}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
