import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Award, Eye, CheckCircle, XCircle, Clock, ExternalLink, FileText } from 'lucide-react';
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

const FacultyAchievements = () => {
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
      const data = await facultyAPI.getAchievements();
      setRecords(data.map((item: any) => ({
        id: item._id || item.id,
        facultyId: item.facultyId?._id || item.facultyId || user?.id || '',
        title: item.title,
        description: item.description,
        category: item.category,
        issuer: item.issuer,
        date: item.date ? new Date(item.date).toISOString().split('T')[0] : '',
        certificate: item.certificate,
        supportingDocument: item.supportingDocument,
        link: item.link,
        status: item.status || 'pending',
      })));
    } catch (error) {
      console.error('Failed to load achievements:', error);
      toast({ title: 'Failed to load achievements', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const certificateFile = (formData.get('certificate') as File);
    const supportingDocFile = (formData.get('supportingDocument') as File);
    
    const achievementData: any = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      issuer: formData.get('issuer') as string,
      date: formData.get('date') as string,
      link: formData.get('link') as string || undefined,
    };

    if (certificateFile && certificateFile.size > 0) {
      achievementData.certificate = certificateFile;
    }
    if (supportingDocFile && supportingDocFile.size > 0) {
      achievementData.supportingDocument = supportingDocFile;
    }

    try {
      if (editingRecord) {
        await facultyAPI.updateAchievement(editingRecord.id, achievementData);
        toast({ title: 'Achievement updated successfully' });
      } else {
        await facultyAPI.createAchievement(achievementData);
        toast({ title: 'Achievement added successfully' });
      }
      await loadRecords();
      setIsDialogOpen(false);
      setEditingRecord(null);
    } catch (error: any) {
      console.error('Failed to save achievement:', error);
      toast({ title: error.message || 'Failed to save achievement', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      await facultyAPI.deleteAchievement(id);
      toast({ title: 'Achievement deleted successfully', variant: 'destructive' });
      await loadRecords();
    } catch (error) {
      console.error('Failed to delete achievement:', error);
      toast({ title: 'Failed to delete achievement', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', icon: Clock },
      verified: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      award: 'bg-yellow-100 text-yellow-800',
      publication: 'bg-blue-100 text-blue-800',
      research: 'bg-purple-100 text-purple-800',
      patent: 'bg-green-100 text-green-800',
      recognition: 'bg-pink-100 text-pink-800',
      certification: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.other;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Achievements</h1>
          <p className="text-muted-foreground">Manage your professional achievements and recognitions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingRecord(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit' : 'Add New'} Achievement</DialogTitle>
              <DialogDescription>Record your professional achievements and recognitions</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={editingRecord?.title}
                  required
                  placeholder="e.g., Best Paper Award"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select name="category" defaultValue={editingRecord?.category || 'award'} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="award">Award</SelectItem>
                    <SelectItem value="publication">Publication</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="patent">Patent</SelectItem>
                    <SelectItem value="recognition">Recognition</SelectItem>
                    <SelectItem value="certification">Certification</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issuer">Issuer/Organization</Label>
                  <Input
                    id="issuer"
                    name="issuer"
                    defaultValue={editingRecord?.issuer}
                    placeholder="Organization name"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    defaultValue={editingRecord?.date}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingRecord?.description}
                  required
                  rows={3}
                  placeholder="Describe the achievement..."
                />
              </div>

              <div>
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  name="link"
                  type="url"
                  defaultValue={editingRecord?.link}
                  placeholder="https://..."
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
                  <Label htmlFor="supportingDocument">Supporting Document (PDF, JPG, PNG - Max 10MB)</Label>
                  <Input
                    id="supportingDocument"
                    name="supportingDocument"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="cursor-pointer"
                  />
                  {editingRecord?.supportingDocument && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current: {editingRecord.supportingDocument.split('/').pop()}
                    </p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingRecord ? 'Update' : 'Add'} Achievement
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No achievements found</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {records.map((achievement) => (
            <Card key={achievement.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      {achievement.title}
                    </CardTitle>
                    <CardDescription>
                      <Badge className={getCategoryColor(achievement.category)}>
                        {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                      </Badge>
                      {achievement.issuer && ` • ${achievement.issuer}`}
                    </CardDescription>
                  </div>
                  {getStatusBadge(achievement.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Date: </span>
                    <span className="font-medium">
                      {achievement.date ? new Date(achievement.date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <p className="text-sm">{achievement.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    {achievement.certificate && (
                      <a
                        href={`${API_BASE_URL.replace('/api', '')}${achievement.certificate}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Eye className="h-4 w-4" />
                        Certificate
                      </a>
                    )}
                    {achievement.supportingDocument && (
                      <a
                        href={`${API_BASE_URL.replace('/api', '')}${achievement.supportingDocument}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        Document
                      </a>
                    )}
                    {achievement.link && (
                      <a
                        href={achievement.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Link
                      </a>
                    )}
                  </div>

                  {achievement.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingRecord(achievement);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(achievement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyAchievements;
