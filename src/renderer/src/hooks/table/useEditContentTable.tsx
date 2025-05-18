import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';
import type { GetRef, InputRef } from 'antd';
import { TableRowData as Item } from '../../types/types';

type FormInstance<T> = GetRef<typeof Form<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

export const useEditContentTable = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
      <Form form={form} component={false}>
        <EditableContext.Provider value={form}>
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof Item;
    record: Item;
    handleSave: (record: Item) => void;
  }

  const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
      if (editing) {
        inputRef.current?.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      setEditing(!editing);
      form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        toggleEdit();
      }
    };

    const save = async () => {
      try {
        const values = await form.validateFields();

        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        console.log('Save failed:', errInfo);
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{ margin: 0 }}
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
};
