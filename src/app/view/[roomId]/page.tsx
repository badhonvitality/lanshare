import ViewerClient from './ViewerClient';

export default async function ViewerPage(props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  return <ViewerClient roomId={params.roomId} />;
}
