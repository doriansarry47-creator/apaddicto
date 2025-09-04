import { Bell, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MobileHeader() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">CalmCare</h1>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="p-2 text-gray-600 hover:text-primary-600"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="p-2 text-gray-600 hover:text-primary-600"
            data-testid="button-profile"
          >
            <UserCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
