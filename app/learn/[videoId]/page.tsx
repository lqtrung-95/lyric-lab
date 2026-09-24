export default async function LearnPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return <main className="p-6">Bài học: {videoId} (placeholder)</main>;
}
