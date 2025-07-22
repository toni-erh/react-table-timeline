import { useState } from "react";
import { Table } from "./Table";

const columns = ["Name", "Age", "Country"];
const data = [
  { Name: "Alice", Age: 25, Country: "Germany" },
  { Name: "Bob", Age: 30, Country: "USA" }
];

export default function Playground() {
  const [rows] = useState(data);

  return (
    <div style={{ padding: 32 }}>
      <h2>Table Playground</h2>
      <div style={{ padding: 16, border: "3px solid #ccc", borderRadius: 8 }}>
        <Table columns={columns} data={rows} />
      </div>
      {/* Hier kannst du weitere Controls zum Testen ergänzen */}
    </div>
  );
}
