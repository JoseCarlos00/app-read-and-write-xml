import { useState } from 'react';
import { Popconfirm, Table, Button, Flex } from 'antd';
import './Table.css';
import { useEditeContent } from '../hooks/editeContentTable';

// import data from '../mock/data.json';

const getContentBodyTable = (data) => {
  try {
    const shipmentDetails =
      data.WMWROOT.WMWDATA[0].Shipments[0].Shipment[0].Details[0]
        .ShipmentDetail;

    if (!shipmentDetails) {
      return [];
    }

    const content = shipmentDetails.map(
      ({ SKU, TotalQuantity: Quantity, ErpOrderLineNum: LineNumber }) => {
        const { Item } = SKU[0];
        const key = LineNumber.toString();

        return {
          key,
          sku: Item.toString(),
          qty: Quantity.toString(),
          lineNumber: key,
        };
      },
    );

    return content;
  } catch (error) {
    console.log('Error al obtener el contenido de la tabla:', error);
    return [];
  }
};

const TableComponent = ({ bodyContent }) => {
  const { EditableRow, EditableCell } = useEditeContent();

  const [dataSource, setDataSource] = useState(
    getContentBodyTable(bodyContent),
  );

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
        pagination={true}
      />
    </Flex>
  );
};

export default TableComponent;
