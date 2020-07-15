import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

export const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 0 24px;
`;

export const Title = styled.Text`
  font-size: 32px;
  color: #f4ede8;
  margin-top: 46px;
  text-align: center;
  font-family: 'RobotoSlab-Medium';
`;

export const Description = styled.Text`
  font-size: 16px;
  color: #999591;
  margin-top: 16px;
  font-family: 'RobotoSlab-Regular';
`;

export const OkButton = styled(RectButton)`
  background: #ff9000;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  margin-top: 24px;
  padding: 12px 24px;
`;

export const OkButtonText = styled.Text`
  color: #312e38;
  font-size: 18px;
  font-family: 'RobotoSlab-Regular';
`;
