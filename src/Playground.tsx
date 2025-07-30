import { useState } from "react";
import { Table } from "./Table";

const testRowCount = 20000

const columns = ["index"];
const data = new Array(testRowCount).fill(true);

export default function Playground() {
  // const [rows] = useState(
  //   data.map((_, i) => ({ index: i }))
  // );
  const rows = [
    { index: 0, children: [{ index: 0 }, { index: 1 }] },
    { index: 1, children: [] },
    { index: 2, children: [{ index: 0 }, { index: 1 }] },
    { index: 3, children: [{ index: 0 }, { index: 1 }, { index: 2 }] },
    { index: 4, children: [{ index: 0 }, { index: 1, children: [{ index: 0 }, { index: 1 }] }, { index: 2 }, { index: 3 }, { index: 4 }] },
    { index: 5, children: [{ index: 0 }, { index: 1 }, { index: 2 }] },
  ]

  return (
    <div style={{ padding: 32 }}>
      <h2>Table Playground</h2>
      <div style={{ padding: 16, border: "3px solid #ccc", borderRadius: 8, height: 400 }}>
        <Table
          columns={columns} rows={rows} rowCount={rows.length}
        // onRowRangeChange={(first, last, count) => {
        //   console.log(`Visible rows: ${first} - ${last} (${count})`);
        // }}
        />
      </div>
    </div>
  );
}
