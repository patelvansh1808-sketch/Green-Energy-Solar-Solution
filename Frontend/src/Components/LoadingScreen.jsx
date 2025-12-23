export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-surface flex flex-col items-center justify-center z-50">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-green-700 font-medium">
        Loading SuryaUrja...
      </p>
    </div>
  );
}
