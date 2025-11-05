"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  listingType: string;
  swapPreferences: string | null;
  imageUrl: string | null;
}

interface EditListingFormProps {
  listing: Listing;
}

export default function EditListingForm({ listing }: EditListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(listing.imageUrl);
  const [imageFile, setImageFile] = useState<string | null>(listing.imageUrl);
  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description,
    category: listing.category,
    condition: listing.condition,
    listingType: listing.listingType,
    swapPreferences: listing.swapPreferences || "",
  });

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImageFile(base64String);
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData,
          imageUrl: imageFile,
        }),
      });

      if (response.ok) {
        router.push(`/listings/${listing.id}`);
      } else {
        alert("Failed to update listing");
      }
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12 md:py-20">
      <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
        <aside className="w-full md:w-1/2 flex justify-center md:justify-end items-center md:items-start mb-8 md:mb-0 order-1 md:order-2">
          <Image
            src="/reference/itemList/cactus.svg"
            alt="Cactus decorative"
            width={600}
            height={600}
            className="w-48 sm:w-64 md:w-[520px] lg:w-[600px] object-contain mt-[-1rem] md:mt-0"
            style={{ filter: "drop-shadow(0px 18px 30px rgba(0,0,0,0.15))" }}
          />
        </aside>

        <section className="w-full md:w-1/2 order-2 md:order-1">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#0f1f18] mb-6 text-center md:text-left">
            Edit Listing
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Item Title</label>
              <input
                type="text"
                placeholder="e.g., Vintage Leather Jacket"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EAEAEA] placeholder:text-[#5D845F] placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                rows={5}
                placeholder="Describe your item..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EAEAEA] placeholder:text-[#5D845F] placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EAEAEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
                required
              >
                <option value="">Select Category</option>
                <option value="Clothing">Clothing</option>
                <option value="Electronics">Electronics</option>
                <option value="Furniture">Furniture</option>
                <option value="Books">Books</option>
                <option value="Home Goods">Home Goods</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EAEAEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
                required
              >
                <option value="">Select Condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Listing Type</label>
              <select
                value={formData.listingType}
                onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EAEAEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
                required
              >
                <option value="BARTER">Barter (Trade)</option>
                <option value="DONATION">Donation (Give Away)</option>
              </select>
            </div>

            {formData.listingType === "BARTER" && (
              <div>
                <label className="block text-sm font-medium mb-2">Swap Preferences</label>
                <input
                  type="text"
                  placeholder="What are you looking to swap for?"
                  value={formData.swapPreferences}
                  onChange={(e) => setFormData({ ...formData, swapPreferences: e.target.value })}
                  className="w-full px-4 py-3 rounded-[10px] border border-[#EAEAEA] placeholder:text-[#5D845F] placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-[#5D845F]"
                />
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium mb-3">Update Photo</label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="rounded-lg border-2 border-dashed border-[rgba(93,132,95,0.25)] p-8 text-center bg-[rgba(93,132,95,0.03)] cursor-pointer hover:bg-[rgba(93,132,95,0.08)] transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 mx-auto mb-4 text-[#5D845F]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <h3 className="font-semibold mb-2">Upload Photo</h3>
                  <p className="text-sm text-[#6b6b6b] mb-4">
                    Drag and drop or click to upload a photo
                  </p>
                  <p className="text-xs text-[#B0A9A9]">
                    Max file size: 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3 justify-center md:justify-start">
              <button
                type="button"
                onClick={() => router.back()}
                className="mt-6 inline-block border border-[#EAEAEA] text-[#333333] px-6 py-3 rounded-[10px] hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="mt-6 inline-block bg-[#5D845F] hover:bg-[#4d6f4f] text-white px-6 py-3 rounded-[10px] shadow-md border border-[#EAEAEA] disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

