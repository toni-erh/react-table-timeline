import { useState } from "react";
import { Table } from "./Table";

const testRowCount = 20000

const columns = ["index"];
const data = new Array(testRowCount).fill(true);

export default function Playground() {
  const [rows] = useState(
    data.map((_, i) => ({ index: i }))
  );

  return (
    <div style={{ padding: 32 }}>
      <h2>Table Playground</h2>
      <div style={{ padding: 16, border: "3px solid #ccc", borderRadius: 8, height: 400 }}>
        <Table
          columns={columns} rows={rows} rowCount={testRowCount}
        // onRowRangeChange={(first, last, count) => {
        //   console.log(`Visible rows: ${first} - ${last} (${count})`);
        // }}
        />
      </div>
    </div>
  );
}
