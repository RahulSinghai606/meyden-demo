'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Vendor {
  id: string;
  companyName: string;
  description: string;
  city: string;
  country: string;
  averageRating: number;
  totalReviews: number;
  businessType: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    fetchVendors();
  }, [search, city]);

  const fetchVendors = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('query', search);
    if (city) params.append('city', city);

    const res = await fetch(`http://localhost:3002/api/v1/vendors?${params}`);
    const data = await res.json();
    setVendors(data.vendors);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Vendors</h1>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
          />
          <input
            type="text"
            placeholder="Filter by city..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-64 px-4 py-2 border rounded"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-2">{vendor.companyName}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{vendor.description}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">{vendor.city}, {vendor.country}</span>
                  <span className="text-yellow-500">⭐ {vendor.averageRating} ({vendor.totalReviews})</span>
                </div>
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{vendor.businessType}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && vendors.length === 0 && (
          <div className="text-center py-12 text-gray-500">No vendors found</div>
        )}
      </div>
    </div>
  );
}
