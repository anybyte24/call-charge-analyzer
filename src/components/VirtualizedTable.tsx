import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown } from 'lucide-react';
import { CallRecord } from '@/types/call-analysis';
import { cn } from '@/lib/utils';

interface VirtualizedTableProps {
  records: CallRecord[];
  height?: number;
  onRecordClick?: (record: CallRecord) => void;
  className?: string;
}

interface ColumnDef {
  key: keyof CallRecord | 'cost' | 'category';
  label: string;
  width: number;
  render?: (record: CallRecord) => React.ReactNode;
}

const columns: ColumnDef[] = [
  {
    key: 'date',
    label: 'Data',
    width: 100,
  },
  {
    key: 'timestamp',
    label: 'Ora',
    width: 80,
  },
  {
    key: 'callerNumber',
    label: 'Chiamante',
    width: 140,
    render: (record) => (
      <span className="font-mono text-xs">{record.callerNumber}</span>
    )
  },
  {
    key: 'calledNumber',
    label: 'Chiamato',
    width: 140,
    render: (record) => (
      <span className="font-mono text-xs">{record.calledNumber}</span>
    )
  },
  {
    key: 'duration',
    label: 'Durata',
    width: 80,
    render: (record) => (
      <span className="font-mono text-xs">{record.duration}</span>
    )
  },
  {
    key: 'category',
    label: 'Categoria',
    width: 120,
    render: (record) => (
      <Badge variant="outline" className="text-xs">
        {record.category.description}
      </Badge>
    )
  },
  {
    key: 'cost',
    label: 'Costo',
    width: 80,
    render: (record) => (
      <span className="font-semibold text-green-600">
        €{record.cost?.toFixed(2) || '0.00'}
      </span>
    )
  }
];

const VirtualizedTable: React.FC<VirtualizedTableProps> = ({
  records,
  height = 400,
  onRecordClick,
  className
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<string>('date');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  // Filter and sort records
  const processedRecords = useMemo(() => {
    let filtered = [...records];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => 
        record.calledNumber.toLowerCase().includes(query) ||
        record.callerNumber.toLowerCase().includes(query) ||
        record.category.description.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          const dateA = new Date(`${a.date} ${a.timestamp}`);
          const dateB = new Date(`${b.date} ${b.timestamp}`);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        case 'cost':
          comparison = (a.cost || 0) - (b.cost || 0);
          break;
        case 'durationSeconds':
          comparison = a.durationSeconds - b.durationSeconds;
          break;
        case 'calledNumber':
          comparison = a.calledNumber.localeCompare(b.calledNumber);
          break;
        case 'callerNumber':
          comparison = a.callerNumber.localeCompare(b.callerNumber);
          break;
        case 'category':
          comparison = a.category.description.localeCompare(b.category.description);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [records, searchQuery, sortBy, sortOrder]);

  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  // Handle column header click for sorting
  const handleHeaderClick = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('desc');
    }
  };

  // Row renderer for react-window
  const Row = React.memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const record = processedRecords[index];
    
    return (
      <div
        style={style}
        className={cn(
          "flex items-center border-b border-gray-100 hover:bg-gray-50 cursor-pointer",
          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
        )}
        onClick={() => onRecordClick?.(record)}
      >
        {columns.map((column, colIndex) => (
          <div
            key={column.key}
            className="flex items-center px-3 py-2 text-sm"
            style={{ width: column.width, minWidth: column.width }}
          >
            {column.render ? (
              column.render(record)
            ) : (
              <span className="truncate">
                {String(record[column.key as keyof CallRecord] || '')}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  });

  Row.displayName = 'VirtualizedTableRow';

  return (
    <Card className={cn("bg-white/70 backdrop-blur-sm border shadow-lg", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Dettaglio Chiamate ({processedRecords.length.toLocaleString()})</span>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cerca nelle chiamate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10"
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b">
          {/* Header */}
          <div
            className="flex items-center bg-gray-50 border-b font-medium text-sm"
            style={{ width: totalWidth }}
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className="flex items-center px-3 py-3 cursor-pointer hover:bg-gray-100 select-none"
                style={{ width: column.width, minWidth: column.width }}
                onClick={() => handleHeaderClick(column.key)}
              >
                <span className="truncate">{column.label}</span>
                {sortBy === column.key && (
                  <ArrowUpDown className={cn(
                    "ml-1 h-3 w-3 transition-transform",
                    sortOrder === 'desc' ? "rotate-180" : ""
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Virtualized content */}
          <div style={{ height, width: '100%', overflowX: 'auto' }}>
            <List
              height={height}
              itemCount={processedRecords.length}
              itemSize={48}
              width={totalWidth}
            >
              {Row}
            </List>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 border-t">
          Visualizzando {processedRecords.length.toLocaleString()} di {records.length.toLocaleString()} record
          {searchQuery && ` (filtrato per: "${searchQuery}")`}
        </div>
      </CardContent>
    </Card>
  );
};

export default VirtualizedTable;