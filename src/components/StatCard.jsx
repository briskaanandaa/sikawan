import { ArrowRight, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  href,
}) {
  return (
    <Card className="relative overflow-hidden ">
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="md:mt-2 mt-6 text-lg md:text-xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`rounded-md p-2 ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        {href && (
          <div className="flex justify-end">
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto text-xs mt-1"
              asChild
            >
              <Link to={href}>
                Lihat semua <ChevronRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
