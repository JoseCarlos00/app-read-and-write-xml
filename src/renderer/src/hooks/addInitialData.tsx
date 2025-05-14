import { useEffect } from 'react';
import { useTabManagerStore } from '../store/viewStore';
import ContentTab from '../view/ContentTab';

import { data } from '../mock/mock';

const initialItems = [
  {
    label: 'Tab 1',
    children: <ContentTab content={data} tabKey={'1'} />,
    key: '1',
  },
];

export const InitialData = () => {
  const addTab = useTabManagerStore((state) => state.addTab);

  useEffect(() => {
    addTab(initialItems[0]);
  }, [addTab]);

  return <></>;
};
