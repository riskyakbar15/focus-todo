import {
  Text as RNText,
  TextInput as RNTextInput,
  type TextProps,
  type TextInputProps,
} from "react-native";

const baseFont = { fontFamily: "PlusJakartaSans_400Regular" } as const;

// Wrappers that apply the default app font without relying on the
// deprecated `Text.defaultProps` / `TextInput.defaultProps` API (React 19).
export function AppText({ style, ...props }: TextProps) {
  return <RNText {...props} style={[baseFont, style]} />;
}

export function AppTextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput {...props} style={[baseFont, style]} />;
}
