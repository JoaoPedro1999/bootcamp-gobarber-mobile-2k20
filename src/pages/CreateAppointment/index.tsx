/* eslint-disable @typescript-eslint/camelcase */
import React, { useCallback, useEffect, useState, useMemo } from 'react';

import { format } from 'date-fns';
import { Platform, Alert } from 'react-native';
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
  Content,
  ProvidersListConainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
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

interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute();
  const routeParams = route.params as RouteParams;

  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId
  );

  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [shownDatePicker, setShownDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(0);

  const { goBack, navigate } = useNavigation();

  useEffect(() => {
    api.get('/providers').then((response) => setProviders(response.data));
  }, []);

  useEffect(() => {
    api
      .get(`/providers/${selectedProvider}/day-availability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then((response) => setAvailability(response.data));
  }, [selectedDate, selectedProvider]);

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

  const morningAvailabilty = useMemo(() => {
    return availability
      .filter(({ hour }) => hour < 12)
      .map(({ available, hour }) => {
        return {
          available,
          hour,
          hourFormated: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  const afternoonAvailabilty = useMemo(() => {
    return availability
      .filter(({ hour }) => hour >= 12)
      .map(({ available, hour }) => {
        return {
          available,
          hour,
          hourFormated: format(new Date().setHours(hour), 'HH:00'),
        };
      });
  }, [availability]);

  const handleSelectedHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      const date = new Date(selectedDate);

      date.setHours(selectedHour);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: selectedProvider,
        date,
      });

      navigate('AppointmentCreated', { date: date.getTime() });
    } catch {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao criar o agendamento, tente novamente'
      );
    }
  }, [selectedProvider, selectedDate, selectedHour, navigate]);

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

      <Content>
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
          <Title>Escolha uma data</Title>

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

        <Schedule>
          <Title>Escolha um horário</Title>

          <Section>
            <SectionTitle>Manhã</SectionTitle>

            <SectionContent>
              {morningAvailabilty.map(({ hour, hourFormated, available }) => (
                <Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  key={hourFormated}
                  available={available}
                  onPress={() => handleSelectedHour(hour)}
                >
                  <HourText selected={selectedHour === hour}>
                    {hourFormated}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>

          <Section>
            <SectionTitle>Tarde</SectionTitle>

            <SectionContent>
              {afternoonAvailabilty.map(({ hour, hourFormated, available }) => (
                <Hour
                  enabled={available}
                  selected={selectedHour === hour}
                  key={hourFormated}
                  available={available}
                  onPress={() => handleSelectedHour(hour)}
                >
                  <HourText selected={selectedHour === hour}>
                    {hourFormated}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>
        </Schedule>

        <CreateAppointmentButton onPress={handleCreateAppointment}>
          <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
        </CreateAppointmentButton>
      </Content>
    </Container>
  );
};

export default CreateAppointment;
