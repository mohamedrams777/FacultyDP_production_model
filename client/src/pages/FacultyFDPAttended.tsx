import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FDPAttended } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { facultyAPI } from '@/lib/api';

const FacultyFDPAttended = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<FDPAttended[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FDPAttended | null>(null);
  const [mode, setMode] = useState<'online' | 'offline'>('online');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await facultyAPI.getFDPAttended();
      setRecords(data.map((item: any) => ({
        id: item._id || item.id,
        facultyId: item.facultyId?._id || item.facultyId || user?.id || '',
        title: item.title,
        mode: item.mode,
        duration: item.duration,
        venue: item.venue,
        reportUpload: item.reportUpload,
        proofDoc: item.proofDoc,
        certificate: item.certificate,
        status: item.status || 'pending',
      })));
    } catch (error) {
      console.error('Failed to load FDP records:', error);
      toast({ title: 'Failed to load FDP records', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const certificateFile = (formData.get('certificate') as File);
    
    const fdpData: any = {
      title: formData.get('title') as string,
      mode: mode,
      duration: formData.get('duration') as string,
      venue: formData.get('venue') as string,
    };

    if (certificateFile && certificateFile.size > 0) {
      fdpData.certificate = certificateFile;
    }

    try {
      if (editingRecord) {
        await facultyAPI.updateFDPAttended(editingRecord.id, fdpData);
        toast({ title: 'FDP updated successfully' });
      } else {
        await facultyAPI.createFDPAttended(fdpData);
        toast({ title: 'FDP added successfully' });
      }
      await loadRecords();
      setIsDialogOpen(false);
      setEditingRecord(null);
      setMode('online');
    } catch (error: any) {
      console.error('Failed to save FDP:', error);
      toast({ title: error.message || 'Failed to save FDP', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FDP record?')) return;
    
    try {
      await facultyAPI.deleteFDPAttended(id);
      toast({ title: 'FDP deleted successfully', variant: 'destructive' });
      await loadRecords();
    } catch (error) {
      console.error('Failed to delete FDP:', error);
      toast({ title: 'Failed to delete FDP', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attended FDPs</h1>
          <p className="text-muted-foreground">Manage your attended Faculty Development Programs</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingRecord(null);
              setMode('online');
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add FDP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit' : 'Add'} Attended FDP</DialogTitle>
              <DialogDescription>Fill in the details of the FDP you attended</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">FDP Title</Label>
                <Input id="title" name="title" defaultValue={editingRecord?.title} required />
              </div>
              <div>
                <Label htmlFor="mode">Mode</Label>
                <Select value={editingRecord?.mode || mode} onValueChange={(value) => setMode(value as 'online' | 'offline')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" name="duration" defaultValue={editingRecord?.duration} placeholder="e.g., 5 days" required />
              </div>
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" name="venue" defaultValue={editingRecord?.venue} required />
              </div>
              <div>
                <Label htmlFor="certificate">Certificate (PDF, JPG, PNG - Max 10MB)</Label>
                <Input
                  id="certificate"
                  name="certificate"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="cursor-pointer"
                />
                {editingRecord?.certificate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current certificate: {editingRecord.certificate.split('/').pop()}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full">
                {editingRecord ? 'Update' : 'Add'} FDP
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No FDP records found</div>
      ) : (
        <div className="grid gap-4">
          {records.map((fdp) => (
          <Card key={fdp.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>{fdp.title}</CardTitle>
                  <CardDescription>
                    {fdp.venue} • {fdp.duration}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={fdp.status === 'approved' ? 'default' : 'secondary'}>
                    {fdp.status}
                  </Badge>
                  <Badge variant="outline">{fdp.mode}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {fdp.reportUpload && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Report
                    </div>
                  )}
                  {fdp.proofDoc && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Proof Doc
                    </div>
                  )}
                  {fdp.certificate && (
                    <a
                      href={`${API_BASE_URL.replace('/api', '')}${fdp.certificate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View Certificate
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingRecord(fdp);
                      setMode(fdp.mode);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(fdp.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyFDPAttended;
