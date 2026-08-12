"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { getContactMessages, updateContactMessage, type AdminContactMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";

const STATUS_TONE: Record<AdminContactMessage["status"], string> = {
  new: "bg-amber-100 text-amber-700",
  read: "bg-sky-100 text-sky-700",
  replied: "bg-green-100 text-green-700",
};

export default function ContactMessagesPage() {
  const { accessToken, hasPermission } = useAdminAuth();
  const canWrite = hasPermission("content.write");
  const [messages, setMessages] = useState<AdminContactMessage[] | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = () => {
    if (!accessToken) return;
    getContactMessages(accessToken)
      .then(setMessages)
      .catch(() => undefined);
  };

  useEffect(load, [accessToken]);

  const handleOpen = async (message: AdminContactMessage) => {
    setOpenId(openId === message.id ? null : message.id);
    if (canWrite && message.status === "new") {
      try {
        await updateContactMessage(accessToken!, message.id, "read");
        load();
      } catch {
        // best-effort status flip
      }
    }
  };

  const handleMarkReplied = async (message: AdminContactMessage) => {
    if (!accessToken) return;
    try {
      await updateContactMessage(accessToken, message.id, "replied");
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Couldn't update this message.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Contact Inbox</h1>
        <p className="mt-1 text-sm text-muted">Messages submitted through the storefront contact form.</p>
      </div>

      <div className="flex flex-col gap-3">
        {messages?.map((message) => (
          <div key={message.id} className="rounded-2xl border border-line bg-white">
            <button
              onClick={() => handleOpen(message)}
              className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-left"
            >
              <div>
                <p className="text-sm font-medium text-ink">
                  {message.subject || "(no subject)"} &middot;{" "}
                  <span className="font-normal text-muted">{message.name}</span>
                </p>
                <p className="text-xs text-muted">
                  {message.email} &middot; {formatDate(message.createdAt)}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_TONE[message.status]}`}
              >
                {message.status}
              </span>
            </button>
            {openId === message.id && (
              <div className="border-t border-line px-6 py-4">
                <p className="text-sm leading-relaxed text-ink">{message.message}</p>
                {canWrite && message.status !== "replied" && (
                  <button
                    onClick={() => handleMarkReplied(message)}
                    className="mt-4 rounded-full bg-primary px-5 py-2 text-xs font-medium uppercase tracking-wide text-white transition hover:bg-primary-dark"
                  >
                    Mark as Replied
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {messages?.length === 0 && (
          <p className="rounded-2xl border border-line bg-white px-5 py-8 text-center text-sm text-muted">
            No messages yet.
          </p>
        )}
      </div>
    </div>
  );
}
