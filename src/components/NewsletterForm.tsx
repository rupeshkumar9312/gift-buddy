"use client";

export function NewsletterForm() {
  return (
    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
      <input
        type="email"
        required
        placeholder="Your email"
        className="w-full min-w-0 rounded-full border border-line bg-white px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
      >
        Join
      </button>
    </form>
  );
}
