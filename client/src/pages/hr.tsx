import { useState } from 'react';
import { Plus, Users, Calendar, DollarSign, Clock, MapPin, Mail, Phone, Edit2, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import type { Employee, Attendance, Payroll } from '@shared/schema';

interface EmployeeFormData {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: string;
  hireDate: string;
  status: string;
  locationId: number;
  skills: string;
  notes: string;
}

interface AttendanceFormData {
  employeeId: number;
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: string;
  status: string;
  notes: string;
}

function EmployeeForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hireDate: '',
    status: 'active',
    locationId: 1,
    skills: '',
    notes: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEmployee = useMutation({
    mutationFn: (data: EmployeeFormData) => 
      apiRequest("POST", "/api/employees", {
        ...data,
        hireDate: new Date(data.hireDate),
        locationId: Number(data.locationId)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
      toast({ title: "Employee added successfully" });
      onSuccess();
      setFormData({
        employeeId: '',
        name: '',
        email: '',
        phone: '',
        position: '',
        department: '',
        salary: '',
        hireDate: '',
        status: 'active',
        locationId: 1,
        skills: '',
        notes: ''
      });
    },
    onError: (error) => {
      console.error('Error creating employee:', error);
      toast({ title: "Failed to add employee", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEmployee.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employeeId">Employee ID</Label>
          <Input
            id="employeeId"
            value={formData.employeeId}
            onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
            placeholder="EMP001"
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="+977-98XXXXXXXX"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => setFormData({...formData, position: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={(value) => setFormData({...formData, department: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Research">Research</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salary">Monthly Salary (NPR)</Label>
          <Input
            id="salary"
            value={formData.salary}
            onChange={(e) => setFormData({...formData, salary: e.target.value})}
            placeholder="45000.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="hireDate">Hire Date</Label>
          <Input
            id="hireDate"
            type="date"
            value={formData.hireDate}
            onChange={(e) => setFormData({...formData, hireDate: e.target.value})}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="skills">Skills</Label>
        <Input
          id="skills"
          value={formData.skills}
          onChange={(e) => setFormData({...formData, skills: e.target.value})}
          placeholder="Mushroom cultivation, Quality control, Team leadership"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional information about the employee"
        />
      </div>

      <Button type="submit" disabled={createEmployee.isPending} className="w-full">
        {createEmployee.isPending ? "Adding Employee..." : "Add Employee"}
      </Button>
    </form>
  );
}

function AttendanceForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState<AttendanceFormData>({
    employeeId: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '08:00',
    checkOut: '17:00',
    hoursWorked: '9.00',
    status: 'present',
    notes: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: () => apiRequest("GET", "/api/employees")
  });

  const createAttendance = useMutation({
    mutationFn: (data: AttendanceFormData) => 
      apiRequest("POST", "/api/attendance", {
        ...data,
        employeeId: Number(data.employeeId),
        date: new Date(data.date),
        checkIn: new Date(`${data.date}T${data.checkIn}:00`),
        checkOut: new Date(`${data.date}T${data.checkOut}:00`),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      toast({ title: "Attendance recorded successfully" });
      onSuccess();
      setFormData({
        employeeId: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        checkIn: '08:00',
        checkOut: '17:00',
        hoursWorked: '9.00',
        status: 'present',
        notes: ''
      });
    },
    onError: (error) => {
      console.error('Error recording attendance:', error);
      toast({ title: "Failed to record attendance", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAttendance.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="employeeId">Employee</Label>
        <Select value={formData.employeeId.toString()} onValueChange={(value) => setFormData({...formData, employeeId: Number(value)})}>
          <SelectTrigger>
            <SelectValue placeholder="Select employee" />
          </SelectTrigger>
          <SelectContent>
            {employees?.map((employee: Employee) => (
              <SelectItem key={employee.id} value={employee.id.toString()}>
                {employee.name} ({employee.employeeId})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="checkIn">Check In</Label>
          <Input
            id="checkIn"
            type="time"
            value={formData.checkIn}
            onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
            required
          />
        </div>
        <div>
          <Label htmlFor="checkOut">Check Out</Label>
          <Input
            id="checkOut"
            type="time"
            value={formData.checkOut}
            onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="hoursWorked">Hours Worked</Label>
          <Input
            id="hoursWorked"
            value={formData.hoursWorked}
            onChange={(e) => setFormData({...formData, hoursWorked: e.target.value})}
            placeholder="9.00"
            required
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="half-day">Half Day</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          placeholder="Additional notes about attendance"
        />
      </div>

      <Button type="submit" disabled={createAttendance.isPending} className="w-full">
        {createAttendance.isPending ? "Recording Attendance..." : "Record Attendance"}
      </Button>
    </form>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'present':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'absent':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'late':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'half-day':
      return <Clock className="h-4 w-4 text-blue-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800';
    case 'absent':
      return 'bg-red-100 text-red-800';
    case 'late':
      return 'bg-yellow-100 text-yellow-800';
    case 'half-day':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default function HRPage() {
  const [activeTab, setActiveTab] = useState("employees");
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isAddAttendanceOpen, setIsAddAttendanceOpen] = useState(false);

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['/api/employees'],
    queryFn: () => apiRequest("GET", "/api/employees")
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery({
    queryKey: ['/api/attendance'],
    queryFn: () => apiRequest("GET", "/api/attendance")
  });

  const { data: payroll, isLoading: payrollLoading } = useQuery({
    queryKey: ['/api/payroll'],
    queryFn: () => apiRequest("GET", "/api/payroll")
  });

  if (employeesLoading || attendanceLoading || payrollLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Human Resources</h1>
          <p className="text-gray-600">Manage employees, attendance, and payroll</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="employees" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payroll
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Employee Management</h2>
              <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                  </DialogHeader>
                  <EmployeeForm onSuccess={() => setIsAddEmployeeOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {employees?.map((employee: Employee) => (
                <Card key={employee.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <p className="text-sm text-gray-600">{employee.employeeId}</p>
                      </div>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{employee.position}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{employee.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{employee.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{employee.phone}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Salary:</span> NPR {employee.salary}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Hired:</span> {format(new Date(employee.hireDate), 'MMM dd, yyyy')}
                      </div>
                    </div>
                    {employee.skills && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Skills:</span> {employee.skills}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Attendance Records</h2>
              <Dialog open={isAddAttendanceOpen} onOpenChange={setIsAddAttendanceOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Record Attendance
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Record Attendance</DialogTitle>
                  </DialogHeader>
                  <AttendanceForm onSuccess={() => setIsAddAttendanceOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {attendance?.map((record: Attendance) => {
                const employee = employees?.find((emp: Employee) => emp.id === record.employeeId);
                return (
                  <Card key={record.id} className="glass-card">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{employee?.name || 'Unknown Employee'}</h3>
                          <p className="text-sm text-gray-600">{employee?.employeeId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <Badge className={getStatusColor(record.status)}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Date:</span> {format(new Date(record.date), 'MMM dd, yyyy')}
                        </div>
                        <div>
                          <span className="font-medium">Check In:</span> {format(new Date(record.checkIn), 'HH:mm')}
                        </div>
                        <div>
                          <span className="font-medium">Check Out:</span> {format(new Date(record.checkOut), 'HH:mm')}
                        </div>
                        <div>
                          <span className="font-medium">Hours:</span> {record.hoursWorked}
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-4 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {record.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-800">Payroll Management</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Payroll
              </Button>
            </div>

            <div className="grid gap-4">
              {payroll?.map((record: Payroll) => {
                const employee = employees?.find((emp: Employee) => emp.id === record.employeeId);
                return (
                  <Card key={record.id} className="glass-card">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{employee?.name || 'Unknown Employee'}</h3>
                          <p className="text-sm text-gray-600">{employee?.employeeId}</p>
                        </div>
                        <Badge variant={record.status === 'paid' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Period:</span> {record.period}
                        </div>
                        <div>
                          <span className="font-medium">Basic Salary:</span> NPR {record.basicSalary}
                        </div>
                        <div>
                          <span className="font-medium">Allowances:</span> NPR {record.allowances}
                        </div>
                        <div>
                          <span className="font-medium">Deductions:</span> NPR {record.deductions}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-center">
                        <div className="text-lg font-medium">
                          Net Pay: NPR {record.netPay}
                        </div>
                        <div className="text-sm text-gray-600">
                          {record.payDate && format(new Date(record.payDate), 'MMM dd, yyyy')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}