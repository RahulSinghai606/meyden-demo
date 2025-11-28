'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface VendorDetail {
  id: string;
  companyName: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  businessType: string;
  website: string;
  averageRating: number;
  totalReviews: number;
  services: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    basePrice: number;
  }>;
  reviews: Array<{
    id: string;
    title: string;
    content: string;
    overallRating: number;
    reviewerName: string;
  }>;
}

export default function VendorDetailPage() {
  const params = useParams();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendor();
  }, [params.id]);

  const fetchVendor = async () => {
    try {
      const res = await fetch(`http://localhost:3002/api/v1/vendors/${params.id}`);
      const data = await res.json();
      setVendor(data.vendor);
    } catch (error) {
      console.error('Error fetching vendor:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!vendor) return <div className="min-h-screen flex items-center justify-center">Vendor not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/vendors" className="text-blue-600 mb-4 inline-block">← Back to Vendors</Link>

        <div className="bg-white p-8 rounded-lg shadow mb-6">
          <h1 className="text-4xl font-bold mb-4">{vendor.companyName}</h1>
          <div className="flex gap-2 mb-4">
            <span className="text-yellow-500 text-xl">⭐ {vendor.averageRating}</span>
            <span className="text-gray-500">({vendor.totalReviews} reviews)</span>
          </div>
          <p className="text-gray-600 mb-6">{vendor.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Location:</span> {vendor.city}, {vendor.country}
            </div>
            <div>
              <span className="font-semibold">Business Type:</span> {vendor.businessType}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {vendor.email}
            </div>
            {vendor.phone && (
              <div>
                <span className="font-semibold">Phone:</span> {vendor.phone}
              </div>
            )}
            {vendor.website && (
              <div>
                <span className="font-semibold">Website:</span>{' '}
                <a href={vendor.website} target="_blank" className="text-blue-600">
                  {vendor.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {vendor.services.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow mb-6">
            <h2 className="text-2xl font-bold mb-4">Services</h2>
            <div className="space-y-4">
              {vendor.services.map((service) => (
                <div key={service.id} className="border-b pb-4">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                  {service.basePrice && (
                    <p className="text-sm text-green-600 mt-2">From ${service.basePrice}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {vendor.reviews.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Reviews</h2>
            <div className="space-y-4">
              {vendor.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{review.title}</h3>
                    <span className="text-yellow-500">⭐ {review.overallRating}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{review.content}</p>
                  <p className="text-xs text-gray-500">— {review.reviewerName}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
