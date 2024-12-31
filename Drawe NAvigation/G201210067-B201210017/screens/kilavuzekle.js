// kilavuzekle.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Platform, KeyboardAvoidingView,
  TouchableWithoutFeedback, Keyboard, SafeAreaView,
} from 'react-native';
// Firestore config
import { db } from '../firebase'; // Kendi firebase.js dosyanızı import edin
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const Guide = () => {
  const [guideName, setGuideName] = useState('');
  const [ageData, setAgeData] = useState({
    minAge: '',
    maxAge: '',
    ageUnit: 'Ay',
  });
  const [values, setValues] = useState({
    IgA: { min: '', max: '' },
    IgM: { min: '', max: '' },
    IgG: { min: '', max: '' },
    IgG1: { min: '', max: '' },
    IgG2: { min: '', max: '' },
    IgG3: { min: '', max: '' },
    IgG4: { min: '', max: '' },
  });

  const handleAgeChange = (type, value) => {
    setAgeData((prevData) => ({
      ...prevData,
      [type]: value,
    }));
  };

  const handleValueChange = (field, type, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [field]: {
        ...prevValues[field],
        [type]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    if (!guideName || !ageData.minAge || !ageData.maxAge) {
      Alert.alert('Hata', 'Lütfen kılavuz adı ve yaş bilgilerini girin.');
      return;
    }

    try {
      const docRef = doc(db, 'guides', guideName);
      const docSnap = await getDoc(docRef);

      const newAgeRange = {
        min: ageData.minAge,
        max: ageData.maxAge,
        unit: 'Ay',
      };

      const antibodyTypes = ['IgA', 'IgM', 'IgG', 'IgG1', 'IgG2', 'IgG3', 'IgG4'];
      const dataToAdd = {};

      antibodyTypes.forEach((type) => {
        dataToAdd[type] = arrayUnion({
          ageRange: newAgeRange,
          minValue: values[type]?.min,
          maxValue: values[type]?.max,
        });
      });

      if (docSnap.exists()) {
        // Eğer kayıt varsa, güncelle
        await updateDoc(docRef, dataToAdd);
        Alert.alert('Başarılı', 'Kılavuz verisi başarıyla güncellendi.');
      } else {
        // Yoksa yeni doküman oluştur
        await setDoc(docRef, {
          guideName,
          ...dataToAdd,
        });
        Alert.alert('Başarılı', 'Kılavuz başarıyla kaydedildi.');
      }

      // Formu sıfırla
      setGuideName('');
      setAgeData({ minAge: '', maxAge: '', ageUnit: 'Ay' });
      setValues({
        IgA: { min: '', max: '' },
        IgM: { min: '', max: '' },
        IgG: { min: '', max: '' },
        IgG1: { min: '', max: '' },
        IgG2: { min: '', max: '' },
        IgG3: { min: '', max: '' },
        IgG4: { min: '', max: '' },
      });
    } catch (error) {
      Alert.alert('Hata', `Kılavuz kaydedilirken bir hata oluştu: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Üst Başlık */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Kılavuz Ekleme</Text>
      </View>

      {/* Form Alanı */}
      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {/* Kılavuz Adı */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kılavuz Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Kılavuz Adı"
                placeholderTextColor="#7a9eaf"
                value={guideName}
                onChangeText={setGuideName}
              />
            </View>

            {/* Yaş Bilgisi (Ay cinsinden) */}
            <Text style={styles.label}>Hasta Yaş Bilgisi (AY)</Text>
            <View style={styles.inlineInputs}>
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="Min Ay"
                placeholderTextColor="#7a9eaf"
                keyboardType="numeric"
                value={ageData.minAge}
                onChangeText={(value) => handleAgeChange('minAge', value)}
              />
              <TextInput
                style={[styles.input, styles.inlineInput]}
                placeholder="Max Ay"
                placeholderTextColor="#7a9eaf"
                keyboardType="numeric"
                value={ageData.maxAge}
                onChangeText={(value) => handleAgeChange('maxAge', value)}
              />
            </View>

            {/* Antikor Değerleri */}
            {Object.keys(values).map((field) => (
              <View key={field} style={{ marginTop: 16 }}>
                <Text style={styles.label}>{field}</Text>
                <View style={styles.inlineInputs}>
                  <TextInput
                    style={[styles.input, styles.inlineInput]}
                    placeholder="Min Değer"
                    placeholderTextColor="#7a9eaf"
                    keyboardType="numeric"
                    value={values[field].min}
                    onChangeText={(value) => handleValueChange(field, 'min', value)}
                  />
                  <TextInput
                    style={[styles.input, styles.inlineInput]}
                    placeholder="Max Değer"
                    placeholderTextColor="#7a9eaf"
                    keyboardType="numeric"
                    value={values[field].max}
                    onChangeText={(value) => handleValueChange(field, 'max', value)}
                  />
                </View>
              </View>
            ))}

            {/* Ekle/Güncelle Butonu */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Ekle / Güncelle</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Guide;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#4caf50',
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#388e3c',
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#e8f5fc',
    margin: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#388e3c',
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    color: '#388e3c',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7a9eaf',
    fontSize: 14,
    marginBottom: 4,
  },
  inlineInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inlineInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: '#007acc',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
