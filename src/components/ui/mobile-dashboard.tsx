"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  Grid3X3, 
  List,
  Filter,
  Search,
  MoreHorizontal
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

interface MobileDashboardProps {
  children: React.ReactNode;
  className?: string;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({
  children,
  className,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className={cn(
      "w-full space-y-4",
      isMobile ? "px-3 py-2" : "px-6 py-4",
      className
    )}>
      {children}
    </div>
  );
};

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  children,
  className,
  columns = 2,
}) => {
  return (
    <div className={cn(
      "grid gap-3",
      columns === 1 && "grid-cols-1",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      columns === 4 && "grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  compact?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  compact = false,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className={cn(
        "flex items-center justify-between",
        compact ? "p-3" : "p-4"
      )}>
        <div className="min-w-0 flex-1">
          <p className={cn(
            "font-medium text-muted-foreground",
            compact ? "text-xs" : "text-sm"
          )}>
            {title}
          </p>
          <p className={cn(
            "font-bold",
            compact ? "text-lg" : "text-2xl"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-muted-foreground",
              compact ? "text-xs" : "text-sm"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-1",
              compact ? "text-xs" : "text-sm",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span>{trend.isPositive ? "↗" : "↘"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            "flex-shrink-0 opacity-60",
            compact ? "text-lg" : "text-2xl"
          )}>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string | number;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = true,
  badge,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between p-0 h-auto font-semibold text-left"
        >
          <div className="flex items-center gap-2">
            <span>{title}</span>
            {badge && (
              <Badge variant="default" className="ml-2">
                {badge}
              </Badge>
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

interface QuickActionsProps {
  actions: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary";
    disabled?: boolean;
  }>;
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className,
}) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile && actions.length > 2) {
    const primaryActions = actions.slice(0, 2);
    const secondaryActions = actions.slice(2);

    return (
      <div className={cn("flex gap-2", className)}>
        {primaryActions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "default"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="flex-1"
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </Button>
        ))}
        
        {secondaryActions.length > 0 && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="px-3">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>Thêm hành động</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                {secondaryActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    size="sm"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className="w-full justify-start"
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || "default"}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          className="flex-shrink-0"
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      ))}
    </div>
  );
};

interface MobileFiltersProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  showViewToggle?: boolean;
  currentView?: "grid" | "list";
  onViewChange?: (view: "grid" | "list") => void;
  className?: string;
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  children,
  searchPlaceholder = "Tìm kiếm...",
  onSearch,
  showViewToggle = false,
  currentView = "list",
  onViewChange,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Search bar */}
      {onSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            className="pl-10"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}

      {/* Filters and view toggle */}
      <div className="flex items-center justify-between gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Lọc
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Bộ lọc</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {children}
            </div>
          </SheetContent>
        </Sheet>

        {showViewToggle && onViewChange && (
          <div className="flex border rounded-md">
            <Button
              variant={currentView === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => onViewChange("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={currentView === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => onViewChange("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export {
  MobileDashboard,
  StatsGrid,
  StatCard,
  CollapsibleSection,
  QuickActions,
  MobileFilters,
};
