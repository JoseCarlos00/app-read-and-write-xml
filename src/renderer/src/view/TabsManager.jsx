import { useCallback, useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd';

import './TabsManager.css';
import EditorComponent from '../components/Editor';

const contentFile = `<Shipment>
  <Action>Save</Action>
  <UserDef6>CAMIONETA FM</UserDef6>
  <UserDef8>360</UserDef8>
  <AllocateComplete>N</AllocateComplete>
  <Comments>
    <Comment>
      <CommentType>Comentario1</CommentType>
      <Text>ATN. VIRIDIANA ORTEGA TAVARES</Text>
    </Comment>
    <Comment>
      <CommentType>Comentario3</CommentType>
      <Text>CL:MUNECAS GELI</Text>
    </Comment>
  </Comments>
  <ConsolidationAllowed>Y</ConsolidationAllowed>
  <Customer>
    <Carrier>Camioneta FM</Carrier>
    <CarrierService>Camioneta FM</CarrierService>
    <Company>FM</Company>
    <CustomerAddress>
      <Name>Mex-Valle</Name>
    </CustomerAddress>
    <Customer>Mex-Valle</Customer>
    <CustomerCategories>
      <Category1>CLIMX</Category1>
      <Category10>101</Category10>
      <Category2>STG DEL VALLE</Category2>
      <Category8>Y</Category8>
    </CustomerCategories>
    <ShipTo>MUÑECAS GELI</ShipTo>
    <ShipToAddress>
      <Address1>Felix Cuevas #112</Address1>
      <Address2>Del Valle</Address2>
      <Address3>Benito Juarez</Address3>
      <City>Mexico</City>
      <Country>MX</Country>
      <Name>VIRIDIANA ORTEGA TAVARES</Name>
      <PostalCode>03200</PostalCode>
      <State>CDMX</State>
    </ShipToAddress>
  </Customer>
  <CustomerPO>51800</CustomerPO>
  <ErpOrder>360-C-222-51800</ErpOrder>
  <OrderDate>2025-04-24T20:23:49</OrderDate>
  <OrderType>CLIMX</OrderType>
  <Priority>222</Priority>
  <ShipmentId>360-C-222-51800</ShipmentId>
  <UserDef13>--</UserDef13>
  <Warehouse>Mariano</Warehouse>
  <Details>
    <ShipmentDetail>
      <Action>Save</Action>
      <ErpOrder>360-51800</ErpOrder>
      <ErpOrderLineNum>2334828</ErpOrderLineNum>
      <RequestedQty>10</RequestedQty>
      <SKU>
        <Company>FM</Company>
        <Item>3006-560-114</Item>
        <Quantity>10</Quantity>
        <QuantityUm>PZ</QuantityUm>
      </SKU>
      <TotalQuantity>10</TotalQuantity>
    </ShipmentDetail>
    <ShipmentDetail>
      <Action>Save</Action>
      <ErpOrder>360-51800</ErpOrder>
      <ErpOrderLineNum>2334829</ErpOrderLineNum>
      <RequestedQty>63</RequestedQty>
      <SKU>
        <Company>FM</Company>
        <Item>6222-7223-13737</Item>
        <Quantity>63</Quantity>
        <QuantityUm>PZ</QuantityUm>
      </SKU>
      <TotalQuantity>63</TotalQuantity>
    </ShipmentDetail>
    <ShipmentDetail>
      <Action>Save</Action>
      <ErpOrder>360-51800</ErpOrder>
      <ErpOrderLineNum>2334830</ErpOrderLineNum>
      <RequestedQty>12</RequestedQty>
      <SKU>
        <Company>FM</Company>
        <Item>7265-4489-13664</Item>
        <Quantity>12</Quantity>
        <QuantityUm>PZ</QuantityUm>
      </SKU>
      <TotalQuantity>12</TotalQuantity>
    </ShipmentDetail>
  </Details>
</Shipment>
`;

const initialItems = [
  {
    label: 'Tab 1',
    children: <EditorComponent content={contentFile} />,
    key: '1',
  },
  {
    label: 'Tab 2',
    children: <EditorComponent content={contentFile} />,
    key: '2',
  },
  {
    label: 'Tab 3',
    children: <EditorComponent content={contentFile} />,
    key: '3',
  },
];

const TabsManager = () => {
  const [activeKey, setActiveKey] = useState(initialItems[0].key);
  const [items, setItems] = useState(initialItems);
  const newTabIndex = useRef(0);

  const onChange = (key) => {
    setActiveKey(key);
  };

  const add = useCallback(() => {
    const newActiveKey = `newTab${newTabIndex.current++}`;
    const newPanes = [...items]; // Create a new array instance
    newPanes.push({
      label: 'New Tab',
      children: 'Content of new Tab',
      key: newActiveKey,
    });
    setItems(newPanes);
    setActiveKey(newActiveKey);
  }, [items, setItems, setActiveKey]); // newTabIndex is a ref, its .current mutation doesn't need to be a dep for useCallback identity

  const remove = useCallback(
    (targetKey) => {
      let newActiveKeyCandidate = activeKey;
      let lastIndex = -1;

      // Find the index of the tab *before* the one being removed (in the original items list)
      items.forEach((item, i) => {
        if (item.key === targetKey) {
          lastIndex = i - 1;
        }
      });

      const newPanes = items.filter((item) => item.key !== targetKey);

      if (newPanes.length && newActiveKeyCandidate === targetKey) {
        // If the active tab is being removed
        if (lastIndex >= 0) {
          // The tab at lastIndex in the original list is now at that same index in newPanes,
          // assuming only one item (targetKey) was removed.
          newActiveKeyCandidate = newPanes[lastIndex].key;
        } else {
          // If the first tab was removed (lastIndex is -1), activate the new first tab
          newActiveKeyCandidate = newPanes[0].key;
        }
      } else if (newPanes.length === 0) {
        // If all tabs are removed
        newActiveKeyCandidate = null; // Or some other indicator for no active tab
      }
      // If a non-active tab is removed, activeKeyCandidate remains the current activeKey,
      // which is fine as long as that tab still exists.

      setItems(newPanes);
      setActiveKey(newActiveKeyCandidate);
    },
    [activeKey, items, setItems, setActiveKey],
  );

  const onEdit = (targetKey, action) => {
    if (action === 'add') {
      add();
    } else if (action === 'remove') {
      remove(targetKey);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+W or Ctrl+Shift+w to close current tab
      if (e.ctrlKey && e.shiftKey && (e.key === 'W' || e.key === 'w')) {
        e.preventDefault();
        if (activeKey && items.find((item) => item.key === activeKey)) {
          // Ensure there's an active tab to remove
          remove(activeKey);
        }
        return;
      }

      // Ctrl+Tab to cycle tabs (Shift for reverse)
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (!items || items.length === 0) return; // No tabs to cycle

        const currentIndex = items.findIndex((item) => item.key === activeKey);
        if (currentIndex === -1 && items.length > 0) {
          // If activeKey is somehow invalid, select the first
          setActiveKey(items[0].key);
          return;
        }
        const newIndex = e.shiftKey
          ? (currentIndex - 1 + items.length) % items.length
          : (currentIndex + 1) % items.length;
        setActiveKey(items[newIndex].key);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeKey, items, remove, setActiveKey]); // Dependencies for the effect

  return (
    <Tabs
      className="custom-tabs-manager"
      type="editable-card"
      onChange={onChange}
      activeKey={activeKey}
      onEdit={onEdit}
      items={items}
      size="middle"
    />
  );
};

export default TabsManager;
