import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
} from "react-native";
import { useTheme } from "../hooks/useTheme";

interface TaskInputProps {
  onAdd: (title: string) => void;
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState("");
  const { colors } = useTheme();

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
    Keyboard.dismiss();
  };

  const isDisabled = !value.trim();

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.backgroundSoft,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={setValue}
        placeholder="Tambah task baru..."
        placeholderTextColor={colors.textMuted}
        returnKeyType="done"
        onSubmitEditing={handleAdd}
        maxLength={100}
        accessibilityLabel="New task title"
        accessibilityHint="Enter a task title, then submit to add it to the list."
      />
      <TouchableOpacity
        style={[
          styles.addBtn,
          {
            backgroundColor: isDisabled ? colors.primaryMuted : colors.primary,
          },
        ]}
        onPress={handleAdd}
        disabled={isDisabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add task"
        accessibilityHint="Adds the typed task to your list."
        accessibilityState={{ disabled: isDisabled }}
      >
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 28,
  },
});
