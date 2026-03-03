import { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Search, Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminInternships = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getInternships();
      setRecords(data || []);
    } catch (error) {
      console.error('Failed to load internships:', error);
      toast({ title: 'Failed to load records', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record: any) =>
    record.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.facultyId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.regNo?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await adminAPI.updateInternshipStatus(id, status);
      toast({ 
        title: 'Status updated', 
        description: `Internship ${status} successfully` 
      });
      await loadRecords();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast({ 
        title: 'Failed to update status', 
        description: error.message || 'Something went wrong',
        variant: 'destructive' 
      });
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      records.map((record: any) => ({
        'Faculty': record.facultyId?.name || 'N/A',
        'Student Name': record.studentName,
        'Roll No': record.studentRollNo || 'N/A',
        'Company': record.companyName,
        'Position': record.position,
        'Start Date': record.startDate ? new Date(record.startDate).toLocaleDateString() : 'N/A',
        'End Date': record.endDate ? new Date(record.endDate).toLocaleDateString() : 'N/A',
        'Duration (weeks)': record.duration || 'N/A',
        'Stipend': record.stipend || 'N/A',
        'Status': record.status,
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Internships');
    XLSX.writeFile(workbook, 'Internship_Records.xlsx');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Internship Records', 14, 20);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28);

    autoTable(doc, {
      startY: 35,
      head: [['Faculty', 'Student', 'Company', 'Position', 'Duration', 'Status']],
      body: records.map((record: any) => [
        record.facultyId?.name || 'N/A',
        record.studentName,
        record.companyName,
        record.position,
        record.duration ? `${record.duration} weeks` : 'N/A',
        record.status,
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save('Internship_Records.pdf');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', label: 'Pending', icon: Clock },
      approved: { variant: 'default', label: 'Approved', icon: CheckCircle },
      rejected: { variant: 'destructive', label: 'Rejected', icon: XCircle },
      ongoing: { variant: 'default', label: 'Ongoing' },
      completed: { variant: 'default', label: 'Completed' },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Internship Activities</h1>
          <p className="text-muted-foreground">View all student internship records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={downloadPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Internship Records</CardTitle>
          <CardDescription>All student internship activities supervised by faculty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by faculty, student, or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No internship records found</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record: any) => (
                    <TableRow key={record._id || record.id}>
                      <TableCell>{record.facultyId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.studentName}</div>
                          {record.regNo && (
                            <div className="text-xs text-muted-foreground">{record.regNo}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{record.companyName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {record.mode || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.duration ? `${record.duration} ${record.durationUnit || 'weeks'}` : 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                      <TableCell>
                        {record.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 border-green-600"
                              onClick={() => handleStatusUpdate(record._id || record.id, 'approved')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 border-red-600"
                              onClick={() => handleStatusUpdate(record._id || record.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {record.status !== 'pending' && (
                          <span className="text-sm text-muted-foreground">Processed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInternships;
