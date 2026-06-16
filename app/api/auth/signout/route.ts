import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const next = req.nextUrl.searchParams.get('next') ?? '/login'
  return NextResponse.redirect(new URL(next, process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qmintel.com'))
}
