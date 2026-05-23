import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Colors, Typography} from '../../theme';
import {StormType, NewStormEvent} from '../../models';
import {StormEventRepository} from '../../services/database';
import {useLocation} from '../../hooks';
import {useWeather} from '../../hooks';
import StormTypePicker from '../../components/StormTypePicker';
import FormField from '../../components/FormField';

interface FormErrors {
  title?: string;
  photo?: string;
}

const DocumentScreen: React.FC = () => {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [stormType, setStormType] = useState<StormType>('thunderstorm');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Location & weather (auto-filled metadata) ──────────────────────────────
  const {coordinates} = useLocation();
  const {data: weather} = useWeather(coordinates);

  // ── Camera / gallery ───────────────────────────────────────────────────────
  const handleCamera = useCallback(() => {
    launchCamera(
      {mediaType: 'photo', quality: 0.8, saveToPhotos: false},
      response => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setPhotoUri(uri);
          setErrors(prev => ({...prev, photo: undefined}));
        }
      },
    );
  }, []);

  const handleGallery = useCallback(() => {
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.8},
      response => {
        if (response.didCancel || response.errorCode) {
          return;
        }
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setPhotoUri(uri);
          setErrors(prev => ({...prev, photo: undefined}));
        }
      },
    );
  }, []);

  const showPhotoOptions = useCallback(() => {
    Alert.alert('Add Photo', 'Choose a source', [
      {text: 'Camera', onPress: handleCamera},
      {text: 'Photo Library', onPress: handleGallery},
      {text: 'Cancel', style: 'cancel'},
    ]);
  }, [handleCamera, handleGallery]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!photoUri) {
      newErrors.photo = 'A photo is required.';
    }
    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!validate()) {
      return;
    }

    if (!coordinates) {
      Alert.alert(
        'Location Unavailable',
        'Location is still being fetched. Please wait a moment and try again.',
      );
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();

      const event: NewStormEvent = {
        photoUri: photoUri!,
        stormType,
        title: title.trim(),
        notes: notes.trim(),
        location: coordinates,
        capturedAt: now,
        weatherConditions: weather?.current
          ? {
              temperature: weather.current.temperature,
              feelsLike: weather.current.feelsLike,
              windSpeed: weather.current.windSpeed,
              windDirection: weather.current.windDirection,
              windGusts: weather.current.windGusts,
              precipitation: weather.current.precipitation,
              humidity: weather.current.humidity,
              pressure: weather.current.pressure,
              visibility: weather.current.visibility,
              uvIndex: weather.current.uvIndex,
              weatherCode: weather.current.weatherCode,
              description: weather.current.description,
            }
          : {
              temperature: 0,
              feelsLike: 0,
              windSpeed: 0,
              windDirection: 0,
              windGusts: 0,
              precipitation: 0,
              humidity: 0,
              pressure: 0,
              visibility: 0,
              uvIndex: 0,
              weatherCode: 0,
              description: 'Unknown',
            },
      };

      await StormEventRepository.create(event);
      setSaved(true);

      // Reset form
      setPhotoUri(null);
      setTitle('');
      setNotes('');
      setStormType('thunderstorm');
      setErrors({});

      Alert.alert('Saved', 'Storm event documented successfully.');
    } catch (err) {
      console.error('[DocumentScreen] Save failed:', err);
      Alert.alert('Error', 'Failed to save storm event. Please try again.');
    } finally {
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUri, stormType, title, notes, coordinates, weather]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={Typography.h1}>📷 Document Storm</Text>
            <Text style={Typography.bodySmall}>
              Capture and classify your storm observation
            </Text>
          </View>

          {/* Photo picker */}
          <TouchableOpacity
            style={[styles.photoBox, errors.photo ? styles.photoBoxError : null]}
            onPress={showPhotoOptions}
            accessibilityRole="button"
            accessibilityLabel="Add storm photo">
            {photoUri ? (
              <Image source={{uri: photoUri}} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>📸</Text>
                <Text style={styles.photoHint}>Tap to capture or select photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.photo ? (
            <Text style={styles.fieldError}>{errors.photo}</Text>
          ) : null}

          {/* Storm type */}
          <Text style={[Typography.label, styles.sectionLabel]}>Storm Type</Text>
          <StormTypePicker selected={stormType} onSelect={setStormType} />

          {/* Title */}
          <View style={styles.formSection}>
            <FormField
              label="Title *"
              placeholder="e.g. EF2 Tornado near Highway 40"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
              maxLength={100}
            />

            {/* Notes */}
            <FormField
              label="Notes / Description"
              placeholder="Describe what you observed…"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.notesInput}
              maxLength={1000}
            />
          </View>

          {/* Auto-filled metadata */}
          <View style={styles.metaCard}>
            <Text style={[Typography.label, styles.metaTitle]}>
              Auto-filled Metadata
            </Text>
            <MetaRow
              icon="📍"
              label="Location"
              value={
                coordinates
                  ? `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
                  : 'Fetching…'
              }
            />
            <MetaRow
              icon="🌡"
              label="Temperature"
              value={
                weather?.current
                  ? `${Math.round(weather.current.temperature)}°C`
                  : 'Fetching…'
              }
            />
            <MetaRow
              icon="💨"
              label="Wind"
              value={
                weather?.current
                  ? `${Math.round(weather.current.windSpeed)} km/h`
                  : 'Fetching…'
              }
            />
            <MetaRow
              icon="🕐"
              label="Date & Time"
              value={new Date().toLocaleString()}
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Save storm event">
            {saving ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <Text style={styles.saveButtonText}>
                {saved ? '✓ Save Another' : 'Save Storm Event'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── MetaRow helper ───────────────────────────────────────────────────────────
const MetaRow: React.FC<{icon: string; label: string; value: string}> = ({
  icon,
  label,
  value,
}) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaIcon}>{icon}</Text>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.background},
  flex: {flex: 1},
  scrollContent: {paddingHorizontal: 16},
  header: {paddingTop: 16, paddingBottom: 12},
  // Photo
  photoBox: {
    height: 220,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 4,
  },
  photoBoxError: {borderColor: Colors.danger},
  photo: {width: '100%', height: '100%', resizeMode: 'cover'},
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  photoIcon: {fontSize: 48, marginBottom: 8},
  photoHint: {...Typography.bodySmall, textAlign: 'center'},
  fieldError: {color: Colors.danger, fontSize: 12, marginBottom: 8},
  // Form
  sectionLabel: {marginTop: 20, marginBottom: 10},
  formSection: {marginTop: 20},
  notesInput: {height: 100, textAlignVertical: 'top'},
  // Meta card
  metaCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaTitle: {marginBottom: 10},
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metaIcon: {fontSize: 16, marginRight: 8, width: 24},
  metaLabel: {...Typography.bodySmall, width: 90, color: Colors.textSecondary},
  metaValue: {
    ...Typography.bodySmall,
    flex: 1,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  // Save button
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {opacity: 0.6},
  saveButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  bottomPadding: {height: 32},
});

export default DocumentScreen;
