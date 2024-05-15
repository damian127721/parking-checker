import { extendTheme, type ThemeConfig } from "@chakra-ui/react";
import "@fontsource/montserrat";
import { mode } from "@chakra-ui/theme-tools";
import type { StyleFunctionProps } from "@chakra-ui/styled-system";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const breakpoints = {
  xl: "1150px",
};

const Theme = extendTheme(
  { config, breakpoints },
  {
    fonts: {
      //Heading: `"Montserrat", sans-serif;`,
      body: `"Montserrat", sans-serif;`,
    },
    styles: {
      global: (props: StyleFunctionProps) => ({
        body: {
          color: mode("gray.800", "whiteAlpha.900")(props),
          bg: mode("white", "gray.800")(props),
        },
      }),
    },
  }
);

export default Theme;
