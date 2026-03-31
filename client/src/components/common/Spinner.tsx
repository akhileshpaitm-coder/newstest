export default function Spinner({ small }: { small?: boolean }) {
  const size = small ? "h-5 w-5 border-2" : "h-10 w-10 border-4";
  return (
    <div className="flex justify-center py-4">
      <div className={`${size} border-blue-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}
