import './RedEmergencyOverlay.css';

/**
 * RedEmergencyOverlay — full-bleed red tint that pulses when active.
 * Always mounted (never unmounted) so opacity can transition smoothly.
 */
export default function RedEmergencyOverlay(props: { active: boolean }) {
  const { active } = props;

  return (
    <div
      className={`red-emergency-overlay${active ? ' red-emergency-overlay--active' : ''}`}
      aria-hidden="true"
    >
      <div className="red-emergency-overlay__sweep" />
    </div>
  );
}
