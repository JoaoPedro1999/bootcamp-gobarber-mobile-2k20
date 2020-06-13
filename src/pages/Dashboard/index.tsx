import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../services/api';
import { useAuth } from '../../hooks/auth';
import {
  Container,
  Header,
  HeaderTitle,
  UserName,
  ProfileButton,
  UserAvatar,
  ProvidersList,
  ProviderListTitle,
  ProviderContainer,
  ProviderAvatar,
  ProviderInfo,
  ProviderName,
  ProviderMeta,
  ProviderMetaText,
} from './styles';

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}

const Dashboard: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const { user, signOut } = useAuth();

  const { navigate } = useNavigation();

  useEffect(() => {
    api.get('/providers').then((response) => setProviders(response.data));
  }, []);

  const navigationToProfile = useCallback(() => {
    // navigate('Profile');

    signOut();
  }, [signOut]);

  const navigationToCreateAppointment = useCallback(
    (providerId: string) => {
      navigate('CreateAppointment', { providerId });
    },
    [navigate]
  );

  return (
    <>
      <StatusBar backgroundColor="#28262e" />
      <Container>
        <Header>
          <HeaderTitle>
            Bem Vindo,
            {'\n'}
            <UserName>{user.name}</UserName>
          </HeaderTitle>

          <ProfileButton onPress={navigationToProfile}>
            <UserAvatar
              source={{
                uri: `https://api.adorable.io/avatars/285/${user.name}`,
              }}
            />
          </ProfileButton>
        </Header>

        <ProvidersList
          data={providers}
          keyExtractor={(provider) => provider.id}
          ListHeaderComponent={
            <ProviderListTitle>Cabeleireiros</ProviderListTitle>
          }
          renderItem={({ item: provider }) => (
            <ProviderContainer
              onPress={() => navigationToCreateAppointment(provider.id)}
            >
              <ProviderAvatar
                source={{
                  uri: `https://api.adorable.io/avatars/285/${provider.name}`,
                }}
              />

              <ProviderInfo>
                <ProviderName>{provider.name}</ProviderName>
                <ProviderMeta>
                  <Icon name="calendar" size={14} color="#ff9000" />
                  <ProviderMetaText>Segunda a Sexta</ProviderMetaText>
                </ProviderMeta>

                <ProviderMeta>
                  <Icon name="clock" size={14} color="#ff9000" />
                  <ProviderMetaText>8h às 18h</ProviderMetaText>
                </ProviderMeta>
              </ProviderInfo>
            </ProviderContainer>
          )}
        />
      </Container>
    </>
  );
};

export default Dashboard;
