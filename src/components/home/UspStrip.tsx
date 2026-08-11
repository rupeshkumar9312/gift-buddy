import { Gift, Headset, Truck } from "lucide-react";

const items = [
  {
    icon: Truck,
    title: "Delivering quality gifts",
    text: "Full information on its origins",
  },
  {
    icon: Gift,
    title: "Gifts for all occasions",
    text: "Variants and technical details",
  },
  {
    icon: Headset,
    title: "Great customer service",
    text: "Here to help, every step of the way",
  },
];

export function UspStrip() {
  return (
    <section className="border-b border-line">
      <div className="container-page grid grid-cols-1 gap-8 py-12 sm:grid-cols-3">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <Icon size={20} />
            </span>
            <div>
              <h3 className="text-[15px] font-medium text-ink">{title}</h3>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
