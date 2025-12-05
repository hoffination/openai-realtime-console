export default function Button({ icon, children, className, ...props }) {
  return (
    <button
      className={`bg-gray-800 text-white rounded-full p-4 flex items-center gap-1 hover:opacity-90 ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
