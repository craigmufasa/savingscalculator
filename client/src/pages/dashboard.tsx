import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type SavingsGoal } from "@shared/schema";
import GoalForm from "@/components/goal-form";
import GoalCard from "@/components/goal-card";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const { data: goals = [], isLoading } = useQuery<SavingsGoal[]>({
    queryKey: ["/api/goals"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<SavingsGoal, "id">) => {
      await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal created successfully" });
      setIsDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SavingsGoal> }) => {
      await apiRequest("PATCH", `/api/goals/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({ title: "Goal deleted successfully" });
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
          <img 
              src="/masusulogo.png"
              alt="Logo"
              className="h-12 w-12 object-cover rounded-lg"
            />
          <h1 className="text-4xl font-bold">Savings Goals</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <GoalForm
                onSubmit={(data) => createMutation.mutate(data)}
                isLoading={createMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[200px] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdate={(data) => updateMutation.mutate({ id: goal.id, data })}
                onDelete={() => deleteMutation.mutate(goal.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}