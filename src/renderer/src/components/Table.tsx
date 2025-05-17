import { useEffect, useState } from 'react';
import { Popconfirm, Table, Button, Flex, TableColumnsType } from 'antd';

import './Table.css';
import { useEditeContent } from '../hooks/editeContentTable';
import { ShipmentDetail as ShipmentDetailType } from '../types/shipmentDetail';

// Interface para la estructura de datos que maneja la tabla internamente
interface TableRowData {
  key: string;
  sku: string;
  qty: string;
  lineNumber: string;
  erpOrder: string;
}

class ShipmentDetail {
  ErpOrderLineNum: string;
  SKU: string;
  TotalQuantity: string;
  ErpOrder: string;
  example: ShipmentDetailType;

  constructor({ erpOrder, sku, qty, lineNumber }: TableRowData) {
    this.ErpOrderLineNum = lineNumber;
    this.SKU = sku;
    this.TotalQuantity = qty;
    this.ErpOrder = erpOrder;

    this.example = {
      Action: 'Save',
      ErpOrder: '3405-32523',
      ErpOrderLineNum: '646840',
      RequestedQty: '36',
      SKU: {
        Company: 'FM',
        Item: '1025-3645-32152',
        Quantity: '36',
        QuantityUm: 'PZ',
      },
      TotalQuantity: '36',
    };
  }

  createDetail(): ShipmentDetailType {
    return {
      Action: 'Save',
      ErpOrder: this.ErpOrder,
      ErpOrderLineNum: this.ErpOrderLineNum,
      RequestedQty: this.TotalQuantity,
      SKU: {
        Company: 'FM',
        Item: this.SKU,
        Quantity: this.TotalQuantity,
        QuantityUm: 'PZ',
      },
      TotalQuantity: this.TotalQuantity,
    };
  }

  static getNewArrayObject(
    shipmentDetails: TableRowData[],
  ): ShipmentDetailType[] {
    return shipmentDetails.map((detail) => {
      return new ShipmentDetail(detail).createDetail();
    });
  }
}

const getContentBodyTable = (
  shipmentDetails: ShipmentDetailType[] | undefined,
): TableRowData[] => {
  try {
    if (
      !shipmentDetails ||
      !Array.isArray(shipmentDetails) ||
      shipmentDetails.length === 0
    ) {
      return []; // Devuelve un array vacío si no hay datos
    }

    const content = shipmentDetails
      .map((detail) => {
        const ErpOrderLineNum = detail.ErpOrderLineNum;
        const SKU = detail?.SKU;
        const TotalQuantity = detail?.TotalQuantity;
        const ErpOrder = detail?.ErpOrder;

        // Es crucial que LineNumber exista para la key
        if (
          typeof ErpOrderLineNum === 'undefined' ||
          ErpOrderLineNum === null
        ) {
          console.warn('Detalle omitido por falta de ErpOrderLineNum:', detail);
          return null; // Omitir este elemento si no tiene LineNumber
        }

        const key = ErpOrderLineNum.toString();

        const skuValue = SKU ? SKU.Item.toString() : 'N/A'; // Valor por defecto o placeholder para SKU

        const quantityValue =
          typeof TotalQuantity !== 'undefined' ? TotalQuantity.toString() : '0'; // Valor por defecto

        const erpOrderValue =
          typeof ErpOrder !== 'undefined' ? ErpOrder.toString() : '0'; // Valor por defecto

        if (erpOrderValue === '0') {
          console.warn('Detalle omitido por falta de ErpOrder:', detail);
          return null; // Omitir este elemento si no tiene LineNumber
        }

        return {
          key,
          sku: skuValue,
          qty: quantityValue,
          lineNumber: key,
          erpOrder: erpOrderValue,
        };
      })
      .filter((item) => item !== null); // Filtrar elementos que no pudieron ser procesados

    return content;
  } catch (error) {
    console.error('Error al procesar los datos para la tabla:', error); // Usar console.error
    return []; // Devuelve un array vacío en caso de error
  }
};

interface TableComponentProps {
  tableContent: ShipmentDetailType[] | undefined;
  onContentChange: (newContent: ShipmentDetailType[]) => void;
}

const TableComponent = ({
  tableContent,
  onContentChange,
}: TableComponentProps) => {
  const { EditableRow, EditableCell } = useEditeContent();

  // Inicializar dataSource como un array vacío
  const [dataSource, setDataSource] = useState<TableRowData[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<string>>([]);

  useEffect(() => {
    const tbodyContent = getContentBodyTable(tableContent);
    setDataSource(tbodyContent);
  }, [tableContent]);

  const handleOnContentChange = (newTableContent: TableRowData[]) => {
    const newArrayObject = ShipmentDetail.getNewArrayObject(newTableContent);
    console.log('newArrayObject', newArrayObject);
    onContentChange(newArrayObject);
  };

  const handleDelete = (key: string) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    handleOnContentChange(newData);
  };

  const defaultColumns = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: '30%',
      editable: true,
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      editable: true,
    },
    {
      title: 'Line Number',
      dataIndex: 'lineNumber',
    },
    {
      title: 'Actions',
      dataIndex: 'operation',
      render: (_: any, record: TableRowData) =>
        dataSource && dataSource.length >= 1 ? (
          <Popconfirm
            title={`Eliminar el item: ${record.sku}?`}
            okText="Eliminar"
            cancelText="Cancelar"
            onConfirm={() => handleDelete(record.key)}
          >
            <a>Eliminar</a>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleSave = (row: TableRowData) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });

    console.log('newData', newData);
    setDataSource(newData);
    handleOnContentChange(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record: TableRowData) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const onSelectChange = (newSelectedRowKeys: Array<string>) => {
    console.log(
      'selectedRowKeys changed: ',
      typeof newSelectedRowKeys,
      newSelectedRowKeys,
    );
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  const handleDeleteSelected = () => {
    const newData = dataSource.filter(
      (item) => !selectedRowKeys.includes(item.key),
    );
    setDataSource(newData);
    handleOnContentChange(newData);
    setSelectedRowKeys([]);
  };

  console.log('[TableComponent]:', {
    tableContent,
    dataSource,
    selectedRowKeys,
    hasSelected,
  });

  return (
    <Flex gap="middle" vertical className="container-principal">
      <Flex align="center" gap="middle">
        <Button
          type="primary"
          onClick={handleDeleteSelected}
          disabled={!hasSelected}
        >
          Eliminar Seleccionados
        </Button>
        {/* Texto del botón actualizado para mayor claridad */}
        {hasSelected ? `Selected ${selectedRowKeys.length} items` : null}
      </Flex>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
        size="small"
        rowSelection={rowSelection}
        pagination={true}
      />
    </Flex>
  );
};

export default TableComponent;
