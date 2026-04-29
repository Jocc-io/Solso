import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent>
          <div className="flex gap-4">
            <AlertCircle className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl text-white">404 Page Not Found</h1>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
