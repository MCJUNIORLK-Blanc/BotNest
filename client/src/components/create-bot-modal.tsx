import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBotSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertBotSchema.extend({
  name: z.string().min(1, "Bot name is required"),
  language: z.enum(["nodejs", "python"]),
  template: z.enum(["basic", "music", "moderation", "economy"])
});

type FormData = z.infer<typeof formSchema>;

interface CreateBotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateBotModal({ open, onOpenChange }: CreateBotModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      language: "nodejs",
      template: "basic",
      mainFile: "index.js",
      autoRestart: true,
      environment: {}
    }
  });

  const language = watch("language");

  const createMutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("POST", "/api/bots", data),
    onSuccess: () => {
      toast({
        title: "Bot Created",
        description: "Your bot has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots"] });
      onOpenChange(false);
      reset();
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    // Set main file based on language
    const mainFile = data.language === "nodejs" ? "index.js" : "main.py";
    createMutation.mutate({ ...data, mainFile });
  };

  const templates = [
    { value: "basic", label: "Basic Bot", description: "Simple command bot" },
    { value: "music", label: "Music Bot", description: "Audio streaming bot" },
    { value: "moderation", label: "Moderation Bot", description: "Server management bot" },
    { value: "economy", label: "Economy Bot", description: "Virtual currency bot" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="create-bot-modal">
        <DialogHeader>
          <DialogTitle>Create New Bot</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Bot Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter bot name"
              data-testid="bot-name-input"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter bot description"
              data-testid="bot-description-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select 
              value={language}
              onValueChange={(value) => setValue("language", value as "nodejs" | "python")}
            >
              <SelectTrigger data-testid="bot-language-select">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nodejs">Node.js</SelectItem>
                <SelectItem value="python">Python</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select 
              value={watch("template")}
              onValueChange={(value) => setValue("template", value as FormData["template"])}
            >
              <SelectTrigger data-testid="bot-template-select">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {templates.find(t => t.value === watch("template"))?.description}
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              data-testid="create-button"
            >
              {createMutation.isPending ? "Creating..." : "Create Bot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
