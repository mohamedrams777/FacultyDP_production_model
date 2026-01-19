import { useState, useEffect } from 'react';
import { Users, FileText, Award, Bell } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { adminAPI } from '@/lib/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalFaculty: 0,
    totalFDPs: 0,
    totalSeminars: 0,
    pendingApprovals: 0,
  });
  const [facultyProfiles, setFacultyProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [faculty, fdps, seminars] = await Promise.all([
        adminAPI.getFaculty(),
        adminAPI.getFDPAttended(),
        adminAPI.getSeminars(),
      ]);

      setStats({
        totalFaculty: faculty.length,
        totalFDPs: fdps.length,
        totalSeminars: seminars.length,
        pendingApprovals: fdps.filter((fdp: any) => fdp.status === 'pending').length,
      });
      setFacultyProfiles(faculty);
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast({ title: 'Failed to load dashboard stats', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const totalFDPs = stats.totalFDPs;
  const totalSeminars = stats.totalSeminars;
  const pendingApprovals = stats.pendingApprovals;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage faculty portfolios and records</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Faculty"
          value={stats.totalFaculty}
          icon={Users}
          description="Active members"
        />
        <StatCard
          title="Total FDPs"
          value={totalFDPs}
          icon={Award}
          description="All departments"
        />
        <StatCard
          title="Total Seminars"
          value={totalSeminars}
          icon={FileText}
          description="This year"
        />
        <StatCard
          title="Pending Approvals"
          value={pendingApprovals}
          icon={Bell}
          description="Requires attention"
          trend={pendingApprovals > 0 ? '!' : undefined}
        />
      </div>

      {/* Faculty Profiles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Faculty Profiles</CardTitle>
              <CardDescription>Overview of all faculty members</CardDescription>
            </div>
            <Button onClick={() => navigate('/admin/faculty')}>View All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 font-medium">Designation</th>
                  <th className="pb-3 font-medium">FDPs</th>
                  <th className="pb-3 font-medium">Seminars</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {facultyProfiles.slice(0, 5).map((faculty) => (
                  <tr key={faculty.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-foreground">{faculty.name}</p>
                        <p className="text-sm text-muted-foreground">{faculty.email}</p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-foreground">{faculty.department}</td>
                    <td className="py-4 text-sm text-foreground">{faculty.designation}</td>
                    <td className="py-4">
                      <Badge variant="secondary">{faculty.fdpCount}</Badge>
                    </td>
                    <td className="py-4">
                      <Badge variant="secondary">{faculty.seminarCount}</Badge>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default AdminDashboard;
