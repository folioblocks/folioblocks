/**
 * FolioBlocks Spinner Icon Component
 * SVG Icon
 **/
const IconPBSpinner = () => (
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 24 24"
     role="img"
     aria-label="Folioblocks loading">
  <defs></defs>

  <circle className="fb-circle-bg" cx="12" cy="12" r="12" />

  <g id="fb-squares" className="fb-spinner-squares">
    <rect className="fb-square" x="5.94" y="5.93" width="3.33" height="3.33" rx="0.4" ry="0.4" />
    <rect className="fb-square" x="5.94" y="10.33" width="3.33" height="3.33" rx="0.4" ry="0.4" />
    <rect className="fb-square" x="5.94" y="14.75" width="3.33" height="3.33" rx="0.4" ry="0.4" />

    <rect className="fb-square" x="10.34" y="5.93" width="3.33" height="3.33" rx="0.4" ry="0.4" />
    <rect className="fb-square" x="10.34" y="10.33" width="3.33" height="3.33" rx="0.4" ry="0.4" />
    <rect className="fb-square" x="10.34" y="14.75" width="3.33" height="3.33" rx="0.4" ry="0.4" />

    <rect className="fb-square" x="14.73" y="5.93" width="3.33" height="3.33" rx="0.4" ry="0.4" />
    <rect className="fb-square" x="14.73" y="10.33" width="3.33" height="3.33" rx="0.4" ry="0.4" />
    <rect className="fb-square" x="14.73" y="14.75" width="3.33" height="3.33" rx="0.4" ry="0.4" />
  </g>

  <g id="fb-orbit" className="fb-spinner-orbit">
    <circle className="fb-dot" cx="12" cy="4.5"  r="0.9" />
    <circle className="fb-dot" cx="15.95" cy="5.45" r="0.9" />
    <circle className="fb-dot" cx="18.5" cy="8.0"  r="0.9" />
    <circle className="fb-dot" cx="19.45" cy="11.95" r="0.9" />
    <circle className="fb-dot" cx="18.5" cy="15.9" r="0.9" />
    <circle className="fb-dot" cx="15.95" cy="18.45" r="0.9" />
    <circle className="fb-dot" cx="12" cy="19.5" r="0.9" />
    <circle className="fb-dot" cx="8.05" cy="18.45" r="0.9" />
  </g>

</svg>
);

export default IconPBSpinner;