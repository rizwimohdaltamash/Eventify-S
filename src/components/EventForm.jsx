import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEvent, updateEvent } from '@/api/events'
import { eventSchema } from '@/schemas/eventSchema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { useToast } from '@/hooks/use-toast'

export default function EventForm({ open, onClose, event }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: event || {},
  })

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        location: event.location,
        date: new Date(event.date).toISOString().split('T')[0],
        capacity: event.capacity,
      })
    } else {
      reset({
        title: '',
        description: '',
        location: '',
        date: '',
        capacity: 0,
      })
    }
  }, [event, reset])

  const mutation = useMutation({
    mutationFn: (data) => {
      if (event) {
        return updateEvent({ id: event.id, data })
      } else {
        return createEvent(data)
      }
    },
    // Optimistic update
    onMutate: async (newEvent) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['events'])

      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(['events'])

      // Optimistically update to the new value
      if (!event) {
        queryClient.setQueryData(['events'], (old) => {
          const optimisticEvent = {
            ...newEvent,
            id: 'temp-' + Date.now(),
            date: new Date(newEvent.date).toISOString(),
            attendees: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          return old ? [...old, optimisticEvent] : [optimisticEvent]
        })
      } else {
        queryClient.setQueryData(['events'], (old) => {
          return old?.map((e) =>
            e.id === event.id
              ? { ...e, ...newEvent, date: new Date(newEvent.date).toISOString() }
              : e
          )
        })
      }

      return { previousEvents }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
      toast({
        title: 'Success',
        description: event ? 'Event updated successfully' : 'Event created successfully',
      })
      onClose()
      reset()
    },
    onError: (error, newEvent, context) => {
      // Roll back to the previous value
      queryClient.setQueryData(['events'], context.previousEvents)
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Something went wrong',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events'])
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {event ? 'Update event details below' : 'Fill in the details to create a new event'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="e.g., Tech Conference 2024"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your event..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="e.g., New York Convention Center"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date')}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                placeholder="100"
                min="1"
              />
              {errors.capacity && (
                <p className="text-sm text-destructive">{errors.capacity.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : event ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
