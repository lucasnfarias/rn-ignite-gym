import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ToastMessage } from "@/components/ToastMessage";
import { UserPhoto } from "@/components/UserPhoto";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/services/api";
import { AppError } from "@/utils/AppError";
import { Center, Heading, Text, useToast, VStack } from "@gluestack-ui/themed";
import { yupResolver } from "@hookform/resolvers/yup";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, TouchableOpacity } from "react-native";
import * as yup from "yup";

type FormDataProps = {
  name: string;
  email: string;
  password?: string | null;
  old_password?: string | null; 
  confirmed_password?: string | null;
};

const profileSchema = yup.object({
  name: yup.string().required("Informe o nome."),
  email: yup.string().required(),
  old_password: yup
    .string()
    .nullable()
    .transform((value) => (!!value ? value : null)),
  password: yup
    .string()
    .min(6, "A senha deve ter pelo menos 6 dígitos.")
    .nullable()
    .transform((value) => (!!value ? value : null)),
  confirmed_password: yup
    .string()
    .nullable()
    .transform((value) => (!!value ? value : null))
    .oneOf([yup.ref("password"), null], "A confirmação da senha não confere.")
    .when("password", {
      is: (field: any) => field,
      then: () =>
        yup
          .string()
          .nullable()
          .required("Informe a confirmação da senha.")
          .transform((value) => (!!value ? value : null)),
    }),
});

export function Profile() {
  const [isUpdating, setIsUpdating] = useState(false)
  const [userPhoto, setUserPhoto] = useState(
    "https://github.com/lucasnfarias.png"
  );

  const toast = useToast();
  const { user, updateUserProfile } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(profileSchema),
  });

  async function handleUserPhotoSelect() {
    try {
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      });

      if (photoSelected.canceled) return;

      const photoURI = photoSelected.assets[0].uri;

      if (photoURI) {
        const photoInfo = (await FileSystem.getInfoAsync(photoURI)) as {
          size: number;
        };

        const PHOTO_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
        if (photoInfo.size && photoInfo.size > PHOTO_SIZE_LIMIT) {
          return toast.show({
            placement: "top",
            render: ({ id }) => (
              <ToastMessage
                id={id}
                action="error"
                title="Essa image é muito grande. Escolha uma de até 5MB."
                onClose={() => toast.close(id)}
              />
            ),
          });
        }

        setUserPhoto(photoURI);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleProfileUpdate(data: FormDataProps) {
    try {
      setIsUpdating(true);

      const userUpdated = user
      userUpdated.name = data.name

      await api.put("/users", data);

      await updateUserProfile(userUpdated)

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <ToastMessage
            id={id}
            title="Perfil atualizado com sucesso!"
            onClose={() => toast.close(id)}
          />
        ),
      });

    } catch (error) {
      const isAppError = error instanceof AppError;

      const title = isAppError
        ? error.message
        : "Não foi possível atualizar o perfil.";

      toast.show({
        placement: "top",
        render: ({ id }) => (
          <ToastMessage
            id={id}
            action="error"
            title={title}
            onClose={() => toast.close(id)}
          />
        ),
      });
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />

      <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
        <Center mt="$6" px="$10">
          <UserPhoto
            source={{ uri: userPhoto }}
            alt="imagem do usuário"
            size="xl"
          />

          <TouchableOpacity onPress={handleUserPhotoSelect}>
            <Text
              color="$green500"
              fontFamily="$heading"
              fontSize="$md"
              mt="$2"
              mb="$8"
            >
              Alterar Foto
            </Text>
          </TouchableOpacity>

          <Center w="$full" gap="$4">
            <Controller
              control={control}
              name="name"
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="Nome"
                  bg="$gray600"
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange } }) => (
                <Input
                  placeholder="Nome"
                  bg="$gray600"
                  onChangeText={onChange}
                  value={value}
                  isReadOnly
                />
              )}
            />
          </Center>

          <Heading
            alignItems="flex-start"
            fontFamily="$heading"
            color="$gray200"
            fontSize="$md"
            mt="$12"
            mb="$2"
          >
            Alterar senha
          </Heading>

          <Center w="$full" gap="$4">
            <Controller
              control={control}
              name="old_password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Senha antiga"
                  bg="$gray600"
                  secureTextEntry
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Nova senha"
                  bg="$gray600"
                  secureTextEntry
                  onChangeText={onChange}
                  errorMessage={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmed_password"
              render={({ field: { onChange } }) => (
                <Input
                  placeholder="Confirme a nova senha"
                  bg="$gray600"
                  secureTextEntry
                  onChangeText={onChange}
                  errorMessage={errors.confirmed_password?.message}
                />
              )}
            />

            <Button
              title="Atualizar"
              onPress={handleSubmit(handleProfileUpdate)}
              isLoading={isUpdating}
            />
          </Center>
        </Center>
      </ScrollView>
    </VStack>
  );
}
