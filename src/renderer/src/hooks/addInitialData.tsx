import { useEffect } from 'react';
import { useTabManagerStore } from '../store/viewStore';

import { data } from '../mock/mock';

export const InitialData = () => {
  const addTab = useTabManagerStore((state) => state.addTab);

  useEffect(() => {
    addTab({
      label: 'Tab 1',
      content: data,
      key: '1',
    });
  }, [addTab]);

  return <></>;
};
