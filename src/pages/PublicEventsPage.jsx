import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchPublicEvents } from '../api/events';
import { cancelBooking } from '../api/attendees';
import { deleteEvent } from '../api/events';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import BookingModal from '../components/BookingModal';
import EventForm from '../components/EventForm';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Calendar, MapPin, Users, XCircle, Ticket, Plus, Edit, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// Status badge component for booking status
const BookingStatusBadge = ({ status }) => {
  const statusConfig = {
    PENDING: { 
      label: 'Pending Approval', 
      icon: Clock,
      className: 'bg-yellow-50 text-yellow-700 border-yellow-200' 
    },
    APPROVED: { 
      label: 'Approved', 
      icon: CheckCircle,
      className: 'bg-green-50 text-green-700 border-green-200' 
    },
    REJECTED: { 
      label: 'Rejected', 
      icon: AlertCircle,
      className: 'bg-red-50 text-red-700 border-red-200' 
    },
    CANCELLED: { 
      label: 'Cancelled', 
      icon: XCircle,
      className: 'bg-gray-50 text-gray-700 border-gray-200' 
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${config.className}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  );
};

export default function PublicEventsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['publicEvents', isAuthenticated],
    queryFn: fetchPublicEvents,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Booking cancelled successfully',
      });
      queryClient.refetchQueries({ queryKey: ['publicEvents'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to cancel booking',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Event deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete event',
        variant: 'destructive',
      });
    },
  });

  const handleAddEvent = () => {
    setEditingEvent(null);
    setEventFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventFormOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      deleteMutation.mutate(eventId);
    }
  };

  const handleCloseEventForm = () => {
    setEventFormOpen(false);
    setEditingEvent(null);
  };

  const handleBookNow = (event) => {
    // Prevent booking if user has already booked
    if (isAuthenticated && event.userHasBooked) {
      toast({
        title: 'Already Booked',
        description: 'You have already booked this event. You can cancel your booking if needed.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedEvent(event);
    setBookingModalOpen(true);
  };

  const handleCancelBooking = (eventId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate(eventId);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 font-medium">Failed to load events</p>
          <p className="text-red-600 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'Manage Events' : 'Available Events'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin' 
              ? 'Create, edit, and manage all events' 
              : 'Browse and book upcoming events'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {user?.role === 'admin' && (
          <div className="mb-6">
            <Button onClick={handleAddEvent} size="lg" className="shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Create New Event
            </Button>
          </div>
        )}

        {/* Events Grid */}
        {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events?.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Calendar className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-600">Check back later for upcoming events</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events?.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">
                        {event.attendeeCount || 0} / {event.capacity}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Ticket className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {event.availableSlots || 0} available
                      </span>
                    </div>
                  </div>
                </div>

                {user?.role === 'admin' ? (
                  // Admin controls - Edit and Delete
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleEditEvent(event)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteEvent(event.id)}
                      disabled={deleteMutation.isPending}
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                ) : isAuthenticated && event.userHasBooked ? (
                  // User has booked - Show status and cancel option side by side
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <BookingStatusBadge status={event.userBookingStatus || 'PENDING'} />
                    </div>
                    {(event.userBookingStatus === 'PENDING' || event.userBookingStatus === 'APPROVED') && (
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelBooking(event.id)}
                        disabled={cancelMutation.isPending}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                ) : (
                  // User can book
                  <Button
                    onClick={() => handleBookNow(event)}
                    disabled={event.isFull || event.availableSlots === 0}
                    className="w-full"
                  >
                    {event.isFull || event.availableSlots === 0 ? 'Event Full' : 'Book Now'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      <BookingModal
        event={selectedEvent}
        open={bookingModalOpen}
        onOpenChange={setBookingModalOpen}
      />

      <EventForm
        open={eventFormOpen}
        onClose={handleCloseEventForm}
        event={editingEvent}
      />
    </div>
  );
}
