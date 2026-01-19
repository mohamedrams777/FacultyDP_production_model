import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Clock, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { JointTeaching } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { facultyAPI } from '@/lib/api';

const FacultyJointTeaching = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<JointTeaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<JointTeaching | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await facultyAPI.getJointTeaching();
      setRecords(data.map((item: any) => ({
        id: item._id || item.id,
        facultyId: item.facultyId?._id || item.facultyId || user?.id || '',
        courseName: item.courseName,
        courseCode: item.courseCode,
        facultyInvolved: item.facultyInvolved,
        syllabusDoc: item.syllabusDoc,
        certificate: item.certificate,
        hours: item.hours,
      })));
    } catch (error) {
      console.error('Failed to load records:', error);
      toast({ title: 'Failed to load records', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const certificateFile = (formData.get('certificate') as File);
    
    const data: any = {
      courseName: formData.get('courseName') as string,
      courseCode: formData.get('courseCode') as string,
      facultyInvolved: formData.get('facultyInvolved') as string,
      hours: parseInt(formData.get('hours') as string),
    };

    if (certificateFile && certificateFile.size > 0) {
      data.certificate = certificateFile;
    }

    try {
      if (editingRecord) {
        await facultyAPI.updateJointTeaching(editingRecord.id, data);
        toast({ title: 'Joint teaching updated successfully' });
      } else {
        await facultyAPI.createJointTeaching(data);
        toast({ title: 'Joint teaching added successfully' });
      }
      await loadRecords();
      setIsDialogOpen(false);
      setEditingRecord(null);
    } catch (error: any) {
      console.error('Failed to save record:', error);
      toast({ title: error.message || 'Failed to save record', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await facultyAPI.deleteJointTeaching(id);
      toast({ title: 'Record deleted successfully', variant: 'destructive' });
      await loadRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast({ title: 'Failed to delete record', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Joint Teaching</h1>
          <p className="text-muted-foreground">Manage collaborative teaching courses (10-14 hours)</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRecord(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit' : 'Add'} Joint Teaching</DialogTitle>
              <DialogDescription>Fill in the joint teaching course details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="courseName">Course Name</Label>
                <Input id="courseName" name="courseName" defaultValue={editingRecord?.courseName} required />
              </div>
              <div>
                <Label htmlFor="courseCode">Course Code</Label>
                <Input id="courseCode" name="courseCode" defaultValue={editingRecord?.courseCode} required />
              </div>
              <div>
                <Label htmlFor="facultyInvolved">Faculty Involved</Label>
                <Input id="facultyInvolved" name="facultyInvolved" defaultValue={editingRecord?.facultyInvolved} placeholder="e.g., Prof. A, Dr. B" required />
              </div>
              <div>
                <Label htmlFor="hours">Hours (10-14)</Label>
                <Input id="hours" name="hours" type="number" min="10" max="14" defaultValue={editingRecord?.hours} required />
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
                {editingRecord ? 'Update' : 'Add'} Course
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No joint teaching records found</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {records.map((jt) => (
          <Card key={jt.id}>
            <CardHeader>
              <CardTitle>{jt.courseName}</CardTitle>
              <CardDescription>{jt.courseCode}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Faculty: </span>
                  <span className="font-medium">{jt.facultyInvolved}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{jt.hours} hours</span>
                </div>
                {jt.syllabusDoc && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Syllabus Available
                  </div>
                )}
                {jt.certificate && (
                  <div className="pt-2">
                    <a
                      href={`${API_BASE_URL.replace('/api', '')}${jt.certificate}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <Eye className="h-4 w-4" />
                      View Certificate
                    </a>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingRecord(jt);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(jt.id)}
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

export default FacultyJointTeaching;
