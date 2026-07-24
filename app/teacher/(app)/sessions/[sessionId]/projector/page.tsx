import { redirect } from "next/navigation";

type Props = { params: Promise<{ sessionId: string }> };

/** Old bookmarks → Station Scan. */
export default async function ProjectorPage({ params }: Props) {
  const { sessionId } = await params;
  redirect(`/teacher/sessions/${sessionId}/scan`);
}
