import { useEffect, useState, Key } from 'react';
import { Popconfirm, Table, Button, Flex, type TableProps, Badge } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

import './Table.css';
import { ShipmentDetail as ShipmentDetailType } from '../types/shipmentDetail';
import { TableRowData } from '../types/types';
import { getContentBodyTable } from '../utils/table/getContentBodyTable';
import { ShipmentDetail } from '../class/ShipmentDetail';
import { useEditContentTable } from '../hooks/table/useEditContentTable';

interface TableComponentProps {
  tableContent: ShipmentDetailType[] | undefined;
  onContentChange: (newContent: ShipmentDetailType[]) => void;
}

type ColumnTypes = Exclude<TableProps<TableRowData>['columns'], undefined>;

const TableComponent = ({
  tableContent,
  onContentChange,
}: TableComponentProps) => {
  const { EditableRow, EditableCell } = useEditContentTable();

  // Inicializar dataSource como un array vacío
  const [dataSource, setDataSource] = useState<TableRowData[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Array<Key>>([]);

  useEffect(() => {
    const tbodyContent = getContentBodyTable(tableContent);
    setDataSource(tbodyContent);
  }, [tableContent]);

  const handleOnContentChange = (newTableContent: TableRowData[]) => {
    const newArrayObject = ShipmentDetail.getNewArrayObject(newTableContent);
    onContentChange(newArrayObject);
  };

  const handleDelete = (key: string) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    handleOnContentChange(newData);
  };

  const defaultColumns: (ColumnTypes[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
    {
      title: 'SKU',
      dataIndex: 'sku',
      width: '30%',
      editable: true,
      sorter: (a, b) => {
        if (a.sku < b.sku) {
          return -1;
        }
        if (a.sku > b.sku) {
          return 1;
        }
        return 0;
      },
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
      width: '10%',
      editable: false,
      render: (_, record) =>
        dataSource && dataSource.length >= 1 ? (
          <Popconfirm
            title={`Eliminar el item: ${record.sku}?`}
            okText="Eliminar"
            cancelText="Cancelar"
            onConfirm={() => handleDelete(record.key)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DeleteOutlined
                title="Eliminar"
                style={{ color: 'red', cursor: 'pointer', fontSize: '20px' }}
              />
            </div>
          </Popconfirm>
        ) : null,
    },
  ];

  const handleSave = (row: TableRowData) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });

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

  const onSelectChange = (newSelectedRowKeys: Array<Key>) => {
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

  const paginationCOnfig: TableProps<TableRowData>['pagination'] = {
    position: ['bottomRight'],
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) => {
      return `Mostrado ${range[0]}-${range[1]}`;
    },
  };

  return (
    <Flex gap="middle" vertical className="container-principal">
      <Flex align="center" justify="space-between">
        <Flex align="center" gap="middle">
          <Badge count={selectedRowKeys.length}>
            <Button
              type="primary"
              onClick={handleDeleteSelected}
              disabled={!hasSelected}
            >
              Eliminar Filas
            </Button>
          </Badge>
        </Flex>

        <label>Total: {dataSource.length}</label>
      </Flex>

      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
        size="small"
        rowSelection={rowSelection}
        pagination={paginationCOnfig}
        sticky={true}
      />
    </Flex>
  );
};

export default TableComponent;
