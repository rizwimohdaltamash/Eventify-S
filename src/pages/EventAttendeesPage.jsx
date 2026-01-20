import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchAllEvents } from '@/api/events'
import { Button } from '@/components/ui/button'
import AttendeeList from '@/components/AttendeeList'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function EventAttendeesPage() {
  const { eventId } = useParams()
  const navigate = useNavigate()

  const { data: events, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: fetchAllEvents,
  })

  const event = events?.find(e => e.id === eventId)

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event not found</h2>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <CardTitle className="text-3xl text-blue-900">{event.title}</CardTitle>
            <CardDescription className="text-base mt-2">{event.description}</CardDescription>
            <div className="flex gap-6 mt-4 text-sm">
              <div>
                <span className="font-semibold">Location:</span> {event.location}
              </div>
              <div>
                <span className="font-semibold">Date:</span> {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div>
                <span className="font-semibold">Capacity:</span> {event.attendees?.length || 0} / {event.capacity}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <AttendeeList eventId={event.id} attendees={event.attendees || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
