import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { fetchAllEvents } from '@/api/events'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Skeleton } from './ui/skeleton'
import EventList from './EventList'
import EventForm from './EventForm'

export default function EventDashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const { data: events, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: fetchAllEvents,
  })

  const handleEditEvent = (event) => {
    setSelectedEvent(event)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedEvent(null)
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Events</CardTitle>
          <CardDescription>
            {error.message || 'Failed to load events. Please check if the backend server is running.'}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Events</h2>
          <p className="text-muted-foreground mt-1">
            Manage your events and attendees
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="lg" className="shadow-lg hover:shadow-xl transition-all">
          <Plus className="mr-2 h-5 w-5" />
          Create Event
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : events?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Events Yet</CardTitle>
            <CardDescription>
              Get started by creating your first event.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <EventList events={events} onEditEvent={handleEditEvent} />
      )}

      <EventForm
        open={isFormOpen}
        onClose={handleCloseForm}
        event={selectedEvent}
      />
    </div>
  )
}
