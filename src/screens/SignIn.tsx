import { Image, VStack } from "@gluestack-ui/themed";

import BackgroundImg from "@/assets/background.png";

export function SignIn() {
  return (
    <VStack flex={1} bg="$gray700">
      <Image
        w="$full"
        h={624}
        source={BackgroundImg}
        defaultSource={BackgroundImg}
        alt="People training"
        position="absolute"
      />
    </VStack>
  );
}
