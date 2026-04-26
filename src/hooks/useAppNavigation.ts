import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

export function useAppNavigation() {
  return useNavigation<StackNavigationProp<RootStackParamList>>();
}
