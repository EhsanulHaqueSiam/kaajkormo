import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Trash2, Pause, Play, Mail } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { showToast } from "../../components/ui/Toast";
import {
  useJobAlerts,
  useCreateJobAlert,
  useUpdateJobAlert,
  useDeleteJobAlert,
} from "../../lib/queries/alerts";
import { formatDate } from "../../lib/utils";

export const Route = createFileRoute("/candidate/alerts")({
  component: AlertsPage,
});

const freqVariant: Record<string, "info" | "success" | "warning"> = {
  instant: "success",
  daily: "info",
  weekly: "warning",
};

function AlertsPage() {
  const { data, isLoading } = useJobAlerts();
  const createAlert = useCreateJobAlert();
  const updateAlert = useUpdateJobAlert();
  const deleteAlert = useDeleteJobAlert();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [frequency, setFrequency] = useState<"instant" | "daily" | "weekly">("daily");

  const alerts = data?.data ?? [];

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      await createAlert.mutateAsync({
        name,
        criteria: { keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean) },
        frequency,
      });
      showToast.success("Alert created!");
      setShowCreate(false);
      setName("");
      setKeywords("");
    } catch {
      showToast.error("Failed to create alert");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Alerts</h1>
          <p className="mt-1 text-gray-500">Get notified when new jobs match your criteria</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
          New Alert
        </Button>
      </div>

      {alerts.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-12 w-12" />}
          title="No job alerts"
          description="Create alerts to get notified about new jobs matching your criteria."
          action={{ label: "Create Alert", onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                    <Mail className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{alert.name}</p>
                      <Badge variant={freqVariant[alert.frequency]}>{alert.frequency}</Badge>
                      {!alert.is_active && <Badge variant="default">Paused</Badge>}
                    </div>
                    {alert.last_sent_at && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        Last sent: {formatDate(alert.last_sent_at)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={alert.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      onClick={() =>
                        updateAlert.mutate({ id: alert.id, is_active: !alert.is_active })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="h-4 w-4 text-danger-500" />}
                      onClick={() => deleteAlert.mutate(alert.id)}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Job Alert">
        <div className="space-y-4">
          <Input
            label="Alert Name"
            placeholder="e.g. React Developer Dhaka"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Keywords (comma separated)"
            placeholder="e.g. React, TypeScript, Remote"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Frequency</label>
            <div className="flex gap-2">
              {(["instant", "daily", "weekly"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    frequency === f
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={createAlert.isPending}>Create Alert</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
