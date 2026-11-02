"use client"

import { useState } from "react"
import { CiCircleCheck } from "react-icons/ci";
import { useRouter } from "next/navigation";


export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [ error, setError ] = useState("")
    const router = useRouter()

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: 'POST', 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                router.push("/uoadminuo");
            } else {
                setError(data.message);
                alert(`Error: ${data.message}`); 
            }
        } catch (err) {
            setError("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };
    

    return(
        <div>
            <form onSubmit={handleLogin} className="flex flex-col w-full gap-3 mt-6">
                <input type="email" required onChange={(e)=> setForm({...form, email: e.target.value})} className="border"/>
                <input type="password" required  onChange={(e)=> setForm({...form, password: e.target.value})} className="border" />

                <button type="submit" disabled={loading} className="flex gap-1 items-center justify-center">
                    {loading ? "Sending...": "Request"}
                    <CiCircleCheck/>
                </button>
            </form>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    )
}