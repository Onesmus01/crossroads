'use client'

import { useContext, useEffect, useState } from "react"
import { Context } from "@/context/userContext"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080/api"

export default function WishlistPage() {
  const { user } = useContext(Context)
  const router = useRouter()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  if (!user) {
    router.push("/login")
    return null
  }

  // Fetch wishlist from backend
  const fetchWishlist = async () => {
    try {
      const res = await fetch(`${backendUrl}/wishlist/get`, {
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        setWishlist(data.wishlist || [])
      } else {
        toast.error(data.message || "Failed to fetch wishlist")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const handleRemove = async (itemId) => {
    try {
      const res = await fetch(`${backendUrl}/wishlist/delete/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Removed from wishlist")
        setWishlist((prev) => prev.filter((item) => item._id !== itemId))
      } else {
        toast.error(data.message || "Failed to remove")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-bold mb-6 text-center">My Wishlist</h1>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : wishlist.length === 0 ? (
          <p className="text-center text-muted-foreground">
            Your wishlist is empty. <Link href="/books" className="text-primary underline">Browse books</Link>
          </p>
        ) : (
          <ul className="space-y-4">
            {wishlist.map((item) => (
              <li
                key={item._id}
                className="flex justify-between items-center border p-4 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.author}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/books/${item._id}`}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition text-sm"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  )
}
