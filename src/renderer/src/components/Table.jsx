import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Input, Popconfirm, Table, Button, Flex } from 'antd';
import './Table.css';

import { __awaiter, __rest } from '../utils/edit';

const EditableContext = React.createContext(null);
const EditableRow = (_a) => {
  var props = __rest(_a, ['index']);

  const [form] = Form.useForm();

  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = (_a) => {
  var { title, editable, children, dataIndex, record, handleSave } = _a,
    restProps = __rest(_a, [
      'title',
      'editable',
      'children',
      'dataIndex',
      'record',
      'handleSave',
    ]);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    var _a;
    if (editing) {
      (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = () =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        const values = yield form.validateFields();
        toggleEdit();
        handleSave(Object.assign(Object.assign({}, record), values));
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    });

  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[{ required: true, message: `${title} is required.` }]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const TableComponent2 = () => {
  const [dataSource, setDataSource] = useState([
    {
      key: '0',
      name: 'Edward King 0',
      age: '32',
      address: 'London, Park Lane no. 0',
    },
    {
      key: '1',
      name: 'Edward King 1',
      age: '32',
      address: 'London, Park Lane no. 1',
    },
    {
      key: '2',
      name: 'Edward King 2',
      age: '50',
      address: 'London, Park Lane no. 1',
    },
  ]);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const defaultColumns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '30%',
      editable: true,
    },
    {
      title: 'age',
      dataIndex: 'age',
      editable: true,
    },
    {
      title: 'address',
      dataIndex: 'address',
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) =>
        dataSource.length >= 1 ? (
          <Popconfirm
            title="Seguro?"
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
    <Flex gap="middle" vertical>
      <Flex align="center" gap="middle">
        <Button type="primary" disabled="true">
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
      />
    </Flex>
  );
};

export default TableComponent2;
