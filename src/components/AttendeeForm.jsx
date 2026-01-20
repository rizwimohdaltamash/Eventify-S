import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAttendee, updateAttendee } from '@/api/attendees'
import { attendeeSchema } from '@/schemas/attendeeSchema'
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
import { Label } from './ui/label'
import { useToast } from '@/hooks/use-toast'

export default function AttendeeForm({ open, onClose, eventId, attendee }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(attendeeSchema),
    defaultValues: attendee || {},
  })

  useEffect(() => {
    if (attendee) {
      reset({
        name: attendee.name,
        email: attendee.email,
      })
    } else {
      reset({
        name: '',
        email: '',
      })
    }
  }, [attendee, reset])

  const mutation = useMutation({
    mutationFn: (data) => {
      if (attendee) {
        return updateAttendee({ id: attendee.id, data })
      } else {
        return createAttendee({ ...data, eventId })
      }
    },
    // Optimistic update
    onMutate: async (newAttendee) => {
      await queryClient.cancelQueries(['events'])
      
      const previousEvents = queryClient.getQueryData(['events'])
      
      // Optimistically update events with new/updated attendee
      queryClient.setQueryData(['events'], (old) => {
        return old?.map((event) => {
          if (event.id === eventId) {
            if (!attendee) {
              // Adding new attendee
              const optimisticAttendee = {
                ...newAttendee,
                id: 'temp-' + Date.now(),
                eventId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              return {
                ...event,
                attendees: [...(event.attendees || []), optimisticAttendee],
              }
            } else {
              // Updating existing attendee
              return {
                ...event,
                attendees: event.attendees?.map((a) =>
                  a.id === attendee.id ? { ...a, ...newAttendee } : a
                ),
              }
            }
          }
          return event
        })
      })
      
      return { previousEvents }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
      queryClient.invalidateQueries(['publicEvents'])
      toast({
        title: 'Success',
        description: attendee ? 'Attendee updated successfully' : 'Attendee added successfully',
      })
      onClose()
      reset()
    },
    onError: (error, newAttendee, context) => {
      // Roll back on error
      queryClient.setQueryData(['events'], context.previousEvents)
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Something went wrong',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events'])
      queryClient.invalidateQueries(['publicEvents'])
    },
  })

  const onSubmit = (data) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{attendee ? 'Edit Attendee' : 'Add Attendee'}</DialogTitle>
          <DialogDescription>
            {attendee
              ? 'Update attendee information below'
              : 'Enter the details for the new attendee'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : attendee ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
