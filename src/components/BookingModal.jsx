import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema } from '../schemas/authSchema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookEvent } from '../api/attendees';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function BookingModal({ event, open, onOpenChange }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const bookingMutation = useMutation({
    mutationFn: bookEvent,
    onSuccess: () => {
      setBookingSuccess(true);
      toast({
        title: 'Booking Submitted!',
        description: 'Your booking request is pending admin approval',
      });
      
      // Immediately refetch to update the UI
      queryClient.refetchQueries({ queryKey: ['publicEvents'] });
      queryClient.invalidateQueries({ queryKey: ['publicEvents'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      
      setTimeout(() => {
        setBookingSuccess(false);
        reset();
        onOpenChange(false);
      }, 2000);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error || 'Failed to book event';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleConfirmBooking = () => {
    if (isAuthenticated) {
      // For authenticated users, book directly with their info
      bookingMutation.mutate({
        eventId: event.id,
        name: user.name,
        email: user.email,
        userId: user.id,
      });
    }
  };

  const onSubmit = (data) => {
    // For guest users
    bookingMutation.mutate({
      eventId: event.id,
      name: data.name,
      email: data.email,
      userId: undefined,
    });
  };

  const handleClose = () => {
    if (!bookingMutation.isPending) {
      reset();
      setBookingSuccess(false);
      onOpenChange(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {bookingSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-yellow-500 mb-4" />
            <DialogTitle className="text-2xl mb-2">Booking Submitted!</DialogTitle>
            <DialogDescription className="text-center">
              Your booking request for {event.title} is pending admin approval.<br />
              <span className="text-sm text-muted-foreground mt-2 block">
                You will be notified once the admin reviews your request.
              </span>
            </DialogDescription>
          </div>
        ) : isAuthenticated ? (
          // For logged-in users: Show confirmation dialog
          <>
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
              <DialogDescription>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <p className="text-center text-gray-700 font-medium text-lg">
                Are you sure you want to book this event?
              </p>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={bookingMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={bookingMutation.isPending}
                  className="flex-1"
                >
                  {bookingMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Book Now
                </Button>
              </div>
            </div>
          </>
        ) : (
          // For guest users: Show form
          <>
            <DialogHeader>
              <DialogTitle>Book Event</DialogTitle>
              <DialogDescription>
                {event.title} - {new Date(event.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  {...register('name')}
                  disabled={bookingMutation.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register('email')}
                  disabled={bookingMutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  Booking as a guest. Want to save your bookings?{' '}
                  <a href="/login" className="underline font-medium">
                    Login
                  </a>{' '}
                  or{' '}
                  <a href="/signup" className="underline font-medium">
                    Sign up
                  </a>
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={bookingMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={bookingMutation.isPending}
                  className="flex-1"
                >
                  {bookingMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm Booking
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
