import { supabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: student } = await supabaseServer
    .from('students')
    .select('class_id')
    .eq('id', id)
    .single()

  const { error } = await supabaseServer
    .from('students')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  return NextResponse.redirect(
    new URL(`/admin/students?class=${student?.class_id}`, request.url),
    303
  )
}