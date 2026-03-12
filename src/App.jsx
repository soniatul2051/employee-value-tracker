import React, { useState, useEffect } from 'react';
import EmployeeManagement from './components/EmployeeManagement';
import ProjectManagement from './components/ProjectManagement';
import InvolvementManagement from './components/InvolvementManagement';
import FinancialDashboard from './components/FinancialDashboard';
import { Briefcase, Users, TrendingUp, Menu, X } from 'lucide-react';

function App() {
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [involvements, setInvolvements] = useState([]);
  const [employeeValue, setEmployeeValue] = useState({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    const savedProjects = localStorage.getItem('projects');
    const savedInvolvements = localStorage.getItem('involvements');

    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedInvolvements) setInvolvements(JSON.parse(savedInvolvements));
  }, []);


  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('involvements', JSON.stringify(involvements));
  }, [involvements]);

  
  useEffect(() => {
    const valueMap = {};

    employees.forEach(employee => {
      const monthlyCost = employee.salary / 12;
      const employeeInvolvements = involvements.filter(
        inv => inv.employeeId === employee.id
      );

      let totalValueGenerated = 0;
      let totalMonthsWorked = 0;

      employeeInvolvements.forEach(involvement => {
        const project = projects.find(p => p.id === involvement.projectId);
        if (project) {
          const startDate = new Date(involvement.startDate);
          const endDate = involvement.endDate ? new Date(involvement.endDate) : new Date();
          const months = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
          
          const projectValuePerMonth = project.totalValue / project.durationMonths;
          const employeeContribution = projectValuePerMonth * months * (involvement.allocation / 100);
          
          totalValueGenerated += employeeContribution;
          totalMonthsWorked += months;
        }
      });

      const totalCost = monthlyCost * (totalMonthsWorked || 1);
      const netValue = totalValueGenerated - totalCost;
      const roi = totalCost > 0 ? (netValue / totalCost) * 100 : 0;

      valueMap[employee.id] = {
        employeeId: employee.id,
        employeeName: employee.name,
        totalCost: totalCost.toFixed(2),
        totalValueGenerated: totalValueGenerated.toFixed(2),
        netValue: netValue.toFixed(2),
        roi: roi.toFixed(2),
        monthlyCost: monthlyCost.toFixed(2),
        totalMonthsWorked
      };
    });

    setEmployeeValue(valueMap);
  }, [employees, projects, involvements]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'involvements', label: 'Involvements', icon: Menu },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
    
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Employee Financial Value Tracker</h1>
              <p className="text-blue-100 mt-2">Track the financial impact of each employee based on project contributions</p>
            </div>
            
          
            <button 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          
          <nav className={`mt-6 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <div className="flex flex-col md:flex-row gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-white hover:bg-white/20'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

     
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <FinancialDashboard 
            employeeValue={employeeValue}
            employees={employees}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeeManagement 
            employees={employees}
            setEmployees={setEmployees}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectManagement 
            projects={projects}
            setProjects={setProjects}
          />
        )}

        {activeTab === 'involvements' && (
          <InvolvementManagement 
            involvements={involvements}
            setInvolvements={setInvolvements}
            employees={employees}
            projects={projects}
          />
        )}
      </main>
    </div>
  );
}

export default App;