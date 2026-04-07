'use client'

import { useContext, useState, useEffect } from "react"
import { Context } from "@/context/userContext"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080/api"

export default function ManageProfile() {
  const { user, fetchUserDetails } = useContext(Context)
  const router = useRouter()

  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user])

  useEffect(() => {
    if (!user) router.push("/login")
  }, [user, router])

  if (!user) return null

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Please login again")
        router.push("/login")
        return
      }

      // DEBUG: Log the exact URL being called
      const url = `${backendUrl}/user/update-user`
      console.log('Calling API:', url)
      console.log('Token:', token ? 'Present' : 'Missing')

      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          ...(password && { password })
        }),
      })

      // DEBUG: Log response status
      console.log('Response status:', response.status)

      const data = await response.json()

      if (response.ok) {
        toast.success("Profile updated!")
        await fetchUserDetails()
        setPassword("")
      } else {
        toast.error(data.message || `Error: ${response.status}`)
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Network error - check console")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-16 px-4">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-lg p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
          Manage Profile
        </h1>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border bg-muted cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              New Password <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to keep current"
              className="w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  )
}