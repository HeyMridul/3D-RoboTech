import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { formatDate } from "@/lib/utils";
import { MessageActions } from "@/components/admin/InboxActions";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  let messages: Awaited<ReturnType<typeof prisma.contactMessage.findMany>> = [];
  try {
    messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    /* db unavailable */
  }

  return (
    <div className="p-8">
      <p className="font-mono-label text-cyan mb-1">CMS</p>
      <h1 className="font-display text-2xl font-bold mb-8">Messages</h1>

      {messages.length === 0 ? (
        <p className="font-mono-label text-muted">No messages.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`border bg-card p-6 ${
                msg.read ? "border-card-border" : "border-cyan/30"
              }`}
            >
              <div className="flex justify-between mb-2">
                <div>
                  <h3 className="font-semibold">{msg.name}</h3>
                  <p className="text-sm text-muted">{msg.email}</p>
                </div>
                <span className="font-mono-label text-[10px] text-muted">
                  {formatDate(msg.createdAt)}
                </span>
              </div>
              {msg.subject && (
                <p className="font-mono-label text-[10px] text-cyan mb-2">
                  {msg.subject}
                </p>
              )}
              <p className="text-sm text-muted">{msg.message}</p>
              <div className="mt-4">
                <MessageActions id={msg.id} read={msg.read} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
