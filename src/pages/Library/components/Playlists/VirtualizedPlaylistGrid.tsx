import { NormalizedPlaylist, ViewMode } from '@/lib/types';
import React, { useCallback } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid } from 'react-window';
import { motion } from 'framer-motion';

interface VirtualizedPlaylistGridProps {
  items: NormalizedPlaylist[];
  viewMode: ViewMode;
  ItemComponent: React.ComponentType<any>;
  onTransfer: (playlist: NormalizedPlaylist) => void;
}

const GRID_COLUMN_COUNTS = {
  base: 2,
  sm: 2,
  md: 3,
  lg: 4,
  xl: 5,
  '2xl': 6,
};

const GRID_GAP = window.innerWidth < 640 ? 16 : 24;
const CELL_PADDING = 16;

const VirtualizedPlaylistGrid = ({
  items,
  viewMode,
  ItemComponent,
  onTransfer,
}: VirtualizedPlaylistGridProps) => {
  const getColumnCount = useCallback((width: number) => {
    if (width >= 1536) return GRID_COLUMN_COUNTS['2xl'];
    if (width >= 1280) return GRID_COLUMN_COUNTS.xl;
    if (width >= 1024) return GRID_COLUMN_COUNTS.lg;
    if (width >= 768) return GRID_COLUMN_COUNTS.md;
    if (width >= 640) return GRID_COLUMN_COUNTS.sm;
    return GRID_COLUMN_COUNTS.base;
  }, []);

  const Cell = useCallback(
    ({ columnIndex, rowIndex, style, data }) => {
      const { items, ItemComponent, columnCount } = data;
      const index = rowIndex * columnCount + columnIndex;

      if (index >= items.length) return null;

      const item = items[index];

      const adjustedStyle = {
        ...style,
        left: `${parseFloat(style.left) + GRID_GAP}px`,
        top: `${parseFloat(style.top) + GRID_GAP}px`,
        width: `${parseFloat(style.width) - GRID_GAP}px`,
        height: `${parseFloat(style.height) - GRID_GAP}px`,
        padding: `${CELL_PADDING}px`,
      };

      return (
        <div style={adjustedStyle}>
          <ItemComponent
            playlist={item}
            viewMode={viewMode}
            onTransfer={onTransfer}
          />
        </div>
      );
    },
    [viewMode, onTransfer]
  );

  if (viewMode === 'list') {
    return (
      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => (
          <ItemComponent
            key={item.id}
            playlist={item}
            viewMode={viewMode}
            onTransfer={onTransfer}
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        height: 'calc(100vh - 12rem)',
        width: '100%',
        padding: `${GRID_GAP}px 0`,
        minHeight: '300px',
      }}
    >
      <AutoSizer>
        {({ height, width }) => {
          const columnCount = getColumnCount(width);
          const availableWidth = width - GRID_GAP * (columnCount + 1);
          const columnWidth = Math.floor(availableWidth / columnCount);
          const rowHeight = columnWidth + CELL_PADDING * 2;

          return (
            <Grid
              columnCount={columnCount}
              columnWidth={columnWidth + GRID_GAP}
              height={height}
              rowCount={Math.ceil(items.length / columnCount)}
              rowHeight={rowHeight + GRID_GAP}
              width={width}
              itemData={{
                items,
                ItemComponent,
                columnCount,
              }}
              overscanRowCount={2}
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </motion.div>
  );
};

export default VirtualizedPlaylistGrid;
