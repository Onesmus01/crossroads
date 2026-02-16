'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function BookDetailsPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080/api';

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${backendUrl}/book/${id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch book');

        setBook(data.book);
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) return <p className="text-center py-20 text-white/70">Loading book...</p>;
  if (!book) return <p className="text-center py-20 text-white/70">Book not found.</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-600 mb-8">
          <FaArrowLeft /> Back to Books
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Book Image */}
          <div className="relative w-full h-96 md:h-[500px] rounded-xl overflow-hidden shadow-2xl border-2 border-purple-700">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400 text-xl font-bold">
                No Image
              </div>
            )}
          </div>

          {/* Book Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-extrabold mb-4">{book.title}</h1>
              <p className="text-lg text-gray-300 mb-2">By <span className="text-purple-400">{book.author || 'Unknown'}</span></p>
              <p className="text-gray-400 mb-4">{book.genre || 'General'}</p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <span className="text-yellow-400 font-bold">{book.rating || 0}</span>
                <FaStar className="text-yellow-400" />
              </div>

              {/* Description */}
              <p className="text-gray-300 mb-6">{book.description}</p>
            </div>

            {/* Price & Download */}
            <div className="flex flex-col gap-4 mt-6 md:mt-auto">
              <span className="text-2xl font-bold text-purple-400">KES {book.price}</span>
              {book.fileUrl && (
                <a
                  href={book.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-center bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-lg font-semibold shadow-lg"
                >
                  Download PDF
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
