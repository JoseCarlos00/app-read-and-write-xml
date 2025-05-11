import { useState } from 'react';
import { Popconfirm, Table, Button, Flex } from 'antd';
import './Table.css';
import { useEditeContent } from '../hooks/editeContentTable';

const TableComponent2 = () => {
  const { EditableRow, EditableCell } = useEditeContent();

  const [dataSource, setDataSource] = useState([
    {
      key: '0',
      sku: '1025-3645-32152',
      qty: '32',
      lineNumber: '646840',
    },
    {
      key: '1',
      sku: '1190-10004-30531',
      qty: '12',
      lineNumber: '646841',
    },
    {
      key: '2',
      sku: '1290-9905-32901',
      qty: '50',
      lineNumber: '646845',
    },
  ]);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
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
      render: (_, record) =>
        dataSource.length >= 1 ? (
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

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, Object.assign(Object.assign({}, item), row));
    console.log('newData', newData);
    setDataSource(newData);
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

    return Object.assign(Object.assign({}, col), {
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    });
  });

  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  return (
    <Flex gap="middle" vertical className="container-principal">
      <Flex align="center" gap="middle">
        <Button type="primary" disabled={hasSelected === false}>
          Eliminar
        </Button>
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
        pagination={false}
      />
    </Flex>
  );
};

export default TableComponent2;
