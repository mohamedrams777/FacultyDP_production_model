import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Eye, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
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

const FacultyFDPReimbursement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [records, setRecords] = useState<any[]>([]);
  const [fdps, setFdps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [selectedFdpId, setSelectedFdpId] = useState('');
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    loadRecords();
    loadFDPs();
  }, []);

  const loadFDPs = async () => {
    try {
      const data = await facultyAPI.getFDPAttended();
      setFdps(data);
    } catch (error) {
      console.error('Failed to load FDPs:', error);
    }
  };

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await facultyAPI.getReimbursements();
      setRecords(data.map((item: any) => ({
        id: item._id || item.id,
        facultyId: item.facultyId?._id || item.facultyId || user?.id || '',
        fdpId: item.fdpId?._id || item.fdpId || '',
        fdpTitle: item.fdpTitle,
        amount: item.amount,
        currency: item.currency || 'INR',
        expenseType: item.expenseType,
        description: item.description,
        receiptDocument: item.receiptDocument,
        bankDetails: item.bankDetails,
        status: item.status || 'pending',
        submittedDate: item.submittedDate,
        reviewComments: item.reviewComments,
      })));
    } catch (error) {
      console.error('Failed to load reimbursements:', error);
      toast({ title: 'Failed to load reimbursements', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const receiptFile = (formData.get('receiptDocument') as File);
    
    const fdpId = selectedFdpId || editingRecord?.fdpId || formData.get('fdpId');
    const selectedFDP = fdps.find((f: any) => (f._id || f.id) === fdpId);
    
    const reimbursementData: any = {
      fdpId: fdpId as string,
      fdpTitle: selectedFDP?.title || editingRecord?.fdpTitle || formData.get('fdpTitle') as string,
      amount: parseFloat(formData.get('amount') as string),
      currency: formData.get('currency') as string || 'INR',
      expenseType: formData.get('expenseType') as string,
      description: formData.get('description') as string,
      bankDetails: {
        accountNumber: formData.get('accountNumber') as string,
        ifscCode: formData.get('ifscCode') as string,
        bankName: formData.get('bankName') as string,
        accountHolderName: formData.get('accountHolderName') as string,
      },
    };

    if (receiptFile && receiptFile.size > 0) {
      reimbursementData.receiptDocument = receiptFile;
    }

    try {
      if (editingRecord) {
        await facultyAPI.updateReimbursement(editingRecord.id, reimbursementData);
        toast({ title: 'Reimbursement updated successfully' });
      } else {
        await facultyAPI.createReimbursement(reimbursementData);
        toast({ title: 'Reimbursement request submitted successfully' });
      }
      await loadRecords();
      setIsDialogOpen(false);
      setEditingRecord(null);
      setSelectedFdpId('');
    } catch (error: any) {
      console.error('Failed to save reimbursement:', error);
      toast({ title: error.message || 'Failed to save reimbursement', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reimbursement request?')) return;
    
    try {
      await facultyAPI.deleteReimbursement(id);
      toast({ title: 'Reimbursement deleted successfully', variant: 'destructive' });
      await loadRecords();
    } catch (error) {
      console.error('Failed to delete reimbursement:', error);
      toast({ title: 'Failed to delete reimbursement', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      processed: { variant: 'default', icon: CheckCircle },
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">FDP Reimbursements</h1>
          <p className="text-muted-foreground">Manage your FDP reimbursement requests</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingRecord(null);
              setSelectedFdpId('');
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Request Reimbursement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit' : 'New'} Reimbursement Request</DialogTitle>
              <DialogDescription>Submit a reimbursement request for FDP expenses</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fdpId">FDP Attended *</Label>
                <Select 
                  value={editingRecord?.fdpId || selectedFdpId} 
                  onValueChange={(value) => setSelectedFdpId(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select FDP" />
                  </SelectTrigger>
                  <SelectContent>
                    {fdps.map((fdp: any) => (
                      <SelectItem key={fdp._id || fdp.id} value={fdp._id || fdp.id}>
                        {fdp.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="fdpId" value={selectedFdpId || editingRecord?.fdpId} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={editingRecord?.amount}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select name="currency" defaultValue={editingRecord?.currency || 'INR'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="expenseType">Expense Type *</Label>
                <Select name="expenseType" defaultValue={editingRecord?.expenseType || 'travel'} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="accommodation">Accommodation</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label htmlFor="receiptDocument">Receipt Document (PDF, JPG, PNG - Max 10MB)</Label>
                <Input
                  id="receiptDocument"
                  name="receiptDocument"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="cursor-pointer"
                />
                {editingRecord?.receiptDocument && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current receipt: {editingRecord.receiptDocument.split('/').pop()}
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Bank Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                    <Input
                      id="accountHolderName"
                      name="accountHolderName"
                      defaultValue={editingRecord?.bankDetails?.accountHolderName}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="accountNumber">Account Number *</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      defaultValue={editingRecord?.bankDetails?.accountNumber}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code *</Label>
                    <Input
                      id="ifscCode"
                      name="ifscCode"
                      defaultValue={editingRecord?.bankDetails?.ifscCode}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Bank Name *</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      defaultValue={editingRecord?.bankDetails?.bankName}
                      required
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                {editingRecord ? 'Update' : 'Submit'} Request
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No reimbursement requests found</div>
      ) : (
        <div className="grid gap-4">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      {record.fdpTitle}
                    </CardTitle>
                    <CardDescription>
                      {record.expenseType.charAt(0).toUpperCase() + record.expenseType.slice(1)} Expense
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(record.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount: </span>
                      <span className="font-medium">{record.currency} {record.amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted: </span>
                      <span className="font-medium">
                        {record.submittedDate ? new Date(record.submittedDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {record.description && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Description: </span>
                      <span>{record.description}</span>
                    </div>
                  )}

                  {record.reviewComments && (
                    <div className="text-sm p-3 bg-muted rounded-md">
                      <span className="text-muted-foreground">Review Comments: </span>
                      <span>{record.reviewComments}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {record.receiptDocument && (
                        <a
                          href={`${API_BASE_URL.replace('/api', '')}${record.receiptDocument}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Eye className="h-4 w-4" />
                          View Receipt
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {record.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingRecord(record);
                              setSelectedFdpId(record.fdpId);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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

export default FacultyFDPReimbursement;
