import { Spinner } from "@/components/Spinner";

export default function Loading() {
  return (
    <div className="container-page flex min-h-[50vh] items-center justify-center py-20">
      <Spinner size={32} className="text-primary" />
    </div>
  );
}
