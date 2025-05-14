import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';

const EditableContext = React.createContext(null);

import { __awaiter, __rest } from '../utils/edit';

export function useEditeContent() {
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

          const currentValue = record[dataIndex];
          const newValue = values[dataIndex];

          toggleEdit();

          console.log({
            currentValue,
            newValue,
            'Bool: ': currentValue === newValue,
          });

          if (currentValue === newValue) {
            return;
          }

          handleSave(Object.assign(Object.assign({}, record), values));
        } catch (errInfo) {
          console.log('Save failed:', errInfo);
        }
      });

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        toggleEdit();
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item
          className="form-editable-cell"
          name={dataIndex}
          rules={[{ required: true, message: `${title} es requerido.` }]}
        >
          <Input
            ref={inputRef}
            onPressEnter={save}
            onBlur={save}
            onKeyDown={handleKeyDown}
          />
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

  return { EditableRow, EditableCell };
}
