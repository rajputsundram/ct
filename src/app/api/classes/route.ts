import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
const { data, error } = await supabaseServer
.from('classes')
.select('*')
.order('class_name')

if (error) {
return NextResponse.json([], { status: 500 })
}

return NextResponse.json(data || [])
}