import { memo, useState, useEffect, useRef } from 'react';
import { Descriptions, Input, Typography, Button } from 'antd';
import { TableDetailSummary } from '../types/shipmentDetail';

const DEBOUNCE_DELAY = 500; // 500ms de espera

interface TableSummaryProps {
  tableContent: TableDetailSummary | null;
  // Prop para notificar al padre sobre los cambios.
  onContentChange?: (newContent: TableDetailSummary) => void;
}

const { Text } = Typography;

// Asumo que las etiquetas para las propiedades de TableDetailSummary son estas.
// Puedes ajustarlas según la definición real de tu tipo.
const summaryLabels: Record<string, string> = {
  ShipmentId: 'Shipment Id',
  ErpOrder: 'Erp Order',
  Customer: 'Customer',
  ShipToAddress: 'Dirección de Envío',
  OrderDetails: 'Detalles de Orden',
  Comments: 'Comentarios',
};

const editableFields: (keyof TableDetailSummary)[] = ['ShipmentId', 'ErpOrder'];

const initialDisplayOrder: (keyof TableDetailSummary)[] = [
  'ShipmentId',
  'ErpOrder',
  'Customer',
];

const fullDisplayOrder: (keyof TableDetailSummary)[] = [
  ...initialDisplayOrder,
  'ShipToAddress',
  'Comments',
];

const TableSummary = ({ tableContent }: TableSummaryProps) => {
  const [summaryData, setSummaryData] = useState<TableDetailSummary | null>(
    tableContent,
  );
  const [showMore, setShowMore] = useState(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSummaryData(tableContent);
  }, [tableContent]);

  // Limpia el temporizador si el componente se desmonta para evitar fugas de memoria.
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (
    field: keyof TableDetailSummary,
    value: string,
  ) => {
    if (summaryData) {
      // 1. Actualiza el estado local inmediatamente para que la UI sea responsiva.
      const updatedData = { ...summaryData, [field]: value };
      setSummaryData(updatedData);

      // 2. Limpia cualquier temporizador pendiente.
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // 3. Establece un nuevo temporizador para llamar a onContentChange después del delay.
      debounceTimeoutRef.current = setTimeout(() => {
        console.log('[handleInputChange]:', updatedData);
        // onContentChange(updatedData);
      }, DEBOUNCE_DELAY);
    }
  };

  if (!summaryData) {
    return <div>Cargando resumen...</div>;
  }

  const displayOrder = showMore ? fullDisplayOrder : initialDisplayOrder;

  return (
    <div style={{ marginBottom: '24px' }}>
      <Descriptions title="Resumen del Envío" bordered column={1} size="small">
        {displayOrder.map((key) => {
          const value = summaryData[key];
          const isEditable = (editableFields as string[]).includes(key);

          let content: React.ReactNode;

          // Manejo especial para el objeto Customer para acceder a sus propiedades de forma segura
          if (key === 'Customer') {
            const customerName =
              typeof value === 'object' &&
              value !== null &&
              'CustomerName' in value
                ? String(value.CustomerName)
                : 'N/A';
            content = <Text>{customerName}</Text>;
          } else if (key === 'ShipToAddress') {
            if (typeof value === 'object' && value !== null) {
              const addressValue =
                'Address' in value ? String(value.Address) : 'N/A';
              const NameValue = 'Name' in value ? String(value.Name) : 'N/A';
              const ShipToValue =
                'ShipTo' in value ? String(value.ShipTo) : 'N/A';
              const address = `ShipTo: ${ShipToValue}\nName: ${NameValue}\nAddress: ${addressValue}`;
              content = (
                <Text style={{ whiteSpace: 'pre-wrap' }}>{address}</Text>
              );
            } else {
              content = <Text>N/A</Text>;
            }
          } else if (key === 'Comments') {
            const comments =
              Array.isArray(value) && value !== null
                ? value
                    .map((comment) => `${comment.CommentType}: ${comment.Text}`)
                    .join('\n')
                : 'N/A';
            content = (
              <Text style={{ whiteSpace: 'pre-wrap' }}>{comments}</Text>
            );
          } else {
            content = isEditable ? (
              <Input
                value={value as string}
                onChange={(e) => handleInputChange(key, e.target.value)}
                style={{ width: '100%' }}
                variant="borderless"
              />
            ) : (
              <Text>{String(value)}</Text>
            );
          }

          return (
            <Descriptions.Item label={summaryLabels[key] || key} key={key}>
              {content}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <Button onClick={() => setShowMore((prev) => !prev)}>
          {showMore ? 'Mostrar menos' : 'Mostrar más'}
        </Button>
      </div>
    </div>
  );
};

export default memo(TableSummary);
