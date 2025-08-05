import { useState } from "react";
import { Table } from "./Table";

const testRowCount = 20000

const columns = ["index", "id"];
const data = new Array(testRowCount).fill(true);

export default function Playground() {
  // const [rows] = useState(
  //   data.map((_, i) => ({ index: i }))
  // );
  const rows = [
    { index: 0, id: "0", children: [{ index: 0, id: "0-0" }, { index: 1, id: "0-1" }] },
    { index: 1, id: "1", children: [] },
    { index: 2, id: "2", children: [{ index: 0, id: "2-0" }, { index: 1, id: "2-1" }] },
    { index: 3, id: "3", children: [{ index: 0, id: "3-0" }, { index: 1, id: "3-1" }, { index: 2, id: "3-2" }] },
    { index: 4, id: "4", children: [{ index: 0, id: "4-0" }, { index: 1, id: "4-1", children: [{ index: 0, id: "4-1-0" }, { index: 1, id: "4-1-1" }] }, { index: 2, id: "4-2" }, { index: 3, id: "4-3" }, { index: 4, id: "4-4" }] },
    { index: 5, id: "5", children: [{ index: 0, id: "5-0" }, { index: 1, id: "5-1" }, { index: 2, id: "5-2" }] },
  ]

  return (
    <div style={{ padding: 32 }}>
      <h2>Table Playground</h2>
      <div style={{ padding: 16, border: "3px solid #ccc", borderRadius: 8, height: 400 }}>
        <Table
          columns={columns} rows={rows} rowCount={rows.length}
          onRowRangeChange={(requestedRows) => {
            console.log(requestedRows)
          }}
        />
      </div>
    </div>
  );
}
