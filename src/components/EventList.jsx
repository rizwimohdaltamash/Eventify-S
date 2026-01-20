import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, MapPin, Users, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { deleteEvent } from '@/api/events'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

export default function EventList({ events, onEditEvent }) {
  const navigate = useNavigate()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    // Optimistic update for delete
    onMutate: async (deletedEventId) => {
      await queryClient.cancelQueries(['events'])
      
      const previousEvents = queryClient.getQueryData(['events'])
      
      // Optimistically remove the event
      queryClient.setQueryData(['events'], (old) => {
        return old?.filter((event) => event.id !== deletedEventId)
      })
      
      return { previousEvents }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['events'])
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      })
    },
    onError: (error, deletedEventId, context) => {
      // Roll back on error
      queryClient.setQueryData(['events'], context.previousEvents)
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete event',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events'])
    },
  })

  const handleDelete = (eventId) => {
    setEventToDelete(eventId)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = () => {
    if (eventToDelete) {
      deleteMutation.mutate(eventToDelete)
      setDeleteConfirmOpen(false)
      setEventToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmOpen(false)
    setEventToDelete(null)
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {events?.map((event) => {
        return (
        <Card key={event.id} className="overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 flex flex-col" data-event-id={event.id}>
          <CardHeader className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-b flex-shrink-0">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-h-0">
                <CardTitle className="text-xl mb-2 text-blue-900 line-clamp-1">{event.title}</CardTitle>
                <CardDescription className="mt-2 line-clamp-2">
                  {event.description}
                </CardDescription>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-semibold">{event.attendees?.length || 0} / {event.capacity}</span>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm">
                      {event.capacity - (event.attendees?.length || 0)} spots left
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEditEvent(event)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(event.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Button
              variant="default"
              className="w-full mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => navigate(`/admin/events/${event.id}/attendees`)}
            >
              <Users className="h-4 w-4 mr-2" />
              {event.attendees && event.attendees.length > 0
                ? `View Attendees (${event.attendees.length})`
                : 'Manage Attendees'}
            </Button>
          </CardContent>
        </Card>
        )
      })}

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <DialogTitle className="text-xl">Delete Event</DialogTitle>
            </div>
            <DialogDescription className="pt-3 text-base">
              Are you sure you want to delete this event? This action cannot be undone.
              <span className="block mt-2 font-semibold text-red-600">
                All attendees will also be permanently removed.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={cancelDelete}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
