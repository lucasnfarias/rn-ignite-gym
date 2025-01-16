import {
  ButtonSpinner,
  Button as GluestackButton,
  Text,
} from "@gluestack-ui/themed";
import React, { ComponentProps } from "react";

type Props = ComponentProps<typeof GluestackButton> & {
  title: string;
  customVariant?: "solid" | "outlined";
  isLoading?: boolean;
};

export const Button: React.FC<Props> = ({
  title,
  customVariant = "solid",
  isLoading = false,
  ...rest
}: Props) => {
  return (
    <GluestackButton
      w="$full"
      h="$14"
      bg={customVariant === "outlined" ? "transparent" : "$green700"}
      borderWidth={customVariant === "outlined" ? "$1" : "$0"}
      borderColor="$green500"
      rounded="$sm"
      $active-backgroundColor={
        customVariant === "outlined" ? "$gray500" : "$green500"
      }
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? (
        <ButtonSpinner
          color="$white"
        />
      ) : (
        <Text
          color={customVariant === "outlined" ? "$green500" : "$white"}
          fontFamily="$heading"
          fontSize="$sm"
        >
          {title}
        </Text>
      )}
    </GluestackButton>
  );
};
