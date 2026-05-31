import { redirect } from "next/navigation"

// /qms-builder → /qms-wizard 로 이동
export default function QmsBuilderRedirect() {
  redirect('/qms-wizard')
}
