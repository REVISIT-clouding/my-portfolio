import supabase from "@/utils/supabase/client";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
     const { email, password } = await req.json()

     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

     if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 422 });
     }

     const {data: user, error } = await supabase
     .from("users").select("*").eq("email", email).single()

     if (!user || error) {
        return NextResponse.json({ message: "invalid email or pasword."}, {status: 401})
     }

     const IsPassWordValid = await bcrypt.compare(password, user.password_hash);

     if (!IsPassWordValid){
        return NextResponse.json({ message:"invalid password"}, {status: 401})
     }

     const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
     )

     const response = NextResponse.json({ message: "You have logged Into your account!"}, {status: 200});

     response.cookies.set({
        name: "auth_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
    });

    return response;
}