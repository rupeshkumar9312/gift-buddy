export function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      {eyebrow && (
        <p className="font-script text-3xl text-primary">{eyebrow}</p>
      )}
      <h2 className="mt-1 text-3xl font-medium tracking-tight text-ink sm:text-4xl">{title}</h2>
    </div>
  );
}
