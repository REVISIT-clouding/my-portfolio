import supabase from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(req) {
    
    const { name } = await req.json()
    

    const { data, error } = await supabase
    .from("skills").delete().eq("name", name).single()
    if (error) {
        return NextResponse.json({ message: "delete failed"}, {status: 500})
    }

    return NextResponse.json({ message: "SKill has being deleted"}, {status: 200})
}