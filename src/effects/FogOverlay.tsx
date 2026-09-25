import './FogOverlay.css';

/**
 * FogOverlay — layered, drifting CSS fog for parallax depth.
 * Place inside a `position: relative` scene container.
 */
export default function FogOverlay(props: { opacity?: number }) {
  const { opacity = 0.4 } = props;

  return (
    <div className="fog-overlay" style={{ opacity }} aria-hidden="true">
      <div className="fog-overlay__layer fog-overlay__layer--1" />
      <div className="fog-overlay__layer fog-overlay__layer--2" />
      <div className="fog-overlay__layer fog-overlay__layer--3" />
      <div className="fog-overlay__layer fog-overlay__layer--4" />
      <div className="fog-overlay__ground" />
    </div>
  );
}
