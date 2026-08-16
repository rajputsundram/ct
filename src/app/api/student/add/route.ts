import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(request: Request) {
const { admissionNumber, name, classId } = await request.json()

// Check duplicate admission number
const { data: existingStudent } = await supabaseServer
.from('students')
.select('id')
.eq('admission_number', admissionNumber)
.maybeSingle()

if (existingStudent) {
return NextResponse.json(
{
success: false,
message: 'Admission number already exists.',
},
{ status: 409 }
)
}

const { error } = await supabaseServer.from('students').insert({
admission_number: admissionNumber,
name,
class_id: classId,
password: '12345',
})

if (error) {
return NextResponse.json(
{
success: false,
message: 'Unable to add student.',
},
{ status: 500 }
)
}

return NextResponse.json({
success: true,
message: 'Student added successfully.',
})
}
