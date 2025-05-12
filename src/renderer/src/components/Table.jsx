import { useEffect, useState } from 'react';
import { Popconfirm, Table, Button, Flex } from 'antd';

import './Table.css';
import { useEditeContent } from '../hooks/editeContentTable';

class ShipmentDetail {
  constructor({ erpOrder, sku, qty, lineNumber }) {
    this.ErpOrderLineNum = lineNumber;
    this.SKU = sku;
    this.TotalQuantity = qty;
    this.ErpOrder = erpOrder;

    this.example = {
      Action: ['Save'],
      ErpOrder: ['3405-32523'],
      ErpOrderLineNum: ['646840'],
      RequestedQty: ['36'],
      SKU: [
        {
          Company: ['FM'],
          Item: ['1025-3645-32152'],
          Quantity: ['36'],
          QuantityUm: ['PZ'],
        },
      ],
      TotalQuantity: ['36'],
    };
  }

  createDetail() {
    return {
      Action: ['Save'],
      ErpOrder: [this.ErpOrder],
      ErpOrderLineNum: [this.ErpOrderLineNum],
      RequestedQty: [this.TotalQuantity],
      SKU: [
        {
          Company: ['FM'],
          Item: [this.SKU],
          Quantity: [this.TotalQuantity],
          QuantityUm: ['PZ'],
        },
      ],
      TotalQuantity: [this.TotalQuantity],
    };
  }

  static getNewArrayObject(shipmentDetails) {
    return shipmentDetails.map((detail) => {
      return new ShipmentDetail(detail).createDetail();
    });
  }
}

const getContentBodyTable = (shipmentDetails) => {
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
        const ErpOrderLineNum = detail?.ErpOrderLineNum;
        const SKUData = detail?.SKU;
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

        const skuValue =
          SKUData &&
          Array.isArray(SKUData) &&
          SKUData.length > 0 &&
          SKUData[0] &&
          typeof SKUData[0].Item !== 'undefined'
            ? SKUData[0].Item.toString()
            : 'N/A'; // Valor por defecto o placeholder para SKU

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

const TableComponent = ({ tableContent, onContentChange }) => {
  const { EditableRow, EditableCell } = useEditeContent();

  // Inicializar dataSource como un array vacío
  const [dataSource, setDataSource] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    const tbodyContent = getContentBodyTable(tableContent);
    setDataSource(tbodyContent);
  }, [tableContent]); // setDataSource no necesita ser una dependencia

  const handleOnContentChange = (newTableContent) => {
    const newArrayObject = ShipmentDetail.getNewArrayObject(newTableContent);
    console.log('newArrayObject', newArrayObject);
    onContentChange(newArrayObject);
  };

  const handleDelete = (key) => {
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
      render: (_, record) =>
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

  const handleSave = (row) => {
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
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
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

  const handleDeleteSelected = () => {
    const newData = dataSource.filter(
      (item) => !selectedRowKeys.includes(item.key),
    );
    setDataSource(newData);
    handleOnContentChange(newData);
    setSelectedRowKeys([]);
  };

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
