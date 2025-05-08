import {
  ApartmentOutlined,
  FundProjectionScreenOutlined,
} from '@ant-design/icons';
import { Button, Flex } from 'antd';

const Tools = () => {
  return (
    <>
      <Flex gap="small" align="flex-start" vertical>
        <Flex gap="small" wrap>
          <Button
            type="primary"
            icon={<FundProjectionScreenOutlined />}
            size="small"
          />

          <Button
            type="primary"
            shape="circle"
            icon={<ApartmentOutlined />}
            size="small"
          />

          <span>|</span>
        </Flex>
      </Flex>
    </>
  );
};

export default Tools;
