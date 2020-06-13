import React, { useCallback, useEffect, useState } from 'react';

import { Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../hooks/auth';
import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  HeaderAvatar,
  ProvidersListConainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  CalendarTitle,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
} from './styles';
import api from '../../services/api';

interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute();
  const routeParams = route.params as RouteParams;

  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId
  );

  const [providers, setProviders] = useState<Provider[]>([]);
  const [shownDatePicker, setShownDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { goBack } = useNavigation();

  useEffect(() => {
    api.get('/providers').then((response) => setProviders(response.data));
  }, []);

  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleSelectedProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  const handleToggleOpenDatePicker = useCallback(() => {
    setShownDatePicker((state) => !state);
  }, []);

  const handleDayChange = useCallback((event: any, date: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShownDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  }, []);

  return (
    <Container>
      <Header>
        <BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>

        <HeaderTitle>Cabeleireiros</HeaderTitle>
        <HeaderAvatar
          source={{
            uri: `https://api.adorable.io/avatars/285/${user.name}`,
          }}
        />
      </Header>

      <ProvidersListConainer>
        <ProvidersList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={providers}
          keyExtractor={(provider) => provider.id}
          renderItem={({ item: provider }) => (
            <ProviderContainer
              selected={provider.id === selectedProvider}
              onPress={() => handleSelectedProvider(provider.id)}
            >
              <ProviderAvatar
                source={{
                  uri: `https://api.adorable.io/avatars/285/${provider.name}`,
                }}
              />
              <ProviderName selected={provider.id === selectedProvider}>
                {provider.name}
              </ProviderName>
            </ProviderContainer>
          )}
        />
      </ProvidersListConainer>

      <Calendar>
        <CalendarTitle>Escolha uma data</CalendarTitle>

        <OpenDatePickerButton onPress={handleToggleOpenDatePicker}>
          <OpenDatePickerButtonText>
            Selecionar outra data
          </OpenDatePickerButtonText>
        </OpenDatePickerButton>

        {shownDatePicker && (
          <DateTimePicker
            mode="date"
            display="calendar"
            value={selectedDate}
            textColor="#f4ede8"
            onChange={handleDayChange}
          />
        )}
      </Calendar>
    </Container>
  );
};

export default CreateAppointment;
