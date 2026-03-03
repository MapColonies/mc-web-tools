const VERTEX_STROKE_COLOR = '#007bff';
const VERTEX_STROKE_WIDTH = '1.5';
const VERTEX_FILL_COLOR = 'white';
const EDGE_STROKE_COLOR = 'black';
const EDGE_STROKE_WIDTH = '1.5';
const EDGE_FILL_COLOR = 'none';

export const StarIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
      d="M12 2 L15 8 L22 9 L17 14 L18 21 L12 17 L6 21 L7 14 L2 9 L9 8 Z"
      fill={EDGE_FILL_COLOR}
      stroke={EDGE_STROKE_COLOR}
      strokeWidth={EDGE_STROKE_WIDTH}
    />
    <circle
      cx="12"
      cy="2"
      r="1.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="22"
      cy="9"
      r="1.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="18"
      cy="21"
      r="1.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="6"
      cy="21"
      r="1.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="2"
      cy="9"
      r="1.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
  </svg>
);

export const BoxIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <polygon
      points="6,6 18,6 18,18 6,18"
      fill={EDGE_FILL_COLOR}
      stroke={EDGE_STROKE_COLOR}
      strokeWidth={EDGE_STROKE_WIDTH}
    />
    <circle
      cx="6"
      cy="6"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="18"
      cy="6"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="18"
      cy="18"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="6"
      cy="18"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
  </svg>
);

export const PolygonIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <polygon
      points="12,3 20,7 16,17 8,17 4,7"
      fill={EDGE_FILL_COLOR}
      stroke={EDGE_STROKE_COLOR}
      strokeWidth={EDGE_STROKE_WIDTH}
    />
    <circle
      cx="12"
      cy="3"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="20"
      cy="7"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="16"
      cy="17"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="8"
      cy="17"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="4"
      cy="7"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
  </svg>
);

export const LineStringIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <line
      x1="4"
      y1="4"
      x2="20"
      y2="20"
      stroke={EDGE_STROKE_COLOR}
      strokeWidth={EDGE_STROKE_WIDTH}
    />
    <circle
      cx="4"
      cy="4"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
    <circle
      cx="20"
      cy="20"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
  </svg>
);

export const PointIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path
      d="M12,2 C14,2 16,4 16,6 C16,9 12,12 12,18 C12,12 8,9 8,6 C8,4 10,2 12,2 Z"
      fill={EDGE_FILL_COLOR}
      stroke={EDGE_STROKE_COLOR}
      strokeWidth={EDGE_STROKE_WIDTH}
    />
    <circle
      cx="12"
      cy="18"
      r="2.5"
      fill={VERTEX_FILL_COLOR}
      stroke={VERTEX_STROKE_COLOR}
      strokeWidth={VERTEX_STROKE_WIDTH}
    />
  </svg>
);
