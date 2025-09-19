import { memo } from 'react';
import { TableDetailSummary } from '../types/shipmentDetail';

interface TableComponentProps {
  tableContent: TableDetailSummary | null;
  // onContentChange: (newContent: string) => void;
}

const TableSummary = ({
  tableContent,
  // onContentChange,
}: TableComponentProps) => {
  console.log('[TableSummary] Render:', tableContent);

  return <div>Summary</div>;
};

export default memo(TableSummary);
