import SplitScreen from '@/components/SplitScreen';
import ChatPanel from '@/components/ChatPanel';
import CanvasPanel from '@/components/CanvasPanel';

export const metadata = {
  title: 'Workspace — AI Resume Intelligence',
  description: 'AI-first resume workspace with chat and live preview',
};

export default function WorkspacePage() {
  return (
    <div className="h-[calc(100vh-48px)] md:h-screen p-4 md:p-6">
      <SplitScreen left={<ChatPanel />} right={<CanvasPanel />} />
    </div>
  );
}
