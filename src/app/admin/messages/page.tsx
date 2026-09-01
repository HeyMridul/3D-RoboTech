import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MessageActions } from "../_components/InboxActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages — TRAIC CMS" };

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let messages: Awaited<ReturnType<typeof prisma.contactMessage.findMany>> = [];
  try {
    messages = await prisma.contactMessage.findMany({
      orderBy: [{ read: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("[admin] failed to load messages", error);
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="p-8">
      <p className="font-mono-label text-[10px] text-cyan mb-1">TRAIC CMS</p>
      <h1 className="font-display text-2xl font-bold">Messages</h1>
      <p className="text-sm text-muted mt-1 mb-8">
        {messages.length} total // {unread} unread
      </p>

      {messages.length === 0 ? (
        <div className="border border-dashed border-card-border p-12 text-center">
          <p className="font-mono-label text-[11px] text-muted mb-2">
            INBOX EMPTY
          </p>
          <p className="text-sm text-muted">
            Submissions from the contact form will appear here.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => (
            <li
              key={message.id}
              className={cn(
                "border bg-card p-6",
                message.read ? "border-card-border" : "border-cyan/40",
              )}
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    {!message.read && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-cyan"
                        aria-label="Unread"
                      />
                    )}
                    <h2 className="font-semibold">
                      {message.subject || "(no subject)"}
                    </h2>
                  </div>
                  <p className="text-sm text-muted mt-1">
                    {message.name} —{" "}
                    <a
                      href={`mailto:${message.email}`}
                      className="hover:text-cyan"
                    >
                      {message.email}
                    </a>
                  </p>
                  <p className="font-mono-label text-[10px] text-muted mt-1">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
                <MessageActions id={message.id} read={message.read} />
              </div>
              <p className="text-sm text-metallic whitespace-pre-line">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
