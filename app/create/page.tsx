"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, ArrowLeft } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'images';

const categories = [
  { id: 'vehicles', name: 'Vehicles' },
  { id: 'property', name: 'Property Rentals' },
  { id: 'apparel', name: 'Apparel' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'sports', name: 'Sports & Outdoors' },
  { id: 'home', name: 'Home & Garden' },
];

const conditions = [
  { id: 'new', name: 'New' },
  { id: 'like-new', name: 'Like New' },
  { id: 'good', name: 'Good' },
  { id: 'fair', name: 'Fair' },
  { id: 'poor', name: 'Poor' },
];

export default function CreateListing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    location: '',
    seller_email: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const supabase = getSupabaseClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `listings/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        upsert: true,
        cacheControl: '3600',
        contentType: file.type || 'image/jpeg',
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw new Error(uploadError.message || 'Upload failed');
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error('Could not get public URL after upload');
    }

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      let imageUrl = null as string | null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase
        .from('listings')
        .insert({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          category: formData.category,
          condition: formData.condition,
          location: formData.location,
          seller_email: formData.seller_email,
          image_url: imageUrl,
        });

      if (error) throw error;

      router.push('/');
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.price &&
      formData.category &&
      formData.location.trim() &&
      formData.seller_email.trim() &&
      imageFile
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create Listing</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <p className="text-sm text-gray-500">
                Add at least one photo to help buyers understand what you're selling.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                    >
                      Remove Photo
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <ImagePlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-700 mb-2">
                      Add photos
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Drag and drop or click to select
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload">
                      <Button type="button" asChild>
                        <span>Select Photo</span>
                      </Button>
                    </Label>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="What are you selling?"
                  maxLength={80}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/80 characters
                </p>
              </div>

              <div>
                <Label htmlFor="price">Price *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Condition</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map((condition) => (
                        <SelectItem key={condition.id} value={condition.id}>
                          {condition.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your item in detail..."
                  rows={6}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/1000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.seller_email}
                  onChange={(e) => handleInputChange('seller_email', e.target.value)}
                  placeholder="your.email@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Buyers will use this email to contact you
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Link href="/">
              <Button type="button" variant="outline" disabled={loading}>
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={!isFormValid() || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Creating...' : 'Create Listing'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}