import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import {Colors, Typography} from '../theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

/**
 * FormField — labelled text input with optional error message.
 */
const FormField: React.FC<FormFieldProps> = ({label, error, ...inputProps}) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : null]}
      placeholderTextColor={Colors.textMuted}
      {...inputProps}
    />
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    ...Typography.label,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});

export default FormField;
