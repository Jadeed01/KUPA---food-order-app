export default function PhoneFrame({ children }) {
  return (
    <div className="min-h-screen md:flex md:items-center md:justify-center md:p-6">
      <div className="relative mx-auto h-dvh w-full overflow-hidden bg-white md:h-[844px] md:max-h-[95vh] md:w-[390px] md:rounded-[44px] md:shadow-2xl md:ring-8 md:ring-neutral-900">
        {children}
      </div>
    </div>
  );
}