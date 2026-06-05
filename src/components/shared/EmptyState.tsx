import { PackageX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-gray-300 mb-3">
        {icon ?? <PackageX className="w-12 h-12" />}
      </div>
      <p className="text-gray-500 font-medium">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      )}
    </div>
  );
}
