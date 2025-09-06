import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopBar from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  RefreshCw, 
  Download, 
  Upload,
  Shield,
  Server,
  Database,
  Bell,
  Palette,
  Globe,
  HardDrive,
  Cpu,
  Settings2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useSystemStats } from "@/hooks/use-system-stats";

interface SystemSettings {
  autoRestart: boolean;
  maxMemoryUsage: number;
  maxCpuUsage: number;
  logRetentionDays: number;
  enableNotifications: boolean;
  notificationWebhook: string;
  systemTheme: string;
  defaultLanguage: string;
  maxConcurrentBots: number;
  enableAutoBackup: boolean;
  backupInterval: number;
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { stats } = useSystemStats();
  
  const [settings, setSettings] = useState<SystemSettings>({
    autoRestart: true,
    maxMemoryUsage: 80,
    maxCpuUsage: 90,
    logRetentionDays: 30,
    enableNotifications: true,
    notificationWebhook: "",
    systemTheme: "dark",
    defaultLanguage: "nodejs",
    maxConcurrentBots: 10,
    enableAutoBackup: true,
    backupInterval: 24,
  });

  const [hasChanges, setHasChanges] = useState(false);

  const saveSettingsMutation = useMutation({
    mutationFn: (newSettings: SystemSettings) => 
      apiRequest("PUT", "/api/system/settings", newSettings),
    onSuccess: () => {
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully",
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["/api/system/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSetting = <K extends keyof SystemSettings>(
    key: K, 
    value: SystemSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleReset = () => {
    setSettings({
      autoRestart: true,
      maxMemoryUsage: 80,
      maxCpuUsage: 90,
      logRetentionDays: 30,
      enableNotifications: true,
      notificationWebhook: "",
      systemTheme: "dark",
      defaultLanguage: "nodejs",
      maxConcurrentBots: 10,
      enableAutoBackup: true,
      backupInterval: 24,
    });
    setHasChanges(true);
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'botcommander-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings(importedSettings);
        setHasChanges(true);
        toast({
          title: "Settings Imported",
          description: "Settings have been imported successfully",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid settings file",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <TopBar
        title="Settings"
        description="Configure system settings and preferences"
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Save Bar */}
        {hasChanges && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings2 className="text-primary" size={20} />
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  data-testid="reset-settings-button"
                >
                  <RefreshCw size={16} className="mr-1" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saveSettingsMutation.isPending}
                  data-testid="save-settings-button"
                >
                  <Save size={16} className="mr-1" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Server className="text-primary" size={20} />
                <span>System Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Auto-restart Failed Bots</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically restart bots when they crash
                  </p>
                </div>
                <Switch
                  checked={settings.autoRestart}
                  onCheckedChange={(checked) => updateSetting("autoRestart", checked)}
                  data-testid="auto-restart-switch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMemory">Max Memory Usage (%)</Label>
                <Input
                  id="maxMemory"
                  type="number"
                  min="50"
                  max="95"
                  value={settings.maxMemoryUsage}
                  onChange={(e) => updateSetting("maxMemoryUsage", parseInt(e.target.value))}
                  data-testid="max-memory-input"
                />
                <p className="text-xs text-muted-foreground">
                  System will alert when memory usage exceeds this threshold
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxCpu">Max CPU Usage (%)</Label>
                <Input
                  id="maxCpu"
                  type="number"
                  min="50"
                  max="95"
                  value={settings.maxCpuUsage}
                  onChange={(e) => updateSetting("maxCpuUsage", parseInt(e.target.value))}
                  data-testid="max-cpu-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxBots">Max Concurrent Bots</Label>
                <Input
                  id="maxBots"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.maxConcurrentBots}
                  onChange={(e) => updateSetting("maxConcurrentBots", parseInt(e.target.value))}
                  data-testid="max-concurrent-bots-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Application Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="text-primary" size={20} />
                <span>Application Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">System Theme</Label>
                <Select 
                  value={settings.systemTheme}
                  onValueChange={(value) => updateSetting("systemTheme", value)}
                >
                  <SelectTrigger data-testid="theme-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultLang">Default Bot Language</Label>
                <Select 
                  value={settings.defaultLanguage}
                  onValueChange={(value) => updateSetting("defaultLanguage", value)}
                >
                  <SelectTrigger data-testid="default-language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nodejs">Node.js</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logRetention">Log Retention (days)</Label>
                <Input
                  id="logRetention"
                  type="number"
                  min="1"
                  max="365"
                  value={settings.logRetentionDays}
                  onChange={(e) => updateSetting("logRetentionDays", parseInt(e.target.value))}
                  data-testid="log-retention-input"
                />
                <p className="text-xs text-muted-foreground">
                  Logs older than this will be automatically deleted
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="text-primary" size={20} />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send alerts for system events
                  </p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => updateSetting("enableNotifications", checked)}
                  data-testid="notifications-switch"
                />
              </div>

              {settings.enableNotifications && (
                <div className="space-y-2">
                  <Label htmlFor="webhook">Discord Webhook URL</Label>
                  <Input
                    id="webhook"
                    type="url"
                    placeholder="https://discord.com/api/webhooks/..."
                    value={settings.notificationWebhook}
                    onChange={(e) => updateSetting("notificationWebhook", e.target.value)}
                    data-testid="webhook-input"
                  />
                  <p className="text-xs text-muted-foreground">
                    Webhook URL for sending Discord notifications
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="text-primary" size={20} />
                <span>Backup & Storage</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup bot configurations
                  </p>
                </div>
                <Switch
                  checked={settings.enableAutoBackup}
                  onCheckedChange={(checked) => updateSetting("enableAutoBackup", checked)}
                  data-testid="auto-backup-switch"
                />
              </div>

              {settings.enableAutoBackup && (
                <div className="space-y-2">
                  <Label htmlFor="backupInterval">Backup Interval (hours)</Label>
                  <Input
                    id="backupInterval"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.backupInterval}
                    onChange={(e) => updateSetting("backupInterval", parseInt(e.target.value))}
                    data-testid="backup-interval-input"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSettings}
                  data-testid="export-settings-button"
                >
                  <Download size={16} className="mr-1" />
                  Export Settings
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    data-testid="import-settings-input"
                  />
                  <Button variant="outline" size="sm">
                    <Upload size={16} className="mr-1" />
                    Import Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Cpu className="text-primary" size={20} />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Platform</Label>
                <p className="font-mono text-sm">Linux x64</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Node.js Version</Label>
                <p className="font-mono text-sm">v18.17.1</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Memory Usage</Label>
                <p className="font-mono text-sm">
                  {stats ? `${(stats.memoryUsage / 1024).toFixed(1)}GB / ${(stats.memoryTotal / 1024).toFixed(1)}GB` : "Loading..."}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Uptime</Label>
                <p className="font-mono text-sm">
                  {Math.floor(process.uptime ? process.uptime() / 3600 : 0)}h {Math.floor((process.uptime ? process.uptime() : 0) % 3600 / 60)}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <Shield size={20} />
              <span>Danger Zone</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
              <div>
                <h4 className="font-medium text-destructive">Reset All Settings</h4>
                <p className="text-sm text-muted-foreground">
                  This will reset all settings to their default values
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                data-testid="reset-all-settings-button"
              >
                Reset All
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
              <div>
                <h4 className="font-medium text-destructive">Clear All Logs</h4>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all bot logs
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                data-testid="clear-all-logs-button"
              >
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
