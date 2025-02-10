import { type SavingsGoal } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit2, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import GoalForm from "./goal-form";

interface GoalCardProps {
  goal: SavingsGoal;
  onUpdate: (data: Partial<SavingsGoal>) => void;
  onDelete: () => void;
}

export default function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;
  const monthlyTarget = Number(goal.targetAmount) / (goal.yearsToSave * 12);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">{goal.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <GoalForm
                  defaultValues={goal}
                  onSubmit={(data) => onUpdate(data)}
                />
              </DialogContent>
            </Dialog>
            <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-lg font-semibold">
              ${Number(goal.targetAmount).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current</p>
            <p className="text-lg font-semibold">
              ${Number(goal.currentAmount).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Timeline</p>
            <p className="text-lg font-semibold">
              {goal.yearsToSave} {goal.yearsToSave === 1 ? 'year' : 'years'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Monthly Savings Needed</p>
          <p className="text-lg font-semibold">
            ${monthlyTarget.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}