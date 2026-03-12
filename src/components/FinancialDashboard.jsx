import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Award,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const FinancialDashboard = ({ employeeValue, employees }) => {
  const values = Object.values(employeeValue);

  const totalCompanyCost = values.reduce(
    (sum, emp) => sum + parseFloat(emp.totalCost),
    0,
  );
  const totalValueGenerated = values.reduce(
    (sum, emp) => sum + parseFloat(emp.totalValueGenerated),
    0,
  );
  const totalNetValue = values.reduce(
    (sum, emp) => sum + parseFloat(emp.netValue),
    0,
  );

  const averageROI =
    values.length > 0
      ? values.reduce((sum, emp) => sum + parseFloat(emp.roi), 0) /
        values.length
      : 0;

  const topPerformers = [...values]
    .sort((a, b) => parseFloat(b.netValue) - parseFloat(a.netValue))
    .slice(0, 3);

  const getPerformanceColor = (value) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Cost</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(totalCompanyCost)}
              </p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Value Generated</p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(totalValueGenerated)}
              </p>
            </div>
            <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Net Impact</p>
              <p
                className={`text-2xl font-bold mt-2 ${totalNetValue >= 0 ? "text-white" : "text-red-200"}`}
              >
                {formatCurrency(totalNetValue)}
              </p>
            </div>
            <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
              {totalNetValue >= 0 ? (
                <ArrowUp size={24} />
              ) : (
                <ArrowDown size={24} />
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Average ROI</p>
              <p
                className={`text-2xl font-bold mt-2 ${averageROI >= 0 ? "text-white" : "text-red-200"}`}
              >
                {averageROI.toFixed(1)}%
              </p>
            </div>
            <div className="bg-orange-400 bg-opacity-30 p-3 rounded-lg">
              <Award size={24} />
            </div>
          </div>
        </div>
      </div>

      {topPerformers.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="text-yellow-500" />
            Top 3 Value Generators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((performer, index) => (
              <div
                key={performer.employeeId}
                className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-yellow-400"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-white">
                  #{index + 1}
                </div>
                <h4 className="font-semibold text-gray-800 mt-2">
                  {performer.employeeName}
                </h4>
                <div className="mt-3 space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">Net Value:</span>{" "}
                    <span className="font-bold text-green-600">
                      {formatCurrency(performer.netValue)}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">ROI:</span>{" "}
                    <span className="font-bold text-green-600">
                      {performer.roi}%
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">
            Employee Financial Breakdown
          </h3>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500">No employees to display</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Months
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => {
                  const value = employeeValue[employee.id] || {
                    totalCost: 0,
                    totalValueGenerated: 0,
                    netValue: 0,
                    roi: 0,
                    monthlyCost: (employee.salary / 12).toFixed(2),
                    totalMonthsWorked: 0,
                  };

                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {employee.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(value.monthlyCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {value.totalMonthsWorked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(value.totalCost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatCurrency(value.totalValueGenerated)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPerformanceColor(value.netValue)}`}
                      >
                        {formatCurrency(value.netValue)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPerformanceColor(value.roi)}`}
                      >
                        {value.roi}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDashboard;
