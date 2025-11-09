import { Card } from "@/components/ui/card";
import {
  BarChart,
  Users,
  ShoppingCart,
  DollarSign,
  ActivitySquare,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold">2,543</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold">1,235</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <h3 className="text-2xl font-bold">$12,426</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ActivitySquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Activity</p>
              <h3 className="text-2xl font-bold"> +24% </h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">Recent Activity</h3>
          <div className="space-y-4">{/* Add your activity list here */}</div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-medium">Analytics</h3>
          <div className="h-[300px] flex items-center justify-center">
            <BarChart className="w-12 h-12 text-gray-400" />
            <span className="ml-2 text-gray-500">Chart placeholder</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
