import { cn } from "../../utils/cn"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({
  className,
  error,
  ...props
}: InputProps) {
  return (
    <div className="relative">
      <input
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2",
          "text-sm text-slate-800 placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-600 focus:ring-red-600",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
} 