"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, MapPin, Heart, Share2, Grid3X3, List } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  location: string;
  seller_email: string;
  created_at: string;
  condition?: string;
}

const categories = [
  { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
  { id: 'property', name: 'Property Rentals', icon: '🏠' },
  { id: 'apparel', name: 'Apparel', icon: '👕' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'sports', name: 'Sports & Outdoors', icon: '🏃' },
  { id: 'home', name: 'Home & Garden', icon: '🏡' },
];

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, selectedCategory, searchQuery]);

  const fetchListings = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterListings = () => {
    let filtered = listings;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredListings(filtered);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Marketplace</h1>
            </div>
            
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search Marketplace"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-100 border-none focus:bg-white"
                />
              </div>
            </div>

            <Link href="/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Listingsssss
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="font-semibold text-lg mb-4">Categories</h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">📋</span>
                  <span>All Items</span>
                </button>
                
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                      selectedCategory === category.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold">
                  {selectedCategory === 'all' ? 'All Items' : 
                   categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <Badge variant="secondary">
                  {filteredListings.length} items
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Category Pills (Mobile) */}
            <div className="md:hidden mb-4 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                <Badge
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Items
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.icon} {category.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Listings Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a listing!'}
                </p>
                <Link href="/create">
                  <Button>Create First Listing</Button>
                </Link>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-4"
              }>
                {filteredListings.map((listing) => (
                  <Link key={listing.id} href={`/listing/${listing.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-0 shadow-sm hover:scale-[1.02]">
                      {viewMode === 'grid' ? (
                        <>
                          <div className="aspect-square relative overflow-hidden rounded-t-lg">
                            <Image
                              src={listing.image_url || '/placeholder-image.jpg'}
                              alt={listing.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                                <Heart className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="font-semibold text-lg text-gray-900 mb-1">
                              {formatPrice(listing.price)}
                            </div>
                            <div className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
                              {listing.title}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mb-2">
                              <MapPin className="w-3 h-3 mr-1" />
                              {listing.location}
                            </div>
                            <div className="text-xs text-gray-400">
                              Listed {formatDate(listing.created_at)}
                            </div>
                          </CardContent>
                        </>
                      ) : (
                        <div className="flex p-4 space-x-4">
                          <div className="w-24 h-24 relative overflow-hidden rounded-lg flex-shrink-0">
                            <Image
                              src={listing.image_url || '/placeholder-image.jpg'}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-lg text-gray-900 mb-1">
                                  {formatPrice(listing.price)}
                                </div>
                                <div className="text-sm font-medium text-gray-800 mb-1">
                                  {listing.title}
                                </div>
                                <div className="text-sm text-gray-600 mb-2 line-clamp-2">
                                  {listing.description}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {listing.location} · Listed {formatDate(listing.created_at)}
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                                <Heart className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}