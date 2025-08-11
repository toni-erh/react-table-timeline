import { useState } from "react";
import { Table } from "./Table";

const testRowCount = 20000

const columns = ["index", "id", "value"];
const data = new Array(testRowCount).fill(true);
const rows = data.map((_, i) => ({ index: i, id: i.toString(), value: '-', children: [{ index: i, id: i.toString() + '-1' }] }))

export default function Playground() {
  const [loadedRows, setLoadedRows] = useState(
    rows.slice(0, 10)
  );
  // const rows = [
  //   { index: 0, id: "0", children: [{ index: 0, id: "0-0" }, { index: 1, id: "0-1" }] },
  //   { index: 1, id: "1", children: [] },
  //   { index: 2, id: "2", children: [{ index: 0, id: "2-0" }, { index: 1, id: "2-1" }] },
  //   { index: 3, id: "3", children: [{ index: 0, id: "3-0" }, { index: 1, id: "3-1" }, { index: 2, id: "3-2" }] },
  //   { index: 4, id: "4", children: [{ index: 0, id: "4-0" }, { index: 1, id: "4-1", children: [{ index: 0, id: "4-1-0" }, { index: 1, id: "4-1-1" }] }, { index: 2, id: "4-2" }, { index: 3, id: "4-3" }, { index: 4, id: "4-4" }] },
  //   { index: 5, id: "5", children: [{ index: 0, id: "5-0" }, { index: 1, id: "5-1" }, { index: 2, id: "5-2" }] },
  // ]
  // React.useEffect(() => console.log("rows", loadedRows), [loadedRows])

  return (
    <div style={{ padding: 32 }}>
      <h2>Table Playground</h2>
      <button onClick={() => {
        setLoadedRows((old) => {
          old[4].value = 'something';
          return structuredClone(old)
        })
      }}>Change some value</button>
      <div style={{ padding: 16, border: "3px solid #ccc", borderRadius: 8, height: 400 }}>
        <Table
          columns={columns} rows={loadedRows} rowCount={rows.length} rowVirtualizationMargin={0}
          onRowRangeChange={(requestedRows) => {
            setLoadedRows(rows.slice(requestedRows.firstFirstLevelIndex, requestedRows.lastFirstLevelIndex + 1))
          }}
        />
      </div>
    </div>
  );
}
