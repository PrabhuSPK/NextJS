import { Payment, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52ef",
      amount: 10023,
      status: "pending",
      email: "m@example.com",
    },
    {
        id: "728ed52wf",
        amount: 102340,
        status: "success",
        email: "a@example.com",
      },
      {
        id: "728edq52f",
        amount: 1034340,
        status: "a",
        email: "b@example.com",
      },
      {
        id: "728eqd52f",
        amount: 10,
        status: "b",
        email: "m@example.com",
      },
    // ...
  ]
}

export default async function DemoPage() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}
