'use client'

import { useContext, useState } from "react"
import { Context } from "@/context/userContext"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080/api"

export default function ManageProfile() {
  const { user, setUserDetails } = useContext(Context)
  const router = useRouter()

  const [name, setName] = useState(user?.name || "")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  if (!user) {
    router.push("/login")
    return null
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`${backendUrl}/user/update`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          password: password || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Profile updated successfully")
        setUserDetails(data.user)
        setPassword("")
      } else {
        toast.error(data.message || "Update failed")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold mb-6 text-center">
          Manage Profile
        </h1>

        <form onSubmit={handleUpdate} className="space-y-6">

          {/* Email (Read Only) */}
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full px-4 py-2 rounded-lg border bg-muted cursor-not-allowed"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-2">
              New Password (optional)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to keep current password"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>

        </form>
      </div>
    </div>
  )
}
