// deger.js
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
} from 'react-native';
import { db } from '../firebase'; // Kendi firebase ayarlarını içe aktar
import { collection, getDocs } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

// Yaş hesaplama fonksiyonu (Ay cinsinden)
const calculateAgeInMonths = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  // Eğer doğum günü henüz gelmediyse, ay sayısını bir azalt
  if (today.getDate() < birth.getDate()) {
    months -= 1;
  }

  // Toplam ay sayısını hesapla
  const totalMonths = years * 12 + months;
  return totalMonths;
};

const ReferenceRange = () => {
  const [birthDate, setBirthDate] = useState(new Date());
  const [birthDateString, setBirthDateString] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [testValue, setTestValue] = useState('');
  const [antibodyType, setAntibodyType] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectedAntibodyType, setSelectedAntibodyType] = useState('');
  const [results, setResults] = useState([]);

  const antibodyTypes = ['IgA', 'IgM', 'IgG', 'IgG1', 'IgG2', 'IgG3', 'IgG4'];

  // Tarih değişikliklerini yönetme
  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);

      if (Platform.OS === 'android') {
        setBirthDate(selectedDate);
        const formattedDate = `${selectedDate
          .getDate()
          .toString()
          .padStart(2, '0')}.${(selectedDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}.${selectedDate.getFullYear()}`;
        setBirthDateString(formattedDate);
        setShowDatePicker(false);
      }
    }
  };

  // Tarihi onaylama
  const confirmDate = () => {
    setBirthDate(tempDate);
    const formattedDate = `${tempDate
      .getDate()
      .toString()
      .padStart(2, '0')}.${(tempDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}.${tempDate.getFullYear()}`;
    setBirthDateString(formattedDate);
    setShowDatePicker(false);
  };

  // Tarihi iptal etme
  const cancelDate = () => {
    setShowDatePicker(false);
  };

  // Form gönderme işlemi
  const handleSubmit = async () => {
    const totalMonths = calculateAgeInMonths(birthDate);

    if (!birthDateString || !testValue || !antibodyType) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const guidesRef = collection(db, 'guides');
      const querySnapshot = await getDocs(guidesRef);
      const finalResults = [];

      for (const docSnapshot of querySnapshot.docs) {
        const guideData = docSnapshot.data();

        if (guideData[antibodyType]) {
          const antibodyRanges = guideData[antibodyType];
          let found = false;

          for (const range of antibodyRanges) {
            const { ageRange, minValue, maxValue } = range;

            if (
              ageRange &&
              ageRange.min <= totalMonths &&
              ageRange.max >= totalMonths &&
              ageRange.unit === 'Ay'
            ) {
              found = true;

              // minValue veya maxValue yoksa:
              if (!minValue || !maxValue) {
                finalResults.push({
                  documentId: docSnapshot.id,
                  ageRange: `${ageRange.min}-${ageRange.max} Ay`,
                  minValue: minValue || '-',
                  maxValue: maxValue || '-',
                  result: '-',
                });
                break;
              }

              // Değerleri sayısal olarak karşılaştır
              let result = '';
              let icon = '';
              let iconColor = '';

              const numericTestValue = parseFloat(testValue.replace(',', '.'));
              const numericMinValue = parseFloat(minValue.replace(',', '.'));
              const numericMaxValue = parseFloat(maxValue.replace(',', '.'));

              if (numericTestValue < numericMinValue) {
                result = 'Düşük';
                icon = 'arrow-downward';
                iconColor = 'green';
              } else if (numericTestValue > numericMaxValue) {
                result = 'Yüksek';
                icon = 'arrow-upward';
                iconColor = 'red';
              } else {
                result = 'Normal';
                icon = 'swap-horiz';
                iconColor = 'blue';
              }

              finalResults.push({
                documentId: docSnapshot.id,
                ageRange: `${ageRange.min}-${ageRange.max} Ay`,
                minValue,
                maxValue,
                result,
                icon,
                iconColor,
              });
              break;
            }
          }
        }
      }

      if (finalResults.length === 0) {
        setResults([
          {
            documentId: 'Veri bulunamadı',
            ageRange: '-',
            result: '-',
            icon: '',
            iconColor: '',
          },
        ]);
      } else {
        setResults(finalResults);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Veritabanına erişilirken bir hata oluştu.');
    }
  };

  // Kart Bileşeni
  const renderResultCard = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.documentId}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>
          <Text style={styles.boldText}>Yaş Aralığı:</Text> {item.ageRange}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.boldText}>Min Değer:</Text> {item.minValue}
        </Text>
        <Text style={styles.cardText}>
          <Text style={styles.boldText}>Max Değer:</Text> {item.maxValue}
        </Text>
        <View style={styles.resultContainer}>
          {item.icon ? (
            <MaterialIcons
              name={item.icon}
              size={24}
              color={item.iconColor}
              style={{ marginRight: 5 }}
            />
          ) : null}
          <Text style={[styles.resultText, { color: item.iconColor }]}>
            {item.result}
          </Text>
        </View>
      </View>
    </View>
  );

  // Boş Liste Durumu
  const renderEmpty = () => (
    <Text style={styles.noResultsText}>Henüz sonuç yok.</Text>
  );

  // List Header Component (Form ve "Sonuçlar" Başlığı)
  const renderHeader = () => (
    <>
      {/* Doğum Tarihi */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Doğum Tarihi</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Text style={styles.datePickerButtonText}>
            {birthDateString || 'Doğum Tarihini Seç'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* DatePicker Modal */}
      {showDatePicker && (
        <View>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            locale="tr-TR"
          />
          {Platform.OS === 'ios' && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={cancelDate} style={styles.cancelButton}>
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDate}
                style={styles.confirmButton}
              >
                <Text style={styles.buttonText}>Onayla</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Test Sonucu */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Test Sonucu</Text>
        <TextInput
          style={styles.input}
          placeholder="Test Sonucu"
          placeholderTextColor="#7a9eaf"
          keyboardType="numeric"
          value={testValue}
          onChangeText={setTestValue}
        />
      </View>

      {/* İmmunoglobulin Türü */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>İmmunoglobulin Türü</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => {
            setSelectedAntibodyType(antibodyType);
            setPickerVisible(true);
          }}
        >
          <Text style={styles.pickerButtonText}>
            {antibodyType || 'Seçiniz'}
          </Text>
        </TouchableOpacity>

        <Modal
          transparent
          visible={pickerVisible}
          onRequestClose={() => setPickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>İmmunoglobulin Türü Seçin</Text>
              <Picker
                selectedValue={selectedAntibodyType}
                onValueChange={(itemValue) => setSelectedAntibodyType(itemValue)}
              >
                <Picker.Item label="Seçiniz" value="" />
                {antibodyTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setAntibodyType(selectedAntibodyType);
                  setPickerVisible(false);
                }}
              >
                <Text style={styles.closeButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {/* Sonuç Gör Butonu */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Sonuç Gör</Text>
      </TouchableOpacity>

      {/* "Sonuçlar" Başlığı */}
      <Text style={styles.resultTitle}>Sonuçlar</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Test Sonucu Değerlendirme</Text>
      </View>
      <KeyboardAvoidingView
        style={styles.formContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <FlatList
            data={results}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderResultCard}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.flatListContainer}
            keyboardShouldPersistTaps="handled"
          />
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ReferenceRange;

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
  flatListContainer: {
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
  datePickerButton: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#388e3c',
  },
  pickerButton: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#388e3c',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#388e3c',
  },
  closeButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#7a9eaf',
    fontSize: 16,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 8,
  },
  cardContent: {
    marginLeft: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '600',
    color: '#388e3c',
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  resultText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
