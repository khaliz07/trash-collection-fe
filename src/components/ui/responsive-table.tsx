"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  showCardViewOn?: "mobile" | "tablet" | "never";
}

interface ResponsiveTableContextType {
  isCardView: boolean;
  showCardViewOn: "mobile" | "tablet" | "never";
}

const ResponsiveTableContext = React.createContext<ResponsiveTableContextType>({
  isCardView: false,
  showCardViewOn: "mobile",
});

const ResponsiveTable = React.forwardRef<
  HTMLTableElement,
  ResponsiveTableProps
>(({ className, children, showCardViewOn = "mobile", ...props }, ref) => {
  const [isCardView, setIsCardView] = React.useState(false);

  React.useEffect(() => {
    const checkCardView = () => {
      if (showCardViewOn === "never") {
        setIsCardView(false);
        return;
      }

      const breakpoint = showCardViewOn === "mobile" ? 768 : 1024;
      setIsCardView(window.innerWidth < breakpoint);
    };

    checkCardView();
    window.addEventListener("resize", checkCardView);
    return () => window.removeEventListener("resize", checkCardView);
  }, [showCardViewOn]);

  return (
    <ResponsiveTableContext.Provider value={{ isCardView, showCardViewOn }}>
      <div className={cn("w-full", className)}>
        {!isCardView ? (
          <div className="relative w-full overflow-auto">
            <table
              ref={ref}
              className="w-full caption-bottom text-sm"
              {...props}
            >
              {children}
            </table>
          </div>
        ) : (
          <div className="space-y-3">{children}</div>
        )}
      </div>
    </ResponsiveTableContext.Provider>
  );
});
ResponsiveTable.displayName = "ResponsiveTable";

const ResponsiveTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => {
  const { isCardView } = React.useContext(ResponsiveTableContext);

  if (isCardView) {
    return null; // Headers không hiển thị trong card view
  }

  return (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props}>
      {children}
    </thead>
  );
});
ResponsiveTableHeader.displayName = "ResponsiveTableHeader";

const ResponsiveTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => {
  const { isCardView } = React.useContext(ResponsiveTableContext);

  if (isCardView) {
    return <div className="space-y-3">{children}</div>;
  }

  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    >
      {children}
    </tbody>
  );
});
ResponsiveTableBody.displayName = "ResponsiveTableBody";

interface ResponsiveTableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  labels?: string[];
  expandable?: boolean;
  defaultExpanded?: boolean;
}

const ResponsiveTableRow = React.forwardRef<
  HTMLTableRowElement,
  ResponsiveTableRowProps
>(
  (
    {
      className,
      children,
      labels = [],
      expandable = false,
      defaultExpanded = false,
      ...props
    },
    ref
  ) => {
    const { isCardView } = React.useContext(ResponsiveTableContext);
    const [expanded, setExpanded] = React.useState(defaultExpanded);

    if (isCardView) {
      const childArray = React.Children.toArray(children);

      return (
        <Card className="p-0">
          <CardContent className="p-4">
            {expandable && childArray.length > 3 ? (
              <div>
                {/* Always show first 3 items */}
                <div className="space-y-3">
                  {childArray.slice(0, 3).map((child, index) => (
                    <ResponsiveTableCellWrapper
                      key={index}
                      label={labels[index]}
                      isCardView={true}
                    >
                      {child}
                    </ResponsiveTableCellWrapper>
                  ))}
                </div>

                {/* Toggle button for remaining items */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 p-0 h-auto font-normal text-muted-foreground"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Ẩn bớt
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Xem thêm ({childArray.length - 3} mục)
                    </>
                  )}
                </Button>

                {/* Remaining items - shown when expanded */}
                {expanded && (
                  <div className="mt-3 pt-3 border-t space-y-3">
                    {childArray.slice(3).map((child, index) => (
                      <ResponsiveTableCellWrapper
                        key={index + 3}
                        label={labels[index + 3]}
                        isCardView={true}
                      >
                        {child}
                      </ResponsiveTableCellWrapper>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {childArray.map((child, index) => (
                  <ResponsiveTableCellWrapper
                    key={index}
                    label={labels[index]}
                    isCardView={true}
                  >
                    {child}
                  </ResponsiveTableCellWrapper>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <tr
        ref={ref}
        className={cn(
          "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
          className
        )}
        {...props}
      >
        {children}
      </tr>
    );
  }
);
ResponsiveTableRow.displayName = "ResponsiveTableRow";

const ResponsiveTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { isCardView } = React.useContext(ResponsiveTableContext);

  if (isCardView) {
    return null;
  }

  return (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  );
});
ResponsiveTableHead.displayName = "ResponsiveTableHead";

interface ResponsiveTableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  label?: string;
  hideOnMobile?: boolean;
  priority?: "high" | "medium" | "low";
}

const ResponsiveTableCell = React.forwardRef<
  HTMLTableCellElement,
  ResponsiveTableCellProps
>(
  (
    {
      className,
      children,
      label,
      hideOnMobile = false,
      priority = "medium",
      ...props
    },
    ref
  ) => {
    const { isCardView } = React.useContext(ResponsiveTableContext);

    if (isCardView) {
      if (hideOnMobile) return null;

      return (
        <ResponsiveTableCellWrapper
          label={label}
          isCardView={true}
          priority={priority}
        >
          {children}
        </ResponsiveTableCellWrapper>
      );
    }

    return (
      <td
        ref={ref}
        className={cn(
          "p-4 align-middle [&:has([role=checkbox])]:pr-0",
          hideOnMobile && "hidden md:table-cell",
          className
        )}
        {...props}
      >
        {children}
      </td>
    );
  }
);
ResponsiveTableCell.displayName = "ResponsiveTableCell";

interface ResponsiveTableCellWrapperProps {
  children: React.ReactNode;
  label?: string;
  isCardView: boolean;
  priority?: "high" | "medium" | "low";
}

const ResponsiveTableCellWrapper: React.FC<ResponsiveTableCellWrapperProps> = ({
  children,
  label,
  isCardView,
  priority = "medium",
}) => {
  if (!isCardView) {
    return <>{children}</>;
  }

  const priorityClasses = {
    high: "text-foreground font-medium",
    medium: "text-foreground",
    low: "text-muted-foreground text-sm",
  };

  return (
    <div className="flex items-center justify-between gap-3">
      {label && (
        <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0">
          {label}:
        </span>
      )}
      <div
        className={cn("min-w-0 flex-1 text-right", priorityClasses[priority])}
      >
        {children}
      </div>
    </div>
  );
};

// Export aliases for backward compatibility
export {
  ResponsiveTable as Table,
  ResponsiveTableHeader as TableHeader,
  ResponsiveTableBody as TableBody,
  ResponsiveTableRow as TableRow,
  ResponsiveTableHead as TableHead,
  ResponsiveTableCell as TableCell,
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell,
};
