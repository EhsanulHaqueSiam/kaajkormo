import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, Video, Phone, MapPin, Users, Pencil } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { Tabs } from "../../components/ui/Tabs";
import { useInterviews } from "../../lib/queries/interviews";
import { formatDate } from "../../lib/utils";

export const Route = createFileRoute("/employer/interviews")({
  component: InterviewsPage,
});

const statusVariant: Record<string, "default" | "info" | "success" | "warning" | "danger"> = {
  scheduled: "info",
  confirmed: "success",
  completed: "success",
  cancelled: "danger",
  rescheduled: "warning",
};

const typeIcon: Record<string, React.ReactNode> = {
  video: <Video className="h-4 w-4" />,
  phone: <Phone className="h-4 w-4" />,
  in_person: <MapPin className="h-4 w-4" />,
  technical: <Pencil className="h-4 w-4" />,
  panel: <Users className="h-4 w-4" />,
};

function InterviewsPage() {
  const [tab, setTab] = useState("upcoming");
  const { data, isLoading } = useInterviews();
  const interviews = data?.data ?? [];

  const upcoming = interviews.filter((i) => i.status === "scheduled" || i.status === "confirmed");
  const past = interviews.filter((i) => i.status === "completed" || i.status === "cancelled");

  const displayed = tab === "upcoming" ? upcoming : past;

  const tabs = [
    { id: "upcoming", label: "Upcoming", count: upcoming.length },
    { id: "past", label: "Past", count: past.length },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
          <p className="mt-1 text-gray-500">Manage your interview schedule</p>
        </div>
        <Button icon={<Calendar className="h-4 w-4" />}>Schedule Interview</Button>
      </div>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} className="mb-6" />

      {displayed.length === 0 ? (
        <EmptyState
          title={tab === "upcoming" ? "No upcoming interviews" : "No past interviews"}
          description="Schedule interviews from the applicant pipeline."
        />
      ) : (
        <div className="space-y-3">
          {displayed.map((interview) => (
            <Card key={interview.id} className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                {typeIcon[interview.interview_type] ?? <Calendar className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 capitalize">{interview.interview_type.replace("_", " ")} Interview</p>
                  <Badge variant={statusVariant[interview.status] ?? "default"}>
                    {interview.status}
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(interview.scheduled_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {interview.duration_minutes} min
                  </span>
                  {interview.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {interview.location}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
