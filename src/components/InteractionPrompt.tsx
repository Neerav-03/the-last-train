import './InteractionPrompt.css';

interface InteractionPromptProps {
  label: string;
  x: number; // percentage
  y: number; // percentage
}

export default function InteractionPrompt({ label, x, y }: InteractionPromptProps) {
  return (
    <div className="interaction-prompt" style={{ left: `${x}%`, top: `${y}%` }}>
      <span className="interaction-key">E</span>
      <span className="interaction-label">{label}</span>
    </div>
  );
}
