import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardView from "./DashboardView"

export default async function Dashboard() {
  const session = await auth()
  
  if (!session) {
    redirect("/")
  }

  return <DashboardView userName={session.user?.name || "User"} userImage={session.user?.image} />
}
