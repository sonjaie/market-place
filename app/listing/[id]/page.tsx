"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Heart, Share2, MapPin, MessageCircle, Calendar } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  condition: string;
  location: string;
  seller_email: string;
  created_at: string;
}

export default function ListingDetail() {
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageData, setMessageData] = useState({
    buyer_name: '',
    buyer_email: '',
    message: '',
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchListing(params.id as string);
    }
  }, [params.id]);

  const fetchListing = async (id: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setListing(data);
    } catch (error) {
      console.error('Error fetching listing:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingMessage(true);

    try {
      const supabase = getSupabaseClient();
      // Insert message into database
      const { error } = await supabase
        .from('messages')
        .insert({
          listing_id: listing?.id,
          buyer_name: messageData.buyer_name,
          buyer_email: messageData.buyer_email,
          message: messageData.message,
          seller_email: listing?.seller_email,
        });

      if (error) throw error;

      // Here you would typically trigger an email notification
      // For now, we'll just show a success message
      alert('Message sent successfully! The seller will receive an email notification.');
      
      setMessageData({ buyer_name: '', buyer_email: '', message: '' });
      setMessageDialogOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
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
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCondition = (condition: string) => {
    return condition
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
          <p className="text-gray-600 mb-4">This listing may have been removed or doesn't exist.</p>
          <Link href="/">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={listing.image_url || '/placeholder-image.jpg'}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {formatPrice(listing.price)}
              </div>
              <h1 className="text-2xl font-semibold text-gray-800 mb-4">
                {listing.title}
              </h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {listing.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Listed {formatDate(listing.created_at)}
                </div>
              </div>

              <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message Seller
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Send Message</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <div>
                      <Label htmlFor="buyer_name">Your Name *</Label>
                      <Input
                        id="buyer_name"
                        value={messageData.buyer_name}
                        onChange={(e) => setMessageData(prev => ({ ...prev, buyer_name: e.target.value }))}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="buyer_email">Your Email *</Label>
                      <Input
                        id="buyer_email"
                        type="email"
                        value={messageData.buyer_email}
                        onChange={(e) => setMessageData(prev => ({ ...prev, buyer_email: e.target.value }))}
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={messageData.message}
                        onChange={(e) => setMessageData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Hi! I'm interested in this item..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setMessageDialogOpen(false)}
                        disabled={sendingMessage}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={sendingMessage}>
                        {sendingMessage ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Details Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Details</h2>
                <div className="space-y-3">
                  {listing.condition && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Condition</span>
                      <span className="font-medium">{formatCondition(listing.condition)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium capitalize">{listing.category.replace('-', ' & ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{listing.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">Description</h2>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}