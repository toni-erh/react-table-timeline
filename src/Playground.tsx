import { useState } from "react";
import { Table } from "./Table";

const columns = ["index"];
const data = new Array(20000).fill(true);

export default function Playground() {
  const [rows] = useState(
    data.map((_, i) => ({ index: i }))
  );

  return (
    <div style={{ padding: 32 }}>
      <h2>Table Playground</h2>
      <div style={{ padding: 16, border: "3px solid #ccc", borderRadius: 8, height: 400 }}>
        <Table columns={columns} data={rows} />
      </div>
    </div>
  );
}
