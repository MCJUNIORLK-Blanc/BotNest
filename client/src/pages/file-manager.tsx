import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TopBar from "@/components/layout/topbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FolderOpen, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Edit3,
  Save,
  X
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Bot, BotFile } from "@shared/schema";

export default function FileManager() {
  const [selectedBotId, setSelectedBotId] = useState<string>("");
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bots = [] } = useQuery<Bot[]>({
    queryKey: ["/api/bots"],
  });

  const { data: files = [] } = useQuery<BotFile[]>({
    queryKey: ["/api/bots", selectedBotId, "files"],
    enabled: !!selectedBotId,
  });

  const updateFileMutation = useMutation({
    mutationFn: ({ fileId, content }: { fileId: string; content: string }) =>
      apiRequest("PUT", `/api/bots/${selectedBotId}/files/${fileId}`, { content }),
    onSuccess: () => {
      toast({
        title: "File Updated",
        description: "File saved successfully",
      });
      setEditingFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/bots", selectedBotId, "files"] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) =>
      apiRequest("DELETE", `/api/bots/${selectedBotId}/files/${fileId}`),
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "File removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bots", selectedBotId, "files"] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditFile = (file: BotFile) => {
    setEditingFile(file.id);
    setFileContent(file.content || "");
  };

  const handleSaveFile = () => {
    if (editingFile) {
      updateFileMutation.mutate({ fileId: editingFile, content: fileContent });
    }
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
    setFileContent("");
  };

  const selectedBot = bots.find(bot => bot.id === selectedBotId);

  return (
    <>
      <TopBar
        title="File Manager"
        description="Manage bot files and configurations"
      />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bot Selection and File Tree */}
          <div className="card-gradient rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Select Bot</h3>
              <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                <SelectTrigger data-testid="bot-select">
                  <SelectValue placeholder="Choose a bot..." />
                </SelectTrigger>
                <SelectContent>
                  {bots.map(bot => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedBotId && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground">Files</h4>
                  <Button size="sm" variant="outline" data-testid="upload-file-button">
                    <Upload size={14} className="mr-1" />
                    Upload
                  </Button>
                </div>

                <div className="space-y-2 file-tree">
                  {files.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No files found</p>
                  ) : (
                    files.map(file => (
                      <div 
                        key={file.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
                        data-testid={`file-item-${file.id}`}
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {file.isDirectory ? (
                            <FolderOpen size={16} className="text-primary flex-shrink-0" />
                          ) : (
                            <FileText size={16} className="text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="text-sm truncate file">{file.fileName}</span>
                        </div>
                        
                        {!file.isDirectory && (
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditFile(file)}
                              data-testid={`edit-file-${file.id}`}
                            >
                              <Edit3 size={12} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteFileMutation.mutate(file.id)}
                              data-testid={`delete-file-${file.id}`}
                            >
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* File Editor */}
          <div className="lg:col-span-2 card-gradient rounded-lg border border-border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  {editingFile ? "File Editor" : "File Preview"}
                </h3>
                {editingFile && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={handleSaveFile}
                      disabled={updateFileMutation.isPending}
                      data-testid="save-file-button"
                    >
                      <Save size={14} className="mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                      data-testid="cancel-edit-button"
                    >
                      <X size={14} className="mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              {!selectedBotId ? (
                <div className="text-center py-12">
                  <FolderOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a bot to view its files</p>
                </div>
              ) : editingFile ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Editing: {files.find(f => f.id === editingFile)?.fileName}
                  </div>
                  <textarea
                    value={fileContent}
                    onChange={(e) => setFileContent(e.target.value)}
                    className="w-full h-96 p-4 bg-input border border-border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="File content..."
                    data-testid="file-content-editor"
                  />
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No files in this bot</p>
                  <Button data-testid="create-file-button">
                    <Upload size={16} className="mr-2" />
                    Upload First File
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a file to edit</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bot Info Card */}
        {selectedBot && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Bot Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium">{selectedBot.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Language:</span>
                  <p className="font-medium">{selectedBot.language === "nodejs" ? "Node.js" : "Python"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Main File:</span>
                  <p className="font-medium">{selectedBot.mainFile}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
