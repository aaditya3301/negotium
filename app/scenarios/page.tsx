import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ScenariosView from "./ScenariosView"

export default async function Scenarios() {
  const session = await auth()
  
  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/scenarios")
  }

  return <ScenariosView userName={session.user?.name || "User"} userImage={session.user?.image} />
}
