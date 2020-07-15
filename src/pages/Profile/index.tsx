import React, { useCallback, useRef, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  View,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';

import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';
import * as Yup from 'yup';

import getValidationsErros from '../../utils/getValidationErrors';
import api from '../../services/api';

import Button from '../../components/Button';
import Input from '../../components/Input';

import {
  Container,
  Title,
  BackButton,
  UserAvatarButton,
  UserAvatar,
} from './styles';
import { useAuth } from '../../hooks/auth';

interface ProfileFormData {
  name: string;
  email: string;
  old_password?: string;
  password?: string;
  password_confirmation?: string;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const formRef = useRef<FormHandles>(null);
  const navigation = useNavigation();

  const emailInputRef = useRef<TextInput>(null);
  const oldPasswordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  const handleUpdateProfile = useCallback(
    async (data: ProfileFormData) => {
      try {
        formRef.current?.setErrors({});

        const schema = Yup.object().shape({
          name: Yup.string().required('Nome obrigatório'),
          email: Yup.string()
            .required('Email obrigatório')
            .email('Digite um email válido'),
          old_password: Yup.string(),
          password: Yup.string().when('old_password', {
            is: (val) => !!val.length,
            then: Yup.string()
              .min(6, 'No minimo 6 digitos')
              .required('Campo obrigatório'),
            otherwise: Yup.string(),
          }),
          password_confirmation: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Confirmação Incorreta')
            .when('password', {
              is: (val) => !!val.length,
              then: Yup.string()
                .required('Campo obrigatório')
                .min(6, 'No minimo 6 digitos'),
              otherwise: Yup.string(),
            }),
        });

        await schema.validate(data, {
          abortEarly: false,
        });

        const {
          email,
          name,
          old_password,
          password,
          password_confirmation,
        } = data;

        const formData = {
          email,
          name,
          ...(data.old_password
            ? {
                old_password,
                password,
                password_confirmation,
              }
            : {}),
        };

        const response = await api.put('/profile', formData);

        updateUser(response.data);

        Alert.alert('Alteração de perfil realizada com sucesso!');

        navigation.goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationsErros(err);

          formRef.current?.setErrors(errors);
        }

        Alert.alert(
          'Erro na alteração do perfil',
          'Ocorreu um erro ao alterar o perfil, tente novamente'
        );

        console.log(err);
      }
    },
    [navigation, updateUser]
  );

  const handleGoback = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleUpdateAvatar = useCallback(() => {
    ImagePicker.showImagePicker(
      {
        title: 'Selecione uma foto',
        cancelButtonTitle: 'Cancelar',
        chooseFromLibraryButtonTitle: 'Escolha da galeria',
        takePhotoButtonTitle: 'Usar Camera',
      },
      (response) => {
        if (response.didCancel) {
          return;
        }
        if (response.error) {
          Alert.alert('Erro ao atualizar seu avatar');
          console.log(response.error);
        }

        const source = { uri: response.uri };
        console.log(source);

        const data = new FormData();

        data.append('avatar', {
          type: 'image/jpeg',
          name: `${user.id}.jpeg`,
          uri: response.uri,
        });

        api
          .patch('/users/avatar', data)
          .then((apiResponse) => updateUser(apiResponse.data))
          .catch((err) => console.log(err));
      }
    );
  }, [updateUser, user]);

  const loadUserImage = useMemo(() => {
    if (user.avatar_url) {
      return user.avatar_url;
    }
    return `https://api.adorable.io/avatars/285/${user.name}`;
  }, [user]);

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Container>
            <BackButton onPress={handleGoback}>
              <Icon name="chevron-left" size={24} color="#999591" />
            </BackButton>

            <UserAvatarButton onPress={handleUpdateAvatar}>
              <UserAvatar source={{ uri: loadUserImage }} />
            </UserAvatarButton>

            <View>
              <Title>Meu perfil</Title>
            </View>

            <Form
              initialData={user}
              ref={formRef}
              onSubmit={handleUpdateProfile}
            >
              <Input
                name="name"
                icon="user"
                placeholder="Nome completo"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
              />

              <Input
                ref={emailInputRef}
                name="email"
                icon="mail"
                placeholder="E-mail"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => oldPasswordInputRef.current?.focus()}
              />

              <Input
                ref={oldPasswordInputRef}
                name="old_password"
                icon="lock"
                placeholder="Senha Atual"
                containerStyle={{ marginTop: 16 }}
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="Senha"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus();
                }}
              />

              <Input
                ref={confirmPasswordInputRef}
                name="password_confirmation"
                icon="lock"
                placeholder="Confirmar Senha"
                secureTextEntry
                textContentType="newPassword"
                returnKeyType="send"
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />

              <Button
                onPress={() => {
                  formRef.current?.submitForm();
                }}
              >
                Confirmar Mudanças
              </Button>
            </Form>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default Profile;
