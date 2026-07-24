import { StationScanClient } from "@/components/StationScanClient";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ sessionId: string }> };

export const dynamic = "force-dynamic";

export default async function StationScanPage({ params }: Props) {
  const { sessionId } = await params;
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { meeting: { include: { section: true } } },
  });
  if (!session) notFound();

  return (
    <StationScanClient
      sessionId={session.id}
      sectionCode={session.meeting.section.code}
    />
  );
}
