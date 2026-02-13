"use client";

export default function BookTable({ books, onDelete }) {
  return (
    <table className="w-full table-auto border border-gray-300 rounded-md">
      <thead className="bg-gray-200">
        <tr>
          <th className="px-4 py-2 border">Title</th>
          <th className="px-4 py-2 border">Price</th>
          <th className="px-4 py-2 border">Actions</th>
        </tr>
      </thead>
      <tbody>
        {books.map((book) => (
          <tr key={book._id} className="hover:bg-gray-100">
            <td className="px-4 py-2 border">{book.title}</td>
            <td className="px-4 py-2 border">${book.price}</td>
            <td className="px-4 py-2 border flex gap-2">
              <button className="bg-blue-600 text-white px-2 py-1 rounded">
                Edit
              </button>
              <button
                onClick={() => onDelete(book._id)}
                className="bg-red-600 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
