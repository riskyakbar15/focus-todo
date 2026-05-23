import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
} from "react-native";

interface TaskInputProps {
  onAdd: (title: string) => void;
}

export default function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Tambah task baru..."
        placeholderTextColor="#bbb"
        returnKeyType="done"
        onSubmitEditing={handleAdd}
        maxLength={100}
      />
      <TouchableOpacity
        style={[styles.addBtn, !value.trim() && styles.addBtnDisabled]}
        onPress={handleAdd}
        disabled={!value.trim()}
        activeOpacity={0.8}
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
    borderColor: "#E0DEF8",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#1a1a1a",
    backgroundColor: "#FAFAFE",
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: "#534AB7",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    backgroundColor: "#C5C2E8",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 28,
  },
});
