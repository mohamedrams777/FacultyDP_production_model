import { useState, useEffect } from 'react';
import { FileSpreadsheet, FileText, Search, Briefcase } from 'lucide-react';
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
    record.facultyId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                    <TableHead>Position</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record: any) => (
                    <TableRow key={record._id || record.id}>
                      <TableCell>{record.facultyId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.studentName}</div>
                          {record.studentRollNo && (
                            <div className="text-xs text-muted-foreground">{record.studentRollNo}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{record.companyName}</TableCell>
                      <TableCell>{record.position}</TableCell>
                      <TableCell>{record.duration ? `${record.duration} weeks` : 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
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
