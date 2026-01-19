import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Briefcase, Eye, Calendar, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { facultyAPI } from '@/lib/api';

const FacultyInternships = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await facultyAPI.getInternships();
      setRecords(data.map((item: any) => ({
        id: item._id || item.id,
        facultyId: item.facultyId?._id || item.facultyId || user?.id || '',
        studentName: item.studentName,
        studentEmail: item.studentEmail,
        studentRollNo: item.studentRollNo,
        companyName: item.companyName,
        companyAddress: item.companyAddress,
        position: item.position,
        startDate: item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '',
        endDate: item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '',
        duration: item.duration,
        stipend: item.stipend,
        description: item.description,
        skillsGained: item.skillsGained || [],
        projectTitle: item.projectTitle,
        supervisorName: item.supervisorName,
        status: item.status || 'ongoing',
        certificate: item.certificate,
        report: item.report,
        feedback: item.feedback,
      })));
    } catch (error) {
      console.error('Failed to load internships:', error);
      toast({ title: 'Failed to load internships', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const certificateFile = (formData.get('certificate') as File);
    const reportFile = (formData.get('report') as File);
    
    const internshipData: any = {
      studentName: formData.get('studentName') as string,
      studentEmail: formData.get('studentEmail') as string,
      studentRollNo: formData.get('studentRollNo') as string,
      companyName: formData.get('companyName') as string,
      companyAddress: formData.get('companyAddress') as string,
      position: formData.get('position') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      duration: parseInt(formData.get('duration') as string) || undefined,
      stipend: formData.get('stipend') ? parseFloat(formData.get('stipend') as string) : undefined,
      description: formData.get('description') as string,
      skillsGained: (formData.get('skillsGained') as string)?.split(',').map(s => s.trim()).filter(Boolean),
      projectTitle: formData.get('projectTitle') as string,
      supervisorName: formData.get('supervisorName') as string,
      status: formData.get('status') as string,
      feedback: formData.get('feedback') as string,
    };

    if (certificateFile && certificateFile.size > 0) {
      internshipData.certificate = certificateFile;
    }
    if (reportFile && reportFile.size > 0) {
      internshipData.report = reportFile;
    }

    try {
      if (editingRecord) {
        await facultyAPI.updateInternship(editingRecord.id, internshipData);
        toast({ title: 'Internship updated successfully' });
      } else {
        await facultyAPI.createInternship(internshipData);
        toast({ title: 'Internship record added successfully' });
      }
      await loadRecords();
      setIsDialogOpen(false);
      setEditingRecord(null);
    } catch (error: any) {
      console.error('Failed to save internship:', error);
      toast({ title: error.message || 'Failed to save internship', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this internship record?')) return;
    
    try {
      await facultyAPI.deleteInternship(id);
      toast({ title: 'Internship deleted successfully', variant: 'destructive' });
      await loadRecords();
    } catch (error) {
      console.error('Failed to delete internship:', error);
      toast({ title: 'Failed to delete internship', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      ongoing: { variant: 'default', label: 'Ongoing' },
      completed: { variant: 'default', label: 'Completed' },
      terminated: { variant: 'destructive', label: 'Terminated' },
    };
    const config = variants[status] || variants.ongoing;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Internship Activities</h1>
          <p className="text-muted-foreground">Manage student internships supervised by you</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRecord(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit' : 'Add New'} Internship Record</DialogTitle>
              <DialogDescription>Record details of student internships you supervise</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    defaultValue={editingRecord?.studentName}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="studentRollNo">Roll Number</Label>
                  <Input
                    id="studentRollNo"
                    name="studentRollNo"
                    defaultValue={editingRecord?.studentRollNo}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="studentEmail">Student Email</Label>
                <Input
                  id="studentEmail"
                  name="studentEmail"
                  type="email"
                  defaultValue={editingRecord?.studentEmail}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    defaultValue={editingRecord?.companyName}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    name="position"
                    defaultValue={editingRecord?.position}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  name="companyAddress"
                  defaultValue={editingRecord?.companyAddress}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={editingRecord?.startDate}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={editingRecord?.endDate}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    defaultValue={editingRecord?.duration}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stipend">Stipend Amount</Label>
                  <Input
                    id="stipend"
                    name="stipend"
                    type="number"
                    step="0.01"
                    defaultValue={editingRecord?.stipend}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select name="status" defaultValue={editingRecord?.status || 'ongoing'} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="projectTitle">Project Title</Label>
                <Input
                  id="projectTitle"
                  name="projectTitle"
                  defaultValue={editingRecord?.projectTitle}
                />
              </div>

              <div>
                <Label htmlFor="supervisorName">Company Supervisor Name</Label>
                <Input
                  id="supervisorName"
                  name="supervisorName"
                  defaultValue={editingRecord?.supervisorName}
                />
              </div>

              <div>
                <Label htmlFor="skillsGained">Skills Gained (comma-separated)</Label>
                <Input
                  id="skillsGained"
                  name="skillsGained"
                  defaultValue={editingRecord?.skillsGained?.join(', ')}
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingRecord?.description}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  name="feedback"
                  defaultValue={editingRecord?.feedback}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                      Current: {editingRecord.certificate.split('/').pop()}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="report">Internship Report (PDF - Max 10MB)</Label>
                  <Input
                    id="report"
                    name="report"
                    type="file"
                    accept=".pdf"
                    className="cursor-pointer"
                  />
                  {editingRecord?.report && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {editingRecord.report.split('/').pop()}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingRecord ? 'Update' : 'Add'} Internship
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No internship records found</div>
      ) : (
        <div className="grid gap-4">
          {records.map((internship) => (
            <Card key={internship.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      {internship.studentName}
                    </CardTitle>
                    <CardDescription>
                      {internship.position} at {internship.companyName}
                    </CardDescription>
                  </div>
                  {getStatusBadge(internship.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Period: </span>
                      <span className="font-medium">
                        {internship.startDate ? new Date(internship.startDate).toLocaleDateString() : 'N/A'} - {' '}
                        {internship.endDate ? new Date(internship.endDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration: </span>
                      <span className="font-medium">{internship.duration || 'N/A'} weeks</span>
                    </div>
                  </div>

                  {internship.projectTitle && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Project: </span>
                      <span className="font-medium">{internship.projectTitle}</span>
                    </div>
                  )}

                  {internship.skillsGained && internship.skillsGained.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Skills: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {internship.skillsGained.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {internship.stipend && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Stipend: </span>
                      <span className="font-medium">₹{internship.stipend.toLocaleString()}</span>
                    </div>
                  )}

                  {internship.description && (
                    <p className="text-sm text-muted-foreground">{internship.description}</p>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    {internship.certificate && (
                      <a
                        href={`${API_BASE_URL.replace('/api', '')}${internship.certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Eye className="h-4 w-4" />
                        Certificate
                      </a>
                    )}
                    {internship.report && (
                      <a
                        href={`${API_BASE_URL.replace('/api', '')}${internship.report}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Eye className="h-4 w-4" />
                        Report
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRecord(internship);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(internship.id)}
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

export default FacultyInternships;
